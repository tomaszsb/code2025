// GameBoard component - Main controller component
console.log('GameBoard.js file is beginning to be used');

window.GameBoard = class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    
    // Create refs to components
    this.diceRollRef = React.createRef();
    this.cardDisplayRef = React.createRef();
    
    this.state = {
      players: GameState.players || [],
      currentPlayerIndex: GameState.currentPlayerIndex || 0,
      spaces: GameState.spaces || [],
      selectedSpace: null,
      selectedMove: null,      // Store selected destination without moving player
      availableMoves: [],
      showInstructions: false,
      instructionsData: null,
      hasSelectedMove: false,  // Track if player has selected a move this turn
      showDiceRoll: false,     // Flag to show/hide dice roll component
      diceRollSpace: null,     // Space data for dice rolling
      diceRollVisitType: null, // Visit type for dice rolling
      diceRollData: window.diceRollData || [], // Dice roll outcome data from CSV
      showCardDisplay: true,   // Flag to show/hide card display component
      cardDrawAnimation: false, // Flag for card draw animation
      newCardData: null,       // Data for newly drawn card
      hasRolledDice: false,     // Track if player has rolled dice this turn
      diceOutcomes: null,      // Store dice roll outcomes for display in space info
      lastDiceRoll: null       // Store last dice roll result
    };
  }
  
  // Handle drawing cards manually
  handleDrawCards = (cardType, amount) => {
    console.log('GameBoard: Drawing cards manually -', amount, cardType, 'cards');
    
    // Get the current player
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('GameBoard: No current player found');
      return;
    }
    
    // Draw the specified number of cards
    for (let i = 0; i < amount; i++) {
      const drawnCard = window.GameState.drawCard(currentPlayer.id, cardType);
      
      if (drawnCard) {
        // Trigger card draw animation
        this.setState({
          cardDrawAnimation: true,
          newCardData: {
            type: cardType,
            data: drawnCard
          }
        });
        
        // Hide animation after delay
        setTimeout(() => {
          this.setState({
            cardDrawAnimation: false,
            newCardData: null
          });
        }, 2000); // Show each card for 2 seconds
      }
    }
    
    // Update the card display component
    if (this.cardDisplayRef.current) {
      this.cardDisplayRef.current.loadPlayerCards();
    }
  }
  
  componentDidMount() {
    // Update available moves
    this.updateAvailableMoves();
    
    // Load instructions data from the START space
    this.loadInstructionsData();
    
    // Set the selected space to the current player's position
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      this.setState({
        selectedSpace: currentPlayer.position
      });
      console.log("GameBoard: Automatically selected current player's space:", currentPlayer.position);
    }
    
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
        availableMoves: [],
        hasRolledDice: false     // Reset dice roll status
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
    const currentPlayer = this.getCurrentPlayer();
    
    if (isValidMove) {
      // Don't move the player yet, just store the selected move
      // Allow player to change their mind by selecting different spaces before ending turn
      this.setState({
        // Keep selectedSpace as the current player's position to not change the space card
        selectedMove: spaceId,   // Store the destination space
        hasSelectedMove: true    // Mark that player has selected their move
      });
      
      console.log('Move selected:', spaceId, '- Will be executed on End Turn');
    } else {
      // For non-move spaces, allow inspection but return to player's space afterwards
      // Store the previous space to allow toggling back
      const previousSpace = this.state.selectedSpace;
      const isTogglingBack = spaceId === previousSpace && previousSpace !== (currentPlayer?.position || null);
      
      if (isTogglingBack && currentPlayer) {
        // If clicking again on a non-current space, return to player's current space
        this.setState({ selectedSpace: currentPlayer.position });
        console.log('Toggling back to player position:', currentPlayer.position);
      } else {
        // Just select the space for inspection without marking it as a move
        this.setState({ selectedSpace: spaceId });
      }
    }
    
    console.log('Space clicked:', spaceId, 'Is valid move:', isValidMove);
  }
  
  handleEndTurn = () => {
    const { selectedMove } = this.state;
    const currentPlayer = GameState.getCurrentPlayer();
    
    // If a move was selected, execute it now when ending the turn
    if (selectedMove && currentPlayer) {
      console.log('Executing selected move:', selectedMove);
      GameState.movePlayer(currentPlayer.id, selectedMove);
    }
    
    // Move to next player's turn
    GameState.nextPlayerTurn();
    
    // Get the new current player
    const newCurrentPlayer = GameState.getCurrentPlayer();
    const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
    
    // Update state
    this.setState({
    players: [...GameState.players],
    currentPlayerIndex: GameState.currentPlayerIndex,
    selectedSpace: newPlayerPosition, // Set to new player's position instead of null
    selectedMove: null,               // Clear the selected move
    hasSelectedMove: false,           // Reset flag for the next player's turn
    showDiceRoll: false,              // Hide dice roll component
    diceRollSpace: null,              // Clear dice roll space info
    hasRolledDice: false,             // Reset dice roll status
    diceOutcomes: null,               // Reset dice outcomes
    lastDiceRoll: null                // Reset last dice roll
    });
    
    // Update available moves for new player
    this.updateAvailableMoves();
    
    console.log('Turn ended, next player:', GameState.currentPlayerIndex, 'on space:', newPlayerPosition);
  }

  // Handle dice roll outcomes for display in space info
  handleDiceOutcomes = (result, outcomes) => {
    console.log('GameBoard: Received dice outcomes for space info:', outcomes);
    this.setState({
      diceOutcomes: outcomes,
      lastDiceRoll: result
    });
  }

  // Handle dice roll completion
  handleDiceRollComplete = (result, outcomes) => {
    console.log('GameBoard: Dice roll completed with result:', result);
    console.log('GameBoard: Outcomes:', outcomes);
    console.log('GameBoard: Detailed outcomes:', JSON.stringify(outcomes));
    
    // Get current player
    const currentPlayer = this.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Update the diceOutcomes and lastDiceRoll state for SpaceInfo component
    this.setState({
      diceOutcomes: outcomes,
      lastDiceRoll: result,
      // Ensure we're showing the current player's space info
      selectedSpace: currentPosition
    });
    
    // Hide the dice roll component after completion
    this.setState({ 
      showDiceRoll: false,
      hasRolledDice: true  // Mark that player has rolled dice
    });
    
    // If outcomes include available moves, update state
    if (outcomes.moves && outcomes.moves.length > 0) {
      console.log('GameBoard: Available moves from dice roll:', outcomes.moves.map(m => m.name).join(', '));
      this.setState({ 
        availableMoves: outcomes.moves,
        hasSelectedMove: false,  // Allow player to select a move from dice outcomes
        selectedMove: null,      // Clear any previously selected move
        // Keep selectedSpace as the current player's position
        selectedSpace: currentPosition
      });
    } else {
      // No valid moves from dice roll - but if we already have available moves, keep them
      // This allows the player to still select from the available moves after rolling dice
      // for spaces that only have card/fee/time outcomes from dice rolls
      if (this.state.availableMoves && this.state.availableMoves.length > 0) {
        console.log('GameBoard: No moves from dice roll, but keeping existing available moves:', 
                   this.state.availableMoves.map(m => m.name).join(', '));
        // Just keep existing available moves and don't reset hasSelectedMove
        if (this.state.hasSelectedMove && this.state.selectedMove) {
          console.log('GameBoard: Player already selected a move:', this.state.selectedMove);
        }
      } else {
        console.log('GameBoard: No valid moves available from dice roll');
        this.setState({ 
          availableMoves: [],
          hasSelectedMove: true,   // Force player to end turn since no valid moves
          selectedMove: null       // Clear any previously selected move
        });
      }
    }
    
    // Check if dice roll should trigger card draw
    // Get the current player - reuse the one we got earlier
    if (currentPlayer) {
      // Check for card outcomes based on roll result
      const cardTypes = ['W', 'B', 'I', 'L', 'E'];
      
      for (const cardType of cardTypes) {
        const cardOutcome = outcomes[`${cardType}CardOutcome`];
        
        if (cardOutcome && cardOutcome !== 'n/a' && cardOutcome !== '0') {
          // Parse the outcome to determine number of cards to draw
          const cardCount = parseInt(cardOutcome) || 1;
          
          // Draw the specified number of cards
          for (let i = 0; i < cardCount; i++) {
            const drawnCard = window.GameState.drawCard(currentPlayer.id, cardType);
            
            if (drawnCard) {
              // Trigger card draw animation
              this.setState({
                cardDrawAnimation: true,
                newCardData: {
                  type: cardType,
                  data: drawnCard
                }
              });
              
              // Hide animation after delay
              setTimeout(() => {
                this.setState({
                  cardDrawAnimation: false,
                  newCardData: null
                });
              }, 2000);
            }
          }
        }
      }
    }
  }
  
  // Handle move selection from dice roll outcomes
  handleDiceRollMoveSelect = (space) => {
    console.log('GameBoard: Move selected from dice roll outcomes:', space.name);
    
    // Get current player position to maintain correct space card
    const currentPlayer = this.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Don't move the player immediately, just store the selection
    // Update state
    this.setState({
      selectedSpace: currentPosition, // Keep showing current player's space info
      selectedMove: space.id,        // Store the selected move to be executed on End Turn
      hasSelectedMove: true,         // Player has selected their move
      showDiceRoll: false            // Hide dice roll component
    });
    
    console.log('GameBoard: Dice roll move selected:', space.id, '- Will be executed on End Turn');
  }
  
  // Handle card played by player
  handleCardPlayed = (card) => {
    console.log('GameBoard: Card played:', card);
    
    // Get current player
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;
    
    // Process card effects based on type
    switch (card.type) {
      case 'W': // Work Type card
        // Example: Work Type cards might provide money
        if (card['Estimated Job Costs']) {
          const amount = parseInt(card['Estimated Job Costs']) || 0;
          currentPlayer.resources.money += amount;
          console.log(`Player earned $${amount} from Work Type card`);
        }
        break;
        
      case 'B': // Bank card
        // Bank cards might have different effects
        break;
        
      case 'I': // Investor card
        // Investor cards might reduce time
        currentPlayer.resources.time -= 5;
        if (currentPlayer.resources.time < 0) currentPlayer.resources.time = 0;
        break;
        
      // Add case handlers for other card types
      
      default:
        console.log('Unknown card type:', card.type);
    }
    
    // Update players to reflect changes
    this.setState({
      players: [...GameState.players]
    });
    
    // Save game state
    GameState.saveState();
  }
  
  // Handle card discarded by player
  handleCardDiscarded = (card) => {
    console.log('GameBoard: Card discarded:', card);
    // No specific actions needed for discarded cards currently
  }
  
  // Toggle card display visibility
  toggleCardDisplay = () => {
    this.setState(prevState => ({
      showCardDisplay: !prevState.showCardDisplay
    }));
  }
  
  // Check if the current space requires a dice roll
  hasDiceRollSpace = () => {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return false;
    
    // If we've already rolled dice this turn, we don't need to roll again
    if (this.state.hasRolledDice) return false;
    
    // Check if the current space has a dice roll in the CSV data
    const currentSpaceId = currentPlayer.position;
    const currentSpace = this.state.spaces.find(s => s.id === currentSpaceId);
    if (!currentSpace) return false;
    
    // Use the same logic as in the BoardDisplay component
    return this.state.diceRollData.some(data => data['Space Name'] === currentSpace.name);
  }
  
  getSelectedSpace = () => {
    const { selectedSpace, spaces } = this.state;
    const space = spaces.find(space => space.id === selectedSpace);
    console.log('GameBoard: Getting selected space for info display:', space?.name || 'None');
    return space;
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
    }, () => {
      // After setState completes, use the ref to call rollDice on the DiceRoll component
      if (this.diceRollRef.current) {
        console.log('GameBoard: Automatically rolling dice after showing component');
        // Add a small delay to ensure the component is fully rendered
        setTimeout(() => {
          this.diceRollRef.current.rollDice();
        }, 100);
      }
    });
    
    console.log('GameBoard: Showing dice roll for', spaceName, visitType);
  }
  
  // Get color for card type
  getCardTypeColor = (cardType) => {
    switch (cardType) {
      case 'W': return '#4285f4'; // Blue for Work Type
      case 'B': return '#ea4335'; // Red for Bank
      case 'I': return '#fbbc05'; // Yellow for Investor
      case 'L': return '#34a853'; // Green for Life
      case 'E': return '#8e44ad'; // Purple for Expeditor
      default: return '#777777';  // Gray for unknown
    }
  }
  
  // Get full name for card type
  getCardTypeName = (cardType) => {
    switch (cardType) {
      case 'W': return 'Work Type';
      case 'B': return 'Bank';
      case 'I': return 'Investor';
      case 'L': return 'Life';
      case 'E': return 'Expeditor';
      default: return 'Unknown';
    }
  }
  
  render() {
    const { 
      players, spaces, currentPlayerIndex,
      selectedSpace, selectedMove, availableMoves, showDiceRoll,
      diceRollSpace, diceRollVisitType, diceRollData,
      showCardDisplay, cardDrawAnimation, newCardData,
      hasRolledDice
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
            
            {/* Card display component */}
            {currentPlayer && showCardDisplay && (
              <CardDisplay
                playerId={currentPlayer.id}
                visible={true}
                onCardPlayed={this.handleCardPlayed}
                onCardDiscarded={this.handleCardDiscarded}
                ref={this.cardDisplayRef}
              />
            )}
            
            {/* Space information */}
            {selectedSpaceObj && (
              <SpaceInfo 
                space={selectedSpaceObj}
                visitType={visitType}
                diceOutcomes={this.state.diceOutcomes}
                diceRoll={this.state.lastDiceRoll}
                availableMoves={availableMoves}
                onMoveSelect={this.handleSpaceClick}
                onDrawCards={this.handleDrawCards}
              />
            )}
            {/* Debug info */}
            <div className="debug-info" style={{ display: 'none' }}>
              Dice Roll: {this.state.lastDiceRoll ? this.state.lastDiceRoll : 'None'}<br/>
              Has Outcomes: {this.state.diceOutcomes ? 'Yes' : 'No'}
            </div>
          </div>
          
          <div className="main-panel">
            {/* Game board with available moves highlighted */}
            <BoardDisplay 
              spaces={spaces}
              players={players}
              selectedSpace={selectedSpace}
              selectedMove={this.state.selectedMove}  // Pass the selected move to BoardDisplay
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
              onShowOutcomes={this.handleDiceOutcomes}
              ref={this.diceRollRef}
            />
          </div>
        )}
        
        <div className="game-controls">
          {/* Roll Dice Button - gray out if space doesn't have dice roll data */}
          {!showDiceRoll && (
            <button 
              onClick={this.handleRollDiceClick}
              className={`roll-dice-btn ${this.hasDiceRollSpace() ? '' : 'disabled'}`}
              disabled={!this.hasDiceRollSpace()}
              title={this.hasDiceRollSpace() ? 'Roll dice for this space' : 'This space doesn\'t require a dice roll'}
            >
              Roll Dice
            </button>
          )}
          
          {/* End Turn button */}
          <button 
            onClick={this.handleEndTurn}
            disabled={
              !currentPlayer || 
              // Player must select a move
              !this.state.hasSelectedMove ||
              // If dice roll is visible or was required (space icon shows), they must have rolled
              (this.hasDiceRollSpace() && !hasRolledDice)
            }
            className="end-turn-btn"
          >
            End Turn
          </button>
          
          {/* Toggle Cards button */}
          <button
            onClick={this.toggleCardDisplay}
            className="toggle-cards-btn"
          >
            {showCardDisplay ? 'Hide Cards' : 'Show Cards'}
          </button>
          
          {/* Game instructions button */}
          <button
            onClick={this.toggleInstructions}
            className="instructions-btn"
          >
            Game Instructions
          </button>
        </div>
        
        {/* Card draw animation */}
        {cardDrawAnimation && newCardData && (
          <div className="game-card-draw-animation">
            <div className="card-animation-container">
              <div
                className="animated-card"
                style={{ borderColor: this.getCardTypeColor(newCardData.type) }}
              >
                <div 
                  className="animated-card-header"
                  style={{ backgroundColor: this.getCardTypeColor(newCardData.type) }}
                >
                  {this.getCardTypeName(newCardData.type)}
                </div>
                <div className="animated-card-content">
                  {newCardData.data['Work Type'] && (
                    <div className="animated-card-field">
                      {newCardData.data['Work Type']}
                    </div>
                  )}
                  {newCardData.data['Job Description'] && (
                    <div className="animated-card-description">
                      {newCardData.data['Job Description']}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

console.log('GameBoard.js code execution finished');
