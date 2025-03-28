// PlayerInfo component
console.log('PlayerInfo.js file is being processed');

window.PlayerInfo = class PlayerInfo extends React.Component {
  render() {
    const { player, isCurrentPlayer } = this.props;
    
    if (!player) {
      return <div className="player-info empty">No player selected</div>;
    }
    
    return (
      <div className={`player-info ${isCurrentPlayer ? 'current' : ''}`}>
        <div 
          className="player-color" 
          style={{ backgroundColor: player.color }}
        />
        <div className="player-details">
          <h3>{player.name}</h3>
          <div className="player-resources">
            <div className="resource">
              <span className="resource-label">Money:</span>
              <span className="resource-value">${player.resources.money}</span>
            </div>
            <div className="resource">
              <span className="resource-label">Time:</span>
              <span className="resource-value">{player.resources.time} days</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

console.log('PlayerInfo.js execution complete');