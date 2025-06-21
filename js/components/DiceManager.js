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
    
    // Timer tracking for proper cleanup
    this.activeTimers = new Set();
    
    // Initialize card draw processing flags to prevent double processing
    this.isProcessingCardDraws = false;
    this.currentProcessingKey = null;
    this.processedCardDrawsThisTurn = new Set(); // Track processed draws per turn
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    // Check if spaces are already loaded and load initial outcomes if needed
    this.checkAndLoadInitialOutcomes();
    
    console.log('DiceManager: Successfully initialized with event system');
  }
  
  // Wrapper for setTimeout that tracks timers for cleanup
  setTimeout(callback, delay) {
    const timerId = setTimeout(() => {
      // Remove from tracking when timer completes
      this.activeTimers.delete(timerId);
      callback();
    }, delay);
    
    // Track the timer
    this.activeTimers.add(timerId);
    return timerId;
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
    
    // Listen for spacesLoaded event to load initial potential outcomes
    window.GameStateManager.addEventListener('spacesLoaded', this.handleSpacesLoaded.bind(this));
    
    console.log('DiceManager: Event listeners registered');
  }
  
  // Check if spaces are already loaded when DiceManager initializes
  checkAndLoadInitialOutcomes() {
    console.log('DiceManager: Checking if spaces are already loaded');
    
    // Check if GameStateManager exists and has spaces loaded
    if (window.GameStateManager && window.GameStateManager.spaces && window.GameStateManager.spaces.length > 0) {
      console.log('DiceManager: Spaces already loaded, loading initial potential outcomes immediately');
      setTimeout(() => {
        this.loadInitialPotentialOutcomes();
      }, 100);
    } else {
      console.log('DiceManager: Spaces not yet loaded, will wait for spacesLoaded event');
    }
  }

  // Handle spacesLoaded event to load initial potential outcomes
  handleSpacesLoaded() {
    console.log('DiceManager: Spaces loaded event received, loading initial potential outcomes');
    
    // Add a small delay to ensure all components are fully initialized
    setTimeout(() => {
      this.loadInitialPotentialOutcomes();
    }, 100);
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
    console.log('DiceManager: 🎴 ========== PROCESS CARD DRAWS - DETAILED TRACE ==========');
    console.log('DiceManager: 🎴 CALL STACK:', new Error().stack.split('\n').slice(1, 5).join('\n'));
    console.log('DiceManager: 🎴 Processing card draws from dice outcome');
    console.log('DiceManager: 🎴 DEBUG - outcomes structure:', JSON.stringify(outcomes, null, 2));
    console.log('DiceManager: 🎴 DEBUG - outcomes keys:', Object.keys(outcomes || {}));
    console.log('DiceManager: 🎴 DEBUG - currentPlayer:', currentPlayer?.id);
    console.log('DiceManager: 🎴 DEBUG - currentPlayer full:', currentPlayer);
    
    if (!currentPlayer) {
      console.log('DiceManager: 🎴 NO CURRENT PLAYER - returning early');
      return;
    }
    
    // CRITICAL FIX: Prevent double processing with turn-based tracking
    const currentTurn = window.GameStateManager.getCurrentTurn?.() || 0;
    const processingKey = `cardDraw_${currentPlayer.id}_turn_${currentTurn}`;
    
    if (this.processedCardDrawsThisTurn.has(processingKey)) {
      console.log('DiceManager: 🎴 ALREADY PROCESSED CARD DRAWS THIS TURN - skipping to prevent duplicates');
      console.log('DiceManager: 🎴 Processed draws this turn:', Array.from(this.processedCardDrawsThisTurn));
      return;
    }
    
    if (this.isProcessingCardDraws) {
      console.log('DiceManager: 🎴 CURRENTLY PROCESSING CARD DRAWS - skipping concurrent call');
      console.log('DiceManager: 🎴 Current processing key:', this.currentProcessingKey);
      return;
    }
    
    this.isProcessingCardDraws = true;
    this.currentProcessingKey = processingKey;
    this.processedCardDrawsThisTurn.add(processingKey);
    console.log('DiceManager: 🎴 Starting card draw processing with key:', processingKey);
    
    // Check if outcomes is an array of outcome objects (new format)
    if (Array.isArray(outcomes)) {
      outcomes.forEach(outcome => {
        if (outcome.type === 'cards' && outcome.action === 'drawCards' && outcome.cards) {
          console.log('DiceManager: Found card draw outcome:', outcome.cards);
          
          // Process each card type in the outcome
          Object.entries(outcome.cards).forEach(([cardType, count]) => {
            console.log(`DiceManager: Drawing ${count} ${cardType} cards for player ${currentPlayer.id}`);
            
            // Draw the specified number of cards using GameStateManager
            for (let i = 0; i < count; i++) {
              window.GameStateManager.drawCard(currentPlayer.id, cardType);
            }
          });
        }
      });
      return;
    }
    
    // Process card outcomes based on CSV data format
    console.log('DiceManager: 🎴 ALL OUTCOME KEYS FROM CSV:', Object.keys(outcomes));
    
    // Process each outcome key directly from CSV
    for (const [key, value] of Object.entries(outcomes)) {
      console.log(`DiceManager: 🎴 Processing outcome: "${key}" = "${value}"`);
      
      // Handle "W Cards", "B Cards", etc. from CSV
      if (key.endsWith(' Cards') && value && value !== 'n/a' && value !== '0') {
        const cardType = key.charAt(0); // Extract "W" from "W Cards"
        console.log(`DiceManager: 🎴 *** FOUND CARD OUTCOME: ${key} = "${value}" ***`);
        
        let cardCount = 0;
        
        // Parse CSV format values like "Draw 3", "Remove 1", "Replace 1", "No change"
        if (typeof value === 'string') {
          if (value.toLowerCase().includes('draw')) {
            const match = value.match(/draw\s+(\d+)/i);
            if (match) {
              cardCount = parseInt(match[1]);
              console.log(`DiceManager: 🎴 Drawing ${cardCount} ${cardType} cards`);
              
              // Draw the cards
              for (let i = 0; i < cardCount; i++) {
                console.log(`DiceManager: 🎴 Drawing card ${i + 1}/${cardCount} for player ${currentPlayer.id}`);
                try {
                  const result = window.GameStateManager.drawCard(currentPlayer.id, cardType);
                  console.log(`DiceManager: 🎴 Card draw result:`, result);
                } catch (error) {
                  console.error(`DiceManager: 🎴 ERROR drawing card:`, error);
                }
              }
              
              // CRITICAL: Mark corresponding manual card drawing buttons as used
              this.markRelatedCardButtonsAsUsed(currentPlayer, cardType, cardCount, value);
            }
          } else if (value.toLowerCase().includes('remove')) {
            const match = value.match(/remove\s+(\d+)/i);
            if (match) {
              const removeCount = parseInt(match[1]);
              console.log(`DiceManager: 🎴 Need to remove ${removeCount} ${cardType} cards - triggering discard`);
              // Trigger W card discard dialog if the CardDisplay component is available
              if (this.gameBoard.cardDisplayRef && this.gameBoard.cardDisplayRef.current) {
                this.gameBoard.cardDisplayRef.current.setRequiredWDiscards(removeCount);
              }
            }
          } else if (value.toLowerCase().includes('replace')) {
            const match = value.match(/replace\s+(\d+)/i);
            if (match) {
              const replaceCount = parseInt(match[1]);
              console.log(`DiceManager: 🎴 Need to replace ${replaceCount} ${cardType} cards - triggering replacement`);
              // Trigger W card replacement dialog if available
              if (this.gameBoard.cardDisplayRef && this.gameBoard.cardDisplayRef.current && this.gameBoard.cardDisplayRef.current.setRequiredWReplacements) {
                this.gameBoard.cardDisplayRef.current.setRequiredWReplacements(replaceCount);
              }
            }
          } else if (value.toLowerCase() === 'no change') {
            console.log(`DiceManager: 🎴 No change for ${cardType} cards`);
          }
        }
      }
      // Handle other CSV outcome types if needed
      else if (key === 'Next Step' || key === 'Time outcomes' || key === 'Fees Paid') {
        console.log(`DiceManager: 🎴 Non-card outcome: ${key} = "${value}"`);
      }
    }
    
    // Trigger SpaceInfo refresh to update button states
    window.GameStateManager.dispatchEvent('componentFinished', {
      component: 'DiceManager',
      action: 'cardDrawProcessingCompleted',
      player: currentPlayer
    });
    console.log('DiceManager: 🎴 Dispatched componentFinished event to refresh UI');
    
    // CRITICAL FIX: Clear processing flag when done
    this.isProcessingCardDraws = false;
    this.currentProcessingKey = null;
    console.log('DiceManager: 🎴 Finished card draw processing with key:', processingKey);
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
    console.log('DiceManager: About to call processCardDraws with outcomes:', outcomes, 'currentPlayer:', currentPlayer?.id);
    this.processCardDraws(outcomes, currentPlayer);
  }
  
  // Separate method to update available moves after dice roll
  updateAvailableMovesAfterDiceRoll(outcomes, currentPlayer) {
    console.log('DiceManager: updateAvailableMovesAfterDiceRoll called with outcomes:', outcomes, 'player:', currentPlayer?.name);
    
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
      console.log('DiceManager: No dice outcome moves, calling GameStateManager.getAvailableMoves');
      // First try to get moves from getAvailableMoves (which should now work since hasRolledDice=true)
      const standardMoves = window.GameStateManager.getAvailableMoves(currentPlayer);
      console.log('DiceManager: GameStateManager.getAvailableMoves returned:', standardMoves);
      
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
      
      // Auto-select move if there's only one option
      let hasSelected = false;
      let selectedMove = null;
      if (movesToUpdate.length === 1) {
        hasSelected = true;
        selectedMove = movesToUpdate[0].id || movesToUpdate[0].name;
        console.log('DiceManager: Auto-selecting single available move:', selectedMove);
      }
      
      this.gameBoard.setState({ 
        availableMoves: movesToUpdate,
        hasSelectedMove: hasSelected,  // Auto-select if only one move
        selectedMove: selectedMove,    // Auto-select if only one move
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
    console.log('DiceManager: Move selected from dice roll outcomes:', space.space_name);
    
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
    
    // Get the current space - use the selected space if available, otherwise use player position
    let currentSpace = null;
    let currentSpaceId = null;
    
    // First try to get the selected space from GameBoard state
    if (this.gameBoard.state.selectedSpace) {
      currentSpaceId = this.gameBoard.state.selectedSpace;
      console.log('DiceManager: Using selected space from GameBoard state:', currentSpaceId);
    } else {
      // Fallback to current player position
      currentSpaceId = currentPlayer.position;
      console.log('DiceManager: Using current player position:', currentSpaceId);
    console.log('DiceManager: TESTING - about to find space with format conversion');
    }
    
    // Find the actual space object - handle ID format conversion
    currentSpace = window.GameStateManager.findSpaceById(currentSpaceId);
    
    // If not found with direct ID, try converting format (OWNER-SCOPE-INITIATION -> owner-scope-initiation-first)
    if (!currentSpace && currentSpaceId) {
      console.log('DiceManager: Space not found with direct ID, trying format conversion');
      
      // Convert to lowercase and add visit type suffix
      const normalizedSpaceId = currentSpaceId.toLowerCase() + '-first';
      console.log('DiceManager: Trying normalized ID:', normalizedSpaceId);
      currentSpace = window.GameStateManager.findSpaceById(normalizedSpaceId);
      
      // If still not found, try subsequent
      if (!currentSpace) {
        const subsequentSpaceId = currentSpaceId.toLowerCase() + '-subsequent';
        console.log('DiceManager: Trying subsequent ID:', subsequentSpaceId);
        currentSpace = window.GameStateManager.findSpaceById(subsequentSpaceId);
      }
      
      // If found with converted ID, update currentSpaceId for consistency
      if (currentSpace) {
        console.log('DiceManager: Found space with converted ID, using:', currentSpace.id || normalizedSpaceId);
        currentSpaceId = currentSpace.id || normalizedSpaceId;
      }
    }
    
    if (!currentSpace) {
      console.log('DiceManager: No current space found for ID:', currentSpaceId, 'even after format conversion');
      return false;
    }
    
    // Use the space_name property (as defined in CSV)
    const spaceName = currentSpace.space_name;
    console.log('DiceManager: Checking space:', spaceName);
    
    // Determine the visit type - use First as default since we're debugging OWNER-SCOPE-INITIATION
    let visitType = 'First';
    
    // Try to determine visit type from space ID or spaceSelectionManager
    if (currentSpaceId && currentSpaceId.includes('subsequent')) {
      visitType = 'Subsequent';
    } else if (this.gameBoard.spaceSelectionManager?.isVisitingFirstTime) {
      visitType = this.gameBoard.spaceSelectionManager.isVisitingFirstTime() ? 'First' : 'Subsequent';
    }
    
    console.log(`DiceManager: Checking if space ${spaceName} needs dice roll. Visit type: ${visitType}`);
    
    // Initialize variables to track decision and reason
    let needsDiceRoll = false;
    let reason = '';
    
    // Method 1: Check if there are dice roll entries in DiceRoll Info.csv
    if (this.gameBoard.state.diceRollData && this.gameBoard.state.diceRollData.length > 0) {
      const hasDiceRollInData = this.gameBoard.state.diceRollData.some(data => 
        data['space_name'] === spaceName && 
        data['visit_type'] && data['visit_type'].toLowerCase() === visitType.toLowerCase()
      );
      
      if (hasDiceRollInData) {
        needsDiceRoll = true;
        reason = `Found dice roll data for space ${spaceName} and visit type ${visitType} in DiceRoll Info.csv`;
        console.log(`DiceManager: ${reason}`);
      } else {
        console.log(`DiceManager: No dice roll data found for space ${spaceName} visit type ${visitType} in DiceRoll Info.csv`);
        console.log('DiceManager: Available dice roll data spaces:', 
          this.gameBoard.state.diceRollData.slice(0, 5).map(d => `${d.space_name}(${d.visit_type})`).join(', '));
      }
    } else {
      console.log('DiceManager: No diceRollData available in GameBoard state - checking window.diceRollData');
      
      // Fallback to global diceRollData if GameBoard state doesn't have it yet
      if (window.diceRollData && window.diceRollData.length > 0) {
        const hasDiceRollInData = window.diceRollData.some(data => 
          data['space_name'] === spaceName && 
          data['visit_type'] && data['visit_type'].toLowerCase() === visitType.toLowerCase()
        );
        
        if (hasDiceRollInData) {
          needsDiceRoll = true;
          reason = `Found dice roll data for space ${spaceName} and visit type ${visitType} in global diceRollData`;
          console.log(`DiceManager: ${reason}`);
        } else {
          console.log(`DiceManager: No dice roll data found in global diceRollData either`);
        }
      } else {
        console.log('DiceManager: No global diceRollData available either');
      }
    }
    
    // Method 2: Check the requires_dice_roll column in Spaces.csv
    if (!needsDiceRoll) {
      const requiresDiceRoll = currentSpace.requires_dice_roll;
      console.log(`DiceManager: Space ${spaceName} requires_dice_roll field:`, requiresDiceRoll);
      if (requiresDiceRoll && (requiresDiceRoll.toLowerCase() === 'yes' || requiresDiceRoll.toLowerCase() === 'true')) {
        needsDiceRoll = true;
        reason = `Space ${spaceName} has requires_dice_roll=${requiresDiceRoll} in Spaces.csv`;
        console.log(`DiceManager: ${reason}`);
      }
    }
    
    // Method 3: Check if any card columns contain conditional text "if you roll"
    if (!needsDiceRoll) {
      const cardTypes = ['w_card', 'b_card', 'i_card', 'l_card', 'e_card'];
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
      console.log(`DiceManager: No dice roll required for space ${spaceName} based on CSV data`);
    } else {
      console.log(`DiceManager: Dice roll required for space ${spaceName}. Reason: ${reason}`);
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
    console.log('DiceManager: 🎲 DICE ROLL BUTTON CLICKED - handling directly');
    console.log('DiceManager: 🎲 this.gameBoard exists:', !!this.gameBoard);
    console.log('DiceManager: 🎲 this.gameBoard.state exists:', !!this.gameBoard?.state);
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.error('DiceManager: 🎲 CRITICAL ERROR - gameBoard or state not initialized in handleRollDiceClick');
      console.error('DiceManager: 🎲 gameBoard:', this.gameBoard);
      console.error('DiceManager: 🎲 gameBoard.state:', this.gameBoard?.state);
      return;
    }
    
    console.log('DiceManager: 🎲 GameBoard validated, proceeding with dice roll...');
    
    // Use SpaceSelectionManager to get selected space
    const selectedSpace = this.gameBoard.spaceSelectionManager?.getSelectedSpace();
    let spaceName;
    let visitType;
    let spaceId;
    
    if (selectedSpace && selectedSpace.name) {
      // If a space is selected, use it
      spaceName = selectedSpace.name;
      visitType = selectedSpace.visitType || (this.gameBoard.spaceSelectionManager?.isVisitingFirstTime() ? 'First' : 'Subsequent');
      spaceId = selectedSpace.id;
    } else {
      // If no space is selected, use the current player's position
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      if (currentPlayer) {
        spaceId = currentPlayer.position;
        console.log('DiceManager: Current player position from GameStateManager:', spaceId);
        
        // Use the spaceId directly as spaceName for CSV lookup (they should match)
        spaceName = spaceId;
        
        // Determine visit type based on player's visit history
        const hasVisited = currentPlayer?.visitedSpaces?.has(spaceName);
        visitType = hasVisited ? 'Subsequent' : 'First';
        
        console.log('DiceManager: Using current player position for dice roll:', spaceName, 'Visit type:', visitType);
        console.log('DiceManager: Player visited spaces:', currentPlayer?.visitedSpaces);
        
        // Try to find the space object for conditional card requirements
        // Use the correct visit type we already calculated above
        // Format the space ID exactly as stored in cache: normalized name + visit type
        const normalizedSpaceName = spaceName
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase();
        const spaceIdWithVisitType = normalizedSpaceName + '-' + visitType.toLowerCase();
        
        console.log('DiceManager: Looking up space with ID:', spaceIdWithVisitType);
        const currentSpace = window.GameStateManager.findSpaceById(spaceIdWithVisitType);
        if (currentSpace) {
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
          console.warn('DiceManager: Could not find space object for conditional requirements, but proceeding with dice roll');
        }
      } else {
        spaceName = "ARCH-INITIATION";
        visitType = 'First';
        console.warn('DiceManager: No current player found, falling back to ARCH-INITIATION');
      }
    }
    
    // Make sure we always have a valid visit type
    if (!visitType || (visitType !== 'First' && visitType !== 'Subsequent')) {
      if (spaceId && (spaceId.endsWith('-first') || spaceId.includes('-first-'))) {
        visitType = 'First';
      } else if (spaceId && (spaceId.endsWith('-subsequent') || spaceId.includes('-subsequent-'))) {
        visitType = 'Subsequent';
      } else {
        visitType = 'First';
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
    console.log('DiceManager: ⚡ PERFORM DIRECT DICE ROLL CALLED for', spaceName, visitType);
    console.log('DiceManager: ⚡ gameBoard exists:', !!this.gameBoard);
    console.log('DiceManager: ⚡ gameBoard.setState exists:', !!this.gameBoard?.setState);
    
    // Set rolling state
    console.log('DiceManager: ⚡ Setting rolling state...');
    this.gameBoard.setState({ 
      isRollingDice: true,
      hasRolledDice: false // Ensure this is false while rolling
    });
    console.log('DiceManager: ⚡ Rolling state set successfully');
    
    // Short delay to let UI update, then process dice roll
    console.log('DiceManager: Setting short timeout for dice roll processing...');
    
    setTimeout(() => {
      console.log('DiceManager: ⚡ TIMEOUT EXECUTED - Starting dice roll processing...');
      try {
        // Generate random number between 1 and 6
        const result = Math.floor(Math.random() * 6) + 1;
        console.log('DiceManager: ⚡ Direct dice roll result:', result);
        
        // Process the dice roll outcome
        console.log('DiceManager: ⚡ About to process dice roll outcome for:', spaceName, visitType);
        const outcomes = this.processDiceRollOutcome(result, spaceName, visitType);
        console.log('DiceManager: ⚡ Processed outcomes:', outcomes);
        
        // Complete the dice roll
        console.log('DiceManager: ⚡ About to complete dice roll...');
        this.completeDiceRoll(result, outcomes);
        console.log('DiceManager: ⚡ Dice roll completed successfully');
        
      } catch (error) {
        console.error('DiceManager: ⚡ ERROR during dice roll processing:', error);
        console.error('DiceManager: Error stack:', error.stack);
        
        // Fallback: Complete the dice roll with empty outcomes to prevent UI from getting stuck
        const fallbackResult = Math.floor(Math.random() * 6) + 1;
        console.log('DiceManager: Using fallback completion with result:', fallbackResult);
        this.completeDiceRoll(fallbackResult, { moves: [] });
      }
    }, 100); // Short 100ms delay
  }
  
  // Process dice roll outcome (moved from DiceRoll component)
  processDiceRollOutcome = (rollResult, spaceName, visitType) => {
    console.log('DiceManager: 🎲 ====== PROCESSING DICE ROLL OUTCOME ======');
    console.log('DiceManager: 🎲 Roll result:', rollResult);
    console.log('DiceManager: 🎲 Space name:', spaceName);
    console.log('DiceManager: 🎲 Visit type:', visitType);
    
    // Get dice outcomes data
    const diceRollData = this.gameBoard.state.diceRollData || [];
    console.log('DiceManager: 🎲 Total diceRollData rows:', diceRollData.length);
    
    if (diceRollData.length === 0) {
      console.error('DiceManager: 🎲 ERROR - No diceRollData available!');
      return { moves: [] };
    }
    
    // Show first few rows for debugging
    console.log('DiceManager: 🎲 First 3 diceRollData rows:', diceRollData.slice(0, 3));
    
    // Check what space names are available
    const availableSpaceNames = [...new Set(diceRollData.map(d => d.space_name))];
    console.log('DiceManager: 🎲 Available space names:', availableSpaceNames);
    
    const diceOutcomes = diceRollData.filter(data => 
      data['space_name'] === spaceName && 
      data['visit_type'].toLowerCase() === visitType.toLowerCase()
    );
    
    console.log('DiceManager: 🎲 Filtered outcomes for', spaceName, visitType + ':', diceOutcomes.length, 'rows');
    console.log('DiceManager: 🎲 Filtered outcome details:', diceOutcomes);
    
    if (!diceOutcomes || diceOutcomes.length === 0) {
      console.error('DiceManager: 🎲 ERROR - No outcomes found for space:', spaceName, 'visit type:', visitType);
      
      // Try alternative space name formats
      const alternativeNames = [
        spaceName.toUpperCase(),
        spaceName.toLowerCase(),
        spaceName.replace(/-/g, ' '),
        spaceName.replace(/ /g, '-')
      ];
      
      console.log('DiceManager: 🎲 Trying alternative space names:', alternativeNames);
      
      for (const altName of alternativeNames) {
        const altOutcomes = diceRollData.filter(data => 
          data['space_name'] === altName && 
          data['visit_type'].toLowerCase() === visitType.toLowerCase()
        );
        if (altOutcomes.length > 0) {
          console.log('DiceManager: 🎲 SUCCESS - Found outcomes with alternative name:', altName);
          console.log('DiceManager: 🎲 Alternative outcomes:', altOutcomes);
          break;
        }
      }
      
      return { moves: [] };
    }
    
    // Process outcomes
    const outcomes = {};
    console.log('DiceManager: 🎲 Processing', diceOutcomes.length, 'outcome rows...');
    
    for (const outcomeData of diceOutcomes) {
      const dieRollType = outcomeData['die_roll'];
      const outcomeValue = outcomeData[rollResult.toString()];
      
      console.log('DiceManager: 🎲 Processing outcome row:', outcomeData);
      console.log('DiceManager: 🎲 Outcome type (die_roll):', dieRollType);
      console.log('DiceManager: 🎲 Looking for column:', rollResult.toString());
      console.log('DiceManager: 🎲 Value found:', outcomeValue);
      
      if (outcomeValue && outcomeValue.trim() !== '' && outcomeValue !== 'n/a') {
        if (dieRollType === 'W Cards Discard' || dieRollType === 'discard W Cards') {
          outcomes.discardWCards = outcomeValue;
          console.log('DiceManager: 🎲 Added discard requirement:', outcomeValue);
        } else {
          outcomes[dieRollType] = outcomeValue;
          console.log('DiceManager: 🎲 Added outcome:', dieRollType, '=', outcomeValue);
        }
      } else {
        console.log('DiceManager: 🎲 Skipping empty/n/a value:', outcomeValue);
      }
    }
    
    console.log('DiceManager: 🎲 ====== FINAL PROCESSED OUTCOMES ======');
    console.log('DiceManager: 🎲 Outcomes object:', outcomes);
    console.log('DiceManager: 🎲 Outcomes keys:', Object.keys(outcomes));
    console.log('DiceManager: 🎲 ==========================================');
    
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
      
      // COMPREHENSIVE FIX: If no moves found, handle outcomes directly
      if (availableMoves.length === 0 && nextStepValue) {
        if (nextStepValue.includes(' or ')) {
          console.log('DiceManager: No moves from DiceRollLogic, handling multiple choice directly:', nextStepValue);
          availableMoves = this.handleMultipleChoiceOutcome(nextStepValue);
        } else {
          console.log('DiceManager: No moves from DiceRollLogic, handling single choice directly:', nextStepValue);
          availableMoves = this.handleSingleChoiceOutcome(nextStepValue);
        }
      }
    }
    
    // Add moves to the outcomes object
    outcomes.moves = availableMoves;
    
    console.log('DiceManager: processDiceRollOutcome completed');
    return outcomes;
  }
  
  // NEW METHOD: Handle single choice outcomes directly
  handleSingleChoiceOutcome = (nextStepValue) => {
    console.log('DiceManager: Processing single choice outcome:', nextStepValue);
    
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    
    // Extract space name (part before ' - ' if it exists)
    let spaceName = nextStepValue;
    if (spaceName.includes(' - ')) {
      spaceName = spaceName.split(' - ')[0].trim();
    }
    
    console.log('DiceManager: Processing single space:', spaceName);
    
    // Determine visit type based on player's history
    const hasVisited = window.GameStateManager.hasPlayerVisitedSpace(spaceName, currentPlayer);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log('DiceManager: Single space', spaceName, 'visit type:', visitType, '(has visited:', hasVisited, ')');
    
    // Create proper space ID
    const spaceId = spaceName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + visitType;
    
    // Create move object
    const move = {
      id: spaceId,
      name: spaceName,
      description: nextStepValue,
      visitType: visitType,
      fromDiceRoll: true
    };
    
    console.log('DiceManager: Created single move:', move);
    return [move];
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
    console.log('DiceManager: ⚡ COMPLETE DICE ROLL - Starting with result:', result);
    console.log('DiceManager: ⚡ COMPLETE DICE ROLL - Outcomes received:', outcomes);
    
    try {
      // Update MovementEngine dice state immediately
      if (window.setMovementEngineDiceResult) {
        window.setMovementEngineDiceResult(result);
        console.log('DiceManager: ⚡ Updated MovementEngine dice state with result:', result);
      }
      
      // Get current player
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      const currentPosition = currentPlayer ? currentPlayer.position : null;
      console.log('DiceManager: ⚡ Current player:', currentPlayer?.id, 'position:', currentPosition);
      
      // Process W card requirements
      console.log('DiceManager: ⚡ Processing W card requirements...');
      this.processWCardRequirements(outcomes);
      console.log('DiceManager: ⚡ W card requirements processed');
      
      // Process conditional card requirements
      console.log('DiceManager: ⚡ Processing conditional card requirements...');
      this.processConditionalCardRequirements(result, currentPlayer);
      console.log('DiceManager: ⚡ Conditional card requirements processed');
      
      // CRITICAL FIX: Ensure dice rolling UI is completely hidden
      console.log('DiceManager: ⚡ Setting GameBoard state...');
      this.gameBoard.setState({
        isRollingDice: false,
        showDiceRoll: false,  // Ensure dice UI is hidden
        diceOutcomes: outcomes,
        lastDiceRoll: result,
        hasRolledDice: true,
        selectedSpace: currentPosition
      });
      console.log('DiceManager: ⚡ GameBoard state set successfully');
      
      // Also update GameStateManager's hasRolledDice property
      window.GameStateManager.hasRolledDice = true;
      console.log('DiceManager: ⚡ Set hasRolledDice=true in both GameBoard state and GameStateManager');
      
      // Dispatch event
      console.log('DiceManager: ⚡ Dispatching diceRolled event...');
      window.GameStateManager.dispatchEvent('diceRolled', {
        result: result,
        outcomes: outcomes,
        currentPlayer: currentPlayer,
        currentPosition: currentPosition,
        forDisplay: false,
        hasSelectedMove: false,
        selectedMove: null
      });
      console.log('DiceManager: ⚡ diceRolled event dispatched');
      
      // Update available moves after a short delay
      console.log('DiceManager: ⚡ Setting timeout for available moves update...');
      setTimeout(() => {
        console.log('DiceManager: ⚡ Timeout executed - updating available moves...');
        this.updateAvailableMovesAfterDiceRoll(outcomes, currentPlayer);
        console.log('DiceManager: ⚡ Available moves updated');
      }, 100);
      
      // Process card draws - THE CRITICAL PART
      console.log('DiceManager: ⚡ ABOUT TO CALL processCardDraws');
      console.log('DiceManager: ⚡ Outcomes for processCardDraws:', JSON.stringify(outcomes, null, 2));
      console.log('DiceManager: ⚡ Current player for processCardDraws:', currentPlayer?.id);
      
      if (!currentPlayer) {
        console.error('DiceManager: ⚡ ERROR - No current player available for processCardDraws!');
        return;
      }
      
      if (!outcomes) {
        console.error('DiceManager: ⚡ ERROR - No outcomes available for processCardDraws!');
        return;
      }
      
      console.log('DiceManager: ⚡ Calling processCardDraws now...');
      this.processCardDraws(outcomes, currentPlayer);
      console.log('DiceManager: ⚡ processCardDraws call completed');
      
      console.log('DiceManager: ⚡ Direct dice roll completed successfully');
      
    } catch (error) {
      console.error('DiceManager: ⚡ ERROR in completeDiceRoll:', error);
      console.error('DiceManager: ⚡ Error stack:', error.stack);
    }
  }
  
  // Event handler for playerMoved event
  handlePlayerMovedEvent(event) {
    console.log('DiceManager: Player moved event received', event.data);
    
    // Skip if gameBoard is not initialized
    if (!this.gameBoard || !this.gameBoard.state) {
      console.log('DiceManager: gameBoard or state not initialized in handlePlayerMovedEvent');
      return;
    }
    
    // Get the new space information from event data
    const newSpaceId = event.data?.toSpaceId;
    let potentialOutcomes = null;
    
    // Check if the new space requires dice rolling and load potential outcomes
    if (newSpaceId && this.hasDiceRollSpace(newSpaceId)) {
      console.log('DiceManager: New space requires dice roll, loading potential outcomes');
      
      // Get the space object to extract the correct space_name
      const spaceObject = window.GameStateManager.findSpaceById(newSpaceId);
      if (!spaceObject) {
        console.warn('DiceManager: Could not find space object for ID:', newSpaceId);
        return;
      }
      
      const spaceName = spaceObject.space_name;
      console.log('DiceManager: Using space_name for potential outcomes:', spaceName);
      
      // Determine visit type for this space
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      const hasVisited = currentPlayer?.visitedSpaces?.has(spaceName);
      const visitType = hasVisited ? 'Subsequent' : 'First';
      
      // Load potential dice outcomes using DiceRollLogic.outcomeParser
      if (window.DiceRollLogic && window.DiceRollLogic.outcomeParser) {
        const allOutcomes = window.DiceRollLogic.outcomeParser.getAllOutcomesForSpace(spaceName, visitType);
        console.log('DiceManager: Loaded potential outcomes for', spaceName, visitType, allOutcomes);
        
        // Convert to display format - show what each dice roll would give
        potentialOutcomes = {};
        for (let roll = 1; roll <= 6; roll++) {
          if (allOutcomes[roll] && allOutcomes[roll].length > 0) {
            // Format outcomes for display
            const formattedOutcomes = {};
            for (const outcome of allOutcomes[roll]) {
              if (outcome.type === 'cards' && outcome.action === 'drawCards') {
                const cardEntries = Object.entries(outcome.cards);
                if (cardEntries.length > 0) {
                  const [cardType, count] = cardEntries[0];
                  formattedOutcomes['W Cards'] = `Draw ${count}`;
                }
              } else if (outcome.type === 'movement' && outcome.destination) {
                formattedOutcomes['Next Step'] = outcome.destination;
              } else if (outcome.type === 'raw') {
                formattedOutcomes['Effect'] = outcome.text;
              }
            }
            
            if (Object.keys(formattedOutcomes).length > 0) {
              potentialOutcomes[`Roll ${roll}`] = formattedOutcomes;
            }
          }
        }
        
        console.log('DiceManager: Potential outcomes formatted for display:', potentialOutcomes);
      } else {
        console.warn('DiceManager: DiceRollLogic.outcomeParser not available for loading potential outcomes');
      }
    }
    
    // Reset dice roll state when player moves
    this.gameBoard.setState({
      hasRolledDice: false,
      diceOutcomes: potentialOutcomes, // Show potential outcomes instead of null
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
    
    // Clear turn-based card draw tracking for new turn
    this.processedCardDrawsThisTurn.clear();
    console.log('DiceManager: Cleared turn-based card draw tracking for new turn');
    
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
    
    // Only handle events from other components or our own complete dice roll events
    // Skip events that are only for display purposes
    if (event.data.forDisplay === true) {
      console.log('DiceManager: Skipping display-only dice event');
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
  
  // Load initial potential outcomes for current player's space
  loadInitialPotentialOutcomes() {
    console.log('DiceManager: Loading initial potential outcomes');
    
    // Get current player and their position
    const currentPlayer = window.GameStateManager?.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.position) {
      console.log('DiceManager: No current player or position for initial outcomes');
      return;
    }
    
    const currentSpaceId = currentPlayer.position;
    console.log('DiceManager: Current player space for initial outcomes:', currentSpaceId);
    
    // Check if this space requires dice rolling
    if (!this.hasDiceRollSpace(currentSpaceId)) {
      console.log('DiceManager: Current space does not require dice rolling');
      return;
    }
    
    // Get the space object to extract the correct space_name
    let spaceObject = window.GameStateManager.findSpaceById(currentSpaceId);
    
    // If not found with direct ID, try converting format (OWNER-SCOPE-INITIATION -> owner-scope-initiation-first)
    if (!spaceObject && currentSpaceId) {
      console.log('DiceManager: Space not found with direct ID for initial outcomes, trying format conversion');
      
      // Convert to lowercase and add visit type suffix
      const normalizedSpaceId = currentSpaceId.toLowerCase() + '-first';
      console.log('DiceManager: Trying normalized ID for initial outcomes:', normalizedSpaceId);
      spaceObject = window.GameStateManager.findSpaceById(normalizedSpaceId);
      
      // If still not found, try subsequent
      if (!spaceObject) {
        const subsequentSpaceId = currentSpaceId.toLowerCase() + '-subsequent';
        console.log('DiceManager: Trying subsequent ID for initial outcomes:', subsequentSpaceId);
        spaceObject = window.GameStateManager.findSpaceById(subsequentSpaceId);
      }
    }
    
    if (!spaceObject) {
      console.warn('DiceManager: Could not find space object for initial outcomes, ID:', currentSpaceId);
      return;
    }
    
    const spaceName = spaceObject.space_name;
    console.log('DiceManager: Using space_name for initial outcomes:', spaceName);
    
    // Determine visit type
    const hasVisited = currentPlayer?.visitedSpaces?.has(spaceName);
    const visitType = hasVisited ? 'Subsequent' : 'First';
    
    // Load potential outcomes
    let potentialOutcomes = null;
    if (window.DiceRollLogic && window.DiceRollLogic.outcomeParser) {
      const allOutcomes = window.DiceRollLogic.outcomeParser.getAllOutcomesForSpace(spaceName, visitType);
      console.log('DiceManager: Initial outcomes loaded for', spaceName, visitType, allOutcomes);
      
      // Convert to display format - use DIRECT format (no nesting) for consistency
      potentialOutcomes = { moves: [] }; // Initialize with consistent structure
      
      // For potential outcomes, we can show all possible outcomes directly
      // This eliminates the confusing nested format
      for (let roll = 1; roll <= 6; roll++) {
        if (allOutcomes[roll] && allOutcomes[roll].length > 0) {
          for (const outcome of allOutcomes[roll]) {
            if (outcome.type === 'cards' && outcome.action === 'drawCards') {
              const cardEntries = Object.entries(outcome.cards);
              if (cardEntries.length > 0) {
                const [cardType, count] = cardEntries[0];
                // Use the same key format as actual dice roll outcomes
                potentialOutcomes['W Cards'] = `Draw 1-3`; // Show range for potential
              }
            } else if (outcome.type === 'movement' && outcome.destination) {
              potentialOutcomes['Next Step'] = 'Various destinations'; // Generic for potential
            } else if (outcome.type === 'raw') {
              potentialOutcomes['Effect'] = 'See dice table'; // Generic for potential
            }
          }
        }
      }
      
      console.log('DiceManager: Initial potential outcomes formatted:', potentialOutcomes);
    } else {
      console.warn('DiceManager: DiceRollLogic.outcomeParser not available for initial outcomes');
    }
    
    // Update GameBoard state with initial potential outcomes
    if (potentialOutcomes && Object.keys(potentialOutcomes).length > 0) {
      this.gameBoard.setState({
        diceOutcomes: potentialOutcomes
      });
      console.log('DiceManager: GameBoard state updated with initial potential outcomes');
    }
  }
  
  // Clean up resources when no longer needed
  cleanup() {
    console.log('DiceManager: Cleaning up resources');
    
    // Clear all active timers to prevent memory leaks
    this.activeTimers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.activeTimers.clear();
    
    // Clear card draw processing flags
    this.isProcessingCardDraws = false;
    this.currentProcessingKey = null;
    this.processedCardDrawsThisTurn.clear();
    
    // Remove all event listeners to prevent memory leaks
    window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.removeEventListener('diceRolled', this.eventHandlers.diceRolled);
    window.GameStateManager.removeEventListener('spacesLoaded', this.handleSpacesLoaded.bind(this));
    
    console.log('DiceManager: Cleanup completed');
  }
  
  // Mark related manual card drawing buttons as used when dice automatically draw cards
  markRelatedCardButtonsAsUsed(currentPlayer, cardType, cardCount, diceValue) {
    console.log('DiceManager: 🔘 Marking related card buttons as used for dice-driven card draw');
    console.log('DiceManager: 🔘 Card type:', cardType, 'Count:', cardCount, 'Dice value:', diceValue);
    
    if (!window.SpaceInfoManager || !currentPlayer) {
      console.log('DiceManager: 🔘 SpaceInfoManager or currentPlayer not available');
      return;
    }
    
    // Get current space ID
    const spaceId = currentPlayer.position;
    if (!spaceId) {
      console.log('DiceManager: 🔘 No current space ID available');
      return;
    }
    
    // Map card type codes to card type names used in buttons
    const cardTypeMap = {
      'W': 'Work Type',
      'B': 'Bank',
      'I': 'Investor', 
      'L': 'Life',
      'E': 'Expeditor'
    };
    
    const cardTypeName = cardTypeMap[cardType];
    if (!cardTypeName) {
      console.log('DiceManager: 🔘 Unknown card type:', cardType);
      return;
    }
    
    // Create potential button IDs that could match this dice outcome
    // The format is: draw-${cardType}-${amount}-${spaceId}
    const potentialButtonIds = [
      // Standard formats
      `draw-${cardTypeName}-Draw ${cardCount}-${spaceId}`,
      `draw-${cardTypeName} Card-Draw ${cardCount}-${spaceId}`,
      `draw-${cardTypeName} Cards-Draw ${cardCount}-${spaceId}`,
      `draw-${cardTypeName}s-Draw ${cardCount}-${spaceId}`,
      
      // With type suffix variations
      `draw-${cardTypeName}-Draw ${cardCount} ${cardTypeName}-${spaceId}`,
      `draw-${cardTypeName}-Draw ${cardCount} ${cardTypeName}s-${spaceId}`,
      `draw-${cardTypeName}-Draw ${cardCount} ${cardTypeName} Card-${spaceId}`,
      `draw-${cardTypeName}-Draw ${cardCount} ${cardTypeName} Cards-${spaceId}`,
      
      // Number only formats
      `draw-${cardTypeName}-${cardCount}-${spaceId}`,
      `draw-${cardTypeName} Card-${cardCount}-${spaceId}`,
      `draw-${cardTypeName} Cards-${cardCount}-${spaceId}`,
      
      // Exact dice outcome format (what we expect to match)
      `draw-${cardTypeName}-${diceValue}-${spaceId}`
    ];
    
    console.log('DiceManager: 🔘 Potential button IDs to mark as used:', potentialButtonIds);
    
    // Mark all potential matching buttons as used
    potentialButtonIds.forEach(buttonId => {
      window.SpaceInfoManager.markButtonUsed(currentPlayer.id, buttonId);
      console.log(`DiceManager: 🔘 Marked button as used: ${buttonId}`);
    });
    
    // Additional approach: Mark all buttons for this card type and space
    // This handles cases where the exact ID format is different
    const allUsedButtons = window.SpaceInfoManager.usedButtons.get(currentPlayer.id) || new Set();
    
    // Generate a pattern to match any button for this card type and count on this space
    const patternKeywords = [cardTypeName, cardCount.toString(), spaceId];
    
    // Mark any button that contains all these keywords (more aggressive matching)
    const broadPatternId = `draw-${cardTypeName}-${cardCount}-${spaceId}-BROAD_MATCH`;
    window.SpaceInfoManager.markButtonUsed(currentPlayer.id, broadPatternId);
    console.log(`DiceManager: 🔘 Marked broad pattern as used: ${broadPatternId}`);
    
    console.log('DiceManager: 🔘 Finished marking related card buttons as used');
  }
}

// Export DiceManager for use in other files
window.DiceManager = DiceManager;

console.log('DiceManager.js code execution finished');