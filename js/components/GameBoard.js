// GameBoard component - Main controller component
class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    console.log('GameBoard constructor called');
    
    // Check if GameState is defined and accessible
    if (typeof GameState === 'undefined') {
      console.error('GameState is not defined in GameBoard constructor');
      this.state = {
        error: 'GameState not available',
        showSetup: true,
        players: [],
        currentPlayerIndex: 0,
        spaces: [],
        selectedSpace: null,
        availableMoves: []
      };
      return;
    }
    
    console.log('GameState.gameStarted:', GameState.gameStarted);
    console.log('GameState.players:', GameState.players);
    console.log('GameState.spaces:', GameState.spaces);
    
    // Always show setup for testing purposes if there are no players
    const showSetup = !GameState.gameStarted || GameState.players.length === 0;
    console.log('showSetup is set to:', showSetup);
    
    this.state = {
      showSetup: showSetup,
      players: GameState.players || [],
      currentPlayerIndex: GameState.currentPlayerIndex || 0,
      spaces: GameState.spaces || [],
      selectedSpace: null,
      availableMoves: []
    };
    
    console.log('GameBoard initial state:', this.state);
  }
  
  componentDidMount() {
    // Update available moves
    this.updateAvailableMoves();
  }
  
  handleSetupComplete = () => {
    this.setState({ 
      showSetup: false,
      players: GameState.players,
      currentPlayerIndex: GameState.currentPlayerIndex
    });
    this.updateAvailableMoves();
  }
  
  updateAvailableMoves = () => {
    const availableMoves = GameState.getAvailableMoves();
    this.setState({ availableMoves });
  }
  
  handleSpaceClick = (spaceId) => {
    // Check if this space is a valid move
    const { availableMoves } = this.state;
    const isValidMove = availableMoves.some(space => space.id === spaceId);
    
    if (isValidMove) {
      // Move the player
      const currentPlayer = GameState.getCurrentPlayer();
      GameState.movePlayer(currentPlayer.id, spaceId);
      
      // Update state
      this.setState({
        players: [...GameState.players], // Create new array to trigger re-render
        selectedSpace: spaceId
      });
    } else {
      // Just select the space without moving
      this.setState({ selectedSpace: spaceId });
    }
  }
  
  handleEndTurn = () => {
    // Move to next player's turn
    GameState.nextPlayerTurn();
    
    // Update state
    this.setState({
      players: [...GameState.players],
      currentPlayerIndex: GameState.currentPlayerIndex,
      selectedSpace: null
    });
    
    // Update available moves for new player
    this.updateAvailableMoves();
  }
  
  getSelectedSpace = () => {
    const { selectedSpace, spaces } = this.state;
    return spaces.find(space => space.id === selectedSpace);
  }
  
  getCurrentPlayer = () => {
    const { players, currentPlayerIndex } = this.state;
    return players[currentPlayerIndex];
  }
  
  isVisitingFirstTime = () => {
    const currentPlayer = this.getCurrentPlayer();
    const selectedSpace = this.getSelectedSpace();
    
    if (!currentPlayer || !selectedSpace) return true;
    
    // Check player history to see if they've been here before
    // For MVP, always return 'first' visit
    return true;
  }
  
  render() {
    console.log('GameBoard render called');
    const { 
      showSetup, players, spaces, currentPlayerIndex,
      selectedSpace, availableMoves, error
    } = this.state;
    
    console.log('GameBoard render state:', { showSetup, playerCount: players ? players.length : 0, error });
    
    // If there was an error initializing GameState
    if (error) {
      return (
        <div className="error-screen">
          <h2>Game Initialization Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    
    // Show setup screen if needed
    if (showSetup) {
      console.log('Showing PlayerSetup component');
      try {
        return <PlayerSetup onSetupComplete={this.handleSetupComplete} />;
      } catch (error) {
        console.error('Error rendering PlayerSetup:', error);
        return (
          <div className="error-screen">
            <h2>Player Setup Error</h2>
            <p>{error.message}</p>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        );
      }
    }
    
    console.log('Showing main game board');
    
    const currentPlayer = players[currentPlayerIndex];
    const selectedSpaceObj = spaces.find(space => space.id === selectedSpace);
    const visitType = this.isVisitingFirstTime() ? 'first' : 'subsequent';
    
    return (
      <div className="game-container">
        <div className="game-header">
          <h1>Project Management Game</h1>
          <div className="player-turn-indicator">
            {currentPlayer ? `${currentPlayer.name}'s Turn` : 'No players'}
          </div>
        </div>
        
        <div className="game-content">
          <div className="left-panel">
            {/* Player status for all players */}
            <div className="players-list">
              {players.map((player, index) => (
                <PlayerInfo 
                  key={player.id}
                  player={player}
                  isCurrentPlayer={index === currentPlayerIndex}
                />
              ))}
            </div>
            
            {/* Space information */}
            {selectedSpaceObj && (
              <SpaceInfo 
                space={selectedSpaceObj}
                visitType={visitType}
              />
            )}
          </div>
          
          <div className="main-panel">
            {/* Game board */}
            <BoardDisplay 
              spaces={spaces}
              players={players}
              onSpaceClick={this.handleSpaceClick}
            />
          </div>
          
          <div className="right-panel">
            {/* Available moves for current player */}
            <div className="available-moves">
              <h3>Available Moves</h3>
              {availableMoves.length > 0 ? (
                <ul>
                  {availableMoves.map(move => (
                    <li 
                      key={move.id}
                      onClick={() => this.handleSpaceClick(move.id)}
                      className="move-option"
                    >
                      {move.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No moves available</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="game-controls">
          <button 
            onClick={this.handleEndTurn}
            disabled={!currentPlayer}
            className="end-turn-btn"
          >
            End Turn
          </button>
        </div>
      </div>
    );
  }
}