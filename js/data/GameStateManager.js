// GameStateManager.js - Manager for game state and persistence
console.log('GameStateManager.js file is beginning to be used');

// VERSION TRACKING for cache-buster
if (window.LOADED_VERSIONS) {
  window.LOADED_VERSIONS['GameStateManager'] = '2025-05-25-001';
  console.log('GameStateManager: Version 2025-05-25-001 loaded');
}

class GameStateManager {
  constructor() {
    // Define a version for state structure
    this.VERSION = '1.0';
    
    // Add initialization flag to prevent premature access
    this.isProperlyInitialized = false;
    
    this.players = [];
    this.currentPlayerIndex = 0;
    this.spaces = [];
    this.diceRollData = []; // Store dice roll data for MovementEngine
    this._gameStarted = false;
    this.gameEnded = false;
    this.currentPhase = 'SETUP'; // Default starting phase
    
    // Card collections for the game
    this.cardCollections = {
      W: [], // Work Type cards
      B: [], // Bank cards
      I: [], // Investor cards
      L: [], // Life cards
      E: []  // Expeditor cards
    };
    
    // Add cache maps for fast lookups
    this.spaceCache = {
      byId: new Map(),         // Fast lookup by ID
      byName: new Map(),       // Fast lookup by exact name
      byNormalizedName: new Map() // Fast lookup by normalized name
    };
    
    // Add event handlers collection
    this.eventHandlers = {
      'playerMoved': [],
      'turnChanged': [],
      'gameStateChanged': [],
      'cardDrawn': [],
      'cardPlayed': [],
      'componentFinished': []  // NEW: For coordinated component updates
    };
    
    console.log('GameStateManager: Constructor completed');
  }
  
  // Add getter for gameStarted with initialization guard
  get gameStarted() {
    if (!this.isProperlyInitialized) {
      console.warn('GameStateManager: Accessing gameStarted before proper initialization! Returning false.');
      return false;
    }
    return this._gameStarted;
  }
  
  set gameStarted(value) {
    this._gameStarted = value;
  }
  
  // Initialize the game - deterministic initialization
  initialize(spacesData) {
    console.log('GameStateManager: initialize method is being used');
    
    // Prevent multiple initialization
    if (this.isProperlyInitialized) {
      console.log('GameStateManager: Already initialized, ignoring duplicate call');
      return;
    }
    
    console.log('GameStateManager: Initializing with CSV data:', spacesData.length, 'spaces');
    
    // Process CSV data
    this.processSpacesData(spacesData);
    
    // Build cache
    this.buildSpaceCache();
    
    // Mark as initialized
    this.isProperlyInitialized = true;
    
    console.log('GameStateManager: initialize method completed successfully');
  }
  
  // Extract spaces data processing into separate method
  processSpacesData(spacesData) {
    console.log('GameStateManager: processSpacesData method is being used');
    
    try {
      // Validate input data
      if (!spacesData || !Array.isArray(spacesData)) {
        throw new Error('Invalid spaces data: expected array');
      }
      
      if (spacesData.length === 0) {
        throw new Error('No spaces data provided');
      }
      
      // Initially set gameStarted to false to ensure the player setup screen is shown
      this._gameStarted = false;
      
      // Mark as properly initialized early to prevent premature getCurrentPlayer calls
      this.isProperlyInitialized = true;
    
    // Filter out invalid spaces
    const validSpaces = spacesData.filter(row => row['space_name'] && row['space_name'].trim() !== '');
    this.spaces = validSpaces.map((row, index) => {
      console.log(`DEBUG: Processing space ${index}: "${row['space_name']}" with visit_type: "${row['visit_type']}"`);
      // Get the space name
      const spaceName = row['space_name'] || `Space ${index}`;
      
      // Normalize the ID by removing special characters and converting to lowercase
      // Include visit type in the ID to ensure uniqueness while keeping display name the same
      const visitType = row['visit_type'] || 'default';
      const normalizedId = spaceName
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase() + '-' + visitType.toLowerCase();
      
      // Extract next spaces - keep exact names from CSV
      let nextSpaces = [];
      if (row['Space 1']) nextSpaces.push(row['Space 1']);
      if (row['Space 2']) nextSpaces.push(row['Space 2']);
      if (row['Space 3']) nextSpaces.push(row['Space 3']);
      if (row['Space 4']) nextSpaces.push(row['Space 4']);
      if (row['Space 5']) nextSpaces.push(row['Space 5']);
      // Do not include the Negotiate column in nextSpaces as it's not an actual space to move to
      
      // Filter out empty or n/a values, but keep original names otherwise
      nextSpaces = nextSpaces
        .filter(s => s && s.trim() !== '' && s !== 'n/a');
      
      // Create space object with all raw CSV fields preserved
      const spaceObj = {
        id: normalizedId,
        name: spaceName,
        space_name: spaceName,  // CRITICAL FIX: Add space_name property for SpaceExplorer compatibility
        type: (row['phase'] || 'Default').toUpperCase(),
        phase: (row['phase'] || 'Default').toUpperCase(),  // Add phase property for SpaceExplorer
        description: row['Event'] || '',
        action: row['Action'] || '',     // Map CSV Action column for SpaceExplorer
        outcome: row['Outcome'] || '',   // Map CSV Outcome column for SpaceExplorer
        nextSpaces: nextSpaces,
        visitType: (() => {
          const visitType = row['visit_type'] || 'First';
          if (spaceName === 'PM-DECISION-CHECK') {
            console.log(`DEBUG: PM-DECISION-CHECK visitType: "${visitType}" from raw: "${row['visit_type']}"`);  
          }
          return visitType;
        })(),
        
        // Store original Space columns for direct reference
        rawSpace1: row['Space 1'] || '',
        rawSpace2: row['Space 2'] || '',
        rawSpace3: row['Space 3'] || '',
        rawSpace4: row['Space 4'] || '',
        rawSpace5: row['Space 5'] || '',
        rawNegotiate: row['Negotiate'] || '',
        
        // Map CSV headers to standardized snake_case properties for consistency
        space_1: row['space_1'] || '',
        space_2: row['space_2'] || '',
        space_3: row['space_3'] || '',
        space_4: row['space_4'] || '',
        space_5: row['space_5'] || '',
        negotiate: row['Negotiate'] || '',  // CSV uses PascalCase
        requires_dice_roll: row['requires_dice_roll'] || '',
        path: row['path'] || '',
        visit_type: row['visit_type'] || '',
        event: row['Event'] || '',  // CSV uses PascalCase
        time: row['Time'] || '',  // CSV uses PascalCase  
        fee: row['Fee'] || '',  // CSV uses PascalCase
        
        // Map card columns with proper case handling for SpaceExplorer
        'W Card': row['w_card'] || '',
        'B Card': row['b_card'] || '',
        'I Card': row['i_card'] || '',
        'L card': row['l_card'] || '',
        'E Card': row['e_card'] || '',
        
        // Also provide Time and Fee for SpaceExplorer resource section
        'Time': row['Time'] || '',
        'Fee': row['Fee'] || '',
        
        visit: {
          first: {
            description: row['Event'] || ''
          },
          subsequent: {
            description: row['Action'] || ''
          }
        }
      };
      
      return spaceObj;
    });
    
    console.log('GameStateManager: processSpacesData method completed');
    
    } catch (error) {
      console.error('GameStateManager: Error processing spaces data:', error);
      this.isProperlyInitialized = false;
      
      // Set error state that can be accessed by components
      this.dataError = {
        type: 'spaces',
        message: 'Failed to process game board data. Please refresh the page.',
        originalError: error.message
      };
      
      // Dispatch error event
      this.dispatchEvent('gameStateChanged', {
        changeType: 'error',
        errorType: 'dataProcessing',
        component: 'GameStateManager',
        message: this.dataError.message
      });
      
      throw error; // Re-throw to halt initialization
    }
  }
  
