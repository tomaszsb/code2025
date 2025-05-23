/**
 * MovementLogic.js
 * Higher-level movement logic for the Project Management Game
 * 
 * This module builds on MovementCore to provide game-specific
 * movement functionality, particularly for determining available moves
 */

console.log('MovementLogic.js file is beginning to be used');

class MovementLogic {
  constructor(gameStateManager, movementCore) {
    this.gameStateManager = gameStateManager;
    this.movementCore = movementCore;
    
    // Initialize with property descriptors for protection
    Object.defineProperties(this, {
      gameStateManager: {
        value: gameStateManager,
        writable: false,
        configurable: false
      },
      movementCore: {
        value: movementCore,
        writable: false,
        configurable: false
      }
    });
    
    console.log('MovementLogic: Initialized with protected properties');
  }
  
  /**
   * Get available moves for a player
   * @param {Object} player - Player to get moves for
   * @returns {Array|Object} Array of available moves or dice roll requirement object
   */
  getAvailableMoves(player) {
    if (!player) {
      console.error('MovementLogic: No player provided for getAvailableMoves');
      return [];
    }
    
    // Get current space
    const currentSpaceId = player.position;
    if (!currentSpaceId) {
      console.error('MovementLogic: Player has no position');
      return [];
    }
    
    // Get the current space data
    const currentSpace = this.gameStateManager.findSpaceById(currentSpaceId);
    if (!currentSpace) {
      console.error(`MovementLogic: Could not find space with id ${currentSpaceId}`);
      return [];
    }
    
    console.log(`MovementLogic: Getting available moves for ${player.name} at ${currentSpace.name}`);
    
    // Check if this is the PM-DECISION-CHECK space
    if (currentSpace.name === 'PM-DECISION-CHECK') {
      return this.getMovesForPMDecisionCheck(player, currentSpace);
    }
    
    // Check if dice roll is needed for this space
    if (this.movementCore.spaceRequiresDiceRoll(currentSpace, player)) {
      return {
        requiresDiceRoll: true,
        spaceName: currentSpace.name,
        visitType: this.movementCore.determineVisitType(player, currentSpace)
      };
    }
    
    // Standard case - get moves from space data
    return this.getStandardMoves(player, currentSpace);
  }
  
  /**
   * Get standard moves from a space
   * @param {Object} player - Player to get moves for
   * @param {Object} space - Space to get moves from
   * @returns {Array} Available moves
   */
  getStandardMoves(player, space) {
    const availableMoves = [];
    
    // Determine visit type (First or Subsequent)
    const visitType = this.movementCore.determineVisitType(player, space);
    
    // Check all numbered space columns in the CSV data
    for (let i = 1; i <= 5; i++) {
      // First try the raw properties, then fall back to the Space properties for compatibility
      const nextSpaceData = space[`rawSpace${i}`] || space[`Space ${i}`];
      if (nextSpaceData && nextSpaceData.trim() !== '') {
        // Extract the space name from the data
        const spaceName = this.movementCore.extractSpaceName(nextSpaceData);
        if (spaceName) {
          // Skip "RETURN TO YOUR SPACE" for first visits
          if (spaceName === 'RETURN TO YOUR SPACE' && visitType !== 'Subsequent') {
            continue;
          }
          
          // Skip "OWNER-DECISION-REVIEW" for first visits to PM-DECISION-CHECK
          if (spaceName === 'OWNER-DECISION-REVIEW' && visitType === 'First' && space.name === 'PM-DECISION-CHECK') {
            console.log(`MovementLogic: Filtering out OWNER-DECISION-REVIEW for first visit to ${space.name}`);
            continue;
          }
          
          // Find the space by name
          const nextSpace = this.gameStateManager.findSpaceByName(spaceName);
          if (nextSpace) {
            // Create move object
            availableMoves.push({
              id: nextSpace.id,
              name: nextSpace.name,
              description: nextSpaceData,
              visitType: this.movementCore.determineVisitType(player, nextSpace)
            });
          }
        }
      }
    }
    
    console.log(`MovementLogic: Found ${availableMoves.length} standard moves for ${space.name}`);
    return availableMoves;
  }
  
