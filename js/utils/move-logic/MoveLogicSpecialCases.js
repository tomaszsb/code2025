// MoveLogicSpecialCases.js - Special case handlers for specific spaces
console.log('MoveLogicSpecialCases.js file is beginning to be used');

/**
 * MoveLogicSpecialCases - Handlers for spaces with special logic
 * 
 * This module extends MoveLogicBase to add special case handlers for 
 * specific spaces that have unique movement rules.
 */
(function() {
  // Make sure MoveLogicBase is loaded
  if (!window.MoveLogicBase) {
    console.error('MoveLogicSpecialCases: MoveLogicBase not found. Make sure to include MoveLogicBase.js first.');
    return;
  }
  
  // Define the MoveLogicSpecialCases class
  function MoveLogicSpecialCases() {
    // Call the parent constructor
    window.MoveLogicBase.call(this);
    
    console.log('MoveLogicSpecialCases: Constructor initialized');
    
    // Special case spaces that require custom logic
    this.specialCaseSpaces = [
      'ARCH-INITIATION',
      'PM-DECISION-CHECK',
      'REG-FDNY-FEE-REVIEW'
    ];
    
    // Spaces requiring dice roll for movement
    this.diceRollSpaces = [
      'ARCH-INITIATION'
    ];
    
    console.log('MoveLogicSpecialCases: Initialized successfully');
  }
  
  // Inherit from MoveLogicBase
  MoveLogicSpecialCases.prototype = Object.create(window.MoveLogicBase.prototype);
  MoveLogicSpecialCases.prototype.constructor = MoveLogicSpecialCases;
  
  /**
   * Override hasSpecialCaseLogic to use our class property
   * @param {string} spaceName - The name of the space to check
   * @returns {boolean} - True if space has special case logic
   */
  MoveLogicSpecialCases.prototype.hasSpecialCaseLogic = function(spaceName) {
    return this.specialCaseSpaces.includes(spaceName);
  };
  
  /**
   * Override handleSpecialCaseSpace to dispatch to the appropriate handler
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  MoveLogicSpecialCases.prototype.handleSpecialCaseSpace = function(gameState, player, currentSpace) {
    // Implementation for each special case
    switch (currentSpace.name) {
      case 'ARCH-INITIATION':
        return this.handleArchInitiation(gameState, player, currentSpace);
      case 'PM-DECISION-CHECK':
        return this.handlePmDecisionCheck(gameState, player, currentSpace);
      case 'REG-FDNY-FEE-REVIEW':
        return this.handleFdnyFeeReview(gameState, player, currentSpace);
      default:
        console.log('MoveLogicSpecialCases: No handler for space:', currentSpace.name);
        return window.MoveLogicBase.prototype.getSpaceDependentMoves.call(this, gameState, player, currentSpace);
    }
  };
  
  /**
   * Handle ARCH-INITIATION space
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  MoveLogicSpecialCases.prototype.handleArchInitiation = function(gameState, player, currentSpace) {
    console.log('MoveLogicSpecialCases: Handling ARCH-INITIATION special case');
    
    // Determine if this is a first or subsequent visit
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log(`MoveLogicSpecialCases: ARCH-INITIATION visit type is: ${visitType}`);
    console.log('MoveLogicSpecialCases: Player visited spaces:', player.visitedSpaces);
    console.log('MoveLogicSpecialCases: Current position:', player.position);
    
    // Apply time cost (5 days for both first and subsequent visits)
    if (gameState.applyTimeCostToPlayer) {
      gameState.applyTimeCostToPlayer(player.id, 5, 'Architect Search');
      console.log('MoveLogicSpecialCases: Applied 5-day time cost to player');
    } else {
      console.warn('MoveLogicSpecialCases: gameState.applyTimeCostToPlayer not available, time cost not applied');
    }
    
    // Handle E Card draw if dice roll matches specific values
    // For first visit: Draw E card if roll is 1
    // For subsequent visit: Draw E card if roll is 2
    const lastDiceRoll = gameState.getLastDiceRoll ? gameState.getLastDiceRoll() : null;
    if (lastDiceRoll) {
      const rollValue = lastDiceRoll.total || lastDiceRoll.value || 0;
      const shouldDrawECard = (visitType === 'first' && rollValue === 1) || 
                          (visitType === 'subsequent' && rollValue === 2);
      
      if (shouldDrawECard && gameState.drawCard) {
        const drawnCard = gameState.drawCard(player.id, 'E');
        console.log(`MoveLogicSpecialCases: Drew E card ${drawnCard ? drawnCard.id : 'unknown'} based on dice roll ${rollValue}`);
      }
    }
    
    // For first visit: Always go to ARCH-FEE-REVIEW
    if (visitType === 'first') {
      console.log('MoveLogicSpecialCases: First visit to ARCH-INITIATION - directing to ARCH-FEE-REVIEW');
      
      // Find ARCH-FEE-REVIEW spaces
      const archFeeReviewSpaces = gameState.spaces.filter(s => s.name === 'ARCH-FEE-REVIEW');
      
      if (archFeeReviewSpaces.length > 0) {
        // Determine if player has visited ARCH-FEE-REVIEW before
        const hasVisitedFeeReview = gameState.hasPlayerVisitedSpace(player, 'ARCH-FEE-REVIEW');
        const feeReviewVisitType = hasVisitedFeeReview ? 'subsequent' : 'first';
        
        // Find the right version of the space
        const nextSpace = archFeeReviewSpaces.find(s => 
          s.visitType.toLowerCase() === feeReviewVisitType.toLowerCase()
        ) || archFeeReviewSpaces[0];
        
        console.log(`MoveLogicSpecialCases: Directing to ARCH-FEE-REVIEW with visit type ${feeReviewVisitType}`);
        return [nextSpace];
      } else {
        console.warn('MoveLogicSpecialCases: Could not find ARCH-FEE-REVIEW space, check game data');
        return [];
      }
    }
    
    // For subsequent visit: "Outcome from rolled dice"
    // This requires a dice roll to determine the next moves
    // If dice has been rolled, use the result to determine next space
    if (visitType === 'subsequent') {
      console.log('MoveLogicSpecialCases: Subsequent visit to ARCH-INITIATION - requires dice roll');
      
      // Check if dice has been rolled
      if (!lastDiceRoll) {
        console.log('MoveLogicSpecialCases: No dice roll found, returning requiresDiceRoll flag');
        return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
      }
      
      // Use dice roll to determine next space
      const rollValue = lastDiceRoll.total || lastDiceRoll.value || 0;
      console.log(`MoveLogicSpecialCases: Using dice roll value ${rollValue} to determine next space`);
      
      // Logic based on dice roll value
      // For simplicity, let's define different paths based on dice roll ranges
      let nextSpaceName = '';
      
      if (rollValue <= 2) {
        // Low roll (1-2): Go back to ARCH-FEE-REVIEW
        nextSpaceName = 'ARCH-FEE-REVIEW';
      } else if (rollValue <= 4) {
        // Medium roll (3-4): Go to ARCH-SCOPE-CHECK
        nextSpaceName = 'ARCH-SCOPE-CHECK';
      } else {
        // High roll (5-6): Go to ENG-INITIATION
        nextSpaceName = 'ENG-INITIATION';
      }
      
      console.log(`MoveLogicSpecialCases: Dice roll ${rollValue} directs to ${nextSpaceName}`);
      
      // Find the determined next space
      const nextSpaces = gameState.spaces.filter(s => s.name === nextSpaceName);
      
      if (nextSpaces.length > 0) {
        // Determine visit type for next space
        const hasVisitedNextSpace = gameState.hasPlayerVisitedSpace(player, nextSpaceName);
        const nextSpaceVisitType = hasVisitedNextSpace ? 'subsequent' : 'first';
        
        // Find correct version of the space
        const nextSpace = nextSpaces.find(s => 
          s.visitType.toLowerCase() === nextSpaceVisitType.toLowerCase()
        ) || nextSpaces[0];
        
        console.log(`MoveLogicSpecialCases: Selected ${nextSpaceName} with visit type ${nextSpaceVisitType}`);
        return [nextSpace];
      } else {
        console.warn(`MoveLogicSpecialCases: Could not find space for ${nextSpaceName}, check game data`);
        return [];
      }
    }
    
    // This should not be reached, but just in case
    console.warn('MoveLogicSpecialCases: Unexpected code path in handleArchInitiation');
    return [];
  };
  
  /**
   * Handle PM-DECISION-CHECK space
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  MoveLogicSpecialCases.prototype.handlePmDecisionCheck = function(gameState, player, currentSpace) {
    console.log('MoveLogicSpecialCases: Special case for PM-DECISION-CHECK');
    console.log('MoveLogicSpecialCases: Player position:', player.position);
    console.log('MoveLogicSpecialCases: Visit type:', currentSpace.visitType);
    
    // Read the next spaces directly from the CSV data stored in the space object
    const rawNextSpaces = [
      currentSpace.rawSpace1, 
      currentSpace.rawSpace2, 
      currentSpace.rawSpace3, 
      currentSpace.rawSpace4, 
      currentSpace.rawSpace5
    ].filter(space => space && space.trim() !== '' && space !== 'n/a');
    
    console.log('MoveLogicSpecialCases: Raw next spaces from CSV:', rawNextSpaces);
    
    const availableMoves = [];
    
    // Process each raw next space from the CSV
    for (const rawSpaceName of rawNextSpaces) {
      // Extract the base space name (before any explanatory text)
      const cleanedSpaceName = gameState.extractSpaceName(rawSpaceName);
      console.log('MoveLogicSpecialCases: Processing raw space name:', rawSpaceName, '-> cleaned:', cleanedSpaceName);
      
      // Find spaces that match this name
      const matchingSpaces = gameState.spaces.filter(s => {
        const extractedName = gameState.extractSpaceName(s.name);
        const isMatch = extractedName === cleanedSpaceName || 
                       s.name.includes(cleanedSpaceName) || 
                       cleanedSpaceName.includes(extractedName);
        
        if (isMatch) {
          console.log('MoveLogicSpecialCases: Found matching space:', s.name, s.id);
        }
        
        return isMatch;
      });
      
      console.log('MoveLogicSpecialCases: Found', matchingSpaces.length, 'matching spaces for', cleanedSpaceName);
      
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
          console.log('MoveLogicSpecialCases: Added PM-DECISION-CHECK move:', nextSpace.name, nextSpace.id);
        }
      } else {
        console.log('MoveLogicSpecialCases: Could not find space for:', cleanedSpaceName);
      }
    }
    
    console.log('MoveLogicSpecialCases: PM-DECISION-CHECK moves count:', availableMoves.length);
    return availableMoves;
  };
  
  /**
   * Handle REG-FDNY-FEE-REVIEW space
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  MoveLogicSpecialCases.prototype.handleFdnyFeeReview = function(gameState, player, currentSpace) {
    console.log('MoveLogicSpecialCases: Handling REG-FDNY-FEE-REVIEW special case');
    
    // Determine if this is a first or subsequent visit
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    console.log(`MoveLogicSpecialCases: REG-FDNY-FEE-REVIEW visit type is: ${visitType}`);
    
    // Apply fee on first visit (1% fee according to CSV)
    if (visitType === 'first') {
      console.log('MoveLogicSpecialCases: Applying 1% fee for first visit to REG-FDNY-FEE-REVIEW');
      // Calculate fee based on project scope (if available)
      const projectScope = gameState.getProjectScope ? gameState.getProjectScope() : 100000; // Default value if scope not available
      const fee = projectScope * 0.01; // 1% fee
      
      // Apply fee to player's resources
      if (gameState.applyFeeToPlayer) {
        gameState.applyFeeToPlayer(player.id, fee, 'FDNY Review Fee');
        console.log(`MoveLogicSpecialCases: Applied fee of ${fee} to player ${player.id}`);
      } else {
        console.warn('MoveLogicSpecialCases: gameState.applyFeeToPlayer not available, fee not applied');
      }
    }
    
    // Apply time cost (1 day for both first and subsequent visits)
    if (gameState.applyTimeCostToPlayer) {
      gameState.applyTimeCostToPlayer(player.id, 1, 'FDNY Review');
      console.log('MoveLogicSpecialCases: Applied 1 day time cost to player');
    } else {
      console.warn('MoveLogicSpecialCases: gameState.applyTimeCostToPlayer not available, time cost not applied');
    }
    
    // Get player's game state properties to determine next moves
    // These would typically be stored in the player object or game state
    const hasFdnyApproval = this.getPlayerGameProperty(gameState, player, 'hasFdnyApproval');
    const hasChangedScope = this.getPlayerGameProperty(gameState, player, 'hasChangedScope');
    const sentByDOB = this.getPlayerGameProperty(gameState, player, 'sentByDOB');
    const hasFireSystems = this.getPlayerGameProperty(gameState, player, 'hasFireSystems');
    const hasDOBApproval = this.getPlayerGameProperty(gameState, player, 'hasDOBApproval');
    
    console.log('MoveLogicSpecialCases: Player properties for decision tree:');
    console.log(`- hasFdnyApproval: ${hasFdnyApproval}`);
    console.log(`- hasChangedScope: ${hasChangedScope}`);
    console.log(`- sentByDOB: ${sentByDOB}`);
    console.log(`- hasFireSystems: ${hasFireSystems}`);
    console.log(`- hasDOBApproval: ${hasDOBApproval}`);
    
    // Decision tree based on CSV logic
    let nextSpaceName = '';
    
    // First question: Did you pass FDNY before?
    if (hasFdnyApproval) {
      // If YES - Go to Space 2 ("Did the scope change since last visit?")
      if (hasChangedScope) {
        nextSpaceName = 'REG-FDNY-PLAN-EXAM';
      } else {
        // If NO - Go to Space 3 ("Did Department of Buildings send you here?")
        if (sentByDOB) {
          nextSpaceName = 'REG-FDNY-PLAN-EXAM';
        } else {
          // If NO - Go to Space 4 ("Do you have: sprinklers/standpipe/fire alarm/fire suppression?")
          if (hasFireSystems) {
            nextSpaceName = 'REG-FDNY-PLAN-EXAM';
          } else {
            // If NO - Go to Space 5 ("If DOB approval = YES/NO")
            nextSpaceName = hasDOBApproval ? 'PM-DECISION-CHECK' : 'REG-DOB-TYPE-SELECT';
          }
        }
      }
    } else {
      // If NO - Go to Space 3 ("Did Department of Buildings send you here?")
      if (sentByDOB) {
        nextSpaceName = 'REG-FDNY-PLAN-EXAM';
      } else {
        // If NO - Go to Space 4 ("Do you have: sprinklers/standpipe/fire alarm/fire suppression?")
        if (hasFireSystems) {
          nextSpaceName = 'REG-FDNY-PLAN-EXAM';
        } else {
          // If NO - Go to Space 5 ("If DOB approval = YES/NO")
          nextSpaceName = hasDOBApproval ? 'PM-DECISION-CHECK' : 'REG-DOB-TYPE-SELECT';
        }
      }
    }
    
    console.log(`MoveLogicSpecialCases: Next space determined: ${nextSpaceName}`);
    
    // Handle the CON-INITIATION option if DOB approval = YES and moving to PM-DECISION-CHECK
    // This is a special case where player can choose between PM-DECISION-CHECK or CON-INITIATION
    const availableMoves = [];
    
    if (nextSpaceName === 'PM-DECISION-CHECK' && hasDOBApproval) {
      // Find PM-DECISION-CHECK space
      const pmDecisionCheckSpaces = gameState.spaces.filter(s => s.name === 'PM-DECISION-CHECK');
      
      // Find CON-INITIATION space
      const conInitiationSpaces = gameState.spaces.filter(s => s.name === 'CON-INITIATION');
      
      if (pmDecisionCheckSpaces.length > 0) {
        const pmSpaceVisitType = gameState.hasPlayerVisitedSpace(player, 'PM-DECISION-CHECK') ? 'subsequent' : 'first';
        const pmSpace = pmDecisionCheckSpaces.find(s => 
          s.visitType.toLowerCase() === pmSpaceVisitType.toLowerCase()
        ) || pmDecisionCheckSpaces[0];
        
        availableMoves.push(pmSpace);
        console.log(`MoveLogicSpecialCases: Added PM-DECISION-CHECK as an option with visit type ${pmSpaceVisitType}`);
      }
      
      if (conInitiationSpaces.length > 0) {
        const conSpaceVisitType = gameState.hasPlayerVisitedSpace(player, 'CON-INITIATION') ? 'subsequent' : 'first';
        const conSpace = conInitiationSpaces.find(s => 
          s.visitType.toLowerCase() === conSpaceVisitType.toLowerCase()
        ) || conInitiationSpaces[0];
        
        availableMoves.push(conSpace);
        console.log(`MoveLogicSpecialCases: Added CON-INITIATION as an option with visit type ${conSpaceVisitType}`);
      }
    } else {
      // Find spaces that match the determined next space name
      const matchingSpaces = gameState.spaces.filter(s => s.name === nextSpaceName);
      
      if (matchingSpaces.length > 0) {
        const nextSpaceVisitType = gameState.hasPlayerVisitedSpace(player, nextSpaceName) ? 'subsequent' : 'first';
        const nextSpace = matchingSpaces.find(s => 
          s.visitType.toLowerCase() === nextSpaceVisitType.toLowerCase()
        ) || matchingSpaces[0];
        
        availableMoves.push(nextSpace);
        console.log(`MoveLogicSpecialCases: Added ${nextSpaceName} as the next space with visit type ${nextSpaceVisitType}`);
      } else {
        console.warn(`MoveLogicSpecialCases: Could not find space matching name: ${nextSpaceName}`);
      }
    }
    
    // If no moves found, return empty array (this shouldn't happen in normal gameplay)
    if (availableMoves.length === 0) {
      console.warn('MoveLogicSpecialCases: No moves found for REG-FDNY-FEE-REVIEW, check game state');
      
      // Fallback to REG-DOB-TYPE-SELECT as a last resort
      const fallbackSpaces = gameState.spaces.filter(s => s.name === 'REG-DOB-TYPE-SELECT');
      if (fallbackSpaces.length > 0) {
        const fallbackSpace = fallbackSpaces[0];
        availableMoves.push(fallbackSpace);
        console.log('MoveLogicSpecialCases: Added fallback space REG-DOB-TYPE-SELECT');
      }
    }
    
    return availableMoves;
  };
  
  /**
   * Helper method to get player game property with fallback
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get property for
   * @param {string} propertyName - The name of the property to get
   * @returns {boolean} - The property value or false if not found
   */
  MoveLogicSpecialCases.prototype.getPlayerGameProperty = function(gameState, player, propertyName) {
    // Try different ways of accessing the property
    if (player[propertyName] !== undefined) {
      return player[propertyName];
    }
    
    if (player.properties && player.properties[propertyName] !== undefined) {
      return player.properties[propertyName];
    }
    
    if (gameState.getPlayerProperty) {
      return gameState.getPlayerProperty(player.id, propertyName) || false;
    }
    
    // If game state or property checking functions are unavailable,
    // we'll allow the UI to handle the choice
    
    // For debugging, return test values (in a real implementation, we'd ask the player or examine game state)
    // These test values lead to a variety of paths for testing
    const testValues = {
      hasFdnyApproval: Math.random() > 0.5,
      hasChangedScope: Math.random() > 0.5,
      sentByDOB: Math.random() > 0.5,
      hasFireSystems: Math.random() > 0.5,
      hasDOBApproval: Math.random() > 0.5
    };
    
    return testValues[propertyName] || false;
  };
  
  // Expose the class to the global scope
  window.MoveLogicSpecialCases = MoveLogicSpecialCases;
})();

console.log('MoveLogicSpecialCases.js code execution finished');
