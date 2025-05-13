## Critical Known Issues

No critical issues at this time. All known issues have been resolved.

# Development Guide

This guide provides information on the next development steps for the Project Management Game.

## Upcoming Priorities

1. **Gameplay Mechanics Fixes**:
   - ✅ Fix movement issues for all spaces in MoveLogicManager.js
   - ✅ Implement card effects properly to ensure they introduce changes to the game state
   - Create a functional leaderboard to track player progress

2. **End Game Experience**:
   - Implement proper game completion UI
   - Add player statistics and performance metrics
   - Create a replay option
   - Add ability to review game history
   - Design and implement win/loss conditions

3. **Testing with Manager Pattern**:
   - Test refactored GameBoard with manager components
   - Validate interaction between managers
   - Verify all game functionality works with new architecture
   - Ensure no performance regressions with the refactored components

4. **Visual Enhancements**:
   - Implement transitions between game states
   - Create consistent visual styling for different card types

## Areas Needing Improvement

1. **Complex Initialization Logic**: 
   - ✅ Refactored main.js into InitializationManager following the manager pattern
   - ✅ Implemented a staged initialization process
   - ✅ Added better error handling for initialization failures
   - ✅ Added debug mode toggle and logging level system

2. **Debug Elements**: 
   - ✅ Implemented debug mode toggle for console.log statements via URL parameter (?debug=true)
   - ✅ Implemented a logging level system (error, warn, info, debug) via URL parameter (?logLevel=debug)
   - ✅ Added UI toggle for debug mode in Index-debug.html

3. **Move Logic Complexity**: 
   - ✅ Refactored MoveLogic.js into MoveLogicManager following the manager pattern
   - ✅ Implemented consistent patterns for special case handling
   - ✅ Added comprehensive documentation in MoveLogicManager.md
   - ✅ Fixed issues with movement functionality for all spaces (fixed May 2, 2025)
   - ✅ Card effects now properly affect game state during movement (fixed April 30, 2025)
   - ✅ Implemented improved visit type resolution for consistent handling (fixed May 2, 2025)
   - ✅ Implemented fully data-driven approach using CSV files instead of hardcoded special cases (fixed May 4, 2025)
   - ✅ Added original space moves to PM-DECISION-CHECK to allow returning to main path (fixed May 4, 2025)
   - ✅ Enhanced PM-DECISION-CHECK UI to show original space moves directly in Available Moves section (fixed May 6, 2025)
   - ✅ Fixed original space move selection handling to properly process return to main path (fixed May 6, 2025)
   - ✅ Merged MoveLogicDirectFix.js into MoveLogicPmDecisionCheck.js (fixed May 7, 2025)
   - ✅ Removed MoveLogicDirectFix.js from loading sequence to eliminate initialization issues (fixed May 7, 2025)
   - ✅ Refactored MoveLogicPmDecisionCheck.js to follow closed system principles (fixed May 7, 2025)
   - ✅ Implemented deterministic initialization pattern with proper error reporting (fixed May 7, 2025)
   - ✅ Fixed critical initialization order issues between MoveLogic components (fixed May 8, 2025)
   - ✅ Implemented event-based dependency management with proper initialization sequence (fixed May 8, 2025)
   - ✅ Added method overwrite protection with property descriptors for critical methods (fixed May 9, 2025)
   - ✅ Implemented self-healing GameStateManager detection with MutationObserver (fixed May 9, 2025)
   - ✅ Implemented clear Single Responsibility Principle in PM-DECISION-CHECK handling (fixed May 10, 2025)
   - ✅ Refactored PM-DECISION-CHECK into focused functions with clear responsibilities (fixed May 10, 2025)
   - ✅ Enhanced originalSpaceId storage for PM-DECISION-CHECK with consistent persistence approach (fixed May 14, 2025)
   - ✅ Implemented distinct visit tracking for Main Path and Quest Side visits (fixed May 13, 2025)
   - ✅ Updated terminology to "Initial/Subsequent" for Main Path and "Maiden/Return" for Quest Side (fixed May 13, 2025)
   - ✅ Eliminated redundant mainPathVisitStatus tracking to streamline decision logic (fixed May 14, 2025)
   - ✅ Simplified tracking system by using standard game visitType for main path visits (fixed May 14, 2025)
   - ✅ Standardized property storage in MoveLogicSpecialCases.js to align with simplified approach (fixed May 10, 2025)
   - ✅ Removed all fallback mechanisms to strictly enforce closed system principles (fixed May 14, 2025)
   - ✅ Enhanced error reporting to make initialization dependencies clearer (fixed May 14, 2025)
   - ✅ Fixed PM-DECISION-CHECK return to original space issue with direct UI solution (fixed May 15, 2025)
   - ✅ Implemented visit-type-aware return button that only appears for subsequent visits (fixed May 15, 2025)
   - ✅ Added intelligent detection of the return space based on player history (fixed May 15, 2025)
   - ✅ Implemented new modular movement system with separate core, logic, and UI components (fixed May 16, 2025)
   - ✅ Fixed critical initialization issues in movement system with immediate execution and error handling (fixed May 16, 2025)
   - ✅ Renamed movement system files to PascalCase for consistency with implementation guide (fixed May 16, 2025)
   - ✅ Added extensive safety checks to prevent "Cannot read properties of undefined" errors (fixed May 16, 2025)
   - ✅ Enhanced TurnManager integration for proper movement state persistence (fixed May 16, 2025)
   - ✅ Improved dice roll data loading with multiple fallback approaches (fixed May 16, 2025)

