// MoveLogicVisitTypes.js - Visit type resolution logic
console.log('MoveLogicVisitTypes.js file is beginning to be used');

/**
 * MoveLogicVisitTypes - Extends MoveLogicSpaceTypes with visit type resolution
 * 
 * This module enhances the MoveLogicSpaceTypes with methods to resolve spaces
 * based on visit type and handle visit-type dependent moves.
 */
(function() {
  // Make sure MoveLogicSpaceTypes is loaded
  if (!window.MoveLogicSpaceTypes) {
    console.error('MoveLogicVisitTypes: MoveLogicSpaceTypes not found. Make sure to include MoveLogicSpaceTypes.js first.');
    return;
  }
  
  // Define the MoveLogicVisitTypes class
  function MoveLogicVisitTypes() {
    // Call the parent constructor
    window.MoveLogicSpaceTypes.call(this);
    
    console.log('MoveLogicVisitTypes: Constructor initialized');
    console.log('MoveLogicVisitTypes: Visit type resolution system added. [2025-05-02]');
    console.log('MoveLogicVisitTypes: Initialized successfully');
  }
  
  // Inherit from MoveLogicSpaceTypes
  MoveLogicVisitTypes.prototype = Object.create(window.MoveLogicSpaceTypes.prototype);
  MoveLogicVisitTypes.prototype.constructor = MoveLogicVisitTypes;
  
  /**
   * Helper method to resolve the appropriate space based on visit type with proper fallbacks
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get the visit type for
   * @param {string} spaceName - The name of the space to resolve
   * @param {string} explicitVisitType - Optional explicit visit type to override detection
   * @returns {Object|null} - The resolved space object or null if not found
   */
  MoveLogicVisitTypes.prototype.resolveSpaceForVisitType = function(gameState, player, spaceName, explicitVisitType) {
    console.log(`MoveLogicVisitTypes: Resolving space for visit type - spaceName: ${spaceName}`);
    
    // Get normalized space name
    const normalizedName = gameState.extractSpaceName(spaceName);
    
    // Find all spaces with this name
    const matchingSpaces = gameState.spaces.filter(s => 
      gameState.extractSpaceName(s.name) === normalizedName);
    
    if (matchingSpaces.length === 0) {
      console.warn(`MoveLogicVisitTypes: No spaces found with name: ${normalizedName}`);
      return null;
    }
    
    // Determine visit type if not explicitly provided
    let visitType = explicitVisitType;
    if (!visitType) {
      const hasVisited = gameState.hasPlayerVisitedSpace(player, normalizedName);
      visitType = hasVisited ? 'subsequent' : 'first';
    }
    
    // Logging for debugging
    console.log(`MoveLogicVisitTypes: Resolving space for "${normalizedName}" with visit type: ${visitType}`);
    
    // Try to find the exact match first
    let resolvedSpace = matchingSpaces.find(s => 
      s.visitType && s.visitType.toLowerCase() === visitType.toLowerCase());
    
    // If not found, try the opposite visit type
    if (!resolvedSpace) {
      const oppositeType = visitType.toLowerCase() === 'first' ? 'subsequent' : 'first';
      console.log(`MoveLogicVisitTypes: Exact visit type match not found, trying ${oppositeType}`);
      resolvedSpace = matchingSpaces.find(s => 
        s.visitType && s.visitType.toLowerCase() === oppositeType.toLowerCase());
    }
    
    // If still not found, use the first available space
    if (!resolvedSpace && matchingSpaces.length > 0) {
      console.log(`MoveLogicVisitTypes: No visit type match found, using first available space`);
      resolvedSpace = matchingSpaces[0];
    }
    
    if (resolvedSpace) {
      console.log(`MoveLogicVisitTypes: Resolved space ID: ${resolvedSpace.id}, Visit Type: ${resolvedSpace.visitType}`);
    } else {
      console.warn(`MoveLogicVisitTypes: Failed to resolve any space for "${normalizedName}"`);
    }
    
    return resolvedSpace;
  };
  
  /**
   * Override getSpaceDependentMoves to add visit type resolution
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  MoveLogicVisitTypes.prototype.getSpaceDependentMoves = function(gameState, player, currentSpace) {
    console.log(`MoveLogicVisitTypes: Getting space-dependent moves for ${currentSpace.name}`);
    
    // Use our helper function to resolve the appropriate space based on visit type
    const spaceToUse = this.resolveSpaceForVisitType(gameState, player, currentSpace.name) || currentSpace;
    
    console.log(`MoveLogicVisitTypes: Using space with ID ${spaceToUse.id} for moves`);
    
    // Get space types to determine if this is a card effect space
    const spaceTypes = this.getSpaceTypes(gameState, player, spaceToUse);
    
    const availableMoves = [];
    let hasSpecialPattern = false;
    let isDiceRollSpace = false;
    
    // Process each next space
    for (const nextSpaceName of spaceToUse.nextSpaces) {
      // Skip empty space names
      if (!nextSpaceName || nextSpaceName.trim() === '') continue;
      
      // Check if this is a negotiate option
      if (nextSpaceName.toLowerCase().includes('negotiate')) {
        console.log(`MoveLogicVisitTypes: Found negotiate option: ${nextSpaceName}`);
        // We don't add negotiate options to available moves, as they're handled by a separate UI element
        continue;
      }
      
      // Check if this is a special pattern
      if (this.specialPatterns.some(pattern => nextSpaceName.includes(pattern))) {
        hasSpecialPattern = true;
        console.log(`MoveLogicVisitTypes: Found special pattern in next space: ${nextSpaceName}`);
        
        // Handle "Option from first visit" pattern
        if (nextSpaceName.includes('Option from first visit')) {
          // Only process this space if it's the player's first visit
          const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
          if (!hasVisited) {
            console.log(`MoveLogicVisitTypes: Processing "Option from first visit" for first-time visitor`);
            // Extract the actual space name from the pattern
            const optionMatch = nextSpaceName.match(/Option from first visit: (.+)/);
            if (optionMatch && optionMatch[1]) {
              const optionSpaceName = optionMatch[1].trim();
              // Resolve this space using our helper
              const optionSpace = this.resolveSpaceForVisitType(gameState, player, optionSpaceName);
              if (optionSpace) {
                availableMoves.push(optionSpace);
                console.log(`MoveLogicVisitTypes: Added first visit option: ${optionSpace.name}, ID: ${optionSpace.id}`);
              }
            }
          } else {
            console.log(`MoveLogicVisitTypes: Skipping "Option from first visit" for subsequent visitor`);
          }
          continue;
        }
        
        // Check if this is a dice roll space
        if (nextSpaceName.includes('Outcome from rolled dice')) {
          isDiceRollSpace = true;
          console.log(`MoveLogicVisitTypes: This is a dice roll space`);
        }
        
        continue; // Skip this entry
      }
      
      // Get base name without explanatory text
      const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
      
      console.log(`MoveLogicVisitTypes: Processing next space: ${cleanedSpaceName}`);
      
      // Use our helper function to resolve the appropriate space
      const nextSpace = this.resolveSpaceForVisitType(gameState, player, cleanedSpaceName);
      
      // Add to available moves if not already in the list and if a space was found
      if (nextSpace && !availableMoves.some(move => move.id === nextSpace.id)) {
        availableMoves.push(nextSpace);
        console.log(`MoveLogicVisitTypes: Added move: ${nextSpace.name}, ID: ${nextSpace.id}`);
      } else if (!nextSpace) {
        console.log(`MoveLogicVisitTypes: No space resolved for: ${cleanedSpaceName}`);
      } else {
        console.log(`MoveLogicVisitTypes: Space already in availableMoves, not adding duplicate`);
      }
    }
    
    // Handle special case for dice roll spaces
    if (isDiceRollSpace) {
      console.log(`MoveLogicVisitTypes: This space requires a dice roll to determine next moves`);
      // Get visit type using consistent method
      const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
      const visitType = hasVisited ? 'subsequent' : 'first';
      
      // If we have dice roll requirements but ALSO have direct moves available,
      // we should return both the available moves and the dice roll indicator
      if (availableMoves.length > 0) {
        console.log(`MoveLogicVisitTypes: Found ${availableMoves.length} direct moves AND dice roll requirements`);
        // Let the player either choose a direct move or roll the dice for more options
        return availableMoves;
      }
      
      // Mark this space as requiring a dice roll
      return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
    }
    
    // Handle special case where we had special patterns but no valid moves
    if (hasSpecialPattern && availableMoves.length === 0 && !isDiceRollSpace) {
      console.log(`MoveLogicVisitTypes: Special case detected with no valid moves - looking for fallback options`);
      
      // Look for general fallback spaces (like "GO BACK" spaces) if configured in the future
      // For now, log a warning and return empty array
      console.warn(`MoveLogicVisitTypes: No fallback options found for special pattern with no valid moves`);
    }
    
    console.log(`MoveLogicVisitTypes: Returning ${availableMoves.length} available moves`);
    return availableMoves;
  };
  
  // Expose the class to the global scope
  window.MoveLogicVisitTypes = MoveLogicVisitTypes;
})();

console.log('MoveLogicVisitTypes.js code execution finished');