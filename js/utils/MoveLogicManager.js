// MoveLogicManager.js - Manager for handling different types of moves in the game
console.log('MoveLogicManager.js file is beginning to be used');

// Import the modules from the move-logic directory
import { MoveLogicManager } from './move-logic/MoveLogicManager.js';
import { MoveLogicBackwardCompatibility } from './move-logic/MoveLogicBackwardCompatibility.js';

/**
 * Initialize manager and compatibility layer
 */
(function() {
  console.log('MoveLogicManager: Initializing manager...');
  
  // Create manager instance
  const moveLogicManager = new MoveLogicManager();
  
  // Create compatibility layer
  const compatibilityLayer = new MoveLogicBackwardCompatibility(moveLogicManager);
  
  // Store manager reference on window for direct access
  window.MoveLogicManager = moveLogicManager;
  
  console.log('MoveLogicManager: Manager initialized and compatibility layer set up');
})();

console.log('MoveLogicManager.js code execution finished');
