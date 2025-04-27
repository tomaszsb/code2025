# GameStateManager Event System

## Overview

The GameStateManager is the central event system hub for the game, providing a standardized way for components to communicate without direct dependencies. It implements a publish-subscribe pattern that enables loose coupling between components while maintaining a consistent approach to state changes and updates.

## Core Functionality

The GameStateManager provides three primary capabilities:

1. **Event Registration**: Components can register handlers for specific event types
2. **Event Dispatching**: Components can dispatch events to notify others of state changes
3. **Event Listening**: Components can listen for and respond to events from other components

## Event System API

### Event Registration

```javascript
/**
 * Register an event handler for a specific event type
 * @param {string} eventType - The type of event to listen for
 * @param {function} handler - The handler function to call when the event occurs
 */
addEventListener(eventType, handler) {
  if (!this.eventHandlers[eventType]) {
    this.eventHandlers[eventType] = [];
  }
  
  this.eventHandlers[eventType].push(handler);
  
  console.log(`GameStateManager: Event handler registered for ${eventType}`);
}
```

### Event Removal

```javascript
/**
 * Remove an event handler for a specific event type
 * @param {string} eventType - The type of event to stop listening for
 * @param {function} handler - The handler function to remove
 */
removeEventListener(eventType, handler) {
  if (!this.eventHandlers[eventType]) {
    console.warn(`GameStateManager: No handlers registered for ${eventType}`);
    return;
  }
  
  const index = this.eventHandlers[eventType].indexOf(handler);
  if (index >= 0) {
    this.eventHandlers[eventType].splice(index, 1);
    console.log(`GameStateManager: Event handler removed for ${eventType}`);
  } else {
    console.warn(`GameStateManager: Handler not found for ${eventType}`);
  }
}
```

### Event Dispatching

```javascript
/**
 * Dispatch an event to all registered handlers for the event type
 * @param {string} eventType - The type of event to dispatch
 * @param {Object} data - The data to include with the event
 */
dispatchEvent(eventType, data) {
  if (!this.eventHandlers[eventType]) {
    console.warn(`GameStateManager: No handlers registered for ${eventType}`);
    return;
  }
  
  const event = {
    type: eventType,
    data: data,
    timestamp: Date.now()
  };
  
  console.log(`GameStateManager: Dispatching ${eventType} event`, data);
  
  this.eventHandlers[eventType].forEach(handler => {
    try {
      handler(event);
    } catch (error) {
      console.error(`GameStateManager: Error in handler for ${eventType}:`, error.message);
    }
  });
}
```

## Standard Event Types

The GameStateManager defines several standard event types that components can use:

| Event Type            | Description                                        | Common Data Properties                             |
|-----------------------|----------------------------------------------------|---------------------------------------------------|
| playerMoved           | Fired when a player moves to a new space           | playerId, fromSpaceId, toSpaceId, player          |
| turnChanged           | Fired when the active player changes               | previousPlayerIndex, currentPlayerIndex           |
| gameStateChanged      | Fired for general game state changes               | changeType, additionalData                         |
| cardDrawn             | Fired when a player draws a card                   | playerId, player, cardType, card                   |
| cardPlayed            | Fired when a player plays a card                   | playerId, player, card                             |
| diceRolled            | Fired when dice are rolled                         | playerId, result, affectedSpaceId                  |
| spaceExplorerToggled  | Fired when space explorer visibility changes       | visible, spaceName                                 |
| negotiationStarted    | Fired when a negotiation begins                    | initiatorId, targetId, resourceType, amount        |
| negotiationCompleted  | Fired when a negotiation completes                 | initiatorId, targetId, accepted, finalAmount       |

## Integration with SpaceExplorer Component

The GameStateManager has been updated to properly support the enhanced SpaceExplorer component (April 27, 2025 update) which features a hybrid architecture:

1. **Bidirectional Event Flow**:
   - Handles events directly from SpaceExplorer (bypassing SpaceExplorerManager when needed)
   - Supports both the props-based and event-based architectures simultaneously
   - Properly coordinates events to avoid duplicates or conflicting updates

