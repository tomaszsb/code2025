# Project Management Game

## Overview

This project is an educational board game that simulates the project management journey, teaching players about the challenges and decisions involved in managing projects from initiation to completion.

## Key Features

- Interactive board game with turn-based play
- Dynamic space visibility based on player's visit history
- 3D animated dice rolling system with categorized outcomes
- Complete card management system with filtering and interactions
- Visit tracking system for different space behaviors
- Persistent game state with localStorage
- Data-driven design using CSV files for game content
- Modular component architecture with separation of concerns

## Documentation

This project includes comprehensive documentation:

- [Game Documentation](./game_documentation.md) - Overview of game structure and functionality
- [Technical Architecture](./tech-architecture.md) - Detailed technical architecture and component relationships
- [Current Status](./current-status.md) - Current implementation status and recommendations
- [Next Steps](./next-steps-handoff.md) - Future development priorities and approach
- [Running Locally](./RUNNING_LOCALLY.md) - Instructions for running the game locally
- [Dice Roll Improvements](./dice-roll-improvements.md) - Details about dice roll system enhancements
- [Optimization Recommendations](./optimization-recommendations.md) - Performance improvement suggestions
- [Lessons Learned](./LESSONS_LEARNED.md) - Development insights and best practices

## Project Structure

```
code2025/
├── css/                   # CSS stylesheets
│   ├── board.css          # Board styling
│   ├── cards.css          # Card styling
│   ├── dice.css           # Dice styling
│   └── main.css           # Main application styles
├── data/                  # CSV data files
│   ├── Spaces.csv         # Space definitions
│   ├── DiceRoll Info.csv  # Dice roll outcomes
│   └── *-cards.csv        # Card definitions
├── docs/                  # Documentation
├── js/                    # JavaScript files
│   ├── components/        # UI components
│   │   ├── App.js
│   │   ├── BoardDisplay.js
│   │   ├── CardAnimations.js    # Card animation component
│   │   ├── CardActions.js       # Card action handlers
│   │   ├── CardDetailView.js    # Card detail component
│   │   ├── CardDisplay.js       # Main card component
│   │   ├── CardTypeUtils.js     # Card utility functions
│   │   ├── DiceRoll.js
│   │   ├── GameBoard.js
│   │   ├── PlayerInfo.js
│   │   ├── PlayerSetup.js
│   │   ├── SpaceInfo.js
│   │   └── WorkCardDialogs.js   # W card dialog component
│   ├── data/              # Data management
│   │   └── game-state.js
│   ├── utils/             # Utility functions
│   │   ├── csv-parser.js
│   │   ├── DiceRollLogic.js
│   │   └── MoveLogic.js
│   └── main.js            # Application entry point
├── Index.html             # Main application HTML
└── Index-debug.html       # Debug version with additional tools
```

## Running the Game

To run the game locally:

1. Clone this repository
2. Set up a local server (see [Running Locally](./RUNNING_LOCALLY.md))
3. Open Index.html through your local server
4. Create players and start the game

## Game Components

### Spaces

Spaces represent different phases of project management:
- SETUP - Initial project setup
- OWNER - Owner-related activities
- FUNDING - Funding and budget activities
- DESIGN - Design and planning activities
- REGULATORY - Regulatory compliance activities
- CONSTRUCTION - Implementation activities
- END - Project completion

### Cards

Five types of cards affect gameplay:
- W (Work Type) - Different types of project work
- B (Bank) - Financial aspects of the project
- I (Investor) - Investor-related events
- L (Life) - Team and life challenges
- E (Expeditor) - External factors affecting the project

The card system has been refactored into six focused components:
- **CardDisplay.js** - Core component that orchestrates the others
- **CardDetailView.js** - Popup component for showing card details
- **CardTypeUtils.js** - Utility functions for card types and styling
- **CardAnimations.js** - Animation components for card drawing
- **WorkCardDialogs.js** - Special dialogs for W card mechanics
- **CardActions.js** - Action handlers for card interactions

### Dice Rolling

The 3D dice rolling system provides outcome randomization:
- Determines next moves
- Affects resources (time, money)
- Triggers card drawing
- Creates unexpected events

## Current Status

As of the latest update:
- The core movement system is fully implemented
- The card system is fully implemented with UI and refactored for better maintainability
- The dice roll system features 3D visuals and outcome categorization
- The game correctly tracks space visits and player progress
- End game detection is implemented
- All components include proper logging and avoid inline CSS

See [Current Status](./current-status.md) for more details.

## Recent Improvements

The codebase has undergone significant improvements:

1. **Enhanced Dice Roll System**
   - 3D visual representation with realistic animation
   - Proper dot layout for each face with visual cues
   - Outcome categorization by type (movement, cards, resources, other)
   - Integration with space information display
   - Improved player feedback during dice rolling

2. **Complete Card UI Implementation**
   - Interactive card display with filtering by type
   - Detailed card view with relevant fields based on card type
   - Card playing and discarding functionality
   - Animated card drawing with visual feedback
   - Special handling for Work Type (W) card requirements

3. **Component Refactoring**
   - Monolithic CardDisplay component (700+ lines) split into six focused components
   - Clear separation of concerns with single responsibility components
   - Improved code organization with utility functions in separate files
   - Enhanced maintainability with smaller, focused files
   - Better debugging capabilities with console logging

4. **Space Explorer Improvements**
   - Enhanced SpaceExplorerLogger with safer DOM manipulation techniques
   - Reduced recursive calls to prevent maximum call stack errors
   - Added proper DOM existence checks before manipulating elements
   - Implemented safeguards against excessive DOM operations
   - Created helper functions with robust error handling

5. **CSS Consistency Improvements**
   - Fixed CSS variable reference error in main.css (--spacingsm → --spacing-sm)
   - Improved UI consistency with proper padding for player panels and game board
   - Documented CSS variable naming conventions and best practices
   - Enhanced overall visual appearance with consistent spacing

6. **Documentation Updates**
   - All documentation updated to reflect recent improvements
   - New sections added to explain component refactoring
   - Clear technical architecture documentation
   - Documentation on CSS variable naming conventions and fixes
   - Lessons learned from refactoring process
   - Current status and next steps updated

## Next Steps

Priority development tasks:
1. ~~Complete card UI implementation~~ ✓ COMPLETED!
2. ~~Refine dice roll system~~ ✓ COMPLETED!
3. ~~Refactor card components~~ ✓ COMPLETED!
4. Implement negotiation mechanics
5. Enhance visual feedback
6. Optimize performance
7. Create comprehensive testing
8. Refactor other large components

See [Next Steps](./next-steps-handoff.md) for the detailed development plan.

## Development Guidelines

When working on this project:
1. Add console logging at the beginning and end of each file
2. Avoid inline CSS
3. Test thoroughly when modifying move logic
4. Follow established component patterns
5. Break large components into smaller, focused ones
6. Use utility files for related functions
7. Update documentation when making significant changes

## License

This project is proprietary and confidential.
