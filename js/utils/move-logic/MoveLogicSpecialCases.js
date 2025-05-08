// MoveLogicSpecialCases.js - Special case handlers for specific spaces
console.log('MoveLogicSpecialCases.js file is beginning to be used');

/**
 * MoveLogicSpecialCases - Handlers for spaces with special logic
 * 
 * This module extends MoveLogicSpaceHandlers to add special case handlers for 
 * specific spaces that have unique movement rules.
 */
(function() {
  // Add a flag to indicate initialization has started
  window.MoveLogicSpecialCasesInitStarted = true;
  // Make sure MoveLogicSpaceHandlers is loaded
  if (!window.MoveLogicSpaceHandlers) {
    console.error('MoveLogicSpecialCases: MoveLogicSpaceHandlers not found. Make sure to include MoveLogicSpaceHandlers.js first.');
    return;
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
    }
    
    console.log('MoveLogicSpecialCases: Updated with improved visit type resolution. [2025-05-02]');
    console.log('MoveLogicSpecialCases: Integrated with space type system. [2025-05-03]');
    console.log('MoveLogicSpecialCases: Added RETURN TO YOUR SPACE handling for PM-DECISION-CHECK. [2025-05-04]');
    console.log('MoveLogicSpecialCases: Improved PM-DECISION-CHECK handling to directly show inherited moves. [2025-05-05]');
    console.log('MoveLogicSpecialCases: Fixed CHEAT-BYPASS implementation as permanent point-of-no-return. [2025-05-05]');
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
  console.log(`DEBUG [hasSpecialCaseLogic]: Checking if "${spaceName}" is a special case. Result:`, 
              this.specialCaseSpaces.includes(spaceName));
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
  console.log(`DEBUG [handleSpecialCaseSpace]: Processing space "${currentSpace.name}" with visitType:`, 
              currentSpace.visitType);
  console.log(`DEBUG [handleSpecialCaseSpace]: Complete currentSpace object:`, currentSpace);
  
  // Implementation for each special case
    switch (currentSpace.name) {
      case 'ARCH-INITIATION':
        return this.handleArchInitiation(gameState, player, currentSpace);
      case 'PM-DECISION-CHECK':
        // Enhanced debugging for PM-DECISION-CHECK
        console.log('%c DIAGNOSIS: PM-DECISION-CHECK case matched!', 'background: #FF5722; color: white; font-size: 14px;');
        console.log('DEBUG [handleSpecialCaseSpace]: PM-DECISION-CHECK detected, check for handler method');
        
        if (typeof this.handlePmDecisionCheck !== 'function') {
          console.error('%c DIAGNOSIS: handlePmDecisionCheck method is NOT DEFINED!', 'background: #F44336; color: white; font-size: 16px;');
          console.error('DEBUG [handleSpecialCaseSpace]: handlePmDecisionCheck method is missing!');
          
          // Forcibly try to reload and reattach the method
          try {
            console.log('DEBUG [handleSpecialCaseSpace]: Attempting emergency handler attachment');
            if (window.MoveLogicDirectFix && typeof window.MoveLogicDirectFix.handlePmDecisionCheck === 'function') {
              console.log('DEBUG [handleSpecialCaseSpace]: Using handler from MoveLogicDirectFix');
              return window.MoveLogicDirectFix.handlePmDecisionCheck(gameState, player, currentSpace);
            }
            
            // If direct fix not available, implement a simple handler right here
            console.log('DEBUG [handleSpecialCaseSpace]: Creating emergency inline handler');
            
            // Get standard moves from this space
            let availableMoves = window.MoveLogicBase.prototype.getSpaceDependentMoves.call(this, gameState, player, currentSpace);
            
            // Try to get previous space
            let previousSpaceId = null;
            if (player.positionHistory && player.positionHistory.length >= 2) {
              previousSpaceId = player.positionHistory[player.positionHistory.length - 2];
            }
            
            if (previousSpaceId) {
              const previousSpace = gameState.findSpaceById(previousSpaceId);
              if (previousSpace) {
                console.log('DEBUG [handleSpecialCaseSpace]: Found previous space:', previousSpace.name);
                
                // Get raw next spaces from previous space
                const prevRawNextSpaces = [
                  previousSpace.rawSpace1, 
                  previousSpace.rawSpace2, 
                  previousSpace.rawSpace3, 
                  previousSpace.rawSpace4, 
                  previousSpace.rawSpace5
                ].filter(space => space && space.trim() !== '' && space !== 'n/a');
                
                // Add each valid move from previous space
                for (const rawSpaceName of prevRawNextSpaces) {
                  // Skip PM-DECISION-CHECK to avoid loop
                  if (rawSpaceName.includes('PM-DECISION-CHECK')) continue;
                  
                  const cleanedSpaceName = gameState.extractSpaceName(rawSpaceName);
                  
                  // Find a matching space
                  gameState.spaces.forEach(space => {
                    if (gameState.extractSpaceName(space.name) === cleanedSpaceName) {
                      // Only add if not already in list
                      if (!availableMoves.some(move => move.id === space.id)) {
                        // Mark as coming from original space
                        space.fromOriginalSpace = true;
                        space.name = `${space.name} (from ${previousSpace.name})`;
                        
                        availableMoves.push(space);
                        console.log('DEBUG [handleSpecialCaseSpace]: Added move from previous space:', space.name);
                      }
                    }
                  });
                }
              }
            }
            
            return availableMoves;
          } catch (error) {
            console.error('DEBUG [handleSpecialCaseSpace]: Error in emergency handler:', error);
            // Fallback to basic moves if emergency handler fails
            return window.MoveLogicBase.prototype.getSpaceDependentMoves.call(this, gameState, player, currentSpace);
          }
        }
        
        console.log('%c DIAGNOSIS: Calling handlePmDecisionCheck method', 'background: #FF5722; color: white;');
        console.log('DEBUG [handleSpecialCaseSpace]: Found handlePmDecisionCheck method, calling it');
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
   * Handle space changed events to detect when player returns to main path
   * @param {Object} event - The space changed event
   */
  MoveLogicSpecialCases.prototype.handleSpaceChangedEvent = function(event) {
    console.log('MoveLogicSpecialCases: Handling space changed event');
    
    // Only process if there's event data
    if (!event || !event.data) return;
    
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
        
        // Clear side quest status
        player.isOnPMSideQuest = false;
        if (player.properties) player.properties.isOnPMSideQuest = false;
        this.setPlayerGameProperty(gameState, player, 'isOnPMSideQuest', false);
        
        // Clear original space ID
        player.originalSpaceId = null;
        if (player.properties) player.properties.originalSpaceId = null;
        this.setPlayerGameProperty(gameState, player, 'originalSpaceId', null);
      }
    }
  };

  /**
   * Set a property on the player's game state
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to set property for
   * @param {string} propertyName - The name of the property to set
   * @param {any} value - The value to set
   */
  MoveLogicSpecialCases.prototype.setPlayerGameProperty = function(gameState, player, propertyName, value) {
    // Add debug logging
    console.log(`MoveLogicSpecialCases: Setting player property ${propertyName} to:`, value);
    
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
    
    // Verify the property was actually set
    if (typeof this.getPlayerGameProperty === 'function') {
      const storedValue = this.getPlayerGameProperty(gameState, player, propertyName);
      console.log(`MoveLogicSpecialCases: Verified ${propertyName} was set to:`, storedValue);
    }
  };
  
  // Create instance and expose globally
  window.MoveLogicSpecialCases = new MoveLogicSpecialCases();
  
  // Set an initialization flag that can be checked by other modules
  window.MoveLogicSpecialCasesInitialized = true;
  
  // Initialize the handler attributes explicitly to help debug
  if (typeof window.MoveLogicSpecialCases.handlePmDecisionCheck !== 'function') {
    console.warn('MoveLogicSpecialCases: handlePmDecisionCheck method is not yet available - will be added by MoveLogicPmDecisionCheck.js');
  }
  
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
  
  console.log('MoveLogicSpecialCases.js code execution finished');
})();
