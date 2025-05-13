/**
 * MovementCore.js
 * Core movement logic for the Project Management Game
 * 
 * This module handles the fundamental movement operations,
 * separated from UI integration and higher-level logic
 */

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
    
    // Create visit record
    const visitRecord = {
      spaceId: space.id,
      spaceName: space.name,
      timestamp: Date.now(),
      visitType: this.determineVisitType(player, space)
    };
    
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
    // If player has no visit history, it's a first visit
    if (!player.visitHistory || !Array.isArray(player.visitHistory)) {
      return 'First';
    }
    
    // Check if player has visited this space before
    const hasVisited = player.visitHistory.some(visit => 
      visit.spaceName === space.name || 
      (visit.spaceId && visit.spaceId === space.id)
    );
    
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
    
    // Define side quest spaces to filter out
    const sideQuestSpaces = ['PM-DECISION-CHECK', 'CHEAT-BYPASS', 'OWNER-DECISION-REVIEW'];
    
    // Return filtered history
    return player.visitHistory.filter(visit => 
      !sideQuestSpaces.includes(visit.spaceName)
    );
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
   * Check if a space requires a dice roll
   * @param {Object} space - Space to check
   * @param {Object} player - Player to check (for visit type)
   * @returns {boolean} True if dice roll is required
   */
  spaceRequiresDiceRoll(space, player) {
    // Check if the game state manager has dice roll data loaded
    if (!this.gameStateManager.diceRollData || !Array.isArray(this.gameStateManager.diceRollData)) {
      console.log(`MovementCore: Dice roll data not loaded yet, assuming space ${space.name} does not require dice`);
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