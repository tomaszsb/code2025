// TurnManager.js file is beginning to be used
console.log('TurnManager.js file is beginning to be used');

/**
 * TurnManager class for handling turn-related operations
 * Manages turn transitions, player state updates, and player snapshots
 */
class TurnManager {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }
  
  /**
   * Handle ending the current turn and transitioning to the next player
   */
  handleEndTurn = () => {
    const { selectedMove } = this.gameBoard.state;
    const currentPlayer = this.getCurrentPlayer();
    
    // If a move was selected, execute it now when ending the turn
    if (selectedMove && currentPlayer) {
      console.log('TurnManager: Executing selected move:', selectedMove);
      window.GameState.movePlayer(currentPlayer.id, selectedMove);
    }
    
    // Move to next player's turn
    this.nextPlayerTurn();
    
    console.log('TurnManager: Turn ended, next player:', window.GameState.currentPlayerIndex);
  }
  
  /**
   * Update to the next player's turn and update all necessary state
   */
  nextPlayerTurn = () => {
    // Move to next player's turn
    window.GameState.nextPlayerTurn();
    
    // Get the new current player
    const newCurrentPlayer = window.GameState.getCurrentPlayer();
    const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
    
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
    
    console.log('TurnManager: Next player:', window.GameState.currentPlayerIndex, 'on space:', newPlayerPosition);
  }
  
  /**
   * Get the current player
   * @returns {Object} Current player object
   */
  getCurrentPlayer = () => {
    const { players, currentPlayerIndex } = this.gameBoard.state;
    return players[currentPlayerIndex];
  }
  
  /**
   * Create a deep copy snapshot of a player's state
   * @param {Object} player - Player object to snapshot
   * @returns {Object} Player snapshot with deep copied properties
   */
  createPlayerSnapshot = (player) => {
    if (!player) return null;
    
    return {
      ...player,
      resources: { ...player.resources },
      cards: [...(player.cards || [])],
      // Force the color to be the player's color for consistent UI
      color: player.color
    };
  }
}

// Export TurnManager for use in other files
window.TurnManager = TurnManager;

console.log('TurnManager.js code execution finished');
