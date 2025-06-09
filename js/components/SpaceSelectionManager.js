// SpaceSelectionManager.js - Refactored to delegate movement logic to MovementEngine
console.log('SpaceSelectionManager.js file is beginning to be used');

/**
 * SpaceSelectionManager class - UI controller for space selection and movement visualization
 * 
 * REFACTORED: Now focuses purely on UI responsibilities:
 * - Visual highlighting and CSS management  
 * - DOM manipulation for move indicators
 * - Click event handling and user interaction
 * - Animation and visual feedback
 * 
 * Movement logic is now delegated to MovementEngine for:
 * - Available move calculation
 * - Movement validation
 * - Space type detection  
 * - Single choice handling
 * - Logic space processing
 * 
 * This creates clean separation between UI concerns and business logic.
 */
class SpaceSelectionManager {
  constructor(gameBoard) {
    console.log('SpaceSelectionManager: Initializing with MovementEngine integration');
    this.gameBoard = gameBoard;
    
    // Track DOM update timers to clear them when needed
    this.visualUpdateTimer = null;
    
    // Store event handler references for cleanup
    this.eventHandlers = {
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      spaceSelected: this.handleSpaceSelectedEvent.bind(this),
      forceMoveSelection: this.handleForceMoveSelection.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    // Listen for custom move selection events (for additional move buttons)
    window.addEventListener('forceMoveSelection', this.eventHandlers.forceMoveSelection);
    
    console.log('SpaceSelectionManager: Successfully initialized - now delegates to MovementEngine');
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
   * REFACTORED: Now delegates to MovementEngine instead of calculating moves directly
   */
  updateAvailableMoves = () => {
    console.log('SpaceSelectionManager: updateAvailableMoves called');
    console.log('SpaceSelectionManager: Updating available moves via MovementEngine');
    
    // CRITICAL FIX: Proper MovementEngine readiness check with no fallback generation
    if (!window.movementEngine) {
      console.error('SpaceSelectionManager: MovementEngine not found');
      console.error('SpaceSelectionManager: Available window objects:', Object.keys(window).filter(k => k.includes('movement') || k.includes('Movement')));
      
      // Update GameBoard state to show no available moves
      this.gameBoard.setState(prevState => ({ 
        ...prevState,
        availableMoves: [],
        showDiceRoll: false,
        diceRollSpace: null
      }));
      return;
    }
    
    if (!window.movementEngine.isReady()) {
      console.error('SpaceSelectionManager: MovementEngine not ready');
      console.error('SpaceSelectionManager: Debug info:', {
        exists: !!window.movementEngine,
        initialized: window.movementEngine.initialized,
        gameStateManager: !!window.movementEngine.gameStateManager,
        gameStateInitialized: window.movementEngine.gameStateManager?.isProperlyInitialized,
        spacesCount: window.movementEngine.gameStateManager?.spaces?.length || 0,
        diceDataCount: window.movementEngine.gameStateManager?.diceRollData?.length || 0
      });
      
      // CRITICAL FIX: Try to initialize MovementEngine if possible
      const initResult = window.movementEngine.initialize();
      if (!initResult) {
        console.error('SpaceSelectionManager: MovementEngine initialization failed');
        
        // Update GameBoard state to show no available moves (no fallback generation)
        this.gameBoard.setState(prevState => ({ 
          ...prevState,
          availableMoves: [],
          showDiceRoll: false,
          diceRollSpace: null
        }));
        return;
      }
      
      console.log('SpaceSelectionManager: MovementEngine successfully initialized on retry');
    }
    
    // Get current player
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer) {
      console.warn('SpaceSelectionManager: No current player found');
      return;
    }
    
    console.log('SpaceSelectionManager: Current player:', currentPlayer.name, 'at position:', currentPlayer.position);
    console.log('SpaceSelectionManager: Player data:', {
      id: currentPlayer.id,
      name: currentPlayer.name,
      position: currentPlayer.position,
      visitedSpaces: currentPlayer.visitedSpaces ? Array.from(currentPlayer.visitedSpaces) : 'none'
    });
    
    // Delegate movement calculation to MovementEngine
    console.log('SpaceSelectionManager: About to call MovementEngine.getAvailableMovements()');
    console.log('SpaceSelectionManager: MovementEngine status:', {
      exists: !!window.movementEngine,
      isReady: window.movementEngine ? window.movementEngine.isReady() : false,
      gameStateManager: window.movementEngine ? !!window.movementEngine.gameStateManager : false
    });
    const movementResult = window.movementEngine.getAvailableMovements(currentPlayer);
    
    console.log('SpaceSelectionManager: Movement result:', movementResult);
    console.log('SpaceSelectionManager: Movement result type:', typeof movementResult);
    console.log('SpaceSelectionManager: Movement result is array:', Array.isArray(movementResult));
    if (Array.isArray(movementResult)) {
      console.log('SpaceSelectionManager: Movement result length:', movementResult.length);
      if (movementResult.length > 0) {
        console.log('SpaceSelectionManager: First movement option:', movementResult[0]);
      }
    }
    
    // Handle dice roll requirement
    if (movementResult && typeof movementResult === 'object' && movementResult.requiresDiceRoll) {
      console.log('SpaceSelectionManager: Dice roll required for this space');
      
      // Dispatch event for dice roll requirement
      window.GameStateManager.dispatchEvent('gameStateChanged', {
        changeType: 'diceRollRequired',
        spaceName: movementResult.spaceName,
        visitType: movementResult.visitType,
        availableMoves: []
      });
      
      // Update GameBoard state for dice roll requirement
      this.gameBoard.setState(prevState => ({ 
        ...prevState,
        showDiceRoll: true, 
        diceRollSpace: movementResult.spaceName,
        diceRollVisitType: movementResult.visitType,
        availableMoves: [],
        hasRolledDice: false
      }));
      
      return;
    }
    
    // CRITICAL FIX: Handle logic space requirement
    if (movementResult && typeof movementResult === 'object' && movementResult.isLogicSpace) {
      console.log('SpaceSelectionManager: Logic space detected - passing logic data to UI');
      
      // Pass the logic space object as a special type of "available move"
      // This allows SpaceInfo to receive and process the logic space data
      const logicSpaceMove = {
        isLogicSpace: true,
        requiresLogicProcessing: true,
        spaceName: movementResult.spaceName,
        currentQuestion: movementResult.currentQuestion
      };
      
      // Update GameBoard state with logic space data
      this.gameBoard.setState(prevState => ({ 
        ...prevState,
        availableMoves: [logicSpaceMove], // Wrap in array for compatibility
        showDiceRoll: false,
        diceRollSpace: null,
        diceRollVisitType: null,
        isLogicSpace: true // Add flag for UI components
      }));
      
      return;
    }
    
    // CRITICAL FIX: Validate movement result before processing
    if (!Array.isArray(movementResult) || movementResult.length === 0) {
      console.log('SpaceSelectionManager: No valid movements available');
      
      // Update GameBoard state with empty moves (no fallback generation)
      this.gameBoard.setState(prevState => ({ 
        ...prevState,
        availableMoves: [],
        showDiceRoll: false,
        diceRollSpace: null,
        diceRollVisitType: null,
        isLogicSpace: false // Reset logic space flag
      }));
      return;
    }
    
    // Convert MovementEngine format to UI format
    const uiMovements = this.convertMovementsToUIFormat(movementResult);
    
    console.log('SpaceSelectionManager: UI movements:', uiMovements);
    
    // CRITICAL FIX: Validate UI movements contain valid space IDs
    const validMovements = uiMovements.filter(movement => {
      if (!movement.id || typeof movement.id !== 'string') {
        console.warn('SpaceSelectionManager: Filtering out movement with invalid ID:', movement);
        return false;
      }
      
      // CRITICAL FIX: Block any fallback IDs that might have been generated
      if (movement.id.includes('fallback')) {
        console.error('SpaceSelectionManager: Blocking fallback movement ID:', movement.id);
        return false;
      }
      
      return true;
    });
    
    console.log('SpaceSelectionManager: Valid movements after filtering:', validMovements);
    
    // Dispatch event for available moves update
    window.GameStateManager.dispatchEvent('gameStateChanged', {
      changeType: 'availableMovesUpdated',
      availableMoves: validMovements
    });
    
    // Update GameBoard state
    this.gameBoard.setState(prevState => ({ 
      ...prevState,
      availableMoves: validMovements, 
      showDiceRoll: false,
      diceRollSpace: null,
      diceRollVisitType: null,
      isLogicSpace: false // Reset logic space flag for normal moves
    }), () => {
      // Apply visual cues for available moves after state update
      this.updateAvailableMoveVisuals();
    });
    
    console.log('SpaceSelectionManager: Available moves updated via MovementEngine:', uiMovements ? uiMovements.length : 0, 'moves available');
  }
  
  /**
   * Convert MovementEngine movement format to UI format
   * @param {Array} movements - Movements from MovementEngine
   * @returns {Array} UI-formatted movements
   */
  convertMovementsToUIFormat(movements) {
    if (!Array.isArray(movements)) {
      return [];
    }
    
    return movements.map(movement => ({
      id: movement.id,
      name: movement.name,
      type: movement.type,
      description: movement.description,
      visitType: movement.visitType,
      fromOriginalSpace: movement.fromOriginalSpace || false,
      originalSpaceName: movement.originalSpaceName || null
    }));
  }
  
  /**
   * Apply visual cues to highlight available moves on the board
   * UNCHANGED: Pure UI responsibility - no business logic
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
        space.classList.remove('original-space-move');
        
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
          
          // If this is from original space, add a special class
          if (move.fromOriginalSpace) {
            spaceElement.classList.add('original-space-move');
          }
          
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
          
          // Add note about original space if this move comes from there
          if (move.fromOriginalSpace && move.originalSpaceName) {
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
          selectedIndicator.className = 'move-indicator';
          selectedIndicator.textContent = 'SELECTED';
          selectedSpaceElement.appendChild(selectedIndicator);
        }
      }
      
      console.log('SpaceSelectionManager: Visual cues updated for available moves:', availableMoves.length);
    }, 100); // Short delay to ensure React has finished rendering
  }
  
  /**
   * Handle a click on a space
   * REFACTORED: Simplified to focus on UI coordination, validation delegated to MovementEngine
   * @param {string} spaceId - ID of the clicked space
   */
  handleSpaceClick = (spaceId) => {
    console.log('SpaceSelectionManager: Space clicked:', spaceId);
    
    // Get current state
    const { availableMoves, spaces } = this.gameBoard.state;
    
    // Find the clicked space
    const clickedSpace = spaces.find(space => space.space_name === spaceId);
    
    // Always update exploredSpace to the clicked space for space explorer
    const exploredSpaceData = clickedSpace;
    
    // Log space explorer update
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(true, clickedSpace ? clickedSpace.space_name : 'unknown');
    }
    
    // Check if this space is a valid move (simple array check - no complex validation needed)
    const isValidMove = availableMoves && availableMoves.some(move => move.name === spaceId);
    
    if (isValidMove) {
      // Find the matching move to get its ID
      const matchingMove = availableMoves.find(move => move.name === spaceId);
      const moveId = matchingMove ? matchingMove.id : spaceId;
      
      // Handle valid move selection
      this._handleValidSpaceSelection(moveId, clickedSpace);
    } else {
      // Handle space exploration (non-move clicks)
      window.GameStateManager.dispatchEvent('spaceSelected', {
        spaceId: spaceId,
        spaceData: clickedSpace,
        isValidMove: false,
        selectedForExploration: true
      });
      
      // Update GameBoard state for exploration
      this.gameBoard.setState({
        exploredSpace: exploredSpaceData
      });
      
      console.log('SpaceSelectionManager: Space clicked for exploration:', spaceId);
    }
  }
  