  // Build space cache after loading spaces
  buildSpaceCache() {
    console.log('GameStateManager: buildSpaceCache method is being used');
    
    try {
      // Validate that spaces array exists
      if (!this.spaces || !Array.isArray(this.spaces)) {
        throw new Error('Cannot build cache: spaces data is not available');
      }
      
      // Clear existing caches
      this.spaceCache.byId.clear();
      this.spaceCache.byName.clear();
      this.spaceCache.byNormalizedName.clear();
      
      // Populate caches
      this.spaces.forEach((space, index) => {
        try {
          if (!space || !space.id || !space.name) {
            console.warn(`GameStateManager: Skipping invalid space at index ${index}:`, space);
            return;
          }
          
          this.spaceCache.byId.set(space.id, space);
          this.spaceCache.byName.set(space.name, space);
          
          const normalizedName = window.movementEngine?.extractSpaceName?.(space.name) || space.name;
          // Group spaces by normalized name for quick access to all variants
          if (!this.spaceCache.byNormalizedName.has(normalizedName)) {
            this.spaceCache.byNormalizedName.set(normalizedName, []);
          }
          this.spaceCache.byNormalizedName.get(normalizedName).push(space);
        } catch (spaceError) {
          console.error(`GameStateManager: Error processing space at index ${index}:`, spaceError);
          // Continue processing other spaces
        }
      });
      
      console.log('GameStateManager: buildSpaceCache method completed');
      
    } catch (error) {
      console.error('GameStateManager: Error building space cache:', error);
      
      // Set error state
      this.dataError = {
        type: 'cache',
        message: 'Failed to build game index. Please refresh the page.',
        originalError: error.message
      };
      
      throw error; // Re-throw as this is critical for game functionality
    }
  }
  
  // Event registration
  addEventListener(eventType, handler) {
    console.log(`GameStateManager: Adding event listener for ${eventType}`);
    
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    
    this.eventHandlers[eventType].push(handler);
    return handler; // Return for easier removal
  }
  
  // Event removal
  removeEventListener(eventType, handler) {
    console.log(`GameStateManager: Removing event listener for ${eventType}`);
    
    if (!this.eventHandlers[eventType]) return;
    
    const index = this.eventHandlers[eventType].indexOf(handler);
    if (index !== -1) {
      this.eventHandlers[eventType].splice(index, 1);
    }
  }
  
