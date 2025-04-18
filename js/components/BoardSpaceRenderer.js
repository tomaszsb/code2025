// BoardSpaceRenderer.js - Handles rendering of board spaces
console.log('BoardSpaceRenderer.js file is beginning to be used');
console.log('BoardSpaceRenderer: Fixed board layout - standardized space sizes to 120px width × 60px height with column 3 at exactly 50px width, eliminated row spacing completely (0px), aligned all spaces for better visual layout, and made empty spaces visible for debugging');

// BoardSpaceRenderer provides methods for rendering board spaces
window.BoardSpaceRenderer = {
  // Log when methods are used
  logMethodCall: function(methodName) {
    console.log(`BoardSpaceRenderer: ${methodName} method is being used`);
  },
  
  // Get move details for display
  getMoveDetails: function(space) {
    this.logMethodCall('getMoveDetails');
    return window.MoveLogic ? window.MoveLogic.getMoveDetails(space) : null;
  },

  // Check if a space has dice roll options
  hasDiceRollOptions: function(space, diceRollData) {
    this.logMethodCall('hasDiceRollOptions');
    if (!diceRollData || diceRollData.length === 0 || !space) return false;
    
    // Check if there are entries for this space in the dice roll data
    return diceRollData.some(data => data['Space Name'] === space.name);
  },

  // Render a single board space
  renderSpace: function(space, index, props) {
    this.logMethodCall('renderSpace');
    const { players, selectedSpace, selectedMove, onSpaceClick, availableMoves, diceRollData } = props;
    
    // Find players on this space
    const playersOnSpace = players.filter(player => player.position === space.id);
    
    // Find players who are moving to this space (their previous position was different)
    const playersMovingToSpace = players.filter(player => 
      player.position === space.id && 
      player.previousPosition !== null && 
      player.previousPosition !== player.position
    );
    
    // Find players who just moved from this space
    const playersMovedFromSpace = players.filter(player => 
      player.previousPosition === space.id && 
      player.position !== space.id
    );
    
    // Check if this space is an available move
    const isAvailableMove = availableMoves.some(move => move.id === space.id);
    
    // Check if this is the selected destination for the current turn
    const isSelectedMove = selectedMove === space.id;
    
    // Log when a space is marked as available or selected for debugging
    if (isAvailableMove) {
      console.log(`BoardSpaceRenderer: Space ${space.id} (${space.name}) is marked as an available move`);
    }
    if (isSelectedMove) {
      console.log(`BoardSpaceRenderer: Space ${space.id} (${space.name}) is marked as the SELECTED move destination`);
    }
    
    // Check if this space has dice roll options
    const hasDiceRoll = this.hasDiceRollOptions(space, diceRollData);
    
    // Determine CSS classes
    const classes = ['board-space'];
    if (space.type) classes.push(`space-type-${space.type.toLowerCase()}`);
    if (selectedSpace === space.id) classes.push('selected');
    if (isAvailableMove) classes.push('available-move');
    if (isSelectedMove) {
      classes.push('selected-move');
      classes.push('enlarged');
      classes.push('destination-marked'); 
    }
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
          
          {/* Selected move indicator - shows a visible tag */}
          {isSelectedMove && (
            <div className="destination-tag">
              Destination
            </div>
          )}
        </div>
        
        {/* Player tokens */}
        {playersOnSpace.length > 0 && (
          <div className="player-tokens">
            {playersOnSpace.map(player => {
              // Track if this is the current player
              const isCurrentPlayer = window.GameState.currentPlayerIndex === window.GameState.players.indexOf(player);
              
              // Check if this player just moved to this space
              const justMoved = player.previousPosition !== null && player.previousPosition !== player.position;
              
              // Calculate animation classes based on movement
              let animationClass = '';
              if (justMoved) {
                // Get information about the previous space to determine movement direction
                const previousSpace = window.GameState.spaces.find(s => s.id === player.previousPosition);
                const currentSpace = window.GameState.spaces.find(s => s.id === player.position);
                
                if (previousSpace && currentSpace) {
                  console.log(`BoardSpaceRenderer: Player ${player.name} moved from ${previousSpace.name} to ${currentSpace.name}`);
                  animationClass = 'player-moved-in';
                }
              }
              
              return (
                <div 
                  key={player.id}
                  className={`player-token ${isCurrentPlayer ? 'current-player' : ''} ${animationClass}`}
                  style={{ backgroundColor: player.color }}
                  title={player.name}
                />
              );
            })}
          </div>
        )}
        
        {/* Render ghost tokens for players who just moved from this space */}
        {playersMovedFromSpace.length > 0 && (
          <div className="player-tokens player-tokens-moving-out">
            {playersMovedFromSpace.map(player => {
              return (
                <div 
                  key={`${player.id}-ghost`}
                  className="player-token player-moved-out"
                  style={{ backgroundColor: player.color }}
                  title={`${player.name} (moved)`}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  },
  
  // Categorize spaces by type
  categorizeSpaces: function(filteredSpaces) {
    this.logMethodCall('categorizeSpaces');
    // Categorize spaces by type for targeted row arrangement
    const spacesByType = {
      'SETUP': [],      // Row 0, Col 0-1
      'FUNDING': [],    // Row 0, Col 3-8
      'ARCHITECTURAL': [], // Row 1, Col 3-5
      'OWNER_DECISION': [], // Row 2, Col 0
      'PM_DECISION': [], // Row 2, Col 1
      'ENGINEERING': [], // Row 2, Col 3-5
      'REGULATORY_DOB': [], // Row 3, Col 3-8
      'REGULATORY_FDNY': [], // Row 4, Col 3-8
      'CHEAT': [],      // Row 4, Col 1
      'CONSTRUCTION': [], // Row 5, Col 3-7
      'FINISH': []      // Row 5, Col 8
    };
    
    // Sort spaces into categories
    filteredSpaces.forEach(space => {
      let assigned = false;
      const spaceName = space.name.toUpperCase();
      
      // Categorize based on space type and name
      if (space.type && space.type.toUpperCase() === 'SETUP') {
        spacesByType['SETUP'].push(space);
        assigned = true;
      } else if (space.type && space.type.toUpperCase() === 'FUNDING') {
        spacesByType['FUNDING'].push(space);
        assigned = true;
      } else if (space.type && space.type.toUpperCase() === 'DESIGN') {
        // Split design spaces into architectural and engineering
        if (spaceName.includes('ENG-')) {
          // All spaces with ENG- prefix are engineering
          spacesByType['ENGINEERING'].push(space);
          assigned = true;
        } else if (spaceName.includes('ARCHITECTURAL') || spaceName.includes('ARCHITECT') || spaceName.includes('ARCH-')) {
          // All ARCH spaces
          spacesByType['ARCHITECTURAL'].push(space);
          assigned = true;
        } else {
          // If it doesn't fit in either subcategory, put it in ARCHITECTURAL as default
          spacesByType['ARCHITECTURAL'].push(space);
          assigned = true;
        }
      } else if (space.type && space.type.toUpperCase() === 'REGULATORY') {
        // Split regulatory spaces into DOB and FDNY
        if (spaceName.includes('DOB')) {
          spacesByType['REGULATORY_DOB'].push(space);
          assigned = true;
        } else if (spaceName.includes('FDNY')) {
          spacesByType['REGULATORY_FDNY'].push(space);
          assigned = true;
        }
      } else if (space.type && space.type.toUpperCase() === 'CONSTRUCTION') {
        spacesByType['CONSTRUCTION'].push(space);
        assigned = true;
      }
      
      // Special handling for specific spaces
      if (!assigned) {
        if (spaceName.includes('PM') && spaceName.includes('DECISION')) {
          spacesByType['PM_DECISION'].push(space);
          assigned = true;
        } else if (spaceName.includes('OWNER') && spaceName.includes('DECISION')) {
          spacesByType['OWNER_DECISION'].push(space);
          assigned = true;
        } else if (spaceName.includes('CHEAT')) {
          spacesByType['CHEAT'].push(space);
          assigned = true;
        } else if (spaceName.includes('FINISH')) {
          spacesByType['FINISH'].push(space);
          assigned = true;
        }
      }
      
      // Any unassigned spaces go into PM_DECISION as fallback
      if (!assigned) {
        spacesByType['PM_DECISION'].push(space);
      }
    });
    
    return spacesByType;
  },
  
  // Filter spaces based on visit history
  filterSpaces: function(spaces, currentPlayer) {
    this.logMethodCall('filterSpaces');
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
      // Fixed alignment issue by ensuring only one instance is displayed
      if (spaceName === 'OWNER-SCOPE-INITIATION' || spaceName === 'OWNER SCOPE INITIATION') {
        // Check if we've already added an Owner Scope Initiation space
        if (addedSpaceNames.has('OWNER-SCOPE-INITIATION') || addedSpaceNames.has('OWNER SCOPE INITIATION')) {
          return; // Skip duplicate Owner Scope spaces
        }
        
        // Always ensure proper alignment by using first visit type for consistency
        let appropriateSpace = spaces.find(s => 
          window.GameState.extractSpaceName(s.name) === spaceName &&
          s.type && s.type.toUpperCase() === 'SETUP' && // Ensure proper type
          s.visitType && s.visitType.toLowerCase() === 'first' // Always use first visit for alignment
        );
        
        // If no first visit space found, try finding any appropriate space
        if (!appropriateSpace) {
          appropriateSpace = spaces.find(s => 
            window.GameState.extractSpaceName(s.name) === spaceName
          );
        }
        
        if (appropriateSpace) {
          // Force standardize position properties for consistent alignment
          const standardizedSpace = { ...appropriateSpace };
          
          filteredSpaces.push(standardizedSpace);
          addedSpaceNames.add(spaceName);
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
    
    return filteredSpaces;
  },
  
  // Render an empty space placeholder to maintain grid structure
  renderEmptySpace: function(row, col) {
    this.logMethodCall('renderEmptySpace');
    const isColumn3 = col === 2; // Column 3 is 0-indexed as 2
    const className = isColumn3 ? "board-space empty-space column-3-space" : "board-space empty-space";
    
    return (
      <div 
        key={`empty-${row}-${col}`} 
        className={className}
      >
        <span className="empty-space-coordinates">{`${row}-${col}`}</span>
      </div>
    );
  },
  
  // Create an invisible space with proper sizing to maintain layout 
  createInvisibleSpace: function(row, col) {
    this.logMethodCall('createInvisibleSpace');
    // Make all spaces the same size to fix grid layout issues
    const isColumn3 = col === 2; // Column 3 is 0-indexed as 2
    const className = isColumn3 ? "board-space empty-space column-3-space" : "board-space empty-space";
    
    return (
      <div 
        key={`invisible-${row}-${col}`} 
        className={className}
      >
        <span className="empty-space-coordinates">{`${row}-${col}`}</span>
      </div>
    );
  },

  // Render the entire board with 9-column grid layout
  renderBoard: function(props) {
    this.logMethodCall('renderBoard');
    const { spaces } = props;
    if (!spaces || spaces.length === 0) return null;
    
    // Get current player from GameState
    const currentPlayer = window.GameState.getCurrentPlayer();
    
    // Filter spaces based on visit history
    const filteredSpaces = this.filterSpaces(spaces, currentPlayer);
    
    // Categorize spaces by type
    const spacesByType = this.categorizeSpaces(filteredSpaces);
    
    // Create reference to this for use in renderSpace
    const self = this;

    // Track row and column position for empty spaces
    let currentRow = 0;
    
    // Helper function to get space or render invisible space
    const getSpaceOrInvisible = function(array, index, col, rowOverride = null) {
      // Use explicit row if provided, otherwise use the current row from context
      const row = rowOverride !== null ? rowOverride : currentRow;
      
      return (index < array.length) ? 
        self.renderSpace.call(self, array[index], index, props) : 
        self.createInvisibleSpace(row, col);
    };
    
    // Render the board with proper layout
    return (
      <div className="game-board full-width grid-layout">
        <div className="main-board-area">
          {/* Row 0: SETUP (0-1) and FUNDING (3-7) */}
          <div className="board-row grid-row">
            {(() => { currentRow = 0; return null; })()}
            {/* SETUP spaces */}
            {getSpaceOrInvisible(spacesByType['SETUP'], 0, 0)}
            {getSpaceOrInvisible(spacesByType['SETUP'], 1, 1)}
            
            {/* Column 2 is empty but visually present */}
            {self.createInvisibleSpace(0, 2)}
            
            {/* FUNDING Phase - keep all spaces */}
            {getSpaceOrInvisible(spacesByType['FUNDING'], 0, 3)}
            {getSpaceOrInvisible(spacesByType['FUNDING'], 1, 4)}
            {getSpaceOrInvisible(spacesByType['FUNDING'], 2, 5)}
            {getSpaceOrInvisible(spacesByType['FUNDING'], 3, 6)}
            {getSpaceOrInvisible(spacesByType['FUNDING'], 4, 7)}
          </div>
          
          {/* Row 1: ARCHITECTURAL spaces (col 3-5) */}
          <div className="board-row grid-row">
            {(() => { currentRow = 1; return null; })()}
            {/* Empty spaces on left */}
            {self.createInvisibleSpace(1, 0)}
            {self.createInvisibleSpace(1, 1)}
            {self.createInvisibleSpace(1, 2)}

            {/* ARCHITECTURAL Phase - maintain columns 3-5 */}
            {getSpaceOrInvisible(spacesByType['ARCHITECTURAL'], 0, 3)}
            {getSpaceOrInvisible(spacesByType['ARCHITECTURAL'], 1, 4)}
            {getSpaceOrInvisible(spacesByType['ARCHITECTURAL'], 2, 5)}
          </div>
          
          {/* Row 2: OWNER_DECISION, PM_DECISION, ENGINEERING */}
          <div className="board-row grid-row">
            {(() => { currentRow = 2; return null; })()}
            {/* Decision spaces */}
            {getSpaceOrInvisible(spacesByType['OWNER_DECISION'], 0, 0)}
            {getSpaceOrInvisible(spacesByType['PM_DECISION'], 0, 1)}
            {self.createInvisibleSpace(2, 2)}

            {/* ENGINEERING Phase - maintain columns 3-5 */}
            {getSpaceOrInvisible(spacesByType['ENGINEERING'], 0, 3)}
            {getSpaceOrInvisible(spacesByType['ENGINEERING'], 1, 4)}
            {getSpaceOrInvisible(spacesByType['ENGINEERING'], 2, 5)}
          </div>
          
          {/* Row 3: REGULATORY_DOB spaces */}
          <div className="board-row grid-row">
            {(() => { currentRow = 3; return null; })()}
            {/* Empty spaces on left */}
            {self.createInvisibleSpace(3, 0)}
            {self.createInvisibleSpace(3, 1)}
            {self.createInvisibleSpace(3, 2)}
            
            {/* DOB Phase - keep all spaces */}
            {getSpaceOrInvisible(spacesByType['REGULATORY_DOB'], 0, 3)}
            {getSpaceOrInvisible(spacesByType['REGULATORY_DOB'], 1, 4)}
            {getSpaceOrInvisible(spacesByType['REGULATORY_DOB'], 2, 5)}
            {getSpaceOrInvisible(spacesByType['REGULATORY_DOB'], 3, 6)}
            {getSpaceOrInvisible(spacesByType['REGULATORY_DOB'], 4, 7)}
          </div>
          
          {/* Row 4: CHEAT (col 1) and REGULATORY_FDNY (col 3-7) */}
          <div className="board-row grid-row">
            {(() => { currentRow = 4; return null; })()}
            {/* Left spaces */}
            {self.createInvisibleSpace(4, 0)}
            {getSpaceOrInvisible(spacesByType['CHEAT'], 0, 1)}
            {self.createInvisibleSpace(4, 2)}
            
            {/* FDNY Phase - keep all spaces */}
            {getSpaceOrInvisible(spacesByType['REGULATORY_FDNY'], 0, 3)}
            {getSpaceOrInvisible(spacesByType['REGULATORY_FDNY'], 1, 4)}
            {getSpaceOrInvisible(spacesByType['REGULATORY_FDNY'], 2, 5)}
            {getSpaceOrInvisible(spacesByType['REGULATORY_FDNY'], 3, 6)}
            {getSpaceOrInvisible(spacesByType['REGULATORY_FDNY'], 4, 7)}
          </div>
          
          {/* Row 5: CONSTRUCTION (col 3-5), REG-DOB-FINAL-REVIEW (col 6), and FINISH (col 7) */}
          <div className="board-row grid-row">
            {(() => { currentRow = 5; return null; })()}
            {/* Empty spaces on left */}
            {self.createInvisibleSpace(5, 0)}
            {self.createInvisibleSpace(5, 1)}
            {self.createInvisibleSpace(5, 2)}
            
            {/* Construction */}
            {getSpaceOrInvisible(spacesByType['CONSTRUCTION'], 0, 3)}
            {getSpaceOrInvisible(spacesByType['CONSTRUCTION'], 1, 4)}
            {getSpaceOrInvisible(spacesByType['CONSTRUCTION'], 2, 5)}
            
            {/* REG-DOB-FINAL-REVIEW placed directly under REG-DOB-PROF-CERT (col 6) */}
            {getSpaceOrInvisible(spacesByType['REGULATORY_DOB'], 5, 6)}
            
            {/* FINISH placed directly under DOB-AUDIT (col 7) */}
            {getSpaceOrInvisible(spacesByType['FINISH'], 0, 7)}
          </div>
        </div>
      </div>
    );
  }
};

// Initialize board layout class
document.addEventListener('DOMContentLoaded', function() {
  // Add class to body for space explorer state detection
  const hasSpaceExplorer = document.querySelector('.space-explorer');
  if (hasSpaceExplorer) {
    document.body.classList.add('space-explorer-active');
  }
  
  console.log('BoardSpaceRenderer: DOM ready, board layout initialized');
});

console.log('BoardSpaceRenderer.js code execution finished');