// CSV Parser utility function
console.log('csv-parser.js file is being processed');

window.parseCSV = function(csvText, type = 'generic') {
  console.log('CSV parsing started');
  
  // Remove UTF-8 BOM if present
  if (csvText.charCodeAt(0) === 0xFEFF) {
    csvText = csvText.slice(1);
  }
  
  try {
    // Split by lines (handle both \r\n and \n)
    const lines = csvText.split(/\r?\n/);
    
    if (lines.length === 0) {
      return [];
    }
    
    // Extract headers
    const headerLine = lines[0];
    if (!headerLine || headerLine.trim() === '') {
      return [];
    }
    
    const headers = headerLine.split(',').map(h => h.trim());
    
    // Parse rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim() === '') {
        continue; // Skip empty lines
      }
      
      // Simple split by comma
      const values = line.split(',');
      
      // Skip empty lines but don't require a minimum number of columns
      if (values.length === 0 || (values.length === 1 && values[0].trim() === '')) {
        continue;
      }
      
      const row = {};
      
      headers.forEach((header, index) => {
        // Safely get the value, defaulting to empty string if beyond bounds
        const value = index < values.length ? values[index].trim() : '';
        row[header] = value;
      });
      
      // For spaces CSV, only add rows with a valid Space Name
      // For other CSVs, add all non-empty rows
      if (type === 'spaces') {
        if (row['space_name'] && row['space_name'].trim() !== '') {
          data.push(row);
        }
      } else {
        // For card CSVs, check for at least one non-empty value
        const hasValue = Object.values(row).some(val => val && val.trim() !== '');
        if (hasValue) {
          data.push(row);
        }
      }
    }
    
    console.log(`CSV parsing completed: ${data.length} rows`);
    return data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

// Enhanced CSV parser for unified card data
window.parseCardsCSV = function(csvText) {
  console.log('parseCardsCSV: Starting unified card parsing');
  
  try {
    // Use existing parseCSV but with card-specific validation
    const rawData = window.parseCSV(csvText, 'cards');
    
    if (!rawData || rawData.length === 0) {
      console.warn('parseCardsCSV: No card data found');
      return [];
    }
    
    // Process and validate each card
    const processedCards = rawData.map(row => {
      // Convert string values to appropriate types
      const card = {
        ...row,
        // Convert numeric fields
        duration_count: parseInt(row.duration_count) || 0,
        money_cost: parseInt(row.money_cost) || 0,
        money_effect: parseInt(row.money_effect) || 0,
        percentage_effect: parseInt(row.percentage_effect) || 0,
        time_effect: parseInt(row.time_effect) || 0,
        tick_modifier: parseInt(row.tick_modifier) || 0,
        draw_cards: parseInt(row.draw_cards) || 0,
        discard_cards: parseInt(row.discard_cards) || 0,
        stacking_limit: parseInt(row.stacking_limit) || 1,
        usage_limit: parseInt(row.usage_limit) || 1,
        cooldown: parseInt(row.cooldown) || 0,
        queue_effect: parseInt(row.queue_effect) || 0,
        loan_amount: parseInt(row.loan_amount) || 0,
        loan_rate: parseInt(row.loan_rate) || 0,
        investment_amount: parseInt(row.investment_amount) || 0,
        work_cost: parseInt(row.work_cost) || 0
      };
      
      return card;
    });
    
    console.log(`parseCardsCSV: Processed ${processedCards.length} cards`);
    return processedCards;
    
  } catch (error) {
    console.error('parseCardsCSV: Error parsing card data:', error);
    return [];
  }
};

// Filter cards by type (B, E, I, L, W)
window.filterCardsByType = function(cards, cardType) {
  if (!cards || !Array.isArray(cards)) {
    console.warn('filterCardsByType: Invalid cards array');
    return [];
  }
  
  if (!cardType) {
    console.warn('filterCardsByType: No card type specified');
    return cards;
  }
  
  const filtered = cards.filter(card => card.card_type === cardType);
  console.log(`filterCardsByType: Found ${filtered.length} cards of type ${cardType}`);
  return filtered;
};

