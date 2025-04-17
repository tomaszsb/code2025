# NegotiationManager Documentation

## Overview

The `NegotiationManager` component is responsible for handling the negotiation mechanics in the game. Negotiation is a key gameplay feature that allows players to stay on the same space and try again on their next turn, rather than being forced to move to a new space. This document outlines the component's functionality, usage, and recent improvements.

## Component Responsibilities

- Determine if negotiation is allowed for a specific game space
- Handle the negotiation action when initiated by a player
- Provide tooltip text explaining negotiation functionality
- Update the player's time resource when negotiation occurs
- Reset UI states such as used buttons when negotiation occurs

## Class Methods

### constructor(gameBoard)
Initializes the NegotiationManager with a reference to the GameBoard component.

**Parameters:**
- `gameBoard`: Reference to the parent GameBoard component

### isNegotiationAllowed()
Checks if negotiation is allowed for the current space the player is on.

**Returns:**
- `boolean`: True if negotiation is allowed, false otherwise

**Implementation details:**
- Retrieves the current player from the game board
- Gets the current space the player is on
- Checks if negotiation is allowed based on the space's properties
- Uses both `rawNegotiate` and `Negotiate` properties for backward compatibility
- Logs detailed information about the negotiation permission check

### handleNegotiate()
Processes the negotiation action when a player clicks the negotiate button.

**Implementation details:**
- Verifies negotiation is allowed for the current space
- Gets the current player and space
- Applies any time penalty from the space to the player
- Moves to the next player's turn while keeping the current player on the same space
- Updates the game board state
- Dispatches a custom event to reset SpaceInfo button states
- Logs the completion of the negotiation action

### getNegotiateButtonTooltip()
Provides tooltip text for the negotiate button based on whether negotiation is allowed.

**Returns:**
- `string`: Tooltip text explaining the negotiate button functionality

## Integration with GameBoard

The NegotiationManager is initialized by the GameBoard component during its construction:

```javascript
// In GameBoard.js constructor
this.negotiationManager = new window.NegotiationManager(this);
```

## Usage Example

```javascript
// Get negotiate button tooltip
const tooltip = gameBoard.negotiationManager.getNegotiateButtonTooltip();

// Check if negotiation is allowed
const canNegotiate = gameBoard.negotiationManager.isNegotiationAllowed();

// Handle negotiate button click
gameBoard.negotiationManager.handleNegotiate();
```

## Integration with SpaceInfo

The NegotiationManager communicates with SpaceInfo components through a custom event system:

1. When negotiation happens, NegotiationManager dispatches a `resetSpaceInfoButtons` event
2. SpaceInfo components listen for this event and reset their button states when it's received
3. This ensures all card draw buttons are re-enabled after negotiation

```javascript
// In NegotiationManager.js
const resetEvent = new CustomEvent('resetSpaceInfoButtons');
window.dispatchEvent(resetEvent);

// In SpaceInfo.js
window.addEventListener('resetSpaceInfoButtons', this.handleResetButtons);
```

## Recent Improvements

### 1. Enhanced Negotiation Permission Checking
- Improved comments explaining the dual property check system (`rawNegotiate` and `Negotiate`)
- Enhanced logging to display both property values for easier debugging
- Maintained backward compatibility by keeping both property checks

### 2. Clarified State Update Comments
- Replaced ambiguous comment "Only update in one place, not both" with clearer explanation
- Added context about why the player's time resource should only be modified in one location

### 3. Added Event-Based UI State Reset
- Added a custom event system to reset SpaceInfo button states
- Ensured card draw buttons are properly re-enabled after negotiation
- Fixed issue where dice roll outcome buttons remained disabled after negotiation

### 4. Improved Logging
- Added completion log statement at the end of the `handleNegotiate` function
- Added method-level logging at the beginning of each method
- Enhanced existing logs with more detailed information
- Added logging for the new event-based reset system

## Best Practices for Future Development

1. **Negotiation Property Standardization**:
   - Future data processing should ensure that both `rawNegotiate` and `Negotiate` properties are synchronized
   - Consider standardizing on a single property in future versions

2. **Refactoring Recommendations**:
   - Consider creating a dedicated GameManager component for game-wide operations
   - Use the event system for other cross-component communications

3. **Logging Patterns**:
   - Maintain the established pattern of logging method entry points
   - Log all property values that contribute to decision-making
   - Include completion logs for all major operations

## Game Design Notes

The negotiation mechanic is an important gameplay element that offers players strategic choices:

1. Players can choose to stay on the same space by negotiating, giving them another chance to succeed on that space
2. This decision comes with a time penalty, forcing players to balance the benefits of staying against the cost
3. The mechanic introduces risk-reward decision points throughout gameplay

---

*Last Updated: April 16, 2025*
