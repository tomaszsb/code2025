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

### CSV Data Standardization and Movement Engine Fix (Post-Phase 4)
- **Issue**: After CSV standardization, three critical problems emerged:
  1. Missing dice roll button on OWNER-SCOPE-INITIATION
  2. Missing card pickup functionality  
  3. Wrong next move (showing CON-INITIATION instead of OWNER-FUND-INITIATION)
- **Root Cause**: Inconsistent CSV column mapping in GameStateManager after standardization
- **Solution**: Fixed GameStateManager.js to properly map CSV headers to consistent snake_case properties
- **Key Changes**:
  - Fixed CSV column references for card data (w_card, b_card, etc.)
  - Standardized all space movement data to use snake_case (space_1, space_2, etc.)
  - Removed duplicate/inconsistent property mappings
  - Ensured MovementEngine receives proper space data with space_1 = "OWNER-FUND-INITIATION"

## Data Standards

### CSV Format Consistency
All CSV data follows these conventions:
- **Column Headers**: Mixed case as they exist (space_name, Event, Action, space_1, Time, etc.)
- **Internal Properties**: Always mapped to snake_case for consistency (space_1, visit_type, w_card)
- **Movement Data**: Uses space_1, space_2, space_3, space_4, space_5 columns
- **Card Data**: Uses w_card, b_card, i_card, l_card, e_card columns
- **No Hardcoded Logic**: All game mechanics read from CSV files, not code constants

## Post-CSV Standardization Fixes (January 2025)

### End Turn Button and Space Display Issues
- **Issue**: After CSV standardization, End Turn button was not properly loading next spaces, and spaces would appear briefly then disappear
- **Root Causes**: 
  1. Property name mismatches: `currentSpace.name` vs `currentSpace.space_name` in MovementEngine
  2. Space lookup inconsistencies: `space.id` vs `space.space_name` in UI components
  3. Move ID vs space name mismatches in move selection
  4. React setState race conditions overwriting `exploredSpace` state
- **Solution**: Comprehensive property name standardization and state preservation
- **Key Changes**:
  - **MovementEngine.js**: Fixed all `currentSpace.name` references to `currentSpace.space_name`
  - **TurnManager.js**: Fixed space lookup to use `space.space_name` instead of `space.id`
  - **SpaceSelectionManager.js**: Fixed move validation and space lookups to use correct property names
  - **BoardSpaceRenderer.js**: Fixed available move checking to use `move.name` instead of `move.id`
  - **SpaceSelectionManager.js**: Fixed all setState calls to preserve existing state with spread operator

### Worktype Card Scope Display Fix
- **Issue**: Worktype (W) cards were not displaying as scope in the current turn panel (StaticPlayerStatus component)
- **Root Cause**: StaticPlayerStatus was using legacy field names for card properties
- **Solution**: Updated field name mapping to match current CSV format
- **Key Changes**:
  - **StaticPlayerStatus.js**: Updated card type check to include both `card.type` and `card.card_type`
  - **StaticPlayerStatus.js**: Updated work type field to use `card.work_type_restriction` with legacy fallback
  - **StaticPlayerStatus.js**: Updated cost field to use `card.work_cost` with legacy fallback

### State Management Race Condition Prevention
- **Issue**: Multiple React setState calls were overwriting important state like `exploredSpace`
- **Solution**: Changed all setState calls to use function form with prevState spread
- **Pattern Applied**:
  ```javascript
  // Before (overwrites state):
  this.gameBoard.setState({ availableMoves: [], showDiceRoll: false });
  
  // After (preserves state):
  this.gameBoard.setState(prevState => ({ 
    ...prevState, 
    availableMoves: [], 
    showDiceRoll: false 
  }));
  ```
- **Components Fixed**: SpaceSelectionManager event handlers and state updates

### Property Name Standardization Rules
Moving forward, all components must use:
- **Space Objects**: `space.space_name` (not `space.name`)
- **Move Objects**: `move.name` for space name, `move.id` for generated ID
- **Card Objects**: Both `card.card_type` and `card.type` for type checking
- **Card Fields**: Current CSV names (`work_type_restriction`, `work_cost`) with legacy fallbacks
- **React setState**: Always use function form with spread operator to preserve state