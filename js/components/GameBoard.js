// GameBoard component - Main controller component
window.GameBoard = class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      players: GameState.players || [],
      currentPlayerIndex: GameState.currentPlayerIndex || 0,
      spaces: GameState.spaces || [],
      selectedSpace: null,
      availableMoves: []
    };
  }
  
  componentDidMount() {
    // Update available moves
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
    // For MVP, always return 'first' visit
    return true;
  }
  
  render() {
    const { 
      players, spaces, currentPlayerIndex,
      selectedSpace, availableMoves
    } = this.state;
    
    // Check if game is ended
    if (GameState.gameEnded) {
      return (
        <div className="game-container">
          <div className="game-header">
            <h1>Project Management Game</h1>
            <div className="game-end-message">Game Completed!</div>
          </div>
          <div className="game-content">
            <div className="game-end-screen">
              <h2>Congratulations!</h2>
              <p>You have completed the project management game.</p>
              <div className="player-scores">
                <h3>Final Scores:</h3>
                <ul>
                  {players.map(player => (
                    <li key={player.id}>
                      <span style={{color: player.color}}>{player.name}</span>: 
                      <strong>${player.resources.money}</strong> remaining, 
                      <strong>{player.resources.time}</strong> days spent
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => {
                  GameState.startNewGame();
                  window.location.reload();
                }}
                className="new-game-btn"
              >
                Start New Game
              </button>
            </div>
          </div>
        </div>
      );
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
              selectedSpace={selectedSpace}
              onSpaceClick={this.handleSpaceClick}
            />
          </div>
          
          <div className="right-panel">
            {/* Available moves for current player */}
            <div className="available-moves">
              <h3>Available Moves</h3>
              {availableMoves.length > 0 ? (
                <ul className="move-list">
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