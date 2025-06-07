# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Project Management Board Game** - a single-page web application using vanilla HTML/CSS/JavaScript with React (via CDN). Players move through project phases from initiation to completion on a board game interface.

## Development Commands

```bash
# Development server (any static file server)
python -m http.server 8000
# or
npx serve .
# or simply open Index.html in browser

# Debug mode access
http://localhost:8000/?debug=true&logLevel=debug
```

**No build system** - this is a static web application with browser-based Babel compilation for JSX.

## Architecture Overview

### Core Pattern: Manager-Based + Event-Driven
- **Manager Classes**: Core functionality organized into specialized managers
- **Event System**: Components communicate through GameStateManager events
- **Data-Driven**: CSV files drive game logic instead of hardcoded rules
- **Staged Initialization**: 5-stage deterministic loading via InitializationManager

### Key Entry Points
- `Index.html` - Main entry, loads dependencies in critical order
- `js/main.js` - Bootstrap that delegates to InitializationManager
- `js/components/App.js` - Root React component

### State Management
**`js/data/GameStateManager.js`** is the central state manager:
- Manages all game state, player data, saves/loads
- Custom event system for component communication
- localStorage persistence with backward compatibility

### Movement System
**`js/utils/movement/MovementEngine.js`** handles all movement logic:
- CSV-driven movement rules
- Complex space handling (PM-DECISION-CHECK, special paths)
- Visit tracking and space type resolution

### Data Layer
- `data/Spaces.csv` - Board spaces with Path and RequiresDiceRoll columns
- `data/cards.csv` - Unified card data (W, B, I, L, E types)
- `data/DiceRoll Info.csv` - Dice roll outcomes

## Critical Loading Order

Components must load in this sequence (defined in Index.html):
1. Utilities (csv-parser, cache-buster)
2. Component Registry
3. Movement System (before GameStateManager)
4. GameStateManager & game-state
5. Manager components
6. UI components
7. Main application script

## Component Architecture

### Manager Pattern
Each major system has a dedicated manager:
- `InitializationManager` - 5-stage app initialization
- `SpaceInfoManager` - Space information display
- `CardManager` - Card drawing and management
- `MovementEngine` - Movement logic processing

### Component Communication
```javascript
// Event-driven communication
GameStateManager.addEventListener('playerMoved', handler);
GameStateManager.dispatchEvent('gameStateChanged', data);

// Interface pattern for cross-component access
window.CardManagerInterface = {
    drawCard: function(type) { /* ... */ },
    getCardCount: function(type) { /* ... */ }
};
```

### Modular UI Components
- `SpaceInfo.js` - Modularized space information panel
- `BoardDisplay.js` - Game board rendering
- `PlayerInfo.js` - Player status display
- `CardDisplay.js` - Card management interface

## Development Considerations

### CSV-Driven Logic
Game mechanics are defined in CSV files, not hardcoded:
- `Path` column categorizes spaces (Main, Special, Side quest)
- `RequiresDiceRoll` controls dice mechanics
- Placeholder system `{ORIGINAL_SPACE}` for dynamic content

### Debug Features
- URL parameters: `?debug=true&logLevel=debug`
- Extensive console logging with "beginning/finished" patterns
- Component version tracking for debugging

### State Persistence
- localStorage-based save/load system
- Set-based visited spaces tracking for performance
- Backward compatibility with legacy save formats

### Error Handling
- Staged initialization with detailed error reporting
- Graceful degradation for missing components
- User-friendly error screens through InitializationManager

## File Organization

```
js/components/
├── managers/           # Manager classes
├── utils/             # Utility functions
├── App.js             # Root component
├── GameBoard.js       # Main game container
└── [UI components]    # Individual game UI pieces

css/
├── main.css           # Core layout
├── game-components.css # Game-specific styling
├── player-animations.css # Movement animations
└── [component-specific CSS]

data/
├── Spaces.csv         # Game board definition
├── cards.csv          # Unified card data
└── DiceRoll Info.csv  # Dice outcomes
```

## Key Development Patterns

### Component Interface Pattern
Components expose interfaces for cross-component communication rather than direct imports.

### Event-Driven Updates
State changes propagate through GameStateManager events rather than prop drilling.

