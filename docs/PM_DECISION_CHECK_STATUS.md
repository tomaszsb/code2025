# PM-DECISION-CHECK Implementation Status

## Current Issue (May 2025)
**CRITICAL BUG:** OWNER-DECISION-REVIEW not appearing as available move on subsequent visits to PM-DECISION-CHECK.

**Root Cause:** Conflicting visit tracking systems - game stores data in `player.visitedSpaces` (Set) but movement logic was checking `player.visitHistory` (empty Array).

## Bug Fix Applied (May 2025)

### Files Fixed
1. **GameStateManager.js**
   - Fixed `movePlayer()` to only add spaces to visitedSpaces when LEAVING them
   - Fixed `hasPlayerVisitedSpace()` to use visitedSpaces Set directly

2. **MovementCore.js**  
   - Fixed `determineVisitType()` to check visitedSpaces instead of visitHistory

3. **MovementSystem.js**
   - Fixed `hasPlayerVisitedSpace()` override to use visitedSpaces instead of visitHistory

### Testing Required
After browser refresh (F5/Ctrl+F5):
```javascript
// Verify fix
const player = window.GameStateManager.getCurrentPlayer();
const hasVisited = window.GameStateManager.hasPlayerVisitedSpace(player, 'PM-DECISION-CHECK');
console.log('Both should be true:');
console.log('In visitedSpaces:', Array.from(player.visitedSpaces).includes('PM-DECISION-CHECK'));
console.log('hasPlayerVisitedSpace:', hasVisited);

// Apply fix
if (hasVisited) {
    window.GameStateManager.updateSpaceVisitTypes();
    const currentSpace = window.GameStateManager.findSpaceById(player.position);
    console.log('Visit type:', currentSpace.visitType); // Should be "Subsequent"
    console.log('Space 5:', currentSpace.rawSpace5); // Should show OWNER-DECISION-REVIEW
}
```

**Expected Result:** OWNER-DECISION-REVIEW should appear in available moves list.

---

## Previous Implementation (December 2024)

### CSV Changes
1. **Added Path column** to categorize spaces:
   - `Main` - Main game path
   - `Special` - Spaces with special logic
   - `Side quest money` - Money-related side quests
   - `Side quest scope` - Scope-related side quests  
   - `Side quest cheat` - Cheat bypass path

2. **Replaced "RETURN TO YOUR SPACE"** with `{ORIGINAL_SPACE}` in PM-DECISION-CHECK Space 4

3. **Added RequiresDiceRoll column** with Yes/No values

### Code Changes

#### MovementCore.js
```javascript
// Now tracks when moving from Main to Side quest
if (currentSpace.Path === 'main' && targetSpace.Path.includes('side quest')) {
    player.properties.originalSpaceId = currentSpace.id;
}
```

#### MovementLogic.js  
```javascript
// Detects and replaces {ORIGINAL_SPACE}
if (nextSpaceData.includes('{ORIGINAL_SPACE}')) {
    // Get moves from player's original space
    const originalMoves = this.getStandardMoves(player, originalSpace);
    // Add them as return options
}
```

#### SpaceInfoMoves.js
```javascript
// Uses Path column instead of hardcoded lists
const cameFromQuestSide = previousSpace.Path && 
    previousSpace.Path.toLowerCase().includes('side quest');
```

## Testing Checklist

### Scenario 1: First Visit to PM-DECISION-CHECK
- [ ] Coming from main path
- [ ] Should see: LEND-SCOPE-CHECK, ARCH-INITIATION, CHEAT-BYPASS
- [ ] Should NOT see any return options

### Scenario 2: Subsequent Visit from Side Quest
- [ ] Coming from LEND-SCOPE-CHECK, ARCH-INITIATION, or OWNER-DECISION-REVIEW
- [ ] Should see standard options PLUS moves from original main path space
- [ ] Original moves should be labeled "Return to main path: [Space Name]"

### Scenario 3: CHEAT-BYPASS Block
- [ ] After using CHEAT-BYPASS
- [ ] Should NOT see return options even on subsequent visits

## Debug Info

```javascript
// Check player's original space tracking
let player = GameStateManager.getCurrentPlayer();
console.log('Original Space:', player.properties?.originalSpaceId);
console.log('Has used cheat:', player.hasUsedCheatBypass);

// Check space paths
let space = GameStateManager.findSpaceByName("PM-DECISION-CHECK");
console.log('Space Path:', space.Path);

// Force check available moves
console.log('Available moves:', GameStateManager.getAvailableMoves());
```

## Known Issues
- Testing still needed to verify complete functionality
- Path column has inconsistent capitalization in CSV (being addressed)

## Next Steps
1. Test all scenarios
2. Fix any issues found
3. Update documentation when confirmed working

---
*Created: December 2024*
*Status: Implementation complete, testing needed*
