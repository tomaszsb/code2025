# Current Technical Architecture

## Overview
This document describes the current technical architecture of the Project Management Game, including component relationships, data flow, and key subsystems. It serves as a guide for developers working on the codebase.

## Component Structure

The application follows a component-based architecture using React. Here's the hierarchy of components:

```
App
└── GameBoard
    ├── PlayerInfo
    ├── SpaceInfo
    ├── BoardDisplay
    ├── DiceRoll
    └── CardDisplay
```

### 1. App Component
- **Purpose**: Root component that initializes the game
- **Responsibilities**:
  - Renders either GameBoard or PlayerSetup based on game state
  - Catches and handles errors at the application level
  - Provides loading and error UI states

### 2. GameBoard Component
- **Purpose**: Main game controller component
- **Responsibilities**:
  - Manages overall game flow
  - Handles player turns
  - Controls space selection and player movement
  - Manages dice rolling interface
  - Controls card drawing and management
  - Detects end game condition
  - Displays game instructions

### 3. PlayerInfo Component
- **Purpose**: Displays information about players
- **Responsibilities**:
  - Shows player name, color, and resources
  - Highlights the current player

### 4. SpaceInfo Component
- **Purpose**: Displays information about the selected space
- **Responsibilities**:
  - Shows space name, type, and description
  - Displays different information based on visit type (first vs. subsequent)
  - Shows dice roll outcomes in categorized format
  - Provides context for card drawings and other space effects

### 5. BoardDisplay Component
- **Purpose**: Renders the game board
- **Responsibilities**:
  - Creates the visual representation of spaces in a snake layout
  - Shows player tokens on their current spaces
  - Highlights available moves
  - Handles space click events
  - Dynamically adjusts layout based on space count

### 6. DiceRoll Component
- **Purpose**: Handles dice rolling mechanics
- **Responsibilities**:
  - Renders 3D dice with animations
  - Provides realistic rolling experience
  - Processes roll outcomes into categories
  - Displays available moves based on roll
  - Maintains roll history
  - Shows outcomes directly on space info card

### 7. CardDisplay Component
- **Purpose**: Manages player cards
- **Responsibilities**:
  - Displays player's hand of cards
  - Supports card filtering by type
  - Provides detailed card view
  - Allows playing and discarding cards
  - Shows animations for card drawing

## Key Utilities

### 1. GameState
- **Purpose**: Central state management
- **Responsibilities**:
  - Stores game data (players, spaces, game status)
  - Handles player movement
  - Tracks visited spaces
  - Manages persistence via localStorage
  - Manages card collections and player cards
  - Handles card drawing, playing, and discarding

### 2. MoveLogic
- **Purpose**: Handles complex move calculations
- **Responsibilities**:
  - Determines available moves for a player
  - Handles special case spaces
  - Processes space-dependent move logic

### 3. DiceRollLogic
- **Purpose**: Processes dice roll outcomes
- **Responsibilities**:
  - Loads dice roll data from CSV
  - Maps roll results to categorized outcomes
  - Determines next spaces based on rolls
  - Processes different outcome types (next step, time, fees, cards, etc.)

### 4. CSV Parser
- **Purpose**: Parses CSV data files
- **Responsibilities**:
  - Converts CSV text to JavaScript objects
  - Handles header mapping
  - Processes different file types (spaces, cards, dice roll data)

## Data Flow

1. **Initialization**:
   - Main.js loads CSV data for spaces, cards, and dice rolls
   - GameState initializes with space and card data
   - DiceRollLogic initializes with dice roll data
   - App component renders based on saved game state

2. **Game Flow**:
   - Player selects a space to move to
   - GameBoard component calls GameState.movePlayer()
   - GameState updates player position and visited spaces
   - GameBoard updates available moves through MoveLogic
   - When a player ends their turn, GameState advances to the next player

3. **Dice Rolling**:
   - When required, DiceRoll component is displayed
   - Player clicks to roll the dice
   - 3D dice animation shows the rolling process
   - DiceRoll component generates a random number
   - DiceRollLogic processes the outcome
   - Outcomes are categorized (movement, cards, resources, other)
   - Available moves are updated based on the roll
   - SpaceInfo displays the categorized outcomes
   - Player selects a move or ends their turn

4. **Card Management**:
   - Cards are drawn based on space requirements or dice roll outcomes
   - CardDisplay shows the player's hand of cards
   - Player can filter cards by type (W, B, I, L, E)
   - Player can view card details, play, or discard cards
   - GameState updates the player's cards
   - Card effects are applied to gameplay

5. **Visit Types**:
   - When a player moves to a space, GameState determines if it's a first or subsequent visit
   - Different outcomes and available moves may result based on visit type
   - SpaceInfo displays information relevant to the visit type
   - Dice roll outcomes and card drawings are affected by visit type

## Key Subsystems

### 1. Visit Type System
The game distinguishes between first and subsequent visits to spaces:
- **First Visit**: When a player has never been to a space before
- **Subsequent Visit**: When a player returns to a previously visited space
- The visit type affects:
  - Available moves
  - Dice roll outcomes
  - Space description and actions
  - Card drawing

