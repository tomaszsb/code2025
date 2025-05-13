Changelog

All notable changes to the Project Management Game will be documented in this file.

[2025-05-16]

Added

Implemented new modular movement system with separate components (MovementCore.js, MovementLogic.js, MovementUIAdapter.js, MovementSystem.js).

Added extensive error handling and safety checks throughout the movement system.

Added TurnManager integration for proper movement state persistence.

Added multiple fallback mechanisms for loading dice roll data.

Fixed

Fixed critical initialization issue in MovementSystem.js by using immediate execution instead of waiting for DOMContentLoaded.

Fixed PM-DECISION-CHECK return functionality to properly show main path moves.

Fixed "Cannot read properties of undefined (reading 'getAvailableMoves')" error by adding safety checks.

Changed

Renamed movement system files to PascalCase for consistency with implementation guide.

Enhanced error reporting to make initialization dependencies clearer.

Updated documentation in Project Management Game - Movement System Implementation Guide.md with detailed implementation notes.

[2025-05-15]

Fixed

Fixed PM-DECISION-CHECK space behavior with a UI-based solution in SpaceInfoMoves.js.

Implemented visit-type aware "Return to Main Path" button that only appears for subsequent visits to PM-DECISION-CHECK.

Added intelligent return space detection to ensure players return to the correct original space.

Implemented proper handling of the CHEAT-BYPASS point-of-no-return case.

Improved logging and added clear debug information to assist with future enhancements.

Simplified the approach by focusing on the UI component rather than complex move logic handlers.

Utilized mixin architecture to implement the fix in the most direct way possible.

[2025-05-10 - Evening Update]

In Progress

Investigating PM-DECISION-CHECK move issue - players don't see moves from their original space when landing on PM-DECISION-CHECK.

Analyzed MoveLogicPmDecisionCheck.js and MoveLogicSpecialCases.js to identify interaction issues.

Attempted multiple approaches to fix originalSpaceId tracking and move additions.

Created comprehensive documentation in PM_DECISION_CHECK_ISSUE.md for ongoing resolution work.

[2025-05-10 - Afternoon Update]

Fixed

Standardized property storage in MoveLogicSpecialCases.js to align with simplified approach used in MoveLogicPmDecisionCheck.js.

Updated property setting and retrieval methods to only use player.properties for storage.

Removed multi-layered storage in MoveLogicSpecialCases.js to eliminate inconsistencies with other components.

Enhanced consistency throughout the move logic system by following closed system principles.

Refactored handleSpaceChangedEvent to use the simplified property access methods.

[2025-05-14]

Fixed

Removed redundant mainPathVisitStatus tracking in MoveLogicPmDecisionCheck.js.

Simplified tracking by using standard game visitType for main path tracking.

Improved reliability and reduced potential for inconsistent states.

Streamlined original space move handling with clearer decision logic.

Created clear separation between main path and side quest tracking.

Enhanced tracking system to ensure compatibility with future updates.

Reduced code size and complexity by removing duplicate tracking features.

Updated MoveLogicPmDecisionCheck.md documentation to reflect the streamlined tracking system.

Simplified property storage in MoveLogicPmDecisionCheck.js to use a single consistent method (player.properties).

Eliminated redundant multi-layered storage to improve code maintainability and reliability.

[2025-05-13]

Fixed

Implemented distinct visit tracking systems for PM-DECISION-CHECK with separate terminology.

Updated terminology to "Initial/Subsequent" for Main Path tracking and "Maiden/Return" for Quest Side tracking.

Added intelligent entry source detection to properly track visits from different game paths.

Eliminated confusion between the two tracking systems to improve maintainability.

Enhanced documentation with clear explanations of the updated tracking terminology.

[2025-05-12]

Fixed

Enhanced MoveLogicPmDecisionCheck.js originalSpaceId storage with multi-layered redundancy to ensure persistence.

Implemented robust property verification and recovery systems for critical game data.

Added comprehensive storage validation to detect and recover from storage failures.

Enhanced player data persistence with multiple backup mechanisms to prevent loss of side quest information.

Fixed missing original space moves during subsequent PM-DECISION-CHECK visits by improving data persistence reliability.

[2025-05-10]

Fixed

Refactored MoveLogicPmDecisionCheck.js with clear Single Responsibility Principle approach.

Implemented separated functions with clear responsibilities for improved maintainability.

Eliminated redundant code and improved overall flow with streamlined logic.

Enhanced code maintainability by applying single responsibility to each function in PM-DECISION-CHECK handling.

Improved testability with smaller, focused functions that have clear inputs and outputs.

[2025-05-09]

Fixed

Fixed SpaceExplorer.js infinite re-rendering loop issue by implementing processing flags, asynchronous execution, and state comparison checks.

Improved SpaceExplorer performance with optimized componentDidUpdate logic and prevention of redundant setState calls.

Reduced memory consumption and improved render times by breaking synchronous state update cycles and implementing data-driven updates.

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