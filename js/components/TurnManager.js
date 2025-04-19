// TurnManager.js file is beginning to be used
console.log('TurnManager.js file is beginning to be used');

/**
 * Event name constants for better consistency
 * These events allow components to respond to player turn changes
 */
const TURN_EVENTS = {
  TURN_CHANGED: 'turnChanged',
  ACTIVE_PLAYER_CHANGED: 'activePlayerChanged',
  PLAYER_POSITION_CHANGED: 'playerPositionChanged'
};

/**
 * TurnManager class for handling turn-related operations
 * Manages turn transitions, player state updates, and player snapshots
 */
class TurnManager {
  constructor(gameBoard) {
    console.log('TurnManager: Initializing');
    this.gameBoard = gameBoard;
    
    // Create event target for publishing turn events
    this.eventTarget = new EventTarget();
    
    // Reference to active player visual highlight timer
    this.activePlayerHighlightTimer = null;
    
    console.log('TurnManager: Successfully initialized');
  }  
  /**
   * Handle ending the current turn and transitioning to the next player
   */
  handleEndTurn = () => {
    console.log('TurnManager: Ending current turn');
    const { selectedMove } = this.gameBoard.state;
    const currentPlayer = this.getCurrentPlayer();
    
    // If a move was selected, execute it now when ending the turn
    if (selectedMove && currentPlayer) {
      console.log('TurnManager: Executing selected move:', selectedMove);
      
      // Store the previous position for animation purposes
      const previousPosition = currentPlayer.position;
      
      // Move the player
      window.GameState.movePlayer(currentPlayer.id, selectedMove);
      
      // Dispatch event for player position change
      this.dispatchPlayerPositionChangedEvent(currentPlayer, previousPosition);
    } else {
      console.log('TurnManager: No move selected for execution');
    }
    
    // Move to next player's turn
    this.nextPlayerTurn();
    
    console.log('TurnManager: Turn ended, next player:', window.GameState.currentPlayerIndex);
  }
  
