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

The SpaceExplorer component was initially integrated with the manager pattern on April 26, 2025, and then enhanced with a hybrid architecture on April 27, 2025.

### Initial Manager Pattern Integration (April 26, 2025)

1. **Converting from State to Props**:
   - Instead of maintaining its own state with event listeners, the component received space data and other properties via props from SpaceExplorerManager.
   - This improved separation of concerns and better followed the manager pattern.

2. **Removing Direct Event Handling**:
   - Removed direct event listeners with GameStateManager.
   - The component relied on SpaceExplorerManager to handle events and pass updates via props.

3. **Implementing Simplified Communication**:
   - The component called props.onClose when the close button is clicked instead of dispatching events directly.
   - This created a cleaner boundary between the component and the event system.

### Hybrid Architecture Enhancement (April 27, 2025)

1. **Hybrid State Management**:
   - Implemented a hybrid approach that works with both props-based (manager) and event-based architectures.
   - Added direct GameStateManager event handling while maintaining props compatibility.
   - Component can now function both as a standalone component or as part of the manager system.

2. **Performance Monitoring**:
   - Added render count and timing metrics for performance tracking.
   - Implemented warning system for detecting rapid re-renders.
   - Added performance tracking properties (renderCount, lastRenderTime).

3. **Enhanced Error Handling**:
   - Implemented comprehensive error boundary with detailed stack trace logging.
   - Added component stack information to error reports.
   - Improved error state recovery with better fallbacks.

4. **Resource Management**:
   - Enhanced componentWillUnmount for thorough resource cleanup.
   - Added proper event listener management when used in standalone mode.
   - Improved state transitions for better resource handling.

5. **Consistent Logging**:
   - Added uniform console.log statements at beginning and end of all methods.
   - Standardized logging format for better debugging.
   - Improved log context with more descriptive messages.

### Before-After Code Comparison

**Event-based approach (Before)**:
```javascript
constructor(props) {
  this.eventHandlers = {
    playerMoved: this.handlePlayerMoved.bind(this),
    // Other event handlers
  };
  
  this.state = {
    space: null,
    visitType: 'first',
    diceRollData: []
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

**Hybrid approach (After April 27, 2025)**:
```javascript
constructor(props) {
  console.log('SpaceExplorer: Constructor initialized');
  
  super(props);
  // Initialize state with error information and UI-specific state
  this.state = {
    hasError: false,
    errorMessage: '',
    // Cache for processed dice data to avoid reprocessing on every render
    processedDiceData: null,
    // Flag to track if data has been processed
    diceDataProcessed: false
  };
  
  // Track performance metrics for debugging
  this.renderCount = 0;
  this.lastRenderTime = 0;
  
  // Bind methods to ensure proper this context
  this.handleGameStateChange = this.handleGameStateChange.bind(this);
  this.handleCloseExplorer = this.handleCloseExplorer.bind(this);
  
  console.log('SpaceExplorer: Constructor completed');
}

componentDidMount() {
  console.log('SpaceExplorer: componentDidMount method is being used');
  
  // Process dice data if props are available
  this.processDiceDataFromProps();
  
  // Register event listeners with GameStateManager
  if (window.GameStateManager) {
    window.GameStateManager.addEventListener('gameStateChanged', this.handleGameStateChange);
  } else {
    console.warn('SpaceExplorer: GameStateManager not available, cannot register events');
  }
  
  console.log('SpaceExplorer: componentDidMount method completed');
}

// Handler for gameStateChanged events
handleGameStateChange(event) {
  console.log('SpaceExplorer: handleGameStateChange method is being used');
  
  // Only process events that might affect explorer content
  if (event.data && ['playerMoved', 'cardDrawn', 'cardPlayed', 'newGame'].includes(event.data.changeType)) {
    // Reprocess dice data when relevant game state changes
    this.processDiceDataFromProps();
  }
  
  console.log('SpaceExplorer: handleGameStateChange method completed');
}

processDiceDataFromProps() {
  console.log('SpaceExplorer: processDiceDataFromProps method is being used');
  
  const { space, diceRollData, visitType } = this.props;
  
  if (space && diceRollData) {
    try {
      // Process dice data and update state
      const processedData = this.processDiceData(space, diceRollData, visitType);
      this.setState({ 
        processedDiceData: processedData,
        diceDataProcessed: true
      });
    } catch (error) {
      console.error('SpaceExplorer: Error processing dice data:', error.message);
      this.setState({ 
        processedDiceData: null,
        diceDataProcessed: true
      });
    }
  }
  
  console.log('SpaceExplorer: processDiceDataFromProps method completed');
}

handleCloseExplorer() {
  console.log('SpaceExplorer: handleCloseExplorer method is being used');
  
  // Call props.onClose if available
  if (this.props.onClose && typeof this.props.onClose === 'function') {
    this.props.onClose();
    
    // Dispatch event using GameStateManager
    if (window.GameStateManager) {
      window.GameStateManager.dispatchEvent('spaceExplorerToggled', {
        visible: false,
        spaceName: this.props.space ? this.props.space.name : ''
      });
    }
  }
  
  console.log('SpaceExplorer: handleCloseExplorer method completed');
}

componentWillUnmount() {
  console.log('SpaceExplorer: componentWillUnmount method is being used');
  
  // Remove GameStateManager event listeners
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('gameStateChanged', this.handleGameStateChange);
  }
  
  // Clear any timers or resources if used
  this.lastRenderTime = 0;
  this.renderCount = 0;
  
  console.log('SpaceExplorer: componentWillUnmount method completed');
}

render() {
  console.log('SpaceExplorer: render method is being used');
  
  // Performance tracking for debugging
  this.renderCount++;
  const currentTime = performance.now();
  if (this.lastRenderTime > 0) {
    const renderInterval = currentTime - this.lastRenderTime;
    if (renderInterval < 100) {
      console.warn('SpaceExplorer: Multiple renders occurring rapidly, interval:', 
                  renderInterval.toFixed(2), 'ms');
    }
  }
  this.lastRenderTime = currentTime;
  
  // Use props for rendering, with state for processed data
  const { space } = this.props;
  const { processedDiceData } = this.state;
  
  // Render component with error handling
  // ...
  
  console.log('SpaceExplorer: render method completed');
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

*Last Updated: April 27, 2025*