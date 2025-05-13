# MoveLogicPmDecisionCheck Component

## Overview

The MoveLogicPmDecisionCheck component provides specialized handling for the PM-DECISION-CHECK space in the Project Management Game. It implements the "side quest" pattern that allows players to temporarily deviate from their main path and later return to continue their original journey.

## Tracking System

The component implements a streamlined tracking approach:

1. **Main Path Visits**: Uses the standard game visitType system
   - Leverages the built-in 'first'/'subsequent' visit tracking
   - No separate mainPathVisitStatus property is maintained
   - Relies on GameStateManager's hasPlayerVisitedSpace functionality

2. **Quest Side Visits**: Uses "Maiden" and "Return" status
   - Tracks when players enter PM-DECISION-CHECK from a quest side space
   - "Maiden" status indicates first visit from a quest side
   - "Return" status indicates player has visited before from a quest side

This approach eliminates redundancy by using the standard game system for main path tracking while maintaining specialized tracking only for quest side visits.

## Closed System Implementation

The component follows a robust closed system approach with the following key features:

### Method Attachment Protection

- Uses JavaScript property descriptors to prevent accidental method overwrites
- Implements self-healing capabilities to restore methods if they get removed
- Maintains method references in a diagnostic object for verification

### Guaranteed Event Registration

- Uses MutationObserver to detect when GameStateManager becomes available
- Implements deferred event listener registration for proper sequencing
- Maintains references to all event handlers for proper cleanup

### Resource Management

- Implements comprehensive cleanup on page unload
- Disconnects observers when no longer needed
- Removes all event listeners to prevent memory leaks

## Property Persistence System

The component implements a property storage system that adheres to closed system principles:

### Standard Storage Location

- Uses the standard `player.properties` object for all property storage
- Maintains consistency with the rest of the game systems
- Follows the game's established property storage pattern

### Enhanced Player Snapshot Handling

- Modifies the player snapshot creation process to ensure properties are properly copied
- Ensures critical properties like 'originalSpaceId' survive player transitions
- Uses no fallback mechanisms, adhering to closed system principles

### Storage Verification

- Verifies all data storage operations immediately after storing
- Provides detailed logging for troubleshooting
- Conforms to single source of truth principle

## Integration with Other Components

MoveLogicPmDecisionCheck integrates with:

1. **MoveLogicSpecialCases** - Attaches methods to handle the PM-DECISION-CHECK space
2. **GameStateManager** - Listens for state changes to modify available moves
3. **MoveLogicManager** - Provides verification of method availability

## Side Quest Pattern

The component implements the side quest pattern which:

1. Stores the player's original path when they first enter the PM-DECISION-CHECK space
2. Presents options for temporary "side quests" (get more money, change scope, etc.)
3. On subsequent visits (using standard visitType or quest side status: "Return"), shows moves from the original space to let players return
4. Cleans up tracking data when players either return to their original path or choose the CHEAT-BYPASS option

## Entry Detection Logic

The component intelligently detects player entry source:

1. **From Main Path**: Uses standard game visitType (first/subsequent)
   - When a player enters from the main game path
   - Determined by checking previous space against known quest spaces
   - Original space is stored on first visit
   - Relies on standard game tracking for visit type

2. **From Quest Side**: Updates `questSideVisitStatus` (Maiden → Return)
   - When a player enters from a quest side space
   - Determined by checking if previous space is in a list of known quest spaces
   - Does not affect the standard game visitType system

3. **Fallback Logic**: When entry source cannot be determined
   - Uses the space's visitType property as a fallback mechanism
   - Updates quest side tracking system if necessary

## Refactored Implementation

The implementation has been refactored to follow the Single Responsibility Principle with the following benefits:

1. **Separated Functions with Clear Responsibilities**
   - Each function has a clear, specific purpose
   - Easier to understand and maintain
   - Eliminates redundant code
   - Improves testing capabilities

2. **Main Components**:
   - `handlePmDecisionCheck`: Main entry point that orchestrates the process
   - `determineEntrySource`: Determines if player entered from main path or quest side
   - `storeOriginalSpaceInfo`: Specifically handles visit space storage with enhanced reliability
   - `verifyPropertyWasStored`: Verifies that properties are correctly stored
   - `getPlayerGameProperty`: Enhanced retrieval with multiple fallback mechanisms
   - `getAvailableMovesForPmDecisionCheck`: Calculates available moves
   - `getStandardPmDecisionMoves`: Gets moves from the PM-DECISION-CHECK space
   - `addOriginalSpaceMoves`: Adds moves from the original space
   - `resolveSpace`: Helper function to resolve space names to objects
   - `handlePmDecisionMoveSelection`: Processes move selection