  /**
   * Provide visual feedback when a move is selected
   * UNCHANGED: Pure UI responsibility
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
   * Direct move selection handler - PROPER FIX: Visit-type aware space resolution
   * This is called directly from move buttons, bypassing space click validation
   * @param {string} moveId - ID or name of the selected move
   */
  handleMoveSelection = (moveId) => {
    console.log('SpaceSelectionManager: Direct move selection:', moveId);
    
    // PRIMARY: Try exact space_name match first (for normal space-to-space moves)
    let spaceData = this.gameBoard.state.spaces.find(space => space.space_name === moveId);
    
    if (spaceData) {
      console.log('SpaceSelectionManager: Found space by exact space_name match:', spaceData.space_name);
    } else {
      console.log('SpaceSelectionManager: Exact ID match failed, attempting visit-type aware resolution');
      
      // LOGIC SPACE FIX: When logic spaces pass space names instead of IDs
      // We need to determine the correct visit type and construct the proper ID
      
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      if (!currentPlayer) {
        console.error('SpaceSelectionManager: No current player for visit-type resolution');
        return;
      }
      
      // Determine if player has visited this space before
      const hasVisited = this.hasPlayerVisitedSpace(currentPlayer, moveId);
      const visitType = hasVisited ? 'subsequent' : 'first';
      
      console.log(`SpaceSelectionManager: Player ${currentPlayer.name} ${hasVisited ? 'has' : 'has not'} visited ${moveId} before`);
      console.log(`SpaceSelectionManager: Using visit type: ${visitType}`);
      
      // Construct the expected space ID format
      const expectedSpaceId = moveId.toLowerCase().replace(/\s+/g, '-') + '-' + visitType;
      console.log('SpaceSelectionManager: Looking for space ID:', expectedSpaceId);
      
      // Find space with the constructed name and visit type
      spaceData = this.gameBoard.state.spaces.find(space => 
        space.space_name === moveId && space.visit_type === visitType
      );
      
      if (spaceData) {
        console.log('SpaceSelectionManager: Found space by visit-type resolution:', spaceData.space_name);
      } else {
        // Fallback: Try case-insensitive name matching (for edge cases)
        console.log('SpaceSelectionManager: ID construction failed, trying name matching');
        spaceData = this.gameBoard.state.spaces.find(space => 
          space.space_name && space.space_name.toUpperCase() === moveId.toUpperCase() &&
          space.visit_type && space.visit_type.toLowerCase() === visitType
        );
        
        if (spaceData) {
          console.log('SpaceSelectionManager: Found space by name + visit type matching:', spaceData.space_name);
        }
      }
    }
    
    if (!spaceData) {
      console.error('SpaceSelectionManager: Could not resolve space for moveId:', moveId);
      console.log('SpaceSelectionManager: Available space names:', this.gameBoard.state.spaces.slice(0, 5).map(s => s.space_name) + '...');
      // Continue with null to maintain existing error handling
    }
    
    // Update GameBoard state with selected move - mirrors knowledge file logic
    this.gameBoard.setState({
      selectedMove: moveId,
      hasSelectedMove: true,  // This enables the End Turn button
      exploredSpace: spaceData
    }, () => {
      // After state update, update visual cues to show selected move
      this.updateAvailableMoveVisuals();
      console.log('SpaceSelectionManager: Move selected - End Turn button should now be enabled');
      console.log('SpaceSelectionManager: exploredSpace set to:', spaceData ? spaceData.name : 'NULL');
    });
    
    // Dispatch event for tracking
    window.GameStateManager.dispatchEvent('spaceSelected', {
      spaceId: moveId,
      spaceData: spaceData,
      isValidMove: true,
      selectedForMove: true,
      source: 'directMoveSelection'
    });
    
    // Provide visual feedback for the selection
    this.provideSelectionFeedback(moveId);
    
    console.log('SpaceSelectionManager: Move selection completed - ready for End Turn');
  }
  
