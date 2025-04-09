// GameBoard.js file is beginning to be used
console.log('GameBoard.js file is beginning to be used');

// SpaceExplorer component for displaying details of spaces when exploring the board
class SpaceExplorer extends React.Component {
  renderDiceTable() {
    const { space, diceRollData } = this.props;
    
    if (!space || !diceRollData) return null;
    
    // Filter dice roll data for the current space
    const spaceDiceData = diceRollData.filter(data => 
      data['Space Name'] === space.name
    );
    
    if (spaceDiceData.length === 0) return null;
    
    // Log data for debugging
    console.log('Space Explorer: Found dice data for space:', space.name);
    console.log('Space Explorer: Dice data:', spaceDiceData);
    
    return (
      <div className="explorer-dice-section">
        <h4>Dice Roll Outcomes:</h4>
        <div className="explorer-dice-table-container">
          <table className="explorer-dice-table">
            <thead>
              <tr>
                <th>Roll</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map(roll => {
                // Find the dice data for this roll
                const rollData = spaceDiceData.find(data => {
                  // Try different ways to match the dice value
                  const diceValue = data['Dice Value'] || data['Roll'] || data['Value'];
                  return diceValue && parseInt(diceValue) === roll;
                });
                
                // If no data for this roll, show N/A
                if (!rollData) {
                  return (
                    <tr key={roll}>
                      <td className="dice-roll">{roll}</td>
                      <td className="dice-outcome">N/A</td>
                    </tr>
                  );
                }
                
                // Get the outcome text - examine all fields to find relevant outcomes
                let outcomeText = '';
                const outcomeFields = [];
                
                // Log each entry's keys for debugging
                console.log(`Dice roll ${roll} data fields:`, Object.keys(rollData));
                
                // Check for move/next step outcomes (highest priority)
                if (rollData['Next Step'] && rollData['Next Step'] !== 'n/a') {
                  outcomeFields.push(`<span class="outcome-move">Move to: ${rollData['Next Step']}</span>`);
                }
                
                // Check for explicit Outcome field
                if (rollData['Outcome'] && rollData['Outcome'] !== 'n/a') {
                  outcomeFields.push(`<span class="outcome-general">${rollData['Outcome']}</span>`);
                }
                
                // Check for card outcomes
                ['W', 'B', 'I', 'L', 'E'].forEach(cardType => {
                  // Try different possible field names for card outcomes
                  const cardOutcome = 
                    rollData[`${cardType} Card`] || 
                    rollData[`${cardType} Cards`] || 
                    rollData[`${cardType}Card`] || 
                    rollData[`${cardType}Cards`] || 
                    rollData[`${cardType}CardOutcome`];
                  
                  if (cardOutcome && cardOutcome !== 'n/a' && cardOutcome !== '0') {
                    const cardName = {
                      'W': 'Work Card',
                      'B': 'Bank Card',
                      'I': 'Investor Card',
                      'L': 'Life Card',
                      'E': 'Expeditor Card'
                    }[cardType];
                    
                    outcomeFields.push(`<span class="outcome-card">${cardName}: ${cardOutcome}</span>`);
                  }
                });
                
                // Check for resource outcomes
                if (rollData['Fee'] && rollData['Fee'] !== 'n/a') {
                  outcomeFields.push(`<span class="outcome-resource">Fee: ${rollData['Fee']}</span>`);
                }
                
                if (rollData['Time'] && rollData['Time'] !== 'n/a') {
                  outcomeFields.push(`<span class="outcome-resource">Time: ${rollData['Time']}</span>`);
                }
                
                // Check for any other fields that might contain outcomes
                Object.entries(rollData).forEach(([key, value]) => {
                  // Skip fields we've already processed or that are metadata
                  const skipFields = ['Space Name', 'Dice Value', 'Roll', 'Value', 'Next Step', 'Outcome', 'Fee', 'Time'];
                  if (skipFields.includes(key) || key.includes('Card') || value === 'n/a' || value === '0') {
                    return;
                  }
                  
                  // Include any other field that looks like an outcome
                  if (value && typeof value === 'string' && value.trim() !== '') {
                    outcomeFields.push(`<span class="outcome-other">${key}: ${value}</span>`);
                  }
                });
                
                // Join all outcome fields with line breaks
                outcomeText = outcomeFields.join('<br>');
                
                // If no outcomes found, show a default message
                if (!outcomeText) {
                  outcomeText = 'No specific outcome';
                }
                
                return (
                  <tr key={roll}>
                    <td className="dice-roll">{roll}</td>
                    <td className="dice-outcome" dangerouslySetInnerHTML={{ __html: outcomeText }}></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  render() {
    const { space, visitType, onClose } = this.props;
    
    if (!space) {
      return (
        <div className="space-explorer empty">
          <div className="explorer-placeholder">
            <p>Click on any space on the board to explore details</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-explorer" data-type={space.type ? space.type.toUpperCase() : ''}>
        <div className="explorer-header">
          <h3 className="explorer-title">Space Explorer</h3>
          {onClose && (
            <button className="explorer-close-btn" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        <div className="explorer-space-name">{space.name}</div>
        <div className="explorer-visit-type">{visitType === 'first' ? 'First Visit' : 'Subsequent Visit'}</div>
        
        {/* Dice roll indicator */}
        {this.props.diceRollData && this.props.diceRollData.some(data => data['Space Name'] === space.name) && (
          <div className="explorer-dice-indicator">
            <span className="dice-icon"></span>
            <span className="dice-text">This space requires a dice roll</span>
          </div>
        )}
        
        <div className="explorer-section">
          <h4>Description:</h4>
          <div className="explorer-description">{space.description}</div>
        </div>
        
        {space.action && (
          <div className="explorer-section">
            <h4>Action:</h4>
            <div className="explorer-action">{space.action}</div>
          </div>
        )}
        
        {space.outcome && (
          <div className="explorer-section">
            <h4>Outcome:</h4>
            <div className="explorer-outcome">{space.outcome}</div>
          </div>
        )}
        
        {/* Card sections */}
        <div className="explorer-cards-section">
          {space['W Card'] && space['W Card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type work-card">W</span>
              <span className="card-text">{space['W Card']}</span>
            </div>
          )}
          
          {space['B Card'] && space['B Card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type business-card">B</span>
              <span className="card-text">{space['B Card']}</span>
            </div>
          )}
          
          {space['I Card'] && space['I Card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type innovation-card">I</span>
              <span className="card-text">{space['I Card']}</span>
            </div>
          )}
          
          {space['L card'] && space['L card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type leadership-card">L</span>
              <span className="card-text">{space['L card']}</span>
            </div>
          )}
          
          {space['E Card'] && space['E Card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type environment-card">E</span>
              <span className="card-text">{space['E Card']}</span>
            </div>
          )}
        </div>
        
        {/* Resource sections */}
        <div className="explorer-resources-section">
          {space['Time'] && space['Time'] !== 'n/a' && (
            <div className="explorer-resource-item">
              <span className="resource-label">Time:</span>
              <span className="resource-value">{space['Time']}</span>
            </div>
          )}
          
          {space['Fee'] && space['Fee'] !== 'n/a' && (
            <div className="explorer-resource-item">
              <span className="resource-label">Fee:</span>
              <span className="resource-value">{space['Fee']}</span>
            </div>
          )}
        </div>
        
        {/* Dice roll data */}
        {this.renderDiceTable()}
      </div>
    );
  }
}

// StaticPlayerStatus component for displaying player status when landing on a space
class StaticPlayerStatus extends React.Component {
  render() {
    const { player, space } = this.props;
    
    if (!player || !space) {
      return <div className="player-info empty">No player data available</div>;
    }
    
    // Define styles for the player card when it's not their turn
    const cardStyle = {
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '10px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#ffffff',
      border: '2px solid #e0e0e0'
    };
    
    // Style for player details container
    const detailsStyle = {
      flex: 1
    };
    
    // Style for resources container
    const resourcesStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '10px'
    };
    
    // Style for each resource item
    const resourceItemStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: '#f5f5f5',
      padding: '5px 10px',
      borderRadius: '4px'
    };
    
    // Style for effect sections
    const effectSectionStyle = {
      marginBottom: '10px',
      backgroundColor: '#f5f5f5',
      padding: '8px 12px',
      borderRadius: '6px'
    };
    
    // Style for effect value
    const effectValueStyle = {
      marginTop: '5px',
      wordWrap: 'break-word',
      width: '100%'
    };
    
    return (
      <div className="player-info" style={cardStyle}>
        <div className="player-details" style={detailsStyle}>
          <h3 style={{ margin: '0 0 8px 0' }}>{player.name}'s Status</h3>
          <div style={{ fontStyle: 'italic', marginBottom: '5px' }}>When Landing</div>
          <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>Space: {space.name}</div>
          
          <div style={resourcesStyle}>
            <div className="resource" style={resourceItemStyle}>
              <span className="resource-label">Money:</span>
              <span className="resource-value">${player.resources.money}</span>
            </div>
            <div className="resource" style={resourceItemStyle}>
              <span className="resource-label">Time:</span>
              <span className="resource-value">{player.resources.time} days</span>
            </div>
          </div>
          
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Space Effect:</h4>
            {space.action && (
              <div style={effectSectionStyle}>
                <div style={{ fontWeight: 'bold' }}>Action:</div>
                <div style={effectValueStyle}>{space.action}</div>
              </div>
            )}
            {space.outcome && (
              <div style={effectSectionStyle}>
                <div style={{ fontWeight: 'bold' }}>Outcome:</div>
                <div style={effectValueStyle}>{space.outcome}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// GameBoard component - Main controller component
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
      showCardDisplay: false,   // Flag to show/hide card display component
      cardDrawAnimation: false, // Flag for card draw animation
      newCardData: null,       // Data for newly drawn card
      hasRolledDice: false,     // Track if player has rolled dice this turn
      diceOutcomes: null,      // Store dice roll outcomes for display in space info
      lastDiceRoll: null,       // Store last dice roll result
      currentPlayerOnLanding: null, // Store snapshot of player status upon landing
      currentSpaceOnLanding: null,   // Store snapshot of space upon landing
      exploredSpace: null,      // Store currently explored space for details panel
      showSpaceExplorer: true   // Flag set to always show space explorer panel
    };
    console.log("GameBoard: Space explorer is now always visible");
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
      // Get the current space
      const currentSpace = this.state.spaces.find(s => s.id === currentPlayer.position);
      
      // Create a deep copy of the player's status for the static view
      const playerSnapshot = {
        ...currentPlayer,
        resources: { ...currentPlayer.resources },
        cards: [...(currentPlayer.cards || [])],
        // Ensure color is consistent
        color: currentPlayer.color
      };
      
      // Create a deep copy of the space info for the static view
      const spaceSnapshot = currentSpace ? { ...currentSpace } : null;
      
      this.setState({
        selectedSpace: currentPlayer.position,
        currentPlayerOnLanding: playerSnapshot,
        currentSpaceOnLanding: spaceSnapshot,
        exploredSpace: currentSpace  // Initialize explored space to current player's position
      });
      console.log("GameBoard: Set middle column to current player's space:", currentPlayer.position);
      console.log("GameBoard: Captured initial player and space status", playerSnapshot, spaceSnapshot);
    }
    
    console.log("GameBoard mounted successfully");
    console.log("Space Explorer positioning fixed - now appears on the right side of the game board");
    console.log("Game board correctly resizes when Space Explorer is visible");
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
      // Function to convert space object to instruction data with only essential fields
      const processInstructionSpace = (space) => {
        if (!space) return null;
        
        // Start with a clean object that only includes essential fields
        const instructionData = {
          description: space.description || '',
          action: space.action || '',
          outcome: space.outcome || ''
        };
        
        // Only include non-empty card fields
        const cardFields = ['W Card', 'B Card', 'I Card', 'L card', 'E Card'];
        cardFields.forEach(field => {
          if (space[field] && space[field].trim() !== '') {
            instructionData[field] = space[field];
          }
        });
        
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
    const { availableMoves, spaces } = this.state;
    const isValidMove = availableMoves.some(space => space.id === spaceId);
    const currentPlayer = this.getCurrentPlayer();
    
    // Find the space that was clicked
    const clickedSpace = spaces.find(space => space.id === spaceId);
    
    // Always update exploredSpace to the clicked space
    // This ensures we show the correct space info in the always-visible explorer
    const exploredSpaceData = clickedSpace;
    
    // Log space explorer update (if function exists)
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(true, clickedSpace ? clickedSpace.name : 'unknown');
    }
    
    if (isValidMove) {
      // Don't move the player yet, just store the selected move
      // Allow player to change their mind by selecting different spaces before ending turn
      this.setState({
        // No longer change selectedSpace - keep it as the current player's position
        selectedMove: spaceId,   // Store the destination space
        hasSelectedMove: true,   // Mark that player has selected their move
        exploredSpace: exploredSpaceData // Set the explored space for the space explorer panel
      });
      
      console.log('Move selected:', spaceId, '- Will be executed on End Turn');
    } else {
      // For non-move spaces, we update the space explorer panel but don't change the middle column
      this.setState({
        exploredSpace: exploredSpaceData // Set the explored space for the space explorer panel
      });
      
      console.log('Space clicked for exploration:', spaceId);
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
    
    // Get the space the player landed on
    const newSpace = this.state.spaces.find(s => s.id === newPlayerPosition);
    
    // Create a deep copy of the player's status for the static view
    const playerSnapshot = newCurrentPlayer ? {
      ...newCurrentPlayer,
      resources: { ...newCurrentPlayer.resources },
      cards: [...(newCurrentPlayer.cards || [])],
      // Force the color to be the current player's color for consistent UI
      color: newCurrentPlayer.color
    } : null;
    
    // Create a deep copy of the space info for the static view
    const spaceSnapshot = newSpace ? { ...newSpace } : null;
    
    // Update state
    this.setState({
      players: [...GameState.players],
      currentPlayerIndex: GameState.currentPlayerIndex,
      selectedSpace: newPlayerPosition, // Always set to new player's position
      selectedMove: null,               // Clear the selected move
      hasSelectedMove: false,           // Reset flag for the next player's turn
      showDiceRoll: false,              // Hide dice roll component
      diceRollSpace: null,              // Clear dice roll space info
      hasRolledDice: false,             // Reset dice roll status
      diceOutcomes: null,               // Reset dice outcomes
      lastDiceRoll: null,               // Reset last dice roll
      currentPlayerOnLanding: playerSnapshot, // Store snapshot of player status
      currentSpaceOnLanding: spaceSnapshot,   // Store snapshot of space
      exploredSpace: newSpace          // Set explored space to new player's space
    });
    
    // Update available moves for new player
    this.updateAvailableMoves();
    
    console.log('Turn ended, next player:', GameState.currentPlayerIndex, 'on space:', newPlayerPosition);
    console.log('Middle column updated to show new player position:', newPlayerPosition);
  }

  // Handle negotiation button click
  handleNegotiate = () => {
    console.log('GameBoard: Negotiate button clicked');
    
    // Get the current player
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('GameBoard: No current player found');
      return;
    }
    
    // Get the current space
    const currentSpace = this.state.spaces.find(s => s.id === currentPlayer.position);
    if (!currentSpace) {
      console.log('GameBoard: Current space not found');
      return;
    }
    
    // Only record the time spent on the space
    if (currentSpace.Time && currentSpace.Time.trim() !== '') {
      const timeToAdd = parseInt(currentSpace.Time, 10) || 0;
      if (timeToAdd > 0) {
        console.log(`GameBoard: Adding ${timeToAdd} days to player time from negotiate`);
        currentPlayer.resources.time += timeToAdd;
        
        // Update GameState directly
        const playerIndex = GameState.players.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex >= 0) {
          GameState.players[playerIndex].resources.time += timeToAdd;
        }
        GameState.saveState();
      }
    }
    
    // Move to next player's turn (keep player on same space)
    GameState.nextPlayerTurn();
    
    // Get the new current player
    const newCurrentPlayer = GameState.getCurrentPlayer();
    const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
    
    // Get the space the player landed on
    const newSpace = this.state.spaces.find(s => s.id === newPlayerPosition);
    
    // Create a deep copy of the player's status for the static view
    const playerSnapshot = newCurrentPlayer ? {
      ...newCurrentPlayer,
      resources: { ...newCurrentPlayer.resources },
      cards: [...(newCurrentPlayer.cards || [])],
      // Force the color to be the current player's color for consistent UI
      color: newCurrentPlayer.color
    } : null;
    
    // Create a deep copy of the space info for the static view
    const spaceSnapshot = newSpace ? { ...newSpace } : null;
    
    // Update state
    this.setState({
      players: [...GameState.players],
      currentPlayerIndex: GameState.currentPlayerIndex,
      selectedSpace: newPlayerPosition, // Set to new player's position
      selectedMove: null,               // Clear the selected move
      hasSelectedMove: false,           // Reset flag for the next player's turn
      showDiceRoll: false,              // Hide dice roll component
      diceRollSpace: null,              // Clear dice roll space info
      hasRolledDice: false,             // Reset dice roll status
      diceOutcomes: null,               // Reset dice outcomes
      lastDiceRoll: null,               // Reset last dice roll
      currentPlayerOnLanding: playerSnapshot, // Store snapshot of player status
      currentSpaceOnLanding: spaceSnapshot,    // Store snapshot of space
      exploredSpace: newSpace          // Update space explorer to show the current player's space
    });
    
    // Update available moves for new player
    this.updateAvailableMoves();
    
    console.log('Turn ended via negotiate, next player:', GameState.currentPlayerIndex, 'on space:', newPlayerPosition);
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
    
    // Check if the dice outcome includes discarding W cards
    if (outcomes && outcomes.discardWCards && parseInt(outcomes.discardWCards) > 0) {
      const discardCount = parseInt(outcomes.discardWCards);
      console.log(`GameBoard: Dice outcome requires discarding ${discardCount} W cards`);
      
      // Trigger W card discard dialog if the CardDisplay component is available
      if (this.cardDisplayRef.current) {
        this.cardDisplayRef.current.setRequiredWDiscards(discardCount);
      }
    }
    
    // Check for "W Cards: Remove X" format
    if (outcomes && outcomes["W Cards"] && outcomes["W Cards"].includes("Remove")) {
      // Extract the number from "Remove X" format
      const matches = outcomes["W Cards"].match(/Remove\s+(\d+)/i);
      if (matches && matches[1]) {
        const discardCount = parseInt(matches[1], 10);
        console.log(`GameBoard: Dice outcome requires removing ${discardCount} W cards`);
        
        // Trigger W card discard dialog
        if (this.cardDisplayRef.current) {
          this.cardDisplayRef.current.setRequiredWDiscards(discardCount);
        }
      }
    }
    
    // Check for "W Cards: Replace X" format
    if (outcomes && outcomes["W Cards"] && outcomes["W Cards"].includes("Replace")) {
      // Extract the number from "Replace X" format
      const matches = outcomes["W Cards"].match(/Replace\s+(\d+)/i);
      if (matches && matches[1]) {
        const replaceCount = parseInt(matches[1], 10);
        console.log(`GameBoard: Dice outcome requires replacing ${replaceCount} W cards`);
        
        // Trigger W card replacement dialog
        if (this.cardDisplayRef.current && this.cardDisplayRef.current.setRequiredWReplacements) {
          this.cardDisplayRef.current.setRequiredWReplacements(replaceCount);
        }
      }
    }
    
    // Get current player
    const currentPlayer = this.getCurrentPlayer();
    const currentPosition = currentPlayer ? currentPlayer.position : null;
    
    // Update the diceOutcomes and lastDiceRoll state for SpaceInfo component
    this.setState({
      diceOutcomes: outcomes,
      lastDiceRoll: result,
      // Always maintain the current player's position for the middle column
      selectedSpace: currentPosition
    });
    
    console.log('Dice roll completed, middle column kept on current player position:', currentPosition);
    
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
  
  // Handler for close button in space explorer - now just updates content
  handleCloseExplorer = () => {
    // Instead of closing the space explorer, reset its content to the current player's space
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      const currentSpace = this.state.spaces.find(s => s.id === currentPlayer.position);
      if (currentSpace) {
        this.setState({
          exploredSpace: currentSpace
        });
        console.log('Space explorer reset to current player space');
      }
    }
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
      hasRolledDice, exploredSpace
    } = this.state;
    
    // Check if game is ended
    if (GameState.gameEnded) {
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
    
    const currentPlayer = players[currentPlayerIndex];
    const selectedSpaceObj = spaces.find(space => space.id === selectedSpace);
    const visitType = this.isVisitingFirstTime() ? 'first' : 'subsequent';
    
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
              onClick={this.toggleInstructions}
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
            selectedMove={this.state.selectedMove}
            availableMoves={availableMoves}
            onSpaceClick={this.handleSpaceClick}
            diceRollData={diceRollData}
            showSpaceExplorer={this.state.showSpaceExplorer} 
            />
              
              {/* Space Explorer - Always visible */}
              <div className="space-explorer-container">
                <SpaceExplorer 
                  space={exploredSpace || this.getSelectedSpace()}
                  visitType={exploredSpace ? 
                    (GameState.hasPlayerVisitedSpace(currentPlayer, exploredSpace.name) ? 'subsequent' : 'first')
                    : 'first'}
                  diceRollData={diceRollData}
                  onClose={this.handleCloseExplorer}
                />
              </div>
            </div>
            
            <div className="info-panels-container">
              {/* Static Player Status display - left column */}
              <div className="player-panel">
                <StaticPlayerStatus 
                  player={this.state.currentPlayerOnLanding}
                  space={this.state.currentSpaceOnLanding}
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
                    diceOutcomes={this.state.diceOutcomes}
                    diceRoll={this.state.lastDiceRoll}
                    availableMoves={availableMoves}
                    onMoveSelect={this.handleSpaceClick}
                    onDrawCards={this.handleDrawCards}
                    onRollDice={this.handleRollDiceClick}
                    hasRolledDice={hasRolledDice}
                    hasDiceRollSpace={this.hasDiceRollSpace()}
                  />
                )}
                {/* Debug info */}
                <div className="debug-info" style={{ display: 'none' }}>
                  Dice Roll: {this.state.lastDiceRoll ? this.state.lastDiceRoll : 'None'}<br/>
                  Has Outcomes: {this.state.diceOutcomes ? 'Yes' : 'No'}
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
                        onToggleCardDisplay={this.toggleCardDisplay}
                      />
                    )
                  ))}
                </div>
                
                {/* Game control buttons placed at the bottom of player panel */}
                <div className="player-control-buttons">
                  {/* Negotiate button */}
                  <button 
                    onClick={this.handleNegotiate}
                    className="negotiate-btn"
                    title="End your turn and stay on this space"
                    disabled={!currentPlayer}
                  >
                    Negotiate
                  </button>
                  
                  {/* End Turn button */}
                  <button 
                    onClick={this.handleEndTurn}
                    disabled={
                      !currentPlayer || 
                      !this.state.hasSelectedMove ||
                      (this.hasDiceRollSpace() && !hasRolledDice)
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
          {currentPlayer && (
            <div className="card-display-container">
              <CardDisplay
                playerId={currentPlayer.id}
                visible={showCardDisplay}
                onCardPlayed={this.handleCardPlayed}
                onCardDiscarded={this.handleCardDiscarded}
                onWDiscardComplete={() => console.log('GameBoard: W card discard requirement completed')}
                onWReplacementComplete={() => console.log('GameBoard: W card replacement requirement completed')}
                ref={this.cardDisplayRef}
              />
            </div>
          )}
        
        {/* Dice Roll component */}
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
        
        {/* Game Instructions Panel */}
        {this.state.showInstructions && this.state.instructionsData && (
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
                {this.state.instructionsData.first && (
                  <div className="instruction-item">
                    <h4>First Visit</h4>
                    <p>{this.state.instructionsData.first.description || "Navigate through the board by selecting available spaces."}</p>
                    {this.state.instructionsData.first.action && <p><strong>Action:</strong> {this.state.instructionsData.first.action}</p>}
                    {this.state.instructionsData.first.outcome && <p><strong>Outcome:</strong> {this.state.instructionsData.first.outcome}</p>}
                    {/* Only show card fields that were included in the filtered data */}
                    {this.state.instructionsData.first["W Card"] && <p><strong>W Card:</strong> {this.state.instructionsData.first["W Card"]}</p>}
                    {this.state.instructionsData.first["B Card"] && <p><strong>B Card:</strong> {this.state.instructionsData.first["B Card"]}</p>}
                    {this.state.instructionsData.first["I Card"] && <p><strong>I Card:</strong> {this.state.instructionsData.first["I Card"]}</p>}
                    {this.state.instructionsData.first["L card"] && <p><strong>L Card:</strong> {this.state.instructionsData.first["L card"]}</p>}
                    {this.state.instructionsData.first["E Card"] && <p><strong>E Card:</strong> {this.state.instructionsData.first["E Card"]}</p>}
                  </div>
                )}
                
                {this.state.instructionsData.subsequent && (
                  <div className="instruction-item">
                    <h4>Subsequent Visits</h4>
                    <p>{this.state.instructionsData.subsequent.description || "Return to previous spaces for additional options."}</p>
                    {this.state.instructionsData.subsequent.action && <p><strong>Action:</strong> {this.state.instructionsData.subsequent.action}</p>}
                    {this.state.instructionsData.subsequent.outcome && <p><strong>Outcome:</strong> {this.state.instructionsData.subsequent.outcome}</p>}
                    {/* Only show card fields that were included in the filtered data */}
                    {this.state.instructionsData.subsequent["W Card"] && <p><strong>W Card:</strong> {this.state.instructionsData.subsequent["W Card"]}</p>}
                    {this.state.instructionsData.subsequent["B Card"] && <p><strong>B Card:</strong> {this.state.instructionsData.subsequent["B Card"]}</p>}
                    {this.state.instructionsData.subsequent["I Card"] && <p><strong>I Card:</strong> {this.state.instructionsData.subsequent["I Card"]}</p>}
                    {this.state.instructionsData.subsequent["L card"] && <p><strong>L Card:</strong> {this.state.instructionsData.subsequent["L card"]}</p>}
                    {this.state.instructionsData.subsequent["E Card"] && <p><strong>E Card:</strong> {this.state.instructionsData.subsequent["E Card"]}</p>}
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
                onClick={this.toggleInstructions}
              >
                Close Instructions
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Export SpaceExplorer component for use in other files
window.SpaceExplorer = SpaceExplorer;

console.log('GameBoard.js code execution finished');
