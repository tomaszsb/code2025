// PlayerInfo component
console.log('PlayerInfo.js file is being processed');

window.PlayerInfo = class PlayerInfo extends React.Component {
  render() {
    const { player, isCurrentPlayer } = this.props;
    
    if (!player) {
      return <div className="player-info empty">No player selected</div>;
    }
    
    // Define styles for the player card when it's their turn or not
    const cardStyle = {
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '10px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
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
    
    // Style for resources container
    const resourcesStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    };
    
    // Style for each resource item
    const resourceItemStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: '#f5f5f5',
      padding: '5px 10px',
      borderRadius: '4px'
    };
    
    return (
      <div className={`player-info ${isCurrentPlayer ? 'current' : ''}`} style={cardStyle}>
        <div className="player-color" style={colorIndicatorStyle} />
        <div className="player-details" style={detailsStyle}>
          <h3 style={nameStyle}>{player.name}{isCurrentPlayer ? ' (Current Turn)' : ''}</h3>
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
        </div>
      </div>
    );
  }
}

console.log('PlayerInfo.js execution complete');