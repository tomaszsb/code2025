// CardDisplay.js - Component for displaying and managing player cards
console.log('CardDisplay.js file is being processed');

window.CardDisplay = class CardDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      selectedCardIndex: null,
      showCardDetail: false,
      animateCardDraw: false,
      newCardType: null,
      newCardData: null,
      cardTypeFilters: {
        W: true, // Work
        B: true, // Business
        I: true, // Innovation
        L: true, // Leadership
        E: true  // Environment
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
      this.setState({ cards: [...player.cards] });
    } else {
      // Initialize with empty array if player has no cards yet
      this.setState({ cards: [] });
    }
  }

  // Handle card selection
  handleCardClick = (index) => {
    this.setState(prevState => ({
      selectedCardIndex: prevState.selectedCardIndex === index ? null : index,
      showCardDetail: prevState.selectedCardIndex !== index
    }));
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
        id: `card-${Date.now()}`, // Unique ID
        type: cardType,
        ...cardData
      };
      
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
      case 'W': return '#4285f4'; // Blue for Work
      case 'B': return '#ea4335'; // Red for Business
      case 'I': return '#fbbc05'; // Yellow for Innovation
      case 'L': return '#34a853'; // Green for Leadership
      case 'E': return '#8e44ad'; // Purple for Environment
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

  // Render card detail view
  renderCardDetail = () => {
    const { selectedCardIndex, cards } = this.state;
    
    if (selectedCardIndex === null || !cards[selectedCardIndex]) {
      return null;
    }
    
    const card = cards[selectedCardIndex];
    const cardColor = this.getCardColor(card.type);
    const cardTypeName = this.getCardTypeName(card.type);
    
    return (
      <div className="card-detail-overlay">
        <div className="card-detail-container" style={{ borderColor: cardColor }}>
          <div className="card-detail-header" style={{ backgroundColor: cardColor }}>
            <h3>{cardTypeName} Card</h3>
            <button 
              className="close-card-detail"
              onClick={() => this.setState({ showCardDetail: false })}
            >
              ×
            </button>
          </div>
          
          <div className="card-detail-content">
            {card['Work Type'] && (
              <div className="card-detail-field">
                <strong>Work Type:</strong> {card['Work Type']}
              </div>
            )}
            
            {card['Job Description'] && (
              <div className="card-detail-field">
                <strong>Description:</strong> {card['Job Description']}
              </div>
            )}
            
            {card['Estimated Job Costs'] && (
              <div className="card-detail-field">
                <strong>Estimated Cost:</strong> ${card['Estimated Job Costs']}
              </div>
            )}
            
            {/* Additional fields can be added here as needed */}
            
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
    
    return (
      <div className="card-draw-animation">
        <div className="new-card" style={{ borderColor: cardColor }}>
          <div className="card-header" style={{ backgroundColor: cardColor }}>
            {cardTypeName} Card
          </div>
          
          <div className="card-content">
            {newCardData['Work Type'] && (
              <div className="card-field">{newCardData['Work Type']}</div>
            )}
            
            {newCardData['Job Description'] && (
              <div className="card-description">{newCardData['Job Description']}</div>
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
            {filteredCards.map((card, index) => (
              <div 
                key={card.id || index}
                className={`card ${selectedCardIndex === index ? 'selected' : ''}`}
                style={{ borderColor: this.getCardColor(card.type) }}
                onClick={() => this.handleCardClick(index)}
              >
                <div 
                  className="card-header"
                  style={{ backgroundColor: this.getCardColor(card.type) }}
                >
                  {this.getCardTypeName(card.type)}
                </div>
                
                <div className="card-content">
                  {card['Work Type'] && (
                    <div className="card-field">{card['Work Type']}</div>
                  )}
                  
                  {card['Job Description'] && (
                    <div className="card-description">
                      {card['Job Description'].length > 60 
                        ? `${card['Job Description'].substring(0, 60)}...` 
                        : card['Job Description']
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}
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