  /**
   * Helper method to handle valid space selection
   * SIMPLIFIED: Removed complex validation logic, now trusts MovementEngine
   * @param {string} spaceId - ID of the selected space
   * @param {Object} spaceData - Data for the selected space
   */
  _handleValidSpaceSelection = (spaceId, spaceData) => {
    console.log('SpaceSelectionManager: Valid move selected:', spaceId);
    
    // Dispatch space selection event for valid move
    window.GameStateManager.dispatchEvent('spaceSelected', {
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
      console.log('SpaceSelectionManager: Selected move updated:', this.gameBoard.state.selectedMove);
    });
    
    console.log('SpaceSelectionManager: Move selected:', spaceId, '- Will be executed on End Turn');
    
    // Provide visual feedback for the selection
    this.provideSelectionFeedback(spaceId);
  }
  
  /**
   * Animate transitions between different sets of available moves
   * UNCHANGED: Pure UI responsibility
   */
  animateAvailableMoveTransition = () => {
    // Use existing CSS animations, we just need to update the classes
    this.updateAvailableMoveVisuals();
  }
  
  /**
   * Get the currently selected space
   * UNCHANGED: Simple state accessor
   * @returns {Object} Selected space object
   */
  getSelectedSpace = () => {
    const { selectedSpace, spaces } = this.gameBoard.state;
    const space = spaces.find(space => space.space_name === selectedSpace);
    console.log('SpaceSelectionManager: Getting selected space for info display:', space?.space_name || 'None');
    return space;
  }
  
