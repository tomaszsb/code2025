// BoardDisplay component
class BoardDisplay extends React.Component {
  renderSpace = (space, index) => {
    const { players, onSpaceClick } = this.props;
    
    // Find players on this space
    const playersOnSpace = players.filter(player => player.position === space.id);
    
    // Determine CSS classes
    const classes = ['board-space'];
    if (space.type) classes.push(`space-type-${space.type.toLowerCase()}`);
    
    return (
      <div 
        key={space.id} 
        className={classes.join(' ')}
        onClick={() => onSpaceClick && onSpaceClick(space.id)}
      >
        <div className="space-name">{space.name}</div>
        
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
  
  renderBoard = () => {
    const { spaces } = this.props;
    if (!spaces || spaces.length === 0) return null;
    
    // For the snake layout, we'll alternate directions of rows
    // First, determine how many spaces per row
    const spacesPerRow = 5;
    const rows = [];
    
    // Group spaces into rows
    for (let i = 0; i < spaces.length; i += spacesPerRow) {
      const rowSpaces = spaces.slice(i, i + spacesPerRow);
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