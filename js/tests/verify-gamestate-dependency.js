// verify-gamestate-dependency.js - Test script to verify GameStateManager dependency handling
console.log('Verification script: Starting tests for GameStateManager dependency in MoveLogicManager');

// Verify that MoveLogicManager is properly tracking GameStateManager
setTimeout(() => {
  try {
    console.log('Verification script: Checking dependency tracking in MoveLogicManager');
    
    // Check if MoveLogicManager exists and has dependency tracking
    if (!window.MoveLogicManager) {
      console.error('Verification script: FAILED - MoveLogicManager not found');
      return;
    }
    
    // Report dependency status
    console.log('Verification script: GameStateManager dependency status -',
      'Initialized:', !!window.MoveLogicManager.dependencies.gameStateManagerInitialized,
      'EventListeners:', !!window.MoveLogicManager.dependencies.eventListenersRegistered);
    
    // Check if GameStateManager exists
    if (!window.GameStateManager) {
      console.error('Verification script: GameStateManager not available yet');
      return;
    }
    
    // Verify event listeners are registered
    const eventTypes = ['gameStateChanged', 'turnChanged', 'spaceChanged', 'diceRolled'];
    let allEventsRegistered = true;
    
    eventTypes.forEach(eventType => {
      const hasListener = window.GameStateManager._eventListeners && 
                          window.GameStateManager._eventListeners[eventType] && 
                          window.GameStateManager._eventListeners[eventType].length > 0;
      
      console.log(`Verification script: '${eventType}' event listener registered:`, hasListener);
      if (!hasListener) allEventsRegistered = false;
    });
    
    if (allEventsRegistered) {
      console.log('%c Verification script: PASSED - All event listeners registered successfully', 'color: green; font-weight: bold');
    } else {
      console.error('%c Verification script: FAILED - Not all event listeners are registered', 'color: red; font-weight: bold');
    }
    
    // Test dispatching an event to ensure handlers work
    console.log('Verification script: Testing event handling by dispatching gameStateChanged event');
    window.GameStateManager.dispatchEvent('gameStateChanged', {
      changeType: 'verification-test',
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Verification script: Error during verification -', error);
  }
}, 3000); // Wait 3 seconds to ensure everything has initialized

console.log('Verification script: Test will run after 3 second delay');
