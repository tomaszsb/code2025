# Technical Reference

## Table of Contents
1. [Game Overview](#game-overview)
2. [Architecture Overview](#architecture-overview)
3. [Key Components](#key-components)
4. [Component Interactions](#component-interactions)
5. [Data Flow](#data-flow)
6. [CSS Structure](#css-structure)
7. [Game Mechanics](#game-mechanics)
8. [Technical Implementation Details](#technical-implementation-details)
9. [Maintaining The Game](#maintaining-the-game)
10. [Troubleshooting](#troubleshooting)

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
   - Uses SpaceInfoManager for state management and styling
   - Properly integrates with GameStateManager event system
   - Modularized into multiple files (SpaceInfoDice.js, SpaceInfoCards.js, SpaceInfoMoves.js, SpaceInfoUtils.js) for better maintainability

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

4. **SpaceInfoManager** (`js/components/managers/SpaceInfoManager.js`):
   - Manages space information display, interactions, and styling
   - Tracks button states across spaces and players
   - Provides CSS classes for space phases instead of inline styles
   - Handles card drawing through GameStateManager integration
   - Processes event listeners for game state changes

5. **CardManager** (`js/components/managers/CardManager.js`):
   - Manages card collections
   - Processes card effects
   - Handles drawing and playing cards
   - Dispatches card events

6. **DiceManager** (`js/components/managers/DiceManager.js`):
   - Manages dice roll operations
   - Processes dice outcomes
   - Handles movement based on dice results
   - Dispatches dice roll events

7. **NegotiationManager** (`js/components/managers/NegotiationManager.js`):
   - Handles negotiation mechanics
   - Determines when negotiation is allowed
   - Processes negotiation results

8. **MoveLogicManager** (`js/utils/move-logic/MoveLogicManager.js`):
   - Manages player movement options, special space logic, and game flow
   - Uses browser-friendly window global objects instead of ES modules
   - Follows proper object prototype inheritance pattern
   - Integrates with GameStateManager events system for state updates
   - Implements caching system for frequently accessed moves
   - Handles special case spaces with custom movement logic
   - Properly processes dice roll requirements for certain spaces
   - Applies card effects during movement
   - Maintains backward compatibility through compatibility layer
   - Ensures proper cleanup of resources and event listeners

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

1. **MoveLogicManager** (`js/utils/MoveLogicManager.js`):
   - Main entry point file for the MoveLogicManager component
   - Creates and initializes the manager instance
   - Sets up backward compatibility for legacy code
   - Ensures correct loading order of module files
   - Exposes the manager globally for direct access

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
   - Event types include: playerMoved, turnChanged, cardDrawn, diceRolled, spaceChanged

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

## Technical Implementation Details

### MoveLogicManager Module Structure

```javascript
// Main manager implementation and initialization
(function() {
  // Define the MoveLogicManager class
  function MoveLogicManager() {
    // Call the parent constructor
    window.MoveLogicUIUpdates.call(this);
    
    console.log('MoveLogicManager: Constructor initialized');
    
    // State tracking
    this.initialized = false;
    this.moveCache = new Map(); // Cache for frequently accessed moves
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      spaceChanged: this.handleSpaceChangedEvent.bind(this),
      diceRolled: this.handleDiceRolledEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    this.initialized = true;
    console.log('MoveLogicManager: Constructor completed');
  }
  
  // Inherit from MoveLogicUIUpdates
  MoveLogicManager.prototype = Object.create(window.MoveLogicUIUpdates.prototype);
  MoveLogicManager.prototype.constructor = MoveLogicManager;
  
  // Method implementations...
  
  // Expose the class to the global scope
  window.MoveLogicManager = MoveLogicManager;
})();
```

### SpaceInfo Component Event Handling

```javascript
// SpaceInfo component event handling
componentDidMount() {
  console.log('SpaceInfo: Component mounted');
  
  // Add event listener for reset buttons event (legacy compatibility)
  window.addEventListener('resetSpaceInfoButtons', this.eventHandlers.resetButtons);
  
  // Register for GameStateManager events
  if (window.GameStateManager) {
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  }
  
  // Check manager availability
  if (!window.SpaceInfoManager) {
    console.error('SpaceInfo: SpaceInfoManager not available');
  }
}

componentWillUnmount() {
  console.log('SpaceInfo: Component unmounting, cleaning up listeners');
  
  // Remove window event listener
  window.removeEventListener('resetSpaceInfoButtons', this.eventHandlers.resetButtons);
  
  // Remove GameStateManager event listeners
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  }
}
```

### SpaceInfoManager Button State Tracking

```javascript
// SpaceInfoManager button state tracking
class SpaceInfoManager {
  constructor() {
    // State tracking
    this.usedButtons = new Map(); // Map of playerID -> Set of used button IDs
  }

  // Check if a button has been used by a player
  isButtonUsed(playerId, buttonId) {
    if (!playerId || !buttonId) return false;
    
    const playerButtons = this.usedButtons.get(playerId);
    return playerButtons ? playerButtons.has(buttonId) : false;
  }
  
  // Mark a button as used by a player
  markButtonUsed(playerId, buttonId) {
    if (!playerId || !buttonId) return;
    
    // Get or create the set of used buttons for this player
    const playerButtons = this.usedButtons.get(playerId) || new Set();
    
    // Add the button ID
    playerButtons.add(buttonId);
    
    // Update the map
    this.usedButtons.set(playerId, playerButtons);
  }
  
  // Reset buttons for a specific player
  resetButtonsForPlayer(playerId) {
    if (!playerId) return;
    
    // Remove player from used buttons tracking
    this.usedButtons.delete(playerId);
  }
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

### Customizing Move Logic

To modify or add new special case space handling:

1. Update the appropriate method in MoveLogicSpecialCases.js:
   ```javascript
   // Add a new special case space handler
   MoveLogicSpecialCases.prototype.handleMyNewSpecialSpace = function(gameState, player, currentSpace) {
     console.log('MoveLogicSpecialCases: Handling MY-NEW-SPECIAL-SPACE special case');
     
     // Implementation...
     
     return availableMoves;
   };
   ```

2. Add the new space name to the specialCaseSpaces array in the constructor:
   ```javascript
   this.specialCaseSpaces = [
     'ARCH-INITIATION',
     'PM-DECISION-CHECK',
     'REG-FDNY-FEE-REVIEW',
     'MY-NEW-SPECIAL-SPACE'  // New special case space
   ];
   ```

3. Update the handleSpecialCaseSpace method to dispatch to your new handler:
   ```javascript
   MoveLogicSpecialCases.prototype.handleSpecialCaseSpace = function(gameState, player, currentSpace) {
     // Implementation for each special case
     switch (currentSpace.name) {
       case 'ARCH-INITIATION':
         return this.handleArchInitiation(gameState, player, currentSpace);
       case 'PM-DECISION-CHECK':
         return this.handlePmDecisionCheck(gameState, player, currentSpace);
       case 'REG-FDNY-FEE-REVIEW':
         return this.handleFdnyFeeReview(gameState, player, currentSpace);
       case 'MY-NEW-SPECIAL-SPACE':  // Add case for new special space
         return this.handleMyNewSpecialSpace(gameState, player, currentSpace);
       default:
         console.log('MoveLogicSpecialCases: No handler for space:', currentSpace.name);
         return window.MoveLogicBase.prototype.getSpaceDependentMoves.call(this, gameState, player, currentSpace);
     }
   };
   ```

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

### Working with MoveLogicManager

When maintaining or extending the MoveLogicManager component:

1. **File Order Dependencies**:
   - The files must be loaded in the correct order (as specified in Index.html)
   - MoveLogicBase.js → MoveLogicSpecialCases.js → MoveLogicUIUpdates.js → MoveLogicManager.js → MoveLogicBackwardCompatibility.js → utils/MoveLogicManager.js

2. **Adding New Functionality**:
   - Add basic logic to MoveLogicBase.js
   - Add special case handling to MoveLogicSpecialCases.js
   - Add UI-related methods to MoveLogicUIUpdates.js
   - Add event handling or state management to MoveLogicManager.js

3. **Best Practices**:
   - Always bind event handlers and store references for cleanup
   - Use the cache system for frequently accessed moves
   - Follow the established naming conventions
   - Add proper logging at the beginning and end of each method
   - Clear cached data when relevant game state changes
   - Ensure all event listeners are properly removed during cleanup

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

8. **MoveLogicManager issues**:
   - Check that all required modules are loaded in the correct order
   - Verify that event listeners are properly registered with GameStateManager
   - Check the cache invalidation logic when game state changes
   - Ensure proper cleanup of event listeners

### Debugging Tips

1. Check the browser console for errors
2. Use the console.log statements at the beginning and end of each file to track execution flow
3. Verify that `GameState.extractSpaceName` is correctly parsing space names
4. Ensure `GameState.hasPlayerVisitedSpace` is properly checking visit history
5. Use the browser console to check for card drawing and processing events
6. Verify that dice outcomes are being properly categorized
7. Check CSS classes for proper animation sequencing
8. Examine event listeners to ensure proper registration and cleanup

---

*Last Updated: May 1, 2025*