// MoveLogicPmDecisionCheck.js - Special case handler for PM-DECISION-CHECK space
console.log('MoveLogicPmDecisionCheck.js file is beginning to be used');
console.log('[PMDecision-SEQ-1] Script execution starting - initial load time:', new Date().toISOString());
console.log('[PMDecision-SEQ-1] Window globals available:', Object.keys(window).filter(key => 
  key.includes('MoveLogic')).join(', '));

/**
 * MoveLogicPmDecisionCheck - Consolidated handler for PM-DECISION-CHECK special case logic
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
 */
(function() {
  console.log('[PMDecision-SEQ-2] IIFE executing - function scope entered');
  console.log('[PMDecision-SEQ-2] MoveLogicSpecialCases exists:', !!window.MoveLogicSpecialCases);
  if (window.MoveLogicSpecialCases) {
    console.log('[PMDecision-SEQ-2] MoveLogicSpecialCases methods:', 
                Object.keys(window.MoveLogicSpecialCases).join(', '));
    console.log('[PMDecision-SEQ-2] handlePmDecisionCheck exists:', 
                typeof window.MoveLogicSpecialCases.handlePmDecisionCheck === 'function');
  }
  
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
    }
  };
  
  // Function declarations
  let handlePmDecisionCheck;
  let handlePmDecisionMoveSelection;
  let getPlayerGameProperty;
  let setPlayerGameProperty;
  let addMovesFromSourceSpace;
  let getPreviousSpaceId;
  let getPlayerHasUsedCheatBypass;
  
  /**
   * Main initialization function using event-driven approach
   */
  function initialize() {
    console.log('[PMDecision-SEQ-3] Initialize function called');
    
    if (state.initialized) {
      console.log('[PMDecision-SEQ-3] Already initialized, skipping (initialized =', state.initialized, ')');
      return;
    }
    
    state.initializationAttempted = true;
    console.log('[PMDecision-SEQ-3] Checking if dependencies are already available');
    
    // Log detailed dependency check results
    const dependencyCheck = {
      moveLogicSpecialCasesExists: !!window.MoveLogicSpecialCases,
      hasSpecialCaseLogicExists: window.MoveLogicSpecialCases && 
                              typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function',
      specialCaseSpacesExists: window.MoveLogicSpecialCases && 
                             Array.isArray(window.MoveLogicSpecialCases.specialCaseSpaces)
    };
    
    console.log('[PMDecision-SEQ-3] Dependency check results:', JSON.stringify(dependencyCheck));
    
    // First check if dependencies are already available
    if (dependencyCheck.moveLogicSpecialCasesExists && 
        dependencyCheck.hasSpecialCaseLogicExists && 
        dependencyCheck.specialCaseSpacesExists) {
      
      console.log('[PMDecision-SEQ-3] Dependencies already available, proceeding with initialization');
      state.dependenciesReady = true;
      completeInitialization();
      return;
    }
    
    console.log('[PMDecision-SEQ-4] Dependencies not yet ready, setting up event listeners');
    
    // Listen for MoveLogicSpecialCases initialization event
    const specialCasesListener = function(event) {
      console.log('[PMDecision-SEQ-5] Received MoveLogicSpecialCasesInitialized event');
      console.log('[PMDecision-SEQ-5] Event details:', event.detail ? JSON.stringify(event.detail) : 'none');
      
      // Detailed check of dependency state
      const listenerDependencyCheck = {
        moveLogicSpecialCasesExists: !!window.MoveLogicSpecialCases,
        hasSpecialCaseLogicExists: window.MoveLogicSpecialCases && 
                                  typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function',
        specialCaseSpacesExists: window.MoveLogicSpecialCases && 
                                Array.isArray(window.MoveLogicSpecialCases.specialCaseSpaces)
      };
      
      console.log('[PMDecision-SEQ-5] Listener dependency check:', JSON.stringify(listenerDependencyCheck));
      
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
        console.warn('[PMDecision-SEQ-5] Missing dependency details:', 
                   Object.entries(listenerDependencyCheck)
                         .filter(([_, value]) => !value)
                         .map(([key]) => key)
                         .join(', '));
      }
    };
    
    window.addEventListener('MoveLogicSpecialCasesInitialized', specialCasesListener);
    state.initializationListeners.push(['MoveLogicSpecialCasesInitialized', specialCasesListener]);
    
    // Listen for the general moveLogicDependenciesReady event
    const dependenciesListener = function(event) {
      console.log('[PMDecision-SEQ-5] Received moveLogicDependenciesReady event');
      console.log('[PMDecision-SEQ-5] Event details:', event.detail ? JSON.stringify(event.detail) : 'none');
      
      // Detailed check of dependency state
      const listenerDependencyCheck = {
        moveLogicSpecialCasesExists: !!window.MoveLogicSpecialCases,
        hasSpecialCaseLogicExists: window.MoveLogicSpecialCases && 
                                  typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function',
        specialCaseSpacesExists: window.MoveLogicSpecialCases && 
                                Array.isArray(window.MoveLogicSpecialCases.specialCaseSpaces)
      };
      
      console.log('[PMDecision-SEQ-5] moveLogicDependenciesReady listener dependency check:', 
                 JSON.stringify(listenerDependencyCheck));
      
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
        console.warn('[PMDecision-SEQ-5] Missing dependency details:', 
                   Object.entries(listenerDependencyCheck)
                         .filter(([_, value]) => !value)
                         .map(([key]) => key)
                         .join(', '));
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
      
      console.log('[PMDecision-SEQ-5] Flag dependency check:', JSON.stringify(flagDependencyCheck));
      
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
      
      console.log('[PMDecision-SEQ-5] Flag dependency check for moveLogicDependenciesReady:', 
                 JSON.stringify(flagDependencyCheck));
      
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
    console.log('[PMDecision-SEQ-6] completeInitialization called');
    console.log('[PMDecision-SEQ-6] State before completion:', 
                JSON.stringify({
                  initialized: state.initialized,
                  dependenciesReady: state.dependenciesReady
                }));
    
    if (state.initialized || !state.dependenciesReady) {
      console.log('[PMDecision-SEQ-6] Exiting completeInitialization - conditions not met');
      return;
    }
    
    // Define all function implementations
    console.log('[PMDecision-SEQ-6] Implementing functions');
    implementFunctions();
    
    // Attach methods to MoveLogicSpecialCases
    console.log('[PMDecision-SEQ-7] Attaching methods to MoveLogicSpecialCases');
    attachMethodsToMoveLogicSpecialCases();
    
    // Verify method attachment
    console.log('[PMDecision-SEQ-7] Verifying method attachment');
    const verificationResult = verifyMethodAttachment();
    console.log('[PMDecision-SEQ-7] Method verification result:', verificationResult);
    
    // Register event listeners
    console.log('[PMDecision-SEQ-8] Registering event listeners');
    registerEventListeners();
    
    // Mark initialization as complete
    state.initialized = true;
    window.MoveLogicPmDecisionCheckInitialized = true;
    
    // Clean up any remaining event listeners
    cleanupInitializationListeners();
    
    // Dispatch initialization event
    dispatchInitializedEvent();
    
    console.log('[PMDecision-SEQ-9] Initialization completed successfully');
    console.log('[PMDecision-SEQ-9] Final state:', JSON.stringify({
      initialized: state.initialized,
      methodsAttached: state.methodsAttached,
      eventListenersRegistered: state.eventListenersRegistered
    }));
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
   * Implement all function definitions
   */
  function implementFunctions() {
    /**
     * Add moves from a source space to the availableMoves array
     * @param {Object} gameState - The current game state
     * @param {Object} player - The current player
     * @param {Object} sourceSpace - The space to get moves from
     * @param {Array} availableMoves - The array of available moves to modify
     * @returns {Array} The modified availableMoves array
     */
    addMovesFromSourceSpace = function(gameState, player, sourceSpace, availableMoves) {
      console.log('MoveLogicPmDecisionCheck: Adding moves from source space:', sourceSpace.name);
      
      if (!sourceSpace) {
        console.error('MoveLogicPmDecisionCheck: Source space is undefined or null');
        return availableMoves;
      }
      
      if (!availableMoves || !Array.isArray(availableMoves)) {
        console.error('MoveLogicPmDecisionCheck: availableMoves is not an array');
        availableMoves = [];
      }
      
      // Get raw next spaces from the source space
      const rawNextSpaces = [
        sourceSpace.rawSpace1, 
        sourceSpace.rawSpace2, 
        sourceSpace.rawSpace3, 
        sourceSpace.rawSpace4, 
        sourceSpace.rawSpace5
      ].filter(space => space && space.trim() !== '' && space !== 'n/a');
      
      // Process each raw space name to get the actual move objects
      for (const rawSpaceName of rawNextSpaces) {
        // Skip PM-DECISION-CHECK to avoid creating a loop
        if (rawSpaceName.includes('PM-DECISION-CHECK')) continue;
        
        // Extract the cleaned space name
        const cleanedSpaceName = gameState.extractSpaceName ? 
          gameState.extractSpaceName(rawSpaceName) : 
          rawSpaceName.split(' - ')[0].trim();
        
        // Skip if the move is already in availableMoves
        const isMoveAlreadyPresent = availableMoves.some(move => {
          if (move.name === cleanedSpaceName) return true;
          if (move.name.includes(cleanedSpaceName)) return true;
          if (move.id && move.id.includes(cleanedSpaceName.toLowerCase())) return true;
          return false;
        });
        
        if (isMoveAlreadyPresent) continue;
        
        // Try to resolve the space
        let nextSpace = null;
        
        // Try using MoveLogicSpecialCases.resolveSpaceForVisitType
        if (typeof window.MoveLogicSpecialCases.resolveSpaceForVisitType === 'function') {
          nextSpace = window.MoveLogicSpecialCases.resolveSpaceForVisitType(gameState, player, cleanedSpaceName);
        }
        
        // If not found, try direct search in spaces array
        if (!nextSpace && gameState.spaces && Array.isArray(gameState.spaces)) {
          nextSpace = gameState.spaces.find(s => {
            const spaceName = gameState.extractSpaceName ? 
              gameState.extractSpaceName(s.name) : 
              s.name.split(' - ')[0].trim();
            
            return spaceName === cleanedSpaceName;
          });
        }
        
        if (!nextSpace) continue;
        
        // Create a copy of the space object to avoid modifying the original
        const spaceCopy = Object.assign({}, nextSpace);
        
        // Add information about which space this move came from
        spaceCopy.fromOriginalSpace = true;
        spaceCopy.originalSpaceName = sourceSpace.name;
        
        // Use a custom name to indicate this is from the source space
        spaceCopy.name = `${spaceCopy.name} (from ${sourceSpace.name})`;
        
        // Store original description and update with source info
        spaceCopy.originalDescription = spaceCopy.description;
        spaceCopy.description = `From ${sourceSpace.name}: ${spaceCopy.description || ''}`;
        
        // Add to available moves
        availableMoves.push(spaceCopy);
      }
      
      return availableMoves;
    };
    
    /**
     * Get the player's previous space ID with multiple fallbacks
     * @param {Object} player - The player object
     * @returns {string|null} - The previous space ID or null if not found
     */
    getPreviousSpaceId = function(player) {
      // Method 1: Try getting from position history
      if (player.positionHistory && Array.isArray(player.positionHistory) && player.positionHistory.length >= 2) {
        return player.positionHistory[player.positionHistory.length - 2];
      }
      
      // Method 2: Try getting from previous position property
      if (player.previousPosition) {
        return player.previousPosition;
      }
      
      // Method 3: Try asking the GameStateManager directly
      if (window.GameStateManager && window.GameStateManager.getPlayerPreviousSpace) {
        return window.GameStateManager.getPlayerPreviousSpace(player.id);
      }
      
      return null;
    };
    
    /**
     * Check if the player has used cheat bypass
     * @param {Object} player - The player object
     * @returns {boolean} - True if the player has used cheat bypass
     */
    getPlayerHasUsedCheatBypass = function(player) {
      // Method 1: Check in player object
      if (player.hasUsedCheatBypass !== undefined) {
        return player.hasUsedCheatBypass;
      }
      
      // Method 2: Check in player.properties
      if (player.properties && player.properties.hasUsedCheatBypass !== undefined) {
        return player.properties.hasUsedCheatBypass;
      }
      
      // Method 3: Check using game state method
      if (typeof window.MoveLogicSpecialCases.getPlayerGameProperty === 'function' &&
          window.GameStateManager) {
        return window.MoveLogicSpecialCases.getPlayerGameProperty(
          window.GameStateManager, player, 'hasUsedCheatBypass'
        );
      }
      
      return false;
    };
  
    /**
     * Setter method for player game properties with improved reliability
     * @param {Object} gameState - The current game state
     * @param {Object} player - The player to set property for
     * @param {string} propertyName - The name of the property to set
     * @param {any} value - The value to set
     */
    setPlayerGameProperty = function(gameState, player, propertyName, value) {
      // First set directly on player object
      player[propertyName] = value;
      
      // Then set in player.properties if it exists
      if (player.properties) {
        player.properties[propertyName] = value;
      }
      
      // Also use GameStateManager if available
      if (gameState.setPlayerProperty) {
        gameState.setPlayerProperty(player.id, propertyName, value);
      }
    };
    
    /**
     * Enhanced helper method to get player game property with better fallbacks
     * @param {Object} gameState - The current game state
     * @param {Object} player - The player to get property for
     * @param {string} propertyName - The name of the property to get
     * @returns {any} - The property value or null if not found
     */
    getPlayerGameProperty = function(gameState, player, propertyName) {
      // Special handling for originalSpaceId - check all possible storage locations
      if (propertyName === 'originalSpaceId') {
        // Check each place where it might be stored
        
        // 1. Direct property
        if (player[propertyName] !== undefined) {
          return player[propertyName];
        }
        
        // 2. In properties object
        if (player.properties && player.properties[propertyName] !== undefined) {
          return player.properties[propertyName];
        }
        
        // 3. In gameState
        if (gameState.getPlayerProperty) {
          const gsValue = gameState.getPlayerProperty(player.id, propertyName);
          if (gsValue) {
            return gsValue;
          }
        }
        
        // Last resort: Try to get it from position history
        if (player.positionHistory && Array.isArray(player.positionHistory) && player.positionHistory.length >= 2) {
          return player.positionHistory[player.positionHistory.length - 2];
        }
        
        return null;
      }
      
      // For other properties, use the standard approach
      if (player[propertyName] !== undefined) {
        return player[propertyName];
      }
      
      if (player.properties && player.properties[propertyName] !== undefined) {
        return player.properties[propertyName];
      }
      
      if (gameState.getPlayerProperty) {
        return gameState.getPlayerProperty(player.id, propertyName) || false;
      }
      
      return false;
    };
  
    /**
     * Handle PM-DECISION-CHECK space with improved user experience
     * @param {Object} gameState - The current game state
     * @param {Object} player - The player to get moves for
     * @param {Object} currentSpace - The current space of the player
     * @returns {Array} - Array of available moves
     */
    handlePmDecisionCheck = function(gameState, player, currentSpace) {
      console.log('MoveLogicPmDecisionCheck: Processing PM-DECISION-CHECK space');
      
      // Determine if this is first or subsequent visit
      const isFirstVisit = currentSpace.visitType && currentSpace.visitType.toLowerCase() === 'first';
      
      // Check if player has used cheat bypass
      const hasUsedCheatBypass = getPlayerHasUsedCheatBypass(player);
      
      // Read the next spaces directly from the CSV data stored in the space object
      const rawNextSpaces = [
        currentSpace.rawSpace1, 
        currentSpace.rawSpace2, 
        currentSpace.rawSpace3, 
        currentSpace.rawSpace4, 
        currentSpace.rawSpace5
      ].filter(space => space && space.trim() !== '' && space !== 'n/a');
      
      // Initialize availableMoves array
      let availableMoves = [];
      
      // Get previous space ID
      let previousSpaceId = getPreviousSpaceId(player);
      const previousSpace = previousSpaceId ? gameState.findSpaceById(previousSpaceId) : null;
      
      // FIRST VISIT: Store original space info
      if (isFirstVisit && previousSpaceId) {
        console.log('MoveLogicPmDecisionCheck: First visit - storing original space ID:', previousSpaceId);
        
        // Store with multiple redundancies
        player.originalSpaceId = previousSpaceId;
        if (player.properties) player.properties.originalSpaceId = previousSpaceId;
        setPlayerGameProperty(gameState, player, 'originalSpaceId', previousSpaceId);
        
        // Mark that player is on a side quest
        player.isOnPMSideQuest = true;
        if (player.properties) player.properties.isOnPMSideQuest = true;
        setPlayerGameProperty(gameState, player, 'isOnPMSideQuest', true);
        
        // Also store in session storage as a backup
        try {
          if (window.sessionStorage) {
            window.sessionStorage.setItem(`pm-decision-original-space-${player.id}`, previousSpaceId);
          }
        } catch (e) {
          console.error('MoveLogicPmDecisionCheck: Error storing in sessionStorage:', e);
        }
      }
      
      // Process standard moves from the current space
      for (const rawSpaceName of rawNextSpaces) {
        // Skip "RETURN TO YOUR SPACE" option if it exists in CSV
        if (rawSpaceName.includes('RETURN TO YOUR SPACE')) continue;
        
        // Special handling for CHEAT-BYPASS
        const extractedName = gameState.extractSpaceName ? 
          gameState.extractSpaceName(rawSpaceName) : 
          rawSpaceName.split(' - ')[0].trim();
        
        if (extractedName === 'CHEAT-BYPASS') {
          // Resolve the space
          let bypassSpace = null;
          if (typeof window.MoveLogicSpecialCases.resolveSpaceForVisitType === 'function') {
            bypassSpace = window.MoveLogicSpecialCases.resolveSpaceForVisitType(gameState, player, extractedName);
          } else {
            // Direct lookup
            const matchingSpaces = gameState.spaces.filter(s => 
              gameState.extractSpaceName(s.name) === extractedName);
            
            if (matchingSpaces.length > 0) {
              bypassSpace = matchingSpaces[0];
            }
          }
          
          if (bypassSpace) {
            // Mark as cheat bypass for selection handling
            bypassSpace.isCheatBypass = true;
            
            // Add to available moves
            if (!availableMoves.some(move => move.id === bypassSpace.id)) {
              availableMoves.push(bypassSpace);
            }
          }
          continue;
        }
        
        // Regular space handling
        const cleanedSpaceName = gameState.extractSpaceName ? 
          gameState.extractSpaceName(rawSpaceName) : 
          rawSpaceName.split(' - ')[0].trim();
        
        // Use helper function to resolve the appropriate space
        let nextSpace = null;
        if (typeof window.MoveLogicSpecialCases.resolveSpaceForVisitType === 'function') {
          nextSpace = window.MoveLogicSpecialCases.resolveSpaceForVisitType(gameState, player, cleanedSpaceName);
        } else {
          // Direct lookup
          const matchingSpaces = gameState.spaces.filter(s => 
            gameState.extractSpaceName(s.name) === cleanedSpaceName);
          
          if (matchingSpaces.length > 0) {
            nextSpace = matchingSpaces[0];
          }
        }
        
        // Add to available moves if not already in the list and if a space was found
        if (nextSpace && !availableMoves.some(move => move.id === nextSpace.id)) {
          availableMoves.push(nextSpace);
        }
      }
      
      // On subsequent visit, also try to add moves from original space
      if (!isFirstVisit && !hasUsedCheatBypass) {
        // Try to get original space ID
        let originalSpaceId = getPlayerGameProperty(gameState, player, 'originalSpaceId');
        let originalSpace = originalSpaceId ? gameState.findSpaceById(originalSpaceId) : null;
        
        // If original space not found, try using previous space
        if (!originalSpace && previousSpace) {
          originalSpace = previousSpace;
          
          // Update stored property for future use
          setPlayerGameProperty(gameState, player, 'originalSpaceId', previousSpaceId);
          setPlayerGameProperty(gameState, player, 'isOnPMSideQuest', true);
        }
        
        // Add moves from original space if we found it
        if (originalSpace) {
          availableMoves = addMovesFromSourceSpace(gameState, player, originalSpace, availableMoves);
        }
      }
      
      console.log('MoveLogicPmDecisionCheck: Final moves count:', availableMoves.length);
      return availableMoves;
    };
    
    /**
     * Handle move selection for PM-DECISION-CHECK space
     * @param {Object} gameState - The current game state
     * @param {Object} player - The player who selected the move
     * @param {Object} selectedMove - The move that was selected
     * @returns {Object} - The processed move
     */
    handlePmDecisionMoveSelection = function(gameState, player, selectedMove) {
      console.log('MoveLogicPmDecisionCheck: Handling move selection');
      
      // Handle CHEAT-BYPASS selection
      if (selectedMove.isCheatBypass) {
        // Clear side quest flags (point of no return)
        setPlayerGameProperty(gameState, player, 'originalSpaceId', null);
        setPlayerGameProperty(gameState, player, 'isOnPMSideQuest', false);
        
        // Set permanent flag that player has used cheat bypass
        setPlayerGameProperty(gameState, player, 'hasUsedCheatBypass', true);
        
        console.log('MoveLogicPmDecisionCheck: Player selected CHEAT-BYPASS');
      }
      
      // Handle selection of moves from original space
      if (selectedMove.fromOriginalSpace) {
        // Clear side quest status as player is now returning to original path
        setPlayerGameProperty(gameState, player, 'originalSpaceId', null);
        setPlayerGameProperty(gameState, player, 'isOnPMSideQuest', false);
        
        // Restore original description if it was modified
        if (selectedMove.originalDescription) {
          selectedMove.description = selectedMove.originalDescription;
        }
        
        console.log('MoveLogicPmDecisionCheck: Player returning to original path');
      }
      
      // Check if selected move might be from original space even if not flagged
      const originalSpaceId = getPlayerGameProperty(gameState, player, 'originalSpaceId');
      const isOnSideQuest = getPlayerGameProperty(gameState, player, 'isOnPMSideQuest');
      const hasUsedCheatBypass = getPlayerGameProperty(gameState, player, 'hasUsedCheatBypass');
      
      if (originalSpaceId && isOnSideQuest && !hasUsedCheatBypass) {
        const originalSpace = gameState.findSpaceById(originalSpaceId);
        if (originalSpace) {
          const rawNextSpaces = [
            originalSpace.rawSpace1, 
            originalSpace.rawSpace2, 
            originalSpace.rawSpace3, 
            originalSpace.rawSpace4, 
            originalSpace.rawSpace5
          ].filter(space => space && space.trim() !== '' && space !== 'n/a');
          
          for (const rawSpaceName of rawNextSpaces) {
            const cleanedSpaceName = gameState.extractSpaceName ? 
              gameState.extractSpaceName(rawSpaceName) : 
              rawSpaceName.split(' - ')[0].trim();
            
            if (cleanedSpaceName === 'PM-DECISION-CHECK') continue;
            
            if (selectedMove.name === cleanedSpaceName || 
                (selectedMove.id && selectedMove.id.includes(cleanedSpaceName.toLowerCase()))) {
              // Manually add the fromOriginalSpace flag
              selectedMove.fromOriginalSpace = true;
              selectedMove.originalSpaceName = originalSpace.name;
              
              // Clear side quest status
              setPlayerGameProperty(gameState, player, 'originalSpaceId', null);
              setPlayerGameProperty(gameState, player, 'isOnPMSideQuest', false);
              break;
            }
          }
        }
      }
      
      return selectedMove;
    };
  }
  
  /**
   * Attach methods to MoveLogicSpecialCases instance
   */
  function attachMethodsToMoveLogicSpecialCases() {
    console.log('[PMDecision-SEQ-10] Starting method attachment');
    console.log('[PMDecision-SEQ-10] MoveLogicSpecialCases before attachment:', 
                Object.keys(window.MoveLogicSpecialCases).join(', '));
    
    // For each method attachment
    try {
      console.log('[PMDecision-SEQ-10] Attaching handlePmDecisionCheck');
      window.MoveLogicSpecialCases.handlePmDecisionCheck = function() {
        return handlePmDecisionCheck.apply(this, arguments);
      };
      console.log('[PMDecision-SEQ-10] handlePmDecisionCheck attached successfully');
    } catch (e) {
      console.error('[PMDecision-SEQ-10] Error attaching handlePmDecisionCheck:', e);
    }
    
    try {
      console.log('[PMDecision-SEQ-10] Attaching handlePmDecisionMoveSelection');
      window.MoveLogicSpecialCases.handlePmDecisionMoveSelection = function() {
        return handlePmDecisionMoveSelection.apply(this, arguments);
      };
      console.log('[PMDecision-SEQ-10] handlePmDecisionMoveSelection attached successfully');
    } catch (e) {
      console.error('[PMDecision-SEQ-10] Error attaching handlePmDecisionMoveSelection:', e);
    }
    
    try {
      console.log('[PMDecision-SEQ-10] Attaching getPlayerGameProperty');
      window.MoveLogicSpecialCases.getPlayerGameProperty = function() {
        return getPlayerGameProperty.apply(this, arguments);
      };
      console.log('[PMDecision-SEQ-10] getPlayerGameProperty attached successfully');
    } catch (e) {
      console.error('[PMDecision-SEQ-10] Error attaching getPlayerGameProperty:', e);
    }
    
    try {
      console.log('[PMDecision-SEQ-10] Attaching setPlayerGameProperty');
      window.MoveLogicSpecialCases.setPlayerGameProperty = function() {
        return setPlayerGameProperty.apply(this, arguments);
      };
      console.log('[PMDecision-SEQ-10] setPlayerGameProperty attached successfully');
    } catch (e) {
      console.error('[PMDecision-SEQ-10] Error attaching setPlayerGameProperty:', e);
    }
    
    // Make sure PM-DECISION-CHECK is in the specialCaseSpaces array
    try {
      if (!window.MoveLogicSpecialCases.specialCaseSpaces.includes('PM-DECISION-CHECK')) {
        console.log('[PMDecision-SEQ-10] Adding PM-DECISION-CHECK to specialCaseSpaces array');
        window.MoveLogicSpecialCases.specialCaseSpaces.push('PM-DECISION-CHECK');
      }
    } catch (e) {
      console.error('[PMDecision-SEQ-10] Error adding PM-DECISION-CHECK to specialCaseSpaces:', e);
    }
    
    // Create reference object for diagnostics
    try {
      console.log('[PMDecision-SEQ-10] Creating MoveLogicPmDecisionCheckReference object');
      window.MoveLogicPmDecisionCheckReference = {
        handlePmDecisionCheck: handlePmDecisionCheck,
        handlePmDecisionMoveSelection: handlePmDecisionMoveSelection,
        getPlayerGameProperty: getPlayerGameProperty,
        setPlayerGameProperty: setPlayerGameProperty,
        addMovesFromSourceSpace: addMovesFromSourceSpace
      };
      console.log('[PMDecision-SEQ-10] MoveLogicPmDecisionCheckReference created successfully');
    } catch (e) {
      console.error('[PMDecision-SEQ-10] Error creating MoveLogicPmDecisionCheckReference:', e);
    }
    
    // After all methods attached
    console.log('[PMDecision-SEQ-10] MoveLogicSpecialCases after attachment:', 
                Object.keys(window.MoveLogicSpecialCases).join(', '));
    console.log('[PMDecision-SEQ-10] handlePmDecisionCheck exists after attachment:', 
                typeof window.MoveLogicSpecialCases.handlePmDecisionCheck === 'function');
    
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
      console.log('[PMDecision-SEQ-EVENT] Registering event listeners with GameStateManager');
      
      // Define listener for gameStateChanged events
      const gameStateChangedListener = function(event) {
        // Clone the event to avoid modifying the original
        const eventData = event ? JSON.parse(JSON.stringify(event.data || {})) : {};
        
        try {
          // Only process if this is an availableMovesUpdated event
          if (eventData.changeType === 'availableMovesUpdated') {
            // Get current player
            const player = window.GameStateManager.getCurrentPlayer();
            if (!player) return false; // Not our event to handle
            
            // Get current space
            const currentSpaceId = player.position;
            const currentSpace = window.GameStateManager.findSpaceById(currentSpaceId);
            
            if (currentSpace && currentSpace.name === 'PM-DECISION-CHECK') {
              // Get previous space
              const previousSpaceId = getPreviousSpaceId(player);
              
              if (previousSpaceId) {
                const previousSpace = window.GameStateManager.findSpaceById(previousSpaceId);
                
                if (previousSpace) {
                  // Check if the player has used cheat bypass
                  const hasUsedCheatBypass = getPlayerHasUsedCheatBypass(player);
                  
                  // Only add previous space moves if player hasn't used cheat bypass
                  if (!hasUsedCheatBypass && !eventData.processedByPmDecisionCheck) {
                    // Create new array for modified moves to avoid modifying original event
                    const modifiedMoves = addMovesFromSourceSpace(
                      window.GameStateManager, 
                      player, 
                      previousSpace, 
                      eventData.moves ? [...eventData.moves] : []
                    );
                    
                    // If moves were modified, create a new event with the new moves
                    if (modifiedMoves.length !== (eventData.moves || []).length) {
                      console.log('[PMDecision-SEQ-EVENT] Modified availableMoves, dispatching new event');
                      
                      // Create new event object with our modified data
                      const newEventData = {
                        ...eventData,
                        moves: modifiedMoves,
                        processedByPmDecisionCheck: true
                      };
                      
                      try {
                        // Dispatch new event with modified moves
                        const newEvent = new CustomEvent('gameStateChanged', {
                          detail: {
                            data: newEventData
                          }
                        });
                        window.dispatchEvent(newEvent);
                        
                        // Return true to indicate we've handled this event
                        return true;
                      } catch (e) {
                        console.error('[PMDecision-SEQ-EVENT] Error dispatching modified event', e);
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('[PMDecision-SEQ-EVENT] Error in gameStateChangedListener', e);
        }
        
        // Return false to indicate we haven't handled this event
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
    console.log('[PMDecision-SEQ-11] MoveLogicSpecialCases methods:', 
                Object.keys(window.MoveLogicSpecialCases).join(', '));
    
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
    
    return allMethodsPresent;
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
