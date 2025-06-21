# CLAUDE.md - Development Quick Reference

**For Claude Code development sessions on the Project Management Board Game**

## Project Summary
Single-page web app - Project management board game using vanilla HTML/CSS/JavaScript with React (via CDN). Players navigate project phases from initiation to completion.

## Essential Commands
```bash
# Development servers (pick one)
python -m http.server 8000
npx serve .
php -S localhost:8000

# Testing URLs
http://localhost:8000/                              # Main game
http://localhost:8000/?debug=true&logLevel=debug     # Debug mode

# Quick verification
node tests/verify-fix.js  # Code verification
```
**No build required** - Browser-based Babel compilation for JSX.

## Architecture

### Core Pattern: Component-Based + Event-Driven
- **30+ React Components**: Complete UI system
- **Event System**: Components communicate via GameStateManager events  
- **Data-Driven**: CSV files control game logic (never hardcode rules)
- **5-Stage Init**: Deterministic loading sequence

### Entry Points
- `Index.html` → `js/main.js` → `InitializationManager` → `App.js`

## Key Files
```
js/data/GameStateManager.js     # Central state + events
js/utils/movement/MovementEngine.js  # Movement logic  
js/components/App.js            # Root React component
data/Spaces.csv                 # Board spaces + paths
data/cards.csv                  # 398 production cards (B/I/L/W/E types)
data/DiceRoll Info.csv          # Dice outcomes
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
- **Event-driven communication** - Use GameStateManager events, not direct calls
- **CSV-driven logic** - Game rules in data files, not code
- **React setState pattern** - Always use function form with spread operator
- **Coordinate component updates** - Use componentFinished signals
- **Memory management** - All components have proper cleanup patterns
- **Error handling** - Comprehensive try-catch blocks around CSV loading

## Common Patterns

### React State Updates (Critical!)
```javascript
// Always preserve existing state
this.setState(prevState => ({ 
    ...prevState, 
    newProperty: value 
}));
```

### Coordinated Updates Pattern
```javascript
// Components signal when done updating
this.setState(newState, () => {
  GameStateManager.dispatchEvent('componentFinished', {
    component: 'SpaceInfo',
    action: 'playerMoved' 
  });
});

// Other components wait for the signal
GameStateManager.addEventListener('componentFinished', (event) => {
  if (event.data.component === 'SpaceInfo') {
    this.updateMyComponent();
  }
});
```

### Data Access Pattern
```javascript
// GameState and GameStateManager are the SAME OBJECT
window.GameState.spaces              // Recommended (shorter)
window.GameStateManager.spaces       // Also valid

// Standard space lookup
if (window.GameState?.spaces && player.position) {
  const currentSpace = window.GameState.spaces.find(s => 
    s.space_name === player.position && s.visit_type === 'First'
  );
}
```

### Memory Cleanup Pattern
```javascript
componentWillUnmount() {
  // Remove event listeners
  GameStateManager.removeEventListener('playerMoved', this.handlePlayerMoved);
  
  // Clear timers
  this.activeTimers.forEach(timerId => clearTimeout(timerId));
  this.activeTimers.clear();
  
  // Clear DOM references
  this.elementRef = null;
}
```

## Data Standards

### CSV Column Names
- **Spaces**: `space_name`, `phase`, `Event`, `Action`
- **Cards**: `card_type` (B/I/L/W/E), `immediate_effect`
- **Money Fields**: `money_cost`, `loan_amount`, `investment_amount`, `work_cost`

### GameStateManager Events
- **`playerMoved`** - Player moves to new space
- **`turnChanged`** - Turn switches to new player
- **`gameStateChanged`** - Major state changes
- **`componentFinished`** - Component signals completion (prevents loops)
- **`cardDrawn` / `cardPlayed`** - Card-related actions

## Quick Troubleshooting

### CSV Field Name Mismatches
Use exact CSV headers: `space.Event` (not `space.description`), `space.Action` (not `space.action`)

### Visit Type Resolution
```javascript
const hasVisited = player.visitedSpaces?.has(spaceName);
const visitType = hasVisited ? 'Subsequent' : 'First';
const space = spaces.find(s => s.space_name === spaceName && s.visit_type === visitType);
```

### Component Loops
Use componentFinished pattern to prevent event loops.

### Space Lookup Errors
Construct proper cache keys with visit type suffixes and normalization.

## Recent Fixes
- ✅ Console initialization warnings (App.js, BoardRenderer.js)
- ✅ Left panel update failures during player movement
- ✅ DiceManager space lookup errors
- ✅ Panel disappearing during turn transitions
- ✅ Card drawing duplication bugs

---

**For detailed guides, see `docs/` folder.**