// MoveLogicPmDecisionCheck.js - Special case handler for PM-DECISION-CHECK space
console.log('MoveLogicPmDecisionCheck.js file is beginning to be used');
console.log('MoveLogicPmDecisionCheck: SIMPLIFIED - Direct originalSpaceId storage - May 10, 2025 - v1.3.0');
// Log initial load
console.log('MoveLogicPmDecisionCheck: Script execution starting');

/**
 * MoveLogicPmDecisionCheck - Handler for PM-DECISION-CHECK special case logic
 * 
 * This module contains the implementation for the PM-DECISION-CHECK space,
 * addressing issues with the "RETURN TO YOUR SPACE" feature and CHEAT-BYPASS option.
 * 
 * FIXED: Merged MoveLogicDirectFix into MoveLogicPmDecisionCheck to eliminate file coordination issues (2025-05-07)
 * FIXED: Reduced logging to essential messages for better performance (2025-05-07)
 * FIXED: Simplified initialization process for more reliable handling (2025-05-07)
 * FIXED: Removed redundant code and improved overall stability (2025-05-07)
 * FIXED: Implemented deterministic initialization for closed system (2025-05-07)
 * FIXED: Added explicit initialization timing checks to ensure dependencies are loaded (2025-05-08)
 * FIXED: Replaced setTimeout polling with proper event listener initialization (2025-05-08)
 * FIXED: Added proper error handling for asynchronous event operations (2025-05-08)
 * FIXED: Implemented complete event cleanup to prevent memory leaks (2025-05-08)
 * FIXED: Fixed message channel closure errors with proper async handling (2025-05-08)
 * FIXED: Added improved method overwrite protection for closed system (2025-05-09)
 * FIXED: Guaranteed event listener registration with GameStateManager detection (2025-05-09)
 * FIXED: Added comprehensive cleanup for better memory management (2025-05-09)
 * FIXED: Implemented protected property descriptors for critical methods (2025-05-09)
 * FIXED: Added enhanced sequence logging to diagnose initialization issues (2025-05-08)
 * FIXED: Fixed missing original space moves when entering PM-DECISION-CHECK space on subsequent visits (2025-05-09)
 * FIXED: Refactored into separated functions with clear responsibilities (2025-05-10)
 * FIXED: Eliminated redundancy and improved code flow with streamlined logic (2025-05-10)
 * FIXED: Improved clarity with single responsibility principle applied to each function (2025-05-10)
 * FIXED: Enhanced originalSpaceId storage with consistent persistence approach (2025-05-14)
 * FIXED: Implemented distinct visit tracking for Main Path and Quest Side visits (2025-05-13)
 * FIXED: Updated terminology to "Initial/Subsequent" for Main Path and "Maiden/Return" for Quest Side (2025-05-13)
 * FIXED: Eliminated redundant mainPathVisitStatus tracking and simplified to use standard visitType (2025-05-14)
 * FIXED: Streamlined tracking system to improve reliability and prevent inconsistent states (2025-05-14)
 * FIXED: Enhanced TurnManager player snapshot creation to properly copy properties (2025-05-15)
 * FIXED: Fixed missing original space moves issue by ensuring properties survive snapshot process (2025-05-15)
 * FIXED: Maintained closed system principles by using standard property storage mechanism (2025-05-15)
 */
