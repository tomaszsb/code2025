# SpaceExplorer Component Documentation

## Overview
The SpaceExplorer component displays detailed information about a selected game board space. It provides a comprehensive view of space properties including descriptions, actions, outcomes, card requirements, resource effects, and dice roll outcomes.

## Related Components
The SpaceExplorer component works with the following related components:

- **SpaceExplorerManager**: Manages the opening/closing of the explorer panel and handles event communication with the GameStateManager. It follows the manager pattern and integrates with the event system.

- **SpaceExplorerLoggerManager**: Manages styling and CSS classes for the explorer panel through a proper manager class that integrates with the GameStateManager event system. It replaces the previous global `SpaceExplorerLogger` object while maintaining backward compatibility.

## Recent Changes

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
- **Improved Logging**: Added timestamp-based logging with severity levels for better debugging
- **Optimized Rendering**: Added null checks to prevent unnecessary rendering attempts
- **Accessibility Improvements**: Added aria-label to close button
- **Performance Tracking**: Added render count and timing to detect excessive re-renders
- **Better CSS Integration**: Added alternate row styling to improve dice table readability
- **Closable Functionality**: The component can now be fully closed using the close button, hiding the space explorer panel
- **Reopening Mechanism**: A "Show Explorer" button appears when the explorer is closed, allowing users to reopen it
- **CSS-Only Styling**: Removed all inline styles and direct DOM style manipulation, moving styles to space-explorer.css
- **Improved Documentation**: Added JSDoc comments and improved code documentation

## Component Props

| Prop Name     | Type     | Description                                 | Required |
|---------------|----------|---------------------------------------------|----------|
| space         | Object   | The space data to display                   | Yes      |
| visitType     | String   | Type of visit ('first' or 'subsequent')     | Yes      |
| diceRollData  | Array    | Dice roll outcome data for all spaces       | No       |
| onClose       | Function | Callback function when close button clicked | No       |

## Component State

| State Property        | Type     | Description                                                   |
|-----------------------|----------|---------------------------------------------------------------|
| hasError              | Boolean  | Indicates if an error has occurred in the component           |
| errorMessage          | String   | Error message to display when hasError is true                |
| processedDiceData     | Object   | Cached processed dice data to avoid reprocessing on re-render |
| diceDataProcessed     | Boolean  | Flag indicating if dice data has been processed               |

## Component Methods

### Lifecycle Methods
- `constructor(props)`: Initializes state and performance tracking metrics
- `componentDidUpdate(prevProps)`: Processes dice data only when relevant props change
- `componentDidCatch(error, info)`: Captures and logs errors, updates error state

### Primary Methods
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

### Logging Methods
- `logDebug(message, ...args)`: Logs debug-level information with timestamp
- `logInfo(message, ...args)`: Logs informational messages with timestamp
- `logWarn(message, ...args)`: Logs warning messages with timestamp
- `logError(message, ...args)`: Logs error messages with timestamp

## Error Handling
The component implements React's error boundary pattern with `componentDidCatch` to gracefully handle unexpected errors. It displays a user-friendly error message when problems occur and logs detailed error information for debugging, including component stack traces and error details.

## Performance Tracking
The component includes performance tracking metrics to identify potential performance issues:
- `renderCount`: Tracks the number of times the component has been rendered
- `lastRenderTime`: Stores the timestamp of the last render
- These metrics are used to detect rapid re-rendering which could indicate performance problems

## SpaceExplorerLoggerManager Features

The SpaceExplorerLoggerManager has the following key features:

1. **Event System Integration**: Registers for and handles events from the GameStateManager, including spaceExplorerToggled and gameStateChanged events
2. **CSS Class Management**: Adds appropriate CSS classes to elements for styling
3. **Error-Resistant DOM Manipulation**: Uses null checks and try/catch blocks to safely add classes
4. **Cleanup Method**: Properly removes event listeners to prevent memory leaks
5. **Backward Compatibility**: Maintains compatibility with older code through a facade pattern

## SpaceExplorerManager Features

The SpaceExplorerManager has these key features:

1. **Event System Integration**: Registers for playerMoved, turnChanged, and gameStateChanged events
2. **Event Dispatching**: Dispatches spaceExplorerToggled events when the panel visibility changes
3. **Panel State Management**: Controls the opening and closing of the explorer panel
4. **Space Updates**: Updates the explored space based on player movement and turn changes
5. **Resource Cleanup**: Properly removes event listeners when the component is unmounted

## Rendering Logic
The component follows a structured approach to rendering:

1. Check for errors and display error UI if needed
2. Check for missing space data and show placeholder if needed
3. Render the header section
4. Render space metadata (name, visit type)
5. Render dice roll indicator if applicable
6. Render space details (description, action, outcome)
7. Render card section with card requirements
8. Render resource section with time and fee information
9. Render dice roll outcome table if applicable

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
// Using SpaceExplorer component
<SpaceExplorer
  space={selectedSpace}
  visitType="first"
  diceRollData={gameState.diceRollData}
  onClose={() => setSelectedSpace(null)}
/>

// Initializing SpaceExplorerManager in GameBoard
constructor(props) {
  super(props);
  // Initialize other managers...
  this.spaceExplorerManager = new SpaceExplorerManager(this);
}

// In GameBoard cleanup
cleanup() {
  // Clean up other managers...
  if (this.spaceExplorerManager && this.spaceExplorerManager.cleanup) {
    this.spaceExplorerManager.cleanup();
  }
}
```

## Maintenance Notes
When updating this component system, consider these guidelines:

- Maintain the modular structure by adding new rendering logic in appropriate sub-methods
- Use the structured logging methods for consistent debugging
- Extend the error handling for any new complex operations
- Follow the data-driven approach when adding new types of content
- Update the CSS class documentation when adding new styles
- Be aware of potential performance impacts when adding new features
- Ensure memoization is properly implemented for expensive operations
- Always implement proper cleanup methods to prevent memory leaks
- Register event listeners with appropriate error handling
- Maintain backward compatibility with legacy code

## Architecture Diagram

```
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│     GameStateManager    │◄─────┤   SpaceExplorerManager  │
│                         │      │                         │
└────────────┬────────────┘      └────────────┬────────────┘
             │                                 │
             │                                 │
             ▼                                 ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│  SpaceExplorerLogger    │◄─────┤      SpaceExplorer      │
│       Manager           │      │                         │
│                         │      │                         │
└─────────────────────────┘      └─────────────────────────┘
```

The architecture follows a clean separation of concerns:
- GameStateManager maintains the central state
- SpaceExplorerManager handles panel visibility and event communication
- SpaceExplorerLoggerManager handles CSS and styling concerns
- SpaceExplorer component handles rendering the UI

Each component communicates through the GameStateManager event system, maintaining loose coupling and better maintainability.

---

*Last Updated: April 22, 2025*