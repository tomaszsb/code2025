# Original Space Fix Summary

## Problem Identified
The `{ORIGINAL_SPACE}` token in the CSV data was not being processed correctly, causing players at PM-DECISION-CHECK to not see movement options from their original space.

## Root Cause
1. **Field Name Mismatch**: MovementEngine was looking for `player.previousPosition` but GameStateManager was storing `player.previousSpace`
2. **Missing Dice Roll Data**: MovementEngine expected `gameStateManager.diceRollData` but it wasn't being populated
3. **Incomplete Token Processing**: The logic wasn't fully matching the reference file implementation

## Changes Made

### 1. MovementEngine.js - Fixed {ORIGINAL_SPACE} Processing
**File**: `D:\Unravel\Current_Game\code2025\js\utils\movement\MovementEngine.js`

**Key Changes**:
- **Line ~790-850**: Updated `extractSpaceMovements()` method to use `player.previousSpace` instead of `player.previousPosition`
- **Line ~880-950**: Updated `getOriginalSpaceMovements()` method to match reference file logic exactly
- **Line ~1150**: Updated `executePlayerMove()` to store `player.previousSpace = currentSpace.name` instead of position ID

**Critical Fix**: 
```javascript
// OLD (broken)
if (player.previousPosition) { ... }

// NEW (fixed)  
if (player.previousSpace) {
  const originalSpaceData = this.gameStateManager.spaces.find(space => 
    space.name === player.previousSpace  // Use space NAME, not position ID
  );
}
```

### 2. GameStateManager.js - Added Dice Roll Data Support
**File**: `D:\Unravel\Current_Game\code2025\js\data\GameStateManager.js`  

**Key Changes**:
- **Line ~20**: Added `this.diceRollData = [];` to constructor
- **Line ~975-990**: Added `loadDiceRollData()` method for MovementEngine access

### 3. InitializationManager.js - Load Dice Data into GameState  
**File**: `D:\Unravel\Current_Game\code2025\js\components\managers\InitializationManager.js`

**Key Changes**:
- **Line ~410-417**: Added call to `window.GameState.loadDiceRollData()` and MovementEngine reinitialization

## Reference File Logic Implemented
The fix implements the exact logic from `game_movement_system.html`:

```javascript  
// REFERENCE FILE LOGIC (working)
if (destStr.includes("{ORIGINAL_SPACE}")) {
  if (player.previousSpace) {
    const originalSpaceData = gameState.gameData.spaces.find(space => 
      space["Space Name"] === player.previousSpace
    );
    
    if (originalSpaceData) {
      const originalDestinations = [/* Space 1-5 columns */];
      // Add each original destination (except PM-DECISION-CHECK to prevent loops)
      originalDestinations.forEach(origDest => {
        // Process and add to movements array
      });
    }
  }
  return; // Skip the {ORIGINAL_SPACE} token itself
}
```

## Expected Behavior After Fix
1. **At PM-DECISION-CHECK (Subsequent Visit)**:
   - Player sees 4 regular movement options from PM-DECISION-CHECK
   - Player sees additional movement options from their `previousSpace` (e.g., OWNER-FUND-INITIATION)
   - The `{ORIGINAL_SPACE}` token is replaced with actual destination options
   - No loops or invalid destinations

2. **Player Movement Tracking**:
   - `player.previousSpace` stores the NAME of the last main path space (for {ORIGINAL_SPACE} resolution)
   - `player.visitedSpaces` properly tracks normalized space names for First/Subsequent visits

## Testing
Use `debug/test_original_space_fix.html` to verify the logic:
1. Open in browser
2. Click "Run Test"
3. Should show multiple movement options from original space

## Files Modified
1. `js/utils/movement/MovementEngine.js` - Core logic fix
2. `js/data/GameStateManager.js` - Data storage support  
3. `js/components/managers/InitializationManager.js` - Initialization integration

## Files Cleaned Up
- Removed redundant "EXACT DOCUMENT LOGIC" and "REFERENCE FILE LOGIC" comments
- Moved test file to `debug/` folder
- Standardized comment formatting

The fix ensures the MovementEngine processes `{ORIGINAL_SPACE}` tokens exactly like the working reference file, providing players with the correct movement options when returning to decision points.
