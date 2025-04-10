// Remove the incorrectly placed row component that was added outside the render method
// BoardSpaceRenderer.js - Handles rendering of board spaces
console.log('BoardSpaceRenderer.js file is beginning to be used');
console.log('BoardSpaceRenderer: Fixed board layout - standardized space sizes to 120px width × 60px height with column 3 at exactly 50px width, eliminated row spacing completely (0px), aligned all spaces for better visual layout, and made empty spaces visible for debugging');

// Immediately inject the grid layout styles to prevent double rendering
(function() {
  console.log('Applying grid layout styles with fixed row spacing');
  
  // Always recreate the style element to ensure it's applied
  // Remove existing style element if it exists
  const existingStyle = document.getElementById('grid-layout-styles');
  if (existingStyle) {
    existingStyle.parentNode.removeChild(existingStyle);
    console.log('Removed existing grid-layout-styles');
  }
  
  // Create new style element
  const styleEl = document.createElement('style');
  styleEl.id = 'grid-layout-styles';
  styleEl.textContent = `
  /* Grid layout styles */
  .game-board.full-width.grid-layout {
    height: auto !important;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
    overflow: hidden !important;
  }
  
  .board-row.grid-row {
    display: grid !important;
    /* Non-uniform grid with column 3 at 50px */
    grid-template-columns: 120px 120px 50px 120px 120px 120px 120px 120px !important;
    gap: 5px !important; /* Reduced gap between columns */
    justify-content: flex-start !important; /* Align to the left */
    width: calc(7 * 120px + 50px + 7 * 5px) !important; /* Fixed exact width accounting for 50px column and larger spaces */
    max-width: calc(7 * 120px + 50px + 7 * 5px) !important; /* Explicitly limit width */
    height: 60px !important; /* Reduced row height */
    margin: 0 !important; /* Left-align the grid */
    margin-bottom: 0 !important; /* FIXED: Changed from 2px to 0px - minimizing row spacing to 0 */
    margin-top: 0 !important; /* Ensure no top margin */
    padding: 0 !important; /* Remove any padding */
    box-sizing: border-box !important; /* Apply box-sizing */
    overflow: hidden !important; /* Prevent overflow that might create extra space */
    flex-wrap: nowrap !important; /* Prevent wrapping of columns */
    line-height: 0 !important; /* Remove line-height spacing */
  }

  /* Ensure the main board area is contained properly */
  .main-board-area {
    width: calc(7 * 120px + 50px + 7 * 5px) !important; /* Fixed exact width with 50px col 3 and larger spaces */
    max-width: calc(7 * 120px + 50px + 7 * 5px) !important; /* Match row width */
    margin: 0 !important; /* Remove auto margins for tighter fit */
    padding: 0 !important; /* Remove any padding */
    box-sizing: border-box !important;
    overflow: hidden !important; /* Prevent overflow */
    display: flex !important; /* FIXED: Changed from grid to flex for better control */
    flex-direction: column !important; /* Stack rows vertically */
    gap: 0 !important; /* FIXED: Reduced from 2px to 0px to eliminate row spacing */
    font-size: 0 !important; /* Fix for unexpected spacing */
    line-height: 0 !important; /* Fix for unexpected spacing */
    border-spacing: 0 !important; /* Fix for unexpected spacing */
  }
  
  .board-space {
    width: 120px !important; /* Keep 120px width */
    height: 60px !important; /* Reduce height to 60px */
    min-width: 120px !important; /* Force minimum width */
    min-height: 60px !important; /* Force minimum height */
    max-width: 120px !important; /* Force maximum width */
    max-height: 60px !important; /* Force maximum height */
    box-sizing: border-box !important;
    position: relative !important;
    padding: 5px !important;
    border-radius: 5px !important;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    word-break: break-word;
    overflow: hidden;
    flex-shrink: 0 !important; /* Prevent shrinking */
    flex-grow: 0 !important; /* Prevent growing */
  }
  
  /* No longer need to scale the board since space explorer is always visible */
  .space-explorer-active .game-board.grid-layout {
    /* scaling removed */
    transition: none;
  }
  
  .board-space.empty-space {
    /* Make visible instead of hidden */
    visibility: visible;
    background: rgba(200, 200, 200, 0.3);
    border: 1px dashed #999;
    box-shadow: none;
    cursor: default;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    font-size: 10px;
  }

  /* Column 3 spaces are half-size */
  .column-3-space {
    width: 50px !important; /* Half-width for column 3 */
    height: 60px !important; /* Match the reduced height */
    min-width: 50px !important; /* Force minimum width */
    min-height: 60px !important; /* Force minimum height */
    max-width: 50px !important; /* Force maximum width */
    max-height: 60px !important; /* Force maximum height */
    margin: 0 !important; /* No need for margin since the grid column is now 50px */
    flex-shrink: 0 !important; /* Prevent shrinking */
    flex-grow: 0 !important; /* Prevent growing */
  }
  
  /* Force override any other row styling that might be causing gaps */
  .board-row {
    margin-top: 0 !important;
    margin-bottom: 0 !important; /* Changed from 2px to 0px */
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    border-spacing: 0 !important;
    font-size: inherit !important; /* Fix for unexpected spacing */
    line-height: normal !important; /* Reset line height for content */
  }
  
  .board-space.empty-space:hover {
    transform: none;
    box-shadow: none;
    border: none;
  }
  
  /* Style for the explorer hint inside the clicked space */
  .space-enhanced-info {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    z-index: 10;
  }
  
  .explorer-hint {
    color: white;
    font-weight: bold;
    font-size: 12px;
    text-align: center;
    padding: 5px;
  }
  `;
  
  // Add main style element to document head
  document.head.appendChild(styleEl);
  console.log('Added grid-layout-styles to document head');
  
  // Create new style element to fix spacing issues
  // Completely recreate/override any existing styles to ensure it works
  const fixSpacingEl = document.createElement('style');
  fixSpacingEl.id = 'board-spacing-fix';
  fixSpacingEl.textContent = `
  /* Enforce board space dimensions */
  .board-space {
    width: 120px !important;
    height: 60px !important;
    min-width: 120px !important;
    min-height: 60px !important;
    max-width: 120px !important;
    max-height: 60px !important;
    flex: 0 0 120px !important;
  }
  
  .column-3-space {
    width: 50px !important;
    height: 60px !important;
    min-width: 50px !important;
    min-height: 60px !important;
    max-width: 50px !important;
    max-height: 60px !important;
    flex: 0 0 50px !important;
  }

  /* Direct fix for row gaps */
  .main-board-area > div {
    margin-bottom: 0 !important; /* Changed from 2px to 0px */
    margin-top: 0 !important;
    border-spacing: 0 !important;
    border: none !important;
    padding: 0 !important;
  }
  
  .board-row, .board-row.grid-row {
    margin-bottom: 0 !important; /* Changed from 2px to 0px */
    margin-top: 0 !important;
    height: 60px !important; /* Updated to match reduced space height */
    outline: none !important;
    vertical-align: top !important; /* Fix potential alignment issues */
  }
  
  /* We need this override to ensure the spacing is minimized */
  .main-board-area {
    gap: 0 !important; /* Changed from 2px to 0px */
    row-gap: 0 !important;
    column-gap: 0 !important;
  }
  
  /* Additional fix for any hidden spacing issues */
  .main-board-area > *:not(:last-child) {
    margin-bottom: 0 !important;
    border-bottom: 0 !important;
  }
  
  /* Add more specific styling to eliminate the large empty space at the bottom of the board */
  .game-board.grid-layout::after {
    content: none !important; /* Prevent browser from adding any pseudo-elements that might create space */
    display: none !important;
  }
  
  /* Fix the whitespace issue that shows up as a big gap after the last row */
  .game-board.grid-layout .main-board-area::after {
    content: none !important;
    display: none !important;
  }
  
  /* Adjust overall game board container sizing */
  .game-board.full-width.grid-layout {
    height: auto !important; /* Only take up as much space as needed */
    padding-bottom: 0 !important; /* Remove any padding at the bottom */
    margin-bottom: 0 !important; /* Remove any margin at the bottom */
    overflow: hidden !important; /* Hide any overflow */
  }
  
  /* Fix the empty space after rows */
  .board-row.grid-row:last-child {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
    .board-space {
      width: 120px !important;
      height: 60px !important;
      min-width: 120px !important;
      min-height: 60px !important;
      max-width: 120px !important;
      max-height: 60px !important;
      flex: 0 0 120px !important;
    }
    
    .column-3-space {
      width: 50px !important;
      height: 60px !important;
      min-width: 50px !important;
      min-height: 60px !important;
      max-width: 50px !important;
      max-height: 60px !important;
      flex: 0 0 50px !important;
    }
  }
  `;
  document.head.appendChild(fixSpacingEl);
  console.log('Added additional spacing fix styles');
  
  // Create comprehensive whitespace fix style element
  const whitespaceFixEl = document.createElement('style');
  whitespaceFixEl.id = 'whitespace-fix';
  whitespaceFixEl.textContent = `
  /* Completely eliminate the large white space at the bottom of the board */
  .game-board-wrapper {
    overflow: hidden !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  
  /* Fix the main game board container */
  .game-board.grid-layout {
    min-height: auto !important;
    max-height: none !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
    overflow: hidden !important;
  }
  
  /* Ensure the main board area doesn't create extra space */
  .main-board-area {
    overflow: visible !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }
  
  /* Make sure board spaces are fully visible */
  .board-space {
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Remove any bottom padding from the last row */
  .board-row.grid-row:last-child {
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
    border-bottom: none !important;
  }
  
  /* Target any hidden containers that might be causing whitespace */
  .game-board-wrapper > div:empty,
  .game-board > div:empty,
  .main-board-area > div:empty {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Eliminate any hidden elements causing gaps */
  .game-board::after,
  .main-board-area::after,
  .board-row::after {
    content: none !important;
    display: none !important;
    height: 0 !important;
    width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
`;
  document.head.appendChild(whitespaceFixEl);
  console.log('Added comprehensive whitespace fix to eliminate extra space in board');

  // Create additional style element to fix the truncated board issue
  const fixTruncationEl = document.createElement('style');
  fixTruncationEl.id = 'board-truncation-fix';
  fixTruncationEl.textContent = `
  /* Fix for the truncated board spaces */
  .game-board.grid-layout {
    min-width: 1050px !important;
    max-width: none !important;
    width: auto !important;
    overflow: visible !important;
  }

  /* Fix the grid row to ensure all spaces are visible */
  .board-row.grid-row {
    min-width: 1000px !important;
    max-width: none !important;
    width: auto !important;
    overflow: visible !important;
  }

  /* Fix the game board wrapper to ensure proper display */
  .game-board-wrapper {
    overflow: visible !important;
    min-width: 1050px !important;
  }

  /* Fix individual spaces to ensure they're visible */
  .board-space {
    opacity: 1 !important;
    visibility: visible !important;
  }
  `;
  document.head.appendChild(fixTruncationEl);
  console.log('Added truncation fix to ensure all spaces are visible');


  
  // Check if observer already exists
  if (!window.boardSpaceObserver) {
    // Observer to detect when space explorer opens
    window.boardSpaceObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          const spaceExplorer = document.querySelector('.space-explorer');
          if (spaceExplorer) {
            document.body.classList.add('space-explorer-active');
          } else {
            document.body.classList.remove('space-explorer-active');
          }
          
          // Enforce correct sizes on all board spaces whenever DOM changes
          const allSpaces = document.querySelectorAll('.board-space:not(.column-3-space)');
          const column3Spaces = document.querySelectorAll('.column-3-space');
          
          // Apply direct style overrides to ensure 120px × 60px size
          allSpaces.forEach(space => {
            space.style.width = '120px';
            space.style.height = '60px';
            space.style.minWidth = '120px';
            space.style.minHeight = '60px';
            space.style.maxWidth = '120px';
            space.style.maxHeight = '60px';
            space.style.flexShrink = '0';
            space.style.flexGrow = '0';
            space.style.flex = '0 0 120px';
          });
          
          // Set fixed dimensions on column 3 spaces
          column3Spaces.forEach(space => {
            space.style.width = '50px';
            space.style.height = '60px';
            space.style.minWidth = '50px';
            space.style.minHeight = '60px';
            space.style.maxWidth = '50px';
            space.style.maxHeight = '60px';
            space.style.flexShrink = '0';
            space.style.flexGrow = '0';
            space.style.flex = '0 0 50px';
          });
        }
      });
    });
    
    // Start observing when document body is available
    if (document.body) {
      window.boardSpaceObserver.observe(document.body, { childList: true, subtree: true });
      
      // Also set up a resize observer to maintain sizing when window changes
      window.boardSpaceResizeObserver = new ResizeObserver(entries => {
        // Force correct sizing on resize
        const allSpaces = document.querySelectorAll('.board-space:not(.column-3-space)');
        const column3Spaces = document.querySelectorAll('.column-3-space');
        
        allSpaces.forEach(space => {
          space.style.width = '120px';
          space.style.height = '60px';
          space.style.minWidth = '120px';
          space.style.minHeight = '60px';
          space.style.maxWidth = '120px';
          space.style.maxHeight = '60px';
        });
        
        column3Spaces.forEach(space => {
          space.style.width = '50px';
          space.style.height = '60px';
          space.style.minWidth = '50px';
          space.style.minHeight = '60px';
          space.style.maxWidth = '50px';
          space.style.maxHeight = '60px';
        });
      });
      
      // Observe the game board
      const gameBoard = document.querySelector('.game-board');
      if (gameBoard) {
        window.boardSpaceResizeObserver.observe(gameBoard);
      }
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        window.boardSpaceObserver.observe(document.body, { childList: true, subtree: true });
        
        // Set up resize observer on DOMContentLoaded as well
        window.boardSpaceResizeObserver = new ResizeObserver(entries => {
          // Force correct sizing on resize
          const allSpaces = document.querySelectorAll('.board-space:not(.column-3-space)');
          const column3Spaces = document.querySelectorAll('.column-3-space');
          
          allSpaces.forEach(space => {
            space.style.width = '120px';
            space.style.height = '60px';
            space.style.minWidth = '120px';
            space.style.minHeight = '60px';
            space.style.maxWidth = '120px';
            space.style.maxHeight = '60px';
          });
          
          column3Spaces.forEach(space => {
            space.style.width = '50px';
            space.style.height = '60px';
            space.style.minWidth = '50px';
            space.style.minHeight = '60px';
            space.style.maxWidth = '50px';
            space.style.maxHeight = '60px';
          });
        });
        
        // Observe the game board
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
          window.boardSpaceResizeObserver.observe(gameBoard);
        }
      });
    }
  }
})();

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
      classes.push('destination-marked'); // Add additional class for better visibility
    }
    if (hasDiceRoll) classes.push('has-dice-roll');
    
    // Format the visit type text
    const visitTypeText = space.visitType ? 
      (space.visitType.toLowerCase() === 'first' ? 'First Visit' : 'Subsequent Visit') : '';
    
    // Prepare inline style for selected move to ensure it's always visible
    const spaceStyle = {};
    if (isSelectedMove) {
      // Add a red highlight border for the selected move
      spaceStyle.borderColor = '#e74c3c';
      spaceStyle.borderWidth = '3px';
      spaceStyle.boxShadow = '0 0 8px rgba(231, 76, 60, 0.7)';
    }
    
    return (
      <div 
        key={space.id} 
        className={classes.join(' ')}
        onClick={() => onSpaceClick && onSpaceClick(space.id)}
        style={spaceStyle}
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
          
          {/* Space Explorer is now always visible - no longer need to show a message */}
          
          {/* Selected move indicator - shows a visible tag */}
          {isSelectedMove && (
          <div className="destination-tag" style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            backgroundColor: '#e74c3c',
            color: 'white',
            padding: '3px 6px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 'bold',
            zIndex: 5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Destination
          </div>
        )}
          
        {/* Removed move indicator with details - Space Explorer now provides this functionality */}
        {/* Green move details bubble has been removed as requested */}
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
  renderEmptySpace: function(row, col, halfWidth = false) {
    this.logMethodCall('renderEmptySpace');
    const isColumn3 = col === 2; // Column 3 is 0-indexed as 2
    const className = isColumn3 ? "board-space empty-space column-3-space" : "board-space empty-space";
    
    return (
      <div 
        key={`empty-${row}-${col}`} 
        className={className} 
        style={{
          backgroundColor: 'rgba(240, 240, 240, 0.2)',
          border: '1px dashed #ddd',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
          /* No need to specify width/height as it comes from the classes */
        }}
      >
        {/* Show the coordinates so we can identify each empty space */}
        <span style={{fontSize: '9px', color: '#ccc'}}>{`${row}-${col}`}</span>
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
        style={{ 
          visibility: 'visible', /* Make empty spaces visible */
          backgroundColor: 'rgba(240, 240, 240, 0.2)',
          border: '1px dashed #ddd',
          boxShadow: 'none'
          /* No need to specify width/height as it comes from the classes */
        }}
      >
        <span style={{fontSize: '9px', color: '#ccc'}}>{`${row}-${col}`}</span>
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
          
          {/* Row 6 removed since FINISH is now in row 5 */}
          
          {/* Extra column 8 removed - board now uses 8 columns total */}
        </div>
      </div>
    );
  }
};

console.log('BoardSpaceRenderer.js code execution finished');