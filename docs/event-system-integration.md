# Event System Integration for Game Components

## Overview

This document outlines the process and benefits of integrating game components with the GameStateManager event system. The integration follows a standardized pattern that ensures consistency across components, improves code maintainability, and enhances performance through looser coupling between components.

## Integration Status

| Component                | Status      | Date Completed | Description                                      |
|--------------------------|-------------|----------------|--------------------------------------------------|
| GameStateManager         | Completed   | April 20, 2025 | Core event system implementation                 |
| SpaceExplorerManager     | Completed   | April 22, 2025 | Controls space explorer panel visibility         |
| SpaceExplorerLoggerManager | Completed | April 22, 2025 | Handles CSS and styling for space explorer       |
| SpaceExplorer            | Enhanced    | April 27, 2025 | Main space exploration display component with hybrid architecture |
| SpaceInfo                | Completed   | April 28, 2025 | Space information display component with full manager integration |
| SpaceInfoManager         | Completed   | April 28, 2025 | Manages space information styling and button states |
| TurnManager              | Completed   | April 20, 2025 | Manages player turns                             |
| DiceManager              | Completed   | April 18, 2025 | Handles dice rolling and outcome processing      |
| CardManager              | Completed   | April 19, 2025 | Manages card drawing and playing                 |
| NegotiationManager       | Completed   | April 19, 2025 | Handles negotiation mechanics                    |
| SpaceSelectionManager    | Completed   | April 21, 2025 | Manages available space selection                |
| MoveLogicManager         | Completed   | April 29, 2025 | Handles game movement logic and visual indicators|

## Event Types

The GameStateManager provides the following standard event types:

| Event Type            | Description                                           | Data Payload                                      |
|-----------------------|-------------------------------------------------------|---------------------------------------------------|
| playerMoved           | Fired when a player moves to a new space              | { playerId, fromSpaceId, toSpaceId, player }      |
| turnChanged           | Fired when the active player changes                  | { previousPlayerIndex, currentPlayerIndex, player }|
| gameStateChanged      | Fired for general game state changes                  | { changeType, [additional data] }                 |
| cardDrawn             | Fired when a player draws a card                      | { playerId, player, cardType, card }              |
| cardPlayed            | Fired when a player plays a card                      | { playerId, player, card }                        |
| spaceExplorerToggled  | Fired when the space explorer visibility changes      | { visible, spaceName }                            |
| spaceChanged          | Fired when space information has been updated         | { spaceId, spaceName, playerId, visitType }       |
| diceRolled            | Fired when dice are rolled                            | { playerId, result }                              |

## Integration Pattern

When integrating a component with the GameStateManager event system, follow these steps:

1. **Store Event Handlers in Constructor**:
   ```javascript
   this.eventHandlers = {
     eventName1: this.handleEventName1.bind(this),
     eventName2: this.handleEventName2.bind(this)
   };
   ```

2. **Register Event Listeners in a Dedicated Method**:
   ```javascript
   registerEventListeners() {
     console.log('ComponentName: registerEventListeners method is being used');
     
     if (!window.GameStateManager) {
       console.error('ComponentName: GameStateManager not available, cannot register events');
       return;
     }
     
     window.GameStateManager.addEventListener('eventName1', this.eventHandlers.eventName1);
     window.GameStateManager.addEventListener('eventName2', this.eventHandlers.eventName2);
     
     console.log('ComponentName: registerEventListeners method completed');
   }
   ```

3. **Implement Event Handlers**:
   ```javascript
   handleEventName1(event) {
     console.log('ComponentName: handleEventName1 method is being used');
     
     // Handle event
     
     console.log('ComponentName: handleEventName1 method completed');
   }
   ```

4. **Add Cleanup Method**:
   ```javascript
   cleanup() {
     console.log('ComponentName: cleanup method is being used');
     
     if (window.GameStateManager) {
       window.GameStateManager.removeEventListener('eventName1', this.eventHandlers.eventName1);
       window.GameStateManager.removeEventListener('eventName2', this.eventHandlers.eventName2);
     }
     
     console.log('ComponentName: cleanup method completed');
   }
   ```

5. **Dispatch Events When Necessary**:
   ```javascript
   if (window.GameStateManager) {
     window.GameStateManager.dispatchEvent('eventName', {
       // Event data
     });
   }
   ```

## Standard Logging Pattern

All methods in event-integrated components should follow this logging pattern:

```javascript
methodName() {
  console.log('ComponentName: methodName method is being used');
  
  // Method implementation
  
  console.log('ComponentName: methodName method completed');
}
```

## Benefits of Event Integration

### 1. Loose Coupling

Components communicate through events rather than direct method calls, reducing dependencies between components. This makes the code more modular and easier to maintain.

### 2. Better Testability

Event-based architecture makes it easier to test components in isolation by mocking the event system.

### 3. Improved Error Handling

