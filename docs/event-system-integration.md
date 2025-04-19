# Event System Integration

This document provides guidance and documentation for the ongoing integration of the GameStateManager event system throughout the application.

## Overview

The GameStateManager now features a robust event system that allows for standardized communication between components. By using this event system rather than direct state manipulation, we achieve better separation of concerns, improved testability, and more consistent behavior across the application.

## Current Status

- ✓ COMPLETED! GameStateManager has a fully implemented event system
- ✓ COMPLETED! CardManager has been refactored to use the event system
- ONGOING: Other manager components need to be refactored 

## Implementation Guidelines

### 1. Event Types

The following event types are standardized in GameStateManager:

- `playerMoved`: Dispatched when a player's position changes
- `turnChanged`: Dispatched when the turn changes to a new player
- `gameStateChanged`: Dispatched for general state changes (with `changeType` property)
- `cardDrawn`: Dispatched when a card is drawn
- `cardPlayed`: Dispatched when a card is played

When adding new event types, follow the same naming convention and document them here.

### 2. Event Registration

```javascript
// Register an event listener
const handler = window.GameStateManager.addEventListener('eventType', (event) => {
  // Handle the event
  console.log('Event received:', event.data);
});
```

Always store a reference to the event handler for later cleanup:

```javascript
this.eventHandlers = {
  eventType: this.handleEvent.bind(this)
};

window.GameStateManager.addEventListener('eventType', this.eventHandlers.eventType);
```

### 3. Event Handlers

Event handlers should be clean, focused methods:

```javascript
handleEventName(event) {
  // Process the event
  console.log('Event data:', event.data);
  
  // Update component state if needed
  this.updateComponentState();
}
```

### 4. Event Cleanup

Always remove event listeners when a component unmounts:

```javascript
cleanup() {
  // Remove all event listeners
  window.GameStateManager.removeEventListener('eventType', this.eventHandlers.eventType);
  
  // Additional cleanup if needed
}
```

### 5. Component Integration Pattern

For each manager component, follow this integration pattern:

1. Store event handler references in constructor
2. Register event listeners during initialization
3. Create focused handler methods
4. Add cleanup method to remove listeners
5. Update existing methods to use events
6. Update the GameBoard cleanup method

## CardManager Integration Example

The CardManager component demonstrates the correct pattern for event system integration:

```javascript
// In constructor
this.eventHandlers = {
  cardDrawn: this.handleCardDrawnEvent.bind(this),
  cardPlayed: this.handleCardPlayedEvent.bind(this),
  gameStateChanged: this.handleGameStateChangedEvent.bind(this)
};

// Register listeners
this.registerEventListeners();

// Event handler method
handleCardDrawnEvent(event) {
  // Process the event
  if (event.data && event.data.card && event.data.player) {
    this.processCardEffects(event.data.card, event.data.player, false);
  }
}

// Cleanup method
cleanup() {
  // Remove all event listeners
  window.GameStateManager.removeEventListener('cardDrawn', this.eventHandlers.cardDrawn);
  window.GameStateManager.removeEventListener('cardPlayed', this.eventHandlers.cardPlayed);
  window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
}
```

## Next Components for Integration

The following components should be prioritized for event system integration:

1. **DiceManager**: Replace direct state updates with event-based updates
2. **SpaceSelectionManager**: Use events for space selection and available moves
3. **NegotiationManager**: Leverage events for negotiation state

## Testing Event System Integration

The `Index-debug.html` file provides a test harness for event system integration. Use it to:

1. Test event dispatching and handling
2. Verify proper cleanup
3. Debug event-related issues

## Benefits

The event system integration provides several key benefits:

1. **Decoupling**: Components don't need direct references to each other
2. **Consistency**: Standardized approach to state changes
3. **Testability**: Events can be easily mocked and tested
4. **Performance**: Reduced state updates and re-renders
5. **Maintainability**: Clearer patterns and data flow

## Best Practices

1. Always use the event system for state changes that affect multiple components
2. Keep event handlers focused on a single responsibility
3. Document all event types and their data structures
4. Always clean up event listeners to prevent memory leaks
5. Use the test harness to verify correct event handling

## Conclusion

The event system integration is a critical upgrade that improves the architectural quality of the codebase. By following these guidelines and the example provided by CardManager, other components can be integrated with the event system in a consistent, maintainable way.

---

*Last Updated: April 19, 2025*
