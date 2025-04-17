# NegotiationManager Documentation

## Overview

The `NegotiationManager` component is responsible for handling the negotiation mechanics in the game. Negotiation is a key gameplay feature that allows players to stay on the same space and try again on their next turn, rather than being forced to move to a new space. This document outlines the component's functionality, usage, and recent improvements.

## Component Responsibilities

- Determine if negotiation is allowed for a specific game space
- Handle the negotiation action when initiated by a player
- Provide tooltip text explaining negotiation functionality
- Update the player's time resource when negotiation occurs

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
- Logs the completion of the negotiation action

### getNegotiateButtonTooltip()
Provides tooltip text for the negotiate button based on whether negotiation is allowed.

**Returns:**
- `string`: Tooltip text explaining the negotiate button functionality

### resetGame()
Resets the game state and reloads the page.

**Note:**
- This method is marked for future refactoring as it does not strictly belong in the NegotiationManager
- Currently maintained for backward compatibility

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

## Recent Improvements

### 1. Enhanced Negotiation Permission Checking
- Improved comments explaining the dual property check system (`rawNegotiate` and `Negotiate`)
- Enhanced logging to display both property values for easier debugging
- Maintained backward compatibility by keeping both property checks

### 2. Clarified State Update Comments
- Replaced ambiguous comment "Only update in one place, not both" with clearer explanation
- Added context about why the player's time resource should only be modified in one location

### 3. Addressed Single Responsibility Principle Violation
- Added a TODO comment indicating the `resetGame` function should be moved to a more appropriate component
- Maintained backward compatibility by keeping the function with clear documentation

### 4. Improved Logging
- Added completion log statement at the end of the `handleNegotiate` function
- Added method-level logging at the beginning of each method
- Enhanced existing logs with more detailed information

## Best Practices for Future Development

1. **Negotiation Property Standardization**:
   - Future data processing should ensure that both `rawNegotiate` and `Negotiate` properties are synchronized
   - Consider standardizing on a single property in future versions

2. **Refactoring Recommendations**:
   - Move the `resetGame` function to a dedicated GameManager component or the GameState object
   - Consider extracting state update logic to a dedicated method for better maintainability

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
