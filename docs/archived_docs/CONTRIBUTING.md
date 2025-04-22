# Contributing Guidelines

## Code Standards

When contributing to this project, please follow these guidelines:

### General Principles

1. **No Separate Patches**: All fixes should modify the original code directly. Don't create separate patch files or workarounds.
2. **Closed System**: The game should remain a closed system. Don't introduce external dependencies.
3. **Logging**: Every file should include console.log statements that indicate:
   - When the file begins to be used (`console.log('FileName.js file is beginning to be used')`)
   - When code execution is finished (`console.log('FileName.js code execution finished')`)
4. **CSS Organization**: No inline CSS. All styling should be in dedicated CSS files.

### File Structure

- **Components**: Place all React components in `js/components/`
- **Utils**: Utility functions belong in `js/utils/`
- **Data**: Data handling logic belongs in `js/data/`
- **CSS**: Each component should have styling in an appropriate CSS file

### Development Workflow

1. **Identify Issues**: Before making changes, ensure you understand the root cause of any issues.
2. **Test Changes**: Test your changes thoroughly before submitting.
3. **Document Changes**: Add comments explaining complex logic and update relevant documentation.

## Recently Fixed Issues

### Movement Mechanics

The game previously had issues with the player movement mechanics where available moves were not properly clickable in the UI. This has been fixed by:

1. Updating the `SpaceInfo.js` component to properly render available moves as clickable buttons
2. Adding additional CSS styling to make move buttons more visually prominent
3. Creating a dedicated CSS file for the SpaceInfo component
4. Adding proper event handlers to ensure move selection works correctly

When working with movement mechanics, please consider:

- The game uses the `SpaceSelectionManager` to handle space selection logic
- Moves are not executed immediately but stored until the player ends their turn
- Available moves should be clearly displayed to the player as interactive buttons

### Debugging Tips

- Use the browser console to view log messages and understand the game flow
- The GameStateManager maintains the core game state, so examine its state when troubleshooting
- Review the SpaceInfo component for issues related to displaying game information
- Check the BoardRenderer for problems with visual representation

## Pull Request Process

1. Focus on a single issue or enhancement per PR
2. Include clear descriptions of what you changed and why
3. Ensure your code follows the logging and organization standards mentioned above
4. Test your changes thoroughly before submission

console.log('CONTRIBUTING.md file has been updated.');