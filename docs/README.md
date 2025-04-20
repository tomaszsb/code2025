# Project Management Game

## Overview

This is a board game simulation that teaches project management concepts through gameplay. Players navigate through different phases of project management including setup, funding, design, regulatory approvals, and construction.

## Core Features

- Interactive game board with multiple spaces representing different project phases
- Turn-based gameplay with dice rolling mechanics
- Card system (Work, Bank, Investor, Life, and Expeditor cards)
- Resource management (Money and Time)
- Player movement across the game board 
- Negotiation options at key decision points

## Recent Updates

- **Fixed Move Selection:** Players can now properly select available moves on the game board, specifically addressing issues with the OWNER-FUND-INITIATION space.
- **Enhanced Button Styling:** Improved visibility and usability of move buttons with new styling.
- **Added Space Info CSS:** Created dedicated styling for the SpaceInfo component to improve UI clarity.
- **Improved Logging:** All components now include clear logging statements for better debugging.

## Files and Structure

### Core Components

- **GameBoard.js:** Main controller component that orchestrates the game state
- **BoardRenderer.js:** Handles rendering of all game elements
- **SpaceInfo.js:** Displays information about the current space and available moves
- **DiceRoll.js:** Manages dice rolling mechanics
- **CardDisplay.js:** Handles card display and management

### Data Management

- **GameStateManager.js:** Manages the overall game state
- **MoveLogic.js:** Handles the logic for determining available moves
- **DiceRollLogic.js:** Manages dice roll outcomes 
- **CardManager.js:** Handles card-related actions

### Utilities

- **CardDrawUtil.js:** Utility for drawing cards
- **csv-parser.js:** Parses CSV data files

### CSS Files

- **main.css:** Primary stylesheet with core layout and UI elements
- **game-components.css:** Game-specific components like board, cards, dice
- **player-animations.css:** Animations for player movements
- **space-explorer.css:** Styles for Space Explorer component
- **board-space-renderer.css:** Styling for board spaces
- **dice-animations.css:** Animations for dice rolling
- **space-info.css:** Styling for the SpaceInfo component

## How to Play

1. Start the game by entering player names and colors
2. On your turn:
   - Review available moves displayed in the SpaceInfo panel
   - Click on a move button to select your destination
   - Roll dice if required for your current space
   - End your turn to complete movement
3. Draw and play cards as directed by spaces or dice outcomes
4. Manage your resources (Money and Time) throughout the game
5. Navigate through all phases to complete the project

## Developer Notes

When modifying code, please follow these guidelines:

- Each file should log when it begins to be used and when code execution is finished
- Do not create separate patches or fixes; modify the original code directly
- No inline CSS; use the dedicated CSS files
- The game is a closed system; don't introduce external dependencies

console.log('README.md file has been updated.');