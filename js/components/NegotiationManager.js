// NegotiationManager.js file is beginning to be used
console.log('NegotiationManager.js file is beginning to be used');

class NegotiationManager {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }
  
  // Check if negotiation is allowed for the current space
  isNegotiationAllowed = () => {
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
    // First check the rawNegotiate field which comes directly from CSV
    const negotiationAllowed = currentSpace.rawNegotiate === "YES" || currentSpace.Negotiate === "YES";
    console.log(`NegotiationManager: Negotiation allowed for space ${currentSpace.name}: ${negotiationAllowed} (rawNegotiate=${currentSpace.rawNegotiate})`);
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
    
    // Only record the time spent on the space
    if (currentSpace.Time && currentSpace.Time.trim() !== '') {
      const timeToAdd = parseInt(currentSpace.Time, 10) || 0;
      if (timeToAdd > 0) {
        console.log(`NegotiationManager: Adding ${timeToAdd} days to player time from negotiate`);
        
        // Update GameState directly - Only update in one place, not both
        const playerIndex = window.GameState.players.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex >= 0) {
          window.GameState.players[playerIndex].resources.time += timeToAdd;
        }
        window.GameState.saveState();
      }
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
      exploredSpace: newSpace          // Update space explorer to show the current player's space
    });
    
    // Update available moves for new player
    this.gameBoard.updateAvailableMoves();
    
    console.log('NegotiationManager: Turn ended via negotiate, next player:', window.GameState.currentPlayerIndex, 'on space:', newPlayerPosition);
  }
  
  // Get tooltip text for the negotiate button
  getNegotiateButtonTooltip = () => {
    if (!this.isNegotiationAllowed()) {
      return "Negotiation is not allowed on this space";
    }
    return "End your turn, stay on this space, and only take the time penalty";
  }
  
  // Reset the game and start over
  resetGame = () => {
    console.log('NegotiationManager: Resetting game');
    window.GameState.clearSavedState();
    window.location.reload();
  }
}

// Export NegotiationManager for use in other files
window.NegotiationManager = NegotiationManager;

console.log('NegotiationManager.js code execution finished');
