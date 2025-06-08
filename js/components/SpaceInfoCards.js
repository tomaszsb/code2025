// SpaceInfoCards.js file is beginning to be used
console.log('SpaceInfoCards.js file is beginning to be used');

/**
 * SpaceInfoCards - Card-related functionality for the SpaceInfo component
 * 
 * This module contains methods for rendering card buttons and handling card drawing
 * Used as a mixin for the SpaceInfo component
 */

// Create mixin object for SpaceInfo
window.SpaceInfoCards = {
  /**
   * Renders a button to draw cards
   * @param {string} cardType - The type of card to draw
   * @param {string} amount - The number or description of cards to draw
   * @returns {JSX.Element|null} The button element or null
   */
  renderDrawCardsButton: function(cardType, amount) {
    // Get current player from GameStateManager
    const currentPlayer = window.GameStateManager?.getCurrentPlayer?.();
    const playerId = currentPlayer?.id || '';
    const spaceId = this.props.space?.id || '';
    
    // Create a unique button ID that includes player and space ID
    const buttonId = `draw-${cardType}-${amount}-${spaceId}`;
    
    // Use SpaceInfoManager to check if button has been used
    const isButtonUsed = window.SpaceInfoManager ? 
      window.SpaceInfoManager.isButtonUsed(playerId, buttonId) : 
      false;
    
    // Log the button state for debugging
    console.log(`SpaceInfoCards: Button ${buttonId} used status:`, isButtonUsed);
    
    // MODERNIZED: Use centralized card type system for mapping
    const parseCardTypeFromText = (text) => {
      const typeCode = window.CardTypeUtils.findTypeByName(text);
      if (typeCode) {
        const typeData = window.CardTypeUtils.getTypeData(typeCode);
        return { type: typeCode, category: typeData.category };
      }
      return null;
    };
    
    const cardMapping = parseCardTypeFromText(cardType);
    console.log('SpaceInfoCards: parseCardTypeFromText result for', cardType, ':', cardMapping);
    if (!cardMapping) {
      console.log('SpaceInfoCards: No valid card type found for:', cardType);
      return null;
    }
    
    const cardCode = cardMapping.type;
    console.log('SpaceInfoCards: Final cardCode for', cardType, 'is:', cardCode);
    
    // Check for dice roll conditions
    const conditionalRollPattern = /if\s+you\s+roll\s+(?:a|an)?\s*(\d+)/i;
    const match = amount.match(conditionalRollPattern);
    
    let requiresDiceRoll = false;
    let requiredRoll = null;
    let diceRollMet = true; // Default to true if no dice roll required
    
    if (match && match[1]) {
      requiresDiceRoll = true;
      requiredRoll = parseInt(match[1], 10);
      const { diceRoll, hasRolledDice } = this.props;
      
      // Only check if dice roll is met if player has already rolled
      if (hasRolledDice) {
        diceRollMet = diceRoll === requiredRoll;
      } else {
        diceRollMet = false; // Not rolled yet, so condition isn't met
      }
      
      console.log(`SpaceInfoCards: Dice requirement for button - requires: ${requiredRoll}, hasRolled: ${hasRolledDice}, rolled: ${diceRoll}, met: ${diceRollMet}`);
    }
    
    // Check if this card should be shown based on conditions
    if (!window.SpaceInfoUtils.shouldShowCardForCondition(amount, this.props)) {
      console.log('SpaceInfoCards: Not showing card button due to condition not met:', amount);
      return null;
    }
    
    // Parse amount (expecting "Draw X" format or number format)
    let cardAmount = 1;
    if (amount && typeof amount === 'string') {
      // Check for "Draw X" format
      const drawMatches = amount.match(/Draw (\d+)/i);
      if (drawMatches && drawMatches[1]) {
        cardAmount = parseInt(drawMatches[1], 10);
      } else {
        // Check if it's a number like "3"
        const numMatches = amount.match(/^\s*(\d+)\s*$/);
        if (numMatches && numMatches[1]) {
          cardAmount = parseInt(numMatches[1], 10);
        } else if (amount.toLowerCase().includes('draw')) {
          // Generic "Draw" without a number
          cardAmount = 1;
        }
      }
    }
    
    console.log('SpaceInfoCards: Rendering draw button for', cardCode, 'cards, amount:', cardAmount);
    
    // Handle button click - use SpaceInfoManager
    const handleClick = () => {
      console.log('SpaceInfoCards: Draw card button clicked for', cardType, 'amount:', cardAmount);
      
      // Mark button as used via SpaceInfoManager
      if (window.SpaceInfoManager) {
        window.SpaceInfoManager.markButtonUsed(playerId, buttonId);
        
        // Draw cards using SpaceInfoManager
        const drawnCards = window.SpaceInfoManager.drawCards(playerId, cardCode, cardAmount);
        console.log(`SpaceInfoCards: Drew ${drawnCards.length} ${cardType}(s)`);
        
        // Force refresh to show button as used
        this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
        
        // Trigger update of available moves after action completion
        // Method 1: Try GameBoard reference
        const gameBoard = window.currentGameBoard || window.gameBoard;
        if (gameBoard && gameBoard.spaceSelectionManager) {
          console.log('SpaceInfoCards: Triggering available moves update after card draw via GameBoard');
          console.log('SpaceInfoCards: GameBoard found:', !!gameBoard);
          console.log('SpaceInfoCards: SpaceSelectionManager found:', !!gameBoard.spaceSelectionManager);
          console.log('SpaceInfoCards: updateAvailableMoves method found:', typeof gameBoard.spaceSelectionManager.updateAvailableMoves);
          setTimeout(() => {
            try {
              console.log('SpaceInfoCards: Calling updateAvailableMoves...');
              gameBoard.spaceSelectionManager.updateAvailableMoves();
              console.log('SpaceInfoCards: updateAvailableMoves call completed');
            } catch (error) {
              console.error('SpaceInfoCards: Error calling updateAvailableMoves:', error);
            }
          }, 100);
        }
        // Method 2: Try direct event dispatch
        else if (window.GameStateManager) {
          console.log('SpaceInfoCards: Triggering available moves update after card draw via event');
          setTimeout(() => {
            window.GameStateManager.dispatchEvent('gameStateChanged', {
              changeType: 'spaceActionCompleted',
              playerId: playerId,
              actionType: 'cardDraw',
              cardType: cardCode,
              amount: cardAmount
            });
          }, 100);
        }
        // Method 3: Emergency fallback - force refresh of entire UI
        else {
          console.log('SpaceInfoCards: Using emergency fallback - forcing UI refresh');
          setTimeout(() => {
            // Trigger a window event that might cause UI updates
            window.dispatchEvent(new CustomEvent('forceUIRefresh', {
              detail: { reason: 'cardDrawCompleted', playerId: playerId }
            }));
          }, 100);
        }
      } else if (this.props.onDrawCards) {
        // Fallback to using callback if provided
        console.log('SpaceInfoCards: Drawing cards using onDrawCards callback');
        this.props.onDrawCards(cardCode, cardAmount);
      }
    };
    
    // Format the card type for display
    let displayCardType = cardType;
    if (cardType === 'W' || cardType === 'B' || cardType === 'I' || cardType === 'L' || cardType === 'E') {
      displayCardType = {
        'W': 'Work Type',
        'B': 'Bank',
        'I': 'Investor',
        'L': 'Life',
        'E': 'Expeditor'
      }[cardType];
    } else {
      // Remove "Cards" suffix if present and replace with "Card"
      displayCardType = displayCardType.replace(/\s*Cards$/i, ' Card');
    }
    
    // Button should be disabled if already used OR dice roll is required but not met
    const isDisabled = isButtonUsed || (requiresDiceRoll && !diceRollMet);
    
    // Button class based on whether it's been used or disabled due to dice roll
    const buttonClass = `draw-cards-btn ${isButtonUsed ? 'used' : ''} ${requiresDiceRoll && !diceRollMet ? 'dice-condition-not-met' : ''}`;
    
    // Button title/tooltip explains why button is disabled
    let buttonTitle = isButtonUsed ? 'Cards already drawn' : `Draw ${cardAmount} ${displayCardType}(s)`;
    if (requiresDiceRoll && !diceRollMet) {
      if (!this.props.hasRolledDice) {
        buttonTitle = `Roll a ${requiredRoll} first to draw these cards`;
      } else {
        buttonTitle = `You rolled a ${this.props.diceRoll}, but need a ${requiredRoll} to draw these cards`;
      }
    }
    
    return (
      <button 
        className={buttonClass}
        onClick={handleClick}
        disabled={isDisabled}
        title={buttonTitle}
      >
        {isButtonUsed ? 'Cards Drawn' : `Draw ${cardAmount} ${displayCardType}(s)`}
      </button>
    );
  },

  getAvailableCards: function(cardType, phase = null, restrictions = {}) {
    const gameData = this.getGameData();
    if (!gameData || !gameData.allCards) {
      console.warn('SpaceInfoCards.getAvailableCards: No unified card data available');
      return [];
    }

    let filters = { card_type: cardType };
    if (phase) filters.phase_restriction = phase;
    
    // Apply additional restrictions
    Object.assign(filters, restrictions);

    return window.queryCards(gameData.allCards, filters);
  },

  canPlayCard: function(card, gameState) {
    if (!card || !gameState) {
      return false;
    }

    // Check phase restrictions
    if (card.phase_restriction && card.phase_restriction !== 'Any') {
      const currentPhase = gameState.currentPhase || 'Any';
      if (card.phase_restriction !== currentPhase) {
        return false;
      }
    }

    // Check space restrictions
    if (card.space_restriction) {
      const currentSpace = gameState.currentSpace;
      if (currentSpace && card.space_restriction !== currentSpace) {
        return false;
      }
    }

    // Check work type restrictions
    if (card.work_type_restriction) {
      const playerWorkType = gameState.currentPlayer?.workType;
      if (playerWorkType && card.work_type_restriction !== playerWorkType) {
        return false;
      }
    }

    // Check cost requirements
    if (card.money_cost) {
      const playerMoney = gameState.currentPlayer?.money || 0;
      if (playerMoney < card.money_cost) {
        return false;
      }
    }

    // Check conditional logic
    if (card.conditional_logic) {
      // This would need more complex evaluation based on game state
      // For now, assume true if no specific conditions are unmet
    }

    return true;
  },

  validateCardPlayability: function(card, gameState) {
    const issues = [];

    if (!this.canPlayCard(card, gameState)) {
      if (card.phase_restriction && card.phase_restriction !== 'Any') {
        const currentPhase = gameState.currentPhase || 'Any';
        if (card.phase_restriction !== currentPhase) {
          issues.push(`Can only be played during ${card.phase_restriction} phase`);
        }
      }

      if (card.money_cost) {
        const playerMoney = gameState.currentPlayer?.money || 0;
        if (playerMoney < card.money_cost) {
          issues.push(`Requires $${card.money_cost}, but player has $${playerMoney}`);
        }
      }

      if (card.space_restriction) {
        issues.push(`Can only be played on ${card.space_restriction} spaces`);
      }

      if (card.work_type_restriction) {
        issues.push(`Requires ${card.work_type_restriction} work type`);
      }
    }

    return {
      canPlay: issues.length === 0,
      issues: issues
    };
  },

  getGameData: function() {
    // Try to get game data from InitializationManager first
    if (window.InitializationManager && window.InitializationManager.loadedData) {
      return window.InitializationManager.loadedData;
    }
    
    // Fallback to GameState if available
    if (window.GameState && window.GameState.gameData) {
      return window.GameState.gameData;
    }
    
    return null;
  }
};

console.log('SpaceInfoCards.js code execution finished');
