/**
 * MovementEngine.js
 * Data-driven movement engine for the Project Management Game
 * 
 * Implements the complete movement system logic as documented in MOVEMENT_SYSTEM_LOGIC.md
 * Handles all space types, visit logic, and CSV-driven gameplay mechanics
 */

console.log('MovementEngine.js file is beginning to be used');

// VERSION TRACKING for cache-buster
if (window.LOADED_VERSIONS) {
  window.LOADED_VERSIONS['MovementEngine'] = '2025-05-26-002';
  console.log('MovementEngine: Version 2025-05-26-002 loaded');
}

class MovementEngine {
  constructor(gameStateManager = null) {
    this.gameStateManager = gameStateManager || window.GameStateManager;
    
    // Initialize MovementCore for foundational operations
    this.movementCore = null;
    if (window.MovementCore) {
      this.movementCore = new window.MovementCore(this.gameStateManager);
    }
    
    // Initialize movement state
    this.movementState = {
      inLogicSpace: false,
      currentLogicQuestion: 1,
      logicQuestionDisplayed: false,
      selectedDestination: null,
      pendingMovement: null,
      hasRolledDice: false,
      diceResult: null
    };
    
    // Cache for performance
    this.spaceTypeCache = new Map();
    this.movementOptionsCache = new Map();
    
    // Track initialization state
    this.initialized = false;
    
    console.log('MovementEngine: Initialized with documented logic system');
    
    // Initialize if GameStateManager is ready
    if (this.gameStateManager && this.gameStateManager.isProperlyInitialized) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the movement engine
   */
  initialize() {
    if (this.initialized) return;
    
    try {
      // Validate that we have the required data
      if (!this.gameStateManager.spaces || this.gameStateManager.spaces.length === 0) {
        console.warn('MovementEngine: No spaces data available for initialization');
        return;
      }
      
      // Build space type cache
      this.buildSpaceTypeCache();
      
      this.initialized = true;
      console.log('MovementEngine: Initialization completed');
    } catch (error) {
      console.error('MovementEngine: Initialization failed:', error);
    }
  }
  
  /**
   * Check if the engine is ready to use
   * @returns {boolean} True if ready
   */
  isReady() {
    return this.initialized && 
           this.gameStateManager && 
           this.gameStateManager.isProperlyInitialized &&
           this.gameStateManager.spaces &&
           this.gameStateManager.spaces.length > 0;
  }
  
  /**
   * Build cache of space types for performance
   */
  buildSpaceTypeCache() {
    this.spaceTypeCache.clear();
    
    if (!this.gameStateManager.spaces) return;
    
    this.gameStateManager.spaces.forEach(space => {
      const spaceType = this.determineSpaceType(space);
      this.spaceTypeCache.set(space.name, spaceType);
    });
    
    console.log(`MovementEngine: Built space type cache for ${this.spaceTypeCache.size} spaces`);
  }
  
  /**
   * Determine the type of a space based on CSV data
   * @param {Object} space - Space object from CSV
   * @returns {string} Space type
   */
  determineSpaceType(space) {
    if (!space || !space.Path) return 'unknown';
    
    const path = space.Path.toLowerCase();
    
    if (path === 'main') return 'main';
    if (path === 'single choice') return 'singleChoice';
    if (path === 'logic') return 'logic';
    if (path === 'special') return 'special';
    if (path.includes('side quest')) return 'sideQuest';
    
    return 'unknown';
  }
  
  /**
   * Get space type for a given space name
   * @param {string} spaceName - Name of the space
   * @returns {string} Space type
   */
  getSpaceType(spaceName) {
    if (!spaceName) return 'unknown';
    
    // Check cache first
    if (this.spaceTypeCache.has(spaceName)) {
      return this.spaceTypeCache.get(spaceName);
    }
    
    // Find space and determine type
    const space = this.findSpaceByName(spaceName);
    if (!space) return 'unknown';
    
    const spaceType = this.determineSpaceType(space);
    this.spaceTypeCache.set(spaceName, spaceType);
    
    return spaceType;
  }
  
  /**
   * Find a space by name
   * @param {string} spaceName - Name to search for
   * @returns {Object|null} Space object or null
   */
  findSpaceByName(spaceName) {
    if (!this.gameStateManager.spaces || !spaceName) return null;
    
    console.log('MovementEngine: Finding space by name:', spaceName);
    
    // First try exact match
    let space = this.gameStateManager.spaces.find(s => s.name === spaceName);
    console.log('MovementEngine: Exact match result:', !!space);
    
    // If not found, try normalized name match
    if (!space) {
      const normalizedName = this.extractSpaceName(spaceName);
      console.log('MovementEngine: Trying normalized name:', normalizedName);
      space = this.gameStateManager.spaces.find(s => 
        this.extractSpaceName(s.name) === normalizedName
      );
      console.log('MovementEngine: Normalized match result:', !!space);
    }
    
    // If still not found, try case-insensitive match
    if (!space) {
      const lowerCaseName = spaceName.toLowerCase();
      console.log('MovementEngine: Trying case-insensitive match for:', lowerCaseName);
      space = this.gameStateManager.spaces.find(s => 
        s.name.toLowerCase() === lowerCaseName
      );
      console.log('MovementEngine: Case-insensitive match result:', !!space);
    }
    
    // If still not found, try removing suffixes like "-first", "-subsequent" and convert to uppercase
    if (!space) {
      const baseName = spaceName.replace(/-(?:first|subsequent)$/i, '').toUpperCase();
      console.log('MovementEngine: Trying uppercase base name without suffix:', baseName);
      space = this.gameStateManager.spaces.find(s => 
        s.name.toUpperCase() === baseName
      );
      console.log('MovementEngine: Uppercase base name match result:', !!space);
    }
    
    if (space) {
      console.log('MovementEngine: Found space:', space.name);
    } else {
      console.log('MovementEngine: No space found for:', spaceName);
      console.log('MovementEngine: Available space names:', this.gameStateManager.spaces.map(s => s.name).slice(0, 10));
    }
    
    return space;
  }
  
  /**
   * Extract space name from display text
   * @param {string} displayName - Display name that might include descriptions
   * @returns {string} Cleaned space name
   */
  extractSpaceName(displayName) {
    if (!displayName) return '';
    
    // Handle common patterns
    if (displayName.includes(' - ')) {
      return displayName.split(' - ')[0].trim();
    }
    
    return displayName.trim();
  }
  
  /**
   * Get available movements for a player - Main API method
   * @param {Object} player - Player object
   * @returns {Array|Object} Array of movement options or object with requiresDiceRoll flag
   */
  getAvailableMovements(player) {
    if (!this.isReady()) {
      console.warn('MovementEngine: Not ready for movement calculation');
      return [];
    }
    
    if (!player || !player.position) {
      console.warn('MovementEngine: Invalid player for movement calculation');
      return [];
    }
    
    // Get current space data
    const currentSpace = this.getCurrentSpaceData(player);
    if (!currentSpace) {
      console.warn(`MovementEngine: No space data found for ${player.position}`);
      return [];
    }
    
    // Check if dice roll is required before movement
    if (this.spaceRequiresDiceRoll(currentSpace, player)) {
      return {
        requiresDiceRoll: true,
        spaceName: currentSpace.name,
        visitType: this.getVisitType(player, currentSpace)
      };
    }
    
    // Get space type and handle accordingly
    const spaceType = this.getSpaceType(currentSpace.name);
    
    switch (spaceType) {
      case 'logic':
        return this.getLogicSpaceMovements(player, currentSpace);
        
      case 'singleChoice':
        return this.getSingleChoiceMovements(player, currentSpace);
        
      case 'special':
        return this.getSpecialSpaceMovements(player, currentSpace);
        
      case 'main':
      case 'sideQuest':
      default:
        return this.getStandardMovements(player, currentSpace);
    }
  }
  
  /**
   * Get current space data for a player
   * @param {Object} player - Player object
   * @returns {Object|null} Space data with visit type
   */
  getCurrentSpaceData(player) {
    if (!player || !player.position) {
      console.log('MovementEngine: No player or position for getCurrentSpaceData');
      return null;
    }
    
    console.log('MovementEngine: Getting space data for player position:', player.position);
    console.log('MovementEngine: Sample space data structure:', this.gameStateManager.spaces[0]);
    console.log('MovementEngine: Available columns:', Object.keys(this.gameStateManager.spaces[0] || {}));
    
    // Find space by ID first
    let space = this.gameStateManager.findSpaceById(player.position);
    
    // If not found by ID, try by name
    if (!space) {
      space = this.findSpaceByName(player.position);
    }
    
    console.log('MovementEngine: Found base space:', space ? space.name : 'not found');
    if (!space) return null;
    
    // Get visit type and find appropriate space data
    const visitType = this.getVisitType(player, space);
    console.log('MovementEngine: Visit type determined:', visitType);
    
    // Find space data with matching visit type
    const spaceData = this.gameStateManager.spaces.find(s => {
      const nameMatch = s.name === space.name;
      // Try multiple possible column names for visit type
      const visitTypeValue = s['Visit Type'] || s['visitType'] || s['visit_type'] || s['VisitType'];
      const visitMatch = visitTypeValue === visitType;
      console.log(`MovementEngine: Checking space '${s.name}' with visit type '${visitTypeValue}' - name match: ${nameMatch}, visit match: ${visitMatch}`);
      return nameMatch && visitMatch;
    });
    
    console.log('MovementEngine: Final space data found:', !!spaceData);
    if (spaceData) {
      console.log('MovementEngine: Space data details:', {
        name: spaceData.name,
        visitType: spaceData['Visit Type'] || spaceData['visitType'] || spaceData['visit_type'] || spaceData['VisitType'],
        space1: spaceData['Space 1'] || spaceData['rawSpace1'],
        space2: spaceData['Space 2'] || spaceData['rawSpace2'],
        space3: spaceData['Space 3'] || spaceData['rawSpace3'],
        space4: spaceData['Space 4'] || spaceData['rawSpace4'],
        space5: spaceData['Space 5'] || spaceData['rawSpace5']
      });
    }
    
    return spaceData || space;
  }
  
  /**
   * Determine visit type for a player and space
   * @param {Object} player - Player object
   * @param {Object} space - Space object
   * @returns {string} "First" or "Subsequent"
   */
  getVisitType(player, space) {
    if (!player || !space) return 'First';
    
    return this.hasPlayerVisitedSpace(player, space.name) ? 'Subsequent' : 'First';
  }
  
  /**
   * Check if player has visited a space before
   * @param {Object} player - Player object
   * @param {string} spaceName - Space name to check
   * @returns {boolean} True if visited before
   */
  hasPlayerVisitedSpace(player, spaceName) {
    if (!player.visitedSpaces) return false;
    
    // Handle both Set and Array for visitedSpaces
    const visitedSpaces = Array.isArray(player.visitedSpaces) ? 
      new Set(player.visitedSpaces) : player.visitedSpaces;
    
    const normalizedSpaceName = this.extractSpaceName(spaceName);
    return visitedSpaces.has(normalizedSpaceName);
  }
  
  /**
   * Check if space requires a dice roll
   * @param {Object} spaceData - Space data object
   * @param {Object} player - Player object
   * @returns {boolean} True if dice roll required
   */
  spaceRequiresDiceRoll(spaceData, player) {
    if (!spaceData || !this.gameStateManager.diceRollData) return false;
    
    // If player already rolled dice this turn, don't require another
    if (this.movementState.hasRolledDice) return false;
    
    // Check if space has dice roll data
    const visitType = this.getVisitType(player, spaceData);
    const diceData = this.gameStateManager.diceRollData.find(roll => 
      roll['Space Name'] === spaceData.name && roll['Visit Type'] === visitType
    );
    
    return !!diceData;
  }
  
  /**
   * Get movements for logic spaces
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {Array} Array of movement options
   */
  getLogicSpaceMovements(player, spaceData) {
    // Logic spaces require special handling with decision trees
    // Return a special object indicating logic space processing is needed
    return {
      isLogicSpace: true,
      spaceName: spaceData.name,
      requiresLogicProcessing: true,
      currentQuestion: this.getCurrentLogicQuestion(player, spaceData)
    };
  }
  
  /**
   * Get current logic question for a player in a logic space
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {Object|null} Logic question data
   */
  getCurrentLogicQuestion(player, spaceData) {
    // Initialize logic state if not present
    if (!player.logicState) {
      player.logicState = {};
    }
    
    const spaceName = spaceData.name;
    if (!player.logicState[spaceName]) {
      player.logicState[spaceName] = { currentQuestion: 1 };
    }
    
    const currentQuestionNum = player.logicState[spaceName].currentQuestion;
    const spaceColumn = `Space ${currentQuestionNum}`;
    const questionText = spaceData[spaceColumn];
    
    if (!questionText) {
      console.warn(`MovementEngine: No question found for ${spaceName} Space ${currentQuestionNum}`);
      return null;
    }
    
    return this.parseLogicQuestion(questionText, spaceData);
  }
  
  /**
   * Parse logic question from space column text
   * @param {string} questionText - Raw question text from CSV
   * @param {Object} spaceData - Space data for context
   * @returns {Object|null} Parsed question data
   */
  parseLogicQuestion(questionText, spaceData) {
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
        noIndex = -1;
      }
    }
    
