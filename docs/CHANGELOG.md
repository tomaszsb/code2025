# Changelog

## [2025.04.20] - Movement Mechanics Update

### Fixed
- **Space Movement Selection**: Fixed issue where available moves in the SpaceInfo panel were not properly clickable, particularly affecting the OWNER-FUND-INITIATION move
- **Event Handling**: Added proper onClick event handlers to move buttons to ensure they trigger the correct selection functions
- **Special Case Handling**: Added specific handling for the OWNER-FUND-INITIATION space to ensure proper movement options

### Added
- **space-info.css**: Created new dedicated CSS file for the SpaceInfo component
- **Enhanced Logging**: Added improved logging statements for better debugging of move selection
- **Button Styling**: Added new "primary-move-btn" class for more prominent move buttons
- **Documentation**: Updated all guiding documents to reflect the changes

### Changed
- **SpaceInfo.js**: Modified to ensure all available moves are properly displayed as clickable buttons
- **Index.html**: Updated to include the new space-info.css file
- **Button Design**: Improved visibility and usability of move buttons with enhanced styling

## [2025.03.15] - Card System Improvements

### Added
- Enhanced card draw animation for better visual feedback
- Improved card management interface
- New card type indicators

### Fixed
- Issue with card discarding not properly removing cards from player's hand
- Card effect processing for Expeditor cards

## [2025.02.28] - Dice Rolling Update

### Added
- New 3D dice rolling animation
- Enhanced visual feedback for dice outcomes

### Fixed
- Dice outcome processing for certain spaces
- Edge case handling for special dice roll spaces

## [2025.01.20] - Initial Release

### Features
- Turn-based gameplay with multiple players
- Interactive game board with different space types
- Card system with 5 card types (W, B, I, L, E)
- Dice rolling mechanics
- Resource management (Money and Time)
- Phase-based project progression

console.log('CHANGELOG.md file has been updated.');