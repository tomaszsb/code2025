# Changelog

All notable changes to the Project Management Game will be documented in this file.

## [2025-05-04]

### Added
- Implemented "RETURN TO YOUR SPACE" option for PM-DECISION-CHECK space that allows players to return to the main path after side quests
- Added side quest tracking system that maintains a player's original path when they visit PM-DECISION-CHECK
- Added special handling for CHEAT-BYPASS option that implements real-world consequences (can't undo cheating)
- Added event-based detection of player movement to automatically clear side quest state when returning to main path

### Changed
- Refactored MoveLogicBase.js to use a fully data-driven approach from CSV files instead of hardcoded special case handling
- Removed hardcoded decision tree spaces array for spaces like "ARCH-INITIATION", "PM-DECISION-CHECK", and "REG-FDNY-FEE-REVIEW"
- Updated `hasSpecialCaseLogic` method to check for dice roll requirements using DiceRollLogic and CSV data
- Modified `getAvailableMoves` to always use standard move logic for all spaces
- Deprecated `handleSpecialCaseSpace` with a warning to use the data-driven approach instead
- Refactored MoveLogicManager.js handleDiceRolledEvent method to consistently use DiceRollLogic utilities for all spaces
- Removed special case handling for ARCH-INITIATION in handleDiceRolledEvent method
- Implemented data-driven dice roll outcome handling using DiceRollLogic.handleDiceRoll and DiceRollLogic.findSpacesFromOutcome
- Updated SpaceSelectionManager.js to support the fully data-driven approach with CSV files
- Added explicit logging in SpaceSelectionManager.js to document support for data-driven move selection
- Fixed MoveLogicSpaceTypes.js to use the data-driven approach for decision tree spaces instead of the removed decisionTreeSpaces array

### Added
- Fully data-driven dice roll system that relies solely on CSV data for decision making
- Enhanced logging for the dice roll system with detailed information about decisions
- Integrated DiceRollLogic for all spaces, including previously special-cased ones

## [2025-05-03]

### Fixed
- Fixed issue in TurnManager.js where player-selected moves weren't executing when ending a turn. Now properly checks both selectedMove and hasSelectedMove flag to ensure only player-confirmed moves are executed.
- Updated TurnManager.js to properly handle situations where a player has no available movement options after a dice roll (such as when the roll results in card draws only).
- Implemented direct move paths in MoveLogicBase.js to ensure spaces with both dice roll outcomes and direct movement options defined in the CSV work correctly.
- Fixed MoveLogicSpecialCases.js to properly inherit from MoveLogicSpaceHandlers instead of MoveLogicBase, resolving the "resolveSpaceForVisitType is not a function" error.
- Updated script loading order in Index.html and Index-debug.html to ensure proper dependency chain for MoveLogic modules.
- Fixed player movement issue where players would get stuck in a loop at the PM-DECISION-CHECK space.
- Fixed variable declaration in MoveLogicCardEffects.js that was causing money from OWNER-FUND-INITIATION space to not be added to player's wallet.

## [2025-05-02]

### Fixed
- Fixed issue in GameStateManager.js where spaces were incorrectly identified as first visits when a player was currently on the space
- Improved visit tracking logic to properly count previous visits for current space

## [2025-05-01]

### Changed
- Updated DiceManager.js to use a fully data-driven approach for determining when to show dice roll buttons
- Improved BoardRenderer.js to properly evaluate dice roll requirements on each render

### Fixed
- Fixed inconsistent dice roll button visibility issues by making the system fully data-driven
  - Dice roll buttons now only appear when CSV data indicates they should
  - Eliminated special case handling causing unexpected button appearances
  - Resolved issue with OWNER-FUND-INITIATION showing dice button when it shouldn't

## [2025-04-30]

### Fixed
- Card effects now properly affect game state during movement
  - Enhanced handling of dice-roll-dependent card effects
  - Added proper event dispatching for all card effects
  - Improved integration with game state to ensure effects are correctly applied
  - Added detailed tracking of applied effects for UI updates
  - Fixed handling of time costs and fees from spaces
  - Enhanced special space card integration

## [Unreleased]

### Enhanced
- Improved player setup process with a more attractive UI design
- Added game logo to the player setup screen
- Added smooth animations for a better user experience during setup
- Created dedicated CSS file for player setup (player-setup.css)
- Enhanced visit type resolution with consistent handling across all spaces

### Fixed
- Fixed MoveLogicManager.js to properly use browser-friendly window global objects instead of ES6 modules
- Fixed movement issues for all spaces in MoveLogicManager
- Fixed inconsistent visit type handling in MoveLogicBase.js with robust fallback logic
- Fixed issues with special pattern handling, particularly for "Option from first visit"
- Implemented proper module hierarchy (MoveLogicBase → MoveLogicSpecialCases → MoveLogicUIUpdates → MoveLogicManager)
- Fixed script loading order in Index.html and Index-debug.html
- Added proper cleanup of event listeners to prevent memory leaks

### Added
- Added SpaceInfoUtils.js to provide utility functions for SpaceInfo component
- Added SpaceInfoDice.js for dice-related rendering and functionality
- Added SpaceInfoCards.js for card-related functionality
- Added SpaceInfoMoves.js for move-related functionality
- Added resolveSpaceForVisitType helper method for consistent space resolution
- Added comprehensive visit-type-resolution.md documentation

### Changed
- Refactored MoveLogicManager implementation to follow established manager pattern
- Moved MoveLogic implementations to a dedicated move-logic directory for better organization
- Refactored SpaceInfo.js by breaking it up into smaller, modular files
- Updated special case handlers to use new space resolution helper method
- Used browser-friendly approach with global objects instead of ES module imports/exports
- Maintained all existing functionality while improving code organization
- Added proper logging statements in all new files
- Updated Index.html to include the new module files

### Improved
- Better separation of concerns within the SpaceInfo component
- Reduced the size and complexity of the main SpaceInfo.js file
- More maintainable code that follows the established manager pattern
- Fixed module loading issues by using window-based object assignment
- Implemented clear fallback hierarchy for visit type resolution
- Enhanced error handling and logging for visit type issues
- Improved consistency in space handling across all components

### Technical Notes
- The initial ES module-based approach caused browser compatibility issues
- Switched to a browser-friendly pattern using window global objects
- Organized code using object prototypes for better inheritance
- Maintained backward compatibility with existing code
- Implemented visit type resolution with three-step fallback approach:
  1. Find exact visit type match
  2. Find alternative visit type if exact match not found
  3. Use first available space as last resort

## [1.2.0] - 2025-04-20

### Added
- Space Explorer performance metrics tracking
- Card limit system (max 6 cards per type)
- Card count indicators with visual warnings
- Card limit dialog for excess cards

### Changed
- Refactored SpaceExplorerLogger to follow manager pattern
- Moved all card CSS from inline styles to card-components.css
- Enhanced dice roll system with proper CSS scoping

### Fixed
- Fixed layout issues on smaller screens
- Improved error handling in SpaceExplorer component
- Added proper cleanup for all event listeners

## [1.1.0] - 2025-03-15

### Added
- GameStateManager with event system
- High-performance space lookup caching
- Optimized visited spaces tracking with Set data structure

### Changed
- Converted GameState to class-based GameStateManager
- Enhanced state persistence with consolidated localStorage

### Fixed
- Fixed memory leaks in event listeners
- Improved performance for space lookups
- Enhanced error handling in state management

## [1.0.0] - 2025-02-01

### Added
- Core game movement system
- Basic dice rolling mechanics
- Card draw/play/discard functionality
- Player turn management
- Space exploration panel
- Game state persistence

### Changed
- Enhanced board space connectivity
- Improved dice outcome categorization

### Fixed
- Fixed layout issues on different screen sizes
- Improved error handling for card loading
- Enhanced performance for game state operations
