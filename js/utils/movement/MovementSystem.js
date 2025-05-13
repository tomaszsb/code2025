/**
 * MovementSystem.js
 * Main entry point for the movement system
 * 
 * This file creates and connects all components of the movement system,
 * providing integration with GameStateManager and TurnManager
 */

console.log('MovementSystem.js file is beginning to be used');

// Immediate initialization without waiting for DOMContentLoaded
(function initializeMovementSystem() {
  try {
    // Make sure GameStateManager exists
    if (!window.GameStateManager) {
      console.error("MovementSystem: GameStateManager not found! Movement system cannot be initialized.");
      return;
    }

    console.log("MovementSystem: Beginning initialization...");
    
    // Add diceRollData property to GameStateManager if it doesn't exist
    if (!window.GameStateManager.diceRollData) {
      window.GameStateManager.diceRollData = [];
      console.log("MovementSystem: Initialized empty diceRollData array");
    }
    
    // Verify that all required components are loaded
    if (!window.MovementCore) {
      console.error("MovementSystem: MovementCore not found! Make sure MovementCore.js is loaded.");
      return;
    }
    
    if (!window.MovementLogic) {
      console.error("MovementSystem: MovementLogic not found! Make sure MovementLogic.js is loaded.");
      return;
    }
    
    if (!window.MovementUIAdapter) {
      console.error("MovementSystem: MovementUIAdapter not found! Make sure MovementUIAdapter.js is loaded.");
      return;
    }
    
    // Create the movement core
    const movementCore = new window.MovementCore(window.GameStateManager);
    console.log("MovementSystem: Core component created");
    
    // Create the movement logic using the core
    const movementLogic = new window.MovementLogic(window.GameStateManager, movementCore);
    console.log("MovementSystem: Logic component created");
    
    // Create the UI adapter using the logic
    const movementUIAdapter = new window.MovementUIAdapter(window.GameStateManager, movementLogic);
    console.log("MovementSystem: UI Adapter component created");
    
    // Store references in GameStateManager with property descriptors
    try {
      Object.defineProperties(window.GameStateManager, {
        // Add each component as a protected property
        movementCore: {
          value: movementCore,
          writable: false,
          configurable: false,
          enumerable: true
        },
        movementLogic: {
          value: movementLogic,
          writable: false,
          configurable: false,
          enumerable: true
        },
        movementUIAdapter: {
          value: movementUIAdapter,
          writable: false,
          configurable: false,
          enumerable: true
        }
      });
      console.log("MovementSystem: Components attached to GameStateManager");
    } catch (error) {
      console.error("MovementSystem: Error attaching components to GameStateManager:", error);
      // Continue initialization even if this fails, so we can at least try to extend the methods
    }
    
    // Extend GameStateManager with movement system methods
    extendGameStateManager();
    
    // Integrate with TurnManager if it exists
    integrateTurnManager();
    
    // Load dice roll data during initialization
    loadDiceRollData();
    
    console.log("MovementSystem: Successfully initialized all components");
    
    // Dispatch event to signal that movement system is ready
    try {
      window.GameStateManager.dispatchEvent('movementSystemInitialized', {
        success: true,
        components: {
          movementCore: !!window.GameStateManager.movementCore,
          movementLogic: !!window.GameStateManager.movementLogic,
          movementUIAdapter: !!window.GameStateManager.movementUIAdapter
        }
      });
    } catch (error) {
      console.error("MovementSystem: Error dispatching initialization event:", error);
    }
  } catch (error) {
    console.error("MovementSystem: Critical error during initialization:", error);
  }
})();

/**
 * Load dice roll data from CSV
 */
