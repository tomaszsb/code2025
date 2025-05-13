// MoveLogicManager.js - Manager for handling different types of moves in the game
console.log('MoveLogicManager.js file is beginning to be used');

/**
 * Initialize manager and compatibility layer
 * 
 * This file serves as the main entry point for the MoveLogicManager component.
 * It creates and initializes the MoveLogicManager instance and sets up backward compatibility.
 * 
 * Note: The modules must be included in the correct order in the HTML:
 * 1. First load MoveLogicBase.js
 * 2. Then load MoveLogicSpecialCases.js (extends MoveLogicBase)
 * 3. Then load MoveLogicUIUpdates.js (extends MoveLogicSpecialCases)
 * 4. Then load MoveLogicManager.js (extends MoveLogicUIUpdates)
 * 5. Then load MoveLogicBackwardCompatibility.js
 * 6. Finally load this file (utils/MoveLogicManager.js)
 */
(function() {
  console.log('MoveLogicManager: Initializing manager...');
  
  // Added retry mechanism for delayed initialization
  function initializeManager() {
    // Check if all required modules are loaded
    if (!window.MoveLogicBase) {
      console.warn('MoveLogicManager: MoveLogicBase module not found. Retrying initialization...');
      return false;
    }
    
    if (!window.MoveLogicSpecialCases) {
      console.warn('MoveLogicManager: MoveLogicSpecialCases module not found. Retrying initialization...');
      return false;
    }
    
    if (!window.MoveLogicUIUpdates) {
      console.warn('MoveLogicManager: MoveLogicUIUpdates module not found. Retrying initialization...');
      return false;
    }
    
    // Check if MoveLogicManager already exists and is an instance (not a constructor)
    if (window.MoveLogicManager && typeof window.MoveLogicManager === 'object' && window.MoveLogicManager.initialized !== undefined) {
      console.log('MoveLogicManager: Instance already exists, using existing instance');
      
      // Set up compatibility layer if not already set up
      if (!window.MoveLogic && window.MoveLogicBackwardCompatibility) {
        try {
          // Create compatibility layer with existing instance
          const compatibilityLayer = new window.MoveLogicBackwardCompatibility(window.MoveLogicManager);
          console.log('MoveLogicManager: Compatibility layer set up successfully with existing instance');
        } catch (error) {
          console.error('MoveLogicManager: Error setting up compatibility layer:', error);
        }
      }
      
      return true;
    }
    
    // Only try to instantiate if MoveLogicManager is a constructor function
    if (!window.MoveLogicManager || typeof window.MoveLogicManager !== 'function') {
      console.warn('MoveLogicManager: MoveLogicManager class not found or not a constructor. Retrying initialization...');
      return false;
    }
    
    if (!window.MoveLogicBackwardCompatibility) {
      console.warn('MoveLogicManager: MoveLogicBackwardCompatibility module not found. Retrying initialization...');
      return false;
    }
    
    try {
      // Create manager instance only if it's a constructor
      const moveLogicManager = new window.MoveLogicManager();
      
      // Expose the manager instance globally for direct access
      window.MoveLogicManager = moveLogicManager;
      
      // Create compatibility layer - need to call this after overwriting the window.MoveLogicManager
      const compatibilityLayer = new window.MoveLogicBackwardCompatibility(moveLogicManager);
      
      console.log('MoveLogicManager: Manager initialized and compatibility layer set up successfully');
      return true;
    } catch (error) {
      console.error('MoveLogicManager: Error during initialization:', error);
      return false;
    }
  }
  
  // Check explicitly for PM-DECISION-CHECK handler
  function checkPmDecisionHandler() {
    console.log(' MoveLogicManager: Checking for PM-DECISION-CHECK handler');
    
    if (window.MoveLogicSpecialCases) {
      if (typeof window.MoveLogicSpecialCases.handlePmDecisionCheck !== 'function') {
        console.warn('PM-DECISION-CHECK handler is missing! Attempting to load it now...');
        
        // Try to manually implement the handler if missing
        try {
          // First try to load the file again
          var script = document.createElement('script');
          script.src = 'js/utils/move-logic/MoveLogicPmDecisionCheck.js';
          script.type = 'text/babel';
          document.head.appendChild(script);
          
          // Debug hook for move generation
          console.log('DEBUG [moveGeneration]: Loaded PM-DECISION-CHECK handler successfully');
          
          // Add a global hook that will capture move generation
          const originalGetAvailableMoves = window.MoveLogic ? window.MoveLogic.getAvailableMoves : null;
          if (originalGetAvailableMoves && typeof originalGetAvailableMoves === 'function') {
            window.MoveLogic.getAvailableMoves = function(gameState, player) {
              const availableMoves = originalGetAvailableMoves.call(this, gameState, player);
              const currentSpace = gameState.findSpaceById(player.position);
              
              if (currentSpace) {
                console.log(`DEBUG [moveGeneration]: Generated availableMoves for space "${currentSpace.name}":`, 
                          availableMoves.map(m => m.name));
                console.log(`DEBUG [moveGeneration]: Current player is on special case space:`, 
                          window.MoveLogicSpecialCases && typeof window.MoveLogicSpecialCases.hasSpecialCaseLogic === 'function' ? 
                          window.MoveLogicSpecialCases.hasSpecialCaseLogic(currentSpace.name) : 'unknown');
              }
              
              return availableMoves;
            };
            console.log('DEBUG [moveGeneration]: Successfully hooked into getAvailableMoves');
          }
          
          console.log(' MoveLogicManager: Re-loaded MoveLogicPmDecisionCheck.js');
        } catch (e) {
          console.error('Error loading PM-DECISION-CHECK handler:', e);
        }
      } else {
        console.log(' MoveLogicManager: PM-DECISION-CHECK handler is present');
      }
    } else {
      console.warn('MoveLogicSpecialCases not found! Cannot check for PM-DECISION-CHECK handler');
    }
  }
  
  // Try to initialize immediately
  const initResult = initializeManager();
  
  // Always check for PM-DECISION-CHECK handler, regardless of initialization result
  setTimeout(checkPmDecisionHandler, 1000);
  
  if (!initResult) {
    // If initialization fails, retry with increasing delays
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 300; // Start with 300ms delay
    
    const retryInterval = setInterval(() => {
      retryCount++;
      console.log(`MoveLogicManager: Retry ${retryCount} of ${maxRetries}...`);
      
      const retryInitResult = initializeManager();
      
      // Check for PM-DECISION-CHECK handler after each retry
      if (retryCount === 2) {
        setTimeout(checkPmDecisionHandler, 1500);
      }
      
      if (retryInitResult || retryCount >= maxRetries) {
        clearInterval(retryInterval);
        
        if (retryCount >= maxRetries && !window.MoveLogicManager.initialized) {
          console.error('MoveLogicManager: Failed to initialize after maximum retries');
          // Create emergency compatibility layer with fallback implementation
          window.MoveLogic = window.MoveLogic || {
            getAvailableMoves: function(gameState, player) {
              console.log('MoveLogic: Using emergency fallback for getAvailableMoves');
              // Get the player's current space
              const currentSpace = gameState.spaces.find(s => s.id === player.position);
              if (!currentSpace) return [];
              
              // Handle special case for OWNER-SCOPE-INITIATION
              if (currentSpace.name.includes('OWNER-SCOPE-INITIATION')) {
                // Check if player has cards (indicating they've drawn cards already)
                const hasDrawnCards = player.cards && player.cards.length > 0;
                
                // Check if dice has been rolled (via global or player properties)
                const hasDiceRoll = window.lastDiceRoll || 
                                   (typeof player.lastDiceRoll !== 'undefined');
                
                // If player has completed required actions, make OWNER-FUND-INITIATION available
                if (hasDrawnCards) {
                  // Find the OWNER-FUND-INITIATION space
                  const nextSpace = gameState.spaces.find(s => 
                  s.name.includes('OWNER-FUND-INITIATION'));
                  
                  if (nextSpace) {
                    console.log('MoveLogic: Enabling OWNER-FUND-INITIATION as an available move');
                    return [nextSpace];
                  }
                  
                  // Fallback - try to find by ID pattern if name search fails
                  const fundInitiationSpace = gameState.spaces.find(s => 
                    s.id && s.id.includes('owner-fund-initiation'));
                  
                  if (fundInitiationSpace) {
                    console.log('MoveLogic: Found OWNER-FUND-INITIATION by ID, making it available');
                    return [fundInitiationSpace];
                  }
                }
              }
              
              // Standard implementation for other spaces
              // Get next moves from space's nextSpaces property
              const availableMoves = [];
              for (const nextSpaceName of currentSpace.nextSpaces || []) {
                if (!nextSpaceName || nextSpaceName.trim() === '') continue;
                if (nextSpaceName.includes('Outcome from rolled dice')) continue;
                if (nextSpaceName.includes('Option from first visit')) continue;
                if (nextSpaceName.toLowerCase().includes('negotiate')) continue;
                
                // Get base name
                const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
                // Find matching space
                const nextSpace = gameState.spaces.find(s => gameState.extractSpaceName(s.name) === cleanedSpaceName);
                if (nextSpace && !availableMoves.some(move => move.id === nextSpace.id)) {
                  availableMoves.push(nextSpace);
                }
              }
              return availableMoves;
            }
          };
        }
      }
    }, retryDelay);
  }
})();

console.log('MoveLogicManager.js code execution finished');