  // Dispatch event
  dispatchEvent(eventType, data) {
    console.log(`GameStateManager: Dispatching ${eventType} event`);
    
    if (!this.eventHandlers[eventType]) return;
    
    // Create the event object
    const event = {
      type: eventType,
      data: data,
      timestamp: Date.now()
    };
    
    // Notify all handlers
    this.eventHandlers[eventType].forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in ${eventType} event handler:`, error);
      }
    });
    
    // Also dispatch a DOM event for backward compatibility
    const domEvent = new CustomEvent('gameStateUpdated', { 
      detail: { type: eventType, data } 
    });
    window.dispatchEvent(domEvent);
  }
  
  // Create a new player
  addPlayer(name, color) {
    console.log('GameStateManager: addPlayer method is being used');
    
    const startSpaceId = this.findStartSpaceId();
    
    const id = `player-${this.players.length + 1}`;
    this.players.push({
      id,
      name,
      color,
      position: startSpaceId,
      visitedSpaces: new Set(), // Use a Set instead of array for O(1) lookups
      previousPosition: null, // Track the previous position
      singleChoices: {}, // Track permanent single choice decisions
      cards: [], // Initialize empty cards array for card management
      resources: {
        money: 0, // Starting money (players don't get money at beginning)
        time: 0  // Starting time (days)
      },
      properties: {
        singleChoices: {}, // Also store in properties for persistence
        visitHistory: [],
        previousPosition: null,
        hasUsedCheatBypass: false
      }
    });
    
    // Add compatibility methods for code expecting arrays
    const player = this.players[this.players.length - 1];
    
    // Method to get visited spaces as array for compatibility
    player.getVisitedSpacesArray = function() {
      return Array.from(this.visitedSpaces);
    };
    
    // Method to check if a space is in visited spaces for compatibility
    player.hasVisitedSpace = function(spaceName) {
      return this.visitedSpaces.has(spaceName);
    };
    
    this._gameStarted = true;
    
    // If this is the first player being added after a new game, mark as properly initialized
    if (!this.isProperlyInitialized && this.players.length === 1) {
      this.isProperlyInitialized = true;
      console.log('GameStateManager: Marked as properly initialized after first player added');
    }
    
    this.saveState();
    
    // Dispatch event
    this.dispatchEvent('gameStateChanged', {
      changeType: 'playerAdded',
      player: player
    });
    
    console.log('GameStateManager: addPlayer method completed');
  }
  
  // Find the starting space ID - deterministic lookup
  findStartSpaceId() {
    console.log('GameStateManager: findStartSpaceId method is being used');
    
    // Look for OWNER-SCOPE-INITIATION space with First visit type
    const startSpace = this.spaces.find(space => 
      space.space_name === 'OWNER-SCOPE-INITIATION' && space.visit_type === 'First'
    );
    
    if (!startSpace) {
      console.error('GameStateManager: Could not find starting space OWNER-SCOPE-INITIATION with visit_type First');
      console.log('GameStateManager: Available spaces:', this.spaces.map(s => `${s.space_name} (${s.visit_type})`));
      throw new Error('Starting space not found in game data');
    }
    
    console.log('GameStateManager: Found starting space:', startSpace.space_name);
    return startSpace.space_name;
  }
  
  // Get current player
  getCurrentPlayer() {
    console.log('GameStateManager: getCurrentPlayer method is being used');
    
    // Add guard against uninitialized state
    if (!this.isProperlyInitialized) {
      console.warn('GameStateManager: getCurrentPlayer called before proper initialization!');
      return null;
    }
    
    // Add guard against empty players array
    if (!this.players || this.players.length === 0) {
      console.warn('GameStateManager: No players available in getCurrentPlayer()');
      return null;
    }
    
    // Add guard against invalid currentPlayerIndex
    if (this.currentPlayerIndex < 0 || this.currentPlayerIndex >= this.players.length) {
      console.warn('GameStateManager: Invalid currentPlayerIndex:', this.currentPlayerIndex);
      return null;
    }
    
    const player = this.players[this.currentPlayerIndex];
    console.log('GameStateManager: getCurrentPlayer method completed');
    return player;
  }
  
  // Move to next player's turn
  nextPlayerTurn() {
    console.log('GameStateManager: nextPlayerTurn method is being used');
    
    const oldPlayerIndex = this.currentPlayerIndex;
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.saveState();
    
    // Dispatch event
    this.dispatchEvent('turnChanged', {
      previousPlayerIndex: oldPlayerIndex,
      currentPlayerIndex: this.currentPlayerIndex
    });
    
    console.log('GameStateManager: nextPlayerTurn method completed');
  }
  
  
  // Find a space by ID - cache only (clean implementation)
  findSpaceById(spaceId) {
    console.log('GameStateManager: findSpaceById method is being used for:', spaceId);
    
    // Look in cache - single source of truth
    const space = this.spaceCache.byId.get(spaceId);
    
    // If not found, log debug info
    if (!space) {
      console.log('GameStateManager: Space not found in cache for ID:', spaceId);
      console.log('GameStateManager: Available space IDs:', Array.from(this.spaceCache.byId.keys()).slice(0, 10));
    } else {
      console.log('GameStateManager: Successfully found space:', space.space_name);
    }
    
    console.log('GameStateManager: findSpaceById method completed');
    return space;
  }
  
  // Add the starting space to visited spaces if the player moves
  movePlayer(playerId, spaceId) {
    console.log('GameStateManager: movePlayer method is being used');
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      console.log('GameStateManager: movePlayer - Player not found', playerId);
      return;
    }
    
    console.log('GameStateManager: Moving player', player.name, 'to space ID:', spaceId);
    
    // Skip updating visited spaces if the player is moving to the same space
    if (player.position === spaceId) {
      console.log('GameStateManager: Player already on this space, skipping move');
      return;
    }
    
    // Get the current space before recording previous position - now using cache
    const currentSpace = this.findSpaceById(player.position);
    
    // Record the previous position before updating
    player.previousPosition = player.position;
    
    // CRITICAL FIX: Always set previousSpace to the current space NAME for MovementEngine compatibility
    if (currentSpace) {
      player.previousSpace = currentSpace.space_name;
      console.log('GameStateManager: Set previousSpace to:', player.previousSpace);
    } else {
      console.log('GameStateManager: Could not find current space for previousSpace setting');
    }
    
    console.log('GameStateManager: Set previousPosition to:', player.previousPosition);
    
    // Add the current space to visited spaces if not already there
    if (currentSpace) {
    // CRITICAL FIX: Use extractSpaceName to properly normalize the space name
    const currentSpaceName = window.movementEngine?.extractSpaceName?.(currentSpace.space_name) || currentSpace.space_name;
    
    // Initialize visitedSpaces as Set if it's still an array (for backward compatibility)
    if (!player.visitedSpaces || Array.isArray(player.visitedSpaces)) {
    player.visitedSpaces = new Set(player.visitedSpaces || []);
    }
    
    // Add to visited spaces when leaving (this ensures correct visit type detection)
    console.log('GameStateManager: Adding current space to visited spaces when leaving:', currentSpaceName);
    player.visitedSpaces.add(currentSpaceName);
      
    // Debug: Show all visited spaces after adding this one
    console.log('GameStateManager: Updated visitedSpaces:', Array.from(player.visitedSpaces));
    console.log('GameStateManager: After adding, normalized space name should be in visitedSpaces:', player.visitedSpaces.has(currentSpaceName));
  }
    
    // Add time to player's time counter when leaving a space
    // Only do this if there is a current space (not for first move of the game)
    if (currentSpace) {
      // Try to get time value from the space and convert to number
      let timeToAdd = 0;
      if (currentSpace.Time && currentSpace.Time.trim() !== '') {
        timeToAdd = parseInt(currentSpace.Time, 10);
        // If parsing fails, default to 0
        if (isNaN(timeToAdd)) {
          console.log('GameStateManager: Invalid time value in space', currentSpace.space_name, ':', currentSpace.Time);
          timeToAdd = 0;
        }
      }
      
      // Add time to player's counter
      if (timeToAdd > 0) {
        console.log('GameStateManager: Adding', timeToAdd, 'days to player time when leaving', currentSpace.space_name);
        player.resources.time += timeToAdd;
      }
    }
    
    // Get information about the space being moved to - now using cache
    const newSpace = this.findSpaceById(spaceId);
    if (!newSpace) {
      console.log('GameStateManager: movePlayer - Destination space not found', spaceId);
      return;
    }
    
    console.log('GameStateManager: Moving to space:', newSpace.space_name, 'Type:', newSpace.phase);
    
    // Set new position - ensure we only store the space name, not visit type suffix
    const cleanSpaceName = newSpace ? newSpace.space_name : spaceId.replace(/-first$|-subsequent$/, '');
    player.position = cleanSpaceName;
    
    // Note: Player position always stores just the space name, not visit type
    // Visit type is determined dynamically based on visitedSpaces when needed
    
    // NOTE: We do NOT add the new space to visitedSpaces here
    // Spaces are only added to visitedSpaces when LEAVING them (see above)
    // This ensures correct visit type detection for first vs subsequent visits
    console.log('GameStateManager: Player moved to', newSpace.space_name, 'but not adding to visitedSpaces until they leave');
    
    // Check if this is the finish space
    if (newSpace.phase === 'END') {
      console.log('GameStateManager: Player reached END space, game completed');
      this.gameEnded = true;
    }
    
    // Update space visit types based on player's visit history
    this.updateSpaceVisitTypes();
    
    // Update current phase based on the new space
    this.updateCurrentPhase(newSpace);
    
    this.saveState();
    
    // Dispatch event
    this.dispatchEvent('playerMoved', {
      playerId: playerId,
      fromSpaceId: player.previousPosition,
      toSpaceId: spaceId,
      player: player
    });
    
    console.log('GameStateManager: movePlayer method completed');
  }
  
  
  // PHASE 4: Simple CSV lookup - no complex fallbacks
  findSpaceByName(name) {
    console.log('GameStateManager: findSpaceByName method is being used');
    
    if (!name) return null;
    
    // 1. Normalize name to CSV format
    const normalizedName = window.movementEngine?.extractSpaceName?.(name) || name;
    
    // 2. Look up in CSV/cache (single source of truth)
    const spaces = this.spaceCache.byNormalizedName.get(normalizedName);
    
    // 3. Return result (no fallbacks, no guessing)
    const match = spaces && spaces.length > 0 ? spaces[0] : null;
    
    console.log('GameStateManager: findSpaceByName method completed');
    return match;
  }
  
  // Get available moves for a player
  getAvailableMoves(player) {
    console.log('GameStateManager: getAvailableMoves method is being used');
    
    if (!player) {
      console.warn('GameStateManager: No player provided to getAvailableMoves');
      return [];
    }
    
    if (!window.movementEngine?.isReady?.()) {
      console.warn('GameStateManager: MovementEngine not ready for getAvailableMoves');
      return [];
    }
    
    const movements = window.movementEngine.getAvailableMovements(player);
    console.log('GameStateManager: getAvailableMoves method completed');
    return movements;
  }
  
  // Save state to localStorage with improved format
  saveState() {
    console.log('GameStateManager: saveState method is being used');
    
    try {
      // Verify visited spaces before saving
      if (this.players.length > 0) {
        const player = this.players[0]; // Check first player for debugging
        if (player.visitedSpaces) {
          console.log('GameStateManager: Before saving - Player visitedSpaces:', Array.from(player.visitedSpaces));
          console.log('GameStateManager: Before saving - Is OWNER-SCOPE-INITIATION visited?', 
                     player.visitedSpaces.has('OWNER-SCOPE-INITIATION'));
        }
      }
      
      // Create serializable players by converting Sets to arrays
      const serializablePlayers = this.players.map(player => {
        const serialized = {...player};
        
        // Convert Set to Array
        if (player.visitedSpaces instanceof Set) {
          serialized.visitedSpaces = Array.from(player.visitedSpaces);
        }
        
        // Remove helper methods before serializing
        delete serialized.getVisitedSpacesArray;
        delete serialized.hasVisitedSpace;
        
        return serialized;
      });
      
      // Store everything in a single object with version
      const gameState = {
        version: this.VERSION,
        timestamp: Date.now(),
        players: serializablePlayers,
        currentPlayerIndex: this.currentPlayerIndex,
        gameStarted: this._gameStarted,
        gameEnded: this.gameEnded,
        currentPhase: this.currentPhase
      };
      
      // Check serialized data before saving
      if (serializablePlayers.length > 0) {
        console.log('GameStateManager: Serialized visitedSpaces:', serializablePlayers[0].visitedSpaces);
      }
      
      localStorage.setItem('gameState', JSON.stringify(gameState));
      
      // Keep old format for backward compatibility
      localStorage.setItem('game_players', JSON.stringify(serializablePlayers));
      localStorage.setItem('game_currentPlayer', this.currentPlayerIndex);
      localStorage.setItem('game_status', JSON.stringify({
        started: this._gameStarted,
        ended: this.gameEnded
      }));
    } catch (error) {
      console.error('GameStateManager: Error saving state:', error);
    }
    
    console.log('GameStateManager: saveState method completed');
  }
  
  // Load state from localStorage - deterministic loading
  loadSavedState() {
    console.log('GameStateManager: loadSavedState method is being used');
    
    // Try loading from new consolidated format first
    const savedStateJson = localStorage.getItem('gameState');
    
    if (savedStateJson) {
      const savedState = JSON.parse(savedStateJson);
      
      console.log('GameStateManager: Got savedState from localStorage, checking players and visitedSpaces');
      
      // Check if state has players and visitedSpaces before loading
      if (savedState.players && savedState.players.length > 0) {
        const firstPlayer = savedState.players[0];
        if (firstPlayer.visitedSpaces) {
          console.log('GameStateManager: Loaded visitedSpaces array:', firstPlayer.visitedSpaces);
          console.log('GameStateManager: Includes OWNER-SCOPE-INITIATION?', 
                     firstPlayer.visitedSpaces.includes('OWNER-SCOPE-INITIATION'));
        } else {
          console.log('GameStateManager: No visitedSpaces found in saved state for player');
        }
      }
      
      // Version check for future migrations
      if (savedState.version !== this.VERSION) {
        console.log(`GameStateManager: State version mismatch: ${savedState.version} vs ${this.VERSION}`);
        // We'd add migration logic here in the future
      }
      
      // Restore state
      if (savedState.players) {
        // Convert visited spaces arrays back to Sets
        this.players = savedState.players.map(player => {
          const restored = {...player};
          
          // Convert array to Set
          if (Array.isArray(player.visitedSpaces)) {
            restored.visitedSpaces = new Set(player.visitedSpaces);
            console.log('GameStateManager: Player visitedSpaces converted to Set');
            console.log('GameStateManager: Items in Set:', Array.from(restored.visitedSpaces));
          } else {
            console.log('GameStateManager: Player visitedSpaces was not an array - creating empty Set');
            restored.visitedSpaces = new Set();
          }
          
          // Ensure singleChoices exists
          if (!restored.singleChoices) {
            restored.singleChoices = {};
          }
          
          // Ensure properties exists with all needed fields
          if (!restored.properties) {
            restored.properties = {};
          }
          if (!restored.properties.singleChoices) {
            restored.properties.singleChoices = restored.singleChoices || {};
          }
          if (!restored.properties.visitHistory) {
            restored.properties.visitHistory = [];
          }
          
          // Add helper methods for backward compatibility
          restored.getVisitedSpacesArray = function() {
            return Array.from(this.visitedSpaces);
          };
          
          restored.hasVisitedSpace = function(spaceName) {
            return this.visitedSpaces.has(spaceName);
          };
          
          return restored;
        });
        
        // Verify after conversion
        if (this.players.length > 0) {
          const player = this.players[0];
          console.log('GameStateManager: After restoration - visitedSpaces items:', 
                     Array.from(player.visitedSpaces));
          console.log('GameStateManager: After restoration - Is OWNER-SCOPE-INITIATION visited?', 
                     player.visitedSpaces.has('OWNER-SCOPE-INITIATION'));
        }
      }
      
      this.currentPlayerIndex = savedState.currentPlayerIndex || 0;
      this._gameStarted = false; // Still let PlayerSetup handle this
      this.gameEnded = savedState.gameEnded || false;
      this.currentPhase = savedState.currentPhase || 'SETUP';
      
      console.log('GameStateManager: Loaded from consolidated storage format');
    } else {
      console.log('GameStateManager: No saved state found in localStorage');
    }
    
    console.log('GameStateManager: loadSavedState method completed');
  }
  
  // Legacy loader for backward compatibility - deterministic loading
  loadLegacySavedState() {
    console.log('GameStateManager: loadLegacySavedState method is being used');
    
    const savedPlayers = localStorage.getItem('game_players');
    const savedCurrentPlayer = localStorage.getItem('game_currentPlayer');
    const savedStatus = localStorage.getItem('game_status');
    
    // Check if any legacy data exists
    if (!savedPlayers && !savedCurrentPlayer && !savedStatus) {
      console.log('GameStateManager: No legacy saved state found');
      console.log('GameStateManager: loadLegacySavedState method completed');
      return;
    }
    
    if (savedPlayers) {
      const players = JSON.parse(savedPlayers);
      
      // Convert visited spaces to Sets
      this.players = players.map(player => {
        const restored = {...player};
        
        // Convert array to Set
        restored.visitedSpaces = new Set(player.visitedSpaces || []);
        
        // Add helper methods
        restored.getVisitedSpacesArray = function() {
          return Array.from(this.visitedSpaces);
        };
        
        restored.hasVisitedSpace = function(spaceName) {
          return this.visitedSpaces.has(spaceName);
        };
        
        return restored;
      });
    }
    
    if (savedCurrentPlayer) {
      this.currentPlayerIndex = parseInt(savedCurrentPlayer);
    }
    
    if (savedStatus) {
      const status = JSON.parse(savedStatus);
      this._gameStarted = false; // Let PlayerSetup handle this
      this.gameEnded = status.ended || false;
    }
    
    console.log('GameStateManager: Loaded from legacy storage format');
    console.log('GameStateManager: loadLegacySavedState method completed');
  }
  
  // Reset state to defaults
  resetState() {
    console.log('GameStateManager: resetState method is being used');
    
    this.players = [];
    this.currentPlayerIndex = 0;
    this._gameStarted = false;
    this.gameEnded = false;
    
    console.log('GameStateManager: resetState method completed');
  }
  
  // Clear saved state
  clearSavedState() {
    console.log('GameStateManager: clearSavedState method is being used');
    
    // Clear both formats
    localStorage.removeItem('gameState');
    localStorage.removeItem('game_players');
    localStorage.removeItem('game_currentPlayer');
    localStorage.removeItem('game_status');
    
    // Reset memory state too
    this.resetState();
    
    console.log('GameStateManager: clearSavedState method completed');
  }
  
  // Load card data from CSV
  loadCardData(cardType, cardData) {
    console.log('GameStateManager: loadCardData method is being used');
    
    if (!cardData || cardData.length === 0) {
      console.error(`GameStateManager: No ${cardType} card data provided!`);
      return;
    }
    
    // Store card data in the appropriate collection
    this.cardCollections[cardType] = cardData;
    console.log(`GameStateManager: Loaded ${cardData.length} ${cardType} cards`);
    
    console.log('GameStateManager: loadCardData method completed');
  }
  
  // Load dice roll data from CSV
  loadDiceRollData(diceRollData) {
    console.log('GameStateManager: loadDiceRollData method is being used');
    
    if (!diceRollData || diceRollData.length === 0) {
      console.error('GameStateManager: No dice roll data provided!');
      return;
    }
    
    // Store dice roll data for MovementEngine access
    this.diceRollData = diceRollData;
    console.log(`GameStateManager: Loaded ${diceRollData.length} dice roll outcomes`);
    
    console.log('GameStateManager: loadDiceRollData method completed');
  }
  
  // Load spaces data from CSV
  loadSpacesData(spacesData) {
    console.log('GameStateManager: loadSpacesData method is being used');
    
    if (!spacesData || spacesData.length === 0) {
      console.error('GameStateManager: No spaces data provided!');
      return;
    }
    
    // Store spaces data for GameBoard access
    this.spaces = spacesData;
    console.log(`GameStateManager: Loaded ${spacesData.length} spaces`);
    
    // Dispatch event to notify components that spaces are loaded
    this.dispatchEvent('spacesLoaded', {
      spacesCount: spacesData.length,
      spaces: spacesData
    });
    
    console.log('GameStateManager: loadSpacesData method completed');
  }
  
  // Draw a card of the specified type
  drawCard(playerId, cardType, filters = {}) {
    console.log('GameStateManager: drawCard method is being used');
    console.log(`GameStateManager: drawCard called with playerId=${playerId}, cardType=${cardType}, filters=`, filters);
    
    // Validate inputs
    if (!playerId || !cardType) {
      console.error('GameStateManager: Invalid parameters for drawCard');
      console.error(`GameStateManager: playerId=${playerId}, cardType=${cardType}`);
      return null;
    }
    
    // Find the player
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      console.error('GameStateManager: Player not found for drawing card');
      console.error(`GameStateManager: Available players:`, this.players.map(p => p.id));
      return null;
    }
    console.log(`GameStateManager: Found player ${player.name} for card drawing`);
    
    // Use new card querying system if unified data is available
    let availableCards = [];
    console.log('GameStateManager: Checking card data sources...');
    
    if (window.InitializationManager && window.InitializationManager.loadedData && window.InitializationManager.loadedData.allCards) {
      console.log('GameStateManager: Using unified card system from InitializationManager');
      console.log(`GameStateManager: Total cards in InitializationManager: ${window.InitializationManager.loadedData.allCards.length}`);
      
      // Use unified card system
      availableCards = window.queryCards(
        window.InitializationManager.loadedData.allCards, 
        { card_type: cardType, ...filters }
      );
      console.log(`GameStateManager: Found ${availableCards.length} cards of type ${cardType} using queryCards`);
      
    } else if (this.cardCollections && this.cardCollections[cardType]) {
      console.log('GameStateManager: Using legacy card system from cardCollections');
      console.log(`GameStateManager: Available card types in collections:`, Object.keys(this.cardCollections));
      
      // Fallback to legacy system
      availableCards = this.cardCollections[cardType];
      console.log(`GameStateManager: Found ${availableCards.length} cards of type ${cardType} in legacy system`);
      
    } else {
      console.error('GameStateManager: No card data sources available!');
      console.error('GameStateManager: InitializationManager exists:', !!window.InitializationManager);
      console.error('GameStateManager: InitializationManager.loadedData exists:', !!(window.InitializationManager && window.InitializationManager.loadedData));
      console.error('GameStateManager: allCards exists:', !!(window.InitializationManager && window.InitializationManager.loadedData && window.InitializationManager.loadedData.allCards));
      console.error('GameStateManager: cardCollections exists:', !!this.cardCollections);
      console.error('GameStateManager: cardCollections keys:', this.cardCollections ? Object.keys(this.cardCollections) : 'N/A');
    }
    
    if (availableCards.length === 0) {
      console.log(`GameStateManager: No ${cardType} cards available to draw`);
      console.log('GameStateManager: This could indicate a card loading issue or all cards of this type are already drawn');
      return null;
    }
    
    console.log(`GameStateManager: About to select from ${availableCards.length} available cards`);
    console.log('GameStateManager: First few available cards:', availableCards.slice(0, 3).map(c => ({
      card_name: c.card_name || c.name,
      card_id: c.card_id || c.id,
      card_type: c.card_type
    })));
    
    // Random selection or weighted selection based on distribution_level
    const selectedCard = this.selectCard(availableCards);
    
    if (!selectedCard) {
      console.error('GameStateManager: selectCard returned null or undefined');
      return null;
    }
    
    console.log('GameStateManager: Selected card:', {
      card_name: selectedCard.card_name || selectedCard.name,
      card_id: selectedCard.card_id || selectedCard.id,
      card_type: selectedCard.card_type
    });
    
    // Create a unique instance for the player
    const drawnCard = { ...selectedCard };
    drawnCard.id = drawnCard.card_id || `${cardType}-card-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    drawnCard.type = cardType;
    
    console.log('GameStateManager: Created drawn card instance with id:', drawnCard.id);
    
    // Add the card to the player's hand
    if (!player.cards) {
      console.log('GameStateManager: Initializing player cards array');
      player.cards = [];
    }
    
    const cardCountBefore = player.cards.length;
    player.cards.push(drawnCard);
    console.log(`GameStateManager: Added card to player hand. Cards before: ${cardCountBefore}, after: ${player.cards.length}`);
    
    // Work cards represent scope (costs), not income
    // They should not add money - only Bank/Investor cards add money
    // Work cards are just added to hand for scope calculation
    
    // Save the updated state
    console.log('GameStateManager: Saving game state...');
    this.saveState();
    
    // Dispatch event
    console.log('GameStateManager: Dispatching cardDrawn event...');
    this.dispatchEvent('cardDrawn', {
      playerId: playerId,
      player: player,
      cardType: cardType,
      card: drawnCard
    });
    
    console.log(`GameStateManager: Player ${player.name} drew card ${drawnCard.card_name || drawnCard.id}`);
    console.log('GameStateManager: Final drawn card object:', drawnCard);
    
    // Return the drawn card for UI feedback
    console.log('GameStateManager: drawCard method completed successfully');
    return drawnCard;
  }
  
