// MoveLogicSpaceTypes.js - Space type detection system
console.log('MoveLogicSpaceTypes.js file is beginning to be used');

/**
 * MoveLogicSpaceTypes - Extends MoveLogicBase with space type detection
 * 
 * This module adds a systematic approach to detect space types based on properties
 * and establishes a handler registry for different space types.
 */
(function() {
  // Make sure MoveLogicBase is loaded
  if (!window.MoveLogicBase) {
    console.error('MoveLogicSpaceTypes: MoveLogicBase not found. Make sure to include MoveLogicBase.js first.');
    return;
  }
  
  // Define the MoveLogicSpaceTypes class
  function MoveLogicSpaceTypes() {
    // Call the parent constructor
    window.MoveLogicBase.call(this);
    
    console.log('MoveLogicSpaceTypes: Constructor initialized');
    
    // Define space types and their characteristics
    this.spaceTypes = {
      STANDARD: 'StandardSpace',
      DICE_ROLL: 'DiceRollSpace',
      VISIT_TYPE: 'VisitTypeSpace',
      CARD_EFFECT: 'CardEffectSpace',
      COST: 'CostSpace',
      DECISION_TREE: 'DecisionTreeSpace',
      NEGOTIATION: 'NegotiationSpace'
    };
    
    // Handlers registry for each space type
    this.spaceTypeHandlers = {};
    
    console.log('MoveLogicSpaceTypes: Space type detection system added. [2025-05-02]');
    console.log('MoveLogicSpaceTypes: Updated to use data-driven approach for decision trees. [2025-05-04]');
    console.log('MoveLogicSpaceTypes: Initialized successfully');
  }
  
  // Inherit from MoveLogicBase
  MoveLogicSpaceTypes.prototype = Object.create(window.MoveLogicBase.prototype);
  MoveLogicSpaceTypes.prototype.constructor = MoveLogicSpaceTypes;
  
  /**
   * Analyze a space to determine its types based on properties
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player for context
   * @param {Object} space - The space to analyze
   * @returns {Array} - Array of space types (from this.spaceTypes)
   */
  MoveLogicSpaceTypes.prototype.getSpaceTypes = function(gameState, player, space) {
    console.log(`MoveLogicSpaceTypes: Analyzing space types for: ${space.name}`);
    
    const spaceTypes = [this.spaceTypes.STANDARD]; // All spaces have the standard type by default
    
    // Check for DICE_ROLL type - spaces with "Outcome from rolled dice" in nextSpaces
    if (space.nextSpaces && space.nextSpaces.some(s => s && s.includes('Outcome from rolled dice'))) {
      spaceTypes.push(this.spaceTypes.DICE_ROLL);
      console.log(`MoveLogicSpaceTypes: Detected ${this.spaceTypes.DICE_ROLL} for ${space.name}`);
    }
    
    // Check for VISIT_TYPE type - spaces with separate behavior for first vs. subsequent visits
    const hasVisited = gameState.hasPlayerVisitedSpace(player, space.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    // Check if space has a specific visitType property or "Option from first visit" pattern
    if (space.visitType || 
        (space.nextSpaces && space.nextSpaces.some(s => s && s.includes('Option from first visit')))) {
      spaceTypes.push(this.spaceTypes.VISIT_TYPE);
      console.log(`MoveLogicSpaceTypes: Detected ${this.spaceTypes.VISIT_TYPE} for ${space.name} (${visitType} visit)`);
    }
    
    // Check for CARD_EFFECT type - spaces with card effects (WCard, BCard, etc.)
    const cardProperties = ['WCard', 'BCard', 'ICard', 'LCard', 'ECard', 'wCard', 'bCard', 'iCard', 'lCard', 'eCard'];
    if (cardProperties.some(prop => space[prop] && space[prop] !== 'n/a' && space[prop].trim() !== '')) {
      spaceTypes.push(this.spaceTypes.CARD_EFFECT);
      console.log(`MoveLogicSpaceTypes: Detected ${this.spaceTypes.CARD_EFFECT} for ${space.name}`);
    }
    
    // Check for COST type - spaces with Fee or Time properties
    if ((space.Fee && space.Fee !== 'n/a' && space.Fee.trim() !== '') || 
        (space.Time && space.Time !== 'n/a' && space.Time.trim() !== '')) {
      spaceTypes.push(this.spaceTypes.COST);
      console.log(`MoveLogicSpaceTypes: Detected ${this.spaceTypes.COST} for ${space.name}`);
    }
    
    // Check for DECISION_TREE type - spaces with complex decision logic
    // Use the hasSpecialCaseLogic method to check based on DiceRollLogic instead of hardcoded array
    if (this.hasSpecialCaseLogic && typeof this.hasSpecialCaseLogic === 'function') {
      const isSpecialCase = this.hasSpecialCaseLogic(space.name);
      if (isSpecialCase) {
        spaceTypes.push(this.spaceTypes.DECISION_TREE);
        console.log(`MoveLogicSpaceTypes: Detected ${this.spaceTypes.DECISION_TREE} for ${space.name}`);
      }
    }
    
    // Check for NEGOTIATION type - spaces with negotiate options
    if (space.nextSpaces && space.nextSpaces.some(s => s && s.toLowerCase().includes('negotiate'))) {
      spaceTypes.push(this.spaceTypes.NEGOTIATION);
      console.log(`MoveLogicSpaceTypes: Detected ${this.spaceTypes.NEGOTIATION} for ${space.name}`);
    }
    
    console.log(`MoveLogicSpaceTypes: Space ${space.name} has types:`, spaceTypes);
    return spaceTypes;
  };
  
  /**
   * Override getAvailableMoves to use the space type system
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  MoveLogicSpaceTypes.prototype.getAvailableMoves = function(gameState, player) {
    console.log(`MoveLogicSpaceTypes: Getting available moves for player ${player.id}`);
    
    // Get the player's current space
    const currentSpace = gameState.spaces.find(s => s.id === player.position);
    if (!currentSpace) {
      console.warn(`MoveLogicSpaceTypes: No space found at player position ${player.position}`);
      return [];
    }
    
    console.log(`MoveLogicSpaceTypes: Getting moves for space: ${currentSpace.name}`);
    
    // Check if this space has special case logic (for backward compatibility)
    if (this.hasSpecialCaseLogic(currentSpace.name)) {
      console.log(`MoveLogicSpaceTypes: Using special case logic for ${currentSpace.name}`);
      return this.handleSpecialCaseSpace(gameState, player, currentSpace);
    }
    
    // Identify the space types for this space
    const spaceTypes = this.getSpaceTypes(gameState, player, currentSpace);
    
    // Handle spaces based on their types
    for (const spaceType of spaceTypes) {
      // Skip STANDARD type as it doesn't have a specific handler
      if (spaceType === this.spaceTypes.STANDARD) continue;
      
      // Check if we have a handler for this space type
      if (this.spaceTypeHandlers[spaceType]) {
        console.log(`MoveLogicSpaceTypes: Using handler for ${spaceType}`);
        const result = this.spaceTypeHandlers[spaceType](gameState, player, currentSpace);
        
        // If the handler returns a non-null result, use it
        if (result !== null) {
          console.log(`MoveLogicSpaceTypes: Handler for ${spaceType} returned result`);
          return result;
        }
      }
    }
    
    // Default to standard move logic if no specific handler applies
    console.log(`MoveLogicSpaceTypes: Using standard move logic for ${currentSpace.name}`);
    return window.MoveLogicBase.prototype.getSpaceDependentMoves.call(this, gameState, player, currentSpace);
  };
  
  // Expose the class to the global scope
  window.MoveLogicSpaceTypes = MoveLogicSpaceTypes;
})();

console.log('MoveLogicSpaceTypes.js code execution finished');