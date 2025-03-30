// SpaceInfo component
console.log('SpaceInfo.js file is being processed');

window.SpaceInfo = class SpaceInfo extends React.Component {
  // Render available moves
  renderAvailableMoves() {
    const { availableMoves, onMoveSelect } = this.props;
    
    if (!availableMoves || availableMoves.length === 0) {
      return null;
    }
    
    return (
      <div className="space-available-moves">
        <div className="space-section-label">Available Moves:</div>
        <div className="available-moves-list">
          {availableMoves.map(move => (
            <button 
              key={move.id}
              className="move-button"
              onClick={() => onMoveSelect(move.id)}
            >
              {move.name}
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  // Render a button to draw cards
  renderDrawCardsButton(cardType, amount) {
    // Only render for valid card types
    const validCardTypes = {
      'Work Type Card': 'W',
      'Bank Card': 'B',
      'Investor Card': 'I',
      'Life Card': 'L',
      'Expeditor Card': 'E'
    };
    
    const cardCode = validCardTypes[cardType];
    if (!cardCode) return null;
    
    // Parse amount (expecting "Draw X" format)
    let cardAmount = 1;
    if (amount && typeof amount === 'string') {
      const matches = amount.match(/Draw (\d+)/);
      if (matches && matches[1]) {
        cardAmount = parseInt(matches[1], 10);
      }
    }
    
    // Use either the provided callback or the utility function
    const handleClick = () => {
      if (this.props.onDrawCards) {
        // Use the callback if provided
        this.props.onDrawCards(cardCode, cardAmount);
      } else if (window.CardDrawUtil) {
        // Otherwise use the utility function directly
        const currentPlayer = window.GameState.getCurrentPlayer();
        if (currentPlayer) {
          const drawnCards = window.CardDrawUtil.drawCards(currentPlayer.id, cardCode, cardAmount);
          console.log(`Drew ${drawnCards.length} ${cardType}(s)`);
        }
      }
    };
    
    return (
      <button 
        className="draw-cards-btn"
        onClick={handleClick}
      >
        Draw {cardAmount} {cardType}(s)
      </button>
    );
  }
  
  renderDiceFace(result) {
    if (!result) return null;
    
    // Create dot layouts for each face of the dice
    const generateDots = (count) => {
      const dots = [];
      
      for (let i = 1; i <= 9; i++) {
        // Only show dots that should be visible for this number
        const visible = (
          (count === 1 && i === 5) ||  // Center dot for 1
          (count === 2 && (i === 1 || i === 9)) ||  // Diagonal corners for 2
          (count === 3 && (i === 1 || i === 5 || i === 9)) ||  // Diagonal plus center for 3
          (count === 4 && (i === 1 || i === 3 || i === 7 || i === 9)) ||  // Four corners for 4
          (count === 5 && (i === 1 || i === 3 || i === 5 || i === 7 || i === 9)) ||  // Four corners and center for 5
          (count === 6 && (i === 1 || i === 3 || i === 4 || i === 6 || i === 7 || i === 9))  // Six dots for 6
        );
        
        dots.push(
          <div 
            key={i} 
            className={`dice-dot dice-dot-${i} ${visible ? 'visible' : ''}`}
          ></div>
        );
      }
      
      return dots;
    };
    
    return (
      <div className="dice-face-compact">
        {generateDots(result)}
      </div>
    );
  }

  // Render dice outcomes if available
  renderDiceOutcomes() {
    const { diceOutcomes, diceRoll } = this.props;
    
    console.log('SpaceInfo: Rendering dice outcomes, diceRoll =', diceRoll, 'diceOutcomes =', diceOutcomes);
    
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
      if (type === 'Next Step') {
        categories.movement.outcomes[type] = value;
      } else if (type.includes('Cards')) {
        categories.cards.outcomes[type] = value;
      } else if (type.includes('Time') || type.includes('Fee')) {
        categories.resources.outcomes[type] = value;
      } else if (type !== 'moves') { // Skip the moves array which isn't for display
        categories.other.outcomes[type] = value;
      }
    });
    
    // Check if we have any actual outcomes to display
    const hasOutcomes = Object.values(categories).some(category => 
      Object.keys(category.outcomes).length > 0
    );
    
    console.log('SpaceInfo: Has outcomes =', hasOutcomes);
    
    if (!hasOutcomes) return null;
    
    return (
      <div className="dice-outcomes-display">
        <div className="dice-outcome-header">
          <div className="dice-result-title">
            <h4>Dice Roll Outcome: {diceRoll}</h4>
          </div>
          {/* Render dice face after the text */}
          {this.renderDiceFace(diceRoll)}
        </div>
        
        <div className="dice-outcome-categories">
          {Object.values(categories)
            // Filter out categories with no outcomes
            .filter(category => Object.keys(category.outcomes).length > 0)
            .map(category => {
              const outcomes = Object.entries(category.outcomes);
              
              return (
                <div key={category.title} className="outcome-category">
                  <h5 className="outcome-category-title">{category.title}</h5>
                  <ul className="outcome-list">
                    {outcomes.map(([type, value]) => (
                      <li key={type} className="outcome-item">
                        <span className="outcome-type">{type.replace('Cards', '').trim()}:</span> 
                        <span className="outcome-value">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
  
  render() {
    const { space, visitType, diceOutcomes, diceRoll, availableMoves, onMoveSelect } = this.props;
    
    console.log('SpaceInfo render - diceRoll:', diceRoll, 'diceOutcomes:', diceOutcomes);
    
    if (!space) {
      return <div className="space-info empty">No space selected</div>;
    }
    
    // Determine which description to show based on visitType
    const descriptionToShow = (visitType && space.visit) 
      ? (space.visit[visitType]?.description || space.description)
      : space.description;
    
    // Create a list of fields to display
    const fieldMappings = [
      { key: 'action', label: 'Action', priority: 'high' },
      { key: 'outcome', label: 'Outcome', priority: 'high' },
      { key: 'W Card', label: 'Work Type Card', priority: 'normal', isCard: true },
      { key: 'B Card', label: 'Bank Card', priority: 'normal', isCard: true },
      { key: 'I Card', label: 'Investor Card', priority: 'normal', isCard: true },
      { key: 'L card', label: 'Life Card', priority: 'normal', isCard: true },
      { key: 'E Card', label: 'Expeditor Card', priority: 'normal', isCard: true },
      { key: 'Time', label: 'Time', priority: 'normal', isResource: true },
      { key: 'Fee', label: 'Fee', priority: 'normal', isResource: true }
    ];
    
    // Separate high-priority and normal-priority fields
    const highPriorityFields = fieldMappings.filter(field => field.priority === 'high');
    const normalPriorityFields = fieldMappings.filter(field => field.priority === 'normal');
    
    return (
      <div className="space-info">
        <h3>{space.name}</h3>
        <div className="space-type">{space.type}</div>
        
        {/* Main description */}
        <div className="space-section">
          <div className="space-section-label">Description:</div>
          <div className="space-description">{descriptionToShow}</div>
        </div>
        
        {/* High priority fields (Action and Outcome) */}
        {highPriorityFields.map(field => {
          // Only show fields that have content
          if (space[field.key] && space[field.key].trim() !== '') {
            return (
              <div key={field.key} className="space-section">
                <div className="space-section-label">{field.label}:</div>
                <div className="space-info-value">{space[field.key]}</div>
              </div>
            );
          }
          return null;
        })}
        
        {/* Available moves section */}
        {this.renderAvailableMoves()}
        
        {/* Display dice outcomes if available */}
        {diceRoll && diceOutcomes ? (
          <div className="dice-outcomes-display">
            <div className="dice-outcome-header">
              <div className="dice-result-title">
                <h4>Dice Roll Outcome: {diceRoll}</h4>
              </div>
              {/* Render dice face after the text */}
              {this.renderDiceFace(diceRoll)}
            </div>
            
            <div className="simple-outcome">
              {diceOutcomes['Next Step'] && (
                <div className="outcome-item">
                  <strong>Next Step:</strong> {diceOutcomes['Next Step']}
                </div>
              )}
              {diceOutcomes['WCardOutcome'] && (
                <div className="outcome-item">
                  <strong>Work Type Card:</strong> {diceOutcomes['WCardOutcome']}
                </div>
              )}
              {diceOutcomes['Time'] && (
                <div className="outcome-item">
                  <strong>Time:</strong> {diceOutcomes['Time']}
                </div>
              )}
              {diceOutcomes['Fee'] && (
                <div className="outcome-item">
                  <strong>Fee:</strong> {diceOutcomes['Fee']}
                </div>
              )}
            </div>
          </div>
        ) : this.renderDiceOutcomes()}
        
        {/* Group cards together with consistent styling */}
        <div className="space-cards-section">
          {normalPriorityFields.filter(field => field.isCard).map(field => {
            // Only show fields that have content
            if (space[field.key] && space[field.key].trim() !== '') {
              return (
                <div key={field.key} className="space-section card-section">
                  <div className="space-section-label">{field.label}:</div>
                  <div className="space-info-value card-value">
                    {space[field.key]}
                    {/* Add draw button for card fields that have "Draw X" format */}
                    {space[field.key].includes("Draw") && 
                      this.renderDrawCardsButton(field.label, space[field.key])}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
        
        {/* Group resources together with consistent styling */}
        <div className="space-resources-section">
          {normalPriorityFields.filter(field => field.isResource).map(field => {
            // Only show fields that have content
            if (space[field.key] && space[field.key].trim() !== '') {
              return (
                <div key={field.key} className="space-section resource-section">
                  <div className="space-section-label">{field.label}:</div>
                  <div className="space-info-value resource-value">{space[field.key]}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }
}

console.log('SpaceInfo.js execution finished');