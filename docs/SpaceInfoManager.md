# SpaceInfoManager

## Overview

The SpaceInfoManager is a manager class that handles space information display, interactions, and styling. It follows the manager pattern with proper initialization, event handling, and cleanup. The manager is responsible for tracking button states, providing CSS classes for space phases, and coordinating with the GameStateManager event system.

## Key Features

- Manages button state tracking using Map and Set data structures
- Provides CSS classes for space phases instead of inline styles
- Listens for GameStateManager events to update component state
- Handles card drawing through the GameStateManager
- Includes backward compatibility for legacy code

## Integration with Manager Pattern

SpaceInfoManager follows the manager pattern by encapsulating state management and business logic that would otherwise be in the SpaceInfo component.

### Constructor

```javascript
constructor() {
  console.log('SpaceInfoManager: Constructor initialized');
  
  // Configuration
  this.phaseColors = {
    'SETUP': 'space-phase-setup',
    'OWNER': 'space-phase-owner',
    'FUNDING': 'space-phase-funding',
    'DESIGN': 'space-phase-design',
    'REGULATORY': 'space-phase-regulatory',
    'CONSTRUCTION': 'space-phase-construction',
    'END': 'space-phase-end'
  };
  
  // State tracking
  this.usedButtons = new Map(); // Map of playerID -> Set of used button IDs
  this.initialized = false;
  
  // Store event handlers for proper cleanup
  this.eventHandlers = {
    gameStateChanged: this.handleGameStateChangedEvent.bind(this),
    turnChanged: this.handleTurnChangedEvent.bind(this),
    spaceChanged: this.handleSpaceChangedEvent.bind(this)
  };
  
  // Register event listeners with GameStateManager
  this.registerEventListeners();
  
  this.initialized = true;
  console.log('SpaceInfoManager: Constructor completed');
}
```

### Event Registration

```javascript
registerEventListeners() {
  console.log('SpaceInfoManager: Registering event listeners');
  
  if (!window.GameStateManager) {
    console.error('SpaceInfoManager: GameStateManager not available, cannot register events');
    return;
  }
  
  // Register for game state events
  window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
  window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
  window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  
  console.log('SpaceInfoManager: Event listeners registered successfully');
}
```

### Event Handling

```javascript
handleGameStateChangedEvent(event) {
  console.log('SpaceInfoManager: Handling gameStateChanged event');
  
  if (!event || !event.data) {
    return;
  }
  
  // Handle relevant game state changes
  if (event.data.changeType === 'newGame') {
    // Reset used buttons for a new game
    this.usedButtons.clear();
    console.log('SpaceInfoManager: Cleared used buttons for new game');
  }
}

handleTurnChangedEvent(event) {
  console.log('SpaceInfoManager: Handling turnChanged event');
  
  // Reset space-specific button state when turn changes
  const currentPlayer = window.GameStateManager.getCurrentPlayer();
  if (currentPlayer) {
    this.resetButtonsForPlayer(currentPlayer.id);
  }
}

handleSpaceChangedEvent(event) {
  console.log('SpaceInfoManager: Handling spaceChanged event');
  
  // Space has changed, we may need to reset buttons for the specific space
  const currentPlayer = window.GameStateManager.getCurrentPlayer();
  if (currentPlayer && event.data && event.data.spaceId) {
    this.resetButtonsForSpace(currentPlayer.id, event.data.spaceId);
  }
}
```

### Button State Management

SpaceInfoManager uses efficient data structures for managing button states:

```javascript
isButtonUsed(playerId, buttonId) {
  if (!playerId || !buttonId) return false;
  
  const playerButtons = this.usedButtons.get(playerId);
  return playerButtons ? playerButtons.has(buttonId) : false;
}

markButtonUsed(playerId, buttonId) {
  if (!playerId || !buttonId) return;
  
  console.log(`SpaceInfoManager: Marking button ${buttonId} as used by player ${playerId}`);
  
  // Get or create the set of used buttons for this player
  const playerButtons = this.usedButtons.get(playerId) || new Set();
  
  // Add the button ID
  playerButtons.add(buttonId);
  
  // Update the map
  this.usedButtons.set(playerId, playerButtons);
}

resetButtonsForPlayer(playerId) {
  if (!playerId) return;
  
  console.log(`SpaceInfoManager: Resetting buttons for player ${playerId}`);
  
  // Remove player from used buttons tracking
  this.usedButtons.delete(playerId);
}

resetButtonsForSpace(playerId, spaceId) {
  if (!playerId || !spaceId) return;
  
  console.log(`SpaceInfoManager: Resetting buttons for player ${playerId} and space ${spaceId}`);
  
  // Get the set of used buttons for this player
  const playerButtons = this.usedButtons.get(playerId) || new Set();
  
  // Remove all buttons related to this space
  const buttonsToRemove = [];
  playerButtons.forEach(buttonId => {
    if (buttonId.includes(`-${spaceId}-`)) {
      buttonsToRemove.push(buttonId);
    }
  });
  
  // Remove the buttons
  buttonsToRemove.forEach(buttonId => {
    playerButtons.delete(buttonId);
  });
  
  // Update the map
  this.usedButtons.set(playerId, playerButtons);
  
  console.log(`SpaceInfoManager: Removed ${buttonsToRemove.length} buttons for space ${spaceId}`);
}
```

### CSS Class Management

The manager provides CSS classes for space phases instead of using inline styles:

```javascript
getPhaseClass(type) {
  if (!type) return 'space-phase-default';
  
  const normalizedType = type.toUpperCase();
  return this.phaseColors[normalizedType] || 'space-phase-default';
}
```

### Card Drawing

The manager handles card drawing through the GameStateManager:

