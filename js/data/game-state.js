// Game state management (Simplified)
console.log('game-state.js file is being processed');

window.GameState = {
  players: [],
  currentPlayerIndex: 0,
  spaces: [],
  gameStarted: false,
  gameEnded: false,
  
  // Initialize the game
  initialize(spacesData) {
    if (!spacesData || spacesData.length === 0) {
      throw new Error('No spaces data provided or empty array!');
    }
    
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
      if (row['Negotiate']) nextSpaces.push(row['Negotiate']);
      
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
    
    this.loadSavedState();
  },
  
  // Create a new player
  addPlayer(name, color) {
    const startSpaceId = this.findStartSpaceId();
    
    const id = `player-${this.players.length + 1}`;
    this.players.push({
      id,
      name,
      color,
      position: startSpaceId,
      visitedSpaces: [], // Empty array to track spaces the player has visited
      previousPosition: null, // Track the previous position
      resources: {
        money: 1000, // Starting money
        time: 0      // Starting time (days)
      }
    });
    
    this.gameStarted = true;
    this.saveState();
  },
  
  // Find the starting space ID
  findStartSpaceId() {
    // Look for a space with OWNER-SCOPE-INITIATION in the name as the starting point
    const ownerInitSpace = this.spaces.find(s => s.name.includes('OWNER-SCOPE-INITIATION'));
    
    if (ownerInitSpace) {
      return ownerInitSpace.id;
    }
    
    // If not found, use the first non-START space in the array
    if (this.spaces.length > 0) {
      const nonStartSpace = this.spaces.find(s => !s.name.includes('START'));
      
      if (nonStartSpace) {
        return nonStartSpace.id;
      }
      
      return this.spaces[0].id;
    }
    
    // Fallback to a default value
    return 'owner-scope-initiation-first';
  },
  
  // Get current player
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  },
  
  // Move to next player's turn
  nextPlayerTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.saveState();
  },
  
  // Extract the space name from a display name (without visit type)
  extractSpaceName(displayName) {
    // For display names that might have explanatory text after a dash
    if (displayName && displayName.includes(' - ')) {
      return displayName.split(' - ')[0].trim();
    }
    return displayName;
  },
  
  // Move a player to a new space
  movePlayer(playerId, spaceId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      console.log('GameState: movePlayer - Player not found', playerId);
      return;
    }
    
    console.log('GameState: Moving player', player.name, 'to space ID:', spaceId);
    
    // Skip updating visited spaces if the player is moving to the same space
    if (player.position === spaceId) {
      console.log('GameState: Player already on this space, skipping move');
      return;
    }
    
    // Record the previous position before updating
    player.previousPosition = player.position;
    
    // Get information about the space being moved to
    const newSpace = this.spaces.find(s => s.id === spaceId);
    if (!newSpace) {
      console.log('GameState: movePlayer - Destination space not found', spaceId);
      return;
    }
    
    console.log('GameState: Moving to space:', newSpace.name, 'Type:', newSpace.type);
    
    // Set new position
    player.position = spaceId;
    
    // Add the space to visited spaces
    // Extract just the space name, without the visit type
    const spaceName = this.extractSpaceName(newSpace.name);
    
    // Initialize visitedSpaces array if it doesn't exist (for backward compatibility)
    if (!player.visitedSpaces) {
      player.visitedSpaces = [];
    }
    
    console.log('GameState: Adding', spaceName, 'to visited spaces');
    console.log('GameState: Current visited spaces:', JSON.stringify(player.visitedSpaces));
    
    // Add to visited spaces if not already there
    if (!player.visitedSpaces.includes(spaceName)) {
      player.visitedSpaces.push(spaceName);
      console.log('GameState: Updated visited spaces:', JSON.stringify(player.visitedSpaces));
    } else {
      console.log('GameState: Space already in visited list, not adding again');
    }
    
    // Check if this is the finish space
    if (newSpace.type === 'END') {
      console.log('GameState: Player reached END space, game completed');
      this.gameEnded = true;
    }
    
    this.saveState();
  },
  
  // Check if player has visited a space before
  hasPlayerVisitedSpace(player, spaceName) {
    // Initialize visitedSpaces if it doesn't exist (for backward compatibility)
    if (!player.visitedSpaces) {
      player.visitedSpaces = [];
    }
    
    const normalizedSpaceName = this.extractSpaceName(spaceName);
    
    // Debug logging to help diagnose visit type issues
    console.log('GameState: Checking if player has visited space:', normalizedSpaceName);
    console.log('GameState: Player visited spaces:', JSON.stringify(player.visitedSpaces));
    
    // Special case: When a player is first placed on a space (like at game start),
    // they haven't really "visited" it yet - they're just starting there
    if (player.visitedSpaces.length === 0) {
      console.log('GameState: First move in game, treating as first visit');
      return false;
    }
    
    // Special case: If this is the space the player just moved to (current position),
    // don't count it as 'visited' yet for determining first/subsequent visit type
    const currentSpace = this.spaces.find(s => s.id === player.position);
    if (currentSpace && this.extractSpaceName(currentSpace.name) === normalizedSpaceName) {
      const previouslyVisitedSpaces = [...player.visitedSpaces];
      // Remove the current space from the list to check if it was visited BEFORE
      const indexOfCurrent = previouslyVisitedSpaces.indexOf(normalizedSpaceName);
      if (indexOfCurrent >= 0) {
        previouslyVisitedSpaces.splice(indexOfCurrent, 1);
      }
      // Now check if it was already in the list BEFORE this turn
      const wasVisitedBefore = previouslyVisitedSpaces.includes(normalizedSpaceName);
      console.log('GameState: Player is currently on this space. Previously visited?', wasVisitedBefore);
      return wasVisitedBefore;
    }
    
    // Check if space is in the visitedSpaces array
    const hasVisited = player.visitedSpaces.includes(normalizedSpaceName);
    console.log('GameState: Has visited?', hasVisited);
    
    // For ARCH-INITIATION specifically, log extra debug info
    if (normalizedSpaceName === 'ARCH-INITIATION') {
      console.log('GameState: SPECIAL CASE - ARCH-INITIATION visit check');
      
      // Check if the player's current position is this space
      if (currentSpace && this.extractSpaceName(currentSpace.name) === normalizedSpaceName) {
        console.log('GameState: Player is currently on ARCH-INITIATION');
      }
    }
    
    return hasVisited;
  },
  
  // Find a space by name (either exact match or partial match)
  findSpaceByName(name) {
    if (!name) return null;
    
    // First try an exact match
    let match = this.spaces.find(s => s.name === name);
    
    // If no exact match, try to match the base name
    if (!match) {
      const cleanedName = this.extractSpaceName(name);
      match = this.spaces.find(s => this.extractSpaceName(s.name) === cleanedName);
    }
    
    return match;
  },
  
  // Get available moves for current player - Using MoveLogic utility
  getAvailableMoves() {
    console.log('Getting available moves...');
    
    // Step 1: Get the current player
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('No current player found');
      return [];
    }
    
    // Step 2: Delegate to MoveLogic utility
    return window.MoveLogic.getAvailableMoves(this, currentPlayer);
  },
  
  // Save state to localStorage
  saveState() {
    localStorage.setItem('game_players', JSON.stringify(this.players));
    localStorage.setItem('game_currentPlayer', this.currentPlayerIndex);
    localStorage.setItem('game_status', JSON.stringify({
      started: this.gameStarted,
      ended: this.gameEnded
    }));
  },
  
  // Load state from localStorage
  loadSavedState() {
    try {
      const savedPlayers = localStorage.getItem('game_players');
      const savedCurrentPlayer = localStorage.getItem('game_currentPlayer');
      const savedStatus = localStorage.getItem('game_status');
      
      if (savedPlayers) {
        this.players = JSON.parse(savedPlayers);
      }
      
      if (savedCurrentPlayer) {
        this.currentPlayerIndex = parseInt(savedCurrentPlayer);
      }
      
      if (savedStatus) {
        const status = JSON.parse(savedStatus);
        this.gameStarted = status.started || false;
        this.gameEnded = status.ended || false;
      }
    } catch (error) {
      // Continue with default state if load fails
      this.players = [];
      this.currentPlayerIndex = 0;
      this.gameStarted = false;
      this.gameEnded = false;
    }
  },
  
  // Clear saved state
  clearSavedState() {
    localStorage.removeItem('game_players');
    localStorage.removeItem('game_currentPlayer');
    localStorage.removeItem('game_status');
  },
  
  // Start a new game
  startNewGame() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.gameStarted = false;
    this.gameEnded = false;
    this.clearSavedState();
  }
};

console.log('game-state.js execution complete');