Changelog

All notable changes to the Project Management Game will be documented in this file.

[2025-05-09]

Fixed

Implemented guaranteed method attachment with protection against overwrites in MoveLogicPmDecisionCheck.js.

Added innovative method overwrite protection with property descriptors for critical methods.

Implemented self-healing GameStateManager detection and deferred event registration.

Added comprehensive cleanup handlers for better resource management and memory usage.

[2025-05-08 - Afternoon Update]

Fixed

Implemented direct getAvailableMoves method in MoveLogicBackwardCompatibility.js to resolve TypeError when getting available moves.

Replaced non-existent manager method call with data-driven implementation using CSV-based space data.

Improved special case handling by properly integrating with MoveLogicManager's special case detection.

[2025-05-09]

Fixed

Resolved critical initialization issue in MoveLogicManager.js with GameStateManager tracking and robust dependency detection.

Added retries and improved cleanup for event listeners.

Dispatched MoveLogicManagerInitialized event for cross-module communication.

[2025-05-08]

Fixed

Fully refactored initialization logic across MoveLogicManager.js, MoveLogicSpecialCases.js, and MoveLogicPmDecisionCheck.js.

Replaced emergency fixes with structured, event-based dependency management.

Enhanced logging, added explicit flags, and improved cleanup.

Changed

Refactored initialization process to follow strict dependency management.

Improved code organization and cleanup of redundant logic.

[2025-05-07]

Fixed

Removed MoveLogicDirectFix.js, merged its logic into MoveLogicPmDecisionCheck.js.

Eliminated race conditions and retry loops.

Improved deterministic initialization with clearer error handling.

[2025-05-06]

Fixed

Corrected file paths for SpaceInfoUtils.js and enhanced error handling.

Enhanced PM-DECISION-CHECK behavior to show original space moves in the Available Moves section.

[2025-05-05]

Fixed

Improved "RETURN TO YOUR SPACE" button logic and UI interaction.

[2025-05-04]

Added

Implemented "RETURN TO YOUR SPACE" feature for PM-DECISION-CHECK spaces.

Added side quest tracking system to maintain original path.

Added CHEAT-BYPASS option with real-world consequences.

Changed

Refactored MoveLogicBase.js to a fully data-driven approach using CSV data.

Deprecated hardcoded special case logic in favor of DiceRollLogic-based decision making.

[2025-05-01 to 2025-05-03]

Fixed

Improved dice roll systems to fully rely on CSV data for logic (eliminated hardcoded exceptions).

Enhanced TurnManager.js to handle move selections and edge cases.

Fixed MoveLogicSpecialCases.js inheritance and module loading sequence.

[2025-04-30]

Fixed

Improved card effects to properly affect game state and dispatch events.

Enhanced UI updates, time costs, and special space integration.

[1.2.0] - 2025-04-20

Added

Space Explorer performance tracking, card limit system, and visual indicators.

Changed

Refactored SpaceExplorerLogger to follow manager pattern.

Fixed

Layout and event listener cleanup.

[1.1.0] - 2025-03-15

Added

GameStateManager event system, space lookup caching.

Changed

Converted GameState to class-based manager.

Fixed

Memory leaks and improved state management.

[1.0.0] - 2025-02-01

Added

Core movement system, dice rolling, card functionality, turn management.

Game state persistence.

Changed

Enhanced board space connectivity.

Fixed

Layout bugs and card handling improvements.

Note:

For detailed upcoming plans and architectural goals, refer to DEVELOPMENT_GUIDE.md which tracks priorities, roadmap milestones, and best practices.

