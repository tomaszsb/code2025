/**
 * DiceOutcomeParser.js
 * Phase 2 of CSV Format Improvements - Structured Dice Outcomes
 * 
 * This module handles parsing of both the new structured dice outcome format
 * and provides fallback to the legacy format for backward compatibility.
 */

console.log('DiceOutcomeParser.js loading...');

// VERSION TRACKING for cache-buster
if (window.LOADED_VERSIONS) {
  window.LOADED_VERSIONS['DiceOutcomeParser'] = '2025-05-27-001';
  console.log('DiceOutcomeParser: Version 2025-05-27-001 loaded');
}

class DiceOutcomeParser {
  constructor() {
    this.structuredData = null;
    this.legacyData = null;
    console.log('DiceOutcomeParser: Initialized');
  }

  /**
   * Load dice roll data (both structured and legacy formats)
   * @param {Array} structuredDiceData - New structured format data
   * @param {Array} legacyDiceData - Legacy format data for fallback
   */
  loadDiceData(structuredDiceData, legacyDiceData) {
    this.structuredData = structuredDiceData;
    this.legacyData = legacyDiceData;
    
    console.log(`DiceOutcomeParser: Loaded ${structuredDiceData ? structuredDiceData.length : 0} structured outcomes`);
    console.log(`DiceOutcomeParser: Loaded ${legacyDiceData ? legacyDiceData.length : 0} legacy outcomes`);
  }

  /**
   * Parse dice outcomes for a specific space, visit type, and dice value
   * @param {string} spaceName - Name of the space
   * @param {string} visitType - "First" or "Subsequent"
   * @param {number} diceValue - Rolled dice value (1-6)
   * @returns {Array} Array of parsed outcomes
   */
  parseOutcomes(spaceName, visitType, diceValue) {
    console.log(`DiceOutcomeParser: Parsing outcomes for ${spaceName}, ${visitType}, dice ${diceValue}`);

    // Try structured format first
    if (this.structuredData) {
      const structuredOutcomes = this._parseStructuredOutcomes(spaceName, visitType, diceValue);
      if (structuredOutcomes.length > 0) {
        console.log(`DiceOutcomeParser: Found ${structuredOutcomes.length} structured outcomes`);
        return structuredOutcomes;
      }
    }

    // Fall back to legacy format
    if (this.legacyData) {
      console.log('DiceOutcomeParser: Falling back to legacy format');
      return this._parseLegacyOutcomes(spaceName, visitType, diceValue);
    }

    console.warn(`DiceOutcomeParser: No outcomes found for ${spaceName}, ${visitType}, dice ${diceValue}`);
    return [];
  }

  /**
   * Parse outcomes from the new structured format
   * @param {string} spaceName - Name of the space
   * @param {string} visitType - "First" or "Subsequent"
   * @param {number} diceValue - Rolled dice value (1-6)
   * @returns {Array} Array of parsed outcomes
   * @private
   */
  _parseStructuredOutcomes(spaceName, visitType, diceValue) {
    const outcomes = [];

    // Find all matching rows for this space/visit/dice combination
    const matchingRows = this.structuredData.filter(row =>
      row.space_name === spaceName &&
      row.visit_type === visitType &&
      parseInt(row.dice_value) === diceValue
    );

    for (const row of matchingRows) {
      const outcome = this._parseStructuredOutcome(row);
      if (outcome) {
        outcomes.push(outcome);
      }
    }

    return outcomes;
  }

