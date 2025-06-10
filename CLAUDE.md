# CLAUDE.md - Development Quick Reference

**For Claude Code development sessions on the Project Management Board Game**

## 🎯 Project Summary
**Single-page web app** - Project management board game using vanilla HTML/CSS/JavaScript with React (via CDN). Players navigate project phases from initiation to completion.

## ⚡ Quick Start
```bash
# Development - any static server
python -m http.server 8000
# Debug mode
http://localhost:8000/?debug=true&logLevel=debug
```
**No build required** - Browser-based Babel compilation for JSX (via Babel standalone).

## 🏗️ Architecture (Critical)

### Core Pattern: Component-Based + Event-Driven
- **35+ React Components**: Complete UI system with specialized components
- **Event System**: Components communicate via GameStateManager events  
- **Data-Driven**: CSV files control game logic (never hardcode rules)
- **5-Stage Init**: Deterministic loading sequence (see loading order below)

### Entry Points
- `Index.html` → `js/main.js` → `InitializationManager` → `App.js`
- All components must load in specific sequence (critical!)

## 📁 Key Files & Locations

### Must-Know Files
```
js/data/GameStateManager.js     # Central state + events
js/utils/movement/MovementEngine.js  # Movement logic  
js/components/App.js            # Root React component
js/components/managers/         # 2 core manager classes
data/Spaces.csv                 # Board spaces + paths
data/cards.csv                  # 404 cards, all types
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

## ⚠️ Critical Constraints

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
- **No localStorage/sessionStorage** - Not supported in Claude.ai artifacts
- **Event-driven communication** - Use GameStateManager events, not direct calls
- **CSV-driven logic** - Game rules in data files, not code
- **React setState pattern** - Always use function form with spread operator

## 🔧 Common Development Patterns

### Event Communication
```javascript
// Listen for events
GameStateManager.addEventListener('playerMoved', handler);

// Dispatch events  
GameStateManager.dispatchEvent('gameStateChanged', data);
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

## 📊 Data Standards

### CSV Column Mapping
- **Spaces**: `space_name` (not `name`), `Path`, `RequiresDiceRoll`
- **Cards**: `card_type`, `w_card`, `b_card`, etc. (snake_case properties)
- **Movement**: `space_1`, `space_2`, etc. for destinations

### Property Name Rules
- **Space Objects**: Use `space.space_name` 
- **Move Objects**: Use `move.name` for destinations
- **Card Objects**: Support both `card.card_type` and `card.type`

## 🃏 Card System Facts

### Actual Card Counts (404 total)
- **B (Bank)**: 60 cards
- **I (Investor)**: 39 cards  
- **L (Life)**: 49 cards
- **W (Work)**: 176 cards
- **E (Expeditor)**: 74 cards
- **TEST**: 6 experimental cards

### Card Features
- **Basic Effects**: Money, time, resource management (all cards)
- **Advanced Features**: Combo requirements and chain effects (TEST cards only)
- **6-Card Limits**: Per type, with visual indicators and forced discard

## 🚀 Quick References

### Documentation
- **Full details**: See `docs/COMPREHENSIVE_GAME_GUIDE.md`
- **Architecture**: See `docs/README.md` 
- **Player rules**: See `docs/PLAYER_GUIDE.md`
- **History**: See `docs/CHANGELOG.md`

### Debug Features
- Console logging with "beginning/finished" patterns
- Component version tracking
- URL params: `?debug=true&logLevel=debug`

### Performance Notes
- Efficient card lookups for 404-card dataset
- Professional animation systems (CardAnimations.js, PlayerMovementVisualizer.js)
- Memory cleanup for event listeners
- Works on mobile + desktop

---

**For detailed implementation, game rules, or modification guides, see the comprehensive documentation in `docs/` folder.**