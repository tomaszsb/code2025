// MoveLogicManager.js - Compatibility layer for the new movement system
console.log('MoveLogicManager.js file is beginning to be used');

/**
 * This file provides backward compatibility for code that still uses the
 * MoveLogicManager component. It forwards all calls to the new movement system.
 */

(function() {
  console.log('MoveLogicManager: Setting up compatibility layer with new movement system');
  
  // Create a compatibility wrapper class
  window.MoveLogicManager = {
    initialized: true,
    
    // Forward to new movement system
    getAvailableMoves: function(gameState, player) {
      console.log('MoveLogicManager: Forwarding to new movement system');
      if (gameState && gameState.getAvailableMoves) {
        return gameState.getAvailableMoves(player);
      }
      
      // Fallback if new system is not available
      console.warn('MoveLogicManager: New movement system not available');
      return [];
    },
    
    // Stub methods for backward compatibility
    hasSpecialCaseLogic: function(spaceName) {
      return spaceName === 'PM-DECISION-CHECK';
    },
    
    handleSpecialCaseSpace: function(gameState, player, currentSpace) {
      if (gameState && gameState.getAvailableMoves) {
        return gameState.getAvailableMoves(player);
      }
      return [];
    }
  };
  
  // Create a compatibility wrapper for MoveLogic as well
  if (!window.MoveLogic) {
    window.MoveLogic = {
      getAvailableMoves: function(gameState, player) {
        return window.MoveLogicManager.getAvailableMoves(gameState, player);
      },
      hasSpecialCaseLogic: function(spaceName) {
        return window.MoveLogicManager.hasSpecialCaseLogic(spaceName);
      },
      handleSpecialCaseSpace: function(gameState, player, currentSpace) {
        return window.MoveLogicManager.handleSpecialCaseSpace(gameState, player, currentSpace);
      }
    };
  }
  
  console.log('MoveLogicManager: Compatibility layer setup complete');
})();

console.log('MoveLogicManager.js code execution finished');
