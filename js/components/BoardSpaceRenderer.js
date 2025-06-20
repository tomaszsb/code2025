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

  // Determine path type for visual styling
  getPathType: function(space) {
    if (!space) return 'main';
    
    // Check for path property first
    if (space.path) {
      const path = space.path.toLowerCase();
      if (path.includes('main')) return 'main';
      if (path.includes('special')) return 'special';
      if (path.includes('side')) return 'side-quest';
    }
    
    // Fallback to space type categorization
    const spaceName = space.space_name ? space.space_name.toLowerCase() : '';
    const spaceType = space.phase ? space.phase.toLowerCase() : '';
    
    // Special path detection
    if (spaceName.includes('cheat') || spaceName.includes('decision')) {
      return 'special';
    }
    
    // Side quest detection
    if (spaceName.includes('side') || spaceName.includes('optional')) {
      return 'side-quest';
    }
    
    // Main path by default
    return 'main';
  },

  // Calculate progress percentage for phase visualization
  getPhaseProgress: function(space, currentPlayer) {
    if (!space || !currentPlayer) return 0;
    
    // Simple progress calculation based on space type and player position
    const phaseOrder = ['setup', 'funding', 'design', 'regulatory', 'construction'];
    const spaceType = space.phase ? space.phase.toLowerCase() : '';
    const currentPhaseIndex = phaseOrder.indexOf(spaceType);
    
    if (currentPhaseIndex === -1) return 0;
    
    return Math.min(100, (currentPhaseIndex / (phaseOrder.length - 1)) * 100);
  },

  // Check if a space has dice roll options
  hasDiceRollOptions: function(space, diceRollData) {
    this.logMethodCall('hasDiceRollOptions');
    if (!diceRollData || diceRollData.length === 0 || !space) return false;
    
    // Check if there are entries for this space in the dice roll data
    return diceRollData.some(data => data['space_name'] === space.space_name);
  },

  // Render a single board space
  renderSpace: function(space, index, props) {
    this.logMethodCall('renderSpace');
    console.log(`BoardSpaceRenderer: Rendering space ${space.space_name} at index ${index}`);
    const { players, selectedSpace, selectedMove, onSpaceClick, availableMoves, diceRollData } = props;
    
    // Ensure the space has the right visit type based on player's visit history
    if (window.GameState && players.length > 0) {
      const currentPlayer = window.GameState.getCurrentPlayer();
      if (currentPlayer && space) {
        const spaceName = window.movementEngine?.extractSpaceName?.(space.space_name) || space.space_name;
        const hasVisited = window.movementEngine?.hasPlayerVisitedSpace?.(currentPlayer, spaceName) || false;
        
        // Force the correct visit type based on visit history
        const correctVisitType = hasVisited ? 'subsequent' : 'first';
        if (space.visit_type !== correctVisitType) {
          console.log(`BoardSpaceRenderer: Correcting visit type for ${spaceName} from ${space.visit_type} to ${correctVisitType}`);
          space.visit_type = correctVisitType;
        }
      }
    }
    
    // Find players on this space
    const playersOnSpace = players.filter(player => player.position === space.space_name);
    
    // Find players who are moving to this space (their previous position was different)
    const playersMovingToSpace = players.filter(player => 
      player.position === space.space_name && 
      player.previousPosition !== null && 
      player.previousPosition !== player.position
    );
    
    // Find players who just moved from this space
    const playersMovedFromSpace = players.filter(player => 
      player.previousPosition === space.space_name && 
      player.position !== space.space_name
    );
    
    // Check if this space is an available move
    const isAvailableMove = availableMoves.some(move => move.name === space.space_name);
    
    // Check if this is the selected destination for the current turn
    const isSelectedMove = selectedMove === space.space_name;
    
    // Log when a space is marked as available or selected for debugging
    if (isAvailableMove) {
      console.log(`BoardSpaceRenderer: Space ${space.space_name} is marked as an available move`);
    }
    if (isSelectedMove) {
      console.log(`BoardSpaceRenderer: Space ${space.space_name} is marked as the SELECTED move destination`);
    }
    
    // Check if this space has dice roll options
    const hasDiceRoll = this.hasDiceRollOptions(space, diceRollData);
    
    // Determine CSS classes
    const classes = ['board-space'];
    if (space.type) classes.push(`space-type-${space.type.toLowerCase()}`);
    if (selectedSpace === space.space_name) classes.push('selected');
    if (isAvailableMove) classes.push('available-move');
    if (isSelectedMove) {
      classes.push('selected-move');
      classes.push('enlarged');
      classes.push('destination-marked'); 
    }
    if (hasDiceRoll) classes.push('has-dice-roll');
    
    // Add path-based styling
    const pathType = this.getPathType(space);
    if (pathType) classes.push(`path-${pathType}`);
    
    // Add visit status classes
    if (space.visit_type) {
      const visitType = space.visit_type.toLowerCase();
      classes.push(visitType === 'first' ? 'first-visit' : 'subsequent-visit');
    }
    
    // Format the visit type text
    let visitTypeText = '';
    if (space.visit_type) {
      // Normalize to lowercase for consistent comparison
      const visitType = space.visit_type.toLowerCase();
      visitTypeText = visitType === 'first' ? 'First Visit' : 'Subsequent Visit';
      
      // Enhanced debugging to track visit type rendering
      console.log(`BoardSpaceRenderer: Rendering ${space.space_name} with visit type: ${visitType} -> ${visitTypeText}`);
      
      // Check if this space should be marked as visited
      if (players.length > 0) {
        const currentPlayer = window.GameState.getCurrentPlayer();
        if (currentPlayer) {
          const spaceName = window.movementEngine?.extractSpaceName?.(space.space_name) || space.space_name;
          const hasVisited = window.movementEngine?.hasPlayerVisitedSpace?.(currentPlayer, spaceName) || false;
          console.log(`BoardSpaceRenderer: Space ${spaceName} visited status check: ${hasVisited}, displayed type: ${visitType}`);
          
          // Alert in case of mismatch
          if ((hasVisited && visitType !== 'subsequent') || (!hasVisited && visitType !== 'first')) {
            console.warn(`BoardSpaceRenderer: MISMATCH - Visit status ${hasVisited} doesn't match displayed type ${visitType} for ${spaceName}`);
          }
        }
      }
    }
    
    return (
      <div 
        key={space.space_name} 
        className={classes.join(' ')}
        data-space-id={space.space_name}
        onClick={() => onSpaceClick && onSpaceClick(space.space_name)}
      >
        {/* Space type indicator */}
        {space.phase && (
          <div className="space-type-indicator">
            {space.phase.toUpperCase()}
          </div>
        )}
        
        {/* Phase progress indicator */}
        {space.phase && (
          <div className={`phase-progress ${space.phase.toLowerCase()}`}></div>
        )}
        
        <div className="space-content">
          <div className="space-name">{space.space_name}</div>
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
          
          {/* Progress indicator for current player */}
          {players.length > 0 && (
            <div className="progress-indicator">
              <div 
                className="progress-bar" 
                style={{ width: `${this.getPhaseProgress(space, window.GameState.getCurrentPlayer())}%` }}
              ></div>
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
                const previousSpace = window.GameState.spaces.find(s => s.space_name === player.previousPosition);
                const currentSpace = window.GameState.spaces.find(s => s.space_name === player.position);
                
                if (previousSpace && currentSpace) {
                  console.log(`BoardSpaceRenderer: Player ${player.name} moved from ${previousSpace.space_name} to ${currentSpace.space_name}`);
                  animationClass = 'player-moved-in';
                }
              }
              
              return (
                <div 
                  key={player.id}
                  className={`player-token ${isCurrentPlayer ? 'current-player' : ''} ${animationClass}`}
                  data-player-id={player.id}
                  style={{ backgroundColor: player.color }}
                  title={player.name}
                >
                  {/* Your Turn indicator - only visible when enhanced by TurnManager */}
                  {isCurrentPlayer && (
                    <div className="your-turn-indicator">YOUR TURN</div>
                  )}
                </div>
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
      const spaceName = space.space_name.toUpperCase();
      
      // Categorize based on space type and name
      if (space.phase && space.phase.toUpperCase() === 'SETUP') {
        spacesByType['SETUP'].push(space);
        assigned = true;
      } else if (space.phase && space.phase.toUpperCase() === 'FUNDING') {
        spacesByType['FUNDING'].push(space);
        assigned = true;
      } else if (space.phase && space.phase.toUpperCase() === 'DESIGN') {
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
      } else if (space.phase && space.phase.toUpperCase() === 'REGULATORY') {
        // Split regulatory spaces into DOB and FDNY
        if (spaceName.includes('DOB')) {
          spacesByType['REGULATORY_DOB'].push(space);
          assigned = true;
        } else if (spaceName.includes('FDNY')) {
          spacesByType['REGULATORY_FDNY'].push(space);
          assigned = true;
        }
      } else if (space.phase && space.phase.toUpperCase() === 'CONSTRUCTION') {
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
    
    // Debug: Log how many spaces are in each category
    console.log('BoardSpaceRenderer: Space categorization results:');
    Object.entries(spacesByType).forEach(([category, spaces]) => {
      console.log(`  ${category}: ${spaces.length} spaces`);
      if (spaces.length > 0) {
        spaces.forEach(space => console.log(`    - ${space.space_name} (${space.phase})`));
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
      if (space.space_name && (space.space_name.includes('START - Quick play guide') || space.space_name.includes('START-QUICK-PLAY-GUIDE'))) {
        return;
      }
      
      // Extract the base space name
      const spaceName = window.movementEngine?.extractSpaceName?.(space.space_name) || space.space_name;
      
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
      
      // Get all spaces matching this name
      const matchingSpaces = spaces.filter(s => 
        (window.movementEngine?.extractSpaceName?.(s.space_name) || s.space_name) === spaceName &&
        s.phase && s.phase.toUpperCase() === 'SETUP'
      );
      
      // Check if player has visited this space before
      const hasVisited = currentPlayer && (window.movementEngine?.hasPlayerVisitedSpace?.(currentPlayer, spaceName) || false);
      const requiredVisitType = hasVisited ? 'subsequent' : 'first';
      
      console.log(`BoardSpaceRenderer: OWNER-SCOPE-INITIATION visit type should be: ${requiredVisitType}`);
      console.log(`BoardSpaceRenderer: Has visited space? ${hasVisited}`);
      console.log(`BoardSpaceRenderer: Found ${matchingSpaces.length} matching spaces for ${spaceName}`);
      
      // Extra debugging - log all matching spaces
      matchingSpaces.forEach(s => {
      console.log(`BoardSpaceRenderer: Found space variant - Name: ${s.space_name}, Visit Type: ${s.visit_type}`);
      });
        
      // Look for a space with the appropriate visit type first
      let appropriateSpace = matchingSpaces.find(s => 
      s.visit_type && s.visit_type.toLowerCase() === requiredVisitType
      );
      
      // If appropriate visit type space not found, try to fix it
      if (!appropriateSpace) {
        console.log(`BoardSpaceRenderer: Could not find OWNER-SCOPE-INITIATION with ${requiredVisitType} visit type, using fallback`);
        
        // First try to find any variant of this space
        if (matchingSpaces.length > 0) {
          // Create a clone of the first matching space and set the correct visit type
          console.log(`BoardSpaceRenderer: Creating modified space with correct visit type: ${requiredVisitType}`);
          appropriateSpace = { ...matchingSpaces[0], visit_type: requiredVisitType };
        } else {
          // Last resort - find any space with this name
          const anyMatchingSpace = spaces.find(s => 
            (window.movementEngine?.extractSpaceName?.(s.space_name) || s.space_name) === spaceName
          );
          
          if (anyMatchingSpace) {
            // Clone and set the correct visit type
            appropriateSpace = { ...anyMatchingSpace, visit_type: requiredVisitType };
          }
        }
      }
  
    if (appropriateSpace) {
      // Force standardize position properties for consistent alignment
      const standardizedSpace = { ...appropriateSpace };
      
      // Log the visit type that will be displayed
      console.log(`BoardSpaceRenderer: Using space with visit type: ${standardizedSpace.visit_type}`);
      
      filteredSpaces.push(standardizedSpace);
      addedSpaceNames.add(spaceName);
      
      console.log(`BoardSpaceRenderer: Added ${spaceName} with visit type: ${standardizedSpace.visit_type}`);
    } else {
      console.log(`BoardSpaceRenderer: Failed to find any matching space for ${spaceName}`);
    }
    
    return; // Skip regular processing for this space
      }
      
      // If there's a current player, use visit history to filter
      if (currentPlayer) {
        // Always show the current player's position
        if (space.space_name === currentPlayer.position) {
          filteredSpaces.push(space);
          addedSpaceNames.add(spaceName);
          return;
        }
        
        // Determine if player has visited this space
        const hasVisited = window.movementEngine?.hasPlayerVisitedSpace?.(currentPlayer, spaceName) || false;
        
        // Determine required visit type
        const requiredVisitType = hasVisited ? 'subsequent' : 'first';
        
        // Log visit type determination for debugging
        const isCurrentSpace = currentPlayer && space.space_name === currentPlayer.position;
        if (!isCurrentSpace) { // Don't log current space to reduce console noise
          console.log(`BoardSpaceRenderer: Regular space ${spaceName} - has visited: ${hasVisited}, required visit type: ${requiredVisitType}`);
        }
        
        // Get all spaces matching this name
        const matchingSpaces = spaces.filter(s => 
        (window.movementEngine?.extractSpaceName?.(s.space_name) || s.space_name) === spaceName
        );
        
        // First, find any variant of this space
        let appropriateSpace = null;
        
        // Look for a space with the required visit type
        appropriateSpace = matchingSpaces.find(s => 
          s.visit_type && s.visit_type.toLowerCase() === requiredVisitType
        );
        
        // If no match found, take the first match and modify its visit type
        if (!appropriateSpace && matchingSpaces.length > 0) {
        console.log(`BoardSpaceRenderer: Creating modified space with correct visit type: ${requiredVisitType} for ${spaceName}`);
        // Create a clone and set the correct visit type
        appropriateSpace = { ...matchingSpaces[0], visit_type: requiredVisitType };
      }
        
        // If we found any match, use it
        if (appropriateSpace) {
          filteredSpaces.push(appropriateSpace);
          addedSpaceNames.add(spaceName);
        } else if (!isCurrentSpace) {
          // Check if this space matches the required visit type as a fallback
          if (space.visit_type && space.visit_type.toLowerCase() === requiredVisitType) {
            filteredSpaces.push(space);
            addedSpaceNames.add(spaceName);
          } else {
            // Last resort - use the original space but log warning
            console.log(`BoardSpaceRenderer: Warning - using original space with incorrect visit type for ${spaceName}`);
            filteredSpaces.push(space);
            addedSpaceNames.add(spaceName);
          }
        }
      } else {
        // If no current player, show all first visit spaces
        if (space.visit_type && space.visit_type.toLowerCase() === 'first') {
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
    console.log(`BoardSpaceRenderer: renderBoard called with ${spaces ? spaces.length : 0} spaces`);
    if (!spaces || spaces.length === 0) {
      console.log('BoardSpaceRenderer: No spaces to render, returning null');
      return null;
    }
    
    // Get current player from GameState
    const currentPlayer = window.GameState.getCurrentPlayer();
    
    // Filter spaces based on visit history
    const filteredSpaces = this.filterSpaces(spaces, currentPlayer);
    console.log(`BoardSpaceRenderer: After filtering, ${filteredSpaces.length} spaces remain`);
    
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
  
  // Add listener for board refresh events
  window.addEventListener('refreshBoardDisplay', function() {
    console.log('BoardSpaceRenderer: Received refreshBoardDisplay event, forcing board re-render');
    
    // Force re-rendering by refreshing space classes
    const boardSpaces = document.querySelectorAll('.board-space');
    boardSpaces.forEach(space => {
      // Add a temporary class to trigger CSS animations
      space.classList.add('refreshing');
      
      // Remove the class after a short delay to complete the animation
      setTimeout(() => {
        space.classList.remove('refreshing');
      }, 50);
    });
  });
  
  console.log('BoardSpaceRenderer: DOM ready, board layout initialized');
});

console.log('BoardSpaceRenderer.js code execution finished');