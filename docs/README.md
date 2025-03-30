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

## Documentation

This project includes comprehensive documentation:

- [Game Documentation](./game_documentation.md) - Overview of game structure and functionality
- [Technical Architecture](./tech-architecture.md) - Detailed technical architecture and component relationships
- [Current Status](./current-status.md) - Current implementation status and recommendations
- [Next Steps](./next-steps-handoff.md) - Future development priorities and approach
- [Running Locally](./RUNNING_LOCALLY.md) - Instructions for running the game locally
- [Dice Roll Improvements](./dice-roll-improvements.md) - Details about dice roll system enhancements
- [Optimization Recommendations](./optimization-recommendations.md) - Performance improvement suggestions

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
│   │   ├── CardDisplay.js
│   │   ├── DiceRoll.js
│   │   ├── GameBoard.js
│   │   ├── PlayerInfo.js
│   │   ├── PlayerSetup.js
│   │   └── SpaceInfo.js
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
- L (Leadership) - Team and leadership challenges
- E (Environment) - External factors affecting the project

### Dice Rolling

The 3D dice rolling system provides outcome randomization:
- Determines next moves
- Affects resources (time, money)
- Triggers card drawing
- Creates unexpected events

## Current Status

As of the latest update:
- The core movement system is fully implemented
- The card system is fully implemented with UI
- The dice roll system features 3D visuals and outcome categorization
- The game correctly tracks space visits and player progress
- End game detection is implemented

See [Current Status](./current-status.md) for more details.

## Next Steps

Priority development tasks:
1. Implement negotiation mechanics
2. Enhance visual feedback
3. Optimize performance
4. Create comprehensive testing
5. Expand educational content

See [Next Steps](./next-steps-handoff.md) for the detailed development plan.

## Development Guidelines

When working on this project:
1. Add console logging at the beginning and end of each file
2. Avoid inline CSS
3. Test thoroughly when modifying move logic
4. Follow established component patterns
5. Update documentation when making significant changes

## License

This project is proprietary and confidential.
