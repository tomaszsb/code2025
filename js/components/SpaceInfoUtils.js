// SpaceInfoUtils.js file is beginning to be used
console.log('SpaceInfoUtils.js file is beginning to be used');

/**
 * SpaceInfoUtils - Utility functions for the SpaceInfo component
 * 
 * This module contains utility functions used by the SpaceInfo component
 * to process data and perform calculations without side effects.
 * 
 * Updated: May 6, 2025
 * - Relocated to correct directory structure
 * - Improved JSON handling
 * - Added better error handling
 * - Added proper logging
 */

// Create namespace for utility functions
window.SpaceInfoUtils = {};

/**
 * Get CSS class for space phase using configured phase colors
 * @param {string} type - The space type/phase 
 * @returns {string} CSS class for the space phase
 */
window.SpaceInfoUtils.getPhaseClass = function(type) {
  console.log('SpaceInfoUtils: Getting phase class for type:', type);
  
  if (!type) return 'space-phase-default';
  
  // Phase colors configuration
  const phaseColors = {
    'SETUP': 'space-phase-setup',
    'OWNER': 'space-phase-owner',
    'FUNDING': 'space-phase-funding',
    'DESIGN': 'space-phase-design',
    'REGULATORY': 'space-phase-regulatory',
    'CONSTRUCTION': 'space-phase-construction',
    'END': 'space-phase-end'
  };
  
  const normalizedType = type.toUpperCase();
  const result = phaseColors[normalizedType] || 'space-phase-default';
  
  console.log(`SpaceInfoUtils: Phase class for ${type} -> ${result}`);
  return result;
};

/**
 * Extracts card type from outcome type
 * @param {string} type - The outcome type
 * @returns {string} The standardized card type code
 */
window.SpaceInfoUtils.extractCardType = function(type) {
  console.log('SpaceInfoUtils: Extracting card type from:', type);
  
  if (!type || typeof type !== 'string') {
    console.warn('SpaceInfoUtils: Invalid type provided to extractCardType:', type);
    return '';
  }
  
  // Standardize card type names
  if (type.toLowerCase().includes('w') || type.toLowerCase().includes('work')) {
    return 'W';
  } else if (type.toLowerCase().includes('b') || type.toLowerCase().includes('bank')) {
    return 'B';
  } else if (type.toLowerCase().includes('i') || type.toLowerCase().includes('investor')) {
    return 'I';
  } else if (type.toLowerCase().includes('l') || type.toLowerCase().includes('life')) {
    return 'L';
  } else if (type.toLowerCase().includes('e') || type.toLowerCase().includes('expeditor')) {
    return 'E';
  }
  
  // Default to returning original type if no match
  return type;
};

/**
 * Determines if an outcome value indicates drawing cards
 * @param {string} type - The outcome type
 * @param {string} value - The outcome value 
 * @returns {boolean} True if the outcome involves drawing cards
 */
window.SpaceInfoUtils.shouldShowDrawCardButton = function(type, value) {
  console.log('SpaceInfoUtils: Checking if should show draw button for type:', type, 'value:', value);
  
  // Skip if no value or "n/a"
  if (!value || typeof value !== 'string' || value.toLowerCase() === 'n/a') {
    return false;
  }
  
  // If the value is "No change" but it's a card type, we still show the button if the type indicates it's a card
  const isCardType = type.match(/w|b|i|l|e|card|work|bank|investor|life|expeditor/i);
  
  // Return true if value includes Draw, is a number, or is related to cards
  const valueLC = value.toLowerCase();
  const result = isCardType && (valueLC.includes('draw') || /^\d+$/.test(valueLC.trim()) || valueLC.includes('take'));
  
  console.log(`SpaceInfoUtils: Should show draw button for ${type}: ${result}`);
  return result;
};

/**
 * Safely parses JSON data, handling potential errors
 * @param {string} jsonString - The JSON string to parse
 * @param {*} defaultValue - Default value to return if parsing fails
 * @returns {*} The parsed object or default value
 */
window.SpaceInfoUtils.safeJsonParse = function(jsonString, defaultValue = null) {
  if (!jsonString || typeof jsonString !== 'string') {
    console.warn('SpaceInfoUtils: Invalid input to safeJsonParse:', jsonString);
    return defaultValue;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('SpaceInfoUtils: Error parsing JSON:', error.message);
    return defaultValue;
  }
};

/**
 * Safely stringifies objects to JSON, handling circular references
 * @param {*} data - The data to stringify
 * @returns {string} JSON string or empty string if error
 */