    if (yesIndex === -1 || noIndex === -1) {
      console.warn('MovementEngine: Parse failed - yesIndex:', yesIndex, 'noIndex:', noIndex);
      return null;
    }
    
    let yesDestination = answersText.substring(yesIndex + 5, noIndex).trim();
    let noDestination = answersText.substring(noIndex + 4).trim();
    
    // Resolve "Space X" references to actual column values
    if (yesDestination.startsWith('Space ')) {
      const spaceRef = spaceData[yesDestination];
      if (spaceRef) yesDestination = spaceRef;
    }
    
    if (noDestination.startsWith('Space ')) {
      const spaceRef = spaceData[noDestination];
      if (spaceRef) noDestination = spaceRef;
    }
    
    return {
      question: question,
      yes: yesDestination,
      no: noDestination
    };
  }
  
  /**
   * Handle logic choice selection
   * @param {Object} player - Player object
   * @param {string} spaceName - Current space name
   * @param {boolean} choice - true for YES, false for NO
   * @returns {Object} Next step information
   */
  handleLogicChoice(player, spaceName, choice) {
    if (!player.logicState || !player.logicState[spaceName]) {
      console.error('MovementEngine: No logic state found for', spaceName);
      return null;
    }
    
    const spaceData = this.getCurrentSpaceData(player);
    if (!spaceData) {
      console.error('MovementEngine: No space data found for logic choice');
      return null;
    }
    
    const questionData = this.getCurrentLogicQuestion(player, spaceData);
    if (!questionData) {
      console.error('MovementEngine: No question data found for logic choice');
      return null;
    }
    
    const destination = choice ? questionData.yes : questionData.no;
    
    // Check if destination is another question (Space X) or final destination
    if (destination.includes('Space ')) {
      const spaceMatch = destination.match(/Space (\d+)/);
      if (spaceMatch) {
        const nextQuestionNum = parseInt(spaceMatch[1]);
        player.logicState[spaceName].currentQuestion = nextQuestionNum;
        return {
          type: 'nextQuestion',
          questionNumber: nextQuestionNum,
          nextQuestion: this.getCurrentLogicQuestion(player, spaceData)
        };
      }
    }
    
    // Final destination - handle multiple destinations separated by " or "
    const destinations = destination.includes(' or ') ? 
      destination.split(' or ').map(d => d.trim()) : [destination];
    
    // Clean up logic state
    delete player.logicState[spaceName];
    
    return {
      type: 'finalDestination',
      destinations: destinations.map(dest => {
        const cleanDest = this.extractSpaceName(dest);
        const space = this.findSpaceByName(cleanDest);
        return space ? {
          id: space.id || this.generateSpaceId(space.name),
          name: space.name,
          type: this.getSpaceType(space.name),
          description: dest,
          visitType: this.getVisitType(player, space),
          fromLogicSpace: true
        } : null;
      }).filter(Boolean)
    };
  }
  
  /**
   * Get movements for single choice spaces
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {Array} Array of movement options
   */
  getSingleChoiceMovements(player, spaceData) {
    const spaceName = spaceData.name;
    
    // Initialize single choice tracking if not present
    if (!player.singleChoices) {
      player.singleChoices = {};
    }
    
    // Check if player has made a choice here before
    const previousChoice = player.singleChoices[spaceName];
    
    if (previousChoice) {
      // Player has been here before, only show their previous choice
      const choiceSpace = this.findSpaceByName(previousChoice);
      if (choiceSpace) {
        return [{
          id: choiceSpace.id || this.generateSpaceId(choiceSpace.name),
          name: choiceSpace.name,
          type: this.getSpaceType(choiceSpace.name),
          description: `Your chosen path: ${choiceSpace.name}`,
          visitType: this.getVisitType(player, choiceSpace),
          isPermanentChoice: true,
          isRepeatedChoice: true
        }];
      }
    }
    
    // First time here, show all options and mark them as permanent choices
    const movements = this.extractSpaceMovements(spaceData, player);
    return movements.map(movement => ({
      ...movement,
      isPermanentChoice: true,
      isFirstTimeChoice: true
    }));
  }
  
  /**
   * Record a single choice decision
   * @param {Object} player - Player object
   * @param {string} spaceName - Space where choice was made
   * @param {string} chosenDestination - Destination that was chosen
   */
  recordSingleChoice(player, spaceName, chosenDestination) {
    if (!player.singleChoices) {
      player.singleChoices = {};
    }
    
    player.singleChoices[spaceName] = chosenDestination;
    
    console.log(`MovementEngine: Recorded permanent choice at ${spaceName}: ${chosenDestination}`);
  }
  
  /**
   * Check if a destination conflicts with previous single choice decisions
   * @param {Object} player - Player object
   * @param {string} destination - Destination to check
   * @returns {boolean} True if there's a conflict
   */
  conflictsWithSingleChoice(player, destination) {
    if (!player.singleChoices || !this.gameStateManager.spaces) {
      return false;
    }
    
    // Get all single choice spaces and their destinations
    const singleChoiceSpaces = this.gameStateManager.spaces.filter(space => 
      this.getSpaceType(space.name) === 'singleChoice'
    );
    
    for (let space of singleChoiceSpaces) {
      const spaceName = space.name;
      const chosenDestination = player.singleChoices[spaceName];
      
      if (chosenDestination) {
        // Get all possible destinations from this single choice space
        const possibleDestinations = [
          space["Space 1"],
          space["Space 2"], 
          space["Space 3"],
          space["Space 4"],
          space["Space 5"]
        ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null")
         .map(dest => {
          // Extract space name (part before " - " if it exists)
          let destName = dest.toString();
          if (destName.includes(" - ")) {
            destName = destName.split(" - ")[0].trim();
          }
          return destName;
        });
        
        // If the current destination was an option but wasn't chosen, it conflicts
        if (possibleDestinations.includes(destination) && destination !== chosenDestination) {
          console.log(`MovementEngine: Filtering out ${destination} - conflicts with choice ${chosenDestination} made at ${spaceName}`);
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Get movements for special spaces
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {Array} Array of movement options
   */
  getSpecialSpaceMovements(player, spaceData) {
    return this.extractSpaceMovements(spaceData, player);
  }
  
  /**
   * Get movements for standard spaces (main path, side quest)
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {Array} Array of movement options
   */
  getStandardMovements(player, spaceData) {
    // Check if dice result determines movement
    if (this.movementState.hasRolledDice && this.movementState.diceResult) {
      const diceMovements = this.getDiceMovements(player, spaceData);
      if (diceMovements.length > 0) {
        return diceMovements;
      }
    }
    
    return this.extractSpaceMovements(spaceData, player);
  }
  
  /**
   * Get movements determined by dice results
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {Array} Array of dice-determined movements
   */
  getDiceMovements(player, spaceData) {
    if (!this.gameStateManager.diceRollData || !this.movementState.diceResult) {
      return [];
    }
    
    const visitType = this.getVisitType(player, spaceData);
    const diceData = this.gameStateManager.diceRollData.find(roll => 
      roll['Space Name'] === spaceData.name && roll['Visit Type'] === visitType
    );
    
    if (!diceData) return [];
    
    const outcome = diceData[this.movementState.diceResult.toString()];
    if (!outcome) return [];
    
    return this.parseMovementOutcome(outcome, player);
  }
  
  /**
   * Parse movement outcome from dice result
   * @param {string} outcome - Dice outcome text
   * @param {Object} player - Player object
   * @returns {Array} Array of movement options
   */
  parseMovementOutcome(outcome, player) {
    const movements = [];
    
    if (outcome.includes(' or ')) {
      // Multiple options separated by " or "
      const options = outcome.split(' or ').map(opt => opt.trim());
      options.forEach(option => {
        const spaceName = this.extractSpaceName(option);
        const space = this.findSpaceByName(spaceName);
        if (space && this.isValidDestination(player, spaceName)) {
          movements.push({
            id: space.id || this.generateSpaceId(space.name),
            name: space.name,
            type: this.getSpaceType(space.name),
            description: option,
            visitType: this.getVisitType(player, space),
            fromDiceRoll: true
          });
        }
      });
    } else if (outcome.includes('-')) {
      // Single destination with description
      const spaceName = this.extractSpaceName(outcome);
      const space = this.findSpaceByName(spaceName);
      if (space && this.isValidDestination(player, spaceName)) {
        movements.push({
          id: space.id || this.generateSpaceId(space.name),
          name: space.name,
          type: this.getSpaceType(space.name),
          description: `Dice Result: ${outcome}`,
          visitType: this.getVisitType(player, space),
          fromDiceRoll: true
        });
      }
    }
    
    return movements;
  }
  
  /**
   * Extract movement options from space data
   * @param {Object} spaceData - Space data object
   * @param {Object} player - Player object
   * @returns {Array} Array of movement options
   */
  extractSpaceMovements(spaceData, player) {
    console.log('MovementEngine: Extracting movements from space:', spaceData.name);
    console.log('MovementEngine: Full space data object:', spaceData);
    const movements = [];
    
    // Get raw destinations from Space 1-5 columns - try multiple column name variations
    const rawDestinations = [
      spaceData["Space 1"] || spaceData["rawSpace1"] || spaceData["space1"],
      spaceData["Space 2"] || spaceData["rawSpace2"] || spaceData["space2"], 
      spaceData["Space 3"] || spaceData["rawSpace3"] || spaceData["space3"],
      spaceData["Space 4"] || spaceData["rawSpace4"] || spaceData["space4"],
      spaceData["Space 5"] || spaceData["rawSpace5"] || spaceData["space5"]
    ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null");
    
    console.log('MovementEngine: Raw destinations found:', rawDestinations);
    console.log('MovementEngine: Space data columns available:', Object.keys(spaceData));
    
    // Process each destination
    rawDestinations.forEach((dest, index) => {
      const destStr = dest.toString();
      console.log(`MovementEngine: Processing destination ${index + 1}:`, destStr);
      
      // Skip invalid entries
      if (destStr === "n/a" || destStr.toLowerCase().includes("n/a")) {
        console.log('MovementEngine: Skipping n/a destination');
        return;
      }
      
      // Handle {ORIGINAL_SPACE} token
      if (destStr.includes("{ORIGINAL_SPACE}")) {
        console.log('MovementEngine: Processing {ORIGINAL_SPACE} token');
        console.log('MovementEngine: Player previousPosition:', player.previousPosition);
        const originalSpaceMovements = this.getOriginalSpaceMovements(player);
        console.log('MovementEngine: Original space movements found:', originalSpaceMovements.length);
        movements.push(...originalSpaceMovements);
        return;
      }
      
      // Extract space name
      let spaceName = this.extractSpaceName(destStr);
      console.log('MovementEngine: Extracted space name:', spaceName);
      
      // Validate destination
      const isValid = this.isValidDestination(player, spaceName);
      console.log('MovementEngine: Destination validation result:', isValid);
      if (!isValid) {
        console.log('MovementEngine: Destination rejected by validation');
        return;
      }
      
      // Find space object
      const space = this.findSpaceByName(spaceName);
      console.log('MovementEngine: Found space object:', !!space, space ? space.name : 'not found');
      if (!space) {
        console.log('MovementEngine: Space object not found for:', spaceName);
        console.log('MovementEngine: Available space names (first 20):', 
          this.gameStateManager.spaces ? this.gameStateManager.spaces.slice(0, 20).map(s => s.name) : 'No spaces');
        return;
      }
      
      const movement = {
        id: space.id || this.generateSpaceId(space.name),
        name: space.name,
        type: this.getSpaceType(space.name),
        description: destStr,
        visitType: this.getVisitType(player, space)
      };
      
      console.log('MovementEngine: Created movement option:', movement);
      movements.push(movement);
    });
    
    console.log('MovementEngine: Final movements array:', movements);
    return movements;
  }
  
  /**
   * Get movements from {ORIGINAL_SPACE} token
   * @param {Object} player - Player object
   * @returns {Array} Array of movement options from original space
   */
  getOriginalSpaceMovements(player) {
    const movements = [];
    
    console.log('MovementEngine: getOriginalSpaceMovements called with player:', player.name);
    console.log('MovementEngine: Player previousPosition:', player.previousPosition);
    
    if (!player.previousPosition) {
      console.log('MovementEngine: No previousPosition found, returning empty movements');
      return movements;
    }
    
    // Get original space data
    const originalSpace = this.gameStateManager.findSpaceById(player.previousPosition);
    if (!originalSpace) return movements;
    
    // Get movement options from original space
    const originalSpaceData = this.gameStateManager.spaces.find(s => 
      s.name === originalSpace.name && s['Visit Type'] === 'First'
    );
    
    if (!originalSpaceData) return movements;
    
    // Extract destinations from original space
    const originalDestinations = [
      originalSpaceData["Space 1"],
      originalSpaceData["Space 2"], 
      originalSpaceData["Space 3"],
      originalSpaceData["Space 4"],
      originalSpaceData["Space 5"]
    ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null");
    
    originalDestinations.forEach(dest => {
      const destStr = dest.toString();
      
      // Skip invalid entries and PM-DECISION-CHECK to prevent loops
      if (destStr === "n/a" || destStr.toLowerCase().includes("n/a")) return;
      if (destStr.includes("PM-DECISION-CHECK")) return;
      
      // Extract space name
      let spaceName = this.extractSpaceName(destStr);
      
      // Validate destination
      if (!this.isValidDestination(player, spaceName)) return;
      
      // Find space object
      const space = this.findSpaceByName(spaceName);
      if (!space) return;
      
      movements.push({
        id: space.id || this.generateSpaceId(space.name),
        name: space.name,
        type: this.getSpaceType(space.name),
        description: `Continue: ${destStr}`,
        visitType: this.getVisitType(player, space),
        fromOriginalSpace: true,
        originalSpaceName: originalSpace.name
      });
    });
    
    return movements;
  }
  
  /**
   * Check if a destination is valid for a player
   * @param {Object} player - Player object
   * @param {string} destination - Destination space name
   * @returns {boolean} True if valid
   */
  isValidDestination(player, destination) {
    if (!destination) return false;
    
    // Check if destination exists
    const space = this.findSpaceByName(destination);
    if (!space) return false;
    
    // Check for single choice conflicts
    if (this.conflictsWithSingleChoice(player, destination)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Generate a space ID from space name
   * @param {string} spaceName - Space name
   * @returns {string} Generated ID
   */
  generateSpaceId(spaceName) {
    return spaceName
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }
  
  /**
   * Handle dice roll completion
   * @param {Object} player - Player object
   * @param {number} diceResult - Dice result (1-6)
   */
  handleDiceRollCompleted(player, diceResult) {
    this.movementState.hasRolledDice = true;
    this.movementState.diceResult = diceResult;
    
    const currentSpace = this.getCurrentSpaceData(player);
    if (currentSpace) {
      // Apply space effects with dice result
      this.applySpaceEffects(player, currentSpace, diceResult);
    }
    
    console.log(`MovementEngine: Dice roll completed: ${diceResult}`);
  }
  
  /**
   * Apply space effects to a player (penalties, rewards, card draws)
   * @param {Object} player - Player object
   * @param {Object} spaceData - Space data
   * @param {number} diceResult - Optional dice result
   */
  applySpaceEffects(player, spaceData, diceResult = null) {
    if (!player || !spaceData) return;
    
    console.log(`MovementEngine: Applying space effects for ${player.name}`);
    
    // Apply time penalties
    if (spaceData.Time && spaceData.Time !== "null" && spaceData.Time !== "n/a") {
      const timeMatch = spaceData.Time.match(/[\d.]+/);
      if (timeMatch) {
        const timeValue = parseFloat(timeMatch[0]);
        if (!player.resources) player.resources = { time: 0, money: 0 };
        player.resources.time = (player.resources.time || 0) + timeValue;
        console.log(`MovementEngine: Applied time penalty: ${timeValue} days`);
      }
    }
    
    // Apply fee penalties
    if (spaceData.Fee && spaceData.Fee !== "null" && spaceData.Fee !== "n/a") {
      const feeMatch = spaceData.Fee.match(/[\d.]+/);
      if (feeMatch) {
        const feeValue = parseFloat(feeMatch[0]);
        if (!player.resources) player.resources = { time: 0, money: 0 };
        player.resources.money = (player.resources.money || 0) - feeValue;
        console.log(`MovementEngine: Applied fee penalty: $${feeValue}`);
      }
    }
    
    // Apply card effects
    this.applyCardEffects(player, spaceData, diceResult);
  }
  
  /**
   * Apply card effects from space or dice results
   * @param {Object} player - Player object
   * @param {Object} spaceData - Space data
   * @param {number} diceResult - Optional dice result
   */
  applyCardEffects(player, spaceData, diceResult = null) {
    if (!player.cards) {
      player.cards = { W: 0, B: 0, I: 0, L: 0, E: 0 };
    }
    
    // Apply dice-based card draws first
    if (diceResult && this.gameStateManager.diceRollData) {
      this.applyDiceCardEffects(player, spaceData, diceResult);
    }
    
    // Apply fixed card draws from space
    const cardFields = ['W Card', 'B Card', 'I Card', 'L card', 'E Card'];
    cardFields.forEach(cardField => {
      const cardValue = spaceData[cardField];
      if (cardValue && cardValue.includes('Draw')) {
        const drawMatch = cardValue.match(/Draw (\d+)/);
        if (drawMatch) {
          const drawCount = parseInt(drawMatch[1]);
          const cardKey = cardField.charAt(0); // W, B, I, L, E
          player.cards[cardKey] = (player.cards[cardKey] || 0) + drawCount;
          console.log(`MovementEngine: Drew ${drawCount} ${cardKey} cards from space requirement`);
        }
      }
    });
  }
  
  /**
   * Apply dice-based card effects
   * @param {Object} player - Player object
   * @param {Object} spaceData - Space data
   * @param {number} diceResult - Dice result (1-6)
   */
  applyDiceCardEffects(player, spaceData, diceResult) {
    const visitType = this.getVisitType(player, spaceData);
    const diceData = this.gameStateManager.diceRollData.find(roll => 
      roll['Space Name'] === spaceData.name && roll['Visit Type'] === visitType
    );
    
    if (!diceData) return;
    
    const outcome = diceData[diceResult.toString()];
    if (!outcome || !outcome.includes('Draw')) return;
    
    const drawMatch = outcome.match(/Draw (\d+)/);
    if (!drawMatch) return;
    
    const drawCount = parseInt(drawMatch[1]);
    
    // Determine card type from dice roll type
    const diceType = diceData["Die Roll"];
    if (diceType && diceType.includes('W')) {
      player.cards.W = (player.cards.W || 0) + drawCount;
      console.log(`MovementEngine: Drew ${drawCount} W cards from dice result`);
    }
    if (diceType && diceType.includes('B')) {
      player.cards.B = (player.cards.B || 0) + drawCount;
      console.log(`MovementEngine: Drew ${drawCount} B cards from dice result`);
    }
    if (diceType && diceType.includes('I')) {
      player.cards.I = (player.cards.I || 0) + drawCount;
      console.log(`MovementEngine: Drew ${drawCount} I cards from dice result`);
    }
    if (diceType && diceType.includes('L')) {
      player.cards.L = (player.cards.L || 0) + drawCount;
      console.log(`MovementEngine: Drew ${drawCount} L cards from dice result`);
    }
    if (diceType && diceType.includes('E')) {
      player.cards.E = (player.cards.E || 0) + drawCount;
      console.log(`MovementEngine: Drew ${drawCount} E cards from dice result`);
    }
  }
  
  /**
   * Execute a complete turn transition with space effects and visit tracking
   * @param {Object} player - Player object
   * @param {string} destinationId - Destination space ID
   * @returns {Object} Turn completion result
   */
  executePlayerMove(player, destinationId) {
    if (!player || !destinationId) {
      console.error('MovementEngine: Invalid parameters for executePlayerMove');
      return { success: false, error: 'Invalid parameters' };
    }
    
    const currentSpace = this.getCurrentSpaceData(player);
    const destinationSpace = this.gameStateManager.findSpaceById(destinationId) || 
      this.findSpaceByName(destinationId);
    
    if (!destinationSpace) {
      console.error('MovementEngine: Destination space not found:', destinationId);
      return { success: false, error: 'Destination not found' };
    }
    
    // Record single choice if applicable
    if (currentSpace && this.getSpaceType(currentSpace.name) === 'singleChoice') {
      this.recordSingleChoice(player, currentSpace.name, destinationSpace.name);
    }
    
    // Mark current space as visited before leaving
    this.markSpaceAsVisited(player, player.position);
    
    // Update player position
    const oldPosition = player.position;
    
    // Update previousPosition for {ORIGINAL_SPACE} tracking
    if (currentSpace && this.getSpaceType(currentSpace.name) === 'main') {
      player.previousPosition = oldPosition;
    }
    
    player.position = destinationSpace.id || destinationSpace.name;
    
    // Apply space effects at destination
    const destinationSpaceData = this.getCurrentSpaceData(player);
    if (destinationSpaceData) {
      this.applySpaceEffects(player, destinationSpaceData, this.movementState.diceResult);
    }
    
    // Reset movement state for new turn
    this.resetMovementState();
    
    console.log(`MovementEngine: Player ${player.name} moved from ${oldPosition} to ${player.position}`);
    
    return {
      success: true,
      fromSpace: oldPosition,
      toSpace: player.position,
      spaceData: destinationSpaceData
    };
  }
  
  /**
   * Mark a space as visited by a player
   * @param {Object} player - Player object
   * @param {string} spaceId - Space ID to mark as visited
   */
  markSpaceAsVisited(player, spaceId) {
    if (!player.visitedSpaces) {
      player.visitedSpaces = new Set();
    }
    
    // Handle both Set and Array for visitedSpaces
    if (Array.isArray(player.visitedSpaces)) {
      player.visitedSpaces = new Set(player.visitedSpaces);
    }
    
    const spaceName = this.extractSpaceName(spaceId);
    player.visitedSpaces.add(spaceName);
    
    console.log(`MovementEngine: Marked ${spaceName} as visited for ${player.name}`);
  }
  
  /**
   * Check if current player can negotiate (stay and skip turn)
   * @param {Object} player - Player object
   * @returns {boolean} True if negotiation is allowed
   */
  canNegotiate(player) {
    const spaceData = this.getCurrentSpaceData(player);
    return spaceData && spaceData.Negotiate === "YES";
  }
  
  /**
   * Handle negotiation (player chooses to stay and skip turn)
   * @param {Object} player - Player object
   * @returns {Object} Negotiation result
   */
  handleNegotiation(player) {
    if (!this.canNegotiate(player)) {
      return { success: false, error: 'Negotiation not allowed at this space' };
    }
    
    // Add time penalty for negotiating (like in the test file)
    if (!player.resources) {
      player.resources = { time: 0, money: 0 };
    }
    player.resources.time += 1;
    
    // Reset movement state but don't move player
    this.resetMovementState();
    
    console.log(`MovementEngine: ${player.name} chose to negotiate and stay (+1 day penalty)`);
    
    return {
      success: true,
      timePenalty: 1,
      message: `${player.name} chose to negotiate and stay at ${player.position} (+1 day penalty)`
    };
  }
  
  /**
   * Reset movement state for new turn
   */
  resetMovementState() {
    this.movementState = {
      inLogicSpace: false,
      currentLogicQuestion: 1,
      logicQuestionDisplayed: false,
      selectedDestination: null,
      pendingMovement: null,
      hasRolledDice: false,
      diceResult: null
    };
    
    // Clear caches
    this.movementOptionsCache.clear();
  }
  
  /**
   * Get debug information
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    const currentPlayer = this.gameStateManager.getCurrentPlayer();
    
    return {
      initialized: this.initialized,
      ready: this.isReady(),
      spaceTypesCached: this.spaceTypeCache.size,
      movementState: { ...this.movementState },
      currentPlayer: currentPlayer ? {
        id: currentPlayer.id,
        name: currentPlayer.name,
        position: currentPlayer.position,
        visitedSpaces: currentPlayer.visitedSpaces ? Array.from(currentPlayer.visitedSpaces) : []
      } : null
    };
  }
  
  /**
   * Clear all caches
   */
  clearCaches() {
    this.spaceTypeCache.clear();
    this.movementOptionsCache.clear();
    console.log('MovementEngine: Caches cleared');
  }
  
  /**
   * Cleanup resources
   */
  cleanup() {
    this.clearCaches();
    this.resetMovementState();
    this.initialized = false;
    
    if (this.movementCore && typeof this.movementCore.cleanup === 'function') {
      this.movementCore.cleanup();
    }
    
    console.log('MovementEngine: Cleanup completed');
  }
}

// Export MovementEngine for use in other files
window.MovementEngine = MovementEngine;

// Create a singleton instance for global use
if (window.GameStateManager) {
  window.movementEngine = new MovementEngine(window.GameStateManager);
} else {
  // Wait for GameStateManager to be available
  const waitForGameStateManager = () => {
    if (window.GameStateManager) {
      window.movementEngine = new MovementEngine(window.GameStateManager);
      console.log('MovementEngine: Singleton instance created');
    } else {
      setTimeout(waitForGameStateManager, 100);
    }
  };
  waitForGameStateManager();
}

console.log('MovementEngine.js code execution finished - Complete documented logic system implemented [2025-05-26]');