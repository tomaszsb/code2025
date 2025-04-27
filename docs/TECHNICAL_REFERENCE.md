# Technical Reference

## Table of Contents
1. [Game Overview](#game-overview)
2. [Architecture Overview](#architecture-overview)
3. [Key Components](#key-components)
4. [Component Interactions](#component-interactions)
5. [Data Flow](#data-flow)
6. [CSS Structure](#css-structure)
7. [Game Mechanics](#game-mechanics)
8. [Recent Modifications](#recent-modifications)
9. [Technical Implementation Details](#technical-implementation-details)
10. [Maintaining The Game](#maintaining-the-game)
11. [Troubleshooting](#troubleshooting)

## Game Overview

The Project Management Game is a board-game style application that simulates a project management journey. Players move through spaces that represent different phases of project management, from initiation to completion. The game is built using React components with a modular architecture that separates concerns.

## Architecture Overview

The game architecture follows these key patterns:

1. **Game State Management**: Handled by `GameStateManager.js`
2. **UI Rendering**: Managed by component-specific renderers
3. **Game Logic**: Distributed across specialized manager classes
4. **Data Loading**: CSV files parsed and loaded at initialization
5. **Manager Pattern**: Core components follow the manager pattern for better organization

## Key Components

### Core Components

1. **GameState** (`js/data/game-state.js`): 
   - Manages the game's state, including players, spaces, moves, and turn order
   - Persists game state to localStorage
   - Provides methods for state manipulation

2. **App** (`js/components/App.js`): 
   - Main container component 
   - Renders either PlayerSetup or GameBoard based on the game state

3. **PlayerSetup** (`js/components/PlayerSetup.js`): 
   - Handles player creation
   - Game initialization
   - Saved game detection and restoration

4. **GameBoard** (`js/components/GameBoard.js`): 
   - Main controller component that orchestrates the game
   - Initializes manager classes
   - Maintains the overall game flow
   - Renders the game interface

5. **BoardDisplay** (`js/components/BoardDisplay.js`): 
   - Renders the game board and spaces
   - Handles space filtering based on visit status
   - Manages the space layout

6. **SpaceInfo** (`js/components/SpaceInfo.js`): 
   - Displays information about the selected space 
   - Shows dice roll outcomes
   - Presents available moves as clickable buttons

7. **PlayerInfo** (`js/components/PlayerInfo.js`): 
   - Shows information about each player
   - Displays player resources and status

8. **DiceRoll** (`js/components/DiceRoll.js`): 
   - Manages dice rolling animation and outcome display
   - Handles 3D visualization with CSS transforms
   - Processes dice roll results

### Manager Classes

1. **TurnManager** (`js/components/managers/TurnManager.js`):
   - Manages player turns
   - Handles end turn operations
   - Executes player movement
   - Dispatches turn change events

2. **SpaceSelectionManager** (`js/components/managers/SpaceSelectionManager.js`):
   - Handles space selection logic
   - Manages available moves display
   - Processes space clicks
   - Updates visual cues for available moves

3. **SpaceExplorerManager** (`js/components/managers/SpaceExplorerManager.js`):
   - Controls the Space Explorer panel behavior
   - Manages space information display
   - Handles exploration of spaces

4. **CardManager** (`js/components/managers/CardManager.js`):
   - Manages card collections
   - Processes card effects
   - Handles drawing and playing cards
   - Dispatches card events

5. **DiceManager** (`js/components/managers/DiceManager.js`):
   - Manages dice roll operations
   - Processes dice outcomes
   - Handles movement based on dice results
   - Dispatches dice roll events

6. **NegotiationManager** (`js/components/managers/NegotiationManager.js`):
   - Handles negotiation mechanics
   - Determines when negotiation is allowed
   - Processes negotiation results

### Card Components

The card system consists of modular components with specific responsibilities:

1. **CardDisplay** (`js/components/CardDisplay.js`): 
   - Core display component for player cards
   - Orchestrates the card system

2. **CardDetailView** (`js/components/CardDetailView.js`): 
   - Card detail popup component
   - Shows detailed card information

3. **CardTypeUtils** (`js/components/CardTypeUtils.js`): 
   - Utility functions for card types
   - Handles styling and fields

4. **CardAnimations** (`js/components/CardAnimations.js`): 
   - Animation components for cards
   - Handles visual effects

5. **WorkCardDialogs** (`js/components/WorkCardDialogs.js`): 
   - W card dialogs and mechanics
   - Special handling for work cards

6. **CardActions** (`js/components/CardActions.js`): 
   - Action handlers for cards
   - Processes card playing and discarding

### Utility Files

1. **MoveLogic** (`js/utils/MoveLogic.js`):
   - Contains logic for determining available moves
   - Handles special case spaces
   - Processes space dependencies

2. **DiceRollLogic** (`js/utils/DiceRollLogic.js`):
   - Processes dice roll outcomes
   - Maps dice results to game effects

3. **CardDrawUtil** (`js/utils/CardDrawUtil.js`):
   - Utility for drawing cards
   - Processes card draw operations

4. **csv-parser** (`js/utils/csv-parser.js`):
   - Parses CSV data files
   - Formats data for game use

## Component Interactions

The components interact through the following mechanisms:

1. **Event System**: 
   - GameStateManager dispatches events for state changes
   - Components listen for events to update their state
   - Event types include: playerMoved, turnChanged, cardDrawn, diceRolled

2. **Props Passing**:
   - Parent components pass props to children
   - Data flows down through the component tree

3. **Manager Communication**:
   - Manager classes communicate through the event system
   - Each manager focuses on a specific area of responsibility

4. **State Management**:
   - GameStateManager maintains the source of truth
   - Components update state through the GameStateManager API
   - State persists to localStorage for save/load functionality

## CSS Structure

- **main.css**: Core layout and UI elements
- **board.css**: Board-specific styling
- **game-components.css**: Game-specific components
- **player-animations.css**: Player movement animations
- **space-explorer.css**: Space Explorer component styles
- **board-space-renderer.css**: Board space rendering styles
- **dice-animations.css**: Dice rolling animations
- **space-info.css**: SpaceInfo component styles
- **card-components.css**: Card styling and animations

## Game Mechanics

### Game Initialization

1. The game loads space data and card data from CSV files
2. Players are created with starting resources
3. Players are positioned at the start space
4. The game board is rendered with spaces filtered based on visit status

### Player Turns

1. On their turn, a player can:
   - Select a space to view its information
   - Roll dice when required by a space
   - Move to an available space
   - Play or discard cards
   - End their turn

2. When a player moves:
   - They are marked as having visited that space
   - The game checks if they've been there before to show appropriate content
   - Cards may be drawn based on the space
   - The next player's turn begins

### Dice Rolling

1. The dice rolling system:
   - Is triggered by spaces that require a die roll
   - Shows a 3D animated dice
   - Generates a random number between 1 and 6
   - Processes the outcome based on the space and visit type
   - Displays categorized outcomes (movement, cards, resources, other)
   - May result in card drawing, resource changes, or available moves

### Card Management

1. The card system:
   - Allows players to accumulate cards throughout the game
   - Provides filtering by card type (W, B, I, L, E)
   - Allows viewing detailed card information
   - Supports playing and discarding cards
   - Provides visual feedback when drawing new cards
   - Includes special handling for Work Type (W) card discard requirements

### Space Information

Each space contains:
- A name
- A type (SETUP, OWNER, FUNDING, DESIGN, REGULATORY, CONSTRUCTION, END)
- Different descriptions for first visits vs. subsequent visits
- Information about next available spaces
- Possible dice roll outcomes
- Potential card drawings

### Visit Tracking

The game tracks spaces each player has visited in their `visitedSpaces` array. This is used to determine:
- Which version of a space to show on the board
- What content to display when a player lands on a space
- The appropriate dice roll outcomes based on visit type
- Card drawing opportunities

## Recent Modifications

### SpaceExplorer Component Enhancement (April 27, 2025)

The SpaceExplorer component has been enhanced with the following improvements:

1. **Enhanced Documentation**:
   - Added detailed JSDoc comments to describe component purpose and features
   - Improved method documentation with clear descriptions
   - Updated component interface documentation

2. **Performance Optimizations**:
   - Implemented render count and timing metrics for performance monitoring
   - Added improved componentDidUpdate checks to reduce unnecessary processing
   - Implemented more efficient dice data processing with better caching

3. **Improved Error Handling**:
   - Enhanced error boundary implementation with detailed stack trace logging
   - Added better error recovery with more graceful degradation
   - Improved error state management with more detailed reporting

4. **Resource Management**:
   - Enhanced cleanup in componentWillUnmount to prevent memory leaks
   - Improved state transitions for better resource management
   - Added performance tracking for excessive re-renders

5. **CSS and Accessibility**:
   - Added better semantic CSS classes for different outcome types
   - Implemented proper ARIA attributes for better accessibility
   - Enhanced CSS organization with dedicated class names

6. **Implementation Details**:
   - All methods now have consistent logging at beginning and end
   - Card handling improved with better pattern matching for text clarification
   - Enhanced dice outcome presentation with semantic grouping

7. **Integration with Related Components**:
   - Works seamlessly with [SpaceExplorerManager](event-system-space-explorer-manager.md) for manager-pattern usage
   - Properly integrates with [SpaceExplorerLoggerManager](SpaceExplorerLoggerManager.md) for styling and CSS
   - Fully connected to [GameStateManager](GameStateManager.md) event system through hybrid architecture
   - See the [Event System Integration](event-system-integration.md) document for complete architectural details

### Game Memory Management Enhancement

The game now features improved memory management with user-friendly options for handling saved games:

1. **Saved Game Detection**:
   - When the game starts, it checks for previously saved game data in localStorage
   - If a saved game is detected, players are presented with options to continue or start new
   - The PlayerSetup component handles this logic in its initial rendering

2. **Player Options**:
   - Players can choose to "Continue Game" to resume their previous session
   - Players can select "Start New Game" to clear saved data and start fresh
   - The interface is intuitive and user-friendly with clearly labeled buttons

3. **Implementation Details**:
   - The PlayerSetup component uses `checkForSavedGame()` to detect saved games
   - The GameState object's `loadSavedState()` method loads data but defers setting `gameStarted`
   - The App component properly handles the flow between PlayerSetup and GameBoard
   - Memory clearing is handled through the "Start New Game" option

### Card System Refactoring

The card system has been refactored from a single large component into a modular system with improved separation of concerns:

1. **Refactored Card Components**:
   - The original monolithic CardDisplay.js file (over 700 lines) has been split into six focused components
   - Each component has a single responsibility for better maintainability
   - Console.log statements added at the beginning and end of each file for easier debugging
   - Clearer component interfaces with proper imports/exports

2. **Component Responsibilities**:
   - **CardDisplay.js**: Core display component that orchestrates the card system
   - **CardDetailView.js**: Handles the card detail popup when a card is selected
   - **CardTypeUtils.js**: Contains utility functions for card types, styling, and fields
   - **CardAnimations.js**: Manages card draw animations and visual effects
   - **WorkCardDialogs.js**: Specific to Work (W) card discard and replacement dialogs
   - **CardActions.js**: Contains action handlers for playing, discarding, and drawing cards

### Space Visibility Filtering

The game has been updated to show only one version of each space (first visit or subsequent visit) based on the player's visit history:

1. **BoardDisplay.js**: Modified to filter spaces and only show the appropriate version:
   - Spaces are grouped by their base names
   - Only one version of each space is displayed based on whether the current player has visited it
   - First-time visits show the "first" version
   - Subsequent visits show the "subsequent" version

2. **Space Layout Optimization**:
   - Board layout now uses a dynamic number of spaces per row based on the square root of total filtered spaces
   - This creates a more balanced, grid-like layout that adapts to the number of spaces

### Dice Roll System Implementation

A complete dice roll system has been implemented with the following features:

1. **3D Dice Visualization**:
   - Realistic 3D dice with proper CSS transforms
   - Improved dot layout and styling for each face
   - Added depth and shading effects for a more polished appearance
   - Added result number badge for clear outcome display

2. **Improved Animation System**:
   - Smoother and more dynamic rolling animations using CSS classes
   - Phased animation for a more engaging dice roll experience
   - Proper transition effects between states
   - Visual cues to indicate when dice is actively rolling

3. **Data-Driven Approach**:
   - Dice outcomes are strictly based on CSV data with no assumptions
   - Spaces only show dice roll outcomes when explicit entries exist in DiceRoll Info.csv
   - Exact match required for both space name AND visit type
   - No fallbacks or default behaviors for missing data

### Player Token Animations

The game now includes animations for player tokens as they move between spaces:

1. **Token Animation System**:
   - CSS transitions provide smooth movement and visibility effects
   - Current player's token is visually highlighted for better identification
   - Organized in a dedicated CSS file for maintainability

2. **Implementation Details**:
   - Player tokens use transform and opacity transitions
   - Current player token is scaled up slightly with a subtle glow effect
   - Hover effects added for better interactivity
   - Maintained separation of styling concerns with external CSS

## Technical Implementation Details

### Game Memory Management Flow

```javascript
// Memory management flow in PlayerSetup.js

// 1. Check for saved game during initialization
checkForSavedGame = () => {
  try {
    const savedPlayers = localStorage.getItem('game_players');
    const savedStatus = localStorage.getItem('game_status');
    
    // Check if we have players saved and that the game was started
    if (savedPlayers && savedStatus) {
      const players = JSON.parse(savedPlayers);
      const status = JSON.parse(savedStatus);
      
      // Only consider it a valid saved game if there are players and the game was started
      return players && players.length > 0 && status.started === true;
    }
  } catch (error) {
    console.error('Error checking for saved game:', error);
  }
  
  return false;
}

// 2. Handle continuing with a saved game
handleContinueGame = () => {
  // Ensure gameStarted is true
  GameState.gameStarted = true;
  GameState.saveState();
  
  // Notify parent component to proceed to game board
  this.props.onSetupComplete();
}

// 3. Handle starting a new game
handleStartNewGame = () => {
  // Clear saved game data and show the setup form
  GameState.startNewGame();
  this.setState({ 
    hasSavedGame: false,
    showSetupForm: true 
  });
}
```

### Space Filtering Algorithm

```javascript
// Filter spaces to show only one version of each space based on visit history
const filteredSpaces = [];
const spaceNameMap = {};

// Group spaces by their base names (without visit type)
spaces.forEach(space => {
  const baseName = GameState.extractSpaceName(space.name);
  
  if (!spaceNameMap[baseName]) {
    spaceNameMap[baseName] = [];
  }
  
  spaceNameMap[baseName].push(space);
});

// For each group of spaces with the same base name, only add one version
Object.keys(spaceNameMap).forEach(baseName => {
  const spaceGroup = spaceNameMap[baseName];
  
  // Check if current player has visited this space before
  const hasVisited = currentPlayer && GameState.hasPlayerVisitedSpace(currentPlayer, baseName);
  const visitType = hasVisited ? 'subsequent' : 'first';
  
  // Try to find a space with the matching visit type
  let spaceToAdd = spaceGroup.find(s => s.id.endsWith(`-${visitType.toLowerCase()}`));
  
  // If no match found, just use the first space in the group
  if (!spaceToAdd && spaceGroup.length > 0) {
    spaceToAdd = spaceGroup[0];
  }
  
  if (spaceToAdd) {
    filteredSpaces.push(spaceToAdd);
  }
});
```

### Enhanced Dice Roll Implementation

```javascript
// Example of dice face rendering with dots
renderDiceFace = (result) => {
  // Create dot layouts for each face of the dice
  const generateDots = (count) => {
    const dots = [];
    
    for (let i = 1; i <= 9; i++) {
      // Only show dots that should be visible for this number
      const visible = (
        (count === 1 && i === 5) ||  // Center dot for 1
        (count === 2 && (i === 1 || i === 9)) ||  // Diagonal corners for 2
        (count === 3 && (i === 1 || i === 5 || i === 9)) ||  // Diagonal plus center for 3
        (count === 4 && (i === 1 || i === 3 || i === 7 || i === 9)) ||  // Four corners for 4
        (count === 5 && (i === 1 || i === 3 || i === 5 || i === 7 || i === 9)) ||  // Four corners and center for 5
        (count === 6 && (i === 1 || i === 3 || i === 4 || i === 6 || i === 7 || i === 9))  // Six dots for 6
      );
      
      dots.push(
        <div 
          key={i} 
          className={`dice-dot dice-dot-${i} ${visible ? 'visible' : ''}`}
        ></div>
      );
    }
    
    return dots;
  };
  
  return (
    <div className="dice-face-compact">
      {generateDots(result)}
    </div>
  );
}
```

### Dice Outcome Categorization

```javascript
// Example of outcome categorization
categorizeOutcomes = (displayOutcomes) => {
  const categories = {
    movement: { title: 'Movement', outcomes: {} },
    cards: { title: 'Cards', outcomes: {} },
    resources: { title: 'Resources', outcomes: {} },
    other: { title: 'Other Effects', outcomes: {} }
  };
  
  // Sort outcomes by category
  Object.entries(displayOutcomes).forEach(([type, value]) => {
    if (type === 'Next Step') {
      categories.movement.outcomes[type] = value;
    } else if (type.includes('Cards')) {
      categories.cards.outcomes[type] = value;
    } else if (type.includes('Time') || type.includes('Fee')) {
      categories.resources.outcomes[type] = value;
    } else {
      categories.other.outcomes[type] = value;
    }
  });
  
  return categories;
}
```

### Dynamic Space Layout

The number of spaces per row is now calculated dynamically:

```javascript
// Calculate an appropriate number of spaces per row based on filtered count
const totalSpaces = filteredSpaces.length;
const spacesPerRow = Math.ceil(Math.sqrt(totalSpaces)); // Use square root for a more balanced layout
```

## Maintaining The Game

### Adding New Spaces

When adding new spaces to the CSV file:
1. Ensure each space has both "first" and "subsequent" visit types
2. The space name should be consistent across both visit types
3. The ID will be automatically generated based on the name and visit type

### Adding New Card Types

When adding new card types to the CSV files:
1. Ensure the card has a proper type identifier (W, B, I, L, E)
2. Include all required fields for that card type
3. Ensure the CSV data is properly formatted for parsing

### Customizing Dice Roll Behavior

To customize the dice roll behavior:
1. Update the corresponding rows in the dice roll CSV data
2. Define the outcomes for each possible roll (1-6)
3. Specify the outcome types (Next Step, Cards, Time, Fee, etc.)
4. Ensure proper integration with spaces

### Modifying The Board Layout

The board layout can be further customized by adjusting:
1. The `spacesPerRow` calculation in `BoardDisplay.js`
2. The space dimensions and gap sizes in `board.css`
3. The container sizes in `main.css`

### Modifying Card Components

When working with the refactored card system:
1. Each component has a specific role - modify the appropriate file for the functionality you need
2. The main CardDisplay component coordinates the other components
3. Card utilities like colors and field mappings are in CardTypeUtils.js
4. Card action handlers (play, discard, draw) are in CardActions.js
5. Special dialogs for Work Type cards are in WorkCardDialogs.js

## Troubleshooting

### Common Issues

1. **Spaces not showing correctly**: 
   - Check that spaces in the CSV have proper first/subsequent visit types
   - Verify that the space name is consistent across different visit types
   - Ensure that the space ID follows the correct format

2. **Board layout problems**: 
   - Verify CSS styles for the board container and spaces
   - Check the spacesPerRow calculation
   - Ensure that the CSS grid layout is properly configured

3. **Visit history not working**: 
   - Ensure the player's `visitedSpaces` array is being updated correctly
   - Check that `GameState.hasPlayerVisitedSpace()` is working properly
   - Verify that the space name extraction logic is working

4. **Card display problems**: 
   - Check that card data is properly loaded from CSV files
   - Verify that the CardDisplay component is receiving the correct player ID
   - Ensure that card types are being properly identified

5. **Dice roll animation issues**: 
   - Verify CSS animations are working correctly
   - Check that the browser supports 3D transforms
   - Ensure that the CSS classes for dice rolling are properly defined

6. **Missing dice outcomes**: 
   - Ensure the dice roll CSV data includes entries for the space and visit type
   - Verify the exact format of the space name in the CSV
   - Check for typos in space names

7. **Card component errors**: 
   - Check the import order in Index.html
   - Ensure that dependencies (CardTypeUtils, CardActions) load before other card components
   - Verify event handlers are properly attached

### Debugging Tips

1. Check the browser console for errors
2. Use the console.log statements at the beginning and end of each file to track execution flow
3. Verify that `GameState.extractSpaceName` is correctly parsing space names
4. Ensure `GameState.hasPlayerVisitedSpace` is properly checking visit history
5. Use the browser console to check for card drawing and processing events
6. Verify that dice outcomes are being properly categorized
7. Check CSS classes for proper animation sequencing

---

*Last Updated: April 27, 2025*