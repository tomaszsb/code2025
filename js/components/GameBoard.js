// GameBoard component - Main controller component
console.log('GameBoard.js file is being processed');

window.GameBoard = class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      players: GameState.players || [],
      currentPlayerIndex: GameState.currentPlayerIndex || 0,
      spaces: GameState.spaces || [],
      selectedSpace: null,
      availableMoves: [],
      showInstructions: false,
      instructionsData: null,
      hasSelectedMove: false  // Track if player has selected a move this turn
    };
  }
  
  componentDidMount() {
    // Update available moves
    this.updateAvailableMoves();
    
    // Load instructions data from the START space
    this.loadInstructionsData();
  }
  
  // Load instructions data from the START space
  loadInstructionsData = () => {
    const { spaces } = this.state;
    
    // Find the START - Quick play guide spaces (first and subsequent)
    const firstVisitInstructionsSpace = spaces.find(space => {
      return space.name.includes('START - Quick play guide') && 
             space.id.toLowerCase().includes('first');
    });
    
    const subsequentVisitInstructionsSpace = spaces.find(space => {
      return space.name.includes('START - Quick play guide') && 
             space.id.toLowerCase().includes('subsequent');
    });
    
    // Log what we found for debugging
    console.log('First visit instruction space:', firstVisitInstructionsSpace);
    console.log('Subsequent visit instruction space:', subsequentVisitInstructionsSpace);
    
    if (firstVisitInstructionsSpace || subsequentVisitInstructionsSpace) {
      // Make a deep copy and ensure we have all the data fields
      // This ensures all fields from the CSV are properly preserved
      
      // Function to convert space object to instruction data
      const processInstructionSpace = (space) => {
        if (!space) return null;
        
        // Start with a clean object
        const instructionData = {};
        
        // Copy all properties from the space object
        Object.keys(space).forEach(key => {
          instructionData[key] = space[key];
        });
        
        // Get all raw fields from original CSV
        const rawFields = [
          'description', 'action', 'outcome',
          'W Card', 'B Card', 'I Card', 'L card', 'E Card',
          'Time', 'Fee', 'Space 1', 'Space 2', 'Space 3', 'Space 4', 'Space 5',
          'Negotiate'
        ];
        
        // Log all available fields in this space
        console.log(`Available fields for ${space.name}:`, Object.keys(space));
        
        return instructionData;
      };
      
      this.setState({
        instructionsData: {
          first: processInstructionSpace(firstVisitInstructionsSpace),
          subsequent: processInstructionSpace(subsequentVisitInstructionsSpace)
        }
      });
    }
  }
  // Toggle instructions panel
  toggleInstructions = () => {
    this.setState(prevState => ({
      showInstructions: !prevState.showInstructions
    }));
  }
  
  updateAvailableMoves = () => {
    const availableMoves = GameState.getAvailableMoves();
    this.setState({ availableMoves });
    console.log('Available moves updated:', availableMoves.length, 'moves available');
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
        selectedSpace: spaceId,
        hasSelectedMove: true  // Player has performed the move action
      });
      
      // Update available moves after moving
      this.updateAvailableMoves();
    } else {
      // Just select the space without moving
      this.setState({ selectedSpace: spaceId });
    }
    
    console.log('Space clicked:', spaceId, 'Is valid move:', isValidMove);
  }
  
  handleEndTurn = () => {
    // Move to next player's turn
    GameState.nextPlayerTurn();
    
    // Update state
    this.setState({
      players: [...GameState.players],
      currentPlayerIndex: GameState.currentPlayerIndex,
      selectedSpace: null,
      hasSelectedMove: false  // Reset flag for the next player's turn
    });
    
    // Update available moves for new player
    this.updateAvailableMoves();
    
    console.log('Turn ended, next player:', GameState.currentPlayerIndex);
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
    
    // Use GameState's function to check if player has visited this space before
    const hasVisited = GameState.hasPlayerVisitedSpace(currentPlayer, selectedSpace.name);
    return !hasVisited;
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
        
        <div className="game-content" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
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
            
            {/* Game instructions button */}
            <button
              onClick={this.toggleInstructions}
              className="instructions-btn"
              style={{ marginTop: '10px', width: '100%' }}
            >
              Game Instructions
            </button>
          </div>
          
          <div className="main-panel">
            {/* Game board with available moves highlighted */}
            <BoardDisplay 
              spaces={spaces}
              players={players}
              selectedSpace={selectedSpace}
              availableMoves={availableMoves}
              onSpaceClick={this.handleSpaceClick}
            />
          </div>
        </div>
        
        <div className="game-controls">
          <button 
            onClick={this.handleEndTurn}
            disabled={!currentPlayer || !this.state.hasSelectedMove}
            className="end-turn-btn"
          >
            End Turn
          </button>
        </div>
        
        {/* Instructions Panel */}
        {this.state.showInstructions && this.state.instructionsData && (
          <div className="instructions-panel">
            <div className="instructions-content">
              <h2>Game Instructions</h2>
              
              <div className="instruction-section">
                <h3>Getting Started</h3>
                
                {this.state.instructionsData.first?.description && (
                  <div className="instruction-item">
                    <h4>Description</h4>
                    <p>{this.state.instructionsData.first.description}</p>
                  </div>
                )}
                
                {this.state.instructionsData.first?.action && (
                  <div className="instruction-item">
                    <h4>Action</h4>
                    <p>{this.state.instructionsData.first.action}</p>
                  </div>
                )}
                
                {this.state.instructionsData.first?.outcome && (
                  <div className="instruction-item">
                    <h4>Outcome</h4>
                    <p>{this.state.instructionsData.first.outcome}</p>
                  </div>
                )}
                
                {/* Card-related instructions */}
                {this.state.instructionsData.first?.['W Card'] && (
                  <div className="instruction-item">
                    <h4>W Card</h4>
                    <p>{this.state.instructionsData.first['W Card']}</p>
                  </div>
                )}
                
                {this.state.instructionsData.first?.['B Card'] && (
                  <div className="instruction-item">
                    <h4>B Card</h4>
                    <p>{this.state.instructionsData.first['B Card']}</p>
                  </div>
                )}
                
                {this.state.instructionsData.first?.['I Card'] && (
                  <div className="instruction-item">
                    <h4>I Card</h4>
                    <p>{this.state.instructionsData.first['I Card']}</p>
                  </div>
                )}
                
                {this.state.instructionsData.first?.['L card'] && (
                  <div className="instruction-item">
                    <h4>L Card</h4>
                    <p>{this.state.instructionsData.first['L card']}</p>
                  </div>
                )}
                
                {this.state.instructionsData.first?.['E Card'] && (
                  <div className="instruction-item">
                    <h4>E Card</h4>
                    <p>{this.state.instructionsData.first['E Card']}</p>
                  </div>
                )}
                
                {/* Time and Fee */}
                {this.state.instructionsData.first?.Time && (
                  <div className="instruction-item">
                    <h4>Time</h4>
                    <p>{this.state.instructionsData.first.Time}</p>
                  </div>
                )}
                
                {this.state.instructionsData.first?.Fee && (
                  <div className="instruction-item">
                    <h4>Fee</h4>
                    <p>{this.state.instructionsData.first.Fee}</p>
                  </div>
                )}
              </div>
              
              <div className="instruction-section">
                <h3>Quick Play Guide</h3>
                {this.state.instructionsData.subsequent?.description && (
                  <div className="instruction-item">
                    <h4>Description</h4>
                    <p>{this.state.instructionsData.subsequent.description}</p>
                  </div>
                )}
                
                {this.state.instructionsData.subsequent?.action && (
                  <div className="instruction-item">
                    <h4>Action</h4>
                    <p>{this.state.instructionsData.subsequent.action}</p>
                  </div>
                )}
                
                {this.state.instructionsData.subsequent?.outcome && (
                  <div className="instruction-item">
                    <h4>Outcome</h4>
                    <p>{this.state.instructionsData.subsequent.outcome}</p>
                  </div>
                )}
                
                {/* Card-related instructions */}
                {this.state.instructionsData.subsequent?.['W Card'] && (
                  <div className="instruction-item">
                    <h4>W Card</h4>
                    <p>{this.state.instructionsData.subsequent['W Card']}</p>
                  </div>
                )}
                
                {this.state.instructionsData.subsequent?.['B Card'] && (
                  <div className="instruction-item">
                    <h4>B Card</h4>
                    <p>{this.state.instructionsData.subsequent['B Card']}</p>
                  </div>
                )}
                
                {this.state.instructionsData.subsequent?.['I Card'] && (
                  <div className="instruction-item">
                    <h4>I Card</h4>
                    <p>{this.state.instructionsData.subsequent['I Card']}</p>
                  </div>
                )}
                
                {this.state.instructionsData.subsequent?.['L card'] && (
                  <div className="instruction-item">
                    <h4>L Card</h4>
                    <p>{this.state.instructionsData.subsequent['L card']}</p>
                  </div>
                )}
                
                {this.state.instructionsData.subsequent?.['E Card'] && (
                  <div className="instruction-item">
                    <h4>E Card</h4>
                    <p>{this.state.instructionsData.subsequent['E Card']}</p>
                  </div>
                )}
                
                {/* Time and Fee */}
                {this.state.instructionsData.subsequent?.Time && (
                  <div className="instruction-item">
                    <h4>Time</h4>
                    <p>{this.state.instructionsData.subsequent.Time}</p>
                  </div>
                )}
                
                {this.state.instructionsData.subsequent?.Fee && (
                  <div className="instruction-item">
                    <h4>Fee</h4>
                    <p>{this.state.instructionsData.subsequent.Fee}</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={this.toggleInstructions}
                className="close-instructions-btn"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

console.log('GameBoard.js execution complete');