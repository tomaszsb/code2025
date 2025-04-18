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

- Component uses external CSS classes defined in player-animations.css
- Only dynamic styles (player colors) are applied inline via JavaScript methods
- Both light and dark mode compatible through careful color selections
- Responsive layout adapts to different screen sizes

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
1. Removal of space effect section to focus strictly on player resources
2. Addition of card breakdown by type with visual indicators
3. Implementation of error boundaries for improved reliability
4. Enhanced logging for better debugging
5. External CSS for improved maintainability

## Future Development

For planned enhancements to the StaticPlayerStatus component, see the future-tasks.md file.

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

*Last Updated: April 18, 2025*