# SpaceExplorer Component Documentation

## Overview
The SpaceExplorer component displays detailed information about a selected game board space. It provides a comprehensive view of space properties including descriptions, actions, outcomes, card requirements, resource effects, and dice roll outcomes.

## Related Components
The SpaceExplorer component works with the following related components:

- **SpaceExplorerManager**: Manages the opening/closing of the explorer panel and handles event communication with the GameStateManager. It follows the manager pattern and integrates with the event system.

- **SpaceExplorerLoggerManager**: Manages styling and CSS classes for the explorer panel through a proper manager class that integrates with the GameStateManager event system. It replaces the previous global `SpaceExplorerLogger` object while maintaining backward compatibility.

## Recent Changes

### SpaceExplorer Event System Integration (April 26, 2025)
The SpaceExplorer component has been refactored to fully integrate with the GameStateManager event system:

- **Event System Integration**: Now responds to GameStateManager events directly instead of via props
- **Standard Logging**: Implemented standard console.log statements in all methods as required by development guide
- **Cleanup Method**: Added proper cleanup method to remove event listeners and prevent memory leaks
- **State-Based Architecture**: Converted from props-based to state-based architecture with event listeners
- **Improved Event Handling**: Added handlers for playerMoved, turnChanged, gameStateChanged, and spaceExplorerToggled events
- **Backward Compatibility**: Maintained compatibility with existing code that uses props
- **Direct Event Dispatching**: Now directly dispatches spaceExplorerToggled events when the close button is clicked

### SpaceExplorerLoggerManager Implementation (April 22, 2025)
The SpaceExplorerLogger component has been refactored to follow the manager pattern and integrate with the GameStateManager event system:

- **Manager Pattern Implementation**: Converted the global SpaceExplorerLogger object to a SpaceExplorerLoggerManager class
- **Event Integration**: Added handlers for spaceExplorerToggled and gameStateChanged events
- **Cleanup Method**: Implemented proper resource cleanup to prevent memory leaks
- **Backward Compatibility**: Maintained compatibility with existing code through facade pattern

### SpaceExplorerManager Event System Integration (April 22, 2025)
The SpaceExplorerManager has been integrated with the GameStateManager event system:

- **Event Handlers**: Added handlers for playerMoved, turnChanged, and gameStateChanged events
- **Event Dispatching**: Implemented spaceExplorerToggled event type for panel visibility tracking
- **Resource Cleanup**: Added proper cleanup method to prevent memory leaks

### SpaceExplorer Performance Update (April 21, 2025)
The SpaceExplorer component has been updated with the following improvements:

- **Memoized Data Processing**: Implemented data caching in component state to avoid redundant processing
- **Performance Optimization**: Added componentDidUpdate lifecycle method to process dice data only when relevant props change
- **Enhanced Error Handling**: Improved error boundary implementation with stack trace logging and better recovery
- **Optimized Rendering**: Added null checks to prevent unnecessary rendering attempts
- **Accessibility Improvements**: Added aria-label to close button
- **Performance Tracking**: Added render count and timing to detect excessive re-renders
- **Better CSS Integration**: Added alternate row styling to improve dice table readability
- **CSS-Only Styling**: Removed all inline styles and direct DOM style manipulation, moving styles to space-explorer.css

## Component State

| State Property        | Type     | Description                                                   |
|-----------------------|----------|---------------------------------------------------------------|
| hasError              | Boolean  | Indicates if an error has occurred in the component           |
| errorMessage          | String   | Error message to display when hasError is true                |
| processedDiceData     | Object   | Cached processed dice data to avoid reprocessing on re-render |
| diceDataProcessed     | Boolean  | Flag indicating if dice data has been processed               |
| space                 | Object   | Current space being displayed                                 |
| visitType             | String   | Visit type ('first' or 'subsequent')                          |
| diceRollData          | Array    | Dice roll outcome data for all spaces                         |

## Component Props (Backward Compatibility)

| Prop Name     | Type     | Description                                 | Required |
|---------------|----------|---------------------------------------------|----------|
| space         | Object   | The space data to display                   | No       |
| visitType     | String   | Type of visit ('first' or 'subsequent')     | No       |
| diceRollData  | Array    | Dice roll outcome data for all spaces       | No       |
| onClose       | Function | Callback function when close button clicked | No       |

## Event Handlers

| Event Handler          | Event Type              | Description                                                |
|------------------------|-------------------------|------------------------------------------------------------|
| handleSpaceExplorerToggled | spaceExplorerToggled | Updates displayed space when explorer visibility changes |
| handlePlayerMoved      | playerMoved            | Updates display when a player moves to a different space   |
| handleTurnChanged      | turnChanged            | Updates display when the active player changes             |
| handleGameStateChanged | gameStateChanged       | Handles game state changes like new game                   |
| handleCloseExplorer    | UI Event               | Handles closing the explorer and dispatches event          |

## Component Methods

### Lifecycle Methods
- `constructor(props)`: Initializes state, event handlers, and performance tracking metrics
- `componentDidMount()`: Registers event listeners and initializes from props if provided
- `componentDidUpdate(prevProps, prevState)`: Processes dice data only when relevant state/props change
- `componentWillUnmount()`: Cleans up event listeners by calling cleanup method
- `componentDidCatch(error, info)`: Captures and logs errors, updates error state

