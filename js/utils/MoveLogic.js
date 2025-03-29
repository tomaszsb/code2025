// MoveLogic.js - Utility for handling different types of moves in the game
console.log('MoveLogic.js file is being processed');

window.MoveLogic = {
  // Method to get all available moves for a player
  getAvailableMoves(gameState, player) {
    // This will be the main method that coordinates different types of move logic
    const currentSpace = gameState.spaces.find(s => s.id === player.position);
    if (!currentSpace) return [];
    
    console.log('MoveLogic: Getting moves for space:', currentSpace.name);
    
    // Special case for ARCH-INITIATION on subsequent visit - force dice roll
    if (currentSpace.name === 'ARCH-INITIATION') {
      // Check if this is a subsequent visit
      const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
      const visitType = hasVisited ? 'subsequent' : 'first';
      
      // Force dice roll for ARCH-INITIATION on subsequent visit for testing
      if (visitType === 'subsequent') {
        console.log('MoveLogic: ARCH-INITIATION on subsequent visit - forcing dice roll');
        return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
      }
    }
    
    // Check for special case spaces that have custom logic
    if (this.hasSpecialCaseLogic(currentSpace.name)) {
      console.log('MoveLogic: Using special case logic for', currentSpace.name);
      return this.handleSpecialCaseSpace(gameState, player, currentSpace);
    }
    
    // Get standard moves from CSV data
    const result = this.getSpaceDependentMoves(gameState, player, currentSpace);
    
    // Check if result indicates that dice roll is needed
    if (result && typeof result === 'object' && result.requiresDiceRoll) {
      console.log('MoveLogic: Space requires dice roll for movement');
      return { requiresDiceRoll: true, spaceName: result.spaceName, visitType: result.visitType };
    }
    
    // Standard case - array of available moves
    console.log('MoveLogic: Space-dependent moves count:', result.length);
    return result;
  },
  
  // Helper method to determine if a space has special case logic
  hasSpecialCaseLogic(spaceName) {
    const specialCaseSpaces = ['ARCH-INITIATION', 'PM-DECISION-CHECK', 'REG-FDNY-FEE-REVIEW'];
    return specialCaseSpaces.includes(spaceName);
  },
  
  // Handle special case spaces with custom logic
  handleSpecialCaseSpace(gameState, player, currentSpace) {
    // Implementation for each special case
    switch (currentSpace.name) {
      case 'ARCH-INITIATION':
        return this.handleArchInitiation(gameState, player, currentSpace);
      case 'PM-DECISION-CHECK':
        return this.handlePmDecisionCheck(gameState, player, currentSpace);
      case 'REG-FDNY-FEE-REVIEW':
        return this.handleFdnyFeeReview(gameState, player, currentSpace);
      default:
        return [];
    }
  },
  
  // Standard moves based purely on CSV data
  getSpaceDependentMoves(gameState, player, currentSpace) {
    // Get visit type for the current space
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log('MoveLogic: Visit type for', currentSpace.name, 'is', visitType);
    
    // Find all spaces with the same name
    const spacesWithSameName = gameState.spaces.filter(s => s.name === currentSpace.name);
    
    // Find the one with the matching visit type
    const spaceForVisitType = spacesWithSameName.find(s => 
      s.visitType.toLowerCase() === visitType.toLowerCase()
    );
    
    // Use the right space or fall back to current one
    const spaceToUse = spaceForVisitType || currentSpace;
    
    console.log('MoveLogic: Using space with ID', spaceToUse.id, 'for moves');
    
    // Filter out special patterns from nextSpaces
    const specialPatterns = [
      'Outcome from rolled dice',
      'Option from first visit'
    ];
    
    const availableMoves = [];
    let hasSpecialPattern = false;
    let isDiceRollSpace = false;
    
    // Process each next space
    for (const nextSpaceName of spaceToUse.nextSpaces) {
      // Skip empty space names
      if (!nextSpaceName || nextSpaceName.trim() === '') continue;
      
      // Check if this is a special pattern
      if (specialPatterns.some(pattern => nextSpaceName.includes(pattern))) {
        hasSpecialPattern = true;
        console.log('MoveLogic: Found special pattern in next space:', nextSpaceName);
        
        // Check if this is a dice roll space
        if (nextSpaceName.includes('Outcome from rolled dice')) {
          isDiceRollSpace = true;
          console.log('MoveLogic: This is a dice roll space');
        }
        
        continue; // Skip this entry
      }
      
      // Get base name without explanatory text
      const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
      
      console.log('MoveLogic: Processing next space:', cleanedSpaceName);
      
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
          console.log('MoveLogic: Added move:', nextSpace.name, nextSpace.id);
        }
      } else {
        console.log('MoveLogic: No matching space found for:', cleanedSpaceName);
      }
    }
    
    // Handle special case for dice roll spaces
    if (isDiceRollSpace) {
      console.log('MoveLogic: This space requires a dice roll to determine next moves');
      // Mark this space as requiring a dice roll
      return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
    }
    
    // Handle special case where we had special patterns but no valid moves
    if (hasSpecialPattern && availableMoves.length === 0 && !isDiceRollSpace) {
      console.log('MoveLogic: Special case detected with no valid moves - applying fallback logic');
      // For now, just return an empty array
    }
    
    return availableMoves;
  },
  
  // Special case handlers
  handleArchInitiation(gameState, player, currentSpace) {
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log('MoveLogic: ARCH-INITIATION visit type is:', visitType);
    console.log('MoveLogic: Player visited spaces:', player.visitedSpaces);
    console.log('MoveLogic: Current position:', player.position);
    
    // Read the next spaces directly from the CSV data
    const rawNextSpaces = [
      currentSpace.rawSpace1, 
      currentSpace.rawSpace2, 
      currentSpace.rawSpace3, 
      currentSpace.rawSpace4, 
      currentSpace.rawSpace5
    ].filter(space => space && space.trim() !== '' && space !== 'n/a');
    
    console.log('MoveLogic: Raw next spaces from CSV:', rawNextSpaces);
    
    // Process special patterns in the next spaces
    const specialPatterns = [
      'Outcome from rolled dice',
      'Option from first visit'
    ];
    
    // Check if any of the next spaces contain special patterns
    const hasSpecialPattern = rawNextSpaces.some(space => 
      specialPatterns.some(pattern => space.includes(pattern))
    );
    
    if (hasSpecialPattern) {
      console.log('MoveLogic: Special pattern detected in next spaces');
      
      // For first visit with special patterns, we still need to provide the ARCH-FEE-REVIEW move
      if (visitType.toLowerCase() === 'first') {
        console.log('MoveLogic: First visit with special pattern - looking for ARCH-FEE-REVIEW');
        
        // Look for ARCH-FEE-REVIEW space directly
        const archFeeReviewSpaces = gameState.spaces.filter(s => 
          s.name === 'ARCH-FEE-REVIEW'
        );
        
        if (archFeeReviewSpaces.length > 0) {
          // Get the right visit type
          const hasVisitedFeeReview = gameState.hasPlayerVisitedSpace(player, 'ARCH-FEE-REVIEW');
          const feeReviewVisitType = hasVisitedFeeReview ? 'subsequent' : 'first';
          
          // Find the right version 
          const nextSpace = archFeeReviewSpaces.find(s => 
            s.visitType.toLowerCase() === feeReviewVisitType.toLowerCase()
          ) || archFeeReviewSpaces[0];
          
          console.log('MoveLogic: Found ARCH-FEE-REVIEW space for special pattern:', nextSpace.id);
          return [nextSpace];
        }
      }
      
      // For subsequent visits with special patterns, we'll need dice roll logic in the future
      if (visitType.toLowerCase() === 'subsequent') {
        console.log('MoveLogic: Subsequent visit with special pattern - dice roll needed');
        // For now, no moves available for this case
        return [];
      }
    }
    
    // For normal (non-special) next spaces, process them directly
    const availableMoves = [];
    
    for (const rawSpaceName of rawNextSpaces) {
      // Skip special patterns
      if (specialPatterns.some(pattern => rawSpaceName.includes(pattern))) {
        continue;
      }
      
      // Extract the base space name
      const cleanedSpaceName = gameState.extractSpaceName(rawSpaceName);
      console.log('MoveLogic: Processing raw space name:', rawSpaceName, '-> cleaned:', cleanedSpaceName);
      
      // Find spaces that match this name
      const matchingSpaces = gameState.spaces.filter(s => {
        const extractedName = gameState.extractSpaceName(s.name);
        const isMatch = extractedName === cleanedSpaceName || 
                       s.name.includes(cleanedSpaceName) || 
                       cleanedSpaceName.includes(extractedName);
        return isMatch;
      });
      
      console.log('MoveLogic: Found', matchingSpaces.length, 'matching spaces for', cleanedSpaceName);
      
      if (matchingSpaces.length > 0) {
        // Determine visit type
        const hasVisitedNextSpace = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const nextVisitType = hasVisitedNextSpace ? 'subsequent' : 'first';
        
        // Find the right version
        const nextSpace = matchingSpaces.find(s => 
          s.visitType.toLowerCase() === nextVisitType.toLowerCase()
        ) || matchingSpaces[0];
        
        // Add to available moves
        availableMoves.push(nextSpace);
        console.log('MoveLogic: Added move from CSV data:', nextSpace.name, nextSpace.id);
      }
    }
    
    // If we found available moves, return them
    if (availableMoves.length > 0) {
      console.log('MoveLogic: Returning', availableMoves.length, 'moves for ARCH-INITIATION');
      return availableMoves;
    }
    
    // Special fallback for ARCH-INITIATION first visit when no moves found
    if (visitType.toLowerCase() === 'first' && availableMoves.length === 0) {
      console.log('MoveLogic: No moves found for ARCH-INITIATION first visit, using fallback');
      
      // Look for ARCH-FEE-REVIEW as a fallback
      const archFeeReviewSpaces = gameState.spaces.filter(s => 
        s.name === 'ARCH-FEE-REVIEW'
      );
      
      if (archFeeReviewSpaces.length > 0) {
        const nextSpace = archFeeReviewSpaces.find(s => 
          s.visitType.toLowerCase() === 'first'
        ) || archFeeReviewSpaces[0];
        
        console.log('MoveLogic: Using fallback ARCH-FEE-REVIEW:', nextSpace.id);
        return [nextSpace];
      }
    }
    
    // If no moves found and fallbacks fail, return empty array
    console.log('MoveLogic: No moves found for ARCH-INITIATION');
    return [];
  },
  
  handlePmDecisionCheck(gameState, player, currentSpace) {
    console.log('MoveLogic: Special case for PM-DECISION-CHECK');
    console.log('MoveLogic: Player position:', player.position);
    console.log('MoveLogic: Visit type:', currentSpace.visitType);
    
    // Read the next spaces directly from the CSV data stored in the space object
    const rawNextSpaces = [
      currentSpace.rawSpace1, 
      currentSpace.rawSpace2, 
      currentSpace.rawSpace3, 
      currentSpace.rawSpace4, 
      currentSpace.rawSpace5
    ].filter(space => space && space.trim() !== '' && space !== 'n/a');
    
    console.log('MoveLogic: Raw next spaces from CSV:', rawNextSpaces);
    
    const availableMoves = [];
    
    // Process each raw next space from the CSV
    for (const rawSpaceName of rawNextSpaces) {
      // Extract the base space name (before any explanatory text)
      const cleanedSpaceName = gameState.extractSpaceName(rawSpaceName);
      console.log('MoveLogic: Processing raw space name:', rawSpaceName, '-> cleaned:', cleanedSpaceName);
      
      // Find spaces that match this name
      const matchingSpaces = gameState.spaces.filter(s => {
        const extractedName = gameState.extractSpaceName(s.name);
        const isMatch = extractedName === cleanedSpaceName || 
                       s.name.includes(cleanedSpaceName) || 
                       cleanedSpaceName.includes(extractedName);
        
        if (isMatch) {
          console.log('MoveLogic: Found matching space:', s.name, s.id);
        }
        
        return isMatch;
      });
      
      console.log('MoveLogic: Found', matchingSpaces.length, 'matching spaces for', cleanedSpaceName);
      
      if (matchingSpaces.length > 0) {
        // Determine if player has visited this space before
        const hasVisitedNextSpace = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const nextVisitType = hasVisitedNextSpace ? 'subsequent' : 'first';
        
        // Find the right version of the space based on visit type
        const nextSpace = matchingSpaces.find(s => 
          s.visitType.toLowerCase() === nextVisitType.toLowerCase()
        ) || matchingSpaces[0];
        
        // Add to available moves if not already in the list
        if (!availableMoves.some(move => move.id === nextSpace.id)) {
          availableMoves.push(nextSpace);
          console.log('MoveLogic: Added PM-DECISION-CHECK move:', nextSpace.name, nextSpace.id);
        }
      } else {
        console.log('MoveLogic: Could not find space for:', cleanedSpaceName);
      }
    }
    
    console.log('MoveLogic: PM-DECISION-CHECK moves count:', availableMoves.length);
    return availableMoves;
  },
  
  handleFdnyFeeReview(gameState, player, currentSpace) {
    // This is a complex case with multiple conditions from the CSV
    // For simplicity, we'll use the standard space logic for now
    console.log('MoveLogic: Using standard logic for REG-FDNY-FEE-REVIEW');
    return this.getSpaceDependentMoves(gameState, player, currentSpace);
  },
  
  // Utility method to get move details for display
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
};

console.log('MoveLogic.js execution complete');