### Manager Delegation
Complex logic is delegated to manager classes rather than embedded in UI components.

### CSV-Driven Configuration
Game rules and content are externalized to CSV files for easy modification without code changes.

## Phase 5 Advanced Card Features

### Card Combo System
- **Combo Requirements**: Cards can specify patterns like `B+I`, `2xW+B+I` for enhanced effects
- **Automatic Detection**: System detects when players have combo opportunities
- **Bonus Effects**: Combos provide additional money, time, and special bonuses

### Chain Reaction System
- **Chain Effects**: Cards trigger cascading effects with patterns like `draw:B->if:money>200000->draw:W`
- **Conditional Logic**: Chains evaluate game conditions before proceeding
- **Special Triggers**: Effects like `bonus_turn`, `double_next` for advanced gameplay

### Multi-Card Interactions
- **Synergy Detection**: Bank+Investor, Work+Life, and other card combinations
- **Conflict Resolution**: System handles incompatible cards and resource conflicts
- **Amplification Effects**: Some cards enhance others' effects

### Complex Targeting
- **Advanced Patterns**: `All Players-Self`, `Player:money>100000`, `Leading Player`
- **Conditional Targeting**: Target selection based on game state
- **Range and Filters**: Line of sight, immunity, and distance restrictions

### Performance Optimization
- **Advanced Indexing**: Multi-dimensional card indexes for O(1) lookups
- **Fast Combo Detection**: Real-time combo opportunity identification
- **Scalable Architecture**: Efficient processing for large card datasets

## Enhanced Animation & Visualization System (Phase 2)

### Card Animation System
**`js/components/CardAnimations.js`** provides comprehensive card interactions:
- **Card Draw Animations**: Cards slide in from deck with elastic easing and 3D rotation
- **Card Play Animations**: Cards move to play area with particle effects and 360° rotation
- **Discard Animations**: Smooth removal with directional movement and dissolve effects
- **Hand Management**: Automatic card arrangement with staggered entry animations
- **Type-Specific Effects**: Color-coded glow effects for each card type (W, B, I, L, E)

### Player Movement Visualization
**`js/components/PlayerMovementVisualizer.js`** handles advanced movement effects:
- **Movement Trails**: Animated paths showing player movement between spaces
- **Trail Particles**: Sparking particle effects along movement paths
- **Position Breadcrumbs**: Visual history of recent player positions
- **Movement Prediction**: Dashed lines showing possible destinations
- **Distance-Based Effects**: Different animations for different movement distances

### Enhanced Player Tokens
- **Smooth Movement**: Speed-based transitions (normal, fast, slow, instant)
- **Arrival Effects**: Enhanced scaling and brightness effects when arriving
- **Departure Ghosts**: Temporary ghost tokens remain at origin during movement
- **Active Player Highlighting**: Pulsing animations for current player

### Turn Transition System
**Enhanced TurnManager integration**:
- **Visual Handoff Overlay**: Professional transition screen showing player change
- **Player Token Display**: Color-coded tokens with player names in transitions
- **Smooth Timing**: 2.4-second animated transitions with proper fade in/out
- **Movement Integration**: Coordinates with PlayerMovementVisualizer

### CSS Animation Framework
**`css/player-animations.css`** provides comprehensive styling:
- **20+ Animation Keyframes**: For movement, transitions, and effects
- **Particle Systems**: Floating and dissolve particle effects
- **Glow Systems**: Type-specific and interaction-based glow effects
- **Loading States**: Professional spinner animations for async operations

### Animation Integration
- **Event Coordination**: Proper event handling between all movement components
- **Performance Optimized**: Efficient cleanup and memory management
- **Responsive Design**: Animations work across different screen sizes
- **Accessibility**: Reduced motion options for accessibility compliance

## Recent Critical Fixes

### App.js State Management Fix
- **Issue**: Empty page after "Start New Game" due to incorrect state references
- **Solution**: Updated App.js to use GameStateManager instead of legacy GameState
- **Added**: Proper event listeners for game state changes and re-render triggers

### GameStateManager Initialization
- **Added**: `gameStarted` getter property for proper state access
- **Fixed**: Initialization flag setting when first player is added
- **Enhanced**: Event-driven state updates for UI synchronization