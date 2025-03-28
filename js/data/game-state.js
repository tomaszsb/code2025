// Game state management (Simplified)
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
      const normalizedId = spaceName
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      
      // Extract next spaces
      let nextSpaces = [];
      if (row['Space 1']) nextSpaces.push(row['Space 1']);
      if (row['Space 2']) nextSpaces.push(row['Space 2']);
      if (row['Space 3']) nextSpaces.push(row['Space 3']);
      
      // Filter out empty or invalid spaces
      nextSpaces = nextSpaces
        .filter(s => s && s.trim() !== '' && s !== 'n/a')
        .map(spaceName => {
          // Handle cases where there are explanations after the space name
          const parts = spaceName.split('-');
          return parts[0].trim();
        });
      
      const spaceObj = {
        id: normalizedId,
        name: spaceName,
        type: (row['Phase'] || 'Default').toUpperCase(),
        description: row['Event'] || '',
        nextSpaces: nextSpaces,
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
    // First look for a space with 'start' in the ID
    const startSpace = this.spaces.find(s => s.id.includes('start'));
    if (startSpace) {
      return startSpace.id;
    }
    
    // If not found, use the first space in the array
    if (this.spaces.length > 0) {
      return this.spaces[0].id;
    }
    
    // Fallback to a default value
    return 'start';
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
  
  // Move a player to a new space
  movePlayer(playerId, spaceId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.position = spaceId;
      
      // Check if this is the finish space
      const space = this.spaces.find(s => s.id === spaceId);
      if (space && space.type === 'END') {
        this.gameEnded = true;
      }
      
      this.saveState();
    }
  },
  
  // Get available moves for current player
  getAvailableMoves() {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return [];
    }
    
    const currentSpace = this.spaces.find(s => s.id === currentPlayer.position);
    if (!currentSpace) {
      return [];
    }
    
    // For simplicity, just return the next spaces directly
    const availableMoves = currentSpace.nextSpaces
      .map(spaceName => {
        // Try to find by exact name first
        let space = this.spaces.find(s => s.name === spaceName);
        
        // If not found, try to find by partial match
        if (!space) {
          space = this.spaces.find(s => s.name.includes(spaceName));
        }
        
        return space;
      })
      .filter(space => space); // Remove undefined spaces
    
    return availableMoves;
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