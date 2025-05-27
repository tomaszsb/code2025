// TurnFlowManager.js - Implements the 4-phase Turn Flow Algorithm
console.log('TurnFlowManager.js file is beginning to be used');

/**
 * TurnFlowManager - Implements the 4-phase Turn Flow Algorithm from MOVEMENT_SYSTEM_LOGIC.md
 * 
 * Phase 1: Space Entry
 * - Load space data for currentSpace + visitType
 * - Display event, action, requirements
 * - Show dice section if RequiresDiceRoll = "Yes"
 * - Show negotiate button if Negotiate = "YES"
 * 
 * Phase 2: Action Processing
 * - IF RequiresDiceRoll = "Yes": WAIT for dice roll, Store diceResult
 * - WHEN completeActions() called: Apply penalties/rewards, SET actionsCompleted = true
 * 
 * Phase 3: Movement Options
 * - IF inLogicSpace: Display logic questions, Handle Yes/No navigation
 * - ELSE IF dice result contains destinations: Show dice-determined movement options
 * - ELSE: Show standard movement options with filtering
 * 
 * Phase 4: Turn Completion
 * - WHEN destination selected: SET selectedDestination
 * - WHEN nextTurn() called: Execute movement, Mark as visited, Reset state, Switch player
 */
class TurnFlowManager {
  constructor() {
    console.log('TurnFlowManager: Initializing 4-phase turn flow system');
    
    this.currentPhase = 'space_entry';
    this.turnState = {
      actionsCompleted: false,
      diceRolled: false,
      diceResult: null,
      selectedDestination: null,
      canNegotiate: false,
      requiresDiceRoll: false
    };
    
    // Register for events
    this.eventHandlers = {
      turnStarted: this.handleTurnStarted.bind(this),
      diceRollCompleted: this.handleDiceRollCompleted.bind(this),
      actionsCompleted: this.handleActionsCompleted.bind(this),
      destinationSelected: this.handleDestinationSelected.bind(this),
      turnCompleted: this.handleTurnCompleted.bind(this)
    };
    
    this.registerEventListeners();
    
    console.log('TurnFlowManager: Initialized successfully');
  }
  
