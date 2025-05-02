// MoveLogicBase.js - Core move logic and calculations
console.log('MoveLogicBase.js file is beginning to be used');

/**
 * MoveLogicBase - Core logic for game movements
 * 
 * This module handles the core functionality of movement logic including:
 * - Getting available moves for a player
 * - Handling space-dependent moves
 * - Processing special patterns in spaces
 */
(function() {
  // Define the MoveLogicBase class
  function MoveLogicBase() {
    console.log('MoveLogicBase: Constructor initialized');
    
    // Configuration for move logic
    this.specialPatterns = [
      'Outcome from rolled dice',
      'Option from first visit'
    ];
    
    console.log('MoveLogicBase: Card effects handling and game state integration fixed. [2025-04-30]');
    console.log('MoveLogicBase: Initialized successfully');
  }
  
  /**
   * Get all available moves for a player
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  MoveLogicBase.prototype.getAvailableMoves = function(gameState, player) {
    // Get the player's current space
    const currentSpace = gameState.spaces.find(s => s.id === player.position);
    if (!currentSpace) return [];
    
    console.log('MoveLogicBase: Getting moves for space:', currentSpace.name);
    
    // Special case for ARCH-INITIATION on subsequent visit - force dice roll
    if (currentSpace.name === 'ARCH-INITIATION') {
      // Check if this is a subsequent visit
      const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
      const visitType = hasVisited ? 'subsequent' : 'first';
      
      // Force dice roll for ARCH-INITIATION on subsequent visit for testing
      if (visitType === 'subsequent') {
        console.log('MoveLogicBase: ARCH-INITIATION on subsequent visit - forcing dice roll');
        return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
      }
    }
    
    // Check for special case spaces that have custom logic
    if (this.hasSpecialCaseLogic(currentSpace.name)) {
      console.log('MoveLogicBase: Using special case logic for', currentSpace.name);
      return this.handleSpecialCaseSpace(gameState, player, currentSpace);
    }
    
    // Get standard moves from space data
    const result = this.getSpaceDependentMoves(gameState, player, currentSpace);
    
    // Check if result indicates that dice roll is needed
    if (result && typeof result === 'object' && result.requiresDiceRoll) {
      console.log('MoveLogicBase: Space requires dice roll for movement');
      return { requiresDiceRoll: true, spaceName: result.spaceName, visitType: result.visitType };
    }
    
    // Standard case - array of available moves
    console.log('MoveLogicBase: Space-dependent moves count:', result.length);
    return result;
  };
  
  /**
   * Check if a space has special case logic
   * @param {string} spaceName - The name of the space to check
   * @returns {boolean} - True if space has special case logic
   */
  MoveLogicBase.prototype.hasSpecialCaseLogic = function(spaceName) {
    const specialCaseSpaces = ['ARCH-INITIATION', 'PM-DECISION-CHECK', 'REG-FDNY-FEE-REVIEW'];
    return specialCaseSpaces.includes(spaceName);
  };
  
  /**
   * Handle special case spaces with custom logic
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  MoveLogicBase.prototype.handleSpecialCaseSpace = function(gameState, player, currentSpace) {
    // This is just a dispatcher to the appropriate special case handler
    // The actual implementations are in MoveLogicSpecialCases.js
    // This method will be overridden by the special cases module
    console.log('MoveLogicBase: Default special case handler');
    return [];
  };
  
  /**
   * Get moves based on space data and visit type
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  MoveLogicBase.prototype.getSpaceDependentMoves = function(gameState, player, currentSpace) {
    // Get visit type for the current space
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log('MoveLogicBase: Visit type for', currentSpace.name, 'is', visitType);
    
    // Find all spaces with the same name
    const spacesWithSameName = gameState.spaces.filter(s => s.name === currentSpace.name);
    
    // Find the one with the matching visit type
    const spaceForVisitType = spacesWithSameName.find(s => 
      s.visitType.toLowerCase() === visitType.toLowerCase()
    );
    
    // Use the right space or fall back to current one
    const spaceToUse = spaceForVisitType || currentSpace;
    
    console.log('MoveLogicBase: Using space with ID', spaceToUse.id, 'for moves');
    
    // Apply card effects from the space
    // Get the last dice roll if available
    const lastDiceRoll = gameState.getLastDiceRoll ? gameState.getLastDiceRoll() : null;
    // Apply card effects based on space and dice roll
    this.handleSpaceCardEffects(gameState, player, spaceToUse, lastDiceRoll);
    
    const availableMoves = [];
    let hasSpecialPattern = false;
    let isDiceRollSpace = false;
    
    // Process each next space
    for (const nextSpaceName of spaceToUse.nextSpaces) {
      // Skip empty space names
      if (!nextSpaceName || nextSpaceName.trim() === '') continue;
      
      // Check if this is a negotiate option
      if (nextSpaceName.toLowerCase().includes('negotiate')) {
        console.log('MoveLogicBase: Found negotiate option:', nextSpaceName);
        // We don't add negotiate options to available moves, as they're handled by a separate UI element
        continue;
      }
      
      // Check if this is a special pattern
      if (this.specialPatterns.some(pattern => nextSpaceName.includes(pattern))) {
        hasSpecialPattern = true;
        console.log('MoveLogicBase: Found special pattern in next space:', nextSpaceName);
        
        // Check if this is a dice roll space
        if (nextSpaceName.includes('Outcome from rolled dice')) {
          isDiceRollSpace = true;
          console.log('MoveLogicBase: This is a dice roll space');
        }
        
        continue; // Skip this entry
      }
      
      // Get base name without explanatory text
      const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
      
      console.log('MoveLogicBase: Processing next space:', cleanedSpaceName);
      
      // Find spaces with matching name
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === cleanedSpaceName
      );
      
      if (matchingSpaces.length > 0) {
        // Determine if the player has visited this space before
        const hasVisitedNextSpace = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const nextVisitType = hasVisitedNextSpace ? 'subsequent' : 'first';
        
        // Find the right version of the space
        const nextSpace = matchingSpaces.find(s => 
          s.visitType.toLowerCase() === nextVisitType.toLowerCase()
        ) || matchingSpaces[0];
        
        // Add to available moves if not already in the list
        if (!availableMoves.some(move => move.id === nextSpace.id)) {
          availableMoves.push(nextSpace);
          console.log('MoveLogicBase: Added move:', nextSpace.name, nextSpace.id);
        }
      } else {
        console.log('MoveLogicBase: No matching space found for:', cleanedSpaceName);
      }
    }
    
    // Handle special case for dice roll spaces
    if (isDiceRollSpace) {
      console.log('MoveLogicBase: This space requires a dice roll to determine next moves');
      // Mark this space as requiring a dice roll
      return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
    }
    
    // Handle special case where we had special patterns but no valid moves
    if (hasSpecialPattern && availableMoves.length === 0 && !isDiceRollSpace) {
      console.log('MoveLogicBase: Special case detected with no valid moves - applying fallback logic');
      // For now, just return an empty array
    }
    
    return availableMoves;
  };
  
  /**
   * Handle standard card effects for any space based on space properties and dice roll
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to apply effects to
   * @param {Object} space - The current space with effect properties
   * @param {Object} diceRoll - The current dice roll result (optional)
   * @returns {boolean} - True if effects were applied
   */
  MoveLogicBase.prototype.handleSpaceCardEffects = function(gameState, player, space, diceRoll) {
    console.log('MoveLogicBase: Handling standard card effects for space:', space.name);
    
    // Default diceRoll to null if not provided
    diceRoll = diceRoll || null;
    
    // Track if any effects were applied
    let effectsApplied = false;
    
    // Get roll value if dice roll is provided
    const rollValue = diceRoll ? (diceRoll.total || diceRoll.value || 0) : 0;
    console.log(`MoveLogicBase: Using dice roll value: ${rollValue}`);
    
    // Try to extract card effect properties from the space
    // These properties are derived from the CSV columns in Spaces.csv
    const cardEffects = {
      wCard: space.WCard || space.wCard,
      bCard: space.BCard || space.bCard,
      iCard: space.ICard || space.iCard,
      lCard: space.LCard || space.lCard,
      eCard: space.ECard || space.eCard
    };
    
    console.log('MoveLogicBase: Card effects from space:', cardEffects);
    
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
              console.log(`MoveLogicBase: Drew ${standardCardType} card ${drawnCard.id}`);
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
          console.log(`MoveLogicBase: Replaced ${replaceCount} ${standardCardType} card(s)`);
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
              console.log(`MoveLogicBase: Returned/discarded ${standardCardType} card ${card.id}`);
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
            console.log(`MoveLogicBase: Transferred card to player ${targetPlayer.name} to the ${direction}`);
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
          console.log(`MoveLogicBase: Applied ${timeCost} day time cost from space ${space.name}`);
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
          console.log(`MoveLogicBase: Applied fee of ${fee} from space ${space.name}`);
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
  
  // Expose the class to the global scope
  window.MoveLogicBase = MoveLogicBase;
})();

console.log('MoveLogicBase.js code execution finished');