  /**
   * Check if a player has visited a specific space by name
   * @param {Object} player - The player object
   * @param {string} spaceName - The name of the space to check
   * @returns {boolean} True if player has visited this space before
   */
  hasPlayerVisitedSpace = (player, spaceName) => {
    if (!player || !spaceName) return false;
    
    // Use MovementEngine if available
    if (window.movementEngine && window.movementEngine.hasPlayerVisitedSpace) {
      return window.movementEngine.hasPlayerVisitedSpace(player, spaceName);
    }
    
    // Fallback: Check player's visitedSpaces directly
    if (player.visitedSpaces) {
      // Handle both Set and Array formats
      const visitedSpaces = Array.isArray(player.visitedSpaces) 
        ? player.visitedSpaces 
        : Array.from(player.visitedSpaces);
      
      // Check if any visited space matches this name
      return visitedSpaces.some(visitedSpaceName => 
        visitedSpaceName && visitedSpaceName.toUpperCase() === spaceName.toUpperCase()
      );
    }
    
    return false;
  }
  
  /**
   * Check if the current player is visiting the selected space for the first time
   * BACKWARD COMPATIBILITY: Wrapper around hasPlayerVisitedSpace
   * @returns {boolean} True if first visit, false otherwise
   */
  isVisitingFirstTime = () => {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    const selectedSpace = this.getSelectedSpace();
    
    if (!currentPlayer || !selectedSpace) return true;
    
    return !this.hasPlayerVisitedSpace(currentPlayer, selectedSpace.name);
  }
  
