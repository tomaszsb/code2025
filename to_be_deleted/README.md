# Files Moved for Deletion

**Date:** May 31, 2025  
**Reason:** Post-refactoring cleanup - these files are no longer used by the game

## Summary
- **Total files moved:** 12
- **CSS files:** 2
- **JavaScript files:** 10

## Files by Category

### CSS Files (2)
- `css/conditional-effects.css` - Not loaded in Index.html
- `css/work-card-dialog.css` - Not loaded in Index.html

### JavaScript Files (10)

#### Development/Debug Utilities (4)
- `js/analyze-pm-visit-status.js` - Analysis utility, not loaded
- `js/debug-clear-storage.js` - Debug utility, not loaded
- `js/test-pm-decision-check.js` - Test utility, not loaded
- `js/ui-inspector.js` - Debug utility, not loaded

#### Component Files (2)
- `js/components/NegotiationManager.js.removed` - Already marked for removal
- `js/components/utils/SpaceInfoUtils.js` - Duplicate of main SpaceInfoUtils.js

#### Old Movement System (4)
- `js/utils/movement/MovementCore.js` - Replaced by MovementEngine.js
- `js/utils/movement/MovementLogic.js` - Replaced by MovementSystemSimplified.js
- `js/utils/movement/MovementSystem.js` - Replaced by current system
- `js/utils/movement/TurnFlowManager.js` - Functionality integrated elsewhere

## Verification
These files were identified as unused by:
1. Checking Index.html script loading order
2. Verifying no internal imports/references
3. Confirming game functionality without them

## Next Steps
1. **Test the game thoroughly** to ensure no functionality is broken
2. **If no issues after testing:** Delete this entire `to_be_deleted` directory
3. **If issues found:** Move specific files back to their original locations

## Current Game Status
The game currently loads **53 files** (42 JS + 11 CSS) through Index.html.  
All core functionality should remain intact after removing these 12 unused files.
