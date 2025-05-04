// TurnManager.js file is beginning to be used
console.log('TurnManager.js file is beginning to be used');

/**
 * TurnManager class for handling turn-related operations
 * Manages turn transitions, player state updates, and player snapshots
 * Integrated with GameStateManager event system
 */
class TurnManager {
  constructor(gameBoard) {
    console.log('TurnManager: Initializing');
    this.gameBoard = gameBoard;
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this)
    };
    
    // Reference to active player visual highlight timer
    this.activePlayerHighlightTimer = null;
    
    // Register event listeners - but only after initialization is complete
    // to prevent recursive calls
    setTimeout(() => {
      this.registerEventListeners();
    }, 0);
    
    console.log('TurnManager: Successfully initialized');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners = () => {
    console.log('TurnManager: Registering event listeners with GameStateManager');
    
    if (!window.GameStateManager) {
      console.error('TurnManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register standard events
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    // Add custom event types if they don't exist yet
    if (!window.GameStateManager.eventHandlers['activePlayerChanged']) {
      window.GameStateManager.eventHandlers['activePlayerChanged'] = [];
    }
    
    console.log('TurnManager: Event listeners registered');
  }
  
  /**
   * Handle playerMoved events from GameStateManager
   * @param {Object} event - The event object
   */
  handlePlayerMovedEvent = (event) => {
    console.log('TurnManager: Handling playerMoved event', event.data);
    
    // Update active player highlighting if this is the current player
    if (event.data && event.data.player) {
      const isCurrentPlayer = this.isActivePlayer(event.data.playerId);
      
      if (isCurrentPlayer) {
        // Update enhanced highlighting for the current player
        this.enhanceActivePlayerHighlight();
      }
    }
  }
  
  /**
   * Handle turnChanged events from GameStateManager
   * @param {Object} event - The event object
   */
  handleTurnChangedEvent = (event) => {
    console.log('TurnManager: Handling turnChanged event', event.data);
    
    // Update enhanced highlighting for the new active player
    this.enhanceActivePlayerHighlight();
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The event object
   */
  handleGameStateChangedEvent = (event) => {
    console.log('TurnManager: Handling gameStateChanged event', event.data);
    
    // Handle relevant game state changes
    if (event.data && event.data.changeType === 'newGame') {
      // Reset any turn-specific state
      if (this.activePlayerHighlightTimer) {
        clearTimeout(this.activePlayerHighlightTimer);
        this.activePlayerHighlightTimer = null;
      }
    }
  }
  
  /**
   * Handle ending the current turn and transitioning to the next player
   */
  handleEndTurn = () => {
    console.log('TurnManager: Ending current turn');
    const { selectedMove, availableMoves, hasSelectedMove } = this.gameBoard.state;
    const currentPlayer = this.getCurrentPlayer();
    
    // If a move was selected and the hasSelectedMove flag is true, execute it now when ending the turn
    if (selectedMove && hasSelectedMove && currentPlayer) {
      console.log('TurnManager: Executing selected move:', selectedMove);
      
      // Move the player - this will trigger a playerMoved event via GameStateManager
      window.GameStateManager.movePlayer(currentPlayer.id, selectedMove);
    } else {
      // If there are no available moves, that's okay - the player might have just drawn cards
      // or performed another action that doesn't involve movement
      if (availableMoves && availableMoves.length === 0) {
        console.log('TurnManager: No available moves to execute, turn can end without movement');
      }
      // If there are available moves but none selected, inform the player they need to select a move
      else if (availableMoves && availableMoves.length > 0) {
        console.log('TurnManager: Moves available but none selected. Player must select a move before ending turn');
      }
      else {
        console.log('TurnManager: No move selected for execution');
      }
    }
    
    // Move to next player's turn
    this.nextPlayerTurn();
    
    console.log('TurnManager: Turn ended, next player:', window.GameStateManager.currentPlayerIndex);
  }
  
  /**
   * Update to the next player's turn and update all necessary state
   */
  nextPlayerTurn = () => {
    console.log('TurnManager: Transitioning to next player');
    
    // Get current player before transition for event notification
    const previousPlayer = this.getCurrentPlayer();
    const previousPlayerIndex = window.GameStateManager.currentPlayerIndex;
    
    // Move to next player's turn - this will trigger a turnChanged event via GameStateManager
    window.GameStateManager.nextPlayerTurn();
    
    // Get the new current player
    const newCurrentPlayer = window.GameStateManager.getCurrentPlayer();
    const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
    
    console.log(`TurnManager: Player change from ${previousPlayerIndex} to ${window.GameStateManager.currentPlayerIndex}`);
    
    // Get the space the player landed on
    const newSpace = this.gameBoard.state.spaces.find(s => s.id === newPlayerPosition);
    
    // Create player and space snapshots
    const playerSnapshot = this.createPlayerSnapshot(newCurrentPlayer);
    const spaceSnapshot = newSpace ? { ...newSpace } : null;
    
    // Update state
    this.gameBoard.setState({
      players: [...window.GameStateManager.players],
      currentPlayerIndex: window.GameStateManager.currentPlayerIndex,
      selectedSpace: newPlayerPosition, // Always set to new player's position
      selectedMove: null,               // Clear the selected move
      hasSelectedMove: false,           // Reset flag for the next player's turn
      showDiceRoll: false,              // Hide dice roll component
      diceRollSpace: null,              // Clear dice roll space info
      hasRolledDice: false,             // Reset dice roll status
      diceOutcomes: null,               // Reset dice outcomes
      lastDiceRoll: null,               // Reset last dice roll
      currentPlayerOnLanding: playerSnapshot, // Store snapshot of player status
      currentSpaceOnLanding: spaceSnapshot,   // Store snapshot of space
      exploredSpace: newSpace          // Set explored space to new player's space
    });
    
    // Update available moves for new player
    if (this.gameBoard.spaceSelectionManager) {
      this.gameBoard.spaceSelectionManager.updateAvailableMoves();
    }
    
    // Dispatch custom active player changed event through GameStateManager
    if (window.GameStateManager && typeof window.GameStateManager.dispatchEvent === 'function') {
      window.GameStateManager.dispatchEvent('activePlayerChanged', {
        previousPlayer: previousPlayer ? { ...previousPlayer } : null,
        currentPlayer: newCurrentPlayer ? { ...newCurrentPlayer } : null,
        currentPlayerIndex: window.GameStateManager.currentPlayerIndex
      });
    }
    
    // Enhanced active player highlight
    this.enhanceActivePlayerHighlight();
    
    console.log(`TurnManager: Next player ${newCurrentPlayer ? newCurrentPlayer.name : 'unknown'} is now active on space ${newSpace?.name || 'unknown'}`);
  }
  
  /**
   * Get the current player
   * @returns {Object} Current player object
   */
  getCurrentPlayer = () => {
    // Use GameStateManager directly
    if (!window.GameStateManager) {
      console.warn('TurnManager: No GameStateManager available');
      
      // Fallback to using gameBoard state
      const { players, currentPlayerIndex } = this.gameBoard.state;
      const currentPlayer = players[currentPlayerIndex];
      
      if (!currentPlayer) {
        console.warn('TurnManager: No current player found in gameBoard state');
        return null;
      }
      
      return currentPlayer;
    }
    
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    
    if (!currentPlayer) {
      console.warn('TurnManager: No current player found in GameStateManager');
      return null;
    }
    
    return currentPlayer;
  }
  
  /**
   * Create a deep copy snapshot of a player's state
   * @param {Object} player - Player object to snapshot
   * @returns {Object} Player snapshot with deep copied properties
   */
  createPlayerSnapshot = (player) => {
    console.log('TurnManager: Creating player snapshot');
    
    if (!player) {
      console.warn('TurnManager: Cannot create snapshot of null player');
      return null;
    }
    
    return {
      ...player,
      resources: player.resources ? { ...player.resources } : {},
      cards: player.cards ? [...player.cards] : [],
      // Force the color to be the player's color for consistent UI
      color: player.color
    };
  }
  
  /**
   * Check if a specific player is the current active player
   * @param {Object|string} playerOrId - Player object or player ID to check
   * @returns {boolean} True if this player is the current active player
   */
  isActivePlayer = (playerOrId) => {
    if (!playerOrId) return false;
    
    const playerId = typeof playerOrId === 'string' ? playerOrId : playerOrId.id;
    const currentPlayer = this.getCurrentPlayer();
    
    return currentPlayer && currentPlayer.id === playerId;
  }
  
  /**
   * Enhance the visual highlighting of the active player
   * Uses DOM manipulation to apply temporary visual effects
   */
  enhanceActivePlayerHighlight = () => {
    console.log('TurnManager: Enhancing active player highlight');
    
    // Clear any existing highlight timer
    if (this.activePlayerHighlightTimer) {
      clearTimeout(this.activePlayerHighlightTimer);
      this.activePlayerHighlightTimer = null;
    }
    
    // Get the current player
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.warn('TurnManager: No current player to highlight');
      return;
    }
    
    // Use setTimeout to ensure React has finished rendering
    this.activePlayerHighlightTimer = setTimeout(() => {
      try {
        // Find the token for the current player
        const currentPlayerTokens = document.querySelectorAll('.player-token.current-player');
        
        if (currentPlayerTokens.length === 0) {
          console.warn('TurnManager: No player token found with current-player class');
          return;
        }
        
        // Apply enhanced animation class to each token
        currentPlayerTokens.forEach(token => {
          // Add a class that triggers attention animation
          token.classList.add('active-player-enhanced');
          
          // Log success
          console.log('TurnManager: Applied enhanced highlight to active player token');
        });
        
        // Also update player info section if it exists
        const playerInfos = document.querySelectorAll('.player-info');
        playerInfos.forEach(info => {
          if (info.classList.contains('current')) {
            info.classList.add('active-player-info-enhanced');
          }
        });
      } catch (error) {
        console.error('TurnManager: Error applying enhanced player highlight:', error);
      }
    }, 100); // Short delay to ensure DOM is updated
  }
  
  /**
   * Add an event listener for custom turn events
   * For backward compatibility - forwards to GameStateManager
   * @param {string} eventName - The name of the event
   * @param {Function} callback - The callback function to execute
   * @returns {Function} The event handler that was added
   */
  addEventListener = (eventName, callback) => {
    console.log(`TurnManager: Adding event listener for ${eventName} via GameStateManager`);
    
    if (!window.GameStateManager) {
      console.error('TurnManager: Cannot add event listener, GameStateManager not available');
      return null;
    }
    
    // Register with GameStateManager
    return window.GameStateManager.addEventListener(eventName, callback);
  }
  
  /**
   * Remove an event listener for custom turn events
   * For backward compatibility - forwards to GameStateManager
   * @param {string} eventName - The name of the event
   * @param {Function} callback - The callback function to remove
   */
  removeEventListener = (eventName, callback) => {
    console.log(`TurnManager: Removing event listener for ${eventName} via GameStateManager`);
    
    if (!window.GameStateManager) {
      console.error('TurnManager: Cannot remove event listener, GameStateManager not available');
      return;
    }
    
    // Unregister with GameStateManager
    window.GameStateManager.removeEventListener(eventName, callback);
  }
  
  /**
   * Clean up resources when the component is unmounted
   */
  cleanup = () => {
    console.log('TurnManager: Cleaning up resources');
    
    // Clear any active timers
    if (this.activePlayerHighlightTimer) {
      clearTimeout(this.activePlayerHighlightTimer);
      this.activePlayerHighlightTimer = null;
    }
    
    // Remove all event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    }
    
    console.log('TurnManager: Cleanup completed');
  }
}

// Export TurnManager for use in other files
window.TurnManager = TurnManager;

// Export event constants for backward compatibility
window.TURN_EVENTS = {
  TURN_CHANGED: 'turnChanged',
  ACTIVE_PLAYER_CHANGED: 'activePlayerChanged',
  PLAYER_POSITION_CHANGED: 'playerPositionChanged'
};

console.log('TurnManager.js code execution finished');
