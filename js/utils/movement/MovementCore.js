/**
 * MovementCore.js
 * Core movement logic for the Project Management Game
 * 
 * This module handles the fundamental movement operations,
 * separated from UI integration and higher-level logic
 */

console.log('MovementCore.js file is beginning to be used');

// VERSION TRACKING for cache-buster
if (window.LOADED_VERSIONS) {
  window.LOADED_VERSIONS['MovementCore'] = '2025-05-25-001';
  console.log('MovementCore: Version 2025-05-25-001 loaded');
}

class MovementCore {
  constructor(gameStateManager) {
    this.gameStateManager = gameStateManager;
    
    // Initialize core movement properties
    this._initializeProperties();
    
    console.log('MovementCore: Initialized with clean architecture');
  }
  
  /**
   * Initialize core properties with proper descriptors
   * @private
   */
  _initializeProperties() {
    // Create protected properties with property descriptors
    Object.defineProperties(this, {
      // Store movement history with protected access
      _movementHistory: {
        value: [],
        writable: true,
        configurable: false
      },
      
      // Store pending moves with protected access
      _pendingMoves: {
        value: [],
        writable: true,
        configurable: false
      },
      
      // Reference to game state manager
      gameStateManager: {
        value: this.gameStateManager,
        writable: false,
        configurable: false
      }
    });
  }
  
  /**
   * Move a player to a space
   * @param {string} playerId - ID of the player to move
   * @param {string} spaceId - ID of the space to move to
   * @returns {boolean} True if movement was successful
   */
  movePlayer(playerId, spaceId) {
    // Get player
    const player = this.gameStateManager.findPlayerById(playerId);
    if (!player) {
      console.error(`MovementCore: Could not find player with id ${playerId}`);
      return false;
    }
    
    // Get the space to move to
    const targetSpace = this.gameStateManager.findSpaceById(spaceId);
    if (!targetSpace) {
      console.error(`MovementCore: Could not find space with id ${spaceId}`);
      return false;
    }
    
    console.log(`MovementCore: Moving player ${player.name} to ${targetSpace.name}`);
    
    // Save the previous position
    this._recordPlayerPosition(player);
    
    // Update player position
    player.position = spaceId;
    
    // Add to visit history
    this._updateVisitHistory(player, targetSpace);
    
    // Special handling for CHEAT-BYPASS
    if (targetSpace.name === 'CHEAT-BYPASS') {
      player.hasUsedCheatBypass = true;
    }
    
    // Record in movement history (for TurnManager integration)
    this._movementHistory.push({
      playerId: playerId,
      fromSpace: player.previousPosition,
      toSpace: spaceId,
      timestamp: Date.now()
    });
    
    return true;
  }
  
  /**
   * Record a player's current position before moving
   * @param {Object} player - Player to record position for
   * @private
   */
  _recordPlayerPosition(player) {
    // Save the previous position
    player.previousPosition = player.position;
    
    // Also store in player.properties for persistence
    if (!player.properties) {
      player.properties = {};
    }
    player.properties.previousPosition = player.position;
  }
  
  /**
   * Update a player's visit history
   * @param {Object} player - Player to update
   * @param {Object} space - Space that was visited
   * @private
   */
  _updateVisitHistory(player, space) {
    // Ensure visit history exists
    if (!player.visitHistory) {
      player.visitHistory = [];
    }
    
    // Also ensure in properties for persistence
    if (!player.properties) {
      player.properties = {};
    }
    if (!player.properties.visitHistory) {
      player.properties.visitHistory = [];
    }
    
    // Create visit record with path type
    const visitRecord = {
      spaceId: space.id,
      spaceName: space.name,
      spacePath: space.Path || 'unknown',
      timestamp: Date.now(),
      visitType: this.determineVisitType(player, space)
    };
    
    // If moving FROM a main path space TO PM-DECISION-CHECK, store the original space
    if (player.previousPosition && space.name === 'PM-DECISION-CHECK') {
      const previousSpace = this.gameStateManager.findSpaceById(player.previousPosition);
      if (previousSpace && previousSpace.Path && previousSpace.Path.toLowerCase() === 'main') {
        // Only store if not already stored (first time leaving main path)
        if (!player.properties.originalSpaceId) {
          console.log(`MovementCore: Storing original main path space: ${previousSpace.name}`);
          player.properties.originalSpaceId = previousSpace.id;
          player.properties.originalSpaceName = previousSpace.name;
        }
      }
    }
    
    // Add to both places for redundancy
    player.visitHistory.push(visitRecord);
    player.properties.visitHistory.push(visitRecord);
  }
  
