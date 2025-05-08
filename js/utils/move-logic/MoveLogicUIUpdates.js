// MoveLogicUIUpdates.js - DOM/UI update methods for move logic
console.log('MoveLogicUIUpdates.js file is beginning to be used');

/**
 * MoveLogicUIUpdates - UI helper methods for move logic
 * 
 * This module provides UI update methods for visualizing move-related changes to the DOM.
 * Uses composition pattern to work with MoveLogicSpecialCases instead of inheritance.
 */
(function() {
  // Create the MoveLogicUIUpdates object
  const MoveLogicUIUpdates = {
    initialized: false,
    
    /**
     * Initialize the UI Updates module
     */
    initialize: function() {
      console.log('MoveLogicUIUpdates: Initializing...');
      
      // Initialize CSS for visual feedback if needed
      this.initializeStyles();
      
      // Mark as initialized
      this.initialized = true;
      console.log('MoveLogicUIUpdates: Initialized successfully');
      
      return this;
    },
    
    /**
     * Delegate method call to MoveLogicSpecialCases if available
     * @param {string} methodName - The name of the method to call
     * @param {...any} args - Arguments to pass to the method
     * @returns {any} - The result of the method call
     */
    delegateToSpecialCases: function(methodName, ...args) {
      if (window.MoveLogicSpecialCases && typeof window.MoveLogicSpecialCases[methodName] === 'function') {
        return window.MoveLogicSpecialCases[methodName].apply(window.MoveLogicSpecialCases, args);
      }
      
      console.warn(`MoveLogicUIUpdates: Could not delegate to MoveLogicSpecialCases.${methodName}, method not found`);
      return null;
    },
    
    /**
     * Initialize CSS styles for visual feedback
     */
    initializeStyles: function() {
      try {
        // Create a style element if it doesn't already exist
        const styleId = 'move-logic-ui-styles';
        if (document.getElementById(styleId)) {
          return; // Style already added
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .visit-type-updated {
            animation: visitTypeUpdate 1s ease;
          }
          
          @keyframes visitTypeUpdate {
            0% { background-color: rgba(255, 255, 0, 0.5); }
            100% { background-color: transparent; }
          }
          
          .move-selected-fixed {
            border: 3px solid #000 !important;
            box-shadow: 0 0 0 3px #e74c3c, 0 5px 15px rgba(0, 0, 0, 0.3) !important;
            z-index: 10 !important;
            position: relative !important;
          }
          
          .your-turn-indicator {
            display: block !important;
            position: absolute !important;
            top: -20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background-color: rgba(255, 215, 0, 0.9) !important;
            color: #333 !important;
            padding: 3px 8px !important;
            border-radius: 10px !important;
            font-size: 10px !important;
            font-weight: bold !important;
            white-space: nowrap !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
            z-index: 100 !important;
            animation: bounce-in 0.5s ease-out forwards !important;
          }
          
          /* PM-DECISION-CHECK specific styles */
          .pm-decision-return-option {
            background-color: rgba(0, 200, 83, 0.15) !important;
            border: 2px dashed #00c853 !important;
          }
          
          .pm-decision-cheat-option {
            background-color: rgba(244, 67, 54, 0.15) !important;
            border: 2px dashed #f44336 !important;
          }
          
          /* Enhanced space indicators */
          .original-space-option {
            position: relative !important;
          }
          
          .original-space-option::before {
            content: 'FROM ORIGINAL SPACE' !important;
            position: absolute !important;
            top: -15px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            font-size: 9px !important;
            background-color: #00c853 !important;
            color: white !important;
            padding: 2px 6px !important;
            border-radius: 8px !important;
            white-space: nowrap !important;
            z-index: 10 !important;
          }
          
          @keyframes bounce-in {
            0% { transform: translateX(-50%) translateY(10px); opacity: 0; }
            70% { transform: translateX(-50%) translateY(-3px); opacity: 1; }
            100% { transform: translateX(-50%) translateY(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
        console.log('MoveLogicUIUpdates: Added CSS styles to document');
      } catch (error) {
        console.error('MoveLogicUIUpdates: Error adding CSS styles:', error);
        // Fallback to simple alert if CSS fails to load
        try {
          const fallbackStyle = document.createElement('style');
          fallbackStyle.id = 'move-logic-ui-fallback-styles';
          fallbackStyle.textContent = `
            .move-selected-fixed {
              border: 3px solid red !important;
            }
          `;
          document.head.appendChild(fallbackStyle);
          console.log('MoveLogicUIUpdates: Added fallback CSS styles');
        } catch (e) {
          console.error('MoveLogicUIUpdates: Failed to add even fallback styles:', e);
        }
      }
    },
    
    /**
     * Update the current player token to show "YOUR TURN" indicator
     * @param {Object} currentPlayer - The current player object
     */
    updateCurrentPlayerTokenDisplay: function(currentPlayer) {
      console.log('MoveLogicUIUpdates: Updating current player token display');
      
      // Use a longer timeout to ensure React has fully rendered the DOM
      setTimeout(() => {
        try {
          // Find all current player tokens
          const currentPlayerTokens = document.querySelectorAll('.player-token.current-player');
          
          if (currentPlayerTokens.length === 0) {
            console.warn('MoveLogicUIUpdates: No current player tokens found');
            return;
          }
          
          // For each token, add or update the YOUR TURN indicator
          currentPlayerTokens.forEach(token => {
            // First add the required CSS class for animation
            token.classList.add('active-player-enhanced');
            
            // Check if a YOUR TURN indicator already exists
            let indicator = token.querySelector('.your-turn-indicator');
            
            // If no indicator exists, create one
            if (!indicator) {
              indicator = document.createElement('div');
              indicator.className = 'your-turn-indicator';
              indicator.textContent = 'YOUR TURN';
              token.appendChild(indicator);
            }
            
            // Make sure the indicator is visible (in case CSS hiding it)
            indicator.style.display = 'block';
            
            console.log('MoveLogicUIUpdates: Added/updated YOUR TURN indicator');
          });
          
          // Also ensure selected move has proper border styling
          this.updateSelectedMoveStyling();
          
        } catch (error) {
          console.error('MoveLogicUIUpdates: Error updating player token display', error);
        }
      }, 300); // Longer delay to ensure DOM is fully rendered
    },
    
    /**
     * Update space visit display in the DOM
     * This function updates the visit type label on the board space
     * @param {string} spaceName - The name of the space to update
     * @param {string} visitType - The visit type ('first' or 'subsequent')
     */
    updateSpaceVisitDisplay: function(spaceName, visitType) {
      console.log(`MoveLogicUIUpdates: Updating space visit display for ${spaceName} to ${visitType}`);
      
      // Wait for DOM to be ready with a longer delay to ensure React has rendered
      setTimeout(() => {
        try {
          // Find all space elements on the board with this name (use a more precise selector)
          const allSpaces = Array.from(document.querySelectorAll('.board-space'));
          const matchingSpaces = allSpaces.filter(spaceEl => {
            const nameElement = spaceEl.querySelector('.space-name');
            // Use exact matching instead of includes to avoid partial matches
            return nameElement && nameElement.textContent.trim() === spaceName.trim();
          });
          
          console.log(`MoveLogicUIUpdates: Found ${matchingSpaces.length} matching spaces for ${spaceName}`);
          
          // Update each matching space's visit type display
          matchingSpaces.forEach(spaceEl => {
            const visitTypeEl = spaceEl.querySelector('.visit-type');
            if (visitTypeEl) {
              const capitalizedVisitType = visitType.charAt(0).toUpperCase() + visitType.slice(1);
              visitTypeEl.textContent = `${capitalizedVisitType} Visit`;
              // Add a temporary class to highlight the change
              visitTypeEl.classList.add('visit-type-updated');
              // Remove the highlight class after animation
              setTimeout(() => visitTypeEl.classList.remove('visit-type-updated'), 1000);
              console.log(`MoveLogicUIUpdates: Updated visit type display for ${spaceName} to ${capitalizedVisitType} Visit`);
            } else {
              console.warn(`MoveLogicUIUpdates: No visit-type element found for ${spaceName}`);
            }
          });
          
          // If no spaces were found, log a warning
          if (matchingSpaces.length === 0) {
            console.warn(`MoveLogicUIUpdates: No spaces found with name ${spaceName}`);
          }
        } catch (error) {
          console.error('MoveLogicUIUpdates: Error updating space visit display', error);
        }
      }, 200); // Longer delay to ensure DOM is fully updated
    },
    
    /**
     * Update the selected move styling to ensure dark black border is visible
     */
    updateSelectedMoveStyling: function() {
      setTimeout(() => {
        try {
          // Find all selected move elements
          const selectedMoveElements = document.querySelectorAll('.board-space.selected-move');
          
          if (selectedMoveElements.length === 0) {
            // No selected moves, just log and return
            console.log('MoveLogicUIUpdates: No selected move elements found');
            return;
          }
          
          // Apply strong styling to each selected move element
          selectedMoveElements.forEach(element => {
            // Add a custom class for our styling
            element.classList.add('move-selected-fixed');
            
            console.log('MoveLogicUIUpdates: Applied border styling to selected move');
          });
        } catch (error) {
          console.error('MoveLogicUIUpdates: Error updating selected move styling', error);
        }
      }, 200); // Short delay to ensure DOM is updated
    },
    
    // Add any MoveLogicSpecialCases method wrappers if needed
    hasSpecialCaseLogic: function(spaceName) {
      return this.delegateToSpecialCases('hasSpecialCaseLogic', spaceName);
    },
    
    handleSpecialCaseSpace: function(gameState, player, currentSpace) {
      return this.delegateToSpecialCases('handleSpecialCaseSpace', gameState, player, currentSpace);
    },
    
    getPlayerGameProperty: function(gameState, player, propertyName) {
      return this.delegateToSpecialCases('getPlayerGameProperty', gameState, player, propertyName);
    },
    
    setPlayerGameProperty: function(gameState, player, propertyName, value) {
      return this.delegateToSpecialCases('setPlayerGameProperty', gameState, player, propertyName, value);
    }
  };
  
  // Initialize and expose the object to the global scope
  window.MoveLogicUIUpdates = MoveLogicUIUpdates.initialize();
  
  console.log('MoveLogicUIUpdates.js code execution finished');
})();
