// CardDrawUtil.js - Utility for drawing cards in the game
console.log('CardDrawUtil.js file is being processed');

window.CardDrawUtil = {
  // Draw cards for a player
  drawCards(playerId, cardType, amount = 1) {
    console.log(`CardDrawUtil: Drawing ${amount} cards of type ${cardType} for player ${playerId}`);
    
    // Find the player
    const player = window.GameState.players.find(p => p.id === playerId);
    if (!player) {
      console.error(`CardDrawUtil: Player with ID ${playerId} not found`);
      return [];
    }
    
    const drawnCards = [];
    
    // Draw the specified number of cards
    for (let i = 0; i < amount; i++) {
      const drawnCard = window.GameState.drawCard(playerId, cardType);
      if (drawnCard) {
        drawnCards.push(drawnCard);
        console.log(`CardDrawUtil: Drew card ${drawnCard.id} of type ${cardType}`);
      } else {
        console.warn(`CardDrawUtil: Failed to draw card ${i+1} of type ${cardType}`);
      }
    }
    
    return drawnCards;
  }
};

// Add function to extract card draw amounts from text
window.CardDrawUtil.parseCardInstruction = function(text) {
  if (!text) return null;
  
  // Look for "Draw X" pattern
  const match = text.match(/Draw\s+(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return 1; // Default to 1 if no number found
};

console.log('CardDrawUtil.js execution finished');
