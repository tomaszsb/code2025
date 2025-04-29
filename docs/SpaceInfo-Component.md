# SpaceInfo Component

## Overview

The SpaceInfo component displays detailed information about spaces on the game board. It shows space descriptions, available moves, dice roll outcomes, and card drawing opportunities. The component has been refactored to follow the manager pattern and integrate with the GameStateManager event system.

## Key Features

- Displays space details including name, type, and description
- Shows available moves as clickable buttons
- Renders dice roll outcomes in categorized sections
- Provides card drawing buttons for relevant spaces
- Integrates with SpaceInfoManager for state management and styling
- Uses GameStateManager events for state updates

## Integration with Manager Pattern

The SpaceInfo component follows the manager pattern by delegating state management and business logic to the SpaceInfoManager. This separation of concerns improves maintainability and testability.

### SpaceInfoManager Responsibilities

- Tracking button usage state across spaces and players
- Providing CSS classes for space styling
- Managing event listeners for game state changes
- Handling card drawing through GameStateManager
- Resetting button states when turns or spaces change

### SpaceInfo Component Responsibilities

- Rendering the UI based on space data
- Handling user interactions
- Receiving events from GameStateManager
- Applying CSS classes provided by SpaceInfoManager

## Event System Integration

The SpaceInfo component integrates with the GameStateManager event system for state updates and communication with other components.

### Event Registration

```javascript
componentDidMount() {
  console.log('SpaceInfo: Component mounted');
  
  // Add event listener for reset buttons event (legacy compatibility)
  window.addEventListener('resetSpaceInfoButtons', this.eventHandlers.resetButtons);
  
  // Register for GameStateManager events
  if (window.GameStateManager) {
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  }
  
  // Check manager availability
  if (!window.SpaceInfoManager) {
    console.error('SpaceInfo: SpaceInfoManager not available');
  }
}
```

### Event Cleanup

```javascript
componentWillUnmount() {
  console.log('SpaceInfo: Component unmounting, cleaning up listeners');
  
  // Remove window event listener
  window.removeEventListener('resetSpaceInfoButtons', this.eventHandlers.resetButtons);
  
  // Remove GameStateManager event listeners
  if (window.GameStateManager) {
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
  }
}
```

## CSS Integration

The component uses CSS classes provided by SpaceInfoManager instead of inline styles. This improves performance and maintainability.

```javascript
// Get CSS class for space phase using SpaceInfoManager
getPhaseClass(type) {
  // Use the SpaceInfoManager to get the phase class
  if (window.SpaceInfoManager) {
    return window.SpaceInfoManager.getPhaseClass(type);
  }
  
  // Fallback if manager is not available
  console.warn('SpaceInfo: SpaceInfoManager not available for getPhaseClass');
  return 'space-phase-default';
}
```

### CSS Classes

The component uses these primary CSS classes:

- `.space-info`: Base styling for the component
- `.space-phase-setup`, `.space-phase-owner`, etc.: Phase-specific styling
- `.space-time-display`: Time display in top right corner
- `.space-section`: Section styling for descriptions, actions, etc.
- `.space-available-moves`: Section for available moves
- `.move-button`: Styling for move buttons
- `.dice-outcomes-display`: Container for dice outcomes
- `.outcome-category`: Category section for dice outcomes
- `.card-section`: Styling for card sections
- `.resource-section`: Styling for resource sections

## Component Usage

The SpaceInfo component is used in the GameBoard component to display information about the currently selected space.

```jsx
<SpaceInfo
  space={this.state.selectedSpace}
  visitType={this.getVisitType(this.state.selectedSpace)}
  availableMoves={this.state.availableMoves}
  onMoveSelect={this.handleMoveSelect}
  diceRoll={this.state.diceRoll}
  diceOutcomes={this.state.diceOutcomes}
  onRollDice={this.handleRollDice}
  hasRolledDice={this.state.hasRolledDice}
  hasDiceRollSpace={this.hasDiceRollSpace()}
  onDrawCards={this.handleDrawCards}
/>
```

