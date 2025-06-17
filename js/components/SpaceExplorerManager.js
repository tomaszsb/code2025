// SpaceExplorerManager.js file is beginning to be used
console.log('SpaceExplorerManager.js file is beginning to be used');

/**
 * SpaceExplorerManager class for handling space explorer panel
 * Manages opening/closing the explorer panel and updating the explored space
 * Integrated with GameStateManager event system
 */
class SpaceExplorerManager {
  constructor(gameBoard) {
    console.log('SpaceExplorerManager: Initializing');
    this.gameBoard = gameBoard;
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this)
    };
    
    // Register event listeners - but only after initialization is complete
    // to prevent recursive calls
    setTimeout(() => {
      this.registerEventListeners();
    }, 0);
    
    console.log('SpaceExplorerManager: Successfully initialized');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners = () => {
    console.log('SpaceExplorerManager: Registering event listeners with GameStateManager');
    
    if (!window.GameStateManager) {
      console.error('SpaceExplorerManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register standard events
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    // Add custom event types if they don't exist yet
    if (!window.GameStateManager.eventHandlers['spaceExplorerToggled']) {
      window.GameStateManager.eventHandlers['spaceExplorerToggled'] = [];
    }
    
    console.log('SpaceExplorerManager: Event listeners registered');
  }
  
  /**
   * Handle playerMoved events from GameStateManager
   * @param {Object} event - The event object
   */
  handlePlayerMovedEvent = (event) => {
    console.log('SpaceExplorerManager: Handling playerMoved event', event.data);
    
    if (event.data && event.data.toSpaceId) {
      // Find the space by ID
      const space = window.GameStateManager.findSpaceById(event.data.toSpaceId);
      if (space) {
        // Update the explored space when player moves
        this.updateExploredSpace(space);
        
        // Open the space explorer to show the new space automatically
        if (this.gameBoard.state.showSpaceExplorer === false) {
          this.handleOpenExplorer();
        }
      }
    }
  }
  
  /**
   * Handle turnChanged events from GameStateManager
   * @param {Object} event - The event object
   */
  handleTurnChangedEvent = (event) => {
    console.log('SpaceExplorerManager: Handling turnChanged event', event.data);
    
    // Update the explorer to show the current player's space when turn changes
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer && currentPlayer.position) {
      const space = window.GameStateManager.findSpaceById(currentPlayer.position);
      if (space) {
        this.updateExploredSpace(space);
      }
    }
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The event object
   */
  handleGameStateChangedEvent = (event) => {
    console.log('SpaceExplorerManager: Handling gameStateChanged event', event.data);
    
    // Handle relevant game state changes
    if (event.data && event.data.changeType === 'newGame') {
      console.log('SpaceExplorerManager: newGame event received - keeping explorer visible during gameplay');
      // BUGFIX: Don't hide space explorer during normal gameplay
      // The original code was hiding the explorer panel whenever newGame events fired
      // which caused panels to briefly appear then disappear during player movement
      
      // Ensure explorer stays visible and shows current player's space
      if (!this.gameBoard.state.showSpaceExplorer) {
        this.handleOpenExplorer();
      }
      
      // Update to current player's space if needed
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      if (currentPlayer && currentPlayer.position) {
        const currentSpace = window.GameStateManager.findSpaceById(currentPlayer.position);
        if (currentSpace) {
          this.updateExploredSpace(currentSpace);
        }
      }
    }
  }
  
  /**
   * Handle closing the space explorer panel
   */
  handleCloseExplorer = () => {
    // Update state through gameBoard's setState
    this.gameBoard.setState({
      showSpaceExplorer: false
    });
    console.log('SpaceExplorerManager: Space explorer closed');
    
    // Dispatch event using GameStateManager
    if (window.GameStateManager) {
      window.GameStateManager.dispatchEvent('spaceExplorerToggled', {
        visible: false,
        spaceName: ''
      });
    }
    
    // Log space explorer closing
    console.log('SpaceExplorerManager: Closing space explorer');
  }
  
  /**
   * Handle opening the space explorer panel
   */
  handleOpenExplorer = () => {
    // Update state through gameBoard's setState
    this.gameBoard.setState({
      showSpaceExplorer: true
    });
    console.log('SpaceExplorerManager: Space explorer opened');
    
    // Get current player and space information
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    const currentSpaceId = currentPlayer ? currentPlayer.position : null;
    const currentSpace = currentSpaceId ? window.GameStateManager.findSpaceById(currentSpaceId) : null;
    const spaceName = currentSpace ? currentSpace.name : '';
    
    // Dispatch event using GameStateManager
    if (window.GameStateManager) {
      window.GameStateManager.dispatchEvent('spaceExplorerToggled', {
        visible: true,
        spaceName: spaceName
      });
    }
    
    // Log space explorer opening
    console.log(`SpaceExplorerManager: Opening space explorer for space: ${spaceName}`);
  }
  
  /**
   * Update the currently explored space
   * @param {Object} space - Space object to explore
   */
  updateExploredSpace = (space) => {
    // Update state through gameBoard's setState
    this.gameBoard.setState({
      exploredSpace: space
    });
    console.log('SpaceExplorerManager: Updated explored space to:', space ? space.space_name : 'none');
    
    // Dispatch event using GameStateManager if available
    if (window.GameStateManager && space) {
      window.GameStateManager.dispatchEvent('spaceExplorerToggled', {
        visible: this.gameBoard.state.showSpaceExplorer,
        spaceName: space.space_name
      });
    }
    
    // Log space explorer update
    console.log(`SpaceExplorerManager: Updating space explorer - visible: ${this.gameBoard.state.showSpaceExplorer}, space: ${space ? space.space_name : 'none'}`);
  }
  
  /**
   * Clean up resources when the component is unmounted
   */
  cleanup = () => {
    console.log('SpaceExplorerManager: Cleaning up resources');
    
    // Remove all event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    }
    
    console.log('SpaceExplorerManager: Cleanup completed');
  }
}

// Export SpaceExplorerManager for use in other files
window.SpaceExplorerManager = SpaceExplorerManager;

console.log('SpaceExplorerManager.js code execution finished');