4. **Component Modularity**:
   - ✅ Refactored SpaceInfo.js into smaller, focused modules (SpaceInfoDice.js, SpaceInfoCards.js, SpaceInfoMoves.js, SpaceInfoUtils.js)
   - ✅ Implemented browser-friendly module pattern using window objects instead of ES modules
   - ✅ Used prototype mixins for efficient code sharing
   - ✅ Improved maintainability with clear separation of concerns
   - ✅ Updated documentation to reflect the modular architecture (May 1, 2025)
   - ✅ Fixed infinite re-rendering loop in SpaceExplorer.js with processing flags and optimized state updates (May 9, 2025)
   - ✅ Improved component performance with asynchronous execution and data-driven state updates (May 9, 2025)
   - ✅ Enhanced SpaceInfoMoves to properly support PM-DECISION-CHECK with visit-type awareness (May 15, 2025)
   - ✅ Created new modular Movement System with clear separation of concerns (MovementCore.js, MovementLogic.js, MovementUIAdapter.js, MovementSystem.js) (May 16, 2025)

5. **CSS Consistency**: 
   - Continue reviewing for variable reference issues
   - Standardize color schemes across components
   - Implement consistent spacing and layout rules

## Implementation Guidelines

When implementing these features, follow the standards outlined in each component's documentation and adhere to the established manager pattern. Refer to completed components like SpaceInfoManager, CardTypeUtilsManager, and MoveLogicManager as examples of proper implementation.

For large components, follow the modular approach demonstrated in the SpaceInfo component refactoring:
- Break up large components into smaller, focused modules
- Use browser-friendly module patterns with window objects
- Apply prototype mixins for method sharing
- Keep related functionality grouped in separate files
- Maintain clear documentation of the component structure

Always ensure:
- Proper event system integration
- Complete cleanup of event listeners
- Consistent logging (beginning and end of execution)
- No inline CSS
- Code follows the closed system principle

## Movement System Implementation

The new movement system follows a modular architecture with clear separation of concerns:

1. **MovementCore.js** - Handles fundamental movement operations:
   - Player movement between spaces
   - Visit history tracking
   - Space type determination
   - Path tracking (main path vs. side quests)

2. **MovementLogic.js** - Implements game-specific movement logic:
   - Available moves determination
   - PM-DECISION-CHECK special handling
   - Dice roll outcome processing
   - Main path return functionality

3. **MovementUIAdapter.js** - Connects movement logic to UI components:
   - Visual indicators for available moves
   - UI state updates
   - Event handling for user interactions
   - Dice roll visualization

4. **MovementSystem.js** - Main integration point:
   - Initializes all movement components
   - Extends GameStateManager with movement functionality
   - Integrates with TurnManager for state persistence
   - Provides robust error handling

Key implementation features:
- Immediate initialization without waiting for DOM events
- Comprehensive error handling and safety checks
- Property descriptors for method protection
- Clear logging at beginning and end of execution
- Multiple fallback approaches for loading dice roll data
- Event-based notification of initialization status

## Testing Recommendations

Prior to submitting any changes:
1. Test in multiple browsers
2. Verify mobile responsiveness
3. Check for memory leaks with extended play
4. Validate proper event cleanup
5. Ensure proper logging is implemented
6. Test specific spaces that had movement issues
7. Verify card effects are properly applied during gameplay
8. For modular components, test:
   - Proper module loading order
   - Correct application of mixins
   - Cross-module function calls
   - Browser compatibility
   - Console for module loading errors

## Documentation Requirements

Update the following for each change:
1. CHANGELOG.md with details of what was changed
2. Component documentation within the file itself
3. Any relevant player-facing documentation

*Last Updated: May 16, 2025*