## Rendering Logic

### Space Type-Based Rendering

The component renders different content based on the space type:

```jsx
// Get CSS class for space type/phase
const phaseClass = this.getPhaseClass(space.type);

return (
  <div className={`space-info ${phaseClass}`} key={renderKey}>
    {/* Component content */}
  </div>
);
```

### Available Moves Rendering

```jsx
renderAvailableMoves() {
  const { availableMoves, onMoveSelect } = this.props;
  
  if (!availableMoves || availableMoves.length === 0) {
    return null;
  }
  
  return (
    <div className="space-available-moves">
      <div className="space-section-label">Available Moves:</div>
      <div className="available-moves-list" data-testid="moves-list">
        {availableMoves.map(move => (
          <button 
            key={move.id}
            className="move-button primary-move-btn"
            onClick={() => {
              console.log('SpaceInfo: Move button clicked:', move.name, move.id);
              if (onMoveSelect) {
                onMoveSelect(move.id);
              }
            }}
          >
            {move.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Dice Outcomes Rendering

```jsx
renderDiceOutcomes() {
  const { diceOutcomes, diceRoll } = this.props;
  
  if (!diceOutcomes || !diceRoll) {
    return null;
  }
  
  // Create categorized outcomes for display
  const categories = {
    movement: { title: 'Movement', outcomes: {} },
    cards: { title: 'Cards', outcomes: {} },
    resources: { title: 'Resources', outcomes: {} },
    other: { title: 'Other Effects', outcomes: {} }
  };
  
  // Sort outcomes by category
  Object.entries(diceOutcomes).forEach(([type, value]) => {
    // Skip the moves array which isn't for display
    if (type === 'moves') return; 
    
    // Categorize outcomes - make case-insensitive and flexible pattern matching
    const typeLC = type.toLowerCase();
    
    if (type === 'Next Step' || typeLC.includes('step') || typeLC.includes('move')) {
      categories.movement.outcomes[type] = value;
    } else if (typeLC.includes('card') || ['w', 'b', 'i', 'l', 'e'].includes(typeLC.charAt(0))) {
      categories.cards.outcomes[type] = value;
    } else if (typeLC.includes('time') || typeLC.includes('fee') || 
              typeLC.includes('cost') || typeLC.includes('pay')) {
      categories.resources.outcomes[type] = value;
    } else {
      categories.other.outcomes[type] = value;
    }
  });
  
  // Check if we have any actual outcomes to display
  const hasOutcomes = Object.values(categories).some(category => 
    Object.keys(category.outcomes).length > 0
  );
  
  if (!hasOutcomes) return null;
  
  return (
    <div className="dice-outcomes-display">
      {/* Outcomes rendering code */}
    </div>
  );
}
```

### Card Drawing Button Rendering

```jsx
renderDrawCardsButton(cardType, amount) {
  // Get current player from GameStateManager
  const currentPlayer = window.GameStateManager?.getCurrentPlayer?.();
  const playerId = currentPlayer?.id || '';
  const spaceId = this.props.space?.id || '';
  
  // Create a unique button ID that includes player and space ID
  const buttonId = `draw-${cardType}-${amount}-${spaceId}`;
  
  // Use SpaceInfoManager to check if button has been used
  const isButtonUsed = window.SpaceInfoManager ? 
    window.SpaceInfoManager.isButtonUsed(playerId, buttonId) : 
    false;
  
  // Handle button click - use SpaceInfoManager
  const handleClick = () => {
    console.log('SpaceInfo: Draw card button clicked for', cardType, 'amount:', cardAmount);
    
    // Mark button as used via SpaceInfoManager
    if (window.SpaceInfoManager) {
      window.SpaceInfoManager.markButtonUsed(playerId, buttonId);
      
      // Draw cards using SpaceInfoManager
      const drawnCards = window.SpaceInfoManager.drawCards(playerId, cardCode, cardAmount);
      console.log(`SpaceInfo: Drew ${drawnCards.length} ${cardType}(s)`);
      
      // Force refresh to show button as used
      this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
    } else if (this.props.onDrawCards) {
      // Fallback to using callback if provided
      console.log('SpaceInfo: Drawing cards using onDrawCards callback');
      this.props.onDrawCards(cardCode, cardAmount);
    }
  };
  
  return (
    <button 
      className={buttonClass}
      onClick={handleClick}
      disabled={isButtonUsed}
      title={isButtonUsed ? 'Cards already drawn' : `Draw ${cardAmount} ${displayCardType}(s)`}
    >
      {isButtonUsed ? 'Cards Drawn' : `Draw ${cardAmount} ${displayCardType}(s)`}
    </button>
  );
}
```

## Conditional Logic

### Card Drawing Conditions

The component includes conditional logic for determining when to show card drawing buttons based on player state:

```javascript
shouldShowCardForCondition(cardText) {
  // Special case for owner-fund-initiation space
  if (this.props.space && this.props.space.name === "OWNER-FUND-INITIATION") {
    // Check which condition we're evaluating
    const isCheckingBankCard = cardText.includes('scope') && cardText.includes('≤ $ 4 M');
    const isCheckingInvestorCard = cardText.includes('scope') && cardText.includes('> $ 4 M');
    
    if (!isCheckingBankCard && !isCheckingInvestorCard) {
      return true; // Not one of our special conditions
    }
    
    // Get current player and calculate scope
    const currentPlayer = window.GameStateManager ? window.GameStateManager.getCurrentPlayer() : null;
    if (!currentPlayer || !currentPlayer.cards) {
      return true; // Default to showing the card if we can't determine scope
    }
    
    // Calculate scope
    let totalScope = 0;
    const wCards = currentPlayer.cards.filter(card => card.type === 'W');
    wCards.forEach(card => {
      const cost = parseFloat(card['Estimated Job Costs']);
      if (!isNaN(cost)) {
        totalScope += cost;
      }
    });
    
    // $4M threshold in numeric format
    const threshold = 4000000;
    
    // Compare with threshold
    const isUnder4M = totalScope <= threshold;
    
    // Return based on specific condition
    if (isCheckingBankCard) {
      return isUnder4M; // Show Bank Card if scope ≤ $4M
    }
    
    if (isCheckingInvestorCard) {
      return !isUnder4M; // Show Investor Card if scope > $4M
    }
  }
  
  // Default behavior for other spaces and conditions
  if (!cardText || !cardText.includes('if ')) {
    return true;
  }
  
  return true;
}
```

## Performance Considerations

- The component uses a minimal state object with only a `renderKey` to force re-renders
- Delegates state management to SpaceInfoManager for better performance
- Uses CSS classes instead of inline styles for better rendering performance
- Implements conditional rendering to minimize unnecessary DOM elements
- Uses Map and Set data structures through SpaceInfoManager for efficient lookups

## Event Handling

### Reset Buttons

```javascript
handleResetButtons() {
  console.log('SpaceInfo: Received resetSpaceInfoButtons event, forcing refresh');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}
```

### Turn Changed

```javascript
handleTurnChanged() {
  console.log('SpaceInfo: Handling turn changed event');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}
```

### Space Changed

```javascript
handleSpaceChanged() {
  console.log('SpaceInfo: Handling space changed event');
  // Force a re-render
  this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
}
```

## Future Enhancements

Potential future enhancements for the SpaceInfo component include:

1. **Enhanced Performance Monitoring**: Add render count and timing metrics similar to SpaceExplorer component
2. **Improved Error Handling**: Implement error boundary with detailed stack trace logging
3. **Animation Effects**: Add subtle animations for state transitions
4. **Improved Accessibility**: Add ARIA attributes for better screen reader support
5. **Enhanced Conditional Logic**: Expand the conditional card display logic for more space types

---

*Last Updated: April 28, 2025*