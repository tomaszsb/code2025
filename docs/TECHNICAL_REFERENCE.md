# Technical Reference

## Architecture Overview

The game is built using React components with a modular architecture that separates concerns:

1. **Game State Management**: Handled by `GameStateManager.js`
2. **UI Rendering**: Managed by `BoardRenderer.js` and component-specific renderers
3. **Game Logic**: Distributed across specialized manager classes and utility files
4. **Data Loading**: CSV files parsed and loaded at initialization

## Key Components

### Core Components

#### GameBoard (`js/components/GameBoard.js`)
- Main controller component that orchestrates the game
- Initializes manager classes
- Maintains the overall game state
- Renders the `BoardRenderer` component

#### BoardRenderer (`js/components/BoardRenderer.js`)
- Handles the actual rendering of game elements
- Manages the layout of game panels
- Renders sub-components like `SpaceInfo`, `PlayerInfo`, etc.

#### SpaceInfo (`js/components/SpaceInfo.js`)
- Displays information about the current space
- Shows available moves as clickable buttons
- Handles dice roll outcomes display
- Displays card actions and resources

#### DiceRoll (`js/components/DiceRoll.js`)
- Manages dice rolling animation and outcome display
- Processes dice roll results

#### CardDisplay (`js/components/CardDisplay.js`)
- Shows the player's cards
- Handles card playing and discarding

### Manager Classes

#### SpaceSelectionManager (`js/components/SpaceSelectionManager.js`)
- Handles space selection logic
- Manages available moves display
- Processes space clicks
- Updates visual cues for available moves

#### TurnManager (`js/components/TurnManager.js`)
- Manages player turns
- Handles end turn operations
- Executes player movement

#### CardManager (`js/components/CardManager.js`)
- Manages card collections
- Processes card effects
- Handles drawing and playing cards

#### DiceManager (`js/components/DiceManager.js`)
- Manages dice roll operations
- Processes dice outcomes
- Handles movement based on dice results

#### NegotiationManager (`js/components/NegotiationManager.js`)
- Handles negotiation mechanics
- Determines when negotiation is allowed

### Utility Files

#### MoveLogic (`js/utils/MoveLogic.js`)
- Contains logic for determining available moves
- Handles special case spaces
- Processes space dependencies for moves

#### DiceRollLogic (`js/utils/DiceRollLogic.js`)
- Processes dice roll outcomes
- Maps dice results to game effects

#### CardDrawUtil (`js/utils/CardDrawUtil.js`)
- Utility for drawing cards
- Processes card draw operations

#### csv-parser (`js/utils/csv-parser.js`)
- Parses CSV data files
- Formats data for game use

## CSS Structure

- **main.css**: Core layout and UI elements
- **game-components.css**: Game-specific components (board, cards, dice)
- **player-animations.css**: Player movement animations
- **space-explorer.css**: Space Explorer component styles
- **board-space-renderer.css**: Board space rendering styles
- **dice-animations.css**: Dice rolling animations
- **space-info.css**: SpaceInfo component styles

## Data Flow

1. **Initialization**:
   - Game loads CSV data files
   - GameStateManager initializes the game state
   - Initial rendering of components

2. **Player Turn**:
   - Current player's position determines available moves
   - SpaceSelectionManager updates available moves
   - Player selects a move via SpaceInfo component
   - TurnManager processes end turn and executes movement

3. **Dice Rolling**:
   - DiceRoll component handles animation and result display
   - DiceRollLogic processes the outcome
   - DiceManager updates game state based on result

4. **Card Management**:
   - CardDrawUtil handles drawing cards
   - CardManager processes card effects
   - CardDisplay shows and manages player's cards

## Fixed Issue: Move Selection

The game previously had an issue where available moves were not properly clickable in the Space Info panel. This issue has been fixed in the `SpaceInfo.js` component.

### Problem
- The available move "OWNER-FUND-INITIATION" was displayed in the UI but wasn't properly attached to a clickable button with event handlers
- The move selection was not being properly triggered

### Solution
- Updated `SpaceInfo.js` to properly render available moves as clickable buttons
- Added a special case to handle the "OWNER-FUND-INITIATION" move
- Enhanced button styling with the "primary-move-btn" class
- Created a dedicated CSS file (`space-info.css`) for better styling
- Added proper onClick event handlers to trigger move selection

### Implementation Details
1. The `renderAvailableMoves()` method in `SpaceInfo.js` now creates proper clickable buttons for each available move
2. A special case was added to detect and handle the "OWNER-FUND-INITIATION" move
3. The `onMoveSelect` function is properly passed from the `BoardRenderer` component
4. Enhanced logging helps track when buttons are clicked and moves are selected

## Data Files

Game data is stored in CSV files in the `data/` directory:
- `Spaces.csv`: Contains all game spaces and their properties
- `DiceRoll Info.csv`: Contains dice roll outcomes for different spaces
- `W-cards.csv`: Work Type cards data
- `B-cards.csv`: Bank cards data
- `I-cards.csv`: Investor cards data
- `L-cards.csv`: Life cards data
- `E-cards.csv`: Expeditor cards data

## Development Guidelines

1. **Logging**: Each file should log when it begins processing and when execution is finished
2. **No Separate Patches**: Fix the original code directly
3. **Closed System**: Don't introduce external dependencies
4. **CSS Organization**: No inline CSS; use dedicated CSS files

console.log('TECHNICAL_REFERENCE.md file has been updated.');