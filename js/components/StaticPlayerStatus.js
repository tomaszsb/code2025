// StaticPlayerStatus component - shows player status on space landing
console.log('StaticPlayerStatus.js file is beginning to be used');

window.StaticPlayerStatus = class StaticPlayerStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerStatus: null,
      spaceInfo: null,
      hasError: false,
      errorMessage: ''
    };
    this.logDebug('Component instance created');
  }
  
  // Structured logging methods for better debugging
  logDebug(message, ...args) {
    console.log(`StaticPlayerStatus [DEBUG]: ${message}`, ...args);
  }
  
  logInfo(message, ...args) {
    console.log(`StaticPlayerStatus [INFO]: ${message}`, ...args);
  }
  
  logWarn(message, ...args) {
    console.warn(`StaticPlayerStatus [WARN]: ${message}`, ...args);
  }
  
  logError(message, ...args) {
    console.error(`StaticPlayerStatus [ERROR]: ${message}`, ...args);
  }
  
  // Error boundary implementation
  componentDidCatch(error, info) {
    this.logError('Error caught in StaticPlayerStatus:', error.message, info);
    this.setState({
      hasError: true,
      errorMessage: error.message
    });
  }
  
  componentDidMount() {
    this.logInfo('Component did mount - capturing initial player status');
    // Capture the initial player status and space info when landing on a space
    this.capturePlayerStatus();
  }
  
  componentDidUpdate(prevProps) {
    // Update the static status when the player changes or a new turn begins
    if (prevProps.player?.id !== this.props.player?.id || 
        prevProps.space?.id !== this.props.space?.id) {
      this.logInfo('Props changed, updating player status');
      this.capturePlayerStatus();
    }
  }
  
  capturePlayerStatus() {
    this.logDebug('Capturing player status');
    const { player, space } = this.props;
    if (!player || !space) {
      this.logWarn('Missing player or space props, skipping status capture');
      return;
    }
    
    // Get the scope information first
    const scope = this.extractScope(player);
    const playerMoney = player.resources?.money || 0;
    const totalScopeCost = scope.totalCost || 0;
    
    // Calculate the actual financial status by comparing money with scope cost
    let actualSurplus = 0;
    let actualDeficit = 0;
    
    if (playerMoney >= totalScopeCost) {
      actualSurplus = playerMoney - totalScopeCost;
    } else {
      actualDeficit = totalScopeCost - playerMoney;
    }
    
    // Count cards by type
    const cardCounts = this.countCardsByType(player.cards || []);
    
    // Log the calculation for debugging
    this.logDebug('Financial Status Calculation - Money:', playerMoney, 'Scope Cost:', totalScopeCost);
    this.logDebug('Calculated - Surplus:', actualSurplus, 'Deficit:', actualDeficit);
    this.logDebug('Card counts by type:', cardCounts);
    
    // Create a snapshot of the player's status
    this.setState({
      playerStatus: {
        name: player.name,
        color: player.color,
        money: playerMoney,
        time: player.resources?.time || 0,
        position: player.position,
        // Use calculated financial status
        financialStatus: {
          surplus: actualSurplus,
          deficit: actualDeficit
        },
        // Store scope items
        scope: scope,
        // Store card counts by type
        cardCounts: cardCounts,
        totalCards: player.cards ? player.cards.length : 0
      },
      spaceInfo: {
        name: space.name,
        type: space.type
      }
    });
    
    this.logInfo('Captured player status on space landing');
  }
  
  // Count cards by type (W, B, I, L, E)
  countCardsByType(cards) {
    const counts = {
      W: 0, // Work Type
      B: 0, // Bank
      I: 0, // Investor
      L: 0, // Life
      E: 0  // Expeditor
    };
    
    cards.forEach(card => {
      if (card.type && counts[card.type] !== undefined) {
        counts[card.type]++;
      }
    });
    
    return counts;
  }
  
  // Extract scope information from player's W cards (copied from PlayerInfo)
  extractScope(player) {
    if (!player || !player.cards) {
      return { items: [], totalCost: 0 };
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
  
  // Apply dynamic styles through JavaScript
  applyBorderStyle() {
    const { playerStatus } = this.state;
    const { currentPlayerColor } = this.props;
    if (!playerStatus) return {};
    
    return {
      border: `2px solid ${currentPlayerColor || playerStatus.color}`
    };
  }
  
  applyColorIndicatorStyle() {
    const { playerStatus } = this.state;
    const { currentPlayerColor } = this.props;
    if (!playerStatus) return {};
    
    return {
      backgroundColor: currentPlayerColor || playerStatus.color,
      boxShadow: `0 0 5px ${currentPlayerColor || playerStatus.color}`
    };
  }
  
  applyNameStyle() {
    const { playerStatus } = this.state;
    const { currentPlayerColor } = this.props;
    if (!playerStatus) return {};
    
    return {
      backgroundColor: currentPlayerColor || playerStatus.color
    };
  }
  
  // Get card type color based on type
  getCardTypeColor(type) {
    switch (type) {
      case 'W': return '#4285f4'; // Blue for Work Type
      case 'B': return '#ea4335'; // Red for Bank
      case 'I': return '#fbbc05'; // Yellow for Investor
      case 'L': return '#34a853'; // Green for Life
      case 'E': return '#8e44ad'; // Purple for Expeditor
      default: return '#777777';  // Gray for unknown
    }
  }
  
  // Get card type name
  getCardTypeName(type) {
    switch (type) {
      case 'W': return 'Work Type';
      case 'B': return 'Bank';
      case 'I': return 'Investor';
      case 'L': return 'Life';
      case 'E': return 'Expeditor';
      default: return 'Unknown';
    }
  }
  
  // Render card counts by type
  renderCardCounts() {
    const { playerStatus } = this.state;
    if (!playerStatus || !playerStatus.cardCounts) return null;
    
    const { cardCounts, totalCards } = playerStatus;
    const cardTypes = ['W', 'B', 'I', 'L', 'E'];
    
    return (
      <div className="card-counts-container">
        <div className="card-counts-total">
          <span>Total Cards:</span>
          <span>{totalCards}</span>
        </div>
        
        <div className="card-counts-breakdown">
          {cardTypes.map(type => (
            <div key={type} className="card-type-count">
              <span 
                className="card-type-indicator" 
                style={{ backgroundColor: this.getCardTypeColor(type) }}
              >
                {type}
              </span>
              <span className="card-type-name">{this.getCardTypeName(type)}:</span>
              <span className="card-type-value">{cardCounts[type]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  render() {
    this.logDebug('Rendering component');
    
    // Show error UI if an error occurred
    if (this.state.hasError) {
      return (
        <div className="static-player-status error">
          <h3>Something went wrong displaying player status</h3>
          <p>Error: {this.state.errorMessage}</p>
        </div>
      );
    }
    
    const { playerStatus, spaceInfo } = this.state;
    
    if (!playerStatus || !spaceInfo) {
      return (
        <div className="static-player-status empty">
          Player status will be displayed here after the first turn.
        </div>
      );
    }
    
    try {
      return (
        <div className="static-player-status" style={this.applyBorderStyle()}>
          <div className="static-player-status-header">
            <div 
              className="static-player-status-color-indicator" 
              style={this.applyColorIndicatorStyle()}
            ></div>
            <div className="static-player-status-name-container">
              <div 
                className="static-player-status-name" 
                style={this.applyNameStyle()}
              >
                <span>{playerStatus.name}'s Status When Landing</span>
              </div>
              <div className="static-player-status-space">
                Space: {spaceInfo.name}
              </div>
            </div>
          </div>
          
          <div className="static-player-status-section-title">Resources:</div>
          <div className="status-resources">
            <div className="static-player-status-resource-item">
              <span>Money:</span>
              <span>${playerStatus.money.toLocaleString()}</span>
            </div>
            <div className="static-player-status-resource-item">
              <span>Time:</span>
              <span>{playerStatus.time} days</span>
            </div>
            
            {/* Financial Status - Surplus or Deficit */}
            <div className="status-financial">
              <h4>Financial Status:</h4>
              {playerStatus.financialStatus.surplus > 0 ? (
                <div className="status-financial-item">
                  <span>Surplus:</span>
                  <span className="surplus-value">
                    +${playerStatus.financialStatus.surplus.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="status-financial-item">
                  <span>Deficit:</span>
                  <span className="deficit-value">
                    -${playerStatus.financialStatus.deficit.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="static-player-status-section-title">Cards:</div>
          {this.renderCardCounts()}
          
          <div className="static-player-status-section-title">Scope:</div>
          {playerStatus.scope && playerStatus.scope.items && playerStatus.scope.items.length > 0 ? (
            <div className="static-player-status-scope-container">
              <table className="static-player-status-scope-table">
                <thead>
                  <tr>
                    <th>Work Type</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStatus.scope.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.workType}</td>
                      <td>
                        ${typeof item.estimatedCost === 'number' ? 
                          item.estimatedCost.toLocaleString() : 
                          isNaN(parseFloat(item.estimatedCost)) ? 
                            item.estimatedCost : 
                            parseFloat(item.estimatedCost).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td>TOTAL</td>
                    <td>
                      ${playerStatus.scope.totalCost.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="static-player-status-resource-item">
              <em className="static-player-status-no-scope">
                No scope items yet
              </em>
            </div>
          )}
        </div>
      );
    } catch (error) {
      this.logError('Error in render method:', error);
      
      // Update state and show the error UI
      this.setState({
        hasError: true,
        errorMessage: error.message || 'Unknown error occurred'
      });
      
      // Return a simple error UI for now (next render will show the full error UI)
      return (
        <div className="static-player-status error">
          <h3>Rendering Error</h3>
          <p>Please try again.</p>
        </div>
      );
    }
  }
};

console.log('StaticPlayerStatus.js code execution finished');