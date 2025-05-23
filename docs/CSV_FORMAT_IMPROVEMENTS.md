# CSV Format Improvement Plan

## Overview

This document outlines a strategic plan to improve the CSV file formats used in the Project Management Game, reducing code complexity and improving maintainability. Currently, many game logic checks are embedded in JavaScript code, making the system harder to maintain. This plan aims to move more of the decision logic into structured data formats.

## Current Issues

1. **Complex Code Logic**: The system performs numerous checks in JavaScript that could be declarative in data.
2. **PM-DECISION-CHECK Special Handling**: Hard-coded special case handling for specific spaces.
3. **String Parsing**: Significant string parsing for dice outcomes and card requirements.
4. **Inconsistent Visit Type Handling**: Different handling for first/subsequent visits.
5. **Conditional Logic in Strings**: Card conditions like "if you roll X" embedded in text.

## Phased Implementation Approach

### Phase 1: Add Explicit Dice Roll Flag
**CSV Change:** Add a `RequiresDiceRoll` column to Spaces.csv.
**Code Changes:**
- Update CSV parser to recognize the new column
- Modify `spaceRequiresDiceRoll()` to check this flag first, falling back to existing logic
- No removal of existing code yet, just add new decision path

**Benefit:** Immediate simplification of dice roll detection without breaking existing functionality.

### Phase 2: Structured Dice Outcomes
**CSV Change:** Restructure DiceRoll Info.csv with clear columns for outcome types.
**Code Changes:**
- Create a new outcome parser that understands the structured format
- Update `processDiceRollOutcome()` to use the new parser first, then fall back
- Add migration tool to convert old format outcomes to new format

**Benefit:** Cleaner dice outcome processing and easier to add new outcome types.

### Phase 3: Movement Relationship Mapping
**CSV Change:** Create a new Movements.csv file with FromSpace/ToSpace relationships.
**Code Changes:**
- Add a new loader for the relationship file
- Implement a new `getAvailableMovesFromRelationships()` method
- Update `getAvailableMoves()` to try the new method first, then use legacy

**Benefit:** More explicit movement rules without touching the core of existing movement logic.

### Phase 4: Special Case Handlers Registry
**CSV Change:** Add column in Spaces.csv for special handlers.
**Code Changes:**
- Create a handler registry system where special logic can be registered
- Move PM-DECISION-CHECK logic into a registered handler
- Update main logic to check registry before hard-coded checks

**Benefit:** Framework for moving special cases out of core code without massive rewrites.

### Phase 5: Structured Card Requirements
**CSV Change:** Create separate CardRequirements.csv for conditional actions.
**Code Changes:**
- Add a loader for the new requirements format
- Create a card requirement processor that works with the structured data
- Update dice roll handler to check for structured requirements first

**Benefit:** Cleaner card requirement processing and more consistent handling.

## New CSV Formats

### Spaces.csv (Updated)
```
SpaceID,SpaceName,RequiresDiceRoll,SpecialHandler,VisitType,Space1,Space2,...
1,PM-DECISION-CHECK,Yes,PMDecisionLogic,First,OWNER-DECISION-REVIEW,ARCH-INITIATION,...
```

### DiceRoll Info.csv (Updated)
```
SpaceName,VisitType,DiceValue,OutcomeType,OutcomeValue,Description
PM-DECISION-CHECK,First,3,MoveToSpace,ARCH-INITIATION,"Move to Arch Initiation"
LEND-SCOPE-CHECK,First,6,DrawCards,W:2,"Draw 2 W cards"
```

### Movements.csv (New)
```
FromSpace,ToSpace,VisitType,Description,RequiresCondition,ConditionType,ConditionValue
PM-DECISION-CHECK,ARCH-INITIATION,First,"Go to Arch Initiation",No,,
PM-DECISION-CHECK,OWNER-DECISION-REVIEW,Subsequent,"Review with Owner",No,,
LEND-SCOPE-CHECK,ARCH-INITIATION,First,"Get Architect review",Yes,DiceRoll,3
```

### CardRequirements.csv (New)
```
SpaceName,CardType,RequiredRoll,Action,Count,VisitType,Description
ARCH-INITIATION,W,6,Draw,2,First,"Draw 2 W cards if you roll a 6"
LEND-SCOPE-CHECK,B,5,Draw,1,Subsequent,"Draw 1 B card if you roll a 5"
```

### SpecialHandlers.csv (New)
```
HandlerName,HandlerType,Description,Priority
PMDecisionLogic,MovementLogic,"Special handling for PM-DECISION-CHECK, including original space return logic",10
FdnyFeeReview,ResourceLogic,"Special handling for FDNY fee calculations",20
```

## Implementation Strategy

1. **Maintain Backward Compatibility:** Each phase should work with both old and new formats
2. **Feature Flags:** Use feature flags to enable/disable new systems during testing
3. **Regression Testing:** Develop comprehensive tests for each phase
4. **Documentation:** Document both the new CSV formats and the code changes
5. **Migration Tools:** Provide tools to convert old CSV formats to new ones

## Timeline Considerations

- Each phase could take 1-3 weeks depending on complexity and testing needs
- Phases can be implemented in different release cycles
- Consider implementing Phase 1 as soon as possible for quick wins
- Phases 3-5 could be done in parallel by different developers if needed

## Benefits

1. **Reduced Code Complexity:** Eliminates about 50% of the conditional checks
2. **Better Maintainability:** Game rules in data instead of code
3. **Easier Content Creation:** Clearer structure for game designers
4. **Improved Performance:** Less string parsing and conditional logic
5. **Fewer Bugs:** Data-driven approach reduces special case coding errors

## First Steps

To implement Phase 1 immediately:

1. Update the `Spaces.csv` parser to add the new `RequiresDiceRoll` column
2. Modify the `spaceRequiresDiceRoll()` method in `DiceManager.js` to check this column first
3. Add fallback to existing logic for backward compatibility
4. Test with a few spaces converted to the new format
5. Update documentation with the new CSV format details

## Long-term Benefits

By completing all phases, we will:
- Reduce the size and complexity of the JavaScript codebase significantly
- Move game rules to data, making them easier to modify without coding
- Simplify the addition of new game mechanics
- Improve the development workflow for non-technical team members
- Create a more maintainable and extensible game architecture

---

*Last Updated: May 18, 2025*
