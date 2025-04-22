# SpaceExplorerManager Event System Integration

This document provides details about the implementation of the GameStateManager event system integration with the SpaceExplorerManager component.

## Overview

The SpaceExplorerManager component has been refactored to use the GameStateManager event system, aligning it with the manager pattern used throughout the project. This integration improves code consistency, enhances maintainability, and provides better performance by using event-based communication instead of direct state manipulation.

## Key Improvements

### 1. Event Registration System

The component now properly registers with the GameStateManager event system:

```javascript
registerEventListeners = () => {
  console.log('SpaceExplorerManager: Registering event listeners with GameStateManager');
  
  if (!window.GameStateManager) {
    console.error('SpaceExplorerManager: GameStateManager not available, cannot register events');
    return;
  }
  
  // Register standard events
  window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
  window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
  window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
  
  // Add custom event types if they don't exist yet
  if (!window.GameStateManager.eventHandlers['spaceExplorerToggled']) {
    window.GameStateManager.eventHandlers['spaceExplorerToggled'] = [];
  }
  
  console.log('SpaceExplorerManager: Event listeners registered');
}
```

### 2. Event Handlers

Three main event handlers have been implemented:

1. **handlePlayerMovedEvent**: Updates the space explorer when a player moves to a new space
   ```javascript
   handlePlayerMovedEvent = (event) => {
     if (event.data && event.data.toSpaceId) {
       const space = window.GameStateManager.findSpaceById(event.data.toSpaceId);
       if (space) {
         this.updateExploredSpace(space);
         
         // Open the space explorer automatically
         if (this.gameBoard.state.showSpaceExplorer === false) {
           this.handleOpenExplorer();
         }
       }
     }
   }
   ```

2. **handleTurnChangedEvent**: Updates the explorer when the player turn changes
   ```javascript
   handleTurnChangedEvent = (event) => {
     // Update the explorer to show the current player's space
     const currentPlayer = window.GameStateManager.getCurrentPlayer();
     if (currentPlayer && currentPlayer.position) {
       const space = window.GameStateManager.findSpaceById(currentPlayer.position);
       if (space) {
         this.updateExploredSpace(space);
       }
     }
   }
   ```

3. **handleGameStateChangedEvent**: Handles game state changes like new game
   ```javascript
   handleGameStateChangedEvent = (event) => {
     // Handle relevant game state changes
     if (event.data && event.data.changeType === 'newGame') {
       // Reset explorer state
       this.gameBoard.setState({
         showSpaceExplorer: false,
         exploredSpace: null
       });
     }
   }
   ```

### 3. Event Dispatching

The component now dispatches events through the GameStateManager:

```javascript
// Example from handleOpenExplorer
if (window.GameStateManager) {
  window.GameStateManager.dispatchEvent('spaceExplorerToggled', {
    visible: true,
    spaceName: spaceName
  });
}
```

### 4. Resource Cleanup

A proper cleanup method has been added:

```javascript
cleanup = () => {
  console.log('SpaceExplorerManager: Cleaning up resources');
  
  // Remove all event listeners
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
  }
  
  console.log('SpaceExplorerManager: Cleanup completed');
}
```

## Backward Compatibility

The refactored component maintains backward compatibility with the existing code:

```javascript
// Legacy compatibility with SpaceExplorerLogger
if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
  window.logSpaceExplorerToggle(this.gameBoard.state.showSpaceExplorer, space ? space.name : '');
}
```

## Interface with GameBoard

The SpaceExplorerManager still updates the GameBoard's state for compatibility, but now does so in conjunction with event dispatching:

```javascript
// Update state through gameBoard's setState
this.gameBoard.setState({
  showSpaceExplorer: true
});

// Dispatch event using GameStateManager
if (window.GameStateManager) {
  window.GameStateManager.dispatchEvent('spaceExplorerToggled', {
    visible: true,
    spaceName: spaceName
  });
}
```

## Benefits of the Refactoring

1. **Consistency**: Now follows the same pattern as other manager components
2. **Maintainability**: Clearer code structure with focused, single-responsibility methods
3. **Performance**: Event-based communication is more efficient than direct state manipulation
4. **Reliability**: Proper resource cleanup prevents memory leaks
5. **Extensibility**: Easier to add new features by leveraging the event system

## Future Improvements

The next step is to refactor the SpaceExplorer component itself to use the GameStateManager event system, which would complete the event system integration for the explorer functionality.

## Last Updated

April 22, 2025
