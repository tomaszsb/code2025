# Initialization Sequence Documentation

This document explains the initialization sequence of the MoveLogic components in the Project Management Game.

## Overview

The MoveLogic components follow a specific initialization order to ensure all dependencies are properly loaded before they're used. The key components are:

1. **MoveLogicBase.js** - Base implementation of movement logic
2. **MoveLogicSpaceTypes.js** - Handles different space types
3. **MoveLogicVisitTypes.js** - Handles first/subsequent visit resolution
4. **MoveLogicCardEffects.js** - Handles card effect integration
5. **MoveLogicSpaceHandlers.js** - Space-specific logic
6. **MoveLogicSpecialCases.js** - Special case handling for specific spaces
7. **MoveLogicPmDecisionCheck.js** - PM-DECISION-CHECK space handling
8. **MoveLogicUIUpdates.js** - UI-related functionality
9. **MoveLogicManager.js** - Main manager class that ties everything together

## Initialization Steps

### 1. Component Dependencies

The MoveLogic components have dependencies on each other and on other system components like GameStateManager:

```
MoveLogicUIUpdates ← MoveLogicManager
MoveLogicSpecialCases ← MoveLogicPmDecisionCheck
GameStateManager ← MoveLogicManager
```

These dependencies must be properly handled regardless of the actual loading order of the scripts.

### 2. HTML Loading Order

The HTML files (Index.html and Index-debug.html) load the scripts in the correct order, ensuring dependencies are loaded before the components that need them:

```html
<!-- Base classes first -->
<script type="text/babel" src="js/utils/move-logic/MoveLogicBase.js"></script>
<script type="text/babel" src="js/utils/move-logic/MoveLogicSpaceTypes.js"></script>
<script type="text/babel" src="js/utils/move-logic/MoveLogicVisitTypes.js"></script>
<script type="text/babel" src="js/utils/move-logic/MoveLogicCardEffects.js"></script>
<script type="text/babel" src="js/utils/move-logic/MoveLogicSpaceHandlers.js"></script>
<script type="text/babel" src="js/utils/move-logic/MoveLogicSpecialCases.js"></script>
<!-- Special case handlers next -->
<script type="text/babel" src="js/utils/move-logic/MoveLogicPmDecisionCheck.js"></script>
<!-- UI Updates next -->
<script type="text/babel" src="js/utils/move-logic/MoveLogicUIUpdates.js"></script>
<!-- Signal that dependencies are ready -->
<script type="text/babel">
  // Initialization event dispatch code
</script>
<!-- Manager class last -->
<script type="text/babel" src="js/utils/move-logic/MoveLogicManager.js"></script>
```

### 2. Component Initialization

Each component sets initialization flags and dispatches events when it's fully initialized:

#### MoveLogicSpecialCases.js

```javascript
// Set initialization started flag
window.MoveLogicSpecialCasesInitStarted = true;

// ... component initialization ...

// Set initialization completed flag
window.MoveLogicSpecialCasesInitialized = true;

// Dispatch initialization event
const event = new CustomEvent('MoveLogicSpecialCasesInitialized', {
  detail: {
    specialCaseSpaces: window.MoveLogicSpecialCases.specialCaseSpaces,
    hasHandlePmDecisionCheck: typeof window.MoveLogicSpecialCases.handlePmDecisionCheck === 'function'
  }
});
window.dispatchEvent(event);
```

#### MoveLogicPmDecisionCheck.js

```javascript
// Use a self-executing initialization function to handle async initialization
function initializeWhenDependenciesReady() {
  // Check if MoveLogicSpecialCases is initialized
  if (!window.MoveLogicSpecialCases || !window.MoveLogicSpecialCases.hasSpecialCaseLogic) {
    // It's not available yet, so try again in a moment
    setTimeout(initializeWhenDependenciesReady, 50);
    return;
  }
  
  // Dependencies are ready, continue with initialization
  
  // ... initialization code ...
  
  // Set initialization completed flag
  window.MoveLogicPmDecisionCheckInitialized = true;
  
  // Dispatch initialization event
  const event = new CustomEvent('MoveLogicPmDecisionCheckInitialized', {
    detail: {
      methodsAttached: true
    }
  });
  window.dispatchEvent(event);
}

// Start the initialization process
initializeWhenDependenciesReady();
```

#### MoveLogicManager.js

```javascript
// Track initialization status of dependencies
this.dependencies = {
  specialCasesInitialized: window.MoveLogicSpecialCasesInitialized || false,
  pmDecisionCheckInitialized: window.MoveLogicPmDecisionCheckInitialized || false
};

// Register for initialization events
window.addEventListener('MoveLogicSpecialCasesInitialized', this.eventHandlers.specialCasesInitialized);
window.addEventListener('MoveLogicPmDecisionCheckInitialized', this.eventHandlers.pmDecisionCheckInitialized);

// Check if all dependencies are already initialized
if (window.MoveLogicSpecialCasesInitialized && window.MoveLogicPmDecisionCheckInitialized) {
  // Dependencies already initialized
  this.dependencies.specialCasesInitialized = true;
  this.dependencies.pmDecisionCheckInitialized = true;
  this.checkForPmDecisionCheckHandler();
} else {
  // Set a timer to verify initialization even if events don't fire
  setTimeout(() => {
    this.checkAllDependencies();
  }, 1000);
}
```

### 3. Dependency Checking

MoveLogicManager actively checks for all its dependencies using both event listeners and periodic checks:

