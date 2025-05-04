# Visit Type Resolution Improvements

## Overview

This document outlines the improvements made to the visit type resolution system in the Project Management Game. These improvements ensure consistent handling of first and subsequent visits across all spaces on the game board.

## Problem Statement

The original implementation had several issues with visit type resolution:

1. **Inconsistent Visit Type Selection**: When a space with the exact matching visit type wasn't found, the code would fall back to using any available space without a clear hierarchy.

2. **Inconsistent Space Name Resolution**: While `GameStateManager.extractSpaceName()` existed to standardize space names, it wasn't used consistently throughout the movement logic.

3. **Unreliable Visit History Checking**: The visit history tracking didn't properly distinguish between spaces that had been truly visited in the past and the space a player was currently on. When a player was on a space they had visited before, the system would incorrectly treat it as a first visit.

4. **Different Space Resolution Logic**: There was one logic for the current space and a different logic for next spaces, causing inconsistencies.

5. **Incomplete Edge Case Handling**: The code lacked proper handling for cases where no spaces matched the expected pattern.

## Solution: Robust Visit Type Resolution

We implemented a comprehensive solution to address these issues:

1. **Created a Standardized Space Resolution Helper**: 
   - Added a `resolveSpaceForVisitType()` method in `MoveLogicBase.js` that follows a clear fallback hierarchy
   - This helper ensures consistent space resolution throughout the codebase

2. **Implemented Clear Fallback Logic**:
   - First try to find a space with the exact visit type
   - If not found, try the opposite visit type as a fallback
   - If still not found, use the first available space of that name

3. **Ensured Consistent Name Standardization**:
   - Made sure `GameStateManager.extractSpaceName()` is used consistently
   - Applied this standardization to all space name comparisons

4. **Improved Visit History Tracking**:
   - Enhanced the logic to properly distinguish between past visits and current positions
   - Added detailed logging to track visit status for debugging

5. **Standardized Space Selection Logic**:
   - Used the same resolution process for both current space and next spaces
   - Normalized all space selections through a single code path

## Recent Fixes (May 2, 2025)

### GameStateManager.js - Current Space Visit Detection Fix

A significant improvement has been made to the `hasPlayerVisitedSpace` method in `GameStateManager.js` to fix how the system determines if a player has previously visited their current space:

1. **Previous Implementation Issue**:
   - The original code would make a copy of the visitedSpaces Set
   - Remove the current space from this copy
   - Check if the space was still in the Set (which was always false due to Set uniqueness)

2. **New Improved Implementation**:
   - Uses a visit counting approach instead of Set manipulation
   - Counts the occurrence of the space in the player's visit history
   - If the count is greater than 0, treats the space as previously visited
   - Special handling for both visitedSpaces Set and previousPosition

3. **Clearer Debug Information**:
   - Enhanced logging shows the visit count
   - Explicitly reports whether a space was previously visited
   - Makes debugging visit type issues much easier

This fix ensures the game will correctly identify whether the space a player is currently on should be treated as a first visit or a subsequent visit, providing the appropriate content and game mechanics.

## Implementation Details

The solution is centered around the new `resolveSpaceForVisitType()` helper method in `MoveLogicBase.js`:

```javascript
/**
 * Helper method to resolve the appropriate space based on visit type with proper fallbacks
 * @param {Object} gameState - The current game state
 * @param {Object} player - The player to get the visit type for
 * @param {string} spaceName - The name of the space to resolve
 * @param {string} explicitVisitType - Optional explicit visit type to override detection
 * @returns {Object|null} - The resolved space object or null if not found
 */
MoveLogicBase.prototype.resolveSpaceForVisitType = function(gameState, player, spaceName, explicitVisitType) {
  // Get normalized space name
  const normalizedName = gameState.extractSpaceName(spaceName);
  
  // Find all spaces with this name
  const matchingSpaces = gameState.spaces.filter(s => 
    gameState.extractSpaceName(s.name) === normalizedName);
  
  if (matchingSpaces.length === 0) {
    console.warn(`MoveLogicBase: No spaces found with name: ${normalizedName}`);
    return null;
  }
  
  // Determine visit type if not explicitly provided
  let visitType = explicitVisitType;
  if (!visitType) {
    const hasVisited = gameState.hasPlayerVisitedSpace(player, normalizedName);
    visitType = hasVisited ? 'subsequent' : 'first';
  }
  
  // Logging for debugging
  console.log(`MoveLogicBase: Resolving space for "${normalizedName}" with visit type: ${visitType}`);
  
  // Try to find the exact match first
  let resolvedSpace = matchingSpaces.find(s => 
    s.visitType && s.visitType.toLowerCase() === visitType.toLowerCase());
  
  // If not found, try the opposite visit type
  if (!resolvedSpace) {
    const oppositeType = visitType.toLowerCase() === 'first' ? 'subsequent' : 'first';
    console.log(`MoveLogicBase: Exact visit type match not found, trying ${oppositeType}`);
    resolvedSpace = matchingSpaces.find(s => 
      s.visitType && s.visitType.toLowerCase() === oppositeType.toLowerCase());
  }
  
  // If still not found, use the first available space
  if (!resolvedSpace && matchingSpaces.length > 0) {
    console.log(`MoveLogicBase: No visit type match found, using first available space`);
    resolvedSpace = matchingSpaces[0];
  }
  
  if (resolvedSpace) {
    console.log(`MoveLogicBase: Resolved space ID: ${resolvedSpace.id}, Visit Type: ${resolvedSpace.visitType}`);
  } else {
    console.warn(`MoveLogicBase: Failed to resolve any space for "${normalizedName}"`);
  }
  
  return resolvedSpace;
};
```

## Benefits

This improved visit type resolution system provides several benefits:

1. **More Reliable Gameplay**: Players will now consistently see the correct version of each space based on their visit history.

2. **Reduced Edge Cases**: The clear fallback hierarchy eliminates edge cases where players could get stuck due to missing visit types.

3. **Better Debugging**: Enhanced logging makes it easier to track and diagnose visit type issues.

4. **Consistent User Experience**: All spaces on the board will now follow the same visit type resolution rules.

5. **Improved Maintenance**: The centralized helper method makes it easier to update or extend visit type behavior in the future.

## Files Affected

The following files have been updated with the new visit type resolution system:

1. `js/utils/move-logic/MoveLogicBase.js` - Added the new helper method and updated existing methods to use it
2. `js/utils/move-logic/MoveLogicSpecialCases.js` - Updated special case handlers to use the new helper

## Testing Guidelines

When testing the improved visit type resolution:

1. Verify that spaces show the correct visit type content based on visit history
2. Test edge cases where a space may have only one visit type version available
3. Check movement between spaces with different visit types
4. Verify that special case spaces properly handle visit types
5. Confirm that debugging logs show the expected visit type resolution process

---

*Last Updated: May 2, 2025*