# PM-DECISION-CHECK Original Space Moves Feature

## Overview

The PM-DECISION-CHECK space feature allows players to maintain continuity in their game progression when they need to make a detour. This feature enables players to address issues like getting more money or changing scope, then return to their original path without disrupting gameplay flow.

## How It Works

When a player visits the PM-DECISION-CHECK space, they have several options:
1. Get more money (LEND-SCOPE-CHECK)
2. Start design (ARCH-INITIATION)
3. Cheat to get ahead (CHEAT-BYPASS)
4. Original space moves (only on subsequent visits)

On subsequent visits, the available moves directly include the options from the player's original space. These moves are displayed with clear labels indicating which space they originated from, allowing players to continue their journey on the main path.

## Implementation Details

### Side Quest Tracking

When a player first enters PM-DECISION-CHECK:
- The system stores the ID of the space they came from
- A side quest flag is set to track that they're on a detour
- The CHEAT-BYPASS flag is reset (giving a fresh start for each new side quest)

### Showing Original Space Moves

The original space moves appear only when:
1. It's a subsequent visit to PM-DECISION-CHECK (not first visit)
2. There is a stored original space ID
3. The player is still on a side quest
4. The player hasn't used the CHEAT-BYPASS option

### Move Selection Behavior

When a player selects one of the original space moves:
1. The system processes the selection as if the player were on their original space
2. The player continues their journey as if they were still on the original space
3. The stored space information is cleared
4. The moves are clearly labeled with their origin space for better user understanding

### Real-World Consequences

If a player chooses the CHEAT-BYPASS option:
- The stored original space information is cleared
- The side quest flag is turned off
- A permanent "has used cheat" flag is set
- The original space moves will no longer be available
- This represents the real-world concept that once you take shortcuts/bribes, you can't undo those decisions

### Automatic Cleanup

If a player naturally returns to the main path after a PM-DECISION-CHECK detour:
- The system automatically detects this through space change events
- The side quest state is cleared
- This ensures the game state remains clean and consistent

## Side Quest Pattern

The feature is designed to support multiple consecutive side quests:
- Players can go from PM-DECISION-CHECK to get money
- Then return to PM-DECISION-CHECK again
- Then go to change scope
- Finally use "RETURN TO YOUR SPACE" after multiple detours
- The original space information persists across these multiple PM-DECISION-CHECK visits

## CSV-Driven Implementation

The entire implementation is data-driven based on the CSV data:
- The original space moves are derived directly from the CSV data of the player's previous space
- The moves are processed during subsequent visits to PM-DECISION-CHECK
- Each move is labeled with its origin space for clarity
- No hardcoded space names or logic are used

## Integration with Event System

The feature hooks into the GameStateManager event system:
- Registers for spaceChanged events
- Automatically detects when a player returns to the main path
- Ensures proper state cleanup without manual intervention

## Technical Notes

1. The implementation focuses on maintaining gameplay continuity while respecting real-world consequences
2. It uses the existing property storage system with fallbacks for different storage methods
3. Special space objects are created with flags (fromOriginalSpace and originalSpaceName) to identify them 
4. The feature is fully integrated with the existing move selection system
5. Original space moves appear directly in the Available Moves section, not as a separate button
6. The interface is more intuitive as all move options are consolidated in one section
7. Additional detection logic ensures that even if a move isn't initially recognized as an original space move during selection, it will be properly identified and processed as such

## Recent Improvements (May 6-7, 2025)

1. Removed the separate "RETURN TO YOUR SPACE" button from the Special Move section
2. Added original space moves directly to the Available Moves section with clear labels
3. Enhanced move selection handling to ensure original space moves are properly processed
4. Added robust detection to identify when selected moves should be treated as moves from the original space
5. Improved visual cues to help players distinguish original space moves in the Available Moves section

## Technical Improvements (May 7, 2025)

1. Refactored the initialization system to follow closed system principles
2. Eliminated complex retry logic that was causing inconsistent behavior
3. Implemented deterministic, single-pass initialization with clear error reporting
4. Added immediate verification to confirm proper method attachment
5. Improved dependency structure checking for more reliable operation
6. Enhanced error messages to provide actionable feedback when dependencies aren't properly initialized
7. Streamlined the module's internal operation to reduce complexity
8. Consolidated all PM-DECISION-CHECK handling in a single, well-structured module

*Last Updated: May 7, 2025*