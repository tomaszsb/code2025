# PM-DECISION-CHECK "RETURN TO YOUR SPACE" Feature

## Overview

The "RETURN TO YOUR SPACE" feature allows players to maintain continuity in their game progression when they need to make a detour to the PM-DECISION-CHECK space. This feature enables players to address issues like getting more money or changing scope, then return to their original path without disrupting gameplay flow.

## How It Works

When a player visits the PM-DECISION-CHECK space, they have several options:
1. Get more money (LEND-SCOPE-CHECK)
2. Start design (ARCH-INITIATION)
3. Cheat to get ahead (CHEAT-BYPASS)
4. Return to your space (only on subsequent visits)

The "RETURN TO YOUR SPACE" option inherits the next move options from the space the player was on before they visited PM-DECISION-CHECK, allowing them to continue their journey on the main path.

## Implementation Details

### Side Quest Tracking

When a player first enters PM-DECISION-CHECK:
- The system stores the ID of the space they came from
- A side quest flag is set to track that they're on a detour
- The CHEAT-BYPASS flag is reset (giving a fresh start for each new side quest)

### Showing the "RETURN TO YOUR SPACE" Option

The option appears only when:
1. It's a subsequent visit to PM-DECISION-CHECK (not first visit)
2. There is a stored original space ID
3. The player is still on a side quest
4. The player hasn't used the CHEAT-BYPASS option

### Option Selection Behavior

When a player selects "RETURN TO YOUR SPACE":
1. The system retrieves the original space's next move options directly from the CSV data
2. These options are presented to the player
3. The player continues their journey as if they were still on the original space
4. The stored space information is cleared

### Real-World Consequences

If a player chooses the CHEAT-BYPASS option:
- The stored original space information is cleared
- The side quest flag is turned off
- A permanent "has used cheat" flag is set
- The "RETURN TO YOUR SPACE" option will no longer be available
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
- The "RETURN TO YOUR SPACE" option comes directly from the Spaces.csv file (Space 4 for PM-DECISION-CHECK subsequent visit)
- The move options inherited from the original space are also derived from the CSV data
- No hardcoded space names or logic are used

## Integration with Event System

The feature hooks into the GameStateManager event system:
- Registers for spaceChanged events
- Automatically detects when a player returns to the main path
- Ensures proper state cleanup without manual intervention

## Technical Notes

1. The implementation focuses on maintaining gameplay continuity while respecting real-world consequences
2. It uses the existing property storage system with fallbacks for different storage methods
3. Special space objects are created with flags to identify them as special move types
4. The feature is fully integrated with the existing move selection system

*Last Updated: May 4, 2025*