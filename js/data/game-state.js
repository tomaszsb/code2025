// Game state management
const GameState = {
  players: [],
  currentPlayerIndex: 0,
  spaces: [],
  gameStarted: false,
  gameEnded: false,
  
  // Initialize the game
  initialize(spacesData) {
    console.log('GameState.initialize called with', spacesData.length, 'spaces');
    
    this.spaces = spacesData.map(row => {
      const spaceObj = {
        id: row['Space Name'].replace(/\s+/g, '-').toLowerCase(),
        name: row['Space Name'],
        type: row['Phase'],
        description: row['Event'],
        nextSpaces: [
          row['Space 1'], 
          row['Space 2'], 
          row['Space 3'],
          row['Space 4'],
          row['Space 5']
        ].filter(s => s && s.trim() !== '')
      };
      return spaceObj;
    });
    
    console.log('Spaces processed, now loading saved state');
    this.loadSavedState();
    console.log('State after initialization:', {
      gameStarted: this.gameStarted,
      players: this.players, 
      currentPlayerIndex: this.currentPlayerIndex
    });
  },
  
  // Create a new player
  addPlayer(name, color) {
    const id = `player-${this.players.length + 1}`;
    this.players.push({
      id,
      name,
      color,
      position: this.spaces[0]?.id || 'start',
      resources: {
        money: 1000, // Starting money
        time: 0      // Starting time (days)
      }
    });
    this.saveState();
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
      this.saveState();
    }
  },
  
  // Get available moves for current player
  getAvailableMoves() {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return [];
    
    const currentSpace = this.spaces.find(s => s.id === currentPlayer.position);
    if (!currentSpace) return [];
    
    return currentSpace.nextSpaces
      .map(spaceName => this.spaces.find(s => s.name === spaceName))
      .filter(space => space); // Remove undefined spaces
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
    console.log('loadSavedState called');
    try {
      const savedPlayers = localStorage.getItem('game_players');
      const savedCurrentPlayer = localStorage.getItem('game_currentPlayer');
      const savedStatus = localStorage.getItem('game_status');
      
      console.log('Raw localStorage values:', {
        savedPlayers,
        savedCurrentPlayer,
        savedStatus
      });
      
      if (savedPlayers) {
        console.log('Parsing saved players');
        this.players = JSON.parse(savedPlayers);
        console.log('Players loaded:', this.players.length);
      } else {
        console.log('No saved players found');
      }
      
      if (savedCurrentPlayer) {
        console.log('Setting current player index');
        this.currentPlayerIndex = parseInt(savedCurrentPlayer);
      }
      
      if (savedStatus) {
        console.log('Parsing game status');
        const status = JSON.parse(savedStatus);
        console.log('Loaded status:', status);
        this.gameStarted = status.started;
        this.gameEnded = status.ended;
      } else {
        console.log('No saved game status found');
        // Force gameStarted to false if no status is found
        this.gameStarted = false;
      }
      
      console.log('Final state after loading:', {
        gameStarted: this.gameStarted,
        playerCount: this.players.length,
        currentPlayerIndex: this.currentPlayerIndex
      });
    } catch (error) {
      console.error('Error loading saved game:', error);
      // Continue with default state if load fails
      // Force gameStarted to false on error
      this.gameStarted = false;
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