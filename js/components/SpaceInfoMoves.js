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
    if (!currentPlayer || !window.LogicSpaceManager) {
      return null;
    }

    // FIXED: Check if we have selectable destinations (FDNY-style requiring "end turn")
    if (this.state && this.state.selectableDestinations && this.state.selectableDestinations.length > 0) {
      console.log('SpaceInfoMoves: DEBUG - Rendering selectable destination buttons, destinations:', this.state.selectableDestinations);
      
      const self = this; // Capture this context
      const selectedDest = this.state.selectedDestination;
      
      return React.createElement('div', { className: 'space-available-moves logic-selectable-destinations' }, [
        React.createElement('div', { key: 'label', className: 'space-section-label' }, '🎯 Select your destination:'),
        React.createElement('div', { key: 'buttons', className: 'logic-destination-buttons' }, 
          this.state.selectableDestinations.map((destination, index) => {
            console.log('SpaceInfoMoves: DEBUG - Creating selectable button for destination:', destination);
            
            const isSelected = selectedDest && selectedDest.id === destination.id;
            
            return React.createElement('button', {
              key: index,
              className: `move-button logic-destination-btn ${isSelected ? 'selected' : ''}`,
              onClick: function() {
                console.log('SpaceInfoMoves: SELECTABLE BUTTON CLICKED! Destination:', destination.name, destination.id);
                // Set selection but don't move yet - requires "end turn" button
                self.setState({ selectedDestination: destination });
                console.log('SpaceInfoMoves: Destination selected, waiting for end turn');
              },
              title: destination.description || destination.name
            }, destination.description || destination.name);
          })
        ),
        selectedDest ? React.createElement('div', { key: 'selected-info', className: 'selected-destination-info' }, 
          `Selected: ${selectedDest.name} (Press "End Turn" to move)`
        ) : React.createElement('div', { key: 'instruction', className: 'selection-instruction' }, 
          'Click a destination above, then press "End Turn" to move'
        )
      ]);
    }

    // FIXED: Check if we have final destinations to display
    if (this.state && this.state.logicDestinations && this.state.logicDestinations.length > 0) {
      console.log('SpaceInfoMoves: DEBUG - Rendering destination buttons, destinations:', this.state.logicDestinations);
      
      const self = this; // Capture this context
      
      return React.createElement('div', { className: 'space-available-moves logic-destinations' }, [
        React.createElement('div', { key: 'label', className: 'space-section-label' }, '🎯 Logic Complete! Choose your destination:'),
        React.createElement('div', { key: 'buttons', className: 'logic-destination-buttons' }, 
          this.state.logicDestinations.map((destination, index) => {
            console.log('SpaceInfoMoves: DEBUG - Creating button for destination:', destination);
            
            return React.createElement('button', {
              key: index,
              className: 'move-button logic-destination-btn',
              onClick: function() {
              console.log('SpaceInfoMoves: BUTTON CLICKED! Destination:', destination.name, destination.id);
              try {
              const { onMoveSelect } = self.props;
              console.log('SpaceInfoMoves: onMoveSelect available:', !!onMoveSelect);
              if (onMoveSelect) {
              console.log('SpaceInfoMoves: Calling onMoveSelect with ID:', destination.id);
              onMoveSelect(destination.id);
              console.log('SpaceInfoMoves: onMoveSelect called successfully');
              }
              // FIXED: Defer the local setState to prevent timing issues with GameBoard state update
              console.log('SpaceInfoMoves: Clearing logicDestinations (deferred)');
              setTimeout(() => {
                  self.setState({ logicDestinations: null });
              }, 50); // Small delay to allow GameBoard state to update first
              } catch (error) {
                  console.error('SpaceInfoMoves: Error in button click handler:', error);
            }
          },
              title: destination.description || destination.name
            }, destination.description || destination.name);
          })
        )
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
              onClick: () => this.handleLogicChoice(true)
            }, 'YES'),
            React.createElement('button', {
              key: 'no', 
              className: 'logic-choice-btn no-btn',
              onClick: () => this.handleLogicChoice(false)
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
    if (!window.LogicSpaceManager) {
      console.error('SpaceInfoMoves: LogicSpaceManager not available');
      return;
    }

    const result = window.LogicSpaceManager.makeLogicChoice(choice);
    
    if (result) {
      console.log('SpaceInfoMoves: Logic choice result:', result);
      
      if (result.type === 'nextQuestion') {
        // Force re-render to show next question
        this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
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

    // Always show as selectable options requiring "end turn"
    console.log('SpaceInfoMoves: Setting selectable destinations that require end turn');
    this.setState(prevState => ({ 
      renderKey: prevState.renderKey + 1,
      selectableDestinations: destinations,
      selectedDestination: null // Clear any previous selection
    }));
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
          }, move.description || move.name);
        })
      )
    ]);
  },

  /**
   * Renders the OWNER-FUND-INITIATION button if needed - DISABLED IN SIMPLIFIED SYSTEM
   * @returns {JSX.Element|null} Always returns null - MovementEngine handles all moves
   */
  renderOwnerFundInitiationButton: function() {
    // SIMPLIFIED SYSTEM: MovementEngine handles all movement options
    // No additional buttons needed - this prevents duplicates
    return null;
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
      s.name === space.name && s['Visit Type'] === 'First'
    );
    
    if (!spaceData) {
      console.log("SpaceInfoMoves: No space data found for:", space.name);
      return [];
    }
    
    console.log("SpaceInfoMoves: Found space data:", spaceData);
    
    // Extract destinations from Space 1-5 columns (like in the reference file)
    const rawDestinations = [
      spaceData["Space 1"],
      spaceData["Space 2"], 
      spaceData["Space 3"],
      spaceData["Space 4"],
      spaceData["Space 5"]
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
  
  /**
   * Renders the RETURN TO YOUR SPACE button for PM-DECISION-CHECK subsequent visits only
   * @returns {JSX.Element|null} The RETURN TO YOUR SPACE button or null
   */
  renderReturnToYourSpaceButton: function() {
    // This button is now replaced by showing original space moves directly
    // within the available moves section, handled by getAvailableMoves
    return null;
  }
};

console.log('SpaceInfoMoves.js code execution finished');
console.log('SpaceInfoMoves.js updated to properly show original space moves in PM-DECISION-CHECK [2025-05-14]');
console.log('SpaceInfoMoves.js PHASE 4: Fixed syntax errors and cleaned up duplicate methods [2025-05-27]');
