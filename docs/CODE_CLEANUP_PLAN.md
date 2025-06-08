# Code Cleanup Plan - Remaining Phases

This document outlines the remaining phases for cleaning up the codebase to make it tight, data-driven, and free of redundancy.

## Completed Phases ✅

### Phase 1A: Remove Unused Cost Range System ✅
- **Status**: COMPLETED
- **What was removed**: Unused cost categorization system in csv-parser.js
- **Files modified**: `js/utils/csv-parser.js`
- **Lines removed**: ~50 lines of dead indexing code

### Phase 1B: Remove Combo Bonus Logic ✅  
- **Status**: COMPLETED
- **What was removed**: Hardcoded money amounts for theoretical combos
- **Files modified**: `js/components/CardManager.js`, `js/components/CardDisplay.js`
- **Replaced with**: TODO comments for future implementation
- **Examples**: Bank+Investor combo (was $100,000), Full spectrum bonus (was $200,000)

### Phase 2: Remove Duplicate Functions ✅
- **Status**: COMPLETED (No duplicates found)
- **Finding**: extractSpaceName functions were already properly consolidated
- **Architecture**: Single function in MovementEngine with safe delegation pattern

### Phase 3: Remove Dead Code ✅ (Partially)
- **Status**: IN PROGRESS
- **Completed**:
  - Removed `InitializationManager.js.backup` (663 lines)
  - Removed `BoardConnectors.js` (18 lines of disabled arrow system)
  - Removed `MovementSystemSimplified.js` (96 lines of unused wrapper)
  - Removed `cache-buster.js` stub functions
  - Removed `game-state.js` (11-line compatibility layer)

---

## Remaining Phases 🚧

### Phase 3: Complete Dead Code Removal
**Status**: PARTIALLY COMPLETE - Need to finish

#### High Priority Remaining:
1. **Review ComponentRegistry.js**
   - **Location**: `js/utils/ComponentRegistry.js`
   - **Issue**: Minimal usage, may be architectural overhead
   - **Action**: Determine if component registration pattern is needed
   - **Impact**: ~100 lines

2. **Review CardManagerInterface.js**
   - **Location**: `js/interfaces/CardManagerInterface.js`  
   - **Issue**: Interface wrapper with no active usage found
   - **Action**: Check if this is future-proofing or dead code
   - **Impact**: ~200 lines

3. **Clean up commented-out historical notes**
   - **Location**: `js/data/GameStateManager.js` lines 385, 530
   - **Issue**: "PHASE 3: Deleted..." comments cluttering code
   - **Action**: Remove historical documentation comments
   - **Impact**: 2 lines

#### Medium Priority Remaining:
4. **Review TooltipSystem.js usage**
   - **Location**: `js/components/TooltipSystem.js`
   - **Issue**: Complete tooltip system never initialized
   - **Action**: Determine if needed for planned tooltip features
   - **Decision**: Keep (user indicated tooltips will be added)

### Phase 4: Consolidate Card Type Handling
**Status**: PENDING
**Priority**: MEDIUM