(function() {
  // Initialize function scope
  
  // Track initialization state
  const state = {
    initialized: false,
    initializationAttempted: false,
    dependenciesReady: false,
    eventListenersRegistered: false,
    methodsAttached: false,
    initializationListeners: [],
    eventHandlers: {},
    gameStateManagerDetection: null,
    // Track if methods have been overwritten so we can restore them
    methodOverwriteProtection: {
      enabled: true,
      interval: null,
      methods: ['handlePmDecisionCheck', 'handlePmDecisionMoveSelection', 'getPlayerGameProperty', 'setPlayerGameProperty']
    },
    // Add version info
    version: '1.3.0',
    lastUpdated: '2025-05-10'
  };
  
  // Function declarations
  let handlePmDecisionCheck;
  let handlePmDecisionMoveSelection;
  let getPlayerGameProperty;
  let setPlayerGameProperty;
  let storeOriginalSpaceInfo;
  let getAvailableMovesForPmDecisionCheck;
  let getStandardPmDecisionMoves;
  let addOriginalSpaceMoves;
  let resolveSpace;
  let getPreviousSpaceId;
  let getPlayerHasUsedCheatBypass;
  
  /**
   * Main initialization function using event-driven approach
   */
  function initialize() {
    if (state.initialized) {
      return;
    }
    
    state.initializationAttempted = true;
    
    // Check if dependencies are already available
    const dependencyCheck = {
      moveLogicSpecialCasesExists: !!window.MoveLogicSpecialCases,
      hasSpecialCaseLogicExists: window.MoveLogicSpecialCases && 
                              typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function',
      specialCaseSpacesExists: window.MoveLogicSpecialCases && 
                             Array.isArray(window.MoveLogicSpecialCases.specialCaseSpaces)
    };
    
    // First check if dependencies are already available
    if (dependencyCheck.moveLogicSpecialCasesExists && 
        dependencyCheck.hasSpecialCaseLogicExists && 
        dependencyCheck.specialCaseSpacesExists) {
      
      state.dependenciesReady = true;
      completeInitialization();
      return;
    }
    
    // Listen for MoveLogicSpecialCases initialization event
    const specialCasesListener = function(event) {
      console.log('[PMDecision-SEQ-5] Received MoveLogicSpecialCasesInitialized event');
      
      // Detailed check of dependency state
      const listenerDependencyCheck = {
        moveLogicSpecialCasesExists: !!window.MoveLogicSpecialCases,
        hasSpecialCaseLogicExists: window.MoveLogicSpecialCases && 
                                  typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function',
        specialCaseSpacesExists: window.MoveLogicSpecialCases && 
                                Array.isArray(window.MoveLogicSpecialCases.specialCaseSpaces)
      };
      
      // Check that dependencies are actually ready
      if (listenerDependencyCheck.moveLogicSpecialCasesExists && 
          listenerDependencyCheck.hasSpecialCaseLogicExists && 
          listenerDependencyCheck.specialCaseSpacesExists) {
        
        console.log('[PMDecision-SEQ-5] MoveLogicSpecialCases is ready in event listener');
        state.dependenciesReady = true;
        
        // Clean up this event listener
        window.removeEventListener('MoveLogicSpecialCasesInitialized', specialCasesListener);
        console.log('[PMDecision-SEQ-5] Removed MoveLogicSpecialCasesInitialized listener');
        completeInitialization();
      } else {
        console.warn('[PMDecision-SEQ-5] MoveLogicSpecialCasesInitialized event received but dependencies not ready');
      }
    };
    
    window.addEventListener('MoveLogicSpecialCasesInitialized', specialCasesListener);
    state.initializationListeners.push(['MoveLogicSpecialCasesInitialized', specialCasesListener]);
    
    // Listen for the general moveLogicDependenciesReady event
    const dependenciesListener = function(event) {
      console.log('[PMDecision-SEQ-5] Received moveLogicDependenciesReady event');
      
      // Detailed check of dependency state
      const listenerDependencyCheck = {
        moveLogicSpecialCasesExists: !!window.MoveLogicSpecialCases,
        hasSpecialCaseLogicExists: window.MoveLogicSpecialCases && 
                                  typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function',
        specialCaseSpacesExists: window.MoveLogicSpecialCases && 
                                Array.isArray(window.MoveLogicSpecialCases.specialCaseSpaces)
      };
      
      // Check that dependencies are actually ready
      if (listenerDependencyCheck.moveLogicSpecialCasesExists && 
          listenerDependencyCheck.hasSpecialCaseLogicExists && 
          listenerDependencyCheck.specialCaseSpacesExists) {
        
        console.log('[PMDecision-SEQ-5] Dependencies confirmed ready from moveLogicDependenciesReady');
        state.dependenciesReady = true;
        
        // Clean up this event listener
        window.removeEventListener('moveLogicDependenciesReady', dependenciesListener);
        console.log('[PMDecision-SEQ-5] Removed moveLogicDependenciesReady listener');
        completeInitialization();
      } else {
        console.warn('[PMDecision-SEQ-5] moveLogicDependenciesReady event received but dependencies still not ready');
      }
    };
    
    window.addEventListener('moveLogicDependenciesReady', dependenciesListener);
    state.initializationListeners.push(['moveLogicDependenciesReady', dependenciesListener]);
    
    // Check for previously fired initialization events
    if (window.MoveLogicSpecialCasesInitialized) {
      console.log('[PMDecision-SEQ-5] Detected that MoveLogicSpecialCases was already initialized');
      
      const flagDependencyCheck = {
        moveLogicSpecialCasesExists: !!window.MoveLogicSpecialCases,
        hasSpecialCaseLogicExists: window.MoveLogicSpecialCases && 
                                  typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function',
        specialCaseSpacesExists: window.MoveLogicSpecialCases && 
                                Array.isArray(window.MoveLogicSpecialCases.specialCaseSpaces)
      };
      
      if (flagDependencyCheck.moveLogicSpecialCasesExists && 
          flagDependencyCheck.hasSpecialCaseLogicExists && 
          flagDependencyCheck.specialCaseSpacesExists) {
        
        console.log('[PMDecision-SEQ-5] Dependencies confirmed ready from MoveLogicSpecialCasesInitialized flag');
        state.dependenciesReady = true;
        completeInitialization();
      }
    }
    
    if (window.moveLogicDependenciesReady) {
      console.log('[PMDecision-SEQ-5] Detected that moveLogicDependencies were already marked ready');
      
      const flagDependencyCheck = {
        moveLogicSpecialCasesExists: !!window.MoveLogicSpecialCases,
        hasSpecialCaseLogicExists: window.MoveLogicSpecialCases && 
                                  typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function',
        specialCaseSpacesExists: window.MoveLogicSpecialCases && 
                                Array.isArray(window.MoveLogicSpecialCases.specialCaseSpaces)
      };
      
      if (flagDependencyCheck.moveLogicSpecialCasesExists && 
          flagDependencyCheck.hasSpecialCaseLogicExists && 
          flagDependencyCheck.specialCaseSpacesExists) {
        
        console.log('[PMDecision-SEQ-5] Dependencies confirmed ready from moveLogicDependenciesReady flag');
        state.dependenciesReady = true;
        completeInitialization();
      }
    }
  }
  
  /**
   * Complete initialization once dependencies are available
   */
  function completeInitialization() {   
    if (state.initialized || !state.dependenciesReady) {
      return;
    }
    
    // Define all function implementations
    implementFunctions();
    
    // Attach methods to MoveLogicSpecialCases
    attachMethodsToMoveLogicSpecialCases();
    
    // Verify method attachment
    const verificationResult = verifyMethodAttachment();
    
    // Register event listeners
    registerEventListeners();
    
    // Mark initialization as complete
    state.initialized = true;
    window.MoveLogicPmDecisionCheckInitialized = true;
    
    // Clean up any remaining event listeners
    cleanupInitializationListeners();
    
    // Dispatch initialization event
    dispatchInitializedEvent();
    
    console.log('MoveLogicPmDecisionCheck: Initialization completed successfully');
  }
  
  /**
   * Clean up all initialization event listeners and other resources
   */
  function cleanupInitializationListeners() {
    // Clean up initialization listeners
    if (state.initializationListeners.length > 0) {
      console.log('[PMDecision-SEQ-CLEANUP] Cleaning up initialization listeners');
      
      state.initializationListeners.forEach(([eventName, listener]) => {
        window.removeEventListener(eventName, listener);
      });
      
      state.initializationListeners = [];
    }
    
    // Disconnect any mutation observers
    if (state.gameStateManagerDetection) {
      state.gameStateManagerDetection.disconnect();
      state.gameStateManagerDetection = null;
      console.log('[PMDecision-SEQ-CLEANUP] Disconnected GameStateManager detection observer');
    }
    
    // Clean up any intervals
    if (state.methodOverwriteProtection.interval) {
      clearInterval(state.methodOverwriteProtection.interval);
      state.methodOverwriteProtection.interval = null;
      console.log('[PMDecision-SEQ-CLEANUP] Cleared method protection interval');
    }
  }
  
  /**
   * Dispatch an event to notify other components that initialization is complete
   */
  function dispatchInitializedEvent() {
    try {
      const event = new CustomEvent('MoveLogicPmDecisionCheckInitialized', {
        detail: {
          methodsAttached: state.methodsAttached,
          initialized: state.initialized
        }
      });
      window.dispatchEvent(event);
      console.log('MoveLogicPmDecisionCheck: Dispatched initialization event');
    } catch (e) {
      console.error('MoveLogicPmDecisionCheck: Error dispatching initialization event', e);
    }
  }
  
  /**
   * Implement all function definitions with simplified property storage
   */
  function implementFunctions() {
    /**
     * Setter method for player game properties - uses player.properties
     * @param {Object} gameState - The current game state
     * @param {Object} player - The player to set property for
     * @param {string} propertyName - The name of the property to set
     * @param {any} value - The value to set
     * @returns {boolean} - True if property was successfully stored
     */
    setPlayerGameProperty = function(gameState, player, propertyName, value) {
      try {
        console.log(`PM-DECISION-CHECK: Setting ${propertyName} to:`, value);
        
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
     * Getter for player game properties - uses player.properties
     * @param {Object} gameState - The current game state
     * @param {Object} player - The player to get property for
     * @param {string} propertyName - The name of the property to get
     * @returns {any} - The property value or null if not found
     */
    getPlayerGameProperty = function(gameState, player, propertyName) {
      // Check in player.properties - standard approach in closed system
      if (player.properties && player.properties[propertyName] !== undefined) {
        console.log(`PM-DECISION-CHECK: Found ${propertyName} in player.properties:`, player.properties[propertyName]);
        return player.properties[propertyName];
      }
      
      // In a closed system, properties must be properly set and maintained
      console.log(`PM-DECISION-CHECK: Property ${propertyName} not found in player.properties`);
      return null;
    };
    
    /**
     * Get the player's previous space ID
     * @param {Object} player - The player object
     * @returns {string|null} - The previous space ID or null if not found
     */
    getPreviousSpaceId = function(player) {
      // Try getting from position history (most reliable)
      if (player.positionHistory && 
          Array.isArray(player.positionHistory) && 
          player.positionHistory.length >= 2) {
        return player.positionHistory[player.positionHistory.length - 2];
      }
      
      // Try getting from previous position property
      if (player.previousPosition) {
        return player.previousPosition;
      }
      
      return null;
    };
    
    /**
     * Check if the player has used cheat bypass
     * @param {Object} player - The player object
     * @returns {boolean} - True if the player has used cheat bypass
     */
    getPlayerHasUsedCheatBypass = function(player) {
      // Direct property access - simpler is better
      return player.hasUsedCheatBypass === true;
    };
    
    /**
     * Store original space information when player first arrives
     * @param {Object} gameState - The current game state
     * @param {Object} player - The current player
     * @returns {boolean} - True if storage was successful
     */
    storeOriginalSpaceInfo = function(gameState, player) {
      console.log('PM-DECISION-CHECK: Storing original space info');
      
      // Get previous space ID - this is already tracked by GameStateManager
      const previousSpaceId = player.previousPosition;
      
      if (!previousSpaceId) {
        console.log("PM-DECISION-CHECK: No previous space ID found");
        return false;
      }
      
      console.log("PM-DECISION-CHECK: Using previous space ID:", previousSpaceId);
      
      // Store in standard game state location - should be saved automatically
      player.originalSpaceId = previousSpaceId;
      
      // Also maintain in properties for backward compatibility
      if (!player.properties) player.properties = {};
      player.properties.originalSpaceId = previousSpaceId;
      
      // Force game state save to ensure persistence
      if (gameState.saveState) gameState.saveState();
      
      return true;
    };
    
    /**
     * Helper to resolve a space name to a space object
     * @param {Object} gameState - The current game state
     * @param {Object} player - The current player
     * @param {string} spaceName - The name of the space to resolve
     * @returns {Object|null} - The resolved space object or null if not found
     */
    resolveSpace = function(gameState, player, spaceName) {
      // Try resolveSpaceForVisitType if available
      if (typeof window.MoveLogicSpecialCases.resolveSpaceForVisitType === 'function') {
        return window.MoveLogicSpecialCases.resolveSpaceForVisitType(gameState, player, spaceName);
      }
      
      // Direct lookup fallback
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === spaceName);
      
      return matchingSpaces.length > 0 ? matchingSpaces[0] : null;
    };
    
    /**
     * Get standard moves from PM-DECISION-CHECK
     * @param {Object} gameState - The current game state
     * @param {Object} player - The current player
     * @param {Object} currentSpace - The current space
     * @returns {Array} - Array of available moves
     */
    getStandardPmDecisionMoves = function(gameState, player, currentSpace) {
      const availableMoves = [];
      
      // Get next spaces from the space definition
      const nextSpaces = [
        currentSpace.rawSpace1, 
        currentSpace.rawSpace2, 
        currentSpace.rawSpace3, 
        currentSpace.rawSpace4, 
        currentSpace.rawSpace5
      ].filter(space => space && space.trim() !== '' && space !== 'n/a');
      
      // Process each next space
      for (const nextSpaceName of nextSpaces) {
        // Skip "RETURN TO YOUR SPACE" option if it exists in CSV
        if (nextSpaceName.includes('RETURN TO YOUR SPACE')) continue;
        
        const spaceName = gameState.extractSpaceName(nextSpaceName);
        
        // Special handling for CHEAT-BYPASS
        if (spaceName === 'CHEAT-BYPASS') {
          const bypassSpace = resolveSpace(gameState, player, spaceName);
          
          if (bypassSpace) {
            bypassSpace.isCheatBypass = true;
            availableMoves.push(bypassSpace);
          }
          continue;
        }
        
        // Standard space handling
        const space = resolveSpace(gameState, player, spaceName);
        
        if (space && !availableMoves.some(move => move.id === space.id)) {
          availableMoves.push(space);
        }
      }
      
      return availableMoves;
    };
    
    /**
     * Add moves from the original space to available moves
     * @param {Object} gameState - The current game state
     * @param {Object} player - The current player
     * @param {Object} originalSpace - The original space
     * @param {Array} availableMoves - The array of available moves
     * @returns {Array} - The updated array of available moves
     */
    addOriginalSpaceMoves = function(gameState, player, originalSpace, availableMoves) {
      console.log('PM-DECISION-CHECK: Adding moves from original space:', originalSpace.name);
      
      // Get next spaces from the original space data in CSV
      const nextSpaces = [];
      
      // Collect all potential moves from the CSV data (all rawSpace fields)
      for (let i = 1; i <= 10; i++) {
        const rawSpaceField = `rawSpace${i}`;
        if (originalSpace[rawSpaceField] && 
            originalSpace[rawSpaceField].trim() !== '' && 
            originalSpace[rawSpaceField] !== 'n/a') {
          nextSpaces.push(originalSpace[rawSpaceField]);
        }
      }
      
      // Process each next space from CSV data
      for (const nextSpaceName of nextSpaces) {
        // Skip PM-DECISION-CHECK to avoid a loop
        if (nextSpaceName.includes('PM-DECISION-CHECK')) {
          continue;
        }
        
        const spaceName = gameState.extractSpaceName(nextSpaceName);
        
        // Find matching spaces with this name
        const matchingSpaces = gameState.spaces.filter(s => {
          return gameState.extractSpaceName(s.name) === spaceName;
        });
        
        if (matchingSpaces.length === 0) {
          continue;
        }
        
        // Select appropriate space based on visit type
        let space = null;
        
        // Prefer first visit
        space = matchingSpaces.find(s => s.visitType && s.visitType.toLowerCase() === 'first');
        
        // If no first visit type, use any matching space
        if (!space && matchingSpaces.length > 0) {
          space = matchingSpaces[0];
        }
        
        // Skip if already in available moves
        if (availableMoves.some(move => move.id === space.id)) {
          continue;
        }
        
        // Create a copy to avoid modifying the original
        const spaceCopy = JSON.parse(JSON.stringify(space));
        
        // Mark as coming from original space
        spaceCopy.fromOriginalSpace = true;
        spaceCopy.originalSpaceId = originalSpace.id;
        spaceCopy.originalSpaceName = originalSpace.name;
        
        // Modify name to indicate source
        spaceCopy.name = `${spaceCopy.name} (from ${originalSpace.name})`;
        
        // Store original description
        spaceCopy.originalDescription = spaceCopy.description;
        spaceCopy.description = `From ${originalSpace.name}: ${spaceCopy.description || ''}`;
        
        // Add to available moves
        availableMoves.push(spaceCopy);
      }
      
      return availableMoves;
    };
    
    /**
     * Calculate available moves for PM-DECISION-CHECK space
     * @param {Object} gameState - The current game state
     * @param {Object} player - The current player
     * @param {Object} currentSpace - The current space
     * @returns {Array} - Array of available moves
     */
    getAvailableMovesForPmDecisionCheck = function(gameState, player, currentSpace) {
      console.log('PM-DECISION-CHECK: Calculating available moves for player', player.id);
      
      // Start with standard PM-DECISION-CHECK moves
      const availableMoves = getStandardPmDecisionMoves(gameState, player, currentSpace);
      
      // Simply check for originalSpaceId directly on player object
      const originalSpaceId = player.originalSpaceId;
      const hasUsedCheatBypass = player.hasUsedCheatBypass;
      
      console.log('PM-DECISION-CHECK: Retrieved originalSpaceId:', originalSpaceId);
      
      // Add original space moves if we have an originalSpaceId and player hasn't used cheat bypass
      if (originalSpaceId && !hasUsedCheatBypass) {
        const originalSpace = gameState.findSpaceById(originalSpaceId);
        
        if (originalSpace) {
          console.log('PM-DECISION-CHECK: Found original space:', originalSpace.name);
          // Add moves from original space
          addOriginalSpaceMoves(gameState, player, originalSpace, availableMoves);
        } else {
          console.log('PM-DECISION-CHECK: Original space not found for ID:', originalSpaceId);
        }
      } else if (!originalSpaceId) {
        console.log('PM-DECISION-CHECK: No originalSpaceId found');
      } else if (hasUsedCheatBypass) {
        console.log('PM-DECISION-CHECK: Player has used cheat bypass, not adding original space moves');
      }
      
      console.log('PM-DECISION-CHECK: Final available moves:', availableMoves.map(move => move.name).join(', '));
      return availableMoves;
    };
    
    /**
     * Main handler for PM-DECISION-CHECK space - orchestrates the tracking and processing
     * @param {Object} gameState - The current game state
     * @param {Object} player - The current player
     * @param {Object} currentSpace - The current space
     * @returns {Array} - Array of available moves
     */
    handlePmDecisionCheck = function(gameState, player, currentSpace) {
      console.log('PM-DECISION-CHECK: Processing space for player', player.id);
      
      // Always check if original space info is stored
      const hasOriginalSpaceId = getPlayerGameProperty(gameState, player, 'originalSpaceId') !== null;
      
      if (!hasOriginalSpaceId) {
        console.log('PM-DECISION-CHECK: No originalSpaceId found, storing it now');
        storeOriginalSpaceInfo(gameState, player);
      }
      
      // Get the current entry source
      const entrySource = determineEntrySource(gameState, player);
      console.log('PM-DECISION-CHECK: Entry source determined as:', entrySource);
      
      // Get current quest side visit status (Maiden/Return)
      const questSideVisitStatus = getPlayerGameProperty(gameState, player, 'questSideVisitStatus') || 'Maiden';
      
      // Update visit tracking based on entry source
      if (entrySource === 'questSide') {
        // Update quest side visit tracking (Maiden -> Return)
        if (questSideVisitStatus === 'Maiden') {
          setPlayerGameProperty(gameState, player, 'questSideVisitStatus', 'Return');
        }
      }
      
      // Calculate and return available moves
      const moves = getAvailableMovesForPmDecisionCheck(gameState, player, currentSpace);
      return moves;
    };
    
    /**
     * Determine if the player is entering PM-DECISION-CHECK from main path or quest side
     * @param {Object} gameState - The current game state
     * @param {Object} player - The player object
     * @returns {string} - 'mainPath', 'questSide', or 'unknown'
     */
    function determineEntrySource(gameState, player) {
      // Get previous space ID
      const previousSpaceId = getPreviousSpaceId(player);
      if (!previousSpaceId) {
        return 'unknown';
      }
      
      // Get previous space
      const previousSpace = gameState.findSpaceById(previousSpaceId);
      if (!previousSpace) {
        return 'unknown';
      }
      
      // List of known quest side spaces
      const questSideSpaces = ['LEND-SCOPE-CHECK', 'ARCH-INITIATION', 'CHEAT-BYPASS', 'OWNER-DECISION-REVIEW'];
      
      // Check if previous space is a quest side space
      if (questSideSpaces.some(questSpace => 
          previousSpace.name.includes(questSpace) || gameState.extractSpaceName(previousSpace.name) === questSpace)) {
        return 'questSide';
      }
      
      // Check if player has an original space that matches the previous space
      const originalSpaceId = getPlayerGameProperty(gameState, player, 'originalSpaceId');
      if (originalSpaceId === previousSpaceId) {
        // Coming from original space - this is a main path entry
        return 'mainPath';
      }
      
      // Default to main path if we can't determine otherwise
      return 'mainPath';
    }
    
    /**
     * Handle move selection for PM-DECISION-CHECK space
     * @param {Object} gameState - The current game state
     * @param {Object} player - The player who selected the move
     * @param {Object} selectedMove - The move that was selected
     * @returns {Object} - The processed move
     */
    handlePmDecisionMoveSelection = function(gameState, player, selectedMove) {
      console.log('PM-DECISION-CHECK: Handling move selection');
      
      // Handle CHEAT-BYPASS selection
      if (selectedMove.isCheatBypass) {
        // Clear originalSpaceId (point of no return)
        player.originalSpaceId = null;
        
        // Set permanent flag that player has used cheat bypass
        player.hasUsedCheatBypass = true;
        
        // Also set in properties for backward compatibility
        if (!player.properties) player.properties = {};
        player.properties.hasUsedCheatBypass = true;
        
        // Force game state save
        if (gameState.saveState) gameState.saveState();
        
        console.log('PM-DECISION-CHECK: Player selected CHEAT-BYPASS, no return possible');
      }
      
      // Handle selection of moves from original space
      if (selectedMove.fromOriginalSpace) {
        // Clear originalSpaceId as player is now returning to original path
        player.originalSpaceId = null;
        
        // Restore original description if it was modified
        if (selectedMove.originalDescription) {
          selectedMove.description = selectedMove.originalDescription;
        }
        
        console.log('PM-DECISION-CHECK: Player selected to return to original path');
      }
      
      return selectedMove;
    };
  }
  
  /**
   * Attach methods to MoveLogicSpecialCases instance
   */
  function attachMethodsToMoveLogicSpecialCases() {
    // For each method attachment
    try {
      window.MoveLogicSpecialCases.handlePmDecisionCheck = function() {
        return handlePmDecisionCheck.apply(this, arguments);
      };
    } catch (e) {
      console.error('Error attaching handlePmDecisionCheck:', e);
    }
    
    try {
      window.MoveLogicSpecialCases.handlePmDecisionMoveSelection = function() {
        return handlePmDecisionMoveSelection.apply(this, arguments);
      };
    } catch (e) {
      console.error('Error attaching handlePmDecisionMoveSelection:', e);
    }
    
    try {
      window.MoveLogicSpecialCases.getPlayerGameProperty = function() {
        return getPlayerGameProperty.apply(this, arguments);
      };
    } catch (e) {
      console.error('Error attaching getPlayerGameProperty:', e);
    }
    
    try {
      window.MoveLogicSpecialCases.setPlayerGameProperty = function() {
        return setPlayerGameProperty.apply(this, arguments);
      };
    } catch (e) {
      console.error('Error attaching setPlayerGameProperty:', e);
    }
    
    // Make sure PM-DECISION-CHECK is in the specialCaseSpaces array
    try {
      if (!window.MoveLogicSpecialCases.specialCaseSpaces.includes('PM-DECISION-CHECK')) {
        window.MoveLogicSpecialCases.specialCaseSpaces.push('PM-DECISION-CHECK');
      }
    } catch (e) {
      console.error('Error adding PM-DECISION-CHECK to specialCaseSpaces:', e);
    }
    
    // Create reference object for diagnostics
    try {
      window.MoveLogicPmDecisionCheckReference = {
        handlePmDecisionCheck: handlePmDecisionCheck,
        handlePmDecisionMoveSelection: handlePmDecisionMoveSelection,
        getPlayerGameProperty: getPlayerGameProperty,
        setPlayerGameProperty: setPlayerGameProperty,
        storeOriginalSpaceInfo: storeOriginalSpaceInfo,
        getAvailableMovesForPmDecisionCheck: getAvailableMovesForPmDecisionCheck,
        getStandardPmDecisionMoves: getStandardPmDecisionMoves,
        addOriginalSpaceMoves: addOriginalSpaceMoves,
        resolveSpace: resolveSpace
      };
    } catch (e) {
      console.error('Error creating MoveLogicPmDecisionCheckReference:', e);
    }
    
    state.methodsAttached = true;
  }
  
  /**
   * Register event listeners for game state changes
   * Enhanced for closed system with guaranteed registration 
   */
  function registerEventListeners() {
    // Store event handlers for reference and cleanup
    const eventHandlers = state.eventHandlers = state.eventHandlers || {};
    
    // If already registered, just return
    if (state.eventListenersRegistered) {
      console.log('[PMDecision-SEQ-EVENT] Event listeners already registered');
      return;
    }
    
    // If GameStateManager is not available, set up listener for it
    if (!window.GameStateManager) {
      console.log('[PMDecision-SEQ-EVENT] GameStateManager not available yet, setting up detection');
      
      // Set up a GameStateManager detection mechanism
      if (!state.gameStateManagerDetection) {
        // Create a MutationObserver to monitor for GameStateManager
        const observer = new MutationObserver(function(mutations) {
          if (window.GameStateManager && !state.eventListenersRegistered) {
            console.log('[PMDecision-SEQ-EVENT] GameStateManager detected, registering event listeners');
            registerEventHandlers();
            observer.disconnect();
          }
        });
        
        // Observe window object for changes
        observer.observe(document.body, { childList: true, subtree: true });
        state.gameStateManagerDetection = observer;
        
        // Also listen for initialization events that might indicate GameStateManager is ready
        const gameStateReadyListener = function() {
          if (window.GameStateManager && !state.eventListenersRegistered) {
            console.log('[PMDecision-SEQ-EVENT] GameStateManager ready event received');
            registerEventHandlers();
            window.removeEventListener('gameStateManagerReady', gameStateReadyListener);
          }
        };
        
        window.addEventListener('gameStateManagerReady', gameStateReadyListener);
      }
      return;
    }
    
    // GameStateManager is available, register the handlers
    registerEventHandlers();
    
    /**
     * Helper function to actually register the event handlers
     */
    function registerEventHandlers() {
      // Define listener for gameStateChanged events
      const gameStateChangedListener = function(event) {
        const eventData = event ? JSON.parse(JSON.stringify(event.data || {})) : {};
        
        // Only process availableMovesUpdated events
        if (eventData.changeType === 'availableMovesUpdated') {
          // Get current player
          const player = window.GameStateManager.getCurrentPlayer();
          if (!player) return false;
          
          // Get current space
          const currentSpaceId = player.position;
          const currentSpace = window.GameStateManager.findSpaceById(currentSpaceId);
          
          // Only process PM-DECISION-CHECK spaces
          if (currentSpace && currentSpace.name === 'PM-DECISION-CHECK') {
            // Get standard visitType and quest side visit status
            const visitType = currentSpace.visitType || 'First';
            const questSideVisitStatus = getPlayerGameProperty(window.GameStateManager, player, 'questSideVisitStatus') || 'Maiden';
            
            // Only proceed if this is a subsequent visit (standard or quest side) and player hasn't used CHEAT-BYPASS
            if ((visitType.toLowerCase() === 'subsequent' || questSideVisitStatus === 'Return') && 
                !getPlayerHasUsedCheatBypass(player) &&
                !eventData.processedByPmDecisionCheck) {
              
              // Get the original space
              const originalSpaceId = getPlayerGameProperty(window.GameStateManager, player, 'originalSpaceId');
              
              if (originalSpaceId) {
                const originalSpace = window.GameStateManager.findSpaceById(originalSpaceId);
                
                if (originalSpace) {
                  // Get existing moves
                  const existingMoves = eventData.availableMoves || eventData.moves || [];
                  
                  // Create temporary array for modifications
                  const tempMoves = [...existingMoves];
                  
                  // Add original space moves
                  addOriginalSpaceMoves(window.GameStateManager, player, originalSpace, tempMoves);
                  
                  // If moves were added, dispatch new event
                  if (tempMoves.length > existingMoves.length) {
                    // Create new event data
                    const newEventData = {
                      ...eventData,
                      moves: tempMoves,
                      availableMoves: tempMoves,
                      processedByPmDecisionCheck: true
                    };
                    
                    // Dispatch new event
                    const newEvent = new CustomEvent('gameStateChanged', {
                      detail: {
                        data: newEventData
                      }
                    });
                    window.dispatchEvent(newEvent);
                    
                    return true;
                  }
                }
              }
            }
          }
        }
        
        // Not handled
        return false;
      };
      
      // Add event listener and store reference for cleanup
      window.GameStateManager.addEventListener('gameStateChanged', gameStateChangedListener);
      eventHandlers.gameStateChanged = gameStateChangedListener;
      
      console.log('[PMDecision-SEQ-EVENT] Successfully registered gameStateChanged listener');
      
      // Mark as registered to prevent duplicate registration
      state.eventListenersRegistered = true;
    }
  }
  
  /**
   * Verify that methods were attached correctly and set up method protection
   * @returns {boolean} - True if all methods are present
   */
  function verifyMethodAttachment() {
    const methods = [
      'handlePmDecisionCheck',
      'handlePmDecisionMoveSelection',
      'getPlayerGameProperty'
    ];
    
    console.log('[PMDecision-SEQ-11] Beginning method verification');
    
    let allMethodsPresent = true;
    methods.forEach(function(methodName) {
      const isPresent = typeof window.MoveLogicSpecialCases[methodName] === 'function';
      console.log(`[PMDecision-SEQ-11] ${methodName} is ${isPresent ? 'PRESENT' : 'MISSING'} on instance`);
      if (!isPresent) allMethodsPresent = false;
    });
    
    // Additional verification: call it at runtime
    if (typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function') {
      const isPmDecisionCheckSpecialCase = window.MoveLogicSpecialCases.hasSpecialCaseLogic('PM-DECISION-CHECK');
      console.log('[PMDecision-SEQ-11] PM-DECISION-CHECK is identified as a special case:', isPmDecisionCheckSpecialCase);
    }
    
    // Set up method overwrite protection - CRITICAL CLOSED SYSTEM FEATURE
    setupMethodProtection();
    
    // Enhance the player snapshot creation to properly copy properties
    setupTurnChangeListener();
    
    return allMethodsPresent;
  }
  
  /**
   * Set up a system to ensure properties are correctly copied during player snapshots
   */
  function setupTurnChangeListener() {
  try {
  // This will patch the player snapshot creation process in TurnManager
  if (window.TurnManager && window.TurnManager.createPlayerSnapshot) {
  // Save the original function
  const originalCreateSnapshot = window.TurnManager.createPlayerSnapshot;
  
  // Replace with our enhanced version that properly copies properties
  window.TurnManager.createPlayerSnapshot = function(player) {
  console.log('[PMDecision-SEQ-TURN] Creating player snapshot with enhanced property handling');
  console.log('[PMDecision-SEQ-TURN] Original player properties:', player.properties);
  
  // Call the original function to create the snapshot
  const snapshot = originalCreateSnapshot.call(this, player);
  
  // Now make sure properties are properly copied
  if (player.properties && Object.keys(player.properties).length > 0) {
  console.log('[PMDecision-SEQ-TURN] Player has properties to copy during snapshot');
  // Ensure properties object exists in snapshot
  if (!snapshot.properties) {
    snapshot.properties = {};
  }
  
  // Copy all properties (create deep copies for objects)
  Object.keys(player.properties).forEach(key => {
    if (typeof player.properties[key] === 'object' && player.properties[key] !== null) {
      snapshot.properties[key] = JSON.parse(JSON.stringify(player.properties[key]));
  } else {
      snapshot.properties[key] = player.properties[key];
      }
    });
    
      // Log original space ID specifically since it's critical
      if (player.properties.originalSpaceId) {
        console.log('[PMDecision-SEQ-TURN] Copied originalSpaceId to snapshot:', player.properties.originalSpaceId);
        }
    }
      
        // Verify that properties were copied correctly
      console.log('[PMDecision-SEQ-TURN] Snapshot properties after copy:', snapshot.properties);
        
        // Also copy visitedSpaces to ensure it persists
        if (player.visitedSpaces && typeof player.visitedSpaces.forEach === 'function') {
          if (!snapshot.visitedSpaces) {
            // Initialize as Array or Set based on original
            snapshot.visitedSpaces = player.visitedSpaces instanceof Set ? new Set() : [];
          }
          
          // Copy all visited spaces
          player.visitedSpaces.forEach(space => {
            if (snapshot.visitedSpaces instanceof Set) {
              snapshot.visitedSpaces.add(space);
            } else if (Array.isArray(snapshot.visitedSpaces)) {
              snapshot.visitedSpaces.push(space);
            }
          });
        }
        
        // Always ensure previousPosition is copied
        if (player.previousPosition) {
          snapshot.previousPosition = player.previousPosition;
          console.log('[PMDecision-SEQ-TURN] Copied previousPosition to snapshot:', player.previousPosition);
        }
        
        return snapshot;
      };
      
      console.log('[PMDecision-SEQ-TURN] Enhanced TurnManager.createPlayerSnapshot to properly copy properties');
    } else {
      console.log('[PMDecision-SEQ-TURN] TurnManager not found or missing createPlayerSnapshot method');
    }
  } catch (error) {
    console.error('[PMDecision-SEQ-TURN] Error setting up turn change handling:', error);
  }
}
  
  /**
   * Set up protection against method overwrites in a closed system
   * This ensures our attached methods don't get accidentally replaced
   */
  function setupMethodProtection() {
    if (!state.methodOverwriteProtection.enabled) return;
    
    console.log('[PMDecision-SEQ-PROTECT] Setting up method overwrite protection');
    
    // Store original method references
    const methodBackups = {};
    state.methodOverwriteProtection.methods.forEach(methodName => {
      if (typeof window.MoveLogicSpecialCases[methodName] === 'function') {
        methodBackups[methodName] = window.MoveLogicSpecialCases[methodName];
      }
    });
    
    // Define property on the MoveLogicSpecialCases object to prevent accidental overwrites
    state.methodOverwriteProtection.methods.forEach(methodName => {
      const originalMethod = methodBackups[methodName];
      if (originalMethod) {
        // Use a descriptor to limit modification
        Object.defineProperty(window.MoveLogicSpecialCases, methodName, {
          configurable: true, // Allow redefinition for this property if needed
          get: function() {
            return originalMethod;
          },
          set: function(newValue) {
            console.warn(`[PMDecision-SEQ-PROTECT] Attempt to overwrite ${methodName} detected`);
            // Only allow overwrite if it's from our module
            if (newValue === handlePmDecisionCheck || 
                newValue === handlePmDecisionMoveSelection || 
                newValue === getPlayerGameProperty || 
                newValue === setPlayerGameProperty) {
              console.log(`[PMDecision-SEQ-PROTECT] Allowed overwrite from our module`);
              originalMethod = newValue;
            }
            return originalMethod;
          }
        });
      }
    });
    
    console.log('[PMDecision-SEQ-PROTECT] Method protection setup complete');
  }
  
  // Start initialization when script is executed
  initialize();
  
  // Register a cleanup function for when the page unloads
  window.addEventListener('beforeunload', function() {
    cleanupInitializationListeners();
    
    // Remove registered event listeners
    if (window.GameStateManager && state.eventHandlers) {
      Object.entries(state.eventHandlers).forEach(([eventName, handler]) => {
        window.GameStateManager.removeEventListener(eventName, handler);
      });
    }
    
    console.log('[PMDecision-SEQ-CLEANUP] Final cleanup complete');
  });
  
  console.log('MoveLogicPmDecisionCheck.js code execution finished');
})();