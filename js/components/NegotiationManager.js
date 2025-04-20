// NegotiationManager.js file is beginning to be used
console.log('NegotiationManager.js file is beginning to be used');

// NegotiationManager class for handling negotiation mechanics
// Refactored to use GameStateManager event system
class NegotiationManager {
  constructor(gameBoard) {
    console.log('NegotiationManager: Initializing with event system integration');
    this.gameBoard = gameBoard;
    
    // Store event handler references for cleanup
    this.eventHandlers = {
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      negotiationStarted: this.handleNegotiationStartedEvent.bind(this),
      negotiationCompleted: this.handleNegotiationCompletedEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    console.log('NegotiationManager: Successfully initialized with event system');
  }
  
  // Register event listeners with GameStateManager
  registerEventListeners() {
    console.log('NegotiationManager: Registering event listeners');
    
    // Add event handlers for negotiation-related events
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    // Add custom events for negotiation if not already in GameStateManager
    if (!window.GameStateManager.eventHandlers['negotiationStarted']) {
      window.GameStateManager.eventHandlers['negotiationStarted'] = [];
    }
    window.GameStateManager.addEventListener('negotiationStarted', this.eventHandlers.negotiationStarted);
    
    if (!window.GameStateManager.eventHandlers['negotiationCompleted']) {
      window.GameStateManager.eventHandlers['negotiationCompleted'] = [];
    }
    window.GameStateManager.addEventListener('negotiationCompleted', this.eventHandlers.negotiationCompleted);
    
    console.log('NegotiationManager: Event listeners registered');
  }
  
  // Check if negotiation is allowed for the current space
  isNegotiationAllowed = () => {
    console.log('NegotiationManager: Checking if negotiation is allowed');
    
    // Use GameStateManager to get current player instead of TurnManager
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('NegotiationManager: No current player found, negotiation not allowed');
      return false;
    }
    
    // Get the current space using GameStateManager
    const currentSpaceId = currentPlayer.position;
    const currentSpace = window.GameStateManager.findSpaceById(currentSpaceId);
    if (!currentSpace) {
      console.log('NegotiationManager: Current space not found, negotiation not allowed');
      return false;
    }
    
    // Check if negotiation is allowed for this space
    // Use both rawNegotiate (directly from CSV) and Negotiate fields for backward compatibility
    // These should be synchronized in data processing, but we check both to ensure reliability
    const negotiationAllowed = currentSpace.rawNegotiate === "YES" || currentSpace.Negotiate === "YES";
    console.log(`NegotiationManager: Negotiation allowed for space ${currentSpace.name}: ${negotiationAllowed} (rawNegotiate=${currentSpace.rawNegotiate}, Negotiate=${currentSpace.Negotiate})`);
    return negotiationAllowed;
  }
  
  // Handle the negotiation action
  handleNegotiate = () => {
    console.log('NegotiationManager: Negotiate button clicked');
    
    // Check if negotiation is allowed first
    if (!this.isNegotiationAllowed()) {
      console.log('NegotiationManager: Negotiation not allowed for current space');
      return;
    }
    
    // Use GameStateManager to get current player instead of TurnManager
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('NegotiationManager: No current player found');
      return;
    }
    
    // Get the current space using GameStateManager
    const currentSpace = window.GameStateManager.findSpaceById(currentPlayer.position);
    if (!currentSpace) {
      console.log('NegotiationManager: Current space not found');
      return;
    }
    
    // Dispatch negotiationStarted event
    window.GameStateManager.dispatchEvent('negotiationStarted', {
      player: currentPlayer,
      space: currentSpace
    });
    
    // Get the player's original resources from when they landed on the space
    const originalPlayerSnapshot = this.gameBoard.state.currentPlayerOnLanding;
    
    if (!originalPlayerSnapshot) {
      console.log('NegotiationManager: No player snapshot found, cannot reset resources');
      return;
    }
    
    console.log('NegotiationManager: Found player snapshot from landing:', originalPlayerSnapshot);
    
    // Calculate time penalty to add
    let timeToAdd = 0;
    if (currentSpace.Time && currentSpace.Time.trim() !== '') {
      timeToAdd = parseInt(currentSpace.Time, 10) || 0;
      if (timeToAdd > 0) {
        console.log(`NegotiationManager: Adding ${timeToAdd} days to player time from negotiate`);
      }
    }
    
    // Update GameState through GameStateManager instead of direct manipulation
    this.updatePlayerResources(currentPlayer.id, originalPlayerSnapshot, timeToAdd);
    
    // Move to next player's turn (keep player on same space) using GameStateManager
    window.GameStateManager.nextPlayerTurn();
    
    // Get the new current player
    const newCurrentPlayer = window.GameStateManager.getCurrentPlayer();
    const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
    
    // Get the space the player landed on using GameStateManager
    const newSpace = window.GameStateManager.findSpaceById(newPlayerPosition);
    
    // Create a deep copy of the player's status for the static view
    const playerSnapshot = newCurrentPlayer ? this.gameBoard.turnManager.createPlayerSnapshot(newCurrentPlayer) : null;
    
    // Create a deep copy of the space info for the static view
    const spaceSnapshot = newSpace ? { ...newSpace } : null;
    
    // Dispatch negotiationCompleted event
    window.GameStateManager.dispatchEvent('negotiationCompleted', {
      previousPlayer: currentPlayer,
      currentPlayer: newCurrentPlayer,
      space: currentSpace,
      newSpace: newSpace,
      timeAdded: timeToAdd
    });
    
    // Update gameBoard state for backward compatibility
    this.updateGameBoardState(newCurrentPlayer, newPlayerPosition, newSpace, playerSnapshot, spaceSnapshot);
    