Centralized event handling makes it easier to implement error handling and logging consistently across all components.

### 4. Simplified Debugging

The standardized logging pattern makes it easier to trace the flow of events and identify issues.

### 5. Reduced Memory Leaks

Proper cleanup methods ensure that event listeners are removed when components are no longer needed, preventing memory leaks.

## Case Study: MoveLogicManager Integration

The MoveLogicManager component was refactored to follow the manager pattern and integrated with the GameStateManager event system on April 29, 2025.

### MoveLogicManager Refactoring (April 29, 2025)

1. **Implementing Class Inheritance Structure**:
   - Created a layered inheritance structure for better organization:
     - MoveLogicBase: Core move logic calculations
     - MoveLogicSpecialCases: Extends Base with special case handling
     - MoveLogicUIUpdates: Extends SpecialCases with UI operations
     - MoveLogicManager: Extends UIUpdates with event system integration

2. **Event System Integration**:
   - Added proper event handler registration in constructor
   - Implemented handlers for gameStateChanged, turnChanged, spaceChanged, and diceRolled events
   - Added cleanup method for removing event listeners
   - Follows standardized logging pattern for all methods

3. **Visual UI Updates**:
   - Implemented DOM manipulation for UI updates through MoveLogicUIUpdates class
   - Added "YOUR TURN" indicators for player tokens
   - Implemented visit type display updates
   - Enhanced selected move styling

4. **Caching Framework**:
   - Implemented a cache framework for frequently accessed moves
   - Added clearCachedMovesForPlayer method for cache management
   - Cache gets cleared on relevant events for consistency

5. **Backward Compatibility**:
   - Added MoveLogicBackwardCompatibility layer for legacy code support
   - Maintains window.MoveLogic global object for existing code
   - Maps old method calls to new MoveLogicManager implementation

### MoveLogicManager Event Handlers

```javascript
/**
 * Handle gameStateChanged events from GameStateManager
 * @param {Object} event - The gameStateChanged event object
 */
handleGameStateChangedEvent(event) {
  console.log('MoveLogicManager: Handling gameStateChanged event');
  
  if (!event || !event.data) {
    return;
  }
  
  // Handle relevant game state changes
  if (event.data.changeType === 'newGame') {
    // Clear move cache for a new game
    this.moveCache.clear();
    console.log('MoveLogicManager: Cleared move cache for new game');
  }

  // Other state change handling
  
  console.log('MoveLogicManager: Finished handling gameStateChanged event');
}

/**
 * Handle turnChanged events from GameStateManager
 * @param {Object} event - The turnChanged event object
 */
handleTurnChangedEvent(event) {
  console.log('MoveLogicManager: Handling turnChanged event');
  
  // Clear cache for the current player
  const currentPlayer = window.GameStateManager.getCurrentPlayer();
  if (currentPlayer) {
    this.clearCachedMovesForPlayer(currentPlayer.id);
    this.updateCurrentPlayerTokenDisplay(currentPlayer);
  }
  
  console.log('MoveLogicManager: Finished handling turnChanged event');
}
```

### MoveLogicManager Interaction with SpaceSelectionManager

While both MoveLogicManager and SpaceSelectionManager manipulate the DOM for visual cues, they serve different purposes:

- **MoveLogicManager**: Focuses on player token indicators and visit type displays
- **SpaceSelectionManager**: Manages available move highlighting and selection feedback

This division allows for separation of concerns while maintaining a cohesive visual system.

## Case Study: SpaceInfo Integration

The SpaceInfo component was refactored to follow the manager pattern and integrate with the GameStateManager event system on April 28, 2025.

### SpaceInfo Refactoring (April 28, 2025)

1. **Removing Local State Management**:
   - Eliminated the `usedButtons` array from local state that tracked button usage
   - Added a minimal `renderKey` state to force re-renders when needed
   - Now uses the SpaceInfoManager for all button state tracking with Map/Set data structures
   - Delegates all state management to the manager for improved consistency

2. **Implementing Event System Integration**:
   - Added proper event handler storage in constructor for better organization
   - Registered for turnChanged and spaceChanged events
   - Implemented proper event cleanup in componentWillUnmount
   - Added handler methods for each event type with clear logging

3. **GameStateManager Integration**:
   - Replaced all direct references to window.GameState with window.GameStateManager
   - Uses GameStateManager for player and space lookups
   - Draws cards through SpaceInfoManager which uses GameStateManager
   - Properly integrates with the event system for state updates

4. **CSS Integration**:
   - Uses CSS classes from SpaceInfoManager instead of inline styles
   - Applies phase-specific styling through consistent class names
   - Maintains clean separation of styling and logic
   - Adheres to the project's CSS naming conventions

### Before-After Code Comparison

