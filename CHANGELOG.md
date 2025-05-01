# Changelog

All notable changes to the Project Management Game will be documented in this file.

## [Unreleased]

### Added
- Added SpaceInfoUtils.js to provide utility functions for SpaceInfo component
- Added SpaceInfoDice.js for dice-related rendering and functionality
- Added SpaceInfoCards.js for card-related functionality
- Added SpaceInfoMoves.js for move-related functionality

### Changed
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
- Organized code using mixins applied to the SpaceInfo prototype
- Maintained backward compatibility with existing code