  /**
   * Update to the next player's turn and update all necessary state
   */
  nextPlayerTurn = () => {
    console.log('TurnManager: Transitioning to next player');
    
    // Get current player before transition for event notification
    const previousPlayer = this.getCurrentPlayer();
    const previousPlayerIndex = window.GameState.currentPlayerIndex;
    
    // Move to next player's turn
    window.GameState.nextPlayerTurn();
    
    // Get the new current player
    const newCurrentPlayer = window.GameState.getCurrentPlayer();
    const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
    
    console.log(`TurnManager: Player change from ${previousPlayerIndex} to ${window.GameState.currentPlayerIndex}`);
    
    // Get the space the player landed on
    const newSpace = this.gameBoard.state.spaces.find(s => s.id === newPlayerPosition);
    
    // Create player and space snapshots
    const playerSnapshot = this.createPlayerSnapshot(newCurrentPlayer);
    const spaceSnapshot = newSpace ? { ...newSpace } : null;
    
    // Update state
    this.gameBoard.setState({
      players: [...window.GameState.players],
      currentPlayerIndex: window.GameState.currentPlayerIndex,
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
    this.gameBoard.spaceSelectionManager.updateAvailableMoves();
    
    // Dispatch event for active player change
    this.dispatchActivePlayerChangedEvent(previousPlayer, newCurrentPlayer);
    
    // Enhanced active player highlight
    this.enhanceActivePlayerHighlight();
    
    console.log(`TurnManager: Next player ${newCurrentPlayer.name} is now active on space ${newSpace?.name || 'unknown'}`);
  }
  
  /**
   * Get the current player
   * @returns {Object} Current player object
   */
  getCurrentPlayer = () => {
    console.log('TurnManager: Getting current player');
    const { players, currentPlayerIndex } = this.gameBoard.state;
    const currentPlayer = players[currentPlayerIndex];
    
    if (!currentPlayer) {
      console.warn('TurnManager: No current player found at index', currentPlayerIndex);
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
      resources: { ...player.resources },
      cards: [...(player.cards || [])],
      // Force the color to be the player's color for consistent UI
      color: player.color
    };
  }
  
  /**
   * Dispatch an event when the active player changes
   * @param {Object} previousPlayer - The player who was active before
   * @param {Object} newPlayer - The player who is now active
   */
  dispatchActivePlayerChangedEvent = (previousPlayer, newPlayer) => {
    console.log('TurnManager: Dispatching active player changed event');
    
    // Create a custom event with the player data
    const event = new CustomEvent(TURN_EVENTS.ACTIVE_PLAYER_CHANGED, {
      detail: {
        previousPlayer: previousPlayer ? { ...previousPlayer } : null,
        currentPlayer: newPlayer ? { ...newPlayer } : null,
        currentPlayerIndex: window.GameState.currentPlayerIndex
      },
      bubbles: true
    });
    
    // Dispatch the event from the game board element
    this.eventTarget.dispatchEvent(event);
    
    // Also dispatch a global event for components that aren't direct children
    window.dispatchEvent(new CustomEvent(TURN_EVENTS.ACTIVE_PLAYER_CHANGED, {
      detail: {
        previousPlayer: previousPlayer ? { ...previousPlayer } : null,
        currentPlayer: newPlayer ? { ...newPlayer } : null,
        currentPlayerIndex: window.GameState.currentPlayerIndex
      }
    }));
    
    console.log('TurnManager: Active player changed event dispatched');
  }
  
  /**
   * Dispatch an event when a player's position changes
   * @param {Object} player - The player who moved
   * @param {string} previousPosition - The player's previous position ID
   */
  dispatchPlayerPositionChangedEvent = (player, previousPosition) => {
    console.log('TurnManager: Dispatching player position changed event');
    
    if (!player) {
      console.warn('TurnManager: Cannot dispatch position change for null player');
      return;
    }
    
    // Create a custom event with the player data
    const event = new CustomEvent(TURN_EVENTS.PLAYER_POSITION_CHANGED, {
      detail: {
        player: { ...player },
        previousPosition: previousPosition,
        currentPosition: player.position,
        isCurrentPlayer: window.GameState.currentPlayerIndex === window.GameState.players.indexOf(player)
      },
      bubbles: true
    });
    
    // Dispatch the event
    this.eventTarget.dispatchEvent(event);
    
    // Also dispatch a global event
    window.dispatchEvent(new CustomEvent(TURN_EVENTS.PLAYER_POSITION_CHANGED, {
      detail: {
        player: { ...player },
        previousPosition: previousPosition,
        currentPosition: player.position,
        isCurrentPlayer: window.GameState.currentPlayerIndex === window.GameState.players.indexOf(player)
      }
    }));
    
    console.log(`TurnManager: Player ${player.name} position changed from ${previousPosition} to ${player.position}`);
  }
  
  /**
   * Add an event listener for turn events
   * @param {string} eventName - The name of the event (use TURN_EVENTS constants)
   * @param {Function} callback - The callback function to execute
   */
  addEventListener = (eventName, callback) => {
    console.log(`TurnManager: Adding event listener for ${eventName}`);
    this.eventTarget.addEventListener(eventName, callback);
  }
  
  /**
   * Remove an event listener for turn events
   * @param {string} eventName - The name of the event (use TURN_EVENTS constants)
   * @param {Function} callback - The callback function to remove
   */
  removeEventListener = (eventName, callback) => {
    console.log(`TurnManager: Removing event listener for ${eventName}`);
    this.eventTarget.removeEventListener(eventName, callback);
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
   * Clean up resources when the component is unmounted
   */
  cleanup = () => {
    console.log('TurnManager: Cleaning up resources');
    
    // Clear any active timers
    if (this.activePlayerHighlightTimer) {
      clearTimeout(this.activePlayerHighlightTimer);
      this.activePlayerHighlightTimer = null;
    }
  }
}

// Export TurnManager and events for use in other files
window.TurnManager = TurnManager;
window.TURN_EVENTS = TURN_EVENTS;

console.log('TurnManager.js code execution finished');