window.SpaceInfoUtils.safeJsonStringify = function(data) {
  if (data === undefined || data === null) {
    return '';
  }
  
  try {
    // Handle potential circular references
    const seen = new WeakSet();
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch (error) {
    console.error('SpaceInfoUtils: Error stringifying object:', error.message);
    return '';
  }
};

/**
 * Evaluates conditional card draw text
 * @param {string} cardText - The card text to evaluate
 * @param {Object} props - Component props including space, diceRoll, hasRolledDice 
 * @returns {boolean} Whether the card should be shown based on conditions
 */
window.SpaceInfoUtils.shouldShowCardForCondition = function(cardText, props) {
  console.log('SpaceInfoUtils: Evaluating card condition:', cardText);
  
  if (!cardText || typeof cardText !== 'string') {
    console.warn('SpaceInfoUtils: Invalid cardText provided:', cardText);
    return true; // Default to showing the card
  }
  
  if (!props || typeof props !== 'object') {
    console.warn('SpaceInfoUtils: Invalid props provided:', props);
    return true; // Default to showing the card
  }
  
  // Special case for owner-fund-initiation space
  if (props.space && props.space.space_name === "OWNER-FUND-INITIATION") {
    console.log('SpaceInfoUtils: Special handling for OWNER-FUND-INITIATION space');
    
    // Check which condition we're evaluating
    const isCheckingBankCard = cardText.includes('scope') && cardText.includes('≤ $ 4 M');
    const isCheckingInvestorCard = cardText.includes('scope') && cardText.includes('> $ 4 M');
    
    if (!isCheckingBankCard && !isCheckingInvestorCard) {
      return true; // Not one of our special conditions
    }
    
    // Get current player and calculate scope
    const currentPlayer = window.GameStateManager ? window.GameStateManager.getCurrentPlayer() : null;
    if (!currentPlayer || !currentPlayer.cards) {
      console.log('SpaceInfoUtils: Cannot determine player scope, defaulting to showing card');
      return true; // Default to showing the card if we can't determine scope
    }
    
    // Calculate scope (similar to PlayerInfo.extractScope)
    let totalScope = 0;
    const wCards = currentPlayer.cards.filter(card => card.type === 'W');
    wCards.forEach(card => {
      const cost = parseFloat(card['Estimated Job Costs']);
      if (!isNaN(cost)) {
        totalScope += cost;
      }
    });
    
    console.log(`SpaceInfoUtils: Player scope calculated as ${totalScope.toLocaleString()}`);
    
    // $4M threshold in numeric format
    const threshold = 4000000;
    
    // Compare with threshold
    const isUnder4M = totalScope <= threshold;
    
    // Return based on specific condition
    if (isCheckingBankCard) {
      console.log(`SpaceInfoUtils: Bank Card condition (scope ≤ $4M): ${isUnder4M}`);
      return isUnder4M; // Show Bank Card if scope ≤ $4M
    }
    
    if (isCheckingInvestorCard) {
      console.log(`SpaceInfoUtils: Investor Card condition (scope > $4M): ${!isUnder4M}`);
      return !isUnder4M; // Show Investor Card if scope > $4M
    }
  }
  
  // Check for dice roll conditions "if you roll a X"
  const conditionalRollPattern = /if\s+you\s+roll\s+(?:a|an)?\s*(\d+)/i;
  const match = cardText.match(conditionalRollPattern);
  
  if (match && match[1]) {
    const requiredRoll = parseInt(match[1], 10);
    console.log(`SpaceInfoUtils: Found dice roll condition, requires rolling a ${requiredRoll}`);
    
    // Check if player has rolled and if it matches the required roll
    const { diceRoll, hasRolledDice } = props;
    
    // If player hasn't rolled yet, show the card but it will be handled in renderDrawCardsButton
    if (!hasRolledDice) {
      console.log('SpaceInfoUtils: Player has not rolled dice yet, showing card');
      return true;
    }
    
    // Check if the roll matches the requirement
    const rollMatches = diceRoll === requiredRoll;
    console.log(`SpaceInfoUtils: Dice roll condition: rolled ${diceRoll}, required ${requiredRoll}, matches: ${rollMatches}`);
    
    return rollMatches;
  }
  
  // Default behavior for other spaces and conditions
  return true;
};

/**
 * Calculates player scope from work cards
 * @param {Object} player - The player object
 * @returns {number} The calculated scope value
 */
window.SpaceInfoUtils.calculatePlayerScope = function(player) {
  console.log('SpaceInfoUtils: Calculating player scope');
  
  if (!player || !player.cards) {
    console.warn('SpaceInfoUtils: Invalid player data for scope calculation');
    return 0;
  }
  
  let totalScope = 0;
  try {
    const wCards = player.cards.filter(card => card.type === 'W');
    wCards.forEach(card => {
      const cost = parseFloat(card['Estimated Job Costs']);
      if (!isNaN(cost)) {
        totalScope += cost;
      }
    });
    
    console.log(`SpaceInfoUtils: Player scope calculated as ${totalScope.toLocaleString()}`);
    return totalScope;
  } catch (error) {
    console.error('SpaceInfoUtils: Error calculating player scope:', error.message);
    return 0;
  }
};

// Export for module pattern compatibility (while maintaining window object for browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.SpaceInfoUtils;
}

console.log('SpaceInfoUtils.js code execution finished');
