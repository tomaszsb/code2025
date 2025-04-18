// SpaceExplorerManager.js file is beginning to be used
console.log('SpaceExplorerManager.js file is beginning to be used');

/**
 * SpaceExplorerManager class for handling space explorer panel
 * Manages opening/closing the explorer panel and updating the explored space
 */
class SpaceExplorerManager {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }
  
  /**
   * Handle closing the space explorer panel
   */
  handleCloseExplorer = () => {
    // Actually close the space explorer
    this.gameBoard.setState({
      showSpaceExplorer: false
    });
    console.log('SpaceExplorerManager: Space explorer closed');
    
    // Log using SpaceExplorerLogger if available
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(false, '');
    }
  }
  
  /**
   * Handle opening the space explorer panel
   */
  handleOpenExplorer = () => {
    this.gameBoard.setState({
      showSpaceExplorer: true
    });
    console.log('SpaceExplorerManager: Space explorer opened');
    
    // Log using SpaceExplorerLogger if available
    const currentPlayer = this.gameBoard.turnManager.getCurrentPlayer();
    const currentSpace = currentPlayer ? this.gameBoard.state.spaces.find(s => s.id === currentPlayer.position) : null;
    const spaceName = currentSpace ? currentSpace.name : '';
    
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(true, spaceName);
    }
  }
  
  /**
   * Update the currently explored space
   * @param {Object} space - Space object to explore
   */
  updateExploredSpace = (space) => {
    this.gameBoard.setState({
      exploredSpace: space
    });
    console.log('SpaceExplorerManager: Updated explored space to:', space ? space.name : 'none');
    
    // Log using SpaceExplorerLogger if available
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(true, space ? space.name : '');
    }
  }
}

// Export SpaceExplorerManager for use in other files
window.SpaceExplorerManager = SpaceExplorerManager;

console.log('SpaceExplorerManager.js code execution finished');
