// MoveLogic.js - Legacy compatibility layer for MoveLogicManager
console.log('MoveLogic.js file is beginning to be used');

/**
 * This file provides backward compatibility for code that still uses the
 * window.MoveLogic global object. All calls are forwarded to the new
 * MoveLogicManager implementation.
 * 
 * Note: This file should not be used directly in new code.
 * Use MoveLogicManager instead.
 */

// The actual implementation is set up by MoveLogicBackwardCompatibility.js
// This file just provides a placeholder until that's loaded

// Initial implementation with proper fallback using space data from CSV
window.MoveLogic = window.MoveLogic || {
  getAvailableMoves: function(gameState, player) {
    console.log('MoveLogic: Using data-driven fallback implementation for getAvailableMoves');
    
    // Get the player's current space
    const currentSpace = gameState.findSpaceById(player.position);
    if (!currentSpace) {
      console.log('MoveLogic: Player position not found, no moves available');
      return [];
    }
    
    console.log(`MoveLogic: Player is on space ${currentSpace.name}, checking nextSpaces from CSV`);
    
    // Get available moves from the nextSpaces array (derived from CSV)
    const availableMoves = [];
    
    // Process each potential next space from the space's nextSpaces property (from CSV)
    for (const nextSpaceName of currentSpace.nextSpaces || []) {
      // Skip empty space names or special patterns
      if (!nextSpaceName || nextSpaceName.trim() === '') continue;
      if (nextSpaceName.includes('Outcome from rolled dice')) continue;
      if (nextSpaceName.includes('Option from first visit')) continue;
      if (nextSpaceName.toLowerCase().includes('negotiate')) continue;
      
      console.log(`MoveLogic: Processing potential next space: ${nextSpaceName}`);
      
      // Get base name
      const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
      
      // Find corresponding space objects
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === cleanedSpaceName);
      
      // If we found matching spaces
      if (matchingSpaces.length > 0) {
        console.log(`MoveLogic: Found ${matchingSpaces.length} matching spaces for ${cleanedSpaceName}`);
        
        // Determine if player has visited this space before
        const hasVisited = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const visitType = hasVisited ? 'subsequent' : 'first';
        
        // Try to find the exact match for visit type
        let nextSpace = matchingSpaces.find(s => 
          s.visitType && s.visitType.toLowerCase() === visitType.toLowerCase());
        
        // If no exact match, use any available space with this name
        if (!nextSpace && matchingSpaces.length > 0) {
          nextSpace = matchingSpaces[0];
        }
        
        // Add to available moves if not already in the list
        if (nextSpace && !availableMoves.some(move => move.id === nextSpace.id)) {
          console.log(`MoveLogic: Adding ${nextSpace.name} to available moves`);
          availableMoves.push(nextSpace);
        }
      }
    }
    
    // Special case for known problematic spaces
    // Only fix specific issues that are well-documented
    if (currentSpace.name.includes('OWNER-SCOPE-INITIATION') && player.cards && player.cards.length > 0) {
      // Check if OWNER-FUND-INITIATION is already in available moves
      const hasFundInitiation = availableMoves.some(move => move.name.includes('OWNER-FUND-INITIATION'));
      
      // If not already available, try to add it
      if (!hasFundInitiation) {
        console.log('MoveLogic: OWNER-FUND-INITIATION should be available after drawing cards');
        
        // Try to find OWNER-FUND-INITIATION using the same method as above
        const fundSpaces = gameState.spaces.filter(s => s.name.includes('OWNER-FUND-INITIATION'));
        if (fundSpaces.length > 0) {
          // Use the first visit version if available
          const fundSpace = fundSpaces.find(s => s.visitType === 'First') || fundSpaces[0];
          console.log(`MoveLogic: Adding missing OWNER-FUND-INITIATION to available moves: ${fundSpace.name}`);
          availableMoves.push(fundSpace);
        }
      }
    }
    
    console.log(`MoveLogic: Returning ${availableMoves.length} available moves from data-driven fallback`);
    return availableMoves;
  },
  hasSpecialCaseLogic: function(spaceName) {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return false;
  },
  handleSpecialCaseSpace: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  getSpaceDependentMoves: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  handleArchInitiation: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  handlePmDecisionCheck: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  handleFdnyFeeReview: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  getMoveDetails: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return '';
  }
};

console.log('MoveLogic.js code execution finished');
