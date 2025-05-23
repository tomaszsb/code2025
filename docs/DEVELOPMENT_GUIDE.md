## Critical Known Issues

No critical issues at this time. All known issues have been resolved.

# Development Guide

This guide provides information on the next development steps for the Project Management Game.

## Upcoming Priorities

1. **CSV Format Improvements**: [NEW FIRST PRIORITY]
   - Implement CSV Format Improvement Plan as detailed in CSV_FORMAT_IMPROVEMENTS.md
   - Phase 1: Add explicit RequiresDiceRoll column to Spaces.csv
   - Phase 2: Create structured dice outcomes format
   - Phase 3: Implement explicit movement relationship mapping
   - Phase 4: Create special case handlers registry
   - Phase 5: Structure card requirements in their own CSV

2. **Gameplay Mechanics Fixes**:
   - ✅ Fix movement issues for all spaces in MoveLogicManager.js
   - ✅ Implement card effects properly to ensure they introduce changes to the game state
   - Create a functional leaderboard to track player progress

3. **End Game Experience**:
   - Implement proper game completion UI
   - Add player statistics and performance metrics
   - Create a replay option
   - Add ability to review game history
   - Design and implement win/loss conditions

4. **Testing with Manager Pattern**:
   - Test refactored GameBoard with manager components
   - Validate interaction between managers
   - Verify all game functionality works with new architecture
   - Ensure no performance regressions with the refactored components

5. **Visual Enhancements**:
   - Implement transitions between game states
   - Create consistent visual styling for different card types

6. **Improve Codebase Maintainability**:
   - Implement strict component interfaces for all manager classes
   - Create a core game loop service to reduce direct component dependencies
   - Restructure file organization to reflect modular architecture
   - Add one-way data flow principles to simplify debugging
   - Implement dependency injection to reduce tight coupling

## Areas Needing Improvement

1. **CSV Data Structure and Game Logic**:
   - Implement phased CSV format improvements to move logic from code to data
   - Create more structured CSV formats for dice rolls, movement relationships, and card requirements
   - Develop a backward-compatible parser system that handles both old and new formats
   - Implement a handler registry system for special case spaces
   - Add data validation to ensure CSV integrity
   - See CSV_FORMAT_IMPROVEMENTS.md for complete implementation plan

2. **Complex Initialization Logic**: 
   - ✅ Refactored main.js into InitializationManager following the manager pattern
   - ✅ Implemented a staged initialization process
   - ✅ Added better error handling for initialization failures
   - ✅ Added debug mode toggle and logging level system

3. **Debug Elements**: 
   - ✅ Implemented debug mode toggle for console.log statements via URL parameter (?debug=true)
   - ✅ Implemented a logging level system (error, warn, info, debug) via URL parameter (?logLevel=debug)
   - ✅ Added UI toggle for debug mode in Index-debug.html

4. **Move Logic Complexity**: 
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

5. **Component Modularity**:
   - ✅ Refactored SpaceInfo.js into smaller, focused modules (SpaceInfoDice.js, SpaceInfoCards.js, SpaceInfoMoves.js, SpaceInfoUtils.js)
   - ✅ Implemented browser-friendly module pattern using window objects instead of ES modules
   - ✅ Used prototype mixins for efficient code sharing
   - ✅ Improved maintainability with clear separation of concerns
   - ✅ Updated documentation to reflect the modular architecture (May 1, 2025)
   - ✅ Fixed infinite re-rendering loop in SpaceExplorer.js with processing flags and optimized state updates (May 9, 2025)
   - ✅ Improved component performance with asynchronous execution and data-driven state updates (May 9, 2025)
   - ✅ Enhanced SpaceInfoMoves to properly support PM-DECISION-CHECK with visit-type awareness (May 15, 2025)
   - ✅ Created new modular Movement System with clear separation of concerns (MovementCore.js, MovementLogic.js, MovementUIAdapter.js, MovementSystem.js) (May 16, 2025)
   - Create standardized interfaces for all manager components to stabilize cross-component communication
   - Apply Core/Logic/UIAdapter/System pattern to Card and Dice systems
   - Implement strict component boundaries with runtime validation
   - Implement dependency injection for manager components to reduce direct references
   - Create Component Interaction Maps to visualize dependencies

