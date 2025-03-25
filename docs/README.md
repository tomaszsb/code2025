# Project Management Game

A digital board game that simulates the lifecycle of a construction project. The game is designed for educational purposes, targeting colleges and universities as a teaching tool for project management concepts.

## Project Overview

This game allows players to take on the role of project managers navigating through various phases of a construction project including:

- Initial setup and scope definition
- Design and planning
- Funding and budgeting
- Regulatory approvals
- Construction and implementation

Players navigate through a board-style interface, making decisions at various points that affect project outcomes, managing resources, and dealing with unexpected challenges.

## Development Status

The game is currently in Phase 1 development, focusing on establishing core board movement mechanics.

### Current Phase: Core Movement System

- [x] Project setup and structure
- [ ] Basic board movement implementation
- [ ] Player turn management
- [ ] Simple game state persistence

### Future Phases

1. Card System (resource management)
2. Dice and Outcomes (randomness and challenges)
3. Project Management Elements (educational content)
4. Polishing and Testing (user experience)

## Getting Started

1. **Set up a local web server** - Important: This project must be run on a local web server to avoid CORS issues
   - Using Python: `python -m http.server 8000` (then visit http://localhost:8000)
   - Using Node.js: Install http-server (`npm install -g http-server`) then run `http-server` in the project directory
   - Using VS Code: Install the "Live Server" extension and click "Go Live"

2. Set up players (1-4)
3. Take turns moving around the board
4. Follow the guidance and descriptions on each space

## Project Structure

- `css/` - Styling files
- `js/` - JavaScript files
   - `components/` - React-based UI components
   - `data/` - Game state management
   - `utils/` - Utility functions
- `data/` - Game content data files (CSV)
- `docs/` - Documentation files

## Development Approach

See the `docs/LESSONS_LEARNED.md` file for key insights from previous development attempts and the strategy for this implementation.

## Educational Goal

The primary goal of this game is to provide an engaging, interactive way for students to learn about project management principles in the context of construction projects. It aims to demonstrate real-world challenges, decision points, and the consequences of various choices throughout the project lifecycle.