    console.log('NegotiationManager: Turn ended via negotiate, next player:', window.GameStateManager.currentPlayerIndex, 'on space:', newPlayerPosition);
    console.log('NegotiationManager: Negotiation action completed successfully');
  }
  
  // Update player resources during negotiation
  updatePlayerResources(playerId, originalPlayerSnapshot, timeToAdd) {
    console.log('NegotiationManager: Updating player resources');
    
    const playerIndex = window.GameStateManager.players.findIndex(p => p.id === playerId);
    if (playerIndex >= 0) {
      // Get the current time value for reference
      const currentTime = window.GameStateManager.players[playerIndex].resources.time;
      
      // Reset resources to original values from when player landed on space
      window.GameStateManager.players[playerIndex].resources = {
        ...originalPlayerSnapshot.resources,
        // Keep only the time penalty from this turn
        time: originalPlayerSnapshot.resources.time + timeToAdd
      };
      
      // Reset cards to original state (remove any cards drawn during this turn)
      window.GameStateManager.players[playerIndex].cards = [...originalPlayerSnapshot.cards];
      
      console.log('NegotiationManager: Reset player resources and cards to original values');
      console.log(`NegotiationManager: Original money: ${originalPlayerSnapshot.resources.money}, Current money: ${window.GameStateManager.players[playerIndex].resources.money}`);
      console.log(`NegotiationManager: Original time: ${originalPlayerSnapshot.resources.time}, Current time: ${window.GameStateManager.players[playerIndex].resources.time}`);
      
      // Save state through GameStateManager
      window.GameStateManager.saveState();
    }
  }
  
  // Update game board state after negotiation
  updateGameBoardState(newCurrentPlayer, newPlayerPosition, newSpace, playerSnapshot, spaceSnapshot) {
    console.log('NegotiationManager: Updating game board state');
    
    this.gameBoard.setState({
      players: [...window.GameStateManager.players],
      currentPlayerIndex: window.GameStateManager.currentPlayerIndex,
      selectedSpace: newPlayerPosition, // Set to new player's position
      selectedMove: null,               // Clear the selected move
      hasSelectedMove: false,           // Reset flag for the next player's turn
      showDiceRoll: false,              // Hide dice roll component
      diceRollSpace: null,              // Clear dice roll space info
      hasRolledDice: false,             // Reset dice roll status
      diceOutcomes: null,               // Reset dice outcomes
      lastDiceRoll: null,               // Reset last dice roll
      currentPlayerOnLanding: playerSnapshot, // Store snapshot of player status
      currentSpaceOnLanding: spaceSnapshot,   // Store snapshot of space
      exploredSpace: newSpace,          // Update space explorer to show the current player's space
      usedButtons: []                   // Reset usedButtons to enable all buttons again
    });
    
    // Also trigger a reset on any SpaceInfo components by dispatching a custom event
    // This is for backward compatibility - future components should use the event system
    const resetEvent = new CustomEvent('resetSpaceInfoButtons');
    window.dispatchEvent(resetEvent);
    console.log('NegotiationManager: Dispatched resetSpaceInfoButtons event to reset all button states');
    
    // Update available moves for new player
    this.gameBoard.spaceSelectionManager.updateAvailableMoves();
  }
  
  // Get tooltip text for the negotiate button
  getNegotiateButtonTooltip = () => {
    console.log('NegotiationManager: Getting negotiate button tooltip');
    if (!this.isNegotiationAllowed()) {
      return "Negotiation is not allowed on this space";
    }
    return "End your turn, stay on this space, and only take the time penalty";
  }
  
  // Event handler for playerMoved event
  handlePlayerMovedEvent(event) {
    console.log('NegotiationManager: Player moved event received', event.data);
    
    // Currently no specific action needed for player moved events
    // But the handler is included for future extensibility
  }
  
  // Event handler for turnChanged event
  handleTurnChangedEvent(event) {
    console.log('NegotiationManager: Turn changed event received', event.data);
    
    // Currently no specific action needed for turn changed events
    // But the handler is included for future extensibility
  }
  
  // Event handler for gameStateChanged event
  handleGameStateChangedEvent(event) {
    console.log('NegotiationManager: Game state changed event received', event.data);
    
    // Only process relevant change types
    if (event.data && event.data.changeType) {
      switch (event.data.changeType) {
        case 'newGame':
          // Reset any negotiation-related state for new game
          console.log('NegotiationManager: Resetting state for new game');
          break;
          
        // Add other change types as needed
      }
    }
  }
  
  // Event handler for negotiationStarted event
  handleNegotiationStartedEvent(event) {
    console.log('NegotiationManager: Negotiation started event received', event.data);
    
    // This handler allows other components to respond to negotiation start
    // Currently no internal state changes needed since we dispatch the event
  }
  
  // Event handler for negotiationCompleted event
  handleNegotiationCompletedEvent(event) {
    console.log('NegotiationManager: Negotiation completed event received', event.data);
    
    // This handler allows this component to respond to negotiation completed events
    // from other potential negotiation mechanisms in the future
  }
  
  // Clean up resources when no longer needed
  cleanup() {
    console.log('NegotiationManager: Cleaning up resources');
    
    // Remove all event listeners to prevent memory leaks
    window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.removeEventListener('negotiationStarted', this.eventHandlers.negotiationStarted);
    window.GameStateManager.removeEventListener('negotiationCompleted', this.eventHandlers.negotiationCompleted);
    
    console.log('NegotiationManager: Cleanup completed');
  }
}

// Export NegotiationManager for use in other files
window.NegotiationManager = NegotiationManager;

console.log('NegotiationManager.js code execution finished');
