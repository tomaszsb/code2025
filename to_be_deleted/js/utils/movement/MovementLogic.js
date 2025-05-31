/**
 * MovementLogic.js
 * Higher-level movement logic for the Project Management Game
 * 
 * This module builds on MovementCore to provide game-specific
 * movement functionality, particularly for determining available moves
 */

console.log('MovementLogic.js file is beginning to be used');

// VERSION TRACKING for cache-buster
if (window.LOADED_VERSIONS) {
  window.LOADED_VERSIONS['MovementLogic'] = '2025-05-25-001';
  console.log('MovementLogic: Version 2025-05-25-001 loaded');
}

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
   * Check if a space is a logic space
   * @param {string} spaceName - Name of the space to check
   * @returns {boolean} True if this is a logic space
   */
  isLogicSpace(spaceName) {
    if (!spaceName || !this.gameStateManager.spaces) return false;
    const spaceData = this.gameStateManager.spaces.find(s => s.name === spaceName);
    console.log(`Checking if ${spaceName} is logic space:`, spaceData ? spaceData.Path : 'space not found');
    return spaceData && spaceData.Path === "LOGIC";
  }
  
  /**
   * Parse logic question from space column text
   * @param {string} questionText - Text containing the logic question
   * @returns {Object|null} Parsed question object or null
   */
  parseLogicQuestion(questionText) {
    if (!questionText) return null;
    
    // Format: "Question? YES - destination NO - destination"
    const parts = questionText.split('?');
    if (parts.length < 2) return null;
    
    const question = parts[0].trim() + '?';
    const answersText = parts[1].trim();
    
    // Look for YES and NO patterns
    const yesIndex = answersText.indexOf('YES -');
    let noIndex = answersText.indexOf(' NO -');
    
    // If " NO -" not found, try "NO -" at start or after space
    if (noIndex === -1) {
      noIndex = answersText.indexOf('NO -');
      if (noIndex > 0 && answersText[noIndex - 1] !== ' ') {
        noIndex = -1; // Only accept if it's at start or after space
      }
    }
    
    if (yesIndex === -1 || noIndex === -1) {
      console.log('Parse failed - yesIndex:', yesIndex, 'noIndex:', noIndex);
      return null;
    }
    
    const yesDestination = answersText.substring(yesIndex + 5, noIndex).trim();
    let noDestination = answersText.substring(noIndex + 4).trim(); // +4 for "NO -"
    
    // Resolve "Space X" references to actual column values
    if (noDestination.startsWith('Space ')) {
      const spaceData = this.getCurrentSpaceData();
      if (spaceData && spaceData[noDestination]) {
        noDestination = spaceData[noDestination];
      }
    }
    
    return {
      question: question,
      yes: yesDestination,
      no: noDestination
    };
  }
  
  /**
   * Get current space data for the current player
   * @returns {Object|null} Current space data or null
   */
  getCurrentSpaceData() {
    const currentPlayer = this.gameStateManager.getCurrentPlayer();
    if (!currentPlayer) return null;
    
    return this.gameStateManager.findSpaceById(currentPlayer.position);
  }
  
  /**
   * Get logic space moves (for UI integration)
   * @param {Object} player - Current player
   * @param {Object} space - Logic space data
   * @returns {Object} Logic space move data
   */
  getLogicSpaceMoves(player, space) {
    // Return special object indicating this needs logic space UI
    return {
      requiresLogicSpace: true,
      spaceName: space.name,
      visitType: this.movementCore.determineVisitType(player, space),
      currentQuestion: 1 // Start at question 1
    };
  }
  
  /**
   * Process logic space question answer
   * @param {Object} player - Current player  
   * @param {string} spaceName - Name of logic space
   * @param {number} questionNumber - Current question number
   * @param {string} answer - "YES" or "NO"
   * @returns {Object} Result of the choice
   */
  processLogicChoice(player, spaceName, questionNumber, answer) {
    const spaceData = this.gameStateManager.spaces.find(s => s.name === spaceName);
    if (!spaceData) {
      return { error: 'Space not found' };
    }
    
    const spaceColumn = `Space ${questionNumber}`;
    const questionText = spaceData[spaceColumn];
    
    if (!questionText) {
      return { error: 'Question not found' };
    }
    
    const questionData = this.parseLogicQuestion(questionText);
    if (!questionData) {
      return { error: 'Could not parse question' };
    }
    
    const destination = answer === 'YES' ? questionData.yes : questionData.no;
    
    // Check if destination is another question or final destination
    if (destination.includes('Space ')) {
      const spaceNumber = destination.match(/Space (\d+)/);
      if (spaceNumber) {
        return {
          type: 'nextQuestion',
          nextQuestion: parseInt(spaceNumber[1])
        };
      }
    }
    
    // Handle multiple destinations (separated by " or ")
    if (destination.includes(' or ')) {
      const destinations = destination.split(' or ').map(d => d.trim());
      return {
        type: 'multipleDestinations',
        destinations: destinations.map(dest => ({
          id: this.gameStateManager.findSpaceByName(dest.trim())?.id,
          name: dest.trim(),
          description: dest
        })).filter(d => d.id)
      };
    }
    
    // Single final destination
    const targetSpace = this.gameStateManager.findSpaceByName(destination);
    if (targetSpace) {
      return {
        type: 'finalDestination',
        destination: {
          id: targetSpace.id,
          name: targetSpace.name,
          description: destination
        }
      };
    }
    
    return { error: 'Invalid destination' };
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
    
    const currentSpaceId = player.position;
    if (!currentSpaceId) {
      console.error('MovementLogic: Player has no position');
      return [];
    }
    
    const currentSpace = this.gameStateManager.findSpaceById(currentSpaceId);
    if (!currentSpace) {
      console.error(`MovementLogic: Could not find space with id ${currentSpaceId}`);
      return [];
    }
    
    console.log(`MovementLogic: Getting available moves for ${player.name} at ${currentSpace.name}`);
    
    // PHASE 1: Check dice roll requirement first
    if (this.movementCore.spaceRequiresDiceRoll(currentSpace, player)) {
      console.log(`MovementLogic: Space ${currentSpace.name} requires dice roll`);
      return {
        requiresDiceRoll: true,
        spaceName: currentSpace.name,
        visitType: this.movementCore.determineVisitType(player, currentSpace)
      };
    }
    
    // PHASE 2: Check for logic spaces
    if (this.isLogicSpace(currentSpace.name)) {
      console.log(`MovementLogic: Handling logic space ${currentSpace.name}`);
      return this.getLogicSpaceMoves(player, currentSpace);
    }
    
    // PHASE 3: Check for single choice spaces
    if (this.movementCore.isSingleChoiceSpace(currentSpace.name)) {
      const previousChoice = this.movementCore.getPreviousSingleChoice(player, currentSpace.name);
      
      if (previousChoice) {
        // Player has been here before, only show their previous choice
        const targetSpace = this.gameStateManager.findSpaceByName(previousChoice);
        if (targetSpace) {
          return [{
            id: targetSpace.id,
            name: targetSpace.name,
            description: `Your chosen path: ${previousChoice}`,
            visitType: this.movementCore.determineVisitType(player, targetSpace),
            isRepeatedChoice: true
          }];
        }
      }
      // If no previous choice, fall through to standard moves but mark as single choice
    }
    
    // PHASE 4: Check if this is the PM-DECISION-CHECK space
    if (currentSpace.name === 'PM-DECISION-CHECK') {
      console.log(`MovementLogic: Handling special case for PM-DECISION-CHECK`);
      return this.getMovesForPMDecisionCheck(player, currentSpace);
    }
    
    // PHASE 5: Standard moves with filtering
    return this.getStandardMovesWithFiltering(player, currentSpace);
  }
  
  /**
   * Get standard moves with improved filtering
   * @param {Object} player - Player to get moves for
   * @param {Object} space - Space to get moves from
   * @returns {Array} Filtered available moves
   */
  getStandardMovesWithFiltering(player, space) {
    const availableMoves = [];
    const visitType = this.movementCore.determineVisitType(player, space);
    const isSingleChoice = this.movementCore.isSingleChoiceSpace(space.name);
    
    console.log(`MovementLogic: Getting standard moves for ${space.name}, visitType: ${visitType}, singleChoice: ${isSingleChoice}`);
    
    // Check all numbered space columns
    for (let i = 1; i <= 5; i++) {
      const nextSpaceData = space[`rawSpace${i}`];
      if (nextSpaceData && nextSpaceData.trim() !== '') {
        
        // Handle {ORIGINAL_SPACE} placeholder
        if (nextSpaceData.includes('{ORIGINAL_SPACE}')) {
          if (visitType === 'Subsequent' && player.properties && player.properties.originalSpaceId) {
            const originalSpace = this.gameStateManager.findSpaceById(player.properties.originalSpaceId);
            if (originalSpace) {
              console.log(`MovementLogic: Processing {ORIGINAL_SPACE} reference to ${originalSpace.name}`);
              const originalMoves = this.getStandardMovesWithFiltering(player, originalSpace);
              
              originalMoves.forEach(move => {
                move.fromOriginalSpace = true;
                move.originalSpaceId = originalSpace.id;
                move.description = `Return to main path: ${move.name}`;
                availableMoves.push(move);
              });
            }
          }
          continue;
        }
        
        // Extract space name and validate
        const spaceName = this.movementCore.extractSpaceName(nextSpaceData);
        if (spaceName) {
          // Skip "RETURN TO YOUR SPACE" for first visits
          if (spaceName === 'RETURN TO YOUR SPACE' && visitType !== 'Subsequent') {
            continue;
          }
          
          // Apply single choice conflict filtering
          if (this.movementCore.conflictsWithSingleChoice(player, spaceName)) {
            console.log(`MovementLogic: Skipping ${spaceName} due to single choice conflict`);
            continue;
          }
          
          // Find the space and add to moves
          const nextSpace = this.gameStateManager.findSpaceByName(spaceName);
          if (nextSpace) {
            availableMoves.push({
              id: nextSpace.id,
              name: nextSpace.name,
              description: nextSpaceData,
              visitType: this.movementCore.determineVisitType(player, nextSpace),
              isSingleChoice: isSingleChoice,
              isFirstChoice: isSingleChoice && !this.movementCore.getPreviousSingleChoice(player, space.name)
            });
          }
        }
      }
    }
    
    console.log(`MovementLogic: Found ${availableMoves.length} filtered moves for ${space.name}`);
    return availableMoves;
  }
  
  /**
   * Get standard moves from a space (LEGACY VERSION for compatibility)
   * @param {Object} player - Player to get moves for
   * @param {Object} space - Space to get moves from
   * @returns {Array} Available moves
   */
  getStandardMoves(player, space) {
    const availableMoves = [];
    
    // Determine visit type (First or Subsequent) with enhanced logic for PM-DECISION-CHECK
    const visitType = this.determineVisitTypeForSpace(player, space);
    console.log(`MovementLogic: Visit type for ${space.name}: ${visitType}`);
    
    // CRITICAL FIX: For PM-DECISION-CHECK, get the correct space version based on visit type
    if (space.name === 'PM-DECISION-CHECK') {
      const correctSpace = this.gameStateManager.spaces.find(s => 
        s.name === 'PM-DECISION-CHECK' && s.visitType === visitType
      );
      if (correctSpace) {
        space = correctSpace;
        console.log(`MovementLogic: Using ${visitType} version of PM-DECISION-CHECK`);
      } else {
        console.warn(`MovementLogic: Could not find ${visitType} version of PM-DECISION-CHECK`);
      }
    }
    
    // Check all numbered space columns in the CSV data
    for (let i = 1; i <= 5; i++) {
      // Use only rawSpace properties
      const nextSpaceData = space[`rawSpace${i}`];
      if (nextSpaceData && nextSpaceData.trim() !== '') {
        // Check for {ORIGINAL_SPACE} placeholder
        if (nextSpaceData.includes('{ORIGINAL_SPACE}')) {
          console.log('MovementLogic: Found {ORIGINAL_SPACE} placeholder');
          
          // Only process for subsequent visits
          if (visitType === 'Subsequent' && player.properties && player.properties.originalSpaceId) {
            const originalSpace = this.gameStateManager.findSpaceById(player.properties.originalSpaceId);
            if (originalSpace) {
              console.log(`MovementLogic: Replacing {ORIGINAL_SPACE} with moves from ${originalSpace.name}`);
              
              // Get moves from the original space
              const originalMoves = this.getStandardMoves(player, originalSpace);
              
              // Add them with special marking
              originalMoves.forEach(move => {
                move.fromOriginalSpace = true;
                move.originalSpaceId = originalSpace.id;
                move.description = `Return to main path: ${move.name}`;
                availableMoves.push(move);
              });
            }
          }
          continue; // Skip normal processing for this placeholder
        }
        
        // Extract the space name from the data
        const spaceName = this.movementCore.extractSpaceName(nextSpaceData);
        if (spaceName) {
          // Skip "RETURN TO YOUR SPACE" for first visits (legacy support)
          if (spaceName === 'RETURN TO YOUR SPACE' && visitType !== 'Subsequent') {
            continue;
          }
          
          // Note: OWNER-DECISION-REVIEW and ENG-INITIATION should be available on both first and subsequent visits
          
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
   * Determine visit type for a space using standard logic
   * @param {Object} player - Player to check
   * @param {Object} space - Space to check
   * @returns {string} "First" or "Subsequent"
   */
  determineVisitTypeForSpace(player, space) {
    // Use the standard logic from MovementCore
    return this.movementCore.determineVisitType(player, space);
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

console.log('MovementLogic.js code execution finished - Enhanced with improved PM-DECISION-CHECK visit type detection');