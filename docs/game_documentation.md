# Project Management Game Documentation

## Overview

This document provides details about the Project Management Game's structure, functionality, and recent modifications.

## Game Structure

The game is a board-game style application that simulates a project management journey. Players move through spaces that represent different phases of project management, from initiation to completion.

### Main Components

1. **GameState** (`js/data/game-state.js`): Manages the game's state, including players, spaces, moves, and turn order.
2. **App** (`js/components/App.js`): The main container component that renders either the PlayerSetup or GameBoard based on the game state.
3. **PlayerSetup** (`js/components/PlayerSetup.js`): Handles player creation and game initialization.
4. **GameBoard** (`js/components/GameBoard.js`): The main game interface, showing the board, player information, and controls.
5. **BoardDisplay** (`js/components/BoardDisplay.js`): Renders the game board and spaces.
6. **SpaceInfo** (`js/components/SpaceInfo.js`): Displays information about the selected space.
7. **PlayerInfo** (`js/components/PlayerInfo.js`): Shows information about each player.

## Recent Modifications

### Space Visibility Filtering

The game has been updated to show only one version of each space (first visit or subsequent visit) based on the player's visit history:

1. **BoardDisplay.js**: Modified to filter spaces and only show the appropriate version:
   - Spaces are grouped by their base names
   - Only one version of each space is displayed based on whether the current player has visited it
   - First-time visits show the "first" version
   - Subsequent visits show the "subsequent" version

2. **Space Layout Optimization**:
   - Board layout now uses a dynamic number of spaces per row based on the square root of total filtered spaces
   - This creates a more balanced, grid-like layout that adapts to the number of spaces

3. **CSS Adjustments**:
   - Board container now has fixed minimum height with auto adjustment
   - Main game container uses a reasonable minimum height that adapts to content
   - These changes eliminate excessive white space on the page

## How The Game Works

### Game Initialization

1. The game loads space data from a CSV file
2. Players are created with starting resources and positioned at the start space
3. The game board is rendered with spaces filtered based on visit status

### Player Turns

1. On their turn, a player can:
   - Select a space to view its information
   - Move to an available space
   - End their turn

2. When a player moves:
   - They are marked as having visited that space
   - The game checks if they've been there before to show appropriate content
   - The next player's turn begins

### Space Information

Each space contains:
- A name
- A type (SETUP, OWNER, FUNDING, DESIGN, REGULATORY, CONSTRUCTION, END)
- Different descriptions for first visits vs. subsequent visits
- Information about next available spaces

### Visit Tracking

The game tracks spaces each player has visited in their `visitedSpaces` array. This is used to determine:
- Which version of a space to show on the board
- What content to display when a player lands on a space

## Technical Implementation Details

### Space Filtering Algorithm

```javascript
// Filter spaces to show only one version of each space based on visit history
const filteredSpaces = [];
const spaceNameMap = {};

// Group spaces by their base names (without visit type)
spaces.forEach(space => {
  const baseName = GameState.extractSpaceName(space.name);
  
  if (!spaceNameMap[baseName]) {
    spaceNameMap[baseName] = [];
  }
  
  spaceNameMap[baseName].push(space);
});

// For each group of spaces with the same base name, only add one version
Object.keys(spaceNameMap).forEach(baseName => {
  const spaceGroup = spaceNameMap[baseName];
  
  // Check if current player has visited this space before
  const hasVisited = currentPlayer && GameState.hasPlayerVisitedSpace(currentPlayer, baseName);
  const visitType = hasVisited ? 'subsequent' : 'first';
  
  // Try to find a space with the matching visit type
  let spaceToAdd = spaceGroup.find(s => s.id.endsWith(`-${visitType.toLowerCase()}`));
  
  // If no match found, just use the first space in the group
  if (!spaceToAdd && spaceGroup.length > 0) {
    spaceToAdd = spaceGroup[0];
  }
  
  if (spaceToAdd) {
    filteredSpaces.push(spaceToAdd);
  }
});
```

### Dynamic Space Layout

The number of spaces per row is now calculated dynamically:

```javascript
// Calculate an appropriate number of spaces per row based on filtered count
const totalSpaces = filteredSpaces.length;
const spacesPerRow = Math.ceil(Math.sqrt(totalSpaces)); // Use square root for a more balanced layout
```

## Maintaining The Game

### Adding New Spaces

When adding new spaces to the CSV file:
1. Ensure each space has both "first" and "subsequent" visit types
2. The space name should be consistent across both visit types
3. The ID will be automatically generated based on the name and visit type

### Modifying The Board Layout

The board layout can be further customized by adjusting:
1. The `spacesPerRow` calculation in `BoardDisplay.js`
2. The space dimensions and gap sizes in `board.css`
3. The container sizes in `main.css`

## Troubleshooting

### Common Issues

1. **Spaces not showing correctly**: Check that spaces in the CSV have proper first/subsequent visit types
2. **Board layout problems**: Verify CSS styles for the board container and spaces
3. **Visit history not working**: Ensure the player's `visitedSpaces` array is being updated correctly

### Debugging Tips

1. Check the browser console for errors
2. Verify that `GameState.extractSpaceName` is correctly parsing space names
3. Ensure `GameState.hasPlayerVisitedSpace` is properly checking visit history
