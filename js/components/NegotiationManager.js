// NegotiationManager.js file is beginning to be used
console.log('NegotiationManager.js file is beginning to be used');

class NegotiationManager {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }
  
  // Check if negotiation is allowed for the current space
  isNegotiationAllowed = () => {
    console.log('NegotiationManager: Checking if negotiation is allowed');
    const currentPlayer = this.gameBoard.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('NegotiationManager: No current player found, negotiation not allowed');
      return false;
    }
    
    // Get the current space
    const currentSpaceId = currentPlayer.position;
    const currentSpace = this.gameBoard.state.spaces.find(s => s.id === currentSpaceId);
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
    
    // Get the current player
    const currentPlayer = this.gameBoard.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('NegotiationManager: No current player found');
      return;
    }
    
    // Get the current space
    const currentSpace = this.gameBoard.state.spaces.find(s => s.id === currentPlayer.position);
    if (!currentSpace) {
      console.log('NegotiationManager: Current space not found');
      return;
    }
    
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
    
    // Update GameState directly to avoid redundant updates
    const playerIndex = window.GameState.players.findIndex(p => p.id === currentPlayer.id);
    if (playerIndex >= 0) {
      // Get the current time value for reference
      const currentTime = window.GameState.players[playerIndex].resources.time;
      
      // Reset resources to original values from when player landed on space
      window.GameState.players[playerIndex].resources = {
        ...originalPlayerSnapshot.resources,
        // Keep only the time penalty from this turn
        time: originalPlayerSnapshot.resources.time + timeToAdd
      };
      
      // Reset cards to original state (remove any cards drawn during this turn)
      window.GameState.players[playerIndex].cards = [...originalPlayerSnapshot.cards];
      
      console.log('NegotiationManager: Reset player resources and cards to original values');
      console.log(`NegotiationManager: Original money: ${originalPlayerSnapshot.resources.money}, Current money: ${window.GameState.players[playerIndex].resources.money}`);
      console.log(`NegotiationManager: Original time: ${originalPlayerSnapshot.resources.time}, Current time: ${window.GameState.players[playerIndex].resources.time}`);
      console.log('NegotiationManager: Reset usedButtons to enable all card draw options again');
      
      window.GameState.saveState();
    }
    
    // Move to next player's turn (keep player on same space)
    window.GameState.nextPlayerTurn();
    
    // Get the new current player
    const newCurrentPlayer = window.GameState.getCurrentPlayer();
    const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
    
    // Get the space the player landed on
    const newSpace = this.gameBoard.state.spaces.find(s => s.id === newPlayerPosition);
    
    // Create a deep copy of the player's status for the static view
    const playerSnapshot = newCurrentPlayer ? {
      ...newCurrentPlayer,
      resources: { ...newCurrentPlayer.resources },
      cards: [...(newCurrentPlayer.cards || [])],
      // Force the color to be the current player's color for consistent UI
      color: newCurrentPlayer.color
    } : null;
    
    // Create a deep copy of the space info for the static view
    const spaceSnapshot = newSpace ? { ...newSpace } : null;
    
    // Update gameBoard state
    this.gameBoard.setState({
      players: [...window.GameState.players],
      currentPlayerIndex: window.GameState.currentPlayerIndex,
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
    const resetEvent = new CustomEvent('resetSpaceInfoButtons');
    window.dispatchEvent(resetEvent);
    console.log('NegotiationManager: Dispatched resetSpaceInfoButtons event to reset all button states');
    
    // Update available moves for new player
    this.gameBoard.updateAvailableMoves();
    
    console.log('NegotiationManager: Turn ended via negotiate, next player:', window.GameState.currentPlayerIndex, 'on space:', newPlayerPosition);
    console.log('NegotiationManager: Negotiation action completed successfully');
  }
  
  // Get tooltip text for the negotiate button
  getNegotiateButtonTooltip = () => {
    console.log('NegotiationManager: Getting negotiate button tooltip');
    if (!this.isNegotiationAllowed()) {
      return "Negotiation is not allowed on this space";
    }
    return "End your turn, stay on this space, and only take the time penalty";
  }
  
  // The resetGame method has been removed from NegotiationManager
  // It was violating the Single Responsibility Principle
  // Use window.GameState.startNewGame() instead
}

// Export NegotiationManager for use in other files
window.NegotiationManager = NegotiationManager;

console.log('NegotiationManager.js code execution finished');
