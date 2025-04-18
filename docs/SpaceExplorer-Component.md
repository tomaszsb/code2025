# SpaceExplorer Component Documentation

## Overview
The SpaceExplorer component displays detailed information about a selected game board space. It provides a comprehensive view of space properties including descriptions, actions, outcomes, card requirements, resource effects, and dice roll outcomes.

## Recent Changes
The SpaceExplorer component has been updated with the following improvements:

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

## Component Methods

### Primary Methods
- `render()`: Main render method that orchestrates all sub-components
- `renderDiceTable()`: Renders the dice roll outcomes table
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
- `logDebug(message, ...args)`: Logs debug-level information
- `logInfo(message, ...args)`: Logs informational messages
- `logWarn(message, ...args)`: Logs warning messages
- `logError(message, ...args)`: Logs error messages

## Error Handling
The component implements React's error boundary pattern with `componentDidCatch` to gracefully handle unexpected errors. It displays a user-friendly error message when problems occur and logs detailed error information for debugging.

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

## Example Usage
```jsx
<SpaceExplorer
  space={selectedSpace}
  visitType="first"
  diceRollData={gameState.diceRollData}
  onClose={() => setSelectedSpace(null)}
/>
```

## Related Components
- `SpaceInfo`: Displays abbreviated space information in the game sidebar
- `BoardSpaceRenderer`: Renders individual spaces on the game board
- `DiceRoll`: Handles dice rolling mechanics
- `CardManager`: Manages card drawing and interactions

## Maintenance Notes
When updating this component, consider these guidelines:

- Maintain the modular structure by adding new rendering logic in appropriate sub-methods
- Use the structured logging methods for consistent debugging
- Extend the error handling for any new complex operations
- Follow the data-driven approach when adding new types of content
- Update the CSS class documentation when adding new styles

## Future Development

For planned enhancements to the SpaceExplorer component, see the future-tasks.md file.

---

*Last Updated: April 18, 2025*