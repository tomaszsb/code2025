# Visit Tracking System

This document explains how the Project Management Game tracks player visits to spaces and shows different content based on whether it's a player's first or subsequent visit.

## Overview

The game implements a system to differentiate between a player's first visit to a space and any subsequent visits. This allows for:

1. Different descriptions and information on first vs. subsequent visits
2. Different game mechanics and options based on visit history
3. More realistic simulation of project management scenarios

## Implementation Details

### Player Visit History

Each player object now includes:

```javascript
{
  // ... other player properties
  visitedSpaces: [],       // Array of space names the player has visited
  previousPosition: null,  // Previous space ID (for tracking movement)
}
```

Key characteristics:
- A space is only added to `visitedSpaces` when the player leaves it, not when they first arrive
- This ensures the player sees "first visit" content when they initially land on a space
- Only the base space name (without visit type) is stored in the array

### Space Identification

Space objects in the game have unique IDs that include the visit type:

```javascript
{
  id: "space-name-first",  // For first visits
  // OR
  id: "space-name-subsequent", // For subsequent visits
  // ... other space properties
}
```

This allows:
- Different space objects to exist for the same space location
- Different content to be shown based on visit history
- Proper tracking for game mechanics that differ between first and subsequent visits

### Movement Logic

The player movement system has been enhanced to:

1. Track which spaces a player has visited
2. Record the previous position before updating the current position
3. Only mark a space as "visited" when the player moves away from it
4. Extract just the base space name (without explanatory text or visit type) for tracking

### Available Moves Determination

When determining available moves for a player, the system:

1. Checks the player's visited spaces array to see if they've been to a space before
2. Determines if the next possible moves should be "first" or "subsequent" visit types
3. Tries to find space objects that match both the name AND the appropriate visit type
4. Falls back to just matching by name if necessary

## Key Functions

The visit tracking system is implemented through several key functions:

### `movePlayer(playerId, spaceId)`
- Updates player position
- Records previous position
- Updates the visited spaces array when leaving a space

### `hasPlayerVisitedSpace(player, spaceName)`
- Checks if a player has visited a specific space before
- Normalizes space names for consistent comparison

### `extractSpaceName(displayName)`
- Extracts the base space name from display names
- Handles cases with explanatory text after a dash

### `getAvailableMoves()`
- Determines appropriate next spaces based on visit history
- Finds spaces matching both name and visit type
- Ensures valid moves are available for players

### `isVisitingFirstTime()` (in GameBoard)
- Uses the visit tracking system to determine if a visit is first or subsequent
- Controls which content is shown in the SpaceInfo component

## User Experience

From the player's perspective:

1. When first visiting a space, they see the "first visit" description and options
2. When returning to a space they've visited before, they see "subsequent visit" content
3. This creates a more dynamic game experience where prior choices affect future options

## Future Enhancements

The visit tracking system enables future enhancements such as:

1. More complex branching paths based on visit history
2. Accumulated effects from multiple visits to the same space
3. Better integration with the card system
4. More sophisticated scorekeeping based on movement efficiency
