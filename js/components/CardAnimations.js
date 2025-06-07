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
    const duration = options.duration || 1200;
    const sourceElement = options.sourceElement; // Deck position
    const targetElement = options.targetElement; // Hand position
    
    // Show toast notification
    this.showCardDrawToast(cardType, cardData);
    
    return new Promise((resolve) => {
      // Create animated card element
      const cardElement = this.createAnimatedCard(cardType, cardData, 'draw');
      const overlay = document.querySelector('.card-animation-overlay');
      overlay.appendChild(cardElement);
      
      // Set initial position (from deck or default)
      if (sourceElement) {
        const sourceRect = sourceElement.getBoundingClientRect();
        cardElement.style.left = sourceRect.left + 'px';
        cardElement.style.top = sourceRect.top + 'px';
        cardElement.style.transform = 'scale(0.3) rotateY(180deg)';
      }
      
      // Start animation
      setTimeout(() => {
        cardElement.classList.add('card-draw-active');
        
        // If we have a target, animate to it
        if (targetElement) {
          const targetRect = targetElement.getBoundingClientRect();
          cardElement.style.transition = `all ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
          cardElement.style.left = targetRect.left + 'px';
          cardElement.style.top = targetRect.top + 'px';
          cardElement.style.transform = 'scale(1) rotateY(0deg)';
        }
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
    
    const duration = options.duration || 900;
    const cardType = options.cardType || 'unknown';
    const showEffects = options.showEffects !== false;
    
    return new Promise((resolve) => {
      // Get positions
      const cardRect = cardElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      
      // Create flying card
      const flyingCard = cardElement.cloneNode(true);
      flyingCard.className = 'card flying-card card-playing';
      flyingCard.style.position = 'fixed';
      flyingCard.style.left = cardRect.left + 'px';
      flyingCard.style.top = cardRect.top + 'px';
      flyingCard.style.width = cardRect.width + 'px';
      flyingCard.style.height = cardRect.height + 'px';
      flyingCard.style.zIndex = '2000';
      flyingCard.style.pointerEvents = 'none';
      
      document.body.appendChild(flyingCard);
      
      // Add glow effect based on card type
      if (showEffects) {
        flyingCard.classList.add('card-play-glow', `card-type-${cardType.toLowerCase()}`);
        this.createPlayEffects(flyingCard, cardType);
      }
      
      // Hide original card with fade
      cardElement.style.transition = 'opacity 200ms ease-out';
      cardElement.style.opacity = '0.3';
      
      // Animate to target
      setTimeout(() => {
        flyingCard.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        flyingCard.style.left = targetRect.left + (targetRect.width / 2) - (cardRect.width / 2) + 'px';
        flyingCard.style.top = targetRect.top + (targetRect.height / 2) - (cardRect.height / 2) + 'px';
        flyingCard.style.transform = 'scale(1.1) rotateY(360deg)';
        
        // Pulse effect
        setTimeout(() => {
          flyingCard.style.transform = 'scale(0.9) rotateY(360deg)';
          flyingCard.style.opacity = '0';
        }, duration * 0.7);
      }, 100);
      
      // Create impact effect at target
      if (showEffects) {
        setTimeout(() => {
          this.createImpactEffect(targetElement, cardType);
        }, duration * 0.8);
      }
      
      // Clean up
      setTimeout(() => {
        if (flyingCard.parentNode) {
          flyingCard.parentNode.removeChild(flyingCard);
        }
        cardElement.style.transition = '';
        cardElement.style.opacity = '';
        resolve();
      }, duration + 200);
    });
  },
  
  // Animate card discard
  animateCardDiscard: function(cardElement, options = {}) {
    console.log('CardAnimationManager: Starting card discard animation');
    
    if (!cardElement) {
      console.warn('CardAnimationManager: Missing card element for discard animation');
      return Promise.resolve();
    }
    
    const duration = options.duration || 700;
    const direction = options.direction || 'down'; // 'down', 'left', 'right'
    const showEffects = options.showEffects !== false;
    
    return new Promise((resolve) => {
      cardElement.classList.add('card-discarding');
      
      // Add discard effect particles
      if (showEffects) {
        this.createDiscardEffects(cardElement);
      }
      
      setTimeout(() => {
        let transform;
        switch (direction) {
          case 'left':
            transform = 'scale(0.7) translateX(-100px) translateY(30px) rotateZ(-25deg)';
            break;
          case 'right':
            transform = 'scale(0.7) translateX(100px) translateY(30px) rotateZ(25deg)';
            break;
          default:
            transform = 'scale(0.8) translateY(50px) rotateZ(15deg)';
        }
        
        cardElement.style.transform = transform;
        cardElement.style.opacity = '0';
        cardElement.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        cardElement.style.filter = 'blur(2px)';
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
  
  // Create play effects (particles, glow)
  createPlayEffects: function(cardElement, cardType) {
    const colors = {
      'W': '#4285f4',
      'B': '#ea4335', 
      'I': '#fbbc05',
      'L': '#34a853',
      'E': '#8e44ad'
    };
    
    const color = colors[cardType] || '#ccc';
    cardElement.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
    
    // Create particle effect
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.className = 'card-play-particle';
      particle.style.position = 'absolute';
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.background = color;
      particle.style.borderRadius = '50%';
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.zIndex = '2001';
      
      cardElement.appendChild(particle);
      
      setTimeout(() => {
        const angle = (i * 60) * Math.PI / 180;
        const distance = 30 + Math.random() * 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        particle.style.transition = 'all 600ms ease-out';
        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = '0';
      }, 100);
    }
  },
  
  // Create impact effect at target
  createImpactEffect: function(targetElement, cardType) {
    const colors = {
      'W': '#4285f4',
      'B': '#ea4335', 
      'I': '#fbbc05',
      'L': '#34a853',
      'E': '#8e44ad'
    };
    
    const color = colors[cardType] || '#ccc';
    const rect = targetElement.getBoundingClientRect();
    
    const ripple = document.createElement('div');
    ripple.className = 'card-impact-ripple';
    ripple.style.position = 'fixed';
    ripple.style.left = rect.left + rect.width / 2 + 'px';
    ripple.style.top = rect.top + rect.height / 2 + 'px';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.background = color;
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.opacity = '0.7';
    ripple.style.zIndex = '1999';
    ripple.style.pointerEvents = 'none';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.style.transition = 'all 400ms ease-out';
      ripple.style.width = '60px';
      ripple.style.height = '60px';
      ripple.style.opacity = '0';
    }, 50);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 500);
  },
  
  // Create discard effects
  createDiscardEffects: function(cardElement) {
    // Create dissolve particles
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'card-discard-particle';
      particle.style.position = 'absolute';
      particle.style.width = '3px';
      particle.style.height = '3px';
      particle.style.background = '#666';
      particle.style.borderRadius = '50%';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.zIndex = '2001';
      
      cardElement.appendChild(particle);
      
      setTimeout(() => {
        particle.style.transition = 'all 500ms ease-out';
        particle.style.transform = `translateY(${20 + Math.random() * 20}px)`;
        particle.style.opacity = '0';
      }, i * 50);
    }
  },
  
  // Enhanced hand reorganization with stagger effects
  animateHandEntry: function(cardElement, index, totalCards, options = {}) {
    const delay = (options.staggerDelay || 100) * index;
    const duration = options.duration || 500;
    
    return new Promise((resolve) => {
      cardElement.style.opacity = '0';
      cardElement.style.transform = 'translateY(20px) scale(0.9)';
      
      setTimeout(() => {
        cardElement.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        cardElement.style.opacity = '1';
        cardElement.style.transform = 'translateY(0) scale(1)';
        
        setTimeout(() => {
          cardElement.style.transition = '';
          resolve();
        }, duration);
      }, delay);
    });
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
