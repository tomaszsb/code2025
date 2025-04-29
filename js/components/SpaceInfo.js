// SpaceInfo.js file is beginning to be used
console.log('SpaceInfo.js file is beginning to be used');

/**
 * SpaceInfo component - Displays information about a space on the board
 * 
 * This component has been refactored to follow the manager pattern:
 * - Uses SpaceInfoManager for state management and business logic
 * - Communicates through GameStateManager event system
 * - Properly handles cleanup to prevent memory leaks
 * - Uses CSS classes instead of inline styles
 */
window.SpaceInfo = class SpaceInfo extends React.Component {
  constructor(props) {
    super(props);
    
    console.log('SpaceInfo: Constructor initialized');
    
    // Minimal state - only tracking render-specific items
    // All game state is managed by SpaceInfoManager
    this.state = {
      renderKey: 0 // Used to force re-renders when needed
    };
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      resetButtons: this.handleResetButtons.bind(this),
      turnChanged: this.handleTurnChanged.bind(this),
      spaceChanged: this.handleSpaceChanged.bind(this)
    };
    
    console.log('SpaceInfo: Constructor completed');
  }
  
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
  
  componentDidUpdate(prevProps) {
    // Log space changes
    if (prevProps.space?.id !== this.props.space?.id) {
      console.log('SpaceInfo: Space changed from', prevProps.space?.name, 'to', this.props.space?.name);
    }
  }
  
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
  
  // Handle the reset buttons event
  handleResetButtons() {
    console.log('SpaceInfo: Received resetSpaceInfoButtons event, forcing refresh');
    // Force a re-render
    this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
  }
  
  // Handle turn change events
  handleTurnChanged() {
    console.log('SpaceInfo: Handling turn changed event');
    // Force a re-render
    this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
  }
  
  // Handle space change events
  handleSpaceChanged() {
    console.log('SpaceInfo: Handling space changed event');
    // Force a re-render
    this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
  }
  
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
  
  // Render available moves
  renderAvailableMoves() {
    const { availableMoves, onMoveSelect, selectedMoveId } = this.props;
    
    if (!availableMoves || availableMoves.length === 0) {
      return null;
    }
    
    console.log('SpaceInfo: Rendering available moves:', availableMoves.map(m => m.name).join(', '));
    console.log('SpaceInfo: Selected move ID:', selectedMoveId);
    
    return (
      <div className="space-available-moves">
        <div className="space-section-label">Available Moves:</div>
        <div className="available-moves-list" data-testid="moves-list">
          {availableMoves.map(move => {
            // Determine if this move is selected
            const isSelected = selectedMoveId && selectedMoveId === move.id;
            
            return (
              <button 
                key={move.id}
                className={`move-button primary-move-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  console.log('SpaceInfo: Move button clicked:', move.name, move.id);
                  if (onMoveSelect) {
                    onMoveSelect(move.id);
                  }
                }}
              >
                {move.name}
              </button>
            );
          })}
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
      const currentPlayer = window.GameStateManager ? window.GameStateManager.getCurrentPlayer() : null;
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

  // Render a button to draw cards - using SpaceInfoManager
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
    
    // Log the button state for debugging
    console.log(`SpaceInfo: Button ${buttonId} used status:`, isButtonUsed);
    
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
    // Force re-render when state.renderKey changes
    const { renderKey } = this.state;
    const { space, visitType, diceOutcomes, diceRoll, availableMoves, onMoveSelect, onRollDice, hasRolledDice, hasDiceRollSpace } = this.props;
    
    console.log('SpaceInfo render - diceRoll:', diceRoll, 'diceOutcomes:', diceOutcomes);
    console.log('SpaceInfo render - availableMoves:', availableMoves?.length || 0, 'onMoveSelect:', !!onMoveSelect);
    
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
    
    // Get CSS class for space type/phase
    const phaseClass = this.getPhaseClass(space.type);
    
    return (
      <div className={`space-info ${phaseClass}`} key={renderKey}>
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
        
        {/* If there's an OWNER-FUND-INITIATION move showing in the blue button but not as a clickable button */}
        {!availableMoves?.some(move => move.name.includes('OWNER-FUND-INITIATION')) && 
         space?.name === 'OWNER-SCOPE-INITIATION' && 
         onMoveSelect && (
          <div className="space-available-moves">
            <div className="space-section-label">Additional Move:</div>
            <button 
              className="move-button primary-move-btn"
              onClick={() => {
                console.log('SpaceInfo: OWNER-FUND-INITIATION button clicked');
                // Find the OWNER-FUND-INITIATION space using GameStateManager
                if (window.GameStateManager) {
                  const fundInitSpace = window.GameStateManager.spaces.find(s => s.name === 'OWNER-FUND-INITIATION');
                  if (fundInitSpace) {
                    console.log('SpaceInfo: Found OWNER-FUND-INITIATION space:', fundInitSpace.id);
                    onMoveSelect(fundInitSpace.id);
                  } else {
                    console.error('SpaceInfo: OWNER-FUND-INITIATION space not found');
                  }
                }
              }}
            >
              OWNER-FUND-INITIATION
            </button>
          </div>
        )}
        
        {/* Display dice outcomes if available */}
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

console.log('SpaceInfo.js code execution finished');
