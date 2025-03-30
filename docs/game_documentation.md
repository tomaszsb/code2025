# Project Management Game Documentation

## Overview

This document provides details about the Project Management Game's structure, functionality, and recent modifications.

## Game Structure

The game is a board-game style application that simulates a project management journey. Players move through spaces that represent different phases of project management, from initiation to completion.

### Main Components

1. **GameState** (`js/data/game-state.js`): Manages the game's state, including players, spaces, moves, and turn order.
2. **App** (`js/components/App.js`): The main container component that renders either the PlayerSetup or GameBoard based on the game state.
3. **PlayerSetup** (`js/components/PlayerSetup.js`): Handles player creation and game initialization.
4. **GameBoard** (`js/components/GameBoard.js`): The main game interface, showing the board, player information, and controls.
5. **BoardDisplay** (`js/components/BoardDisplay.js`): Renders the game board and spaces.
6. **SpaceInfo** (`js/components/SpaceInfo.js`): Displays information about the selected space and dice roll outcomes.
7. **PlayerInfo** (`js/components/PlayerInfo.js`): Shows information about each player.
8. **DiceRoll** (`js/components/DiceRoll.js`): Handles dice rolling mechanics with 3D visualization and outcome processing.
9. **CardDisplay** (`js/components/CardDisplay.js`): Manages player cards, including display, filtering, and interaction.

## Recent Modifications

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

3. **CSS Adjustments**:
   - Board container now has fixed minimum height with auto adjustment
   - Main game container uses a reasonable minimum height that adapts to content
   - These changes eliminate excessive white space on the page

### Enhanced Dice Roll System

The dice roll system has been significantly enhanced to provide a better visual experience and improved integration with the space information display:

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

3. **Space Integration**:
   - Dice rolling interface fully integrated within the space card
   - Dice roll outcomes display directly on the space information card
   - Outcomes categorized by type (movement, cards, resources, other)
   - Roll Dice button is disabled for spaces that don't require dice rolls

### Card System Implementation

A complete card management system has been implemented with the following features:

1. **Card Display Component**:
   - Shows player's hand with card type and content
   - Allows filtering by card type (W, B, I, L, E)
   - Provides detailed view of selected cards
   - Supports card playing and discarding
   - Animated card drawing for visual feedback

2. **Card Types**:
   - W Cards (Work Type): Represent different types of work in the project
   - B Cards (Bank): Related to financial aspects of the project
   - I Cards (Investor): Represent investor-related events
   - L Cards (Leadership): Focus on team and leadership challenges
   - E Cards (Environment): Address external factors affecting the project

3. **Card Integration**:
   - Cards are drawn based on space requirements and dice roll outcomes
   - Card effects are applied to gameplay
   - Cards are stored in the player's game state
   - Cards can be viewed, played, or discarded by the player

## How The Game Works

### Game Initialization

1. The game loads space data and card data from CSV files
2. Players are created with starting resources and positioned at the start space
3. The game board is rendered with spaces filtered based on visit status

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

### Card System Implementation

```javascript
// Example of card drawing implementation
drawCard = (cardType, cardData) => {
  // Show animation
  this.setState({
    animateCardDraw: true,
    newCardType: cardType,
    newCardData: cardData
  });
  
  // After animation completes, add the card to player's hand
  setTimeout(() => {
    // Get current cards
    const { cards } = this.state;
    
    // Create a new card object
    const newCard = {
      id: `card-${Date.now()}`, // Unique ID
      type: cardType,
      ...cardData
    };
    
    // Add card to hand
    const updatedCards = [...cards, newCard];
    
    // Update state
    this.setState({
      cards: updatedCards,
      animateCardDraw: false,
      newCardType: null,
      newCardData: null
    });
    
    // Update player state
    const { playerId } = this.props;
    const player = window.GameState.players.find(p => p.id === playerId);
    
    if (player) {
      player.cards = updatedCards;
      window.GameState.saveState();
    }
  }, 1500); // Animation duration
}
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

## Troubleshooting

### Common Issues

1. **Spaces not showing correctly**: Check that spaces in the CSV have proper first/subsequent visit types
2. **Board layout problems**: Verify CSS styles for the board container and spaces
3. **Visit history not working**: Ensure the player's `visitedSpaces` array is being updated correctly
4. **Card display problems**: Check that card data is properly loaded and that the CardDisplay component is receiving the correct player ID
5. **Dice roll animation issues**: Verify CSS animations are working correctly and that the browser supports 3D transforms
6. **Missing dice outcomes**: Ensure the dice roll CSV data includes entries for the space and visit type

### Debugging Tips

1. Check the browser console for errors
2. Verify that `GameState.extractSpaceName` is correctly parsing space names
3. Ensure `GameState.hasPlayerVisitedSpace` is properly checking visit history
4. Use the browser console to check for card drawing and processing events
5. Verify that dice outcomes are being properly categorized
6. Check CSS classes for proper animation sequencing
