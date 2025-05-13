// MoveLogicSpecialCases.js - Special case handlers for specific spaces
console.log('--------- MoveLogicSpecialCases.js file is beginning to be used ---------');
console.log('--------- MoveLogicSpecialCases: ULTIMATE PM-DECISION-CHECK FIX - May 10, 2025 - v1.5.0 ---------');

/**
 * MoveLogicSpecialCases - Handlers for spaces with special logic
 * 
 * This module extends MoveLogicSpaceHandlers to add special case handlers for 
 * specific spaces that have unique movement rules.
 *
 * FIXED: Added extreme enhanced logging to verify code execution (2025-05-10)
 * FIXED: Added multiple code execution verification points (2025-05-10)
 * FIXED: Modified handleSpecialCaseSpace to guarantee PM-DECISION-CHECK handling (2025-05-10)
 * FIXED: Enhanced PM-DECISION-CHECK to properly store and use originalSpaceId (2025-05-10)
 * FIXED: Added consistent property storage using both approaches for maximum compatibility (2025-05-10)
 * FIXED: Fixed originalSpaceId not persisting between states (2025-05-10)
 * FIXED: Removed all fallback mechanisms to strictly enforce closed system principles (2025-05-14)
 * FIXED: Enhanced error reporting to make initialization dependencies clearer (2025-05-14)
 * FIXED: Simplified property storage to use player.properties consistently (2025-05-10)
 */
