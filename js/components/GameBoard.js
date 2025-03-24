// GameBoard component - Main controller component
class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSetup: !GameState.gameStarted,
      players: GameState.players,
      currentPlayerIndex: GameState.currentPlayerIndex,
      spaces: GameState.spaces,
      selectedSpace: null,
      availableMoves: []
    };
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
    const { 
      showSetup, players, spaces, currentPlayerIndex,
      selectedSpace, availableMoves
    } = this.state;
    
    // Show setup screen if needed
    if (showSetup) {
      return <PlayerSetup onSetupComplete={this.handleSetupComplete} />;
    }
    
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