  /**
   * Determine if this is a first or subsequent visit to a space
   * @param {Object} player - Player to check
   * @param {Object} space - Space to check
   * @returns {string} "First" or "Subsequent"
   */
  determineVisitType(player, space) {
    // FIXED: Use visitedSpaces instead of visitHistory since that's where the data actually is
    if (!player.visitedSpaces) {
      return 'First';
    }
    
    // Handle both Set and Array for visitedSpaces
    const visitedSpaces = Array.isArray(player.visitedSpaces) ? 
      new Set(player.visitedSpaces) : player.visitedSpaces;
    
    // Check if player has visited this space before using the same logic as GameStateManager
    const normalizedSpaceName = this.gameStateManager.extractSpaceName(space.name);
    const hasVisited = visitedSpaces.has(normalizedSpaceName);
    
    console.log(`MovementCore: determineVisitType for ${space.name}: hasVisited=${hasVisited}`);
    
    return hasVisited ? 'Subsequent' : 'First';
  }
  
  /**
   * Get player's main path history (excluding side quests)
   * @param {Object} player - Player to check
   * @returns {Array} Array of main path visit records
   */
  getPlayerMainPathHistory(player) {
    // If no visit history, return empty array
    if (!player.visitHistory || !Array.isArray(player.visitHistory)) {
      return [];
    }
    
    // Filter based on Path type from CSV data
    return player.visitHistory.filter(visit => {
      // Find the space to check its path
      const space = this.gameStateManager.findSpaceById(visit.spaceId) || 
                    this.gameStateManager.findSpaceByName(visit.spaceName);
      
      if (!space) return false;
      
      // Include only Main path spaces
      return space.Path && space.Path.toLowerCase() === 'main';
    });
  }
  
  /**
   * Get the last main path space for a player
   * @param {Object} player - Player to check
   * @returns {Object|null} Last main path space or null
   */
  getLastMainPathSpace(player) {
    const mainPathHistory = this.getPlayerMainPathHistory(player);
    
    if (!mainPathHistory || mainPathHistory.length === 0) {
      return null;
    }
    
    // Get the most recent main path space
    const lastVisit = mainPathHistory[mainPathHistory.length - 1];
    
    // Try to find by ID first
    if (lastVisit.spaceId) {
      const space = this.gameStateManager.findSpaceById(lastVisit.spaceId);
      if (space) return space;
    }
    
    // Try to find by name as fallback
    return this.gameStateManager.findSpaceByName(lastVisit.spaceName);
  }
  
  /**
   * Check if player has used the CHEAT-BYPASS space
   * @param {Object} player - Player to check
   * @returns {boolean} True if player has used CHEAT-BYPASS
   */
  playerHasUsedCheatBypass(player) {
    // Check explicit flag first (for TurnManager compatibility)
    if (player.hasUsedCheatBypass) {
      return true;
    }
    
    // Also check properties (for persistence)
    if (player.properties && player.properties.hasUsedCheatBypass) {
      return true;
    }
    
    // If no visit history, they haven't used it
    if (!player.visitHistory || !Array.isArray(player.visitHistory)) {
      return false;
    }
    
    // Check if CHEAT-BYPASS is in visit history
    return player.visitHistory.some(visit => visit.spaceName === 'CHEAT-BYPASS');
  }
  
