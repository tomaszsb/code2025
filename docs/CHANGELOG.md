# Changelog

All notable changes to the Project Management Game will be documented in this file.

## [Unreleased]

### Added
- SpaceInfo component refactoring to follow manager pattern
- Proper event handling and cleanup in SpaceInfo
- GameStateManager integration in SpaceInfo
- CardTypeUtilsManager class implementing the manager pattern
- Caching system for improved card type detection performance
- CSS class-based styling methods to replace inline styles
- Event system integration for card-related events
- BackwardCompatibilityLayer for legacy code support

### Changed
- Refactored SpaceInfo component to use SpaceInfoManager
- Removed local state management in SpaceInfo
- Improved code organization and documentation in SpaceInfo
- Refactored CardTypeUtils from object with functions to proper class-based manager
- Updated card type detection with improved fallback mechanisms
- Enhanced error handling in card processing
- Improved compatibility with GameStateManager instead of direct GameState usage

### Fixed
- Card type detection consistency issues
- Currency formatting in card displays
- Memory leaks from event listeners not being properly cleaned up

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
