# StaticPlayerStatus Component Documentation

## Overview

The StaticPlayerStatus component displays a snapshot of a player's resources and status at the time they land on a specific space. This provides valuable historical context for game progression and decision-making.

## Purpose

Unlike the dynamic PlayerInfo component that shows current status, StaticPlayerStatus captures and preserves the precise resource state at the moment a player lands on a space. This allows players to understand how their resources have changed after completing actions on a space.

## Component Structure

### Resources Display

The component displays the following player resources:
- **Money**: Current financial resources
- **Time**: Available time resources in days
- **Financial Status**: Shows either surplus or deficit based on comparing available money with total scope cost
- **Cards**: Breakdown of cards by type (W, B, I, L, E)
- **Scope**: Detailed breakdown of work items and their associated costs

### Card Type Categories

Cards are categorized by their type with the following meanings:
- **W** - Work Type: Represents different construction work types in the project
- **B** - Bank: Financial and banking-related cards
- **I** - Investor: Cards related to project investment
- **L** - Life: Cards representing life and leadership aspects
- **E** - Expeditor: Cards related to environmental and external factors

### Visual Elements

- Dynamic border and header colors match the player's color
- Color-coded card type indicators for quick identification
- Organized sections with clear titles
- Financial surplus/deficit indicators with positive/negative coloring
- Tabular display of scope items with calculated totals

## Technical Implementation

### Component Lifecycle

1. **Initialization**: Creates empty state for player status and space info
2. **Mount**: Captures initial player status when first mounted
3. **Update**: Refreshes status data when player or space changes
4. **Error Handling**: Implements React error boundaries for graceful failure handling

### Key Methods

- **capturePlayerStatus()**: Creates a snapshot of player resources and status
- **extractScope()**: Processes W cards to determine scope items and total cost
- **countCardsByType()**: Categorizes cards by their type (W, B, I, L, E)
- **renderCardCounts()**: Renders the card count breakdown UI
- **getCardTypeName()**: Converts card type codes to readable names
- **getCardTypeColor()**: Returns the appropriate color for each card type

### Styling

- Component uses dedicated CSS file: static-player-status.css
- No inline styles used - all styling is defined in the CSS file
- Dynamic player colors are applied via CSS classes with a class-based naming system
- Card type styling uses standardized CSS classes (e.g., card-type-w, card-type-b)
- Both light and dark mode compatible through careful color selections
- Responsive layout adapts to different screen sizes through CSS Grid and Flexbox

### Error States

The component handles several error states gracefully:
- Missing player or space data
- Resource calculation errors
- Rendering failures

## Usage Instructions

The StaticPlayerStatus component is automatically included on the game board and requires no direct interaction. It will appear when a player lands on a space and will update automatically as the game progresses.

## Logging

The component implements structured logging with different severity levels:
- DEBUG: Detailed information for development troubleshooting
- INFO: General flow information of component lifecycle
- WARN: Potential issues that don't prevent operation
- ERROR: Problems that affect component functionality

## Recent Enhancements

Recent enhancements to the component include:
1. Complete removal of inline styles in favor of dedicated CSS file (static-player-status.css)
2. Implementation of color-specific CSS classes for dynamic styling
3. Improved card type display with standardized CSS classes
4. Separation of styling concerns from component logic
5. Addition of card breakdown by type with visual indicators
6. Implementation of error boundaries for improved reliability
7. Enhanced logging for better debugging

## Future Development

For planned enhancements to the StaticPlayerStatus component, see the future-tasks.md file.

Potential enhancements include:
1. Converting to a manager-based pattern similar to other components
2. Adding GameStateManager event integration
3. Implementing more advanced responsive design for better mobile compatibility
4. Adding animations for status changes

## Code Example

```javascript
// Example of using the StaticPlayerStatus component
<StaticPlayerStatus 
  player={GameState.getCurrentPlayer()} 
  space={selectedSpace}
  currentPlayerColor="#FF5733"
/>
```

## Integration With Other Components

- Receives player data from GameState
- Works alongside the dynamic PlayerInfo component
- Complements SpaceInfo to provide a complete picture of game state

## Troubleshooting

If the component fails to display or shows incorrect data:
1. Check browser console for error messages
2. Verify that player and space objects are being passed correctly
3. Ensure CSS files are properly loaded
4. Check GameState for correct player data structure

---

*Last Updated: April 25, 2025*