// Get specific card by ID
window.getCardById = function(cards, cardId) {
  if (!cards || !Array.isArray(cards)) {
    console.warn('getCardById: Invalid cards array');
    return null;
  }
  
  if (!cardId) {
    console.warn('getCardById: No card ID specified');
    return null;
  }
  
  const card = cards.find(card => card.card_id === cardId);
  if (!card) {
    console.warn(`getCardById: Card with ID ${cardId} not found`);
  }
  
  return card || null;
};

// Advanced card filtering with multiple criteria
window.queryCards = function(cards, filters = {}) {
  if (!cards || !Array.isArray(cards)) {
    console.warn('queryCards: Invalid cards array');
    return [];
  }
  
  if (!filters || Object.keys(filters).length === 0) {
    return cards;
  }
  
  const filtered = cards.filter(card => {
    // Check each filter condition
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined) continue;
      
      // Handle special cases
      if (key === 'phase_restriction') {
        // Card can be played in any phase or specific phase
        if (card.phase_restriction === 'Any' || card.phase_restriction === value) {
          continue;
        } else {
          return false;
        }
      } else if (key === 'target') {
        if (card.target !== value) return false;
      } else if (key === 'scope') {
        if (card.scope !== value) return false;
      } else if (key === 'card_type') {
        if (card.card_type !== value) return false;
      } else if (key === 'rarity') {
        if (card.rarity !== value) return false;
      } else {
        // Generic field matching
        if (card[key] !== value) return false;
      }
    }
    
    return true;
  });
  
  console.log(`queryCards: Found ${filtered.length} cards matching filters:`, filters);
  return filtered;
};

