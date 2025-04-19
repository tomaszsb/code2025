// CardManager.js file is beginning to be used
console.log('CardManager.js file is beginning to be used');

// CardManager class for handling card-related operations
// Refactored to use GameStateManager event system
class CardManager {
  constructor(gameBoard) {
    console.log('CardManager: Initializing with event system integration');
    this.gameBoard = gameBoard;
    
    // Store event handler references for cleanup
    this.eventHandlers = {
      cardDrawn: this.handleCardDrawnEvent.bind(this),
      cardPlayed: this.handleCardPlayedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    console.log('CardManager: Successfully initialized with event system');
  }
  
  // Register event listeners with GameStateManager
  registerEventListeners() {
    console.log('CardManager: Registering event listeners');
    
    // Add event handlers for card-related events
    window.GameStateManager.addEventListener('cardDrawn', this.eventHandlers.cardDrawn);
    window.GameStateManager.addEventListener('cardPlayed', this.eventHandlers.cardPlayed);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    console.log('CardManager: Event listeners registered');
  }
  
  // Handle cardDrawn event from GameStateManager
  handleCardDrawnEvent(event) {
    console.log('CardManager: Card drawn event received', event.data);
    
    // Process card effects when a new card is drawn
    if (event.data && event.data.card && event.data.player) {
      this.processCardEffects(event.data.card, event.data.player, false);
      
      // Handle card animation if gameBoard is available
      if (this.gameBoard && this.gameBoard.handleCardAnimation) {
        this.gameBoard.handleCardAnimation(event.data.cardType, event.data.card);
      }
      
      // Update UI if needed
      this.updateGameBoardUI();
    }
  }
  
  // Handle cardPlayed event from GameStateManager
  handleCardPlayedEvent(event) {
    console.log('CardManager: Card played event received', event.data);
    
    // Process card effects when a card is played
    if (event.data && event.data.card && event.data.player) {
      this.processCardEffects(event.data.card, event.data.player, true);
      
      // Update UI if needed
      this.updateGameBoardUI();
    }
  }
  
  // Handle gameStateChanged event from GameStateManager
  handleGameStateChangedEvent(event) {
    console.log('CardManager: Game state changed event received', event.data);
    
    // Only process discard events
    if (event.data && event.data.changeType === 'cardDiscarded') {
      console.log('CardManager: Card discard event processed');
      
      // Update UI if needed
      this.updateGameBoardUI();
    }
  }
  
  // Update the GameBoard UI to reflect any changes
  updateGameBoardUI() {
    console.log('CardManager: Updating GameBoard UI');
    
    // Only update if gameBoard is available
    if (this.gameBoard) {
      this.gameBoard.setState({
        players: [...window.GameStateManager.players]
      });
    }
  }
  
  // Process card effects when a card is drawn or played
  // This method no longer directly updates player state
  processCardEffects = (card, player, isBeingPlayed = false) => {
    console.log('CardManager: Processing effects for card:', card, 'isBeingPlayed:', isBeingPlayed);
    
    if (!card || !player) return;
    
    // Track card effects to dispatch via events
    const cardEffects = {
      money: 0,
      time: 0,
      isDeficit: false,
      cardType: card.type
    };
    
    // Process different card types
    switch (card.type) {
      case 'B': // Bank card
        // Check for Amount field in Bank cards
        if (card['Amount']) {
          // Parse the amount - handle both number and string formats
          let amount = 0;
          if (typeof card['Amount'] === 'number') {
            amount = card['Amount'];
          } else if (typeof card['Amount'] === 'string') {
            // Remove $ and , from string
            const cleanAmount = card['Amount'].replace(/[\$,]/g, '');
            amount = parseInt(cleanAmount, 10);
          }
          
          if (!isNaN(amount)) {
            console.log(`CardManager: Adding ${amount.toLocaleString()} to player's wallet from Bank card`);
            cardEffects.money = amount;
          }
        }
        // Check for Effect text that might contain monetary values
        else if (card['Effect']) {
          const effectText = card['Effect'];
          const moneyMatch = effectText.match(/\$(\d+(?:,\d+)*)/); // Match currency formats like $5000 or $5,000
          
          if (moneyMatch && moneyMatch[1]) {
            const amount = parseInt(moneyMatch[1].replace(/,/g, ''), 10);
            if (!isNaN(amount)) {
              console.log(`CardManager: Adding ${amount.toLocaleString()} to player's wallet from Bank card effect`);
              cardEffects.money = amount;
            }
          }
        }
        break;
        
      case 'I': // Investor card
        // Similar to Bank cards, check for Amount field
        if (card['Amount']) {
          // Parse the amount - handle both number and string formats
          let amount = 0;
          if (typeof card['Amount'] === 'number') {
            amount = card['Amount'];
          } else if (typeof card['Amount'] === 'string') {
            // Remove $ and , from string
            const cleanAmount = card['Amount'].replace(/[\$,]/g, '');
            amount = parseInt(cleanAmount, 10);
          }
          
          if (!isNaN(amount)) {
            console.log(`CardManager: Adding ${amount.toLocaleString()} to player's wallet from Investor card`);
            cardEffects.money = amount;
          }
        }
        // Check for Description that might contain monetary values
        else if (card['Description']) {
          const descText = card['Description'];
          const moneyMatch = descText.match(/\$(\d+(?:,\d+)*)/); // Match currency formats like $5000 or $5,000
          
          if (moneyMatch && moneyMatch[1]) {
            const amount = parseInt(moneyMatch[1].replace(/,/g, ''), 10);
            if (!isNaN(amount)) {
              console.log(`CardManager: Adding ${amount.toLocaleString()} to player's wallet from Investor card description`);
              cardEffects.money = amount;
            }
          }
        }
        break;
        
      case 'E': // Expeditor card
        // Process Expeditor card effects only if the card is being played
        if (isBeingPlayed) {
          console.log('CardManager: Processing Expeditor card effects because card is being played');
          // Check for Effect field that might contain monetary values
          if (card['Effect']) {
            const effectText = card['Effect'];
            
            // Check for phrases like "Release $5000" or "immediately add $10000"
            const moneyMatch = effectText.match(/\$(\d+(?:,\d+)*)/); 
            
            if (moneyMatch && moneyMatch[1]) {
              const amount = parseInt(moneyMatch[1].replace(/,/g, ''), 10);
              
              // Determine if it's adding or subtracting money
              const isNegative = effectText.match(/pay|spend|cost|fee|reduce|subtract/i);
              
              if (!isNaN(amount)) {
                if (isNegative) {
                  console.log(`CardManager: Subtracting ${amount.toLocaleString()} from player's wallet from Expeditor card effect`);
                  cardEffects.money = -amount; // Negative amount for subtraction
                  cardEffects.isDeficit = true;
                } else {
                  console.log(`CardManager: Adding ${amount.toLocaleString()} to player's wallet from Expeditor card effect`);
                  cardEffects.money = amount;
                }
              }
            }
          }
        } else {
          console.log('CardManager: Not processing Expeditor card effects because card is only being drawn, not played');
        }
        break;
        
      // Add other card types as needed
      case 'W': // Work Type card
        // Process Work Type card effects
        if (isBeingPlayed && card['Estimated Job Costs']) {
          const amount = parseInt(card['Estimated Job Costs']) || 0;
          if (amount !== 0) {
            console.log(`CardManager: Adding ${amount.toLocaleString()} to player's wallet from Work Type card`);
            cardEffects.money = amount;
          }
        }
        break;
        
      case 'L': // Life card
        // Process Life card effects
        // Example: Life cards might add or reduce time
        if (isBeingPlayed && card['Time Effect']) {
          const timeEffect = parseInt(card['Time Effect']) || 0;
          if (timeEffect !== 0) {
            console.log(`CardManager: Adding ${timeEffect} to player's time from Life card`);
            cardEffects.time = timeEffect;
          }
        }
        break;
    }
    
    // Apply card effects if any were calculated
    if (cardEffects.money !== 0 || cardEffects.time !== 0) {
      this.applyCardEffects(player, cardEffects);
    }
  };
  
  // Apply card effects to player via GameStateManager events
  applyCardEffects(player, effects) {
    console.log('CardManager: Applying card effects to player', player.name, effects);
    
    // First, get the current player from GameStateManager to ensure we have the latest state
    const playerIndex = window.GameStateManager.players.findIndex(p => p.id === player.id);
    if (playerIndex < 0) {
      console.log('CardManager: Player not found in GameStateManager');
      return;
    }
    
    const currentPlayer = window.GameStateManager.players[playerIndex];
    
    // Initialize financial status tracking if not present
    if (!currentPlayer.financialStatus) {
      currentPlayer.financialStatus = {
        surplus: 0,
        deficit: 0
      };
    }
    
    // Apply money effects
    if (effects.money !== 0) {
      console.log(`CardManager: Applying money effect of ${effects.money} to player ${currentPlayer.name}`);
      
      // Update resources
      currentPlayer.resources.money += effects.money;
      
      // Update financial status trackers
      if (effects.isDeficit) {
        currentPlayer.financialStatus.deficit += Math.abs(effects.money);
      } else {
        currentPlayer.financialStatus.surplus += effects.money;
      }
      
      // Ensure money doesn't go negative
      if (currentPlayer.resources.money < 0) {
        currentPlayer.resources.money = 0;
      }
    }
    
    // Apply time effects
    if (effects.time !== 0) {
      console.log(`CardManager: Applying time effect of ${effects.time} to player ${currentPlayer.name}`);
      
      // Update resources
      currentPlayer.resources.time += effects.time;
      
      // Ensure time doesn't go negative
      if (currentPlayer.resources.time < 0) {
        currentPlayer.resources.time = 0;
      }
    }
    
    // Save state through GameStateManager
    window.GameStateManager.saveState();
    
    // Dispatch event to inform other components about the change
    window.GameStateManager.dispatchEvent('gameStateChanged', {
      changeType: 'cardEffectsApplied',
      playerId: currentPlayer.id,
      player: currentPlayer,
      effects: effects,
      cardType: effects.cardType
    });
  }
  
  // Handle drawing cards manually - Updated to use event system
  handleDrawCards = (cardType, amount, currentPlayer, cardDisplayRef) => {
    console.log('CardManager: Drawing cards manually -', amount, cardType, 'cards');
    
    if (!currentPlayer) {
      console.log('CardManager: No current player found');
      return;
    }
    
    const drawnCards = [];
    
    // Draw the specified number of cards
    for (let i = 0; i < amount; i++) {
      // Use GameStateManager to draw card (which will dispatch cardDrawn event)
      const drawnCard = window.GameStateManager.drawCard(currentPlayer.id, cardType);
      
      if (drawnCard) {
        // We don't need to process card effects here anymore
        // The event handler will take care of that
        
        drawnCards.push({
          type: cardType,
          data: drawnCard
        });
      }
    }
    
    // Update the card display component
    if (cardDisplayRef && cardDisplayRef.current) {
      cardDisplayRef.current.loadPlayerCards();
    }
    
    return drawnCards;
  };
  
  // Handle card played by player - Updated to use event system
  handleCardPlayed = (card, currentPlayer) => {
    console.log('CardManager: Card played:', card);
    
    if (!currentPlayer) return;
    
    // Use GameStateManager to play card (which will dispatch cardPlayed event)
    window.GameStateManager.playCard(currentPlayer.id, card.id);
    
    // The event handler will take care of processing effects and updating UI
  };
  
  // Handle card discarded by player - Updated to use event system
  handleCardDiscarded = (card, playerId) => {
    console.log('CardManager: Card discarded:', card);
    
    if (!card || !playerId) return;
    
    // Use GameStateManager to discard card (which will dispatch gameStateChanged event)
    window.GameStateManager.discardCard(playerId, card.id);
    
    // The event handler will take care of updating UI
  };
  
  // Get color for card type - Utility method, unchanged
  getCardTypeColor = (cardType) => {
    switch (cardType) {
      case 'W': return '#4285f4'; // Blue for Work Type
      case 'B': return '#ea4335'; // Red for Bank
      case 'I': return '#fbbc05'; // Yellow for Investor
      case 'L': return '#34a853'; // Green for Life
      case 'E': return '#8e44ad'; // Purple for Expeditor
      default: return '#777777';  // Gray for unknown
    }
  };
  
  // Get full name for card type - Utility method, unchanged
  getCardTypeName = (cardType) => {
    switch (cardType) {
      case 'W': return 'Work Type';
      case 'B': return 'Bank';
      case 'I': return 'Investor';
      case 'L': return 'Life';
      case 'E': return 'Expeditor';
      default: return 'Unknown';
    }
  };
  
  // Clean up resources when no longer needed - New method
  cleanup = () => {
    console.log('CardManager: Cleaning up resources');
    
    // Remove all event listeners to prevent memory leaks
    window.GameStateManager.removeEventListener('cardDrawn', this.eventHandlers.cardDrawn);
    window.GameStateManager.removeEventListener('cardPlayed', this.eventHandlers.cardPlayed);
    window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    console.log('CardManager: Cleanup completed');
  };
}

// Export CardManager for use in other files
window.CardManager = CardManager;

console.log('CardManager.js code execution finished');