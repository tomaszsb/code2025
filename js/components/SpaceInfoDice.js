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
    
    if (!diceRoll) {
      return null;
    }
    
    // If we have a dice roll but no outcomes, show a simple message
    if (!diceOutcomes || Object.keys(diceOutcomes).length === 0) {
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
                      // Prepare for card draw buttons
                      const showDrawButton = window.SpaceInfoUtils.shouldShowDrawCardButton(type, value);
                      const cardType = window.SpaceInfoUtils.extractCardType(type);
                      
                      console.log('SpaceInfoDice: Outcome:', type, '=', value, 
                                'Show button:', showDrawButton, 'Card type:', cardType);
                      
                      return (
                        <li key={type} className="outcome-item">
                          <span className="outcome-type">{type.replace(/Cards|Card/i, '').trim()}:</span> 
                          <span className="outcome-value">{value}</span>
                          {showDrawButton && (
                            <div className="outcome-action-button">
                              {this.renderDrawCardsButton(cardType, value)}
                            </div>
                          )}
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
