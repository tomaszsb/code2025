# CLAUDE.md - Development Quick Reference

**For Claude Code development sessions on the Project Management Board Game**

**NOTE**: This file is optimized for Claude Code AI development sessions. Keep content functional and concise - no emojis or unnecessary formatting that slows down information retrieval during coding tasks.

## Project Summary
**Single-page web app** - Project management board game using vanilla HTML/CSS/JavaScript with React (via CDN). Players navigate project phases from initiation to completion.

## Essential Commands
```bash
# Development servers (pick one)
python -m http.server 8000
npx serve .
php -S localhost:8000

# Testing URLs
http://localhost:8000/                              # Main game
http://localhost:8000/?debug=true&logLevel=debug     # Debug mode
http://localhost:8000/tests/test-card-fix-direct.html   # Card system test
http://localhost:8000/tests/test-button-elimination.html # Button prevention test

# Quick verification
node tests/verify-fix.js  # Code verification
```
**No build required** - Browser-based Babel compilation for JSX (via Babel standalone).

## Architecture (Critical)

### Core Pattern: Component-Based + Event-Driven
- **30+ React Components**: Complete UI system with specialized components
- **Event System**: Components communicate via GameStateManager events  
- **Data-Driven**: CSV files control game logic (never hardcode rules)
- **5-Stage Init**: Deterministic loading sequence (see loading order below)

### Entry Points
- `Index.html` → `js/main.js` → `InitializationManager` → `App.js`
- All components must load in specific sequence (critical!)

## Key Files & Locations

### Must-Know Files
```
js/data/GameStateManager.js     # Central state + events
js/utils/movement/MovementEngine.js  # Movement logic  
js/components/App.js            # Root React component
js/components/managers/         # 2 core manager classes
data/Spaces.csv                 # Board spaces + paths
data/cards.csv                  # 398 production cards (B/I/L/W/E types)
data/DiceRoll Info.csv          # Dice outcomes
```

### CSS Structure (11 files)
```
css/main.css                    # Core layout + design tokens
css/game-components.css         # Game UI
css/player-animations.css       # Movement animations
css/card-components.css         # Card styling
css/dice-animations.css         # 3D dice effects
[6 other component CSS files]   # Space info, board rendering, etc.
```

## Critical Constraints

### Loading Order (MUST FOLLOW)
```html
<!-- In Index.html - DO NOT CHANGE ORDER -->
1. Utilities (csv-parser, cache-buster)
2. Component Registry  
3. Movement System (before GameStateManager!)
4. GameStateManager & game-state
5. Manager components
6. UI components
7. Main application script
```

### Development Rules
- **No localStorage/sessionStorage** - Not supported in Claude.ai artifacts (but works in local development)
- **Event-driven communication** - Use GameStateManager events, not direct calls
- **CSV-driven logic** - Game rules in data files, not code
- **React setState pattern** - Always use function form with spread operator
- **Use CSV data directly** - No transforming space names (see Data Standards below)
- **Coordinate component updates** - Use componentFinished signals (see Patterns below)
- **File organization** - When editing files, move them to proper folders (managers/, utils/) and update all imports
- **Memory management** - **IMPLEMENTED** - All components have proper cleanup patterns for event listeners, timers, and DOM references
- **Error handling** - **IMPLEMENTED** - Comprehensive try-catch blocks around CSV loading and data processing operations
- **Data Access Consistency** - **CRITICAL PRIORITY** - Audit and standardize data access patterns across all components

## Common Development Patterns

### Coordinated Updates Pattern (CRITICAL)
```javascript
// Components signal when they're done updating
this.setState(newState, () => {
  GameStateManager.dispatchEvent('componentFinished', {
    component: 'SpaceInfo',
    action: 'playerMoved' 
  });
  console.log('SpaceInfo: Finished updating');
});

// Other components wait for the signal
GameStateManager.addEventListener('componentFinished', (event) => {
  if (event.data.component === 'SpaceInfo') {
    // Now safe to update without causing loops
    this.updateMyComponent();
  }
});
```

