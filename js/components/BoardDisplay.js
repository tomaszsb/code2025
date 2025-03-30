// BoardDisplay component
console.log('BoardDisplay.js file is beginning to be used');

window.BoardDisplay = class BoardDisplay extends React.Component {
  constructor(props) {
    super(props);
    
    // Set up state to track the current player
    this.state = {
      currentPlayerIndex: window.GameState.currentPlayerIndex
    };
  }
  
  componentDidMount() {
    // Add an event listener to detect changes in the game state
    window.addEventListener('gameStateUpdated', this.handleGameStateUpdate);
  }
  
  componentWillUnmount() {
    // Clean up event listener when component unmounts
    window.removeEventListener('gameStateUpdated', this.handleGameStateUpdate);
  }
  
  // Handle updates to the game state (like player turns changing)
  handleGameStateUpdate = () => {
    // Check if the current player has changed
    if (this.state.currentPlayerIndex !== window.GameState.currentPlayerIndex) {
      this.setState({
        currentPlayerIndex: window.GameState.currentPlayerIndex
      });
      console.log('BoardDisplay: Current player changed, refreshing board');
    }
  }
  // Get move details for display
  getMoveDetails = (space) => {
    return window.MoveLogic.getMoveDetails(space);
  }

  // Check if a space has dice roll options
  hasDiceRollOptions = (space) => {
    const { diceRollData } = this.props;
    if (!diceRollData || diceRollData.length === 0 || !space) return false;
    
    // Check if there are entries for this space in the dice roll data
    return diceRollData.some(data => data['Space Name'] === space.name);
  }

  renderSpace = (space, index) => {
    const { players, selectedSpace, selectedMove, onSpaceClick, availableMoves, diceRollData } = this.props;
    
    // Find players on this space
    const playersOnSpace = players.filter(player => player.position === space.id);
    
    // Check if this space is an available move
    const isAvailableMove = availableMoves.some(move => move.id === space.id);
    
    // Check if this is the selected destination for the current turn
    const isSelectedMove = selectedMove === space.id;
    
    // Check if this space has dice roll options
    const hasDiceRoll = this.hasDiceRollOptions(space);
    
    // Determine CSS classes
    const classes = ['board-space'];
    if (space.type) classes.push(`space-type-${space.type.toLowerCase()}`);
    if (selectedSpace === space.id) classes.push('selected');
    if (isAvailableMove) classes.push('available-move');
    if (isSelectedMove) classes.push('selected-move enlarged'); // Add enlarged class for selected moves
    if (hasDiceRoll) classes.push('has-dice-roll');
    
    // Format the visit type text
    const visitTypeText = space.visitType ? 
      (space.visitType.toLowerCase() === 'first' ? 'First Visit' : 'Subsequent Visit') : '';
    
    return (
      <div 
        key={space.id} 
        className={classes.join(' ')}
        onClick={() => onSpaceClick && onSpaceClick(space.id)}
      >
        <div className="space-content">
          <div className="space-name">{space.name}</div>
          {visitTypeText && <div className="visit-type">{visitTypeText}</div>}
          
          {/* Show dice roll indicator */}
          {hasDiceRoll && (
            <div className="dice-roll-indicator" title="This space requires a dice roll">
              <div className="dice-icon"></div>
            </div>
          )}
          
          {/* Enhanced info for selected moves */}
          {isSelectedMove && (
            <div className="space-enhanced-info">
              <div className="enhanced-info-content">
                {/* Display time cost if available */}
                {space.Time && space.Time !== 'n/a' && (
                  <div className="enhanced-info-item">
                    <span className="enhanced-info-label">Time:</span>
                    <span className="enhanced-info-value">{space.Time}</span>
                  </div>
                )}
                
                {/* Display fee if available */}
                {space.Fee && space.Fee !== 'n/a' && (
                  <div className="enhanced-info-item">
                    <span className="enhanced-info-label">Fee:</span>
                    <span className="enhanced-info-value">{space.Fee}</span>
                  </div>
                )}
                
                {/* Display action if available */}
                {space.action && space.action !== 'n/a' && (
                  <div className="enhanced-info-item">
                    <span className="enhanced-info-label">Action:</span>
                    <span className="enhanced-info-value enhanced-action">{space.action}</span>
                  </div>
                )}
                
                {/* Cards indicators if available */}
                <div className="enhanced-info-cards">
                  {space['W Card'] && space['W Card'] !== 'n/a' && (
                    <div className="card-indicator work-card">W</div>
                  )}
                  {space['B Card'] && space['B Card'] !== 'n/a' && (
                    <div className="card-indicator business-card">B</div>
                  )}
                  {space['I Card'] && space['I Card'] !== 'n/a' && (
                    <div className="card-indicator innovation-card">I</div>
                  )}
                  {space['L card'] && space['L card'] !== 'n/a' && (
                    <div className="card-indicator leadership-card">L</div>
                  )}
                  {space['E Card'] && space['E Card'] !== 'n/a' && (
                    <div className="card-indicator environment-card">E</div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Show available move indicator with details (for non-selected moves) */}
          {isAvailableMove && !isSelectedMove && (
            <div className="move-indicator">
              <div>Available Move</div>
              {this.getMoveDetails(space) && (
                <div className="move-details">{this.getMoveDetails(space)}</div>
              )}
            </div>
          )}
        </div>
        
        {/* Player tokens */}
        {playersOnSpace.length > 0 && (
          <div className="player-tokens">
            {playersOnSpace.map(player => (
              <div 
                key={player.id}
                className="player-token"
                style={{ backgroundColor: player.color }}
                title={player.name}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Get current player from GameState
  getCurrentPlayer = () => {
    return window.GameState.getCurrentPlayer();
  }

  renderBoard = () => {
    const { spaces } = this.props;
    if (!spaces || spaces.length === 0) return null;
    
    // Get current player
    const currentPlayer = this.getCurrentPlayer();
    
    // Filter spaces based on visit history
    const filteredSpaces = [];
    const addedSpaceNames = new Set();
    
    // Process each space
    spaces.forEach(space => {
      // Skip instruction spaces
      if (space.name.includes('START - Quick play guide')) {
        return;
      }
      
      // Extract the base space name
      const spaceName = window.GameState.extractSpaceName(space.name);
      
      // Skip if we already added a space with this name
      if (addedSpaceNames.has(spaceName)) {
        return;
      }
      
      // Special handling for OWNER-SCOPE-INITIATION (starting space)
      if (spaceName === 'OWNER-SCOPE-INITIATION' || spaceName === 'OWNER SCOPE INITIATION') {
        // Check if the player is currently on this space
        const isCurrentSpace = currentPlayer && 
                               (window.GameState.extractSpaceName(
                                 spaces.find(s => s.id === currentPlayer.position)?.name || ''
                               ) === spaceName);
        
        // Log for debugging
        console.log('BoardDisplay: Processing starting space, is current space?', isCurrentSpace);
        console.log('BoardDisplay: Player position:', currentPlayer?.position);
        
        // Check if the player has visited this space before
        const hasVisited = currentPlayer && 
                          window.GameState.hasPlayerVisitedSpace(currentPlayer, spaceName);
        console.log('BoardDisplay: Starting space visited status:', hasVisited);

        // If it's the current space, show current version, otherwise show first visit
        if (isCurrentSpace) {
          // If it's the current space, use visit type from game state
          const hasVisited = currentPlayer && 
                            window.GameState.hasPlayerVisitedSpace(currentPlayer, spaceName);
          const visitType = hasVisited ? 'subsequent' : 'first';
          
          // Find the appropriate version
          const matchingSpace = spaces.find(s => 
            window.GameState.extractSpaceName(s.name) === spaceName && 
            s.visitType && s.visitType.toLowerCase() === visitType
          );
          
          if (matchingSpace) {
            filteredSpaces.push(matchingSpace);
            addedSpaceNames.add(spaceName);
          }
        } else {
          // If it's not the current space, check if player has visited it
          const hasVisited = currentPlayer && 
                         window.GameState.hasPlayerVisitedSpace(currentPlayer, spaceName);
          const visitType = hasVisited ? 'subsequent' : 'first';
          
          // Find the appropriate version based on visit history
          const appropriateSpace = spaces.find(s => 
            window.GameState.extractSpaceName(s.name) === spaceName && 
            s.visitType && s.visitType.toLowerCase() === visitType
          );
          
          if (appropriateSpace) {
            filteredSpaces.push(appropriateSpace);
            addedSpaceNames.add(spaceName);
          }
        }
        return; // Skip regular processing for this space
      }
      
      // If there's a current player, use visit history to filter
      if (currentPlayer) {
        // Always show the current player's position
        if (space.id === currentPlayer.position) {
          filteredSpaces.push(space);
          addedSpaceNames.add(spaceName);
          return;
        }
        
        // Determine if player has visited this space
        const hasVisited = window.GameState.hasPlayerVisitedSpace(currentPlayer, spaceName);
        
        // Determine required visit type
        const visitType = hasVisited ? 'subsequent' : 'first';
        
        // Check if this space matches the required visit type
        if (space.visitType && space.visitType.toLowerCase() === visitType) {
          filteredSpaces.push(space);
          addedSpaceNames.add(spaceName);
        }
      } else {
        // If no current player, show all first visit spaces
        if (space.visitType && space.visitType.toLowerCase() === 'first') {
          filteredSpaces.push(space);
          addedSpaceNames.add(spaceName);
        }
      }
    });
    
    // For the snake layout, we'll alternate directions of rows
    // Calculate an appropriate number of spaces per row based on filtered count
    const totalSpaces = filteredSpaces.length;
    const spacesPerRow = Math.min(5, Math.ceil(Math.sqrt(totalSpaces))); // Use square root for a more balanced layout
    const rows = [];
    
    // Group spaces into rows
    for (let i = 0; i < filteredSpaces.length; i += spacesPerRow) {
      const rowSpaces = filteredSpaces.slice(i, Math.min(i + spacesPerRow, filteredSpaces.length));
      rows.push(rowSpaces);
    }
    
    // Render rows with alternating directions
    return (
      <div className="game-board">
        {rows.map((rowSpaces, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`board-row ${rowIndex % 2 === 1 ? 'reverse' : ''}`}
          >
            {/* If odd row, reverse the spaces */}
            {(rowIndex % 2 === 1 ? [...rowSpaces].reverse() : rowSpaces)
              .map((space, spaceIndex) => this.renderSpace(space, rowIndex * spacesPerRow + spaceIndex))}
          </div>
        ))}
      </div>
    );
  }
  
  render() {
    return (
      <div className="board-container">
        {this.renderBoard()}
      </div>
    );
  }
}

console.log('BoardDisplay.js code execution finished');