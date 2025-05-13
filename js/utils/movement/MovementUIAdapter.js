/**
 * MovementUIAdapter.js
 * UI integration layer for the movement system
 * 
 * This module connects the movement logic to the UI components,
 * handling visual updates, animations, and user interactions
 */

console.log('MovementUIAdapter.js file is beginning to be used');

class MovementUIAdapter {
  constructor(gameStateManager, movementLogic) {
    this.gameStateManager = gameStateManager;
    this.movementLogic = movementLogic;
    
    // Reference to the game board component
    this.gameBoard = null;
    
    // Track DOM update timers to clear them when needed
    this.visualUpdateTimer = null;
    
    // Add a fallback method for extracting space names
    this.extractSpaceNameFallback = function(spaceData) {
      if (!spaceData) return null;
      
      // First try to match a space name with hyphens (most common format)
      const spaceNameRegex = /([A-Z]+-[A-Z]+-[A-Z]+(?:-[A-Z]+)?)/;
      const match = spaceData.match(spaceNameRegex);
      
      if (match && match[1]) {
        return match[1];
      }
      
      // If that didn't work, try to extract the part before any dash or description
      if (spaceData.includes(' - ')) {
        return spaceData.split(' - ')[0].trim();
      }
      
      // If all else fails, return the whole string
      return spaceData.trim();
    };
    
    // Store event handler references for cleanup
    this.eventHandlers = {
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      spaceSelected: this.handleSpaceSelectedEvent.bind(this),
      diceRollCompleted: this.handleDiceRollCompletedEvent.bind(this)
    };
    
    // Protected properties with descriptors
    Object.defineProperties(this, {
      gameStateManager: {
        value: gameStateManager,
        writable: false,
        configurable: false
      },
      movementLogic: {
        value: movementLogic,
        writable: false,
        configurable: false
      }
    });
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    console.log('MovementUIAdapter: Initialized with protected properties');
  }
  