### 2. Dice Rolling System
The enhanced dice rolling mechanic:
- Uses a 3D animated 6-sided die with realistic appearance
- Provides smooth rolling animations with proper CSS transforms
- Maps roll results to outcomes based on CSV data
- Categorizes outcomes for clear presentation (movement, cards, resources, other)
- Integrates directly with the space information display
- Supports multiple outcome types:
  - Next Step (movement)
  - Time outcomes
  - Fee outcomes
  - Card outcomes
  - Quality outcomes
  - Multiplier outcomes

### 3. Card System
The card system is fully implemented:
- Card data is defined in CSV files
- Five card types are supported:
  - W Cards (Work Type): Represent different types of work in the project
  - B Cards (Bank): Related to financial aspects of the project
  - I Cards (Investor): Represent investor-related events
  - L Cards (Leadership): Focus on team and leadership challenges
  - E Cards (Environment): Address external factors affecting the project
- Card drawing is triggered by specific spaces and dice roll outcomes
- CardDisplay component provides a full UI for:
  - Viewing cards in hand
  - Filtering by card type
  - Examining card details
  - Playing and discarding cards
- Animated card drawing provides visual feedback
- Card effects are integrated with gameplay

### 4. Space Navigation
Movement between spaces follows these rules:
- Each space defines its potential next spaces
- Available moves are filtered based on game state and visit type
- Special case spaces have custom logic in MoveLogic
- Dice roll outcomes can affect available moves

## Data Structure

### 1. Player Object
```javascript
{
  id: String,           // Unique identifier
  name: String,         // Player name
  color: String,        // Player color (hex code)
  position: String,     // ID of current space
  visitedSpaces: [],    // Array of spaces the player has visited
  previousPosition: String, // Previous position for tracking movement
  cards: [],            // Array of card objects in player's hand
  resources: {
    money: Number,      // Amount of money
    time: Number        // Time spent (days)
  }
}
```

### 2. Space Object
```javascript
{
  id: String,           // Unique identifier
  name: String,         // Name of the space
  type: String,         // Type of space (SETUP, DESIGN, FUNDING, etc.)
  description: String,  // Description of the space
  visitType: String,    // 'first' or 'subsequent'
  nextSpaces: [String], // Array of space names that can be reached
  action: String,       // Action description
  outcome: String,      // Outcome description
  // Additional properties from CSV:
  'W Card': String,     // W Card information
  'B Card': String,     // B Card information
  'I Card': String,     // I Card information
  'L card': String,     // L Card information
  'E Card': String,     // E Card information
  Time: String,         // Time information
  Fee: String,          // Fee information
  // Raw next space values from CSV:
  rawSpace1: String,
  rawSpace2: String,
  rawSpace3: String,
  rawSpace4: String,
  rawSpace5: String,
  rawNegotiate: String
}
```

### 3. Card Object
```javascript
{
  id: String,           // Unique identifier
  type: String,         // Card type (W, B, I, L, E)
  'Work Type': String,  // Type of work (for W cards)
  'Job Description': String, // Description of the job
  'Estimated Job Costs': Number, // Cost estimate
  // Additional properties based on card type
  // B, I, L, E cards have their own specific properties
}
```

### 4. Dice Outcome Object
```javascript
{
  'Space Name': String,  // Name of the space this outcome applies to
  'Visit Type': String,  // 'first' or 'subsequent'
  'Die Roll': String,    // Type of outcome (Next Step, WCards, Time, Fee, etc.)
  '1': String,           // Outcome for rolling 1
  '2': String,           // Outcome for rolling 2
  '3': String,           // Outcome for rolling 3
  '4': String,           // Outcome for rolling 4
  '5': String,           // Outcome for rolling 5
  '6': String            // Outcome for rolling 6
}
```

## Known Issues and Areas for Improvement

### 1. Performance Concerns
- Multiple checks for visited spaces could impact performance with many players
- Complex move logic with many conditional checks
- Frequent state updates during turns

### 2. Maintainability Challenges
- Special case handling in MoveLogic creates maintenance burden
- Visit type logic spans multiple files
- Dice roll outcome processing is complex

### 3. Feature Gaps
- ~~Card UI is not yet implemented~~ ✓ COMPLETED!
- ~~Dice roll visuals lack engaging 3D effects~~ ✓ COMPLETED!
- Negotiation mechanics are defined in data but not fully implemented
- Full educational content integration is pending

## Recommendations for Developers

1. When modifying space behavior, check both MoveLogic.js and GameState.js
2. When adding features that affect the game flow, consider both visit types
3. Test dice roll outcomes thoroughly when making changes
4. When working with cards, ensure both data structure and UI are updated
5. Follow the established pattern of logging at the beginning and end of files
6. Use the GameState utility for managing game state instead of component state where possible
7. When modifying dice roll functionality, ensure outcome categorization is maintained
8. Test card interactions thoroughly, including filtering, playing, and discarding

## Planned Enhancements

1. ~~Complete the card UI implementation~~ ✓ COMPLETED!
2. ~~Refine the dice roll outcome processing~~ ✓ COMPLETED!
3. Implement the negotiation mechanic
4. Add animations and improved visual feedback for player movement
5. Enhance the educational content
6. Optimize performance for larger game boards

This document reflects the current state of the codebase and will be updated as development progresses.
