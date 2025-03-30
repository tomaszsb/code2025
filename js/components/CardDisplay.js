// CardDisplay.js - Component for displaying and managing player cards
console.log('CardDisplay.js file is being processed');

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
      }
    };
  }

  componentDidMount() {
    // Load player's cards if any exist
    this.loadPlayerCards();
  }

  componentDidUpdate(prevProps) {
    // Reload cards if the player has changed
    if (prevProps.playerId !== this.props.playerId) {
      this.loadPlayerCards();
    }
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
    
    if (selectedCardIndex === null || !cards[selectedCardIndex]) {
      return;
    }
    
    // Get the selected card
    const cardToPlay = cards[selectedCardIndex];
    
    // Remove the card from the player's hand
    const updatedCards = [...cards];
    updatedCards.splice(selectedCardIndex, 1);
    
    // Update state
    this.setState({
      cards: updatedCards,
      selectedCardIndex: null,
      showCardDetail: false
    });
    
    // Update the player's cards in the game state
    const { playerId } = this.props;
    const player = window.GameState.players.find(p => p.id === playerId);
    
    if (player) {
      player.cards = updatedCards;
      window.GameState.saveState();
    }
    
    // Call the callback with the played card
    if (this.props.onCardPlayed) {
      this.props.onCardPlayed(cardToPlay);
    }
  }

  // Handle discarding a card
  handleDiscardCard = () => {
    const { selectedCardIndex, cards } = this.state;
    
    if (selectedCardIndex === null || !cards[selectedCardIndex]) {
      return;
    }
    
    // Get the selected card
    const cardToDiscard = cards[selectedCardIndex];
    
    // Remove the card from the player's hand
    const updatedCards = [...cards];
    updatedCards.splice(selectedCardIndex, 1);
    
    // Update state
    this.setState({
      cards: updatedCards,
      selectedCardIndex: null,
      showCardDetail: false
    });
    
    // Update the player's cards in the game state
    const { playerId } = this.props;
    const player = window.GameState.players.find(p => p.id === playerId);
    
    if (player) {
      player.cards = updatedCards;
      window.GameState.saveState();
    }
    
    // Call the callback with the discarded card
    if (this.props.onCardDiscarded) {
      this.props.onCardDiscarded(cardToDiscard);
    }
  }

  // Handle drawing a new card
  drawCard = (cardType, cardData) => {
    console.log('CardDisplay - drawCard - Drawing card of type:', cardType, 'with data:', cardData);
    
    // Show animation
    this.setState({
      animateCardDraw: true,
      newCardType: cardType,
      newCardData: cardData
    });
    
    // After animation completes, add the card to player's hand
    setTimeout(() => {
      // Get current cards
      const { cards } = this.state;
      
      // Create a new card object
      const newCard = {
        id: `${cardType}-card-${Date.now()}`, // Unique ID with type prefix
        type: cardType, // Explicitly set the type
        ...cardData
      };
      
      console.log('CardDisplay - drawCard - Created new card:', newCard);
      
      // Add card to hand
      const updatedCards = [...cards, newCard];
      
      // Update state
      this.setState({
        cards: updatedCards,
        animateCardDraw: false,
        newCardType: null,
        newCardData: null
      });
      
      // Update player state
      const { playerId } = this.props;
      const player = window.GameState.players.find(p => p.id === playerId);
      
      if (player) {
        player.cards = updatedCards;
        window.GameState.saveState();
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
  
  // Get the appropriate card color based on type
  getCardColor = (cardType) => {
    switch (cardType) {
      case 'W': return '#4285f4'; // Blue for Work Type
      case 'B': return '#ea4335'; // Red for Bank
      case 'I': return '#fbbc05'; // Yellow for Investor
      case 'L': return '#34a853'; // Green for Life
      case 'E': return '#8e44ad'; // Purple for Expeditor
      default: return '#777777';  // Gray for unknown
    }
  }
  
  // Get the full card type name
  getCardTypeName = (cardType) => {
    switch (cardType) {
      case 'W': return 'Work Type';
      case 'B': return 'Bank';
      case 'I': return 'Investor';
      case 'L': return 'Life';
      case 'E': return 'Expeditor';
      default: return 'Unknown';
    }
  }
  
  // Get the primary display field for a card based on type
  getCardPrimaryField = (card) => {
    if (!card) return '';
    
    switch (card.type) {
      case 'W': return card['Work Type'] || '';
      case 'B': return card['Card Name'] || '';
      case 'I': return card['Amount'] ? `${card['Amount']}` : '';
      case 'L': return card['Card Name'] || '';
      case 'E': return card['Card Name'] || '';
      default: return '';
    }
  }
  
  // Get the secondary display field for a card based on type
  getCardSecondaryField = (card) => {
    if (!card) return '';
    
    switch (card.type) {
      case 'W': return card['Job Description'] || '';
      case 'B': return card['Effect'] || '';
      case 'I': return card['Description'] || '';
      case 'L': return card['Effect'] || '';
      case 'E': return card['Effect'] || '';
      default: return '';
    }
  }
  
  // Get additional fields to display for a card type in the detail view
  getCardDetailFields = (card) => {
    if (!card) return [];
    
    console.log('CardDisplay - getCardDetailFields - Card:', JSON.stringify(card));
    console.log('CardDisplay - getCardDetailFields - Card type:', card.type);
    
    // Make a defensive copy of the card type to prevent any reference issues
    const cardType = String(card.type || '');
    console.log('CardDisplay - getCardDetailFields - Using card type:', cardType);
    
    switch (cardType) {
      case 'W':
        console.log('CardDisplay - getCardDetailFields - Returning Work Type fields');
        return [
          { label: 'Work Type', value: card['Work Type'] },
          { label: 'Description', value: card['Job Description'] },
          { label: 'Estimated Cost', value: card['Estimated Job Costs'] ? `${card['Estimated Job Costs']}` : '' }
        ];
      case 'B':
        console.log('CardDisplay - getCardDetailFields - Returning Bank fields');
        return [
          { label: 'Card Name', value: card['Card Name'] },
          { label: 'Distribution Level', value: card['Distribution Level'] },
          { label: 'Amount', value: card['Amount'] ? `${card['Amount']}` : '' },
          { label: 'Loan Percentage', value: card['Loan Percentage Cost'] ? `${card['Loan Percentage Cost']}%` : '' },
          { label: 'Effect', value: card['Effect'] }
        ];
      case 'I':
        console.log('CardDisplay - getCardDetailFields - Returning Investor fields');
        return [
          { label: 'Distribution Level', value: card['Distribution Level'] },
          { label: 'Amount', value: card['Amount'] ? `${card['Amount']}` : '' },
          { label: 'Description', value: card['Description'] }
        ];
      case 'L':
        console.log('CardDisplay - getCardDetailFields - Returning Life fields');
        return [
          { label: 'Card Name', value: card['Card Name'] },
          { label: 'Effect', value: card['Effect'] },
          { label: 'Flavor Text', value: card['Flavor Text'] },
          { label: 'Category', value: card['Category'] }
        ];
      case 'E':
        console.log('CardDisplay - getCardDetailFields - Returning Expeditor fields');
        return [
          { label: 'Card Name', value: card['Card Name'] },
          { label: 'Effect', value: card['Effect'] },
          { label: 'Flavor Text', value: card['Flavor Text'] },
          { label: 'Color', value: card['Color'] },
          { label: 'Phase', value: card['Phase'] }
        ];
      default:
        console.log('CardDisplay - getCardDetailFields - Unknown card type:', cardType);
        console.log('CardDisplay - getCardDetailFields - Attempting to determine type from properties');
        
        // Try to determine the card type based on its properties
        if (card['Work Type'] && card['Job Description']) {
          return this.getCardDetailFields({...card, type: 'W'});
        } else if (card['Distribution Level'] && card['Amount'] && card['Description']) {
          return this.getCardDetailFields({...card, type: 'I'});
        } else if (card['Card Name'] && card['Distribution Level'] && card['Amount']) {
          return this.getCardDetailFields({...card, type: 'B'});
        } else if (card['Card Name'] && card['Effect'] && card['Flavor Text'] && card['Color']) {
          return this.getCardDetailFields({...card, type: 'E'});
        } else if (card['Card Name'] && card['Effect'] && card['Flavor Text'] && card['Category']) {
          return this.getCardDetailFields({...card, type: 'L'});
        }
        
        return [];
    }
  }

  // Render card detail view
  renderCardDetail = () => {
    const { selectedCardIndex, selectedCardId, cards } = this.state;
    
    // Find the card by either index or ID (prefer ID if available)
    let card = null;
    
    if (selectedCardId) {
      // First try to find by ID which is more reliable
      card = cards.find(c => c.id === selectedCardId);
      console.log('CardDisplay - renderCardDetail - Found card by ID:', selectedCardId);
    } else if (selectedCardIndex !== null && cards[selectedCardIndex]) {
      // Fall back to index if ID not available
      card = cards[selectedCardIndex];
      console.log('CardDisplay - renderCardDetail - Found card by index:', selectedCardIndex);
    }
    
    if (!card) {
      console.warn('CardDisplay - renderCardDetail - Card not found');
      return null;
    }
    
    // Make a deep copy to avoid modifying the original card
    card = {...card};
    
    // Debug log to inspect the card object
    console.log('CardDisplay - renderCardDetail - Selected card:', card);
    console.log('CardDisplay - renderCardDetail - Card type:', card.type);
    console.log('CardDisplay - renderCardDetail - Card ID:', card.id);
    
    // Extract the card type from the card ID if type is missing
    // Format is usually: "X-card-timestamp-random"
    if (!card.type && card.id) {
      const idParts = card.id.split('-');
      if (idParts.length >= 1 && idParts[0].length === 1) {
        card.type = idParts[0];
        console.log('CardDisplay - renderCardDetail - Extracted card type from ID:', card.type);
      }
    }
    
    // Ensure the card type is valid, default to 'E' if not
    if (!card.type || !['W', 'B', 'I', 'L', 'E'].includes(card.type)) {
      console.warn('CardDisplay - renderCardDetail - Invalid card type, defaulting to E', card.type);
      card.type = 'E'; // Default to Expeditor if type is invalid
    }
    
    const cardColor = this.getCardColor(card.type);
    const cardTypeName = this.getCardTypeName(card.type);
    const detailFields = this.getCardDetailFields(card);
    
    console.log('CardDisplay - renderCardDetail - Rendering card detail with type:', card.type, 'and typeName:', cardTypeName);
    
    return (
      <div className="card-detail-overlay">
        <div className="card-detail-container" style={{ borderColor: cardColor }}>
          <div className="card-detail-header" style={{ backgroundColor: cardColor }}>
            <h3>{cardTypeName} Card - {card.type}</h3>
            <button 
              className="close-card-detail"
              onClick={() => {
                console.log('CardDisplay - Closing card detail');
                this.setState({ 
                  showCardDetail: false, 
                  selectedCardIndex: null,
                  selectedCardId: null
                });
              }}
            >
              ×
            </button>
          </div>
          
          <div className="card-detail-content">
            {detailFields.map((field, index) => (
              field.value ? (
                <div className="card-detail-field" key={index}>
                  <strong>{field.label}:</strong> {field.value}
                </div>
              ) : null
            ))}
            
            <div className="card-detail-actions">
              <button 
                className="play-card-btn"
                onClick={this.handlePlayCard}
              >
                Play Card
              </button>
              
              <button 
                className="discard-card-btn"
                onClick={this.handleDiscardCard}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render card animation when drawing a new card
  renderCardDrawAnimation = () => {
    const { newCardType, newCardData } = this.state;
    
    if (!newCardType || !newCardData) {
      return null;
    }
    
    const cardColor = this.getCardColor(newCardType);
    const cardTypeName = this.getCardTypeName(newCardType);
    
    // Create a temporary card object with the type for the helper functions
    const tempCard = { ...newCardData, type: newCardType };
    
    return (
      <div className="card-draw-animation">
        <div className="new-card" style={{ borderColor: cardColor }}>
          <div className="card-header" style={{ backgroundColor: cardColor }}>
            {cardTypeName} Card
          </div>
          
          <div className="card-content">
            {this.getCardPrimaryField(tempCard) && (
              <div className="card-field">{this.getCardPrimaryField(tempCard)}</div>
            )}
            
            {this.getCardSecondaryField(tempCard) && (
              <div className="card-description">{this.getCardSecondaryField(tempCard)}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { cards, selectedCardIndex, showCardDetail, animateCardDraw, cardTypeFilters } = this.state;
    const { visible } = this.props;
    
    // Don't render if component is not visible
    if (!visible) {
      return null;
    }
    
    // Filter cards based on selected types
    const filteredCards = cards.filter(card => cardTypeFilters[card.type]);
    
    return (
      <div className="card-display-container">
        <h3>Cards ({filteredCards.length})</h3>
        
        {/* Card type filters */}
        <div className="card-filters">
          {Object.keys(cardTypeFilters).map(cardType => (
            <button
              key={cardType}
              className={`card-filter-btn ${cardTypeFilters[cardType] ? 'active' : ''}`}
              style={{ 
                backgroundColor: cardTypeFilters[cardType] ? this.getCardColor(cardType) : '#f0f0f0',
                color: cardTypeFilters[cardType] ? '#ffffff' : '#333333'
              }}
              onClick={() => this.toggleCardTypeFilter(cardType)}
            >
              {this.getCardTypeName(cardType)}
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
              
              return (
              <div 
                key={card.id || index}
                className={`card ${selectedCardIndex === actualIndex ? 'selected' : ''}`}
                style={{ borderColor: this.getCardColor(card.type) }}
                onClick={() => this.handleCardClick(actualIndex)}
              >
                <div 
                  className="card-header"
                  style={{ backgroundColor: this.getCardColor(card.type) }}
                >
                  {this.getCardTypeName(card.type)}
                </div>
                
                <div className="card-content">
                  {this.getCardPrimaryField(card) && (
                    <div className="card-field">{this.getCardPrimaryField(card)}</div>
                  )}
                  
                  {this.getCardSecondaryField(card) && (
                    <div className="card-description">
                      {this.getCardSecondaryField(card).length > 60 
                        ? `${this.getCardSecondaryField(card).substring(0, 60)}...` 
                        : this.getCardSecondaryField(card)
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
        {showCardDetail && this.renderCardDetail()}
        
        {/* Card draw animation */}
        {animateCardDraw && this.renderCardDrawAnimation()}
      </div>
    );
  }
}

console.log('CardDisplay.js execution complete');