function loadDiceRollData() {
  try {
    if (!window.GameStateManager) return;
    
    // Make sure diceRollData is at least an empty array
    if (!window.GameStateManager.diceRollData) {
      window.GameStateManager.diceRollData = [];
    }
    
    // Method 1: Check if the CSV parser is available
    if (typeof window.csvParser !== 'undefined' && window.csvParser.loadCSV) {
      console.log("MovementSystem: Attempting to load dice roll data using csvParser");
      try {
        window.csvParser.loadCSV('data/DiceRoll Info.csv', function(data) {
          if (data && Array.isArray(data)) {
            window.GameStateManager.diceRollData = data;
            console.log(`MovementSystem: Loaded ${data.length} dice roll outcomes using csvParser`);
            console.log("MovementSystem: Sample dice data:", data.slice(0, 2));
            
            // Verify dice columns are present
            if (data.length > 0) {
              const sampleRow = data[0];
              const hasDiceColumns = ["1", "2", "3", "4", "5", "6"].some(num => num in sampleRow);
              if (!hasDiceColumns) {
                console.warn("MovementSystem: Warning - Dice columns (1-6) not found in dice data");
              } else {
                console.log("MovementSystem: Dice data verified - dice columns present");
              }
            }
          }
        });
        return; // If this worked, return early
      } catch (error) {
        console.warn("MovementSystem: Error loading dice roll data with csvParser:", error);
        // Continue to next method
      }
    }
    
    // Method 2: Use fetch API to load the CSV
    console.log("MovementSystem: Attempting to load dice roll data using fetch API");
    fetch('data/DiceRoll Info.csv')
      .then(response => response.text())
      .then(csvText => {
        // Parse CSV (simple parsing)
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        // Create array of objects
        const diceRollData = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const rowData = {};
          
          for (let j = 0; j < headers.length; j++) {
            rowData[headers[j].trim()] = values[j] ? values[j].trim() : '';
          }
          
          diceRollData.push(rowData);
        }
        
        window.GameStateManager.diceRollData = diceRollData;
        console.log(`MovementSystem: Loaded ${diceRollData.length} dice roll outcomes using fetch API`);
        
        // Verify data integrity
        if (diceRollData.length > 0) {
          console.log("MovementSystem: Sample dice data:", diceRollData.slice(0, 2));
          
          // Check if required columns exist
          const sampleRow = diceRollData[0];
          const hasSpaceName = 'Space Name' in sampleRow;
          const hasVisitType = 'Visit Type' in sampleRow;
          const hasDiceColumns = ["1", "2", "3", "4", "5", "6"].some(num => num in sampleRow);
          
          if (!hasSpaceName) console.warn("MovementSystem: Warning - 'Space Name' column not found");
          if (!hasVisitType) console.warn("MovementSystem: Warning - 'Visit Type' column not found");
          if (!hasDiceColumns) console.warn("MovementSystem: Warning - No dice columns (1-6) found");
        }
      })
      .catch(error => {
        console.error('MovementSystem: Error loading dice roll data with fetch API:', error);
      });
  } catch (error) {
    console.error('MovementSystem: Critical error in loadDiceRollData:', error);
  }
}

/**
 * Extend GameStateManager with movement-specific functionality
 */
