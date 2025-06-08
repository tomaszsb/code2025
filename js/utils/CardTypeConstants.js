// CardTypeConstants.js - Single source of truth for all card type information
console.log('CardTypeConstants.js file is being processed');

/**
 * Comprehensive card type metadata - SINGLE SOURCE OF TRUTH
 * Contains all card type information previously scattered across 14+ files
 */
window.CARD_TYPE_METADATA = {
  W: {
    code: 'W',
    name: 'Work Type',
    displayName: 'Work Type',
    color: '#4285f4',        // Blue
    cssClass: 'card-type-work',
    category: 'work',
    aliases: ['Work', 'Work Card', 'Work Type Card'],
    description: 'Cards related to work activities and project tasks'
  },
  B: {
    code: 'B', 
    name: 'Bank',
    displayName: 'Bank',
    color: '#ea4335',        // Red
    cssClass: 'card-type-bank',
    category: 'financing',
    aliases: ['Bank', 'Bank Card', 'Banking'],
    description: 'Cards related to banking and loan activities'
  },
  I: {
    code: 'I',
    name: 'Investor', 
    displayName: 'Investor',
    color: '#fbbc05',        // Yellow
    cssClass: 'card-type-investor',
    category: 'financing',
    aliases: ['Investor', 'Investor Card', 'Investment'],
    description: 'Cards related to investor and investment activities'
  },
  L: {
    code: 'L',
    name: 'Life',
    displayName: 'Life',
    color: '#34a853',        // Green
    cssClass: 'card-type-life',
    category: 'events',
    aliases: ['Life', 'Life Card', 'Life Event'],
    description: 'Cards related to life events and personal situations'
  },
  E: {
    code: 'E',
    name: 'Expeditor',
    displayName: 'Expeditor', 
    color: '#8e44ad',        // Purple
    cssClass: 'card-type-expeditor',
    category: 'efficiency',
    aliases: ['Expeditor', 'Expeditor Card', 'Expediting'],
    description: 'Cards related to expediting and efficiency improvements'
  }
};

/**
 * Utility functions for card type operations
 */
