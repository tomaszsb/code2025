// MovementSystemSimplified.js - Simplified movement system interface
console.log('MovementSystemSimplified.js file is beginning to be used');

/**
 * MovementSystemSimplified - Simplified interface to the MovementEngine
 * 
 * Provides a simple API for common movement operations without
 * exposing the full complexity of the MovementEngine.
 */
class MovementSystemSimplified {
  constructor() {
    console.log('MovementSystemSimplified: Initializing simplified movement interface');
  }
  
  /**
   * Get available moves for current player
   * @returns {Array} Available move options
   */
  getCurrentPlayerMoves() {
    if (!window.movementEngine) {
      console.warn('MovementSystemSimplified: MovementEngine not available');
      return [];
    }
    
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer) {
      console.warn('MovementSystemSimplified: No current player');
      return [];
    }
    
    return window.movementEngine.getAvailableMovements(currentPlayer);
  }
  
  /**
   * Check if current player can move to a space
   * @param {string} spaceId - Space ID to check
   * @returns {boolean} True if move is valid
   */
  canMoveTo(spaceId) {
    const moves = this.getCurrentPlayerMoves();
    return Array.isArray(moves) && moves.some(move => move.id === spaceId);
  }
  
  /**
   * Get space type for a given space
   * @param {string} spaceName - Name of the space
   * @returns {string} Space type
   */
  getSpaceType(spaceName) {
    if (!window.movementEngine) {
      return 'unknown';
    }
    
    return window.movementEngine.getSpaceType(spaceName);
  }
  
  /**
   * Check if player has visited a space
   * @param {string} spaceName - Name of the space
   * @param {Object} player - Optional player object
   * @returns {boolean} True if visited
   */
  hasVisited(spaceName, player = null) {
    if (!window.movementEngine) {
      return false;
    }
    
    const targetPlayer = player || window.GameStateManager.getCurrentPlayer();
    if (!targetPlayer) {
      return false;
    }
    
    return window.movementEngine.hasPlayerVisitedSpace(targetPlayer, spaceName);
  }
  
  /**
   * Get debug information
   * @returns {Object} Debug info
   */
  getDebugInfo() {
    if (!window.movementEngine) {
      return { error: 'MovementEngine not available' };
    }
    
    return window.movementEngine.getDebugInfo();
  }
}

// Export simplified interface
window.MovementSystemSimplified = MovementSystemSimplified;

// Create instance for global use
window.movementSystemSimplified = new MovementSystemSimplified();

console.log('MovementSystemSimplified.js code execution finished');
