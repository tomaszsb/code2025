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
      return { items: [], totalCost: 0 };
    }
    
    // Filter W cards only
    const wCards = player.cards.filter(card => card.type === 'W' || card.card_type === 'W');
    
    // Extract work type and estimated cost from each W card
    const scope = wCards.map(card => {
      // Handle both unified and legacy formats
      let workType = 'Unknown';
      let estimatedCost = 0;
      
      // Try unified format first
      if (card.work_type_restriction) {
        workType = card.work_type_restriction;
      } else if (card['Work Type']) {
        workType = card['Work Type'];
      }
      
      // Try unified format for cost
      if (card.work_cost && card.work_cost > 0) {
        estimatedCost = card.work_cost;
      } else if (card['Estimated Job Costs']) {
        estimatedCost = parseFloat(card['Estimated Job Costs']) || 0;
      }
      
      return {
        workType: workType,
        estimatedCost: estimatedCost,
        cardName: card.card_name || card.description || 'Work Card'
      };
    });
    
    // Calculate total estimated cost
    let totalCost = 0;
    scope.forEach(item => {
      totalCost += item.estimatedCost;
    });
    
    console.log('PlayerInfo: Extracted scope from W cards:', scope);
    console.log('PlayerInfo: Total estimated cost:', totalCost);
    console.log('PlayerInfo: Number of W cards found:', wCards.length);
    console.log('PlayerInfo: W cards data:', wCards);
    
    return {
      items: scope,
      totalCost: totalCost
    };
  }
  render() {
    const { player, isCurrentPlayer, showCardDisplay, onToggleCardDisplay } = this.props;
    const { cardCount } = this.state;
    
    // Get current space data for time display
    let currentSpaceTime = `${player.resources.time} days`; // Default to player time
    if (window.GameState?.spaces && player.position) {
      const currentSpace = window.GameState.spaces.find(s => 
        s.space_name === player.position && s.visit_type === 'First'
      );
      if (currentSpace && currentSpace.Time && currentSpace.Time !== 'n/a') {
        currentSpaceTime = currentSpace.Time;
      }
    }
    
    if (!player) {
      return <div className="player-info empty">No player selected</div>;
    }
    
    // Extract scope from player's W cards
    const playerScope = this.extractScope(player);
    
    // Format money with commas
    const formattedMoney = player.resources.money.toLocaleString();
    
    // Extract the player's current money and total scope cost
    const playerMoney = player.resources.money || 0;
    const totalScopeCost = playerScope.totalCost || 0;
    
    // Calculate the actual financial status by comparing money with scope cost
    let actualSurplus = 0;
    let actualDeficit = 0;
    
    if (playerMoney >= totalScopeCost) {
      actualSurplus = playerMoney - totalScopeCost;
    } else {
      actualDeficit = totalScopeCost - playerMoney;
    }
    
    const formattedSurplus = actualSurplus.toLocaleString();
    const formattedDeficit = actualDeficit.toLocaleString();
    
    // Also log the calculation for debugging
    console.log('PlayerInfo: Financial Status Calculation - Money:', playerMoney, 'Scope Cost:', totalScopeCost);
    console.log('PlayerInfo: Calculated - Surplus:', actualSurplus, 'Deficit:', actualDeficit);
    
    // Define style for financial status section
    const financialSectionStyle = {
      marginTop: '10px',
      backgroundColor: '#f5f5f5',
      padding: '8px',
      borderRadius: '4px'
    };
    
    // Define styles for financial items
    const financialItemStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '3px 0'
    };
    
    // Define style for surplus (green)
    const surplusStyle = {
      color: '#34a853',
      fontWeight: actualSurplus > 0 ? 'bold' : 'normal'
    };
    
    // Define style for deficit (red)
    const deficitStyle = {
      color: '#ea4335',
      fontWeight: actualDeficit > 0 ? 'bold' : 'normal'
    };
    
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
              <span className="resource-value">${formattedMoney}</span>
            </div>
            <div className="resource" style={resourceItemStyle}>
              <span className="resource-label">Time:</span>
              <span className="resource-value">{currentSpaceTime}</span>
            </div>
            
            {/* Financial Status Section - Surplus or Deficit */}
            <div style={financialSectionStyle}>
              <h5 style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>Financial Status:</h5>
              {actualSurplus > 0 ? (
                <div style={financialItemStyle}>
                  <span>Surplus:</span>
                  <span style={surplusStyle}>+${formattedSurplus}</span>
                </div>
              ) : (
                <div style={financialItemStyle}>
                  <span>Deficit:</span>
                  <span style={deficitStyle}>-${formattedDeficit}</span>
                </div>
              )}
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