window.CardTypeUtils = {
  
  /**
   * Get all valid card type codes
   * @returns {Array} Array of card type codes ['W', 'B', 'I', 'L', 'E']
   */
  getAllTypes: function() {
    return Object.keys(window.CARD_TYPE_METADATA);
  },

  /**
   * Get card type metadata by code
   * @param {string} typeCode - Card type code (W, B, I, L, E)
   * @returns {Object|null} Card type metadata or null if not found
   */
  getTypeData: function(typeCode) {
    if (!typeCode) return null;
    const normalizedType = typeCode.toString().toUpperCase().trim();
    return window.CARD_TYPE_METADATA[normalizedType] || null;
  },

  /**
   * Get color for card type
   * @param {string} typeCode - Card type code
   * @returns {string} Hex color code or default gray
   */
  getTypeColor: function(typeCode) {
    const typeData = this.getTypeData(typeCode);
    return typeData ? typeData.color : '#777777';
  },

  /**
   * Get display name for card type
   * @param {string} typeCode - Card type code
   * @returns {string} Display name or 'Unknown'
   */
  getTypeName: function(typeCode) {
    const typeData = this.getTypeData(typeCode);
    return typeData ? typeData.displayName : 'Unknown';
  },

  /**
   * ALIAS: Get display name for card type (backward compatibility)
   * @param {string} typeCode - Card type code
   * @returns {string} Display name or 'Unknown'
   */
  getCardTypeName: function(typeCode) {
    return this.getTypeName(typeCode);
  },

  /**
   * ALIAS: Get color for card type (backward compatibility)
   * @param {string} typeCode - Card type code
   * @returns {string} Hex color code or default gray
   */
  getCardColor: function(typeCode) {
    return this.getTypeColor(typeCode);
  },

  /**
   * Get CSS class for card type
   * @param {string} typeCode - Card type code
   * @returns {string} CSS class name
   */
  getTypeCssClass: function(typeCode) {
    const typeData = this.getTypeData(typeCode);
    return typeData ? typeData.cssClass : 'card-type-unknown';
  },

  /**
   * Get category for card type
   * @param {string} typeCode - Card type code
   * @returns {string} Category name
   */
  getTypeCategory: function(typeCode) {
    const typeData = this.getTypeData(typeCode);
    return typeData ? typeData.category : 'unknown';
  },

  /**
   * Check if a type code is valid
   * @param {string} typeCode - Card type code to validate
   * @returns {boolean} True if valid card type
   */
  isValidType: function(typeCode) {
    return this.getTypeData(typeCode) !== null;
  },

  /**
   * Find card type by alias or partial name match
   * @param {string} searchTerm - Name or alias to search for
   * @returns {string|null} Card type code or null if not found
   */
  findTypeByName: function(searchTerm) {
    if (!searchTerm) return null;
    
    const search = searchTerm.toLowerCase().trim();
    
    // Special handling for single letter card codes (W, B, I, L, E)
    if (search.length === 1 && /^[wbile]$/i.test(search)) {
      const cardCode = search.toUpperCase();
      console.log(`CardTypeUtils: Single letter code "${searchTerm}" -> "${cardCode}"`);
      if (this.isValidType(cardCode)) {
        return cardCode;
      }
    }
    
    // Special handling for CSV format patterns like "W Cards", "I Cards", etc.
    const csvPattern = /^([wbile])\s+cards?$/i;
    const csvMatch = search.match(csvPattern);
    if (csvMatch) {
      const cardCode = csvMatch[1].toUpperCase();
      console.log(`CardTypeUtils: CSV pattern matched "${searchTerm}" -> "${cardCode}"`);
      if (this.isValidType(cardCode)) {
        return cardCode;
      }
    }
    
    // Check exact name matches first
    for (const [code, data] of Object.entries(window.CARD_TYPE_METADATA)) {
      if (data.name.toLowerCase() === search || data.displayName.toLowerCase() === search) {
        return code;
      }
    }
    
    // Check aliases
    for (const [code, data] of Object.entries(window.CARD_TYPE_METADATA)) {
      if (data.aliases.some(alias => alias.toLowerCase() === search)) {
        return code;
      }
    }
    
    // Check partial matches
    for (const [code, data] of Object.entries(window.CARD_TYPE_METADATA)) {
      if (data.name.toLowerCase().includes(search) || 
          data.aliases.some(alias => alias.toLowerCase().includes(search))) {
        return code;
      }
    }
    
    return null;
  },

  /**
   * Check if a card is available in the current phase
   * @param {Object} card - Card object to check
   * @returns {boolean} True if card is available in current phase
   */
  isCardAvailableInCurrentPhase: function(card) {
    if (!card) return false;
    
    // TODO: Implement actual phase restriction logic when needed
    // For now, all cards in player's hand are considered available
    // This could be enhanced to check card.phase_restriction against current game phase
    
    const currentPhase = window.GameStateManager?.currentPhase;
    if (!currentPhase) return true; // If no phase info, allow all cards
    
    // Check if card has phase restrictions
    if (card.phase_restriction && card.phase_restriction !== 'Any') {
      return card.phase_restriction === currentPhase;
    }
    
    // No restrictions means card is always available
    return true;
  },

  /**
   * Get all card types by category
   * @param {string} category - Category to filter by (work, financing, events, efficiency)
   * @returns {Array} Array of card type codes in that category
   */
  getTypesByCategory: function(category) {
    if (!category) return [];
    
    return Object.entries(window.CARD_TYPE_METADATA)
      .filter(([code, data]) => data.category === category)
      .map(([code, data]) => code);
  },

  /**
   * Get formatted card type information for display
   * @param {string} typeCode - Card type code
   * @returns {Object} Formatted display object
   */
  getDisplayInfo: function(typeCode) {
    const typeData = this.getTypeData(typeCode);
    if (!typeData) {
      return {
        name: 'Unknown',
        color: '#777777',
        cssClass: 'card-type-unknown',
        style: { color: '#777777' }
      };
    }

    return {
      name: typeData.displayName,
      color: typeData.color,
      cssClass: typeData.cssClass,
      style: { color: typeData.color }
    };
  },

  /**
   * Generate card type filter object (for UI components)
   * @param {Array} enabledTypes - Array of type codes to enable, or null for all
   * @returns {Object} Filter object with type codes as keys, boolean as values
   */
  generateFilterObject: function(enabledTypes = null) {
    const filter = {};
    const allTypes = this.getAllTypes();
    
    allTypes.forEach(type => {
      filter[type] = enabledTypes ? enabledTypes.includes(type) : true;
    });
    
    return filter;
  },

  /**
   * Get primary field for a card (backward compatibility)
   * @param {Object} card - Card object
   * @returns {string} Primary field value
   */
  getCardPrimaryField: function(card) {
    if (!card || !card.type) return '';
    
    const typeMap = {
      W: card['Work Type'] || card.name || '',
      B: card['Bank'] || card.name || '',
      I: card['Investor'] || card.name || '',
      L: card['Life'] || card.name || '',
      E: card['Expeditor'] || card.name || ''
    };
    
    return typeMap[card.type] || card.name || '';
  },

  /**
   * Get secondary field for a card (backward compatibility)
   * @param {Object} card - Card object
   * @returns {string} Secondary field value
   */
  getCardSecondaryField: function(card) {
    if (!card || !card.type) return '';
    
    // Return description or empty string
    return card.description || '';
  },

  /**
   * Format currency for display (backward compatibility)
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency: function(amount) {
    if (!amount || isNaN(amount)) return '$0';
    return '$' + Number(amount).toLocaleString();
  },

  /**
   * Get detail fields for a card (backward compatibility)
   * @param {Object} card - Card object
   * @returns {Array} Array of field objects with label and value
   */
  getCardDetailFields: function(card) {
    if (!card || !card.type) return [];
    
    const fields = [];
    
    // Add primary field
    const primaryField = this.getCardPrimaryField(card);
    if (primaryField) {
      fields.push({
        label: this.getTypeName(card.type),
        value: primaryField
      });
    }
    
    // Add secondary field (description)
    const secondaryField = this.getCardSecondaryField(card);
    if (secondaryField) {
      fields.push({
        label: 'Description',
        value: secondaryField
      });
    }
    
    // Add type-specific fields
    if (card.type === 'W' && card.work_cost) {
      fields.push({
        label: 'Work Cost',
        value: this.formatCurrency(card.work_cost)
      });
    }
    
    if (card.type === 'B' && card.loan_amount) {
      fields.push({
        label: 'Loan Amount',
        value: this.formatCurrency(card.loan_amount)
      });
    }
    
    if (card.type === 'I' && card.investment_amount) {
      fields.push({
        label: 'Investment Amount',
        value: this.formatCurrency(card.investment_amount)
      });
    }
    
    // Add phase restriction if present
    if (card.phase_restriction && card.phase_restriction !== 'Any') {
      fields.push({
        label: 'Phase Restriction',
        value: card.phase_restriction
      });
    }
    
    return fields;
  },

  /**
   * Get current game phase (backward compatibility)
   * @returns {string} Current phase or 'Unknown'
   */
  getCurrentPhase: function() {
    return window.GameStateManager?.currentPhase || 'Unknown';
  }
};

// Export for modules that need direct access to metadata
window.CARD_TYPES = window.CARD_TYPE_METADATA;

console.log('CardTypeConstants.js: Loaded card type metadata for', Object.keys(window.CARD_TYPE_METADATA).length, 'card types');
console.log('CardTypeConstants.js code execution finished');