3. **Simplified Flow of Execution**
   - Clear separation between standard visitType and quest side visit logic
   - Deterministic behavior with reduced complexity
   - Streamlined tracking using standard game system where possible
   - Easier to follow the code flow
   - Better encapsulation of functionality

## Implementation Guidelines

When implementing similar patterns in other components:

1. **Use Standard Game Systems When Possible**
   ```javascript
   // Use the standard visitType for main path tracking
   const visitType = currentSpace.visitType || 'First';
   
   // Only maintain separate tracking for specialized needs
   const questSideVisitStatus = getPlayerGameProperty(gameState, player, 'questSideVisitStatus') || 'Maiden';
   
   // Update only the quest side tracking when needed
   if (entrySource === 'questSide' && questSideVisitStatus === 'Maiden') {
     setPlayerGameProperty(gameState, player, 'questSideVisitStatus', 'Return');
   }
   ```

2. **Follow Standard Property Storage Pattern**
   ```javascript
   // Store properties only in player.properties - the standard game pattern
   function setPlayerGameProperty(gameState, player, propertyName, value) {
     // Ensure properties object exists
     if (!player.properties) {
       player.properties = {};
     }
     
     // Store in player.properties
     player.properties[propertyName] = value;
     
     // Verify storage succeeded
     return player.properties[propertyName] === value;
   }
   
   // Retrieve properties only from player.properties
   function getPlayerGameProperty(gameState, player, propertyName) {
     if (player.properties && player.properties[propertyName] !== undefined) {
       return player.properties[propertyName];
     }
     
     return null;
   }
   ```

   > **Note:** The standard property storage pattern shown above is the approved approach
   > to be used across all components. This approach adheres to closed system principles
   > by using a single, consistent storage mechanism without fallbacks.
   > All components should use this approach for consistency.

3. **Implement Player Snapshot Enhancement**
   ```javascript
   function enhancePlayerSnapshot() {
     // Save reference to original snapshot function
     const originalCreateSnapshot = window.TurnManager.createPlayerSnapshot;
     
     // Replace with enhanced version that properly copies properties
     window.TurnManager.createPlayerSnapshot = function(player) {
       // Call original function
       const snapshot = originalCreateSnapshot.call(this, player);
       
       // Ensure properties are properly copied
       if (player.properties) {
         snapshot.properties = JSON.parse(JSON.stringify(player.properties));
       }
       
       return snapshot;
     };
   }
   ```

4. **Follow Single Responsibility Principle**
   ```javascript
   // Instead of one large function:
   function doEverything(a, b, c) {
     // 100 lines of mixed logic
   }
   
   // Break into focused functions:
   function processInput(a) { /* focused logic */ }
   function calculateResult(b) { /* focused logic */ }
   function formatOutput(c) { /* focused logic */ }
   function doEverything(a, b, c) {
     const processed = processInput(a);
     const result = calculateResult(b);
     return formatOutput(c);
   }
   ```

## Troubleshooting

If you encounter message channel closure errors like:
```
Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
```

These are non-critical warnings related to event handling. The component is designed to function correctly despite these messages. To fix them, ensure event handlers don't return `true` for asynchronous operations unless you're properly resolving the associated promise.

## History

- **May 4, 2025**: Original implementation with "RETURN TO YOUR SPACE" button
- **May 6, 2025**: Enhanced to display original space moves directly in Available Moves
- **May 7, 2025**: Merged with MoveLogicDirectFix.js and refactored for closed system
- **May 9, 2025**: Added method protection and self-healing capabilities
- **May 10, 2025**: Refactored into separated functions with clear responsibilities for improved maintainability
- **May 10, 2025**: Standardized property storage in MoveLogicSpecialCases.js to match simplified approach
- **May 12, 2025**: Enhanced data persistence with multi-layered storage, verification, and recovery systems
- **May 13, 2025**: Implemented distinct visit tracking systems with separate terminology for main path (Initial/Subsequent) and quest side (Maiden/Return) visits
- **May 14, 2025**: Eliminated redundant mainPathVisitStatus tracking and simplified to use standard game visitType for main path visits, creating a clear separation between standard game tracking and quest side tracking
- **May 14, 2025**: Deprecated multi-layered storage approach in favor of simplified player.properties storage
- **May 15, 2025**: Enhanced player snapshot handling to ensure properties survive turn transitions while maintaining closed system principles

*Last Updated: May 15, 2025*