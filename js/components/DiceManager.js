// DiceManager.js file is beginning to be used
console.log('DiceManager.js file is beginning to be used');

// DiceManager class for handling dice-related operations
// Refactored to use GameStateManager event system
class DiceManager {
  constructor(gameBoard) {
    console.log('DiceManager: Initializing with event system integration');
    this.gameBoard = gameBoard;
    
    // Store event handler references for cleanup
    this.eventHandlers = {
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      diceRolled: this.handleDiceRolledEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    console.log('DiceManager: Successfully initialized with event system');
  }
  
  // Register event listeners with GameStateManager
  registerEventListeners() {
    console.log('DiceManager: Registering event listeners');
    
    // Add event handlers for dice-related events
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    // Add custom event for dice rolls if not already in GameStateManager
    if (!window.GameStateManager.eventHandlers['diceRolled']) {
      window.GameStateManager.eventHandlers['diceRolled'] = [];
    }
    window.GameStateManager.addEventListener('diceRolled', this.eventHandlers.diceRolled);
    
    console.log('DiceManager: Event listeners registered');
  }
  
  // Handle dice roll outcomes for display in space info
  handleDiceOutcomes = (result, outcomes) => {
    console.log('DiceManager: Received dice outcomes for space info:', outcomes);
    
    // Dispatch diceRolled event instead of directly updating state
    window.GameStateManager.dispatchEvent('diceRolled', {
      result: result,
      outcomes: outcomes,
      forDisplay: true // Flag to indicate this is for display purposes only
    });
  }
  
  // Handle dice roll completion
  handleDiceRollComplete = (result, outcomes) => {
    console.log('DiceManager: Dice roll completed with result:', result);
    console.log('DiceManager: Outcomes:', outcomes);
    console.log('DiceManager: Detailed outcomes:', JSON.stringify(outcomes));
    
    // Get current player - using GameStateManager instead of TurnManager
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Process W card discard/replacement requirements
    this.processWCardRequirements(outcomes);
    
    // Dispatch diceRolled event with complete information instead of updating state directly
    window.GameStateManager.dispatchEvent('diceRolled', {
      result: result,
      outcomes: outcomes,
      currentPlayer: currentPlayer,
      currentPosition: currentPosition,
      forDisplay: false,  // This is a complete dice roll, not just for display
      hasSelectedMove: false,  // Player hasn't selected a move yet
      selectedMove: null
    });
    
    // Temporary compatibility: Still update GameBoard state until all components are refactored
    // This should be removed once all components are using the event system
    this.updateGameBoardState(result, outcomes, currentPlayer, currentPosition);
  }
  
  // Process W card requirements from dice outcomes
  processWCardRequirements(outcomes) {
    console.log('DiceManager: Processing W card requirements');
    
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
      const matches = outcomes["W Cards"].match(/Remove\\s+(\\d+)/i);
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
      const matches = outcomes["W Cards"].match(/Replace\\s+(\\d+)/i);
      if (matches && matches[1]) {
        const replaceCount = parseInt(matches[1], 10);
        console.log(`DiceManager: Dice outcome requires replacing ${replaceCount} W cards`);
        
        // Trigger W card replacement dialog
        if (this.gameBoard.cardDisplayRef.current && this.gameBoard.cardDisplayRef.current.setRequiredWReplacements) {
          this.gameBoard.cardDisplayRef.current.setRequiredWReplacements(replaceCount);
        }
      }
    }
  }
  
  // Process card draws from dice outcomes
  processCardDraws(outcomes, currentPlayer) {
    console.log('DiceManager: Processing card draws from dice outcome');
    
    if (!currentPlayer) return;
    
    // Check for card outcomes based on roll result
    const cardTypes = ['W', 'B', 'I', 'L', 'E'];
    
    for (const cardType of cardTypes) {
      const cardOutcome = outcomes[`${cardType}CardOutcome`];
      
      if (cardOutcome && cardOutcome !== 'n/a' && cardOutcome !== '0') {
        // Parse the outcome to determine number of cards to draw
        const cardCount = parseInt(cardOutcome) || 1;
        
        // Draw the specified number of cards using GameStateManager
        // This will trigger cardDrawn events that will be handled by CardManager
        for (let i = 0; i < cardCount; i++) {
          window.GameStateManager.drawCard(currentPlayer.id, cardType);
          // No need to manually process card effects or call animation method
          // CardManager's event handlers will handle this
        }
      }
    }
  }
  
  // Temporary method for backward compatibility until all components use events
  updateGameBoardState(result, outcomes, currentPlayer, currentPosition) {
    console.log('DiceManager: Updating GameBoard state for backward compatibility');
    
    // Update the diceOutcomes and lastDiceRoll state for SpaceInfo component
    this.gameBoard.setState({
      diceOutcomes: outcomes,
      lastDiceRoll: result,
      selectedSpace: currentPosition,
      showDiceRoll: false,
      hasRolledDice: true  // Mark that player has rolled dice
    });
    
    // Handle available moves
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
      if (this.gameBoard.state.availableMoves && this.gameBoard.state.availableMoves.length > 0) {
        console.log('DiceManager: No moves from dice roll, but keeping existing available moves:', 
                   this.gameBoard.state.availableMoves.map(m => m.name).join(', '));
        // Just keep existing available moves and don't reset hasSelectedMove
      } else {
        console.log('DiceManager: No valid moves available from dice roll');
        this.gameBoard.setState({ 
          availableMoves: [],
          hasSelectedMove: true,   // Force player to end turn since no valid moves
          selectedMove: null       // Clear any previously selected move
        });
      }
    }
    
