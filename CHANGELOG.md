# Changelog

All notable changes to the Project Management Game will be documented in this file.

## [Unreleased]

### Fixed
- Fixed MoveLogicManager.js to properly use browser-friendly window global objects instead of ES6 modules
- Fixed movement issues for all spaces in MoveLogicManager
- Implemented proper module hierarchy (MoveLogicBase → MoveLogicSpecialCases → MoveLogicUIUpdates → MoveLogicManager)
- Fixed script loading order in Index.html and Index-debug.html
- Added proper cleanup of event listeners to prevent memory leaks

### Added
- Added SpaceInfoUtils.js to provide utility functions for SpaceInfo component
- Added SpaceInfoDice.js for dice-related rendering and functionality
- Added SpaceInfoCards.js for card-related functionality
- Added SpaceInfoMoves.js for move-related functionality

### Changed
- Refactored MoveLogicManager implementation to follow established manager pattern
- Moved MoveLogic implementations to a dedicated move-logic directory for better organization
- Refactored SpaceInfo.js by breaking it up into smaller, modular files
- Used browser-friendly approach with global objects instead of ES module imports/exports
- Maintained all existing functionality while improving code organization
- Added proper logging statements in all new files
- Updated Index.html to include the new module files

### Improved
- Better separation of concerns within the SpaceInfo component
- Reduced the size and complexity of the main SpaceInfo.js file
- More maintainable code that follows the established manager pattern
- Fixed module loading issues by using window-based object assignment

### Technical Notes
- The initial ES module-based approach caused browser compatibility issues
- Switched to a browser-friendly pattern using window global objects
- Organized code using object prototypes for better inheritance
- Maintained backward compatibility with existing code
