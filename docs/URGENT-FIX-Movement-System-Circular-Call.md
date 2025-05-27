# URGENT FIX: Movement System Circular Call Issue

## Problem
The game shows only 3 available moves instead of 5 at PM-DECISION-CHECK space, missing OWNER-DECISION-REVIEW and ENG-INITIATION moves.

## Root Cause: Circular Call Chain
1. **Old GameStateManager.js line 417** has `getAvailableMoves()` method that calls `window.MoveLogic.getAvailableMoves()`
2. **MoveLogic.js line 10** (compatibility layer) tries to forward back to `gameState.getAvailableMoves()` 
3. **This creates infinite circular calls** that never reach the new MovementSystem implementation
4. **New MovementSystem.js line 107** extends GameStateManager with correct method but old method takes precedence

## Call Chain Analysis
```
GameBoard 
→ SpaceSelectionManager.updateAvailableMoves() 
→ GameStateManager.getAvailableMoves() [OLD METHOD]
→ window.MoveLogic.getAvailableMoves() 
→ gameState.getAvailableMoves() [CIRCULAR CALL]
→ Never reaches new MovementSystem logic
```

## Files Requiring Changes
1. **D:\Unravel\Current_Game\code2025\js\data\GameStateManager.js** - Remove old getAvailableMoves method (line 417)
2. **D:\Unravel\Current_Game\code2025\js\utils\MoveLogic.js** - Remove circular compatibility layer
3. **D:\Unravel\Current_Game\code2025\js\utils\movement\MovementSystem.js** - Ensure new method properly overrides

## Expected Outcome
- PM-DECISION-CHECK space will show all 5 moves: LEND-SCOPE-CHECK, ARCH-INITIATION, CHEAT-BYPASS, OWNER-DECISION-REVIEW, ENG-INITIATION
- New MovementSystem will be properly used
- Debug logging from MovementLogic.js will appear in console

## Priority: CRITICAL
This prevents the game from working correctly as players cannot access all intended moves.
