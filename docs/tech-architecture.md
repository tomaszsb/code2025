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
    └── DiceRoll
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

### 5. BoardDisplay Component
- **Purpose**: Renders the game board
- **Responsibilities**:
  - Creates the visual representation of spaces in a snake layout
  - Shows player tokens on their current spaces
  - Highlights available moves
  - Handles space click events

### 6. DiceRoll Component
- **Purpose**: Handles dice rolling mechanics
- **Responsibilities**:
  - Renders dice with animation
  - Processes roll outcomes
  - Displays available moves based on roll
  - Maintains roll history

## Key Utilities

### 1. GameState
- **Purpose**: Central state management
- **Responsibilities**:
  - Stores game data (players, spaces, game status)
  - Handles player movement
  - Tracks visited spaces
  - Manages persistence via localStorage

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
  - Maps roll results to outcomes
  - Determines next spaces based on rolls
  - Processes different outcome types (next step, time, fees, etc.)

### 4. CSV Parser
- **Purpose**: Parses CSV data files
- **Responsibilities**:
  - Converts CSV text to JavaScript objects
  - Handles header mapping

## Data Flow

1. **Initialization**:
   - Main.js loads CSV data for spaces and dice rolls
   - GameState initializes with space data
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
   - DiceRoll component generates a random number
   - DiceRollLogic processes the outcome
   - Available moves are updated based on the roll
   - Player selects a move or ends their turn

4. **Visit Types**:
   - When a player moves to a space, GameState determines if it's a first or subsequent visit
   - Different outcomes and available moves may result based on visit type
   - SpaceInfo displays information relevant to the visit type

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
The dice rolling mechanic:
- Uses a 6-sided die
- Maps roll results to outcomes based on CSV data
- Supports multiple outcome types:
  - Next Step (movement)
  - Time outcomes
  - Fee outcomes
  - Card outcomes
  - Quality outcomes
  - Multiplier outcomes

### 3. Card System
The card system is partially implemented:
- Card data is defined in CSV files
- Five card types are supported (W, B, I, L, E)
- Card drawing is triggered by specific spaces
- Card UI display is not yet implemented

### 4. Space Navigation
Movement between spaces follows these rules:
- Each space defines its potential next spaces
- Available moves are filtered based on game state and visit type
- Special case spaces have custom logic in MoveLogic

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
- Card UI is not yet implemented
- Negotiation mechanics are defined in data but not fully implemented
- Full educational content integration is pending

## Recommendations for Developers

1. When modifying space behavior, check both MoveLogic.js and GameState.js
2. When adding features that affect the game flow, consider both visit types
3. Test dice roll outcomes thoroughly when making changes
4. When working with cards, ensure both data structure and UI are updated
5. Follow the established pattern of logging at the beginning and end of files
6. Use the GameState utility for managing game state instead of component state where possible

## Planned Enhancements

1. Complete the card UI implementation
2. Refine the dice roll outcome processing
3. Add animations and improved visual feedback
4. Implement the negotiation mechanic
5. Enhance the educational content

This document reflects the current state of the codebase and will be updated as development progresses.