  /**
   * Get moves specifically for the PM-DECISION-CHECK space
   * @param {Object} player - Current player
   * @param {Object} space - PM-DECISION-CHECK space data
   * @returns {Array} Available moves for PM-DECISION-CHECK
   */
  getMovesForPMDecisionCheck(player, space) {
    // Standard moves from the space data
    const standardMoves = this.getStandardMoves(player, space);
    
    // Check if this is a subsequent visit (player has a main path history)
    const visitType = this.movementCore.determineVisitType(player, space);
    if (visitType !== 'Subsequent') {
      console.log('MovementLogic: First visit to PM-DECISION-CHECK, no return option needed');
      return standardMoves;
    }
    
    // Find the last main path space the player was on
    const lastMainPathSpace = this.movementCore.getLastMainPathSpace(player);
    if (!lastMainPathSpace) {
      console.log('MovementLogic: Could not determine last main path space');
      return standardMoves;
    }
    
    console.log(`MovementLogic: Last main path space was ${lastMainPathSpace.name}`);
    
    // Check if player can return to main path
    if (this.movementCore.playerHasUsedCheatBypass(player)) {
      console.log('MovementLogic: Player has used CHEAT-BYPASS, no return possible');
      return standardMoves;
    }
    
    // Get next moves from the last main path space
    const nextMainPathMoves = this.getNextMainPathMoves(lastMainPathSpace);
    if (!nextMainPathMoves || nextMainPathMoves.length === 0) {
      console.log('MovementLogic: No next main path moves found');
      return standardMoves;
    }
    
    // Add these moves to the standard moves, marking them as "fromMainPath"
    const combinedMoves = [...standardMoves];
    
    nextMainPathMoves.forEach(move => {
      // Add additional metadata to these moves
      move.fromMainPath = true;
      move.originalSpaceName = lastMainPathSpace.name;
      
      // Add to combined moves if not already present
      if (!combinedMoves.some(m => m.id === move.id)) {
        combinedMoves.push(move);
      }
    });
    
    console.log(`MovementLogic: Added ${nextMainPathMoves.length} main path moves to PM-DECISION-CHECK options`);
    return combinedMoves;
  }
  
  /**
   * Get next available moves from a specific space
   * @param {Object} space - Space to get next moves from
   * @returns {Array} Available next moves from this space
   */
  getNextMainPathMoves(space) {
    // This function gets the next moves that would be available if the player was on this space
    
    // Get all potential next spaces from the space data
    const potentialSpaces = [];
    
    // Check all numbered space columns in the CSV data
    for (let i = 1; i <= 5; i++) {
      const nextSpaceData = space[`Space ${i}`];
      if (nextSpaceData && nextSpaceData.trim() !== '') {
        // Extract the space name from the data (which might include descriptions)
        const spaceName = this.movementCore.extractSpaceName(nextSpaceData);
        if (spaceName) {
          // Find the space by name
          const nextSpace = this.gameStateManager.findSpaceByName(spaceName);
          if (nextSpace) {
            potentialSpaces.push({
              space: nextSpace,
              description: nextSpaceData
            });
          }
        }
      }
    }
    
    // Filter to remove any spaces that aren't valid main path spaces
    // (e.g., don't include PM-DECISION-CHECK or CHEAT-BYPASS)
    const mainPathSpaces = potentialSpaces.filter(item => 
      item.space.name !== 'PM-DECISION-CHECK' && 
      item.space.name !== 'CHEAT-BYPASS' &&
      !this.isReturnOption(item.space.name)
    );
    
    // Convert spaces to move objects
    return mainPathSpaces.map(item => ({
      id: item.space.id,
      name: item.space.name,
      description: item.description,
      visitType: 'First', // Default to First for simplicity
    }));
  }
  
  /**
   * Check if a space name is a "RETURN TO" option
   * @param {string} spaceName - Space name to check
   * @returns {boolean} True if this is a return option
   */
  isReturnOption(spaceName) {
    return spaceName.startsWith('RETURN TO');
  }
  
