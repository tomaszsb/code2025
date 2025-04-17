// CardManager.js file is beginning to be used
console.log('CardManager.js file is beginning to be used');

// CardManager class for handling card-related operations
class CardManager {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }
  
  // Process card effects when a card is drawn or played
  processCardEffects = (card, player, isBeingPlayed = false) => {
    console.log('CardManager: Processing effects for card:', card, 'isBeingPlayed:', isBeingPlayed);
    
    if (!card || !player) return;
    
    // Initialize deficit and surplus tracking if not present
    if (!player.financialStatus) {
      player.financialStatus = {
        surplus: 0,
        deficit: 0
      };
    }
    
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
            player.resources.money += amount;
            player.financialStatus.surplus += amount;
            // Save game state to persist the change
            window.GameState.saveState();
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
              player.resources.money += amount;
              player.financialStatus.surplus += amount;
              // Save game state to persist the change
              window.GameState.saveState();
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
            player.resources.money += amount;
            player.financialStatus.surplus += amount;
            // Save game state to persist the change
            window.GameState.saveState();
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
              player.resources.money += amount;
              player.financialStatus.surplus += amount;
              // Save game state to persist the change
              window.GameState.saveState();
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
                  player.resources.money -= amount;
                  player.financialStatus.deficit += amount;
                  if (player.resources.money < 0) player.resources.money = 0; // Don't allow negative money
                } else {
                  console.log(`CardManager: Adding ${amount.toLocaleString()} to player's wallet from Expeditor card effect`);
                  player.resources.money += amount;
                  player.financialStatus.surplus += amount;
                }
                // Save game state to persist the change
                window.GameState.saveState();
              }
            }
          }
        } else {
          console.log('CardManager: Not processing Expeditor card effects because card is only being drawn, not played');
        }
        break;
      
      // Add other card types as needed
    }
    
    // Update the UI to reflect the changes
    if (this.gameBoard) {
      this.gameBoard.setState({
        players: [...window.GameState.players]
      });
    }
  };
  
  // Handle drawing cards manually
  handleDrawCards = (cardType, amount, currentPlayer, cardDisplayRef) => {
    console.log('CardManager: Drawing cards manually -', amount, cardType, 'cards');
    
    if (!currentPlayer) {
      console.log('CardManager: No current player found');
      return;
    }
    
    const drawnCards = [];
    
    // Draw the specified number of cards
    for (let i = 0; i < amount; i++) {
      const drawnCard = window.GameState.drawCard(currentPlayer.id, cardType);
      
      if (drawnCard) {
        // Process card effects immediately after drawing (isBeingPlayed = false)
        this.processCardEffects(drawnCard, currentPlayer, false);
        
        // Use the GameBoard's animation method
        if (this.gameBoard && this.gameBoard.handleCardAnimation) {
          this.gameBoard.handleCardAnimation(cardType, drawnCard);
        }
        
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
  
  // Handle card played by player
  handleCardPlayed = (card, currentPlayer) => {
    console.log('CardManager: Card played:', card);
    
    if (!currentPlayer) return;
    
    // Process card effects based on type
    switch (card.type) {
      case 'W': // Work Type card
        // Example: Work Type cards might provide money
        if (card['Estimated Job Costs']) {
          const amount = parseInt(card['Estimated Job Costs']) || 0;
          currentPlayer.resources.money += amount;
          console.log(`Player earned $${amount} from Work Type card`);
        }
        break;
        
      case 'B': // Bank card
        // Bank cards might have different effects
        break;
        
      case 'I': // Investor card
        // Investor cards might reduce time
        currentPlayer.resources.time -= 5;
        if (currentPlayer.resources.time < 0) currentPlayer.resources.time = 0;
        break;
        
      case 'E': // Expeditor card
        // Process Expeditor cards with isBeingPlayed=true when played from hand
        this.processCardEffects(card, currentPlayer, true);
        break;
        
      default:
        console.log('Unknown card type:', card.type);
    }
    
    // Update players to reflect changes
    if (this.gameBoard) {
      this.gameBoard.setState({
        players: [...GameState.players]
      });
    }
    
    // Save game state
    GameState.saveState();
  };
  
  // Handle card discarded by player
  handleCardDiscarded = (card) => {
    console.log('CardManager: Card discarded:', card);
    // No specific actions needed for discarded cards currently
  };
  
  // Get color for card type
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
  
  // Get full name for card type
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
}

// Export CardManager for use in other files
window.CardManager = CardManager;

console.log('CardManager.js code execution finished');
