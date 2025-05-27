# File Structure Reorganization Plan

## Current Issues
- Movement files are scattered across multiple directories
- Many "utils" folders make it confusing
- Related functionality is separated
- Difficult to find specific components

## Proposed New Structure

```
js/
├── core/                    # Core game mechanics
│   ├── GameStateManager.js  # Central state management
│   ├── EventSystem.js       # Event handling (extracted from GameStateManager)
│   └── GameConstants.js     # Game constants and configuration
│
├── systems/                 # Major game systems
│   ├── movement/           # Movement system
│   │   ├── MovementCore.js
│   │   ├── MovementLogic.js
│   │   ├── MovementUIAdapter.js
│   │   └── MovementSystem.js
│   │
│   ├── cards/              # Card system (future)
│   │   ├── CardCore.js
│   │   ├── CardLogic.js
│   │   ├── CardUIAdapter.js
│   │   └── CardSystem.js
│   │
│   └── dice/               # Dice system (future)
│       ├── DiceCore.js
│       ├── DiceLogic.js
│       ├── DiceUIAdapter.js
│       └── DiceSystem.js
│
├── managers/               # Manager components
│   ├── TurnManager.js
│   ├── SpaceSelectionManager.js
│   ├── SpaceExplorerManager.js
│   ├── SpaceInfoManager.js
│   ├── CardManager.js
│   ├── DiceManager.js
│   └── NegotiationManager.js
│
├── components/             # UI Components
│   ├── board/             # Board-related components
│   │   ├── GameBoard.js
│   │   ├── BoardDisplay.js
│   │   ├── BoardRenderer.js
│   │   ├── BoardSpaceRenderer.js
│   │   ├── BoardConnectors.js
│   │   └── BoardStyleManager.js
│   │
│   ├── player/            # Player-related components
│   │   ├── PlayerInfo.js
│   │   ├── PlayerSetup.js
│   │   └── StaticPlayerStatus.js
│   │
│   ├── space/             # Space-related components
│   │   ├── SpaceInfo.js
│   │   ├── SpaceInfoDice.js
│   │   ├── SpaceInfoCards.js
│   │   ├── SpaceInfoMoves.js
│   │   ├── SpaceInfoUtils.js
│   │   ├── SpaceExplorer.js
│   │   └── SpaceExplorerLogger.js
│   │
│   ├── cards/             # Card display components
│   │   ├── CardDisplay.js
│   │   ├── CardDetailView.js
│   │   ├── CardAnimations.js
│   │   ├── CardTypeUtils.js
│   │   ├── CardActions.js
│   │   └── WorkCardDialogs.js
│   │
│   ├── dice/              # Dice display components
│   │   └── DiceRoll.js
│   │
│   └── App.js             # Main app component
│
├── utils/                  # True utilities (minimal)
│   ├── csv-parser.js      # CSV parsing utility
│   ├── CardDrawUtil.js    # Card drawing utility
│   └── DiceRollLogic.js   # Dice roll logic utility
│
├── interfaces/             # Component interfaces
│   └── CardManagerInterface.js
│
└── main.js                # Entry point
```

## Migration Steps

### Phase 1: Create New Directory Structure
1. Create the new directories
2. Don't move any files yet
3. Test that the game still works

### Phase 2: Move Movement System (CURRENT)
1. Move movement files to `systems/movement/`
2. Update all import references
3. Test thoroughly

### Phase 3: Move Managers
1. Move all manager files to `managers/`
2. Update references
3. Test

### Phase 4: Reorganize Components
1. Move board components to `components/board/`
2. Move player components to `components/player/`
3. Move space components to `components/space/`
4. Move card components to `components/cards/`
5. Update all references

### Phase 5: Extract Core Systems
1. Extract EventSystem from GameStateManager
2. Create GameConstants for shared constants
3. Move GameStateManager to core/

### Phase 6: Clean Up Utils
1. Move true utilities to utils/
2. Move system-specific utils to their respective systems
3. Remove empty directories

## Benefits

1. **Clear Organization**: Easy to find related files
2. **Separation of Concerns**: Systems, managers, and components are clearly separated
3. **Scalability**: Easy to add new systems following the same pattern
4. **Reduced Confusion**: No more multiple utils folders
5. **Better Modularity**: Each system is self-contained

## Implementation Notes

- Update files one at a time to avoid breaking the game
- Test after each file move
- Update HTML files to reference new paths
- Keep backward compatibility during migration
- Document each change in CHANGELOG.md

---

*Created: [Current Date]*
*Status: Planning Phase 2*
