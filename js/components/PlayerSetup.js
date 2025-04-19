// PlayerSetup component
console.log('PlayerSetup.js file is being processed');

window.PlayerSetup = class PlayerSetup extends React.Component {
  constructor(props) {
    super(props);
    // Check if there's a saved game
    const hasSavedGame = this.checkForSavedGame();
    
    this.state = {
      playerCount: 2,
      playerNames: ['Player 1', 'Player 2'],
      playerColors: ['#FF5733', '#33FF57'],
      error: null,
      hasSavedGame: hasSavedGame,
      showSetupForm: !hasSavedGame // Don't show setup form initially if there's a saved game
    };
  }
  
  // Check if a saved game exists
  checkForSavedGame = () => {
    try {
      const savedPlayers = localStorage.getItem('game_players');
      const savedStatus = localStorage.getItem('game_status');
      
      // Check if we have players saved and that the game was started
      if (savedPlayers && savedStatus) {
        const players = JSON.parse(savedPlayers);
        const status = JSON.parse(savedStatus);
        
        // Only consider it a valid saved game if there are players and the game was started
        return players && players.length > 0 && status.started === true;
      }
    } catch (error) {
      console.error('Error checking for saved game:', error);
    }
    
    return false;
  }
  
  // Handle continuing with the saved game
  handleContinueGame = () => {
    console.log('Continuing saved game');
    // No need to modify GameState, it already loaded the saved state
    // But we need to ensure gameStarted is true
    if (!GameState.gameStarted) {
      // This shouldn't happen normally, but just in case
      console.log('Game started flag was false, setting to true');
      GameState.gameStarted = true;
      GameState.saveState();
    }
    
    // Notify parent component if provided
    if (this.props.onSetupComplete) {
      this.props.onSetupComplete();
    }
  }
  
  // Handle starting a new game
  handleStartNewGame = () => {
    console.log('Starting new game');
    // Clear saved game data and show the setup form
    GameState.startNewGame();
    this.setState({ 
      hasSavedGame: false,
      showSetupForm: true 
    });
  }
  
  // Handle clearing memory explicitly
  handleClearMemory = () => {
    console.log('Clearing game memory');
    GameState.startNewGame();
    this.setState({ 
      hasSavedGame: false,
      showSetupForm: true 
    });
  }
  
  handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value);
    this.setState(prevState => {
      // Adjust arrays to match new count
      const names = [...prevState.playerNames];
      const colors = [...prevState.playerColors];
      
      // Default colors
      const defaultColors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF3'];
      
      while (names.length < count) {
        names.push(`Player ${names.length + 1}`);
        colors.push(defaultColors[colors.length % defaultColors.length]);
      }
      
      // Trim arrays if count decreased
      return {
        playerCount: count,
        playerNames: names.slice(0, count),
        playerColors: colors.slice(0, count)
      };
    });
  }
  
  handleNameChange = (index, e) => {
    const newNames = [...this.state.playerNames];
    newNames[index] = e.target.value;
    this.setState({ playerNames: newNames });
  }
  
  handleColorChange = (index, e) => {
    const newColors = [...this.state.playerColors];
    newColors[index] = e.target.value;
    this.setState({ playerColors: newColors });
  }
  
  handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all players have names
    const { playerNames } = this.state;
    if (playerNames.some(name => !name.trim())) {
      this.setState({ error: 'All players must have names' });
      return;
    }
    
    // Create players - startNewGame() was already called when choosing "Start New Game"
    this.state.playerNames.forEach((name, index) => {
      GameState.addPlayer(name, this.state.playerColors[index]);
    });
    
    // Notify parent component if provided
    if (this.props.onSetupComplete) {
      this.props.onSetupComplete();
    }
  }
  
  render() {
    const { playerCount, playerNames, playerColors, error, hasSavedGame, showSetupForm } = this.state;
    
    return (
      <div className="player-setup">
        <h2>Player Setup</h2>
        
        {error && <div className="error">{error}</div>}
        
        {/* Clear memory button removed - Start New Game button will handle this */}
        
        {/* Show continue or new game options if a saved game exists */}
        {hasSavedGame && !showSetupForm && (
          <div className="saved-game-options">
            <p>A previous game was found in memory.</p>
            <p>Would you like to continue or start a new game?</p>
            <div className="game-option-buttons">
              <button onClick={this.handleContinueGame} className="continue-game-btn">
                Continue Game
              </button>
              <button onClick={this.handleStartNewGame} className="new-game-btn">
                Start New Game
              </button>
            </div>
          </div>
        )}
        
        {/* Show the regular setup form if no saved game or if starting a new game */}
        {showSetupForm && (
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label>Number of Players:</label>
              <select value={playerCount} onChange={this.handlePlayerCountChange}>
                <option value="1">1 Player</option>
                <option value="2">2 Players</option>
                <option value="3">3 Players</option>
                <option value="4">4 Players</option>
              </select>
            </div>
            
            <div className="player-list">
              {Array.from({ length: playerCount }).map((_, index) => (
                <div key={index} className="player-entry">
                  <input
                    type="text"
                    value={playerNames[index]}
                    onChange={(e) => this.handleNameChange(index, e)}
                    placeholder={`Player ${index + 1} Name`}
                  />
                  <input
                    type="color"
                    value={playerColors[index]}
                    onChange={(e) => this.handleColorChange(index, e)}
                  />
                </div>
              ))}
            </div>
            
            <button type="submit" className="start-game-btn">
              Start Game
            </button>
          </form>
        )}
      </div>
    );
  }
}

// Add log statement at the end of execution
console.log('PlayerSetup.js execution complete');