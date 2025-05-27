# CSV Format Improvements Implementation Guide

## Overview

This document provides implementation details for the CSV Format Improvement Plan. The plan aims to move game logic from JavaScript code to structured data formats, reducing code complexity and improving maintainability.

## Phase 1: Dice Roll Flag (IN PROGRESS - Started December 2024)

### What's Being Implemented
- Added a new `RequiresDiceRoll` column to Spaces.csv (DONE - December 2024)
- Added a new `Path` column to categorize spaces (Main, Special, Side quest money/scope/cheat) (DONE - December 2024)
- Replaced "RETURN TO YOUR SPACE" with `{ORIGINAL_SPACE}` placeholder (DONE - December 2024)
- Updated the `spaceRequiresDiceRoll()` method in MovementCore.js to check RequiresDiceRoll column first (CODE EXISTS)
- Updated MovementCore.js to track space paths and original space for side quests (DONE - December 2024)
- Updated MovementLogic.js to handle `{ORIGINAL_SPACE}` placeholder (DONE - December 2024)
- Fixed the Dice Roll Order of Checks Issue in MovementLogic.js (CODE EXISTS)
- Maintained backward compatibility by falling back to legacy logic if the column is missing (CODE EXISTS)

### Code Changes
1. **Spaces.csv**:
   - Added new column `RequiresDiceRoll` with values "Yes" or "No"
   - Added values for all spaces based on their behavior in the game

2. **MovementCore.js**:
   - Updated `spaceRequiresDiceRoll()` method to first check the RequiresDiceRoll flag:
   ```javascript
   // First check if the space has an explicit RequiresDiceRoll flag
   if (space.hasOwnProperty('RequiresDiceRoll')) {
     const requiresDiceRoll = space.RequiresDiceRoll.toLowerCase() === 'yes';
     console.log(`MovementCore: Space ${space.name} has explicit RequiresDiceRoll = ${requiresDiceRoll}`);
     return requiresDiceRoll;
   }
   
   // Fallback to legacy behavior if RequiresDiceRoll is not specified
   console.log(`MovementCore: Space ${space.name} has no explicit RequiresDiceRoll, using legacy logic`);
   ```

3. **MovementLogic.js**:
   - Fixed the order of checks in `getAvailableMoves()` to check dice roll requirement before special space handling:
   ```javascript
   // PHASE 1 IMPROVEMENT: Fix order of checks - Check dice roll requirement first
   // Check if dice roll is needed for this space
   if (this.movementCore.spaceRequiresDiceRoll(currentSpace, player)) {
     console.log(`MovementLogic: Space ${currentSpace.name} requires dice roll`);
     return {
       requiresDiceRoll: true,
       spaceName: currentSpace.name,
       visitType: this.movementCore.determineVisitType(player, currentSpace)
     };
   }
   
   // Then check special space handling
   // Check if this is the PM-DECISION-CHECK space
   if (currentSpace.name === 'PM-DECISION-CHECK') {
     console.log(`MovementLogic: Handling special case for PM-DECISION-CHECK`);
     return this.getMovesForPMDecisionCheck(player, currentSpace);
   }
   ```

### Testing Needed
- Verify that PM-DECISION-CHECK correctly uses the Path column for side quest detection
- Verify that {ORIGINAL_SPACE} placeholder properly shows moves from the original main path space
- Confirm backward compatibility with legacy "RETURN TO YOUR SPACE" handling
- Validate that all spaces correctly use the RequiresDiceRoll column
- Test that original space tracking works when moving between main path and side quests

## Next Steps: Phase 2 - Structured Dice Outcomes

### Planned Implementation
- Restructure DiceRoll Info.csv with clear columns for outcome types
- Create a new outcome parser that understands the structured format
- Update `processDiceRollOutcome()` to use the new parser first
- Add migration tool to convert old format outcomes to new format

### Example Format for DiceRoll Info.csv:
```
SpaceName,VisitType,DiceValue,OutcomeType,OutcomeValue,Description
PM-DECISION-CHECK,First,3,MoveToSpace,ARCH-INITIATION,"Move to Arch Initiation"
LEND-SCOPE-CHECK,First,6,DrawCards,W:2,"Draw 2 W cards"
```

### Implementation Timeline
Estimated timeline: 1-3 weeks

## Future Phases

### Phase 3: Movement Relationship Mapping
- Create a new Movements.csv file with FromSpace/ToSpace relationships
- Add a new loader for the relationship file
- Implement a new `getAvailableMovesFromRelationships()` method
- Update `getAvailableMoves()` to try the new method first, then use legacy

### Phase 4: Special Case Handlers Registry
- Add column in Spaces.csv for special handlers
- Create a handler registry system where special logic can be registered
- Move PM-DECISION-CHECK logic into a registered handler
- Update main logic to check registry before hard-coded checks

### Phase 5: Structured Card Requirements
- Create separate CardRequirements.csv for conditional actions
- Add a loader for the new requirements format
- Create a card requirement processor that works with the structured data
- Update dice roll handler to check for structured requirements first

## Benefits of the CSV Format Improvements

1. **Reduced Code Complexity**: Eliminates about 50% of conditional checks
2. **Better Maintainability**: Game rules in data instead of code
3. **Easier Content Creation**: Clearer structure for game designers
4. **Improved Performance**: Less string parsing and conditional logic
5. **Fewer Bugs**: Data-driven approach reduces special case coding errors