// MoveLogicManager.js - Main manager class for game move operations
console.log('MoveLogicManager.js file is being processed');

import { MoveLogicUIUpdates } from './MoveLogicUIUpdates.js';
import { MoveLogicBackwardCompatibility } from './MoveLogicBackwardCompatibility.js';

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
 */
class MoveLogicManager extends MoveLogicUIUpdates {
  /**
   * Initialize the Move Logic Manager
   */
  constructor() {
    super();
    console.log('MoveLogicManager: Constructor initialized');
    
    // State tracking
    this.initialized = false;
    this.moveCache = new Map(); // Cache for frequently accessed moves
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      spaceChanged: this.handleSpaceChangedEvent.bind(this),
      diceRolled: this.handleDiceRolledEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    this.initialized = true;
    console.log('MoveLogicManager: Constructor completed');

    // Dispatch event for initial player's turn and add YOUR TURN indicator
    // This ensures the "YOUR TURN" message shows up on the first turn
    setTimeout(() => {
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
    }, 500); // Short delay to ensure React has initialized properly
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners() {
    console.log('MoveLogicManager: Registering event listeners');
    
    if (!window.GameStateManager) {
      console.error('MoveLogicManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register for game state events
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
    window.GameStateManager.addEventListener('diceRolled', this.eventHandlers.diceRolled);
    
    console.log('MoveLogicManager: Event listeners registered successfully');
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The gameStateChanged event object
   */
  handleGameStateChangedEvent(event) {
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
  }
  
  /**
   * Handle turnChanged events from GameStateManager
   * @param {Object} event - The turnChanged event object
   */
  handleTurnChangedEvent(event) {
    console.log('MoveLogicManager: Handling turnChanged event');
    
    // We may need to update available moves when turn changes
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      // Clear specifically the cached moves for this player
      this.clearCachedMovesForPlayer(currentPlayer.id);
      
      // Update the current player token display to show "YOUR TURN"
      this.updateCurrentPlayerTokenDisplay(currentPlayer);
    }
  }
  
  /**
   * Handle spaceChanged events from GameStateManager
   * @param {Object} event - The spaceChanged event object
   */
  handleSpaceChangedEvent(event) {
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
  }
  
  /**
   * Handle diceRolled events from GameStateManager
   * @param {Object} event - The diceRolled event object
   */
  handleDiceRolledEvent(event) {
    console.log('MoveLogicManager: Handling diceRolled event');
    
    if (!event || !event.data) {
      return;
    }
    
    // Dice has been rolled, we may need to update available moves based on dice roll
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      // Clear cached moves to force recalculation with dice roll result
      this.clearCachedMovesForPlayer(currentPlayer.id);
    }
  }
  
  /**
   * Clear cached moves for a specific player
   * @param {string} playerId - The player ID
   */
  clearCachedMovesForPlayer(playerId) {
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
  }

  /**
   * Get player by ID - Helper method
   * @param {string} playerId - The player ID to find
   * @returns {Object|null} The player object or null if not found
   */
  getPlayerById(playerId) {
    if (!window.GameStateManager || !window.GameStateManager.players) {
      return null;
    }
    
    return window.GameStateManager.players.find(p => p.id === playerId);
  }
  
  /**
   * Clean up resources when the manager is no longer needed
   */
  cleanup() {
    console.log('MoveLogicManager: Cleaning up resources');
    
    // Remove all event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
      window.GameStateManager.removeEventListener('diceRolled', this.eventHandlers.diceRolled);
    }
    
    // Clear cache
    this.moveCache.clear();
    
    console.log('MoveLogicManager: Cleanup completed');
  }
}

export { MoveLogicManager };
