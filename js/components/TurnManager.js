// TurnManager.js file is beginning to be used
console.log('TurnManager.js file is beginning to be used');

/**
 * TurnManager class for handling turn-related operations
 * Manages turn transitions, player state updates, and player snapshots
 * Integrated with GameStateManager event system
 */
class TurnManager {
  constructor(gameBoard) {
    console.log('TurnManager: Initializing');
    this.gameBoard = gameBoard;
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      gameStateChanged: this.handleGameStateChangedEvent.bind(this)
    };
    
    // Reference to active player visual highlight timer
    this.activePlayerHighlightTimer = null;
    
    // Register event listeners - but only after initialization is complete
    // to prevent recursive calls
    setTimeout(() => {
      this.registerEventListeners();
    }, 0);
    
    console.log('TurnManager: Successfully initialized');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners = () => {
    console.log('TurnManager: Registering event listeners with GameStateManager');
    
    if (!window.GameStateManager) {
      console.error('TurnManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register standard events
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    // Add custom event types if they don't exist yet
    if (!window.GameStateManager.eventHandlers['activePlayerChanged']) {
      window.GameStateManager.eventHandlers['activePlayerChanged'] = [];
    }
    
    console.log('TurnManager: Event listeners registered');
  }
  
  /**
   * Handle playerMoved events from GameStateManager
   * @param {Object} event - The event object
   */
  handlePlayerMovedEvent = (event) => {
    console.log('TurnManager: Handling playerMoved event', event.data);
    
    // Update active player highlighting if this is the current player
    if (event.data && event.data.player) {
      const isCurrentPlayer = this.isActivePlayer(event.data.playerId);
      
      if (isCurrentPlayer) {
        // Update enhanced highlighting for the current player
        this.enhanceActivePlayerHighlight();
      }
    }
  }
  
  /**
   * Handle turnChanged events from GameStateManager
   * @param {Object} event - The event object
   */
  handleTurnChangedEvent = (event) => {
    console.log('TurnManager: Handling turnChanged event', event.data);
    
    // Update enhanced highlighting for the new active player
    this.enhanceActivePlayerHighlight();
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The event object
   */
  handleGameStateChangedEvent = (event) => {
    console.log('TurnManager: Handling gameStateChanged event', event.data);
    
    // Handle relevant game state changes
    if (event.data && event.data.changeType === 'newGame') {
      // Reset any turn-specific state
      if (this.activePlayerHighlightTimer) {
        clearTimeout(this.activePlayerHighlightTimer);
        this.activePlayerHighlightTimer = null;
      }
    }
  }
  
  /**
   * Handle ending the current turn and transitioning to the next player
   * PHASE 4: Now uses MovementEngine for complete turn completion logic
   * FIXED: Added support for FDNY-style selectable destinations
   */
  handleEndTurn = () => {
    console.log('TurnManager: Ending current turn');
    
    // Show loading feedback - find button by class
    const endTurnButton = document.querySelector('.end-turn-btn');
    const loadingId = window.InteractiveFeedback?.showLoading(endTurnButton, 'Processing turn...');
    
    // Add safety cleanup function
    const cleanupButtonState = () => {
      if (endTurnButton) {
        endTurnButton.classList.remove('loading');
        endTurnButton.disabled = false;
        const originalText = endTurnButton.getAttribute('data-original-text');
        if (originalText) {
          endTurnButton.textContent = originalText;
          endTurnButton.removeAttribute('data-original-text');
        } else {
          endTurnButton.textContent = 'End Turn'; // Fallback text
        }
      }
    };
    
    try {
      const { selectedMove, availableMoves, hasSelectedMove } = this.gameBoard.state;
    const currentPlayer = this.getCurrentPlayer();
    
    console.log('TurnManager: FDNY DEBUG - Initial state check:');
    console.log('  - selectedMove:', selectedMove);
    console.log('  - hasSelectedMove:', hasSelectedMove);
    console.log('  - availableMoves count:', availableMoves ? availableMoves.length : 'null');
    
    // FIXED: Check for FDNY-style selected destination from SpaceInfo component
    let moveToExecute = selectedMove;
    let shouldExecuteMove = selectedMove && hasSelectedMove;
    
    // Check if there's a selected destination from FDNY logic space
    if (!shouldExecuteMove && this.gameBoard.spaceInfo && this.gameBoard.spaceInfo.state) {
      const spaceInfoState = this.gameBoard.spaceInfo.state;
      if (spaceInfoState.selectedDestination) {
        console.log('TurnManager: Found FDNY-style selected destination:', spaceInfoState.selectedDestination);
        moveToExecute = spaceInfoState.selectedDestination.id;
        shouldExecuteMove = true;
        
        // Clear the FDNY selection state
        this.gameBoard.spaceInfo.setState({
          selectableDestinations: null,
          selectedDestination: null
        });
        
        // Also clean up logic state in MovementEngine
        if (window.movementEngine && currentPlayer) {
          const currentSpaceData = window.movementEngine.getCurrentSpaceData(currentPlayer);
          if (currentSpaceData && currentPlayer.logicState && currentPlayer.logicState[currentSpaceData.space_name]) {
            delete currentPlayer.logicState[currentSpaceData.space_name];
            console.log('TurnManager: Cleaned up logic state for FDNY space');
          }
        }
      }
    }
    
    // CRITICAL FIX: Only execute moves when MovementEngine is ready and we have a valid move
    if (moveToExecute && shouldExecuteMove && currentPlayer) {
      console.log('TurnManager: Executing selected move via MovementEngine:', moveToExecute);
      
      // CRITICAL FIX: MovementEngine must be ready - no fallback logic
      if (window.movementEngine && window.movementEngine.isReady()) {
        const moveResult = window.movementEngine.executePlayerMove(currentPlayer, moveToExecute);
        
        if (moveResult && moveResult.success) {
          console.log(`TurnManager: Move executed successfully from ${moveResult.fromSpace} to ${moveResult.toSpace}`);
          
          // Trigger playerMoved event via GameStateManager for UI updates
          window.GameStateManager.dispatchEvent('playerMoved', {
            playerId: currentPlayer.id,
            player: currentPlayer,
            fromSpace: moveResult.fromSpace,
            toSpace: moveResult.toSpace,
            spaceData: moveResult.spaceData
          });
        } else {
          console.error('TurnManager: Move execution failed:', moveResult?.error || 'Unknown error');
          console.error('TurnManager: Cannot execute move - MovementEngine executePlayerMove failed');
          
          // Show error feedback
          if (window.InteractiveFeedback) {
            window.InteractiveFeedback.hideLoading(loadingId);
            window.InteractiveFeedback.error('Move execution failed. Please try again.');
          } else {
            cleanupButtonState();
          }
          
          return; // Don't continue to next turn if move failed
        }
      } else {
        console.error('TurnManager: Cannot execute move - MovementEngine not ready');
        console.error('TurnManager: MovementEngine exists:', !!window.movementEngine);
        console.error('TurnManager: MovementEngine isReady:', window.movementEngine?.isReady());
        
        // Show error feedback
        if (window.InteractiveFeedback) {
          window.InteractiveFeedback.hideLoading(loadingId);
          window.InteractiveFeedback.error('Game system not ready. Please wait and try again.');
        } else {
          cleanupButtonState();
        }
        
        // REMOVED FALLBACK LOGIC: No more fallback to GameStateManager.movePlayer
        // This prevents invalid "space-X-fallback" IDs from being processed
        
        // Show error to user and don't advance turn
        alert('Cannot move player: Game engine not ready. Please refresh the page.');
        return; // Don't continue to next turn
      }
    } else {
      // Handle cases where no move was selected
      if (availableMoves && availableMoves.length === 0) {
        console.log('TurnManager: No available moves to execute, turn can end without movement');
      } else if (availableMoves && availableMoves.length > 0) {
        console.log('TurnManager: Moves available but none selected. Player must select a move before ending turn');
        console.log('TurnManager: Available moves:', availableMoves.map(m => m.name || m.id));
        
        // Hide loading before returning
        if (window.InteractiveFeedback) {
          window.InteractiveFeedback.hideLoading(loadingId);
          window.InteractiveFeedback.warning('Please select a move before ending your turn.');
        } else {
          cleanupButtonState();
        }
        
        return; // Don't advance turn if moves are available but none selected
      } else {
        console.log('TurnManager: No move selected and no available moves data');
      }
    }
    
    // Move to next player's turn
    this.nextPlayerTurn();
    
    // Hide loading and show success feedback
    if (window.InteractiveFeedback) {
      window.InteractiveFeedback.hideLoading(loadingId);
      window.InteractiveFeedback.success('Turn completed successfully!');
    } else {
      cleanupButtonState();
    }
    
    console.log('TurnManager: Turn ended, next player:', window.GameStateManager.currentPlayerIndex);
    
    } catch (error) {
      console.error('TurnManager: Error in handleEndTurn:', error);
      
      // Ensure button state is cleaned up even on unexpected errors
      if (window.InteractiveFeedback) {
        window.InteractiveFeedback.hideLoading(loadingId);
        window.InteractiveFeedback.error('An error occurred while processing your turn.');
      } else {
        cleanupButtonState();
      }
      
      // Re-throw to maintain error visibility
      throw error;
    }
  }
  
  /**
   * Handle negotiation (player chooses to stay and skip turn)
   * PHASE 4: Integrated with MovementEngine negotiation logic
   */
  handleNegotiation = () => {
    console.log('TurnManager: Handling negotiation');
    const currentPlayer = this.getCurrentPlayer();
    
    if (!currentPlayer) {
      console.error('TurnManager: No current player for negotiation');
      return;
    }
    
    // PHASE 4: Use MovementEngine for negotiation logic
    if (window.movementEngine && window.movementEngine.isReady()) {
      const negotiationResult = window.movementEngine.handleNegotiation(currentPlayer);
      
      if (negotiationResult.success) {
        console.log('TurnManager: Negotiation successful:', negotiationResult.message);
        
        // Dispatch event for negotiation
        window.GameStateManager.dispatchEvent('gameStateChanged', {
          changeType: 'playerNegotiated',
          playerId: currentPlayer.id,
          player: currentPlayer,
          timePenalty: negotiationResult.timePenalty,
          message: negotiationResult.message
        });
        
        // Move to next player's turn since negotiation skips current player
        this.nextPlayerTurn();
      } else {
        console.error('TurnManager: Negotiation failed:', negotiationResult.error);
      }
    } else {
      console.warn('TurnManager: MovementEngine not ready for negotiation');
    }
  }
  
  /**
   * Update to the next player's turn and update all necessary state
   * Enhanced with movement visualization and smooth transitions
   */
  nextPlayerTurn = () => {
    console.log('TurnManager: Transitioning to next player');
    
    // Get current player before transition for event notification
    const previousPlayer = this.getCurrentPlayer();
    const previousPlayerIndex = window.GameStateManager.currentPlayerIndex;
    
    // Create enhanced turn transition with animation
    this.createEnhancedTurnTransition(previousPlayer, () => {
      // Move to next player's turn - this will trigger a turnChanged event via GameStateManager
      window.GameStateManager.nextPlayerTurn();
      
      // Get the new current player
      const newCurrentPlayer = window.GameStateManager.getCurrentPlayer();
      const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
      
      console.log(`TurnManager: Player change from ${previousPlayerIndex} to ${window.GameStateManager.currentPlayerIndex}`);
      
      // Get the space the player landed on
      const newSpace = this.gameBoard.state.spaces.find(s => s.space_name === newPlayerPosition);
      
      // Create player and space snapshots
      const playerSnapshot = this.createPlayerSnapshot(newCurrentPlayer);
      const spaceSnapshot = newSpace ? { ...newSpace } : null;
      
      // Update state
      this.gameBoard.setState({
        players: [...window.GameStateManager.players],
        currentPlayerIndex: window.GameStateManager.currentPlayerIndex,
        selectedSpace: newPlayerPosition, // Always set to new player's position
        selectedMove: null,               // Clear the selected move
        hasSelectedMove: false,           // Reset flag for the next player's turn
        showDiceRoll: false,              // Hide dice roll component
        diceRollSpace: null,              // Clear dice roll space info
        hasRolledDice: false,             // Reset dice roll status
        diceOutcomes: null,               // Reset dice outcomes
        lastDiceRoll: null,               // Reset last dice roll
        currentPlayerOnLanding: playerSnapshot, // Store snapshot of player status
        currentSpaceOnLanding: spaceSnapshot,   // Store snapshot of space
        exploredSpace: newSpace          // Set explored space to new player's space
      });
      
      // Update available moves for new player
      if (this.gameBoard.spaceSelectionManager) {
        this.gameBoard.spaceSelectionManager.updateAvailableMoves();
      }
      
      // Dispatch custom active player changed event through GameStateManager
      if (window.GameStateManager && typeof window.GameStateManager.dispatchEvent === 'function') {
        window.GameStateManager.dispatchEvent('activePlayerChanged', {
          previousPlayer: previousPlayer ? { ...previousPlayer } : null,
          currentPlayer: newCurrentPlayer ? { ...newCurrentPlayer } : null,
          currentPlayerIndex: window.GameStateManager.currentPlayerIndex
        });
      }
      
      // Enhanced active player highlight with smooth transition
      this.enhanceActivePlayerHighlight();
      
      // Don't call PlayerMovementVisualizer.handleTurnTransition here as we're already handling 
      // the transition with createEnhancedTurnTransition above
      
      console.log(`TurnManager: Next player ${newCurrentPlayer ? newCurrentPlayer.name : 'unknown'} is now active on space ${newSpace?.name || 'unknown'}`);
    });
  }
  
  /**
   * Get the current player
   * @returns {Object} Current player object
   */
  getCurrentPlayer = () => {
    // Use GameStateManager directly
    if (!window.GameStateManager) {
      console.warn('TurnManager: No GameStateManager available');
      
      // Fallback to using gameBoard state
      const { players, currentPlayerIndex } = this.gameBoard.state;
      const currentPlayer = players[currentPlayerIndex];
      
      if (!currentPlayer) {
        console.warn('TurnManager: No current player found in gameBoard state');
        return null;
      }
      
      return currentPlayer;
    }
    
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    
    if (!currentPlayer) {
      console.warn('TurnManager: No current player found in GameStateManager');
      return null;
    }
    
    return currentPlayer;
  }
  
  /**
   * Create a deep copy snapshot of a player's state
   * @param {Object} player - Player object to snapshot
   * @returns {Object} Player snapshot with deep copied properties
   */
  createPlayerSnapshot = (player) => {
    console.log('TurnManager: Creating player snapshot');
    
    if (!player) {
      console.warn('TurnManager: Cannot create snapshot of null player');
      return null;
    }
    
    // Validate required player properties
    if (!player.name || !player.id) {
      console.warn('TurnManager: Player missing required properties (name or id)');
      return null;
    }
    
    return {
      ...player,
      name: player.name || 'Unknown Player',
      id: player.id || 'unknown-id',
      resources: player.resources ? { ...player.resources } : { money: 0, time: 0 },
      cards: player.cards ? [...player.cards] : [],
      // Handle visitedSpaces properly for both Set and Array formats
      visitedSpaces: player.visitedSpaces ? 
        (Array.isArray(player.visitedSpaces) ? [...player.visitedSpaces] : Array.from(player.visitedSpaces)) : [],
      // Force the color to be the player's color for consistent UI
      color: player.color || '#9c27b0'
    };
  }
  
  /**
   * Check if the current player can negotiate (stay and skip turn)
   * PHASE 4: Uses MovementEngine to check negotiation eligibility
   * @returns {boolean} True if negotiation is allowed
   */
  canNegotiate = () => {
    const currentPlayer = this.getCurrentPlayer();
    
    if (!currentPlayer || !window.movementEngine || !window.movementEngine.isReady()) {
      return false;
    }
    
    return window.movementEngine.canNegotiate(currentPlayer);
  }
  
  /**
   * Check if a specific player is the current active player
   * @param {Object|string} playerOrId - Player object or player ID to check
   * @returns {boolean} True if this player is the current active player
   */
  isActivePlayer = (playerOrId) => {
    if (!playerOrId) return false;
    
    const playerId = typeof playerOrId === 'string' ? playerOrId : playerOrId.id;
    const currentPlayer = this.getCurrentPlayer();
    
    return currentPlayer && currentPlayer.id === playerId;
  }
  
  /**
   * Enhance the visual highlighting of the active player
   * Uses DOM manipulation to apply temporary visual effects
   */
  enhanceActivePlayerHighlight = () => {
    console.log('TurnManager: Enhancing active player highlight');
    
    // Clear any existing highlight timer
    if (this.activePlayerHighlightTimer) {
      clearTimeout(this.activePlayerHighlightTimer);
      this.activePlayerHighlightTimer = null;
    }
    
    // Get the current player
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.warn('TurnManager: No current player to highlight');
      return;
    }
    
    // Use setTimeout to ensure React has finished rendering
    this.activePlayerHighlightTimer = setTimeout(() => {
      this.findAndHighlightPlayerToken(currentPlayer, 0);
    }, 250);
  }

  // Helper method to find and highlight player token with retry logic
  findAndHighlightPlayerToken = (currentPlayer, retryCount) => {
    if (retryCount > 3) {
      console.log('TurnManager: Max retries reached for player token highlighting');
      return;
    }

    try {
      // Find the token for the current player - try multiple selectors
      let currentPlayerTokens = document.querySelectorAll('.player-token.current-player');
      
      // If not found, try alternative selectors
      if (currentPlayerTokens.length === 0) {
        currentPlayerTokens = document.querySelectorAll('.current-player');
      }
      if (currentPlayerTokens.length === 0) {
        currentPlayerTokens = document.querySelectorAll(`[data-player-id="${currentPlayer.id}"]`);
      }
      
      if (currentPlayerTokens.length === 0) {
        console.log(`TurnManager: Player tokens not ready (attempt ${retryCount + 1}/4), retrying...`);
        // Retry with exponential backoff
        setTimeout(() => {
          this.findAndHighlightPlayerToken(currentPlayer, retryCount + 1);
        }, 250 * (retryCount + 1));
        return;
      }

      // Apply enhanced animation class to each token
      currentPlayerTokens.forEach(token => {
        // Add a class that triggers attention animation
        token.classList.add('active-player-enhanced');
        
        // Log success
        console.log('TurnManager: Applied enhanced highlight to active player token');
      });
      
      // Also update player info section if it exists
      const playerInfos = document.querySelectorAll('.player-info');
      playerInfos.forEach(info => {
        if (info.classList.contains('current')) {
          info.classList.add('active-player-info-enhanced');
        }
      });
      
    } catch (error) {
      console.error('TurnManager: Error applying enhanced player highlight:', error);
    }
  }
  
  /**
   * Add an event listener for custom turn events
   * For backward compatibility - forwards to GameStateManager
   * @param {string} eventName - The name of the event
   * @param {Function} callback - The callback function to execute
   * @returns {Function} The event handler that was added
   */
  addEventListener = (eventName, callback) => {
    console.log(`TurnManager: Adding event listener for ${eventName} via GameStateManager`);
    
    if (!window.GameStateManager) {
      console.error('TurnManager: Cannot add event listener, GameStateManager not available');
      return null;
    }
    
    // Register with GameStateManager
    return window.GameStateManager.addEventListener(eventName, callback);
  }
  
  /**
   * Remove an event listener for custom turn events
   * For backward compatibility - forwards to GameStateManager
   * @param {string} eventName - The name of the event
   * @param {Function} callback - The callback function to remove
   */
  removeEventListener = (eventName, callback) => {
    console.log(`TurnManager: Removing event listener for ${eventName} via GameStateManager`);
    
    if (!window.GameStateManager) {
      console.error('TurnManager: Cannot remove event listener, GameStateManager not available');
      return;
    }
    
    // Unregister with GameStateManager
    window.GameStateManager.removeEventListener(eventName, callback);
  }
  
  /**
   * Create enhanced turn transition with smooth animations
   * @param {Object} previousPlayer - The player whose turn just ended
   * @param {Function} callback - Callback to execute after transition animation
   */
  createEnhancedTurnTransition = (previousPlayer, callback) => {
    console.log('TurnManager: Creating enhanced turn transition');
    
    // Create transition overlay for smooth visual handoff
    const overlay = document.createElement('div');
    overlay.className = 'turn-transition-overlay';
    
    // Get next player info for transition
    const nextPlayerIndex = (window.GameStateManager.currentPlayerIndex + 1) % window.GameStateManager.players.length;
    const nextPlayer = window.GameStateManager.players[nextPlayerIndex];
    
    if (previousPlayer && nextPlayer) {
      // Create turn handoff indicator
      const indicator = document.createElement('div');
      indicator.className = 'turn-handoff-indicator';
      
      indicator.innerHTML = `
        <div class="handoff-from-player">
          <span style="font-weight: bold; color: ${previousPlayer.color}">${previousPlayer.name}</span>
          <div class="handoff-player-token" style="background-color: ${previousPlayer.color}"></div>
        </div>
        <div class="handoff-arrow">⤵</div>
        <div class="handoff-to-player">
          <div class="handoff-player-token" style="background-color: ${nextPlayer.color}"></div>
          <span style="font-weight: bold; color: ${nextPlayer.color}">${nextPlayer.name}</span>
        </div>
        <div style="margin-top: 15px; font-size: 16px; color: #333; font-weight: bold;">
          ${nextPlayer.name}'s Turn!
        </div>
      `;
      
      overlay.appendChild(indicator);
    }
    
    document.body.appendChild(overlay);
    
    // Animate transition in
    setTimeout(() => {
      overlay.classList.add('active');
    }, 50);
    
    // Execute callback during transition (doubled timing)
    setTimeout(() => {
      if (callback) callback();
    }, 600);
    
    // Remove transition overlay (doubled timing)
    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 1000);
    }, 2400);
  }

  /**
   * Enhanced player token animation for movement
   * @param {Object} player - Player object
   * @param {string} fromSpaceId - Origin space ID
   * @param {string} toSpaceId - Destination space ID
   */
  animatePlayerMovement = (player, fromSpaceId, toSpaceId) => {
    console.log('TurnManager: Animating player movement', { player: player.name, from: fromSpaceId, to: toSpaceId });
    
    // Delegate to PlayerMovementVisualizer if available
    if (window.PlayerMovementVisualizer) {
      window.PlayerMovementVisualizer.handlePlayerMovement({
        player: player,
        fromSpace: fromSpaceId,
        toSpace: toSpaceId
      });
    }
    
    // Additional token enhancement
    const playerTokens = document.querySelectorAll('.player-token');
    playerTokens.forEach(token => {
      if (token.style.backgroundColor === player.color) {
        // Add movement speed class based on distance
        const distance = this.calculateMovementDistance(fromSpaceId, toSpaceId);
        if (distance <= 2) {
          token.classList.add('speed-normal');
        } else if (distance <= 4) {
          token.classList.add('speed-fast');
        } else {
          token.classList.add('speed-slow');
        }
        
        // Clean up speed classes after animation
        setTimeout(() => {
          token.classList.remove('speed-normal', 'speed-fast', 'speed-slow');
        }, 1500);
      }
    });
  }

  /**
   * Calculate movement distance between spaces
   * @param {string} fromSpaceId - Origin space ID
   * @param {string} toSpaceId - Destination space ID
   * @returns {number} Distance between spaces
   */
  calculateMovementDistance = (fromSpaceId, toSpaceId) => {
    if (!fromSpaceId || !toSpaceId) return 1;
    
    // Extract numeric parts for basic distance calculation
    const fromNum = parseInt(fromSpaceId.replace(/\D/g, '')) || 0;
    const toNum = parseInt(toSpaceId.replace(/\D/g, '')) || 0;
    
    return Math.abs(toNum - fromNum);
  }

  /**
   * Show movement prediction visualization
   * @param {Object} player - Current player
   * @param {Array} availableMoves - Array of available move destinations
   */
  showMovementPrediction = (player, availableMoves) => {
    if (window.PlayerMovementVisualizer && availableMoves && availableMoves.length > 0) {
      const currentSpace = player.position || player.currentSpace;
      window.PlayerMovementVisualizer.showMovementPrediction(player, currentSpace, availableMoves);
    }
  }

  /**
   * Clear movement prediction visualization
   */
  clearMovementPrediction = () => {
    if (window.PlayerMovementVisualizer) {
      window.PlayerMovementVisualizer.clearMovementPrediction();
    }
  }

  /**
   * Enhanced cleanup when component unmounts
   */
  cleanup = () => {
    console.log('TurnManager: Cleaning up resources');
    
    // Clear any active timers
    if (this.activePlayerHighlightTimer) {
      clearTimeout(this.activePlayerHighlightTimer);
      this.activePlayerHighlightTimer = null;
    }
    
    // Clear movement predictions
    this.clearMovementPrediction();
    
    // Clear any visual effects
    if (window.PlayerMovementVisualizer) {
      window.PlayerMovementVisualizer.clearAllEffects();
    }
    
    // Remove all event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    }
    
    console.log('TurnManager: Cleanup completed');
  }
}

// Export TurnManager for use in other files
window.TurnManager = TurnManager;

// Export event constants for backward compatibility
window.TURN_EVENTS = {
  TURN_CHANGED: 'turnChanged',
  ACTIVE_PLAYER_CHANGED: 'activePlayerChanged',
  PLAYER_POSITION_CHANGED: 'playerPositionChanged',
  PLAYER_NEGOTIATED: 'playerNegotiated'
};

console.log('TurnManager.js code execution finished');
console.log('TurnManager.js PHASE 4: Integrated with MovementEngine for complete turn completion [2025-05-27]');
