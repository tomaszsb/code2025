// DiceManager.js file is beginning to be used
console.log('DiceManager.js file is beginning to be used');

// DiceManager class for handling dice-related operations
class DiceManager {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }
  
  // Handle dice roll outcomes for display in space info
  handleDiceOutcomes = (result, outcomes) => {
    console.log('DiceManager: Received dice outcomes for space info:', outcomes);
    this.gameBoard.setState({
      diceOutcomes: outcomes,
      lastDiceRoll: result
    });
  }

  // Handle dice roll completion
  handleDiceRollComplete = (result, outcomes) => {
    console.log('DiceManager: Dice roll completed with result:', result);
    console.log('DiceManager: Outcomes:', outcomes);
    console.log('DiceManager: Detailed outcomes:', JSON.stringify(outcomes));
    
    // Check if the dice outcome includes discarding W cards
    if (outcomes && outcomes.discardWCards && parseInt(outcomes.discardWCards) > 0) {
      const discardCount = parseInt(outcomes.discardWCards);
      console.log(`DiceManager: Dice outcome requires discarding ${discardCount} W cards`);
      
      // Trigger W card discard dialog if the CardDisplay component is available
      if (this.gameBoard.cardDisplayRef.current) {
        this.gameBoard.cardDisplayRef.current.setRequiredWDiscards(discardCount);
      }
    }
    
    // Check for "W Cards: Remove X" format
    if (outcomes && outcomes["W Cards"] && outcomes["W Cards"].includes("Remove")) {
      // Extract the number from "Remove X" format
      const matches = outcomes["W Cards"].match(/Remove\s+(\d+)/i);
      if (matches && matches[1]) {
        const discardCount = parseInt(matches[1], 10);
        console.log(`DiceManager: Dice outcome requires removing ${discardCount} W cards`);
        
        // Trigger W card discard dialog
        if (this.gameBoard.cardDisplayRef.current) {
          this.gameBoard.cardDisplayRef.current.setRequiredWDiscards(discardCount);
        }
      }
    }
    
    // Check for "W Cards: Replace X" format
    if (outcomes && outcomes["W Cards"] && outcomes["W Cards"].includes("Replace")) {
      // Extract the number from "Replace X" format
      const matches = outcomes["W Cards"].match(/Replace\s+(\d+)/i);
      if (matches && matches[1]) {
        const replaceCount = parseInt(matches[1], 10);
        console.log(`DiceManager: Dice outcome requires replacing ${replaceCount} W cards`);
        
        // Trigger W card replacement dialog
        if (this.gameBoard.cardDisplayRef.current && this.gameBoard.cardDisplayRef.current.setRequiredWReplacements) {
          this.gameBoard.cardDisplayRef.current.setRequiredWReplacements(replaceCount);
        }
      }
    }
    
    // Get current player - using TurnManager
    const currentPlayer = this.gameBoard.turnManager.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Update the diceOutcomes and lastDiceRoll state for SpaceInfo component
    this.gameBoard.setState({
      diceOutcomes: outcomes,
      lastDiceRoll: result,
      // Always maintain the current player's position for the middle column
      selectedSpace: currentPosition
    });
    
    console.log('DiceManager: Dice roll completed, middle column kept on current player position:', currentPosition);
    
    // Hide the dice roll component after completion
    this.gameBoard.setState({ 
      showDiceRoll: false,
      hasRolledDice: true  // Mark that player has rolled dice
    });
    
    // If outcomes include available moves, update state
    if (outcomes.moves && outcomes.moves.length > 0) {
      console.log('DiceManager: Available moves from dice roll:', outcomes.moves.map(m => m.name).join(', '));
      this.gameBoard.setState({ 
        availableMoves: outcomes.moves,
        hasSelectedMove: false,  // Allow player to select a move from dice outcomes
        selectedMove: null,      // Clear any previously selected move
        // Keep selectedSpace as the current player's position
        selectedSpace: currentPosition
      });
    } else {
      // No valid moves from dice roll - but if we already have available moves, keep them
      // This allows the player to still select from the available moves after rolling dice
      // for spaces that only have card/fee/time outcomes from dice rolls
      if (this.gameBoard.state.availableMoves && this.gameBoard.state.availableMoves.length > 0) {
        console.log('DiceManager: No moves from dice roll, but keeping existing available moves:', 
                   this.gameBoard.state.availableMoves.map(m => m.name).join(', '));
        // Just keep existing available moves and don't reset hasSelectedMove
        if (this.gameBoard.state.hasSelectedMove && this.gameBoard.state.selectedMove) {
          console.log('DiceManager: Player already selected a move:', this.gameBoard.state.selectedMove);
        }
      } else {
        console.log('DiceManager: No valid moves available from dice roll');
        this.gameBoard.setState({ 
          availableMoves: [],
          hasSelectedMove: true,   // Force player to end turn since no valid moves
          selectedMove: null       // Clear any previously selected move
        });
      }
    }
    
    // Check if dice roll should trigger card draw
    // Get the current player - reuse the one we got earlier
    if (currentPlayer) {
      // Check for card outcomes based on roll result
      const cardTypes = ['W', 'B', 'I', 'L', 'E'];
      
      for (const cardType of cardTypes) {
        const cardOutcome = outcomes[`${cardType}CardOutcome`];
        
        if (cardOutcome && cardOutcome !== 'n/a' && cardOutcome !== '0') {
          // Parse the outcome to determine number of cards to draw
          const cardCount = parseInt(cardOutcome) || 1;
          
          // Draw the specified number of cards
          for (let i = 0; i < cardCount; i++) {
            const drawnCard = window.GameState.drawCard(currentPlayer.id, cardType);
            
            if (drawnCard) {
              // Process card effects immediately with isBeingPlayed=false
              // This ensures Expeditor cards don't apply their effects when drawn
              this.gameBoard.cardManager.processCardEffects(drawnCard, currentPlayer, false);
              
              // Use the GameBoard's animation method
              this.gameBoard.handleCardAnimation(cardType, drawnCard);
            }
          }
        }
      }
    }
  }
  
  // Handle move selection from dice roll outcomes
  handleDiceRollMoveSelect = (space) => {
    console.log('DiceManager: Move selected from dice roll outcomes:', space.name);
    
    // Get current player position to maintain correct space card - using TurnManager
    const currentPlayer = this.gameBoard.turnManager.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Don't move the player immediately, just store the selection
    // Update state
    this.gameBoard.setState({
      selectedSpace: currentPosition, // Keep showing current player's space info
      selectedMove: space.id,        // Store the selected move to be executed on End Turn
      hasSelectedMove: true,         // Player has selected their move
      showDiceRoll: false            // Hide dice roll component
    });
    
    console.log('DiceManager: Dice roll move selected:', space.id, '- Will be executed on End Turn');
  }
  
  // Check if the current space requires a dice roll
  hasDiceRollSpace = () => {
    const currentPlayer = this.gameBoard.turnManager.getCurrentPlayer();
    if (!currentPlayer) return false;
    
    // If we've already rolled dice this turn, we don't need to roll again
    if (this.gameBoard.state.hasRolledDice) return false;
    
    // Check if the current space has a dice roll in the CSV data
    const currentSpaceId = currentPlayer.position;
    const currentSpace = this.gameBoard.state.spaces.find(s => s.id === currentSpaceId);
    if (!currentSpace) return false;
    
    // Use the same logic as in the BoardDisplay component
    return this.gameBoard.state.diceRollData.some(data => data['Space Name'] === currentSpace.name);
  }
  
  // Handle roll dice button click
  handleRollDiceClick = () => {
    // First try to use the selected space
    const selectedSpace = this.gameBoard.spaceSelectionManager.getSelectedSpace();
    let spaceName;
    let visitType;
    let spaceId;
    
    if (selectedSpace && selectedSpace.name) {
      // If a space is selected, use it
      spaceName = selectedSpace.name;
      visitType = selectedSpace.visitType || (this.gameBoard.spaceSelectionManager.isVisitingFirstTime() ? 'first' : 'subsequent');
      spaceId = selectedSpace.id;
    } else {
      // If no space is selected, use the current player's position
      const currentPlayer = this.gameBoard.turnManager.getCurrentPlayer();
      if (currentPlayer) {
        spaceId = currentPlayer.position;
        const currentSpace = this.gameBoard.state.spaces.find(s => s.id === spaceId);
        if (currentSpace) {
          spaceName = currentSpace.name;
          visitType = currentSpace.visitType || 'first';
          console.log('DiceManager: Using current player position for dice roll:', spaceName, 'Visit type:', visitType);
        } else {
          // Fallback only if we can't find the current space
          spaceName = "ARCH-INITIATION";
          visitType = 'first';
          console.log('DiceManager: Falling back to ARCH-INITIATION for dice roll');
        }
      } else {
        // Fallback if no current player
        spaceName = "ARCH-INITIATION";
        visitType = 'first';
      }
    }
    
    // Make sure we always have a valid visit type
    if (!visitType || (visitType !== 'first' && visitType !== 'subsequent')) {
      // Extract visit type from ID as a last resort
      if (spaceId && (spaceId.endsWith('-first') || spaceId.includes('-first-'))) {
        visitType = 'first';
      } else if (spaceId && (spaceId.endsWith('-subsequent') || spaceId.includes('-subsequent-'))) {
        visitType = 'subsequent';
      } else {
        // Final fallback
        visitType = 'first';
      }
    }
    
    // Show the dice roll component
    this.gameBoard.setState({
      showDiceRoll: true,
      diceRollSpace: spaceName,
      diceRollVisitType: visitType
    }, () => {
      // After setState completes, use the ref to call rollDice on the DiceRoll component
      if (this.gameBoard.diceRollRef.current) {
        console.log('DiceManager: Automatically rolling dice after showing component');
        // Add a small delay to ensure the component is fully rendered
        setTimeout(() => {
          this.gameBoard.diceRollRef.current.rollDice();
        }, 100);
      }
    });
    
    console.log('DiceManager: Showing dice roll for', spaceName, visitType);
  }
}

// Export DiceManager for use in other files
window.DiceManager = DiceManager;

console.log('DiceManager.js code execution finished');
