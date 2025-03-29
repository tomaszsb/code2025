// GameBoard component - Main controller component
console.log('GameBoard.js file is being processed');

window.GameBoard = class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    
    // Create a ref to the DiceRoll component
    this.diceRollRef = React.createRef();
    
    this.state = {
      players: GameState.players || [],
      currentPlayerIndex: GameState.currentPlayerIndex || 0,
      spaces: GameState.spaces || [],
      selectedSpace: null,
      availableMoves: [],
      showInstructions: false,
      instructionsData: null,
      hasSelectedMove: false,  // Track if player has selected a move this turn
      showDiceRoll: false,     // Flag to show/hide dice roll component
      diceRollSpace: null,     // Space data for dice rolling
      diceRollVisitType: null, // Visit type for dice rolling
      diceRollData: window.diceRollData || [] // Dice roll outcome data from CSV
    };
  }
  
  componentDidMount() {
    // Update available moves
    this.updateAvailableMoves();
    
    // Load instructions data from the START space
    this.loadInstructionsData();
    
    console.log("GameBoard mounted successfully");
  }
  
  // Load instructions data from the START space
  loadInstructionsData = () => {
    const { spaces } = this.state;
    
    // Find the START - Quick play guide spaces (first and subsequent)
    const firstVisitInstructionsSpace = spaces.find(space => {
      return space.name && space.name.includes('START - Quick play guide') && 
             space.id && space.id.toLowerCase().includes('first');
    });
    
    const subsequentVisitInstructionsSpace = spaces.find(space => {
      return space.name && space.name.includes('START - Quick play guide') && 
             space.id && space.id.toLowerCase().includes('subsequent');
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
    const result = GameState.getAvailableMoves();
    
    // Check if the result indicates that a dice roll is needed
    if (result && typeof result === 'object' && result.requiresDiceRoll) {
      console.log('GameBoard: Dice roll required for this space');
      
      // Store the space info and show dice roll component
      this.setState({ 
        showDiceRoll: true, 
        diceRollSpace: result.spaceName,
        diceRollVisitType: result.visitType,
        availableMoves: []
      });
    } else {
      // Normal case - array of available moves
      this.setState({ 
        availableMoves: result, 
        showDiceRoll: false,
        diceRollSpace: null,
        diceRollVisitType: null
      });
      console.log('Available moves updated:', result.length, 'moves available');
    }
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
      hasSelectedMove: false,  // Reset flag for the next player's turn
      showDiceRoll: false,     // Hide dice roll component
      diceRollSpace: null      // Clear dice roll space info
    });
    
    // Update available moves for new player
    this.updateAvailableMoves();
    
    console.log('Turn ended, next player:', GameState.currentPlayerIndex);
  }

  // Handle dice roll completion
  handleDiceRollComplete = (result, outcomes) => {
    console.log('GameBoard: Dice roll completed with result:', result);
    console.log('GameBoard: Outcomes:', outcomes);
    
    // If outcomes include available moves, update state
    if (outcomes.moves && outcomes.moves.length > 0) {
      this.setState({ 
        availableMoves: outcomes.moves,
        hasSelectedMove: false  // Allow player to select a move from dice outcomes
      });
    } else {
      // No valid moves from dice roll
      this.setState({ 
        availableMoves: [],
        hasSelectedMove: true   // Force player to end turn since no valid moves
      });
    }
  }
  
  // Handle move selection from dice roll outcomes
  handleDiceRollMoveSelect = (space) => {
    console.log('GameBoard: Move selected from dice roll outcomes:', space.name);
    
    // Get current player and move them to the selected space
    const currentPlayer = GameState.getCurrentPlayer();
    GameState.movePlayer(currentPlayer.id, space.id);
    
    // Update state
    this.setState({
      players: [...GameState.players],
      selectedSpace: space.id,
      hasSelectedMove: true,  // Player has performed their move
      showDiceRoll: false     // Hide dice roll component
    });
    
    // Update available moves after move is complete
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
    
    // Use GameState's function to check if player has visited this space before
    const hasVisited = GameState.hasPlayerVisitedSpace(currentPlayer, selectedSpace.name);
    return !hasVisited;
  }
  
  // Handle roll dice button click
  handleRollDiceClick = () => {
    // First try to use the selected space
    const selectedSpace = this.getSelectedSpace();
    let spaceName;
    let visitType;
    let spaceId;
    
    if (selectedSpace && selectedSpace.name) {
      // If a space is selected, use it
      spaceName = selectedSpace.name;
      visitType = selectedSpace.visitType || (this.isVisitingFirstTime() ? 'first' : 'subsequent');
      spaceId = selectedSpace.id;
    } else {
      // If no space is selected, use the current player's position
      const currentPlayer = this.getCurrentPlayer();
      if (currentPlayer) {
        spaceId = currentPlayer.position;
        const currentSpace = this.state.spaces.find(s => s.id === spaceId);
        if (currentSpace) {
          spaceName = currentSpace.name;
          visitType = currentSpace.visitType || 'first';
          console.log('GameBoard: Using current player position for dice roll:', spaceName, 'Visit type:', visitType);
        } else {
          // Fallback only if we can't find the current space
          spaceName = "ARCH-INITIATION";
          visitType = 'first';
          console.log('GameBoard: Falling back to ARCH-INITIATION for dice roll');
        }
      } else {
        // Fallback if no current player
        spaceName = "ARCH-INITIATION";
        visitType = 'first';
      }
    }
    
    // Make sure we always have a valid visit type
    if (!visitType || (visitType !== 'first' && visitType !== 'subsequent')) {
      // Extract visit type from ID as a last resort
      if (spaceId && (spaceId.endsWith('-first') || spaceId.includes('-first-'))) {
        visitType = 'first';
      } else if (spaceId && (spaceId.endsWith('-subsequent') || spaceId.includes('-subsequent-'))) {
        visitType = 'subsequent';
      } else {
        // Final fallback
        visitType = 'first';
      }
    }
    
    // Show the dice roll component
    this.setState({
      showDiceRoll: true,
      diceRollSpace: spaceName,
      diceRollVisitType: visitType
    });
    
    console.log('GameBoard: Showing dice roll for', spaceName, visitType);
  }
  
  render() {
    const { 
      players, spaces, currentPlayerIndex,
      selectedSpace, availableMoves, showDiceRoll,
      diceRollSpace, diceRollVisitType, diceRollData
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
            {/* Game board with available moves highlighted */}
            <BoardDisplay 
              spaces={spaces}
              players={players}
              selectedSpace={selectedSpace}
              availableMoves={availableMoves}
              onSpaceClick={this.handleSpaceClick}
              diceRollData={diceRollData}
            />
          </div>
        </div>
        
        {/* Dice Roll component - show when active */}
        {showDiceRoll && (
          <div className="dice-roll-wrapper">
            <DiceRoll
              visible={true}
              space={{ name: diceRollSpace }}
              visitType={diceRollVisitType}
              diceData={diceRollData}
              onRollComplete={this.handleDiceRollComplete}
              onMoveSelect={this.handleDiceRollMoveSelect}
              ref={this.diceRollRef}
            />
          </div>
        )}
        
        <div className="game-controls">
          {/* Always show Roll Dice button */}
          {!showDiceRoll && (
            <button 
              onClick={this.handleRollDiceClick}
              className="roll-dice-btn"
            >
              Roll Dice
            </button>
          )}
          
          {/* End Turn button */}
          <button 
            onClick={this.handleEndTurn}
            disabled={!currentPlayer || (!this.state.hasSelectedMove && !showDiceRoll)}
            className="end-turn-btn"
          >
            End Turn
          </button>
          
          {/* Game instructions button */}
          <button
            onClick={this.toggleInstructions}
            className="instructions-btn"
          >
            Game Instructions
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