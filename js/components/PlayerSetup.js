// PlayerSetup.js file is beginning to be used
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
      showSetupForm: !hasSavedGame, // Don't show setup form initially if there's a saved game
      animationPhase: 'intro' // Track animation phases: intro, form, starting
    };
  }
  
  componentDidMount() {
    // Add animation phase transitions
    setTimeout(() => {
      this.setState({ animationPhase: this.state.showSetupForm ? 'form' : 'intro' });
    }, 500);
  }
  
  // Check if a saved game exists
  checkForSavedGame = () => {
    try {
      // Use the new consolidated format first
      const savedStateJson = localStorage.getItem('gameState');
      if (savedStateJson) {
        const savedState = JSON.parse(savedStateJson);
        return savedState.players && savedState.players.length > 0 && savedState.gameStarted === true;
      }
      
      // Fallback to legacy format
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
    this.setState({ animationPhase: 'starting' });
    
    // Check if GameStateManager is properly initialized before accessing gameStarted
    if (window.GameStateManager && window.GameStateManager.isProperlyInitialized) {
      // No need to modify GameState, it already loaded the saved state
      // But we need to ensure gameStarted is true
      if (!window.GameStateManager.gameStarted) {
        // This shouldn't happen normally, but just in case
        console.log('Game started flag was false, setting to true');
        window.GameStateManager.gameStarted = true;
        window.GameStateManager.saveState();
      }
    } else {
      console.log('GameStateManager not yet initialized, setting gameStarted will be handled later');
    }
    
    // Add slight delay for animation
    setTimeout(() => {
      // Notify parent component if provided
      if (this.props.onSetupComplete) {
        this.props.onSetupComplete();
      }
    }, 800);
  }
  
  // Handle starting a new game
  handleStartNewGame = () => {
    console.log('Starting new game');
    // Clear saved game data and show the setup form
    if (window.GameStateManager) {
      window.GameStateManager.startNewGame();
    }
    this.setState({ 
      hasSavedGame: false,
      showSetupForm: true,
      animationPhase: 'form' 
    });
  }
  
  handlePlayerCountChange = (e) => {
    const count = parseInt(e.target.value);
    this.setState(prevState => {
      // Adjust arrays to match new count
      const names = [...prevState.playerNames];
      const colors = [...prevState.playerColors];
      
      // Default colors - more vibrant options
      const defaultColors = [
        '#FF5733', // Coral
        '#33FF57', // Lime Green
        '#3357FF', // Royal Blue
        '#F3FF33', // Yellow
        '#FF33F3', // Magenta
        '#33FFF3'  // Cyan
      ];
      
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
    
    // Set animation phase first
    this.setState({ animationPhase: 'starting' });
    
    // Create players - startNewGame() was already called when choosing "Start New Game"
    this.state.playerNames.forEach((name, index) => {
      if (window.GameStateManager) {
        window.GameStateManager.addPlayer(name, this.state.playerColors[index]);
      }
    });
    
    // Add slight delay for animation
    setTimeout(() => {
      // Notify parent component if provided
      if (this.props.onSetupComplete) {
        this.props.onSetupComplete();
      }
    }, 800);
  }
  
  // Render player color preview
  renderPlayerColorPreview = (color, index) => {
    return (
      <div 
        className="player-color-preview"
        style={{
          backgroundColor: color,
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          marginRight: '8px',
          border: '2px solid #ccc'
        }}
      >
      </div>
    );
  }
  
  render() {
    const { playerCount, playerNames, playerColors, error, hasSavedGame, showSetupForm, animationPhase } = this.state;
    
    const containerClass = `player-setup-container ${animationPhase}-phase`;
    
    return (
      <div className={containerClass}>
        <div className="player-setup-content">
          <div className="game-logo-container">
            <img 
              src="graphics/My ChatGPT image.png" 
              alt="Project Management Game" 
              className="game-logo"
            />
            <h1 className="game-title">Project Management Game</h1>
          </div>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}
          
          {/* Show continue or new game options if a saved game exists */}
          {hasSavedGame && !showSetupForm && (
            <div className="saved-game-options">
              <div className="info-box">
                <div className="info-icon">ℹ️</div>
                <p>A previous game was found in memory.</p>
                <p>Would you like to continue or start a new game?</p>
              </div>
              
              <div className="game-option-buttons">
                <button onClick={this.handleContinueGame} className="continue-game-btn">
                  <span className="btn-icon">▶️</span> Continue Game
                </button>
                <button onClick={this.handleStartNewGame} className="new-game-btn">
                  <span className="btn-icon">🔄</span> Start New Game
                </button>
              </div>
            </div>
          )}
          
          {/* Show the regular setup form if no saved game or if starting a new game */}
          {showSetupForm && (
            <form onSubmit={this.handleSubmit} className="player-setup-form">
              <div className="form-group player-count-selector">
                <label htmlFor="player-count">Number of Players:</label>
                <div className="custom-select-wrapper">
                  <select 
                    id="player-count"
                    value={playerCount} 
                    onChange={this.handlePlayerCountChange}
                    className="player-count-select"
                  >
                    <option value="1">1 Player</option>
                    <option value="2">2 Players</option>
                    <option value="3">3 Players</option>
                    <option value="4">4 Players</option>
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>
              
              <div className="player-list">
                {Array.from({ length: playerCount }).map((_, index) => (
                  <div key={index} className="player-entry">
                    <div className="player-number">{index + 1}</div>
                    <div className="player-form-fields">
                      <div className="player-name-input">
                        <input
                          type="text"
                          value={playerNames[index]}
                          onChange={(e) => this.handleNameChange(index, e)}
                          placeholder={`Player ${index + 1} Name`}
                          className="name-input"
                        />
                      </div>
                      <div className="player-color-input">
                        {this.renderPlayerColorPreview(playerColors[index], index)}
                        <input
                          type="color"
                          value={playerColors[index]}
                          onChange={(e) => this.handleColorChange(index, e)}
                          className="color-picker"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button type="submit" className="start-game-btn">
                <span className="btn-icon">🚀</span> Start Game
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
}

// Add log statement at the end of execution
console.log('PlayerSetup.js execution complete');