  /**
   * Load instructions data from the START space
   * UNCHANGED: UI-specific functionality for instructions panel
   */
  loadInstructionsData = () => {
    const { spaces } = this.gameBoard.state;
    
    // Find the START - Quick play guide spaces (first and subsequent)
    const firstVisitInstructionsSpace = spaces.find(space => {
      return space.space_name && space.space_name.includes('START - Quick play guide') && 
             space.id && space.id.toLowerCase().includes('first');
    });
    
    const subsequentVisitInstructionsSpace = spaces.find(space => {
      return space.space_name && space.space_name.includes('START - Quick play guide') && 
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
      
      // Update GameBoard state for backward compatibility
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
   * UNCHANGED: Pure UI functionality
   */
  toggleInstructions = () => {
    // Dispatch event for instructions panel toggle
    window.GameStateManager.dispatchEvent('gameStateChanged', {
      changeType: 'instructionsToggled'
    });
    
    // Update GameBoard state
    this.gameBoard.setState(prevState => ({
      showInstructions: !prevState.showInstructions
    }));
  }
  
  // ============================================================================
  // EVENT HANDLERS - Simplified to focus on UI updates
  // ============================================================================
  
  /**
   * Event handler for playerMoved event
   */
  handlePlayerMovedEvent(event) {
    console.log('SpaceSelectionManager: Player moved event received', event.data);
    
    // Update available moves when a player moves
    this.updateAvailableMoves();
    
    // Reset any selected move
    if (this.gameBoard) {
      this.gameBoard.setState(prevState => ({
        ...prevState,
        selectedMove: null,
        hasSelectedMove: false
      }));
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
      this.gameBoard.setState(prevState => ({
        ...prevState,
        selectedMove: null,
        hasSelectedMove: false
      }));
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
            this.gameBoard.setState(prevState => ({
              ...prevState,
              selectedMove: null,
              hasSelectedMove: false,
              availableMoves: []
            }));
          }
          break;
          
        case 'diceRollCompleted':
          // Update available moves after dice roll
          this.updateAvailableMoves();
          break;
          
        case 'spaceActionCompleted':
          // Update available moves after space actions are completed
          console.log('SpaceSelectionManager: Space action completed, updating available moves');
          this.updateAvailableMoves();
          break;
          
        case 'availableMovesUpdated':
          // Update visual cues for available moves
          this.updateAvailableMoveVisuals();
          break;
      }
    }
  }
  
  /**
   * Event handler for spaceSelected event
   */
  handleSpaceSelectedEvent(event) {
    console.log('SpaceSelectionManager: Space selected event received', event.data);
    
    // Only process events from other components
    if (!event.data) return;
    
    // Update visual cues if space was selected for move
    if (event.data.selectedForMove) {
      this.updateAvailableMoveVisuals();
    }
  }
  
  // ============================================================================
  // CLEANUP AND UTILITIES
  // ============================================================================
  
  /**
   * Handle force move selection events (from additional move buttons)
   * @param {CustomEvent} event - The custom event
   */
  handleForceMoveSelection = (event) => {
    if (!event.detail) return;
    
    const { spaceId, spaceData, source } = event.detail;
    console.log(`SpaceSelectionManager: Handling force move selection from ${source}:`, spaceId);
    
    // Call the same logic as valid space selection to ensure proper state management
    this._handleValidSpaceSelection(spaceId, spaceData);
  }
  
  /**
   * Clean up any resources when component is unmounted
   * UPDATED: Added cleanup for custom event listener
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
    
    // Remove custom event listener
    window.removeEventListener('forceMoveSelection', this.eventHandlers.forceMoveSelection);
    
    console.log('SpaceSelectionManager: Cleaned up resources');
  }
}

// Export SpaceSelectionManager for use in other files
window.SpaceSelectionManager = SpaceSelectionManager;

console.log('SpaceSelectionManager.js code execution finished');
console.log('SpaceSelectionManager.js REFACTORED: Now delegates movement logic to MovementEngine, focuses on UI [2025-05-26]');
console.log('SpaceSelectionManager.js PROPER FIX: Visit-type aware space resolution for logic space destinations [2025-06-01]');
