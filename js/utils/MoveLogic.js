// MoveLogic.js - Compatibility layer for the new movement system
console.log('MoveLogic.js file is beginning to be used');

/**
 * This file provides backward compatibility for code that still uses the
 * window.MoveLogic global object. All calls are forwarded to the new
 * MovementSystem implementation.
 * 
 * Note: This file should not be used directly in new code.
 * Use GameStateManager's movement methods instead.
 */

// Create compatibility layer that forwards calls to the new system
window.MoveLogic = window.MoveLogic || {
  getAvailableMoves: function(gameState, player) {
    console.log('MoveLogic: Compatibility layer - forwarding to new movement system');
    
    // Forward to the new system's getAvailableMoves method
    if (gameState && gameState.getAvailableMoves) {
      return gameState.getAvailableMoves(player);
    }
    
    // Fallback if new system is not available
    console.warn('MoveLogic: New movement system not available, using fallback');
    
    // Get the player's current space
    const currentSpace = gameState.findSpaceById(player.position);
    if (!currentSpace) {
      console.log('MoveLogic: Player position not found, no moves available');
      return [];
    }
    
    // Process nextSpaces from CSV data (simple fallback implementation)
    const availableMoves = [];
    
    for (const nextSpaceName of currentSpace.nextSpaces || []) {
      if (!nextSpaceName || nextSpaceName.trim() === '') continue;
      
      const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === cleanedSpaceName);
      
      if (matchingSpaces.length > 0) {
        const hasVisited = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const visitType = hasVisited ? 'subsequent' : 'first';
        
        let nextSpace = matchingSpaces.find(s => 
          s.visitType && s.visitType.toLowerCase() === visitType.toLowerCase()) || matchingSpaces[0];
        
        if (nextSpace && !availableMoves.some(move => move.id === nextSpace.id)) {
          availableMoves.push(nextSpace);
        }
      }
    }
    
    return availableMoves;
  },
  
  // Basic stub implementations for other methods
  hasSpecialCaseLogic: function(spaceName) {
    // PM-DECISION-CHECK is handled by the new system
    if (spaceName === 'PM-DECISION-CHECK') return true;
    return false;
  },
  
  handleSpecialCaseSpace: function(gameState, player, currentSpace) {
    // Forward to new system
    if (gameState && gameState.getAvailableMoves) {
      return gameState.getAvailableMoves(player);
    }
    return [];
  },
  
  handlePmDecisionCheck: function(gameState, player, currentSpace) {
    // Forward to new system
    if (gameState && gameState.getAvailableMoves) {
      return gameState.getAvailableMoves(player);
    }
    return [];
  }
};

console.log('MoveLogic.js code execution finished');
