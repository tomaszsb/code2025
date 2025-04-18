# Negotiation System Documentation

## Overview

The negotiation system is a core gameplay mechanic that allows players to stay on the same space and try again on their next turn, rather than being forced to move to a new space. This document covers both the game design aspects and technical implementation of the negotiation system.

## Game Design Aspects

### Core Concept

Negotiation represents a project management decision to persist with a challenging task rather than moving on to something else. In real-world project management, this might involve:

- Requesting more time to complete a deliverable
- Trying different approaches to solve a problem
- Working with stakeholders to overcome obstacles
- Revising plans or requirements to better match reality

### Game Mechanics

1. **Eligible Spaces**: Only certain spaces allow negotiation (indicated in the CSV by "YES" in the "Negotiate" column).

2. **Player Choice**: When on a negotiable space, players can choose to either:
   - Accept the current outcome and move to a new space (End Turn)
   - Negotiate to stay on the same space and try again next turn (Negotiate)

3. **Cost of Negotiation**: When negotiating, the player incurs:
   - The time penalty from the space (if any)
   - The opportunity cost of not moving forward

4. **Reset Effects**: When negotiating, all actions taken during the current turn are discarded with the exception of time penalties. This includes:
   - Cards drawn
   - Money spent
   - Any other resource changes

5. **Strategic Implications**: 
   - Negotiation creates risk-reward decision points
   - Players must weigh the cost of time against potential benefits
   - Creates tension between persistence and forward progress

## Technical Implementation

### NegotiationManager Component

The `NegotiationManager` class handles all negotiation-related functionality:

```javascript
class NegotiationManager {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }
  
  // Methods
  isNegotiationAllowed()
  handleNegotiate()
  getNegotiateButtonTooltip()
}
```

### Key Methods

#### `isNegotiationAllowed()`

Determines if negotiation is permitted for the current space.

- Retrieves the current player's position
- Checks the space's `rawNegotiate` and `Negotiate` properties
- Returns boolean indicating if negotiation is allowed
- Implements backward compatibility by checking both properties

#### `handleNegotiate()`

Processes the negotiation action when a player chooses to negotiate:

1. Verifies negotiation is allowed for the current space
2. Applies any time penalty to the player
3. Resets the player's resources to their state when they landed on the space
   - Money is reset to original value
   - Cards are reset to original state (removing any cards drawn this turn)
4. Moves to the next player's turn while keeping the current player on the same space
5. Updates the game board state
6. Dispatches a custom event to reset UI button states

#### `getNegotiateButtonTooltip()`

Provides appropriate tooltip text for the negotiate button:
- If negotiation is allowed: "End your turn, stay on this space, and only take the time penalty"
- If not allowed: "Negotiation is not allowed on this space"

### Integration with GameBoard

The NegotiationManager is initialized in the GameBoard component:

```javascript
// In GameBoard.js constructor
this.negotiationManager = new window.NegotiationManager(this);
```

The GameBoard component renders the Negotiate button conditionally based on whether negotiation is allowed:

```javascript
{this.negotiationManager.isNegotiationAllowed() && (
  <button 
    className="negotiate-button" 
    onClick={this.negotiationManager.handleNegotiate}
    title={this.negotiationManager.getNegotiateButtonTooltip()}
  >
    Negotiate
  </button>
)}
```

### Integration with SpaceInfo

The NegotiationManager communicates with SpaceInfo components through a custom event system:

1. When negotiation happens, NegotiationManager dispatches a `resetSpaceInfoButtons` event
2. SpaceInfo components listen for this event and reset their button states
3. This ensures all card draw buttons are re-enabled after negotiation

```javascript
// In NegotiationManager.js
const resetEvent = new CustomEvent('resetSpaceInfoButtons');
window.dispatchEvent(resetEvent);

// In SpaceInfo.js
window.addEventListener('resetSpaceInfoButtons', this.handleResetButtons);
```

### Data Structure

Negotiation is controlled by the `Negotiate` field in the spaces CSV file:

| Space Name | ... | Negotiate | ... |
|------------|-----|-----------|-----|
| SPACE-A    | ... | YES       | ... |
| SPACE-B    | ... | NO        | ... |

Both `rawNegotiate` and `Negotiate` properties are maintained in the space objects for backward compatibility.

## UI Components

### Negotiate Button

The negotiate button appears in the game controls when:
- The player is on a space that allows negotiation
- It's the player's turn
- The player has not already selected a move

The button includes a tooltip explaining its function and consequences.

### Visual Feedback

When negotiation occurs:
- The player token remains on the same space
- The turn indicator moves to the next player
- A brief animation indicates the negotiation action
- The player's time resource visibly updates
- Card draw buttons are reset to their initial state

## Recent Improvements

### 1. Enhanced Permission Checking
- Improved comments explaining the dual property check system
- Enhanced logging to display both property values
- Maintained backward compatibility 

### 2. State Update Clarification
- Clearer explanations of state updates
- Better context for time resource modification

### 3. Event-Based UI Reset
- Added custom event system to reset SpaceInfo buttons
- Ensured card draw buttons properly re-enable
- Fixed issues with dice roll outcome buttons

### 4. Improved Logging
- Added completion log statement
- Enhanced existing logs with more details
- Added logging for the event-based reset system

## Future Enhancements

### Planned Improvements
1. Add visual indicator for spaces that allow negotiation
2. Implement variable negotiation costs based on space type
3. Create advanced negotiation options with different outcomes
4. Add tutorial content explaining the negotiation mechanic
5. Implement a history log of negotiation decisions

### Implementation Priorities
1. Enhance visual feedback for negotiation options
2. Improve the event system for more reliable button resets
3. Add analytics to track negotiation frequency and outcomes
4. Create a more detailed tooltip with cost/benefit analysis

## Testing Guidelines

When testing the negotiation system:

1. Check that only spaces with "YES" for Negotiate allow negotiation
2. Verify that time penalties are correctly applied during negotiation
3. Confirm that other resources (money, cards) are properly reset
4. Test the button enable/disable logic works correctly
5. Verify that the turn advances to the next player
6. Check that UI state is properly reset after negotiation
7. Test with multiple players to ensure correct functionality

---

*Last Updated: April 18, 2025*