### Event System Methods
- `registerEventListeners()`: Registers all event listeners with GameStateManager
- `cleanup()`: Removes all event listeners to prevent memory leaks

### Primary Rendering Methods
- `render()`: Main render method that orchestrates all sub-components
- `renderDiceTable()`: Renders the dice roll outcomes table using memoized data
- `renderHeader()`: Renders the component header with title and close button
- `renderSpaceMetadata()`: Renders space name and visit type information
- `renderSpaceDetails()`: Renders description, action, and outcome sections
- `renderCardSection()`: Renders card requirements using data-driven approach
- `renderResourceSection()`: Renders resource effects (Time, Fee)
- `renderDiceRollIndicator()`: Renders indicator if space requires dice roll

### Helper Methods
- `clarifyCardText(text)`: Processes and enhances card text for clarity
- `hasValidValue(value)`: Checks if a value exists and is not 'n/a'
- `processDiceData(space, diceRollData)`: Processes dice roll data for the space
- `createOutcomeElement(type, value, key)`: Creates React elements for dice outcomes

## Error Handling
The component implements React's error boundary pattern with `componentDidCatch` to gracefully handle unexpected errors. It displays a user-friendly error message when problems occur and logs detailed error information for debugging, including component stack traces and error details.

## Performance Tracking
The component includes performance tracking metrics to identify potential performance issues:
- `renderCount`: Tracks the number of times the component has been rendered
- `lastRenderTime`: Stores the timestamp of the last render
- These metrics are used to detect rapid re-rendering which could indicate performance problems

## Component Lifecycle Flow

1. **Initialization**:
   - Component instance created
   - State initialized
   - Event handlers bound

2. **Mounting**:
   - Event listeners registered with GameStateManager
   - Initial state set from props (if provided) or try to get from GameStateManager

3. **Updates**:
   - Component responds to GameStateManager events
   - Updates state based on event data
   - Processes dice data when space or dice data changes
   - Re-renders only when necessary

4. **Unmounting**:
   - Cleanup method called
   - Event listeners removed from GameStateManager

## Event Flow

```
┌─────────────────────┐    playerMoved     ┌─────────────────────┐
│                     │-------------------->│                     │
│  GameStateManager   │    turnChanged     │   SpaceExplorer     │
│                     │-------------------->│                     │
│                     │  gameStateChanged  │                     │
│                     │-------------------->│                     │
│                     │                     │                     │
│                     │  spaceExplorerToggled                     │
│                     │<--------------------|                     │
└─────────────────────┘                    └─────────────────────┘
```

## CSS Classes
The component uses numerous CSS classes for styling different sections:

- `.space-explorer`: Main container
- `.explorer-header`: Header section
- `.explorer-title`: Component title
- `.explorer-close-btn`: Close button
- `.explorer-space-name`: Space name display
- `.explorer-visit-type`: Visit type indicator
- `.explorer-dice-indicator`: Dice roll requirement indicator
- `.explorer-section`: Generic section container
- `.explorer-description`: Space description
- `.explorer-action`: Action description
- `.explorer-outcome`: Outcome description
- `.explorer-cards-section`: Container for card requirements
- `.explorer-card-item`: Individual card requirement
- `.card-type`: Card type indicator (W, B, I, L, E)
- `.explorer-resources-section`: Container for resource effects
- `.explorer-resource-item`: Individual resource effect
- `.explorer-dice-section`: Container for dice roll outcomes
- `.explorer-dice-table`: Dice roll outcomes table
- `.row-alternate`: Alternating row styling for dice table

## Example Usage
```jsx
// The component will now work with events, so just add it to the DOM
<SpaceExplorer />

// It still supports backward compatibility mode with props
<SpaceExplorer
  space={selectedSpace}
  visitType="first"
  diceRollData={gameState.diceRollData}
  onClose={() => setSelectedSpace(null)}
/>

// GameBoard initialization doesn't change
constructor(props) {
  super(props);
  // Initialize manager
  this.spaceExplorerManager = new SpaceExplorerManager(this);
}

// In GameBoard cleanup
cleanup() {
  // Clean up manager
  if (this.spaceExplorerManager && this.spaceExplorerManager.cleanup) {
    this.spaceExplorerManager.cleanup();
  }
}
```

## Maintenance Notes
When updating this component system, consider these guidelines:

- Maintain the modular structure by adding new rendering logic in appropriate sub-methods
- Use standard console.log statements for all methods as required by the development guide
- Always add proper cleanup methods to remove event listeners
- When adding new events, register them in both registerEventListeners and cleanup methods
- Use state-based architecture instead of props where possible
- Update the CSS class documentation when adding new styles
- Ensure all new methods have standard log statements at beginning and end
- Be aware of potential performance impacts when adding new features
- Maintain backward compatibility with props-based usage

## Complete Event System Architecture

```
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │◄────►│                         │
│     GameStateManager    │      │   SpaceExplorerManager  │
│                         │      │                         │
└───────────┬─────────────┘      └───────────┬─────────────┘
           ▲│                               ▲│
           ││                               ││
           │▼                               │▼
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │◄────►│                         │
│  SpaceExplorerLogger    │      │      SpaceExplorer      │
│       Manager           │      │                         │
│                         │      │                         │
└─────────────────────────┘      └─────────────────────────┘
```

The architecture now has bidirectional communication between all components through the GameStateManager event system, maintaining loose coupling and better maintainability.

---

*Last Updated: April 26, 2025*