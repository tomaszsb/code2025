# Comprehensive Game Guide

**Project**: Project Management Board Game  
**Last Updated**: June 18, 2025  
**Audience**: Players, Developers, and Game Modifiers

**Note**: For a concise player-only guide, see [PLAYER_GUIDE.md](PLAYER_GUIDE.md)

## Table of Contents

1. [For Players: How to Play](#for-players-how-to-play)
2. [For Developers: Technical Implementation](#for-developers-technical-implementation)
3. [For Modifiers: Safe Editing Guide](#for-modifiers-safe-editing-guide)
4. [Game Mechanics Deep Dive](#game-mechanics-deep-dive)

# For Players: How to Play

## Game Overview

This board game simulates managing a construction project from initial concept through completion. As a project manager, you'll navigate challenges, make strategic decisions, and manage resources to successfully complete your project.

## Getting Started

1. Setup: Enter your name and select a color
2. Starting Position: All players begin at OWNER-SCOPE-INITIATION
3. Game Objective: Navigate through all project phases while managing resources effectively

## How to Play

### Turn Structure

On your turn:

1. View Current Space: The middle panel shows information about your current location
2. See Available Moves: Blue buttons display where you can move next
3. Select Your Move: Click a blue button to choose your destination
4. Roll Dice (if required): Some spaces require dice rolls to determine outcomes
5. Draw Cards (if directed): You may draw cards based on your space or dice results
6. End Turn: Click "End Turn" to complete your move and pass play to the next player

### Movement System

- Available Moves: Click blue buttons in the Space Info panel to select destinations
- Movement Confirmation: Your move executes when you click "End Turn"
- Dice-Based Outcomes: Some spaces use dice rolls to determine next actions
- Path Types: Main path, special detours, and side quest paths available

### Card System

The game features five card types with specific purposes:

1. Work Type (W) Cards: Define project scope and work requirements
2. Bank (B) Cards: Provide loans and financial resources
3. Investor (I) Cards: Offer investment capital with different terms
4. Life (L) Cards: Represent unexpected life events affecting your project
5. Expeditor (E) Cards: Provide special abilities to overcome challenges

#### Card Limits
- Maximum per type: 6 cards of each type
- Visual indicators: Card counts display current vs. maximum
- Automatic management: System prompts to discard excess cards

### Dice Rolling

- When Required: "Roll Dice" button appears on spaces requiring dice rolls
- Outcomes: Results determine next spaces, resource changes, or cards drawn
- Visual Feedback: 3D dice animation with clear outcome display

### Resource Management

- Money: Track financial resources for project costs and fees
- Time: Project timeline measured in days (more time = higher costs)
- Strategic Balance: Manage speed vs. cost throughout the project

## Game Phases

1. SETUP: Define project scope and secure initial funding
2. OWNER: Handle owner decisions and approvals  
3. FUNDING: Secure financing from banks or investors
4. DESIGN: Work with architects and engineers
5. REGULATORY: Navigate building department approvals
6. CONSTRUCTION: Build the project and handle construction issues

## Space Types and Visit Mechanics

- First vs. Subsequent Visits: Spaces behave differently on repeat visits
- Path Categories: Main path, special detours, side quests
- Special Spaces: PM-DECISION-CHECK and other decision points

## Tips for Success

1. Plan Your Route: Look ahead to determine efficient paths
2. Manage Resources: Monitor money and time carefully
3. Use Cards Strategically: Play cards at optimal moments
4. Consider All Options: Evaluate negotiation vs. accepting outcomes
5. Watch for Opportunities: Pay attention to special move options

# For Developers: Technical Implementation

## Architecture Overview

### Core Pattern: Component-Based + Event-Driven
- React Components: 30+ specialized UI components with some manager classes
- Event System: Components communicate through GameStateManager events
- Data-Driven: CSV files drive game logic instead of hardcoded rules
- Staged Initialization: 5-stage deterministic loading

### Key Systems

#### 1. State Management
`js/data/GameStateManager.js` - Central state manager
- Manages all game state and player data
- Custom event system for component communication
- localStorage persistence with backward compatibility

#### 2. Movement System
`js/utils/movement/MovementEngine.js` - Movement processing
- CSV-driven movement rules
- Complex space handling (PM-DECISION-CHECK, special paths)
- Visit tracking and space type resolution

#### 3. Card System
Unified card architecture with advanced features:
- Single `data/cards.csv` with 404 cards (398 production + 6 TEST) and 48 metadata fields
- Advanced combo and chain reaction systems
- Complex targeting patterns and multi-card interactions
- Performance optimization with O(1) lookups

#### 4. Initialization System
`js/components/managers/InitializationManager.js` - 5-stage loading:
1. Utilities and core systems
2. Component registry and movement engine
3. GameStateManager and game state
4. Manager components
5. UI components and main application

### Data Layer

#### CSV Files (Current Implementation)
- `data/Spaces.csv`: Board spaces with Path and RequiresDiceRoll columns
- `data/cards.csv`: Unified card data (404 cards total: 398 production cards in 5 types W/B/I/L/E + 6 TEST cards)
- `data/DiceRoll Info.csv`: Dice roll outcomes

#### Data-Driven Features
- Game mechanics defined in CSV files, not hardcoded
- `Path` column categorizes spaces (Main, Special, Side quest)
- `RequiresDiceRoll` controls dice mechanics
- Placeholder system for dynamic content

### Component Architecture

#### Manager Pattern Implementation
- InitializationManager: 5-stage app initialization
- SpaceInfoManager: Space information display  
- CardManager: Card drawing, effects, and management
- MovementEngine: Movement logic processing

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
- Manager Pattern: Specialized managers for major systems
- Event System: Loose coupling through GameStateManager events
- Component Interfaces: Standardized communication patterns
- Separation of Concerns: Clear division between UI, logic, and data
- Data-Driven Configuration: Game rules externalized to CSV files
- 5-Stage Initialization: Deterministic loading via InitializationManager

### Performance Optimization
- Advanced Indexing: Multi-dimensional card indexes for O(1) lookups
- Space Caching System: byId, byName, byNormalizedName caches for instant space lookups
- Efficient Rendering: Minimal DOM updates and optimized animations
- Memory Management: Proper cleanup of event listeners and resources
- Animation Optimization: 20+ keyframe animations with hardware acceleration

### Critical Development Constraints
- No localStorage/sessionStorage: Not supported in Claude.ai artifacts - use React state instead
- Loading Order Dependencies: Components must load in specific sequence (see above)
- CSV-Driven Logic: Never hardcode game rules - always use CSV data
- Event-Driven Communication: Use GameStateManager events, not direct calls
- Property Name Standards: Use snake_case for consistency (space_name, card_type, etc.)
- File Organization: When modifying components, move them to proper locations (managers/, utils/) and update all dependencies

### File Organization
```
js/components/
├── managers/              # 2 Manager classes (with cleanup goals to organize more)
│   ├── InitializationManager.js  # 5-stage app initialization
│   └── SpaceInfoManager.js       # Space information display
│   # Future organization goals:
│   # ├── SpaceExplorerManager.js   # Move from main components/
│   # ├── SpaceSelectionManager.js  # Move from main components/  
│   # ├── LogicSpaceManager.js      # Move from main components/
│   # └── BoardStyleManager.js      # Move from main components/
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
├── cards.csv          # Unified card data (404 cards: 398 production + 6 TEST, 48 metadata fields)
└── DiceRoll Info.csv  # Dice outcomes and requirements
```

### Development Commands

```bash
# Development server (any static file server)
python -m http.server 8000
# or
npx serve .

# Debug mode access
http://localhost:8000/?debug=true&logLevel=debug
```

No build system - Static web application with browser-based Babel compilation for JSX.

### Critical Loading Order

Components must load in this sequence (defined in Index.html):
1. Utilities (csv-parser, cache-buster)
2. Component Registry
3. Movement System (before GameStateManager)
4. GameStateManager & game-state
5. Manager components
6. UI components
7. Main application script

This order is critical - changing it will break the application due to dependency requirements.

### Data Standards

#### CSV Column Mapping
All CSV data follows these conventions:
- Column Headers: Mixed case as they exist (space_name, Event, Action, space_1, Time, etc.)
- Internal Properties: Always mapped to snake_case for consistency (space_1, visit_type, w_card)
- Movement Data: Uses space_1, space_2, space_3, space_4, space_5 columns
- Card Data: Uses w_card, b_card, i_card, l_card, e_card columns
- No Hardcoded Logic: All game mechanics read from CSV files, not code constants

#### Property Name Standardization Rules
Moving forward, all components must use:
- Space Objects: `space.space_name` (not `space.name`)
- Move Objects: `move.name` for space name, `move.id` for generated ID
- Card Objects: Both `card.card_type` and `card.type` for type checking
- Card Fields: Current CSV names (`work_type_restriction`, `work_cost`) with legacy fallbacks
- React setState: Always use function form with spread operator to preserve state

# For Modifiers: Safe Editing Guide

## Safe Files to Edit

### 1. Game Data Files (Safest)
These contain game content and are safest to modify:

- `data/Spaces.csv`: Board spaces and their properties
- `data/cards.csv`: All card data (404 cards: 398 production + 6 TEST, 5 main types)
- `data/DiceRoll Info.csv`: Dice roll outcomes

### 2. Visual Appearance Files
Control how the game looks:

- `css/main.css`: Overall visual styling
- `css/card-components.css`: Card appearance
- `css/game-components.css`: Game UI styling
- `css/board-space-renderer.css`: Board space appearance

### 3. Game Mechanics Files (More Advanced)
Control game behavior - edit carefully:

- `js/components/CardManager.js`: Card drawing and effects
- `js/components/DiceManager.js`: Dice rolling behavior
- `js/components/TurnManager.js`: Turn order and flow
- `js/utils/movement/MovementEngine.js`: Player movement rules

## Common Modifications

### Change Card Limits
File: `js/components/CardDisplay.js`  
Look for: `const CARD_TYPE_LIMIT = 6;`  
Change to: `const CARD_TYPE_LIMIT = 8;` (or desired number)

### Modify Dice Roll Outcomes
File: `data/DiceRoll Info.csv`  
Edit: Outcome values and descriptions for specific spaces

### Change Starting Resources
File: `js/components/PlayerSetup.js`  
Look for: Initial money and time values  
Change: Starting amounts

### Modify Card Effects
File: `data/cards.csv`  
Edit: Card descriptions, monetary values, and effects

## Safe Editing Workflow

1. Always backup: Copy the file and add ".backup" to the filename
2. One change at a time: Don't modify multiple things simultaneously
3. Test immediately: Check your change works and doesn't break anything
4. Take notes: Document exactly what you changed
5. If something breaks: Restore from backup and try a smaller change

## Tips for Non-Programmers

- Comments are helpful: Text after `//` or between `/* */` explains code
- Use search: Ctrl+F to find keywords like "card limit" or space names
- Numbers are usually safe: Values like `6`, `100`, `0.5` represent game values
- Text in quotes is safe: Strings like `"You drew a card!"` can be changed
- Don't change structure: Focus on changing values, not code organization

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
- **Advanced Indexing**: O(1) card lookups for 404-card dataset
- **Efficient Rendering**: Optimized DOM updates and animations
- **Memory Management**: Proper cleanup of event listeners and animations
- **Responsive Design**: Works across desktop, tablet, and mobile devices

### Memory Leak Prevention Patterns

#### Event Listener Cleanup (Critical)
Components must clean up event listeners to prevent memory leaks:

```javascript
class YourComponent extends React.Component {
  constructor(props) {
    super(props);
    // Store bound function references for proper cleanup
    this.handlePlayerMoved = this.handlePlayerMoved.bind(this);
    this.handleTurnChanged = this.handleTurnChanged.bind(this);
  }

  componentDidMount() {
    // Add listeners using bound references
    GameStateManager.addEventListener('playerMoved', this.handlePlayerMoved);
    GameStateManager.addEventListener('turnChanged', this.handleTurnChanged);
  }

  componentWillUnmount() {
    // CRITICAL: Remove listeners using the same bound references
    GameStateManager.removeEventListener('playerMoved', this.handlePlayerMoved);
    GameStateManager.removeEventListener('turnChanged', this.handleTurnChanged);
    
    // Clear any timers or intervals
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    
    // Clear DOM references
    this.elementRef = null;
  }
}
```

#### Animation and Timer Cleanup
Always clear animations and timers to prevent memory leaks:

```javascript
componentWillUnmount() {
  // Clear timeouts and intervals
  if (this.animationTimer) clearTimeout(this.animationTimer);
  if (this.updateInterval) clearInterval(this.updateInterval);
  
  // Cancel animation frames
  if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  
  // Clear any DOM observers
  if (this.resizeObserver) {
    this.resizeObserver.disconnect();
  }
}
```

#### Common Memory Leak Sources
- **Event listeners** not removed in componentWillUnmount
- **Timers and intervals** not cleared when component unmounts
- **Animation frames** not cancelled
- **DOM references** not nullified
- **Observer patterns** not disconnected

### Error Handling
- **Graceful degradation**: System continues functioning with missing data
- **User-friendly errors**: Clear error messages for players
- **Debug support**: Comprehensive logging system for development

## Advanced Debugging and Troubleshooting

### Component Data Flow Architecture

#### SpaceExplorer vs SpaceInfo Critical Differences
The game has two components that display dice outcomes but they work differently:

**SpaceInfo (Player Panel)**:
- Receives pre-processed `diceOutcomes` prop from DiceManager
- Data format: `{Roll 1: {W Cards: "Draw 2"}, Roll 2: {...}}`
- Always displays current dice outcomes automatically

**SpaceExplorer (Space Details Panel)**:
- Receives raw `diceRollData` array from CSV data
- Must manually filter by `space_name` and `visit_type`
- Requires explicit prop change detection to update

**Critical Fix Pattern**:
```javascript
// SpaceExplorer component lifecycle
componentDidMount() {
  // Always process, don't check if space exists first
  this.processDiceDataFromProps();
}

componentDidUpdate(prevProps, prevState) {
  // Check for meaningful prop changes
  const spaceChanged = prevProps.space?.space_name !== this.props.space?.space_name;
  const diceDataChanged = prevProps.diceRollData !== this.props.diceRollData;
  const visitTypeChanged = prevProps.visitType !== this.props.visitType;
  
  if (spaceChanged || diceDataChanged || visitTypeChanged) {
    this.processDiceDataFromProps();
  }
}
```

### UI State Management Issues

#### End Turn Button State Logic
The End Turn button is disabled when any of these conditions are true:
- `!currentPlayer` - No current player
- `!gameBoard.state.hasSelectedMove` - No move selected
- `(hasDiceRollSpace && !hasRolledDice)` - Dice space but haven't rolled

**Common Issue**: After dice rolls, single available moves aren't auto-selected, leaving `hasSelectedMove = false`.

**Solution Pattern**:
```javascript
// In DiceManager after updating available moves
if (movesToUpdate.length === 1) {
  hasSelected = true;
  selectedMove = movesToUpdate[0].id || movesToUpdate[0].name;
  console.log('DiceManager: Auto-selecting single available move:', selectedMove);
}

this.gameBoard.setState({ 
  availableMoves: movesToUpdate,
  hasSelectedMove: hasSelected,  // Auto-select if only one move
  selectedMove: selectedMove     // Auto-select if only one move
});
```

### Card Drawing System Debug

#### Data Format Mismatches
The card drawing system has evolved and now uses multiple formats:

**DiceOutcomeParser Output** (New Format):
```javascript
{
  type: 'cards',
  action: 'drawCards',
  cards: { W: 2, B: 1 },
  description: 'Draw 2 W cards, 1 B card'
}
```

**DiceManager Expected Input** (Legacy Format):
```javascript
{
  WCardOutcome: "2",
  BCardOutcome: "1"
}
```

**Fix Pattern**:
```javascript
// DiceManager.processCardDraws() should handle both formats
if (Array.isArray(outcomes)) {
  // New format
  outcomes.forEach(outcome => {
    if (outcome.type === 'cards' && outcome.cards) {
      Object.entries(outcome.cards).forEach(([cardType, count]) => {
        for (let i = 0; i < count; i++) {
          window.GameStateManager.drawCard(currentPlayer.id, cardType);
        }
      });
    }
  });
} else {
  // Legacy format
  const cardTypes = ['W', 'B', 'I', 'L', 'E'];
  cardTypes.forEach(cardType => {
    const cardOutcome = outcomes[`${cardType}CardOutcome`];
    if (cardOutcome && cardOutcome !== 'n/a') {
      const cardCount = parseInt(cardOutcome) || 1;
      for (let i = 0; i < cardCount; i++) {
        window.GameStateManager.drawCard(currentPlayer.id, cardType);
      }
    }
  });
}
```

### Playwright Debugging Patterns

#### Console Log Filtering for Dice/Card Issues
```javascript
// Listen for specific debugging logs
page.on('console', msg => {
  if (msg.text().includes('SpaceExplorer') || 
      msg.text().includes('processCardDraws') ||
      msg.text().includes('hasSelectedMove') ||
      msg.text().includes('DEBUG')) {
    console.log(msg.text());
  }
});

// Check game state after dice roll
const gameState = await page.evaluate(() => {
  return {
    hasCurrentPlayer: !!window.GameStateManager?.getCurrentPlayer(),
    hasSelectedMove: !!window.gameBoard?.state?.hasSelectedMove,
    hasRolledDice: !!window.gameBoard?.state?.hasRolledDice,
    lastDiceRoll: window.gameBoard?.state?.lastDiceRoll,
    playerCards: window.GameStateManager?.getCurrentPlayer()?.cards?.length || 0,
    diceOutcomes: !!window.gameBoard?.state?.diceOutcomes
  };
});
```

---

## Troubleshooting Common Issues

### Player Experience Issues

#### Left Panel Not Updating After Movement
**Symptoms**: Player moves to a new space but the left panel (player status) shows old information
**Cause**: Event flow interruption between game components
**Solution**: The game includes dual-path update mechanisms - refresh page if issue persists
**Technical Details**: See CLAUDE.md "Left Panel Update Issues" for complete fix documentation

#### Console Errors During Dice Rolls
**Symptoms**: Error messages like "Could not find space object for conditional requirements"
**Cause**: Space lookup using incorrect ID format
**Solution**: Fixed in current version - error should no longer occur
**Technical Details**: DiceManager now uses proper space cache lookup with visit type consideration

#### Panels Disappearing During Turn Transitions  
**Symptoms**: Middle or right panels vanish when turn changes
**Cause**: CSS z-index conflicts with turn transition overlay
**Solution**: Fixed in current version - panels should remain visible
**Technical Details**: Panel z-index increased to 600, above transition overlay (500)

### Technical Debug Steps

#### Enable Debug Mode
Add URL parameters for enhanced logging:
```
http://localhost:8000/?debug=true&logLevel=debug
```

#### Console Investigation
Key log patterns to look for:
- `🔄 GameBoard: Player moved event received` - Confirms event flow
- `StaticPlayerStatus [INFO]: Props changed` - Confirms panel updates  
- `GameStateManager: Successfully found space` - Confirms space lookups
- `DiceManager: Looking up space with ID` - Shows dice system operation

#### Component State Inspection
Access game state from browser console:
```javascript
// Check current player
window.GameState.getCurrentPlayer()

// Check player position
window.GameState.getCurrentPlayer().position

// Check visited spaces
Array.from(window.GameState.getCurrentPlayer().visitedSpaces)

// Check available spaces
window.GameState.spaces.length

// Check game board state
window.currentGameBoard?.state
```

### Performance and Browser Issues

#### Slow Loading or Freezing
- Clear browser cache and refresh
- Ensure JavaScript is enabled
- Try a different browser (Chrome, Firefox, Safari tested)
- Check console for error messages

#### Memory Usage Concerns
- The game includes comprehensive memory cleanup
- Event listeners are properly removed on component unmount
- Timers and animations are tracked and cleared
- No known memory leaks in current version

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