// MoveLogicManager.js - Manager for handling different types of moves in the game
console.log('MoveLogicManager.js file is beginning to be used');

/**
 * Initialize manager and compatibility layer
 * 
 * This file serves as the main entry point for the MoveLogicManager component.
 * It creates and initializes the MoveLogicManager instance and sets up backward compatibility.
 * 
 * Note: The modules must be included in the correct order in the HTML:
 * 1. First load MoveLogicBase.js
 * 2. Then load MoveLogicSpecialCases.js (extends MoveLogicBase)
 * 3. Then load MoveLogicUIUpdates.js (extends MoveLogicSpecialCases)
 * 4. Then load MoveLogicManager.js (extends MoveLogicUIUpdates)
 * 5. Then load MoveLogicBackwardCompatibility.js
 * 6. Finally load this file (utils/MoveLogicManager.js)
 */
(function() {
  console.log('MoveLogicManager: Initializing manager...');
  
  // Check if all required modules are loaded
  if (!window.MoveLogicBase) {
    console.error('MoveLogicManager: MoveLogicBase module not found. Check script loading order.');
    return;
  }
  
  if (!window.MoveLogicSpecialCases) {
    console.error('MoveLogicManager: MoveLogicSpecialCases module not found. Check script loading order.');
    return;
  }
  
  if (!window.MoveLogicUIUpdates) {
    console.error('MoveLogicManager: MoveLogicUIUpdates module not found. Check script loading order.');
    return;
  }
  
  if (!window.MoveLogicManager) {
    console.error('MoveLogicManager: MoveLogicManager class not found. Check script loading order.');
    return;
  }
  
  if (!window.MoveLogicBackwardCompatibility) {
    console.error('MoveLogicManager: MoveLogicBackwardCompatibility module not found. Check script loading order.');
    return;
  }
  
  // Create manager instance
  const moveLogicManager = new window.MoveLogicManager();
  
  // Expose the manager instance globally for direct access
  window.MoveLogicManager = moveLogicManager;
  
  // Create compatibility layer - need to call this after overwriting the window.MoveLogicManager
  const compatibilityLayer = new window.MoveLogicBackwardCompatibility(moveLogicManager);
  
  console.log('MoveLogicManager: Manager initialized and compatibility layer set up');
})();

console.log('MoveLogicManager.js code execution finished');