6. **CSS Consistency**: 
   - Continue reviewing for variable reference issues
   - Standardize color schemes across components
   - Implement consistent spacing and layout rules

7. **Core Game Architecture**:
   - Create GameLoopManager.js to orchestrate game flow and reduce direct dependencies
   - Implement StateTransitionManager.js to handle transitions between game states
   - Add one-way data flow pattern for predictable state updates
   - Refactor to support working on one file at a time safely
   - Create template patterns for adding new game elements without touching multiple files
   - Implement validation to prevent cross-component direct property access

8. **File Structure Reorganization**:
   - Restructure directories to reflect the modular approach:
     ```
     js/
     ├── core/           # Core game mechanics (game state, rules, etc.)
     ├── managers/       # Manager components (orchestrate functionality)
     ├── interfaces/     # Public interfaces for cross-component communication
     ├── ui/             # UI components
     ├── utils/          # Utility functions
     └── config/         # Configuration and game data
     ```
   - Move files to appropriate directories without changing functionality
   - Update import/reference paths in existing files
   - Add index files to each directory to simplify imports

## Implementation Guidelines

When implementing these features, follow the standards outlined in each component's documentation and adhere to the established manager pattern. Refer to completed components like SpaceInfoManager, CardTypeUtilsManager, and MoveLogicManager as examples of proper implementation.

For large components, follow the modular approach demonstrated in the SpaceInfo component refactoring:
- Break up large components into smaller, focused modules
- Use browser-friendly module patterns with window objects
- Apply prototype mixins for method sharing
- Keep related functionality grouped in separate files
- Maintain clear documentation of the component structure

### New Implementation Guidelines

1. **One-Way Data Flow**: 
   - Data should flow in one direction (e.g., from state to UI)
   - Components should get data from managers, not directly from other components
   - State changes should be explicit and traceable
   - Event-based communication should be used for cross-component updates

2. **Component Interface Pattern**:
   - Create a dedicated interface file for each manager component
   - Example interface structure:
     ```javascript
     // CardManagerInterface.js
     window.CardManagerInterface = {
         // Methods other components can safely call
         drawCard: function(type) {
             return window.CardManager.drawCard(type);
         },
         
         getCardCount: function(type) {
             return window.CardManager.getCardCount(type);
         }
     };
     ```
   - Components must only interact through these interfaces
   - Interface methods should remain stable even when internal implementations change

3. **Dependency Injection Pattern**:
   - Components should receive dependencies through constructor parameters
   - Example implementation:
     ```javascript
     // Example component with dependency injection
     function ExampleComponent(dependencies) {
         this.cardManager = dependencies.cardManager;
         this.diceManager = dependencies.diceManager;
         
         // Use dependencies like this
         this.doSomething = function() {
             const card = this.cardManager.drawCard('W');
             // ...
         };
     }
     
     // Creating with dependencies
     const component = new ExampleComponent({
         cardManager: window.CardManagerInterface,
         diceManager: window.DiceManagerInterface
     });
     ```
   - This allows easier testing and reduces direct coupling

4. **File-by-File Development**:
   - Each file should be modifiable without changing other files
   - Interface files should remain stable
   - Implementation files can change as needed
   - Use the ComponentRegistry pattern for component discovery:
     ```javascript
     // ComponentRegistry.js
     window.ComponentRegistry = {
         _components: {},
         
         register: function(name, component) {
             this._components[name] = component;
         },
         
         get: function(name) {
             return this._components[name];
         }
     };
     
     // Register components
     ComponentRegistry.register('CardManager', CardManagerInterface);
     ```

