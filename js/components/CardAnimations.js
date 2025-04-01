// CardAnimations.js - Components for card animations
console.log('CardAnimations.js file is beginning to be used');

// Card draw animation component
window.CardDrawAnimation = class CardDrawAnimation extends React.Component {
  render() {
    const { cardType, cardData } = this.props;
    
    if (!cardType || !cardData) {
      console.log('CardAnimations - Missing card type or data for animation');
      return null;
    }
    
    const cardColor = window.CardTypeUtils.getCardColor(cardType);
    const cardTypeName = window.CardTypeUtils.getCardTypeName(cardType);
    
    // Create a temporary card object with the type for the helper functions
    const tempCard = { ...cardData, type: cardType };
    
    return (
      <div className="card-draw-animation">
        <div className="new-card" style={{ borderColor: cardColor }}>
          <div className="card-header" style={{ backgroundColor: cardColor }}>
            {cardTypeName} Card
          </div>
          
          <div className="card-content">
            {window.CardTypeUtils.getCardPrimaryField(tempCard) && (
              <div className="card-field">{window.CardTypeUtils.getCardPrimaryField(tempCard)}</div>
            )}
            
            {window.CardTypeUtils.getCardSecondaryField(tempCard) && (
              <div className="card-description">{window.CardTypeUtils.getCardSecondaryField(tempCard)}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

console.log('CardAnimations.js code execution finished');
