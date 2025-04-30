// MoveLogicBase.js - Core move logic and calculations
console.log('MoveLogicBase.js file is being processed');

/**
 * MoveLogicBase - Core logic for game movements
 * 
 * This module handles the core functionality of movement logic including:
 * - Getting available moves for a player
 * - Handling space-dependent moves
 * - Processing special patterns in spaces
 */
class MoveLogicBase {
  constructor() {
    console.log('MoveLogicBase: Constructor initialized');
    
    // Configuration for move logic
    this.specialPatterns = [
      'Outcome from rolled dice',
      'Option from first visit'
    ];
    
    console.log('MoveLogicBase: Initialized successfully');
  }
  
  /**
   * Get all available moves for a player
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  getAvailableMoves(gameState, player) {
    // Get the player's current space
    const currentSpace = gameState.spaces.find(s => s.id === player.position);
    if (!currentSpace) return [];
    
    console.log('MoveLogicBase: Getting moves for space:', currentSpace.name);
    
    // Special case for ARCH-INITIATION on subsequent visit - force dice roll
    if (currentSpace.name === 'ARCH-INITIATION') {
      // Check if this is a subsequent visit
      const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
      const visitType = hasVisited ? 'subsequent' : 'first';
      
      // Force dice roll for ARCH-INITIATION on subsequent visit for testing
      if (visitType === 'subsequent') {
        console.log('MoveLogicBase: ARCH-INITIATION on subsequent visit - forcing dice roll');
        return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
      }
    }
    
    // Check for special case spaces that have custom logic
    if (this.hasSpecialCaseLogic(currentSpace.name)) {
      console.log('MoveLogicBase: Using special case logic for', currentSpace.name);
      return this.handleSpecialCaseSpace(gameState, player, currentSpace);
    }
    
    // Get standard moves from space data
    const result = this.getSpaceDependentMoves(gameState, player, currentSpace);
    
    // Check if result indicates that dice roll is needed
    if (result && typeof result === 'object' && result.requiresDiceRoll) {
      console.log('MoveLogicBase: Space requires dice roll for movement');
      return { requiresDiceRoll: true, spaceName: result.spaceName, visitType: result.visitType };
    }
    
    // Standard case - array of available moves
    console.log('MoveLogicBase: Space-dependent moves count:', result.length);
    return result;
  }
  
  /**
   * Check if a space has special case logic
   * @param {string} spaceName - The name of the space to check
   * @returns {boolean} - True if space has special case logic
   */
  hasSpecialCaseLogic(spaceName) {
    const specialCaseSpaces = ['ARCH-INITIATION', 'PM-DECISION-CHECK', 'REG-FDNY-FEE-REVIEW'];
    return specialCaseSpaces.includes(spaceName);
  }
  
  /**
   * Handle special case spaces with custom logic
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  handleSpecialCaseSpace(gameState, player, currentSpace) {
    // This is just a dispatcher to the appropriate special case handler
    // The actual implementations are in MoveLogicSpecialCases.js
    // This method will be overridden by the special cases module
    console.log('MoveLogicBase: Default special case handler');
    return [];
  }
  
  /**
   * Get moves based on space data and visit type
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array|Object} - Array of available moves or object with dice roll requirement
   */
  getSpaceDependentMoves(gameState, player, currentSpace) {
    // Get visit type for the current space
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log('MoveLogicBase: Visit type for', currentSpace.name, 'is', visitType);
    
    // Find all spaces with the same name
    const spacesWithSameName = gameState.spaces.filter(s => s.name === currentSpace.name);
    
    // Find the one with the matching visit type
    const spaceForVisitType = spacesWithSameName.find(s => 
      s.visitType.toLowerCase() === visitType.toLowerCase()
    );
    
    // Use the right space or fall back to current one
    const spaceToUse = spaceForVisitType || currentSpace;
    
    console.log('MoveLogicBase: Using space with ID', spaceToUse.id, 'for moves');
    
    const availableMoves = [];
    let hasSpecialPattern = false;
    let isDiceRollSpace = false;
    
    // Process each next space
    for (const nextSpaceName of spaceToUse.nextSpaces) {
      // Skip empty space names
      if (!nextSpaceName || nextSpaceName.trim() === '') continue;
      
      // Check if this is a negotiate option
      if (nextSpaceName.toLowerCase().includes('negotiate')) {
        console.log('MoveLogicBase: Found negotiate option:', nextSpaceName);
        // We don't add negotiate options to available moves, as they're handled by a separate UI element
        continue;
      }
      
      // Check if this is a special pattern
      if (this.specialPatterns.some(pattern => nextSpaceName.includes(pattern))) {
        hasSpecialPattern = true;
        console.log('MoveLogicBase: Found special pattern in next space:', nextSpaceName);
        
        // Check if this is a dice roll space
        if (nextSpaceName.includes('Outcome from rolled dice')) {
          isDiceRollSpace = true;
          console.log('MoveLogicBase: This is a dice roll space');
        }
        
        continue; // Skip this entry
      }
      
      // Get base name without explanatory text
      const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
      
      console.log('MoveLogicBase: Processing next space:', cleanedSpaceName);
      
      // Find spaces with matching name
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === cleanedSpaceName
      );
      
      if (matchingSpaces.length > 0) {
        // Determine if the player has visited this space before
        const hasVisitedNextSpace = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const nextVisitType = hasVisitedNextSpace ? 'subsequent' : 'first';
        
        // Find the right version of the space
        const nextSpace = matchingSpaces.find(s => 
          s.visitType.toLowerCase() === nextVisitType.toLowerCase()
        ) || matchingSpaces[0];
        
        // Add to available moves if not already in the list
        if (!availableMoves.some(move => move.id === nextSpace.id)) {
          availableMoves.push(nextSpace);
          console.log('MoveLogicBase: Added move:', nextSpace.name, nextSpace.id);
        }
      } else {
        console.log('MoveLogicBase: No matching space found for:', cleanedSpaceName);
      }
    }
    
    // Handle special case for dice roll spaces
    if (isDiceRollSpace) {
      console.log('MoveLogicBase: This space requires a dice roll to determine next moves');
      // Mark this space as requiring a dice roll
      return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
    }
    
    // Handle special case where we had special patterns but no valid moves
    if (hasSpecialPattern && availableMoves.length === 0 && !isDiceRollSpace) {
      console.log('MoveLogicBase: Special case detected with no valid moves - applying fallback logic');
      // For now, just return an empty array
    }
    
    return availableMoves;
  }
  
  /**
   * Get move details for display
   * @param {Object} space - The space to get details for
   * @returns {string} - Formatted string of move details
   */
  getMoveDetails(space) {
    const details = [];
    
    // Add fee information if available
    if (space.Fee && space.Fee.trim() !== '') {
      details.push(`Fee: ${space.Fee}`);
    }
    
    // Add time information if available
    if (space.Time && space.Time.trim() !== '') {
      details.push(`Time: ${space.Time}`);
    }
    
    return details.join(', ');
  }
}

export { MoveLogicBase };
