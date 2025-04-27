# Event System Integration for Game Components

## Overview

This document outlines the process and benefits of integrating game components with the GameStateManager event system. The integration follows a standardized pattern that ensures consistency across components, improves code maintainability, and enhances performance through looser coupling between components.

## Integration Status

| Component                | Status      | Date Completed | Description                                      |
|--------------------------|-------------|----------------|--------------------------------------------------|
| GameStateManager         | Completed   | April 20, 2025 | Core event system implementation                 |
| SpaceExplorerManager     | Completed   | April 22, 2025 | Controls space explorer panel visibility         |
| SpaceExplorerLoggerManager | Completed | April 22, 2025 | Handles CSS and styling for space explorer       |
| SpaceExplorer            | Completed   | April 26, 2025 | Main space exploration display component         |
| TurnManager              | Completed   | April 20, 2025 | Manages player turns                             |
| DiceManager              | Completed   | April 18, 2025 | Handles dice rolling and outcome processing      |
| CardManager              | Completed   | April 19, 2025 | Manages card drawing and playing                 |
| NegotiationManager       | Completed   | April 19, 2025 | Handles negotiation mechanics                    |
| SpaceSelectionManager    | Completed   | April 21, 2025 | Manages available space selection                |

## Event Types

The GameStateManager provides the following standard event types:

| Event Type            | Description                                           | Data Payload                                      |
|-----------------------|-------------------------------------------------------|---------------------------------------------------|
| playerMoved           | Fired when a player moves to a new space              | { playerId, fromSpaceId, toSpaceId, player }      |
| turnChanged           | Fired when the active player changes                  | { previousPlayerIndex, currentPlayerIndex }       |
| gameStateChanged      | Fired for general game state changes                  | { changeType, [additional data] }                 |
| cardDrawn             | Fired when a player draws a card                      | { playerId, player, cardType, card }              |
| cardPlayed            | Fired when a player plays a card                      | { playerId, player, card }                        |
| spaceExplorerToggled  | Fired when the space explorer visibility changes      | { visible, spaceName }                            |

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

## Case Study: SpaceExplorer Integration

The SpaceExplorer component was successfully integrated with the GameStateManager event system on April 26, 2025. This integration involved:

1. **Converting from Props to State**:
   - Instead of receiving space data and visit type via props, the component now listens for events and updates its state.
   - This reduces direct dependencies on parent components.

2. **Adding Event Handlers**:
   - Added handlers for playerMoved, turnChanged, gameStateChanged, and spaceExplorerToggled events.
   - The component now updates itself based on these events.

3. **Implementing Bidirectional Communication**:
   - The component now both listens for events and dispatches events.
   - For example, it dispatches spaceExplorerToggled events when the close button is clicked.

4. **Maintaining Backward Compatibility**:
   - The component still works with props for backward compatibility.
   - This allows for a gradual transition to the event system.

5. **Adding Proper Cleanup**:
   - The component now properly removes event listeners in its cleanup method.
   - This prevents memory leaks and improves performance.

### Before-After Code Comparison

**Before**:
```javascript
componentDidUpdate(prevProps) {
  const { space, diceRollData, visitType } = this.props;
  
  // Only update when props change
  if (space !== prevProps.space || diceRollData !== prevProps.diceRollData) {
    // Process data
  }
}

render() {
  const { space } = this.props;
  // Render using props
}
```

**After**:
```javascript
constructor(props) {
  this.eventHandlers = {
    playerMoved: this.handlePlayerMoved.bind(this),
    // Other event handlers
  };
}

componentDidMount() {
  this.registerEventListeners();
}

registerEventListeners() {
  window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
  // Register other event handlers
}

handlePlayerMoved(event) {
  if (event.data && event.data.toSpaceId) {
    const space = window.GameStateManager.findSpaceById(event.data.toSpaceId);
    if (space) {
      this.setState({ space: space });
    }
  }
}

cleanup() {
  window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
  // Remove other event handlers
}

render() {
  const { space } = this.state;
  // Render using state
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

---

*Last Updated: April 26, 2025*