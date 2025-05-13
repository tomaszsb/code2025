// MoveLogicSpaceHandlers.js - Handlers for different space types
console.log('MoveLogicSpaceHandlers.js file is beginning to be used');

/**
 * MoveLogicSpaceHandlers - Extends MoveLogicCardEffects with space type handlers
 * 
 * This module adds implementations for handling different space types,
 * such as dice roll spaces, decision tree spaces, and negotiation spaces.
 */
(function() {
  // Make sure MoveLogicCardEffects is loaded
  if (!window.MoveLogicCardEffects) {
    console.error('MoveLogicSpaceHandlers: MoveLogicCardEffects not found. Make sure to include MoveLogicCardEffects.js first.');
    return;
  }
  
  // Define the MoveLogicSpaceHandlers class
  function MoveLogicSpaceHandlers() {
    // Call the parent constructor
    window.MoveLogicCardEffects.call(this);
    
    console.log('MoveLogicSpaceHandlers: Constructor initialized');
    
    // Register handlers for different space types
    this.spaceTypeHandlers[this.spaceTypes.DICE_ROLL] = this.handleDiceRollSpace.bind(this);
    this.spaceTypeHandlers[this.spaceTypes.DECISION_TREE] = this.handleDecisionTreeSpace.bind(this);
    this.spaceTypeHandlers[this.spaceTypes.CARD_EFFECT] = this.handleCardEffectSpace.bind(this);
    this.spaceTypeHandlers[this.spaceTypes.NEGOTIATION] = this.handleNegotiationSpace.bind(this);
    
    console.log('MoveLogicSpaceHandlers: Space type handlers registered. [2025-05-02]');
    console.log('MoveLogicSpaceHandlers: Initialized successfully');
  }
  
  // Inherit from MoveLogicCardEffects
  MoveLogicSpaceHandlers.prototype = Object.create(window.MoveLogicCardEffects.prototype);
  MoveLogicSpaceHandlers.prototype.constructor = MoveLogicSpaceHandlers;
  
  /**
   * Handle dice roll spaces
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} space - The current space of the player
   * @returns {Array|Object|null} - Array of moves, dice roll object, or null
   */
  MoveLogicSpaceHandlers.prototype.handleDiceRollSpace = function(gameState, player, space) {
    console.log(`MoveLogicSpaceHandlers: Handling dice roll space ${space.name}`);
    
    // Check if there's a dice roll available
    const lastDiceRoll = gameState.getLastDiceRoll ? gameState.getLastDiceRoll() : null;
    
    // For spaces that require dice roll, if we don't have a dice roll yet,
    // return a requiresDiceRoll object to prompt the UI to show the dice
    if (!lastDiceRoll) {
      const hasVisited = gameState.hasPlayerVisitedSpace(player, space.name);
      const visitType = hasVisited ? 'subsequent' : 'first';
      
      console.log(`MoveLogicSpaceHandlers: Dice roll required for ${space.name} (${visitType} visit)`);
      return { requiresDiceRoll: true, spaceName: space.name, visitType: visitType };
    }
    
    // If we have a dice roll, use it to determine the next move
    const rollValue = lastDiceRoll.total || lastDiceRoll.value || 0;
    console.log(`MoveLogicSpaceHandlers: Using dice roll value ${rollValue} for ${space.name}`);
    
    // Let the standard move logic handle this with the dice roll value
    // Return null to fall back to standard processing
    return null;
  };
  
  /**
   * Handle decision tree spaces - these require complex navigation logic
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} space - The current space of the player
   * @returns {Array|null} - Array of moves or null
   */
  MoveLogicSpaceHandlers.prototype.handleDecisionTreeSpace = function(gameState, player, space) {
    console.log(`MoveLogicSpaceHandlers: Handling decision tree space ${space.name}`);
    
    // This is a placeholder - the actual implementations for specific
    // decision tree spaces will be provided in MoveLogicSpecialCases.js
    // Return null to fall back to standard processing or special case handling
    return null;
  };
  
  /**
   * Handle card effect spaces
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} space - The current space of the player
   * @returns {Array|null} - Array of moves or null
   */
  MoveLogicSpaceHandlers.prototype.handleCardEffectSpace = function(gameState, player, space) {
    console.log(`MoveLogicSpaceHandlers: Handling card effect space ${space.name}`);
    
    // Process card effects
    const lastDiceRoll = gameState.getLastDiceRoll ? gameState.getLastDiceRoll() : null;
    const effectsApplied = this.handleSpaceCardEffects(gameState, player, space, lastDiceRoll);
    
    console.log(`MoveLogicSpaceHandlers: Card effects processed for ${space.name}, effects applied: ${effectsApplied}`);
    
    // Return null to continue with standard processing
    return null;
  };
  
  /**
   * Handle negotiation spaces
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} space - The current space of the player
   * @returns {Array|null} - Array of moves or null
   */
  MoveLogicSpaceHandlers.prototype.handleNegotiationSpace = function(gameState, player, space) {
    console.log(`MoveLogicSpaceHandlers: Handling negotiation space ${space.name}`);
    
    // Process negotiation options
    // This would typically fire events to show UI elements for negotiation
    
    // For now, just log the presence of negotiation options
    const negotiationOptions = space.nextSpaces.filter(s => 
      s && s.toLowerCase().includes('negotiate'));
    
    if (negotiationOptions.length > 0) {
      console.log(`MoveLogicSpaceHandlers: Found ${negotiationOptions.length} negotiation options in ${space.name}`);
      // Here you could dispatch an event to show the negotiation UI
      
      // For example:
      // gameState.dispatchEvent('negotiationOptionsAvailable', {
      //   player: player,
      //   playerId: player.id,
      //   space: space,
      //   spaceName: space.name,
      //   options: negotiationOptions
      // });
    }
    
    // Return null to continue with standard processing
    return null;
  };
  
  // Expose the class to the global scope
  window.MoveLogicSpaceHandlers = MoveLogicSpaceHandlers;
})();

console.log('MoveLogicSpaceHandlers.js code execution finished');