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
      }
    }
  },

  /**
   * Handle final destinations from logic space
   * @param {Array} destinations - Available destinations
   */
  handleLogicDestinations: function(destinations) {
    if (!destinations || destinations.length === 0) {
      console.error('SpaceInfoMoves: No destinations from logic space');
      return;
    }

    if (destinations.length === 1) {
      // Single destination - move automatically
      const { onMoveSelect } = this.props;
      if (onMoveSelect) {
        onMoveSelect(destinations[0].id);
      }
    } else {
      // Multiple destinations - let UI show choices
      // This will be handled by the next render cycle
      this.setState(prevState => ({ 
        renderKey: prevState.renderKey + 1,
        logicDestinations: destinations 
      }));
    }
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
    
    // Get previous space
    const previousSpaceId = player.previousPosition;
    if (!previousSpaceId) {
      return null;
    }
    
    const previousSpace = window.GameStateManager.findSpaceById(previousSpaceId);
    if (!previousSpace) {
      return null;
    }
    
    // Extract the base name without suffixes
    const previousSpaceName = this.extractBaseName(previousSpace.name);
    
    // Check if player came from a side quest space using Path column
    const cameFromQuestSide = previousSpace.Path && 
      previousSpace.Path.toLowerCase().includes('side quest');
    
    // Get original space info (if it exists)
    const originalSpaceId = player.properties?.originalSpaceId;
    let originalSpaceInfo = null;
    
    if (originalSpaceId) {
      const originalSpace = window.GameStateManager.findSpaceById(originalSpaceId);
      if (originalSpace) {
        originalSpaceInfo = this.extractBaseName(originalSpace.name);
      }
    }
    
    return React.createElement('div', { className: 'space-path-info-container' }, [
      React.createElement('div', { key: 'main', className: 'space-path-info main-path' }, [
        React.createElement('div', { key: 'label', className: 'path-info-label' }, 'Main Path:'),
        React.createElement('div', { key: 'content', className: 'path-info-content' }, 
          originalSpaceInfo ? 
            `Your original space was ${originalSpaceInfo}.` : 
            `You came from ${previousSpaceName}.`
        )
      ]),
      React.createElement('div', { key: 'quest', className: 'space-path-info quest-path' }, [
        React.createElement('div', { key: 'label', className: 'path-info-label' }, 'Quest Path:'),
        React.createElement('div', { key: 'content', className: 'path-info-content' }, 
          cameFromQuestSide ? 
            `You came from ${previousSpaceName}.` : 
            'You are not on a quest yet.'
        )
      ])
    ]);
  },

  /**
   * Renders available moves for the current space
   * @returns {JSX.Element|null} The available moves section or null
   */
  renderAvailableMoves: function() {
    const { space, onMoveSelect, selectedMoveId } = this.props;
    
    // Check if this is a logic space
    if (space && window.LogicSpaceManager && window.LogicSpaceManager.isPlayerInLogicSpace(window.GameStateManager.getCurrentPlayer())) {
      return this.renderLogicSpaceUI();
    }
    
    // Get moves with enhanced PM-DECISION-CHECK handling
    const enhancedMoves = this.getAvailableMoves();
    
    if (!enhancedMoves || enhancedMoves.length === 0) {
      return null;
    }
    
    console.log('SpaceInfoMoves: Rendering available moves:', enhancedMoves.map(m => m.name).join(', '));
    console.log('SpaceInfoMoves: Selected move ID:', selectedMoveId);
    
    return React.createElement('div', { className: 'space-available-moves' }, [
      React.createElement('div', { key: 'label', className: 'space-section-label' }, 'Available Moves:'),
      React.createElement('div', { key: 'list', className: 'available-moves-list', 'data-testid': 'moves-list' }, 
        enhancedMoves.map(move => {
          // Determine if this move is selected
          const isSelected = selectedMoveId && selectedMoveId === move.id;
          
          // Add special styling for single choice spaces
          const specialClasses = [];
          if (move.isPermanentChoice) {
            if (move.isRepeatedChoice) {
              specialClasses.push('permanent-choice', 'repeated-choice');
            } else if (move.isFirstTimeChoice) {
              specialClasses.push('permanent-choice', 'first-time-choice');
            }
          }
          if (move.fromOriginalSpace) {
            specialClasses.push('from-original-space');
          }
          if (move.fromDiceRoll) {
            specialClasses.push('from-dice-roll');
          }
          if (move.fromLogicSpace) {
            specialClasses.push('from-logic-space');
          }
          
          return React.createElement('button', {
            key: move.id,
            className: `move-button primary-move-btn ${isSelected ? 'selected' : ''} ${specialClasses.join(' ')}`,
            onClick: () => {
              console.log('SpaceInfoMoves: Move button clicked:', move.name, move.id);
              
              // Handle specially if this is a move from original space
              if (move.fromOriginalSpace && move.originalSpaceId) {
                console.log('SpaceInfoMoves: Handling return to original space:', move.originalSpaceId);
                
                // Get current player
                const player = window.GameStateManager.getCurrentPlayer();
                if (player) {
                  // Clear originalSpaceId as player is now returning to original path
                  if (player.properties) {
                    player.properties.originalSpaceId = null;
                  }
                  
                  // Force state save
                  if (window.GameStateManager.saveState) {
                    window.GameStateManager.saveState();
                  }
                }
              }
              
              // Handle single choice recording
              if (move.isPermanentChoice && move.isFirstTimeChoice) {
                const currentPlayer = window.GameStateManager.getCurrentPlayer();
                if (currentPlayer && window.movementEngine) {
                  window.movementEngine.recordSingleChoice(currentPlayer, space.name, move.name);
                }
              }
              
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
   * Renders the OWNER-FUND-INITIATION button if needed
   * @returns {JSX.Element|null} The OWNER-FUND-INITIATION button section or null
   */
  renderOwnerFundInitiationButton: function() {
    const { space, availableMoves, onMoveSelect, selectedMoveId } = this.props;

    // Only show this for OWNER-SCOPE-INITIATION spaces when the move isn't already in availableMoves
    if (!space || 
        space.name !== 'OWNER-SCOPE-INITIATION' || 
        !onMoveSelect ||
        availableMoves?.some(move => move.name.includes('OWNER-FUND-INITIATION'))) {
      return null;
    }
    
    // Find the OWNER-FUND-INITIATION space
    const fundInitSpace = window.GameStateManager?.spaces?.find(s => s.name === 'OWNER-FUND-INITIATION');
    if (!fundInitSpace) {
      console.error('SpaceInfoMoves: OWNER-FUND-INITIATION space not found');
      return null;
    }
    
    const isSelected = selectedMoveId && selectedMoveId === fundInitSpace.id;
    
    return React.createElement('div', { className: 'space-available-moves' }, [
      React.createElement('div', { key: 'label', className: 'space-section-label' }, 'Additional Move:'),
      React.createElement('button', {
        key: 'button',
        className: `move-button primary-move-btn ${isSelected ? 'selected' : ''}`,
        onClick: () => {
          console.log('SpaceInfoMoves: OWNER-FUND-INITIATION button clicked');
          console.log('SpaceInfoMoves: Found OWNER-FUND-INITIATION space:', fundInitSpace.id);
          
          // Trigger a custom event that the SpaceSelectionManager can listen for
          // This is cleaner than trying to access the game board directly
          const moveSelectEvent = new CustomEvent('forceMoveSelection', {
            detail: {
              spaceId: fundInitSpace.id,
              spaceData: fundInitSpace,
              source: 'additional-move-button'
            }
          });
          
          // Dispatch the event on the window
          window.dispatchEvent(moveSelectEvent);
          
          // Also call onMoveSelect as fallback
          onMoveSelect(fundInitSpace.id);
        }
      }, 'OWNER-FUND-INITIATION')
    ]);
  },
  
  /**
   * Handles PM-DECISION-CHECK space logic to show original space moves
   * @returns {Array} The combined array of moves
   */
  getAvailableMoves: function() {
    const { availableMoves } = this.props;
    
    // If no available moves, return empty array
    if (!availableMoves || availableMoves.length === 0) {
      return [];
    }
    
    // Get current space and check if it's PM-DECISION-CHECK
    const { space } = this.props;
    if (!space || space.name !== 'PM-DECISION-CHECK') {
      return availableMoves;
    }
    
    console.log('SpaceInfoMoves: Processing moves for PM-DECISION-CHECK space');
    
    // Get current player
    const player = window.GameStateManager.getCurrentPlayer();
    if (!player) {
      return availableMoves;
    }
    
    // Check if player has used CHEAT-BYPASS (point of no return)
    if (player.hasUsedCheatBypass || (player.properties && player.properties.hasUsedCheatBypass)) {
      console.log('SpaceInfoMoves: Player has used CHEAT-BYPASS, no return possible');
      return availableMoves;
    }
    
    // Check if player came from a side quest space
    const previousSpaceId = player.previousPosition;
    if (!previousSpaceId) {
      console.log('SpaceInfoMoves: No previous space found');
      return availableMoves;
    }
    
    const previousSpace = window.GameStateManager.findSpaceById(previousSpaceId);
    if (!previousSpace) {
      console.log('SpaceInfoMoves: Previous space not found');
      return availableMoves;
    }
    
    // Use Path column to determine if coming from side quest
    const cameFromQuestSide = previousSpace.Path && 
      previousSpace.Path.toLowerCase().includes('side quest');
    
    console.log(`SpaceInfoMoves: Previous space: ${previousSpace.name} (Path: ${previousSpace.Path}), Coming from side quest: ${cameFromQuestSide}`);
    
    if (!cameFromQuestSide && previousSpace.Path && previousSpace.Path.toLowerCase() === 'main') {
      // Coming from main path - originalSpaceId should already be stored by MovementCore
      // No need to store it here in the UI component
      return availableMoves; // Only show standard moves
    } else if (cameFromQuestSide) {
      // Coming from quest side - get stored original space moves
      const originalSpaceId = player.properties?.originalSpaceId;
      console.log(`SpaceInfoMoves: Retrieved original space ID: ${originalSpaceId}`);
      
      if (originalSpaceId) {
        // Find original space
        const originalSpace = window.GameStateManager.findSpaceById(originalSpaceId);
        
        if (originalSpace) {
          console.log(`SpaceInfoMoves: Found original space: ${originalSpace.name}`);
          
          // Get moves from original space
          const originalMoves = this.getMovesForSpace(originalSpace);
          console.log(`SpaceInfoMoves: Found ${originalMoves.length} moves from original space`);
          
          // Add label to original space moves
          originalMoves.forEach(move => {
            move.name = `${move.name} (Return to ${this.extractBaseName(originalSpace.name)})`;
            move.fromOriginalSpace = true;
            move.originalSpaceId = originalSpaceId;
          });
          
          // Show both standard moves and original space moves
          return [...availableMoves, ...originalMoves];
        }
      }
      
      console.log("SpaceInfoMoves: No original space found, showing standard moves only");
      return availableMoves; // Fallback to standard moves
    }
    
    return availableMoves;
  },
  
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
   * Gets moves for a specific space from game data
   * @param {Object} space - The space to get moves for
   * @returns {Array} - Array of move objects
   */
  getMovesForSpace: function(space) {
    // Check if we can use existing GameStateManager functions
    if (window.GameStateManager && typeof window.GameStateManager.getAvailableMoves === 'function') {
      console.log("SpaceInfoMoves: Using GameStateManager to get original space moves");
      const player = window.GameStateManager.getCurrentPlayer();
      return window.GameStateManager.getAvailableMoves(player, space) || [];
    }
    
    // Fallback to default implementation
    console.log("SpaceInfoMoves: Using direct lookup to get original space moves");
    // This would require actual implementation based on how moves are stored
    // For now, return empty array as fallback
    return [];
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