    // Process card draws
    this.processCardDraws(outcomes, currentPlayer);
  }
  
  // Handle move selection from dice roll outcomes
  handleDiceRollMoveSelect = (space) => {
    console.log('DiceManager: Move selected from dice roll outcomes:', space.name);
    
    // Get current player position to maintain correct space card - using GameStateManager
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Dispatch event for move selection
    window.GameStateManager.dispatchEvent('gameStateChanged', {
      changeType: 'diceRollMoveSelected',
      selectedSpace: currentPosition,
      selectedMove: space.id,
      hasSelectedMove: true,
      player: currentPlayer
    });
    
    // Temporary compatibility: Update GameBoard state until all components are refactored
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
    // Use GameStateManager to get current player
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer) return false;
    
    // If we've already rolled dice this turn, we don't need to roll again
    if (this.gameBoard.state.hasRolledDice) return false;
    
    // Check if the current space has a dice roll in the CSV data
    const currentSpaceId = currentPlayer.position;
    const currentSpace = window.GameStateManager.findSpaceById(currentSpaceId);
    if (!currentSpace) return false;
    
    // Use the same logic as in the BoardDisplay component
    return this.gameBoard.state.diceRollData.some(data => data['Space Name'] === currentSpace.name);
  }
  
  // Handle roll dice button click
  handleRollDiceClick = () => {
    // Use SpaceSelectionManager to get selected space
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
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      if (currentPlayer) {
        spaceId = currentPlayer.position;
        const currentSpace = window.GameStateManager.findSpaceById(spaceId);
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
    
    // Dispatch event for dice roll start
    window.GameStateManager.dispatchEvent('gameStateChanged', {
      changeType: 'diceRollStarted',
      spaceName: spaceName,
      visitType: visitType,
      spaceId: spaceId
    });
    
    // Temporary compatibility: Update GameBoard state until all components are refactored
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
  
  // Event handler for playerMoved event
  handlePlayerMovedEvent(event) {
    console.log('DiceManager: Player moved event received', event.data);
    
    // Reset dice roll state when player moves
    if (this.gameBoard) {
      this.gameBoard.setState({
        hasRolledDice: false,
        diceOutcomes: null,
        lastDiceRoll: null,
        showDiceRoll: false
      });
    }
  }
  
  // Event handler for turnChanged event
  handleTurnChangedEvent(event) {
    console.log('DiceManager: Turn changed event received', event.data);
    
    // Reset dice state for new player's turn
    if (this.gameBoard) {
      this.gameBoard.setState({
        hasRolledDice: false,
        diceOutcomes: null,
        lastDiceRoll: null,
        showDiceRoll: false
      });
    }
  }
  
  // Event handler for gameStateChanged event
  handleGameStateChangedEvent(event) {
    console.log('DiceManager: Game state changed event received', event.data);
    
    // Only process relevant change types
    if (event.data && event.data.changeType) {
      switch (event.data.changeType) {
        case 'newGame':
          // Reset dice state for new game
          if (this.gameBoard) {
            this.gameBoard.setState({
              hasRolledDice: false,
              diceOutcomes: null,
              lastDiceRoll: null,
              showDiceRoll: false
            });
          }
          break;
          
        // Add other change types as needed
      }
    }
  }
  
  // Event handler for diceRolled event
  handleDiceRolledEvent(event) {
    console.log('DiceManager: Dice rolled event received', event.data);
    
    // Only handle events from other components
    // Skip events that we dispatched ourselves
    if (event.data.forDisplay === undefined) {
      return;
    }
    
    // Update GameBoard state based on the event
    if (this.gameBoard && event.data) {
      const { result, outcomes, currentPosition } = event.data;
      
      // Temporary compatibility: Update GameBoard state until all components are refactored
      if (event.data.forDisplay) {
        // This is just for display purposes
        this.gameBoard.setState({
          diceOutcomes: outcomes,
          lastDiceRoll: result
        });
      } else {
        // This is a complete dice roll event
        this.gameBoard.setState({
          diceOutcomes: outcomes,
          lastDiceRoll: result,
          selectedSpace: currentPosition,
          showDiceRoll: false,
          hasRolledDice: true
        });
        
        // Process card draws if needed
        if (event.data.currentPlayer) {
          this.processCardDraws(outcomes, event.data.currentPlayer);
        }
      }
    }
  }
  
  // Clean up resources when no longer needed
  cleanup() {
    console.log('DiceManager: Cleaning up resources');
    
    // Remove all event listeners to prevent memory leaks
    window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.removeEventListener('diceRolled', this.eventHandlers.diceRolled);
    
    console.log('DiceManager: Cleanup completed');
  }
}

// Export DiceManager for use in other files
window.DiceManager = DiceManager;

console.log('DiceManager.js code execution finished');