  /**
   * Parse a single structured outcome row
   * @param {Object} row - CSV row with structured data
   * @returns {Object|null} Parsed outcome object
   * @private
   */
  _parseStructuredOutcome(row) {
    const { OutcomeType, OutcomeValue, Description } = row;

    switch (OutcomeType) {
      case 'DrawCards':
        return this._parseDrawCards(OutcomeValue, Description);
      
      case 'MoveToSpace':
        return {
          type: 'movement',
          action: 'moveToSpace',
          destination: OutcomeValue,
          description: Description
        };
      
      case 'MoveToChoice':
        return {
          type: 'movement',
          action: 'moveToChoice',
          destinations: OutcomeValue.split('|'),
          description: Description
        };
      
      case 'Time':
        return {
          type: 'time',
          action: 'addTime',
          value: parseInt(OutcomeValue),
          description: Description
        };
      
      case 'Fee':
        return {
          type: 'fee',
          action: 'addFee',
          value: OutcomeValue,
          description: Description
        };
      
      case 'Quality':
        return {
          type: 'quality',
          action: 'setQuality',
          value: OutcomeValue,
          description: Description
        };
      
      case 'Multiplier':
        return {
          type: 'multiplier',
          action: 'setMultiplier',
          value: parseInt(OutcomeValue),
          description: Description
        };
      
      case 'CardAction':
        return this._parseCardAction(OutcomeValue, Description);
      
      default:
        console.warn(`DiceOutcomeParser: Unknown outcome type: ${OutcomeType}`);
        return null;
    }
  }

  /**
   * Parse DrawCards outcome value (format: "W:2" or "B:1,I:3")
   * @param {string} value - Card draw specification
   * @param {string} description - Description text
   * @returns {Object} Parsed card draw outcome
   * @private
   */
  _parseDrawCards(value, description) {
    const cards = {};
    
    // Handle multiple card types separated by comma
    const cardSpecs = value.split(',');
    
    for (const spec of cardSpecs) {
      const [cardType, amount] = spec.split(':');
      if (cardType && amount) {
        cards[cardType.trim()] = parseInt(amount.trim());
      }
    }

    return {
      type: 'cards',
      action: 'drawCards',
      cards: cards,
      description: description
    };
  }

  /**
   * Parse CardAction outcome value (format: "W:Remove:1" or "B:Draw:2")
   * @param {string} value - Card action specification
   * @param {string} description - Description text
   * @returns {Object} Parsed card action outcome
   * @private
   */
  _parseCardAction(value, description) {
    const [cardType, action, amount] = value.split(':');
    
    if (!cardType || !action) {
      console.warn(`DiceOutcomeParser: Invalid CardAction format: ${value}`);
      return null;
    }

    const actionType = action.toLowerCase();
    let parsedAction;

    switch (actionType) {
      case 'draw':
        parsedAction = 'drawCards';
        break;
      case 'remove':
        parsedAction = 'removeCards';
        break;
      case 'replace':
        parsedAction = 'replaceCards';
        break;
      case 'nochange':
        parsedAction = 'noChange';
        break;
      default:
        console.warn(`DiceOutcomeParser: Unknown card action: ${action}`);
        return null;
    }

    const result = {
      type: 'cards',
      action: parsedAction,
      cardType: cardType,
      description: description
    };

    // Add amount if specified and action needs it
    if (amount && parsedAction !== 'noChange') {
      result.amount = parseInt(amount);
    }

    return result;
  }

  /**
   * Parse outcomes from the legacy format (fallback)
   * @param {string} spaceName - Name of the space
   * @param {string} visitType - "First" or "Subsequent"
   * @param {number} diceValue - Rolled dice value (1-6)
   * @returns {Array} Array of parsed outcomes
   * @private
   */
  _parseLegacyOutcomes(spaceName, visitType, diceValue) {
    // Find matching row in legacy data
    const legacyRow = this.legacyData.find(row =>
      row['space_name'] === spaceName &&
      row['visit_type'] === visitType
    );

    if (!legacyRow) {
      return [];
    }

    // Get the outcome for this dice value
    const outcomeText = legacyRow[diceValue.toString()];
    if (!outcomeText) {
      return [];
    }

    // Get the outcome type from the "die_roll" column to determine card type
    const outcomeType = legacyRow['die_roll'];

    // Parse the legacy outcome text with context
    return this._parseLegacyOutcomeText(outcomeText, outcomeType);
  }