// Validate card data structure
window.validateCardData = function(card) {
  const errors = [];
  
  // Required fields
  const requiredFields = ['card_id', 'card_type', 'card_name'];
  requiredFields.forEach(field => {
    if (!card[field] || card[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Valid card types
  const validTypes = ['B', 'E', 'I', 'L', 'W'];
  if (card.card_type && !validTypes.includes(card.card_type)) {
    errors.push(`Invalid card type: ${card.card_type}`);
  }
  
  // Valid targets
  const validTargets = ['Self', 'Choose Player', 'Choose Opponent', 'Next Player', 'All Players', ''];
  if (card.target && !validTargets.includes(card.target)) {
    errors.push(`Invalid target: ${card.target}`);
  }
  
  // Valid scopes
  const validScopes = ['Single', 'Multiple', 'Global', ''];
  if (card.scope && !validScopes.includes(card.scope)) {
    errors.push(`Invalid scope: ${card.scope}`);
  }
  
  // Valid durations
  const validDurations = ['Immediate', 'Turns', 'Permanent', ''];
  if (card.duration && !validDurations.includes(card.duration)) {
    errors.push(`Invalid duration: ${card.duration}`);
  }
  
  // Numeric field validation
  const numericFields = ['duration_count', 'money_cost', 'money_effect', 'tick_modifier'];
  numericFields.forEach(field => {
    if (card[field] && isNaN(parseInt(card[field]))) {
      errors.push(`Invalid numeric value for ${field}: ${card[field]}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
};

// ===========================================
// ADVANCED CARD INDEXING FOR PHASE 5 OPTIMIZATION
// ===========================================

// Build comprehensive card indexes for fast lookups
window.buildCardIndexes = function(cards) {
  console.log('buildCardIndexes: Building advanced card indexes for', cards.length, 'cards');
  
  const indexes = {
    byType: {},           // Index by card type (B, W, I, L, E)
    byCombo: {},          // Index by combo requirements
    byChain: {},          // Index by chain effects
    byTarget: {},         // Index by target type
    byDuration: {},       // Index by duration type
    byEffect: {},         // Index by effect types
    comboPairs: {},       // Index of cards that work well together
    chainTriggers: {},    // Index of cards that can trigger chains
    prerequisiteMap: {},  // Map of prerequisites to cards
    metadata: {
      totalCards: cards.length,
      lastUpdated: Date.now(),
      comboCards: 0,
      chainCards: 0
    }
  };

  // Build primary indexes
  cards.forEach(card => {
    const cardId = card.card_id;
    const cardType = card.card_type;

    // Type index
    if (!indexes.byType[cardType]) indexes.byType[cardType] = [];
    indexes.byType[cardType].push(card);

    // Combo requirement index
    if (card.combo_requirement) {
      const comboReq = card.combo_requirement;
      if (!indexes.byCombo[comboReq]) indexes.byCombo[comboReq] = [];
      indexes.byCombo[comboReq].push(card);
      indexes.metadata.comboCards++;
    }

    // Chain effect index
    if (card.chain_effect) {
      const chainEffect = card.chain_effect;
      if (!indexes.byChain[chainEffect]) indexes.byChain[chainEffect] = [];
      indexes.byChain[chainEffect].push(card);
      indexes.metadata.chainCards++;
    }

    // Target index
    const target = card.target || 'Self';
    if (!indexes.byTarget[target]) indexes.byTarget[target] = [];
    indexes.byTarget[target].push(card);

    // Duration index
    const duration = card.duration || 'Immediate';
    if (!indexes.byDuration[duration]) indexes.byDuration[duration] = [];
    indexes.byDuration[duration].push(card);


    // Effect type index
    const effectTypes = getEffectTypes(card);
    effectTypes.forEach(effectType => {
      if (!indexes.byEffect[effectType]) indexes.byEffect[effectType] = [];
      indexes.byEffect[effectType].push(card);
    });

    // Prerequisite mapping
    if (card.prerequisite) {
      indexes.prerequisiteMap[cardId] = card.prerequisite;
    }
  });

  // Build combo pair relationships
  indexes.comboPairs = buildComboPairIndex(cards);
  
  // Build chain trigger relationships
  indexes.chainTriggers = buildChainTriggerIndex(cards);

  console.log('buildCardIndexes: Completed indexing', {
    types: Object.keys(indexes.byType).length,
    combos: Object.keys(indexes.byCombo).length,
    chains: Object.keys(indexes.byChain).length,
    targets: Object.keys(indexes.byTarget).length,
    effects: Object.keys(indexes.byEffect).length
  });

  return indexes;
};


// Helper function to extract effect types from card
function getEffectTypes(card) {
  const effects = [];
  
  if (card.money_effect && parseInt(card.money_effect) !== 0) {
    effects.push(parseInt(card.money_effect) > 0 ? 'money_gain' : 'money_cost');
  }
  
  if (card.time_effect && parseInt(card.time_effect) !== 0) {
    effects.push(parseInt(card.time_effect) > 0 ? 'time_gain' : 'time_cost');
  }
  
  if (card.draw_cards && parseInt(card.draw_cards) > 0) {
    effects.push('card_draw');
  }
  
  if (card.discard_cards && parseInt(card.discard_cards) > 0) {
    effects.push('card_discard');
  }
  
  if (card.movement_effect) {
    effects.push('movement');
  }
  
  if (card.loan_amount && parseInt(card.loan_amount) > 0) {
    effects.push('loan');
  }
  
  if (card.investment_amount && parseInt(card.investment_amount) > 0) {
    effects.push('investment');
  }

  return effects.length > 0 ? effects : ['passive'];
}

// Build index of cards that work well together in combos
function buildComboPairIndex(cards) {
  const comboPairs = {};
  
  cards.forEach(card => {
    if (!card.combo_requirement) return;
    
    // Parse combo requirement to find which card types it needs
    const requiredTypes = parseComboRequiredTypes(card.combo_requirement);
    
    // Index this card under each required type
    requiredTypes.forEach(type => {
      if (!comboPairs[type]) comboPairs[type] = [];
      comboPairs[type].push({
        triggerCard: card,
        requirement: card.combo_requirement,
        requiredTypes: requiredTypes
      });
    });
  });
  
  return comboPairs;
}

// Build index of cards that can trigger chain reactions
function buildChainTriggerIndex(cards) {
  const chainTriggers = {};
  
  cards.forEach(card => {
    if (!card.chain_effect) return;
    
    // Parse chain effect to determine what triggers it
    const triggerConditions = parseChainTriggerConditions(card.chain_effect);
    
    triggerConditions.forEach(condition => {
      if (!chainTriggers[condition]) chainTriggers[condition] = [];
      chainTriggers[condition].push({
        card: card,
        chainEffect: card.chain_effect,
        condition: condition
      });
    });
  });
  
  return chainTriggers;
}

// Parse combo requirement to extract required card types
function parseComboRequiredTypes(requirement) {
  const types = [];
  const matches = requirement.match(/[BWILE]/g);
  if (matches) {
    types.push(...matches);
  }
  return [...new Set(types)]; // Remove duplicates
}

// Parse chain effect to extract trigger conditions
function parseChainTriggerConditions(chainEffect) {
  const conditions = [];
  
  // Look for if: conditions in chain effects
  const conditionMatches = chainEffect.match(/if:([^-]+)/g);
  if (conditionMatches) {
    conditionMatches.forEach(match => {
      const condition = match.replace('if:', '').trim();
      conditions.push(condition);
    });
  }
  
  // Add more trigger condition parsing as needed
  return conditions;
}

// Fast lookup functions using indexes
window.fastCardLookup = {
  // Get cards by type with optional filters
  getCardsByType: function(indexes, type, filters = {}) {
    const cards = indexes.byType[type] || [];
    if (Object.keys(filters).length === 0) return cards;
    
    return cards.filter(card => {
      return Object.entries(filters).every(([key, value]) => {
        return card[key] === value;
      });
    });
  },

  // Find combo opportunities for a given card
  findComboOpportunities: function(indexes, card) {
    const cardType = card.card_type;
    return indexes.comboPairs[cardType] || [];
  },

  // Find chain opportunities for a given card or game state
  findChainOpportunities: function(indexes, gameState) {
    const opportunities = [];
    
    // Check each chain trigger condition against current game state
    Object.entries(indexes.chainTriggers).forEach(([condition, triggers]) => {
      if (this.evaluateChainCondition(condition, gameState)) {
        opportunities.push(...triggers);
      }
    });
    
    return opportunities;
  },


  // Get cards by effect type
  getCardsByEffect: function(indexes, effectType) {
    return indexes.byEffect[effectType] || [];
  },

  // Get cards that can be played with target
  getCardsByTarget: function(indexes, targetType) {
    return indexes.byTarget[targetType] || [];
  },

  // Basic chain condition evaluation
  evaluateChainCondition: function(condition, gameState) {
    // Simple condition evaluation - extend as needed
    if (condition.includes('money>')) {
      const match = condition.match(/money>(\d+)/);
      if (match) {
        const threshold = parseInt(match[1]);
        const playerMoney = gameState.currentPlayer?.resources?.money || 0;
        return playerMoney > threshold;
      }
    }
    
    return false;
  }
};

// Performance monitoring for index operations
window.cardIndexPerformance = {
  times: {},
  
  startTiming: function(operation) {
    this.times[operation] = performance.now();
  },
  
  endTiming: function(operation) {
    if (this.times[operation]) {
      const duration = performance.now() - this.times[operation];
      console.log(`cardIndexPerformance: ${operation} took ${duration.toFixed(2)}ms`);
      delete this.times[operation];
      return duration;
    }
    return 0;
  }
};

console.log('csv-parser.js execution finished');