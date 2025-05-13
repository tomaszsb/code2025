// MoveLogicManager.js - Main manager class for game move operations
console.log('MoveLogicManager.js file is beginning to be used');

/**
 * MoveLogicManager - Manager class for game move operations
 * 
 * This component manages player movement options, special space logic, and 
 * game flow related to player movement throughout the board.
 * 
 * Key features:
 * - Uses GameStateManager events for communication
 * - Handles standard and special case space movement logic
 * - Manages dice roll requirements for certain spaces
 * - Provides consistent space navigation for game flow
 * - Follows the manager pattern with proper initialization and cleanup
 * 
 * FIXED: Implemented proper dependency management for initialization (2025-05-08)
 * FIXED: Added initialization event listeners to ensure proper loading order (2025-05-08)
 * FIXED: Improved logging for easier debugging (2025-05-08)
 * FIXED: Added robust GameStateManager dependency detection and retry mechanism (2025-05-09)
 */
(function() {
  // Set a global flag to track our initialization status
  window.MoveLogicManagerInitStarted = true;
  
  // Make sure MoveLogicUIUpdates is loaded
  if (!window.MoveLogicUIUpdates) {
    console.error('MoveLogicManager: MoveLogicUIUpdates not found. Make sure to include MoveLogicUIUpdates.js first.');
    return; // In a closed system, we don't use fallbacks - we fix the loading order
  }
  
  // Define the MoveLogicManager class
  function MoveLogicManager() {
    console.log('MoveLogicManager: Initializing manager...');
    console.log('MoveLogicManager: Constructor initialized');
    
    // State tracking
    this.initialized = false;
    this.moveCache = new Map(); // Cache for frequently accessed moves
    
    // Track initialization status of dependencies
    this.dependencies = {
      specialCasesInitialized: window.MoveLogicSpecialCasesInitialized || false,
      pmDecisionCheckInitialized: window.MoveLogicPmDecisionCheckInitialized || false,
      gameStateManagerInitialized: !!window.GameStateManager || false,
      eventListenersRegistered: false
    };
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      // Game state events
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      spaceChanged: this.handleSpaceChangedEvent.bind(this),
      diceRolled: this.handleDiceRolledEvent.bind(this),
      
      // Initialization events
      specialCasesInitialized: this.handleSpecialCasesInitialized.bind(this),
      pmDecisionCheckInitialized: this.handlePmDecisionCheckInitialized.bind(this),
      gameStateManagerInitialized: this.handleGameStateManagerInitialized.bind(this)
    };
    
    // Register for initialization events
    window.addEventListener('MoveLogicSpecialCasesInitialized', this.eventHandlers.specialCasesInitialized);
    window.addEventListener('MoveLogicPmDecisionCheckInitialized', this.eventHandlers.pmDecisionCheckInitialized);
    window.addEventListener('GameStateManagerInitialized', this.eventHandlers.gameStateManagerInitialized);
    
    // Try to register event listeners with GameStateManager if available
    this.tryRegisterEventListeners();
    
    // Check if all dependencies are already initialized
    if (window.MoveLogicSpecialCasesInitialized && window.MoveLogicPmDecisionCheckInitialized) {
      console.log('MoveLogicManager: MoveLogic dependencies already initialized');
      this.dependencies.specialCasesInitialized = true;
      this.dependencies.pmDecisionCheckInitialized = true;
      this.checkForPmDecisionCheckHandler();
    }
    
    // Start checking for GameStateManager and other dependencies
    this.startDependencyCheckTimer();
    
    this.initialized = true;
    console.log('MoveLogicManager: Using data-driven approach with DiceRollLogic for all spaces. [2025-05-04]');
    console.log('MoveLogicManager: Constructor completed');

    // We'll delay the initial player's turn handling to the dependency check
    // This ensures GameStateManager is available first
  }
  
  // Copy UI methods from MoveLogicUIUpdates using composition instead of inheritance
  const uiMethods = [
    'updateCurrentPlayerTokenDisplay',
    'updateSpaceVisitDisplay',
    'updateSelectedMoveStyling',
    'initializeStyles'
  ];
  
  // Add the UI methods to the MoveLogicManager prototype
  uiMethods.forEach(methodName => {
    MoveLogicManager.prototype[methodName] = function(...args) {
      // Delegate the call to MoveLogicUIUpdates if the method exists
      if (window.MoveLogicUIUpdates && typeof window.MoveLogicUIUpdates[methodName] === 'function') {
        return window.MoveLogicUIUpdates[methodName].apply(window.MoveLogicUIUpdates, args);
      } else {
        console.warn(`MoveLogicManager: Method ${methodName} not found in MoveLogicUIUpdates`);
      }
    };
    
    console.log(`MoveLogicManager: Successfully copied ${methodName} method from MoveLogicUIUpdates`);
  });
  
  MoveLogicManager.prototype.constructor = MoveLogicManager;
  
  /**
   * Start timer to periodically check for dependencies
   * This ensures we detect GameStateManager even if it loads after us
   */
  MoveLogicManager.prototype.startDependencyCheckTimer = function() {
    // Check dependencies immediately
    this.checkAllDependencies();
    
    // Set up periodic check until all dependencies are initialized
    this.dependencyCheckInterval = setInterval(() => {
      const allInitialized = this.checkAllDependencies();
      
      // If all dependencies are initialized, clear the interval
      if (allInitialized) {
        console.log('MoveLogicManager: All dependencies initialized, stopping periodic check');
        clearInterval(this.dependencyCheckInterval);
        
        // Handle initial player turn now that everything is initialized
        this.handleInitialPlayerTurn();
      }
    }, 200); // Check every 200ms
  };
  
  /**
   * Handle initial player turn once all dependencies are initialized
   */
  MoveLogicManager.prototype.handleInitialPlayerTurn = function() {
    // Ensure GameStateManager is available before proceeding
    if (!window.GameStateManager || !window.GameStateManager.getCurrentPlayer) {
      console.log('MoveLogicManager: GameStateManager not ready for initial player turn');
      return;
    }
    
    try {
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      if (currentPlayer) {
        // First dispatch the event to update the game state
        window.GameStateManager.dispatchEvent('turnChanged', {
          previousPlayerIndex: window.GameStateManager.currentPlayerIndex,
          currentPlayerIndex: window.GameStateManager.currentPlayerIndex,
          player: currentPlayer
        });
        
        // Then manually add the YOUR TURN indicator to the current player's token
        this.updateCurrentPlayerTokenDisplay(currentPlayer);
        
        console.log('MoveLogicManager: Dispatched initial turn event for', currentPlayer.name);
      }
    } catch (error) {
      console.error('MoveLogicManager: Error dispatching initial turn event:', error);
    }
  };
  
  /**
   * Check if all dependencies are initialized
   * @returns {boolean} True if all dependencies are initialized
   */
  MoveLogicManager.prototype.checkAllDependencies = function() {
    // Update dependency status
    this.dependencies.specialCasesInitialized = window.MoveLogicSpecialCasesInitialized || this.dependencies.specialCasesInitialized;
    this.dependencies.pmDecisionCheckInitialized = window.MoveLogicPmDecisionCheckInitialized || this.dependencies.pmDecisionCheckInitialized;
    
    // Check if GameStateManager is now available
    const gameStateManagerAvailable = !!window.GameStateManager;
    if (gameStateManagerAvailable && !this.dependencies.gameStateManagerInitialized) {
      console.log('MoveLogicManager: GameStateManager is now available');
      this.dependencies.gameStateManagerInitialized = true;
      
      // Try to register event listeners now that GameStateManager is available
      if (!this.dependencies.eventListenersRegistered) {
        this.tryRegisterEventListeners();
      }
    }
    
    console.log('MoveLogicManager: Checking dependencies -', 
               'SpecialCases:', this.dependencies.specialCasesInitialized,
               'PmDecisionCheck:', this.dependencies.pmDecisionCheckInitialized,
               'GameStateManager:', this.dependencies.gameStateManagerInitialized,
               'EventListeners:', this.dependencies.eventListenersRegistered);
    
    // If all dependencies are initialized, check for the handler
    if (this.dependencies.specialCasesInitialized && this.dependencies.pmDecisionCheckInitialized) {
      this.checkForPmDecisionCheckHandler();
    } else {
      console.log('MoveLogicManager: Not all MoveLogic dependencies initialized yet');
    }
    
    // Return true if all dependencies are ready
    return (
      this.dependencies.specialCasesInitialized && 
      this.dependencies.pmDecisionCheckInitialized && 
      this.dependencies.gameStateManagerInitialized &&
      this.dependencies.eventListenersRegistered
    );
  };
  
  /**
   * Handle the MoveLogicSpecialCases initialization event
   * @param {Event} event - The initialization event
   */
  MoveLogicManager.prototype.handleSpecialCasesInitialized = function(event) {
    console.log('MoveLogicManager: Received MoveLogicSpecialCases initialization event');
    this.dependencies.specialCasesInitialized = true;
    this.checkAllDependencies();
  };
  
  /**
   * Handle the MoveLogicPmDecisionCheck initialization event
   * @param {Event} event - The initialization event
   */
  MoveLogicManager.prototype.handlePmDecisionCheckInitialized = function(event) {
    console.log('MoveLogicManager: Received MoveLogicPmDecisionCheck initialization event');
    this.dependencies.pmDecisionCheckInitialized = true;
    this.checkAllDependencies();
  };
  
  /**
   * Handle the GameStateManager initialization event
   * @param {Event} event - The initialization event
   */
  MoveLogicManager.prototype.handleGameStateManagerInitialized = function(event) {
    console.log('MoveLogicManager: Received GameStateManager initialization event');
    this.dependencies.gameStateManagerInitialized = true;
    
    // Try to register event listeners now that GameStateManager is available
    if (!this.dependencies.eventListenersRegistered) {
      this.tryRegisterEventListeners();
    }
    
    this.checkAllDependencies();
  };
  
  /**
   * Check if the PM-DECISION-CHECK handler is available
   */
  MoveLogicManager.prototype.checkForPmDecisionCheckHandler = function() {
    console.log('MoveLogicManager: Checking for PM-DECISION-CHECK handler');
    
    let hasHandler = false;
    
    // Check if MoveLogicSpecialCases has the method
    if (window.MoveLogicSpecialCases && typeof window.MoveLogicSpecialCases.handlePmDecisionCheck === 'function') {
      console.log('MoveLogicManager: handlePmDecisionCheck found in MoveLogicSpecialCases');
      hasHandler = true;
    } else {
      console.warn('MoveLogicManager: handlePmDecisionCheck NOT FOUND in MoveLogicSpecialCases');
    }
    
    // Check if the reference object has the method
    if (window.MoveLogicPmDecisionCheckReference && 
        typeof window.MoveLogicPmDecisionCheckReference.handlePmDecisionCheck === 'function') {
      console.log('MoveLogicManager: handlePmDecisionCheck found in MoveLogicPmDecisionCheckReference');
      hasHandler = true;
    }
    
    console.log('MoveLogicManager: PM-DECISION-CHECK handler is ' + (hasHandler ? 'present' : 'MISSING'));
    
    // If the handler is not available but should be, log a critical error
    if (!hasHandler && this.dependencies.specialCasesInitialized && this.dependencies.pmDecisionCheckInitialized) {
      console.error('MoveLogicManager: CRITICAL - PM-DECISION-CHECK handler is missing despite dependencies being initialized');
      console.error('MoveLogicManager: This indicates an initialization sequence issue that must be fixed');
    }
    
    return hasHandler;
  };
  
  /**
   * Try to register event listeners with GameStateManager
   * Will be called periodically until successful
   * @returns {boolean} True if listeners were registered successfully
   */
  MoveLogicManager.prototype.tryRegisterEventListeners = function() {
    console.log('MoveLogicManager: Trying to register event listeners with GameStateManager');
    
    if (!window.GameStateManager) {
      console.log('MoveLogicManager: GameStateManager not available yet, will retry later');
      return false;
    }
    
    // Make sure addEventListener method exists
    if (typeof window.GameStateManager.addEventListener !== 'function') {
      console.warn('MoveLogicManager: GameStateManager exists but addEventListener method is missing');
      return false;
    }
    
    // Register for game state events
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
    window.GameStateManager.addEventListener('diceRolled', this.eventHandlers.diceRolled);
    
    this.dependencies.eventListenersRegistered = true;
    console.log('MoveLogicManager: Event listeners registered successfully with GameStateManager');
    return true;
  };
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The gameStateChanged event object
   */
  MoveLogicManager.prototype.handleGameStateChangedEvent = function(event) {
    console.log('MoveLogicManager: Handling gameStateChanged event');
    
    if (!event || !event.data) {
      return;
    }
    
    // Handle relevant game state changes
    if (event.data.changeType === 'newGame') {
      // Clear move cache for a new game
      this.moveCache.clear();
      console.log('MoveLogicManager: Cleared move cache for new game');
      
      // Update current player token after a short delay (for first turn)
      setTimeout(() => {
        const currentPlayer = window.GameStateManager.getCurrentPlayer();
        if (currentPlayer) {
          this.updateCurrentPlayerTokenDisplay(currentPlayer);
        }
      }, 1000);
    }

    // Update space visit display when player moves
    if (event.data.changeType === 'spaceVisitUpdated') {
      this.updateSpaceVisitDisplay(event.data.spaceName, event.data.visitType);
    }
    
    // When a player moves, update the selected move styling
    if (event.data.changeType === 'playerMoved' || 
        event.data.changeType === 'spaceSelectionChanged') {
      this.updateSelectedMoveStyling();
    }
  };
  
  /**
   * Handle turnChanged events from GameStateManager
   * @param {Object} event - The turnChanged event object
   */
  MoveLogicManager.prototype.handleTurnChangedEvent = function(event) {
    console.log('MoveLogicManager: Handling turnChanged event');
    
    // We may need to update available moves when turn changes
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      // Clear specifically the cached moves for this player
      this.clearCachedMovesForPlayer(currentPlayer.id);
      
      // Update the current player token display to show "YOUR TURN"
      this.updateCurrentPlayerTokenDisplay(currentPlayer);
    }
  };
  
  /**
   * Handle spaceChanged events from GameStateManager
   * @param {Object} event - The spaceChanged event object
   */
  MoveLogicManager.prototype.handleSpaceChangedEvent = function(event) {
    console.log('MoveLogicManager: Handling spaceChanged event');
    
    // Space has changed, we need to update available moves
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer && event.data && event.data.playerId) {
      // Clear cached moves for the player who moved
      this.clearCachedMovesForPlayer(event.data.playerId);
      
      // Update the visit type display for the space the player moved to
      if (event.data.spaceId && event.data.spaceName) {
        const hasVisited = window.GameStateManager.hasPlayerVisitedSpace(
          { id: event.data.playerId }, // Simplified player object
          event.data.spaceName
        );
        const visitType = hasVisited ? 'subsequent' : 'first';
        
        // Update the visit type display in the DOM
        this.updateSpaceVisitDisplay(event.data.spaceName, visitType);
        
        // If this is a selected move, update its styling
        this.updateSelectedMoveStyling();
      }
    }
  };
  
  /**
   * Handle diceRolled events from GameStateManager
   * @param {Object} event - The diceRolled event object
   */
  MoveLogicManager.prototype.handleDiceRolledEvent = function(event) {
    console.log('MoveLogicManager: Handling diceRolled event');
    
    if (!event || !event.data) {
      console.log('MoveLogicManager: Invalid diceRolled event - missing data');
      return;
    }
    
    // Get dice roll result
    const diceResult = event.data.result;
    console.log(`MoveLogicManager: Dice rolled with result: ${diceResult}`);
    
    // Store the dice roll in the window object for global access (for backward compatibility)
    window.lastDiceRoll = diceResult;
    console.log(`MoveLogicManager: Stored dice roll ${diceResult} in window.lastDiceRoll`);
    
    // Dice has been rolled, update available moves based on dice roll
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      // Get current space
      const currentSpaceId = currentPlayer.position;
      const currentSpace = window.GameStateManager.findSpaceById(currentSpaceId);
      
      if (currentSpace) {
        console.log(`MoveLogicManager: Player is on space ${currentSpace.name}`);
        
        // Determine visit type
        const hasVisited = window.GameStateManager.hasPlayerVisitedSpace(
          currentPlayer, currentSpace.name);
        const visitType = hasVisited ? 'subsequent' : 'first';
        
        // Use DiceRollLogic to get outcomes for this roll
        const outcomes = window.DiceRollLogic.handleDiceRoll(
          currentSpace.name, visitType, diceResult);
        
        console.log('MoveLogicManager: Dice roll outcomes:', outcomes);
        
        // If we have a next space outcome, get available moves
        if (outcomes.nextSpace) {
          // Use DiceRollLogic to find spaces from outcome
          const availableMoves = window.DiceRollLogic.findSpacesFromOutcome(
            window.GameStateManager, outcomes.nextSpace);
          
          console.log('MoveLogicManager: Available moves from dice roll:', 
            availableMoves.map(m => m.name));
          
          // Update the game state with the new moves
          window.GameStateManager.dispatchEvent('gameStateChanged', {
            changeType: 'availableMovesUpdated',
            moves: availableMoves,
            player: currentPlayer,
            playerId: currentPlayer.id,
            diceRoll: diceResult,
            diceOutcomes: outcomes
          });
        } else {
          console.log('MoveLogicManager: No next space outcome found for this dice roll');
        }
      }
    }
  };
  
  /**
   * Clear cached moves for a specific player
   * @param {string} playerId - The player ID
   */
  MoveLogicManager.prototype.clearCachedMovesForPlayer = function(playerId) {
    if (!playerId) return;
    
    // Use player position as part of the cache key
    const player = this.getPlayerById(playerId);
    if (player) {
      const cacheKey = `${playerId}-${player.position}`;
      if (this.moveCache.has(cacheKey)) {
        this.moveCache.delete(cacheKey);
        console.log(`MoveLogicManager: Cleared move cache for player ${playerId} at position ${player.position}`);
      }
    }
  };

  /**
   * Get player by ID - Helper method
   * @param {string} playerId - The player ID to find
   * @returns {Object|null} The player object or null if not found
   */
  MoveLogicManager.prototype.getPlayerById = function(playerId) {
    if (!window.GameStateManager || !window.GameStateManager.players) {
      return null;
    }
    
    return window.GameStateManager.players.find(p => p.id === playerId);
  };
  
  /**
   * Clean up resources when the manager is no longer needed
   */
  MoveLogicManager.prototype.cleanup = function() {
    console.log('MoveLogicManager: Cleaning up resources');
    
    // Clear any pending dependency check intervals
    if (this.dependencyCheckInterval) {
      clearInterval(this.dependencyCheckInterval);
      this.dependencyCheckInterval = null;
    }
    
    // Remove all game state event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
      window.GameStateManager.removeEventListener('diceRolled', this.eventHandlers.diceRolled);
    }
    
    // Remove initialization event listeners
    window.removeEventListener('MoveLogicSpecialCasesInitialized', this.eventHandlers.specialCasesInitialized);
    window.removeEventListener('MoveLogicPmDecisionCheckInitialized', this.eventHandlers.pmDecisionCheckInitialized);
    window.removeEventListener('GameStateManagerInitialized', this.eventHandlers.gameStateManagerInitialized);
    
    // Clear cache
    this.moveCache.clear();
    
    console.log('MoveLogicManager: Cleanup completed');
  };
  
  // Create the manager instance
  window.MoveLogicManager = new MoveLogicManager();
  
  // Set global flag to indicate we're fully loaded
  window.MoveLogicManagerInitialized = true;
  
  // Dispatch an event to notify other components that initialization is complete
  try {
    const event = new CustomEvent('MoveLogicManagerInitialized', {
      detail: {
        manager: window.MoveLogicManager
      }
    });
    window.dispatchEvent(event);
    console.log('MoveLogicManager: Fired initialization event');
  } catch (e) {
    console.error('MoveLogicManager: Error dispatching initialization event', e);
  }
})();

console.log('MoveLogicManager.js code execution finished');