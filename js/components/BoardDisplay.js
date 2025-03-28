// BoardDisplay component
console.log('BoardDisplay.js file is being processed');

window.BoardDisplay = class BoardDisplay extends React.Component {
  // Get move details for display
  getMoveDetails = (space) => {
    return window.MoveLogic.getMoveDetails(space);
  }

  renderSpace = (space, index) => {
    const { players, selectedSpace, onSpaceClick, availableMoves } = this.props;
    
    // Find players on this space
    const playersOnSpace = players.filter(player => player.position === space.id);
    
    // Check if this space is an available move
    const isAvailableMove = availableMoves.some(move => move.id === space.id);
    
    // Determine CSS classes
    const classes = ['board-space'];
    if (space.type) classes.push(`space-type-${space.type.toLowerCase()}`);
    if (selectedSpace === space.id) classes.push('selected');
    if (isAvailableMove) classes.push('available-move');
    
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
          
          {/* Show available move indicator with details */}
          {isAvailableMove && (
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
  
  renderBoard = () => {
    const { spaces } = this.props;
    if (!spaces || spaces.length === 0) return null;
    
    // Filter out only the instruction spaces while keeping all game spaces
    const gameSpaces = spaces.filter(space => {
      // Only filter out spaces that specifically match "START - Quick play guide"
      return !space.name.includes('START - Quick play guide');
    });
    
    // For the snake layout, we'll alternate directions of rows
    // Calculate an appropriate number of spaces per row based on filtered count
    const totalSpaces = gameSpaces.length;
    const spacesPerRow = Math.min(5, Math.ceil(Math.sqrt(totalSpaces))); // Use square root for a more balanced layout
    const rows = [];
    
    // Group spaces into rows
    for (let i = 0; i < gameSpaces.length; i += spacesPerRow) {
      const rowSpaces = gameSpaces.slice(i, Math.min(i + spacesPerRow, gameSpaces.length));
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

console.log('BoardDisplay.js execution complete');