  /**
   * Check if a space is a "single choice" space
   * @param {string} spaceName - Name of space to check
   * @returns {boolean} True if this is a single choice space
   */
  isSingleChoiceSpace(spaceName) {
    if (!this.gameStateManager.spaces) return false;
    const spaceData = this.gameStateManager.spaces.find(s => s.name === spaceName);
    return spaceData && spaceData.Path === "Single choice";
  }
  
  /**
   * Record a permanent single choice decision
   * @param {Object} player - Player making the choice
   * @param {string} spaceName - Name of the single choice space
   * @param {string} chosenDestination - Destination they chose
   */
  recordSingleChoice(player, spaceName, chosenDestination) {
    // Initialize singleChoices if it doesn't exist
    if (!player.singleChoices) {
      player.singleChoices = {};
    }
    
    // Store in properties for persistence
    if (!player.properties) {
      player.properties = {};
    }
    if (!player.properties.singleChoices) {
      player.properties.singleChoices = {};
    }
    
    // Record the choice in both places
    player.singleChoices[spaceName] = chosenDestination;
    player.properties.singleChoices[spaceName] = chosenDestination;
    
    console.log(`MovementCore: Recorded permanent choice at ${spaceName}: ${chosenDestination}`);
  }
  
  /**
   * Get previous single choice for a space
   * @param {Object} player - Player to check
   * @param {string} spaceName - Name of single choice space
   * @returns {string|null} Previously chosen destination or null
   */
  getPreviousSingleChoice(player, spaceName) {
    // Check both locations for the choice
    if (player.singleChoices && player.singleChoices[spaceName]) {
      return player.singleChoices[spaceName];
    }
    
    if (player.properties && player.properties.singleChoices && player.properties.singleChoices[spaceName]) {
      return player.properties.singleChoices[spaceName];
    }
    
    return null;
  }
  
