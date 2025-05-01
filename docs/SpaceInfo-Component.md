# SpaceInfo Component

## Overview

The SpaceInfo component displays detailed information about spaces on the game board. It shows space descriptions, available moves, dice roll outcomes, and card drawing opportunities. The component has been refactored to follow the manager pattern and integrate with the GameStateManager event system.

This component has been modularized into several smaller files to improve maintainability and code organization:
- **SpaceInfo.js** - Main component with core React lifecycle methods
- **SpaceInfoDice.js** - Dice-related rendering and functionality
- **SpaceInfoCards.js** - Card-related functionality for drawing cards
- **SpaceInfoMoves.js** - Move-related functionality
- **SpaceInfoUtils.js** - Utility functions used by other modules

## Key Features

- Displays space details including name, type, and description
- Shows available moves as clickable buttons
- Renders dice roll outcomes in categorized sections
- Provides card drawing buttons for relevant spaces
- Integrates with SpaceInfoManager for state management and styling
- Uses GameStateManager events for state updates
- Uses modular code organization with mixins for better maintainability

## Integration with Manager Pattern

The SpaceInfo component follows the manager pattern by delegating state management and business logic to the SpaceInfoManager. This separation of concerns improves maintainability and testability.

### Component Structure

The component uses a modular approach with mixins:

```javascript
// Main component class
window.SpaceInfo = class SpaceInfo extends React.Component {
  // Core React lifecycle methods and component logic
}

// Apply mixins to add functionality
Object.assign(window.SpaceInfo.prototype, window.SpaceInfoDice);
Object.assign(window.SpaceInfo.prototype, window.SpaceInfoCards);
Object.assign(window.SpaceInfo.prototype, window.SpaceInfoMoves);
```

### SpaceInfoManager Responsibilities

- Tracking button usage state across spaces and players
- Providing CSS classes for space styling
- Managing event listeners for game state changes
- Handling card drawing through GameStateManager
- Resetting button states when turns or spaces change

### SpaceInfo Component Responsibilities

- Rendering the UI based on space data
- Handling user interactions
- Receiving events from GameStateManager
- Applying CSS classes provided by SpaceInfoManager

## Module Organization

### SpaceInfo.js

The main component file containing:
- React component class definition
- Lifecycle methods (constructor, componentDidMount, componentWillUnmount)
- Event handlers (handleResetButtons, handleTurnChanged, handleSpaceChanged)
- Main render method
- Mixin application

### SpaceInfoDice.js

Contains dice-related functionality:
- renderDiceFace - Renders visual dice face representation
- renderDiceOutcomes - Renders categorized dice outcomes

### SpaceInfoCards.js

Contains card-related functionality:
- renderDrawCardsButton - Renders buttons for drawing cards

### SpaceInfoMoves.js

Contains move-related functionality:
- renderAvailableMoves - Renders available move buttons
- renderOwnerFundInitiationButton - Renders special OWNER-FUND-INITIATION button

### SpaceInfoUtils.js

Contains utility functions:
- getPhaseClass - Gets CSS class for space phase
- extractCardType - Extracts standardized card type code
- shouldShowDrawCardButton - Determines if a card draw button should be shown
- shouldShowCardForCondition - Evaluates conditional card draw text

## Event System Integration

The SpaceInfo component integrates with the GameStateManager event system for state updates and communication with other components.

### Event Registration

```javascript
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
```

### Event Cleanup

```javascript
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
```

## CSS Integration

The component uses CSS classes provided by SpaceInfoManager instead of inline styles. This improves performance and maintainability.

```javascript
// Get CSS class for space phase using SpaceInfoUtils
getPhaseClass(type) {
  return window.SpaceInfoUtils.getPhaseClass(type);
}
```

### CSS Classes

The component uses these primary CSS classes:

- `.space-info`: Base styling for the component
- `.space-phase-setup`, `.space-phase-owner`, etc.: Phase-specific styling
- `.space-time-display`: Time display in top right corner
- `.space-section`: Section styling for descriptions, actions, etc.
- `.space-available-moves`: Section for available moves
- `.move-button`: Styling for move buttons
- `.dice-outcomes-display`: Container for dice outcomes
- `.outcome-category`: Category section for dice outcomes
- `.card-section`: Styling for card sections
- `.resource-section`: Styling for resource sections

## Component Usage

The SpaceInfo component is used in the GameBoard component to display information about the currently selected space.

```jsx
<SpaceInfo
  space={this.state.selectedSpace}
  visitType={this.getVisitType(this.state.selectedSpace)}
  availableMoves={this.state.availableMoves}
  onMoveSelect={this.handleMoveSelect}
  diceRoll={this.state.diceRoll}
  diceOutcomes={this.state.diceOutcomes}
  onRollDice={this.handleRollDice}
  hasRolledDice={this.state.hasRolledDice}
  hasDiceRollSpace={this.hasDiceRollSpace()}
  onDrawCards={this.handleDrawCards}
/>
```

## Browser Compatibility

The component uses a browser-friendly approach for modules:

- Uses global window objects for module exports
- Avoids ES module syntax which might not be compatible with all browsers
- Uses prototype-based mixins for method sharing
- Maintains all functionality while supporting different browser environments

## Performance Considerations

- The component uses a minimal state object with only a `renderKey` to force re-renders
- Delegates state management to SpaceInfoManager for better performance
- Uses CSS classes instead of inline styles for better rendering performance
- Implements conditional rendering to minimize unnecessary DOM elements
- Uses Map and Set data structures through SpaceInfoManager for efficient lookups
- Breaks up large component into smaller modules for better maintainability

## Event Handling

### Reset Buttons

```javascript
handleResetButtons() {
  console.log('SpaceInfo: Received resetSpaceInfoButtons event, forcing refresh');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}
```

### Turn Changed

```javascript
handleTurnChanged() {
  console.log('SpaceInfo: Handling turn changed event');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}
```

### Space Changed

```javascript
handleSpaceChanged() {
  console.log('SpaceInfo: Handling space changed event');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}
```

## Future Enhancements

Potential future enhancements for the SpaceInfo component include:

1. **Enhanced Performance Monitoring**: Add render count and timing metrics similar to SpaceExplorer component
2. **Improved Error Handling**: Implement error boundary with detailed stack trace logging
3. **Animation Effects**: Add subtle animations for state transitions
4. **Improved Accessibility**: Add ARIA attributes for better screen reader support
5. **Enhanced Conditional Logic**: Expand the conditional card display logic for more space types
6. **Further Modularization**: Continue breaking down large functions into smaller, more focused ones

---

*Last Updated: May 1, 2025*