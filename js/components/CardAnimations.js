// CardAnimations.js - Enhanced card animation system
console.log('CardAnimations.js file is beginning to be used');

// Main card animation manager
window.CardAnimationManager = {
  // Active animations tracking
  activeAnimations: new Map(),
  animationQueue: [],
  
  // Initialize the animation system
  init: function() {
    console.log('CardAnimationManager: Initializing animation system');
    this.createAnimationContainer();
    console.log('CardAnimationManager: Animation system ready');
  },
  
  // Create container for card animations
  createAnimationContainer: function() {
    if (!document.querySelector('.card-animation-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'card-animation-overlay';
      document.body.appendChild(overlay);
    }
  },
  
  // Animate card draw from deck
  animateCardDraw: function(cardType, cardData, options = {}) {
    console.log('CardAnimationManager: Starting card draw animation', cardType);
    
    const animationId = 'draw-' + Date.now();
    const duration = options.duration || 1500;
    
    // Show toast notification
    this.showCardDrawToast(cardType, cardData);
    
    return new Promise((resolve) => {
      // Create animated card element
      const cardElement = this.createAnimatedCard(cardType, cardData, 'draw');
      const overlay = document.querySelector('.card-animation-overlay');
      overlay.appendChild(cardElement);
      
      // Start animation
      setTimeout(() => {
        cardElement.classList.add('card-draw-active');
      }, 50);
      
      // Complete animation
      setTimeout(() => {
        cardElement.classList.add('card-draw-complete');
        setTimeout(() => {
          if (cardElement.parentNode) {
            cardElement.parentNode.removeChild(cardElement);
          }
          this.activeAnimations.delete(animationId);
          resolve();
        }, 300);
      }, duration);
      
      this.activeAnimations.set(animationId, cardElement);
    });
  },
  
  // Show card draw toast notification
  showCardDrawToast: function(cardType, cardData) {
    const toast = document.createElement('div');
    toast.className = 'card-draw-toast';
    
    const cardName = cardData.card_name || `${window.CardTypeUtils.getCardTypeName(cardType)} Card`;
    toast.innerHTML = `
      <div class="toast-icon">🃏</div>
      <div class="toast-content">
        <div class="toast-title">Card Drawn!</div>
        <div class="toast-subtitle">${cardName}</div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('toast-active');
    }, 50);
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2500);
  },
  
  // Animate card being played
  animateCardPlay: function(cardElement, targetElement, options = {}) {
    console.log('CardAnimationManager: Starting card play animation');
    
    if (!cardElement || !targetElement) {
      console.warn('CardAnimationManager: Missing elements for play animation');
      return Promise.resolve();
    }
    
    const duration = options.duration || 800;
    
    return new Promise((resolve) => {
      // Get positions
      const cardRect = cardElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      
      // Create flying card
      const flyingCard = cardElement.cloneNode(true);
      flyingCard.className = 'card flying-card';
      flyingCard.style.position = 'fixed';
      flyingCard.style.left = cardRect.left + 'px';
      flyingCard.style.top = cardRect.top + 'px';
      flyingCard.style.width = cardRect.width + 'px';
      flyingCard.style.height = cardRect.height + 'px';
      flyingCard.style.zIndex = '2000';
      
      document.body.appendChild(flyingCard);
      
      // Hide original card
      cardElement.style.opacity = '0';
      
      // Animate to target
      setTimeout(() => {
        flyingCard.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        flyingCard.style.left = targetRect.left + (targetRect.width / 2) - (cardRect.width / 2) + 'px';
        flyingCard.style.top = targetRect.top + (targetRect.height / 2) - (cardRect.height / 2) + 'px';
        flyingCard.style.transform = 'scale(0.8) rotateY(180deg)';
        flyingCard.style.opacity = '0';
      }, 50);
      
      // Clean up
      setTimeout(() => {
        if (flyingCard.parentNode) {
          flyingCard.parentNode.removeChild(flyingCard);
        }
        cardElement.style.opacity = '';
        resolve();
      }, duration + 100);
    });
  },
  
  // Animate card discard
  animateCardDiscard: function(cardElement, options = {}) {
    console.log('CardAnimationManager: Starting card discard animation');
    
    if (!cardElement) {
      console.warn('CardAnimationManager: Missing card element for discard animation');
      return Promise.resolve();
    }
    
    const duration = options.duration || 600;
    
    return new Promise((resolve) => {
      cardElement.classList.add('card-discarding');
      
      setTimeout(() => {
        cardElement.style.transform = 'scale(0.8) translateY(20px) rotateZ(15deg)';
        cardElement.style.opacity = '0';
        cardElement.style.transition = `all ${duration}ms ease-out`;
      }, 50);
      
      setTimeout(() => {
        resolve();
      }, duration + 100);
    });
  },
  
  // Animate hand reorganization
  animateHandReorganization: function(handContainer, options = {}) {
    console.log('CardAnimationManager: Starting hand reorganization animation');
    
    if (!handContainer) {
      console.warn('CardAnimationManager: Missing hand container for reorganization');
      return Promise.resolve();
    }
    
    const duration = options.duration || 400;
    const cards = handContainer.querySelectorAll('.card');
    
    return new Promise((resolve) => {
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          card.style.transform = `translateX(${index * (options.cardSpacing || 10)}px)`;
        }, index * 50);
      });
      
      setTimeout(() => {
        cards.forEach(card => {
          card.style.transition = '';
          card.style.transform = '';
        });
        resolve();
      }, (cards.length * 50) + duration);
    });
  },
  
  // Create animated card element
  createAnimatedCard: function(cardType, cardData, animationType) {
    const cardColor = window.CardTypeUtils?.getCardColor(cardType) || '#ccc';
    const cardTypeName = window.CardTypeUtils?.getCardTypeName(cardType) || cardType;
    
    const cardElement = document.createElement('div');
    cardElement.className = `animated-card card-${animationType} animated-card-type-${cardType.toLowerCase()}`;
    cardElement.style.borderColor = cardColor;
    
    // Create temporary card object for helper functions
    const tempCard = { ...cardData, type: cardType };
    
    cardElement.innerHTML = `
      <div class="animated-card-header animated-card-header-${cardType.toLowerCase()}">
        ${cardTypeName} Card
      </div>
      <div class="animated-card-content">
        ${window.CardTypeUtils?.getCardPrimaryField(tempCard) ? 
          `<div class="animated-card-title">${window.CardTypeUtils.getCardPrimaryField(tempCard)}</div>` : ''}
        ${window.CardTypeUtils?.getCardSecondaryField(tempCard) ? 
          `<div class="animated-card-description">${window.CardTypeUtils.getCardSecondaryField(tempCard)}</div>` : ''}
      </div>
    `;
    
    return cardElement;
  },
  
  // Chain multiple card animations
  chainAnimations: function(animations) {
    console.log('CardAnimationManager: Chaining', animations.length, 'animations');
    
    return animations.reduce((promise, animation) => {
      return promise.then(() => animation());
    }, Promise.resolve());
  },
  
  // Clear all active animations
  clearAllAnimations: function() {
    console.log('CardAnimationManager: Clearing all animations');
    
    this.activeAnimations.forEach((element, id) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    this.activeAnimations.clear();
    this.animationQueue = [];
  }
};

// Enhanced card draw animation component
window.CardDrawAnimation = class CardDrawAnimation extends React.Component {
  render() {
    const { cardType, cardData } = this.props;
    
    if (!cardType || !cardData) {
      console.log('CardDrawAnimation: Missing card type or data for animation');
      return null;
    }
    
    const cardColor = window.CardTypeUtils?.getCardColor(cardType) || '#ccc';
    const cardTypeName = window.CardTypeUtils?.getCardTypeName(cardType) || cardType;
    
    // Create a temporary card object with the type for the helper functions
    const tempCard = { ...cardData, type: cardType };
    
    return React.createElement('div', { className: 'card-animation-container' },
      React.createElement('div', {
        className: `animated-card animated-card-type-${cardType.toLowerCase()}`,
        style: { borderColor: cardColor }
      },
        React.createElement('div', {
          className: `animated-card-header animated-card-header-${cardType.toLowerCase()}`
        }, `${cardTypeName} Card`),
        
        React.createElement('div', { className: 'animated-card-content' },
          window.CardTypeUtils?.getCardPrimaryField(tempCard) && 
            React.createElement('div', { className: 'animated-card-title' }, 
              window.CardTypeUtils.getCardPrimaryField(tempCard)),
          
          window.CardTypeUtils?.getCardSecondaryField(tempCard) && 
            React.createElement('div', { className: 'animated-card-description' }, 
              window.CardTypeUtils.getCardSecondaryField(tempCard))
        )
      )
    );
  }
};

console.log('CardAnimations.js code execution finished');