  // Select a card from available cards (with distribution weighting)
  selectCard(availableCards) {
    if (!availableCards || availableCards.length === 0) {
      return null;
    }
    
    // Check if cards have distribution_level for weighted selection
    const hasDistribution = availableCards.some(card => card.distribution_level);
    
    if (!hasDistribution) {
      // Simple random selection
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      return availableCards[randomIndex];
    }
    
    // Weighted selection based on distribution_level
    // Low = more common, High = less common
    const weights = availableCards.map(card => {
      switch(card.distribution_level) {
        case 'High': return 1;   // Rare
        case 'Medium': return 3; // Uncommon
        case 'Low': return 6;    // Common
        default: return 3;       // Default to uncommon
      }
    });
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < availableCards.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return availableCards[i];
      }
    }
    
    // Fallback to last card
    return availableCards[availableCards.length - 1];
  }
  
  // Play a card from a player's hand
  playCard(playerId, cardId) {
    console.log('GameStateManager: playCard method is being used');
    
    // Validate inputs
    if (!playerId || !cardId) {
      console.error('GameStateManager: Invalid parameters for playCard');
      return false;
    }
    
    // Find the player
    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.cards) {
      console.error('GameStateManager: Player not found or has no cards');
      return false;
    }
    
    // Find the card in the player's hand
    const cardIndex = player.cards.findIndex(card => card.id === cardId || card.card_id === cardId);
    if (cardIndex === -1) {
      console.error('GameStateManager: Card not found in player\'s hand');
      return false;
    }
    
    const card = player.cards[cardIndex];
    
    // Validate card can be played
    if (!this.canPlayCard(card, player)) {
      console.log(`GameStateManager: Card ${card.card_name || card.id} cannot be played right now`);
      return false;
    }
    
    // Remove the card from the player's hand
    const playedCard = { ...card };
    player.cards.splice(cardIndex, 1);
    
    // Process card effects using new metadata
    this.processCardEffects(playedCard, player);
    
    // Handle duration effects
    if (playedCard.duration && playedCard.duration !== 'Immediate') {
      this.addPersistentEffect(playedCard, player);
    }
    
    // Save the updated state
    this.saveState();
    
    // Dispatch event
    this.dispatchEvent('cardPlayed', {
      playerId: playerId,
      player: player,
      card: playedCard
    });
    
    console.log(`GameStateManager: Player ${player.name} played card ${playedCard.card_name || playedCard.id}`);
    
    console.log('GameStateManager: playCard method completed');
    return true;
  }
  
  // Discard a card from a player's hand
  discardCard(playerId, cardId) {
    console.log('GameStateManager: discardCard method is being used');
    
    // Validate inputs
    if (!playerId || !cardId) {
      console.error('GameStateManager: Invalid parameters for discardCard');
      return null;
    }
    
    // Find the player
    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.cards) {
      console.error('GameStateManager: Player not found or has no cards');
      return null;
    }
    
    // Find the card in the player's hand
    const cardIndex = player.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      console.error('GameStateManager: Card not found in player\'s hand');
      return null;
    }
    
    // Remove the card from the player's hand
    const discardedCard = { ...player.cards[cardIndex] };
    player.cards.splice(cardIndex, 1);
    
    // Save the updated state
    this.saveState();
    
    // Dispatch event
    this.dispatchEvent('gameStateChanged', {
      changeType: 'cardDiscarded',
      playerId: playerId,
      player: player,
      card: discardedCard
    });
    
    console.log(`GameStateManager: Player ${player.name} discarded a ${discardedCard.type} card`);
    
    // Return the discarded card for any side effects
    console.log('GameStateManager: discardCard method completed');
    return discardedCard;
  }
  
  // Get a player's cards
  getPlayerCards(playerId) {
    console.log('GameStateManager: getPlayerCards method is being used');
    
    // Find the player
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      console.log('GameStateManager: Player not found for getPlayerCards');
      return [];
    }
    
    // Return a copy of the cards array or an empty array if null
    const cards = player.cards ? [...player.cards] : [];
    
    console.log('GameStateManager: getPlayerCards method completed');
    return cards;
  }
  
  // Start a new game
  startNewGame() {
    console.log('GameStateManager: startNewGame method is being used');
    
    this.players = [];
    this.currentPlayerIndex = 0;
    this._gameStarted = false;
    this.gameEnded = false;
    this.clearSavedState();
    
    // Reset the initialization flag so that initialize() can be called again with fresh CSV data
    this.isProperlyInitialized = false;
    console.log('DEBUG: Reset isProperlyInitialized to false for new game');
    
    // Dispatch event
    this.dispatchEvent('gameStateChanged', {
      changeType: 'newGame'
    });
    
    console.log('GameStateManager: startNewGame method completed');
  }
  
  // Clean up resources when no longer needed
  cleanup() {
    console.log('GameStateManager: cleanup method is being used');
    
    // Clear all event handlers
    for (const eventType in this.eventHandlers) {
      this.eventHandlers[eventType] = [];
    }
    
    console.log('GameStateManager: cleanup method completed');
  }
  
  // Update space visit types based on player visit history
  updateSpaceVisitTypes() {
    console.log('GameStateManager: updateSpaceVisitTypes method is being used');
    
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('GameStateManager: No current player found, skipping visit type updates');
      return;
    }
    
    // Log the player's state before updates
    console.log(`GameStateManager: Updating visit types for player ${currentPlayer.name}`);
    console.log(`GameStateManager: Player position: ${currentPlayer.position}`);
    console.log(`GameStateManager: Player visited spaces:`, Array.from(currentPlayer.visitedSpaces || []));
    
    // Create a map of normalized space names to their visit types
    const visitTypeMap = new Map();
    
    // First pass: determine the correct visit type for each space name
    this.spaces.forEach(space => {
      const normalizedName = window.movementEngine?.extractSpaceName?.(space.name) || space.name;
      if (!visitTypeMap.has(normalizedName)) {
        const hasVisited = window.movementEngine?.hasPlayerVisitedSpace?.(currentPlayer, normalizedName) || false;
        visitTypeMap.set(normalizedName, hasVisited ? 'subsequent' : 'first');
        console.log(`GameStateManager: Space ${normalizedName} - hasVisited: ${hasVisited}, visitType: ${hasVisited ? 'subsequent' : 'first'}`);
      }
    });
    
    // Second pass: update the visitType property of every space
    let updatedCount = 0;
    this.spaces.forEach(space => {
      const normalizedName = window.movementEngine?.extractSpaceName?.(space.name) || space.name;
      const correctVisitType = visitTypeMap.get(normalizedName);
      
      if (space.visitType !== correctVisitType) {
        console.log(`GameStateManager: Updating space "${space.name}" (${space.id}) visit type from ${space.visitType} to ${correctVisitType}`);
        space.visitType = correctVisitType;
        updatedCount++;
      }
    });
    
    console.log(`GameStateManager: Updated ${updatedCount} spaces with correct visit types`);
    console.log('GameStateManager: updateSpaceVisitTypes method completed');
    
    // Force a board refresh by dispatching an event
    if (updatedCount > 0) {
      console.log('GameStateManager: Triggering board refresh events for visit type updates');
      
      // Dispatch a GameStateManager event for components that listen to it
      this.dispatchEvent('gameStateChanged', {
        changeType: 'visitTypesUpdated',
        updatedCount: updatedCount
      });
      
      // Also force a DOM event to ensure legacy components update
      window.dispatchEvent(new CustomEvent('resetSpaceInfoButtons'));
      
      // Trigger specific refresh for board visualization
      window.dispatchEvent(new CustomEvent('refreshBoardDisplay'));
    } else {
      // Always trigger refresh even if no spaces were updated
      // This ensures the board displays correctly after reload or re-render
      console.log('GameStateManager: No spaces updated, but still triggering refresh');
      window.dispatchEvent(new CustomEvent('refreshBoardDisplay'));
    }
    
    // Return true if changes were made
    return updatedCount > 0;
  }

  // Enhanced card mechanics methods

  // Check if a card can be played given current game state
  canPlayCard(card, player) {
    if (!card || !player) {
      return false;
    }

    // Check phase restrictions
    if (card.phase_restriction && card.phase_restriction !== 'Any') {
      const currentPhase = this.currentPhase || 'Any';
      if (card.phase_restriction !== currentPhase) {
        return false;
      }
    }

    // Check space restrictions
    if (card.space_restriction) {
      const currentSpace = this.getCurrentSpace();
      if (currentSpace && card.space_restriction !== currentSpace.space_name) {
        return false;
      }
    }

    // Check work type restrictions
    if (card.work_type_restriction) {
      const playerWorkType = player.workType;
      if (playerWorkType && card.work_type_restriction !== playerWorkType) {
        return false;
      }
    }

    // Check cost requirements
    if (card.money_cost) {
      const playerMoney = player.resources?.money || 0;
      if (playerMoney < card.money_cost) {
        return false;
      }
    }

    // Check usage limits
    if (card.usage_limit) {
      const timesUsed = player.cardUsage?.[card.card_id] || 0;
      if (timesUsed >= card.usage_limit) {
        return false;
      }
    }

    // Check cooldown
    if (card.cooldown && player.cardCooldowns?.[card.card_id]) {
      const lastUsed = player.cardCooldowns[card.card_id];
      const turnsPassed = (this.currentTurn || 0) - lastUsed;
      if (turnsPassed < card.cooldown) {
        return false;
      }
    }

    return true;
  }

  // Process card effects using new metadata
  processCardEffects(card, player) {
    console.log('GameStateManager: Processing enhanced card effects', card.card_name || card.id);
    
    if (!card || !player) return;

    // Initialize player resources if needed
    if (!player.resources) {
      player.resources = { money: 0, time: 0 };
    }

    // Apply immediate effects
    let moneyEffect = card.money_effect || 0;
    
    // Work cards represent scope (costs), not income - they should NOT add money
    if (card.card_type === 'W') {
      moneyEffect = 0; // Work cards don't add money, they represent scope commitments
    }
    
    if (moneyEffect !== 0) {
      player.resources.money = (player.resources.money || 0) + moneyEffect;
      console.log(`GameStateManager: Applied money effect ${moneyEffect} to ${player.name}`);
    }

    if (card.time_effect && card.time_effect !== 0) {
      player.resources.time = (player.resources.time || 0) + card.time_effect;
      console.log(`GameStateManager: Applied time effect ${card.time_effect} to ${player.name}`);
    }

    // Apply costs
    if (card.money_cost && card.money_cost > 0) {
      player.resources.money = (player.resources.money || 0) - card.money_cost;
      console.log(`GameStateManager: Applied money cost ${card.money_cost} to ${player.name}`);
    }

    // Handle card drawing
    if (card.draw_cards && card.draw_cards > 0) {
      const cardTypeFilter = card.card_type_filter || 'W';
      for (let i = 0; i < card.draw_cards; i++) {
        this.drawCard(player.id, cardTypeFilter);
      }
      console.log(`GameStateManager: Drew ${card.draw_cards} ${cardTypeFilter} cards for ${player.name}`);
    }

    // Handle card discarding
    if (card.discard_cards && card.discard_cards > 0) {
      this.discardCards(player, card.discard_cards);
    }

    // Process target and scope effects
    this.processCardTargets(card, player);

    // Track usage for limits
    if (card.usage_limit) {
      if (!player.cardUsage) player.cardUsage = {};
      player.cardUsage[card.card_id] = (player.cardUsage[card.card_id] || 0) + 1;
    }

    // Set cooldown
    if (card.cooldown) {
      if (!player.cardCooldowns) player.cardCooldowns = {};
      player.cardCooldowns[card.card_id] = this.currentTurn || 0;
    }

    // Ensure resources don't go negative
    if (player.resources.money < 0) player.resources.money = 0;
    if (player.resources.time < 0) player.resources.time = 0;

    console.log('GameStateManager: Card effects processing completed');
  }

  // Process card target and scope effects
  processCardTargets(card, sourcePlayer) {
    if (!card.target || card.target === 'Self') {
      return [sourcePlayer];
    }

    let targets = [];

    switch(card.target) {
      case 'All Players':
        targets = this.players;
        break;
      case 'Choose Opponent':
      case 'Opponent':
        targets = this.players.filter(p => p.id !== sourcePlayer.id);
        break;
      case 'Next Player':
        const currentIndex = this.players.findIndex(p => p.id === sourcePlayer.id);
        const nextIndex = (currentIndex + 1) % this.players.length;
        targets = [this.players[nextIndex]];
        break;
      default:
        targets = [sourcePlayer];
    }

    // Apply scope limitations
    if (card.scope === 'Single' && targets.length > 1) {
      // For single scope, typically would prompt user to choose
      // For now, just take the first target
      targets = targets.slice(0, 1);
    }

    return targets;
  }

  // Add persistent effect for duration-based cards
  addPersistentEffect(card, player) {
    if (!player.persistentEffects) {
      player.persistentEffects = [];
    }
    
    const effect = {
      cardId: card.card_id,
      card: card,
      turnsRemaining: card.duration_count || 1,
      appliedTurn: this.currentTurn || 0,
      type: card.duration
    };

    player.persistentEffects.push(effect);
    console.log(`GameStateManager: Added persistent effect for ${card.card_name || card.id} to ${player.name}`);
  }

  // Process persistent effects at turn start/end
  processPersistentEffects(player) {
    if (!player.persistentEffects) return;

    console.log(`GameStateManager: Processing ${player.persistentEffects.length} persistent effects for ${player.name}`);

    player.persistentEffects = player.persistentEffects.filter(effect => {
      // Apply ongoing effect
      if (effect.card.money_effect) {
        player.resources.money = (player.resources.money || 0) + effect.card.money_effect;
      }
      if (effect.card.time_effect) {
        player.resources.time = (player.resources.time || 0) + effect.card.time_effect;
      }
      
      // Decrement turns remaining for turn-based effects
      if (effect.type === 'Turns') {
        effect.turnsRemaining--;
        console.log(`GameStateManager: Persistent effect ${effect.card.card_name || effect.cardId} has ${effect.turnsRemaining} turns remaining`);
        return effect.turnsRemaining > 0;
      }
      
      // Permanent effects never expire
      return effect.type === 'Permanent';
    });
  }

  // Process all players' persistent effects
  processAllPersistentEffects() {
    this.players.forEach(player => {
      this.processPersistentEffects(player);
    });
  }

  // Helper method to discard cards from a player's hand
  discardCards(player, count) {
    if (!player.cards || player.cards.length === 0) return;

    const cardsToDiscard = Math.min(count, player.cards.length);
    const discardedCards = player.cards.splice(0, cardsToDiscard);
    
    console.log(`GameStateManager: Discarded ${discardedCards.length} cards for ${player.name}`);
    
    // Dispatch event for each discarded card
    discardedCards.forEach(card => {
      this.dispatchEvent('cardDiscarded', {
        playerId: player.id,
        player: player,
        card: card
      });
    });
  }

  // Get current space object
  getCurrentSpace() {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return null;

    return this.spaces.find(space => space['Space Name'] === currentPlayer.position);
  }

  // Evaluate conditional logic (basic implementation)
  evaluateCardCondition(card, player) {
    if (!card.conditional_logic) return true;

    const condition = card.conditional_logic.toLowerCase();
    
    // Handle common conditional patterns
    if (condition.includes('high-profile client')) {
      return player.hasHighProfileClient || false;
    }
    
    if (condition.includes('same worktype')) {
      return this.players.some(p => p.id !== player.id && p.workType === player.workType);
    }
    
    if (condition.includes('permits this turn')) {
      const permitMatch = condition.match(/(\d+)\+?\s*permits?/);
      if (permitMatch) {
        const requiredPermits = parseInt(permitMatch[1]);
        return (player.permitsThisTurn || 0) >= requiredPermits;
      }
    }

    // Default to true if condition cannot be evaluated
    console.warn('GameStateManager: Could not evaluate conditional logic:', card.conditional_logic);
    return true;
  }

  // ======================
  // PHASE 5 ENHANCEMENTS
  // ======================

  // Set card indexes from InitializationManager
  setCardIndexes(cardIndexes) {
    console.log('GameStateManager: Setting advanced card indexes');
    this.cardIndexes = cardIndexes;
    
    // Dispatch event to notify components
    this.dispatchEvent('cardIndexesLoaded', {
      changeType: 'cardIndexesLoaded',
      metadata: cardIndexes.metadata
    });
  }

  // Get comprehensive game state including new Phase 5 features
  getState() {
    return {
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      spaces: this.spaces,
      diceRollData: this.diceRollData,
      gameStarted: this._gameStarted,
      gameEnded: this.gameEnded,
      cardCollections: this.cardCollections,
      cardIndexes: this.cardIndexes,
      currentTurn: this.currentTurn || 0,
      version: this.VERSION
    };
  }

  // Enhanced state update method
  updateState(updates) {
    console.log('GameStateManager: Updating state with', Object.keys(updates));
    
    Object.entries(updates).forEach(([key, value]) => {
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      } else {
        console.warn('GameStateManager: Unknown state property:', key);
      }
    });

    // Save and notify
    this.saveState();
    this.dispatchEvent('gameStateChanged', {
      changeType: 'stateUpdated',
      updates: Object.keys(updates)
    });
  }

  // Update current phase based on space
  updateCurrentPhase(space) {
    if (!space) return;
    
    const previousPhase = this.currentPhase;
    let newPhase = this.currentPhase;
    
    // Extract phase from space data - using the phase column from CSV directly
    if (space.phase && space.phase !== 'Default') {
      newPhase = space.phase.toUpperCase();
    }
    
    // Use CSV phase names directly - no mapping to standard project management phases
    
    // Update current phase if it changed
    if (newPhase !== previousPhase) {
      console.log(`GameStateManager: Phase changed from ${previousPhase} to ${newPhase} at space ${space.space_name}`);
      this.currentPhase = newPhase;
      
      // Dispatch phase change event
      this.dispatchEvent('gameStateChanged', {
        changeType: 'phaseChanged',
        previousPhase: previousPhase,
        currentPhase: newPhase,
        triggerSpace: space.space_name
      });
    }
  }

}

// Create instance and export
window.GameStateManager = new GameStateManager();

// For backward compatibility, maintain GameState reference
window.GameState = window.GameStateManager;

console.log('GameStateManager.js code execution finished');