// CardTypeUtils.js - MODERNIZED to use CardTypeConstants
console.log('CardTypeUtils.js file is beginning to be used');

/**
 * CardTypeUtilsManager - SIMPLIFIED manager using centralized card type metadata
 * 
 * This component now delegates to CardTypeConstants.js for all card type information,
 * eliminating duplication and ensuring consistency across the application.
 */
class CardTypeUtilsManager {
  /**
   * Initialize the Card Type Utils Manager
   */
  constructor() {
    console.log('CardTypeUtilsManager: Constructor initialized');
    
    // Verify CardTypeConstants is available
    if (!window.CardTypeUtils) {
      console.error('CardTypeUtilsManager: CardTypeConstants not loaded! Please ensure CardTypeConstants.js loads before this file.');
    }
    
    console.log('CardTypeUtilsManager: Constructor completed');
  }

  /**
   * Get card type color - MODERNIZED
   * @param {string} cardType - The card type code (W, B, I, L, E)
   * @returns {string} The hex color code for the card type
   */
  getCardTypeColor(cardType) {
    return window.CardTypeUtils.getTypeColor(cardType);
  }

  /**
   * Get the full card type name - MODERNIZED  
   * @param {string} cardType - The card type code
   * @returns {string} The full name of the card type
   */
  getCardTypeName(cardType) {
    return window.CardTypeUtils.getTypeName(cardType);
  }

  /**
   * Get CSS class for card type - MODERNIZED
   * @param {string} cardType - The card type code
   * @returns {string} CSS class name for styling
   */
  getCardTypeCssClass(cardType) {
    return window.CardTypeUtils.getTypeCssClass(cardType);
  }

  /**
   * Validate card type - MODERNIZED
   * @param {string} cardType - The card type code to validate
   * @returns {boolean} True if the card type is valid
   */
  isValidCardType(cardType) {
    return window.CardTypeUtils.isValidType(cardType);
  }

  /**
   * Get all valid card types - MODERNIZED
   * @returns {Array} Array of valid card type codes
   */
  getAllCardTypes() {
    return window.CardTypeUtils.getAllTypes();
  }

  /**
   * Get display information for a card type - NEW FEATURE
   * @param {string} cardType - The card type code
   * @returns {Object} Display info with name, color, CSS class, and inline styles
   */
  getCardDisplayInfo(cardType) {
    return window.CardTypeUtils.getDisplayInfo(cardType);
  }

  /**
   * LEGACY COMPATIBILITY: Get card display properties
   * @param {Object} card - Card object with type property
   * @returns {Object} Legacy format display properties
   */
  getCardDisplayProperties(card) {
    if (!card || !card.type) {
      return {
        color: '#777777',
        name: 'Unknown Card',
        cssClass: 'card-type-unknown'
      };
    }

    const displayInfo = this.getCardDisplayInfo(card.type);
    return {
      color: displayInfo.color,
      name: displayInfo.name,
      cssClass: displayInfo.cssClass
    };
  }

  /**
   * Format currency value for card display
   * @param {number} value - Monetary value to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return '$0';
    }
    return '$' + Number(value).toLocaleString();
  }

  /**
   * Get available card types for a specific category - NEW FEATURE
   * @param {string} category - Category to filter by (work, financing, events, efficiency)
   * @returns {Array} Array of card type codes in that category
   */
  getCardTypesByCategory(category) {
    return window.CardTypeUtils.getTypesByCategory(category);
  }

  /**
   * Find card type by name or alias - NEW FEATURE
   * @param {string} searchTerm - Name or alias to search for
   * @returns {string|null} Card type code or null if not found
   */
  findCardTypeByName(searchTerm) {
    return window.CardTypeUtils.findTypeByName(searchTerm);
  }
}

// Create global instance for backward compatibility
window.CardTypeUtilsManager = CardTypeUtilsManager;
window.cardTypeUtils = new CardTypeUtilsManager();

console.log('CardTypeUtils.js code execution finished');