```javascript
/**
 * Check if all dependencies are initialized
 */
MoveLogicManager.prototype.checkAllDependencies = function() {
  // Update dependency status
  this.dependencies.specialCasesInitialized = window.MoveLogicSpecialCasesInitialized || this.dependencies.specialCasesInitialized;
  this.dependencies.pmDecisionCheckInitialized = window.MoveLogicPmDecisionCheckInitialized || this.dependencies.pmDecisionCheckInitialized;
  
  // Check if GameStateManager is now available
  const gameStateManagerAvailable = !!window.GameStateManager;
  if (gameStateManagerAvailable && !this.dependencies.gameStateManagerInitialized) {
    console.log('MoveLogicManager: GameStateManager is now available');
    this.dependencies.gameStateManagerInitialized = true;
    
    // Try to register event listeners now that GameStateManager is available
    if (!this.dependencies.eventListenersRegistered) {
      this.tryRegisterEventListeners();
    }
  }
  
  // If all dependencies are initialized, check for the handler
  if (this.dependencies.specialCasesInitialized && this.dependencies.pmDecisionCheckInitialized) {
    this.checkForPmDecisionCheckHandler();
  }
  
  // Return true if all dependencies are ready
  return (
    this.dependencies.specialCasesInitialized && 
    this.dependencies.pmDecisionCheckInitialized && 
    this.dependencies.gameStateManagerInitialized &&
    this.dependencies.eventListenersRegistered
  );
};
```

## Initialization Event Handlers

MoveLogicManager listens for initialization events from other components, including GameStateManager:

```javascript
/**
 * Handle the MoveLogicSpecialCases initialization event
 */
MoveLogicManager.prototype.handleSpecialCasesInitialized = function(event) {
  this.dependencies.specialCasesInitialized = true;
  this.checkAllDependencies();
};

/**
 * Handle the MoveLogicPmDecisionCheck initialization event
 */
MoveLogicManager.prototype.handlePmDecisionCheckInitialized = function(event) {
  this.dependencies.pmDecisionCheckInitialized = true;
  this.checkAllDependencies();
};

/**
 * Handle the GameStateManager initialization event
 */
MoveLogicManager.prototype.handleGameStateManagerInitialized = function(event) {
  console.log('MoveLogicManager: Received GameStateManager initialization event');
  this.dependencies.gameStateManagerInitialized = true;
  
  // Try to register event listeners now that GameStateManager is available
  if (!this.dependencies.eventListenersRegistered) {
    this.tryRegisterEventListeners();
  }
  
  this.checkAllDependencies();
};
```

## Handling Script Loading Order Issues

Since the code is transpiled by Babel and scripts may load in different orders based on network conditions or browser caching, we use several strategies to ensure proper initialization:

1. **Event-based dependencies**: Components dispatch events when they're initialized, and other components listen for these events.

2. **Periodic dependency checking**: Components periodically check for their dependencies using a setInterval timer.

3. **Initialization flags**: Global flags (e.g., window.ComponentNameInitialized) make it easy to check if a component is ready.

4. **Retry mechanisms**: Instead of failing immediately, components retry operations (like registering event listeners) until dependencies are available.

For GameStateManager specifically, MoveLogicManager implements a robust retry mechanism:

```javascript
/**
 * Try to register event listeners with GameStateManager
 * Will be called periodically until successful
 * @returns {boolean} True if listeners were registered successfully
 */
MoveLogicManager.prototype.tryRegisterEventListeners = function() {
  console.log('MoveLogicManager: Trying to register event listeners with GameStateManager');
  
  if (!window.GameStateManager) {
    console.log('MoveLogicManager: GameStateManager not available yet, will retry later');
    return false;
  }
  
  // Make sure addEventListener method exists
  if (typeof window.GameStateManager.addEventListener !== 'function') {
    console.warn('MoveLogicManager: GameStateManager exists but addEventListener method is missing');
    return false;
  }
  
  // Register for game state events
  window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
  window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
  window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  window.GameStateManager.addEventListener('diceRolled', this.eventHandlers.diceRolled);
  
  this.dependencies.eventListenersRegistered = true;
  console.log('MoveLogicManager: Event listeners registered successfully with GameStateManager');
  return true;
};
```

This approach ensures components wait for their dependencies to be fully initialized before proceeding, regardless of script loading order.

## Cleanup

When a component is no longer needed, it properly removes all event listeners to prevent memory leaks:

```javascript
MoveLogicManager.prototype.cleanup = function() {
  // Remove all game state event listeners
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    // ... more event listener cleanup ...
  }
  
  // Remove initialization event listeners
  window.removeEventListener('MoveLogicSpecialCasesInitialized', this.eventHandlers.specialCasesInitialized);
  window.removeEventListener('MoveLogicPmDecisionCheckInitialized', this.eventHandlers.pmDecisionCheckInitialized);
  
  // Clear cache
  this.moveCache.clear();
};
```

## Best Practices for Future Development

When making changes to initialization code:

1. **Always follow the closed system principle** - Do not use fallbacks or hacks to work around loading issues.
2. **Use initialization flags** - Set global flags when components are initialized to help with dependency tracking.
3. **Dispatch initialization events** - Use CustomEvent to signal when components are fully initialized.
4. **Add explicit dependency checks** - Components should actively check for their dependencies before proceeding.
5. **Add proper cleanup** - Always remove event listeners when components are no longer needed.
6. **Use detailed logging** - Add clear logging statements to make debugging easier.

By following these practices, you'll ensure the code maintains a clean, deterministic initialization sequence.

*Last Updated: May 9, 2025*
