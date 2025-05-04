# Changelog

All notable changes to the Project Management Game will be documented in this file.

## [2025-05-04]

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

## [Unreleased]

### Added
- InitializationManager implementing the manager pattern for game initialization
- Staged initialization process with error handling and retry capability
- Debug mode toggle system with URL parameter control (?debug=true)
- Logging level system (error, warn, info, debug) with URL parameter control (?logLevel=debug)
- Event-based initialization process with stage completion events
- Comprehensive error handling for all initialization stages
- SpaceInfo component refactoring to follow manager pattern
- Proper event handling and cleanup in SpaceInfo
- GameStateManager integration in SpaceInfo
- CardTypeUtilsManager class implementing the manager pattern
- Caching system for improved card type detection performance
- CSS class-based styling methods to replace inline styles
- Event system integration for card-related events
- BackwardCompatibilityLayer for legacy code support
- MoveLogicManager class implementing the manager pattern
- Caching system for improved move determination performance
- Event-based communication for movement-related state changes
- Enhanced visual cues for selected moves with prominent UI indicators
- Debug UI toggle panel in Index-debug.html with debug mode and log level controls
- Improved UI inspector that only loads in debug mode
- Isolated debug functionality to prevent impact on production game
- Fully data-driven dice roll system that relies solely on CSV data for decision making (May 1, 2025)
  - Removed all hardcoded exclusions for spaces that should not show dice rolls
  - Added detailed logging of dice roll decisions for better debugging
  - Improved conditional requirement extraction from card text with better pattern matching

### Changed
- Refactored SpaceInfo component to use SpaceInfoManager
- Removed local state management in SpaceInfo
- Improved code organization and documentation in SpaceInfo
- Refactored CardTypeUtils from object with functions to proper class-based manager
- Updated card type detection with improved fallback mechanisms
- Enhanced error handling in card processing
- Improved compatibility with GameStateManager instead of direct GameState usage
- Refactored MoveLogic from object with functions to proper class-based manager
- Enhanced special case space handling with consistent patterns
- Improved dice roll integration for movement decisions
- Added better organization of move determination logic
- Improved move selection UI with dark outlines and visual indicators for better visibility
- Removed UI inspector from Index.html to improve loading performance
- Replaced inline CSS in UI inspector with proper CSS class-based approach
- Updated DiceManager.js to use a fully data-driven approach for determining when to show dice roll buttons (May 1, 2025)
- Improved BoardRenderer.js to properly evaluate dice roll requirements on each render (May 1, 2025)

### Fixed
- Card type detection consistency issues
- Currency formatting in card displays
- Memory leaks from event listeners not being properly cleaned up
- Inconsistent move logic patterns causing maintenance challenges
- Performance issues with repeated move calculations
- Missing event cleanup in movement-related operations
- Low visibility of selected moves in UI making it difficult for players to recognize their selections
- Debug tools appearing in production version of the game
- Card effects now properly affect game state during movement (April 30, 2025)
  - Enhanced handling of dice-roll-dependent card effects
  - Added proper event dispatching for all card effects
  - Improved integration with game state to ensure effects are correctly applied
  - Added detailed tracking of applied effects for UI updates
  - Fixed handling of time costs and fees from spaces
  - Enhanced special space card integration
- Fixed inconsistent dice roll button visibility issues by making the system fully data-driven (May 1, 2025)
  - Dice roll buttons now only appear when CSV data indicates they should
  - Eliminated special case handling causing unexpected button appearances
  - Resolved issue with OWNER-FUND-INITIATION showing dice button when it shouldn't

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