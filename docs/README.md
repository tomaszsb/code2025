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

- **SpaceInfo Component Refactoring:** Improved SpaceInfo component to follow the manager pattern, integrating fully with GameStateManager and using proper event handling.
- **Fixed Move Selection:** Players can now properly select available moves on the game board, specifically addressing issues with the OWNER-FUND-INITIATION space.
- **Enhanced Button Styling:** Improved visibility and usability of move buttons with new styling.
- **Added Space Info CSS:** Created dedicated styling for the SpaceInfo component to improve UI clarity.
- **Improved Logging:** All components now include clear logging statements for better debugging.

## Documentation

### Key Documentation Files

- **TECHNICAL_REFERENCE.md**: Comprehensive technical documentation about the game's architecture, components, and implementation details
- **DEVELOPMENT_GUIDE.md**: Guide for developers covering environment setup, coding standards, project status, and roadmap
- **PLAYER_GUIDE.md**: End-user documentation explaining how to play the game
- **CHANGELOG.md**: Chronological record of changes and updates to the game
- **LESSONS_LEARNED.md**: Best practices and optimization recommendations based on development experience

### What's Where

- **Technical Implementation Details**: Find detailed information about component architecture, data flow, and implementation specifics in TECHNICAL_REFERENCE.md
- **Development Standards**: Coding standards, manager pattern, event system, and CSS guidelines are in component-specific documentation
- **Project Status & Roadmap**: Current status, upcoming priorities, and development phases are documented in DEVELOPMENT_GUIDE.md
- **Playing the Game**: Instructions for players can be found in PLAYER_GUIDE.md

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

### Manager Components

- **SpaceInfoManager.js:** Manages space information display, interactions, and styling
- **SpaceExplorerManager.js:** Handles space explorer panel operations
- **CardTypeUtilsManager.js:** Manages card type detection, formatting, and styling
- **SpaceExplorerLoggerManager.js:** Handles Space Explorer layout and logging

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
- Follow the manager pattern for new components as outlined in component documentation
- Use the event system for component communication

For complete development standards and guidelines, refer to component-specific documentation.

---

*Last Updated: April 28, 2025*