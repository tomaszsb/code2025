// CardDisplay.js - Core component for displaying and managing player cards
console.log('CardDisplay.js file is beginning to be used');

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
      cardTypeFilters: {
        W: true, // Work Type
        B: true, // Bank
        I: true, // Investor
        L: true, // Life
        E: true  // Expeditor
      },
      // Add state for W card discard tracking
      requiredWDiscards: 0,
      showDiscardDialog: false,
      discardedCount: 0,
      // Add state for W card replacement
      isReplacingWCards: false,
      requiredWReplacements: 0,
      replacementCount: 0,
      selectedForReplacement: []  // Array to store indices of selected cards for replacement
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

  componentDidMount() {
    // Load player's cards if any exist
    this.loadPlayerCards();
    
    // Add event listener for game state updates
    window.addEventListener('gameStateUpdated', this.handleGameStateUpdate);
  }
  
  componentWillUnmount() {
    // Remove event listener to prevent memory leaks
    window.removeEventListener('gameStateUpdated', this.handleGameStateUpdate);
  }
  
  // Handle game state updates
  handleGameStateUpdate = () => {
    // Reload the player's cards when game state is updated
    this.loadPlayerCards();
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
      
      this.setState({ cards: [...player.cards] });
    } else {
      // Initialize with empty array if player has no cards yet
      this.setState({ cards: [] });
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
      this.setState(result);
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
      this.setState(result);
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
      this.setState(result);
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
      
      // Update state
      if (updatedCards) {
        this.setState({
          cards: updatedCards,
          animateCardDraw: false,
          newCardType: null,
          newCardData: null
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

  render() {
    const { 
      cards, selectedCardIndex, selectedCardId, showCardDetail, 
      animateCardDraw, cardTypeFilters, showDiscardDialog,
      newCardType, newCardData,
      isReplacingWCards, requiredWDiscards, requiredWReplacements,
      selectedForReplacement, discardedCount 
    } = this.state;
    
    const { visible, playerId } = this.props;
    
    // Get player color for styling
    let playerColor = '#9c27b0'; // Default color
    if (playerId && window.GameState?.players) {
      const player = window.GameState.players.find(p => p.id === playerId);
      if (player && player.color) {
        playerColor = player.color;
      }
    }
    
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
      <div className="card-display-container" style={{ borderLeft: `4px solid ${playerColor}` }}>
        <h3>Cards ({filteredCards.length})</h3>
        
        {/* Card type filters */}
        <div className="card-filters">
          {Object.keys(cardTypeFilters).map(cardType => (
            <button
              key={cardType}
              className={`card-filter-btn ${cardTypeFilters[cardType] ? 'active' : ''}`}
              style={{ 
                backgroundColor: cardTypeFilters[cardType] ? window.CardTypeUtils.getCardColor(cardType) : '#f0f0f0',
                color: cardTypeFilters[cardType] ? '#ffffff' : '#333333'
              }}
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
              
              return (
                <div 
                  key={card.id || index}
                  className={`card ${selectedCardIndex === actualIndex ? 'selected' : ''} ${isDiscardMode ? 'discard-highlight' : ''}`}
                  style={{ 
                    borderColor: window.CardTypeUtils.getCardColor(card.type),
                    // Add pulsing effect for W cards during discard mode
                    animation: isDiscardMode ? 'pulse 1.5s infinite' : 'none'
                  }}
                  onClick={() => this.handleCardClick(actualIndex)}
                >
                  <div 
                    className="card-header"
                    style={{ backgroundColor: window.CardTypeUtils.getCardColor(card.type) }}
                  >
                    {window.CardTypeUtils.getCardTypeName(card.type)}
                  </div>
                  
                  <div className="card-content">
                    {window.CardTypeUtils.getCardPrimaryField(card) && (
                      <div className="card-field">{window.CardTypeUtils.getCardPrimaryField(card)}</div>
                    )}
                    
                    {window.CardTypeUtils.getCardSecondaryField(card) && (
                      <div className="card-description">
                        {window.CardTypeUtils.getCardSecondaryField(card).length > 60 
                          ? `${window.CardTypeUtils.getCardSecondaryField(card).substring(0, 60)}...` 
                          : window.CardTypeUtils.getCardSecondaryField(card)
                        }
                      </div>
                    )}
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
        {showCardDetail && selectedCard && (
          <window.CardDetailView
            card={selectedCard}
            onClose={this.handleCloseCardDetail}
            onPlayCard={this.handlePlayCard}
            onDiscardCard={this.handleDiscardCard}
          />
        )}
        
        {/* Card draw animation */}
        {animateCardDraw && newCardType && newCardData && (
          <window.CardDrawAnimation 
            cardType={newCardType} 
            cardData={newCardData} 
          />
        )}
        
        {/* Work card dialog overlay */}
        {showDiscardDialog && (
          <window.WorkCardDialog
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
        )}
        
        {/* Add CSS for discard mode animation */}
        <style>
          {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
            100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
          }
          
          .discard-highlight {
            transform: scale(1.02);
            transition: transform 0.2s ease;
          }
          `}
        </style>
      </div>
    );
  }
}

console.log('CardDisplay.js code execution is finished');
