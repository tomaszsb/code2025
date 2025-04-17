// SpaceInfo component
console.log('SpaceInfo.js file is beginning to be used');

window.SpaceInfo = class SpaceInfo extends React.Component {
  // Constructor to handle state for used buttons
  constructor(props) {
    super(props);
    this.state = {
      usedButtons: [],
      currentPlayerId: null // Store current player ID to detect changes
    };
  }
  
  // Reset used buttons when space or player changes
  componentDidUpdate(prevProps) {
    // Get current player
    const currentPlayer = window.GameState?.getCurrentPlayer?.();
    const currentPlayerId = currentPlayer?.id || null;
    
    // Check if the space has changed
    if (prevProps.space?.id !== this.props.space?.id) {
      // Reset used buttons when space changes
      this.setState({ 
        usedButtons: [],
        currentPlayerId: currentPlayerId // Update player ID state
      });
      console.log('SpaceInfo: Space changed, resetting used buttons');
      return; // Return early to avoid additional state updates
    }
    
    // Check if the player has changed (without causing infinite loops)
    if (currentPlayerId && this.state.currentPlayerId !== currentPlayerId) {
      // Reset used buttons when player changes
      this.setState({ 
        usedButtons: [],
        currentPlayerId: currentPlayerId // Update player ID state
      });
      console.log('SpaceInfo: Player changed, resetting used buttons');
      return; // Return early to avoid additional state updates
    }
    
    // Also log current state of used buttons for debugging
    console.log('SpaceInfo: Current usedButtons state:', this.state.usedButtons);
  }
  
  componentDidMount() {
    // Initialize with current player ID
    const currentPlayer = window.GameState?.getCurrentPlayer?.();
    if (currentPlayer?.id) {
      this.setState({ currentPlayerId: currentPlayer.id });
    }
    
    // Add event listener for reset buttons event
    window.addEventListener('resetSpaceInfoButtons', this.handleResetButtons);
    
    // Log initial state of used buttons
    console.log('SpaceInfo: Mounted with usedButtons:', this.state.usedButtons);
  }
  
  componentWillUnmount() {
    // Remove event listener
    window.removeEventListener('resetSpaceInfoButtons', this.handleResetButtons);
  }
  
  // Handler for the reset buttons event
  handleResetButtons = () => {
    console.log('SpaceInfo: Received resetSpaceInfoButtons event, clearing all used buttons');
    this.setState({ usedButtons: [] });
  }
  
  // Determine background color based on space type/phase
  getPhaseColor(type) {
    if (!type) return '#f8f9fa';
    
    // Define colors for different phases
    const phaseColors = {
      'SETUP': '#e3f2fd',     // Light blue
      'OWNER': '#fce4ec',     // Light pink
      'FUNDING': '#fff8e1',   // Light yellow
      'DESIGN': '#e8f5e9',    // Light green
      'REGULATORY': '#f3e5f5', // Light purple
      'CONSTRUCTION': '#f1f8e9', // Light greenish
      'END': '#e8eaf6'        // Light indigo
    };
    
    // Return the color for the phase or default if not found
    return phaseColors[type.toUpperCase()] || '#f8f9fa';
  }
  
  // Get border color based on space type
  getBorderColor(type) {
    if (!type) return '#ddd';
    
    // Define colors for different phases
    const borderColors = {
      'SETUP': '#3498db',     // Blue
      'OWNER': '#9b59b6',     // Purple
      'FUNDING': '#f1c40f',   // Yellow
      'DESIGN': '#2ecc71',    // Green
      'REGULATORY': '#e74c3c', // Red
      'CONSTRUCTION': '#e67e22', // Orange
      'END': '#1abc9c'        // Teal
    };
    
    // Return the color for the phase or default if not found
    return borderColors[type.toUpperCase()] || '#ddd';
  }
  
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
  
  // Evaluate conditional card draw text
  shouldShowCardForCondition(cardText) {
    console.log('SpaceInfo: Evaluating card condition:', cardText);
    
    // Special case for owner-fund-initiation space
    if (this.props.space && this.props.space.name === "OWNER-FUND-INITIATION") {
      console.log('SpaceInfo: Special handling for OWNER-FUND-INITIATION space');
      
      // Check which condition we're evaluating
      const isCheckingBankCard = cardText.includes('scope') && cardText.includes('≤ $ 4 M');
      const isCheckingInvestorCard = cardText.includes('scope') && cardText.includes('> $ 4 M');
      
      if (!isCheckingBankCard && !isCheckingInvestorCard) {
        return true; // Not one of our special conditions
      }
      
      // Get current player and calculate scope
      const currentPlayer = window.GameState?.getCurrentPlayer?.();
      if (!currentPlayer || !currentPlayer.cards) {
        console.log('SpaceInfo: Cannot determine player scope, defaulting to showing card');
        return true; // Default to showing the card if we can't determine scope
      }
      
      // Calculate scope (similar to PlayerInfo.extractScope)
      let totalScope = 0;
      const wCards = currentPlayer.cards.filter(card => card.type === 'W');
      wCards.forEach(card => {
        const cost = parseFloat(card['Estimated Job Costs']);
        if (!isNaN(cost)) {
          totalScope += cost;
        }
      });
      
      console.log(`SpaceInfo: Player scope calculated as ${totalScope.toLocaleString()}`);
      
      // $4M threshold in numeric format
      const threshold = 4000000;
      
      // Compare with threshold
      const isUnder4M = totalScope <= threshold;
      
      // Return based on specific condition
      if (isCheckingBankCard) {
        console.log(`SpaceInfo: Bank Card condition (scope ≤ $4M): ${isUnder4M}`);
        return isUnder4M; // Show Bank Card if scope ≤ $4M
      }
      
      if (isCheckingInvestorCard) {
        console.log(`SpaceInfo: Investor Card condition (scope > $4M): ${!isUnder4M}`);
        return !isUnder4M; // Show Investor Card if scope > $4M
      }
    }
    
    // Default behavior for other spaces and conditions
    if (!cardText || !cardText.includes('if ')) {
      return true;
    }
    
    // General case for all other conditions
    console.log('SpaceInfo: Using general condition handling');
    return true;
  }

  // Render a button to draw cards
  renderDrawCardsButton(cardType, amount) {
    // Check if button has been used
    const buttonId = `draw-${cardType}-${amount}`;
    const isButtonUsed = this.state && this.state.usedButtons && this.state.usedButtons.includes(buttonId);
    
    // Log the button state for debugging
    console.log(`SpaceInfo: Button ${buttonId} used status:`, isButtonUsed, ', usedButtons:', this.state.usedButtons);
    
    // Only render for valid card types
    const validCardTypes = {
      'Work Type Card': 'W',
      'Work Type': 'W',
      'W Card': 'W',
      'W Cards': 'W',
      'W': 'W',
      'Bank Card': 'B',
      'Bank': 'B',
      'B Card': 'B',
      'B Cards': 'B',
      'B': 'B',
      'Investor Card': 'I',
      'Investor': 'I',
      'I Card': 'I',
      'I Cards': 'I',
      'I': 'I',
      'Life Card': 'L',
      'Life': 'L',
      'L Card': 'L',
      'L Cards': 'L',
      'L': 'L',
      'Expeditor Card': 'E',
      'Expeditor': 'E',
      'E Card': 'E',
      'E Cards': 'E',
      'E': 'E'
    };
    
    const cardCode = validCardTypes[cardType];
    if (!cardCode) {
      console.log('SpaceInfo: No valid card type found for:', cardType);
      return null;
    }
    
    // Check if this card should be shown based on conditions
    if (!this.shouldShowCardForCondition(amount)) {
      console.log('SpaceInfo: Not showing card button due to condition not met:', amount);
      return null;
    }
    
    // Parse amount (expecting "Draw X" format or number format)
    let cardAmount = 1;
    if (amount && typeof amount === 'string') {
      // Check for "Draw X" format
      const drawMatches = amount.match(/Draw (\d+)/i);
      if (drawMatches && drawMatches[1]) {
        cardAmount = parseInt(drawMatches[1], 10);
      } else {
        // Check if it's a number like "3"
        const numMatches = amount.match(/^\s*(\d+)\s*$/);
        if (numMatches && numMatches[1]) {
          cardAmount = parseInt(numMatches[1], 10);
        } else if (amount.toLowerCase().includes('draw')) {
          // Generic "Draw" without a number
          cardAmount = 1;
        }
      }
    }
    
    console.log('SpaceInfo: Rendering draw button for', cardCode, 'cards, amount:', cardAmount);
    
    // Use either the provided callback or the utility function
    const handleClick = () => {
      console.log('SpaceInfo: Draw card button clicked for', cardType, 'amount:', cardAmount);
      
      // Add the button to the used buttons list
      this.setState(prevState => {
        const newUsedButtons = [...(prevState.usedButtons || []), buttonId];
        console.log('SpaceInfo: Marking button as used:', buttonId, 'New usedButtons state:', newUsedButtons);
        return { usedButtons: newUsedButtons };
      });
      
      if (this.props.onDrawCards) {
        // Use the callback if provided
        console.log('SpaceInfo: Drawing cards using onDrawCards callback');
        this.props.onDrawCards(cardCode, cardAmount);
      } else if (window.CardDrawUtil) {
        // Otherwise use the utility function directly
        console.log('SpaceInfo: Drawing cards using CardDrawUtil');
        const currentPlayer = window.GameState.getCurrentPlayer();
        if (currentPlayer) {
          const drawnCards = window.CardDrawUtil.drawCards(currentPlayer.id, cardCode, cardAmount);
          console.log(`Drew ${drawnCards.length} ${cardType}(s)`);
        }
      }
    };
    
    // Format the card type for display
    let displayCardType = cardType;
    if (cardType === 'W' || cardType === 'B' || cardType === 'I' || cardType === 'L' || cardType === 'E') {
      displayCardType = {
        'W': 'Work Type',
        'B': 'Bank',
        'I': 'Investor',
        'L': 'Life',
        'E': 'Expeditor'
      }[cardType];
    } else {
      // Remove "Cards" suffix if present and replace with "Card"
      displayCardType = displayCardType.replace(/\s*Cards$/i, ' Card');
    }
    
    // Button class based on whether it's been used
    const buttonClass = `draw-cards-btn ${isButtonUsed ? 'used' : ''}`;
    
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

  // Helper to determine if outcome value indicates drawing cards
  shouldShowDrawCardButton(type, value) {
    // Skip if no value or "n/a"
    if (!value || value.toLowerCase() === 'n/a') {
      return false;
    }
    
    // If the value is "No change" but it's a card type, we still show the button if the type indicates it's a card
    const isCardType = type.match(/w|b|i|l|e|card|work|bank|investor|life|expeditor/i);
    
    // Return true if value includes Draw, is a number, or is related to cards
    const valueLC = value.toLowerCase();
    return isCardType && (valueLC.includes('draw') || /^\d+$/.test(valueLC.trim()) || valueLC.includes('take'));
  }

  // Extract card type from outcome type
  extractCardType(type) {
    // Standardize card type names
    if (type.toLowerCase().includes('w') || type.toLowerCase().includes('work')) {
      return 'W';
    } else if (type.toLowerCase().includes('b') || type.toLowerCase().includes('bank')) {
      return 'B';
    } else if (type.toLowerCase().includes('i') || type.toLowerCase().includes('investor')) {
      return 'I';
    } else if (type.toLowerCase().includes('l') || type.toLowerCase().includes('life')) {
      return 'L';
    } else if (type.toLowerCase().includes('e') || type.toLowerCase().includes('expeditor')) {
      return 'E';
    }
    
    // Default to returning original type if no match
    return type;
  }

  // Negotiate button functionality moved to player panel 
  // This method is kept as a placeholder but doesn't render anything
  renderNegotiateButton() {
    return null;
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
                    {outcomes.map(([type, value]) => {
                      // Prepare for card draw buttons
                      const showDrawButton = this.shouldShowDrawCardButton(type, value);
                      const cardType = this.extractCardType(type);
                      
                      console.log('SpaceInfo: Outcome:', type, '=', value, 
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
  
  render() {
    const { space, visitType, diceOutcomes, diceRoll, availableMoves, onMoveSelect, onRollDice, hasRolledDice, hasDiceRollSpace } = this.props;
    
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
      { key: 'Fee', label: 'Fee', priority: 'normal', isResource: true }
      // Time is handled separately now in the top right corner
    ];
    
    // Separate high-priority and normal-priority fields
    const highPriorityFields = fieldMappings.filter(field => field.priority === 'high');
    const normalPriorityFields = fieldMappings.filter(field => field.priority === 'normal');
    
    // Get background color based on space phase/type
    const phaseColor = this.getPhaseColor(space.type);
    
    // Create style for the space info card with the phase color and border
    const spaceInfoStyle = {
      backgroundColor: phaseColor,
      border: `2px solid ${this.getBorderColor(space.type)}`,
      position: 'relative' // To allow absolute positioning of time
    };
    
    return (
      <div className="space-info" style={spaceInfoStyle}>
        {/* Time display in top right corner */}
        {space['Time'] && space['Time'] !== 'n/a' && (
          <div className="space-time-display">
            <span className="time-label">Time:</span>
            <span className="time-value">{space['Time']}</span>
          </div>
        )}
        
        <h3>{space.name}</h3>
        <div className="space-type">{space.type}</div>
        
        {/* Add Roll Dice button inside the space info card */}
        {onRollDice && (
          <div className="space-roll-dice-container">
            <button 
              onClick={onRollDice}
              className={`roll-dice-btn ${hasDiceRollSpace ? '' : 'disabled'} ${hasRolledDice ? 'used' : ''}`}
              disabled={!hasDiceRollSpace || hasRolledDice}
              title={hasDiceRollSpace ? 
                    (hasRolledDice ? 'Already rolled dice this turn' : 'Roll dice for this space') : 
                    'This space doesn\'t require a dice roll'}
            >
              {hasRolledDice ? 'Dice Rolled' : 'Roll Dice'}
            </button>
          </div>
        )}
        
        {/* Add Negotiate button */}
        {this.renderNegotiateButton()}
        
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
        
        {/* Display dice outcomes if available - always use renderDiceOutcomes() */}
        {this.renderDiceOutcomes()}
        
        {/* Group cards together with consistent styling */}
        <div className="space-cards-section">
          {normalPriorityFields.filter(field => field.isCard).map(field => {
            // Only show fields that have content
            if (space[field.key] && space[field.key].trim() !== '') {
              // Check if this card should be shown based on conditions
              if (!this.shouldShowCardForCondition(space[field.key])) {
                console.log('SpaceInfo: Not showing card section due to condition not met:', field.label, space[field.key]);
                return null;
              }
              
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

console.log('SpaceInfo.js code execution is finished - modified to handle conditional card drawing');

// Add log statements to debugging methods
function logSpaceNegotiateUsage(spaceName) {
  console.log(`SpaceInfo: Negotiate button shown for space: ${spaceName}`);
};