function extendGameStateManager() {
  try {
    // Skip if GameStateManager doesn't exist
    if (!window.GameStateManager) {
      console.error("MovementSystem: GameStateManager not found during method extension!");
      return;
    }
    
    console.log("MovementSystem: Extending GameStateManager with movement methods");
    
    // Define function properties with descriptors for protection
    
    /**
     * Enhanced getAvailableMoves method that works with the new movement system
     * @param {Object} [player] - Optional player to get moves for, uses current player if not provided
     * @returns {Array|Object} Available moves or dice roll requirement object
     */
    try {
      Object.defineProperty(window.GameStateManager, 'getAvailableMoves', {
        value: function(player) {
          try {
            // Use provided player or current player
            const targetPlayer = player || this.getCurrentPlayer();
            if (!targetPlayer) {
              console.error('GameStateManager: No player available for getAvailableMoves');
              return [];
            }
            
            // Safety check for movementLogic
            if (!this.movementLogic) {
              console.error('GameStateManager: movementLogic not available for getAvailableMoves');
              return [];
            }
            
            // Use movement logic to get available moves
            return this.movementLogic.getAvailableMoves(targetPlayer);
          } catch (error) {
            console.error('GameStateManager: Error in getAvailableMoves:', error);
            // Return empty array to prevent UI errors
            return [];
          }
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log("MovementSystem: Successfully extended getAvailableMoves method");
    } catch (error) {
      console.error("MovementSystem: Error extending getAvailableMoves method:", error);
    }
    
    /**
     * Execute a move for a player
     * @param {string} playerId - ID of the player to move
     * @param {string} spaceId - ID of the space to move to
     * @returns {boolean} True if the move was successful
     */
    try {
      Object.defineProperty(window.GameStateManager, 'executeMove', {
        value: function(playerId, spaceId) {
          try {
            // If playerId not provided, use current player
            const actualPlayerId = playerId || (this.getCurrentPlayer() ? this.getCurrentPlayer().id : null);
            if (!actualPlayerId) {
              console.error('GameStateManager: No player ID for executeMove');
              return false;
            }
            
            // Safety check for movementCore
            if (!this.movementCore) {
              console.error('GameStateManager: movementCore not available for executeMove');
              return false;
            }
            
            // Use movement core to execute the move
            const result = this.movementCore.movePlayer(actualPlayerId, spaceId);
            
            // If successful, save game state
            if (result) {
              this.saveState();
              
              // Dispatch playerMoved event
              this.dispatchEvent('playerMoved', {
                playerId: actualPlayerId,
                toSpace: spaceId
              });
            }
            
            return result;
          } catch (error) {
            console.error('GameStateManager: Error in executeMove:', error);
            return false;
          }
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log("MovementSystem: Successfully extended executeMove method");
    } catch (error) {
      console.error("MovementSystem: Error extending executeMove method:", error);
    }
    
    /**
     * Find a space by name (case-insensitive)
     * @param {string} name - Name of the space to find
     * @returns {Object|null} Space object or null if not found
     */
    try {
      Object.defineProperty(window.GameStateManager, 'findSpaceByName', {
        value: function(name) {
          try {
            if (!name || !this.spaces || !Array.isArray(this.spaces)) {
              return null;
            }
            
            // Try exact match first
            let space = this.spaces.find(s => s.name === name);
            
            // If not found, try case-insensitive match
            if (!space) {
              space = this.spaces.find(s => 
                s.name && s.name.toLowerCase() === name.toLowerCase()
              );
            }
            
            // If still not found, try to match with space names with description
            if (!space) {
              space = this.spaces.find(s => 
                s.name && s.name.toLowerCase().includes(name.toLowerCase())
              );
            }
            
            return space || null;
          } catch (error) {
            console.error('GameStateManager: Error in findSpaceByName:', error);
            return null;
          }
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log("MovementSystem: Successfully extended findSpaceByName method");
    } catch (error) {
      console.error("MovementSystem: Error extending findSpaceByName method:", error);
    }
    
    /**
     * Find a player by ID
     * @param {string} id - ID of the player to find
     * @returns {Object|null} Player object or null if not found
     */
    try {
      Object.defineProperty(window.GameStateManager, 'findPlayerById', {
        value: function(id) {
          try {
            if (!id || !this.players || !Array.isArray(this.players)) {
              return null;
            }
            
            return this.players.find(p => p.id === id) || null;
          } catch (error) {
            console.error('GameStateManager: Error in findPlayerById:', error);
            return null;
          }
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log("MovementSystem: Successfully extended findPlayerById method");
    } catch (error) {
      console.error("MovementSystem: Error extending findPlayerById method:", error);
    }
    
    /**
     * Check if a player has visited a specific space before
     * @param {Object} player - Player to check
     * @param {string} spaceName - Name of the space to check
     * @returns {boolean} True if player has visited the space
     */
    try {
      Object.defineProperty(window.GameStateManager, 'hasPlayerVisitedSpace', {
        value: function(player, spaceName) {
          try {
            if (!player || !player.visitHistory || !Array.isArray(player.visitHistory)) {
              return false;
            }
            
            return player.visitHistory.some(visit => 
              visit.spaceName === spaceName || 
              visit.spaceName.toLowerCase() === spaceName.toLowerCase()
            );
          } catch (error) {
            console.error('GameStateManager: Error in hasPlayerVisitedSpace:', error);
            return false;
          }
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log("MovementSystem: Successfully extended hasPlayerVisitedSpace method");
    } catch (error) {
      console.error("MovementSystem: Error extending hasPlayerVisitedSpace method:", error);
    }
    
    /**
     * Load dice roll data from DiceRoll Info.csv
     */
    try {
      Object.defineProperty(window.GameStateManager, 'loadDiceRollData', {
        value: function() {
          loadDiceRollData();
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log("MovementSystem: Successfully extended loadDiceRollData method");
    } catch (error) {
      console.error("MovementSystem: Error extending loadDiceRollData method:", error);
    }
    
    /**
     * Enhanced saveState method that saves additional movement data
     */
    try {
      const originalSaveState = window.GameStateManager.saveState;
      Object.defineProperty(window.GameStateManager, 'saveState', {
        value: function() {
          try {
            // Make sure each player has required movement properties
            if (this.players && Array.isArray(this.players)) {
              this.players.forEach(player => {
                if (!player.visitHistory) {
                  player.visitHistory = [];
                }
                
                // Ensure previousPosition is set
                if (!player.previousPosition && player.position) {
                  player.previousPosition = player.position;
                }
                
                // Ensure properties exist for persistence
                if (!player.properties) {
                  player.properties = {};
                }
                
                // Save movement data in properties
                player.properties.visitHistory = player.visitHistory;
                player.properties.previousPosition = player.previousPosition;
                player.properties.hasUsedCheatBypass = player.hasUsedCheatBypass;
              });
            }
            
            // Call original saveState method
            return originalSaveState.call(this);
          } catch (error) {
            console.error('GameStateManager: Error in saveState:', error);
            // Try to call original even if our additions fail
            return originalSaveState.call(this);
          }
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log("MovementSystem: Successfully extended saveState method");
    } catch (error) {
      console.error("MovementSystem: Error extending saveState method:", error);
    }
    
    /**
     * Connect UI adapter to a game board component
     * @param {Object} gameBoard - React component for the game board
     */
    try {
      Object.defineProperty(window.GameStateManager, 'connectGameBoard', {
        value: function(gameBoard) {
          try {
            if (this.movementUIAdapter) {
              this.movementUIAdapter.setGameBoard(gameBoard);
              console.log("MovementSystem: Successfully connected game board to UI adapter");
            } else {
              console.error("MovementSystem: movementUIAdapter not available for connectGameBoard");
            }
          } catch (error) {
            console.error('GameStateManager: Error in connectGameBoard:', error);
          }
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log("MovementSystem: Successfully extended connectGameBoard method");
    } catch (error) {
      console.error("MovementSystem: Error extending connectGameBoard method:", error);
    }
    
    console.log("MovementSystem: Successfully extended GameStateManager with all methods");
  } catch (error) {
    console.error("MovementSystem: Critical error extending GameStateManager:", error);
  }
}

/**
 * Integrate with TurnManager if it exists
 */
function integrateTurnManager() {
  try {
    // Check if TurnManager exists
    if (!window.TurnManager) {
      console.log('MovementSystem: TurnManager not found, skipping integration');
      return;
    }
    
    console.log('MovementSystem: Integrating with TurnManager');
    
    // Hook into TurnManager's createPlayerSnapshot method
    const originalCreatePlayerSnapshot = window.TurnManager.prototype.createPlayerSnapshot;
    if (originalCreatePlayerSnapshot) {
      window.TurnManager.prototype.createPlayerSnapshot = function(player) {
        // Call original method to get base snapshot
        const baseSnapshot = originalCreatePlayerSnapshot.call(this, player);
        
        // Safety check for movementCore
        if (!window.GameStateManager.movementCore) {
          console.warn("MovementSystem: movementCore not available for TurnManager integration");
          return baseSnapshot;
        }
        
        // Add movement data to snapshot
        const movementSnapshot = window.GameStateManager.movementCore.createPlayerMovementSnapshot(player);
        
        // Combine snapshots
        return { ...baseSnapshot, ...movementSnapshot };
      };
    }
    
    // Hook into TurnManager's restorePlayerFromSnapshot method
    const originalRestorePlayerFromSnapshot = window.TurnManager.prototype.restorePlayerFromSnapshot;
    if (originalRestorePlayerFromSnapshot) {
      window.TurnManager.prototype.restorePlayerFromSnapshot = function(player, snapshot) {
        // Call original method to restore base data
        originalRestorePlayerFromSnapshot.call(this, player, snapshot);
        
        // Safety check for movementCore
        if (!window.GameStateManager.movementCore) {
          console.warn("MovementSystem: movementCore not available for TurnManager restore integration");
          return;
        }
        
        // Restore movement data from snapshot
        window.GameStateManager.movementCore.restorePlayerMovementFromSnapshot(player, snapshot);
      };
    }
    
    console.log('MovementSystem: TurnManager integration complete');
  } catch (error) {
    console.error('MovementSystem: Error integrating with TurnManager:', error);
  }
}

console.log('MovementSystem.js code execution finished');
