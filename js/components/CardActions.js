// CardActions.js - Action handlers for the card component
console.log('CardActions.js file is beginning to be used');

// Create a CardActions namespace
window.CardActions = {
  // Handle playing a card
  handlePlayCard: (playerId, selectedCardIndex, cards, callbacks = {}) => {
    if (selectedCardIndex === null || !cards[selectedCardIndex]) {
      return;
    }
    
    // Get the selected card
    const cardToPlay = cards[selectedCardIndex];
    
    // Remove the card from the player's hand
    const updatedCards = [...cards];
    updatedCards.splice(selectedCardIndex, 1);
    
    // Update the player's cards in the game state
    const player = window.GameState.players.find(p => p.id === playerId);
    
    if (player) {
      player.cards = updatedCards;
      window.GameState.saveState();
    }
    
    // Call the callback with the played card
    if (callbacks.onCardPlayed) {
      callbacks.onCardPlayed(cardToPlay);
    }
    
    return {
      cards: updatedCards,
      selectedCardIndex: null,
      selectedCardId: null,
      showCardDetail: false
    };
  },

  // Handle discarding a card
  handleDiscardCard: (playerId, selectedCardIndex, cards, state, callbacks = {}) => {
    const { requiredWDiscards, discardedCount, showDiscardDialog } = state;
    
    if (selectedCardIndex === null || !cards[selectedCardIndex]) {
      return null;
    }
    
    // Get the selected card
    const cardToDiscard = cards[selectedCardIndex];
    
    // Remove the card from the player's hand
    const updatedCards = [...cards];
    updatedCards.splice(selectedCardIndex, 1);
    
    // Check if we're tracking W card discards and this is a W card
    const isTrackingWDiscards = requiredWDiscards > 0 && showDiscardDialog;
    const isWCard = cardToDiscard.type === 'W';
    
    // Update discard count if necessary
    let newDiscardedCount = discardedCount;
    if (isTrackingWDiscards && isWCard) {
      newDiscardedCount = discardedCount + 1;
      console.log(`CardActions - handleDiscardCard - W card discarded (${newDiscardedCount}/${requiredWDiscards})`);
    }
    
    // Update the player's cards in the game state
    const player = window.GameState.players.find(p => p.id === playerId);
    
    if (player) {
      player.cards = updatedCards;
      window.GameState.saveState();
    }
    
    // Call the callback with the discarded card
    if (callbacks.onCardDiscarded) {
      callbacks.onCardDiscarded(cardToDiscard);
    }
    
    // Return the updated state
    const updatedState = {
      cards: updatedCards,
      selectedCardIndex: null,
      selectedCardId: null,
      showCardDetail: false,
      discardedCount: newDiscardedCount,
      // Hide dialog if we've reached the required number of discards
      showDiscardDialog: !(isTrackingWDiscards && newDiscardedCount >= requiredWDiscards) && showDiscardDialog
    };
    
    // If we've completed all required discards, trigger callback after a short delay
    if (isTrackingWDiscards && newDiscardedCount >= requiredWDiscards) {
      setTimeout(() => {
        if (callbacks.resetDiscardTracking) {
          callbacks.resetDiscardTracking();
        }
        // Notify that we've completed the required discards if callback exists
        if (callbacks.onWDiscardComplete) {
          callbacks.onWDiscardComplete();
        }
      }, 500);
    }
    
    return updatedState;
  },

  // Handle discarding a card directly from the dialog
  handleDialogDiscard: (playerId, cardIndex, cards, state, callbacks = {}) => {
    const { requiredWDiscards, discardedCount } = state;
    console.log(`CardActions - handleDialogDiscard - Discarding card at index ${cardIndex}`);
    
    if (cardIndex === null || cardIndex < 0 || cardIndex >= cards.length) {
      console.warn('CardActions - handleDialogDiscard - Invalid card index:', cardIndex);
      return null;
    }
    
    // Get the card to discard
    const cardToDiscard = cards[cardIndex];
    
    // Remove the card from the player's hand
    const updatedCards = [...cards];
    updatedCards.splice(cardIndex, 1);
    
    // Since we're called from the dialog, we're already tracking discards and it's definitely a W card
    let newDiscardedCount = discardedCount + 1;
    console.log(`CardActions - handleDialogDiscard - W card discarded (${newDiscardedCount}/${requiredWDiscards})`);
    
    // Update the player's cards in the game state
    const player = window.GameState.players.find(p => p.id === playerId);
    
    if (player) {
      player.cards = updatedCards;
      window.GameState.saveState();
    }
    
    // Call the callback with the discarded card
    if (callbacks.onCardDiscarded) {
      callbacks.onCardDiscarded(cardToDiscard);
    }
    
    // Return updated state
    const updatedState = {
      cards: updatedCards,
      selectedCardIndex: null,
      selectedCardId: null,
      discardedCount: newDiscardedCount,
      // Hide dialog if we've reached the required number of discards
      showDiscardDialog: !(newDiscardedCount >= requiredWDiscards)
    };
    
    // If we've completed all required discards, trigger callbacks after a short delay
    if (newDiscardedCount >= requiredWDiscards) {
      setTimeout(() => {
        if (callbacks.resetDiscardTracking) {
          callbacks.resetDiscardTracking();
        }
        // Notify that we've completed the required discards if callback exists
        if (callbacks.onWDiscardComplete) {
          callbacks.onWDiscardComplete();
        }
      }, 500);
    }
    
    return updatedState;
  },

  // Handle drawing a new card
  drawCard: (playerId, cardType, cardData, callbacks = {}) => {
    console.log('CardActions - drawCard - Drawing card of type:', cardType, 'with data:', cardData);
    
    // Create a new card object
    const newCard = {
      id: `${cardType}-card-${Date.now()}`, // Unique ID with type prefix
      type: cardType, // Explicitly set the type
      ...cardData
    };
    
    console.log('CardActions - drawCard - Created new card:', newCard);
    
    // Update player state
    const player = window.GameState.players.find(p => p.id === playerId);
    
    if (player) {
      // Add card to hand
      const updatedCards = [...player.cards, newCard];
      player.cards = updatedCards;
      window.GameState.saveState();
      
      return updatedCards;
    }
    
    return null;
  },

  // Handle selecting a card for replacement
  handleSelectForReplacement: (index, selectedForReplacement, requiredWReplacements) => {
    // Toggle selection - if already selected, remove it
    if (selectedForReplacement.includes(index)) {
      const updated = selectedForReplacement.filter(i => i !== index);
      console.log(`CardActions - Unselected card at index ${index} for replacement`);
      return updated;
    } 
    // Otherwise add it, but only if we haven't reached the required count
    else if (selectedForReplacement.length < requiredWReplacements) {
      const updated = [...selectedForReplacement, index];
      console.log(`CardActions - Selected card at index ${index} for replacement`);
      return updated;
    }
    
    // No change if already at required count
    return selectedForReplacement;
  },

  // Handle confirming the replacement of selected cards
  handleConfirmReplacement: (playerId, selectedForReplacement, cards, callbacks = {}) => {
    if (selectedForReplacement.length === 0) {
      console.log('CardActions - No cards selected for replacement');
      return null;
    }
    
    console.log(`CardActions - Confirming replacement of ${selectedForReplacement.length} W cards`);
    
    // Get the player from GameState
    const player = window.GameState.players.find(p => p.id === playerId);
    if (!player) {
      console.error('CardActions - Player not found for replacement');
      return null;
    }
    
    // Get the cards to be replaced for later reference
    const cardsToReplace = selectedForReplacement.map(index => ({ ...cards[index] }));
    
    // Remove the selected cards from the player's hand (in reverse order to avoid index shifting)
    const updatedCards = [...cards];
    [...selectedForReplacement].sort((a, b) => b - a).forEach(index => {
      updatedCards.splice(index, 1);
    });
    
    // Update player's cards in GameState
    player.cards = updatedCards;
    window.GameState.saveState();
    
    // Draw new W cards to replace the discarded ones
    if (callbacks.drawNewCards) {
      callbacks.drawNewCards(cardsToReplace.length);
    }
    
    return {
      cards: updatedCards,
      replacementCount: selectedForReplacement.length,
      selectedForReplacement: []
    };
  }
};

console.log('CardActions.js code execution finished');
