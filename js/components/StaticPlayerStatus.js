// StaticPlayerStatus component - shows player status on space landing
console.log('StaticPlayerStatus.js file is beginning to be used');

window.StaticPlayerStatus = class StaticPlayerStatus extends React.Component {
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
    const { currentPlayerColor } = this.props; // Get current player's color
    
    if (!playerStatus || !spaceInfo) {
      return (
        <div className="static-player-status empty">
          Player status will be displayed here after the first turn.
        </div>
      );
    }
    
    return (
      <div className="static-player-status" style={{border: `2px solid ${currentPlayerColor || playerStatus.color}`}}>
        <div className="static-player-status-header">
          <div 
            className="static-player-status-color-indicator" 
            style={{backgroundColor: currentPlayerColor || playerStatus.color,
                   boxShadow: `0 0 5px ${currentPlayerColor || playerStatus.color}`}}
          ></div>
          <div className="static-player-status-name-container">
            <div 
              className="static-player-status-name" 
              style={{backgroundColor: currentPlayerColor || playerStatus.color}}
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
            <span>${playerStatus.money}</span>
          </div>
          <div className="static-player-status-resource-item">
            <span>Time:</span>
            <span>{playerStatus.time} days</span>
          </div>
        </div>
        
        <div className="static-player-status-section-title">Space Effect:</div>
        {spaceInfo.action && (
          <div className="static-player-status-resource-item">
            <span>Action:</span>
            <span>{spaceInfo.action}</span>
          </div>
        )}
        {spaceInfo.time && spaceInfo.time !== 'n/a' && (
          <div className="static-player-status-resource-item">
            <span>Time Cost:</span>
            <span>{spaceInfo.time}</span>
          </div>
        )}
        {spaceInfo.fee && spaceInfo.fee !== 'n/a' && (
          <div className="static-player-status-resource-item">
            <span>Fee:</span>
            <span>{spaceInfo.fee}</span>
          </div>
        )}
        
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
  }
};

console.log('StaticPlayerStatus.js code execution finished');