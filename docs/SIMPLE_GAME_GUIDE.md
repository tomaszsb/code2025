# Simple Game File Guide

This guide explains what each important file does in plain language, without complex code examples. It's designed to help non-programmers understand and modify the game.

## Game Data Files

These files contain the actual content of your game and are the safest to edit:

- **data/Spaces.csv**: Contains all the spaces on the game board
  - You can edit space names, types, and properties
  - Each row is one space on the board

- **data/W-cards-improved.csv**: Contains all the Work cards
  - You can edit card text, effects, and values
  - Each row is one card

- **data/B-cards-improved.csv**: Contains all the Bank cards
  - You can edit card text, effects, and values
  - Each row is one card

- **data/I-cards-improved.csv**: Contains all the Investor cards
  - You can edit card text, effects, and values
  - Each row is one card

- **data/L-cards.csv**: Contains all the Life cards
  - You can edit card text, effects, and values
  - Each row is one card

- **data/E-cards.csv**: Contains all the Expeditor cards
  - You can edit card text, effects, and values
  - Each row is one card

- **data/DiceRoll Info.csv**: Contains dice roll outcomes for different spaces
  - You can edit what happens when players roll different numbers
  - Each row is one possible dice roll outcome

## Core Game Mechanics Files

These files control how the game works. When editing these, be very careful and make small changes one at a time:

- **js/components/DiceManager.js**: Controls dice rolling
  - Controls what happens when players roll dice
  - Determines how dice results affect the game

- **js/components/CardManager.js**: Controls card drawing and effects
  - Controls what happens when players draw cards
  - Handles card effects when played

- **js/components/TurnManager.js**: Controls player turns
  - Controls the turn order
  - Handles starting and ending turns

- **js/utils/movement/MovementLogic.js**: Controls player movement rules
  - Determines which spaces players can move to
  - Handles special movement rules like PM-DECISION-CHECK

## Visual Appearance Files

These files control how the game looks:

- **css/main.css**: Main visual styling
  - Controls colors, sizes, and layout
  - Changes here affect the whole game appearance

- **css/card-components.css**: Card appearance
  - Controls how cards look
  - Changes card colors, sizes, and text appearance

- **css/board-space-renderer.css**: Game board appearance
  - Controls how spaces on the board look
  - Changes space colors, sizes, and text appearance

## Safe Zones for Editing

### 1. Card Mechanics (Safest to Edit)

**File to Edit**: js/components/CardManager.js  
**Safe Lines**: 150-300 (approximate)

What you can safely change:
- How many cards players draw
- Card effects (what happens when cards are played)
- Card limits

Example change: Find the line with `const CARD_TYPE_LIMIT = 6;` to change the maximum number of cards a player can hold.

### 2. Dice Roll Outcomes

**File to Edit**: js/utils/DiceRollLogic.js  
**Safe Lines**: 50-150 (approximate)

What you can safely change:
- What happens when specific numbers are rolled
- Special dice roll effects for specific spaces

Example change: Find the section handling a specific space (like "DESIGN-CHOICE") to modify what happens when players land there.

### 3. Movement Rules

**File to Edit**: js/utils/movement/MovementLogic.js  
**Safe Lines**: 200-350 (approximate)

What you can safely change:
- How many spaces players can move
- Special movement rules for specific spaces

Example change: Find the section handling normal movement to change how far players can move on a turn.

## How to Make Changes Safely

1. **Always back up the file before editing**: Copy the file you want to change and add ".backup" to the filename
2. **Make one small change at a time**: Don't try to change multiple things at once
3. **Test after each change**: Play the game to see if your change worked and didn't break anything
4. **Take notes on what you changed**: Write down exactly what you modified
5. **If something breaks**: Restore from your backup and try a smaller change

## Tips for Non-Programmers

- **Look for comments**: Text after `//` or between `/* */` explains what the code does
- **Finding what you need**: Use Ctrl+F to search for keywords (like "card limit" or a space name)
- **Don't worry about syntax**: Focus on changing values, not the code structure
- **Numbers are usually safe to change**: Look for numbers like `6`, `100`, or `0.5` that likely represent game values
- **Text in quotes is safe to change**: Things like `"You drew a card!"` can be changed safely

Remember: Small changes, tested frequently, are the key to success!
