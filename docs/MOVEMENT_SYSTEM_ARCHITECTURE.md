# New Movement System Architecture

## Overview

The Project Management Game now uses a modular movement system with clearly separated responsibilities and better maintainability. This architecture was implemented on May 13, 2025, replacing the previous MoveLogic-based system.

## Component Architecture

The movement system is comprised of four primary components:

1. **MovementCore.js**: Core movement data structures and essential operations
2. **MovementLogic.js**: Higher-level movement logic including special cases
3. **MovementUIAdapter.js**: Connection between movement logic and UI components
4. **MovementSystem.js**: Integration with GameStateManager and initialization

### Component Relationships

```
GameStateManager
       |
       v
MovementSystem (Integration)
       |
       ├── MovementCore (Player movement, visit history)
       |
       ├── MovementLogic (Space logic, PM-DECISION-CHECK)
       |
       └── MovementUIAdapter (Updates UI components)
              |
              v
        GameBoard Component
```

## Key Architectural Principles

### 1. Data Encapsulation

Movement state is protected using Object.defineProperty:

```javascript
Object.defineProperties(window.GameStateManager, {
  // Add each component as a protected property
  movementCore: {
    value: movementCore,
    writable: false,
    configurable: false,
    enumerable: true
  },
  // Additional components...
});
```

### 2. Method Protection

All movement methods are protected against overwriting:

```javascript
Object.defineProperty(window.GameStateManager, 'getAvailableMoves', {
  value: function(player) {
    // Implementation...
  },
  writable: false,
  configurable: false,
  enumerable: true
});
```

### 3. Robust Error Handling

All operations include comprehensive error handling:

```javascript
try {
  // Safety check for movementLogic
  if (!this.movementLogic) {
    console.error('GameStateManager: movementLogic not available');
    return [];
  }
  
  // Use movement logic
  return this.movementLogic.getAvailableMoves(targetPlayer);
} catch (error) {
  console.error('GameStateManager: Error in getAvailableMoves:', error);
  return []; // Return safe fallback
}
```

### 4. Event-Based Communication

The system uses events for communication with other components:

```javascript
// Dispatch event for UI updates
this.gameStateManager.dispatchEvent('playerMoved', {
  playerId: playerId,
  fromSpace: previousPosition,
  toSpace: spaceId
});
```

### 5. TurnManager Integration

The system includes proper integration with TurnManager:

```javascript
// Override TurnManager methods to include movement data
TurnManager.prototype.createPlayerSnapshot = function(player) {
  const baseSnapshot = originalMethod.call(this, player);
  const movementSnapshot = window.GameStateManager.movementCore.createPlayerMovementSnapshot(player);
  return { ...baseSnapshot, ...movementSnapshot };
};
```

## Key Features

### PM-DECISION-CHECK Handling

The system properly maintains original path information for PM-DECISION-CHECK spaces:

```javascript
// In MovementLogic.js
getMovesForPMDecisionCheck(player, space, isSubsequentVisit) {
  const moves = [];
  
  // Always add CHEAT-BYPASS option
  const cheatBypassSpace = this.findSpaceByName('CHEAT-BYPASS');
  if (cheatBypassSpace) {
    cheatBypassSpace.fromPMDecisionCheck = true;
    moves.push(cheatBypassSpace);
  }
  
  // On subsequent visits, add original path moves
  if (isSubsequentVisit) {
    const originalSpace = this.getLastMainPathSpace(player);
    if (originalSpace) {
      const originalMoves = this.getStandardMovesFromSpace(player, originalSpace);
      originalMoves.forEach(move => {
        move.fromOriginalSpace = true; // Mark these moves
        moves.push(move);
      });
    }
  }
  
  return moves;
}
```

### Dice Roll Integration

Dice roll spaces are properly handled using the diceRollData:

```javascript
// In MovementLogic.js
handleDiceRollSpace(player, space) {
  const diceResult = this.gameStateManager.getLastDiceRoll();
  
  if (!diceResult) {
    // If no dice roll yet, require one
    return { requiresDiceRoll: true, spaceName: space.name };
  }
  
  // Use DiceRollLogic to determine outcomes
  const outcomes = window.DiceRollLogic.handleDiceRoll(
    space.name, 
    this.movementCore.determineVisitType(player, space),
    diceResult.value
  );
  
  // Process outcomes...
}
```

### Visit History Tracking

The system maintains comprehensive visit history for each player:

```javascript
// In MovementCore.js
_updateVisitHistory(player, space) {
  // Ensure visit history exists
  if (!player.visitHistory) {
    player.visitHistory = [];
  }
  
  // Create visit record with metadata
  const visitRecord = {
    spaceId: space.id,
    spaceName: space.name,
    timestamp: Date.now(),
    visitType: this.determineVisitType(player, space)
  };
  
  // Add to history
  player.visitHistory.push(visitRecord);
  
  // Also store in player.properties for persistence
  if (!player.properties) player.properties = {};
  if (!player.properties.visitHistory) player.properties.visitHistory = [];
  player.properties.visitHistory.push(visitRecord);
}
```

## Calling the Movement System

### Getting Available Moves

```javascript
// For current player
const moves = window.GameStateManager.getAvailableMoves();

// For a specific player
const moves = window.GameStateManager.getAvailableMoves(player);

// Check for dice roll requirement
if (moves.requiresDiceRoll) {
  // Show dice roll UI
} else {
  // Show available moves
}
```

### Executing a Move

```javascript
// Move current player
window.GameStateManager.executeMove(null, targetSpaceId);

// Move specific player
window.GameStateManager.executeMove(playerId, targetSpaceId);
```

## Debugging the Movement System

Add these queries to examine system state:

```javascript
// Check if movement system components exist
console.log({
  core: !!window.GameStateManager.movementCore,
  logic: !!window.GameStateManager.movementLogic,
  uiAdapter: !!window.GameStateManager.movementUIAdapter
});

// Check player visit history
const player = window.GameStateManager.getCurrentPlayer();
console.log('Visit history:', player.visitHistory);

// Check dice roll data
console.log('Dice roll data loaded:', 
  window.GameStateManager.diceRollData && 
  window.GameStateManager.diceRollData.length);
```

## Common Issues

1. **Dice roll data not loading**: Check that DiceRoll Info.csv is in the correct location and accessible.

2. **Missing moves for PM-DECISION-CHECK**: Verify visit history is being properly maintained.

3. **Movement methods not found**: Check HTML loading order - MovementSystem.js must be loaded after GameStateManager.

4. **UI not updating**: Make sure GameBoard is properly connected via connectGameBoard method.

*Last Updated: May 13, 2025*