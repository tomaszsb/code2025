// BoardRenderer.js file is beginning to be used
console.log('BoardRenderer.js file is beginning to be used');

// BoardRenderer component for handling all rendering logic
window.BoardRenderer = class BoardRenderer extends React.Component {
  constructor(props) {
    super(props);
    
    // Initialize movement visualization integration
    this.movementVisualization = {
      trails: new Map(),
      breadcrumbs: new Map()
    };
  }

  componentDidMount() {
    // Initialize visualization containers after component mounts
    this.initializeVisualizationContainers();
    
    // Listen for movement events to enhance visualization
    if (window.GameStateManager) {
      window.GameStateManager.addEventListener('playerMoved', this.handlePlayerMovement);
    }
  }

  componentWillUnmount() {
    // Clean up event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('playerMoved', this.handlePlayerMovement);
    }
  }

  // Initialize visualization containers for movement effects
  initializeVisualizationContainers = () => {
    const gameBoard = document.querySelector('.game-container');
    if (gameBoard && window.PlayerMovementVisualizer) {
      window.PlayerMovementVisualizer.createVisualizationContainers();
    }
  }

  // Handle player movement events for enhanced visualization
  handlePlayerMovement = (event) => {
    const { player, fromSpace, toSpace } = event.data;
    
    // Store movement data for trail rendering
    const trailId = `${player.id}-${Date.now()}`;
    this.movementVisualization.trails.set(trailId, {
      player,
      fromSpace,
      toSpace,
      timestamp: Date.now()
    });

    // Clean up old trails
    setTimeout(() => {
      this.movementVisualization.trails.delete(trailId);
    }, 5000);
  }

  render() {
    const { 
      gameBoard,
      gameEnded,
      players, 
      spaces, 
      currentPlayerIndex,
      selectedSpace, 
      selectedMove, 
      availableMoves, 
      showDiceRoll,
      diceRollSpace, 
      diceRollVisitType, 
      diceRollData,
      showCardDisplay, 
      cardDrawAnimation, 
      newCardData,
      hasRolledDice, 
      exploredSpace,
      showInstructions,
      instructionsData,
      currentPlayerOnLanding,
      currentSpaceOnLanding,
      isRollingDice
    } = this.props;
    
    // Check if game is ended
    if (gameEnded) {
      return this.renderGameEndScreen(players);
    }
    
    const currentPlayer = players[currentPlayerIndex];
    const selectedSpaceObj = spaces.find(space => space.space_name === selectedSpace);
    // Use spaceSelectionManager instead of directly calling isVisitingFirstTime from gameBoard
    const visitType = gameBoard.spaceSelectionManager.isVisitingFirstTime() ? 'first' : 'subsequent';
    
    // Calculate hasDiceRollSpace by calling the method directly - ensuring fresh evaluation
    const hasDiceRollSpace = gameBoard.diceManager.hasDiceRollSpace();
    console.log('BoardRenderer: hasDiceRollSpace evaluated to:', hasDiceRollSpace);
    
    return (
      <div className="game-container">
        <div className="game-header">
          <h1>Project Management Game</h1>
          <div className="turn-controls">
            <div className="player-turn-indicator" style={{backgroundColor: currentPlayer ? currentPlayer.color : '#f5f5f5'}}>
              {currentPlayer ? `${currentPlayer.name}'s Turn` : 'No players'}
            </div>
            {/* Game instructions button moved to header */}
            <button
              onClick={gameBoard.spaceSelectionManager.toggleInstructions}
              className="instructions-btn"
            >
              Game Instructions
            </button>
          </div>
        </div>
        
        <div className="main-content">
          {/* Game board and space explorer container */}
          <div className="board-and-explorer-container">
            {/* Game board with available moves highlighted */}
            <BoardDisplay 
              spaces={spaces}
              players={players}
              selectedSpace={selectedSpace}
              selectedMove={selectedMove}
              availableMoves={availableMoves}
              onSpaceClick={gameBoard.spaceSelectionManager.handleSpaceClick}
              diceRollData={diceRollData}
              showSpaceExplorer={true} 
            />
              
            {/* Space Explorer - Only visible when showSpaceExplorer is true */}
            {/* The showSpaceExplorer flag is toggled by GameBoard.handleCloseExplorer and GameBoard.handleOpenExplorer */}
            {this.props.showSpaceExplorer && (
              <div className="space-explorer-container">
                {window.SpaceExplorer && (() => {
                  const spaceToExplore = exploredSpace || gameBoard.spaceSelectionManager?.getSelectedSpace();
                  // Always render SpaceExplorer but with proper null handling
                  return (
                    <window.SpaceExplorer 
                      space={spaceToExplore || null}
                      visitType={exploredSpace ? 
                        (window.movementEngine && window.movementEngine.hasPlayerVisitedSpace && 
                         window.movementEngine.hasPlayerVisitedSpace(currentPlayer, exploredSpace.space_name || exploredSpace.name) ? 'subsequent' : 'first')
                        : 'first'}
                      diceRollData={diceRollData}
                      onClose={gameBoard.spaceExplorerManager?.handleCloseExplorer}
                    />
                  );
                })()}
              </div>
            )}
            
            {/* When Space Explorer is closed, show a small button to reopen it */}
            {/* Clicking this button calls GameBoard.handleOpenExplorer */}
            {!this.props.showSpaceExplorer && (
              <div className="open-explorer-container">
                <button 
                  className="open-explorer-btn"
                  onClick={gameBoard.spaceExplorerManager.handleOpenExplorer}
                  title="Show space details"
                >
                  Show Explorer
                </button>
              </div>
            )}
          </div>
            
          <div className="info-panels-container">
            {/* Static Player Status display - left column */}
            <div className="player-panel">
              <StaticPlayerStatus 
                player={currentPlayerOnLanding}
                space={currentSpaceOnLanding}
                currentPlayerColor={currentPlayer ? currentPlayer.color : '#ccc'}
              />
            </div>
              
            {/* Current space info - middle column */}
            <div className="player-panel middle-panel" style={{flex: '1 1 auto', minWidth: '40%'}}>
              {/* Space information with Roll Dice button added */}
              {selectedSpaceObj && (
                <SpaceInfo 
                  space={selectedSpaceObj}
                  visitType={visitType}
                  diceOutcomes={gameBoard.state.diceOutcomes}
                  diceRoll={gameBoard.state.lastDiceRoll}
                  availableMoves={availableMoves}
                  onMoveSelect={gameBoard.spaceSelectionManager.handleMoveSelection}
                  onDrawCards={gameBoard.handleDrawCards}
                  onRollDice={hasDiceRollSpace ? gameBoard.diceManager.handleRollDiceClick : null}
                  hasRolledDice={hasRolledDice}
                  hasDiceRollSpace={hasDiceRollSpace}
                  isRollingDice={gameBoard.state.isRollingDice}
                  selectedMoveId={selectedMove}
                  isLogicSpace={gameBoard.state.isLogicSpace}
                />
              )}
              {/* Debug info */}
              <div className="debug-info" style={{ display: 'none' }}>
                Dice Roll: {gameBoard.state.lastDiceRoll ? gameBoard.state.lastDiceRoll : 'None'}<br/>
                Has Outcomes: {gameBoard.state.diceOutcomes ? 'Yes' : 'No'}
              </div>
            </div>
              
            {/* Current player panel - right column */}
            <div className="player-panel">
              {/* Player status - show only current player */}
              <div className="players-list">
                {players.map((player, index) => (
                  index === currentPlayerIndex && (
                    <PlayerInfo 
                      key={player.id}
                      player={player}
                      isCurrentPlayer={true}
                      showCardDisplay={showCardDisplay}
                      onToggleCardDisplay={gameBoard.toggleCardDisplay}
                    />
                  )
                ))}
              </div>
                
              {/* Game control buttons placed at the bottom of player panel */}
              <div className="player-control-buttons">
                {/* Negotiate button */}
                <button 
                  onClick={gameBoard.turnManager.handleNegotiation}
                  className="negotiate-btn"
                  title={gameBoard.turnManager.canNegotiate() ? "Stay and skip turn (adds 1 day penalty)" : "Negotiation not available"}
                  disabled={!currentPlayer || !gameBoard.turnManager.canNegotiate()}
                >
                  Negotiate
                </button>
                  
                {/* End Turn button */}
                <button 
                  onClick={gameBoard.turnManager.handleEndTurn}
                  disabled={
                    !currentPlayer || 
                    !gameBoard.state.hasSelectedMove ||
                    (hasDiceRollSpace && !hasRolledDice)
                  }
                  className="end-turn-btn"
                >
                  End Turn
                </button>
              </div>
            </div>
          </div>
        </div>
          
        {/* Card display component */}
        {currentPlayer && gameBoard.cardDisplayRef && (
          <div className="card-display-container">
            <CardDisplay
              playerId={currentPlayer.id}
              visible={showCardDisplay}
              onCardPlayed={gameBoard.handleCardPlayed}
              onCardDiscarded={gameBoard.handleCardDiscarded}
              onWDiscardComplete={() => console.log('GameBoard: W card discard requirement completed')}
              onWReplacementComplete={() => console.log('GameBoard: W card replacement requirement completed')}
              ref={gameBoard.cardDisplayRef}
            />
          </div>
        )}
        
        {/* Dice Roll component removed - now handled directly in SpaceInfo blue button */}
        
        {/* Card draw animation */}
        {cardDrawAnimation && newCardData && newCardData.type && (
          <div className="game-card-draw-animation">
            <div className="card-animation-container">
              <div
                className="animated-card"
                style={{ borderColor: gameBoard.cardManager.getCardTypeColor(newCardData.type) }}
              >
                <div 
                  className="animated-card-header"
                  style={{ backgroundColor: gameBoard.cardManager.getCardTypeColor(newCardData.type) }}
                >
                  {gameBoard.cardManager.getCardTypeName(newCardData.type)}
                </div>
                <div className="animated-card-content">
                  {newCardData.data && newCardData.data['Work Type'] && (
                    <div className="animated-card-field">
                      {newCardData.data['Work Type']}
                    </div>
                  )}
                  {newCardData.data && newCardData.data['Job Description'] && (
                    <div className="animated-card-description">
                      {newCardData.data['Job Description']}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Game Instructions Panel */}
        {showInstructions && instructionsData && this.renderInstructionsPanel(instructionsData, gameBoard.spaceSelectionManager.toggleInstructions)}
      </div>
    );
  }

  // Render the game end screen
  renderGameEndScreen = (players) => {
    return (
      <div className="game-container">
        <div className="game-header">
          <h1>Project Management Game</h1>
          <div className="game-end-message">Game Completed!</div>
        </div>
        <div className="main-content">
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

  // Render the instructions panel
  renderInstructionsPanel = (instructionsData, toggleInstructions) => {
    return (
      <div className="instructions-panel">
        <div className="instructions-content">
          <h2>Game Instructions</h2>
          
          <div className="instruction-section">
            <h3>Getting Started</h3>
            <div className="instruction-item">
              <h4>Game Objective</h4>
              <p>Complete the project management game by navigating through various phases and managing your resources effectively.</p>
            </div>
          </div>
          
          <div className="instruction-section">
            <h3>Game Rules</h3>
            {instructionsData.first && (
              <div className="instruction-item">
                <h4>First Visit</h4>
                <p>{instructionsData.first.description || "Navigate through the board by selecting available spaces."}</p>
                {instructionsData.first.action && <p><strong>Action:</strong> {instructionsData.first.action}</p>}
                {instructionsData.first.outcome && <p><strong>Outcome:</strong> {instructionsData.first.outcome}</p>}
                {/* Only show card fields that were included in the filtered data */}
                {instructionsData.first["w_card"] && <p><strong>Work Type Card:</strong> {instructionsData.first["w_card"]}</p>}
                {instructionsData.first["b_card"] && <p><strong>Bank Card:</strong> {instructionsData.first["b_card"]}</p>}
                {instructionsData.first["i_card"] && <p><strong>Investor Card:</strong> {instructionsData.first["i_card"]}</p>}
                {instructionsData.first["l_card"] && <p><strong>Life Card:</strong> {instructionsData.first["l_card"]}</p>}
                {instructionsData.first["e_card"] && <p><strong>Expeditor Card:</strong> {instructionsData.first["e_card"]}</p>}
              </div>
            )}
            
            {instructionsData.subsequent && (
              <div className="instruction-item">
                <h4>Subsequent Visits</h4>
                <p>{instructionsData.subsequent.description || "Return to previous spaces for additional options."}</p>
                {instructionsData.subsequent.action && <p><strong>Action:</strong> {instructionsData.subsequent.action}</p>}
                {instructionsData.subsequent.outcome && <p><strong>Outcome:</strong> {instructionsData.subsequent.outcome}</p>}
                {/* Only show card fields that were included in the filtered data */}
                {instructionsData.subsequent["w_card"] && <p><strong>Work Type Card:</strong> {instructionsData.subsequent["w_card"]}</p>}
                {instructionsData.subsequent["b_card"] && <p><strong>Bank Card:</strong> {instructionsData.subsequent["b_card"]}</p>}
                {instructionsData.subsequent["i_card"] && <p><strong>Investor Card:</strong> {instructionsData.subsequent["i_card"]}</p>}
                {instructionsData.subsequent["l_card"] && <p><strong>Life Card:</strong> {instructionsData.subsequent["l_card"]}</p>}
                {instructionsData.subsequent["e_card"] && <p><strong>Expeditor Card:</strong> {instructionsData.subsequent["e_card"]}</p>}
              </div>
            )}
          </div>
          
          <div className="instruction-section">
            <h3>Card Types</h3>
            <div className="instruction-item">
              <h4>W - Work Type Cards</h4>
              <p>These cards represent different types of work you can perform.</p>
            </div>
            <div className="instruction-item">
              <h4>B - Bank Cards</h4>
              <p>These cards represent financial transactions and resources.</p>
            </div>
            <div className="instruction-item">
              <h4>I - Investor Cards</h4>
              <p>These cards provide opportunities for investment and growth.</p>
            </div>
            <div className="instruction-item">
              <h4>L - Life Cards</h4>
              <p>These cards represent life events that may impact your progress.</p>
            </div>
            <div className="instruction-item">
              <h4>E - Expeditor Cards</h4>
              <p>These cards can help speed up your progress through the game.</p>
            </div>
          </div>
          
          <button 
            className="close-instructions-btn"
            onClick={toggleInstructions}
          >
            Close Instructions
          </button>
        </div>
      </div>
    );
  }
}

console.log('BoardRenderer.js code execution finished');
