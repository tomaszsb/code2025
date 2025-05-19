# Game Mechanics Guide

This guide explains the core game mechanics and which files control them. It's designed for non-programmers who want to understand how the game works and make changes to specific gameplay elements.

## Core Game Mechanics

### 1. Player Movement

**How it works**: Players move around the board by selecting from available spaces. Some spaces have special movement rules.

**Files that control this**:
- `js/utils/movement/MovementCore.js`: Basic movement functionality
- `js/utils/movement/MovementLogic.js`: Special movement rules
- `js/utils/movement/MovementUIAdapter.js`: How movement looks on screen

**Common changes you might want to make**:
- Change how far players can move
- Change special movement rules for specific spaces
- Modify when players can return to the main path

**Example**: To change the PM-DECISION-CHECK space behavior, look for that space name in `MovementLogic.js`

### 2. Card System

**How it works**: Players draw and play cards of different types (Work, Bank, Investor, Life, Expeditor). Each card has specific effects.

**Files that control this**:
- `js/components/CardManager.js`: Core card functionality
- `js/components/CardTypeUtils.js`: Card type handling
- `js/components/CardActions.js`: What happens when cards are played
- `data/[X]-cards-improved.csv`: Actual card content

**Common changes you might want to make**:
- Change card effects
- Modify how many cards players can hold
- Adjust card draw probabilities
- Edit card text and values

**Example**: To change the maximum number of cards a player can hold, look for `CARD_TYPE_LIMIT` in `CardManager.js`

### 3. Dice Rolling

**How it works**: Players roll dice on certain spaces. The dice result determines what happens next.

**Files that control this**:
- `js/components/DiceManager.js`: Dice rolling functionality
- `js/utils/DiceRollLogic.js`: What happens based on dice results
- `data/DiceRoll Info.csv`: Specific dice outcomes for different spaces

**Common changes you might want to make**:
- Change what happens when specific numbers are rolled
- Modify the dice roll ranges
- Add or remove dice effects for certain spaces

**Example**: To change what happens when a player rolls a 6 on DESIGN-CHOICE, find that space and dice value in `DiceRollLogic.js`

### 4. Player Turns

**How it works**: Players take turns moving, drawing cards, and performing actions.

**Files that control this**:
- `js/components/TurnManager.js`: Controls turn flow
- `js/components/SpaceInfoMoves.js`: Available actions during a turn

**Common changes you might want to make**:
- Change what players can do on their turn
- Modify turn order
- Add new actions during turns

**Example**: To change what happens at the end of a turn, look for `endTurn` in `TurnManager.js`

### 5. Resources (Money and Time)

**How it works**: Players manage money and time resources throughout the game.

**Files that control this**:
- `js/data/GameStateManager.js`: Tracks player resources
- `js/components/PlayerInfo.js`: Displays resources

**Common changes you might want to make**:
- Change starting resources
- Modify how much resources are gained/lost
- Add new resource types

**Example**: To change starting money, look for initial resource values in `PlayerSetup.js`

## Step-by-Step Guide to Changing Game Mechanics

### Example 1: Change Card Limits

1. **Identify what you want to change**: "I want players to be able to hold more Work cards"

2. **Find the relevant file**: According to this guide, card limits are in `js/components/CardManager.js`

3. **Make a backup**: Copy the file to `CardManager.js.backup`

4. **Find the specific code**: Search for `CARD_TYPE_LIMIT` or look for constants at the top of the file

5. **Make your change**: Change the number value (e.g., from 6 to 8)

6. **Test**: Save the file, reload the game, and test if players can now hold more cards

### Example 2: Change Dice Roll Outcomes

1. **Identify what you want to change**: "I want rolling a 6 on DESIGN-CHOICE to give more money"

2. **Find the relevant file**: According to this guide, dice outcomes are in `js/utils/DiceRollLogic.js`

3. **Make a backup**: Copy the file to `DiceRollLogic.js.backup`

4. **Find the specific code**: Search for `DESIGN-CHOICE` and look for code handling dice value 6

5. **Make your change**: Find the money value and increase it

6. **Test**: Save the file, reload the game, test by rolling dice on that space

## Quick Reference: Game Mechanics Map

| Game Mechanic | Main Files | What You Can Change |
|---------------|------------|---------------------|
| Movement | MovementLogic.js | Available moves, special space behavior |
| Cards | CardManager.js | Card effects, limits, draw mechanics |
| Dice | DiceRollLogic.js | Dice outcomes, special dice effects |
| Turns | TurnManager.js | Turn flow, available actions |
| Resources | GameStateManager.js | Resource amounts, resource effects |
| Board | GameBoard.js | Board behavior (advanced) |
| Player Setup | PlayerSetup.js | Starting conditions, player options |

Remember: Always make one small change at a time and test thoroughly!
