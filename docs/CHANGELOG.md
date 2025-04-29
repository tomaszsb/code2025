# Changelog

All notable changes to the Project Management Game will be documented in this file.

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

### Fixed
- Card type detection consistency issues
- Currency formatting in card displays
- Memory leaks from event listeners not being properly cleaned up
- Inconsistent move logic patterns causing maintenance challenges
- Performance issues with repeated move calculations
- Missing event cleanup in movement-related operations
- Low visibility of selected moves in UI making it difficult for players to recognize their selections
- Debug tools appearing in production version of the game

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
