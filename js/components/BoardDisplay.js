// BoardDisplay component
console.log('BoardDisplay.js file is beginning to be used');

// StaticPlayerStatus component - shows player status on space landing
class StaticPlayerStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerStatus: null,
      spaceInfo: null
    };
  }
  
  componentDidMount() {
    // Capture the initial player status and space info when landing on a space
    this.capturePlayerStatus();
  }
  
  componentDidUpdate(prevProps) {
    // Update the static status when the player changes or a new turn begins
    if (prevProps.player?.id !== this.props.player?.id || 
        prevProps.space?.id !== this.props.space?.id) {
      this.capturePlayerStatus();
    }
  }
  
  capturePlayerStatus() {
    const { player, space } = this.props;
    if (!player || !space) return;
    
    // Create a snapshot of the player's status
    this.setState({
      playerStatus: {
        name: player.name,
        color: player.color,
        money: player.resources?.money || 0,
        time: player.resources?.time || 0,
        position: player.position,
        // Get a snapshot of the scope items
        scope: this.extractScope(player)
      },
      spaceInfo: {
        name: space.name,
        type: space.type,
        description: space.description,
        action: space.action,
        time: space.Time,
        fee: space.Fee
      }
    });
    
    console.log('StaticPlayerStatus: Captured player status on space landing', 
                this.state.playerStatus, this.state.spaceInfo);
  }
  
  // Extract scope information from player's W cards (copied from PlayerInfo)
  extractScope(player) {
    if (!player || !player.cards) {
      return [];
    }
    
    // Filter W cards only
    const wCards = player.cards ? player.cards.filter(card => card.type === 'W') : [];
    
    // Extract work type and estimated cost from each W card
    const scope = wCards.map(card => ({
      workType: card['Work Type'] || 'Unknown',
      estimatedCost: card['Estimated Job Costs'] || 'N/A'
    }));
    
    // Calculate total estimated cost
    let totalCost = 0;
    scope.forEach(item => {
      // Parse cost to number if possible
      const cost = parseFloat(item.estimatedCost);
      if (!isNaN(cost)) {
        totalCost += cost;
      }
    });
    
    return {
      items: scope,
      totalCost: totalCost
    };
  }
  
  render() {
    const { playerStatus, spaceInfo } = this.state;
    
    if (!playerStatus || !spaceInfo) {
      return (
        <div className="static-player-status empty" style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9em',
          fontStyle: 'italic',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          Player status will be displayed here after the first turn.
        </div>
      );
    }
    
    // Style for the container
    const containerStyle = {
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: '#f5f5f5',
      border: `2px solid ${playerStatus.color}`,
      marginBottom: '10px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    };
    
    // Style for the header
    const headerStyle = {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      borderBottom: '1px solid #ddd',
      paddingBottom: '8px'
    };
    
    // Style for the color indicator
    const colorIndicatorStyle = {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: playerStatus.color,
      marginRight: '10px',
      border: '2px solid white',
      boxShadow: `0 0 5px ${playerStatus.color}`
    };
    
    // Style for the section title
    const sectionTitleStyle = {
      fontSize: '0.9em',
      fontWeight: 'bold',
      marginTop: '10px',
      marginBottom: '5px',
      color: '#444'
    };
    
    // Style for resource items
    const resourceItemStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 8px',
      backgroundColor: 'white',
      borderRadius: '4px',
      marginBottom: '4px',
      fontSize: '0.85em'
    };
    
    return (
      <div className="static-player-status" style={containerStyle}>
        <div style={headerStyle}>
          <div style={colorIndicatorStyle}></div>
          <div>
            <strong>{playerStatus.name}'s Status When Landing</strong>
            <div style={{ fontSize: '0.8em', color: '#666' }}>
              Space: {spaceInfo.name}
            </div>
          </div>
        </div>
        
        <div style={sectionTitleStyle}>Resources:</div>
        <div className="status-resources">
          <div style={resourceItemStyle}>
            <span>Money:</span>
            <span>${playerStatus.money}</span>
          </div>
          <div style={resourceItemStyle}>
            <span>Time:</span>
            <span>{playerStatus.time} days</span>
          </div>
        </div>
        
        <div style={sectionTitleStyle}>Space Effect:</div>
        {spaceInfo.action && (
          <div style={resourceItemStyle}>
            <span>Action:</span>
            <span>{spaceInfo.action}</span>
          </div>
        )}
        {spaceInfo.time && spaceInfo.time !== 'n/a' && (
          <div style={resourceItemStyle}>
            <span>Time Cost:</span>
            <span>{spaceInfo.time}</span>
          </div>
        )}
        {spaceInfo.fee && spaceInfo.fee !== 'n/a' && (
          <div style={resourceItemStyle}>
            <span>Fee:</span>
            <span>{spaceInfo.fee}</span>
          </div>
        )}
        
        <div style={sectionTitleStyle}>Scope:</div>
        {playerStatus.scope && playerStatus.scope.items && playerStatus.scope.items.length > 0 ? (
          <div style={{ fontSize: '0.85em', backgroundColor: 'white', padding: '5px', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px', borderBottom: '1px solid #eee' }}>Work Type</th>
                  <th style={{ textAlign: 'right', padding: '4px', borderBottom: '1px solid #eee' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {playerStatus.scope.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '3px 4px', borderBottom: '1px solid #f5f5f5' }}>{item.workType}</td>
                    <td style={{ textAlign: 'right', padding: '3px 4px', borderBottom: '1px solid #f5f5f5' }}>
                      ${typeof item.estimatedCost === 'number' ? 
                        item.estimatedCost.toLocaleString() : 
                        isNaN(parseFloat(item.estimatedCost)) ? 
                          item.estimatedCost : 
                          parseFloat(item.estimatedCost).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '3px 4px', fontWeight: 'bold', borderTop: '1px solid #ddd' }}>TOTAL</td>
                  <td style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 'bold', borderTop: '1px solid #ddd' }}>
                    ${playerStatus.scope.totalCost.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={resourceItemStyle}>
            <em style={{ width: '100%', textAlign: 'center', color: '#777', fontSize: '0.85em' }}>
              No scope items yet
            </em>
          </div>
        )}
      </div>
    );
  }
}

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
    
    // Apply compact styling to board spaces
    this.applyCompactBoardStyling();
    
    // Also update styling when window is resized
    window.addEventListener('resize', this.applyCompactBoardStyling);
  }
  
  componentWillUnmount() {
    // Clean up event listeners when component unmounts
    window.removeEventListener('gameStateUpdated', this.handleGameStateUpdate);
    window.removeEventListener('resize', this.applyCompactBoardStyling);
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
    // Calculate an appropriate number of spaces per row based on filtered count and screen width
    const totalSpaces = filteredSpaces.length;
    
    // Get container width to calculate optimal spaces per row
    // We'll use a higher number of spaces per row to reduce white space and make the board wider
    const containerWidth = document.querySelector('.board-container')?.clientWidth || window.innerWidth * 0.95;
    const spaceWidth = 80; // Target even smaller space width (was 120px in CSS)
    const spaceGap = 6; // Target smaller gap (was 15px in CSS)
    
    // Calculate how many spaces can fit in a row with the new compact sizes
    // Min of 8 to ensure we always have more spaces per row than before
    // Max based on container width calculation
    const optimalSpacesPerRow = Math.max(8, Math.floor(containerWidth / (spaceWidth + spaceGap)));
    
    // For smaller total space counts, use all available width
    // For larger counts, ensure we don't have too many or too few rows
    let spacesPerRow;
    if (totalSpaces <= 16) {
      // For small boards, just use the optimal calculation to maximize width usage
      spacesPerRow = optimalSpacesPerRow;
    } else {
      // Target approximately a square layout for larger boards
      const idealRowCount = Math.ceil(Math.sqrt(totalSpaces));
      spacesPerRow = Math.min(optimalSpacesPerRow, Math.max(8, Math.ceil(totalSpaces / idealRowCount)));
    }
    
    console.log(`BoardDisplay: Using ${spacesPerRow} spaces per row for ${totalSpaces} total spaces`);
    const rows = [];
    
    // Group spaces into rows
    for (let i = 0; i < filteredSpaces.length; i += spacesPerRow) {
      const rowSpaces = filteredSpaces.slice(i, Math.min(i + spacesPerRow, filteredSpaces.length));
      rows.push(rowSpaces);
    }
    
    // Render rows with alternating directions
    return (
      <div className="game-board full-width">
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
      <div className="board-container full-width-container">
        {this.renderBoard()}
      </div>
    );
  }

  // Apply CSS styling directly to board spaces to make them smaller without modifying CSS file
  
  // Apply compact styling to make spaces smaller and reduce white space
  applyCompactBoardStyling = () => {
    // Create dynamic style element if it doesn't exist
    let styleEl = document.getElementById('compact-board-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'compact-board-style';
      document.head.appendChild(styleEl);
    }
    
    // Define compact styles for board elements
    styleEl.innerHTML = `
      .board-space {
        width: 80px !important; /* Reduced from 120px */
        height: 70px !important; /* Reduced from 100px */
        padding: 5px !important; /* Reduced padding */
      }
      
      .game-board {
        gap: 6px !important; /* Reduced from 15px */
      }
      
      .board-row {
        gap: 6px !important; /* Reduced from 15px */
        justify-content: space-between !important; /* Distribute spaces across the width */
        width: 100% !important;
      }
      
      /* Adjust positioning of elements inside spaces */
      .player-tokens {
        bottom: 3px !important;
        left: 3px !important;
      }
      
      .player-token {
        width: 14px !important;
        height: 14px !important;
      }
      
      /* Make board container use full width */
      .board-container {
        width: 98% !important;
        padding: 5px !important;
        margin: 0 auto !important;
        min-height: unset !important; /* Remove min-height constraint */
      }
      
      .full-width-container {
        max-width: none !important;
        width: 98% !important;
      }
      
      /* Fix parent containers to reduce white space */
      .game-content, .main-content {
        margin: 0 !important;
        padding: 0 !important;
        min-height: unset !important;
        overflow: visible !important;
      }
      
      /* Adjust overall game container */
      .game-container {
        padding: 0 !important;
        height: auto !important;
        min-height: unset !important;
      }
      
      /* Adjust info panels to reduce vertical space */
      .info-panels-container {
        height: auto !important;
        min-height: unset !important;
        margin: 5px 0 !important;
      }
      
      /* Ensure game board uses full width */
      .game-board.full-width {
        width: 100% !important;
        justify-content: center !important;
      }
      
      /* Additional fixes for top and bottom white space */
      .game-header {
        padding: 5px 0 !important;
        margin: 0 !important;
      }
      
      /* Reduce space below the board */
      .current-space-container, .space-info-container {
        padding: 5px !important;
        margin: 5px 0 !important;
      }
      
      /* Adjust height of footer elements */
      .game-controls {
        padding: 5px 0 !important;
        margin: 5px 0 !important;
      }
      
      /* Remove margin from body */
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Make text smaller to fit in smaller spaces */
      .space-name {
        font-size: 10px !important;
        margin-bottom: 3px !important;
      }
      
      .visit-type {
        font-size: 8px !important;
      }
      
      /* Style the static player status */
      .static-player-status {
        margin-bottom: 10px !important;
        max-height: 300px !important;
        overflow-y: auto !important;
      }
      
      /* Add flex layout to the info panels container */
      .info-panels-container {
        display: flex !important;
        flex-direction: row !important;
        gap: 10px !important;
        align-items: stretch !important; /* Make all columns stretch to the same height */
      }
      
      /* Split the space info and static player status */
      .current-space-container, 
      .player-static-status-container,
      .player-panel {
        display: flex !important;
        flex-direction: column !important;
        overflow-y: auto !important;
        background-color: white !important;
        border-radius: 8px !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Set column widths */
      .current-space-container {
        flex: 2 !important;
      }
      
      .player-static-status-container {
        width: 250px !important;
        min-width: 220px !important;
        max-width: 250px !important;
        flex: 1 !important;
      }
      
      .player-panel {
        width: 280px !important;
        min-width: 250px !important;
      }
      
      /* Remove unnecessary margins and padding */
      .main-content, .game-content, .board-container {
        margin: 5px !important;
      }
    `;
    
    console.log('BoardDisplay: Applied compact styling to reduce white space');
  }
}

// Export StaticPlayerStatus component for use in other files
window.StaticPlayerStatus = StaticPlayerStatus;

console.log('BoardDisplay.js code execution finished');