### Component Interface Pattern
```javascript
// Expose interfaces for cross-component access
window.CardManagerInterface = {
    drawCard: function(type) { /* ... */ },
    getCardCount: function(type) { /* ... */ }
};
```

### React State Updates (Critical Pattern!)
```javascript
// Always preserve existing state
this.setState(prevState => ({ 
    ...prevState, 
    newProperty: value 
}));
```

### Memory Leak Prevention Patterns (IMPLEMENTED)
```javascript
// 1. Timer Tracking in constructors
constructor(props) {
  super(props);
  this.activeTimers = new Set(); // Track all timers
}

// 2. Tracked setTimeout wrapper
setTimeout(callback, delay) {
  const timerId = setTimeout(() => {
    this.activeTimers.delete(timerId);
    callback();
  }, delay);
  this.activeTimers.add(timerId);
  return timerId;
}

// 3. Comprehensive cleanup in componentWillUnmount
componentWillUnmount() {
  // Clear all timers
  this.activeTimers.forEach(timerId => clearTimeout(timerId));
  this.activeTimers.clear();
  
  // Remove event listeners  
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('playerMoved', this.handlePlayerMoved);
  }
  
  // Clear DOM references
  this.elementRef = null;
}
```

### Data Access Patterns (STANDARD)
```javascript
// ARCHITECTURE CLARIFICATION:
// GameState and GameStateManager are the SAME OBJECT
// Line 1687 in GameStateManager.js: window.GameState = window.GameStateManager;

// BOTH PATTERNS ARE EQUIVALENT (use either for consistency):
window.GameState.spaces              // Backward compatibility alias
window.GameStateManager.spaces       // Primary object name
window.GameState.getCurrentPlayer()  // Both call the same method
window.GameStateManager.getCurrentPlayer()  // on the same instance

// RECOMMENDED STANDARD PATTERN (use GameState alias for brevity):
if (window.GameState?.spaces && player.position) {
  const currentSpace = window.GameState.spaces.find(s => 
    s.space_name === player.position && s.visit_type === 'First'
  );
}

// STYLE PREFERENCE:
// Use window.GameState for new code (shorter, more familiar)
// Both GameState and GameStateManager are acceptable (same object)

// Panel Consistency Guidelines
// Left Panel (StaticPlayerStatus): Player state BEFORE landing (accumulated resources)
// Middle Panel (SpaceInfo): Current space requirements and actions (decision area)  
// Right Panel (PlayerInfo): Current space effects and requirements (result display)
// Data Rule: Left panel = player data, Middle/Right panels = space data
```

## Data Standards

### CSV Column Mapping
- **Spaces**: `space_name`, `phase` (game phases like SETUP, DESIGN, CONSTRUCTION)
- **Cards**: `card_type` (B/I/L/W/E), `immediate_effect` (Apply Work/Card/Loan/Investment)
- **Money Fields**: `money_cost`, `loan_amount`, `investment_amount`, `work_cost`

### Property Name Rules
- **Space Objects**: Use `space.space_name` and `space.phase`
- **Move Objects**: Use `move.id = space.space_name` (directly from CSV, no conversions)
- **Card Objects**: Use `card.card_type` and `card.immediate_effect`

### GameStateManager Events (Complete List)
- **`playerMoved`** - Player moves to new space (use this for space updates)
- **`turnChanged`** - Turn switches to new player
- **`gameStateChanged`** - Major state changes (newGame, etc.)
- **`spaceSelected`** - User clicks on spaces (exploration)
- **`componentFinished`** - Component signals completion (prevents loops)
- **`cardDrawn` / `cardPlayed`** - Card-related actions

### Event Listening Rules
- **SpaceInfo**: Listen to `playerMoved`, `turnChanged`
- **SpaceExplorer**: Listen to `componentFinished` from SpaceInfo
- **TurnManager**: Listen to `turnChanged`, `playerMoved` 
- **SpaceExplorerManager**: Listen to `playerMoved`