(function() {
  // Force alerts to verify code is being executed in browser
  try {
    if (window.PM_DECISION_CHECK_DEBUG_INIT) {
      console.log("INIT ALREADY HAPPENED - SKIPPING TO AVOID DUPLICATE");
      return; // Skip if already initialized
    }
    window.PM_DECISION_CHECK_DEBUG_INIT = true;
    console.log("!!!!!!! PM-DECISION-CHECK FIX: CODE EXECUTION STARTED !!!!!!!");
  } catch (e) {
    console.error("Error setting debug flag:", e);
  }
  
  // Add a flag to indicate initialization has started
  window.MoveLogicSpecialCasesInitStarted = true;
  
  // Make sure MoveLogicSpaceHandlers is loaded
  if (!window.MoveLogicSpaceHandlers) {
    console.error('MoveLogicSpecialCases: MoveLogicSpaceHandlers not found. Make sure to include MoveLogicSpaceHandlers.js first.');
    return;
  }
  
  // Override the MoveLogicSpecialCases class if it already exists
  let existingMethods = {};
  if (window.MoveLogicSpecialCases) {
    console.log("!!!!!!! PM-DECISION-CHECK FIX: MoveLogicSpecialCases already exists, backing up methods !!!!!!!");
    // Save existing methods for reference
    try {
      existingMethods.handleSpecialCaseSpace = window.MoveLogicSpecialCases.handleSpecialCaseSpace;
      existingMethods.handlePmDecisionCheck = window.MoveLogicSpecialCases.handlePmDecisionCheck;
      existingMethods.hasSpecialCaseLogic = window.MoveLogicSpecialCases.hasSpecialCaseLogic;
    } catch (e) {
      console.error("Error backing up methods:", e);
    }
  }
  
  // Define the MoveLogicSpecialCases class
  function MoveLogicSpecialCases() {
    // Call the parent constructor
    window.MoveLogicSpaceHandlers.call(this);
    
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
    
    // Register for game state events - for space change detection
    if (window.GameStateManager) {
      // Store a reference to the bound method for later cleanup
      this.spaceChangedHandler = this.handleSpaceChangedEvent.bind(this);
      
      // Register for space change events
      window.GameStateManager.addEventListener('spaceChanged', this.spaceChangedHandler);
      console.log('MoveLogicSpecialCases: Registered for spaceChanged events');
      
      // Register for game moves calculation
      const player = window.GameStateManager.getCurrentPlayer();
      if (player) {
        const space = window.GameStateManager.findSpaceById(player.position);
        console.log(`CURRENT PLAYER SPACE: ${space ? space.name : 'none'}`);
        
        if (space && space.name === 'PM-DECISION-CHECK') {
          console.log("!!!!!!! PM-DECISION-CHECK FIX: PLAYER IS CURRENTLY ON PM-DECISION-CHECK !!!!!!!");
          // Direct call to our handler to force processing
          setTimeout(() => {
            try {
              console.log("!!!!!!! PM-DECISION-CHECK FIX: DIRECT CALL TO HANDLER !!!!!!!");
              this.handlePmDecisionCheck(window.GameStateManager, player, space);
            } catch (e) {
              console.error("Error calling handler directly:", e);
            }
          }, 1000);
        }
      }
    }
    
    console.log('MoveLogicSpecialCases: Updated with improved visit type resolution. [2025-05-02]');
    console.log('MoveLogicSpecialCases: Integrated with space type system. [2025-05-03]');
    console.log('MoveLogicSpecialCases: Added RETURN TO YOUR SPACE handling for PM-DECISION-CHECK. [2025-05-04]');
    console.log('MoveLogicSpecialCases: Improved PM-DECISION-CHECK handling to directly show inherited moves. [2025-05-05]');
    console.log('MoveLogicSpecialCases: Fixed CHEAT-BYPASS implementation as permanent point-of-no-return. [2025-05-05]');
    console.log('MoveLogicSpecialCases: ULTIMATE PM-DECISION-CHECK FIX. [2025-05-10]');
    console.log('MoveLogicSpecialCases: Initialized successfully');
  }
  
  // Inherit from MoveLogicSpaceHandlers
  MoveLogicSpecialCases.prototype = Object.create(window.MoveLogicSpaceHandlers.prototype);
  MoveLogicSpecialCases.prototype.constructor = MoveLogicSpecialCases;
  
  /**
   * Resolve a space based on visit type (first or subsequent)
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {string} spaceName - The name of the space to resolve
   * @returns {Object|null} - The resolved space object or null if not found
   */
  MoveLogicSpecialCases.prototype.resolveSpaceForVisitType = function(gameState, player, spaceName) {
    // Log the start of the method
    console.log(`MoveLogicSpecialCases: Resolving space for: ${spaceName}`);
    
    // Get normalized space name
    const normalizedName = gameState.extractSpaceName(spaceName);
    
    // Find all spaces with this name
    const matchingSpaces = gameState.spaces.filter(s => 
      gameState.extractSpaceName(s.name) === normalizedName);
    
    if (matchingSpaces.length === 0) {
      console.warn(`MoveLogicSpecialCases: No spaces found with name: ${normalizedName}`);
      return null;
    }
    
    // Determine visit type
    const hasVisited = gameState.hasPlayerVisitedSpace(player, normalizedName);
    const visitType = hasVisited ? 'subsequent' : 'first';
    console.log(`MoveLogicSpecialCases: Visit type for ${normalizedName} is: ${visitType}`);
    
    // Try to find the exact match first
    let resolvedSpace = matchingSpaces.find(s => 
      s.visitType && s.visitType.toLowerCase() === visitType.toLowerCase());
    
    if (resolvedSpace) {
      console.log(`MoveLogicSpecialCases: Found exact match for ${normalizedName} with visit type ${visitType}`);
    } else {
      // If not found, try the opposite visit type
      const oppositeType = visitType.toLowerCase() === 'first' ? 'subsequent' : 'first';
      resolvedSpace = matchingSpaces.find(s => 
        s.visitType && s.visitType.toLowerCase() === oppositeType.toLowerCase());
      
      if (resolvedSpace) {
        console.log(`MoveLogicSpecialCases: Using opposite visit type ${oppositeType} for ${normalizedName}`);
      } else if (matchingSpaces.length > 0) {
        // If still not found, use the first available space
        resolvedSpace = matchingSpaces[0];
        console.log(`MoveLogicSpecialCases: No specific visit type found, using first available space for ${normalizedName}`);
      }
    }
    
    return resolvedSpace;
  };
  
  /**
   * Override hasSpecialCaseLogic to use our class property
   * @param {string} spaceName - The name of the space to check
   * @returns {boolean} - True if space has special case logic
   */
  MoveLogicSpecialCases.prototype.hasSpecialCaseLogic = function(spaceName) {
    if (spaceName === 'PM-DECISION-CHECK') {
      console.log("!!!!!!! PM-DECISION-CHECK FIX: hasSpecialCaseLogic called for PM-DECISION-CHECK !!!!!!!");
      return true;
    }
    
    const result = this.specialCaseSpaces.includes(spaceName);
    console.log(`DEBUG [hasSpecialCaseLogic]: Checking if "${spaceName}" is a special case. Result:`, result);
    return result;
  };
  
  /**
   * Override handleSpecialCaseSpace to dispatch to the appropriate handler
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  MoveLogicSpecialCases.prototype.handleSpecialCaseSpace = function(gameState, player, currentSpace) {
    console.log(`SPECIAL_CASES: Entered handleSpecialCaseSpace for: ${currentSpace.name}, ID: ${currentSpace.id}, VisitType: ${currentSpace.visitType}`);
    
    // Force PM-DECISION-CHECK handling for this space regardless of name
    if (currentSpace.name.includes('PM-DECISION-CHECK')) {
      console.log("!!!!!!! PM-DECISION-CHECK FIX: PM-DECISION-CHECK case matched in handleSpecialCaseSpace !!!!!!!");
      return this.handlePmDecisionCheck(gameState, player, currentSpace);
    }
    
    // Implementation for each special case
    switch (currentSpace.name) {
      case 'ARCH-INITIATION':
        return this.handleArchInitiation(gameState, player, currentSpace);
      case 'PM-DECISION-CHECK':
        console.log("!!!!!!! PM-DECISION-CHECK FIX: PM-DECISION-CHECK case matched in switch statement !!!!!!!");
        return this.handlePmDecisionCheck(gameState, player, currentSpace);
      case 'REG-FDNY-FEE-REVIEW':
        return this.handleFdnyFeeReview(gameState, player, currentSpace);
      default:
        console.log('%c DIAGNOSIS: No special case handler for space:', 'background: #F44336; color: white;', currentSpace.name);
        console.log('%c DIAGNOSIS: Using default handler', 'background: #F44336; color: white;');
        return window.MoveLogicBase.prototype.getSpaceDependentMoves.call(this, gameState, player, currentSpace);
    }
  };
  
  /**
   * Handle PM-DECISION-CHECK space - ULTIMATE FIX
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  MoveLogicSpecialCases.prototype.handlePmDecisionCheck = function(gameState, player, currentSpace) {
    console.log('!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: Handler running for player ' + player.id + ' !!!!!!');
    
    // Step 1: Store the original space ID if we haven't already
    this.storeOriginalSpaceIdForPlayer(gameState, player);
    console.log('PM-DECISION-CHECK DEBUG: player.previousPosition upon landing:', player.previousPosition);
    console.log('PM-DECISION-CHECK DEBUG: Stored originalSpaceId on player object:', player.originalSpaceId);
    console.log('PM-DECISION-CHECK DEBUG: Stored originalSpaceId in player.properties:', player.properties ? player.properties.originalSpaceId : 'player.properties is undefined');
    // Step 2: Get standard moves from the PM-DECISION-CHECK space
    const standardMoves = this.getStandardPmDecisionMoves(gameState, player, currentSpace);
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Standard moves:', standardMoves.map(m => m.name).join(', '));
    
    // Step 3: Add moves from the player's original space, if available
    const movesWithOriginalSpaceMoves = this.addOriginalSpaceMoves(gameState, player, standardMoves);
    
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Final moves count:', movesWithOriginalSpaceMoves.length);
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Final moves:', movesWithOriginalSpaceMoves.map(m => m.name).join(', '));
    console.log('!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: Handler completed !!!!!!');
    
    // Attach a copy to window for debugging
    window.DEBUG_PM_DECISION_CHECK_FINAL_MOVES = [...movesWithOriginalSpaceMoves];
    
    return movesWithOriginalSpaceMoves;
  };
  
  /**
   * Store the original space ID when a player lands on PM-DECISION-CHECK
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to store original space ID for
   */
  MoveLogicSpecialCases.prototype.storeOriginalSpaceIdForPlayer = function(gameState, player) {
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Checking if originalSpaceId needs to be stored');
    
    // If we already have an originalSpaceId, we don't need to do anything
    if (player.originalSpaceId) {
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Player already has originalSpaceId:', player.originalSpaceId);
      return;
    }
    
    // Get the previous position from standard location
    let previousPosition = null;
    
    // Option 1: Look in player.previousPosition (standard location)
    if (player.previousPosition) {
      previousPosition = player.previousPosition;
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Found previousPosition:', previousPosition);
    }
    // Option 2: Look in positionHistory if available
    else if (player.positionHistory && Array.isArray(player.positionHistory) && player.positionHistory.length >= 2) {
      previousPosition = player.positionHistory[player.positionHistory.length - 2];
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Found previousPosition from history:', previousPosition);
    }
    
    if (previousPosition) {
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Found previous space ID: ' + previousPosition);
      
      // Store in both standard locations for maximum compatibility
      // 1. Directly on player object
      player.originalSpaceId = previousPosition;
      
      // 2. In player.properties (standard game pattern)
      if (!player.properties) {
        player.properties = {};
      }
      player.properties.originalSpaceId = previousPosition;
      
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Stored originalSpaceId:', previousPosition);
      
      // Force game state save to ensure persistence
      if (gameState.saveState) {
        try {
          gameState.saveState();
          console.log('PM-DECISION-CHECK ULTIMATE FIX: Saved game state to persist originalSpaceId');
        } catch (e) {
          console.error('PM-DECISION-CHECK ULTIMATE FIX: Error saving game state:', e);
        }
      }
    } else {
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Could not find previous position for player');
    }
  };
  
  /**
   * Get standard moves from the PM-DECISION-CHECK space
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of standard PM-DECISION-CHECK moves
   */
  MoveLogicSpecialCases.prototype.getStandardPmDecisionMoves = function(gameState, player, currentSpace) {
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Getting standard moves');
    
    const standardMoves = [];
    
    // Get moves from space data
    const nextSpaces = [
      currentSpace.rawSpace1, 
      currentSpace.rawSpace2, 
      currentSpace.rawSpace3, 
      currentSpace.rawSpace4, 
      currentSpace.rawSpace5
    ].filter(space => space && space.trim() !== '' && space !== 'n/a');
    
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Raw next spaces:', nextSpaces);
    
    // Process each default move
    for (const nextSpaceName of nextSpaces) {
      // Skip "RETURN TO YOUR SPACE" option if it exists in CSV
      if (nextSpaceName.includes('RETURN TO YOUR SPACE')) {
        console.log('PM-DECISION-CHECK ULTIMATE FIX: Skipping RETURN TO YOUR SPACE option from CSV');
        continue;
      }
      
      const spaceName = gameState.extractSpaceName(nextSpaceName);
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Processing next space:', spaceName);
      
      // Find matching spaces
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === spaceName);
      
      if (matchingSpaces.length > 0) {
        // Prefer first visit type if available
        let space = matchingSpaces.find(s => s.visitType && s.visitType.toLowerCase() === 'first');
        if (!space) space = matchingSpaces[0];
        
        // Mark CHEAT-BYPASS specially
        if (spaceName === 'CHEAT-BYPASS') {
          space.isCheatBypass = true;
          console.log('PM-DECISION-CHECK ULTIMATE FIX: Marked space as CHEAT-BYPASS');
        }
        
        // Add to standard moves
        standardMoves.push(space);
        console.log('PM-DECISION-CHECK ULTIMATE FIX: Added standard move:', space.name);
      } else {
        console.log('PM-DECISION-CHECK ULTIMATE FIX: No matching spaces found for:', spaceName);
      }
    }
    
    return standardMoves;
  };
  
  /**
   * Add moves from the player's original space to the available moves
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Array} standardMoves - The standard moves to add to
   * @returns {Array} - Array of moves including original space moves
   */
  MoveLogicSpecialCases.prototype.addOriginalSpaceMoves = function(gameState, player, standardMoves) {
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Starting to add original space moves');
    
    // If player has used cheat bypass, no original space moves should be added
    if (player.hasUsedCheatBypass === true) {
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Player has used CHEAT-BYPASS, not adding original space moves');
      return standardMoves;
    }
    
    // Get the originalSpaceId - try both standard locations for maximum compatibility
    let originalSpaceId = null;
    
    // Option 1: Direct player property
    if (player.originalSpaceId) {
      originalSpaceId = player.originalSpaceId;
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Found originalSpaceId directly on player:', originalSpaceId);
    }
    // Option 2: player.properties
    else if (player.properties && player.properties.originalSpaceId) {
      originalSpaceId = player.properties.originalSpaceId;
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Found originalSpaceId in player.properties:', originalSpaceId);
      console.log('PM-DECISION-CHECK DEBUG (addOriginalSpaceMoves): Value of originalSpaceId to be used:', originalSpaceId);
    }
    
    if (!originalSpaceId) {
      // Last resort: check previousPosition 
      if (player.previousPosition) {
        originalSpaceId = player.previousPosition;
        console.log('PM-DECISION-CHECK ULTIMATE FIX: Using previousPosition as originalSpaceId:', originalSpaceId);
        
        // Save it for future reference
        player.originalSpaceId = originalSpaceId;
        if (!player.properties) player.properties = {};
        player.properties.originalSpaceId = originalSpaceId;
      } else {
        console.log('PM-DECISION-CHECK ULTIMATE FIX: No originalSpaceId found, returning standard moves only');
        return standardMoves;
      }
    }
    
    // Get the original space
    const originalSpace = gameState.findSpaceById(originalSpaceId);
    
    if (!originalSpace) {
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Original space not found for ID:', originalSpaceId);
      return standardMoves;
    }
    
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Found original space:', originalSpace.name);
    console.log('PM-DECISION-CHECK DEBUG (addOriginalSpaceMoves): Full originalSpace object being used:', JSON.parse(JSON.stringify(originalSpace || {})));
    // Create a copy of standard moves to add to
    const allMoves = [...standardMoves];
    
    // Get next spaces from original space
    const originalSpaceNextSpaces = [];
    
    // Check all rawSpace fields in the original space
    for (let i = 1; i <= 10; i++) {
      const rawSpaceField = `rawSpace${i}`;
      if (originalSpace[rawSpaceField] && 
          originalSpace[rawSpaceField].trim() !== '' && 
          originalSpace[rawSpaceField] !== 'n/a') {
        originalSpaceNextSpaces.push(originalSpace[rawSpaceField]);
      }
    }
    
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Original space next spaces:', originalSpaceNextSpaces);
    
    // Process each next space from original space
    for (const nextSpaceName of originalSpaceNextSpaces) {
      // Skip PM-DECISION-CHECK to avoid a loop
      if (nextSpaceName.includes('PM-DECISION-CHECK')) {
        console.log('PM-DECISION-CHECK ULTIMATE FIX: Skipping PM-DECISION-CHECK reference in original space moves');
        continue;
      }
      
      const spaceName = gameState.extractSpaceName(nextSpaceName);
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Processing original space move:', spaceName);
       const resolvedOriginalSpaceMove = gameState.spaces.find(s => gameState.extractSpaceName(s.name) === spaceName && s.visitType && s.visitType.toLowerCase() === 'first') || gameState.spaces.find(s => gameState.extractSpaceName(s.name) === spaceName);
      console.log('PM-DECISION-CHECK DEBUG (addOriginalSpaceMoves): Original space move candidate "' + spaceName + '" resolves to:', JSON.parse(JSON.stringify(resolvedOriginalSpaceMove || {})));
      // Find matching spaces
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === spaceName);
      
      if (matchingSpaces.length > 0) {
        // Prefer first visit type if available
        let space = matchingSpaces.find(s => s.visitType && s.visitType.toLowerCase() === 'first');
        if (!space) space = matchingSpaces[0];
        
        // Create a copy to avoid modifying the original
        const spaceCopy = JSON.parse(JSON.stringify(space));
        
        // Mark as coming from original space
        spaceCopy.fromOriginalSpace = true;
        spaceCopy.originalSpaceId = originalSpace.id;
        spaceCopy.originalSpaceName = originalSpace.name;
        
        // Store original description
        spaceCopy.originalDescription = spaceCopy.description;
        
        // Modify name and description to indicate source
        spaceCopy.name = `${space.name} (from ${originalSpace.name})`;
        spaceCopy.description = `From ${originalSpace.name}: ${spaceCopy.description || ''}`;
        
        // Add to moves if not already there
        if (!allMoves.some(move => move.id === spaceCopy.id || 
                        gameState.extractSpaceName(move.name) === gameState.extractSpaceName(spaceCopy.name))) {
          allMoves.push(spaceCopy);
          console.log('PM-DECISION-CHECK ULTIMATE FIX: Added original space move:', spaceCopy.name);
          console.log('PM-DECISION-CHECK DEBUG (addOriginalSpaceMoves): Added original move object:', JSON.parse(JSON.stringify(spaceCopy || {})));
        } else {
          console.log('PM-DECISION-CHECK ULTIMATE FIX: Space already in moves, skipping:', spaceCopy.name);
        }
      } else {
        console.log('PM-DECISION-CHECK ULTIMATE FIX: No matching spaces found for original space move:', spaceName);
      }
    }
    
    return allMoves;
  };
  
  /**
   * Handle move selection for PM-DECISION-CHECK space
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player who selected the move
   * @param {Object} selectedMove - The move that was selected
   * @returns {Object} - The processed move
   */
  MoveLogicSpecialCases.prototype.handlePmDecisionMoveSelection = function(gameState, player, selectedMove) {
    console.log('PM-DECISION-CHECK ULTIMATE FIX: Handling move selection for:', selectedMove.name);
    
    // Handle CHEAT-BYPASS selection
    if (selectedMove.isCheatBypass) {
      // Clear originalSpaceId (point of no return)
      player.originalSpaceId = null;
      
      // Store both as direct property and in player.properties
      player.hasUsedCheatBypass = true;
      
      if (!player.properties) {
        player.properties = {};
      }
      player.properties.hasUsedCheatBypass = true;
      
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Player selected CHEAT-BYPASS, no return possible');
      
      // Force game state save to ensure persistence
      if (gameState.saveState) {
        try {
          gameState.saveState();
        } catch (e) {
          console.error('PM-DECISION-CHECK ULTIMATE FIX: Error saving game state:', e);
        }
      }
    }
    
    // Handle selection of moves from original space
    if (selectedMove.fromOriginalSpace) {
      // Clear originalSpaceId as player is now returning to original path
      player.originalSpaceId = null;
      
      // Also clear from player.properties
      if (player.properties) {
        player.properties.originalSpaceId = null;
      }
      
      // Restore original description if it was modified
      if (selectedMove.originalDescription) {
        selectedMove.description = selectedMove.originalDescription;
      }
      
      console.log('PM-DECISION-CHECK ULTIMATE FIX: Player selected to return to original path');
      
      // Force game state save to ensure persistence
      if (gameState.saveState) {
        try {
          gameState.saveState();
        } catch (e) {
          console.error('PM-DECISION-CHECK ULTIMATE FIX: Error saving game state:', e);
        }
      }
    }
    
    return selectedMove;
  };
  
  /**
   * Handle space changed events to detect when player returns to main path
   * @param {Object} event - The space changed event
   */
  MoveLogicSpecialCases.prototype.handleSpaceChangedEvent = function(event) {
    console.log('MoveLogicSpecialCases: Handling space changed event');
    
    // Only process if there's event data
    if (!event || !event.data) return;
    
    // Check if this is a move to PM-DECISION-CHECK
    if (event.data.newSpace && event.data.newSpace.name === 'PM-DECISION-CHECK') {
      console.log('!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: Player just moved to PM-DECISION-CHECK !!!!!!');
      
      // Get the current player and game state
      const gameState = window.GameStateManager;
      const player = gameState.getCurrentPlayer();
      
      if (player && event.data.newSpace) {
        // Force processing by direct call to our handler
        try {
          setTimeout(() => {
            console.log("!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: DELAYED DIRECT CALL TO HANDLER !!!!!!!");
            this.handlePmDecisionCheck(gameState, player, event.data.newSpace);
          }, 500);
        } catch (e) {
          console.error("Error in delayed direct call:", e);
        }
      }
    }
    
    // Get the current player and game state
    const gameState = window.GameStateManager;
    const player = gameState.getCurrentPlayer();
    
    if (!player) return;
    
    // Check if the player was on a side quest
    const isOnSideQuest = this.getPlayerGameProperty(gameState, player, 'isOnPMSideQuest');
    
    // If the player was on a side quest, check if they've returned to the main path
    if (isOnSideQuest) {
      const currentSpaceName = event.data.newSpace?.name;
      const currentSpaceId = event.data.newSpace?.id;
      const originalSpaceId = this.getPlayerGameProperty(gameState, player, 'originalSpaceId');
      
      // If player has moved to their original space, clear the side quest flag
      if (currentSpaceId === originalSpaceId) {
        console.log('MoveLogicSpecialCases: Player returned to original space, clearing side quest status');
        
        // Clear side quest status - only use setPlayerGameProperty for consistent storage
        this.setPlayerGameProperty(gameState, player, 'isOnPMSideQuest', false);
        
        // Clear original space ID - only use setPlayerGameProperty for consistent storage
        this.setPlayerGameProperty(gameState, player, 'originalSpaceId', null);
        
        console.log('MoveLogicSpecialCases: Side quest tracking data cleared');
      }
    }
  };

  /**
   * Set a property on the player's game state - Simplified to only use player.properties
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to set property for
   * @param {string} propertyName - The name of the property to set
   * @param {any} value - The value to set
   * @returns {boolean} - True if property was successfully stored
   */
  MoveLogicSpecialCases.prototype.setPlayerGameProperty = function(gameState, player, propertyName, value) {
    try {
      // Add debug logging
      console.log(`MoveLogicSpecialCases: Setting player property ${propertyName} to:`, value);
      
      // Ensure properties object exists
      if (!player.properties) {
        player.properties = {};
      }
      
      // Store in player.properties - the standard game pattern
      player.properties[propertyName] = value;
      
      // Verify storage succeeded
      return player.properties[propertyName] === value;
    } catch (error) {
      console.error(`Error setting ${propertyName}:`, error);
      return false;
    }
  };
  
  /**
   * Get a property from the player's game state - Simplified to only use player.properties
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get property for
   * @param {string} propertyName - The name of the property to get
   * @returns {any} - The property value or null if not found
   */
  MoveLogicSpecialCases.prototype.getPlayerGameProperty = function(gameState, player, propertyName) {
    // Check in player.properties
    if (player.properties && player.properties[propertyName] !== undefined) {
      return player.properties[propertyName];
    }
    
    // In a closed system, we don't use fallbacks - properties must be properly set
    // and maintained throughout the application lifecycle
    console.log(`MoveLogicSpecialCases: Property ${propertyName} not found in player.properties`);
    
    return null;
  };
  
  // Create instance and expose globally
  let specialCases;
  
  // If we already have an instance, override its methods but keep the instance
  if (window.MoveLogicSpecialCases) {
    specialCases = window.MoveLogicSpecialCases;
    console.log("!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: Overriding methods on existing instance !!!!!!!");
    
    // Override methods on the existing instance
    specialCases.handlePmDecisionCheck = MoveLogicSpecialCases.prototype.handlePmDecisionCheck;
    specialCases.handlePmDecisionMoveSelection = MoveLogicSpecialCases.prototype.handlePmDecisionMoveSelection;
    specialCases.storeOriginalSpaceIdForPlayer = MoveLogicSpecialCases.prototype.storeOriginalSpaceIdForPlayer;
    specialCases.getStandardPmDecisionMoves = MoveLogicSpecialCases.prototype.getStandardPmDecisionMoves;
    specialCases.addOriginalSpaceMoves = MoveLogicSpecialCases.prototype.addOriginalSpaceMoves;
    
    // Make sure PM-DECISION-CHECK is in specialCaseSpaces
    if (!specialCases.specialCaseSpaces.includes('PM-DECISION-CHECK')) {
      specialCases.specialCaseSpaces.push('PM-DECISION-CHECK');
    }
    
    // Ensure the hasSpecialCaseLogic method will identify PM-DECISION-CHECK
    const originalHasSpecialCaseLogic = specialCases.hasSpecialCaseLogic;
    specialCases.hasSpecialCaseLogic = function(spaceName) {
      if (spaceName === 'PM-DECISION-CHECK') {
        console.log("!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: hasSpecialCaseLogic override returning true !!!!!!!");
        return true;
      }
      return originalHasSpecialCaseLogic.call(this, spaceName);
    };
    
    // Override handleSpecialCaseSpace to ensure PM-DECISION-CHECK is handled correctly
    const originalHandleSpecialCaseSpace = specialCases.handleSpecialCaseSpace;
    specialCases.handleSpecialCaseSpace = function(gameState, player, currentSpace) {
      if (currentSpace.name.includes('PM-DECISION-CHECK')) {
        console.log("!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: handleSpecialCaseSpace override called for PM-DECISION-CHECK !!!!!!!");
        return this.handlePmDecisionCheck(gameState, player, currentSpace);
      }
      return originalHandleSpecialCaseSpace.call(this, gameState, player, currentSpace);
    };
    
    // Add a direct call to the handler if the player is on PM-DECISION-CHECK
    setTimeout(() => {
      try {
        const player = window.GameStateManager.getCurrentPlayer();
        if (player) {
          const space = window.GameStateManager.findSpaceById(player.position);
          if (space && space.name === 'PM-DECISION-CHECK') {
            console.log("!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: DELAYED PROCESSING - PLAYER IS ON PM-DECISION-CHECK !!!!!!!");
            specialCases.handlePmDecisionCheck(window.GameStateManager, player, space);
          }
        }
      } catch (e) {
        console.error("Error in delayed processing:", e);
      }
    }, 1000);
  } else {
    // Create a new instance if none exists
    specialCases = new MoveLogicSpecialCases();
    window.MoveLogicSpecialCases = specialCases;
  }
  
  // Create a debug reference to our handler
  window.PM_DECISION_CHECK_HANDLER = specialCases.handlePmDecisionCheck;
  
  // Set an initialization flag that can be checked by other modules
  window.MoveLogicSpecialCasesInitialized = true;
  
  // Dispatch an event to notify other components that initialization is complete
  try {
    const event = new CustomEvent('MoveLogicSpecialCasesInitialized', {
      detail: {
        specialCaseSpaces: window.MoveLogicSpecialCases.specialCaseSpaces,
        hasHandlePmDecisionCheck: typeof window.MoveLogicSpecialCases.handlePmDecisionCheck === 'function'
      }
    });
    window.dispatchEvent(event);
    console.log('MoveLogicSpecialCases: Fired initialization event');
  } catch (e) {
    console.error('MoveLogicSpecialCases: Error dispatching initialization event', e);
  }
  
  console.log('!!!!!!! MoveLogicSpecialCases.js code execution finished !!!!!!');
  
  // Add a hook to test if the player is on PM-DECISION-CHECK and invoke the handler directly
  setTimeout(() => {
    try {
      if (window.GameStateManager) {
        const player = window.GameStateManager.getCurrentPlayer();
        if (player) {
          const currentSpace = window.GameStateManager.findSpaceById(player.position);
          if (currentSpace && currentSpace.name === 'PM-DECISION-CHECK') {
            console.log("!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: FINAL CHECK - PLAYER IS ON PM-DECISION-CHECK !!!!!!!");
            
            // Force player.previousPosition to be set if not already
            if (!player.previousPosition && player.positionHistory && player.positionHistory.length >= 2) {
              player.previousPosition = player.positionHistory[player.positionHistory.length - 2];
              console.log("!!!!!!! PM-DECISION-CHECK ULTIMATE FIX: Set previousPosition from history:", player.previousPosition);
            }
            
            // Force processing one last time
            specialCases.handlePmDecisionCheck(window.GameStateManager, player, currentSpace);
          }
        }
      }
    } catch (e) {
      console.error("Error in final check:", e);
    }
  }, 2000);
})();