#### Issues Identified:
1. **Card type colors hardcoded in multiple files**
   - **Files**: `CardTypeUtils.js`, `CardManager.js`, `StaticPlayerStatus.js`
   - **Problem**: Same color codes (#4285f4, #ea4335, etc.) written 3+ times
   - **Solution**: Create single source of truth for card type metadata

2. **Card type switch statements duplicated**
   - **Pattern**: Identical switch statements for types W, B, I, L, E
   - **Files**: Multiple components handling card types
   - **Solution**: Centralize card type logic

#### Proposed Actions:
1. **Create CardTypeConstants.js**
   ```javascript
   const CARD_TYPES = {
     W: { name: 'Work Type', color: '#4285f4', description: '...' },
     B: { name: 'Bank', color: '#ea4335', description: '...' },
     // etc.
   };
   ```

2. **Replace hardcoded values**
   - Update all files to use centralized constants
   - Remove duplicate switch statements
   - Create utility functions for common card type operations

3. **Move card type data to CSV** (if appropriate)
   - Consider if card type metadata belongs in CSV files
   - Evaluate data-driven vs. code-driven approach

### Phase 5: Simplify Overly Complex Functions
**Status**: PENDING  
**Priority**: LOW

#### Functions Identified for Simplification:
1. **CardManager.js processCardEffects()** (~130+ lines)
   - **Issue**: Single massive function handling all card effects
   - **Solution**: Break into smaller, focused functions
   - **Approach**: Extract per-card-type processing methods

2. **GameStateManager.js processSpacesData()** (~100+ lines)
   - **Issue**: Complex CSV processing with multiple responsibilities
   - **Solution**: Extract parsing, validation, and caching logic

3. **Complex nested logic in card processing**
   - **Issue**: 4-5 levels of nested if/else in card effects
   - **Solution**: Extract condition checking into helper functions
   - **Pattern**: Use early returns to reduce nesting

#### Proposed Actions:
1. **Function length audit**
   - Identify all functions over 50 lines
   - Prioritize by complexity and maintainability impact

2. **Extract common patterns**
   - Create reusable functions for repeated logic
   - Implement consistent error handling patterns

3. **Reduce nesting depth**
   - Use guard clauses and early returns
   - Extract complex conditions into well-named functions

### Phase 6: Remove Unused Fancy Features
**Status**: PENDING
**Priority**: LOW

#### Features Identified for Review:
1. **Chain Effects System**
   - **Location**: Multiple files, partially implemented
   - **Status**: Built but never used in actual gameplay
   - **Action**: Determine if this is future feature or over-engineering

2. **Advanced Card Indexing**
   - **Location**: `csv-parser.js` buildCardIndexes()
   - **Issue**: Complex indexing for small datasets
   - **Impact**: Premature optimization for current scale

3. **Complex Targeting System**  
   - **Location**: CardManager.js advanced targeting logic
   - **Issue**: Built for complex scenarios that don't exist
   - **Pattern**: "Player:money>100000" style conditions

#### Proposed Actions:
1. **Feature usage audit**
   - Document which "advanced" features are actually used
   - Identify features built for future requirements

2. **Simplification opportunities**
   - Replace complex systems with simple alternatives where appropriate
   - Keep architecture flexible but remove unused complexity

3. **Future-proofing vs. YAGNI balance**
   - Evaluate each feature: needed now, planned soon, or speculative?
   - Remove speculative complexity, keep planned features

---

## Implementation Guidelines

### Before Each Phase:
1. **Create git branch** for the phase
2. **Document current behavior** with tests/screenshots  
3. **Get approval** for specific changes before implementing
4. **Test thoroughly** after each modification

### Code Quality Standards:
- **Data-driven**: All game rules in CSV files, not hardcoded
- **Single source of truth**: No duplicate logic or data
- **Minimal complexity**: Simple, readable code over clever solutions
- **No dead code**: Every function should be called, every file should be used

### Testing Protocol:
- **Play through complete game** after major changes
- **Test edge cases** (dice rolls, card combinations, space transitions)
- **Verify CSV-driven behavior** works correctly
- **Check for JavaScript errors** in browser console

### Success Metrics:
- **Lines of code reduction**: Target 20-30% reduction in codebase size
- **Maintainability**: Easier to modify game rules via CSV files
- **Consistency**: Single patterns for common operations
- **Performance**: Faster loading, smoother gameplay

---

## Priority Order for Next Session:

1. **Finish Phase 3** - Complete dead code removal (high impact, low risk)
2. **Start Phase 4** - Card type consolidation (medium impact, medium risk)  
3. **Evaluate Phase 5** - Function simplification (low impact, high risk)
4. **Consider Phase 6** - Remove unused features (variable impact, medium risk)

## Notes:
- Phase 3 dice roll issue was resolved during testing
- TooltipSystem.js should be kept for planned tooltip features
- Focus on high-impact, low-risk changes first
- Get user approval before removing any "architectural" code