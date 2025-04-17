# Negotiation Mechanics Implementation

## Overview

The negotiation feature allows players to stay on the same space and try again on their next turn, paying only the time penalty for the space. This provides a strategic option when players get unfavorable dice rolls or card draws and would prefer to try again rather than proceed with the current outcome.

The implementation follows a modular approach with a dedicated NegotiationManager class that handles all negotiation-related functionality.

## Implementation Details

### NegotiationManager.js

A dedicated manager class has been created to handle all negotiation-related logic, following the same pattern used for other game mechanics like the CardManager and DiceManager. This keeps the code modular and maintainable.

#### Key Features:

1. **Space-Specific Negotiation Rules**: 
   - NegotiationManager checks both the "rawNegotiate" and "Negotiate" properties from the Spaces.csv file to determine if negotiation is allowed for each space
   - Dual property checking ensures backward compatibility while providing flexibility for future changes
   - The button is automatically disabled for spaces where negotiation is not allowed

2. **Negotiation Logic**:
   - When a player uses the Negotiate button, they stay on their current space
   - They only incur the time penalty from the space (if any)
   - All other actions from the current turn are discarded
   - The turn moves to the next player

3. **User Interface Integration**:
   - The Negotiate button has dynamic tooltips that explain when and why negotiation is available or unavailable
   - The button is properly disabled when negotiation is not allowed

4. **Game State Management**:
   - The manager properly updates the game state after negotiation
   - It interacts with the GameState to ensure proper turn progression

### Code Structure

The NegotiationManager follows the component manager pattern established in the codebase:

```javascript
class NegotiationManager {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }
  
  // Check if negotiation is allowed for the current space
  isNegotiationAllowed = () => {
    console.log('NegotiationManager: Checking if negotiation is allowed');
    // Logic to check if the current space allows negotiation
    // using both rawNegotiate and Negotiate properties for backward compatibility
  }
  
  // Handle the negotiation action
  handleNegotiate = () => {
    console.log('NegotiationManager: Negotiate button clicked');
    // Logic to handle when player clicks negotiate
    // Apply time penalty but discard other effects
    // Move to next player's turn
    console.log('NegotiationManager: Negotiation action completed successfully');
  }
  
  // Get tooltip text for the negotiate button
  getNegotiateButtonTooltip = () => {
    console.log('NegotiationManager: Getting negotiate button tooltip');
    // Return appropriate tooltip based on whether negotiation is allowed
  }
}
```

## Integration with Existing Components

### GameBoard.js
- The NegotiationManager is initialized in the GameBoard constructor alongside other managers
- The old handleNegotiate method has been removed from GameBoard, with that functionality now in NegotiationManager

### BoardRenderer.js
- The Negotiate button now uses methods from NegotiationManager:
  - `onClick={gameBoard.negotiationManager.handleNegotiate}`
  - `title={gameBoard.negotiationManager.getNegotiateButtonTooltip()}`
  - `disabled={!currentPlayer || !gameBoard.negotiationManager.isNegotiationAllowed()}`

## Data Model

The negotiation feature relies on two properties in the space data:

1. **rawNegotiate**: The direct value from the "Negotiate" column in the Spaces.csv file
2. **Negotiate**: A processed version of the same property that may be used in some contexts

Both properties contain either "YES" or "NO" values for each space. This dual-property approach ensures backward compatibility while allowing for future enhancements.

Example from Spaces.csv:
```
Space Name,Phase,Visit Type,...,Negotiate
OWNER-SCOPE-INITIATION,SETUP,First,...,YES
OWNER-SCOPE-INITIATION,SETUP,Subsequent,...,NO
OWNER-FUND-INITIATION,SETUP,First,...,YES
```

## Recent Improvements

### Enhanced Negotiation Permission Checking
- Improved permission checking by considering both `rawNegotiate` and `Negotiate` properties for backward compatibility
- Added detailed comments explaining the dual-property approach
- Enhanced logging to display both property values for easier debugging

### Clarified State Update Comments
- Improved comments around player time resource updates
- Added clear explanation about why the resource should only be modified in one location

### Improved Logging
- Added thorough entry and exit logging for all methods
- Added completion log statement at the end of the `handleNegotiate` function
- Enhanced existing logs with more detailed information

### Code Structure Improvements
- Added TODO comments for future refactoring of functionality not directly related to negotiation
- Maintained backward compatibility while making the code more maintainable

## Future Enhancements

Potential future improvements to the negotiation system:

1. **Cost-Based Negotiation**: Add optional costs (money, resources) for negotiation on certain spaces
2. **Visual Feedback**: Add animations or visual cues when negotiation occurs
3. **Negotiation Limits**: Implement limits on how many times a player can negotiate in succession
4. **Space-Specific Negotiation Effects**: Allow some spaces to have custom behavior when negotiating

## Conclusion

The negotiation mechanics have been fully implemented with a dedicated NegotiationManager that handles all negotiation logic. The implementation is data-driven, with the "Negotiate" column in Spaces.csv controlling which spaces allow negotiation. The user interface has been updated to properly enable/disable the Negotiate button based on these rules and provide helpful tooltips.

This follows the project's architectural pattern of using manager classes for specific gameplay mechanics and maintains a clean separation of concerns. The code is well-structured, properly logged, and follows all required coding practices.
