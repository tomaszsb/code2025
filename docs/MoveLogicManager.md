# MoveLogicManager Component

## Overview

The MoveLogicManager component is a refactored version of the original MoveLogic.js utility, following the manager pattern established in the project. It handles all game movement logic including standard moves, special case spaces, and dice roll requirements.

## Features

- **Manager Pattern Implementation**: Follows the class-based manager pattern with proper initialization and cleanup
- **Event System Integration**: Listens to GameStateManager events for efficient state updates
- **Performance Optimization**: Implements caching for frequently accessed moves
- **Backward Compatibility**: Maintains support for legacy code through a compatibility layer
- **Consolidated Logic**: Centralizes all movement-related logic in a single manager
- **Proper Logging**: Includes consistent logging of operations and state changes
- **Memory Management**: Ensures proper cleanup of event listeners and cached data

## Public API

### Key Methods

- `getAvailableMoves(gameState, player)`: Returns all available moves for a player, either as an array of spaces or an object indicating dice roll is required
- `hasSpecialCaseLogic(spaceName)`: Checks if a space has special case movement logic
- `handleSpecialCaseSpace(gameState, player, currentSpace)`: Handles spaces with custom movement logic
- `getSpaceDependentMoves(gameState, player, currentSpace)`: Gets standard moves based on CSV data
- `getMoveDetails(space)`: Returns formatted details about a move for display purposes
- `cleanup()`: Properly cleans up resources when the manager is no longer needed

### Special Case Handlers

- `handleArchInitiation(gameState, player, currentSpace)`: Special logic for ARCH-INITIATION space
- `handlePmDecisionCheck(gameState, player, currentSpace)`: Special logic for PM-DECISION-CHECK space
- `handleFdnyFeeReview(gameState, player, currentSpace)`: Special logic for REG-FDNY-FEE-REVIEW space

## Event Handling

The manager listens to the following events from GameStateManager:

- `gameStateChanged`: Updates cache when game state changes (e.g., new game)
- `turnChanged`: Updates available moves when player turn changes
- `spaceChanged`: Updates available moves when a player moves to a new space
- `diceRolled`: Updates available moves based on dice roll results

## Implementation Details

### Cache System

The manager implements a caching system to improve performance:

```javascript
// Cache key format: playerId-positionId
const cacheKey = `${player.id}-${player.position}`;
```

The cache is cleared in response to relevant events to ensure data consistency.

### Special Case Detection

Special case spaces are configured in the constructor:

```javascript
this.specialCaseSpaces = [
  'ARCH-INITIATION',
  'PM-DECISION-CHECK',
  'REG-FDNY-FEE-REVIEW'
];

this.diceRollSpaces = [
  'ARCH-INITIATION'
];
```

### Backward Compatibility

A compatibility layer maintains support for legacy code:

```javascript
window.MoveLogic = {
  getAvailableMoves: (gameState, player) => 
    this.manager.getAvailableMoves(gameState, player),
  // Additional method mappings...
};
```

## Usage Example

```javascript
// Get available moves for the current player
const currentPlayer = window.GameStateManager.getCurrentPlayer();
const availableMoves = window.MoveLogicManager.getAvailableMoves(
  window.GameStateManager, 
  currentPlayer
);

// Handle moves that require dice roll
if (availableMoves.requiresDiceRoll) {
  console.log(`Dice roll required for ${availableMoves.spaceName}`);
  // Show dice roll UI
} else {
  console.log(`Available moves: ${availableMoves.length}`);
  // Show available moves UI
}
```

## Testing Notes

When testing the MoveLogicManager:

1. Verify that all special case spaces work correctly
2. Test first visit vs. subsequent visit behavior
3. Confirm dice roll integration works properly
4. Validate backward compatibility with existing code
5. Check for proper event cleanup to prevent memory leaks

*Last Updated: April 29, 2025*