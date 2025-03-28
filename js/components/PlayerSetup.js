// PlayerSetup component
window.PlayerSetup = class PlayerSetup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerCount: 2,
      playerNames: ['Player 1', 'Player 2'],
      playerColors: ['#FF5733', '#33FF57'],
      error: null
    };
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
    
    // Create players
    GameState.startNewGame();
    this.state.playerNames.forEach((name, index) => {
      GameState.addPlayer(name, this.state.playerColors[index]);
    });
    
    // Notify parent component if provided
    if (this.props.onSetupComplete) {
      this.props.onSetupComplete();
    }
  }
  
  render() {
    const { playerCount, playerNames, playerColors, error } = this.state;
    
    return (
      <div className="player-setup">
        <h2>Player Setup</h2>
        
        {error && <div className="error">{error}</div>}
        
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
      </div>
    );
  }
}