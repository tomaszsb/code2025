# Dice Roll System Data Adherence Improvements

## Overview

This document describes the recent improvements to the dice roll system to enforce strict adherence to the CSV data. These changes ensure that all dice roll outcomes are explicitly defined in the data files with no fallbacks or assumptions.

## Problem Statement

Previously, the game would sometimes show dice roll outcomes for space and visit type combinations that weren't explicitly defined in the DiceRoll Info.csv file. For example, the "ARCH-INITIATION First Visit" space would show dice outcomes even though only "ARCH-INITIATION Subsequent" was defined in the CSV file.

This behavior created confusion and raised questions about data integrity since the game was showing outcomes that weren't explicitly defined in the source data.

## Implementation Changes

### 1. DiceRoll.js Component Refactoring

The DiceRoll.js component was refactored to:

- Eliminate duplicate logic that existed in both DiceRoll.js and DiceRollLogic.js
- Access the raw diceRollData directly to have more control over filtering
- Implement strict matching that requires BOTH space name AND visit type to match exactly
- Set diceOutcomes to an empty array when no exact match is found
- Remove any fallback behaviors that might have been showing outcomes from other visit types

Key changes in DiceRoll.js:
```javascript
// Find exact matches for space name and visit type - no fallbacks
const outcomes = diceRollData.filter(data => 
  data['Space Name'] === space.name && 
  data['Visit Type'].toLowerCase() === visitType.toLowerCase()
);

// If no outcomes found, set empty array and log it
if (outcomes.length === 0) {
  console.log('DiceRoll: No outcomes found for', space.name, visitType, '- showing no dice roll');
  this.setState({ diceOutcomes: [] });
  return;
}
```

### 2. SpaceExplorer.js Component Updates

The SpaceExplorer.js component was also updated to enforce the same data integrity rules:

- Modified `processDiceData` to require exact matching on space name AND visit type
- Updated `renderDiceRollIndicator` to only show the dice roll indicator when there's an exact match
- Added clear logging when no dice data is found for a specific visit type

Key changes in SpaceExplorer.js:
```javascript
// Only show outcomes that match both space name AND visit type (strict matching)
const spaceDiceData = diceRollData.filter(data => 
  data['Space Name'] === space.name && 
  data['Visit Type'].toLowerCase() === visitType
);

if (spaceDiceData.length === 0) {
  this.logInfo('No dice data found for', space.name, 'with visit type', visitType);
  return null;
}
```

## Benefits

These changes provide several benefits to the game implementation:

1. **Data Integrity**: The game now correctly adheres to the CSV data without making assumptions.
2. **Transparency**: It's clear to developers and users which spaces require dice rolls based on the CSV data.
3. **Maintainability**: The code is more maintainable as it follows a strict data-driven approach.
4. **Consistency**: All components now handle dice roll data in the same way.
5. **Clarity**: No "magic" outcomes appear that aren't defined in the source data.

## Testing

To verify these changes, the game was tested with the "ARCH-INITIATION First Visit" space, which previously showed dice outcomes despite not having entries in the CSV. After the changes, this space no longer shows dice outcomes or dice roll indicators, as expected.

## Future Considerations

When adding new spaces to the game, it's important to ensure that all required visit types have explicit entries in the DiceRoll Info.csv file. If a space should have dice outcomes for both "First" and "Subsequent" visit types, both must be explicitly defined in the CSV.

---

*Last Updated: April 19, 2025*
