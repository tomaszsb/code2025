// MoveLogicUIUpdates.js - DOM/UI update methods for move logic
console.log('MoveLogicUIUpdates.js file is being processed');

import { MoveLogicSpecialCases } from './MoveLogicSpecialCases.js';

/**
 * MoveLogicUIUpdates - UI helper methods for move logic
 * 
 * This module extends MoveLogicSpecialCases to add UI update methods
 * for visualizing move-related changes to the DOM.
 */
class MoveLogicUIUpdates extends MoveLogicSpecialCases {
  constructor() {
    super();
    console.log('MoveLogicUIUpdates: Constructor initialized');
    
    // Initialize CSS for visual feedback if needed
    this.initializeStyles();
    
    console.log('MoveLogicUIUpdates: Initialized successfully');
  }
  
  /**
   * Initialize CSS styles for visual feedback
   */
  initializeStyles() {
    const style = document.createElement('style');
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
      
      @keyframes bounce-in {
        0% { transform: translateX(-50%) translateY(10px); opacity: 0; }
        70% { transform: translateX(-50%) translateY(-3px); opacity: 1; }
        100% { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    console.log('MoveLogicUIUpdates: Added CSS styles to document');
  }
  
  /**
   * Update the current player token to show "YOUR TURN" indicator
   * @param {Object} currentPlayer - The current player object
   */
  updateCurrentPlayerTokenDisplay(currentPlayer) {
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
  }
  
  /**
   * Update space visit display in the DOM
   * This function updates the visit type label on the board space
   * @param {string} spaceName - The name of the space to update
   * @param {string} visitType - The visit type ('first' or 'subsequent')
   */
  updateSpaceVisitDisplay(spaceName, visitType) {
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
  }
  
  /**
   * Update the selected move styling to ensure dark black border is visible
   */
  updateSelectedMoveStyling() {
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
          // Apply inline styles to override any CSS issues
          element.style.border = '3px solid #000'; // Solid black border
          element.style.boxShadow = '0 0 0 3px #e74c3c, 0 5px 15px rgba(0, 0, 0, 0.3)';
          element.style.position = 'relative'; // Ensure positioning works
          element.style.zIndex = '10'; // Bring to front
          
          // Add a custom class for our styling
          element.classList.add('move-selected-fixed');
          
          console.log('MoveLogicUIUpdates: Applied strong border styling to selected move');
        });
      } catch (error) {
        console.error('MoveLogicUIUpdates: Error updating selected move styling', error);
      }
    }, 200); // Short delay to ensure DOM is updated
  }
}

export { MoveLogicUIUpdates };
