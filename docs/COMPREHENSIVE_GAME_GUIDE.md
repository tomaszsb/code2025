# Comprehensive Game Guide

**Project**: Project Management Board Game  
**Last Updated**: January 2025  
**Audience**: Players, Developers, and Game Modifiers

> **Note**: For a concise player-only guide, see [PLAYER_GUIDE.md](PLAYER_GUIDE.md)

---

## Table of Contents

1. [For Players: How to Play](#for-players-how-to-play)
2. [For Developers: Technical Implementation](#for-developers-technical-implementation)
3. [For Modifiers: Safe Editing Guide](#for-modifiers-safe-editing-guide)
4. [Game Mechanics Deep Dive](#game-mechanics-deep-dive)

---

# For Players: How to Play

## Game Overview

Welcome to the Project Management Game! This board game simulates managing a construction project from initial concept through completion. As a project manager, you'll navigate challenges, make strategic decisions, and manage resources to successfully complete your project.

## Getting Started

1. **Setup**: Enter your name and select a color
2. **Starting Position**: All players begin at OWNER-SCOPE-INITIATION
3. **Game Objective**: Navigate through all project phases while managing resources effectively

## How to Play

### Turn Structure

On your turn:

1. **View Current Space**: The middle panel shows information about your current location
2. **See Available Moves**: Blue buttons display where you can move next
3. **Select Your Move**: Click a blue button to choose your destination
4. **Roll Dice (if required)**: Some spaces require dice rolls to determine outcomes
5. **Draw Cards (if directed)**: You may draw cards based on your space or dice results
6. **End Turn**: Click "End Turn" to complete your move and pass play to the next player

### Movement System

- **Available Moves**: Click blue buttons in the Space Info panel to select destinations
- **Movement Confirmation**: Your move executes when you click "End Turn"
- **Dice-Based Outcomes**: Some spaces use dice rolls to determine next actions
- **Path Types**: Main path, special detours, and side quest paths available

### Card System

The game features five card types with specific purposes:

1. **Work Type (W) Cards**: Define project scope and work requirements
2. **Bank (B) Cards**: Provide loans and financial resources
3. **Investor (I) Cards**: Offer investment capital with different terms
4. **Life (L) Cards**: Represent unexpected life events affecting your project
5. **Expeditor (E) Cards**: Provide special abilities to overcome challenges

#### Card Limits
- **Maximum per type**: 6 cards of each type
- **Visual indicators**: Card counts display current vs. maximum
- **Automatic management**: System prompts to discard excess cards

### Dice Rolling

- **When Required**: "Roll Dice" button appears on spaces requiring dice rolls
- **Outcomes**: Results determine next spaces, resource changes, or cards drawn
- **Visual Feedback**: 3D dice animation with clear outcome display

### Resource Management

- **Money**: Track financial resources for project costs and fees
- **Time**: Project timeline measured in days (more time = higher costs)
- **Strategic Balance**: Manage speed vs. cost throughout the project

## Game Phases

1. **SETUP**: Define project scope and secure initial funding
2. **OWNER**: Handle owner decisions and approvals  
3. **FUNDING**: Secure financing from banks or investors
4. **DESIGN**: Work with architects and engineers
5. **REGULATORY**: Navigate building department approvals
6. **CONSTRUCTION**: Build the project and handle construction issues

## Space Types and Visit Mechanics

- **First vs. Subsequent Visits**: Spaces behave differently on repeat visits
- **Path Categories**: Main path, special detours, side quests
- **Special Spaces**: PM-DECISION-CHECK and other decision points

## Tips for Success

1. **Plan Your Route**: Look ahead to determine efficient paths
2. **Manage Resources**: Monitor money and time carefully
3. **Use Cards Strategically**: Play cards at optimal moments
4. **Consider All Options**: Evaluate negotiation vs. accepting outcomes
5. **Watch for Opportunities**: Pay attention to special move options

---

# For Developers: Technical Implementation

## Architecture Overview

### Core Pattern: Manager-Based + Event-Driven
- **Manager Classes**: Specialized managers for major systems
- **Event System**: Components communicate through GameStateManager events
- **Data-Driven**: CSV files drive game logic instead of hardcoded rules
- **Staged Initialization**: 5-stage deterministic loading

### Key Systems

#### 1. State Management
**`js/data/GameStateManager.js`** - Central state manager
- Manages all game state and player data
- Custom event system for component communication
- localStorage persistence with backward compatibility

#### 2. Movement System
**`js/utils/movement/MovementEngine.js`** - Movement processing
- CSV-driven movement rules
- Complex space handling (PM-DECISION-CHECK, special paths)
- Visit tracking and space type resolution

#### 3. Card System
**Unified card architecture** with advanced features:
- Single `data/cards.csv` with 398 cards and 48 metadata fields
- Advanced combo and chain reaction systems
- Complex targeting patterns and multi-card interactions
- Performance optimization with O(1) lookups

#### 4. Initialization System
**`js/components/managers/InitializationManager.js`** - 5-stage loading:
1. Utilities and core systems
2. Component registry and movement engine
3. GameStateManager and game state
4. Manager components
5. UI components and main application

### Data Layer

#### CSV Files (Current Implementation)
- **`data/Spaces.csv`**: Board spaces with Path and RequiresDiceRoll columns
- **`data/cards.csv`**: Unified card data (398 cards, 5 types: W, B, I, L, E)
- **`data/DiceRoll Info.csv`**: Dice roll outcomes

#### Data-Driven Features
- Game mechanics defined in CSV files, not hardcoded
- `Path` column categorizes spaces (Main, Special, Side quest)
- `RequiresDiceRoll` controls dice mechanics
- Placeholder system for dynamic content

### Component Architecture

#### Manager Pattern Implementation
- **InitializationManager**: 5-stage app initialization
- **SpaceInfoManager**: Space information display  
- **CardManager**: Card drawing, effects, and management
- **MovementEngine**: Movement logic processing

#### Communication Patterns
```javascript
// Event-driven communication
GameStateManager.addEventListener('playerMoved', handler);
GameStateManager.dispatchEvent('gameStateChanged', data);

// Interface pattern for cross-component access
window.CardManagerInterface = {
    drawCard: function(type) { /* ... */ },
    getCardCount: function(type) { /* ... */ }
};

// React State Updates (Critical Pattern)
// Always preserve existing state
this.setState(prevState => ({ 
    ...prevState, 
    newProperty: value 
}));

// CSV Data Standards
// Space Objects: Use space.space_name (not space.name)
// Card Objects: Support both card.card_type and card.type
// Movement Data: Uses space_1, space_2, etc. columns
```

### Modern Architecture Patterns
- **Manager Pattern**: Specialized managers for major systems
- **Event System**: Loose coupling through GameStateManager events
- **Component Interfaces**: Standardized communication patterns
- **Separation of Concerns**: Clear division between UI, logic, and data
- **Data-Driven Configuration**: Game rules externalized to CSV files
- **5-Stage Initialization**: Deterministic loading via InitializationManager

### Performance Optimization
- **Advanced Indexing**: Multi-dimensional card indexes for O(1) lookups
- **Space Caching System**: byId, byName, byNormalizedName caches for instant space lookups
- **Efficient Rendering**: Minimal DOM updates and optimized animations
- **Memory Management**: Proper cleanup of event listeners and resources
- **Animation Optimization**: 20+ keyframe animations with hardware acceleration

### Critical Development Constraints
- **No localStorage/sessionStorage**: Not supported in Claude.ai artifacts - use React state instead
- **Loading Order Dependencies**: Components must load in specific sequence (see above)
- **CSV-Driven Logic**: Never hardcode game rules - always use CSV data
- **Event-Driven Communication**: Use GameStateManager events, not direct calls
- **Property Name Standards**: Use snake_case for consistency (space_name, card_type, etc.)

### File Organization
```
js/components/
├── managers/              # 12+ Manager classes for specialized systems
│   ├── InitializationManager.js  # 5-stage app initialization
│   ├── SpaceInfoManager.js       # Space information display
│   ├── SpaceExplorerManager.js   # Space explorer panel operations
│   ├── SpaceSelectionManager.js  # Space selection logic and UI
│   ├── LogicSpaceManager.js      # Logic space handling
│   └── BoardStyleManager.js      # Dynamic board styling
├── utils/                # Utility frameworks and helpers
│   ├── CardDrawUtil.js           # Card drawing logic
│   ├── CardTypeConstants.js      # Card type definitions
│   ├── DiceOutcomeParser.js      # Dice outcome processing
│   ├── DiceRollLogic.js          # Dice roll mechanics
│   ├── csv-parser.js             # Advanced CSV parsing
│   └── movement/                 # Movement system utilities
├── App.js                # Root React component
├── GameBoard.js          # Main game controller
├── BoardRenderer.js      # Multi-layer board rendering
├── BoardSpaceRenderer.js # Individual space rendering
├── BoardDisplay.js       # Board display coordination
├── SpaceInfo.js         # Modular space information
│   ├── SpaceInfoDice.js         # Dice-specific space info
│   ├── SpaceInfoCards.js        # Card-specific space info
│   ├── SpaceInfoMoves.js        # Move-specific space info
│   └── SpaceInfoUtils.js        # Space info utilities
├── CardDisplay.js       # Card management interface
├── CardDetailView.js    # Detailed card viewing
├── CardActions.js       # Card action handling
├── CardAnimations.js    # Card animation system
├── WorkCardDialogs.js   # Work card specific dialogs
├── DiceRoll.js          # Dice rolling mechanics
├── DiceManager.js       # Dice system management
├── PlayerSetup.js       # Player setup interface
├── PlayerInfo.js        # Player information display
├── StaticPlayerStatus.js # Static player status panel
├── PlayerMovementVisualizer.js # Advanced movement animations
├── TurnManager.js       # Turn progression system
├── TooltipSystem.js     # Context-sensitive tooltips
├── InteractiveFeedback.js # Toast notifications and feedback
├── GameStateAnimations.js # Phase and turn animations
└── SpaceExplorer.js     # Space exploration interface

css/
├── main.css             # Core layout, design tokens, CSS variables
├── game-components.css  # Game-specific UI elements
├── card-components.css  # Comprehensive card styling system
├── player-animations.css # 20+ movement and transition animations
├── dice-animations.css  # 3D dice animations and effects
├── board-space-renderer.css # Board space styling
├── logic-space-components.css # Logic space specific styling
├── space-explorer.css   # Space explorer panel styling
├── space-info.css       # Space information styling
├── static-player-status.css # Player status panel styling
└── player-setup.css     # Player setup interface styling

data/
├── Spaces.csv         # Game board definition with Path and RequiresDiceRoll
├── cards.csv          # Unified card data (398 cards, 48 metadata fields)
└── DiceRoll Info.csv  # Dice outcomes and requirements
```

### Development Commands

```bash
# Development server (any static file server)
python -m http.server 8000
# or
npx serve .
# or simply open Index.html in browser

# Debug mode access
http://localhost:8000/?debug=true&logLevel=debug
```

**No build system** - Static web application with browser-based Babel compilation for JSX.

### Critical Loading Order

Components must load in this sequence (defined in Index.html):
1. Utilities (csv-parser, cache-buster)
2. Component Registry
3. Movement System (before GameStateManager)
4. GameStateManager & game-state
5. Manager components
6. UI components
7. Main application script

**This order is critical** - changing it will break the application due to dependency requirements.

### Data Standards

#### CSV Column Mapping
All CSV data follows these conventions:
- **Column Headers**: Mixed case as they exist (space_name, Event, Action, space_1, Time, etc.)
- **Internal Properties**: Always mapped to snake_case for consistency (space_1, visit_type, w_card)
- **Movement Data**: Uses space_1, space_2, space_3, space_4, space_5 columns
- **Card Data**: Uses w_card, b_card, i_card, l_card, e_card columns
- **No Hardcoded Logic**: All game mechanics read from CSV files, not code constants

#### Property Name Standardization Rules
Moving forward, all components must use:
- **Space Objects**: `space.space_name` (not `space.name`)
- **Move Objects**: `move.name` for space name, `move.id` for generated ID
- **Card Objects**: Both `card.card_type` and `card.type` for type checking
- **Card Fields**: Current CSV names (`work_type_restriction`, `work_cost`) with legacy fallbacks
- **React setState**: Always use function form with spread operator to preserve state

---

# For Modifiers: Safe Editing Guide

## Safe Files to Edit

### 1. Game Data Files (Safest)
These contain game content and are safest to modify:

- **`data/Spaces.csv`**: Board spaces and their properties
- **`data/cards.csv`**: All card data (398 cards, 5 types)
- **`data/DiceRoll Info.csv`**: Dice roll outcomes

### 2. Visual Appearance Files
Control how the game looks:

- **`css/main.css`**: Overall visual styling
- **`css/card-components.css`**: Card appearance
- **`css/game-components.css`**: Game UI styling
- **`css/board-space-renderer.css`**: Board space appearance

### 3. Game Mechanics Files (More Advanced)
Control game behavior - edit carefully:

- **`js/components/CardManager.js`**: Card drawing and effects
- **`js/components/DiceManager.js`**: Dice rolling behavior
- **`js/components/TurnManager.js`**: Turn order and flow
- **`js/utils/movement/MovementEngine.js`**: Player movement rules

## Common Modifications

### Change Card Limits
**File**: `js/components/CardDisplay.js`  
**Look for**: `const CARD_TYPE_LIMIT = 6;`  
**Change to**: `const CARD_TYPE_LIMIT = 8;` (or desired number)

### Modify Dice Roll Outcomes
**File**: `data/DiceRoll Info.csv`  
**Edit**: Outcome values and descriptions for specific spaces

### Change Starting Resources
**File**: `js/components/PlayerSetup.js`  
**Look for**: Initial money and time values  
**Change**: Starting amounts

### Modify Card Effects
**File**: `data/cards.csv`  
**Edit**: Card descriptions, monetary values, and effects

## Safe Editing Workflow

1. **Always backup**: Copy the file and add ".backup" to the filename
2. **One change at a time**: Don't modify multiple things simultaneously
3. **Test immediately**: Check your change works and doesn't break anything
4. **Take notes**: Document exactly what you changed
5. **If something breaks**: Restore from backup and try a smaller change

## Tips for Non-Programmers

- **Comments are helpful**: Text after `//` or between `/* */` explains code
- **Use search**: Ctrl+F to find keywords like "card limit" or space names
- **Numbers are usually safe**: Values like `6`, `100`, `0.5` represent game values
- **Text in quotes is safe**: Strings like `"You drew a card!"` can be changed
- **Don't change structure**: Focus on changing values, not code organization

---

# Game Mechanics Deep Dive

## Movement System

### How It Works
Players move by selecting from available spaces. The system uses CSV data to determine movement rules.

### Key Components
- **MovementEngine.js**: Core movement processing
- **Spaces.csv**: Defines all spaces and their properties  
- **Path system**: Main, Special, and Side quest categorization

### Special Movement Features
- **PM-DECISION-CHECK**: Special decision point with return-to-origin logic
- **Visit tracking**: Spaces behave differently on first vs. subsequent visits
- **Dice-driven movement**: Some spaces require dice rolls for next location

## Card System Architecture

### Unified Card Structure
- **Single CSV**: All 404 cards in `data/cards.csv`
- **48 Metadata Fields**: Comprehensive card properties
- **5 Card Types**: W (Work), B (Bank), I (Investor), L (Life), E (Expeditor)

### Card Features
- **Basic Effects**: Money, time, resource management across all cards
- **Experimental Advanced Features**: Combo requirements and chain effects in TEST cards only
- **Multi-Player Interactions**: Some cards affect other players
- **Phase-Specific Cards**: Some cards only work in certain project phases

### Card Management
- **6-card limits**: Per type, with visual indicators
- **Automatic enforcement**: System prompts for excess card disposal
- **Strategic play**: Cards provide significant advantages when timed correctly

## Dice System

### Data-Driven Implementation
- **CSV Outcomes**: All dice results defined in `DiceRoll Info.csv`
- **Visual Feedback**: 3D dice animation with clear results
- **Space Integration**: Dice requirements determined by CSV data

### Dice Roll Processing
- **Requirement Detection**: `RequiresDiceRoll` column in Spaces.csv
- **Outcome Resolution**: Results determine next spaces or card draws
- **Visual Presentation**: Categorized outcome display

## Resource Management

### Player Resources
- **Money**: Financial resources for project costs
- **Time**: Project timeline (days) - affects overall project cost
- **Cards**: Strategic resources with type-specific limits

### Resource Tracking
- **Real-time display**: Current values always visible
- **Historical tracking**: Changes logged for analysis
- **Strategic decisions**: Balance speed vs. cost throughout game

## Game State Management

### Event-Driven Architecture
- **Central state**: GameStateManager handles all game state
- **Event system**: Components communicate through events
- **Persistence**: Automatic localStorage saves with backward compatibility

### State Transitions
- **Turn management**: Automated turn progression
- **Phase tracking**: Visual indicators for project phases
- **Save/Load**: Complete game state preservation

## Technical Performance Features

### Optimization Systems
- **Advanced Indexing**: O(1) card lookups for 398-card dataset
- **Efficient Rendering**: Optimized DOM updates and animations
- **Memory Management**: Proper cleanup of event listeners and animations
- **Responsive Design**: Works across desktop, tablet, and mobile devices

### Error Handling
- **Graceful degradation**: System continues functioning with missing data
- **User-friendly errors**: Clear error messages for players
- **Debug support**: Comprehensive logging system for development

---

## Getting Help

### Debug Mode
Access enhanced debugging with URL parameters:
- `?debug=true&logLevel=debug` - Enable detailed console logging
- Use `Index-debug.html` for development interface

### Documentation References
- **CLAUDE.md**: Project instructions and architecture overview
- **TECHNICAL_REFERENCE.md**: Detailed technical documentation
- **FUTURE_DEVELOPMENT_PLAN.md**: Planned enhancements and roadmap

### Development Support
- All major systems have comprehensive logging
- Clear error messages guide troubleshooting
- Modular architecture allows safe file-by-file modifications

---

*This guide consolidates all player, developer, and modifier documentation into a single comprehensive reference for the Project Management Board Game.*