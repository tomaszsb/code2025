// SpaceInfoDice.js file is beginning to be used
console.log('SpaceInfoDice.js file is beginning to be used');

/**
 * SpaceInfoDice - Dice-related functionality for the SpaceInfo component
 * 
 * This module contains methods for rendering dice faces and dice outcomes
 * Used as a mixin for the SpaceInfo component
 */

// Create mixin object for SpaceInfo
window.SpaceInfoDice = {
  /**
   * Renders a visual representation of a dice face
   * @param {number} result - The dice roll result (1-6)
   * @returns {JSX.Element|null} The dice face representation or null
   */
  renderDiceFace: function(result) {
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
  },
  
  /**
   * Renders dice outcomes section if available
   * @returns {JSX.Element|null} The dice outcomes section or null
   */
  renderDiceOutcomes: function() {
    const { diceOutcomes, diceRoll } = this.props;
    
    console.log('SpaceInfoDice: Rendering dice outcomes, diceRoll =', diceRoll, 'diceOutcomes =', diceOutcomes);
    console.log('SpaceInfoDice: diceOutcomes type =', typeof diceOutcomes, 'keys =', diceOutcomes ? Object.keys(diceOutcomes) : 'null');
    
    // If no dice outcomes available at all, don't show anything
    if (!diceOutcomes || Object.keys(diceOutcomes).length === 0) {
      console.log('SpaceInfoDice: No dice outcomes available - returning null');
      return null;
    }
    
    // If we have dice outcomes but no dice roll yet, show potential outcomes
    if (!diceRoll) {
      return (
        <div className="dice-outcomes-display potential-outcomes">
          <div className="dice-outcome-header">
            <div className="dice-result-title">
              <h4>🎲 Possible Dice Outcomes:</h4>
            </div>
          </div>
          
          <div className="potential-outcomes-list">
            {Object.entries(diceOutcomes).map(([rollKey, outcomes]) => {
              // Handle case where outcomes might be an object with nested properties
              const outcomeText = typeof outcomes === 'object' && outcomes !== null ? 
                Object.entries(outcomes).map(([type, value]) => `${type}: ${value}`).join(', ') :
                String(outcomes);
              
              return (
                <div key={rollKey} className="potential-outcome-item">
                  <strong>{rollKey}:</strong>
                  <span className="outcome-summary"> {outcomeText}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // If we have a dice roll but no outcomes, show a simple message
    if (Object.keys(diceOutcomes).length === 0) {
      return (
        <div className="dice-outcomes-display">
          <div className="dice-outcome-header">
            <div className="dice-result-title">
              <h4>Dice Roll Outcome: {diceRoll}</h4>
            </div>
            {/* Render dice face after the text */}
            {this.renderDiceFace(diceRoll)}
          </div>
          
          <div className="dice-outcome-message">
            <p>You rolled a {diceRoll}. No special effects triggered.</p>
          </div>
        </div>
      );
    }
    
    // Create categorized outcomes for display
    const categories = {
      movement: { title: 'Movement', outcomes: {} },
      cards: { title: 'Cards', outcomes: {} },
      resources: { title: 'Resources', outcomes: {} },
      other: { title: 'Other Effects', outcomes: {} }
    };
    
    // Process outcomes using STANDARDIZED direct format only
    Object.entries(diceOutcomes).forEach(([type, value]) => {
      // Skip the moves array which isn't for display
      if (type === 'moves') return; 
      
      console.log('SpaceInfoDice: Processing outcome type =', type, 'value =', value);
      
      // Use direct format only - no nested handling needed
      const typeLC = type.toLowerCase();
      console.log('SpaceInfoDice: typeLC =', typeLC, 'charAt(0) =', typeLC.charAt(0));
      
      if (type === 'Next Step' || typeLC.includes('step') || typeLC.includes('move')) {
        console.log('SpaceInfoDice: Categorized as movement:', type);
        categories.movement.outcomes[type] = value;
      } else if (typeLC.includes('card') || ['w', 'b', 'i', 'l', 'e'].includes(typeLC.charAt(0))) {
        console.log('SpaceInfoDice: Categorized as cards:', type);
        categories.cards.outcomes[type] = value;
      } else if (typeLC.includes('time') || typeLC.includes('fee') || 
                typeLC.includes('cost') || typeLC.includes('pay')) {
        console.log('SpaceInfoDice: Categorized as resources:', type);
        categories.resources.outcomes[type] = value;
      } else {
        console.log('SpaceInfoDice: Categorized as other:', type);
        categories.other.outcomes[type] = value;
      }
    });
    
    // Check if we have any actual outcomes to display
    const hasOutcomes = Object.values(categories).some(category => 
      Object.keys(category.outcomes).length > 0
    );
    
    console.log('SpaceInfoDice: Has outcomes =', hasOutcomes);
    
    if (!hasOutcomes) {
      return (
        <div className="dice-outcomes-display">
          <div className="dice-outcome-header">
            <div className="dice-result-title">
              <h4>Dice Roll Outcome: {diceRoll}</h4>
            </div>
            {/* Render dice face after the text */}
            {this.renderDiceFace(diceRoll)}
          </div>
          
          <div className="dice-outcome-message">
            <p>You rolled a {diceRoll}. No special effects triggered.</p>
          </div>
        </div>
      );
    }
    
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
                    {outcomes.map(([type, value]) => {
                      console.log('SpaceInfoDice: Outcome:', type, '=', value);
                      
                      return (
                        <li key={type} className="outcome-item">
                          <span className="outcome-type">{type.replace(/Cards|Card/i, '').trim()}:</span> 
                          <span className="outcome-value">{value}</span>
                          {/* REMOVED: Dice outcomes should NOT create manual buttons - they are display only */}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
};

console.log('SpaceInfoDice.js code execution finished');