  /**
   * Register event listeners
   */
  registerEventListeners() {
    if (!window.GameStateManager) {
      console.warn('TurnFlowManager: GameStateManager not available during initialization');
      return;
    }
    
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      window.GameStateManager.addEventListener(event, handler);
    });
    
    console.log('TurnFlowManager: Event listeners registered');
  }
  
  // ============================================================================
  // PHASE 1: SPACE ENTRY
  // ============================================================================
  
  /**
   * Start Phase 1: Space Entry
   * @param {Object} player - Current player
   */
  startSpaceEntry(player) {
    console.log('TurnFlowManager: Phase 1 - Space Entry');
    this.currentPhase = 'space_entry';
    
    if (!player || !player.position) {
      console.error('TurnFlowManager: Invalid player for space entry');
      return;
    }
    
    // Get space data using MovementEngine
    const spaceData = window.movementEngine.getCurrentSpaceData(player);
    if (!spaceData) {
      console.error(`TurnFlowManager: No space data for ${player.position}`);
      return;
    }
    
    // Determine turn requirements
    this.turnState.requiresDiceRoll = spaceData.RequiresDiceRoll === "Yes";
    this.turnState.canNegotiate = spaceData.Negotiate === "YES";
    this.turnState.actionsCompleted = false;
    this.turnState.diceRolled = false;
    this.turnState.diceResult = null;
    this.turnState.selectedDestination = null;
    
    console.log('TurnFlowManager: Space entry completed', {
      space: player.position,
      requiresDiceRoll: this.turnState.requiresDiceRoll,
      canNegotiate: this.turnState.canNegotiate
    });
    
    // Emit event for UI updates
    this.emitPhaseChanged('space_entry', {
      player: player,
      spaceData: spaceData,
      turnState: this.turnState
    });
    
    // Check if we can immediately move to next phase
    if (!this.turnState.requiresDiceRoll) {
      this.startActionProcessing(player);
    }
  }
  
  // ============================================================================
  // PHASE 2: ACTION PROCESSING
  // ============================================================================
  
  /**
   * Start Phase 2: Action Processing
   * @param {Object} player - Current player
   */
  startActionProcessing(player) {
    console.log('TurnFlowManager: Phase 2 - Action Processing');
    this.currentPhase = 'action_processing';
    
    // If dice roll required and not rolled yet, wait
    if (this.turnState.requiresDiceRoll && !this.turnState.diceRolled) {
      console.log('TurnFlowManager: Waiting for dice roll');
      this.emitPhaseChanged('waiting_for_dice', {
        player: player,
        turnState: this.turnState
      });
      return;
    }
    
    // Emit event for UI to show action completion options
    this.emitPhaseChanged('action_processing', {
      player: player,
      turnState: this.turnState
    });
  }
  
  /**
   * Complete actions and apply space effects
   * @param {Object} player - Current player
   */
  completeActions(player) {
    console.log('TurnFlowManager: Completing actions');
    
    if (this.turnState.actionsCompleted) {
      console.warn('TurnFlowManager: Actions already completed');
      return;
    }
    
    // Apply space effects using MovementEngine
    const spaceData = window.movementEngine.getCurrentSpaceData(player);
    if (spaceData) {
      window.movementEngine.applySpaceEffects(player, spaceData, this.turnState.diceResult);
    }
    
    this.turnState.actionsCompleted = true;
    console.log('TurnFlowManager: Actions completed');
    
    // Move to movement options phase
    this.startMovementOptions(player);
  }
  
  /**
   * Handle negotiation (stay and skip turn)
   * @param {Object} player - Current player
   */
  negotiate(player) {
    console.log('TurnFlowManager: Player chose to negotiate');
    
    if (!this.turnState.canNegotiate) {
      console.warn('TurnFlowManager: Negotiation not allowed for this space');
      return;
    }
    
    // Apply negotiation penalty (typically +1 day)
    player.time = (player.time || 0) + 1;
    console.log('TurnFlowManager: Applied negotiation penalty (+1 day)');
    
    // Reset turn state and move to next player
    this.completeTurn(player, null, true); // true = negotiated
  }
  
  // ============================================================================
  // PHASE 3: MOVEMENT OPTIONS
  // ============================================================================
  
  /**
   * Start Phase 3: Movement Options
   * @param {Object} player - Current player
   */
  startMovementOptions(player) {
    console.log('TurnFlowManager: Phase 3 - Movement Options');
    this.currentPhase = 'movement_options';
    
    // Get available movements using MovementEngine
    const movements = window.movementEngine.getAvailableMovements(player, this.turnState.diceResult);
    
    console.log(`TurnFlowManager: Found ${Array.isArray(movements) ? movements.length : 1} movement options`);
    
    // Handle different movement types
    if (Array.isArray(movements) && movements.length > 0) {
      const firstMove = movements[0];
      
      if (firstMove.type === 'logic_space') {
        this.handleLogicSpace(player, firstMove);
        return;
      }
    }
    
    // Emit event for UI to show movement options
    this.emitPhaseChanged('movement_options', {
      player: player,
      movements: movements,
      turnState: this.turnState
    });
  }
  
  /**
   * Handle logic space navigation
   * @param {Object} player - Current player
   * @param {Object} logicSpaceData - Logic space movement data
   */
  handleLogicSpace(player, logicSpaceData) {
    console.log('TurnFlowManager: Handling logic space');
    
    const questionData = logicSpaceData.questionData;
    if (!questionData) {
      console.error('TurnFlowManager: No question data for logic space');
      return;
    }
    
    // Emit event for UI to show logic question
    this.emitPhaseChanged('logic_question', {
      player: player,
      questionData: questionData,
      currentQuestion: logicSpaceData.currentQuestion,
      turnState: this.turnState
    });
  }
  
  /**
   * Handle logic space choice (YES/NO)
   * @param {Object} player - Current player
   * @param {string} choice - "yes" or "no"
   */
  makeLogicChoice(player, choice) {
    console.log(`TurnFlowManager: Logic choice made: ${choice}`);
    
    const destination = window.movementEngine.makeLogicChoice(choice);
    
    if (destination) {
      // Final destination reached
      this.selectDestination(player, destination);
    } else {
      // More questions - get updated logic space data
      const movements = window.movementEngine.getAvailableMovements(player);
      if (movements.length > 0 && movements[0].type === 'logic_space') {
        this.handleLogicSpace(player, movements[0]);
      }
    }
  }
  
  /**
   * Select a movement destination
   * @param {Object} player - Current player
   * @param {string} destinationId - Selected destination ID
   */
  selectDestination(player, destinationId) {
    console.log(`TurnFlowManager: Destination selected: ${destinationId}`);
    
    this.turnState.selectedDestination = destinationId;
    
    // Check if this is a single choice space and record the choice
    const currentSpace = player.position;
    if (window.movementEngine.isSingleChoiceSpace(currentSpace)) {
      window.movementEngine.recordSingleChoice(player, currentSpace, destinationId);
    }
    
    // Move to turn completion phase
    this.startTurnCompletion(player);
  }
  
  // ============================================================================
  // PHASE 4: TURN COMPLETION
  // ============================================================================
  
  /**
   * Start Phase 4: Turn Completion
   * @param {Object} player - Current player
   */
  startTurnCompletion(player) {
    console.log('TurnFlowManager: Phase 4 - Turn Completion');
    this.currentPhase = 'turn_completion';
    
    if (!this.turnState.selectedDestination) {
      console.error('TurnFlowManager: No destination selected for turn completion');
      return;
    }
    
    // Emit event for UI to show turn completion
    this.emitPhaseChanged('turn_completion', {
      player: player,
      destination: this.turnState.selectedDestination,
      turnState: this.turnState
    });
  }
  
  /**
   * Complete the turn and move to next player
   * @param {Object} player - Current player
   * @param {string} destinationOverride - Optional destination override
   * @param {boolean} negotiated - Whether turn was completed via negotiation
   */
  completeTurn(player, destinationOverride = null, negotiated = false) {
    console.log('TurnFlowManager: Completing turn');
    
    const finalDestination = destinationOverride || this.turnState.selectedDestination;
    
    if (finalDestination && !negotiated) {
      // Mark current space as visited before moving
      window.movementEngine.markSpaceAsVisited(player, player.position);
      
      // Update previousSpace if leaving a Main path space
      const currentSpaceData = window.movementEngine.getCurrentSpaceData(player);
      if (currentSpaceData && currentSpaceData.Path === "Main") {
        player.previousSpace = player.position;
      }
      
      // Execute the movement
      const oldPosition = player.position;
      player.position = finalDestination;
      
      console.log(`TurnFlowManager: Moved ${player.name} from ${oldPosition} to ${finalDestination}`);
      
      // Emit movement event
      window.GameStateManager.emit('playerMoved', {
        player: player,
        fromSpace: oldPosition,
        toSpace: finalDestination,
        negotiated: negotiated
      });
    }
    
    // Reset turn state
    this.resetTurnState();
    
    // Switch to next player
    this.nextPlayer();
    
    console.log('TurnFlowManager: Turn completed');
  }
  
  /**
   * Move to next player
   */
  nextPlayer() {
    if (window.GameStateManager && typeof window.GameStateManager.nextPlayer === 'function') {
      window.GameStateManager.nextPlayer();
    } else {
      console.warn('TurnFlowManager: GameStateManager.nextPlayer not available');
    }
  }
  
  /**
   * Reset turn state for new turn
   */
  resetTurnState() {
    this.turnState = {
      actionsCompleted: false,
      diceRolled: false,
      diceResult: null,
      selectedDestination: null,
      canNegotiate: false,
      requiresDiceRoll: false
    };
    
    this.currentPhase = 'space_entry';
    
    // Reset movement engine state
    if (window.movementEngine) {
      window.movementEngine.resetMovementState();
    }
  }
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle turn started events
   * @param {Object} event - Event data
   */
  handleTurnStarted(event) {
    if (!event.data || !event.data.player) return;
    
    this.startSpaceEntry(event.data.player);
  }
  
  /**
   * Handle dice roll completed events
   * @param {Object} event - Event data
   */
  handleDiceRollCompleted(event) {
    if (!event.data) return;
    
    const { player, diceResult } = event.data;
    if (!player || !diceResult) return;
    
    this.turnState.diceRolled = true;
    this.turnState.diceResult = diceResult;
    
    console.log(`TurnFlowManager: Dice roll completed: ${diceResult}`);
    
    // Move to action processing if we were waiting for dice
    if (this.currentPhase === 'space_entry' || this.currentPhase === 'waiting_for_dice') {
      this.startActionProcessing(player);
    }
  }
  
  /**
   * Handle actions completed events
   * @param {Object} event - Event data
   */
  handleActionsCompleted(event) {
    if (!event.data || !event.data.player) return;
    
    this.completeActions(event.data.player);
  }
  
  /**
   * Handle destination selected events
   * @param {Object} event - Event data
   */
  handleDestinationSelected(event) {
    if (!event.data) return;
    
    const { player, destinationId } = event.data;
    if (!player || !destinationId) return;
    
    this.selectDestination(player, destinationId);
  }
  
  /**
   * Handle turn completed events
   * @param {Object} event - Event data
   */
  handleTurnCompleted(event) {
    if (!event.data || !event.data.player) return;
    
    this.completeTurn(event.data.player, event.data.destinationOverride, event.data.negotiated);
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Emit phase changed event
   * @param {string} phase - New phase name
   * @param {Object} data - Phase data
   */
  emitPhaseChanged(phase, data) {
    if (window.GameStateManager && typeof window.GameStateManager.emit === 'function') {
      window.GameStateManager.emit('phaseChanged', {
        phase: phase,
        previousPhase: this.currentPhase,
        ...data
      });
    }
  }
  
  /**
   * Get current phase
   * @returns {string} Current phase
   */
  getCurrentPhase() {
    return this.currentPhase;
  }
  
  /**
   * Get turn state
   * @returns {Object} Current turn state
   */
  getTurnState() {
    return { ...this.turnState };
  }
  
  /**
   * Get debug information
   * @returns {Object} Debug info
   */
  getDebugInfo() {
    return {
      currentPhase: this.currentPhase,
      turnState: this.getTurnState(),
      ready: !!(window.GameStateManager && window.movementEngine)
    };
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    console.log('TurnFlowManager: Cleaning up resources');
    
    // Remove event listeners
    if (window.GameStateManager) {
      Object.entries(this.eventHandlers).forEach(([event, handler]) => {
        window.GameStateManager.removeEventListener(event, handler);
      });
    }
    
    this.resetTurnState();
    
    console.log('TurnFlowManager: Cleanup completed');
  }
}

// Export TurnFlowManager
window.TurnFlowManager = TurnFlowManager;

// Create singleton instance
window.turnFlowManager = new TurnFlowManager();

console.log('TurnFlowManager.js code execution finished - 4-phase turn flow system ready');
console.log('TurnFlowManager: Implementing documented 4-phase Turn Flow Algorithm [2025-05-26]');
