// CardDisplay.js - Core component for displaying and managing player cards
console.log('CardDisplay.js file is beginning to be used');

// Constants for card limits and management
const CARD_TYPE_LIMIT = 6; // Maximum number of cards per type

// Main CardDisplay component
window.CardDisplay = class CardDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      selectedCardIndex: null,
      selectedCardId: null,  // Store the ID of the selected card
      showCardDetail: false,
      animateCardDraw: false,
      newCardType: null,
      newCardData: null,
      cardTypeFilters: window.CardTypeUtils.generateFilterObject(), // All types enabled by default
      // Add state for W card discard tracking
      requiredWDiscards: 0,
      showDiscardDialog: false,
      discardedCount: 0,
      // Add state for W card replacement
      isReplacingWCards: false,
      requiredWReplacements: 0,
      replacementCount: 0,
      selectedForReplacement: [],  // Array to store indices of selected cards for replacement
      // Add state for card limit enforcement
      showCardLimitDialog: false,
      cardTypeCounts: {},
      cardsOverLimit: []
      // REMOVED: combo system state - Phase 1B cleanup
    };
  }

  // Set required W card discards
  setRequiredWDiscards = (count) => {
    console.log('CardDisplay - setRequiredWDiscards - Required to discard:', count);
    if (count > 0) {
      this.setState({
        requiredWDiscards: count,
        showDiscardDialog: true,
        discardedCount: 0,
        isReplacingWCards: false,
        selectedForReplacement: []
      });
    }
  }
  
  // Set required W card replacements
  setRequiredWReplacements = (count) => {
    console.log('CardDisplay - setRequiredWReplacements - Required to replace:', count);
    if (count > 0) {
      this.setState({
        requiredWReplacements: count,
        showDiscardDialog: true,
        isReplacingWCards: true,
        replacementCount: 0,
        selectedForReplacement: []
      });
    }
  }
  
  // Reset discard tracking
  resetDiscardTracking = () => {
    this.setState({
      requiredWDiscards: 0,
      showDiscardDialog: false,
      discardedCount: 0,
      isReplacingWCards: false,
      requiredWReplacements: 0,
      replacementCount: 0,
      selectedForReplacement: []
    });
  }

  // Show card limit help
  showCardLimitHelp = () => {
    alert(`Card Limit Help:

• Each card type has a limit of ${CARD_TYPE_LIMIT} cards
• Work cards (W) are automatically added to your project
• Other cards (B, I, L, E) can be played when needed
• Click individual cards to discard them
• Use "Discard All" to quickly remove excess cards
• Choose cards strategically - keep the most valuable ones!`);
  }

  componentDidMount() {
    // Load player's cards if any exist
    this.loadPlayerCards();
    
    // Add event listener for game state updates
    window.addEventListener('gameStateUpdated', this.handleGameStateUpdate);
    
    // Add event listener for GameStateManager phase changes
    if (window.GameStateManager) {
      window.GameStateManager.addEventListener('gameStateChanged', this.handlePhaseChange);
    }
    
    // REMOVED: combo detection - Phase 1B cleanup
  }
  
  componentWillUnmount() {
    // Remove event listener to prevent memory leaks
    window.removeEventListener('gameStateUpdated', this.handleGameStateUpdate);
    
    // Remove GameStateManager event listener
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('gameStateChanged', this.handlePhaseChange);
    }
  }
  
  // Handle game state updates
  handleGameStateUpdate = () => {
    // Reload the player's cards when game state is updated
    this.loadPlayerCards();
    // REMOVED: combo detection - Phase 1B cleanup
  }

  // Handle phase changes
  handlePhaseChange = (event) => {
    if (event.data && event.data.changeType === 'phaseChanged') {
      console.log('CardDisplay: Phase changed, forcing re-render');
      // Force a re-render to update phase indicators and card availability
      this.forceUpdate();
    }
  }

  componentDidUpdate(prevProps) {
    // Reload cards if the player has changed
    if (prevProps.playerId !== this.props.playerId) {
      this.loadPlayerCards();
    }
  }
  
  // Handle selecting a card for replacement
  handleSelectForReplacement = (index) => {
    const updated = window.CardActions.handleSelectForReplacement(
      index, 
      this.state.selectedForReplacement, 
      this.state.requiredWReplacements
    );
    
    if (updated) {
      this.setState({ selectedForReplacement: updated });
    }
  }
  
  // Handle confirming the replacement of selected cards
  handleConfirmReplacement = () => {
    const { selectedForReplacement, cards } = this.state;
    const { playerId } = this.props;
    
    const result = window.CardActions.handleConfirmReplacement(
      playerId, 
      selectedForReplacement, 
      cards, 
      {
        drawNewCards: this.handleDrawReplacementCards
      }
    );
    
    if (result) {
      this.setState(result);
    }
  }
  
  // Handle drawing replacement W cards
  handleDrawReplacementCards = (count) => {
    const { playerId } = this.props;
    
    setTimeout(() => {
      for (let i = 0; i < count; i++) {
        const newCard = window.GameState.drawCard(playerId, 'W');
        
        if (newCard) {
          console.log(`CardDisplay - Drew replacement W card: ${newCard['Work Type']}`);
          // Show animation for the new card
          this.setState({
            animateCardDraw: true,
            newCardType: 'W',
            newCardData: newCard
          });
          
          // Hide animation after delay
          setTimeout(() => {
            this.setState({
              animateCardDraw: false,
              newCardType: null,
              newCardData: null
            });
          }, 1500);
        }
      }
      
      // Check if we've completed all replacements
      setTimeout(() => {
        if (this.state.replacementCount >= this.state.requiredWReplacements) {
          console.log('CardDisplay - All required W card replacements completed');
          this.resetDiscardTracking();
          // Reload cards to ensure UI is updated
          this.loadPlayerCards();
          
          // Notify parent component if callback exists
          if (this.props.onWReplacementComplete) {
            this.props.onWReplacementComplete();
          }
        }
      }, 2000);
    }, 500);
  }

  // Count cards by type
  countCardsByType = (cards) => {
    const counts = {};
    
    // Initialize counts for all card types
    ['W', 'B', 'I', 'L', 'E'].forEach(type => {
      counts[type] = 0;
    });
    
    // Count cards by type
    cards.forEach(card => {
      const cardType = card.type || window.CardTypeUtils.detectCardType(card);
      if (cardType) {
        counts[cardType] = (counts[cardType] || 0) + 1;
      }
    });
    
    return counts;
  }
  
  // Check if any card type exceeds the limit
  checkCardLimits = (cards) => {
    const typeCounts = this.countCardsByType(cards);
    const overLimitTypes = [];
    
    Object.keys(typeCounts).forEach(type => {
      if (typeCounts[type] > CARD_TYPE_LIMIT) {
        overLimitTypes.push(type);
      }
    });
    
    return {
      typeCounts,
      overLimitTypes
    };
  }
  
  // Get cards that are over the limit
  getCardsOverLimit = (cards, overLimitTypes) => {
    const cardsOverLimit = [];
    const typeIndices = {};
    
    // Initialize type indices
    overLimitTypes.forEach(type => {
      typeIndices[type] = [];
    });
    
    // Find all cards of over-limit types
    cards.forEach((card, index) => {
      const cardType = card.type || window.CardTypeUtils.detectCardType(card);
      if (overLimitTypes.includes(cardType)) {
        typeIndices[cardType].push(index);
      }
    });
    
    // Add extra cards (beyond the limit) to the list
    Object.keys(typeIndices).forEach(type => {
      const indices = typeIndices[type];
      if (indices.length > CARD_TYPE_LIMIT) {
        // Add indices beyond the limit to the cardsOverLimit array
        cardsOverLimit.push(...indices.slice(CARD_TYPE_LIMIT));
      }
    });
    
    return cardsOverLimit;
  }
  
  // Handle showing card limit dialog
  handleShowCardLimitDialog = () => {
    const { cards } = this.state;
    const { overLimitTypes } = this.checkCardLimits(cards);
    
    if (overLimitTypes.length > 0) {
      const cardsOverLimit = this.getCardsOverLimit(cards, overLimitTypes);
      
      this.setState({
        showCardLimitDialog: true,
        cardsOverLimit
      });
      
      return true;
    }
    
    return false;
  }
  
  // Handle discarding cards over the limit
  handleDiscardCardsOverLimit = (indices) => {
    const { cards } = this.state;
    const { playerId } = this.props;
    
    // Sort indices in descending order to avoid index shifting issues
    const sortedIndices = [...indices].sort((a, b) => b - a);
    
    // Create a copy of cards
    const updatedCards = [...cards];
    
    // Remove cards starting from the highest index
    sortedIndices.forEach(index => {
      if (index >= 0 && index < updatedCards.length) {
        const cardToDiscard = updatedCards[index];
        console.log(`CardDisplay - Discarding card over limit: ${cardToDiscard.type} - ${cardToDiscard.id}`);
        updatedCards.splice(index, 1);
      }
    });
    
    // Update player cards in game state
    const player = window.GameState.players.find(p => p.id === playerId);
    if (player) {
      player.cards = updatedCards;
      window.GameState.saveState();
    }
    
    // Update state
    this.setState({
      cards: updatedCards,
      showCardLimitDialog: false,
      cardsOverLimit: []
    });
  }

  // Load cards from the player's state
  loadPlayerCards = () => {
    const { playerId } = this.props;
    
    // If no player, don't attempt to load cards
    if (!playerId) {
      this.setState({ cards: [] });
      return;
    }
    
    // Find the player in the game state
    const player = window.GameState.players.find(p => p.id === playerId);
    
    if (player && player.cards) {
      // Debug log to check card types
      console.log('CardDisplay - loadPlayerCards - Player cards:', JSON.stringify(player.cards));
      if (player.cards.length > 0) {
        player.cards.forEach((card, index) => {
          console.log(`CardDisplay - Card ${index} - Type: ${card.type}, ID: ${card.id}`);
        });
      }
      
      // Check if any card types exceed the limit
      const { typeCounts, overLimitTypes } = this.checkCardLimits(player.cards);
      
      this.setState({ 
        cards: [...player.cards],
        cardTypeCounts: typeCounts
      });
      
      // Show card limit dialog if any card type exceeds the limit
      if (overLimitTypes.length > 0) {
        const cardsOverLimit = this.getCardsOverLimit(player.cards, overLimitTypes);
        this.setState({
          showCardLimitDialog: true,
          cardsOverLimit
        });
      }
    } else {
      // Initialize with empty array if player has no cards yet
      this.setState({ 
        cards: [],
        cardTypeCounts: this.countCardsByType([])
      });
    }
  }

  // Handle card selection
  handleCardClick = (index) => {
    // Debug log to see which card is being selected
    console.log('CardDisplay - handleCardClick - Index:', index);
    if (this.state.cards[index]) {
      const card = this.state.cards[index];
      console.log('CardDisplay - handleCardClick - Card selected:', card);
      console.log('CardDisplay - handleCardClick - Card type:', card.type);
      console.log('CardDisplay - handleCardClick - Card ID:', card.id);
      
      // Store the card ID to ensure we're always referencing the correct card
      this.setState(prevState => {
        const selectedIndex = prevState.selectedCardIndex === index ? null : index;
        const selectedCardId = selectedIndex !== null ? card.id : null;
        
        return {
          selectedCardIndex: selectedIndex,
          selectedCardId: selectedCardId,
          showCardDetail: selectedIndex !== null // Only show detail if a card is selected
        };
      });
    } else {
      console.warn('CardDisplay - handleCardClick - Invalid card index:', index);
    }
  }

  // Handle playing a card
  handlePlayCard = () => {
    const { selectedCardIndex, cards } = this.state;
    const { playerId, onCardPlayed } = this.props;
    
    const result = window.CardActions.handlePlayCard(
      playerId, 
      selectedCardIndex, 
      cards, 
      { onCardPlayed }
    );
    
    if (result) {
      // Note: Card removal is handled by GameStateManager, so don't update cards array here
      // Just update UI state (selectedCardIndex, showCardDetail, etc.)
      this.setState({
        ...result
      });
      
      // The cards will be updated through the gameStateUpdated event handler
    }
  }

  // Handle discarding a card
  handleDiscardCard = () => {
    const { selectedCardIndex, cards, requiredWDiscards, discardedCount, showDiscardDialog } = this.state;
    const { playerId, onCardDiscarded, onWDiscardComplete } = this.props;
    
    const result = window.CardActions.handleDiscardCard(
      playerId, 
      selectedCardIndex, 
      cards, 
      { requiredWDiscards, discardedCount, showDiscardDialog }, 
      { 
        onCardDiscarded, 
        onWDiscardComplete, 
        resetDiscardTracking: this.resetDiscardTracking 
      }
    );
    
    if (result) {
      // Update card counts after discarding a card
      const updatedCounts = this.countCardsByType(result.cards);
      
      this.setState({
        ...result,
        cardTypeCounts: updatedCounts
      });
    }
  }

  // Handle discarding a card directly from the dialog
  handleDialogDiscard = (cardIndex) => {
    const { cards, requiredWDiscards, discardedCount } = this.state;
    const { playerId, onCardDiscarded, onWDiscardComplete } = this.props;
    
    const result = window.CardActions.handleDialogDiscard(
      playerId, 
      cardIndex, 
      cards, 
      { requiredWDiscards, discardedCount }, 
      { 
        onCardDiscarded, 
        onWDiscardComplete, 
        resetDiscardTracking: this.resetDiscardTracking 
      }
    );
    
    if (result) {
      // Update card counts after discarding a card
      const updatedCounts = this.countCardsByType(result.cards);
      
      this.setState({
        ...result,
        cardTypeCounts: updatedCounts
      });
    }
  }

  // Handle drawing a new card
  drawCard = (cardType, cardData) => {
    const { playerId } = this.props;
    
    console.log('CardDisplay - drawCard - Drawing card of type:', cardType, 'with data:', cardData);
    
    // Show animation
    this.setState({
      animateCardDraw: true,
      newCardType: cardType,
      newCardData: cardData
    });
    
    // After animation completes, add the card to player's hand
    setTimeout(() => {
      const updatedCards = window.CardActions.drawCard(playerId, cardType, cardData);
      
      // Check card limits
      let showLimitDialog = false;
      let cardsOverLimit = [];
      let typeCounts = {};
      
      if (updatedCards) {
        const { typeCounts: newCounts, overLimitTypes } = this.checkCardLimits(updatedCards);
        typeCounts = newCounts;
        
        if (overLimitTypes.length > 0) {
          showLimitDialog = true;
          cardsOverLimit = this.getCardsOverLimit(updatedCards, overLimitTypes);
        }
      }
      
      // Update state
      if (updatedCards) {
        this.setState({
          cards: updatedCards,
          animateCardDraw: false,
          newCardType: null,
          newCardData: null,
          cardTypeCounts: typeCounts,
          showCardLimitDialog: showLimitDialog,
          cardsOverLimit: cardsOverLimit
        });
      } else {
        // Just hide animation if card couldn't be drawn
        this.setState({
          animateCardDraw: false,
          newCardType: null,
          newCardData: null
        });
      }
    }, 1500); // Animation duration
  }
  
  // Handle toggling card type filters
  toggleCardTypeFilter = (cardType) => {
    this.setState(prevState => ({
      cardTypeFilters: {
        ...prevState.cardTypeFilters,
        [cardType]: !prevState.cardTypeFilters[cardType]
      }
    }));
  }

  // Handle closing the card detail view
  handleCloseCardDetail = () => {
    this.setState({
      showCardDetail: false,
      selectedCardIndex: null,
      selectedCardId: null
    });
  }

  // REMOVED: Combo detection methods - Phase 1B cleanup
  // TODO: Implement combo system in future phases
  
  // Check if a phase restriction value is a valid CSV phase name
  isValidPhase = (phaseRestriction) => {
    if (!phaseRestriction) return false;
    
    // Valid CSV phase names from Spaces.csv
    const validPhases = ['SETUP', 'OWNER', 'FUNDING', 'DESIGN', 'CONSTRUCTION', 'REGULATORY', 'END'];
    
    // Also accept universal variations (removed color references)
    const validVariations = ['Any', 'Any Phase', 'Regulatory Review'];
    
    return validPhases.includes(phaseRestriction.toUpperCase()) || validVariations.includes(phaseRestriction);
  }

  // Get a CSS class name for the player color
  getPlayerColorClass = (playerId) => {
    if (!playerId || !window.GameState?.players) {
      return 'player-border-purple'; // Default color
    }
    
    const player = window.GameState.players.find(p => p.id === playerId);
    if (!player || !player.color) {
      return 'player-border-purple';
    }
    
    // Map player color to a CSS class
    const colorMap = {
      '#ff5722': 'player-border-red',
      '#4caf50': 'player-border-green',
      '#2196f3': 'player-border-blue',
      '#ffeb3b': 'player-border-yellow',
      '#9c27b0': 'player-border-purple',
      '#ff9800': 'player-border-orange',
      '#e91e63': 'player-border-pink',
      '#009688': 'player-border-teal'
    };
    
    return colorMap[player.color] || 'player-border-purple';
  }

  // Render enhanced card metadata
  renderCardMetadata = (card) => {
    if (!card) return null;

    const metadataElements = [];

    // Target information
    if (card.target && card.target !== 'Self') {
      metadataElements.push(
        React.createElement('span', { 
          key: 'target',
          className: 'card-metadata-item card-target' 
        }, `Target: ${card.target}`)
      );
    }

    // Scope information
    if (card.scope && card.scope !== 'Single') {
      metadataElements.push(
        React.createElement('span', { 
          key: 'scope',
          className: 'card-metadata-item card-scope' 
        }, `Scope: ${card.scope}`)
      );
    }

    // Phase restriction
    if (card.phase_restriction && card.phase_restriction !== 'Any') {
      metadataElements.push(
        React.createElement('span', { 
          key: 'phase',
          className: 'card-metadata-item card-phase' 
        }, `Phase: ${card.phase_restriction}`)
      );
    }

    // Duration
    if (card.duration && card.duration !== 'Immediate') {
      const durationText = card.duration_count ? 
        `${card.duration} (${card.duration_count})` : 
        card.duration;
      metadataElements.push(
        React.createElement('span', { 
          key: 'duration',
          className: 'card-metadata-item card-duration' 
        }, `Duration: ${durationText}`)
      );
    }

    // Cost information
    if (card.money_cost && card.money_cost > 0) {
      metadataElements.push(
        React.createElement('span', { 
          key: 'cost',
          className: 'card-metadata-item card-cost' 
        }, `Cost: $${card.money_cost.toLocaleString()}`)
      );
    }

    // Effects preview
    const effects = [];
    if (card.money_effect && card.money_effect !== 0) {
      effects.push(`$${card.money_effect > 0 ? '+' : ''}${card.money_effect.toLocaleString()}`);
    }
    if (card.time_effect && card.time_effect !== 0) {
      effects.push(`Time ${card.time_effect > 0 ? '+' : ''}${card.time_effect}`);
    }
    if (card.draw_cards && card.draw_cards > 0) {
      effects.push(`Draw ${card.draw_cards}`);
    }
    if (card.discard_cards && card.discard_cards > 0) {
      effects.push(`Discard ${card.discard_cards}`);
    }

    if (effects.length > 0) {
      metadataElements.push(
        React.createElement('span', { 
          key: 'effects',
          className: 'card-metadata-item card-effects' 
        }, effects.join(', '))
      );
    }

    // Conditional logic indicator
    if (card.conditional_logic) {
      metadataElements.push(
        React.createElement('span', { 
          key: 'conditional',
          className: 'card-metadata-item card-conditional' 
        }, 'Conditional')
      );
    }

    // Only render if we have metadata to show
    if (metadataElements.length === 0) {
      return null;
    }

    return React.createElement('div', { 
      className: 'card-metadata' 
    }, metadataElements);
  }
  
  // Render the card limit dialog
  renderCardLimitDialog = () => {
    const { cards, cardsOverLimit } = this.state;
    
    if (!cards || cards.length === 0 || !cardsOverLimit || cardsOverLimit.length === 0) {
      return null;
    }
    
    // Get cards that exceed the limit
    const excessCards = cardsOverLimit.map(index => ({
      card: cards[index],
      index
    })).filter(item => item.card);
    
    return (
      <div className="card-limit-dialog-overlay">
        <div className="card-limit-dialog">
          <div className="card-limit-dialog-content">
            <div className="dialog-header">
              <h3 className="card-limit-dialog-title">⚠️ Card Limit Exceeded</h3>
              <p className="card-limit-dialog-subtitle">
                You have exceeded the limit of <strong>{CARD_TYPE_LIMIT} cards per type</strong>. 
                <br />Select cards to discard or use the quick actions below.
              </p>
            </div>
            
            <div className="dialog-stats">
              <div className="stat-item">
                <span className="stat-label">Total Excess:</span>
                <span className="stat-value">{excessCards.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Card Limit:</span>
                <span className="stat-value">{CARD_TYPE_LIMIT}</span>
              </div>
            </div>
            
            <div className="card-limit-cards-grid">
              {excessCards.map(item => (
                <div 
                  key={item.card.id || item.index}
                  className={`dialog-card clickable-card`}
                  onClick={() => this.handleDialogDiscard(item.index)}
                  title="Click to discard this card"
                >
                  <div className="discard-indicator">❌</div>
                  <div 
                    className={`card-header card-header-${item.card.type.toLowerCase()}`}
                  >
                    {window.CardTypeUtils.getCardTypeName(item.card.type)}
                  </div>
                  
                  <div className="card-content">
                    {window.CardTypeUtils.getCardPrimaryField(item.card) && (
                      <div className="card-field card-name">{window.CardTypeUtils.getCardPrimaryField(item.card)}</div>
                    )}
                    
                    {window.CardTypeUtils.getCardSecondaryField(item.card) && (
                      <div className="card-description">
                        {window.CardTypeUtils.getCardSecondaryField(item.card).length > 40 
                          ? `${window.CardTypeUtils.getCardSecondaryField(item.card).substring(0, 40)}...` 
                          : window.CardTypeUtils.getCardSecondaryField(item.card)
                        }
                      </div>
                    )}
                    
                    {/* Show card-specific info */}
                    {item.card.type === 'B' && item.card.loan_amount && (
                      <div className="card-quick-info">💰 {window.CardTypeUtils.formatCurrency(item.card.loan_amount)}</div>
                    )}
                    {item.card.type === 'I' && item.card.investment_amount && (
                      <div className="card-quick-info">📈 {window.CardTypeUtils.formatCurrency(item.card.investment_amount)}</div>
                    )}
                    {item.card.type === 'W' && item.card.work_cost && (
                      <div className="card-quick-info">🔧 {window.CardTypeUtils.formatCurrency(item.card.work_cost)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="dialog-buttons">
              <button 
                className="dialog-action-btn dialog-discard-all-btn" 
                onClick={() => this.handleDiscardCardsOverLimit(cardsOverLimit)}
              >
                🗑️ Discard All Excess Cards
              </button>
              <button 
                className="dialog-action-btn dialog-help-btn" 
                onClick={() => this.showCardLimitHelp()}
              >
                ❓ Help
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the card type count indicators
  renderCardTypeCounts = () => {
    const { cardTypeCounts } = this.state;
    
    if (!cardTypeCounts) {
      return null;
    }
    
    return (
      <div className="card-limit-indicator">
        {Object.keys(cardTypeCounts).map(type => (
          <div key={type} className="card-type-count">
            <div 
            className={`card-type-count-indicator card-color-${type.toLowerCase()}`}
            ></div>
            <div className={`card-type-count-text ${cardTypeCounts[type] > CARD_TYPE_LIMIT ? 'card-type-count-warning' : ''}`}>
              {window.CardTypeUtils.getCardTypeName(type)}: {cardTypeCounts[type]}/{CARD_TYPE_LIMIT}
            </div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { 
      cards, selectedCardIndex, selectedCardId, showCardDetail, 
      animateCardDraw, cardTypeFilters, showDiscardDialog, showCardLimitDialog,
      newCardType, newCardData,
      isReplacingWCards, requiredWDiscards, requiredWReplacements,
      selectedForReplacement, discardedCount, cardTypeCounts
    } = this.state;
    // REMOVED: combo-related state destructuring - Phase 1B cleanup
    
    const { visible, playerId } = this.props;
    
    // Get player color for styling
    const playerColorClass = this.getPlayerColorClass(playerId);
    
    // Don't render if component is not visible
    if (!visible) {
      return null;
    }
    
    // Find the selected card (by index or ID)
    let selectedCard = null;
    
    if (selectedCardId) {
      // First try to find by ID which is more reliable
      selectedCard = cards.find(c => c.id === selectedCardId);
    } else if (selectedCardIndex !== null && cards[selectedCardIndex]) {
      // Fall back to index if ID not available
      selectedCard = cards[selectedCardIndex];
    }
    
    // Filter cards based on selected types
    const filteredCards = cards.filter(card => cardTypeFilters[card.type]);
    
    return (
      <div className={`card-display-container ${playerColorClass}`}>
        <div className="card-display-header">
          <h3>Cards ({filteredCards.length})</h3>
          
          {/* Current phase indicator */}
          <div className="current-phase-indicator">
            <span className="phase-label">Current Phase:</span>
            <span className="phase-value">{window.GameStateManager?.currentPhase || 'Unknown'}</span>
          </div>
        </div>
        
        {/* Card type count indicators */}
        {this.renderCardTypeCounts()}
        
        {/* Card type filters */}
        <div className="card-filters">
          {Object.keys(cardTypeFilters).map(cardType => (
            <button
              key={cardType}
              className={`card-filter-btn card-filter-btn-${cardType.toLowerCase()} ${cardTypeFilters[cardType] ? 'active' : ''}`}
              onClick={() => this.toggleCardTypeFilter(cardType)}
            >
              {window.CardTypeUtils.getCardTypeName(cardType)}
            </button>
          ))}
        </div>
        
        {/* Cards display */}
        {filteredCards.length > 0 ? (
          <div className="cards-container">
            {filteredCards.map((card, index) => {
              // Get the actual index in the original cards array
              const actualIndex = cards.findIndex(c => c.id === card.id);
              console.log(`CardDisplay - Mapping card ${index} to actual index ${actualIndex} with type ${card.type}`);
              
              // Ensure card type is valid
              if (!card.type && card.id) {
                const idParts = card.id.split('-');
                if (idParts.length >= 1 && idParts[0].length === 1) {
                  card.type = idParts[0];
                }
              }
              
              // Default to E if type is invalid
              if (!card.type || !['W', 'B', 'I', 'L', 'E'].includes(card.type)) {
                card.type = 'E';
              }
              
              // Highlight W cards if we're in discard mode
              const isDiscardMode = showDiscardDialog && card.type === 'W';
              // Add warning class if card type exceeds limit
              const isOverLimit = cardTypeCounts[card.type] > CARD_TYPE_LIMIT;
              
              // Check if card is available in current phase
              const isPhaseAvailable = window.CardTypeUtils.isCardAvailableInCurrentPhase(card);
              
              // REMOVED: combo and chain status checks - Phase 1B cleanup
              
              // Build CSS classes for phase availability
              let additionalClasses = '';
              if (!isPhaseAvailable) {
                additionalClasses += ' phase-disabled';
              }
              
              return (
                <div 
                  key={card.id || index}
                  className={`card card-type-${card.type.toLowerCase()} 
                    ${selectedCardIndex === actualIndex ? 'selected' : ''} 
                    ${isDiscardMode ? 'discard-highlight' : ''} 
                    ${isOverLimit ? 'card-exceed-limit' : ''}${additionalClasses}`}
                  onClick={() => isPhaseAvailable ? this.handleCardClick(actualIndex) : null}
                  title={!isPhaseAvailable ? `This card is only available during the ${card.phase_restriction} phase` : ''}
                >
                  {/* REMOVED: Combo indicator - Phase 1B cleanup */}
                  
                  <div className={`card-header card-header-${card.type.toLowerCase()}`}>
                    {window.CardTypeUtils.getCardTypeName(card.type)}
                    {/* Phase restriction indicator */}
                    {card.phase_restriction && card.phase_restriction !== 'Any' && this.isValidPhase(card.phase_restriction) && (
                      <div className={`phase-indicator ${isPhaseAvailable ? 'phase-available' : 'phase-unavailable'}`}>
                        📅 {card.phase_restriction}
                      </div>
                    )}
                  </div>
                  
                  <div className="card-content">
                    {window.CardTypeUtils.getCardPrimaryField(card) && (
                      <div className="card-field card-name">{window.CardTypeUtils.getCardPrimaryField(card)}</div>
                    )}
                    
                    {window.CardTypeUtils.getCardSecondaryField(card) && (
                      <div className="card-description">
                        {window.CardTypeUtils.getCardSecondaryField(card).length > 50 
                          ? `${window.CardTypeUtils.getCardSecondaryField(card).substring(0, 50)}...` 
                          : window.CardTypeUtils.getCardSecondaryField(card)
                        }
                      </div>
                    )}
                    
                    {/* Add key card information based on type and phase */}
                    {card.type === 'B' && card.loan_amount && (
                      <div className="card-amount">
                        {window.GameStateManager?.currentPhase === 'SETUP' ? (
                          <span className="seed-money">🌱 {window.CardTypeUtils.formatCurrency(card.loan_amount)} (Seed Money)</span>
                        ) : (
                          <span>💰 {window.CardTypeUtils.formatCurrency(card.loan_amount)}</span>
                        )}
                      </div>
                    )}
                    
                    {card.type === 'I' && card.investment_amount && (
                      <div className="card-amount">
                        {window.GameStateManager?.currentPhase === 'SETUP' ? (
                          <span className="seed-money">🌱 {window.CardTypeUtils.formatCurrency(card.investment_amount)} (Seed Money)</span>
                        ) : (
                          <span>📈 {window.CardTypeUtils.formatCurrency(card.investment_amount)}</span>
                        )}
                      </div>
                    )}
                    
                    {card.type === 'W' && card.work_cost && (
                      <div className="card-amount">
                        🔧 {window.CardTypeUtils.formatCurrency(card.work_cost)}
                      </div>
                    )}
                    
                    {card.immediate_effect && (
                      <div className="card-effect">
                        ⚡ {card.immediate_effect}
                      </div>
                    )}
                    
                    {/* Enhanced metadata display */}
                    {this.renderCardMetadata(card)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-cards-message">
            <p>No cards in your hand yet.</p>
            <p>You'll draw cards as you progress through the game.</p>
          </div>
        )}
        
        {/* Card detail overlay */}
        {showCardDetail && selectedCard && (() => {
          const CardDetailView = window.CardDetailView;
          return (
            <CardDetailView
              card={selectedCard}
              onClose={this.handleCloseCardDetail}
              onPlayCard={this.handlePlayCard}
              onDiscardCard={this.handleDiscardCard}
            />
          );
        })()}
        
        {/* Card draw animation */}
        {animateCardDraw && newCardType && newCardData && (() => {
          const CardDrawAnimation = window.CardDrawAnimation;
          return (
            <CardDrawAnimation 
              cardType={newCardType} 
              cardData={newCardData} 
            />
          );
        })()}
        
        {/* Work card dialog overlay */}
        {showDiscardDialog && (() => {
          const WorkCardDialog = window.WorkCardDialog;
          return (
            <WorkCardDialog
              cards={cards}
              isReplacingWCards={isReplacingWCards}
              requiredWDiscards={requiredWDiscards}
              requiredWReplacements={requiredWReplacements}
              selectedForReplacement={selectedForReplacement}
              discardedCount={discardedCount}
              onDialogDiscard={this.handleDialogDiscard}
              onSelectForReplacement={this.handleSelectForReplacement}
              onConfirmReplacement={this.handleConfirmReplacement}
            />
          );
        })()}
        
        {/* Card limit dialog */}
        {showCardLimitDialog && this.renderCardLimitDialog()}
        
        {/* REMOVED: Combo builder UI - Phase 1B cleanup */}
      </div>
    );
  }

  // REMOVED: renderComboBuilder method - Phase 1B cleanup
}

console.log('CardDisplay.js code execution finished');