### Common Event Flow Examples
```javascript
// 1. Player Movement Chain
Player clicks move → DiceManager processes → fires 'playerMoved' 
→ SpaceInfo updates → fires 'componentFinished' 
→ SpaceExplorer updates → UI synchronized

// 2. Turn Change Chain  
End Turn clicked → TurnManager processes → fires 'turnChanged'
→ All components receive event → Update current player display

// 3. Card Draw Chain
Dice outcome → DiceManager.processCardDraws() → fires 'cardDrawn'
→ CardDisplay updates → Player sees new cards
```

## Card System Facts

### Actual Card Counts (398 production cards)
- **B (Bank)**: 60 cards - Provide loans with `loan_amount` and `loan_rate`
- **I (Investor)**: 39 cards - Provide funding with `investment_amount`  
- **L (Life)**: 49 cards - Personal events with special effects
- **W (Work)**: 176 cards - Construction tasks requiring `work_cost`
- **E (Expeditor)**: 74 cards - Process acceleration and efficiency
- **TEST**: 6 advanced testing cards with experimental features

### Card Features - Fully Standardized
- **Immediate Effects**: `Apply Work`, `Apply Card`, `Apply Loan`, `Apply Investment`
- **Semantic Consistency**: All fields match card descriptions exactly
- **Time Effects**: Structured as `time_effect` (positive = add time, negative = reduce time)
- **Money Effects**: `money_cost` (to play card) and `money_effect` (gain/lose money)
- **Target/Scope**: Accurate `target` ("Self"/"All Players") and `scope` ("Single"/"Global")
- **Phase Restrictions**: Cards properly restricted to game phases (e.g., "CONSTRUCTION" for inspections)
- **Card Interactions**: `draw_cards`/`discard_cards` with `card_type_filter` for specific types
- **Dice Mechanics**: `dice_trigger` ("On Play") and `dice_effect` (outcome descriptions)
- **Complex Logic**: Multi-step effects in `conditional_logic` field
- **Duration Effects**: Turn-based with `duration` and `duration_count`
- **6-Card Limits**: Per type, with visual indicators and forced discard

### Data Quality Status
- **Zero Text Parsing**: All effects available as structured data
- **Enhanced Flavor Text**: Engaging narratives across all card types
- **Complete Descriptions**: All dice effects and conditional logic properly detailed
- **Performance Ready**: Optimized for efficient CardManager processing

## Troubleshooting Guide

### CSV Field Name Mismatches
**Symptoms:** Components show space names but missing content, empty descriptions, no movement choices
**Cause:** Components using incorrect field names that don't match CSV headers
**Solution:** Always check CSV headers in `data/Spaces.csv` for exact field names:
- Use `space.Event` (not `space.description`)
- Use `space.Action` (not `space.action`) 
- Use `space.space_name` (not `space.name`)
- Use `'w_card'` (not `'W Card'`)

### Visit Type Resolution Issues
**Symptoms:** Players see wrong space content (First content when should be Subsequent)
**Cause:** Space lookups not accounting for visit history
**Solution:** Always determine visit type before space lookup:
```javascript
const hasVisited = player.visitedSpaces?.has(spaceName);
const visitType = hasVisited ? 'Subsequent' : 'First';
const space = spaces.find(s => s.space_name === spaceName && s.visit_type === visitType);
```

### Dice Roll Button Not Working
**Symptoms:** Roll Dice button shows "no special effect triggered", no cards drawn
**Cause:** Button connected to `noop()` instead of DiceManager.handleRollDiceClick
**Solution:** Direct connection in SpaceInfo.js bypasses prop-passing failures:
```javascript
onClick={() => {
  if (window.currentGameBoard?.diceManager?.handleRollDiceClick) {
    window.currentGameBoard.diceManager.handleRollDiceClick();
  }
}}
```

### Performance Issues (Component Loops)
**Symptoms:** Console shows "Multiple renders occurring rapidly" warnings
**Solution:** Use componentFinished pattern to prevent event loops:
```javascript
this.setState(newState, () => {
  GameStateManager.dispatchEvent('componentFinished', {
    component: 'ComponentName',
    action: 'actionCompleted'
  });
});
```

