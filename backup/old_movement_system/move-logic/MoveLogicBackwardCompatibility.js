// MoveLogicBackwardCompatibility.js - Compatibility layer for old code
console.log('MoveLogicBackwardCompatibility.js file is beginning to be used');

/**
 * MoveLogicBackwardCompatibility - Backward compatibility layer for legacy code
 * 
 * This module maintains the window.MoveLogic global object that was used in legacy code
 * and forwards the calls to the new MoveLogicManager implementation.
 * 
 * FIXED: Implemented getAvailableMoves method to use a data-driven approach (2025-05-08)
 * FIXED: Made sure backward compatibility works with the new manager pattern (2025-05-08)
 */
(function() {
  // Define the MoveLogicBackwardCompatibility class
  function MoveLogicBackwardCompatibility(manager) {
    console.log('MoveLogicBackwardCompatibility: Initializing compatibility layer');
    this.manager = manager;
    
    // Create legacy compatibility object that forwards to the manager
    window.MoveLogic = {
      // Implement getAvailableMoves directly using data-driven approach
      // rather than trying to delegate to a method that doesn't exist
      getAvailableMoves: (gameState, player) => {
        console.log('MoveLogicBackwardCompatibility: getAvailableMoves method is being used');
        
        // Get the player's current space
        const currentSpace = gameState.findSpaceById(player.position);
        if (!currentSpace) {
          console.log('MoveLogicBackwardCompatibility: Player position not found, no moves available');
          return [];
        }
        
        console.log(`MoveLogicBackwardCompatibility: Player is on space ${currentSpace.name}, checking nextSpaces from CSV`);
        
        // Get available moves from the nextSpaces array (derived from CSV)
        const availableMoves = [];
        
        // Process each potential next space from the space's nextSpaces property (from CSV)
        for (const nextSpaceName of currentSpace.nextSpaces || []) {
          // Skip empty space names or special patterns
          if (!nextSpaceName || nextSpaceName.trim() === '') continue;
          if (nextSpaceName.includes('Outcome from rolled dice')) continue;
          if (nextSpaceName.includes('Option from first visit')) continue;
          if (nextSpaceName.toLowerCase().includes('negotiate')) continue;
          
          console.log(`MoveLogicBackwardCompatibility: Processing potential next space: ${nextSpaceName}`);
          
          // Get base name
          const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
          
          // Find corresponding space objects
          const matchingSpaces = gameState.spaces.filter(s => 
            gameState.extractSpaceName(s.name) === cleanedSpaceName);
          
          // If we found matching spaces
          if (matchingSpaces.length > 0) {
            console.log(`MoveLogicBackwardCompatibility: Found ${matchingSpaces.length} matching spaces for ${cleanedSpaceName}`);
            
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
              console.log(`MoveLogicBackwardCompatibility: Adding ${nextSpace.name} to available moves`);
              availableMoves.push(nextSpace);
            }
          }
        }
        
        // Check for special case handling
      console.log("MoveLogicBackwardCompatibility DEBUG: Value of 'this.manager' inside getAvailableMoves:", this.manager);
      console.log("MoveLogicBackwardCompatibility DEBUG: Value of 'manager' (from constructor closure) inside getAvailableMoves:", manager);

      // Try with 'manager' directly from closure
      if (manager && manager.hasSpecialCaseLogic && manager.hasSpecialCaseLogic(currentSpace.name)) {
      // --- END CHANGE ---
          console.error("BACKWARD_COMPAT: Current Space for PM_DECISION_CHECK: " + currentSpace.name + ", ID: " + currentSpace.id + ", VisitType: " + currentSpace.visitType);
          console.error("BACKWARD_COMPAT: Player originalSpaceId before special case: ", this.manager.getPlayerGameProperty ? this.manager.getPlayerGameProperty(gameState, player, 'originalSpaceId') : "manager.getPlayerGameProperty missing");
          console.log(`MoveLogicBackwardCompatibility: Detected special case for space ${currentSpace.name}, forwarding to manager`);
          
          // Forward to special case handler if it exists
          if (manager.handleSpecialCaseSpace) {
            const specialMoves = manager.handleSpecialCaseSpace(gameState, player, currentSpace);
            console.error("BACKWARD_COMPAT: Special moves returned from manager: ", specialMoves ? specialMoves.map(m => ({name: m.name, id: m.id, fromOrig: m.fromOriginalSpace})) : "No special moves");
            if (specialMoves && specialMoves.length > 0) {
              console.log(`MoveLogicBackwardCompatibility: Adding ${specialMoves.length} special case moves`);
              
              // Add all special moves not already in the list
              specialMoves.forEach(specialMove => {
                if (!availableMoves.some(move => move.id === specialMove.id)) {
                  availableMoves.push(specialMove);
                }
              });
            }
          }
        }
        
        console.log(`MoveLogicBackwardCompatibility: Returning ${availableMoves.length} available moves`);
        console.log('MoveLogicBackwardCompatibility: getAvailableMoves method completed');
        return availableMoves;
      },
      hasSpecialCaseLogic: (spaceName) => 
        this.manager.hasSpecialCaseLogic(spaceName),
      handleSpecialCaseSpace: (gameState, player, currentSpace) => 
        this.manager.handleSpecialCaseSpace(gameState, player, currentSpace),
      getSpaceDependentMoves: (gameState, player, currentSpace) => 
        this.manager.getSpaceDependentMoves(gameState, player, currentSpace),
      handleArchInitiation: (gameState, player, currentSpace) => 
        this.manager.handleArchInitiation(gameState, player, currentSpace),
      handlePmDecisionCheck: (gameState, player, currentSpace) => 
        this.manager.handlePmDecisionCheck(gameState, player, currentSpace),
      handleFdnyFeeReview: (gameState, player, currentSpace) => 
        this.manager.handleFdnyFeeReview(gameState, player, currentSpace),
      getMoveDetails: (space) => 
        this.manager.getMoveDetails ? this.manager.getMoveDetails(space) : null
    };
    
    console.log('MoveLogicBackwardCompatibility: Compatibility layer initialized');
  }
  
  // Expose the class to the global scope
  window.MoveLogicBackwardCompatibility = MoveLogicBackwardCompatibility;
})();

console.log('MoveLogicBackwardCompatibility.js code execution finished - Fixed getAvailableMoves implementation');
