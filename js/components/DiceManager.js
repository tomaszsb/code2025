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
    
    // Initialize pendingRequirements to store conditional requirements
    this.pendingRequirements = {};
    
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
    
    // CRITICAL FIX: Update MovementEngine dice state immediately
    if (window.setMovementEngineDiceResult) {
      window.setMovementEngineDiceResult(result);
      console.log('DiceManager: Updated MovementEngine dice state with result:', result);
    }
    
    // Get current player - using GameStateManager instead of TurnManager
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Process W card discard/replacement requirements
    this.processWCardRequirements(outcomes);
    
    // Process any conditional card requirements
    this.processConditionalCardRequirements(result, currentPlayer);
    
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
  
  // Process conditional card requirements after dice roll
  processConditionalCardRequirements = (result, currentPlayer) => {
    if (!currentPlayer) return;
    
    // Get the current space
    const currentSpaceId = currentPlayer.position;
    if (!currentSpaceId) return;
    
    // Skip if gameBoard or state is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in processConditionalCardRequirements');
      return;
    }
    
    // Ensure conditionalCardRequirements is initialized
    if (!this.gameBoard.state.conditionalCardRequirements) {
      console.log('DiceManager: initializing conditionalCardRequirements');
      this.gameBoard.setState({ conditionalCardRequirements: {} });
      return;
    }
    
    // Check if we have conditional requirements for this space
    const requirements = this.gameBoard.state.conditionalCardRequirements[currentSpaceId];
    if (!requirements) return;
    
    console.log(`DiceManager: Checking dice roll ${result} against requirements:`, requirements);
    
    // Create a copy of requirements to update
    const updatedRequirements = {...requirements};
    
    // Check if the dice roll matches the required value
    if (result === requirements.requiredRoll) {
      console.log(`DiceManager: Dice roll ${result} matches required roll ${requirements.requiredRoll}`);
      
      // Mark the requirement as satisfied and add a success message
      updatedRequirements.satisfied = true;
      updatedRequirements.message = requirements.successMessage;
      
    } else {
      console.log(`DiceManager: Dice roll ${result} does not match required roll ${requirements.requiredRoll}`);
      
      // Mark the requirement as not satisfied and add a failure message
      updatedRequirements.satisfied = false;
      updatedRequirements.message = `You rolled a ${result}. ${requirements.failureMessage}`;
    }
    
    // Update the state with the processed requirements
    const allRequirements = {...this.gameBoard.state.conditionalCardRequirements};
    allRequirements[currentSpaceId] = updatedRequirements;
    
    this.gameBoard.setState({ conditionalCardRequirements: allRequirements });
  }
  
  // Process W card requirements from dice outcomes
  processWCardRequirements(outcomes) {
    console.log('DiceManager: Processing W card requirements');
    
    // Check if the dice outcome includes discarding W cards
    if (outcomes && outcomes.discardWCards && parseInt(outcomes.discardWCards) > 0) {
      const discardCount = parseInt(outcomes.discardWCards);
      console.log(`DiceManager: Dice outcome requires discarding ${discardCount} W cards`);
      
      // Trigger W card discard dialog if the CardDisplay component is available
      if (this.gameBoard.cardDisplayRef && this.gameBoard.cardDisplayRef.current) {
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
        if (this.gameBoard.cardDisplayRef && this.gameBoard.cardDisplayRef.current) {
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
        if (this.gameBoard.cardDisplayRef && this.gameBoard.cardDisplayRef.current && this.gameBoard.cardDisplayRef.current.setRequiredWReplacements) {
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
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in updateGameBoardState');
      return;
    }
    
    // First update the hasRolledDice flag in both GameStateManager and GameBoard state
    // This is critical to ensure MovementCore.spaceRequiresDiceRoll doesn't request another roll
    this.gameBoard.setState({
      diceOutcomes: outcomes,
      lastDiceRoll: result,
      selectedSpace: currentPosition,
      showDiceRoll: false,
      hasRolledDice: true  // Mark that player has rolled dice
    });
    
    // Also update GameStateManager's hasRolledDice property for MovementCore to check
    window.GameStateManager.hasRolledDice = true;
    console.log('DiceManager: Set hasRolledDice=true in both GameBoard state and GameStateManager');
    
    // No longer show the separate DiceRoll component
    // showDiceRoll: false, // Removed - no longer needed
    
    // Wait for state update to complete before getting available moves
    setTimeout(() => {
      this.updateAvailableMovesAfterDiceRoll(outcomes, currentPlayer);
    }, 100);
    
    // Process card draws
    this.processCardDraws(outcomes, currentPlayer);
  }
  
  // Separate method to update available moves after dice roll
  updateAvailableMovesAfterDiceRoll(outcomes, currentPlayer) {
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in updateAvailableMovesAfterDiceRoll');
      return;
    }
    
    // For card outcomes, determine which available moves to use
    let movesToUpdate = [];
    let moveSource = '';
    
    // Case 1: Use moves from dice outcome if available
    if (outcomes.moves && outcomes.moves.length > 0) {
      moveSource = 'dice outcome';
      movesToUpdate = outcomes.moves;
      console.log(`DiceManager: Using ${outcomes.moves.length} moves from dice outcome`);
    }
    // Case 2: Get standard moves from MovementLogic via GameStateManager
    else if (currentPlayer && window.GameStateManager) {
      // First try to get moves from getAvailableMoves (which should now work since hasRolledDice=true)
      const standardMoves = window.GameStateManager.getAvailableMoves(currentPlayer);
      
      // Check if standardMoves is an array (not a dice roll requirement object)
      if (Array.isArray(standardMoves) && standardMoves.length > 0) {
        moveSource = 'standard moves from GameStateManager';
        movesToUpdate = standardMoves;
        console.log(`DiceManager: Using ${standardMoves.length} standard moves from GameStateManager after dice roll`);
      }
      // Case 3: Last resort - if player is on a space, get moves directly from that space
      else if (currentPlayer.position) {
        const currentSpace = window.GameStateManager.findSpaceById(currentPlayer.position);
        if (currentSpace) {
          // Look up direct from the space data
          const spaceBasedMoves = [];
          // Check all space columns in the CSV data (up to Space 5)
          for (let i = 1; i <= 5; i++) {
            const nextSpace = currentSpace[`Space ${i}`];
            if (nextSpace && nextSpace.trim() !== '') {
              spaceBasedMoves.push({
                id: `space-${i}-fallback`, // Temporary ID
                name: nextSpace,
                description: nextSpace,
                visitType: 'First' // Default
              });
            }
          }
          
          if (spaceBasedMoves.length > 0) {
            moveSource = 'direct space data';
            movesToUpdate = spaceBasedMoves;
            console.log(`DiceManager: Using ${spaceBasedMoves.length} fallback moves direct from space data`);
          }
        }
      }
    }
    
    // Apply the determined moves
    if (movesToUpdate.length > 0) {
      console.log(`DiceManager: Updating available moves after dice roll with ${movesToUpdate.length} moves from ${moveSource}:`, 
        movesToUpdate.map(m => m.name || 'unnamed').join(', '));
      this.gameBoard.setState({ 
        availableMoves: movesToUpdate,
        hasSelectedMove: false,  // Allow player to select a move
        selectedMove: null,      // Clear any previously selected move
        isRollingDice: false,    // Ensure dice UI is hidden
        showDiceRoll: false      // Ensure dice UI is hidden
      });
    } else {
      // Handle case with no available moves
      console.error('DiceManager: CRITICAL ERROR - No moves found after dice roll!');
      console.error('DiceManager: Dice outcomes:', outcomes);
      console.error('DiceManager: Current player position:', currentPlayer?.position);
      
      // FALLBACK: Try to get moves directly from MovementEngine
      if (window.movementEngine && window.movementEngine.isReady()) {
        console.log('DiceManager: Attempting fallback - getting moves from MovementEngine');
        const fallbackMoves = window.movementEngine.getAvailableMovements(currentPlayer);
        
        if (Array.isArray(fallbackMoves) && fallbackMoves.length > 0) {
          console.log('DiceManager: Fallback successful - found', fallbackMoves.length, 'moves from MovementEngine');
          this.gameBoard.setState({ 
            availableMoves: fallbackMoves,
            hasSelectedMove: false,
            selectedMove: null,
            isRollingDice: false,
            showDiceRoll: false
          });
          return;
        }
      }
      
      // Still no moves - this is a critical error
      console.error('DiceManager: CRITICAL: No moves available from any source after dice roll!');
      
      if (this.gameBoard.state.availableMoves && this.gameBoard.state.availableMoves.length > 0) {
        console.log('DiceManager: No moves determined, but keeping existing moves:', 
                  this.gameBoard.state.availableMoves.map(m => m.name || 'unnamed').join(', '));
        // Keep existing moves if any
        this.gameBoard.setState({ 
          isRollingDice: false,
          showDiceRoll: false
        });
      } else {
        console.log('DiceManager: No valid moves available after dice roll - allowing end turn');
        this.gameBoard.setState({ 
          availableMoves: [],
          hasSelectedMove: false,  // Allow end turn
          selectedMove: null,
          isRollingDice: false,
          showDiceRoll: false
        });
      }
    }
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
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in handleDiceRollMoveSelect');
      return;
    }
    
    // Temporary compatibility: Update GameBoard state until all components are refactored
    this.gameBoard.setState({
      selectedSpace: currentPosition, // Keep showing current player's space info
      selectedMove: space.id,        // Store the selected move to be executed on End Turn
      hasSelectedMove: true,         // Player has selected their move
      showDiceRoll: false            // Hide dice roll component
    });
    
    console.log('DiceManager: Dice roll move selected:', space.id, '- Will be executed on End Turn');
  }
  
  // Check if the current space requires a dice roll - fully data-driven implementation
  hasDiceRollSpace = () => {
    // Get current player
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('DiceManager: No current player found');
      return false;
    }
    
    // Skip if gameBoard or state is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in hasDiceRollSpace');
      return false;
    }
    
    // If we've already rolled dice this turn, we don't need to roll again
    if (this.gameBoard.state.hasRolledDice) {
      console.log('DiceManager: Dice already rolled this turn');
      return false;
    }
    
    // Get the current space
    const currentSpaceId = currentPlayer.position;
    const currentSpace = window.GameStateManager.findSpaceById(currentSpaceId);
    if (!currentSpace) {
      console.log('DiceManager: No current space found');
      return false;
    }
    
    // Determine the visit type for this space
    const visitType = this.gameBoard.spaceSelectionManager?.isVisitingFirstTime() ? 'First' : 'Subsequent';
    console.log(`DiceManager: Checking if space ${currentSpace.name} needs dice roll. Visit type: ${visitType}`);
    
    // Initialize variables to track decision and reason
    let needsDiceRoll = false;
    let reason = '';
    
    // Method 1: Check if there are dice roll entries in DiceRoll Info.csv
    if (this.gameBoard.state.diceRollData) {
      const hasDiceRollInData = this.gameBoard.state.diceRollData.some(data => 
        data['Space Name'] === currentSpace.name && 
        data['Visit Type'] === visitType
      );
      
      if (hasDiceRollInData) {
        needsDiceRoll = true;
        reason = `Found dice roll data for space ${currentSpace.name} and visit type ${visitType} in DiceRoll Info.csv`;
        console.log(`DiceManager: ${reason}`);
      }
    }
    
    // Method 2: Check if any card columns contain conditional text "if you roll"
    if (!needsDiceRoll) {
      const cardTypes = ['W card', 'B card', 'I card', 'L card', 'E Card'];
      for (const cardType of cardTypes) {
        const cardText = currentSpace[cardType];
        if (cardText && typeof cardText === 'string' && cardText.includes('if you roll')) {
          needsDiceRoll = true;
          reason = `Found conditional dice roll requirement in ${cardType}: "${cardText}" from Spaces.csv`;
          console.log(`DiceManager: ${reason}`);
          
          // Store the conditional requirement for later validation
          this.saveConditionalRequirement(currentSpace, cardType, cardText);
          
          break; // Found one condition, no need to check others
        }
      }
    }
    
    // Log the final decision
    if (!needsDiceRoll) {
      console.log(`DiceManager: No dice roll required for space ${currentSpace.name} based on CSV data`);
    } else {
      console.log(`DiceManager: Dice roll required for space ${currentSpace.name}. Reason: ${reason}`);
    }
    
    return needsDiceRoll;
  }
  
  // Save conditional requirement from card text with improved logging
  saveConditionalRequirement(space, cardType, cardText) {
    // Log start of processing
    console.log(`DiceManager: Processing conditional requirement from ${cardType}: "${cardText}"`);
    
    // Skip if gameBoard or state is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in saveConditionalRequirement');
      return;
    }
    
    // Ensure conditionalCardRequirements is initialized
    if (!this.gameBoard.state.conditionalCardRequirements) {
      console.log('DiceManager: initializing conditionalCardRequirements on first use');
      this.initializeConditionalRequirements();
      return;
    }
    
    // Extract the required roll value from the text
    const conditionalRollPattern = /if\s+you\s+roll\s+(?:a|an)?\s*(\d+)/i;
    const match = cardText.match(conditionalRollPattern);
    
    if (match && match[1]) {
      const requiredRoll = parseInt(match[1], 10);
      console.log(`DiceManager: Extracted required roll value: ${requiredRoll}`);
      
      // Extract the card action (e.g., "Draw 1")
      const actionPattern = /(Draw|Remove|Replace)\s+(\d+)/i;
      const actionMatch = cardText.match(actionPattern);
      
      let action = 'Draw';
      let count = 1;
      
      if (actionMatch && actionMatch.length >= 3) {
        action = actionMatch[1];
        count = parseInt(actionMatch[2], 10);
        console.log(`DiceManager: Extracted action: ${action} ${count}`);
      } else {
        console.log(`DiceManager: Using default action: ${action} ${count}`);
      }
      
      // Format the card type for display
      let displayCardType = cardType;
      if (cardType.includes(' ')) {
        displayCardType = cardType.split(' ')[0]; // Get just the letter part
      }
      
      // Store the requirement details with message templates
      const requirements = {
        cardType: displayCardType.charAt(0), // Convert to single letter format (W, B, I, L, E)
        requiredRoll: requiredRoll,
        action: action,
        count: count,
        originalText: cardText,
        satisfied: false,
        // Add message templates for user feedback
        successMessage: `You rolled a ${requiredRoll}! You can ${action.toLowerCase()} ${count} ${displayCardType} card(s).`,
        failureMessage: `You need to roll a ${requiredRoll} to ${action.toLowerCase()} ${count} ${displayCardType} card(s).`
      };
      
      console.log(`DiceManager: Saved conditional requirement: ${JSON.stringify(requirements)}`);
      
      // Update directly in the pending requirements object to avoid setState loops
      this.pendingRequirements = this.pendingRequirements || {};
      this.pendingRequirements[space.id] = requirements;
      
      // Schedule a state update outside the current call stack
      setTimeout(() => {
        this.applyPendingRequirements();
      }, 0);
    } else {
      console.log(`DiceManager: Unable to extract required roll from text: "${cardText}"`);
    }
  }
  
  // Initialize conditionalCardRequirements state
  initializeConditionalRequirements() {
    if (this.gameBoard && this.gameBoard.state && !this.gameBoard.state.conditionalCardRequirements) {
      console.log('DiceManager: Creating initial conditionalCardRequirements state');
      this.gameBoard.setState({ conditionalCardRequirements: {} });
    }
  }
  
  // Apply any pending requirements updates in a single operation
  applyPendingRequirements() {
    // Skip if no pending requirements
    if (!this.pendingRequirements || Object.keys(this.pendingRequirements).length === 0) {
      return;
    }
    
    // Skip if gameBoard or state is not initialized
    if (!this.gameBoard || !this.gameBoard.state || !this.gameBoard.state.conditionalCardRequirements) {
      console.log('DiceManager: gameBoard or conditionalCardRequirements not ready for updates');
      return;
    }
    
    console.log('DiceManager: Applying pending requirements updates');
    
    // Create updated requirements object
    const updatedRequirements = {...this.gameBoard.state.conditionalCardRequirements};
    
    // Merge in pending requirements
    Object.keys(this.pendingRequirements).forEach(spaceId => {
      updatedRequirements[spaceId] = this.pendingRequirements[spaceId];
    });
    
    // Update state once
    this.gameBoard.setState({ conditionalCardRequirements: updatedRequirements });
    
    // Clear pending updates
    this.pendingRequirements = {};
  }
  
  // Handle roll dice button click - now handles dice rolling directly
  handleRollDiceClick = () => {
    console.log('DiceManager: Dice roll button clicked - handling directly');
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in handleRollDiceClick');
      return;
    }
    
    // Use SpaceSelectionManager to get selected space
    const selectedSpace = this.gameBoard.spaceSelectionManager?.getSelectedSpace();
    let spaceName;
    let visitType;
    let spaceId;
    
    if (selectedSpace && selectedSpace.name) {
      // If a space is selected, use it
      spaceName = selectedSpace.name;
      visitType = selectedSpace.visitType || (this.gameBoard.spaceSelectionManager?.isVisitingFirstTime() ? 'first' : 'subsequent');
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
          
          // Check and store conditional card requirements if present
          const cardTypes = ['W card', 'B card', 'I card', 'L card', 'E Card'];
          for (const cardType of cardTypes) {
            const cardText = currentSpace[cardType];
            if (cardText && typeof cardText === 'string' && cardText.includes('if you roll')) {
              console.log(`DiceManager: Found conditional dice roll requirement in ${cardType}: ${cardText}`);
              this.saveConditionalRequirement(currentSpace, cardType, cardText);
            }
          }
        } else {
          spaceName = "ARCH-INITIATION";
          visitType = 'first';
          console.log('DiceManager: Falling back to ARCH-INITIATION for dice roll');
        }
      } else {
        spaceName = "ARCH-INITIATION";
        visitType = 'first';
      }
    }
    
    // Make sure we always have a valid visit type
    if (!visitType || (visitType !== 'first' && visitType !== 'subsequent')) {
      if (spaceId && (spaceId.endsWith('-first') || spaceId.includes('-first-'))) {
        visitType = 'first';
      } else if (spaceId && (spaceId.endsWith('-subsequent') || spaceId.includes('-subsequent-'))) {
        visitType = 'subsequent';
      } else {
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
    
    // Perform the dice roll directly
    this.performDirectDiceRoll(spaceName, visitType);
  }
  
  // New method to handle dice rolling directly without separate component
  performDirectDiceRoll = (spaceName, visitType) => {
    console.log('DiceManager: Performing direct dice roll for', spaceName, visitType);
    
    // Set rolling state
    this.gameBoard.setState({ 
      isRollingDice: true,
      hasRolledDice: false // Ensure this is false while rolling
    });
    
    // Simulate dice roll animation delay (1.2 seconds like the original DiceRoll component)
    setTimeout(() => {
      // Generate random number between 1 and 6
      const result = Math.floor(Math.random() * 6) + 1;
      console.log('DiceManager: Direct dice roll result:', result);
      
      // Process the dice roll outcome
      const outcomes = this.processDiceRollOutcome(result, spaceName, visitType);
      
      // Complete the dice roll
      this.completeDiceRoll(result, outcomes);
      
    }, 1200); // Match the animation timing from original DiceRoll component
  }
  
  // Process dice roll outcome (moved from DiceRoll component)
  processDiceRollOutcome = (rollResult, spaceName, visitType) => {
    console.log('DiceManager: Processing direct roll', rollResult, 'for space', spaceName, 'visit type', visitType);
    
    // Get dice outcomes data
    const diceRollData = this.gameBoard.state.diceRollData || [];
    const diceOutcomes = diceRollData.filter(data => 
      data['Space Name'] === spaceName && 
      data['Visit Type'].toLowerCase() === visitType.toLowerCase()
    );
    
    console.log('DiceManager: Available outcomes:', diceOutcomes);
    
    if (!diceOutcomes || diceOutcomes.length === 0) {
      console.log('DiceManager: No outcomes available');
      return { moves: [] };
    }
    
    // Process outcomes
    const outcomes = {};
    
    for (const outcomeData of diceOutcomes) {
      const dieRollType = outcomeData['Die Roll'];
      const outcomeValue = outcomeData[rollResult.toString()];
      
      console.log('DiceManager: Processing outcome type', dieRollType, 'value:', outcomeValue);
      
      if (outcomeValue && outcomeValue.trim() !== '' && outcomeValue !== 'n/a') {
        if (dieRollType === 'W Cards Discard' || dieRollType === 'discard W Cards') {
          outcomes.discardWCards = outcomeValue;
          console.log('DiceManager: Detected W cards discard requirement:', outcomeValue);
        } else {
          outcomes[dieRollType] = outcomeValue;
        }
      }
    }
    
    console.log('DiceManager: Processed outcomes:', outcomes);
    
    // Find available moves based on the Next Step outcome if it exists
    let availableMoves = [];
    if (outcomes['Next Step']) {
      const nextStepValue = outcomes['Next Step'];
      console.log('DiceManager: Finding spaces for Next Step:', nextStepValue);
      
      // Use DiceRollLogic to find the available spaces
      if (window.DiceRollLogic && window.DiceRollLogic.findSpacesFromOutcome) {
        availableMoves = window.DiceRollLogic.findSpacesFromOutcome(window.GameStateManager, nextStepValue);
        console.log('DiceManager: Found available moves:', availableMoves.map(m => m.name).join(', '));
      }
      
      // COMPREHENSIVE FIX: If no moves found, handle multiple choice outcomes directly
      if (availableMoves.length === 0 && nextStepValue && nextStepValue.includes(' or ')) {
        console.log('DiceManager: No moves from DiceRollLogic, handling multiple choice directly:', nextStepValue);
        availableMoves = this.handleMultipleChoiceOutcome(nextStepValue);
      }
    }
    
    // Add moves to the outcomes object
    outcomes.moves = availableMoves;
    
    console.log('DiceManager: processDiceRollOutcome completed');
    return outcomes;
  }
  
  // NEW METHOD: Handle multiple choice outcomes directly
  handleMultipleChoiceOutcome = (nextStepValue) => {
    console.log('DiceManager: Processing multiple choice outcome:', nextStepValue);
    
    // Split on ' or ' and process each option
    const spaceOptions = nextStepValue.split(' or ').map(option => option.trim());
    console.log('DiceManager: Space options found:', spaceOptions);
    
    const availableMoves = [];
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    
    for (const option of spaceOptions) {
      // Extract space name (part before ' - ' if it exists)
      let spaceName = option;
      if (spaceName.includes(' - ')) {
        spaceName = spaceName.split(' - ')[0].trim();
      }
      
      console.log('DiceManager: Processing space option:', spaceName);
      
      // Determine visit type based on player's history
      const hasVisited = window.GameStateManager.hasPlayerVisitedSpace(spaceName, currentPlayer);
      const visitType = hasVisited ? 'subsequent' : 'first';
      
      console.log('DiceManager: Space', spaceName, 'visit type:', visitType, '(has visited:', hasVisited, ')');
      
      // Create proper space ID
      const spaceId = spaceName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + visitType;
      
      // Create move object
      const move = {
        id: spaceId,
        name: spaceName,
        description: option,
        visitType: visitType,
        fromDiceRoll: true
      };
      
      availableMoves.push(move);
      console.log('DiceManager: Created move:', move);
    }
    
    console.log('DiceManager: Final available moves from multiple choice:', availableMoves.length);
    return availableMoves;
  }
  
  // Complete dice roll processing
  completeDiceRoll = (result, outcomes) => {
    console.log('DiceManager: Completing dice roll with result:', result);
    
    // Update MovementEngine dice state immediately
    if (window.setMovementEngineDiceResult) {
      window.setMovementEngineDiceResult(result);
      console.log('DiceManager: Updated MovementEngine dice state with result:', result);
    }
    
    // Get current player
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Process W card requirements
    this.processWCardRequirements(outcomes);
    
    // Process conditional card requirements
    this.processConditionalCardRequirements(result, currentPlayer);
    
    // CRITICAL FIX: Ensure dice rolling UI is completely hidden
    this.gameBoard.setState({
      isRollingDice: false,
      showDiceRoll: false,  // Ensure dice UI is hidden
      diceOutcomes: outcomes,
      lastDiceRoll: result,
      hasRolledDice: true,
      selectedSpace: currentPosition
    });
    
    // Also update GameStateManager's hasRolledDice property
    window.GameStateManager.hasRolledDice = true;
    console.log('DiceManager: Set hasRolledDice=true in both GameBoard state and GameStateManager');
    
    // Dispatch event
    window.GameStateManager.dispatchEvent('diceRolled', {
      result: result,
      outcomes: outcomes,
      currentPlayer: currentPlayer,
      currentPosition: currentPosition,
      forDisplay: false,
      hasSelectedMove: false,
      selectedMove: null
    });
    
    // Update available moves after a short delay
    setTimeout(() => {
      this.updateAvailableMovesAfterDiceRoll(outcomes, currentPlayer);
    }, 100);
    
    // Process card draws
    this.processCardDraws(outcomes, currentPlayer);
    
    console.log('DiceManager: Direct dice roll completed successfully');
  }
  
  // Event handler for playerMoved event
  handlePlayerMovedEvent(event) {
    console.log('DiceManager: Player moved event received', event.data);
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in handlePlayerMovedEvent');
      return;
    }
    
    // Reset dice roll state when player moves
    this.gameBoard.setState({
      hasRolledDice: false,
      diceOutcomes: null,
      lastDiceRoll: null,
      showDiceRoll: false,
      // Reset conditional card requirements when moving to a new space
      conditionalCardRequirements: {}
    });
  }
  
  // Event handler for turnChanged event
  handleTurnChangedEvent(event) {
    console.log('DiceManager: Turn changed event received', event.data);
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in handleTurnChangedEvent');
      return;
    }
    
    // Reset dice state for new player's turn
    this.gameBoard.setState({
      hasRolledDice: false,
      diceOutcomes: null,
      lastDiceRoll: null,
      showDiceRoll: false,
      // Reset conditional card requirements for new turn
      conditionalCardRequirements: {}
    });
  }
  
  // Event handler for gameStateChanged event
  handleGameStateChangedEvent(event) {
    console.log('DiceManager: Game state changed event received', event.data);
    
    // Initialize conditionalCardRequirements if needed
    this.initializeConditionalRequirements();
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in handleGameStateChangedEvent');
      return;
    }
    
    // Only process relevant change types
    if (event.data && event.data.changeType) {
      switch (event.data.changeType) {
        case 'newGame':
          // Reset dice state for new game
          this.gameBoard.setState({
            hasRolledDice: false,
            diceOutcomes: null,
            lastDiceRoll: null,
            showDiceRoll: false,
            conditionalCardRequirements: {}
          });
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
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in handleDiceRolledEvent');
      return;
    }
    
    // Update GameBoard state based on the event
    if (event.data) {
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