### SpaceExplorer Missing Dice Outcomes
**Symptoms:** Player panel shows dice outcomes but SpaceExplorer doesn't
**Cause:** `processDiceDataFromProps()` not called on prop changes  
**Solution:** Call in `componentDidMount()` and `componentDidUpdate()` when props change
**Details:** See `docs/COMPREHENSIVE_GAME_GUIDE.md` - Component Data Flow section

### End Turn Button Disabled After Dice
**Symptoms:** Button visible but disabled even with available moves after dice roll
**Cause:** Single moves not auto-selected (`hasSelectedMove = false`)
**Solution:** Auto-select in DiceManager when `movesToUpdate.length === 1`
**Details:** See `docs/COMPREHENSIVE_GAME_GUIDE.md` - UI State Management section

## Critical Issues

**No critical issues currently identified.**

## Resolved Issues

### Data Access Architecture Clarification - ✅ RESOLVED
**Previous Misconception:** Components appeared to use inconsistent data sources (GameState vs GameStateManager)
**Actual Architecture:** GameState and GameStateManager are the SAME OBJECT (aliases)
**Evidence:** Line 1687 in GameStateManager.js: `window.GameState = window.GameStateManager;`
**Impact:** No data synchronization issues - both references access identical data
**Component Examples:**
- BoardSpaceRenderer: `window.GameState.getCurrentPlayer()` 
- DiceManager: `window.GameStateManager.getCurrentPlayer()`  
- Both call the same method on the same instance
**Result:** This is a code style preference, not a critical data access issue

### Panel Time Display Consistency - ✅ FIXED
**Issue:** Right panel (PlayerInfo) showed player's time resource instead of current space's time requirement
**Root Cause:** PlayerInfo component accessed non-existent `window.spacesData` instead of `window.GameState.spaces`
**Solution:** Updated PlayerInfo to access correct data source and show space time requirement
**Files Fixed:** `js/components/PlayerInfo.js` (lines 131-137)
**Result:** 
- Left panel (StaticPlayerStatus): Shows player's accumulated time ("0 days")
- Middle panel (SpaceInfo): Shows space time requirement ("1 day") 
- Right panel (PlayerInfo): Shows space time requirement ("1 day")

### Card Drawing Duplication Bug - ✅ FIXED
**Issue:** Manual card buttons appeared for automatic dice outcomes, allowing duplicate card draws
**Root Cause:** `SpaceInfoDice.js` was creating interactive buttons for dice outcomes display
**Solution:** Removed button rendering from dice outcomes - they are now display-only
**Files Fixed:** `SpaceInfoDice.js` (lines 199-213)
**Result:** Dice outcomes show what happened automatically, manual buttons only appear for space CSV fields

## Quick References

### Documentation Cross-References
- **Complete Technical Guide**: `docs/COMPREHENSIVE_GAME_GUIDE.md` - Deep dive into architecture, debugging patterns, and component data flow
- **Project Overview**: `docs/README.md` - High-level features, tech stack, and project stats
- **Player Instructions**: `docs/PLAYER_GUIDE.md` - Simple gameplay guide for end users
- **Development Roadmap**: `docs/FUTURE_DEVELOPMENT_PLAN.md` - Planned enhancements and mobile optimization
- **Project History**: `docs/CHANGELOG.md` - Version history and major changes
- **Bug Analysis**: `docs/CARD_DRAWING_FIX_SUMMARY.md` - Comprehensive card duplication fix analysis
- **CSV Data Progress**: `docs/CSV_DATA_POPULATION_PROGRESS.md` - Data migration status

### Debug & Performance Features
- Console logging with "beginning/finished" patterns
- Component version tracking  
- URL params: `?debug=true&logLevel=debug`
- componentFinished events for coordinated updates
- Efficient card lookups for 404-card dataset
- Professional animation systems with memory cleanup
- Mobile + desktop compatibility

## Error Handling Patterns (IMPLEMENTED)