  /**
   * Set the game board component for UI updates
   * @param {Object} gameBoard - React component for the game board
   */
  setGameBoard(gameBoard) {
    this.gameBoard = gameBoard;
    console.log('MovementUIAdapter: Game board component set');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners() {
    console.log('MovementUIAdapter: Registering event listeners');
    
    // Add event handlers for movement-related events
    this.gameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    this.gameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    this.gameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    this.gameStateManager.addEventListener('diceRollCompleted', this.eventHandlers.diceRollCompleted);
    
    // Add custom event for space selection if not already in GameStateManager
    if (!this.gameStateManager.eventHandlers['spaceSelected']) {
      this.gameStateManager.eventHandlers['spaceSelected'] = [];
    }
    this.gameStateManager.addEventListener('spaceSelected', this.eventHandlers.spaceSelected);
    
    console.log('MovementUIAdapter: Event listeners registered');
  }
  
  /**
   * Update available moves UI based on current player
   */
  updateAvailableMoves() {
    const currentPlayer = this.gameStateManager.getCurrentPlayer();
    if (!currentPlayer) {
      console.error('MovementUIAdapter: No current player found');
      return;
    }
    
    // Get available moves from movement logic
    const result = this.movementLogic.getAvailableMoves(currentPlayer);
    
    // Check if the result indicates that a dice roll is needed
    if (result && typeof result === 'object' && result.requiresDiceRoll) {
      console.log('MovementUIAdapter: Dice roll required for this space');
      
      // Dispatch event for dice roll requirement
      this.gameStateManager.dispatchEvent('gameStateChanged', {
        changeType: 'diceRollRequired',
        spaceName: result.spaceName,
        visitType: result.visitType,
        availableMoves: []
      });
      
      // Update GameBoard state if available
      if (this.gameBoard) {
        this.gameBoard.setState({ 
          showDiceRoll: true, 
          diceRollSpace: result.spaceName,
          diceRollVisitType: result.visitType,
          availableMoves: [],
          hasRolledDice: false     // Reset dice roll status
        });
      }
    } else {
      // Normal case - array of available moves
      // Dispatch event for available moves update
      this.gameStateManager.dispatchEvent('gameStateChanged', {
        changeType: 'availableMovesUpdated',
        availableMoves: result
      });
      
      // Update GameBoard state if available
      if (this.gameBoard) {
        this.gameBoard.setState({ 
          availableMoves: result, 
          showDiceRoll: false,
          diceRollSpace: null,
          diceRollVisitType: null
        }, () => {
          // Apply visual cues for available moves after state update
          this.updateAvailableMoveVisuals();
        });
      }
      
      console.log('MovementUIAdapter: Available moves updated:', result ? result.length : 0, 'moves available');
    }
  }
  
  /**
   * Apply visual cues to highlight available moves on the board
   */
  updateAvailableMoveVisuals() {
    // Clear any previous visual update timer
    if (this.visualUpdateTimer) {
      clearTimeout(this.visualUpdateTimer);
    }
    
    // Check if game board is available
    if (!this.gameBoard) {
      console.error('MovementUIAdapter: Game board not available for visual updates');
      return;
    }
    
    // Wait for React to finish rendering before manipulating DOM
    this.visualUpdateTimer = setTimeout(() => {
      const { availableMoves, selectedMove } = this.gameBoard.state;
      
      // First, remove all visual indicators from all spaces
      const allSpaces = document.querySelectorAll('.board-space');
      allSpaces.forEach(space => {
        space.classList.remove('available-move');
        space.classList.remove('selected-move');
        space.classList.remove('main-path-move');
        
        // Remove any move indicators
        const existingIndicators = space.querySelectorAll('.move-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
      });
      
      // If there are no available moves, no need to continue
      if (!availableMoves || availableMoves.length === 0) {
        console.log('MovementUIAdapter: No available moves to highlight');
        return;
      }
      
      // Apply visual cues to available move spaces
      availableMoves.forEach(move => {
        const spaceElement = document.getElementById(`space-${move.id}`);
        if (spaceElement) {
          // Add the available-move class for highlighting
          spaceElement.classList.add('available-move');
          
          // If this is from main path, add a special class
          if (move.fromMainPath) {
            spaceElement.classList.add('main-path-move');
          }
          
          // Create a visual indicator for the move
          const indicatorElement = document.createElement('div');
          indicatorElement.className = 'move-indicator';
          indicatorElement.textContent = move.fromMainPath ? 'MAIN PATH' : 'MOVE';
          
          // Add details about the move if available
          if (move.visitType) {
            const detailsElement = document.createElement('div');
            detailsElement.className = 'move-details';
            detailsElement.textContent = move.visitType.charAt(0).toUpperCase() + move.visitType.slice(1) + ' visit';
            indicatorElement.appendChild(detailsElement);
          }
          
          // Add note about original space if this move comes from main path
          if (move.fromMainPath && move.originalSpaceName) {
            const originElement = document.createElement('div');
            originElement.className = 'move-origin';
            originElement.textContent = `From: ${move.originalSpaceName}`;
            indicatorElement.appendChild(originElement);
          }
          
          // Add the indicator to the space
          spaceElement.appendChild(indicatorElement);
        }
      });
      
      // If a move is selected, highlight it differently
      if (selectedMove) {
        const selectedSpaceElement = document.getElementById(`space-${selectedMove}`);
        if (selectedSpaceElement) {
          // Remove available-move class and add selected-move class
          selectedSpaceElement.classList.remove('available-move');
          selectedSpaceElement.classList.add('selected-move');
          
          // Replace the move indicator with a selected move indicator
          const existingIndicators = selectedSpaceElement.querySelectorAll('.move-indicator');
          existingIndicators.forEach(indicator => indicator.remove());
          
          const selectedIndicator = document.createElement('div');
          selectedIndicator.className = 'move-indicator selected';
          selectedIndicator.textContent = 'SELECTED';
          selectedSpaceElement.appendChild(selectedIndicator);
        }
      }
      
      console.log('MovementUIAdapter: Visual cues updated for available moves:', availableMoves.length);
    }, 100); // Short delay to ensure React has finished rendering
  }
  
  /**
   * Handle a click on a space
   * @param {string} spaceId - ID of the clicked space
   */
  handleSpaceClick(spaceId) {
    // Check if game board is available
    if (!this.gameBoard) {
      console.error('MovementUIAdapter: Game board not available for space click handling');
      return;
    }
    
    // Get current player
    const currentPlayer = this.gameStateManager.getCurrentPlayer();
    if (!currentPlayer) {
      console.error('MovementUIAdapter: No current player found');
      return;
    }
    
    // Standard space click handling - Check if this space is a valid move
    const { availableMoves, spaces } = this.gameBoard.state;
    const isValidMove = availableMoves.some(space => space.id === spaceId);
    
    // Find the space that was clicked
    const clickedSpace = spaces.find(space => space.id === spaceId);
    
    // Always update exploredSpace to the clicked space
    // This ensures we show the correct space info in the always-visible explorer
    const exploredSpaceData = clickedSpace;
    
    // Log space explorer update (if function exists)
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(true, clickedSpace ? clickedSpace.name : 'unknown');
    }
    
    if (isValidMove) {
      // Handle valid move selection
      this._handleValidSpaceSelection(spaceId, clickedSpace);
    } else {
      // For non-move spaces, dispatch space selection event for exploration
      this.gameStateManager.dispatchEvent('spaceSelected', {
        spaceId: spaceId,
        spaceData: clickedSpace,
        isValidMove: false,
        selectedForExploration: true
      });
      
      // Update GameBoard state
      this.gameBoard.setState({
        exploredSpace: exploredSpaceData // Set the explored space for the space explorer panel
      });
      
      console.log('MovementUIAdapter: Space clicked for exploration:', spaceId);
    }
  }
  
  /**
   * Helper method to handle valid space selection
   * @param {string} spaceId - ID of the selected space
   * @param {Object} spaceData - Data for the selected space
   * @private
   */
  _handleValidSpaceSelection(spaceId, spaceData) {
    // Dispatch space selection event for valid move
    this.gameStateManager.dispatchEvent('spaceSelected', {
      spaceId: spaceId,
      spaceData: spaceData,
      isValidMove: true,
      selectedForMove: true
    });
    
    // Update GameBoard state with selected move
    this.gameBoard.setState({
      selectedMove: spaceId,
      hasSelectedMove: true,
      exploredSpace: spaceData
    }, () => {
      // After state update, update visual cues to show selected move
      this.updateAvailableMoveVisuals();
      console.log('MovementUIAdapter: Selected move updated:', this.gameBoard.state.selectedMove);
    });
    
    console.log('MovementUIAdapter: Move selected:', spaceId, '- Will be executed on End Turn');
    
    // Provide visual feedback for the selection
    this.provideSelectionFeedback(spaceId);
  }
  
  /**
   * Provide visual feedback when a move is selected
   * @param {string} spaceId - ID of the selected space
   */
  provideSelectionFeedback(spaceId) {
    const spaceElement = document.getElementById(`space-${spaceId}`);
    if (!spaceElement) return;
    
    // Add a temporary animation effect
    spaceElement.classList.add('enlarged');
    
    // Remove the effect after animation completes
    setTimeout(() => {
      if (spaceElement) {
        spaceElement.classList.remove('enlarged');
      }
    }, 300); // Duration matches CSS transition time
  }
  
  /**
   * Process dice roll result for UI
   * @param {Object} player - Player who rolled
   * @param {number} diceValue - Value rolled
   * @param {string} spaceName - Name of current space
   * @param {string} visitType - First or Subsequent visit
   */
  processDiceRollForUI(player, diceValue, spaceName, visitType) {
    // Process dice roll outcome using movement logic
    const outcome = this.movementLogic.processDiceRollOutcome(
      player, diceValue, spaceName, visitType
    );
    
    if (!outcome || !outcome.success) {
      console.error('MovementUIAdapter: Failed to process dice roll outcome');
      return;
    }
    
    // Add a visual indicator for the dice roll outcome
    if (this.gameBoard) {
      this.gameBoard.setState({
        diceRollOutcome: outcome,
        hasRolledDice: true
      });
    }
    
    // Handle different outcome types
    switch (outcome.type) {
      case 'move':
        // Schedule move after a delay to allow user to see the outcome
        setTimeout(() => {
          if (outcome.targetSpace) {
            console.log(`MovementUIAdapter: Moving to ${outcome.targetSpace.name} after dice roll`);
            // Move player to target space
            this.gameStateManager.executeMove(player.id, outcome.targetSpace.id);
          }
        }, 1500); // 1.5 second delay
        break;
        
      case 'card':
        // For card outcomes, call our special handler
        this.handleCardOutcome(outcome, player);
        
        // Also dispatch event for other handlers
        this.gameStateManager.dispatchEvent('diceRollOutcomeProcessed', {
          outcome: outcome,
          player: player,
          spaceName: spaceName,
          visitType: visitType
        });
        break;
        
      case 'fee':
      case 'time':
      case 'generic':
        // Dispatch appropriate event for game state handling
        this.gameStateManager.dispatchEvent('diceRollOutcomeProcessed', {
          outcome: outcome,
          player: player,
          spaceName: spaceName,
          visitType: visitType
        });
        break;
    }
  }
  
  /**
   * Handle player moved event
   * @param {Object} event - Event data
   */
  handlePlayerMovedEvent(event) {
    console.log('MovementUIAdapter: Player moved event received', event.data);
    
    // Update available moves when a player moves
    this.updateAvailableMoves();
    
    // Reset any selected move
    if (this.gameBoard) {
      this.gameBoard.setState({
        selectedMove: null,
        hasSelectedMove: false
      });
    }
  }
  
  /**
   * Handle turn changed event
   * @param {Object} event - Event data
   */
  handleTurnChangedEvent(event) {
    console.log('MovementUIAdapter: Turn changed event received', event.data);
    
    // Update available moves when the turn changes
    this.updateAvailableMoves();
    
    // Reset any selected move
    if (this.gameBoard) {
      this.gameBoard.setState({
        selectedMove: null,
        hasSelectedMove: false
      });
    }
  }
  
  /**
   * Handle game state changed event
   * @param {Object} event - Event data
   */
  handleGameStateChangedEvent(event) {
    console.log('MovementUIAdapter: Game state changed event received', event.data);
    
    // Only process relevant change types
    if (event.data && event.data.changeType) {
      switch (event.data.changeType) {
        case 'newGame':
          // Reset for new game
          if (this.gameBoard) {
            this.gameBoard.setState({
              selectedMove: null,
              hasSelectedMove: false,
              availableMoves: []
            });
          }
          break;
          
        case 'diceRollCompleted':
          // Handle dice roll in UI
          const { player, diceValue, spaceName, visitType } = event.data;
          this.processDiceRollForUI(player, diceValue, spaceName, visitType);
          break;
          
        case 'availableMovesUpdated':
          // Update visual cues for available moves
          this.updateAvailableMoveVisuals();
          break;
      }
    }
  }
  
  /**
   * Handle space selected event
   * @param {Object} event - Event data
   */
  handleSpaceSelectedEvent(event) {
    console.log('MovementUIAdapter: Space selected event received', event.data);
    
    // Only process events from other components
    // Skip events that we dispatched ourselves
    if (!event.data) return;
    
    // Update visual cues if space was selected for move
    if (event.data.selectedForMove) {
      this.updateAvailableMoveVisuals();
    }
  }
  
  /**
   * Handle dice roll completed event
   * @param {Object} event - Event data
   */
  handleDiceRollCompletedEvent(event) {
    console.log('MovementUIAdapter: Dice roll completed event received', event.data);
    
    // Make sure GameStateManager's hasRolledDice flag is set
    // This is critical to prevent dice roll requirement from reappearing
    this.gameStateManager.hasRolledDice = true;
    console.log('MovementUIAdapter: Set hasRolledDice=true in GameStateManager');
    
    // Delegate to processDiceRollForUI
    const { player, diceValue, spaceName, visitType } = event.data;
    this.processDiceRollForUI(player, diceValue, spaceName, visitType);
  }
  
  /**
   * Special handler for card outcomes after dice rolls
   * Ensures proper movement options are available after card draws
   * @param {Object} outcome - The dice roll outcome
   * @param {Object} player - The player who rolled
   */
  handleCardOutcome(outcome, player) {
    console.log('MovementUIAdapter: Handling card outcome after dice roll:', outcome);
    
    // Allow a delay for cards to be processed first
    setTimeout(() => {
      // Make sure hasRolledDice is set to prevent re-rolling
      this.gameStateManager.hasRolledDice = true;
      
      // Update available moves
      this.updateAvailableMoves();
      console.log('MovementUIAdapter: Updated available moves after card outcome');
      
      // Additional fallback if no moves are found
      if (this.gameBoard && 
          (!this.gameBoard.state.availableMoves || this.gameBoard.state.availableMoves.length === 0)) {
        // Get current space
        const currentSpaceId = player.position;
        const currentSpace = this.gameStateManager.findSpaceById(currentSpaceId);
        
        if (currentSpace) {
          console.log('MovementUIAdapter: Fallback - directly checking space data for moves');
          const fallbackMoves = [];
          
          // Check space columns in CSV data
          for (let i = 1; i <= 5; i++) {
            // Try both raw properties and regular properties for compatibility
            const nextSpaceData = currentSpace[`rawSpace${i}`] || currentSpace[`Space ${i}`];
            if (nextSpaceData && nextSpaceData.trim() !== '') {
              // Use gameStateManager.movementCore if available, otherwise use fallback
              const spaceName = this.gameStateManager.movementCore 
                ? this.gameStateManager.movementCore.extractSpaceName(nextSpaceData)
                : this.extractSpaceNameFallback(nextSpaceData);
              if (spaceName) {
                const nextSpace = this.gameStateManager.findSpaceByName(spaceName);
                if (nextSpace) {
                  fallbackMoves.push({
                    id: nextSpace.id,
                    name: nextSpace.name,
                    description: nextSpaceData,
                    visitType: 'First' // Default for simplicity
                  });
                }
              }
            }
          }
          
          if (fallbackMoves.length > 0) {
            console.log('MovementUIAdapter: Found fallback moves:', fallbackMoves.map(m => m.name).join(', '));
            if (this.gameBoard) {
              this.gameBoard.setState({ 
                availableMoves: fallbackMoves,
                hasSelectedMove: false
              });
            }
          }
        }
      }
    }, 1500);
  }
  
  /**
   * Clean up any resources when component is unmounted
   */
  cleanup() {
    // Clear any pending timers
    if (this.visualUpdateTimer) {
      clearTimeout(this.visualUpdateTimer);
      this.visualUpdateTimer = null;
    }
    
    // Remove all event listeners to prevent memory leaks
    this.gameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
    this.gameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    this.gameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    this.gameStateManager.removeEventListener('spaceSelected', this.eventHandlers.spaceSelected);
    this.gameStateManager.removeEventListener('diceRollCompleted', this.eventHandlers.diceRollCompleted);
    
    console.log('MovementUIAdapter: Cleaned up resources');
  }
}

// Export for use in other modules
window.MovementUIAdapter = MovementUIAdapter;

console.log('MovementUIAdapter.js code execution finished');