  /**
   * Parse legacy outcome text into structured outcomes
   * @param {string} outcomeText - Raw outcome text from legacy CSV
   * @param {string} outcomeType - The outcome type from "die_roll" column
   * @returns {Array} Array of parsed outcomes
   * @private
   */
  _parseLegacyOutcomeText(outcomeText, outcomeType = '') {
    const outcomes = [];
    const text = outcomeText.trim();

    // Handle card drawing patterns
    if (text.match(/Draw \d+/)) {
      const match = text.match(/Draw (\d+)/);
      if (match) {
        // Determine card type from outcome type using centralized utility
        let cardType = window.CardTypeUtils.findTypeByName(outcomeType) || 'W'; // Default fallback
        
        console.log(`DiceOutcomeParser: Drawing ${match[1]} ${cardType} cards based on outcome type: ${outcomeType}`);
        
        outcomes.push({
          type: 'cards',
          action: 'drawCards',
          cards: { [cardType]: parseInt(match[1]) },
          description: text
        });
      }
    }

    // Handle movement patterns with "or"
    if (text.includes(' or ')) {
      const destinations = text.split(' or ').map(dest => {
        // Extract space name before any " - " description
        return dest.split(' - ')[0].trim();
      });
      
      outcomes.push({
        type: 'movement',
        action: 'moveToChoice',
        destinations: destinations,
        description: text
      });
    }
    // Handle single movement destinations
    else if (text.includes('-') && text.match(/[A-Z]+-[A-Z]+/)) {
      const spaceMatch = text.match(/([A-Z]+-[A-Z]+-[A-Z]+(?:-[A-Z]+)?)/);
      if (spaceMatch) {
        outcomes.push({
          type: 'movement',
          action: 'moveToSpace',
          destination: spaceMatch[1],
          description: text
        });
      }
    }

    // Handle percentage fees
    if (text.match(/\d+%/)) {
      const match = text.match(/(\d+)%/);
      if (match) {
        outcomes.push({
          type: 'fee',
          action: 'addFee',
          value: match[1] + '%',
          description: text
        });
      }
    }

    // Handle time in days
    if (text.match(/\d+ days?/)) {
      const match = text.match(/(\d+) days?/);
      if (match) {
        outcomes.push({
          type: 'time',
          action: 'addTime',
          value: parseInt(match[1]),
          description: text
        });
      }
    }

    // If no specific patterns matched, return as raw text for manual handling
    if (outcomes.length === 0) {
      outcomes.push({
        type: 'raw',
        action: 'manual',
        text: text,
        description: text
      });
    }

    return outcomes;
  }

  /**
   * Get all possible outcomes for a space and visit type (for UI display)
   * @param {string} spaceName - Name of the space
   * @param {string} visitType - "First" or "Subsequent"
   * @returns {Object} Map of dice values to outcomes
   */
  getAllOutcomesForSpace(spaceName, visitType) {
    const allOutcomes = {};

    for (let diceValue = 1; diceValue <= 6; diceValue++) {
      allOutcomes[diceValue] = this.parseOutcomes(spaceName, visitType, diceValue);
    }

    return allOutcomes;
  }

  /**
   * Check if structured data is available for a space
   * @param {string} spaceName - Name of the space
   * @returns {boolean} True if structured data exists
   */
  hasStructuredDataForSpace(spaceName) {
    if (!this.structuredData) return false;
    
    return this.structuredData.some(row => row.space_name === spaceName);
  }

  /**
   * Get statistics about loaded data
   * @returns {Object} Statistics object
   */
  getDataStats() {
    const stats = {
      structuredSpaces: 0,
      legacySpaces: 0,
      totalStructuredOutcomes: 0,
      totalLegacyOutcomes: 0
    };

    if (this.structuredData) {
      const uniqueSpaces = new Set(this.structuredData.map(row => row.space_name));
      stats.structuredSpaces = uniqueSpaces.size;
      stats.totalStructuredOutcomes = this.structuredData.length;
    }

    if (this.legacyData) {
      stats.legacySpaces = this.legacyData.length;
      stats.totalLegacyOutcomes = this.legacyData.length * 6; // 6 dice outcomes per space
    }

    return stats;
  }
}

// Export for use in other modules
window.DiceOutcomeParser = DiceOutcomeParser;

console.log('DiceOutcomeParser.js loaded successfully');
