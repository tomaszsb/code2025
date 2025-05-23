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
 */

// Create mixin object for SpaceInfo
window.SpaceInfoMoves = {
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
    
    // Define quest side spaces
    const questSideSpaces = ['LEND-SCOPE-CHECK', 'ARCH-INITIATION', 'OWNER-DECISION-REVIEW'];
    
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
    
    // Check if player came from a quest side space
    const cameFromQuestSide = questSideSpaces.some(questSpace => 
      previousSpaceName.includes(questSpace)
    );
    
    // Get original space info (if it exists)
    const originalSpaceId = player.properties?.originalSpaceId;
    let originalSpaceInfo = null;
    
    if (originalSpaceId) {
      const originalSpace = window.GameStateManager.findSpaceById(originalSpaceId);
      if (originalSpace) {
        originalSpaceInfo = this.extractBaseName(originalSpace.name);
      }
    }
    
    return (
      <div className="space-path-info-container">
        {/* Main Path Information - Always show where they came from */}
        <div className="space-path-info main-path">
          <div className="path-info-label">Main Path:</div>
          <div className="path-info-content">
            {originalSpaceInfo ? 
              <>Your original space was <strong>{originalSpaceInfo}</strong>.</> : 
              <>You came from <strong>{previousSpaceName}</strong>.</>
            }
          </div>
        </div>
        
        {/* Quest Path Information - Show quest status */}
        <div className="space-path-info quest-path">
          <div className="path-info-label">Quest Path:</div>
          <div className="path-info-content">
            {cameFromQuestSide ? 
              <>You came from <strong>{previousSpaceName}</strong>.</> : 
              <>You are not on a quest yet.</>
            }
          </div>
        </div>
      </div>
    );
  },
  /**
   * Renders available moves for the current space
   * @returns {JSX.Element|null} The available moves section or null
   */
  renderAvailableMoves: function() {
    const { onMoveSelect, selectedMoveId } = this.props;
    
    // Get moves with enhanced PM-DECISION-CHECK handling
    const enhancedMoves = this.getAvailableMoves();
    
    if (!enhancedMoves || enhancedMoves.length === 0) {
      return null;
    }
    
    console.log('SpaceInfoMoves: Rendering available moves:', enhancedMoves.map(m => m.name).join(', '));
    console.log('SpaceInfoMoves: Selected move ID:', selectedMoveId);
    
    return (
      <div className="space-available-moves">
        <div className="space-section-label">Available Moves:</div>
        <div className="available-moves-list" data-testid="moves-list">
          {enhancedMoves.map(move => {
            // Determine if this move is selected
            const isSelected = selectedMoveId && selectedMoveId === move.id;
            
            return (
              <button 
                key={move.id}
                className={`move-button primary-move-btn ${isSelected ? 'selected' : ''} ${move.fromOriginalSpace ? 'from-original-space' : ''}`}
                onClick={() => {
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
                  
                  if (onMoveSelect) {
                    onMoveSelect(move.id);
                  }
                }}
              >
                {move.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  },

  /**
   * Renders the OWNER-FUND-INITIATION button if needed
   * @returns {JSX.Element|null} The OWNER-FUND-INITIATION button section or null
   */
  renderOwnerFundInitiationButton: function() {
    const { space, availableMoves, onMoveSelect } = this.props;

    // Only show this for OWNER-SCOPE-INITIATION spaces when the move isn't already in availableMoves
    if (!space || 
        space.name !== 'OWNER-SCOPE-INITIATION' || 
        !onMoveSelect ||
        availableMoves?.some(move => move.name.includes('OWNER-FUND-INITIATION'))) {
      return null;
    }
    
    return (
      <div className="space-available-moves">
        <div className="space-section-label">Additional Move:</div>
        <button 
          className="move-button primary-move-btn"
          onClick={() => {
            console.log('SpaceInfoMoves: OWNER-FUND-INITIATION button clicked');
            // Find the OWNER-FUND-INITIATION space using GameStateManager
            if (window.GameStateManager) {
              const fundInitSpace = window.GameStateManager.spaces.find(s => s.name === 'OWNER-FUND-INITIATION');
              if (fundInitSpace) {
                console.log('SpaceInfoMoves: Found OWNER-FUND-INITIATION space:', fundInitSpace.id);
                onMoveSelect(fundInitSpace.id);
              } else {
                console.error('SpaceInfoMoves: OWNER-FUND-INITIATION space not found');
              }
            }
          }}
        >
          OWNER-FUND-INITIATION
        </button>
      </div>
    );
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
    
    // Define quest side spaces - only include actual quest side spaces
    const questSideSpaces = ['LEND-SCOPE-CHECK', 'ARCH-INITIATION', 'OWNER-DECISION-REVIEW'];
    
    // Get current player
    const player = window.GameStateManager.getCurrentPlayer();
    if (!player) {
      return availableMoves;
    }
    
    // Check if player has used CHEAT-BYPASS (point of no return)
    if (player.hasUsedCheatBypass) {
      console.log('SpaceInfoMoves: Player has used CHEAT-BYPASS, no return possible');
      return availableMoves;
    }
    
    // Check if player came from a quest side space
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
    
    // Make sure we get the base name without any suffixes like '-first' or '-subsequent'
    const previousSpaceName = this.extractBaseName(previousSpace.name);
    console.log('SpaceInfoMoves: Previous space name (extracted):', previousSpaceName);
    
    // Improved check if the space is a quest side space
    const cameFromQuestSide = questSideSpaces.some(questSpace => 
      previousSpaceName.includes(questSpace)
    );
    
    console.log(`SpaceInfoMoves: Previous space: ${previousSpaceName}, Coming from quest side: ${cameFromQuestSide}`);
    
    if (!cameFromQuestSide) {
      // Coming from main path - store original space
      if (!player.properties) player.properties = {};
      player.properties.originalSpaceId = previousSpaceId;
      console.log(`SpaceInfoMoves: Stored original space ID: ${previousSpaceId}`);
      
      // Force state save
      if (window.GameStateManager.saveState) {
        window.GameStateManager.saveState();
      }
      
      return availableMoves; // Only show standard moves
    } else {
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
