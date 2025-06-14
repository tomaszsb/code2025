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
- **30+ React Components**: Complete UI system with specialized components
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
- **Spaces**: `space_name`, `phase` (game phases like SETUP, DESIGN, CONSTRUCTION)
- **Cards**: `card_type` (B/I/L/W/E), `immediate_effect` (Apply Work/Card/Loan/Investment)
- **Money Fields**: `money_cost`, `loan_amount`, `investment_amount`, `work_cost`

### Property Name Rules
- **Space Objects**: Use `space.space_name` and `space.phase`
- **Move Objects**: Use `move.name` for destinations
- **Card Objects**: Use `card.card_type` and `card.immediate_effect`

## 🃏 Card System Facts

### Actual Card Counts (399 production cards)
- **B (Bank)**: 60 cards - Provide loans with `loan_amount` and `loan_rate`
- **I (Investor)**: 39 cards - Provide funding with `investment_amount`  
- **L (Life)**: 49 cards - Personal events with special effects
- **W (Work)**: 176 cards - Construction tasks requiring `work_cost`
- **E (Expeditor)**: 74 cards - Process acceleration and efficiency
- **TEST**: 6 advanced testing cards with experimental features

### Card Features - ✅ Fully Standardized
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

### Data Quality Improvements
- **Zero Text Parsing**: All effects available as structured data
- **Enhanced Flavor Text**: Engaging narratives across all card types
- **Complete Descriptions**: All dice effects and conditional logic properly detailed
- **Performance Ready**: Optimized for efficient CardManager processing

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