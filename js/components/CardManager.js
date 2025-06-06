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
        let bankAmount = 0;
        
        // Check unified format first
        if (card.loan_amount && card.loan_amount > 0) {
          bankAmount = card.loan_amount;
        }
        // Check legacy Amount field
        else if (card['Amount']) {
          if (typeof card['Amount'] === 'number') {
            bankAmount = card['Amount'];
          } else if (typeof card['Amount'] === 'string') {
            const cleanAmount = card['Amount'].replace(/[\$,]/g, '');
            bankAmount = parseInt(cleanAmount, 10);
          }
        }
        // Check for Effect text that might contain monetary values
        else if (card['Effect']) {
          const effectText = card['Effect'];
          const moneyMatch = effectText.match(/\$(\d+(?:,\d+)*)/);
          if (moneyMatch && moneyMatch[1]) {
            bankAmount = parseInt(moneyMatch[1].replace(/,/g, ''), 10);
          }
        }
        
        if (!isNaN(bankAmount) && bankAmount > 0) {
          console.log(`CardManager: Adding ${bankAmount.toLocaleString()} to player's wallet from Bank card`);
          cardEffects.money = bankAmount;
        }
        break;
        
      case 'I': // Investor card
        let investorAmount = 0;
        
        // Check unified format first
        if (card.investment_amount && card.investment_amount > 0) {
          investorAmount = card.investment_amount;
        }
        // Check legacy Amount field
        else if (card['Amount']) {
          if (typeof card['Amount'] === 'number') {
            investorAmount = card['Amount'];
          } else if (typeof card['Amount'] === 'string') {
            const cleanAmount = card['Amount'].replace(/[\$,]/g, '');
            investorAmount = parseInt(cleanAmount, 10);
          }
        }
        // Check for Description that might contain monetary values
        else if (card['Description']) {
          const descText = card['Description'];
          const moneyMatch = descText.match(/\$(\d+(?:,\d+)*)/);
          if (moneyMatch && moneyMatch[1]) {
            investorAmount = parseInt(moneyMatch[1].replace(/,/g, ''), 10);
          }
        }
        
        if (!isNaN(investorAmount) && investorAmount > 0) {
          console.log(`CardManager: Adding ${investorAmount.toLocaleString()} to player's wallet from Investor card`);
          cardEffects.money = investorAmount;
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
        // Work cards represent scope/commitments (costs), NOT income
        // They should not add money to the player's wallet
        // The money comes from Bank/Investor cards to fund the work
        console.log(`CardManager: Work card drawn - represents scope commitment, not income`);
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
  
  // Handle drawing cards manually - Updated to use event system and conditional dice rolls
  handleDrawCards = (cardType, amount, currentPlayer, cardDisplayRef) => {
    console.log('CardManager: Drawing cards manually -', amount, cardType, 'cards');
    
    if (!currentPlayer) {
      console.log('CardManager: No current player found');
      return;
    }
    
    // NEW: Check if this card draw is conditional on a dice roll
    const currentSpaceId = currentPlayer.position;
    
    // Safely check if conditionalCardRequirements exists and has requirements for this space
    const conditionalRequirements = this.gameBoard.state && 
                                   this.gameBoard.state.conditionalCardRequirements && 
                                   this.gameBoard.state.conditionalCardRequirements[currentSpaceId];
    
    // If there are conditional requirements for this space
    if (conditionalRequirements && conditionalRequirements.cardType === cardType) {
      console.log('CardManager: Found conditional card requirements:', conditionalRequirements);
      
      // Check if the requirements have been satisfied by a dice roll
      if (!conditionalRequirements.satisfied) {
        console.log('CardManager: Conditional requirements not satisfied. Cannot draw card without required dice roll.');
        
        // Show a message to the player
        if (this.gameBoard.showMessage) {
          this.gameBoard.showMessage(`You need to roll a ${conditionalRequirements.requiredRoll} before drawing this card.`);
        } else {
          alert(`Roll the dice first! You need to roll a ${conditionalRequirements.requiredRoll} to draw this card.`);
        }
        
        // If the dice roll hasn't happened yet, trigger it
        if (this.gameBoard.diceManager && !this.gameBoard.state.hasRolledDice) {
          console.log('CardManager: Triggering dice roll for conditional card draw');
          this.gameBoard.diceManager.handleRollDiceClick();
        }
        
        return [];
      } else {
        console.log('CardManager: Conditional requirements satisfied. Proceeding with card draw.');
        // Requirements are satisfied, proceed with the card draw
      }
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

  // Enhanced card effect processing with new metadata fields
  processCardEffectsEnhanced(card, player, immediate = true) {
    console.log('CardManager: Processing enhanced card effects', card);
    
    if (!card || !player) return;

    // Check for combo opportunities before processing individual card
    this.checkAndProcessCombos(card, player);

    // Handle new metadata fields
    this.processTarget(card, player);
    this.processScope(card, player);
    this.processDuration(card, player);
    this.processConditionalLogic(card, player);
    
    // Process chain effects
    this.processChainEffects(card, player);
    
    // Legacy effect processing for backward compatibility
    if (card.effect || card.description || card.Effect || card.Description) {
      this.processCardEffects(card, player, immediate);
    }
  }

  // Enhanced targeting system for complex card mechanics
  processTarget(card, player) {
    if (!card.target) return [player];

    // Complex targeting patterns
    const targetResult = this.parseComplexTarget(card.target, player);
    
    // Apply targeting filters and conditions
    const filteredTargets = this.applyTargetingFilters(targetResult.targets, card, player);
    
    // Apply targeting restrictions
    const validTargets = this.validateTargets(filteredTargets, card, player);
    
    return {
      targets: validTargets,
      targetType: targetResult.type,
      conditions: targetResult.conditions,
      restrictions: card.target_restrictions || [],
      metadata: {
        originalTarget: card.target,
        filterCount: targetResult.targets.length - validTargets.length,
        timestamp: Date.now()
      }
    };
  }

  // Parse complex targeting patterns
  parseComplexTarget(targetString, player) {
    const result = {
      type: 'simple',
      targets: [],
      conditions: [],
      modifiers: []
    };

    // Handle compound targeting (e.g., "Choose Player+Adjacent", "All Players-Self")
    if (targetString.includes('+') || targetString.includes('-') || targetString.includes('|')) {
      return this.parseCompoundTarget(targetString, player);
    }

    // Handle conditional targeting (e.g., "Player:money>100000", "Opponent:behind")
    if (targetString.includes(':')) {
      return this.parseConditionalTarget(targetString, player);
    }

    // Handle basic targeting patterns
    switch(targetString) {
      case 'Self':
        result.targets = [player];
        result.type = 'self';
        break;
        
      case 'Choose Player':
        result.targets = this.getAllSelectablePlayers(player);
        result.type = 'choice';
        break;
        
      case 'All Players':
        result.targets = window.GameStateManager.players || [player];
        result.type = 'all';
        break;
        
      case 'Choose Opponent':
      case 'Opponent':
        result.targets = this.getOpponents(player);
        result.type = 'opponent';
        break;
        
      case 'Next Player':
        result.targets = this.getNextPlayer(player);
        result.type = 'next';
        break;
        
      case 'Previous Player':
        result.targets = this.getPreviousPlayer(player);
        result.type = 'previous';
        break;
        
      case 'Leading Player':
        result.targets = this.getLeadingPlayers();
        result.type = 'leading';
        break;
        
      case 'Trailing Player':
        result.targets = this.getTrailingPlayers();
        result.type = 'trailing';
        break;
        
      case 'Random Player':
        result.targets = this.getRandomPlayer(player);
        result.type = 'random';
        break;
        
      case 'Adjacent Players':
        result.targets = this.getAdjacentPlayers(player);
        result.type = 'adjacent';
        break;
        
      default:
        result.targets = [player];
        result.type = 'default';
    }

    return result;
  }

  // Parse compound targeting patterns
  parseCompoundTarget(targetString, player) {
    const result = {
      type: 'compound',
      targets: [],
      conditions: [],
      operations: []
    };

    // Handle addition (e.g., "Self+Adjacent")
    if (targetString.includes('+')) {
      const parts = targetString.split('+');
      parts.forEach(part => {
        const subResult = this.parseComplexTarget(part.trim(), player);
        result.targets.push(...subResult.targets);
        result.operations.push({ type: 'add', target: part.trim() });
      });
    }
    
    // Handle subtraction (e.g., "All Players-Self")
    else if (targetString.includes('-')) {
      const [basePart, excludePart] = targetString.split('-');
      const baseResult = this.parseComplexTarget(basePart.trim(), player);
      const excludeResult = this.parseComplexTarget(excludePart.trim(), player);
      
      result.targets = baseResult.targets.filter(target => 
        !excludeResult.targets.some(exclude => exclude.id === target.id)
      );
      result.operations.push({ 
        type: 'subtract', 
        base: basePart.trim(), 
        exclude: excludePart.trim() 
      });
    }
    
    // Handle alternatives (e.g., "Choose Player|Random Player")
    else if (targetString.includes('|')) {
      const alternatives = targetString.split('|');
      // For now, choose the first available alternative
      for (let alt of alternatives) {
        const altResult = this.parseComplexTarget(alt.trim(), player);
        if (altResult.targets.length > 0) {
          result.targets = altResult.targets;
          result.operations.push({ type: 'alternative', chosen: alt.trim() });
          break;
        }
      }
    }

    // Remove duplicates
    result.targets = this.removeDuplicateTargets(result.targets);
    
    return result;
  }

  // Parse conditional targeting patterns
  parseConditionalTarget(targetString, player) {
    const [targetPart, conditionPart] = targetString.split(':');
    const baseResult = this.parseComplexTarget(targetPart.trim(), player);
    
    const result = {
      type: 'conditional',
      targets: [],
      conditions: [conditionPart.trim()],
      baseTargets: baseResult.targets
    };

    // Apply condition filter
    result.targets = baseResult.targets.filter(target => 
      this.evaluateTargetCondition(target, conditionPart.trim(), player)
    );

    return result;
  }

  // Evaluate targeting conditions
  evaluateTargetCondition(target, condition, currentPlayer) {
    try {
      // Money-based conditions
      if (condition.includes('money')) {
        const match = condition.match(/(money)([><=]+)(\d+)/);
        if (match) {
          const operator = match[2];
          const value = parseInt(match[3]);
          const targetMoney = target.resources?.money || 0;
          
          switch (operator) {
            case '>': return targetMoney > value;
            case '>=': return targetMoney >= value;
            case '<': return targetMoney < value;
            case '<=': return targetMoney <= value;
            case '=': return targetMoney === value;
          }
        }
      }

      // Time-based conditions
      if (condition.includes('time')) {
        const match = condition.match(/(time)([><=]+)(\d+)/);
        if (match) {
          const operator = match[2];
          const value = parseInt(match[3]);
          const targetTime = target.resources?.time || 0;
          
          switch (operator) {
            case '>': return targetTime > value;
            case '>=': return targetTime >= value;
            case '<': return targetTime < value;
            case '<=': return targetTime <= value;
            case '=': return targetTime === value;
          }
        }
      }

      // Position-based conditions
      if (condition === 'ahead') {
        return this.isPlayerAhead(target, currentPlayer);
      }
      
      if (condition === 'behind') {
        return this.isPlayerBehind(target, currentPlayer);
      }
      
      if (condition === 'same_position') {
        return target.currentSpace === currentPlayer.currentSpace;
      }

      // Card-based conditions
      if (condition.includes('cards')) {
        const match = condition.match(/cards([><=]+)(\d+)/);
        if (match) {
          const operator = match[1];
          const value = parseInt(match[2]);
          const cardCount = target.cards?.length || 0;
          
          switch (operator) {
            case '>': return cardCount > value;
            case '>=': return cardCount >= value;
            case '<': return cardCount < value;
            case '<=': return cardCount <= value;
            case '=': return cardCount === value;
          }
        }
      }

      // Phase-based conditions
      if (condition.includes('phase')) {
        const targetPhase = this.getPlayerPhase(target);
        const conditionPhase = condition.replace('phase:', '');
        return targetPhase === conditionPhase;
      }

      return true;
    } catch (error) {
      console.warn('CardManager: Failed to evaluate target condition:', condition, error);
      return true;
    }
  }

  // Apply targeting filters based on card properties
  applyTargetingFilters(targets, card, player) {
    let filteredTargets = [...targets];

    // Apply range restrictions
    if (card.target_range) {
      filteredTargets = this.applyRangeFilter(filteredTargets, card.target_range, player);
    }

    // Apply line of sight restrictions
    if (card.requires_line_of_sight) {
      filteredTargets = this.applyLineOfSightFilter(filteredTargets, player);
    }

    // Apply immunity checks
    filteredTargets = this.applyImmunityFilter(filteredTargets, card, player);

    return filteredTargets;
  }

  // Apply range-based targeting restrictions
  applyRangeFilter(targets, range, player) {
    if (!range || range === 'unlimited') return targets;
    
    const maxRange = parseInt(range) || Infinity;
    
    return targets.filter(target => {
      if (target.id === player.id) return true; // Self is always in range
      
      const distance = this.calculatePlayerDistance(player, target);
      return distance <= maxRange;
    });
  }

  // Apply line of sight restrictions
  applyLineOfSightFilter(targets, player) {
    return targets.filter(target => {
      if (target.id === player.id) return true; // Self always has LoS
      
      return this.hasLineOfSight(player, target);
    });
  }

  // Apply immunity filters
  applyImmunityFilter(targets, card, player) {
    return targets.filter(target => {
      // Check if target is immune to this card type
      if (target.immunities && target.immunities.includes(card.card_type)) {
        return false;
      }
      
      // Check if target is immune to this effect type
      if (target.immunities && card.immediate_effect && 
          target.immunities.includes(card.immediate_effect)) {
        return false;
      }
      
      return true;
    });
  }

  // Validate final target selection
  validateTargets(targets, card, player) {
    // Check minimum targets
    const minTargets = parseInt(card.min_targets) || 0;
    if (targets.length < minTargets) {
      console.warn(`CardManager: Insufficient targets (${targets.length}/${minTargets})`);
      return [];
    }

    // Check maximum targets
    const maxTargets = parseInt(card.max_targets) || targets.length;
    if (targets.length > maxTargets) {
      // If too many targets, might need player choice or random selection
      return this.selectTargetsFromCandidates(targets, maxTargets, card);
    }

    return targets;
  }

  // Helper methods for complex targeting

  getOpponents(player) {
    return (window.GameStateManager.players || []).filter(p => p.id !== player.id);
  }

  getLeadingPlayers() {
    const players = window.GameStateManager.players || [];
    if (players.length === 0) return [];
    
    // Determine leading based on game progress (could be space position, money, etc.)
    const maxMoney = Math.max(...players.map(p => p.resources?.money || 0));
    return players.filter(p => (p.resources?.money || 0) === maxMoney);
  }

  getTrailingPlayers() {
    const players = window.GameStateManager.players || [];
    if (players.length === 0) return [];
    
    const minMoney = Math.min(...players.map(p => p.resources?.money || 0));
    return players.filter(p => (p.resources?.money || 0) === minMoney);
  }

  getRandomPlayer(excludePlayer) {
    const players = (window.GameStateManager.players || [])
      .filter(p => p.id !== excludePlayer.id);
    
    if (players.length === 0) return [];
    
    const randomIndex = Math.floor(Math.random() * players.length);
    return [players[randomIndex]];
  }

  getAdjacentPlayers(player) {
    const players = window.GameStateManager.players || [];
    const currentIndex = players.findIndex(p => p.id === player.id);
    
    if (currentIndex === -1) return [];
    
    const adjacent = [];
    if (currentIndex > 0) adjacent.push(players[currentIndex - 1]);
    if (currentIndex < players.length - 1) adjacent.push(players[currentIndex + 1]);
    
    return adjacent;
  }

  getPreviousPlayer(player) {
    const players = window.GameStateManager.players || [];
    const currentIndex = players.findIndex(p => p.id === player.id);
    
    if (currentIndex <= 0) return [players[players.length - 1]];
    return [players[currentIndex - 1]];
  }

  getAllSelectablePlayers(excludePlayer) {
    return window.GameStateManager.players || [];
  }

  calculatePlayerDistance(player1, player2) {
    // Simple turn order distance for now
    const players = window.GameStateManager.players || [];
    const index1 = players.findIndex(p => p.id === player1.id);
    const index2 = players.findIndex(p => p.id === player2.id);
    
    if (index1 === -1 || index2 === -1) return Infinity;
    
    return Math.abs(index1 - index2);
  }

  hasLineOfSight(player1, player2) {
    // Simple implementation - could be enhanced based on board layout
    return true; // For now, assume all players have LoS to each other
  }

  isPlayerAhead(target, reference) {
    // Compare some progress metric (money, space position, etc.)
    const targetMoney = target.resources?.money || 0;
    const referenceMoney = reference.resources?.money || 0;
    return targetMoney > referenceMoney;
  }

  isPlayerBehind(target, reference) {
    const targetMoney = target.resources?.money || 0;
    const referenceMoney = reference.resources?.money || 0;
    return targetMoney < referenceMoney;
  }

  getPlayerPhase(player) {
    // Determine player's current phase based on their position/progress
    if (!player.currentSpace) return 'initiation';
    
    // Simple phase determination - could be enhanced
    const spaceName = player.currentSpace.toLowerCase();
    if (spaceName.includes('planning')) return 'planning';
    if (spaceName.includes('execution')) return 'execution';
    if (spaceName.includes('closure')) return 'closure';
    return 'initiation';
  }

  selectTargetsFromCandidates(candidates, maxCount, card) {
    // For now, return first N candidates
    // Could be enhanced with player choice or strategic selection
    return candidates.slice(0, maxCount);
  }

  removeDuplicateTargets(targets) {
    const seen = new Set();
    return targets.filter(target => {
      if (seen.has(target.id)) return false;
      seen.add(target.id);
      return true;
    });
  }

  // Process card scope effects
  processScope(card, player) {
    if (!card.scope) return;

    const targets = this.processTarget(card, player);
    
    switch(card.scope) {
      case 'Single':
        // Effect applies to one target only
        return targets.slice(0, 1);
      case 'Multiple':
        // Effect applies to multiple specific targets
        return targets;
      case 'Global':
        // Effect applies to all players
        return window.GameStateManager.players || [player];
      default:
        return targets;
    }
  }

  // Process card duration effects
  processDuration(card, player) {
    if (!card.duration || card.duration === 'Immediate') {
      // Apply effects immediately
      this.applyImmediateEffects(card, player);
      return;
    }

    // Handle persistent effects
    if (card.duration === 'Turns' || card.duration === 'Permanent') {
      this.addPersistentEffect(card, player);
    }
  }

  // Process conditional logic
  processConditionalLogic(card, player) {
    if (!card.conditional_logic) return true;

    // Parse and evaluate conditions
    const condition = card.conditional_logic.toLowerCase();
    
    // Handle common conditional patterns
    if (condition.includes('high-profile client')) {
      return player.hasHighProfileClient || false;
    }
    
    if (condition.includes('same worktype')) {
      return this.checkSameWorkType(player);
    }
    
    if (condition.includes('permits this turn')) {
      const permitMatch = condition.match(/(\d+)\+?\s*permits?/);
      if (permitMatch) {
        const requiredPermits = parseInt(permitMatch[1]);
        return (player.permitsThisTurn || 0) >= requiredPermits;
      }
    }

    // Default to true if condition cannot be evaluated
    console.warn('CardManager: Could not evaluate conditional logic:', card.conditional_logic);
    return true;
  }

  // Apply immediate card effects using new metadata
  applyImmediateEffects(card, player) {
    let moneyEffect = card.money_effect || 0;
    
    // Work cards represent scope (costs), not income - they should NOT add money
    if (card.card_type === 'W') {
      moneyEffect = 0; // Work cards don't add money
    }
    
    const effects = {
      money: moneyEffect,
      time: card.time_effect || 0,
      tickets: card.tick_modifier || 0
    };

    // Apply money effects
    if (effects.money !== 0) {
      player.resources = player.resources || {};
      player.resources.money = (player.resources.money || 0) + effects.money;
      console.log(`CardManager: Applied money effect ${effects.money} to ${player.name || 'player'}`);
    }

    // Apply time effects
    if (effects.time !== 0) {
      player.resources = player.resources || {};
      player.resources.time = (player.resources.time || 0) + effects.time;
    }

    // Handle card drawing
    if (card.draw_cards > 0) {
      this.drawCards(card.draw_cards, card.card_type_filter || 'W', player);
    }

    // Handle card discarding
    if (card.discard_cards > 0) {
      this.discardCards(card.discard_cards, player);
    }

    console.log('CardManager: Applied immediate effects:', effects);
  }

  // Add persistent effect for duration-based cards
  addPersistentEffect(card, player) {
    player.persistentEffects = player.persistentEffects || [];
    
    const effect = {
      cardId: card.card_id,
      card: card,
      turnsRemaining: card.duration_count || 1,
      appliedTurn: window.GameStateManager.currentTurn || 0,
      type: card.duration
    };

    player.persistentEffects.push(effect);
    console.log('CardManager: Added persistent effect:', effect);
  }

  // Process persistent effects at turn start/end
  processPersistentEffects(player) {
    if (!player.persistentEffects) return;

    player.persistentEffects = player.persistentEffects.filter(effect => {
      // Apply effect
      this.applyImmediateEffects(effect.card, player);
      
      // Decrement turns remaining
      if (effect.type === 'Turns') {
        effect.turnsRemaining--;
        return effect.turnsRemaining > 0;
      }
      
      // Permanent effects never expire
      return effect.type === 'Permanent';
    });
  }

  // Utility methods for conditional logic
  promptPlayerSelection(currentPlayer) {
    // This would typically show a UI for player selection
    // For now, return all other players
    return (window.GameStateManager.players || []).filter(p => p.id !== currentPlayer.id);
  }

  getNextPlayer(currentPlayer) {
    const players = window.GameStateManager.players || [];
    const currentIndex = players.findIndex(p => p.id === currentPlayer.id);
    const nextIndex = (currentIndex + 1) % players.length;
    return [players[nextIndex]];
  }

  checkSameWorkType(player) {
    const players = window.GameStateManager.players || [];
    return players.some(p => p.id !== player.id && p.workType === player.workType);
  }

  discardCards(count, player) {
    // Implementation for discarding cards from hand
    if (player.cards && player.cards.length > 0) {
      const cardsToDiscard = player.cards.splice(0, Math.min(count, player.cards.length));
      console.log(`CardManager: Discarded ${cardsToDiscard.length} cards for player ${player.name}`);
    }
  }

  // ======================
  // COMBO SYSTEM METHODS
  // ======================

  // Check for and process combo opportunities
  checkAndProcessCombos(triggerCard, player) {
    console.log('CardManager: Checking for combo opportunities', triggerCard.card_id);
    
    // Initialize combo tracking if not present
    if (!player.comboState) {
      player.comboState = {
        recentCards: [], // Cards played this turn or recently
        activeSequences: [], // Currently building combo sequences
        completedCombos: [] // Completed combos this game
      };
    }

    // Add current card to recent cards
    this.addToRecentCards(triggerCard, player);

    // Check for combo requirements on the trigger card
    if (triggerCard.combo_requirement) {
      const comboSatisfied = this.validateComboRequirement(triggerCard, player);
      if (comboSatisfied) {
        this.executeCombo(triggerCard, player, comboSatisfied.cards);
      }
    }

    // Check if this card enables other combo opportunities
    this.checkEnabledCombos(triggerCard, player);
  }

  // Add card to recent cards list for combo tracking
  addToRecentCards(card, player) {
    const maxRecentCards = 10; // Track last 10 cards played
    
    player.comboState.recentCards.unshift({
      card: card,
      timestamp: Date.now(),
      turn: window.GameStateManager.currentTurn || 0
    });

    // Keep only recent cards
    if (player.comboState.recentCards.length > maxRecentCards) {
      player.comboState.recentCards = player.comboState.recentCards.slice(0, maxRecentCards);
    }
  }

  // Validate if combo requirement is satisfied
  validateComboRequirement(card, player) {
    if (!card.combo_requirement) return null;

    console.log('CardManager: Validating combo requirement:', card.combo_requirement);

    // Parse combo requirement (examples: "2xB+1xI", "3xW", "B+I+E")
    const comboPattern = this.parseComboRequirement(card.combo_requirement);
    if (!comboPattern) return null;

    // Check recent cards for combo satisfaction
    const recentCards = player.comboState.recentCards.slice(0, 5); // Check last 5 cards
    return this.checkComboPattern(comboPattern, recentCards, card);
  }

  // Parse combo requirement string into structured pattern
  parseComboRequirement(requirement) {
    try {
      // Handle patterns like "2xB+1xI", "3xW", "B+I+E"
      const patterns = [];
      
      // Split by + to get individual requirements
      const parts = requirement.split('+');
      
      for (let part of parts) {
        part = part.trim();
        
        // Match patterns like "2xB" or "B"
        const match = part.match(/^(\d+)?x?([BWILE])$/);
        if (match) {
          const count = parseInt(match[1]) || 1;
          const type = match[2];
          patterns.push({ type, count });
        }
      }

      return patterns.length > 0 ? patterns : null;
    } catch (error) {
      console.warn('CardManager: Failed to parse combo requirement:', requirement, error);
      return null;
    }
  }

  // Check if combo pattern is satisfied by recent cards
  checkComboPattern(pattern, recentCards, triggerCard) {
    const cardCounts = {};
    const usedCards = [];

    // Count card types in recent cards (excluding trigger card to avoid double counting)
    for (let recentCard of recentCards) {
      if (recentCard.card.card_id === triggerCard.card_id) continue;
      
      const cardType = recentCard.card.card_type;
      cardCounts[cardType] = (cardCounts[cardType] || 0) + 1;
      usedCards.push(recentCard.card);
    }

    // Include trigger card in counts
    const triggerType = triggerCard.card_type;
    cardCounts[triggerType] = (cardCounts[triggerType] || 0) + 1;
    usedCards.push(triggerCard);

    // Check if pattern requirements are met
    for (let requirement of pattern) {
      const available = cardCounts[requirement.type] || 0;
      if (available < requirement.count) {
        console.log(`CardManager: Combo requirement not met - need ${requirement.count}x${requirement.type}, have ${available}`);
        return null;
      }
    }

    console.log('CardManager: Combo requirement satisfied!', pattern);
    return { cards: usedCards, pattern };
  }

  // Execute combo effects
  executeCombo(triggerCard, player, comboCards) {
    console.log('CardManager: Executing combo', triggerCard.card_id, comboCards.length);

    // Calculate combo bonus effects
    const comboBonus = this.calculateComboBonus(triggerCard, comboCards);
    
    // Apply combo effects
    this.applyComboEffects(comboBonus, player);

    // Record completed combo
    const comboRecord = {
      triggerCard: triggerCard.card_id,
      cardsUsed: comboCards.map(c => c.card_id || c.id),
      bonus: comboBonus,
      turn: window.GameStateManager.currentTurn || 0,
      timestamp: Date.now()
    };
    
    player.comboState.completedCombos.push(comboRecord);

    // Dispatch combo event
    window.GameStateManager.dispatchEvent('comboExecuted', {
      player: player,
      combo: comboRecord,
      changeType: 'comboExecuted'
    });

    console.log('CardManager: Combo executed successfully', comboRecord);
  }

  // Calculate bonus effects from combo
  calculateComboBonus(triggerCard, comboCards) {
    const bonus = {
      money: 0,
      time: 0,
      multiplier: 1,
      specialEffect: null
    };

    // Base combo bonus - 20% multiplier per extra card
    const extraCards = comboCards.length - 1;
    bonus.multiplier = 1 + (extraCards * 0.2);

    // Type-specific combo bonuses
    const cardTypes = comboCards.map(c => c.card_type);
    const uniqueTypes = [...new Set(cardTypes)];

    // Multi-type combo bonus
    if (uniqueTypes.length >= 3) {
      bonus.money += 50000; // Diversity bonus
      bonus.specialEffect = 'diversity_bonus';
    }

    // Same-type combo bonus
    if (uniqueTypes.length === 1) {
      bonus.multiplier *= 1.5; // Same type synergy
      bonus.specialEffect = 'synergy_bonus';
    }

    // Special combo patterns
    if (uniqueTypes.includes('B') && uniqueTypes.includes('I')) {
      bonus.money += 100000; // Finance combo
      bonus.specialEffect = 'finance_combo';
    }

    console.log('CardManager: Calculated combo bonus', bonus);
    return bonus;
  }

  // Apply combo effects to player
  applyComboEffects(bonus, player) {
    if (bonus.money > 0) {
      player.resources = player.resources || {};
      player.resources.money = (player.resources.money || 0) + bonus.money;
      console.log(`CardManager: Applied combo money bonus: ${bonus.money}`);
    }

    if (bonus.time > 0) {
      player.resources = player.resources || {};
      player.resources.time = (player.resources.time || 0) + bonus.time;
      console.log(`CardManager: Applied combo time bonus: ${bonus.time}`);
    }

    // Apply multiplier to recent resource gains (if applicable)
    if (bonus.multiplier > 1) {
      console.log(`CardManager: Applied combo multiplier: ${bonus.multiplier}x`);
    }
  }

  // Check if current card enables other combos
  checkEnabledCombos(triggerCard, player) {
    // Use advanced indexes for fast combo opportunity detection
    const gameState = window.GameStateManager.getState();
    const cardIndexes = gameState.cardIndexes;
    
    if (cardIndexes && window.fastCardLookup) {
      // Find combo opportunities using advanced indexes
      const comboOpportunities = window.fastCardLookup.findComboOpportunities(cardIndexes, triggerCard);
      
      if (comboOpportunities.length > 0) {
        console.log(`CardManager: Found ${comboOpportunities.length} combo opportunities for ${triggerCard.card_type} card`);
        
        // Store opportunities for UI hints
        if (!player.comboHints) player.comboHints = [];
        player.comboHints.push(...comboOpportunities);
        
        // Limit hints to prevent memory growth
        if (player.comboHints.length > 20) {
          player.comboHints = player.comboHints.slice(-20);
        }
      }
      
      // Check for chain opportunities
      const chainOpportunities = window.fastCardLookup.findChainOpportunities(cardIndexes, {
        currentPlayer: player,
        gameState: gameState
      });
      
      if (chainOpportunities.length > 0) {
        console.log(`CardManager: Found ${chainOpportunities.length} chain opportunities`);
      }
    } else {
      console.log('CardManager: Advanced indexes not available, using basic combo checking');
    }
  }

  // ======================
  // CHAIN SYSTEM METHODS
  // ======================

  // Process chain effects from cards
  processChainEffects(card, player) {
    if (!card.chain_effect) return;

    console.log('CardManager: Processing chain effect', card.chain_effect);

    // Initialize chain tracking if not present
    if (!player.chainState) {
      player.chainState = {
        activeChains: [],
        chainHistory: []
      };
    }

    // Parse and execute chain effect
    const chainCommands = this.parseChainEffect(card.chain_effect);
    this.executeChainEffect(chainCommands, card, player);
  }

  // Parse chain effect string into executable commands
  parseChainEffect(chainEffect) {
    try {
      // Handle chain patterns like "draw:W->if:money>100000->draw:B"
      const commands = chainEffect.split('->').map(cmd => cmd.trim());
      
      return commands.map(cmd => {
        if (cmd.startsWith('draw:')) {
          return { type: 'draw', cardType: cmd.split(':')[1] };
        } else if (cmd.startsWith('if:')) {
          return { type: 'condition', condition: cmd.split(':')[1] };
        } else if (cmd.startsWith('trigger:')) {
          return { type: 'trigger', effect: cmd.split(':')[1] };
        } else {
          return { type: 'unknown', command: cmd };
        }
      });
    } catch (error) {
      console.warn('CardManager: Failed to parse chain effect:', chainEffect, error);
      return [];
    }
  }

  // Execute chain effect commands
  executeChainEffect(commands, triggerCard, player) {
    let chainActive = true;

    for (let command of commands) {
      if (!chainActive) break;

      switch (command.type) {
        case 'draw':
          this.drawCards(1, command.cardType, player);
          console.log(`CardManager: Chain effect drew ${command.cardType} card`);
          break;

        case 'condition':
          chainActive = this.evaluateChainCondition(command.condition, player);
          console.log(`CardManager: Chain condition ${command.condition} evaluated to ${chainActive}`);
          break;

        case 'trigger':
          this.triggerChainEffect(command.effect, player);
          console.log(`CardManager: Chain triggered effect ${command.effect}`);
          break;

        default:
          console.warn('CardManager: Unknown chain command', command);
      }
    }

    // Record chain execution
    const chainRecord = {
      triggerCard: triggerCard.card_id,
      commands: commands,
      completed: chainActive,
      turn: window.GameStateManager.currentTurn || 0
    };

    player.chainState.chainHistory.push(chainRecord);
  }

  // Evaluate chain condition
  evaluateChainCondition(condition, player) {
    try {
      // Handle conditions like "money>100000", "time<5", "cards>=3"
      if (condition.includes('money')) {
        const match = condition.match(/money([><=]+)(\d+)/);
        if (match) {
          const operator = match[1];
          const value = parseInt(match[2]);
          const playerMoney = player.resources?.money || 0;
          
          switch (operator) {
            case '>': return playerMoney > value;
            case '>=': return playerMoney >= value;
            case '<': return playerMoney < value;
            case '<=': return playerMoney <= value;
            case '=': return playerMoney === value;
            default: return false;
          }
        }
      }

      // Add more condition types as needed
      return true;
    } catch (error) {
      console.warn('CardManager: Failed to evaluate chain condition:', condition, error);
      return false;
    }
  }

  // Trigger specific chain effects
  triggerChainEffect(effect, player) {
    // Handle specific chain effects
    switch (effect) {
      case 'bonus_turn':
        // Give player extra turn
        console.log('CardManager: Chain effect granted bonus turn');
        break;
      case 'double_next':
        // Double next card effect
        player.nextCardDoubled = true;
        console.log('CardManager: Chain effect will double next card');
        break;
      default:
        console.log('CardManager: Unknown chain effect:', effect);
    }
  }

  // ======================
  // MULTI-CARD INTERACTION SYSTEM
  // ======================

  // Process multi-card interactions when multiple cards are played
  processMultiCardInteractions(cards, player) {
    console.log('CardManager: Processing multi-card interactions for', cards.length, 'cards');

    if (!cards || cards.length < 2) return;

    // Initialize interaction tracking
    if (!player.cardInteractions) {
      player.cardInteractions = {
        activeInteractions: [],
        interactionHistory: [],
        synergies: {}
      };
    }

    // Check for card synergies
    const synergies = this.detectCardSynergies(cards, player);
    
    // Check for card conflicts
    const conflicts = this.detectCardConflicts(cards, player);
    
    // Process card amplifications
    const amplifications = this.processCardAmplifications(cards, player);

    // Execute interaction effects
    this.executeMultiCardEffects({
      synergies,
      conflicts,
      amplifications,
      cards,
      player
    });
  }

  // Detect synergies between multiple cards
  detectCardSynergies(cards, player) {
    const synergies = [];
    
    // Check all card pairs for synergies
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const synergy = this.checkCardSynergy(cards[i], cards[j], player);
        if (synergy) {
          synergies.push(synergy);
        }
      }
    }

    // Check for set synergies (3+ cards)
    const setSynergies = this.checkSetSynergies(cards, player);
    synergies.push(...setSynergies);

    return synergies;
  }

  // Check synergy between two specific cards
  checkCardSynergy(card1, card2, player) {
    const type1 = card1.card_type;
    const type2 = card2.card_type;

    // Bank + Investor synergy: Enhanced loan terms
    if ((type1 === 'B' && type2 === 'I') || (type1 === 'I' && type2 === 'B')) {
      return {
        type: 'finance_synergy',
        cards: [card1, card2],
        effect: {
          money: 75000, // Bonus money from improved terms
          description: 'Bank-Investor synergy: Enhanced financial terms'
        }
      };
    }

    // Work + Life synergy: Work-life balance bonus
    if ((type1 === 'W' && type2 === 'L') || (type1 === 'L' && type2 === 'W')) {
      return {
        type: 'work_life_synergy',
        cards: [card1, card2],
        effect: {
          time: 2,
          money: 25000,
          description: 'Work-Life synergy: Balanced approach bonus'
        }
      };
    }

    // Expeditor + Any synergy: Expeditor amplifies other cards
    if (type1 === 'E' || type2 === 'E') {
      const otherCard = type1 === 'E' ? card2 : card1;
      const expeditorCard = type1 === 'E' ? card1 : card2;
      
      return {
        type: 'expeditor_synergy',
        cards: [card1, card2],
        effect: {
          amplifyCard: otherCard,
          multiplier: 1.5,
          description: `Expeditor amplifies ${otherCard.card_name}`
        }
      };
    }

    // Phase-based synergies
    if (card1.phase_restriction && card2.phase_restriction && 
        card1.phase_restriction === card2.phase_restriction) {
      return {
        type: 'phase_synergy',
        cards: [card1, card2],
        effect: {
          money: 30000,
          description: `${card1.phase_restriction} phase coordination bonus`
        }
      };
    }

    return null;
  }

  // Check for set synergies (3+ cards working together)
  checkSetSynergies(cards, player) {
    const synergies = [];
    const cardTypes = cards.map(c => c.card_type);
    const uniqueTypes = [...new Set(cardTypes)];

    // Full spectrum synergy: All 5 card types
    if (uniqueTypes.length === 5 && uniqueTypes.includes('B') && uniqueTypes.includes('W') && 
        uniqueTypes.includes('I') && uniqueTypes.includes('L') && uniqueTypes.includes('E')) {
      synergies.push({
        type: 'full_spectrum_synergy',
        cards: cards,
        effect: {
          money: 200000,
          time: 5,
          specialEffect: 'project_mastery',
          description: 'Full spectrum mastery: All card types in harmony'
        }
      });
    }

    // Triple type synergy: 3 different types
    if (uniqueTypes.length === 3) {
      synergies.push({
        type: 'triple_synergy',
        cards: cards.filter(c => uniqueTypes.includes(c.card_type)),
        effect: {
          money: 75000,
          description: 'Triple coordination: Three-way synergy'
        }
      });
    }

    // Same type mass synergy: 3+ cards of same type
    const typeCounts = {};
    cardTypes.forEach(type => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count >= 3) {
        synergies.push({
          type: 'mass_synergy',
          cardType: type,
          cards: cards.filter(c => c.card_type === type),
          effect: {
            multiplier: 1 + (count * 0.3), // 30% per additional card
            description: `${type}-type mass synergy: ${count} cards working together`
          }
        });
      }
    });

    return synergies;
  }

  // Detect conflicts between cards
  detectCardConflicts(cards, player) {
    const conflicts = [];

    // Check for conflicting targets
    const targetConflicts = this.checkTargetConflicts(cards);
    conflicts.push(...targetConflicts);

    // Check for timing conflicts
    const timingConflicts = this.checkTimingConflicts(cards);
    conflicts.push(...timingConflicts);

    // Check for resource conflicts
    const resourceConflicts = this.checkResourceConflicts(cards, player);
    conflicts.push(...resourceConflicts);

    return conflicts;
  }

  // Check for targeting conflicts
  checkTargetConflicts(cards) {
    const conflicts = [];
    const targets = cards.map(c => c.target).filter(t => t);

    // Look for conflicting target requirements
    if (targets.includes('Choose Opponent') && targets.includes('All Players')) {
      conflicts.push({
        type: 'target_conflict',
        description: 'Cannot target specific opponent and all players simultaneously',
        severity: 'warning'
      });
    }

    return conflicts;
  }

  // Check for timing conflicts
  checkTimingConflicts(cards) {
    const conflicts = [];
    const timings = cards.map(c => c.activation_timing).filter(t => t);

    // Check for immediate vs delayed conflicts
    if (timings.includes('Immediate') && timings.includes('End of Turn')) {
      conflicts.push({
        type: 'timing_conflict',
        description: 'Mixed immediate and delayed effects may create timing issues',
        severity: 'info'
      });
    }

    return conflicts;
  }

  // Check for resource conflicts
  checkResourceConflicts(cards, player) {
    const conflicts = [];
    let totalMoneyCost = 0;
    let totalTimeCost = 0;

    cards.forEach(card => {
      totalMoneyCost += parseInt(card.money_cost) || 0;
      if (card.time_effect && parseInt(card.time_effect) < 0) {
        totalTimeCost += Math.abs(parseInt(card.time_effect));
      }
    });

    // Check if player has enough resources
    const playerMoney = player.resources?.money || 0;
    const playerTime = player.resources?.time || 0;

    if (totalMoneyCost > playerMoney) {
      conflicts.push({
        type: 'resource_conflict',
        resource: 'money',
        required: totalMoneyCost,
        available: playerMoney,
        severity: 'error'
      });
    }

    if (totalTimeCost > playerTime) {
      conflicts.push({
        type: 'resource_conflict',
        resource: 'time',
        required: totalTimeCost,
        available: playerTime,
        severity: 'error'
      });
    }

    return conflicts;
  }

  // Process card amplifications
  processCardAmplifications(cards, player) {
    const amplifications = [];

    cards.forEach(card => {
      // Cards with percentage effects amplify other cards
      if (card.percentage_effect && parseInt(card.percentage_effect) > 0) {
        const percentageBonus = parseInt(card.percentage_effect);
        
        amplifications.push({
          type: 'percentage_amplification',
          sourceCard: card,
          multiplier: 1 + (percentageBonus / 100),
          description: `${card.card_name} amplifies other effects by ${percentageBonus}%`
        });
      }

      // Cards with tick modifiers affect time-based cards
      if (card.tick_modifier && parseInt(card.tick_modifier) !== 0) {
        const tickBonus = parseInt(card.tick_modifier);
        
        amplifications.push({
          type: 'tick_amplification',
          sourceCard: card,
          tickModifier: tickBonus,
          description: `${card.card_name} modifies time effects by ${tickBonus}`
        });
      }
    });

    return amplifications;
  }

  // Execute all multi-card effects
  executeMultiCardEffects(interactionData) {
    const { synergies, conflicts, amplifications, cards, player } = interactionData;

    console.log('CardManager: Executing multi-card effects', {
      synergies: synergies.length,
      conflicts: conflicts.length,
      amplifications: amplifications.length
    });

    // Apply synergy effects
    synergies.forEach(synergy => {
      this.applySynergyEffect(synergy, player);
    });

    // Handle conflicts (may reduce effects or require choices)
    conflicts.forEach(conflict => {
      this.handleConflict(conflict, player);
    });

    // Apply amplifications to base card effects
    amplifications.forEach(amplification => {
      this.applyAmplification(amplification, cards, player);
    });

    // Record interaction
    this.recordMultiCardInteraction({
      cards: cards.map(c => c.card_id),
      synergies: synergies.length,
      conflicts: conflicts.length,
      amplifications: amplifications.length,
      turn: window.GameStateManager.currentTurn || 0,
      timestamp: Date.now()
    }, player);
  }

  // Apply synergy effect to player
  applySynergyEffect(synergy, player) {
    console.log('CardManager: Applying synergy effect', synergy.type);

    if (synergy.effect.money) {
      player.resources = player.resources || {};
      player.resources.money = (player.resources.money || 0) + synergy.effect.money;
    }

    if (synergy.effect.time) {
      player.resources = player.resources || {};
      player.resources.time = (player.resources.time || 0) + synergy.effect.time;
    }

    if (synergy.effect.multiplier && synergy.effect.amplifyCard) {
      // Apply multiplier to the amplified card's effects
      const card = synergy.effect.amplifyCard;
      if (card.money_effect) {
        const amplifiedMoney = parseInt(card.money_effect) * (synergy.effect.multiplier - 1);
        player.resources.money = (player.resources.money || 0) + amplifiedMoney;
      }
    }

    // Track synergy for statistics
    if (!player.synergyStats) player.synergyStats = {};
    player.synergyStats[synergy.type] = (player.synergyStats[synergy.type] || 0) + 1;
  }

  // Handle card conflicts
  handleConflict(conflict, player) {
    console.log('CardManager: Handling conflict', conflict.type, conflict.severity);

    switch (conflict.severity) {
      case 'error':
        // Block the interaction or require resolution
        console.warn('CardManager: Conflict prevents card interaction:', conflict.description);
        break;
      case 'warning':
        // Reduce effectiveness
        console.warn('CardManager: Conflict reduces effectiveness:', conflict.description);
        break;
      case 'info':
        // Just inform, no mechanical effect
        console.log('CardManager: Conflict noted:', conflict.description);
        break;
    }
  }

  // Apply amplification effects
  applyAmplification(amplification, cards, player) {
    console.log('CardManager: Applying amplification', amplification.type);

    // Apply amplification based on type
    switch (amplification.type) {
      case 'percentage_amplification':
        // This would be applied during normal effect processing
        console.log(`CardManager: Percentage amplification active: ${amplification.multiplier}x`);
        break;
      case 'tick_amplification':
        // Apply to time-based effects
        console.log(`CardManager: Tick amplification active: ${amplification.tickModifier}`);
        break;
    }
  }

  // Record multi-card interaction for history
  recordMultiCardInteraction(interaction, player) {
    if (!player.cardInteractions) {
      player.cardInteractions = { interactionHistory: [] };
    }

    player.cardInteractions.interactionHistory.push(interaction);

    // Limit history size
    if (player.cardInteractions.interactionHistory.length > 50) {
      player.cardInteractions.interactionHistory = 
        player.cardInteractions.interactionHistory.slice(-50);
    }

    console.log('CardManager: Recorded multi-card interaction', interaction);
  }
  
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