2. **Detailed Error Propagation**:
   - Processes error events from SpaceExplorer's enhanced error boundary
   - Formats and enriches error information for centralized logging
   - Can notify other components about errors to enable graceful degradation

3. **Performance Monitoring Support**:
   - Works with SpaceExplorer's performance tracking system
   - Optimizes event dispatch to minimize performance impact
   - Respects render timing to avoid triggering unnecessary re-renders

## Component Integration Pattern

When integrating components with the GameStateManager, follow this pattern:

1. **Store event handlers in component constructor**:
```javascript
this.eventHandlers = {
  eventName1: this.handleEventName1.bind(this),
  eventName2: this.handleEventName2.bind(this)
};
```

2. **Register event listeners in componentDidMount**:
```javascript
componentDidMount() {
  if (window.GameStateManager) {
    window.GameStateManager.addEventListener('eventName1', this.eventHandlers.eventName1);
    window.GameStateManager.addEventListener('eventName2', this.eventHandlers.eventName2);
  }
}
```

3. **Remove event listeners in componentWillUnmount**:
```javascript
componentWillUnmount() {
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('eventName1', this.eventHandlers.eventName1);
    window.GameStateManager.removeEventListener('eventName2', this.eventHandlers.eventName2);
  }
}
```

4. **Dispatch events when state changes**:
```javascript
handleStateChange() {
  if (window.GameStateManager) {
    window.GameStateManager.dispatchEvent('eventName', {
      // Event data properties
    });
  }
}
```

## Error Handling

The GameStateManager implements comprehensive error handling to prevent event system failures:

1. **Event Handler Error Isolation**:
   - Each handler is called within a try/catch block
   - Errors in one handler don't prevent other handlers from executing
   - Detailed error logging with handler context

2. **Event Type Validation**:
   - Validates that event types are registered before dispatching
   - Provides warnings for unregistered event types
   - Supports dynamic event type registration

3. **Handler Validation**:
   - Verifies that handlers are functions before registration
   - Properly handles removal of non-existent handlers
   - Prevents duplicate handler registration

## Benefits of GameStateManager

The GameStateManager provides several key benefits:

1. **Loose Coupling**: Components don't need direct references to each other
2. **Maintainability**: Easier to add, remove, or modify components without breaking others
3. **Testability**: Components can be tested in isolation by mocking the event system
4. **Debugging**: Centralized event logging makes it easier to trace application flow
5. **Error Resilience**: Isolated error handling prevents cascade failures
6. **Performance**: Optimized event dispatch with minimal overhead

## Future Enhancements

Planned enhancements for the GameStateManager include:

1. **Event Prioritization**: Support for prioritizing event handlers
2. **Async Event Handling**: Support for async event handlers with proper sequence guarantee
3. **Event History**: Recording event history for debugging and replay
4. **Event Filtering**: Support for filtering events based on properties
5. **Event Batching**: Batch multiple events to improve performance
6. **Performance Metrics**: Built-in performance monitoring for event dispatch

## Integration Status

The GameStateManager is now integrated with the following components:

| Component                | Status      | Date Completed | Integration Type            |
|--------------------------|-------------|----------------|-----------------------------|
| SpaceExplorer            | Enhanced    | April 27, 2025 | Hybrid (Direct + Manager)   |
| SpaceExplorerManager     | Completed   | April 22, 2025 | Direct                      |
| SpaceExplorerLoggerManager | Completed | April 22, 2025 | Direct                      |
| TurnManager              | Completed   | April 20, 2025 | Direct                      |
| DiceManager              | Completed   | April 18, 2025 | Direct                      |
| CardManager              | Completed   | April 19, 2025 | Direct                      |
| NegotiationManager       | Completed   | April 19, 2025 | Direct                      |
| SpaceSelectionManager    | Completed   | April 21, 2025 | Direct                      |

---

*Last Updated: April 27, 2025*