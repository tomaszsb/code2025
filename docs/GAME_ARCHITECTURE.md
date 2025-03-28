# Game Architecture

This document explains the architecture of the Project Management Game and how its components work together.

## Component Structure

The game follows a component-based architecture with clearly defined responsibilities for each part of the system.

### Core Components

1. **GameState (js/data/game-state.js)**
   - Central state management for the entire game
   - Manages players, spaces, and game progression
   - Handles persistence via localStorage
   - Provides public methods for modifying game state
   - Preserves all CSV data fields for spaces to support rich gameplay
   - Tracks player visit history for differentiated space experiences

2. **App (js/components/App.js)**
   - Entry point for the React application
   - Renders either GameBoard or PlayerSetup based on game state
   - Handles high-level error boundaries

3. **GameBoard (js/components/GameBoard.js)**
   - Main controller component
   - Coordinates player turns and movement
   - Displays game layout with panels for players, board, and controls
   - Handles end game condition and final screen
   - Provides access to game instructions via a dedicated button
   - Shows comprehensive instructions with data from CSV files

4. **BoardDisplay (js/components/BoardDisplay.js)**
   - Renders the visual game board with the "snake" layout
   - Shows player tokens on their current spaces
   - Handles space selection events
   - Filters instruction spaces from the board display
   - Optimizes space display based on visit history

5. **PlayerSetup (js/components/PlayerSetup.js)**
   - Handles initial game configuration
   - Allows selection of player count, names, and colors
   - Creates player objects to start the game

6. **PlayerInfo (js/components/PlayerInfo.js)**
   - Displays information about players
   - Shows resources and current status
   - Highlights the active player

7. **SpaceInfo (js/components/SpaceInfo.js)**
   - Shows details about the currently selected space
   - Displays space type and description
   - Presents all relevant space data from CSV (actions, outcomes, etc.)
   - Adapts content based on whether it's a first or subsequent visit

### Utilities

1. **CSV Parser (js/utils/csv-parser.js)**
   - Loads and parses CSV data for spaces
   - Creates JavaScript objects from CSV input
   - Handles edge cases like empty cells and whitespace

## Data Flow

1. The application initializes by loading the CSV data for spaces
2. GameState processes the CSV data and builds the game world
3. The App component renders either the setup screen or game board
4. During setup, PlayerSetup creates players in GameState
5. During gameplay:
   - GameBoard retrieves state from GameState
   - User actions (clicking spaces) trigger GameState updates
   - GameState changes cause React components to re-render
   - End of turns and game conditions are tracked by GameState
   - Instructions can be viewed at any time during gameplay

## State Management

The game uses a centralized state management approach:

1. **GameState** is the single source of truth for game data
2. React components read from GameState but don't modify it directly
3. Components call specific GameState methods for actions:
   - `movePlayer()` - Moves a player to a new space
   - `nextPlayerTurn()` - Advances to the next player's turn
   - `addPlayer()` - Adds a new player to the game
   - `hasPlayerVisitedSpace()` - Checks player visit history
   - etc.

4. Game state is persisted using localStorage with these keys:
   - `game_players` - Array of player objects
   - `game_currentPlayer` - Index of current player
   - `game_status` - Game status object (started, ended)

## CSS Structure

The game's styles are organized into three main files:

1. **main.css** - General styling, containers, player info, controls, instructions panel
2. **board.css** - Board-specific styling, spaces, tokens, layout
3. **debug.css** - Debugging styles (only used in debug mode)

## Key User Interface Elements

1. **Game Board** - Visual representation of the game spaces in a snake layout
2. **Player Info** - Shows each player's current status and resources
3. **Space Info** - Displays detailed information about the selected space
4. **Available Moves** - Shows valid moves for the current player
5. **Instructions Panel** - Provides comprehensive game rules and information
6. **Game Controls** - End turn button and instructions access

## Future Expansion

The architecture is designed to be extensible for future phases:

1. **Card System** - Will add components for cards and hands
2. **Dice and Outcomes** - Will add randomization and event components
3. **Educational Content** - Will enhance space information displays
4. **UI Polish** - Will improve the visual presentation and animations

## Best Practices

The codebase follows these best practices:

1. **Separation of concerns** - Logic separate from presentation
2. **Component independence** - Components have clear responsibilities
3. **Central state management** - Single source of truth for game state
4. **CSS modularity** - Styles organized by purpose
5. **Progressive enhancement** - Core features first, then add complexity
6. **Data preservation** - All CSV fields preserved for rich gameplay options
7. **Responsive design** - Layout adapts to different screen sizes
8. **Clear documentation** - Architecture and components are well-documented