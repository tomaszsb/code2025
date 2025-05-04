# MoveLogicManager Component

## Overview

The MoveLogicManager component is a refactored version of the original MoveLogic.js utility, following the manager pattern established in the project. It handles all game movement logic including standard moves, dice roll requirements, and card effects. As of May 4, 2025, it has been updated to use a fully data-driven approach with CSV files instead of hardcoded special cases.

## Features

- **Manager Pattern Implementation**: Follows the class-based manager pattern with proper initialization and cleanup
- **Event System Integration**: Listens to GameStateManager events for efficient state updates
- **Performance Optimization**: Implements caching for frequently accessed moves
- **Backward Compatibility**: Maintains support for legacy code through a compatibility layer
- **Consolidated Logic**: Centralizes all movement-related logic in a single manager
- **Proper Logging**: Includes consistent logging of operations and state changes
- **Memory Management**: Ensures proper cleanup of event listeners and cached data
- **Card Effects Integration**: Properly applies card effects to game state during movement (added April 30, 2025)
- **Event Dispatching**: Dispatches appropriate events for UI updates when effects are applied
- **Data-Driven Approach**: Uses CSV data for all space behavior instead of hardcoded special cases (added May 4, 2025)
- **DiceRollLogic Integration**: Consistently uses DiceRollLogic utilities for dice roll outcomes (added May 4, 2025)

## Public API

### Key Methods

- `getAvailableMoves(gameState, player)`: Returns all available moves for a player, either as an array of spaces or an object indicating dice roll is required
- `hasSpecialCaseLogic(spaceName, visitType)`: Checks if a space requires a dice roll using CSV data
- `handleSpecialCaseSpace(gameState, player, currentSpace)`: [Deprecated] Now simply forwards to getSpaceDependentMoves
- `getSpaceDependentMoves(gameState, player, currentSpace)`: Gets standard moves based on CSV data and applies card effects
- `handleSpaceCardEffects(gameState, player, space, diceRoll)`: Applies card effects from a space to the game state
- `getMoveDetails(space)`: Returns formatted details about a move for display purposes
- `cleanup()`: Properly cleans up resources when the manager is no longer needed

### Special Case Handlers

As of May 4, 2025, special case handlers have been deprecated and are no longer used. The manager now uses a fully data-driven approach based on CSV files:

## Event Handling

The manager listens to the following events from GameStateManager:

- `gameStateChanged`: Updates cache when game state changes (e.g., new game)
- `turnChanged`: Updates available moves when player turn changes
- `spaceChanged`: Updates available moves when a player moves to a new space
- `diceRolled`: Updates available moves based on dice roll results using DiceRollLogic

The manager dispatches the following events:

- `cardDrawn`: When a card is drawn due to space effects
- `cardReplaced`: When a card is replaced due to space effects
- `cardDiscarded`: When a card is discarded due to space effects
- `cardTransferred`: When a card is transferred to another player
- `timeCostApplied`: When a time cost is applied from a space
- `feeApplied`: When a fee is applied from a space
- `gameStateChanged` with `changeType: 'cardEffectsApplied'`: A consolidated event with all applied effects

## Implementation Details

### Cache System

The manager implements a caching system to improve performance:

```javascript
// Cache key format: playerId-positionId
const cacheKey = `${player.id}-${player.position}`;
```

The cache is cleared in response to relevant events to ensure data consistency.

### Special Case Detection

As of May 4, 2025, the manager no longer uses hardcoded special case detection. Instead, it uses the DiceRollLogic utility to check if a space requires a dice roll based on CSV data:

```javascript
// In hasSpecialCaseLogic method
const hasOutcomes = window.DiceRollLogic.getOutcomes(spaceName, visitType) !== null;
return hasOutcomes;
```

### Card Effects Handling

The manager now properly applies card effects when a player lands on a space:

```javascript
// In getSpaceDependentMoves method
// Apply card effects from the space
const lastDiceRoll = gameState.getLastDiceRoll ? gameState.getLastDiceRoll() : null;
this.handleSpaceCardEffects(gameState, player, spaceToUse, lastDiceRoll);
```

Card effects that can be applied include:
- Drawing cards
- Replacing cards
- Discarding/returning cards
- Transferring cards to other players
- Applying time costs
- Applying fees

Each effect properly updates the game state and dispatches appropriate events for UI updates.

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

// To handle card effects from a space directly:
const space = window.GameStateManager.spaces.find(s => s.id === someSpaceId);
const diceRoll = window.GameStateManager.getLastDiceRoll();
window.MoveLogicManager.handleSpaceCardEffects(
  window.GameStateManager,
  currentPlayer,
  space,
  diceRoll
);
```

## Testing Notes

When testing the MoveLogicManager:

1. Verify that all spaces work correctly with the data-driven approach
2. Test first visit vs. subsequent visit behavior
3. Confirm dice roll integration works properly with DiceRollLogic
4. Validate that card effects are properly applied during movement
5. Test dice-roll-dependent card effects
6. Verify that the UI properly updates when card effects are applied
7. Validate backward compatibility with existing code
8. Check for proper event cleanup to prevent memory leaks
9. Verify that spaces previously handled as special cases (ARCH-INITIATION, PM-DECISION-CHECK, REG-FDNY-FEE-REVIEW) work correctly with the data-driven approach

*Last Updated: May 4, 2025*