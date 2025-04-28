// SpaceInfoManager.js file is beginning to be used
console.log('SpaceInfoManager.js file is beginning to be used');

/**
 * SpaceInfoManager - Manager class for space information operations
 * 
 * This component manages space information display, interactions, and styling.
 * It follows the manager pattern with proper initialization and cleanup.
 * 
 * Key features:
 * - Uses GameStateManager events for communication
 * - Handles space information display and interaction
 * - Manages button states for spaces
 * - Coordinates with CSS classes instead of using inline styles
 */
class SpaceInfoManager {
  /**
   * Initialize the Space Info Manager
   */
  constructor() {
    console.log('SpaceInfoManager: Constructor initialized');
    
    // Configuration
    this.phaseColors = {
      'SETUP': 'space-phase-setup',
      'OWNER': 'space-phase-owner',
      'FUNDING': 'space-phase-funding',
      'DESIGN': 'space-phase-design',
      'REGULATORY': 'space-phase-regulatory',
      'CONSTRUCTION': 'space-phase-construction',
      'END': 'space-phase-end'
    };
    
    // State tracking
    this.usedButtons = new Map(); // Map of playerID -> Set of used button IDs
    this.initialized = false;
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      spaceChanged: this.handleSpaceChangedEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    this.initialized = true;
    console.log('SpaceInfoManager: Constructor completed');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners() {
    console.log('SpaceInfoManager: Registering event listeners');
    
    if (!window.GameStateManager) {
      console.error('SpaceInfoManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register for game state events
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
    
    console.log('SpaceInfoManager: Event listeners registered successfully');
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The gameStateChanged event object
   */
  handleGameStateChangedEvent(event) {
    console.log('SpaceInfoManager: Handling gameStateChanged event');
    
    if (!event || !event.data) {
      return;
    }
    
    // Handle relevant game state changes
    if (event.data.changeType === 'newGame') {
      // Reset used buttons for a new game
      this.usedButtons.clear();
      console.log('SpaceInfoManager: Cleared used buttons for new game');
    }
  }
  
  /**
   * Handle turnChanged events from GameStateManager
   * @param {Object} event - The turnChanged event object
   */
  handleTurnChangedEvent(event) {
    console.log('SpaceInfoManager: Handling turnChanged event');
    
    // Reset space-specific button state when turn changes
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      this.resetButtonsForPlayer(currentPlayer.id);
    }
  }
  
  /**
   * Handle spaceChanged events from GameStateManager
   * @param {Object} event - The spaceChanged event object
   */
  handleSpaceChangedEvent(event) {
    console.log('SpaceInfoManager: Handling spaceChanged event');
    
    // Space has changed, we may need to reset buttons for the specific space
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer && event.data && event.data.spaceId) {
      this.resetButtonsForSpace(currentPlayer.id, event.data.spaceId);
    }
  }
  
  /**
   * Reset buttons for a specific player
   * @param {string} playerId - The player ID
   */
  resetButtonsForPlayer(playerId) {
    if (!playerId) return;
    
    console.log(`SpaceInfoManager: Resetting buttons for player ${playerId}`);
    
    // Remove player from used buttons tracking
    this.usedButtons.delete(playerId);
  }
  
  /**
   * Reset buttons for a specific space and player
   * @param {string} playerId - The player ID
   * @param {string} spaceId - The space ID
   */
  resetButtonsForSpace(playerId, spaceId) {
    if (!playerId || !spaceId) return;
    
    console.log(`SpaceInfoManager: Resetting buttons for player ${playerId} and space ${spaceId}`);
    
    // Get the set of used buttons for this player
    const playerButtons = this.usedButtons.get(playerId) || new Set();
    
    // Remove all buttons related to this space
    const buttonsToRemove = [];
    playerButtons.forEach(buttonId => {
      if (buttonId.includes(`-${spaceId}-`)) {
        buttonsToRemove.push(buttonId);
      }
    });
    
    // Remove the buttons
    buttonsToRemove.forEach(buttonId => {
      playerButtons.delete(buttonId);
    });
    
    // Update the map
    this.usedButtons.set(playerId, playerButtons);
    
    console.log(`SpaceInfoManager: Removed ${buttonsToRemove.length} buttons for space ${spaceId}`);
  }
  
  /**
   * Check if a button has been used by a player
   * @param {string} playerId - The player ID
   * @param {string} buttonId - The button ID
   * @returns {boolean} True if the button has been used
   */
  isButtonUsed(playerId, buttonId) {
    if (!playerId || !buttonId) return false;
    
    const playerButtons = this.usedButtons.get(playerId);
    return playerButtons ? playerButtons.has(buttonId) : false;
  }
  
  /**
   * Mark a button as used by a player
   * @param {string} playerId - The player ID
   * @param {string} buttonId - The button ID
   */
  markButtonUsed(playerId, buttonId) {
    if (!playerId || !buttonId) return;
    
    console.log(`SpaceInfoManager: Marking button ${buttonId} as used by player ${playerId}`);
    
    // Get or create the set of used buttons for this player
    const playerButtons = this.usedButtons.get(playerId) || new Set();
    
    // Add the button ID
    playerButtons.add(buttonId);
    
    // Update the map
    this.usedButtons.set(playerId, playerButtons);
  }
  
  /**
   * Get CSS class for a space phase
   * @param {string} type - The space type/phase
   * @returns {string} The CSS class for the space phase
   */
  getPhaseClass(type) {
    if (!type) return 'space-phase-default';
    
    const normalizedType = type.toUpperCase();
    return this.phaseColors[normalizedType] || 'space-phase-default';
  }
  
  /**
   * Draw cards for a player
   * @param {string} playerId - The player ID
   * @param {string} cardType - The card type
   * @param {number} amount - The number of cards to draw
   * @returns {Array} The drawn cards
   */
  drawCards(playerId, cardType, amount) {
    if (!playerId || !cardType) return [];
    
    console.log(`SpaceInfoManager: Drawing ${amount} ${cardType} cards for player ${playerId}`);
    
    const drawnCards = [];
    
    // Use GameStateManager to draw cards
    for (let i = 0; i < amount; i++) {
      const card = window.GameStateManager.drawCard(playerId, cardType);
      if (card) {
        drawnCards.push(card);
      }
    }
    
    return drawnCards;
  }
  
  /**
   * Move player to a specific space
   * @param {string} playerId - The player ID
   * @param {string} spaceId - The space ID
   */
  moveToSpace(playerId, spaceId) {
    if (!playerId || !spaceId) return;
    
    console.log(`SpaceInfoManager: Moving player ${playerId} to space ${spaceId}`);
    
    // Use GameStateManager to move the player
    window.GameStateManager.movePlayer(playerId, spaceId);
  }
  
  /**
   * Clean up resources when the manager is no longer needed
   */
  cleanup() {
    console.log('SpaceInfoManager: Cleaning up resources');
    
    // Remove all event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
    }
    
    // Clear state
    this.usedButtons.clear();
    
    console.log('SpaceInfoManager: Cleanup completed');
  }
}

// Create a BackwardCompatibilityLayer to maintain existing functionality
class SpaceInfoBackwardCompatibility {
  constructor(manager) {
    console.log('SpaceInfoBackwardCompatibility: Initializing compatibility layer');
    this.manager = manager;
    
    // Add global event handler for resetSpaceInfoButtons
    window.resetSpaceInfoButtons = () => {
      console.log('SpaceInfoBackwardCompatibility: Received resetSpaceInfoButtons global call');
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      if (currentPlayer) {
        this.manager.resetButtonsForPlayer(currentPlayer.id);
      }
      
      // Legacy event for backward compatibility
      const resetEvent = new Event('resetSpaceInfoButtons');
      window.dispatchEvent(resetEvent);
    };
    
    // Add global utility function for logging negotiate button usage
    window.logSpaceNegotiateUsage = (spaceName) => {
      console.log(`SpaceInfoBackwardCompatibility: Negotiate button shown for space: ${spaceName}`);
    };
    
    console.log('SpaceInfoBackwardCompatibility: Compatibility layer initialized');
  }
}

// Initialize manager and compatibility layer
(function() {
  console.log('SpaceInfoManager: Initializing manager...');
  
  // Create manager instance
  const spaceInfoManager = new SpaceInfoManager();
  
  // Create compatibility layer
  const compatibilityLayer = new SpaceInfoBackwardCompatibility(spaceInfoManager);
  
  // Store manager reference on window for direct access if needed
  window.SpaceInfoManager = spaceInfoManager;
  
  console.log('SpaceInfoManager: Manager initialized and compatibility layer set up');
})();

console.log('SpaceInfoManager.js code execution finished');