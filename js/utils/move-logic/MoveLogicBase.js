// MoveLogicBase.js - Core move logic and calculations
console.log('MoveLogicBase.js file is beginning to be used');

/**
 * MoveLogicBase - Core logic for game movements
 * 
 * This module handles the core functionality of movement logic including:
 * - Getting available moves for a player
 * - Handling space-dependent moves
 * - Providing the foundation for space type system
 */
(function() {
  // Define the MoveLogicBase class
  function MoveLogicBase() {
    console.log('MoveLogicBase: Constructor initialized');
    
    // Configuration for move logic
    this.specialPatterns = [
      'Outcome from rolled dice',
      'Option from first visit'
    ];
    
    // We no longer use hardcoded decision tree spaces - using data-driven approach instead
    console.log('MoveLogicBase: Using data-driven approach for all spaces');
    
    console.log('MoveLogicBase: Card effects handling and game state integration fixed. [2025-04-30]');
    console.log('MoveLogicBase: Visit type resolution improved with consistent handling. [2025-05-02]');
    console.log('MoveLogicBase: Systematic space type detection implemented. [2025-05-02]');
    console.log('MoveLogicBase: Special case handling removed in favor of data-driven approach. [2025-05-04]');
    console.log('MoveLogicBase: Initialized successfully');
  }
  
  /**
   * Get all available moves for a player
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  MoveLogicBase.prototype.getAvailableMoves = function(gameState, player) {
    console.log(`MoveLogicBase: Getting available moves for player ${player.id}`);
    
    // Get the player's current space
    const currentSpace = gameState.spaces.find(s => s.id === player.position);
    if (!currentSpace) {
      console.warn(`MoveLogicBase: No space found at player position ${player.position}`);
      return [];
    }
    
    console.log(`MoveLogicBase: Getting moves for space: ${currentSpace.name}`);
    
    // Always use standard move logic for all spaces
    return this.getSpaceDependentMoves(gameState, player, currentSpace);
  };
  
  /**
   * Check if a space requires dice roll (replaces special case logic check)
   * @param {string} spaceName - The name of the space to check
   * @param {string} visitType - Visit type (first/subsequent)
   * @returns {boolean} - True if space requires dice roll
   */
  MoveLogicBase.prototype.hasSpecialCaseLogic = function(spaceName, visitType) {
    // Use DiceRollLogic to check if this space has dice roll outcomes in CSV
    console.log(`MoveLogicBase: Checking if ${spaceName} requires dice roll`);
    
    if (!window.DiceRollLogic || !window.DiceRollLogic.getOutcomes) {
      console.warn('MoveLogicBase: DiceRollLogic not available, cannot check for dice roll requirement');
      return false;
    }
    
    // Determine visit type if not provided
    if (!visitType) {
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      if (currentPlayer) {
        const hasVisited = window.GameStateManager.hasPlayerVisitedSpace(currentPlayer, spaceName);
        visitType = hasVisited ? 'subsequent' : 'first';
      } else {
        visitType = 'first'; // Default
      }
    }
    
    // Check if space has outcomes defined in DiceRoll Info.csv
    const hasOutcomes = window.DiceRollLogic.getOutcomes(spaceName, visitType) !== null;
    
    if (hasOutcomes) {
      console.log(`MoveLogicBase: Space ${spaceName} requires dice roll according to CSV data`);
    }
    
    return hasOutcomes;
  };
  
  /**
   * Handle special case spaces (deprecated - now uses data-driven approach)
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  MoveLogicBase.prototype.handleSpecialCaseSpace = function(gameState, player, currentSpace) {
    // Log deprecation warning
    console.warn(`MoveLogicBase: Special case handler is deprecated for ${currentSpace.name}. Using data-driven approach instead.`);
    
    // Use standard space-dependent moves instead
    return this.getSpaceDependentMoves(gameState, player, currentSpace);
  };
  
  /**
   * Get moves based on space data and visit type
   * This is a placeholder that will be enhanced by MoveLogicVisitTypes.js
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  MoveLogicBase.prototype.getSpaceDependentMoves = function(gameState, player, currentSpace) {
    console.log(`MoveLogicBase: Getting space-dependent moves for ${currentSpace.name} (Base implementation)`);
    
    // Use built-in resolveSpaceForVisitType or our own implementation
    const resolveSpace = function(gameState, player, spaceName) {
      // Get normalized space name
      const normalizedName = gameState.extractSpaceName(spaceName);
      
      // Find all spaces with this name
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === normalizedName);
      
      if (matchingSpaces.length === 0) {
        console.warn(`MoveLogicBase: No spaces found with name: ${normalizedName}`);
        return null;
      }
      
      // Determine visit type
      const hasVisited = gameState.hasPlayerVisitedSpace(player, normalizedName);
      const visitType = hasVisited ? 'subsequent' : 'first';
      
      // Try to find the exact match first
      let resolvedSpace = matchingSpaces.find(s => 
        s.visitType && s.visitType.toLowerCase() === visitType.toLowerCase());
      
      // If not found, try the opposite visit type
      if (!resolvedSpace) {
        const oppositeType = visitType.toLowerCase() === 'first' ? 'subsequent' : 'first';
        resolvedSpace = matchingSpaces.find(s => 
          s.visitType && s.visitType.toLowerCase() === oppositeType.toLowerCase());
      }
      
      // If still not found, use the first available space
      if (!resolvedSpace && matchingSpaces.length > 0) {
        resolvedSpace = matchingSpaces[0];
      }
      
      return resolvedSpace;
    };
    
    // Get the resolved space based on visit type
    const spaceToUse = resolveSpace(gameState, player, currentSpace.name) || currentSpace;
    
    const availableMoves = [];
    let hasSpecialPattern = false;
    let isDiceRollSpace = false;
    
    // Process each next space
    for (const nextSpaceName of spaceToUse.nextSpaces || []) {
      // Skip empty space names
      if (!nextSpaceName || nextSpaceName.trim() === '') continue;
      
      // Check if this is a negotiate option
      if (nextSpaceName.toLowerCase().includes('negotiate')) {
        console.log(`MoveLogicBase: Found negotiate option: ${nextSpaceName}`);
        // We don't add negotiate options to available moves, as they're handled by a separate UI element
        continue;
      }
      
      // Check if this is a special pattern
      if (this.specialPatterns.some(pattern => nextSpaceName.includes(pattern))) {
        hasSpecialPattern = true;
        console.log(`MoveLogicBase: Found special pattern in next space: ${nextSpaceName}`);
        
        // Check if this is a dice roll space
        if (nextSpaceName.includes('Outcome from rolled dice')) {
          isDiceRollSpace = true;
          console.log(`MoveLogicBase: This is a dice roll space`);
        }
        
        continue; // Skip this entry
      }
      
      // Get base name without explanatory text
      const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
      
      console.log(`MoveLogicBase: Processing next space: ${cleanedSpaceName}`);
      
      // Use our helper function to resolve the appropriate space
      const nextSpace = resolveSpace(gameState, player, cleanedSpaceName);
      
      // Add to available moves if not already in the list and if a space was found
      if (nextSpace && !availableMoves.some(move => move.id === nextSpace.id)) {
        availableMoves.push(nextSpace);
        console.log(`MoveLogicBase: Added move: ${nextSpace.name}, ID: ${nextSpace.id}`);
      }
    }
    
    // CRITICAL FIX: Handle special case for dice roll spaces
    if (isDiceRollSpace) {
      console.log(`MoveLogicBase: This space requires a dice roll to determine next moves`);
      // If we have dice roll requirements but ALSO have direct moves available,
      // we should return both the available moves and the dice roll indicator
      if (availableMoves.length > 0) {
        console.log(`MoveLogicBase: Found ${availableMoves.length} direct moves AND dice roll requirements`);
        // Let the player either choose a direct move or roll the dice for more options
        return availableMoves;
      }
      
      // Get visit type using consistent method
      const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
      const visitType = hasVisited ? 'subsequent' : 'first';
      // Mark this space as requiring a dice roll
      return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
    }
    
    return availableMoves;
  };
  
  // Expose the class to the global scope
  window.MoveLogicBase = MoveLogicBase;
})();

console.log('MoveLogicBase.js code execution finished');