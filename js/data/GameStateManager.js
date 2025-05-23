// GameStateManager.js - Manager for game state and persistence
console.log('GameStateManager.js file is beginning to be used');

class GameStateManager {
  constructor() {
    // Define a version for state structure
    this.VERSION = '1.0';
    
    this.players = [];
    this.currentPlayerIndex = 0;
    this.spaces = [];
    this.gameStarted = false;
    this.gameEnded = false;
    
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
      'cardPlayed': []
    };
    
    console.log('GameStateManager: Constructor completed');
  }
  
  // Initialize the game - Preserving original logic but adding cache
  initialize(spacesData) {
    console.log('GameStateManager: initialize method is being used');
    
    if (!spacesData || spacesData.length === 0) {
      throw new Error('No spaces data provided or empty array!');
    }
    
    // Initially set gameStarted to false to ensure the player setup screen is shown
    this.gameStarted = false;
    
    // Filter out invalid spaces
    const validSpaces = spacesData.filter(row => row['Space Name'] && row['Space Name'].trim() !== '');
    
    this.spaces = validSpaces.map((row, index) => {
      // Get the space name
      const spaceName = row['Space Name'] || `Space ${index}`;
      
      // Normalize the ID by removing special characters and converting to lowercase
      // Include visit type in the ID to ensure uniqueness while keeping display name the same
      const visitType = row['Visit Type'] || 'default';
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
        type: (row['Phase'] || 'Default').toUpperCase(),
        description: row['Event'] || '',
        nextSpaces: nextSpaces,
        visitType: visitType,
        
        // Store original Space columns for direct reference
        rawSpace1: row['Space 1'] || '',
        rawSpace2: row['Space 2'] || '',
        rawSpace3: row['Space 3'] || '',
        rawSpace4: row['Space 4'] || '',
        rawSpace5: row['Space 5'] || '',
        rawNegotiate: row['Negotiate'] || '',
        
        // Preserve all original CSV columns
        action: row['Action'] || '',
        outcome: row['Outcome'] || '',
        'W Card': row['W Card'] || '',
        'B Card': row['B Card'] || '',
        'I Card': row['I Card'] || '',
        'L card': row['L card'] || '',
        'E Card': row['E Card'] || '',
        Time: row['Time'] || '',
        Fee: row['Fee'] || '',
        
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
    
    // Build cache for fast lookups
    this.buildSpaceCache();
    
    this.loadSavedState();
    
    console.log('GameStateManager: initialize method completed');
  }
  
  // Build space cache after loading spaces
  buildSpaceCache() {
    console.log('GameStateManager: buildSpaceCache method is being used');
    
    // Clear existing caches
    this.spaceCache.byId.clear();
    this.spaceCache.byName.clear();
    this.spaceCache.byNormalizedName.clear();
    
    // Populate caches
    this.spaces.forEach(space => {
      this.spaceCache.byId.set(space.id, space);
      this.spaceCache.byName.set(space.name, space);
      
      const normalizedName = this.extractSpaceName(space.name);
      // Group spaces by normalized name for quick access to all variants
      if (!this.spaceCache.byNormalizedName.has(normalizedName)) {
        this.spaceCache.byNormalizedName.set(normalizedName, []);
      }
      this.spaceCache.byNormalizedName.get(normalizedName).push(space);
    });
    
    console.log('GameStateManager: buildSpaceCache method completed');
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
      cards: [], // Initialize empty cards array for card management
      resources: {
        money: 0, // Starting money (players don't get money at beginning)
        time: 0  // Starting time (days)
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
    
    this.gameStarted = true;
    this.saveState();
    
    // Dispatch event
    this.dispatchEvent('gameStateChanged', {
      changeType: 'playerAdded',
      player: player
    });
    
    console.log('GameStateManager: addPlayer method completed');
  }
  
  // Find the starting space ID - now using cache
  findStartSpaceId() {
    console.log('GameStateManager: findStartSpaceId method is being used');
    
    // Look for any spaces matching OWNER-SCOPE-INITIATION
    for (const space of this.spaces) {
      if (space.name.includes('OWNER-SCOPE-INITIATION')) {
        console.log('GameStateManager: Found OWNER-SCOPE-INITIATION space');
        return space.id;
      }
    }
    
    // If not found, use the first non-START space in the array
    if (this.spaces.length > 0) {
      for (const space of this.spaces) {
        if (!space.name.includes('START')) {
          console.log('GameStateManager: Found non-START space for starting position');
          return space.id;
        }
      }
      
      console.log('GameStateManager: Using first available space for starting position');
      return this.spaces[0].id;
    }
    
    // Fallback to a default value
    console.log('GameStateManager: Using default fallback starting space ID');
    return 'owner-scope-initiation-first';
  }
  
  // Get current player
  getCurrentPlayer() {
    console.log('GameStateManager: getCurrentPlayer method is being used');
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
  
  // Extract the space name from a display name (without visit type)
  extractSpaceName(displayName) {
    console.log(`GameStateManager: extractSpaceName method is being used for: "${displayName}"`);
    let result;
    // For display names that might have explanatory text after a dash
    if (displayName && displayName.includes(' - ')) {
      result = displayName.split(' - ')[0].trim();
    } else {
      result = displayName;
    }
    
    // Fix the issue with OWNER-SCOPE-INITIATION vs. OWNER SCOPE INITIATION
    // This ensures consistent normalization for comparison
    if (result === 'OWNER SCOPE INITIATION') {
      result = 'OWNER-SCOPE-INITIATION';
      console.log('GameStateManager: Normalized "OWNER SCOPE INITIATION" to "OWNER-SCOPE-INITIATION"');
    }
    
    console.log(`GameStateManager: extractSpaceName method completed with result: "${result}"`);
    return result;
  }
  
  // Find a space by ID - now using cache
  findSpaceById(spaceId) {
    console.log('GameStateManager: findSpaceById method is being used');
    
    // Look in cache first
    const space = this.spaceCache.byId.get(spaceId);
    
    // Fallback to old method if not in cache
    if (!space) {
      const fallbackSpace = this.spaces.find(s => s.id === spaceId);
      console.log('GameStateManager: Space not found in cache, used fallback');
      console.log('GameStateManager: findSpaceById method completed');
      return fallbackSpace;
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
    
    // Add the current space to visited spaces if not already there
    if (currentSpace) {
    const currentSpaceName = this.extractSpaceName(currentSpace.name);
    
    // Initialize visitedSpaces as Set if it's still an array (for backward compatibility)
    if (!player.visitedSpaces || Array.isArray(player.visitedSpaces)) {
    player.visitedSpaces = new Set(player.visitedSpaces || []);
    }
    
    // ALWAYS add to visited spaces - this ensures we mark it as visited when leaving
    console.log('GameStateManager: Adding current space to visited spaces before moving:', currentSpaceName);
    player.visitedSpaces.add(currentSpaceName);
      
    // Debug: Show all visited spaces after adding this one
    console.log('GameStateManager: Updated visitedSpaces:', Array.from(player.visitedSpaces));
    console.log('GameStateManager: After adding, is "OWNER-SCOPE-INITIATION" in visitedSpaces?', player.visitedSpaces.has('OWNER-SCOPE-INITIATION'));
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
          console.log('GameStateManager: Invalid time value in space', currentSpace.name, ':', currentSpace.Time);
          timeToAdd = 0;
        }
      }
      
      // Add time to player's counter
      if (timeToAdd > 0) {
        console.log('GameStateManager: Adding', timeToAdd, 'days to player time when leaving', currentSpace.name);
        player.resources.time += timeToAdd;
      }
    }
    
    // Get information about the space being moved to - now using cache
    const newSpace = this.findSpaceById(spaceId);
    if (!newSpace) {
      console.log('GameStateManager: movePlayer - Destination space not found', spaceId);
      return;
    }
    
    console.log('GameStateManager: Moving to space:', newSpace.name, 'Type:', newSpace.type);
    
    // Set new position
    player.position = spaceId;
    
    // Add the space to visited spaces
    // Extract just the space name, without the visit type
    const spaceName = this.extractSpaceName(newSpace.name);
    
    // Initialize visitedSpaces as Set if it's still an array
    if (!player.visitedSpaces || Array.isArray(player.visitedSpaces)) {
      player.visitedSpaces = new Set(player.visitedSpaces || []);
    }
    
    console.log('GameStateManager: Adding', spaceName, 'to visited spaces');
    
    // Add to visited spaces if not already there
    if (!player.visitedSpaces.has(spaceName)) {
      player.visitedSpaces.add(spaceName);
      console.log('GameStateManager: Updated visited spaces');
    } else {
      console.log('GameStateManager: Space already in visited list, not adding again');
    }
    
    // Check if this is the finish space
    if (newSpace.type === 'END') {
      console.log('GameStateManager: Player reached END space, game completed');
      this.gameEnded = true;
    }
    
    // Update space visit types based on player's visit history
    this.updateSpaceVisitTypes();
    
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
  
  // Check if player has visited a space before - now using Set
  hasPlayerVisitedSpace(player, spaceName) {
    console.log('GameStateManager: hasPlayerVisitedSpace method is being used');
    console.log('GameStateManager: Checking space:', spaceName, 'Player:', player.name, 'ID:', player.id);
    
    // Handle both Set and Array for backward compatibility
    if (!player.visitedSpaces) {
      player.visitedSpaces = new Set();
      console.log('GameStateManager: Created new visitedSpaces Set');
    } else if (Array.isArray(player.visitedSpaces)) {
      // Convert array to Set if needed
      console.log('GameStateManager: Converting visitedSpaces from Array to Set');
      player.visitedSpaces = new Set(player.visitedSpaces);
    }
    
    const normalizedSpaceName = this.extractSpaceName(spaceName);
    console.log('GameStateManager: Original space name:', spaceName, 'Normalized name:', normalizedSpaceName);
    
    // Debug logging to help diagnose visit type issues
    console.log('GameStateManager: Player position:', player.position, 'Previous position:', player.previousPosition);
    console.log('GameStateManager: Player visited spaces:', Array.from(player.visitedSpaces));
    
    // Special case: When a player is first placed on a space (like at game start),
    // they haven't really "visited" it yet - they're just starting there
    if (player.visitedSpaces.size === 0) {
      console.log('GameStateManager: First move in game, treating as first visit');
      return false;
    }
    
    // Check which spaces the player has in their visited set
    console.log('GameStateManager: Is "OWNER-SCOPE-INITIATION" in visitedSpaces?', player.visitedSpaces.has('OWNER-SCOPE-INITIATION'));
    
    // SIMPLIFIED LOGIC: If the space name is in the visitedSpaces set, the player has visited it
    // Also check if current position matches this space - that means we're there now and have visited
    const hasVisited = player.visitedSpaces.has(normalizedSpaceName);
    const currentSpace = this.findSpaceById(player.position);
    const currentSpaceName = currentSpace ? this.extractSpaceName(currentSpace.name) : null;
    const isCurrentSpace = currentSpaceName === normalizedSpaceName;
    
    // Check if this was the previous space as a special case
    if (!hasVisited && player.previousPosition) {
      const previousSpace = this.findSpaceById(player.previousPosition);
      if (previousSpace && this.extractSpaceName(previousSpace.name) === normalizedSpaceName) {
        console.log('GameStateManager: This was the player\'s previous space - treating as visited');
        return true;
      }
    }
    
    // Special case: If OWNER-SCOPE-INITIATION or OWNER-FUND-INITIATION is visited,
    // we know the player has passed through them at the start of the game
    if (normalizedSpaceName === 'OWNER-SCOPE-INITIATION' || normalizedSpaceName === 'OWNER-FUND-INITIATION') {
      if (player.visitedSpaces.size > 0) {
        console.log('GameStateManager: Special case - player has likely visited starting space');
        return true;
      }
    }
    
    console.log('GameStateManager: Space name "' + normalizedSpaceName + '" in visitedSpaces Set?', hasVisited);
    console.log('GameStateManager: isCurrentSpace?', isCurrentSpace);
    console.log('GameStateManager: All visitedSpaces:', Array.from(player.visitedSpaces));
    console.log('GameStateManager: hasPlayerVisitedSpace method completed with result:', hasVisited);
    
    return hasVisited || isCurrentSpace;
  }
  
  // Find a space by name - now using cache
  findSpaceByName(name) {
    console.log('GameStateManager: findSpaceByName method is being used');
    
    if (!name) return null;
    
    // Try exact match from cache first
    let match = this.spaceCache.byName.get(name);
    
    // If no exact match, try normalized name lookup
    if (!match) {
      const normalizedName = this.extractSpaceName(name);
      const spaces = this.spaceCache.byNormalizedName.get(normalizedName);
      
      // If we have spaces with this normalized name, return the first one
      if (spaces && spaces.length > 0) {
        match = spaces[0];
      }
    }
    
    // Fallback to old method if cache fails
    if (!match) {
      const cleanedName = this.extractSpaceName(name);
      match = this.spaces.find(s => this.extractSpaceName(s.name) === cleanedName);
    }
    
    console.log('GameStateManager: findSpaceByName method completed');
    return match;
  }
  
  // Get available moves for current player - Using MoveLogic utility
  getAvailableMoves() {
    console.log('GameStateManager: getAvailableMoves method is being used');
    
    // Step 1: Get the current player
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('GameStateManager: No current player found');
      return [];
    }
    
    // Step 2: Delegate to MoveLogic utility
    const moves = window.MoveLogic.getAvailableMoves(this, currentPlayer);
    
    console.log('GameStateManager: getAvailableMoves method completed');
    return moves;
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
        gameStarted: this.gameStarted,
        gameEnded: this.gameEnded
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
        started: this.gameStarted,
        ended: this.gameEnded
      }));
    } catch (error) {
      console.error('GameStateManager: Error saving state:', error);
    }
    
    console.log('GameStateManager: saveState method completed');
  }
  
  // Load state from localStorage
  loadSavedState() {
    console.log('GameStateManager: loadSavedState method is being used');
    
    try {
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
        this.gameStarted = false; // Still let PlayerSetup handle this
        this.gameEnded = savedState.gameEnded || false;
        
        console.log('GameStateManager: Loaded from consolidated storage format');
      } else {
        // Fall back to legacy format
        this.loadLegacySavedState();
      }
    } catch (error) {
      console.error('GameStateManager: Error loading saved state:', error);
      // Fallback to legacy format
      this.loadLegacySavedState();
    }
    
    console.log('GameStateManager: loadSavedState method completed');
  }
  
  // Legacy loader for backward compatibility
  loadLegacySavedState() {
    console.log('GameStateManager: loadLegacySavedState method is being used');
    
    try {
      const savedPlayers = localStorage.getItem('game_players');
      const savedCurrentPlayer = localStorage.getItem('game_currentPlayer');
      const savedStatus = localStorage.getItem('game_status');
      
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
        this.gameStarted = false; // Let PlayerSetup handle this
        this.gameEnded = status.ended || false;
      }
      
      console.log('GameStateManager: Loaded from legacy storage format');
    } catch (error) {
      console.error('GameStateManager: Error loading legacy saved state:', error);
      // Reset to defaults if all else fails
      this.resetState();
    }
    
    console.log('GameStateManager: loadLegacySavedState method completed');
  }
  
  // Reset state to defaults
  resetState() {
    console.log('GameStateManager: resetState method is being used');
    
    this.players = [];
    this.currentPlayerIndex = 0;
    this.gameStarted = false;
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
  
  // Draw a card of the specified type
  drawCard(playerId, cardType) {
    console.log('GameStateManager: drawCard method is being used');
    
    // Validate inputs
    if (!playerId || !cardType || !this.cardCollections[cardType]) {
      console.error('GameStateManager: Invalid parameters for drawCard');
      return null;
    }
    
    // Find the player
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      console.error('GameStateManager: Player not found for drawing card');
      return null;
    }
    
    // Check if there are cards available
    if (this.cardCollections[cardType].length === 0) {
      console.log(`GameStateManager: No ${cardType} cards available to draw`);
      return null;
    }
    
    // Draw a random card
    const randomIndex = Math.floor(Math.random() * this.cardCollections[cardType].length);
    const drawnCard = { ...this.cardCollections[cardType][randomIndex] };
    
    // Add a unique ID and card type to the card
    drawnCard.id = `${cardType}-card-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    drawnCard.type = cardType;
    
    // Add the card to the player's hand
    if (!player.cards) {
      player.cards = [];
    }
    player.cards.push(drawnCard);
    
    // Save the updated state
    this.saveState();
    
    // Dispatch event
    this.dispatchEvent('cardDrawn', {
      playerId: playerId,
      player: player,
      cardType: cardType,
      card: drawnCard
    });
    
    console.log(`GameStateManager: Player ${player.name} drew a ${cardType} card`);
    
    // Return the drawn card for UI feedback
    console.log('GameStateManager: drawCard method completed');
    return drawnCard;
  }
  
  // Play a card from a player's hand
  playCard(playerId, cardId) {
    console.log('GameStateManager: playCard method is being used');
    
    // Validate inputs
    if (!playerId || !cardId) {
      console.error('GameStateManager: Invalid parameters for playCard');
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
    const playedCard = { ...player.cards[cardIndex] };
    player.cards.splice(cardIndex, 1);
    
    // Save the updated state
    this.saveState();
    
    // Dispatch event
    this.dispatchEvent('cardPlayed', {
      playerId: playerId,
      player: player,
      card: playedCard
    });
    
    console.log(`GameStateManager: Player ${player.name} played a ${playedCard.type} card`);
    
    // Return the played card for effects processing
    console.log('GameStateManager: playCard method completed');
    return playedCard;
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
    this.gameStarted = false;
    this.gameEnded = false;
    this.clearSavedState();
    
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
      const normalizedName = this.extractSpaceName(space.name);
      if (!visitTypeMap.has(normalizedName)) {
        const hasVisited = this.hasPlayerVisitedSpace(currentPlayer, normalizedName);
        visitTypeMap.set(normalizedName, hasVisited ? 'subsequent' : 'first');
        console.log(`GameStateManager: Space ${normalizedName} - hasVisited: ${hasVisited}, visitType: ${hasVisited ? 'subsequent' : 'first'}`);
      }
    });
    
    // Second pass: update the visitType property of every space
    let updatedCount = 0;
    this.spaces.forEach(space => {
      const normalizedName = this.extractSpaceName(space.name);
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
}

// Create instance and export
window.GameStateManager = new GameStateManager();

// For backward compatibility, maintain GameState reference
window.GameState = window.GameStateManager;

console.log('GameStateManager.js code execution finished');