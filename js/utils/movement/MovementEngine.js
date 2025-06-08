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
  window.LOADED_VERSIONS['MovementEngine'] = '2025-06-04-001';
  console.log('MovementEngine: Version 2025-06-04-001 loaded - Fixed pure dice movement spaces (CON-ISSUES, REG-DOB-PLAN-EXAM, CHEAT-BYPASS) incorrectly triggering emergency fallbacks');
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
    
    console.log('MovementEngine: Constructor completed - initialization deferred until data is ready');
    
    // CRITICAL FIX: Do NOT initialize here - wait for explicit initialization call
    // This prevents premature initialization before CSV data is loaded
  }
  
  /**
   * Initialize the movement engine - FIXED to require proper dependencies
   */
  initialize() {
    if (this.initialized) {
      console.log('MovementEngine: Already initialized, skipping');
      return true;
    }
    
    try {
      // CRITICAL FIX: Validate ALL required dependencies before initialization
      if (!this.gameStateManager) {
        console.error('MovementEngine: GameStateManager not available');
        return false;
      }
      
      if (!this.gameStateManager.isProperlyInitialized) {
        console.error('MovementEngine: GameStateManager not properly initialized');
        return false;
      }
      
      if (!this.gameStateManager.spaces || !Array.isArray(this.gameStateManager.spaces)) {
        console.error('MovementEngine: No spaces data available for initialization');
        return false;
      }
      
      if (this.gameStateManager.spaces.length === 0) {
        console.error('MovementEngine: Spaces array is empty');
        return false;
      }
      
      // CRITICAL FIX: Validate that diceRollData is also available
      if (!this.gameStateManager.diceRollData || !Array.isArray(this.gameStateManager.diceRollData)) {
        console.error('MovementEngine: No dice roll data available for initialization');
        return false;
      }
      
      // Build space type cache
      this.buildSpaceTypeCache();
      
      this.initialized = true;
      console.log('MovementEngine: Initialization completed successfully');
      console.log(`MovementEngine: Initialized with ${this.gameStateManager.spaces.length} spaces and ${this.gameStateManager.diceRollData.length} dice outcomes`);
      return true;
    } catch (error) {
      console.error('MovementEngine: Initialization failed:', error);
      this.initialized = false;
      return false;
    }
  }
  
  /**
   * Check if the engine is ready to use - ENHANCED validation
   * @returns {boolean} True if ready
   */
  isReady() {
    const checks = {
      initialized: this.initialized,
      gameStateManager: !!this.gameStateManager,
      gameStateInitialized: this.gameStateManager?.isProperlyInitialized,
      hasSpaces: this.gameStateManager?.spaces?.length > 0,
      hasDiceData: this.gameStateManager?.diceRollData?.length > 0
    };
    
    const isReady = Object.values(checks).every(check => check === true);
    
    if (!isReady) {
      console.log('MovementEngine: Not ready, failed checks:', 
        Object.entries(checks).filter(([key, value]) => !value).map(([key]) => key)
      );
    }
    
    return isReady;
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
    
    console.log('MovementEngine: getSpaceType called for:', spaceName);
    
    // Check cache first
    if (this.spaceTypeCache.has(spaceName)) {
      const cachedType = this.spaceTypeCache.get(spaceName);
      console.log('MovementEngine: Found cached type for', spaceName, ':', cachedType);
      return cachedType;
    }
    
    // Find space and determine type
    const space = this.gameStateManager.findSpaceByName(spaceName);
    if (!space) {
      console.log('MovementEngine: No space found for', spaceName);
      return 'unknown';
    }
    
    console.log('MovementEngine: Found space for type detection:', space.name, 'Path:', space.Path);
    
    const spaceType = this.determineSpaceType(space);
    console.log('MovementEngine: Determined space type for', spaceName, ':', spaceType);
    
    this.spaceTypeCache.set(spaceName, spaceType);
    
    return spaceType;
  }
  

  /**
   * Extract space name from display text - FIXED VERSION
   * @param {string} displayName - Display name that might include descriptions
   * @returns {string} Cleaned space name
   */
  extractSpaceName(displayName) {
    if (!displayName) return '';
    
    let name = displayName;
    
    // Handle common patterns - remove " - " descriptions
    if (name.includes(' - ')) {
      name = name.split(' - ')[0].trim();
    }
    
    // CRITICAL FIX: Remove visit type suffixes (-first, -subsequent) from space IDs
    name = name.replace(/-(?:first|subsequent)$/i, '');
    
    // CRITICAL FIX: Convert to uppercase to match CSV space names  
    name = name.toUpperCase();
    
    // Handle special case normalization
    if (name === 'OWNER SCOPE INITIATION') {
      name = 'OWNER-SCOPE-INITIATION';
    }
    
    console.log(`MovementEngine: extractSpaceName('${displayName}') -> '${name}'`);
    return name;
  }
  
  /**
   * Get available movements for a player - FIXED to handle not ready state
   * @param {Object} player - Player object
   * @returns {Array|Object} Array of movement options or object with requiresDiceRoll flag
   */
  getAvailableMovements(player) {
    if (!this.isReady()) {
      console.error('MovementEngine: Cannot calculate movements - engine not ready');
      console.error('MovementEngine: Player attempted to get movements for:', player?.name || 'unknown player');
      
      // CRITICAL FIX: Return empty array instead of fallback IDs
      // This prevents the system from generating invalid "space-X-fallback" IDs
      return [];
    }
    
    if (!player || !player.position) {
      console.warn('MovementEngine: Invalid player for movement calculation');
      return [];
    }
    
    // Get current space data
    const currentSpace = this.getCurrentSpaceData(player);
    
    // FIXED: Check for spaces with no movement data, but skip spaces that use dice for movement
    if (currentSpace && this.hasEmptyMovementData(currentSpace) && !this.hasDiceMovementData(currentSpace, player)) {
      console.warn(`MovementEngine: Space ${currentSpace.name} has no movement data defined`);
      console.warn('MovementEngine: This indicates incomplete CSV data setup');
      
      // Provide emergency fallback movements based on space type
      return this.getEmergencyFallbackMovements(player, currentSpace);
    }
    if (!currentSpace) {
      console.warn(`MovementEngine: No space data found for ${player.position}`);
      return [];
    }
    
    // ORIGINAL LOGIC: Simple dice check - if space requires dice and no dice rolled, require dice
    if (this.spaceRequiresDiceRoll(currentSpace, player)) {
      console.log('MovementEngine: Dice roll required before movement');
      return {
        requiresDiceRoll: true,
        spaceName: currentSpace.name,
        visitType: this.getVisitType(player, currentSpace)
      };
    }
    
    // ORIGINAL LOGIC: Check if dice result determines movement (like the original updateMovementSection)
    const diceMovements = this.getDiceMovements(player, currentSpace);
    if (diceMovements.length > 0) {
      console.log('MovementEngine: Using dice-determined movements:', diceMovements.length);
      return diceMovements;
    }
    
    // Check space type and handle accordingly
    const spaceType = this.getSpaceType(currentSpace.name);
    console.log('MovementEngine: Space type determined:', spaceType, 'for space:', currentSpace.name);
    
    if (spaceType === 'singleChoice') {
      console.log('MovementEngine: Using single choice movements');
      return this.getSingleChoiceMovements(player, currentSpace);
    } else if (spaceType === 'logic') {
      console.log('MovementEngine: Using logic space movements');
      return this.getLogicSpaceMovements(player, currentSpace);
    } else {
      // ORIGINAL LOGIC: Get standard movements from Space 1-5 columns (like original extractSpaceMovements)
      const standardMovements = this.extractSpaceMovements(currentSpace, player);
      console.log('MovementEngine: Using standard movements from space columns:', standardMovements.length);
      
      // PHASE 1 ENHANCEMENT: Add PM-DECISION-CHECK logic from SpaceInfoMoves
      const enhancedMovements = this.enhanceMovesForPMDecisionCheck(standardMovements, player, currentSpace);
      console.log('MovementEngine: Enhanced movements for PM-DECISION-CHECK:', enhancedMovements.length);
      
      return enhancedMovements;
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
    
    // Find space by ID first
    let space = this.gameStateManager.findSpaceById(player.position);
    
    // If not found by ID, try by name using GameStateManager
    if (!space) {
      space = this.gameStateManager.findSpaceByName(player.position);
    }
    
    console.log('MovementEngine: Found base space:', space ? space.name : 'not found');
    if (!space) return null;
    
    // Get visit type and find appropriate space data
    const visitType = this.getVisitType(player, space);
    console.log('MovementEngine: Visit type determined:', visitType);
    
    // Find space data with matching visit type
    const spaceData = this.gameStateManager.spaces.find(s => {
      const nameMatch = s.name === space.name;
      const visitTypeValue = s['visit_type'] || s.visitType;
      const visitMatch = visitTypeValue === visitType;
      console.log(`MovementEngine: Checking space '${s.name}' with visit type '${visitTypeValue}' - name match: ${nameMatch}, visit match: ${visitMatch}`);
      return nameMatch && visitMatch;
    });
    
    console.log('MovementEngine: Final space data found:', !!spaceData);
    if (spaceData) {
      console.log('MovementEngine: Space data details:', {
        name: spaceData.name,
        visitType: spaceData['visit_type'] || spaceData.visitType,
        space1: spaceData['space_1'],
        space2: spaceData['space_2'],
        space3: spaceData['space_3'],
        space4: spaceData['space_4'],
        space5: spaceData['space_5']
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
   * Check if player has visited a space before - FIXED VERSION
   * @param {Object} player - Player object
   * @param {string} spaceName - Space name to check
   * @returns {boolean} True if visited before
   */
  hasPlayerVisitedSpace(player, spaceName) {
    if (!player.visitedSpaces) return false;
    
    // Handle both Set and Array for visitedSpaces
    const visitedSpaces = Array.isArray(player.visitedSpaces) ? 
      new Set(player.visitedSpaces) : player.visitedSpaces;
    
    // CRITICAL FIX: Use extractSpaceName to normalize both the check name and stored names
    const normalizedSpaceName = this.extractSpaceName(spaceName);
    
    console.log(`MovementEngine: hasPlayerVisitedSpace checking for '${normalizedSpaceName}' (from '${spaceName}')`);
    console.log(`MovementEngine: visitedSpaces contains:`, Array.from(visitedSpaces));
    
    const hasVisited = visitedSpaces.has(normalizedSpaceName);
    console.log(`MovementEngine: Result: ${hasVisited}`);
    
    return hasVisited;
  }
  
  /**
   * Check if space requires a dice roll - ORIGINAL LOGIC RESTORED
   * @param {Object} spaceData - Space data object
   * @param {Object} player - Player object
   * @returns {boolean} True if dice roll required
   */
  spaceRequiresDiceRoll(spaceData, player) {
    if (!spaceData || !this.gameStateManager.diceRollData) return false;
    
    // Check if dice roll data exists for this space
    const visitType = this.getVisitType(player, spaceData);
    const diceData = this.gameStateManager.diceRollData.find(roll => 
      roll['space_name'] === spaceData.name && roll['visit_type'] === visitType
    );
    
    if (!diceData) return false;
    
    // ORIGINAL LOGIC: Only check internal MovementEngine state
    // Do NOT sync stale dice results from other sources
    const hasRolledDice = this.movementState.hasRolledDice;
    
    console.log(`MovementEngine: Space ${spaceData.name} requires dice: ${!!diceData}, has rolled: ${hasRolledDice}`);
    
    // ORIGINAL LOGIC: If space needs dice and no dice rolled, require dice
    return !hasRolledDice;
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
   * Parse logic question from space column text - FIXED VERSION
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
    
    // Look for YES pattern
    const yesIndex = answersText.indexOf('YES -');
    if (yesIndex === -1) {
      console.warn('MovementEngine: Parse failed - no YES found in:', answersText);
      return null;
    }
    
    // CRITICAL FIX: Find the correct " NO -" pattern
    // Use lastIndexOf to get the actual NO answer, not one embedded in destination names
    let noIndex = answersText.lastIndexOf(' NO -');
    
    // If lastIndexOf didn't work, try finding "NO -" at the start
    if (noIndex === -1) {
      const startNoIndex = answersText.indexOf('NO -');
      if (startNoIndex === 0) {
        noIndex = 0;
      }
    }
    
    if (noIndex === -1) {
      console.warn('MovementEngine: Parse failed - no NO found in:', answersText);
      console.warn('MovementEngine: yesIndex:', yesIndex, 'noIndex:', noIndex);
      return null;
    }
    
    // Extract destinations
    let yesDestination = answersText.substring(yesIndex + 5, noIndex).trim();
    let noDestination = answersText.substring(noIndex + (noIndex === 0 ? 3 : 4)).trim();
    
    // Remove trailing " -" if present (CSV formatting artifact)
    if (yesDestination.endsWith(' -')) {
      yesDestination = yesDestination.slice(0, -2).trim();
    }
    if (noDestination.endsWith(' -')) {
      noDestination = noDestination.slice(0, -2).trim();
    }
    
    // Resolve "Space X" references to actual column values
    if (yesDestination.startsWith('Space ')) {
      const spaceRef = spaceData[yesDestination];
      if (spaceRef) yesDestination = spaceRef;
    }
    
    if (noDestination.startsWith('Space ')) {
      const spaceRef = spaceData[noDestination];
      if (spaceRef) noDestination = spaceRef;
    }
    
    console.log('MovementEngine: Parsed logic question successfully:');
    console.log('  Question:', question);
    console.log('  YES destination:', yesDestination);
    console.log('  NO destination:', noDestination);
    
    return {
      question: question,
      yes: yesDestination,
      no: noDestination
    };
  }
  
  /**
   * Handle logic choice selection - FIXED to properly detect questions vs destinations
   * @param {Object} player - Player object
   * @param {string} spaceName - Current space name
   * @param {boolean} choice - true for YES, false for NO
   * @returns {Object} Next step information
   */
  handleLogicChoice(player, spaceName, choice) {
    // CRITICAL FIX: Only process logic choices for spaces that are actually logic spaces
    const spaceType = this.getSpaceType(spaceName);
    if (spaceType !== 'logic') {
      console.warn(`MovementEngine: handleLogicChoice called on non-logic space: ${spaceName} (type: ${spaceType})`);
      return null;
    }
    
    // Initialize logic state if not present (same as getCurrentLogicQuestion)
    if (!player.logicState) {
      player.logicState = {};
    }
    
    if (!player.logicState[spaceName]) {
      player.logicState[spaceName] = { currentQuestion: 1 };
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
    
    console.log('MovementEngine: Logic choice made:', choice ? 'YES' : 'NO');
    console.log('MovementEngine: Raw destination:', destination);
    
    // CRITICAL FIX: Check if destination contains a question (has "?") - this means it's another question
    if (destination.includes('?')) {
      console.log('MovementEngine: Destination contains "?", treating as another question:', destination);
      // This is another question - parse it and continue in logic space
      const newQuestionData = this.parseLogicQuestion(destination, spaceData);
      if (newQuestionData) {
        // Increment question number for tracking
        const currentQuestionNum = player.logicState[spaceName].currentQuestion;
        player.logicState[spaceName].currentQuestion = currentQuestionNum + 1;
        
        console.log('MovementEngine: Successfully parsed next question, staying in logic space');
        return {
          type: 'nextQuestion',
          questionNumber: currentQuestionNum + 1,
          nextQuestion: newQuestionData
        };
      } else {
        console.warn('MovementEngine: Failed to parse question from destination:', destination);
      }
    }
    
    // FALLBACK: Check if destination is a Space X reference that needs resolution
    if (destination.includes('Space ')) {
      console.log('MovementEngine: Destination contains "Space", checking if it\'s a reference:', destination);
      const spaceMatch = destination.match(/Space (\d+)/);
      if (spaceMatch) {
        const nextQuestionNum = parseInt(spaceMatch[1]);
        const nextQuestionText = spaceData[`Space ${nextQuestionNum}`];
        console.log(`MovementEngine: Looking up Space ${nextQuestionNum}:`, nextQuestionText);
        
        if (nextQuestionText && nextQuestionText.includes('?')) {
          // It's another question
          console.log('MovementEngine: Space reference contains question, continuing in logic space');
          player.logicState[spaceName].currentQuestion = nextQuestionNum;
          return {
            type: 'nextQuestion',
            questionNumber: nextQuestionNum,
            nextQuestion: this.getCurrentLogicQuestion(player, spaceData)
          };
        } else {
          console.log('MovementEngine: Space reference does not contain question, treating as final destination');
        }
      }
    }
    
    console.log('MovementEngine: Treating destination as final space destination(s):', destination);
    
    // PART 2 FIX: Handle "or" in final destinations
    let destinationOptions;
    if (destination.includes(' or ')) {
      // Split destinations separated by " or "
      destinationOptions = destination.split(' or ').map(d => d.trim());
      console.log('MovementEngine: Found multiple destinations with "or":', destinationOptions);
    } else {
      // Single destination
      destinationOptions = [destination];
      console.log('MovementEngine: Single destination:', destinationOptions);
    }
    
    // Process each destination option
    const processedDestinations = destinationOptions.map(dest => {
      const cleanDest = this.extractSpaceName(dest);
      const space = this.gameStateManager.findSpaceByName(cleanDest);
      
      if (!space) {
        console.warn('MovementEngine: Could not find space for destination:', dest, '-> cleaned:', cleanDest);
        return null;
      }
      
      // CRITICAL FIX: Use space name as ID for logic destinations
      // This ensures executePlayerMove can find the space properly
      return {
        id: space.name, // Use actual space name, not generated ID
        name: space.name,
        type: this.getSpaceType(space.name),
        description: dest, // Keep original description with any extra text
        visitType: this.getVisitType(player, space),
        fromLogicSpace: true
      };
    }).filter(Boolean); // Remove any null entries
    
    console.log('MovementEngine: Processed destinations:', processedDestinations.length, 'valid options');
    
    // FIXED: For FDNY logic spaces, return destinations as selectable options requiring "end turn"
    // instead of immediately processing them
    if (spaceName === 'REG-FDNY-FEE-REVIEW') {
      console.log('MovementEngine: FDNY logic space - returning destinations as selectable options');
      
      // Don't clean up logic state yet - keep it until player actually moves
      // This allows proper tracking of the logic flow
      
      return {
        type: 'selectableDestinations',
        destinations: processedDestinations,
        hasMultipleOptions: processedDestinations.length > 1,
        requiresEndTurn: true // Flag indicating these require "end turn" button
      };
    }
    
    // For other logic spaces, clean up logic state and process immediately
    delete player.logicState[spaceName];
    
    return {
      type: 'finalDestination',
      destinations: processedDestinations,
      hasMultipleOptions: processedDestinations.length > 1
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
    const visitType = this.getVisitType(player, spaceData);
    
    console.log(`MovementEngine: Getting single choice movements for ${spaceName}, visit type: ${visitType}`);
    
    // Initialize single choice tracking if not present
    if (!player.singleChoices) {
      player.singleChoices = {};
    }
    
    // For subsequent visits, need to determine what was chosen originally
    if (visitType === 'Subsequent') {
      console.log('MovementEngine: Subsequent visit to single choice space');
      
      // Check if we have the choice recorded
      const previousChoice = player.singleChoices[spaceName];
      if (previousChoice) {
        console.log('MovementEngine: Found recorded choice:', previousChoice);
        const choiceSpace = this.gameStateManager.findSpaceByName(previousChoice);
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
      } else {
        // Need to infer the choice from visited spaces
        console.log('MovementEngine: No recorded choice, inferring from visited spaces');
        const inferredChoice = this.inferSingleChoice(player, spaceData);
        if (inferredChoice) {
          console.log('MovementEngine: Inferred choice:', inferredChoice);
          // Record the inferred choice for future visits
          player.singleChoices[spaceName] = inferredChoice;
          
          const choiceSpace = this.gameStateManager.findSpaceByName(inferredChoice);
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
      }
    }
    
    // First time here, get actual options from First visit data
    console.log('MovementEngine: First visit to single choice space, getting original options');
    const firstVisitData = this.gameStateManager.spaces.find(s => 
      s.name === spaceName && s['Visit Type'] === 'First'
    );
    
    if (firstVisitData) {
      const movements = this.extractSpaceMovements(firstVisitData, player);
      return movements.map(movement => ({
        ...movement,
        isPermanentChoice: true,
        isFirstTimeChoice: true
      }));
    }
    
    console.warn('MovementEngine: No movements found for single choice space');
    return [];
  }
  
  /**
   * Infer single choice from player's visited spaces
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {string|null} Inferred choice or null
   */
  inferSingleChoice(player, spaceData) {
    // Get the first visit data to see what the original options were
    const firstVisitData = this.gameStateManager.spaces.find(s => 
      s.name === spaceData.name && s['Visit Type'] === 'First'
    );
    
    if (!firstVisitData) {
      console.log('MovementEngine: No first visit data found for inference');
      return null;
    }
    
    // Get the original choice options
    const originalChoices = [
      firstVisitData["space_1"],
      firstVisitData["space_2"],
      firstVisitData["space_3"],
      firstVisitData["space_4"],
      firstVisitData["space_5"]
    ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null")
     .map(dest => {
       let spaceName = dest.toString();
       if (spaceName.includes(" - ")) {
         spaceName = spaceName.split(" - ")[0].trim();
       }
       return spaceName;
     });
    
    console.log('MovementEngine: Original choice options:', originalChoices);
    console.log('MovementEngine: Player visited spaces:', Array.from(player.visitedSpaces || []));
    
    // Check which of these choices the player has visited
    for (const choice of originalChoices) {
      if (this.hasPlayerVisitedSpace(player, choice)) {
        console.log('MovementEngine: Found visited choice:', choice);
        return choice;
      }
    }
    
    console.log('MovementEngine: Could not infer choice from visited spaces');
    return null;
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
   * Check if a destination conflicts with previous single choice decisions - WITH AUDIT OVERRIDE
   * @param {Object} player - Player object
   * @param {string} destination - Destination to check
   * @returns {boolean} True if there's a conflict
   */
  conflictsWithSingleChoice(player, destination) {
    if (!player.singleChoices || !this.gameStateManager.spaces) {
      return false;
    }
    
    // AUDIT OVERRIDE: If player is in audit, allow slow path access regardless of original choice
    if (this.isPlayerInAudit(player) && destination === 'REG-DOB-PLAN-EXAM') {
      console.log(`MovementEngine: Allowing ${destination} - player is in audit, overriding single choice restriction`);
      return false;
    }
    
    // AUDIT RESTRICTION: If player is in audit, block fast path access
    if (this.isPlayerInAudit(player) && destination === 'REG-DOB-PROF-CERT') {
      console.log(`MovementEngine: Blocking ${destination} - player is in audit, must use slow path`);
      return true;
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
          space["space_1"],
          space["space_2"], 
          space["space_3"],
          space["space_4"],
          space["space_5"]
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
   * Get movements determined by dice results - FIXED LOGIC
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {Array} Array of dice-determined movements
   */
  getDiceMovements(player, spaceData) {
    if (!this.gameStateManager.diceRollData) {
      console.log('MovementEngine: No dice roll data available');
      return [];
    }
    
    // ORIGINAL LOGIC: Only use dice result from current movement state
    // Do NOT pull stale results from other sources
    const diceResult = this.movementState.diceResult;
    
    if (!diceResult) {
      console.log('MovementEngine: No dice result for current space/turn');
      return [];
    }
    
    console.log('MovementEngine: Processing dice movements with result:', diceResult);
    console.log('MovementEngine: Current space for dice lookup:', spaceData.name);
    
    const visitType = this.getVisitType(player, spaceData);
    console.log('MovementEngine: Visit type for dice lookup:', visitType);
    
    // DEBUG: Log available dice data
    const availableDiceData = this.gameStateManager.diceRollData.filter(roll => 
      roll['space_name'] === spaceData.name
    );
    console.log('MovementEngine: Available dice data for space:', spaceData.name, availableDiceData);
    
    const diceData = this.gameStateManager.diceRollData.find(roll => 
      roll['space_name'] === spaceData.name && roll['visit_type'] === visitType
    );
    
    if (!diceData) {
      console.log('MovementEngine: No dice data found for', spaceData.name, visitType);
      console.log('MovementEngine: All available dice space names:', 
        [...new Set(this.gameStateManager.diceRollData.map(d => d['space_name']))]);
      return [];
    }
    
    console.log('MovementEngine: Found dice data:', {
      spaceName: diceData['space_name'],
      visitType: diceData['visit_type'],
      dieRoll: diceData['die_roll']
    });
    
    const outcome = diceData[diceResult.toString()];
    if (!outcome) {
      console.log('MovementEngine: No outcome found for dice result', diceResult);
      console.log('MovementEngine: Available dice outcomes:', {
        '1': diceData['1'], '2': diceData['2'], '3': diceData['3'],
        '4': diceData['4'], '5': diceData['5'], '6': diceData['6']
      });
      return [];
    }
    
    console.log('MovementEngine: Found dice outcome for roll', diceResult, ':', outcome);
    
    // Parse movement outcome from dice result
    const movements = this.parseMovementOutcome(outcome, player);
    console.log('MovementEngine: Parsed', movements.length, 'movements from dice outcome');
    
    return movements;
  }
  
  /**
   * Parse movement outcome from dice result - FIXED VERSION using sample file logic
   * @param {string} outcome - Dice outcome text
   * @param {Object} player - Player object
   * @returns {Array} Array of movement options
   */
  parseMovementOutcome(outcome, player) {
    const movements = [];
    
    console.log('MovementEngine: Parsing dice outcome:', outcome);
    
    // Handle case where outcome contains movement destinations (like sample file)
    if (outcome && (outcome.includes(' or ') || outcome.includes('-'))) {
      
      if (outcome.includes(' or ')) {
        // Multiple options separated by " or " - EXACT SAMPLE FILE LOGIC
        const options = outcome.split(' or ').map(opt => opt.trim());
        console.log('MovementEngine: Found multiple dice options:', options);
        
        options.forEach(option => {
          // Extract space name (part before " - " if it exists) - SAMPLE FILE LOGIC
          let spaceName = option;
          if (option.includes(' - ')) {
            spaceName = option.split(' - ')[0].trim();
          }
          
          console.log('MovementEngine: Processing dice option:', option, '-> spaceName:', spaceName);
          
          // Handle truncated space names (from sample file)
          if (spaceName === 'REG-DOB-FEE-') {
            spaceName = 'REG-DOB-FEE-REVIEW';
          }
          
          // Check if it's a valid space name - DIRECT CHECK like sample file
          const spaceExists = this.gameStateManager.spaces && 
          this.gameStateManager.spaces.some(s => s.name === spaceName);
          
          console.log('MovementEngine: Space exists check for', spaceName, ':', spaceExists);
          
          // DEBUG: If space not found, log available space names to help debug
          if (!spaceExists) {
            console.log('MovementEngine: Space not found. Available space names:', 
              this.gameStateManager.spaces.slice(0, 10).map(s => s.name)
            );
          }
          
          if (spaceExists && !this.conflictsWithSingleChoice(player, spaceName)) {
            // CRITICAL FIX: Generate proper visit-type-aware space ID for dice movements
            const visitType = this.getVisitType(player, { name: spaceName });
            const properSpaceId = spaceName
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .toLowerCase() + '-' + visitType.toLowerCase();
              
            movements.push({
              id: properSpaceId, // Use visit-type-aware ID
              name: spaceName, // Use the verified space name directly
              type: this.getSpaceType(spaceName),
              description: option,
              visitType: visitType,
              fromDiceRoll: true
            });
            console.log('MovementEngine: Added dice movement option:', spaceName, 'with ID:', properSpaceId);
          } else {
            console.log('MovementEngine: Rejected dice option:', spaceName, 'exists:', spaceExists);
          }
        });
        
      } else if (outcome.includes('-')) {
        // Single destination with description - SAMPLE FILE LOGIC  
        let spaceName = outcome;
        if (outcome.includes(' - ')) {
          spaceName = outcome.split(' - ')[0].trim();
        }
        
        console.log('MovementEngine: Processing single dice outcome:', outcome, '-> spaceName:', spaceName);
        
        // Handle truncated space names (from sample file)
        if (spaceName === 'REG-DOB-FEE-') {
          spaceName = 'REG-DOB-FEE-REVIEW';
        }
        
        // Check if it's a valid space name - DIRECT CHECK like sample file
        const spaceExists = this.gameStateManager.spaces && 
          this.gameStateManager.spaces.some(s => s.name === spaceName);
        
        console.log('MovementEngine: Single space exists check for', spaceName, ':', spaceExists);
        
        // DEBUG: If space not found, log available space names to help debug
        if (!spaceExists) {
          console.log('MovementEngine: Single space not found. Available space names:', 
            this.gameStateManager.spaces.slice(0, 10).map(s => s.name)
          );
        }
        
        if (spaceExists && !this.conflictsWithSingleChoice(player, spaceName)) {
          // CRITICAL FIX: Generate proper visit-type-aware space ID for single dice movements
          const visitType = this.getVisitType(player, { name: spaceName });
          const properSpaceId = spaceName
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase() + '-' + visitType.toLowerCase();
            
          movements.push({
            id: properSpaceId, // Use visit-type-aware ID
            name: spaceName, // Use the verified space name directly
            type: this.getSpaceType(spaceName),
            description: `Dice Result: ${outcome}`,
            visitType: visitType,
            fromDiceRoll: true
          });
          console.log('MovementEngine: Added single dice movement:', spaceName, 'with ID:', properSpaceId);
        } else {
          console.log('MovementEngine: Rejected single dice option:', spaceName, 'exists:', spaceExists);
        }
      }
    } else {
      console.log('MovementEngine: Dice outcome does not contain movement destinations:', outcome);
    }
    
    console.log('MovementEngine: Final dice movements parsed:', movements.length, 'options');
    return movements;
  }
  
  /**
   * Extract movement options from space data - REFERENCE FILE LOGIC
   * @param {Object} spaceData - Space data object
   * @param {Object} player - Player object
   * @returns {Array} Array of movement options
   */
  extractSpaceMovements(spaceData, player) {
    console.log('MovementEngine: Extracting movements from space:', spaceData.name);
    const movements = [];
    
    // Get raw destinations from Space 1-5 columns
    const rawDestinations = [
      spaceData["space_1"],
      spaceData["space_2"], 
      spaceData["space_3"],
      spaceData["space_4"],
      spaceData["space_5"]
    ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null");
    
    console.log('MovementEngine: Raw destinations found:', rawDestinations);
    
    // Clean and validate destinations
    rawDestinations.forEach(dest => {
      const destStr = dest.toString();
      console.log('MovementEngine: Processing destination:', destStr);
      
      // Skip invalid entries
      if (destStr === "n/a" || destStr.toLowerCase().includes("n/a")) {
        console.log('MovementEngine: Skipping n/a destination');
        return;
      }
      
      // Handle {ORIGINAL_SPACE} token - EXACT REFERENCE FILE LOGIC
      if (destStr.includes("{ORIGINAL_SPACE}")) {
        console.log('MovementEngine: Processing {ORIGINAL_SPACE} token');
        console.log('MovementEngine: Player previousSpace:', player.previousSpace);
        
        if (player.previousSpace) {
          // Get movement options from the original space
          const originalSpaceData = this.gameStateManager.spaces.find(space => 
            space.name === player.previousSpace
          );
          
          console.log('MovementEngine: Found original space data:', !!originalSpaceData);
          
          if (originalSpaceData) {
            const originalDestinations = [
              originalSpaceData["space_1"],
              originalSpaceData["space_2"], 
              originalSpaceData["space_3"],
              originalSpaceData["space_4"],
              originalSpaceData["space_5"]
            ].filter(origDest => origDest && origDest.toString().trim() !== "" && origDest !== "null");
            
            console.log('MovementEngine: Original destinations found:', originalDestinations);
            
            // Add each original destination (except PM-DECISION-CHECK to prevent loops)
            originalDestinations.forEach(origDest => {
              const origDestStr = origDest.toString();
              if (origDestStr === "n/a" || origDestStr.toLowerCase().includes("n/a")) return;
              
              let spaceName = origDestStr;
              if (origDestStr.includes(" - ")) {
                spaceName = origDestStr.split(" - ")[0].trim();
              }
              
              // Filter out PM-DECISION-CHECK to prevent loops
              if (spaceName === "PM-DECISION-CHECK") {
                console.log('MovementEngine: Filtered out PM-DECISION-CHECK to prevent loops');
                return;
              }
              
              // Validate that this is a real space name
              if (this.gameStateManager.spaces.some(s => s.name === spaceName)) {
                // CRITICAL FIX: Generate proper visit-type-aware space ID for original space movements
                const visitType = this.getVisitType(player, { name: spaceName });
                const properSpaceId = spaceName
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .toLowerCase() + '-' + visitType.toLowerCase();
                  
                movements.push({
                  id: properSpaceId, // Use visit-type-aware ID
                  name: spaceName,
                  type: 'standard',
                  description: `Continue: ${origDestStr}`,
                  visitType: visitType,
                  fromOriginalSpace: true,
                  originalSpaceName: player.previousSpace
                });
                console.log('MovementEngine: Added original space movement:', spaceName, 'with ID:', properSpaceId);
              } else {
                console.log('MovementEngine: Space not found for original movement:', spaceName);
              }
            });
          } else {
            console.log('MovementEngine: No original space data found for:', player.previousSpace);
          }
        } else {
          console.log('MovementEngine: No previousSpace found on player');
        }
        return; // Skip the {ORIGINAL_SPACE} token itself
      }
      
      // Extract space name (part before " - " if it exists)
      let spaceName = destStr;
      if (destStr.includes(" - ")) {
        spaceName = destStr.split(" - ")[0].trim();
      }
      
      console.log('MovementEngine: Extracted space name:', spaceName);
      
      // Validate that this is a real space name
      const spaceExists = this.gameStateManager.spaces.some(s => s.name === spaceName);
      if (spaceExists) {
        // CRITICAL FIX: Generate proper visit-type-aware space ID
        const visitType = this.getVisitType(player, { name: spaceName });
        const properSpaceId = spaceName
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase() + '-' + visitType.toLowerCase();
        
        movements.push({
          id: properSpaceId, // Use visit-type-aware ID
          name: spaceName,
          type: 'standard', 
          description: destStr,
          visitType: visitType
        });
        console.log('MovementEngine: Added movement:', spaceName, 'with ID:', properSpaceId);
      } else {
        console.log('MovementEngine: Space not found in game data:', spaceName);
        console.log('MovementEngine: Available space names:', this.gameStateManager.spaces.map(s => s.name).slice(0, 10));
      }
    });
    
    console.log('MovementEngine: Final movements array:', movements.length, 'movements');
    return movements;
  }
  
  /**
   * Helper to extract base name without visit type - FROM SPACEINFOMOVES
   * @param {string} spaceId - The space ID or name
   * @returns {string} - The base name without visit type
   */
  extractBaseName(spaceId) {
    if (!spaceId) return '';
    // Remove visit type suffix and get just the base name
    return spaceId.split('-first')[0].split('-subsequent')[0];
  }
  
  /**
   * Gets moves for a specific space from game data - FROM SPACEINFOMOVES
   * @param {Object} space - The space to get moves for
   * @returns {Array} - Array of move objects
   */
  getMovesForSpace(space) {
    console.log("MovementEngine: Getting moves for space:", space.name);
    
    if (!space || !this.gameStateManager || !this.gameStateManager.spaces) {
      console.log("MovementEngine: Missing space or GameStateManager");
      return [];
    }
    
    // Find the space data with "First" visit type (original moves)
    const spaceData = this.gameStateManager.spaces.find(s => 
      s.name === space.name && s['Visit Type'] === 'First'
    );
    
    if (!spaceData) {
      console.log("MovementEngine: No space data found for:", space.name);
      return [];
    }
    
    console.log("MovementEngine: Found space data:", spaceData);
    
    // Extract destinations from Space 1-5 columns
    const rawDestinations = [
      spaceData["space_1"],
      spaceData["space_2"], 
      spaceData["space_3"],
      spaceData["space_4"],
      spaceData["space_5"]
    ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null" && dest !== "n/a");
    
    console.log("MovementEngine: Raw destinations from original space:", rawDestinations);
    
    // Clean and validate destinations
    const moves = [];
    rawDestinations.forEach(dest => {
      const destStr = dest.toString();
      
      // Skip invalid entries
      if (destStr === "n/a" || destStr.toLowerCase().includes("n/a")) {
        return;
      }
      
      // Extract space name (part before " - " if it exists)
      let spaceName = destStr;
      if (destStr.includes(" - ")) {
        spaceName = destStr.split(" - ")[0].trim();
      }
      
      // Skip PM-DECISION-CHECK to prevent loops
      if (spaceName === "PM-DECISION-CHECK") {
        return;
      }
      
      // Validate that this is a real space name
      const destinationSpace = this.gameStateManager.spaces.find(s => s.name === spaceName);
      if (destinationSpace) {
        moves.push({
          id: spaceName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase(),
          name: spaceName,
          description: destStr,
          type: this.getSpaceType(spaceName),
          visitType: this.getVisitType({ visitedSpaces: new Set() }, { name: spaceName }),
          fromOriginalSpace: true
        });
        console.log("MovementEngine: Added move from original space:", spaceName);
      } else {
        console.log("MovementEngine: Space not found:", spaceName);
      }
    });
    
    console.log("MovementEngine: Final moves from original space:", moves.length, "moves");
    return moves;
  }
  
  /**
   * Enhance movements for PM-DECISION-CHECK spaces - FROM SPACEINFOMOVES LOGIC
   * @param {Array} movements - Current movements
   * @param {Object} player - Player object
   * @param {Object} currentSpace - Current space data
   * @returns {Array} Enhanced movements
   */
  enhanceMovesForPMDecisionCheck(movements, player, currentSpace) {
    console.log('MovementEngine: Enhancing moves for PM-DECISION-CHECK space');
    
    // Only process PM-DECISION-CHECK spaces
    if (!currentSpace || currentSpace.name !== 'PM-DECISION-CHECK') {
      return movements;
    }
    
    // Check if player has used CHEAT-BYPASS (point of no return)
    if (player.hasUsedCheatBypass || (player.properties && player.properties.hasUsedCheatBypass)) {
      console.log('MovementEngine: Player has used CHEAT-BYPASS, no return possible');
      return movements;
    }
    
    // Check if player came from a side quest space
    const previousSpaceId = player.previousPosition;
    if (!previousSpaceId) {
      console.log('MovementEngine: No previous space found');
      return movements;
    }
    
    const previousSpace = this.gameStateManager.findSpaceById(previousSpaceId);
    if (!previousSpace) {
      console.log('MovementEngine: Previous space not found');
      return movements;
    }
    
    // Use Path column to determine if coming from side quest
    const cameFromQuestSide = previousSpace.Path && 
      previousSpace.Path.toLowerCase().includes('side quest');
    
    console.log(`MovementEngine: Previous space: ${previousSpace.name} (Path: ${previousSpace.Path}), Coming from side quest: ${cameFromQuestSide}`);
    
    if (!cameFromQuestSide && previousSpace.Path && previousSpace.Path.toLowerCase() === 'main') {
      // Coming from main path - store originalSpaceId if not already stored
      if (!player.properties) {
        player.properties = {};
      }
      
      // Always update to most recent main path space
      player.properties.originalSpaceId = previousSpaceId;
      console.log(`MovementEngine: Stored originalSpaceId: ${previousSpaceId}`);
      
      // Save the state
      if (this.gameStateManager.saveState) {
        this.gameStateManager.saveState();
      }
      
      return movements; // Only show standard moves for first visit from main path
    } else if (cameFromQuestSide) {
      // Coming from quest side - get stored original space moves
      const originalSpaceId = player.properties?.originalSpaceId;
      console.log(`MovementEngine: Retrieved original space ID: ${originalSpaceId}`);
      
      if (originalSpaceId) {
        // Find original space
        const originalSpace = this.gameStateManager.findSpaceById(originalSpaceId);
        
        if (originalSpace) {
          console.log(`MovementEngine: Found original space: ${originalSpace.name}`);
          
          // Get moves from original space
          const originalMoves = this.getMovesForSpace(originalSpace);
          console.log(`MovementEngine: Found ${originalMoves.length} moves from original space`);
          
          // Add label to original space moves
          originalMoves.forEach(move => {
            move.description = `${move.description} (Return to ${this.extractBaseName(originalSpace.name)})`;
            move.fromOriginalSpace = true;
            move.originalSpaceId = originalSpaceId;
          });
          
          // Show both standard moves and original space moves
          return [...movements, ...originalMoves];
        }
      }
      
      console.log("MovementEngine: No original space found, showing standard moves only");
      return movements; // Fallback to standard moves
    }
    
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
    console.log('MovementEngine: Player previousSpace:', player.previousSpace);
    
    if (!player.previousSpace) {
      console.log('MovementEngine: No previousSpace found, returning empty movements');
      return movements;
    }
    
    // Get movement options from original space
    const originalSpaceData = this.gameStateManager.spaces.find(s => 
      s.name === player.previousSpace
    );
    
    console.log('MovementEngine: Found original space data:', !!originalSpaceData);
    
    if (!originalSpaceData) return movements;
    
    // Extract destinations from original space
    const originalDestinations = [
      originalSpaceData["space_1"],
      originalSpaceData["space_2"], 
      originalSpaceData["space_3"],
      originalSpaceData["space_4"],
      originalSpaceData["space_5"]
    ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null");
    
    console.log('MovementEngine: Original destinations:', originalDestinations);
    
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
      const space = this.gameStateManager.findSpaceByName(spaceName);
      if (!space) return;
      
      movements.push({
        id: space.id || this.generateSpaceId(space.name),
        name: space.name,
        type: this.getSpaceType(space.name),
        description: `Continue: ${destStr}`,
        visitType: this.getVisitType(player, space),
        fromOriginalSpace: true,
        originalSpaceName: player.previousSpace
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
    const space = this.gameStateManager.findSpaceByName(destination);
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
   * Set dice result for current space/turn - PUBLIC METHOD
   * @param {number} diceResult - Dice result (1-6)
   */
  setDiceResult(diceResult) {
    this.movementState.hasRolledDice = true;
    this.movementState.diceResult = diceResult;
    console.log(`MovementEngine: Dice result set to ${diceResult} for current turn`);
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
    const cardFields = ['w_card', 'b_card', 'i_card', 'l_card', 'e_card'];
    cardFields.forEach(cardField => {
      const cardValue = spaceData[cardField];
      if (cardValue && cardValue.includes('Draw')) {
        const drawMatch = cardValue.match(/Draw (\d+)/);
        if (drawMatch) {
          const drawCount = parseInt(drawMatch[1]);
          const cardKey = cardField.charAt(0).toUpperCase(); // W, B, I, L, E
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
      roll['space_name'] === spaceData.name && roll['visit_type'] === visitType
    );
    
    if (!diceData) return;
    
    const outcome = diceData[diceResult.toString()];
    if (!outcome || !outcome.includes('Draw')) return;
    
    const drawMatch = outcome.match(/Draw (\d+)/);
    if (!drawMatch) return;
    
    const drawCount = parseInt(drawMatch[1]);
    
    // Determine card type from dice roll type
    const diceType = diceData["die_roll"];
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
   * Execute a complete turn transition with space effects and visit tracking - WITH AUDIT MANAGEMENT
   * @param {Object} player - Player object
   * @param {string} destinationId - Destination space ID
   * @returns {Object} Turn completion result
   */
  executePlayerMove(player, destinationId) {
    if (!player || !destinationId) {
      console.error('MovementEngine: Invalid parameters for executePlayerMove');
      return { success: false, error: 'Invalid parameters' };
    }
    
    console.log(`MovementEngine: executePlayerMove called with destinationId: '${destinationId}'`);
    
    const currentSpace = this.getCurrentSpaceData(player);
    console.log('MovementEngine: Current space:', currentSpace ? currentSpace.name : 'none');
    
    // ENHANCED SPACE LOOKUP: Try multiple methods to find destination
    let destinationSpace = null;
    
    // Try 1: Direct findSpaceById
    destinationSpace = this.gameStateManager.findSpaceById(destinationId);
    console.log('MovementEngine: findSpaceById result:', !!destinationSpace);
    
    // Try 2: Direct findSpaceByName
    if (!destinationSpace) {
      destinationSpace = this.gameStateManager.findSpaceByName(destinationId);
      console.log('MovementEngine: findSpaceByName result:', !!destinationSpace);
    }
    
    // Try 3: Search in spaces array by name
    if (!destinationSpace && this.gameStateManager.spaces) {
      destinationSpace = this.gameStateManager.spaces.find(s => s.name === destinationId);
      console.log('MovementEngine: Direct spaces array search result:', !!destinationSpace);
    }
    
    if (!destinationSpace) {
      console.error('MovementEngine: Destination space not found:', destinationId);
      console.error('MovementEngine: Available space names:', this.gameStateManager.spaces.map(s => s.name).slice(0, 10));
      return { success: false, error: 'Destination not found' };
    }
    
    console.log('MovementEngine: Found destination space:', destinationSpace.name);
    
    // AUDIT MANAGEMENT: Check for audit entry
    if (destinationSpace.name === 'REG-DOB-AUDIT') {
      this.enterAudit(player);
    }
    
    // AUDIT MANAGEMENT: Check for audit resolution
    if (this.isPlayerInAudit(player) && this.shouldResolveAudit(currentSpace, destinationSpace)) {
      this.resolveAudit(player);
    }
    
    // Record single choice if applicable
    if (currentSpace && this.getSpaceType(currentSpace.name) === 'singleChoice') {
      this.recordSingleChoice(player, currentSpace.name, destinationSpace.name);
    }
    
    // Update previousSpace for {ORIGINAL_SPACE} tracking BEFORE moving
    if (currentSpace && this.getSpaceType(currentSpace.name) === 'main') {
      player.previousSpace = currentSpace.name; // Store the SPACE NAME, not position ID
      console.log('MovementEngine: Updated previousSpace to:', player.previousSpace);
    }
    
    // Store old position for return value
    const oldPosition = player.position;
    
    // FIXED: Use GameStateManager.movePlayer() for proper position tracking
    // This ensures previousPosition is set correctly and all movement logic is consistent
    console.log(`MovementEngine: Using GameStateManager.movePlayer() to move from '${oldPosition}' to '${destinationSpace.id}'`);
    this.gameStateManager.movePlayer(player.id, destinationSpace.id);
    
    // Get the updated position after GameStateManager processes the move
    const newPosition = player.position;
    console.log(`MovementEngine: Player position tracked: '${oldPosition}' -> '${newPosition}', previousPosition: '${player.previousPosition}'`);
    
    // Apply space effects at destination
    const destinationSpaceData = this.getCurrentSpaceData(player);
    if (destinationSpaceData) {
      this.applySpaceEffects(player, destinationSpaceData, this.movementState.diceResult);
    }
    
    // CRITICAL FIX: Clear logic state when leaving logic spaces
    if (currentSpace && this.getSpaceType(currentSpace.name) === 'logic') {
      console.log('MovementEngine: Clearing logic state when leaving logic space');
      if (player.logicState && player.logicState[currentSpace.name]) {
        delete player.logicState[currentSpace.name];
      }
    }
    
    // Reset movement state for new turn
    this.resetMovementState();
    
    // CRITICAL FIX: Reset dice state when moving to ensure clean turn
    this.resetDiceState();
    
    console.log(`MovementEngine: Player ${player.name} moved from ${oldPosition} to ${player.position}`);
    
    return {
      success: true,
      fromSpace: oldPosition,
      toSpace: player.position,
      spaceData: destinationSpaceData
    };
  }
  
  /**
   * Mark a space as visited by a player - FIXED VERSION
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
    
    // CRITICAL FIX: Use extractSpaceName to properly normalize the space name
    const normalizedSpaceName = this.extractSpaceName(spaceId);
    player.visitedSpaces.add(normalizedSpaceName);
    
    console.log(`MovementEngine: Marked '${normalizedSpaceName}' as visited for ${player.name} (from spaceId: '${spaceId}')`);
    console.log(`MovementEngine: Player ${player.name} visitedSpaces now contains:`, Array.from(player.visitedSpaces));
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
    
    // Clear caches to prevent stale data
    this.movementOptionsCache.clear();
    
    console.log('MovementEngine: Movement state and caches reset');
  }
  
  /**
   * Reset dice state when moving to new space - ADDED FOR ORIGINAL LOGIC
   */
  resetDiceState() {
    this.movementState.hasRolledDice = false;
    this.movementState.diceResult = null;
    console.log('MovementEngine: Dice state reset for new space');
  }
  
  /**
   * Check if player is currently in audit
   * @param {Object} player - Player object
   * @returns {boolean} True if player is in audit
   */
  isPlayerInAudit(player) {
    return player.auditStatus && player.auditStatus.inAudit === true;
  }
  
  /**
   * Enter audit state for a player
   * @param {Object} player - Player object
   */
  enterAudit(player) {
    // Initialize audit status if not present
    if (!player.auditStatus) {
      player.auditStatus = {};
    }
    
    // Store original path choice
    const originalChoice = player.singleChoices ? player.singleChoices['REG-DOB-TYPE-SELECT'] : null;
    
    player.auditStatus = {
      inAudit: true,
      originalPath: originalChoice,
      auditSpace: 'REG-DOB-AUDIT',
      entryTime: Date.now()
    };
    
    console.log(`MovementEngine: Player ${player.name} entered audit. Original path: ${originalChoice}`);
  }
  
  /**
   * Check if audit should be resolved based on movement
   * @param {Object} currentSpace - Current space data
   * @param {Object} destinationSpace - Destination space data
   * @returns {boolean} True if audit should be resolved
   */
  shouldResolveAudit(currentSpace, destinationSpace) {
    // Audit is resolved when moving away from REG-DOB-PLAN-EXAM after completing audit process
    // This is when player has successfully resolved the audit issues
    return currentSpace && 
           currentSpace.name === 'REG-DOB-PLAN-EXAM' && 
           destinationSpace && 
           destinationSpace.name !== 'REG-DOB-PLAN-EXAM' &&
           destinationSpace.name !== 'REG-DOB-AUDIT';
  }
  
  /**
   * Resolve audit state for a player
   * @param {Object} player - Player object
   */
  resolveAudit(player) {
    if (!this.isPlayerInAudit(player)) {
      return;
    }
    
    const originalPath = player.auditStatus.originalPath;
    
    // Clear audit status
    player.auditStatus = {
      inAudit: false,
      originalPath: null,
      auditSpace: null,
      resolvedTime: Date.now()
    };
    
    console.log(`MovementEngine: Player ${player.name} resolved audit. Returning to original path: ${originalPath}`);
  }
  
  /**
   * Check if a space has empty movement data
   * @param {Object} spaceData - Space data object
   * @returns {boolean} True if space has no movement destinations
   */
  hasEmptyMovementData(spaceData) {
    const destinations = [
      spaceData["space_1"],
      spaceData["space_2"], 
      spaceData["space_3"],
      spaceData["space_4"],
      spaceData["space_5"]
    ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null" && dest !== "n/a");
    
    return destinations.length === 0;
  }
  
  /**
   * Check if a space has dice roll movement data defined
   * @param {Object} spaceData - Space data object
   * @param {Object} player - Player object
   * @returns {boolean} True if space has dice roll movement data
   */
  hasDiceMovementData(spaceData, player) {
    if (!spaceData || !this.gameStateManager.diceRollData) {
      return false;
    }
    
    const visitType = this.getVisitType(player, spaceData);
    
    // Look for dice data that contains movement destinations (not just effects)
    const diceData = this.gameStateManager.diceRollData.filter(roll => 
      roll['space_name'] === spaceData.name && roll['visit_type'] === visitType
    );
    
    // Check if any dice data contains movement destinations
    for (const data of diceData) {
      const dieRollType = data['die_roll'] || '';
      
      // Check if this is a "Next Step" type dice roll (contains movement destinations)
      if (dieRollType.toLowerCase().includes('next step') || dieRollType.toLowerCase().includes('time outcomes')) {
        // Check if any of the outcomes contain space names (movement destinations)
        const outcomes = [data['1'], data['2'], data['3'], data['4'], data['5'], data['6']];
        const hasMovementOutcomes = outcomes.some(outcome => {
          if (!outcome) return false;
          const outcomeStr = outcome.toString();
          // Look for space names in outcomes (contain hyphens and uppercase)
          return outcomeStr.includes('-') && /[A-Z]/.test(outcomeStr);
        });
        
        if (hasMovementOutcomes) {
          console.log(`MovementEngine: Found dice movement data for ${spaceData.name} (${visitType}): ${dieRollType}`);
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Get emergency fallback movements for spaces with no movement data
   * @param {Object} player - Player object
   * @param {Object} spaceData - Current space data
   * @returns {Array} Array of emergency movement options
   */
  getEmergencyFallbackMovements(player, spaceData) {
    console.log(`MovementEngine: Generating emergency fallback movements for ${spaceData.name}`);
    
    // Emergency fallback based on space name patterns
    const spaceName = spaceData.name;
    
    // For REG-FDNY-PLAN-EXAM, provide logical next steps
    if (spaceName === 'REG-FDNY-PLAN-EXAM') {
      return [
        {
          id: 'con-initiation-first',
          name: 'CON-INITIATION',
          type: 'emergency-fallback',
          description: 'Construction Initiation - Next logical step',
          visitType: 'First',
          isEmergencyFallback: true
        }
      ];
    }
    
    // Generic fallback - try to find a logical next space
    const possibleNextSpaces = ['CON-INITIATION', 'REG-DOB-FINAL-REVIEW', 'FINISH'];
    
    for (const nextSpaceName of possibleNextSpaces) {
      const nextSpace = this.gameStateManager.findSpaceByName(nextSpaceName);
      if (nextSpace && !this.hasPlayerVisitedSpace(player, nextSpaceName)) {
        const visitType = this.getVisitType(player, { name: nextSpaceName });
        return [{
          id: nextSpaceName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + visitType.toLowerCase(),
          name: nextSpaceName,
          type: 'emergency-fallback',
          description: `${nextSpaceName} - Emergency fallback (incomplete space data)`,
          visitType: visitType,
          isEmergencyFallback: true
        }];
      }
    }
    
    // Last resort - return empty array
    console.error(`MovementEngine: No emergency fallback available for ${spaceName}`);
    return [];
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
        visitedSpaces: currentPlayer.visitedSpaces ? Array.from(currentPlayer.visitedSpaces) : [],
        auditStatus: currentPlayer.auditStatus || null
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

// Global helper function to set dice result in MovementEngine
window.setMovementEngineDiceResult = function(diceResult) {
  if (window.movementEngine && window.movementEngine.setDiceResult) {
    window.movementEngine.setDiceResult(diceResult);
    console.log('Global helper: Set MovementEngine dice result to', diceResult);
  } else {
    console.warn('Global helper: MovementEngine not available to set dice result');
  }
};

// CRITICAL FIX: Do NOT create MovementEngine instance here
// It will be created and initialized properly by InitializationManager
// This prevents premature initialization before CSV data is loaded

console.log('MovementEngine: Class definition completed - instance creation deferred to InitializationManager');

console.log('MovementEngine.js code execution finished - FIXED pure dice movement spaces emergency fallback bug [2025-06-04-001]');