  /**
   * Process a dice roll outcome for movement
   * @param {Object} player - Player who rolled
   * @param {number} diceValue - Value rolled on the dice
   * @param {string} spaceName - Name of the space
   * @param {string} visitType - "First" or "Subsequent" visit
   * @returns {Object} Outcome of the dice roll
   */
  processDiceRollOutcome(player, diceValue, spaceName, visitType) {
    // Find the corresponding outcome in the dice roll data
    const outcome = this.getDiceRollOutcome(spaceName, diceValue, visitType);
    
    if (!outcome) {
      console.error(`MovementLogic: No outcome found for dice roll ${diceValue} on ${spaceName}`);
      return { success: false };
    }
    
    console.log(`MovementLogic: Dice roll outcome: ${outcome}`);
    
    // Initialize result object
    const result = { 
      success: true,
      diceRoll: diceValue  // Store the dice roll value for reference
    };
    
    // Check if outcome is a space name (for movement)
    if (outcome.includes('-') && !outcome.startsWith('Draw') && !outcome.startsWith('Remove')) {
      // This is likely a space name or space name with description
      const targetSpaceName = this.movementCore.extractSpaceName(outcome);
      if (targetSpaceName) {
        const targetSpace = this.gameStateManager.findSpaceByName(targetSpaceName);
        if (targetSpace) {
          result.type = 'move';
          result.targetSpace = targetSpace;
          result.description = outcome;
          
          // Add the move as an available move
          result.moves = [{
            id: targetSpace.id,
            name: targetSpace.name,
            description: outcome,
            visitType: this.movementCore.determineVisitType(player, targetSpace)
          }];
        }
      }
    }
    
    // Handle card changes (Draw, Remove, Replace)
    if (outcome.startsWith('Draw') || outcome.startsWith('Remove') || outcome.startsWith('Replace')) {
      result.type = 'card';
      result.action = outcome.split(' ')[0];  // Draw, Remove, Replace
      result.count = parseInt(outcome.split(' ')[1], 10) || 1;
      result.cardType = outcome.includes('W Card') ? 'W' : 
                outcome.includes('B Card') ? 'B' : 
                outcome.includes('I Card') ? 'I' : 
                outcome.includes('L Card') ? 'L' : 
                outcome.includes('E Card') ? 'E' : null;
      result.description = outcome;
      
      // Add the actual card outcome to the result
      const cardType = result.cardType;
      if (cardType) {
        result[`${cardType} Cards`] = outcome;
      }
      
      // Set isCardOutcome flag for special handling
      result.isCardOutcome = true;
      
      // If this is a card outcome, get standard moves from current space
      // This is crucial for allowing movement after card draws from dice rolls
      const currentSpace = this.gameStateManager.findSpaceById(player.position);
      if (currentSpace) {
        result.moves = this.getStandardMoves(player, currentSpace);
        console.log(`MovementLogic: Adding ${result.moves.length} standard moves to card outcome:`, 
          result.moves.map(m => m.name).join(', '));
      } else {
        console.log('MovementLogic: No current space found to get standard moves');
        result.moves = [];
      }
      
      // Ensure we have the necessary properties for proper handling
      result.requiresFallbackMoves = true;
      result.sourceSpaceId = player.position;
      result.sourceSpaceName = currentSpace ? currentSpace.name : 'unknown';
    }
    
    // Handle fee percentages
    if (outcome.endsWith('%')) {
      result.type = 'fee';
      result.percentage = parseFloat(outcome);
      result.description = outcome;
    }
    
    // Handle time outcomes (days)
    if (outcome.endsWith('days') || outcome.endsWith('day')) {
      const days = parseInt(outcome.split(' ')[0], 10);
      result.type = 'time';
      result.days = days;
      result.description = outcome;
    }
    
    // If no type has been set, use generic
    if (!result.type) {
      result.type = 'generic';
      result.description = outcome;
    }
    
    // Make sure we always have a moves array (even if empty)
    if (!result.moves) {
      result.moves = [];
    }
    
    return result;
  }
  
  /**
   * Get the outcome for a specific dice roll
   * @param {string} spaceName - Name of the space
   * @param {number} diceValue - Value rolled on the dice
   * @param {string} visitType - "First" or "Subsequent" visit
   * @returns {string|null} Outcome string or null
   */
  getDiceRollOutcome(spaceName, diceValue, visitType) {
    // Find the matching row in dice roll data
    const matchingRows = this.gameStateManager.diceRollData.filter(row => 
      row['Space Name'] === spaceName && row['Visit Type'] === visitType
    );
    
    if (!matchingRows || matchingRows.length === 0) {
      console.log(`MovementLogic: No dice roll data found for ${spaceName} with visit type ${visitType}`);
      return null;
    }
    
    console.log(`MovementLogic: Found ${matchingRows.length} rows of dice data for ${spaceName}`);
    
    // Find the outcome for this dice value
    for (const row of matchingRows) {
      console.log(`MovementLogic: Checking dice roll ${diceValue} in data:`, row);
      const outcome = row[diceValue.toString()];
      if (outcome) {
        console.log(`MovementLogic: Found outcome for dice ${diceValue}: ${outcome}`);
        return outcome;
      }
    }
    
    console.log(`MovementLogic: No specific outcome found for dice value ${diceValue}`);
    return null;
  }
}

// Export for use in other modules
window.MovementLogic = MovementLogic;

console.log('MovementLogic.js code execution finished');