### Enhanced Error Boundaries
```javascript
// App.js - Enhanced componentDidCatch
componentDidCatch(error, errorInfo) {
  console.error('Error caught in App component:', error);
  
  // User-friendly error messages
  let userMessage = error.message;
  if (error.message.includes('CSV') || error.message.includes('Failed to load')) {
    userMessage = 'Failed to load game data. Please refresh the page to try again.';
  } else if (error.message.includes('Network')) {
    userMessage = 'Network error occurred. Please check your connection and refresh the page.';
  }
  
  this.setState({ error: userMessage });
}
```

### Data Processing Protection  
```javascript
// GameStateManager.js - processSpacesData with validation
processSpacesData(spacesData) {
  try {
    if (!spacesData || !Array.isArray(spacesData)) {
      throw new Error('Invalid spaces data: expected array');
    }
    // ... processing logic
  } catch (error) {
    console.error('GameStateManager: Error processing spaces data:', error);
    this.dataError = {
      type: 'spaces',
      message: 'Failed to process game board data. Please refresh the page.',
      originalError: error.message
    };
    throw error; // Re-throw to halt initialization
  }
}
```

## Browser Testing (Playwright Ready)

**Note**: Switched from Puppeteer to Playwright for better cross-browser testing

### Memory Leak Testing Status
- Component cleanup methods work correctly
- Timer tracking prevents memory leaks  
- Event listener removal confirmed
- Error boundaries handle crashes gracefully

## Critical Coding Patterns

### Prevent Stack Overflow
```javascript
// Always use this setState pattern
this.setState(prevState => ({ ...prevState, newValue: x }));

// Add processing flags for safety
if (this.isProcessing) return;
this.isProcessing = true;
```

### Safe Event Handling
```javascript
// Use componentFinished pattern to prevent loops
GameStateManager.addEventListener('componentFinished', (event) => {
  if (event.data.component === 'SpaceInfo') {
    // Safe to update now
  }
});
```

### Memory Leak Prevention (IMPORTANT)
```javascript
// Always clean up event listeners in componentWillUnmount
componentWillUnmount() {
  // Remove specific listeners
  GameStateManager.removeEventListener('playerMoved', this.handlePlayerMoved);
  
  // Clear timers and intervals
  if (this.animationTimer) {
    clearTimeout(this.animationTimer);
  }
  
  // Clear any DOM references
  this.elementRef = null;
}

// Store bound function references for proper cleanup
constructor(props) {
  super(props);
  this.handlePlayerMoved = this.handlePlayerMoved.bind(this);
}

componentDidMount() {
  GameStateManager.addEventListener('playerMoved', this.handlePlayerMoved);
}
```

### Error Handling Pattern
```javascript
// Wrap CSV loading and critical operations
try {
  const spaces = await loadCSV('data/Spaces.csv');
  this.setState({ spaces, isLoaded: true });
} catch (error) {
  console.error('Failed to load spaces:', error);
  this.setState({ 
    error: 'Failed to load game data. Please refresh the page.',
    isLoaded: false 
  });
}

// Add error boundaries for component crashes
componentDidCatch(error, errorInfo) {
  console.error('Component error:', error, errorInfo);
  this.setState({ hasError: true });
}
```

## Code Review Recommendations

### Implemented (Worth Addressing)
- **Memory Leak Prevention**: Added cleanup patterns for event listeners and timers
- **Error Handling**: Added try-catch patterns for CSV loading and component crashes

### Consider If Issues Arise
- **React 18 Update**: Easy upgrade if performance becomes an issue
- **Input Sanitization**: Add for player names if display problems occur
- **Basic Accessibility**: Add ARIA labels and keyboard support for inclusivity

### Intentionally Not Implementing
- **Build System**: Browser-based compilation is intentional and appropriate
- **State Management Libraries**: Current event-driven system works well
- **TypeScript**: Would complicate development for non-technical users
- **Complex Testing**: Playwright covers the important scenarios

### Design Philosophy
This project prioritizes **simplicity and maintainability** over enterprise patterns. The architecture choices are intentional:
- Browser-based compilation keeps development simple
- Event-driven communication prevents tight coupling
- CSV-driven logic makes game rules easily editable
- No build system reduces complexity for non-technical users

---

**For detailed implementation, game rules, or modification guides, see the comprehensive documentation in `docs/` folder.**