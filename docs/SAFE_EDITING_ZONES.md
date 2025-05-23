# Safe Editing Zones

This guide identifies specific "safe zones" in the game files where you can make changes without breaking other parts of the game. It's designed for non-programmers who want to work on one file at a time.

## Card System Safe Zones

### File: js/components/CardManager.js

#### Safe Zone 1: Card Limits
```
// Look for this section (around line 50-70)
const CARD_TYPE_LIMIT = 6; // Maximum cards per type
```

**What you can change safely:**
- Change the number to adjust how many cards of each type players can hold
- Example: Change `6` to `8` to allow players to hold more cards

#### Safe Zone 2: Card Draw Logic
```
// Look for this section (around line 100-150)
function drawCard(type, player) {
    // Code here
}
```

**What you can change safely:**
- Look for any numbers that might represent probabilities or quantities
- Look for simple if/else statements that you can understand

#### Safe Zone 3: Card Effects
```
// Look for this section (around line 200-300)
function applyCardEffect(card, player) {
    // Code here
}
```

**What you can change safely:**
- Find the part that handles the specific card type you want to modify
- Look for numbers representing money, resources, or spaces to move

## Dice Roll Safe Zones

### File: js/utils/DiceRollLogic.js

#### Safe Zone 1: Dice Outcomes
```
// Look for this section (around line 50-150)
function handleDiceRoll(spaceName, visitType, diceValue) {
    // Code here
}
```

**What you can change safely:**
- Find the specific space you want to modify
- Change numbers that determine outcomes based on dice values
- Modify simple text in quotes that gets displayed to the player

#### Safe Zone 2: Dice Roll Probabilities
```
// Look for this section (around line 30-50)
// Might have constants or settings related to dice probabilities
```

**What you can change safely:**
- Look for number values that might affect dice roll probabilities
- Be careful not to change anything outside of obvious number values

## Movement System Safe Zones

### File: js/utils/movement/MovementLogic.js

#### Safe Zone 1: Basic Movement Rules
```
// Look for this section (around line 100-150)
function getStandardMovesFromSpace(player, space) {
    // Code here
}
```

**What you can change safely:**
- Look for numbers that might represent movement distances
- Find simple conditions about allowed moves

#### Safe Zone 2: Special Space Handling
```
// Look for this section (around line 200-300)
function handleSpecialSpace(player, space) {
    // Code here with lots of if/else for different spaces
}
```

**What you can change safely:**
- Find the specific special space you want to modify
- Change simple behaviors associated with that space
- Modify numbers representing resources gained/lost

## Game Setup Safe Zones

### File: js/components/PlayerSetup.js

#### Safe Zone 1: Starting Resources
```
// Look for this section (around line 50-100)
function createPlayer(name, color) {
    // Code here
}
```

**What you can change safely:**
- Look for numbers representing starting money, resources, or cards
- Modify initial setup values

## Making Changes: Step-by-Step Guide

For any file you want to edit:

1. **Create a backup**
   ```
   Copy the file to [filename].backup
   ```

2. **Make one small change**
   - Identify exactly what you want to change
   - Find the relevant section using the guides above
   - Make just that one change

3. **Test your change**
   - Save the file
   - Reload the game
   - Test specifically the feature you changed
   - Test a few other related features to make sure nothing broke

4. **If it works:**
   - Great! Make a note of what you changed
   - You can try another small change

5. **If it breaks:**
   - Copy your backup file back to restore the original
   - Try a smaller or different change

## Common Safe Changes for Game Balance

Here are some common changes that are generally safe to make:

1. **Resource Values**
   - How much money/resources cards give
   - Starting resources for players
   - Costs for actions

2. **Probabilities**
   - Dice roll outcomes
   - Card draw chances

3. **Limits**
   - Maximum cards
   - Movement distances
   - Resource caps

4. **Text Content**
   - Card descriptions
   - Space descriptions
   - Message text

## Things to Avoid Changing

Some parts of the code are very interconnected and risky to change:

1. **Function Names**: Don't rename functions
2. **Variable Names**: Don't change variable names
3. **File Structure**: Don't move code between files
4. **Complex Logic**: Avoid changing complex if/else chains if you don't understand them
5. **Data Types**: Don't change things like arrays to numbers or vice versa

Remember: Always work on one file at a time, make small changes, and test frequently!
