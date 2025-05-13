// MoveLogicCardEffects.js - Card effect processing
console.log('MoveLogicCardEffects.js file is beginning to be used');

/**
 * MoveLogicCardEffects - Extends MoveLogicVisitTypes with card effect processing
 * 
 * This module enhances MoveLogicVisitTypes with card effect handling capabilities
 * to process different types of card effects on spaces.
 */
(function() {
  // Make sure MoveLogicVisitTypes is loaded
  if (!window.MoveLogicVisitTypes) {
    console.error('MoveLogicCardEffects: MoveLogicVisitTypes not found. Make sure to include MoveLogicVisitTypes.js first.');
    return;
  }
  
  // Define the MoveLogicCardEffects class
  function MoveLogicCardEffects() {
    // Call the parent constructor
    window.MoveLogicVisitTypes.call(this);
    
    console.log('MoveLogicCardEffects: Constructor initialized');
    console.log('MoveLogicCardEffects: Card effect processing system added. [2025-05-02]');
    console.log('MoveLogicCardEffects: Initialized successfully');
  }
  
  // Inherit from MoveLogicVisitTypes
  MoveLogicCardEffects.prototype = Object.create(window.MoveLogicVisitTypes.prototype);
  MoveLogicCardEffects.prototype.constructor = MoveLogicCardEffects;
  
  /**
   * Handle standard card effects for any space based on space properties and dice roll
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to apply effects to
   * @param {Object} space - The current space with effect properties
   * @param {Object} diceRoll - The current dice roll result (optional)
   * @returns {boolean} - True if effects were applied
   */
  MoveLogicCardEffects.prototype.handleSpaceCardEffects = function(gameState, player, space, diceRoll) {
    console.log(`MoveLogicCardEffects: Handling standard card effects for space: ${space.name}`);
    
    // Default diceRoll to null if not provided
    diceRoll = diceRoll || null;
    
    // Track if any effects were applied
    let effectsApplied = false;
    
    // Get roll value if dice roll is provided
    const rollValue = diceRoll ? (diceRoll.total || diceRoll.value || 0) : 0;
    console.log(`MoveLogicCardEffects: Using dice roll value: ${rollValue}`);
    
    // Try to extract card effect properties from the space
    // These properties are derived from the CSV columns in Spaces.csv
    const cardEffects = {
      wCard: space.WCard || space.wCard,
      bCard: space.BCard || space.bCard,
      iCard: space.ICard || space.iCard,
      lCard: space.LCard || space.lCard,
      eCard: space.ECard || space.eCard
    };
    
    console.log(`MoveLogicCardEffects: Card effects from space:`, cardEffects);
    
    // Create a collection of effects applied to notify the UI
    const appliedEffects = [];
    
    // Process each type of card effect
    for (const [cardType, effect] of Object.entries(cardEffects)) {
      // Skip empty effects
      if (!effect || effect === 'n/a' || effect.trim() === '') {
        continue;
      }
      
      // Standardize card type
      const standardCardType = cardType.replace('Card', '').toUpperCase();
      
      // Process different effect types
      if (effect.includes('Draw')) {
        // 1. Draw card effects
        // Example format: "Draw 1" or "Draw 1 if you roll a 3"
        const shouldDraw = effect.includes('if you roll') ? 
          effect.includes(`roll a ${rollValue}`) || effect.includes(`roll ${rollValue}`) : 
          true;
        
        if (shouldDraw && gameState.drawCard) {
          // Extract number of cards to draw
          const drawMatch = effect.match(/Draw (\d+)/);
          const drawCount = drawMatch ? parseInt(drawMatch[1]) : 1;
          
          // Draw the cards
          const drawnCards = [];
          for (let i = 0; i < drawCount; i++) {
            const drawnCard = gameState.drawCard(player.id, standardCardType);
            if (drawnCard) {
              drawnCards.push(drawnCard);
              console.log(`MoveLogicCardEffects: Drew ${standardCardType} card ${drawnCard.id}`);
              effectsApplied = true;
            }
          }
          
          // If cards were drawn, add to applied effects
          if (drawnCards.length > 0) {
            appliedEffects.push({
              type: 'draw',
              cardType: standardCardType,
              count: drawnCards.length,
              cards: drawnCards
            });
            
            // Dispatch cardDrawn event for each card
            drawnCards.forEach(card => {
              // Create a specific cardDrawn event for the UI to respond to
              gameState.dispatchEvent('cardDrawn', {
                player: player,
                playerId: player.id,
                cardType: standardCardType,
                card: card,
                fromSpace: space.name,
                rollValue: rollValue
              });
            });
          }
        }
      } 
      else if (effect.includes('Replace')) {
        // 2. Replace card effects
        // Example format: "Replace 1" or "Replace 1 if you roll a 5"
        const shouldReplace = effect.includes('if you roll') ? 
          effect.includes(`roll a ${rollValue}`) || effect.includes(`roll ${rollValue}`) : 
          true;
        
        if (shouldReplace && gameState.replaceCard) {
          // Extract number of cards to replace
          const replaceMatch = effect.match(/Replace (\d+)/);
          const replaceCount = replaceMatch ? parseInt(replaceMatch[1]) : 1;
          
          // Replace the cards
          const replacedCards = gameState.replaceCard(player.id, standardCardType, replaceCount);
          console.log(`MoveLogicCardEffects: Replaced ${replaceCount} ${standardCardType} card(s)`);
          effectsApplied = true;
          
          // Add to applied effects
          appliedEffects.push({
            type: 'replace',
            cardType: standardCardType,
            count: replaceCount,
            replacedCards: replacedCards
          });
          
          // Dispatch cardReplaced event
          gameState.dispatchEvent('cardReplaced', {
            player: player,
            playerId: player.id,
            cardType: standardCardType,
            count: replaceCount,
            replacedCards: replacedCards,
            fromSpace: space.name,
            rollValue: rollValue
          });
        }
      }
      else if (effect.includes('Return')) {
        // 3. Return/discard card effects
        // Example format: "Return 1" or "Return 1 if you roll a 6"
        const shouldReturn = effect.includes('if you roll') ? 
          effect.includes(`roll a ${rollValue}`) || effect.includes(`roll ${rollValue}`) : 
          true;
        
        if (shouldReturn && gameState.discardCard && player.cards) {
          // Extract number of cards to return
          const returnMatch = effect.match(/Return (\d+)/);
          const returnCount = returnMatch ? parseInt(returnMatch[1]) : 1;
          
          // Find cards of the specified type
          const cardsOfType = player.cards.filter(card => 
            card.type === standardCardType
          );
          
          // Return/discard the cards
          const cardsToReturn = cardsOfType.slice(0, returnCount);
          const discardedCards = [];
          
          for (const card of cardsToReturn) {
            const discarded = gameState.discardCard(player.id, card.id);
            if (discarded) {
              discardedCards.push(card);
              console.log(`MoveLogicCardEffects: Returned/discarded ${standardCardType} card ${card.id}`);
              effectsApplied = true;
            }
          }
          
          // If cards were discarded, add to applied effects
          if (discardedCards.length > 0) {
            appliedEffects.push({
              type: 'discard',
              cardType: standardCardType,
              count: discardedCards.length,
              cards: discardedCards
            });
            
            // Dispatch cardDiscarded event for batch of cards
            gameState.dispatchEvent('cardDiscarded', {
              player: player,
              playerId: player.id,
              cardType: standardCardType,
              count: discardedCards.length,
              cards: discardedCards,
              fromSpace: space.name,
              rollValue: rollValue
            });
          }
        }
      }
      else if (effect.includes('person to your')) {
        // 4. Transfer card to another player
        // Example: "The person to your right takes a card"
        if (gameState.getNextPlayer && gameState.getPreviousPlayer && gameState.transferCard) {
          const direction = effect.includes('right') ? 'right' : 'left';
          const targetPlayer = direction === 'right' ? 
            gameState.getNextPlayer(player.id) : 
            gameState.getPreviousPlayer(player.id);
          
          if (targetPlayer) {
            const transferResult = gameState.transferCard(player.id, targetPlayer.id, 'any', 1);
            console.log(`MoveLogicCardEffects: Transferred card to player ${targetPlayer.name} to the ${direction}`);
            effectsApplied = true;
            
            // Add to applied effects
            appliedEffects.push({
              type: 'transfer',
              direction: direction,
              fromPlayer: player,
              toPlayer: targetPlayer,
              result: transferResult
            });
            
            // Dispatch cardTransferred event
            gameState.dispatchEvent('cardTransferred', {
              fromPlayer: player,
              fromPlayerId: player.id,
              toPlayer: targetPlayer,
              toPlayerId: targetPlayer.id,
              result: transferResult,
              fromSpace: space.name,
              rollValue: rollValue
            });
          }
        }
      }
    }
    
    // Handle additional time and fee effects
    if (space.Time && space.Time.trim() !== '' && space.Time !== 'n/a') {
      if (gameState.applyTimeCostToPlayer) {
        // Extract time value (e.g., "5 days" -> 5)
        const timeMatch = space.Time.match(/(\d+)\s*days?/);
        const timeCost = timeMatch ? parseInt(timeMatch[1]) : 0;
        
        if (timeCost > 0) {
          const timeCostResult = gameState.applyTimeCostToPlayer(player.id, timeCost, `${space.name} time cost`);
          console.log(`MoveLogicCardEffects: Applied ${timeCost} day time cost from space ${space.name}`);
          effectsApplied = true;
          
          // Add to applied effects
          appliedEffects.push({
            type: 'timeCost',
            days: timeCost,
            reason: `${space.name} time cost`,
            result: timeCostResult
          });
          
          // Dispatch timeCostApplied event
          gameState.dispatchEvent('timeCostApplied', {
            player: player,
            playerId: player.id,
            days: timeCost,
            reason: `${space.name} time cost`,
            space: space,
            rollValue: rollValue
          });
        }
      }
    }
    
    if (space.Fee && space.Fee.trim() !== '' && space.Fee !== 'n/a') {
      if (gameState.applyFeeToPlayer) {
        let fee = 0;
        let feeType = '';
        
        // Handle percentage fees (e.g., "1%")
        if (space.Fee.includes('%')) {
          const percentMatch = space.Fee.match(/(\d+(\.\d+)?)\s*%/);
          const percent = percentMatch ? parseFloat(percentMatch[1]) : 0;
          
          // Calculate fee based on project scope or other metric
          const projectScope = gameState.getProjectScope ? gameState.getProjectScope() : 100000;
          fee = projectScope * (percent / 100);
          feeType = 'percentage';
        }
        // Handle fixed fees (e.g., "$500")
        else {
          const fixedMatch = space.Fee.match(/\$(\d+(\.\d+)?)/);
          fee = fixedMatch ? parseFloat(fixedMatch[1]) : 0;
          feeType = 'fixed';
        }
        
        if (fee > 0) {
          const feeResult = gameState.applyFeeToPlayer(player.id, fee, `${space.name} fee`);
          console.log(`MoveLogicCardEffects: Applied fee of ${fee} from space ${space.name}`);
          effectsApplied = true;
          
          // Add to applied effects
          appliedEffects.push({
            type: 'fee',
            amount: fee,
            feeType: feeType,
            reason: `${space.name} fee`,
            result: feeResult
          });
          
          // Dispatch feeApplied event
          gameState.dispatchEvent('feeApplied', {
            player: player,
            playerId: player.id,
            amount: fee,
            feeType: feeType,
            reason: `${space.name} fee`,
            space: space,
            rollValue: rollValue
          });
        }
      }
    }
    
    // If any effects were applied, dispatch a consolidated cardEffectsApplied event
    if (effectsApplied && appliedEffects.length > 0) {
      gameState.dispatchEvent('gameStateChanged', {
        changeType: 'cardEffectsApplied',
        player: player,
        playerId: player.id,
        space: space,
        spaceName: space.name,
        effects: appliedEffects,
        rollValue: rollValue
      });
    }
    
    return effectsApplied;
  };
  
  /**
   * Override getSpaceDependentMoves to add card effect handling
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  MoveLogicCardEffects.prototype.getSpaceDependentMoves = function(gameState, player, currentSpace) {
    console.log(`MoveLogicCardEffects: Getting space-dependent moves for ${currentSpace.name}`);
    
    // Use our helper function to resolve the appropriate space based on visit type
    let spaceToUse = this.resolveSpaceForVisitType(gameState, player, currentSpace.name);
    
    // If space resolution failed, fall back to the current space
    if (!spaceToUse) {
      console.warn(`MoveLogicCardEffects: Failed to resolve appropriate space, using current space`);
      spaceToUse = currentSpace;
    }
    
    console.log(`MoveLogicCardEffects: Using space with ID ${spaceToUse.id} for moves`);
    
    // Apply card effects from the space
    const spaceTypes = this.getSpaceTypes(gameState, player, spaceToUse);
    if (!spaceTypes.includes(this.spaceTypes.CARD_EFFECT)) {
      // Only apply card effects here if not already applied by the card effect handler
      const lastDiceRoll = gameState.getLastDiceRoll ? gameState.getLastDiceRoll() : null;
      this.handleSpaceCardEffects(gameState, player, spaceToUse, lastDiceRoll);
    }
    
    // Call the parent method to handle standard move logic
    return window.MoveLogicVisitTypes.prototype.getSpaceDependentMoves.call(this, gameState, player, currentSpace);
  };
  
  // Expose the class to the global scope
  window.MoveLogicCardEffects = MoveLogicCardEffects;
})();

console.log('MoveLogicCardEffects.js code execution finished');