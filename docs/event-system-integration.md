# Event System Integration

This document provides guidance and documentation for the ongoing integration of the GameStateManager event system throughout the application.

## Overview

The GameStateManager now features a robust event system that allows for standardized communication between components. By using this event system rather than direct state manipulation, we achieve better separation of concerns, improved testability, and more consistent behavior across the application.

## Current Status

- ✓ COMPLETED! GameStateManager has a fully implemented event system
- ✓ COMPLETED! CardManager has been refactored to use the event system
- ✓ COMPLETED! DiceManager has been refactored to use the event system
- ✓ COMPLETED! SpaceSelectionManager has been refactored to use the event system
- ✓ COMPLETED! NegotiationManager has been refactored to use the event system
- ONGOING: Other manager components need to be refactored

## Implementation Guidelines

### 1. Event Types

The following event types are standardized in GameStateManager:

- `playerMoved`: Dispatched when a player's position changes
- `turnChanged`: Dispatched when the turn changes to a new player
- `gameStateChanged`: Dispatched for general state changes (with `changeType` property)
- `cardDrawn`: Dispatched when a card is drawn
- `cardPlayed`: Dispatched when a card is played
- `diceRolled`: Dispatched when dice are rolled
- `spaceSelected`: Dispatched when a space is selected
- `negotiationStarted`: Dispatched when a player starts negotiation
- `negotiationCompleted`: Dispatched when negotiation is completed

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

## SpaceSelectionManager Integration Example

The SpaceSelectionManager provides another good example of event system integration:

```javascript
// In constructor
this.eventHandlers = {
  playerMoved: this.handlePlayerMovedEvent.bind(this),
  turnChanged: this.handleTurnChangedEvent.bind(this),
  gameStateChanged: this.handleGameStateChangedEvent.bind(this),
  spaceSelected: this.handleSpaceSelectedEvent.bind(this)
};

// Register listeners
this.registerEventListeners();

// Event handler method for player movements
handlePlayerMovedEvent(event) {
  // Process the event
  console.log('Player moved event received', event.data);
  
  // Update available moves when a player moves
  this.updateAvailableMoves();
  
  // Reset any selected move
  this.resetSelectedMove();
}

// Dispatch event for space selection
handleSpaceClick(spaceId) {
  // Find the clicked space
  const clickedSpace = this.findSpaceById(spaceId);
  
  // Dispatch event
  window.GameStateManager.dispatchEvent('spaceSelected', {
    spaceId: spaceId,
    spaceData: clickedSpace,
    isValidMove: this.isValidMove(spaceId)
  });
}

// Cleanup method
cleanup() {
  // Clear timers
  if (this.visualUpdateTimer) {
    clearTimeout(this.visualUpdateTimer);
  }
  
  // Remove all event listeners
  window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
  window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
  window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
  window.GameStateManager.removeEventListener('spaceSelected', this.eventHandlers.spaceSelected);
}
```

## NegotiationManager Integration Example

The NegotiationManager integration demonstrates how to add custom event types and maintain backward compatibility:

```javascript
// In constructor
this.eventHandlers = {
  playerMoved: this.handlePlayerMovedEvent.bind(this),
  turnChanged: this.handleTurnChangedEvent.bind(this),
  gameStateChanged: this.handleGameStateChangedEvent.bind(this),
  negotiationStarted: this.handleNegotiationStartedEvent.bind(this),
  negotiationCompleted: this.handleNegotiationCompletedEvent.bind(this)
};

// Register custom events
registerEventListeners() {
  // Register standard events
  window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
  window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
  window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
  
  // Add custom events if not already defined
  if (!window.GameStateManager.eventHandlers['negotiationStarted']) {
    window.GameStateManager.eventHandlers['negotiationStarted'] = [];
  }
  window.GameStateManager.addEventListener('negotiationStarted', this.eventHandlers.negotiationStarted);
  
  if (!window.GameStateManager.eventHandlers['negotiationCompleted']) {
    window.GameStateManager.eventHandlers['negotiationCompleted'] = [];
  }
  window.GameStateManager.addEventListener('negotiationCompleted', this.eventHandlers.negotiationCompleted);
}

// Dispatch custom events
handleNegotiate() {
  // Initial validation...
  
  // Dispatch negotiation started event
  window.GameStateManager.dispatchEvent('negotiationStarted', {
    player: currentPlayer,
    space: currentSpace
  });
  
  // Negotiation logic...
  
  // Dispatch negotiation completed event
  window.GameStateManager.dispatchEvent('negotiationCompleted', {
    previousPlayer: currentPlayer,
    currentPlayer: newCurrentPlayer,
    space: currentSpace,
    newSpace: newSpace,
    timeAdded: timeToAdd
  });
  
  // For backward compatibility with non-refactored components
  const resetEvent = new CustomEvent('resetSpaceInfoButtons');
  window.dispatchEvent(resetEvent);
}
```

## Next Components for Integration

The following components should be prioritized for event system integration:

1. ✓ **COMPLETED!** ~~DiceManager~~: Replace direct state updates with event-based updates
2. ✓ **COMPLETED!** ~~SpaceSelectionManager~~: Use events for space selection and available moves
3. ✓ **COMPLETED!** ~~NegotiationManager~~: Leverage events for negotiation state

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

The event system integration is a critical upgrade that improves the architectural quality of the codebase. By following these guidelines and the examples provided by CardManager, DiceManager, SpaceSelectionManager, and NegotiationManager, other components can be integrated with the event system in a consistent, maintainable way.

The NegotiationManager integration represents another significant milestone in the project's architectural improvement. With this component now refactored, the game's negotiation mechanics now benefit from the improved decoupling, consistency, and performance provided by the event system. The implementation also demonstrates how to properly add custom event types and maintain backward compatibility with components that have not yet been refactored. This further validates the event system design and provides a comprehensive example for future component integrations.

---

*Last Updated: April 20, 2025* (Updated with NegotiationManager integration)