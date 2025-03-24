// Game state management
const GameState = {
  players: [],
  currentPlayerIndex: 0,
  spaces: [],
  gameStarted: false,
  gameEnded: false,
  
  // Initialize the game
  initialize(spacesData) {
    this.spaces = spacesData.map(row => ({
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
    }));
    
    this.loadSavedState();
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
        this.gameStarted = status.started;
        this.gameEnded = status.ended;
      }
    } catch (error) {
      console.error('Error loading saved game:', error);
      // Continue with default state if load fails
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