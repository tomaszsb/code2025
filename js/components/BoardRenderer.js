// BoardRenderer.js file is beginning to be used
console.log('BoardRenderer.js file is beginning to be used');

// BoardRenderer component for handling all rendering logic
window.BoardRenderer = class BoardRenderer extends React.Component {
  constructor(props) {
    super(props);
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
      currentSpaceOnLanding
    } = this.props;
    
    // Check if game is ended
    if (gameEnded) {
      return this.renderGameEndScreen(players);
    }
    
    const currentPlayer = players[currentPlayerIndex];
    const selectedSpaceObj = spaces.find(space => space.id === selectedSpace);
    // Use spaceSelectionManager instead of directly calling isVisitingFirstTime from gameBoard
    const visitType = gameBoard.spaceSelectionManager.isVisitingFirstTime() ? 'first' : 'subsequent';
    
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
            <button
              onClick={() => { window.GameState.startNewGame(); window.location.reload(); }}
              className="reset-game-btn"
            >
              Reset Game
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
                {window.SpaceExplorer && (
                  <window.SpaceExplorer 
                    space={exploredSpace || gameBoard.spaceSelectionManager.getSelectedSpace()}
                    visitType={exploredSpace ? 
                      (GameState.hasPlayerVisitedSpace(currentPlayer, exploredSpace.name) ? 'subsequent' : 'first')
                      : 'first'}
                    diceRollData={diceRollData}
                    onClose={gameBoard.spaceExplorerManager.handleCloseExplorer}
                  />
                )}
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
                  onMoveSelect={gameBoard.spaceSelectionManager.handleSpaceClick}
                  onDrawCards={gameBoard.handleDrawCards}
                  onRollDice={gameBoard.diceManager.handleRollDiceClick}
                  hasRolledDice={hasRolledDice}
                  hasDiceRollSpace={gameBoard.diceManager.hasDiceRollSpace()}
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
                  onClick={gameBoard.negotiationManager.handleNegotiate}
                  className="negotiate-btn"
                  title={gameBoard.negotiationManager.getNegotiateButtonTooltip()}
                  disabled={!currentPlayer || !gameBoard.negotiationManager.isNegotiationAllowed()}
                >
                  Negotiate
                </button>
                  
                {/* End Turn button */}
                <button 
                  onClick={gameBoard.turnManager.handleEndTurn}
                  disabled={
                    !currentPlayer || 
                    !gameBoard.state.hasSelectedMove ||
                    (gameBoard.diceManager.hasDiceRollSpace() && !hasRolledDice)
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
        
        {/* Dice Roll component */}
        {showDiceRoll && gameBoard.diceRollRef && (
          <div className="dice-roll-wrapper">
            <DiceRoll
              visible={true}
              space={{ name: diceRollSpace }}
              visitType={diceRollVisitType}
              diceData={diceRollData}
              onRollComplete={gameBoard.diceManager.handleDiceRollComplete}
              onMoveSelect={gameBoard.diceManager.handleDiceRollMoveSelect}
              onShowOutcomes={gameBoard.diceManager.handleDiceOutcomes}
              ref={gameBoard.diceRollRef}
            />
          </div>
        )}
        
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
                {instructionsData.first["W Card"] && <p><strong>W Card:</strong> {instructionsData.first["W Card"]}</p>}
                {instructionsData.first["B Card"] && <p><strong>B Card:</strong> {instructionsData.first["B Card"]}</p>}
                {instructionsData.first["I Card"] && <p><strong>I Card:</strong> {instructionsData.first["I Card"]}</p>}
                {instructionsData.first["L card"] && <p><strong>L Card:</strong> {instructionsData.first["L card"]}</p>}
                {instructionsData.first["E Card"] && <p><strong>E Card:</strong> {instructionsData.first["E Card"]}</p>}
              </div>
            )}
            
            {instructionsData.subsequent && (
              <div className="instruction-item">
                <h4>Subsequent Visits</h4>
                <p>{instructionsData.subsequent.description || "Return to previous spaces for additional options."}</p>
                {instructionsData.subsequent.action && <p><strong>Action:</strong> {instructionsData.subsequent.action}</p>}
                {instructionsData.subsequent.outcome && <p><strong>Outcome:</strong> {instructionsData.subsequent.outcome}</p>}
                {/* Only show card fields that were included in the filtered data */}
                {instructionsData.subsequent["W Card"] && <p><strong>W Card:</strong> {instructionsData.subsequent["W Card"]}</p>}
                {instructionsData.subsequent["B Card"] && <p><strong>B Card:</strong> {instructionsData.subsequent["B Card"]}</p>}
                {instructionsData.subsequent["I Card"] && <p><strong>I Card:</strong> {instructionsData.subsequent["I Card"]}</p>}
                {instructionsData.subsequent["L card"] && <p><strong>L Card:</strong> {instructionsData.subsequent["L card"]}</p>}
                {instructionsData.subsequent["E Card"] && <p><strong>E Card:</strong> {instructionsData.subsequent["E Card"]}</p>}
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