```javascript
drawCards(playerId, cardType, amount) {
  if (!playerId || !cardType) return [];
  
  console.log(`SpaceInfoManager: Drawing ${amount} ${cardType} cards for player ${playerId}`);
  
  const drawnCards = [];
  
  // Use GameStateManager to draw cards
  for (let i = 0; i < amount; i++) {
    const card = window.GameStateManager.drawCard(playerId, cardType);
    if (card) {
      drawnCards.push(card);
    }
  }
  
  return drawnCards;
}
```

### Movement Handling

```javascript
moveToSpace(playerId, spaceId) {
  if (!playerId || !spaceId) return;
  
  console.log(`SpaceInfoManager: Moving player ${playerId} to space ${spaceId}`);
  
  // Use GameStateManager to move the player
  window.GameStateManager.movePlayer(playerId, spaceId);
}
```

### Cleanup

```javascript
cleanup() {
  console.log('SpaceInfoManager: Cleaning up resources');
  
  // Remove all event listeners
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  }
  
  // Clear state
  this.usedButtons.clear();
  
  console.log('SpaceInfoManager: Cleanup completed');
}
```

## Backward Compatibility

The SpaceInfoManager includes a backward compatibility layer for legacy code:

```javascript
class SpaceInfoBackwardCompatibility {
  constructor(manager) {
    console.log('SpaceInfoBackwardCompatibility: Initializing compatibility layer');
    this.manager = manager;
    
    // Add global event handler for resetSpaceInfoButtons
    window.resetSpaceInfoButtons = () => {
      console.log('SpaceInfoBackwardCompatibility: Received resetSpaceInfoButtons global call');
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      if (currentPlayer) {
        this.manager.resetButtonsForPlayer(currentPlayer.id);
      }
      
      // Legacy event for backward compatibility
      const resetEvent = new Event('resetSpaceInfoButtons');
      window.dispatchEvent(resetEvent);
    };
    
    // Add global utility function for logging negotiate button usage
    window.logSpaceNegotiateUsage = (spaceName) => {
      console.log(`SpaceInfoBackwardCompatibility: Negotiate button shown for space: ${spaceName}`);
    };
    
    console.log('SpaceInfoBackwardCompatibility: Compatibility layer initialized');
  }
}
```

## Initialization

```javascript
// Initialize manager and compatibility layer
(function() {
  console.log('SpaceInfoManager: Initializing manager...');
  
  // Create manager instance
  const spaceInfoManager = new SpaceInfoManager();
  
  // Create compatibility layer
  const compatibilityLayer = new SpaceInfoBackwardCompatibility(spaceInfoManager);
  
  // Store manager reference on window for direct access if needed
  window.SpaceInfoManager = spaceInfoManager;
  
  console.log('SpaceInfoManager: Manager initialized and compatibility layer set up');
})();
```

## Performance Considerations

SpaceInfoManager provides several performance benefits:

1. **Efficient Data Structures**:
   - Uses Map for player-to-buttons mapping
   - Uses Set for button tracking
   - Provides O(1) lookups for button state

2. **Reduced DOM Updates**:
   - Button state is managed through the manager, reducing direct DOM manipulation
   - CSS classes are provided by the manager, eliminating inline style updates

3. **Event Delegation**:
   - Handles events through the GameStateManager event system
   - Reduces direct event handling in the component

4. **Memory Management**:
   - Properly cleans up all event listeners in the cleanup method
   - Clears button state data when appropriate

## Usage Examples

### Getting Phase Class

```javascript
// In SpaceInfo component
const phaseClass = window.SpaceInfoManager.getPhaseClass(space.type);
return (
  <div className={`space-info ${phaseClass}`}>
    {/* Content */}
  </div>
);
```

### Checking Button State

```javascript
// In SpaceInfo component
const isButtonUsed = window.SpaceInfoManager.isButtonUsed(playerId, buttonId);
return (
  <button 
    className={`draw-cards-btn ${isButtonUsed ? 'used' : ''}`}
    disabled={isButtonUsed}
  >
    {isButtonUsed ? 'Cards Drawn' : 'Draw Cards'}
  </button>
);
```

### Drawing Cards

```javascript
// In SpaceInfo component
const handleDrawCards = () => {
  if (window.SpaceInfoManager) {
    window.SpaceInfoManager.markButtonUsed(playerId, buttonId);
    const drawnCards = window.SpaceInfoManager.drawCards(playerId, cardType, amount);
    console.log(`Drew ${drawnCards.length} cards`);
  }
};
```

## Testing and Debugging

When testing or debugging SpaceInfoManager, check the following:

1. **Button State Tracking**:
   - Verify that buttons are properly marked as used after clicking
   - Check that button states are reset when turns change
   - Ensure that button states are properly tracked for each player

2. **Event Handling**:
   - Confirm that the manager is properly registering for GameStateManager events
   - Check that event handlers are being called when expected
   - Verify that cleanup is properly removing event listeners

3. **CSS Class Provision**:
   - Ensure that the manager is providing the correct CSS classes for space phases
   - Check that the SpaceInfo component is properly applying the classes

4. **Card Drawing**:
   - Verify that cards are properly drawn through the manager
   - Check that drawn cards are added to the player's hand
   - Ensure that button state is updated after drawing cards

## Future Enhancements

Potential future enhancements for SpaceInfoManager include:

1. **Enhanced Event Handling**: Add more event types for finer-grained control
2. **Performance Metrics**: Add tracking for button usage and state changes
3. **Conditional Button Logic**: Expand the conditional logic for button display
4. **Improved Debugging**: Add more detailed logging for development mode
5. **State Persistence**: Add persistence for button states across sessions

---

*Last Updated: April 28, 2025*