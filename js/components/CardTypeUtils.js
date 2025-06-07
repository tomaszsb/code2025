// CardTypeUtils.js file is beginning to be used
console.log('CardTypeUtils.js file is beginning to be used');

/**
 * CardTypeUtilsManager - Manager class for card type operations
 * 
 * This component manages card type detection, formatting, and consistent
 * styling for all card-related operations in the game.
 * 
 * Key features:
 * - Follows the manager pattern with proper initialization and cleanup
 * - Uses GameStateManager events for communication
 * - Provides consistent card type detection and field access
 * - Maintains proper formatting for currency and card values
 * - Integrates with CSS classes instead of relying on inline styles
 */
class CardTypeUtilsManager {
  /**
   * Initialize the Card Type Utils Manager
   */
  constructor() {
    console.log('CardTypeUtilsManager: Constructor initialized');
    
    // Configuration
    this.cardTypes = ['W', 'B', 'I', 'L', 'E'];
    this.cardCssClasses = {
      W: 'card-type-work',
      B: 'card-type-bank',
      I: 'card-type-investor',
      L: 'card-type-life',
      E: 'card-type-expeditor'
    };
    
    // State tracking
    this.initialized = false;
    this.cacheEnabled = true;
    this.typeCache = new Map(); // Cache for card type detection
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      cardDrawn: this.handleCardDrawnEvent.bind(this),
      cardPlayed: this.handleCardPlayedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    this.initialized = true;
    console.log('CardTypeUtilsManager: Constructor completed');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners() {
    console.log('CardTypeUtilsManager: Registering event listeners');
    
    if (!window.GameStateManager) {
      console.error('CardTypeUtilsManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register for standard card events
    window.GameStateManager.addEventListener('cardDrawn', this.eventHandlers.cardDrawn);
    window.GameStateManager.addEventListener('cardPlayed', this.eventHandlers.cardPlayed);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    console.log('CardTypeUtilsManager: Event listeners registered successfully');
  }
  
  /**
   * Handle cardDrawn events from GameStateManager
   * @param {Object} event - The cardDrawn event object
   */
  handleCardDrawnEvent(event) {
    console.log('CardTypeUtilsManager: Handling cardDrawn event');
    
    if (!event || !event.data || !event.data.card) {
      return;
    }
    
    const card = event.data.card;
    
    // Ensure the card has a proper type
    if (!card.type || !this.cardTypes.includes(card.type.toUpperCase())) {
      const detectedType = this.detectCardType(card);
      if (detectedType) {
        console.log(`CardTypeUtilsManager: Updating drawn card type to ${detectedType}`);
        card.type = detectedType;
      }
    }
  }
  
  /**
   * Handle cardPlayed events from GameStateManager
   * @param {Object} event - The cardPlayed event object
   */
  handleCardPlayedEvent(event) {
    console.log('CardTypeUtilsManager: Handling cardPlayed event');
    
    if (!event || !event.data || !event.data.card) {
      return;
    }
    
    // Clear cache entry for the played card if it exists
    const card = event.data.card;
    if (card.id && this.typeCache.has(card.id)) {
      this.typeCache.delete(card.id);
      console.log(`CardTypeUtilsManager: Cleared cache for played card ${card.id}`);
    }
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The gameStateChanged event object
   */
  handleGameStateChangedEvent(event) {
    console.log('CardTypeUtilsManager: Handling gameStateChanged event');
    
    if (!event || !event.data) {
      return;
    }
    
    // Handle relevant game state changes
    if (event.data.changeType === 'newGame') {
      // Clear type cache for a new game
      this.typeCache.clear();
      console.log('CardTypeUtilsManager: Cleared card type cache for new game');
    }
  }

  /**
   * Get the CSS class for a card type
   * @param {string} cardType - The card type code
   * @returns {string} The CSS class for the card type
   */
  getCardClass(cardType) {
    console.log('CardTypeUtilsManager: getCardClass for type:', cardType);
    
    // Normalize cardType to handle null/undefined/empty values
    const normalizedType = typeof cardType === 'string' ? cardType.trim().toUpperCase() : '';
    
    if (this.cardTypes.includes(normalizedType)) {
      return this.cardCssClasses[normalizedType];
    }
    
    console.log('CardTypeUtilsManager: Unknown card type:', cardType, 'defaulting to unknown');
    return 'card-type-unknown';
  }
  
  /**
   * Get the color for a card type (legacy function for backward compatibility)
   * @param {string} cardType - The card type code
   * @returns {string} The color hex code for the card type
   */
  getCardColor(cardType) {
    console.log('CardTypeUtilsManager: getCardColor for type:', cardType);
    
    // Normalize cardType to handle null/undefined/empty values
    const normalizedType = typeof cardType === 'string' ? cardType.trim().toUpperCase() : '';
    
    switch (normalizedType) {
      case 'W': return '#4285f4'; // Blue for Work Type
      case 'B': return '#ea4335'; // Red for Bank
      case 'I': return '#fbbc05'; // Yellow for Investor
      case 'L': return '#34a853'; // Green for Life
      case 'E': return '#8e44ad'; // Purple for Expeditor
      default: 
        console.log('CardTypeUtilsManager: Unknown card type:', cardType, 'defaulting to gray');
        return '#777777';  // Gray for unknown
    }
  }
  
  /**
   * Get the full card type name
   * @param {string} cardType - The card type code
   * @returns {string} The full name of the card type
   */
  getCardTypeName(cardType) {
    console.log('CardTypeUtilsManager: getCardTypeName for type:', cardType);
    
    // Normalize cardType to handle null/undefined/empty values
    const normalizedType = typeof cardType === 'string' ? cardType.trim().toUpperCase() : '';
    
    switch (normalizedType) {
      case 'W': return 'Work Type';
      case 'B': return 'Bank';
      case 'I': return 'Investor';
      case 'L': return 'Life';
      case 'E': return 'Expeditor';
      default: 
        console.log('CardTypeUtilsManager: Unknown card type name:', cardType, 'defaulting to Unknown');
        return 'Unknown';
    }
  }
  
  /**
   * Detect card type from card data if not explicitly set
   * @param {Object} card - The card object
   * @returns {string|null} The detected card type or null if detection failed
   */
  detectCardType(card) {
    if (!card) return null;
    
    const cardId = card.id || 'unknown';
    console.log('CardTypeUtilsManager: detectCardType for card:', cardId);
    
    // Check cache first if enabled
    if (this.cacheEnabled && cardId !== 'unknown' && this.typeCache.has(cardId)) {
      const cachedType = this.typeCache.get(cardId);
      console.log('CardTypeUtilsManager: Found cached type:', cachedType);
      return cachedType;
    }
    
    let detectedType = null;
    
    // If card already has a valid type, use it
    if (card.type && this.cardTypes.includes(card.type.toUpperCase())) {
      console.log('CardTypeUtilsManager: Card already has valid type:', card.type);
      detectedType = card.type.toUpperCase();
    }
    // Try to extract type from card ID
    else if (card.id && typeof card.id === 'string') {
      const idParts = card.id.split('-');
      if (idParts.length >= 1 && idParts[0].length === 1) {
        const extractedType = idParts[0].toUpperCase();
        if (this.cardTypes.includes(extractedType)) {
          console.log('CardTypeUtilsManager: Detected card type from ID:', extractedType);
          detectedType = extractedType;
        }
      }
    }
    
    // If still not detected, try to determine type from card properties
    if (!detectedType) {
      if (card['Work Type'] && (card['Job Description'] || card['Estimated Job Costs'])) {
        console.log('CardTypeUtilsManager: Detected card type from properties: W');
        detectedType = 'W';
      } else if (card['Distribution Level'] && card['Amount'] && card['Description']) {
        console.log('CardTypeUtilsManager: Detected card type from properties: I');
        detectedType = 'I';
      } else if (card['Card Name'] && (card['Distribution Level'] || card['Loan Percentage Cost'])) {
        console.log('CardTypeUtilsManager: Detected card type from properties: B');
        detectedType = 'B';
      } else if (card['Card Name'] && card['Effect'] && card['Color']) {
        console.log('CardTypeUtilsManager: Detected card type from properties: E');
        detectedType = 'E';
      } else if (card['Card Name'] && card['Effect'] && card['Category']) {
        console.log('CardTypeUtilsManager: Detected card type from properties: L');
        detectedType = 'L';
      } else {
        console.log('CardTypeUtilsManager: Could not detect card type, defaulting to E');
        detectedType = 'E'; // Default to Expeditor if cannot determine
      }
    }
    
    // Cache the detected type if caching is enabled
    if (this.cacheEnabled && cardId !== 'unknown' && detectedType) {
      this.typeCache.set(cardId, detectedType);
      console.log('CardTypeUtilsManager: Cached detected type:', detectedType);
    }
    
    return detectedType;
  }
  
  /**
   * Get the primary display field for a card based on type
   * @param {Object} card - The card object
   * @returns {string} The primary field value for display
   */
  getCardPrimaryField(card) {
    if (!card) return '';
    
    const cardId = card.id || 'unknown';
    console.log('CardTypeUtilsManager: getCardPrimaryField for card:', cardId);
    
    // Ensure card has a type
    const cardType = this.detectCardType(card);
    if (!cardType) return '';
    
    switch (cardType) {
      case 'W': 
        const workType = card.card_name || card.work_type_restriction || '';
        console.log('CardTypeUtilsManager: Work Type primary field:', workType);
        return workType;
        
      case 'B': 
        const cardName = card.card_name || '';
        console.log('CardTypeUtilsManager: Bank primary field:', cardName);
        return cardName;
        
      case 'I': 
        let investorAmount = '';
        if (card.investment_amount) {
          // Format amount as currency string
          investorAmount = this.formatCurrency(card.investment_amount);
        } else if (card.card_name) {
          investorAmount = card.card_name;
        }
        console.log('CardTypeUtilsManager: Investor primary field:', investorAmount);
        return investorAmount;
        
      case 'L': 
        const lifeCardName = card.card_name || '';
        console.log('CardTypeUtilsManager: Life primary field:', lifeCardName);
        return lifeCardName;
        
      case 'E': 
        const expeditorCardName = card.card_name || '';
        console.log('CardTypeUtilsManager: Expeditor primary field:', expeditorCardName);
        return expeditorCardName;
        
      default: 
        console.log('CardTypeUtilsManager: Unknown card type for primary field, returning empty string');
        return '';
    }
  }
  
  /**
   * Get the secondary display field for a card based on type
   * @param {Object} card - The card object
   * @returns {string} The secondary field value for display
   */
  getCardSecondaryField(card) {
    if (!card) return '';
    
    const cardId = card.id || 'unknown';
    console.log('CardTypeUtilsManager: getCardSecondaryField for card:', cardId);
    
    // Ensure card has a type
    const cardType = this.detectCardType(card);
    if (!cardType) return '';
    
    let secondaryField = '';
    
    switch (cardType) {
      case 'W': 
        secondaryField = card.description || card.work_type_restriction || '';
        break;
        
      case 'B': 
        secondaryField = card.description || '';
        break;
        
      case 'I': 
        secondaryField = card.description || '';
        break;
        
      case 'L': 
        secondaryField = card.description || '';
        break;
        
      case 'E': 
        secondaryField = card.description || '';
        break;
        
      default:
        console.log('CardTypeUtilsManager: Unknown card type for secondary field, returning empty string');
        return '';
    }
    
    // Log a truncated version for readability but return the full value
    const logValue = secondaryField.length > 20 ? 
      secondaryField.substring(0, 20) + '...' : 
      secondaryField;
      
    console.log(`CardTypeUtilsManager: ${cardType} secondary field:`, logValue);
    
    return secondaryField;
  }
  
  /**
   * Get additional fields to display for a card type in the detail view
   * @param {Object} card - The card object
   * @returns {Array} Array of field objects with label and value properties
   */
  getCardDetailFields(card) {
    if (!card) return [];
    
    const cardId = card.id || 'unknown';
    console.log('CardTypeUtilsManager: getCardDetailFields for card:', cardId);
    
    // Ensure card has a type
    const cardType = this.detectCardType(card);
    if (!cardType) return [];
    
    console.log('CardTypeUtilsManager: Using card type for detail fields:', cardType);
    
    // Helper function to create field object only if value exists
    const createField = (label, value) => {
      const processedValue = value !== undefined && value !== null ? String(value) : '';
      return { label, value: processedValue };
    };
    
    switch (cardType) {
      case 'W':
        console.log('CardTypeUtilsManager: Returning Work Type fields');
        return [
          createField('Card Name', card.card_name),
          createField('Description', card.description),
          createField('Work Type', card.work_type_restriction),
          createField('Work Cost', card.work_cost ? 
            this.formatCurrency(card.work_cost) : 
            ''),
          createField('Phase', card.phase_restriction),
          createField('Duration', card.duration)
        ].filter(field => field.value.trim() !== '');
        
      case 'B':
        console.log('CardTypeUtilsManager: Returning Bank fields');
        return [
          createField('Card Name', card.card_name),
          createField('Description', card.description),
          createField('Loan Amount', card.loan_amount ? 
            this.formatCurrency(card.loan_amount) : 
            ''),
          createField('Interest Rate', card.loan_rate ? 
            `${card.loan_rate}%` : 
            ''),
          createField('Timing', card.activation_timing),
          createField('Duration', card.duration)
        ].filter(field => field.value.trim() !== '');
        
      case 'I':
        console.log('CardTypeUtilsManager: Returning Investor fields');
        return [
          createField('Card Name', card.card_name),
          createField('Description', card.description),
          createField('Investment Amount', card.investment_amount ? 
            this.formatCurrency(card.investment_amount) : 
            ''),
          createField('Timing', card.activation_timing),
          createField('Duration', card.duration)
        ].filter(field => field.value.trim() !== '');
        
      case 'L':
        console.log('CardTypeUtilsManager: Returning Life fields');
        return [
          createField('Card Name', card.card_name),
          createField('Description', card.description),
          createField('Flavor Text', card.flavor_text),
          createField('Time Effect', card.time_effect),
          createField('Duration', card.duration)
        ].filter(field => field.value.trim() !== '');
        
      case 'E':
        console.log('CardTypeUtilsManager: Returning Expeditor fields');
        return [
          createField('Card Name', card.card_name),
          createField('Description', card.description),
          createField('Flavor Text', card.flavor_text),
          createField('Phase', card.phase_restriction),
          createField('Duration', card.duration),
          createField('Immediate Effect', card.immediate_effect)
        ].filter(field => field.value.trim() !== '');
        
      default:
        console.log('CardTypeUtilsManager: Unknown card type for detail fields, trying to detect type');
        // This should not normally be reached due to type detection above,
        // but included as a fallback just in case
        const detectedType = this.detectCardType(card);
        if (detectedType && detectedType !== cardType) {
          console.log('CardTypeUtilsManager: Re-detected card type:', detectedType);
          return this.getCardDetailFields({...card, type: detectedType});
        }
        
        console.log('CardTypeUtilsManager: Could not determine card detail fields');
        return [];
    }
  }
  
  /**
   * Get player color for card styling using GameStateManager
   * @param {string} playerId - The player ID
   * @returns {string} The color string (hex code or CSS class)
   */
  getPlayerColor(playerId) {
    console.log('CardTypeUtilsManager: getPlayerColor for player:', playerId);
    
    // Check for proper GameStateManager access
    if (!window.GameStateManager) {
      console.error('CardTypeUtilsManager: GameStateManager not available');
      return '#f9f9f9'; // Default color
    }
    
    // Find the player in the game state
    const player = window.GameStateManager.players.find(p => p.id === playerId);
    return player?.color || '#f9f9f9';
  }
  
  /**
   * Check if a card is available in the current game phase
   * @param {Object} card - The card object
   * @returns {boolean} True if card is available in current phase
   */
  isCardAvailableInCurrentPhase(card) {
    if (!card) return false;
    
    // If card has no phase restriction or is marked as "Any", it's always available
    // Also treat legacy color values as "Any" until CSV is fixed
    const anyPhaseValues = ['Any', 'Any Phase', '', 'Red', 'All Colors', 'Green', 'Blue', 'Yellow'];
    if (!card.phase_restriction || anyPhaseValues.includes(card.phase_restriction)) {
      console.log('CardTypeUtils: Card available in any phase', {
        cardId: card.id,
        cardPhase: card.phase_restriction
      });
      return true;
    }
    
    // Accept any phase restriction value for now (will be cleaned up in CSV)
    // Remove color-based logic and just check against valid phase names
    
    // Get current phase from GameStateManager
    const currentPhase = window.GameStateManager?.currentPhase || 'SETUP';
    
    console.log('CardTypeUtils: Checking card availability', {
      cardId: card.id,
      cardPhase: card.phase_restriction,
      currentPhase: currentPhase
    });
    
    return card.phase_restriction === currentPhase;
  }
  
  /**
   * Get the current game phase
   * @returns {string} The current game phase
   */
  getCurrentPhase() {
    return window.GameStateManager?.currentPhase || 'SETUP';
  }
  
  /**
   * Get CSS class for player color
   * @param {string} playerId - The player ID
   * @returns {string} The CSS class for the player color
   */
  getPlayerColorClass(playerId) {
    console.log('CardTypeUtilsManager: getPlayerColorClass for player:', playerId);
    
    // Check for proper GameStateManager access
    if (!window.GameStateManager) {
      console.error('CardTypeUtilsManager: GameStateManager not available');
      return 'player-color-default'; // Default color class
    }
    
    // Find the player in the game state
    const player = window.GameStateManager.players.find(p => p.id === playerId);
    if (!player || !player.color) {
      return 'player-color-default';
    }
    
    // Map player color to CSS class
    const colorMap = {
      '#ff5722': 'player-color-red',
      '#4caf50': 'player-color-green',
      '#2196f3': 'player-color-blue',
      '#ffeb3b': 'player-color-yellow',
      '#9c27b0': 'player-color-purple',
      '#ff9800': 'player-color-orange',
      '#e91e63': 'player-color-pink',
      '#009688': 'player-color-teal'
    };
    
    return colorMap[player.color] || 'player-color-default';
  }
  
  /**
   * Format currency values consistently
   * @param {string|number} value - The value to format as currency
   * @returns {string} The formatted currency string
   */
  formatCurrency(value) {
    if (!value) return '';
    
    try {
      // Handle both number and string formats
      const numValue = typeof value === 'number' 
        ? value 
        : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
        
      return !isNaN(numValue) 
        ? numValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
        : '';
    } catch (e) {
      console.error('CardTypeUtilsManager: Error formatting currency:', e);
      return String(value);
    }
  }
  
  /**
   * Clean up resources when the manager is no longer needed
   */
  cleanup() {
    console.log('CardTypeUtilsManager: Cleaning up resources');
    
    // Remove all event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('cardDrawn', this.eventHandlers.cardDrawn);
      window.GameStateManager.removeEventListener('cardPlayed', this.eventHandlers.cardPlayed);
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    }
    
    // Clear cache
    this.typeCache.clear();
    
    console.log('CardTypeUtilsManager: Cleanup completed');
  }
}

// Create a BackwardCompatibilityLayer to maintain existing functionality
class CardTypeUtilsBackwardCompatibility {
  constructor(manager) {
    console.log('CardTypeUtilsBackwardCompatibility: Initializing compatibility layer');
    this.manager = manager;
    
    // Create legacy compatibility object that forwards to the manager
    window.CardTypeUtils = {
      getCardColor: (cardType) => this.manager.getCardColor(cardType),
      getCardTypeName: (cardType) => this.manager.getCardTypeName(cardType),
      detectCardType: (card) => this.manager.detectCardType(card),
      getCardPrimaryField: (card) => this.manager.getCardPrimaryField(card),
      getCardSecondaryField: (card) => this.manager.getCardSecondaryField(card),
      getCardDetailFields: (card) => this.manager.getCardDetailFields(card),
      getPlayerColor: (playerId) => this.manager.getPlayerColor(playerId),
      formatCurrency: (value) => this.manager.formatCurrency(value),
      
      // Add new methods from the manager to the compatibility layer
      getCardClass: (cardType) => this.manager.getCardClass(cardType),
      getPlayerColorClass: (playerId) => this.manager.getPlayerColorClass(playerId),
      isCardAvailableInCurrentPhase: (card) => this.manager.isCardAvailableInCurrentPhase(card),
      getCurrentPhase: () => this.manager.getCurrentPhase()
    };
    
    console.log('CardTypeUtilsBackwardCompatibility: Compatibility layer initialized');
  }
}

// Initialize manager and compatibility layer
(function() {
  console.log('CardTypeUtilsManager: Initializing manager...');
  
  // Create manager instance
  const cardTypeManager = new CardTypeUtilsManager();
  
  // Create compatibility layer
  const compatibilityLayer = new CardTypeUtilsBackwardCompatibility(cardTypeManager);
  
  // Store manager reference on window for direct access if needed
  window.CardTypeUtilsManager = cardTypeManager;
  
  console.log('CardTypeUtilsManager: Manager initialized and compatibility layer set up');
})();

console.log('CardTypeUtils.js code execution finished');
