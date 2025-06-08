// SpaceInfoMoves.js file is beginning to be used
console.log('SpaceInfoMoves.js file is beginning to be used');

/**
 * SpaceInfoMoves - Move-related functionality for the SpaceInfo component
 * 
 * This module contains methods for rendering available moves
 * Used as a mixin for the SpaceInfo component
 * 
 * FIXED: Re-enabled RETURN TO YOUR SPACE button for PM-DECISION-CHECK [2025-05-10]
 * FIXED: Only show return button for subsequent visits to PM-DECISION-CHECK [2025-05-10]
 * FIXED: Respect the visitType to determine if return button should appear [2025-05-10]
 * FIXED: Fixed correct identification of the original space [2025-05-10]
 * FIXED: Improved original space detection and return functionality [2025-05-14] 
 * PHASE 3: Added Logic Space integration with MovementEngine [2025-05-27]
 * PHASE 4: Fixed syntax errors and cleaned up duplicate methods [2025-05-27]
 */

// Create mixin object for SpaceInfo
window.SpaceInfoMoves = {
  /**
   * Render logic space UI with questions and navigation
   * @returns {JSX.Element} Logic space interface
   */
  renderLogicSpaceUI: function() {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    const { availableMoves } = this.props;
    
    // CRITICAL FIX: Check if logic space data is passed through availableMoves
    const logicSpaceData = availableMoves && availableMoves.length > 0 && availableMoves[0].isLogicSpace ? availableMoves[0] : null;
    
    if (!currentPlayer || !logicSpaceData) {
      return null;
    }
    
    console.log('SpaceInfoMoves: Rendering logic space UI with data:', logicSpaceData);
    
    // CRITICAL FIX: Check if we have selectable destinations first
    if (logicSpaceData.hasDestinations && logicSpaceData.selectableDestinations && logicSpaceData.selectableDestinations.length > 0) {
      console.log('SpaceInfoMoves: Rendering selectable destination buttons');
      
      const self = this;
      const selectedDest = this.state?.selectedDestination || logicSpaceData.selectedDestination;
      
      return React.createElement('div', { className: 'space-available-moves logic-selectable-destinations' }, [
        React.createElement('div', { key: 'label', className: 'space-section-label' }, '🎯 Select your destination:'),
        React.createElement('div', { key: 'buttons', className: 'logic-destination-buttons' }, 
          logicSpaceData.selectableDestinations.map((destination, index) => {
            console.log('SpaceInfoMoves: Creating selectable button for destination:', destination);
            
            const isSelected = selectedDest && selectedDest.id === destination.id;
            
            return React.createElement('button', {
              key: index,
              className: `move-button logic-destination-btn ${isSelected ? 'selected' : ''}`,
              onClick: function() {
                console.log('SpaceInfoMoves: SELECTABLE BUTTON CLICKED! Destination:', destination.name, destination.id);
                
                // CRITICAL FIX: Ensure proper state synchronization for End Turn button
                // Update local state first
                if (self.setState) {
                  self.setState({ selectedDestination: destination });
                }
                
                // Use SpaceSelectionManager to handle the move selection properly
                if (window.currentGameBoard && window.currentGameBoard.spaceSelectionManager) {
                  window.currentGameBoard.spaceSelectionManager.handleMoveSelection(destination.id);
                  console.log('SpaceInfoMoves: Move selection handled via SpaceSelectionManager');
                  
                  // CRITICAL FIX: Force GameBoard state update to enable End Turn button
                  window.currentGameBoard.setState({
                    selectedMove: destination.id,
                    hasSelectedMove: true,
                    exploredSpace: null // Will be set by SpaceSelectionManager
                  });
                  console.log('SpaceInfoMoves: FIXED - GameBoard state updated to enable End Turn button');
                } else {
                  console.log('SpaceInfoMoves: SpaceSelectionManager not available, using direct onMoveSelect');
                  const { onMoveSelect } = self.props;
                  if (onMoveSelect) {
                    onMoveSelect(destination.id);
                  }
                }
              },
              title: destination.description || destination.name
            }, destination.name || destination.description);
          })
        ),
        React.createElement('div', { key: 'instruction', className: 'selection-instruction' }, 
          'Click a destination above, then press "End Turn" to move'
        )
      ]);
    }
    
    // If we have current question data, render the question directly
    if (logicSpaceData.currentQuestion) {
      const questionData = logicSpaceData.currentQuestion;
      
      return React.createElement('div', { className: 'space-available-moves logic-space' }, [
        React.createElement('div', { key: 'label', className: 'space-section-label' }, '🧠 Logic Space - Decision Tree:'),
        React.createElement('div', { key: 'container', className: 'logic-question-container' }, [
          React.createElement('div', { key: 'question', className: 'logic-question' }, [
            React.createElement('h3', { key: 'text' }, questionData.question),
            React.createElement('div', { key: 'choices', className: 'logic-choices' }, [
              React.createElement('button', {
                key: 'yes',
                className: 'logic-choice-btn yes-btn',
                onClick: () => {
                  console.log('SpaceInfoMoves: YES button clicked');
                  this.handleLogicChoice(true);
                }
              }, 'YES'),
              React.createElement('button', {
                key: 'no', 
                className: 'logic-choice-btn no-btn',
                onClick: () => {
                  console.log('SpaceInfoMoves: NO button clicked');
                  this.handleLogicChoice(false);
                }
              }, 'NO')
            ])
          ])
        ])
      ]);
    }
    
    // Fallback to LogicSpaceManager if no direct question data
    if (!window.LogicSpaceManager) {
      return React.createElement('div', { className: 'space-available-moves logic-space-error' }, [
        React.createElement('div', { key: 'label', className: 'space-section-label' }, 'Logic Space:'),
        React.createElement('div', { key: 'error', className: 'logic-error' }, 'LogicSpaceManager not available')
      ]);
    }
    
    // EXISTING: Show current question if no destinations
    const questionData = window.LogicSpaceManager.getCurrentLogicQuestion();
    
    if (!questionData) {
      return React.createElement('div', { className: 'space-available-moves logic-space-error' }, [
        React.createElement('div', { key: 'label', className: 'space-section-label' }, 'Logic Space:'),
        React.createElement('div', { key: 'error', className: 'logic-error' }, 'Error loading logic question')
      ]);
    }

    return React.createElement('div', { className: 'space-available-moves logic-space' }, [
      React.createElement('div', { key: 'label', className: 'space-section-label' }, '🧠 Logic Space - Decision Tree:'),
      React.createElement('div', { key: 'container', className: 'logic-question-container' }, [
        React.createElement('div', { key: 'question', className: 'logic-question' }, [
          React.createElement('h3', { key: 'text' }, questionData.question),
          React.createElement('div', { key: 'choices', className: 'logic-choices' }, [
            React.createElement('button', {
              key: 'yes',
              className: 'logic-choice-btn yes-btn',
              onClick: () => {
                console.log('SpaceInfoMoves: YES button clicked (fallback)');
                this.handleLogicChoice(true);
              }
            }, 'YES'),
            React.createElement('button', {
              key: 'no', 
              className: 'logic-choice-btn no-btn',
              onClick: () => {
                console.log('SpaceInfoMoves: NO button clicked (fallback)');
                this.handleLogicChoice(false);
              }
            }, 'NO')
          ])
        ])
      ])
    ]);
  },

  /**
   * Handle logic choice selection
   * @param {boolean} choice - true for YES, false for NO
   */
  handleLogicChoice: function(choice) {
    console.log('SpaceInfoMoves: handleLogicChoice called with choice:', choice);
    
    if (!window.LogicSpaceManager) {
      console.error('SpaceInfoMoves: LogicSpaceManager not available');
      return;
    }

    const result = window.LogicSpaceManager.makeLogicChoice(choice);
    
    if (result) {
      console.log('SpaceInfoMoves: Logic choice result:', result);
      
      if (result.type === 'nextQuestion') {
        // CRITICAL FIX: Update the logic space data in GameBoard state instead of local state
        // Force a new question to be loaded by updating the availableMoves
        const newLogicSpaceData = {
          isLogicSpace: true,
          requiresLogicProcessing: true,
          spaceName: result.spaceName || 'REG-FDNY-FEE-REVIEW',
          currentQuestion: result.nextQuestion
        };
        
        // Update SpaceSelectionManager to refresh with new question
        if (window.currentGameBoard && window.currentGameBoard.spaceSelectionManager) {
          // Update GameBoard state with new logic question
          window.currentGameBoard.setState({
            availableMoves: [newLogicSpaceData],
            isLogicSpace: true
          });
          console.log('SpaceInfoMoves: Updated GameBoard with new logic question');
        }
        
        // Force SpaceInfo to re-render with new question
        if (this.setState) {
          this.setState(prevState => ({ renderKey: (prevState.renderKey || 0) + 1 }));
        }
        
      } else if (result.type === 'finalDestination') {
        // Show destination selection or auto-move
        this.handleLogicDestinations(result.destinations);
      } else if (result.type === 'selectableDestinations') {
        // FIXED: Handle FDNY-style destinations that require "end turn" button
        this.handleSelectableDestinations(result.destinations);
      }
    }
  },

  /**
   * Handle final destinations from logic space
   * @param {Array} destinations - Available destinations
   */
  handleLogicDestinations: function(destinations) {
    console.log('SpaceInfoMoves: handleLogicDestinations called with:', destinations);
    
    if (!destinations || destinations.length === 0) {
      console.error('SpaceInfoMoves: No destinations from logic space');
      return;
    }

    if (destinations.length === 1) {
      // Single destination - move automatically
      console.log('SpaceInfoMoves: Single destination, moving automatically to:', destinations[0]);
      const { onMoveSelect } = this.props;
      if (onMoveSelect) {
        onMoveSelect(destinations[0].id);
      }
    } else {
      // Multiple destinations - let UI show choices
      console.log('SpaceInfoMoves: Multiple destinations, setting state for UI display');
      this.setState(prevState => ({ 
        renderKey: prevState.renderKey + 1,
        logicDestinations: destinations 
      }));
      console.log('SpaceInfoMoves: State updated with logicDestinations');
    }
  },

  /**
   * Handle selectable destinations that require "end turn" button (FDNY-style)
   * @param {Array} destinations - Available destinations
   */
  handleSelectableDestinations: function(destinations) {
    console.log('SpaceInfoMoves: handleSelectableDestinations called with:', destinations);
    
    if (!destinations || destinations.length === 0) {
      console.error('SpaceInfoMoves: No selectable destinations from logic space');
      return;
    }

    // CRITICAL FIX: Update GameBoard state instead of local component state
    // Create a special logic space data object that indicates destinations are ready
    const destinationLogicSpaceData = {
      isLogicSpace: true,
      requiresLogicProcessing: false,
      spaceName: 'REG-FDNY-FEE-REVIEW',
      hasDestinations: true,
      selectableDestinations: destinations,
      selectedDestination: null
    };
    
    // Update GameBoard with selectable destinations
    if (window.currentGameBoard) {
      window.currentGameBoard.setState({
        availableMoves: [destinationLogicSpaceData],
        isLogicSpace: true,
        logicDestinations: destinations
      });
      console.log('SpaceInfoMoves: Updated GameBoard with selectable destinations');
    }
    
    // Also try to update SpaceInfo state if available
    if (this.setState) {
      this.setState(prevState => ({ 
        renderKey: (prevState.renderKey || 0) + 1,
        selectableDestinations: destinations,
        selectedDestination: null
      }));
    }
    
    console.log('SpaceInfoMoves: State updated with selectableDestinations');
  },

  /**
   * Get tooltip text for move buttons
   * @param {Object} move - Move object
   * @returns {string} Tooltip text
   */
  getMoveButtonTooltip: function(move) {
    const tooltips = [];
    
    if (move.isPermanentChoice) {
      if (move.isRepeatedChoice) {
        tooltips.push('This is your permanent choice from a previous visit');
      } else if (move.isFirstTimeChoice) {
        tooltips.push('⚠️ This choice is PERMANENT - you cannot change it later');
      }
    }
    
    if (move.fromOriginalSpace) {
      tooltips.push('Return to your original path');
    }
    
    if (move.fromDiceRoll) {
      tooltips.push('Determined by dice roll');
    }
    
    if (move.fromLogicSpace) {
      tooltips.push('Result of logic space decisions');
    }
    
    return tooltips.join(' • ') || move.description || move.name;
  },

  /**
   * Renders information about the original space for PM-DECISION-CHECK
   * @returns {JSX.Element|null} The original space info section or null
   */
  renderOriginalSpaceInfo: function() {
    const { space } = this.props;
    
    // Only show for PM-DECISION-CHECK spaces
    if (!space || space.name !== 'PM-DECISION-CHECK') {
      return null;
    }
    
    // Get current player
    const player = window.GameStateManager.getCurrentPlayer();
    if (!player) {
      return null;
    }
    
    // Get previous space (quest path)
    const previousSpaceId = player.previousPosition;
    let previousSpaceName = null;
    let cameFromQuestSide = false;
    
    if (previousSpaceId) {
      const previousSpace = window.GameStateManager.findSpaceById(previousSpaceId);
      if (previousSpace) {
        previousSpaceName = this.extractBaseName(previousSpace.name);
        // Check if player came from a side quest space using Path column
        cameFromQuestSide = previousSpace.Path && 
          previousSpace.Path.toLowerCase().includes('side quest');
      }
    }
    
    // Get original space info (main path)
    const originalSpaceId = player.properties?.originalSpaceId;
    let originalSpaceInfo = null;
    
    if (originalSpaceId) {
      const originalSpace = window.GameStateManager.findSpaceById(originalSpaceId);
      if (originalSpace) {
        originalSpaceInfo = this.extractBaseName(originalSpace.name);
      }
    }
    
    // FIXED: Always show both paths separately
    return React.createElement('div', { className: 'space-path-info-container' }, [
      React.createElement('div', { key: 'main', className: 'space-path-info main-path' }, [
        React.createElement('div', { key: 'label', className: 'path-info-label' }, 'Main Path:'),
        React.createElement('div', { key: 'content', className: 'path-info-content' }, 
          originalSpaceInfo ? 
            `Your last main path location was ${originalSpaceInfo}.` : 
            'No main path location recorded yet.'
        )
      ]),
      React.createElement('div', { key: 'quest', className: 'space-path-info quest-path' }, [
        React.createElement('div', { key: 'label', className: 'path-info-label' }, 'Quest Path:'),
        React.createElement('div', { key: 'content', className: 'path-info-content' }, 
          cameFromQuestSide && previousSpaceName ? 
            `Your last quest path location was ${previousSpaceName}.` : 
            'You are not coming from a quest path.'
        )
      ])
    ]);
  },

  /**
   * Renders available moves for the current space - PHASE 2: USE ENHANCED MOVEMENTENGINE
   * @returns {JSX.Element|null} The available moves section or null
   */
  renderAvailableMoves: function() {
    const { space, onMoveSelect, selectedMoveId, availableMoves } = this.props;
    
    // CRITICAL FIX: Skip rendering regular moves if this is a logic space
    if (availableMoves && availableMoves.length > 0 && availableMoves[0].isLogicSpace) {
      console.log('SpaceInfoMoves: Skipping regular moves rendering - this is a logic space');
      return null;
    }
    
    // PHASE 2 CHANGE: Use enhanced MovementEngine data from parent component
    // This eliminates duplicate MovementEngine calls and uses coordinated data
    if (!availableMoves || availableMoves.length === 0) {
      console.log('SpaceInfoMoves: No available moves from parent component');
      return null;
    }
    
    console.log('SpaceInfoMoves: Using enhanced MovementEngine data from parent:', availableMoves);
    
    return React.createElement('div', { className: 'space-available-moves' }, [
      React.createElement('div', { key: 'label', className: 'space-section-label' }, 'Available Moves:'),
      React.createElement('div', { key: 'list', className: 'available-moves-list', 'data-testid': 'moves-list' }, 
        availableMoves.map(move => {
          const isSelected = selectedMoveId && selectedMoveId === move.id;
          
          return React.createElement('button', {
            key: move.id,
            className: `move-button primary-move-btn ${isSelected ? 'selected' : ''}`,
            onClick: () => {
              console.log('SpaceInfoMoves: Move button clicked:', move.name, move.id);
              if (onMoveSelect) {
                onMoveSelect(move.id);
              }
            },
            title: this.getMoveButtonTooltip(move)
          }, move.name || move.description);
        })
      )
    ]);
  },

  
  // PHASE 3: Deleted SpaceInfoMoves.getAvailableMoves() - Business logic moved to MovementEngine in Phase 1
  
  /**
   * Helper to extract base name without visit type
   * @param {string} spaceId - The space ID or name
   * @returns {string} - The base name without visit type
   */
  extractBaseName: function(spaceId) {
    if (!spaceId) return '';
    // Remove visit type suffix and get just the base name
    return spaceId.split('-first')[0].split('-subsequent')[0];
  },
  
  /**
   * Gets moves for a specific space from game data - FIXED TO HANDLE {ORIGINAL_SPACE}
   * @param {Object} space - The space to get moves for
   * @returns {Array} - Array of move objects
   */
  getMovesForSpace: function(space) {
    console.log("SpaceInfoMoves: Getting moves for space:", space.name);
    
    if (!space || !window.GameStateManager || !window.GameStateManager.spaces) {
      console.log("SpaceInfoMoves: Missing space or GameStateManager");
      return [];
    }
    
    // Find the space data with "First" visit type (original moves)
    const spaceData = window.GameStateManager.spaces.find(s => 
      s.name === space.name && s['visit_type'] === 'First'
    );
    
    if (!spaceData) {
      console.log("SpaceInfoMoves: No space data found for:", space.name);
      return [];
    }
    
    console.log("SpaceInfoMoves: Found space data:", spaceData);
    
    // Extract destinations from Space 1-5 columns (like in the reference file)
    const rawDestinations = [
      spaceData["space_1"],
      spaceData["space_2"], 
      spaceData["space_3"],
      spaceData["space_4"],
      spaceData["space_5"]
    ].filter(dest => dest && dest.toString().trim() !== "" && dest !== "null" && dest !== "n/a");
    
    console.log("SpaceInfoMoves: Raw destinations from original space:", rawDestinations);
    
    // Clean and validate destinations
    const moves = [];
    rawDestinations.forEach(dest => {
      const destStr = dest.toString();
      
      // Skip invalid entries
      if (destStr === "n/a" || destStr.toLowerCase().includes("n/a")) {
        return;
      }
      
      // Extract space name (part before " - " if it exists)
      let spaceName = destStr;
      if (destStr.includes(" - ")) {
        spaceName = destStr.split(" - ")[0].trim();
      }
      
      // Skip PM-DECISION-CHECK to prevent loops
      if (spaceName === "PM-DECISION-CHECK") {
        return;
      }
      
      // Validate that this is a real space name
      const destinationSpace = window.GameStateManager.spaces.find(s => s.name === spaceName);
      if (destinationSpace) {
        moves.push({
          id: spaceName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase() + '-first',
          name: spaceName,
          description: destStr,
          type: 'original-space-move'
        });
        console.log("SpaceInfoMoves: Added move from original space:", spaceName);
      } else {
        console.log("SpaceInfoMoves: Space not found:", spaceName);
      }
    });
    
    console.log("SpaceInfoMoves: Final moves from original space:", moves.length, "moves");
    return moves;
  },
  
};

console.log('SpaceInfoMoves.js code execution finished');
console.log('SpaceInfoMoves.js updated to properly show original space moves in PM-DECISION-CHECK [2025-05-14]');
console.log('SpaceInfoMoves.js PHASE 4: Fixed syntax errors and cleaned up duplicate methods [2025-05-27]');
