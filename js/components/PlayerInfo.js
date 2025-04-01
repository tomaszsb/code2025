// PlayerInfo component
console.log('PlayerInfo.js file is beginning to be used');

window.PlayerInfo = class PlayerInfo extends React.Component {
  constructor(props) {
    super(props);
    // Initialize state if needed
    this.state = {
      forceUpdate: false,
      cardCount: 0
    };
  }
  
  componentDidMount() {
    // Add event listener for game state updates
    window.addEventListener('gameStateUpdated', this.handleGameStateUpdate);
    console.log('PlayerInfo: Added gameStateUpdated event listener');
    
    // Initialize card count
    this.updateCardCount();
  }
  
  componentWillUnmount() {
    // Remove event listener to prevent memory leaks
    window.removeEventListener('gameStateUpdated', this.handleGameStateUpdate);
    console.log('PlayerInfo: Removed gameStateUpdated event listener');
  }
  
  // Handle game state updates
  handleGameStateUpdate = () => {
    // Force a re-render when game state changes
    console.log('PlayerInfo: Received gameStateUpdated event, forcing update');
    this.setState({ forceUpdate: !this.state.forceUpdate });
    
    // Update card count when game state changes
    this.updateCardCount();
  }
  
  // Additionally, check for card count updates on each render
  componentDidUpdate(prevProps) {
    // If player prop changed, update card count
    if (prevProps.player?.id !== this.props.player?.id) {
      this.updateCardCount();
      return;
    }
    
    // Check if game state has cards that differ from our current count
    // This makes the card counter update in real-time as cards are added/removed
    const { player } = this.props;
    if (!player) return;
    
    const gameStatePlayer = window.GameState?.players?.find(p => p.id === player.id);
    const currentCardCount = gameStatePlayer?.cards?.length || 0;
    
    if (currentCardCount !== this.state.cardCount) {
      this.updateCardCount();
    }
  }
  
  // Update the card count for the player
  updateCardCount = () => {
    const { player } = this.props;
    if (!player) return;
    
    // Get the card count directly from the player object
    const cardCount = player.cards?.length || 0;
    
    // Update state if count changed
    if (cardCount !== this.state.cardCount) {
      this.setState({ cardCount });
    }
  }
  // Extract scope information from W cards
  extractScope(player) {
    if (!player || !player.cards) {
      return [];
    }
    
    // Filter W cards only
    const wCards = player.cards.filter(card => card.type === 'W');
    
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
    
    console.log('PlayerInfo: Extracted scope from W cards:', scope);
    console.log('PlayerInfo: Total estimated cost:', totalCost);
    
    return {
      items: scope,
      totalCost: totalCost
    };
  }
  render() {
    const { player, isCurrentPlayer, showCardDisplay, onToggleCardDisplay } = this.props;
    const { cardCount } = this.state;
    
    if (!player) {
      return <div className="player-info empty">No player selected</div>;
    }
    
    // Extract scope from player's W cards
    const playerScope = this.extractScope(player);
    
    // Define styles for the player card when it's their turn or not
    const cardStyle = {
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '10px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start', // Changed to flex-start to align at the top
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      backgroundColor: isCurrentPlayer ? player.color + '22' : '#ffffff', // Add transparency to player color when it's their turn
      border: `2px solid ${isCurrentPlayer ? player.color : '#e0e0e0'}`
    };
    
    // Style for the circular player color indicator
    const colorIndicatorStyle = {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: player.color,
      marginRight: '15px',
      marginTop: '5px', // Added to align with the top of the content
      border: '2px solid white',
      boxShadow: isCurrentPlayer ? `0 0 8px ${player.color}` : 'none'
    };
    
    // Style for player details container
    const detailsStyle = {
      flex: 1
    };
    
    // Style for player name
    const nameStyle = {
      margin: '0 0 8px 0',
      fontSize: '1.1em',
      color: isCurrentPlayer ? '#333' : '#555'
    };
    
    // Style for the toggle cards button - use player color with some transparency
    const toggleCardsBtnStyle = {
      backgroundColor: player.color || '#9c27b0',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.8em',
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    };
    
    // Style for card count badge - use player color
    const cardCountStyle = {
      backgroundColor: 'white',
      color: player.color || '#9c27b0',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '0.8em'
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
    
    // Style for scope heading
    const scopeHeadingStyle = {
      fontSize: '0.9em',
      margin: '10px 0 5px 0',
      color: '#555',
      fontWeight: 'bold'
    };
    
    // Style for scope table
    const scopeTableStyle = {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.85em',
      backgroundColor: '#f9f9f9',
      borderRadius: '4px',
      overflow: 'hidden'
    };
    
    // Style for table header
    const tableHeaderStyle = {
      backgroundColor: '#eaeaea',
      padding: '6px 10px',
      textAlign: 'left',
      fontSize: '0.9em',
      fontWeight: 'bold',
      color: '#444'
    };
    
    // Style for table cell
    const tableCellStyle = {
      padding: '5px 10px',
      borderTop: '1px solid #e0e0e0'
    };
    
    // Style for empty scope message
    const emptyScopeStyle = {
      padding: '8px 10px',
      fontSize: '0.85em',
      color: '#777',
      fontStyle: 'italic',
      backgroundColor: '#f9f9f9',
      borderRadius: '4px',
      textAlign: 'center'
    };
    
    return (
      <div className={`player-info ${isCurrentPlayer ? 'current' : ''}`} style={cardStyle}>
        <div className="player-color" style={colorIndicatorStyle} />
        <div className="player-details" style={detailsStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ ...nameStyle, margin: 0 }}>{player.name}{isCurrentPlayer ? ' (Current Turn)' : ''}</h3>
            
            {/* Toggle Cards button - only shown for current player */}
            {isCurrentPlayer && onToggleCardDisplay && (
              <button 
                onClick={onToggleCardDisplay}
                style={toggleCardsBtnStyle}
                title="Toggle card visibility"
              >
                {showCardDisplay ? 'Hide Cards' : 'Show Cards'}
                <span style={cardCountStyle}>{cardCount}</span>
              </button>
            )}
          </div>
          <div className="player-resources" style={resourcesStyle}>
            <div className="resource" style={resourceItemStyle}>
              <span className="resource-label">Money:</span>
              <span className="resource-value">${player.resources.money}</span>
            </div>
            <div className="resource" style={resourceItemStyle}>
              <span className="resource-label">Time:</span>
              <span className="resource-value">{player.resources.time} days</span>
            </div>
          </div>
          
          {/* Player's Scope Section */}
          <div className="player-scope">
            <h4 style={scopeHeadingStyle}>Scope:</h4>
            {playerScope.items?.length > 0 ? (
              <table style={scopeTableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Work Type</th>
                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {playerScope.items.map((item, index) => (
                    <tr key={index}>
                      <td style={tableCellStyle}>{item.workType}</td>
                      <td style={{...tableCellStyle, textAlign: 'right'}}>${typeof item.estimatedCost === 'number' ? item.estimatedCost.toLocaleString() : isNaN(parseFloat(item.estimatedCost)) ? item.estimatedCost : parseFloat(item.estimatedCost).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{...tableCellStyle, fontWeight: 'bold', borderTop: '2px solid #ccc'}}>TOTAL</td>
                    <td style={{...tableCellStyle, fontWeight: 'bold', borderTop: '2px solid #ccc', textAlign: 'right'}}>${playerScope.totalCost.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div style={emptyScopeStyle}>No scope items yet. Add W cards to your hand.</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

console.log('PlayerInfo.js code execution finished');