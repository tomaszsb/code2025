// CardManagerInterface.js file is beginning to be used
console.log('CardManagerInterface.js file is beginning to be used');

/**
 * CardManagerInterface - Public interface for the CardManager component
 * 
 * This interface defines the stable public API for the CardManager component.
 * Other components should interact with CardManager only through this interface
 * to maintain loose coupling and allow internal implementation changes.
 * 
 * Key features:
 * - Defines all public methods available to other components
 * - Provides a stable API that won't change even if implementation changes
 * - Includes documentation for each method
 * - Handles validation and error checking
 */
window.CardManagerInterface = (function() {
  // Private reference to actual CardManager
  let _cardManager = null;
  
  // Validation helpers
  function _validateCardType(type) {
    const validTypes = ['W', 'B', 'I', 'L', 'E'];
    return validTypes.includes(type);
  }
  
  function _validatePlayer(player) {
    return player && typeof player === 'object' && player.id;
  }
  
  // Public interface
  return {
    /**
     * Initialize the interface with a reference to the actual CardManager
     * @param {object} cardManager - Reference to the CardManager instance
     */
    initialize: function(cardManager) {
      if (!cardManager) {
        console.error('CardManagerInterface: Cannot initialize with null CardManager');
        return false;
      }
      
      _cardManager = cardManager;
      console.log('CardManagerInterface: Initialized successfully');
      
      // Register with ComponentRegistry if available
      if (window.ComponentRegistry) {
        window.ComponentRegistry.register('CardManager', this, '1.0');
      }
      
      return true;
    },
    
    /**
     * Draw a card of the specified type
     * @param {string} type - Card type (W, B, I, L, E)
     * @param {object} [player] - Optional player to assign the card to
     * @returns {object|null} The drawn card or null if error
     */
    drawCard: function(type, player) {
      // Validate parameters
      if (!_validateCardType(type)) {
        console.error(`CardManagerInterface: Invalid card type "${type}"`);
        return null;
      }
      
      if (player && !_validatePlayer(player)) {
        console.error('CardManagerInterface: Invalid player object');
        return null;
      }
      
      // Safety check for initialization
      if (!_cardManager) {
        console.error('CardManagerInterface: Not initialized');
        return null;
      }
      
      try {
        // Call the actual CardManager method
        return _cardManager.drawCard(type, player);
      } catch (error) {
        console.error('CardManagerInterface: Error drawing card:', error);
        return null;
      }
    },
    
    /**
     * Get the count of cards of the specified type
     * @param {string} type - Card type (W, B, I, L, E)
     * @returns {number} The number of cards of that type
     */
    getCardCount: function(type) {
      // Validate parameters
      if (!_validateCardType(type)) {
        console.error(`CardManagerInterface: Invalid card type "${type}"`);
        return 0;
      }
      
      // Safety check for initialization
      if (!_cardManager) {
        console.error('CardManagerInterface: Not initialized');
        return 0;
      }
      
      try {
        // Call the actual CardManager method
        return _cardManager.getCardCount(type);
      } catch (error) {
        console.error('CardManagerInterface: Error getting card count:', error);
        return 0;
      }
    },
    
    /**
     * Get all cards for a player
     * @param {object} player - Player object
     * @param {string} [type] - Optional card type to filter by
     * @returns {object[]} Array of card objects
     */
    getPlayerCards: function(player, type) {
      // Validate parameters
      if (!_validatePlayer(player)) {
        console.error('CardManagerInterface: Invalid player object');
        return [];
      }
      
      if (type && !_validateCardType(type)) {
        console.error(`CardManagerInterface: Invalid card type "${type}"`);
        return [];
      }
      
      // Safety check for initialization
      if (!_cardManager) {
        console.error('CardManagerInterface: Not initialized');
        return [];
      }
      
      try {
        // Call the actual CardManager method
        return _cardManager.getPlayerCards(player, type);
      } catch (error) {
        console.error('CardManagerInterface: Error getting player cards:', error);
        return [];
      }
    },
    
    /**
     * Assign a card to a player
     * @param {object} card - Card object to assign
     * @param {object} player - Player to assign the card to
     * @returns {boolean} True if successful
     */
    assignCardToPlayer: function(card, player) {
      // Validate parameters
      if (!card || typeof card !== 'object') {
        console.error('CardManagerInterface: Invalid card object');
        return false;
      }
      
      if (!_validatePlayer(player)) {
        console.error('CardManagerInterface: Invalid player object');
        return false;
      }
      
      // Safety check for initialization
      if (!_cardManager) {
        console.error('CardManagerInterface: Not initialized');
        return false;
      }
      
      try {
        // Call the actual CardManager method
        return _cardManager.assignCardToPlayer(card, player);
      } catch (error) {
        console.error('CardManagerInterface: Error assigning card to player:', error);
        return false;
      }
    },
    
    /**
     * Play a card from a player's hand
     * @param {object} card - Card object to play
     * @param {object} player - Player playing the card
     * @returns {object} Result of playing the card
     */
    playCard: function(card, player) {
      // Validate parameters
      if (!card || typeof card !== 'object') {
        console.error('CardManagerInterface: Invalid card object');
        return { success: false, error: 'Invalid card object' };
      }
      
      if (!_validatePlayer(player)) {
        console.error('CardManagerInterface: Invalid player object');
        return { success: false, error: 'Invalid player object' };
      }
      
      // Safety check for initialization
      if (!_cardManager) {
        console.error('CardManagerInterface: Not initialized');
        return { success: false, error: 'Interface not initialized' };
      }
      
      try {
        // Call the actual CardManager method
        return _cardManager.playCard(card, player);
      } catch (error) {
        console.error('CardManagerInterface: Error playing card:', error);
        return { success: false, error: error.message };
      }
    },
    
    /**
     * Discard a card from a player's hand
     * @param {object} card - Card object to discard
     * @param {object} player - Player discarding the card
     * @returns {boolean} True if successful
     */
    discardCard: function(card, player) {
      // Validate parameters
      if (!card || typeof card !== 'object') {
        console.error('CardManagerInterface: Invalid card object');
        return false;
      }
      
      if (!_validatePlayer(player)) {
        console.error('CardManagerInterface: Invalid player object');
        return false;
      }
      
      // Safety check for initialization
      if (!_cardManager) {
        console.error('CardManagerInterface: Not initialized');
        return false;
      }
      
      try {
        // Call the actual CardManager method
        return _cardManager.discardCard(card, player);
      } catch (error) {
        console.error('CardManagerInterface: Error discarding card:', error);
        return false;
      }
    },
    
    /**
     * Shuffle a card deck
     * @param {string} type - Card type (W, B, I, L, E)
     * @returns {boolean} True if successful
     */
    shuffleDeck: function(type) {
      // Validate parameters
      if (!_validateCardType(type)) {
        console.error(`CardManagerInterface: Invalid card type "${type}"`);
        return false;
      }
      
      // Safety check for initialization
      if (!_cardManager) {
        console.error('CardManagerInterface: Not initialized');
        return false;
      }
      
      try {
        // Call the actual CardManager method
        return _cardManager.shuffleDeck(type);
      } catch (error) {
        console.error('CardManagerInterface: Error shuffling deck:', error);
        return false;
      }
    }
  };
})();

// Export constants
window.CARD_TYPES = {
  WORK: 'W',
  BANK: 'B',
  INVESTOR: 'I',
  LIFE: 'L',
  EXPEDITOR: 'E'
};

console.log('CardManagerInterface.js code execution finished');