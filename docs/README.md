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

## Recent Updates (December 2024)

- **CSV Format Improvements - Phase 1 In Progress:** 
  - Added `Path` column to Spaces.csv to categorize spaces (Main, Special, Side quests)
  - Added `RequiresDiceRoll` column to replace hardcoded logic
  - Replaced "RETURN TO YOUR SPACE" with `{ORIGINAL_SPACE}` placeholder
  - Updated movement system to use data-driven approach
  
- **Documentation Reality Check:** 
  - Discovered and corrected false claims about completed features
  - Updated all documentation to reflect actual implementation state
  - Created CURRENT_STATE_SUMMARY.md for accurate project status

- **File Structure Reorganization Plan:**
  - Created plan to simplify confusing util folder structure
  - Phased approach to reorganize files by system
  - See FILE_STRUCTURE_REORGANIZATION.md for details

## Previous Updates

- **Movement System Implementation:** Modular architecture using MovementCore.js, MovementLogic.js, MovementUIAdapter.js, and MovementSystem.js
- **SpaceInfo Component Modularization:** Broke up into smaller modules for better maintainability
- **Browser Compatibility:** Using window objects and prototype mixins

## Documentation

### Key Documentation Files

- **TECHNICAL_REFERENCE.md**: Comprehensive technical documentation about the game's architecture, components, and implementation details
- **DEVELOPMENT_GUIDE.md**: Guide for developers covering environment setup, coding standards, project status, and roadmap
- **PLAYER_GUIDE.md**: End-user documentation explaining how to play the game
- **CHANGELOG.md**: Chronological record of changes and updates to the game
- **LESSONS_LEARNED.md**: Best practices and optimization recommendations based on development experience
- **CARD_SYSTEM_GUIDE.md**: Detailed information about the card system architecture and implementation
- **MOVEMENT_SYSTEM_ARCHITECTURE.md**: Documentation of the new modular movement system

### What's Where

- **Technical Implementation Details**: Find detailed information about component architecture, data flow, and implementation specifics in TECHNICAL_REFERENCE.md
- **Development Standards**: Coding standards, manager pattern, event system, and CSS guidelines are in component-specific documentation
- **Project Status & Roadmap**: Current status, upcoming priorities, and development phases are documented in DEVELOPMENT_GUIDE.md
- **Playing the Game**: Instructions for players can be found in PLAYER_GUIDE.md

## Files and Structure

### Core Architecture (Planned)

- **Core**: Game mechanics (game state, rules, etc.)
- **Managers**: Manager components that orchestrate functionality
- **Interfaces**: Public interfaces for cross-component communication
- **UI**: UI components
- **Utils**: Utility functions
- **Config**: Configuration and game data

### Core Components

- **GameBoard.js:** Main controller component that orchestrates the game state
- **BoardRenderer.js:** Handles rendering of all game elements
- **SpaceInfo.js:** Displays information about the current space and available moves
  - **SpaceInfoDice.js:** Handles dice-related rendering and functionality
  - **SpaceInfoCards.js:** Manages card drawing button functionality
  - **SpaceInfoMoves.js:** Handles move button rendering and functionality
  - **SpaceInfoUtils.js:** Provides utility functions for the SpaceInfo component
- **DiceRoll.js:** Manages dice rolling mechanics
- **CardDisplay.js:** Handles card display and management

### Data Management

- **GameStateManager.js:** Manages the overall game state
- **Movement System:** Handles movement logic with a modular architecture
  - **MovementCore.js:** Core movement operations and data structures
  - **MovementLogic.js:** Higher-level movement logic including special cases
  - **MovementUIAdapter.js:** Connection between movement logic and UI
  - **MovementSystem.js:** Integration with GameStateManager
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
- Implement the component interface pattern for all manager classes
- Use dependency injection to reduce direct component references
- Follow the one-way data flow pattern for predictable state updates
- Maintain strict component boundaries with interfaces

For complete development standards and guidelines, refer to the DEVELOPMENT_GUIDE.md.

---

*Last Updated: May 16, 2025*