// CardDetailView.js - Component for displaying card details
console.log('CardDetailView.js file is beginning to be used');

// Card detail view component
window.CardDetailView = class CardDetailView extends React.Component {
  render() {
    const { card, onClose, onPlayCard, onDiscardCard } = this.props;
    
    if (!card) {
      console.warn('CardDetailView - No card provided');
      return null;
    }
    
    // Make a deep copy to avoid modifying the original card
    const cardCopy = {...card};
    
    // Debug log to inspect the card object
    console.log('CardDetailView - Selected card:', cardCopy);
    console.log('CardDetailView - Card type:', cardCopy.type);
    console.log('CardDetailView - Card ID:', cardCopy.id);
    
    // Extract the card type from the card ID if type is missing
    // Format is usually: "X-card-timestamp-random"
    if (!cardCopy.type && cardCopy.id) {
      const idParts = cardCopy.id.split('-');
      if (idParts.length >= 1 && idParts[0].length === 1) {
        cardCopy.type = idParts[0];
        console.log('CardDetailView - Extracted card type from ID:', cardCopy.type);
      }
    }
    
    // Ensure the card type is valid, default to 'E' if not
    if (!cardCopy.type || !['W', 'B', 'I', 'L', 'E'].includes(cardCopy.type)) {
      console.warn('CardDetailView - Invalid card type, defaulting to E', cardCopy.type);
      cardCopy.type = 'E'; // Default to Expeditor if type is invalid
    }
    
    const cardColor = window.CardTypeUtils.getCardColor(cardCopy.type);
    const cardTypeName = window.CardTypeUtils.getCardTypeName(cardCopy.type);
    const detailFields = window.CardTypeUtils.getCardDetailFields(cardCopy);
    
    console.log('CardDetailView - Rendering card detail with type:', cardCopy.type, 'and typeName:', cardTypeName);
    
    return (
      <div className="card-detail-overlay">
        <div className={`card-detail-container card-detail-type-${cardCopy.type.toLowerCase()}`}>
          <div className={`card-detail-header card-detail-header-${cardCopy.type.toLowerCase()}`}>
            <h3>{cardTypeName} Card</h3>
            <button 
              className="card-close-btn"
              onClick={() => {
                console.log('CardDetailView - Closing card detail');
                if (onClose) onClose();
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
                className="card-action-btn card-play-btn"
                onClick={onPlayCard}
              >
                Play Card
              </button>
              
              <button 
                className="card-action-btn card-discard-btn"
                onClick={onDiscardCard}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

console.log('CardDetailView.js code execution finished');