Always ensure:
- Proper event system integration
- Complete cleanup of event listeners
- Consistent logging (beginning and end of execution)
- No inline CSS
- Code follows the closed system principle

## CSV Format Improvements Implementation

The CSV format improvements should be implemented in phases as detailed in CSV_FORMAT_IMPROVEMENTS.md:

1. **Phase 1: Add Explicit Dice Roll Flag**
   - Add a RequiresDiceRoll column to Spaces.csv
   - Update DiceManager to check this flag first
   - Maintain backward compatibility with existing string parsing
   - Add validation for the new column format

2. **Phase 2: Structured Dice Outcomes**
   - Create new columns for outcome type, value, and description
   - Implement a parser that understands both old and new formats
   - Update the dice outcome processing to use structured data
   - Create a data migration utility for existing CSV content

3. **Phase 3: Movement Relationship Mapping**
   - Create a dedicated CSV for space-to-space movement relationships
   - Implement a relationship-based movement logic system
   - Update the getAvailableMoves method to use relationship data
   - Create a visualization tool for movement paths

4. **Phase 4: Special Case Handlers Registry**
   - Create a CSV-driven special case handler system
   - Move PM-DECISION-CHECK logic to a registered handler
   - Implement handler discovery and registration system
   - Add priority system for handler execution order

5. **Phase 5: Structured Card Requirements**
   - Create a dedicated CardRequirements.csv
   - Implement structured parsing for conditional card actions
   - Update dice processing to check for card requirements
   - Create a validation system for card requirements

Each phase should be implemented with strict backward compatibility to ensure existing game functionality continues to work while the new system is being developed and tested.

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

## Card System Implementation

The card system should be refactored following the same modular pattern as the movement system:

1. **CardCore.js** - Handles fundamental card operations:
   - Card data structure
   - Card collection management
   - Card state tracking
   - Type and category definitions

2. **CardLogic.js** - Implements game-specific card logic:
   - Card effect resolution
   - Condition evaluation
   - Game state modifications
   - Card interaction rules

3. **CardUIAdapter.js** - Connects card logic to UI components:
   - Card display formatting
   - Animation handling
   - User interaction processing
   - Visual state representations

4. **CardSystem.js** - Main integration point:
   - Initializes all card components
   - Extends GameStateManager with card functionality
   - Integrates with TurnManager for state persistence
   - Provides robust error handling

## Game Loop Implementation

The game loop should be implemented as a central orchestrator:

1. **GameLoopManager.js** - Controls the flow of the game:
   - Turn sequence management
   - Phase transitions (setup, play, end)
   - Event dispatching for phase changes
   - State persistence between turns

2. **StateTransitionManager.js** - Handles transitions between game states:
   - Defines valid state transitions
   - Validates state change requests
   - Performs necessary cleanup between states
   - Initializes components needed for new states

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
9. Additional tests for modular architecture:
   - Validate component isolation (changes in one component don't break others)
   - Test interface stability (implementations can change without breaking callers)
   - Verify dependency injection works correctly
   - Test component registry functionality
   - Confirm one-way data flow is maintained

## Documentation Requirements

Update the following for each change:
1. CHANGELOG.md with details of what was changed
2. Component documentation within the file itself
3. Any relevant player-facing documentation
4. New documentation requirements:
   - Update Component Interaction Maps when dependencies change
   - Document public interfaces thoroughly
   - Provide examples for common modifications
   - Create workflow guides for specific change types

## Implementation Priority Order

To make the codebase more manageable incrementally, follow this order:

1. Implement the CSV Format Improvements as the first priority (see CSV_FORMAT_IMPROVEMENTS.md)
2. Complete the Movement System refactoring (already in progress)
3. Apply the same pattern to Card Management system
4. Apply the pattern to Game State Management
5. Create the Core Game Loop Service
6. Refactor UI components to follow the new patterns
7. Implement Component Registry and Interface patterns
8. Reorganize file structure to reflect the modular architecture

*Last Updated: May 18, 2025*