**Before Refactoring**:
```javascript
constructor(props) {
  super(props);
  this.state = {
    usedButtons: [],
    currentPlayerId: null // Store current player ID to detect changes
  };
}

componentDidUpdate(prevProps) {
  // Get current player
  const currentPlayer = window.GameState?.getCurrentPlayer?.();
  const currentPlayerId = currentPlayer?.id || null;
  
  // Check if the space has changed
  if (prevProps.space?.id !== this.props.space?.id) {
    // Reset used buttons when space changes
    this.setState({ 
      usedButtons: [],
      currentPlayerId: currentPlayerId // Update player ID state
    });
    return;
  }
  
  // Check if the player has changed
  if (currentPlayerId && this.state.currentPlayerId !== currentPlayerId) {
    // Reset used buttons when player changes
    this.setState({ 
      usedButtons: [],
      currentPlayerId: currentPlayerId 
    });
    return;
  }
}

componentDidMount() {
  // Initialize with current player ID
  const currentPlayer = window.GameState?.getCurrentPlayer?.();
  if (currentPlayer?.id) {
    this.setState({ currentPlayerId: currentPlayer.id });
  }
  
  // Add event listener for reset buttons event
  window.addEventListener('resetSpaceInfoButtons', this.handleResetButtons);
}

componentWillUnmount() {
  // Remove event listener
  window.removeEventListener('resetSpaceInfoButtons', this.handleResetButtons);
}

handleResetButtons = () => {
  this.setState({ usedButtons: [] });
}
```

**After Refactoring (April 28, 2025)**:
```javascript
constructor(props) {
  super(props);
  
  console.log('SpaceInfo: Constructor initialized');
  
  // Minimal state - only tracking render-specific items
  // All game state is managed by SpaceInfoManager
  this.state = {
    renderKey: 0 // Used to force re-renders when needed
  };
  
  // Store event handlers for proper cleanup
  this.eventHandlers = {
    resetButtons: this.handleResetButtons.bind(this),
    turnChanged: this.handleTurnChanged.bind(this),
    spaceChanged: this.handleSpaceChanged.bind(this)
  };
  
  console.log('SpaceInfo: Constructor completed');
}

componentDidMount() {
  console.log('SpaceInfo: Component mounted');
  
  // Add event listener for reset buttons event (legacy compatibility)
  window.addEventListener('resetSpaceInfoButtons', this.eventHandlers.resetButtons);
  
  // Register for GameStateManager events
  if (window.GameStateManager) {
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  }
  
  // Check manager availability
  if (!window.SpaceInfoManager) {
    console.error('SpaceInfo: SpaceInfoManager not available');
  }
}

componentWillUnmount() {
  console.log('SpaceInfo: Component unmounting, cleaning up listeners');
  
  // Remove window event listener
  window.removeEventListener('resetSpaceInfoButtons', this.eventHandlers.resetButtons);
  
  // Remove GameStateManager event listeners
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  }
}

// Handle the reset buttons event
handleResetButtons() {
  console.log('SpaceInfo: Received resetSpaceInfoButtons event, forcing refresh');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}

// Handle turn change events
handleTurnChanged() {
  console.log('SpaceInfo: Handling turn changed event');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}

// Handle space change events
handleSpaceChanged() {
  console.log('SpaceInfo: Handling space changed event');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}

// Get CSS class for space phase using SpaceInfoManager
getPhaseClass(type) {
  // Use the SpaceInfoManager to get the phase class
  if (window.SpaceInfoManager) {
    return window.SpaceInfoManager.getPhaseClass(type);
  }
  
  // Fallback if manager is not available
  console.warn('SpaceInfo: SpaceInfoManager not available for getPhaseClass');
  return 'space-phase-default';
}
```

## Future Integrations

As development continues, all remaining components should be integrated with the GameStateManager event system. This will create a consistent architecture throughout the game, making it easier to maintain, debug, and extend.

Priority components for integration:

1. WorkCardDialogs
2. BoardSpaceRenderer
3. DiceRoll
4. CardDisplay
5. BoardRenderer

## Best Practices

1. **Always Use Standard Logging**: Include console.log statements at the beginning and end of each method.
2. **Store Event Handlers in Constructor**: Bind event handlers in the constructor and store references for cleanup.
3. **Add Cleanup Methods**: Always implement cleanup methods to prevent memory leaks.
4. **Use Descriptive Event Names**: Make event names descriptive and follow the established naming convention.
5. **Include Adequate Event Data**: Ensure event data contains all necessary information for handling the event.
6. **Maintain Backward Compatibility**: Update components to use events but maintain backward compatibility where necessary.
7. **Document Event Usage**: Update component documentation to reflect event usage.
8. **Implement Manager-Based State Management**: Delegate state management to manager classes when possible.
9. **Use CSS Classes Instead of Inline Styles**: Assign CSS classes from managers instead of inline styles.
10. **Implement Proper Event Cleanup**: Always remove event listeners in componentWillUnmount or cleanup methods.

---

*Last Updated: April 29, 2025*