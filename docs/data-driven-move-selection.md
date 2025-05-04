# Data-Driven Move Selection System

## Overview

As of May 4, 2025, the Project Management Game's move selection system has been fully refactored to use a data-driven approach instead of hardcoded special case handling. This document explains the changes made and the benefits of this approach.

## Background

Previously, the move selection system used hardcoded special case handling for specific spaces like "ARCH-INITIATION", "PM-DECISION-CHECK", and "REG-FDNY-FEE-REVIEW". This approach had several drawbacks:

1. **Maintenance Issues**: Special cases were scattered throughout the codebase
2. **Inconsistent Behavior**: Different spaces were handled in different ways
3. **Difficult to Extend**: Adding new special case spaces required code changes
4. **Poor Reusability**: Special case logic couldn't be easily reused
5. **Lack of Centralized Control**: Changes to behavior required modifying multiple files

## The Data-Driven Approach

The new data-driven approach leverages CSV files to define space behavior, particularly for dice roll outcomes. This approach:

1. **Centralizes Data**: All space behavior is defined in CSV files
2. **Improves Consistency**: All spaces are handled using the same code path
3. **Enhances Maintainability**: Changes to space behavior can be made by editing CSV files, not code
4. **Increases Flexibility**: New special behaviors can be added without code changes
5. **Provides Better Debugging**: Behavior is transparent and defined in data files

## Changes Made

### 1. MoveLogicBase.js

- Removed hardcoded `decisionTreeSpaces` array
- Modified `getAvailableMoves` to always use standard move logic for all spaces
- Updated `hasSpecialCaseLogic` to check for dice roll requirements using DiceRollLogic and CSV data
- Deprecated `handleSpecialCaseSpace` with a warning to use the data-driven approach

### 2. MoveLogicManager.js

- Completely rewrote the `handleDiceRolledEvent` method to use DiceRollLogic consistently
- Removed special case handling, particularly for ARCH-INITIATION
- Implemented data-driven approach using `DiceRollLogic.handleDiceRoll` and `DiceRollLogic.findSpacesFromOutcome`

### 3. MoveLogicSpaceTypes.js

- Updated the decision tree space detection to use DiceRollLogic instead of a hardcoded array
- Ensured compatibility with the data-driven approach

### 4. SpaceSelectionManager.js

- Added explicit support for the data-driven approach
- Enhanced event handling to work with the data-driven move selection

## Using the DiceRollLogic Utility

The DiceRollLogic utility is now central to the data-driven approach:

```javascript
// Check if a space requires a dice roll
const outcomes = window.DiceRollLogic.getOutcomes(spaceName, visitType);
const requiresDiceRoll = outcomes !== null;

// Handle dice roll results
const diceResult = 3; // Example dice roll value
const outcomes = window.DiceRollLogic.handleDiceRoll(spaceName, visitType, diceResult);

// Convert outcomes to available moves
if (outcomes.nextSpace) {
  const availableMoves = window.DiceRollLogic.findSpacesFromOutcome(
    window.GameStateManager, outcomes.nextSpace);
  // Use availableMoves...
}
```

## CSV File Structure

The `DiceRoll Info.csv` file contains the following information:

- `Space Name`: The name of the space
- `Die Roll`: The type of outcome (e.g., "Next Step", "Time outcomes", "Fees Paid")
- `Visit Type`: "First" or "Subsequent"
- `1` through `6`: Outcomes for each dice roll value

Example row:
```
ARCH-INITIATION,Next Step,Subsequent,ENG-INITIATION or PM-DECISION-CHECK - No review,ENG-INITIATION or PM-DECISION-CHECK - No review,ENG-INITIATION or PM-DECISION-CHECK - No review,ARCH-FEE-REVIEW - Review needed,ARCH-FEE-REVIEW - Review needed,ARCH-FEE-REVIEW - Review needed
```

## Benefits of the Data-Driven Approach

1. **Improved Maintainability**: Changes to space behavior can be made by editing CSV files, without touching code
2. **Consistent Behavior**: All spaces are handled using the same logic pathways
3. **Easier Debugging**: Space behavior is transparent and defined in data files
4. **Better Extensibility**: New spaces with special behavior can be added by updating CSV files
5. **Reduced Code Complexity**: Eliminated special case handling scattered throughout the codebase
6. **Centralized Control**: All space behavior is defined in a single place
7. **Enhanced Testing**: Behavior can be tested by modifying CSV data rather than code

## Testing the Data-Driven Approach

When testing the data-driven move selection system:

1. Verify that all spaces work correctly with the data-driven approach
2. Test first visit vs. subsequent visit behavior
3. Confirm dice roll integration works properly with DiceRollLogic
4. Pay special attention to spaces that were previously handled as special cases:
   - ARCH-INITIATION
   - PM-DECISION-CHECK
   - REG-FDNY-FEE-REVIEW
5. Verify that the UI properly updates when dice rolls affect available moves
6. Check for proper event handling and cleanup

## Conclusion

The data-driven approach represents a significant improvement to the move selection system. By removing hardcoded special cases and leveraging CSV data, we've made the system more maintainable, consistent, and extensible. Future changes to space behavior can be made by editing CSV files, reducing the need for code changes and making the game easier to maintain.

*Last Updated: May 4, 2025*