// SpaceSelectionManager.js file is beginning to be used
console.log('SpaceSelectionManager.js file is beginning to be used');

/**
 * SpaceSelectionManager class for handling space selection and available moves
 * Manages the logic for determining available moves, handling space clicks,
 * checking space visit status, and providing visual cues for available moves
 * 
 * Refactored to use GameStateManager event system
 */
class SpaceSelectionManager {
  constructor(gameBoard) {
    console.log('SpaceSelectionManager: Initializing with event system integration');
    this.gameBoard = gameBoard;
    
    // Track DOM update timers to clear them when needed
    this.visualUpdateTimer = null;
    
    // Store event handler references for cleanup
    this.eventHandlers = {
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      spaceSelected: this.handleSpaceSelectedEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    console.log('SpaceSelectionManager: Successfully initialized with event system');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners() {
    console.log('SpaceSelectionManager: Registering event listeners');
    
    // Add event handlers for space selection events
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    // Add custom event for space selection if not already in GameStateManager
    if (!window.GameStateManager.eventHandlers['spaceSelected']) {
      window.GameStateManager.eventHandlers['spaceSelected'] = [];
    }
    window.GameStateManager.addEventListener('spaceSelected', this.eventHandlers.spaceSelected);
    
    console.log('SpaceSelectionManager: Event listeners registered');
  }
  
  /**
   * Update the available moves for the current player
   */
  updateAvailableMoves = () => {
    const result = window.GameStateManager.getAvailableMoves();
    
    // Check if the result indicates that a dice roll is needed
    if (result && typeof result === 'object' && result.requiresDiceRoll) {
      console.log('SpaceSelectionManager: Dice roll required for this space');
      
      // Dispatch event for dice roll requirement instead of directly updating state
      window.GameStateManager.dispatchEvent('gameStateChanged', {
        changeType: 'diceRollRequired',
        spaceName: result.spaceName,
        visitType: result.visitType,
        availableMoves: []
      });
      
      // Temporary compatibility: Still update GameBoard state until all components are refactored
      this.gameBoard.setState({ 
        showDiceRoll: true, 
        diceRollSpace: result.spaceName,
        diceRollVisitType: result.visitType,
        availableMoves: [],
        hasRolledDice: false     // Reset dice roll status
      });
    } else {
      // Normal case - array of available moves
      // Dispatch event for available moves update
      window.GameStateManager.dispatchEvent('gameStateChanged', {
        changeType: 'availableMovesUpdated',
        availableMoves: result
      });
      
      // Temporary compatibility: Still update GameBoard state until all components are refactored
      this.gameBoard.setState({ 
        availableMoves: result, 
        showDiceRoll: false,
        diceRollSpace: null,
        diceRollVisitType: null
      }, () => {
        // Apply visual cues for available moves after state update
        this.updateAvailableMoveVisuals();
      });
      
      console.log('SpaceSelectionManager: Available moves updated:', result ? result.length : 0, 'moves available');
    }
  }
  
  /**
   * Apply visual cues to highlight available moves on the board
   * Uses CSS classes instead of inline styles
   */
  updateAvailableMoveVisuals = () => {
    // Clear any previous visual update timer
    if (this.visualUpdateTimer) {
      clearTimeout(this.visualUpdateTimer);
    }
    
    // Wait for React to finish rendering before manipulating DOM
    this.visualUpdateTimer = setTimeout(() => {
      const { availableMoves, selectedMove } = this.gameBoard.state;
      
      // First, remove all visual indicators from all spaces
      const allSpaces = document.querySelectorAll('.board-space');
      allSpaces.forEach(space => {
        space.classList.remove('available-move');
        space.classList.remove('selected-move');
        
        // Remove any move indicators
        const existingIndicators = space.querySelectorAll('.move-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
      });
      
      // If there are no available moves, no need to continue
      if (!availableMoves || availableMoves.length === 0) {
        console.log('SpaceSelectionManager: No available moves to highlight');
        return;
      }
      
      // Apply visual cues to available move spaces
      availableMoves.forEach(move => {
        const spaceElement = document.getElementById(`space-${move.id}`);
        if (spaceElement) {
          // Add the available-move class for highlighting
          spaceElement.classList.add('available-move');
          
          // Create a visual indicator for the move
          const indicatorElement = document.createElement('div');
          indicatorElement.className = 'move-indicator';
          indicatorElement.textContent = 'MOVE';
          
          // Add details about the move if available
          if (move.visitType) {
            const detailsElement = document.createElement('div');
            detailsElement.className = 'move-details';
            detailsElement.textContent = move.visitType.charAt(0).toUpperCase() + move.visitType.slice(1) + ' visit';
            indicatorElement.appendChild(detailsElement);
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
          selectedIndicator.className = 'move-indicator';
          selectedIndicator.textContent = 'SELECTED';
          selectedSpaceElement.appendChild(selectedIndicator);
        }
      }
      
      console.log('SpaceSelectionManager: Visual cues updated for available moves');
    }, 100); // Short delay to ensure React has finished rendering
  }
  
  /**
   * Handle a click on a space
   * @param {string} spaceId - ID of the clicked space
   */
  handleSpaceClick = (spaceId) => {
    // Check if this space is a valid move
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
      // Dispatch space selection event instead of directly updating state
      window.GameStateManager.dispatchEvent('spaceSelected', {
        spaceId: spaceId,
        spaceData: clickedSpace,
        isValidMove: true,
        selectedForMove: true
      });
      
      // Temporary compatibility: Still update GameBoard state until all components are refactored
      this.gameBoard.setState({
        // No longer change selectedSpace - keep it as the current player's position
        selectedMove: spaceId,   // Store the destination space
        hasSelectedMove: true,   // Mark that player has selected their move
        exploredSpace: exploredSpaceData // Set the explored space for the space explorer panel
      }, () => {
        // After state update, update visual cues to show selected move
        this.updateAvailableMoveVisuals();
        console.log('SpaceSelectionManager: Selected move updated:', this.gameBoard.state.selectedMove);
      });
      
      console.log('SpaceSelectionManager: Move selected:', spaceId, '- Will be executed on End Turn');
      
      // Provide visual feedback for the selection
      this.provideSelectionFeedback(spaceId);
    } else {
      // For non-move spaces, dispatch space selection event for exploration
      window.GameStateManager.dispatchEvent('spaceSelected', {
        spaceId: spaceId,
        spaceData: clickedSpace,
        isValidMove: false,
        selectedForExploration: true
      });
      
      // Temporary compatibility: Still update GameBoard state until all components are refactored
      this.gameBoard.setState({
        exploredSpace: exploredSpaceData // Set the explored space for the space explorer panel
      });
      
      console.log('SpaceSelectionManager: Space clicked for exploration:', spaceId);
    }
  }
  
  /**
   * Provide visual feedback when a move is selected
   * Uses CSS classes for animation effects
   * @param {string} spaceId - ID of the selected space
   */
  provideSelectionFeedback = (spaceId) => {
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
   * Animate transitions between different sets of available moves
   * Called when available moves change
   */
  animateAvailableMoveTransition = () => {
    // This would ideally be called when moves change, such as after dice rolls
    // Using existing CSS animations, we just need to update the classes
    this.updateAvailableMoveVisuals();
  }
  
  /**
   * Get the currently selected space
   * @returns {Object} Selected space object
   */
  getSelectedSpace = () => {
    const { selectedSpace, spaces } = this.gameBoard.state;
    const space = spaces.find(space => space.id === selectedSpace);
    console.log('SpaceSelectionManager: Getting selected space for info display:', space?.name || 'None');
    return space;
  }
  
  /**
   * Check if the current player is visiting the selected space for the first time
   * @returns {boolean} True if first visit, false otherwise
   */
  isVisitingFirstTime = () => {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    const selectedSpace = this.getSelectedSpace();
    
    if (!currentPlayer || !selectedSpace) return true;
    
    // Use GameStateManager's function to check if player has visited this space before
    const hasVisited = window.GameStateManager.hasPlayerVisitedSpace(currentPlayer, selectedSpace.name);
    return !hasVisited;
  }
  
  /**
   * Load instructions data from the START space
   */
  loadInstructionsData = () => {
    const { spaces } = this.gameBoard.state;
    
    // Find the START - Quick play guide spaces (first and subsequent)
    const firstVisitInstructionsSpace = spaces.find(space => {
      return space.name && space.name.includes('START - Quick play guide') && 
             space.id && space.id.toLowerCase().includes('first');
    });
    
    const subsequentVisitInstructionsSpace = spaces.find(space => {
      return space.name && space.name.includes('START - Quick play guide') && 
             space.id && space.id.toLowerCase().includes('subsequent');
    });
    
    // Log what we found for debugging
    console.log('SpaceSelectionManager: First visit instruction space:', firstVisitInstructionsSpace);
    console.log('SpaceSelectionManager: Subsequent visit instruction space:', subsequentVisitInstructionsSpace);
    
    if (firstVisitInstructionsSpace || subsequentVisitInstructionsSpace) {
      // Function to convert space object to instruction data with only essential fields
      const processInstructionSpace = (space) => {
        if (!space) return null;
        
        // Start with a clean object that only includes essential fields
        const instructionData = {
          description: space.description || '',
          action: space.action || '',
          outcome: space.outcome || ''
        };
        
        // Only include non-empty card fields
        const cardFields = ['W Card', 'B Card', 'I Card', 'L card', 'E Card'];
        cardFields.forEach(field => {
          if (space[field] && space[field].trim() !== '') {
            instructionData[field] = space[field];
          }
        });
        
        return instructionData;
      };
      
      // Dispatch event for instructions data loaded
      window.GameStateManager.dispatchEvent('gameStateChanged', {
        changeType: 'instructionsDataLoaded',
        instructionsData: {
          first: processInstructionSpace(firstVisitInstructionsSpace),
          subsequent: processInstructionSpace(subsequentVisitInstructionsSpace)
        }
      });
      
      // Temporary compatibility: Still update GameBoard state until all components are refactored
      this.gameBoard.setState({
        instructionsData: {
          first: processInstructionSpace(firstVisitInstructionsSpace),
          subsequent: processInstructionSpace(subsequentVisitInstructionsSpace)
        }
      });
    }
  }
  
  /**
   * Toggle instructions panel visibility
   */
  toggleInstructions = () => {
    // Dispatch event for instructions panel toggle
    window.GameStateManager.dispatchEvent('gameStateChanged', {
      changeType: 'instructionsToggled'
    });
    
    // Temporary compatibility: Still update GameBoard state until all components are refactored
    this.gameBoard.setState(prevState => ({
      showInstructions: !prevState.showInstructions
    }));
  }
  
  /**
   * Event handler for playerMoved event
   */
  handlePlayerMovedEvent(event) {
    console.log('SpaceSelectionManager: Player moved event received', event.data);
    
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
   * Event handler for turnChanged event
   */
  handleTurnChangedEvent(event) {
    console.log('SpaceSelectionManager: Turn changed event received', event.data);
    
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
   * Event handler for gameStateChanged event
   */
  handleGameStateChangedEvent(event) {
    console.log('SpaceSelectionManager: Game state changed event received', event.data);
    
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
          // Update available moves after dice roll
          this.updateAvailableMoves();
          break;
          
        case 'availableMovesUpdated':
          // Update visual cues for available moves
          this.updateAvailableMoveVisuals();
          break;
          
        // Add other change types as needed
      }
    }
  }
  
  /**
   * Event handler for spaceSelected event
   */
  handleSpaceSelectedEvent(event) {
    console.log('SpaceSelectionManager: Space selected event received', event.data);
    
    // Only process events from other components
    // Skip events that we dispatched ourselves
    if (!event.data) return;
    
    // Update visual cues if space was selected for move
    if (event.data.selectedForMove) {
      this.updateAvailableMoveVisuals();
    }
  }
  
  /**
   * Clean up any resources when component is unmounted
   */
  cleanup = () => {
    // Clear any pending timers
    if (this.visualUpdateTimer) {
      clearTimeout(this.visualUpdateTimer);
      this.visualUpdateTimer = null;
    }
    
    // Remove all event listeners to prevent memory leaks
    window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.removeEventListener('spaceSelected', this.eventHandlers.spaceSelected);
    
    console.log('SpaceSelectionManager: Cleaned up resources');
  }
}

// Export SpaceSelectionManager for use in other files
window.SpaceSelectionManager = SpaceSelectionManager;

console.log('SpaceSelectionManager.js code execution finished');