  /**
   * Check if a destination conflicts with previous single choice decisions
   * @param {Object} player - Player to check
   * @param {string} destination - Destination to validate
   * @returns {boolean} True if this destination conflicts with a previous choice
   */
  conflictsWithSingleChoice(player, destination) {
    if (!this.gameStateManager.spaces) return false;
    
    // Get all single choice spaces and their destinations
    const singleChoiceSpaces = this.gameStateManager.spaces.filter(space => space.Path === "Single choice");
    
    for (let space of singleChoiceSpaces) {
      const spaceName = space.name;
      const chosenDestination = this.getPreviousSingleChoice(player, spaceName);
      
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
          console.log(`MovementCore: Filtering out ${destination} - conflicts with choice ${chosenDestination} made at ${spaceName}`);
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Enhanced movePlayer that handles single choice recording
   * @param {string} playerId - ID of the player to move
   * @param {string} spaceId - ID of the space to move to
   * @returns {boolean} True if movement was successful
   */
  movePlayerWithChoiceTracking(playerId, spaceId) {
    const player = this.gameStateManager.findPlayerById(playerId);
    const currentSpace = this.gameStateManager.findSpaceById(player.position);
    const targetSpace = this.gameStateManager.findSpaceById(spaceId);
    
    if (!player || !currentSpace || !targetSpace) {
      return false;
    }
    
    // If leaving a single choice space, record the choice
    if (this.isSingleChoiceSpace(currentSpace.name)) {
      const previousChoice = this.getPreviousSingleChoice(player, currentSpace.name);
      
      // Only record if this is a new choice (not already recorded)
      if (!previousChoice) {
        this.recordSingleChoice(player, currentSpace.name, targetSpace.name);
      }
    }
    
    // Use the existing movePlayer logic
    return this.movePlayer(playerId, spaceId);
  }
  
  /**
   * Check if a space requires a dice roll
   * @param {Object} space - Space to check
   * @param {Object} player - Player to check (for visit type)
   * @returns {boolean} True if dice roll is required
   */
  spaceRequiresDiceRoll(space, player) {
    // If no space provided, can't require dice roll
    if (!space) {
      console.error('MovementCore: No space provided to spaceRequiresDiceRoll');
      return false;
    }
    
    // If hasRolledDice is true, player already rolled for this space
    // This is critical to check first to ensure we don't re-require dice roll after drawing cards
    if (this.gameStateManager.hasRolledDice === true) {
      console.log('MovementCore: Player has already rolled dice this turn, not requiring another roll');
      return false;
    }
    
    // Check if the game state manager has dice roll data loaded
    if (!this.gameStateManager.diceRollData || !Array.isArray(this.gameStateManager.diceRollData)) {
      console.error(`MovementCore: Dice roll data not loaded - cannot determine if space ${space.name} requires dice`);
      return false;
    }
    
    // Check if this space has dice roll outcomes in the CSV
    const spaceHasDiceRoll = this.gameStateManager.diceRollData.some(
      row => row['Space Name'] === space.name
    );
    
    if (!spaceHasDiceRoll) {
      return false;
    }
    
    // Determine visit type
    const visitType = this.determineVisitType(player, space);
    
    // Check if this is a special case where dice roll is only conditional
    const conditionalDiceSpaces = [
      'ARCH-INITIATION', 
      'ENG-INITIATION',
      'REG-DOB-TYPE-SELECT'
    ];
    
    if (conditionalDiceSpaces.includes(space.name)) {
      // For these spaces, only subsequent visits use dice
      return visitType === 'Subsequent';
    }
    
    // For all other spaces with dice data, require roll
    return true;
  }
  
  /**
   * Extract a space name from a potentially descriptive string
   * @param {string} spaceData - Space data from CSV which might include descriptions
   * @returns {string|null} Extracted space name or null
   */
  extractSpaceName(spaceData) {
    if (!spaceData) return null;
    
    // First try to match a space name with hyphens (most common format)
    const spaceNameRegex = /([A-Z]+-[A-Z]+-[A-Z]+(?:-[A-Z]+)?)/;
    const match = spaceData.match(spaceNameRegex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    // If that didn't work, try to extract the part before any dash or description
    if (spaceData.includes(' - ')) {
      return spaceData.split(' - ')[0].trim();
    }
    
    // If all else fails, return the whole string
    return spaceData.trim();
  }
  
  /**
   * Create a snapshot of player movement data for TurnManager
   * @param {Object} player - Player to create snapshot for
   * @returns {Object} Snapshot of movement data
   */
  createPlayerMovementSnapshot(player) {
    return {
      position: player.position,
      previousPosition: player.previousPosition,
      visitHistory: player.visitHistory ? [...player.visitHistory] : [],
      hasUsedCheatBypass: this.playerHasUsedCheatBypass(player)
    };
  }
  
  /**
   * Restore player movement data from a snapshot
   * @param {Object} player - Player to restore data for
   * @param {Object} snapshot - Snapshot to restore from
   */
  restorePlayerMovementFromSnapshot(player, snapshot) {
    if (!snapshot) return;
    
    player.position = snapshot.position;
    player.previousPosition = snapshot.previousPosition;
    player.visitHistory = snapshot.visitHistory ? [...snapshot.visitHistory] : [];
    player.hasUsedCheatBypass = snapshot.hasUsedCheatBypass;
    
    // Also update properties for persistence
    if (!player.properties) {
      player.properties = {};
    }
    
    player.properties.previousPosition = snapshot.previousPosition;
    player.properties.visitHistory = snapshot.visitHistory ? [...snapshot.visitHistory] : [];
    player.properties.hasUsedCheatBypass = snapshot.hasUsedCheatBypass;
  }
}

// Export for use in other modules
window.MovementCore = MovementCore;

console.log('MovementCore.js code execution finished');
