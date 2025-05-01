# Dice Roll System Data Adherence Improvements

## Overview

This document describes the improvements to the dice roll system to enforce strict adherence to the CSV data. These changes ensure that the decision to show dice roll buttons is fully data-driven with no hardcoded exclusions or special cases.

## Problem Statement

Previously, the game had hardcoded exclusions for certain spaces (like 'OWNER-FUND-INITIATION' and 'OWNER-SCOPE-INITIATION'), which wasn't ideal for a data-driven approach. The decision to show a dice roll button had multiple decision paths, making it less transparent and harder to maintain.

## Implementation Changes

### 1. DiceManager.js Improvements

The DiceManager.js file was refactored to:

- Remove all hardcoded exclusions
- Implement a fully data-driven approach using CSV data as the source of truth
- Add clear logging of why each decision is made
- Improve the conditional requirement extraction and handling

Key changes in the `hasDiceRollSpace()` method:
```javascript
// Initialize variables to track decision and reason
let needsDiceRoll = false;
let reason = '';

// Method 1: Check if there are dice roll entries in DiceRoll Info.csv
if (this.gameBoard.state.diceRollData) {
  const hasDiceRollInData = this.gameBoard.state.diceRollData.some(data => 
    data['Space Name'] === currentSpace.name && 
    data['Visit Type'] === visitType
  );
  
  if (hasDiceRollInData) {
    needsDiceRoll = true;
    reason = `Found dice roll data for space ${currentSpace.name} and visit type ${visitType} in DiceRoll Info.csv`;
    console.log(`DiceManager: ${reason}`);
  }
}

// Method 2: Check if any card columns contain conditional text "if you roll"
if (!needsDiceRoll) {
  const cardTypes = ['W card', 'B card', 'I card', 'L card', 'E Card'];
  for (const cardType of cardTypes) {
    const cardText = currentSpace[cardType];
    if (cardText && typeof cardText === 'string' && cardText.includes('if you roll')) {
      needsDiceRoll = true;
      reason = `Found conditional dice roll requirement in ${cardType}: "${cardText}" from Spaces.csv`;
      console.log(`DiceManager: ${reason}`);
      
      // Store the conditional requirement for later validation
      this.saveConditionalRequirement(currentSpace, cardType, cardText);
      
      break; // Found one condition, no need to check others
    }
  }
}

// Log the final decision
if (!needsDiceRoll) {
  console.log(`DiceManager: No dice roll required for space ${currentSpace.name} based on CSV data`);
} else {
  console.log(`DiceManager: Dice roll required for space ${currentSpace.name}. Reason: ${reason}`);
}

return needsDiceRoll;
```

### 2. BoardRenderer.js Updates

The BoardRenderer component was updated to ensure it properly utilizes the `hasDiceRollSpace()` method:

- Calculate the value of hasDiceRollSpace for each render, ensuring it's always up-to-date
- Make the dice roll button in SpaceInfo conditional on the result of hasDiceRollSpace
- Add detailed logging of the decision

Key changes in BoardRenderer.js:
```javascript
// Calculate hasDiceRollSpace by calling the method directly - ensuring fresh evaluation
const hasDiceRollSpace = gameBoard.diceManager.hasDiceRollSpace();
console.log('BoardRenderer: hasDiceRollSpace evaluated to:', hasDiceRollSpace);

// Later in the rendering of SpaceInfo...
<SpaceInfo 
  // ... other props ...
  onRollDice={hasDiceRollSpace ? gameBoard.diceManager.handleRollDiceClick : null}
  hasRolledDice={hasRolledDice}
  hasDiceRollSpace={hasDiceRollSpace}
  // ... other props ...
/>
```

## Benefits

These changes provide several benefits to the game implementation:

1. **Fully Data-Driven**: The decision to show dice roll buttons is now completely driven by CSV data
2. **No Hardcoded Exclusions**: All special cases are removed, ensuring consistency
3. **Clear Logging**: Each decision is clearly logged with the reason
4. **Improved Maintenance**: Game rule changes only require CSV updates, not code changes
5. **Better Pattern Matching**: Improved extraction of conditional requirements from card text

## Testing

The implementation was tested with various spaces including OWNER-FUND-INITIATION, which previously had a hardcoded exclusion. Now the decision to show or hide the dice roll button is based solely on the CSV data, as demonstrated in the logs:

```
DiceManager: Checking if space OWNER-FUND-INITIATION needs dice roll. Visit type: First
DiceManager: No dice roll required for space OWNER-FUND-INITIATION based on CSV data
```

## Future Considerations

1. When adding new game rules or spaces, ensure all dice roll requirements are properly specified in the CSV files
2. Consider adding a data validation step to ensure that all spaces with "if you roll" conditions in their card text also have corresponding entries in DiceRoll Info.csv

---

*Last Updated: May 01, 2025*