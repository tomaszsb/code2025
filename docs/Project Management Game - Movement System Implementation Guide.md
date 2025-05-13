# Project Management Game - Movement System Implementation Guide

This guide provides a step-by-step process for replacing the existing movement system with the new modular implementation. The new system offers improved maintainability, better PM-DECISION-CHECK handling, and enhanced protection against method overwrites.

## Table of Contents
1. [Create New Files](#step-1-create-new-files)
2. [Modify HTML](#step-2-modify-html-to-include-new-files)
3. [Update GameBoard Component](#step-3-update-gameboard-component)
4. [Test with Both Systems](#step-4-test-with-both-systems)
5. [Remove Old Files](#step-5-remove-old-files-staged-approach)
6. [Comprehensive Testing](#step-6-comprehensive-testing)
7. [Fallback Plan](#step-7-fallback-plan)
8. [Implementation Notes](#step-8-implementation-notes)
9. [Common Issues and Solutions](#step-9-common-issues-and-solutions)

## Step 1: Create New Files

1. Create a new directory for the movement system files:
   ```bash
   mkdir -p D:\Unravel\Current_Game\code2025\js\utils\movement
   ```

2. Create the following files in this directory:
   - `D:\Unravel\Current_Game\code2025\js\utils\movement\MovementCore.js`
   - `D:\Unravel\Current_Game\code2025\js\utils\movement\MovementLogic.js`
   - `D:\Unravel\Current_Game\code2025\js\utils\movement\MovementUIAdapter.js`
   - `D:\Unravel\Current_Game\code2025\js\utils\movement\MovementSystem.js`

3. Copy the contents from the provided files into their respective new files.

4. **IMPORTANT**: Ensure each file has proper logging statements at the beginning and end of the file:
   ```javascript
   console.log('MovementCore.js file is beginning to be used');
   
   // File contents here...
   
   console.log('MovementCore.js code execution finished');
   ```

## Step 2: Modify HTML to Include New Files

1. Locate your main HTML file (typically `index.html` in the project root).

2. Find the script tags section where the old movement logic files are included.

3. **Before removing old files**, add the new script tags in the correct order:
   ```html
   <!-- Add these lines after your existing GameStateManager but before components -->
   <script type="text/babel" src="js/utils/movement/MovementCore.js"></script>
   <script type="text/babel" src="js/utils/movement/MovementLogic.js"></script>
   <script type="text/babel" src="js/utils/movement/MovementUIAdapter.js"></script>
   <script type="text/babel" src="js/utils/movement/MovementSystem.js"></script>
   ```

4. Ensure these scripts are included after the GameStateManager but before any components that use movement functionality.

## Step 3: Update GameBoard Component

1. Locate your GameBoard component implementation.

2. Add the following code to the `componentDidMount` method:
   ```javascript
   componentDidMount() {
     // Existing code...
     
     // Connect to movement system
     if (window.GameStateManager && window.GameStateManager.connectGameBoard) {
       console.log("GameBoard: Connecting to new movement system...");
       window.GameStateManager.connectGameBoard(this);
       console.log("GameBoard: Successfully connected to movement system");
     } else {
       console.log("GameBoard: New movement system not detected, using legacy movement");
     }
   }
   ```

## Step 4: Test with Both Systems

1. Before removing the old files, run the game with both systems in place.
2. Check the console for any initialization errors.
3. Test basic movement to ensure the new system is working correctly.
4. Verify that the new system's console logs appear in the expected sequence.
5. Confirm that PM-DECISION-CHECK space functions properly with the new system.

## Step 5: Remove Old Files (Staged Approach)

Once you've confirmed the new system is working, remove the old files in stages:

1. First, comment out (don't delete yet) the old script inclusions in your HTML:
   ```html
   <!-- Commented out old movement system
   <script src="js/utils/move-logic/MoveLogicUIUpdates.js"></script>
   <script src="js/utils/move-logic/MoveLogicBase.js"></script>
   <script src="js/utils/move-logic/MoveLogicSpecialCases.js"></script>
   <script src="js/utils/move-logic/MoveLogicPmDecisionCheck.js"></script>
   <script src="js/utils/move-logic/MoveLogicManager.js"></script>
   -->
   ```

2. Test the game again to ensure everything still works without the old files.

3. After confirming functionality, fully remove the script tags and delete the old files:
   ```bash
   # Remove old directories and files
   rm -r D:\Unravel\Current_Game\code2025\js\utils\move-logic
   rm D:\Unravel\Current_Game\code2025\js\utils\MoveLogic.js
   rm D:\Unravel\Current_Game\code2025\js\utils\MoveLogicManager.js
   ```

## Step 6: Comprehensive Testing

After implementation, test the following scenarios:

### Basic Movement
- Player can move to standard spaces
- Visit type (first vs. subsequent) is correctly determined
- Moving between different space types works correctly

### PM-DECISION-CHECK Functionality
- Test entering PM-DECISION-CHECK from main path
- Verify original path moves are available on subsequent visits
- Test CHEAT-BYPASS functionality and confirm it works as one-way
- Confirm that main path moves are visually distinguished

### Dice Roll Handling
- Verify dice roll outcomes are correctly processed
- Test different outcome types (move, card, fee, time)
- Confirm that the UI updates appropriately based on roll results

### Turn Management
- Ensure movement state persists properly between turns
- Test turn changes with players on different space types
- Verify player position history is maintained across turns

### UI Functionality
- Verify visual indicators for available moves
- Check for proper styling of selected moves
- Test animations and visual feedback for movement

## Step 7: Fallback Plan

If issues arise after removing the old system:

1. Keep a backup of the old files before deletion (or ensure they're in version control)
2. Create a quick rollback branch in your version control system:
   ```bash
   git checkout -b movement-rollback
   git add .
   git commit -m "Save current state before movement system rollback"
   git checkout main
   ```
3. Prepare a fallback HTML file (e.g., `index-old-movement.html`) that uses the old system in case of critical issues

## Step 8: Implementation Notes

### Critical Changes Made During Implementation

1. **MovementSystem.js Initialization**:
   - **CRITICAL**: The original implementation used a `DOMContentLoaded` event listener which caused timing issues
   - Changed to use an immediately invoked function expression (IIFE) for instantaneous initialization:
   ```javascript
   // Immediate initialization without waiting for DOMContentLoaded
   (function initializeMovementSystem() {
     // Initialization code...
   })();
   ```

2. **Robust Error Handling**:
   - Added try/catch blocks around all critical methods
   - Added extensive safety checks before using any movement components
   - Example:
   ```javascript
   try {
     // Safety check for movementLogic
     if (!this.movementLogic) {
       console.error('GameStateManager: movementLogic not available for getAvailableMoves');
       return [];
     }
     
     // Use movement logic to get available moves
     return this.movementLogic.getAvailableMoves(targetPlayer);
   } catch (error) {
     console.error('GameStateManager: Error in getAvailableMoves:', error);
     // Return empty array to prevent UI errors
     return [];
   }
   ```

3. **Dice Roll Data Loading**:
   - Added multiple fallback mechanisms for loading dice roll data:
   ```javascript
   // Method 1: Check if the CSV parser is available
   if (typeof window.csvParser !== 'undefined' && window.csvParser.loadCSV) {
     // Try to use csvParser...
   }
   
   // Method 2: Use fetch API as a fallback
   fetch('data/DiceRoll Info.csv')
     .then(response => response.text())
     .then(csvText => {
       // Parse CSV...
     });
   ```

4. **GameStateManager Integration**:
   - Used `Object.defineProperty` to protect critical methods from being overwritten
   - Added explicit event dispatching to signal successful initialization

## Step 9: Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "Cannot read properties of undefined (reading 'getAvailableMoves')" | The movement system is not properly initialized or attached to GameStateManager. Check that MovementSystem.js is properly loading and initializing the components. |
| Console errors about missing methods | Check that files are loaded in the correct order. MovementCore.js must be loaded before MovementLogic.js, etc. |
| Movement not working | Check if GameBoard was connected via `connectGameBoard`. Look for "Successfully connected to movement system" in the console. |
| Game freezes after movement | Check for any infinite event loops in event handlers. Review the MovementUIAdapter.js handler code. |
| Dice roll not working | Verify that DiceRoll Info.csv is properly loaded. Add console.log to check if diceRollData is populated. |
| PM-DECISION-CHECK issues | Check that MovementLogic.js properly implements getMovesForPMDecisionCheck and add debugging console.logs. |
| Error "movementCore not available" | Check initialization order. MovementCore.js must be loaded first and the initialization in MovementSystem.js must complete successfully. |

---

If you encounter persistent issues during implementation, check the browser console for detailed error messages from the movement system's initialization sequence. The most common issues relate to file loading order and initialization timing.

*Last Updated: May 13, 2025*
