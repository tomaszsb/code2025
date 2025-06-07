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
    const isPhaseAvailable = window.CardTypeUtils.isCardAvailableInCurrentPhase(cardCopy);
    const currentPhase = window.CardTypeUtils.getCurrentPhase();
    
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
            
            {/* Conditional action buttons and info based on card type */}
            {cardCopy.type === 'W' && (
              <div className="card-detail-info">
                <div className="work-card-info">
                  <p>💼 Work cards are automatically added to your project when drawn.</p>
                  <p>📊 Use the card limit interface if you have too many cards.</p>
                  <p>⚙️ Work cards cannot be played manually - they represent ongoing project work.</p>
                  <p>💡 <strong>Tip:</strong> Use Bank/Investor cards to secure funding. In SETUP phase, these provide interest-free seed money!</p>
                </div>
              </div>
            )}
            
            {cardCopy.type === 'B' && (
              <div className="card-detail-actions">
                <div className="action-info">
                  {currentPhase === 'SETUP' ? (
                    <div>
                      <p>🌱 <strong>SETUP Phase:</strong> Bank cards provide <strong>interest-free seed money</strong> from the owner.</p>
                      <p>💡 No interest or fees apply during project setup.</p>
                      <p>🎯 Use "End Turn" to finalize the funding.</p>
                      <p>⚠️ <strong>Note:</strong> Once funds are transferred, they must be used for the project. Any leftover funds will be returned at game end.</p>
                    </div>
                  ) : (
                    <div>
                      <p>💰 <strong>Bank cards</strong> provide loans to fund your project.</p>
                      <p>🎯 Use "End Turn" to accept the loan, or use the main "Negotiate" button to stay and skip turn.</p>
                      <p>⚠️ <strong>Note:</strong> Once funds are accepted, they must be used for the project. Any leftover funds will be returned at game end.</p>
                    </div>
                  )}
                  {!isPhaseAvailable && (
                    <p className="phase-warning">⚠️ <strong>Not available</strong> - This card requires the <strong>{cardCopy.phase_restriction}</strong> phase. Current phase: <strong>{currentPhase}</strong></p>
                  )}
                </div>
                
                <div className="loan-terms-info">
                  <p className="terms-note">
                    {currentPhase === 'SETUP' 
                      ? '📋 Terms: Interest-free seed funding from owner' 
                      : '📋 Loan terms will be applied when you end your turn'
                    }
                  </p>
                </div>
              </div>
            )}
            
            {cardCopy.type === 'I' && (
              <div className="card-detail-actions">
                <div className="action-info">
                  {currentPhase === 'SETUP' ? (
                    <div>
                      <p>🌱 <strong>SETUP Phase:</strong> Investor cards provide <strong>fee-free seed funding</strong> from the owner.</p>
                      <p>💡 No fees or equity requirements apply during project setup.</p>
                      <p>🎯 Use "End Turn" to finalize the funding.</p>
                      <p>⚠️ <strong>Note:</strong> Once funds are transferred, they must be used for the project. Any leftover funds will be returned at game end.</p>
                    </div>
                  ) : (
                    <div>
                      <p>📈 <strong>Investor cards</strong> provide funding and strategic support.</p>
                      <p>🎯 Use "End Turn" to accept the investment, or use the main "Negotiate" button to stay and skip turn.</p>
                      <p>⚠️ <strong>Note:</strong> Once funds are accepted, they must be used for the project. Any leftover funds will be returned at game end.</p>
                    </div>
                  )}
                  {!isPhaseAvailable && (
                    <p className="phase-warning">⚠️ <strong>Not available</strong> - This card requires the <strong>{cardCopy.phase_restriction}</strong> phase. Current phase: <strong>{currentPhase}</strong></p>
                  )}
                </div>
                
                <div className="loan-terms-info">
                  <p className="terms-note">
                    {currentPhase === 'SETUP' 
                      ? '📋 Terms: Fee-free seed funding from owner' 
                      : '📋 Investment terms will be applied when you end your turn'
                    }
                  </p>
                </div>
              </div>
            )}
            
            {cardCopy.type === 'L' && (
              <div className="card-detail-actions">
                <div className="action-info">
                  <p>🎲 <strong>Life cards</strong> are chance cards that randomize the game and add unpredictability.</p>
                  <p>⚡ <strong>Automatic Effect:</strong> Life card effects are applied automatically when drawn or triggered.</p>
                  <p>🔄 <strong>Random Events:</strong> These cards represent life events that happen to project managers during their projects.</p>
                  {!isPhaseAvailable && (
                    <p className="phase-warning">⚠️ <strong>Not available</strong> - This card requires the <strong>{cardCopy.phase_restriction}</strong> phase. Current phase: <strong>{currentPhase}</strong></p>
                  )}
                </div>
                
                <div className="life-card-info">
                  <p>💡 <strong>Note:</strong> Life cards take effect immediately and cannot be manually activated or discarded.</p>
                  <p>🎯 The effects of this card have already been applied to your game state.</p>
                </div>
              </div>
            )}
            
            {cardCopy.type === 'E' && (
              <div className="card-detail-actions">
                <div className="action-info">
                  <p>⚡ <strong>Expeditor cards</strong> provide special project acceleration and bonuses.</p>
                  {!isPhaseAvailable && (
                    <p className="phase-warning">⚠️ <strong>Not available</strong> - This card requires the <strong>{cardCopy.phase_restriction}</strong> phase. Current phase: <strong>{currentPhase}</strong></p>
                  )}
                </div>
                <button 
                  className={`card-action-btn card-play-btn ${!isPhaseAvailable ? 'disabled' : ''}`}
                  onClick={isPhaseAvailable ? onPlayCard : null}
                  disabled={!isPhaseAvailable}
                >
                  ⚡ Use Expeditor
                </button>
                <button 
                  className="card-action-btn card-discard-btn"
                  onClick={onDiscardCard}
                >
                  🗑️ Discard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

console.log('CardDetailView.js code execution finished');
