/**
 * LogicSpaceManager.js
 * 
 * Handles the UI and interaction logic for Logic spaces in the movement system.
 * Integrates the proven logic from game_movement_system.html into the React-based game.
 */

console.log('LogicSpaceManager.js loading...');

// VERSION TRACKING for cache-buster
if (window.LOADED_VERSIONS) {
  window.LOADED_VERSIONS['LogicSpaceManager'] = '2025-05-27-001';
  console.log('LogicSpaceManager: Version 2025-05-27-001 loaded');
}

const LogicSpaceManager = {
  /**
   * Check if a player is currently in a logic space
   * @param {Object} player - Player object
   * @returns {boolean} True if in logic space
   */
  isPlayerInLogicSpace(player) {
    if (!player || !window.movementEngine) return false;
    
    const spaceType = window.movementEngine.getSpaceType(player.position);
    return spaceType === 'logic';
  },

  /**
   * Get logic space question data for current player
   * @returns {Object|null} Logic question data or null
   */
  getCurrentLogicQuestion() {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer || !window.movementEngine) return null;

    const spaceData = window.movementEngine.getCurrentSpaceData(currentPlayer);
    if (!spaceData) return null;

    return window.movementEngine.getCurrentLogicQuestion(currentPlayer, spaceData);
  },

  /**
   * Handle logic choice selection
   * @param {boolean} choice - true for YES, false for NO
   * @returns {Object|null} Result of the choice
   */
  makeLogicChoice(choice) {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer || !window.movementEngine) {
      console.error('LogicSpaceManager: No current player or movement engine');
      return null;
    }

    const result = window.movementEngine.handleLogicChoice(
      currentPlayer, 
      currentPlayer.position, 
      choice
    );

    if (result) {
      console.log('LogicSpaceManager: Logic choice result:', result);
      
      // If it's a final destination, trigger movement completion
      if (result.type === 'finalDestination') {
        this.handleLogicSpaceCompletion(result.destinations);
      }
    }

    return result;
  },

  /**
   * Handle completion of logic space navigation
   * @param {Array} destinations - Available final destinations
   */
  handleLogicSpaceCompletion(destinations) {
    if (!destinations || destinations.length === 0) {
      console.error('LogicSpaceManager: No destinations provided for logic completion');
      return;
    }

    // If only one destination, move there automatically
    if (destinations.length === 1) {
      this.selectLogicDestination(destinations[0].id);
    } else {
      // Multiple destinations - let player choose
      console.log('LogicSpaceManager: Multiple destinations available, waiting for player choice');
      // The UI should display the choice options
    }
  },

  /**
   * Select final destination from logic space
   * @param {string} destinationId - ID of chosen destination
   */
  selectLogicDestination(destinationId) {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (!currentPlayer || !window.movementEngine) {
      console.error('LogicSpaceManager: Cannot execute logic destination selection');
      return;
    }

    // Execute the move
    const result = window.movementEngine.executePlayerMove(currentPlayer, destinationId);
    
    if (result.success) {
      console.log(`LogicSpaceManager: Successfully moved to ${result.toSpace}`);
      
      // Trigger UI updates
      this.triggerUIUpdates();
      
      // Complete the turn
      if (window.TurnManager) {
        window.TurnManager.completeTurn();
      }
    } else {
      console.error('LogicSpaceManager: Failed to move to destination:', result.error);
    }
  },

  /**
   * Create React component for logic space questions
   * @param {Object} questionData - Question data from MovementEngine
   * @returns {React.Element} Logic question component
   */
  createLogicQuestionComponent(questionData) {
    if (!questionData) return null;

    return React.createElement('div', {
      className: 'logic-space-container',
      style: {
        background: '#007bff',
        color: 'white',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        margin: '20px 0'
      }
    }, [
      React.createElement('h2', { key: 'question' }, questionData.question),
      React.createElement('div', { key: 'buttons', style: { marginTop: '20px' } }, [
        React.createElement('button', {
          key: 'yes',
          onClick: () => this.makeLogicChoice(true),
          style: {
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            margin: '15px',
            borderRadius: '10px',
            fontSize: '18px',
            cursor: 'pointer'
          }
        }, 'YES'),
        React.createElement('button', {
          key: 'no',
          onClick: () => this.makeLogicChoice(false),
          style: {
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            margin: '15px',
            borderRadius: '10px',
            fontSize: '18px',
            cursor: 'pointer'
          }
        }, 'NO')
      ])
    ]);
  },

  /**
   * Create React component for logic space destination selection
   * @param {Array} destinations - Available destinations
   * @returns {React.Element} Destination selection component
   */
  createDestinationSelectionComponent(destinations) {
    if (!destinations || destinations.length === 0) return null;

    return React.createElement('div', {
      className: 'logic-destination-container',
      style: {
        background: '#28a745',
        color: 'white',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        margin: '20px 0'
      }
    }, [
      React.createElement('h2', { key: 'title' }, '🎯 Logic Complete! Choose your destination:'),
      React.createElement('div', { key: 'destinations' }, 
        destinations.map((dest, index) => 
          React.createElement('button', {
            key: index,
            onClick: () => this.selectLogicDestination(dest.id),
            style: {
              display: 'block',
              width: '80%',
              margin: '15px auto',
              padding: '20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              cursor: 'pointer'
            }
          }, dest.description || dest.name)
        )
      )
    ]);
  },

  /**
   * Trigger UI updates after logic space interactions
   */
  triggerUIUpdates() {
    // Trigger GameBoard update if available
    if (window.GameBoard && window.GameBoard.forceUpdate) {
      window.GameBoard.forceUpdate();
    }
    
    // Trigger other UI component updates
    const event = new CustomEvent('logicSpaceCompleted', {
      detail: {
        playerId: window.GameStateManager.getCurrentPlayer()?.id,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  },

  /**
   * Get debug information about current logic space state
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    
    return {
      isInLogicSpace: currentPlayer ? this.isPlayerInLogicSpace(currentPlayer) : false,
      currentQuestion: this.getCurrentLogicQuestion(),
      playerLogicState: currentPlayer?.logicState || null,
      movementEngineReady: !!window.movementEngine
    };
  }
};

// Export for use in other components
window.LogicSpaceManager = LogicSpaceManager;

console.log('LogicSpaceManager.js loaded successfully');
