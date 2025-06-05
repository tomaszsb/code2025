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
  window.LOADED_VERSIONS['MovementEngine'] = '2025-06-01-003';
  console.log('MovementEngine: Version 2025-06-01-003 loaded - Fixed position tracking by using GameStateManager.movePlayer()');
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
  
  // Add stub methods for now to prevent errors
  getAvailableMovements(player) {
    console.log('MovementEngine: getAvailableMovements called (stub)');
    return [];
  }
  
  executePlayerMove(player, destinationId) {
    console.log('MovementEngine: executePlayerMove called (stub)');
    return { success: false, error: 'Not implemented in minimal version' };
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
}

// Export MovementEngine for use in other files
window.MovementEngine = MovementEngine;

console.log('MovementEngine.js code execution finished - MINIMAL VERSION for debugging [2025-06-02-001]');
