# MoveLogicPmDecisionCheck Component

## Overview

The MoveLogicPmDecisionCheck component provides specialized handling for the PM-DECISION-CHECK space in the Project Management Game. It implements the "side quest" pattern that allows players to temporarily deviate from their main path and later return to continue their original journey.

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

## Integration with Other Components

MoveLogicPmDecisionCheck integrates with:

1. **MoveLogicSpecialCases** - Attaches methods to handle the PM-DECISION-CHECK space
2. **GameStateManager** - Listens for state changes to modify available moves
3. **MoveLogicManager** - Provides verification of method availability

## Side Quest Pattern

The component implements the side quest pattern which:

1. Stores the player's original path when they first enter the PM-DECISION-CHECK space
2. Presents options for temporary "side quests" (get more money, change scope, etc.)
3. On subsequent visits, shows moves from the original space to let players return
4. Cleans up tracking data when players either return to their original path or choose the CHEAT-BYPASS option

## Implementation Guidelines

When implementing similar patterns in other components:

1. **Use Property Descriptors for Critical Methods**
   ```javascript
   Object.defineProperty(targetObject, methodName, {
     configurable: true,
     get: function() { return originalMethod; },
     set: function(newValue) {
       // Validation logic
       originalMethod = newValue;
     }
   });
   ```

2. **Implement Deferred Registration with MutationObserver**
   ```javascript
   const observer = new MutationObserver(function(mutations) {
     if (window.RequiredDependency && !state.registered) {
       registerHandlers();
       observer.disconnect();
     }
   });
   observer.observe(document.body, { childList: true, subtree: true });
   ```

3. **Track All Resources for Cleanup**
   ```javascript
   window.addEventListener('beforeunload', function() {
     // Clean up observers
     if (state.observer) state.observer.disconnect();
     
     // Remove event listeners
     Object.entries(state.eventHandlers).forEach(([eventName, handler]) => {
       window.SomeManager.removeEventListener(eventName, handler);
     });
   });
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

*Last Updated: May 9, 2025*