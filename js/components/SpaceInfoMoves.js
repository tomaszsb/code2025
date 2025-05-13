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
 */

// Create mixin object for SpaceInfo
window.SpaceInfoMoves = {
  /**
   * Renders available moves for the current space
   * @returns {JSX.Element|null} The available moves section or null
   */
  renderAvailableMoves: function() {
    const { availableMoves, onMoveSelect, selectedMoveId } = this.props;
    
    if (!availableMoves || availableMoves.length === 0) {
      return null;
    }
    
    console.log('SpaceInfoMoves: Rendering available moves:', availableMoves.map(m => m.name).join(', '));
    console.log('SpaceInfoMoves: Selected move ID:', selectedMoveId);
    
    return (
      <div className="space-available-moves">
        <div className="space-section-label">Available Moves:</div>
        <div className="available-moves-list" data-testid="moves-list">
          {availableMoves.map(move => {
            // Determine if this move is selected
            const isSelected = selectedMoveId && selectedMoveId === move.id;
            
            return (
              <button 
                key={move.id}
                className={`move-button primary-move-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  console.log('SpaceInfoMoves: Move button clicked:', move.name, move.id);
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
   * Renders the RETURN TO YOUR SPACE button for PM-DECISION-CHECK subsequent visits only
   * @returns {JSX.Element|null} The RETURN TO YOUR SPACE button or null
   */
  renderReturnToYourSpaceButton: function() {
    const { space, visitType } = this.props;
    
    // Only show for PM-DECISION-CHECK spaces
    if (!space || space.name !== 'PM-DECISION-CHECK') {
      return null;
    }
    
    console.log('SpaceInfoMoves: Checking return button for PM-DECISION-CHECK, visitType:', visitType);
    
    // CRITICAL: Only show the return button for subsequent visits to PM-DECISION-CHECK
    // The first visit case doesn't need return capability as there's no original path yet
    if (!visitType || visitType.toLowerCase() !== 'subsequent') {
      console.log('SpaceInfoMoves: Not a subsequent visit, return button disabled');
      return null;
    }
    
    // We'll show the return button (handled by the rest of the function below)
    console.log('SpaceInfoMoves: Subsequent visit to PM-DECISION-CHECK, showing return button');
    
    // Get the current player
    const player = window.GameStateManager.getCurrentPlayer();
    if (!player) {
      return null;
    }
    
    // Check if player has used CHEAT-BYPASS (point of no return)
    if (player.hasUsedCheatBypass) {
      console.log('SpaceInfoMoves: Player has used CHEAT-BYPASS, no return possible');
      return null;
    }

    // The onMoveSelect handler is required
    const { onMoveSelect } = this.props;
    if (!onMoveSelect) {
      return null;
    }
    
    // For subsequent visits, if there's a previousPosition, that should be where they came from
    // But we'll also try to get the original space ID from other sources
    let returnSpaceId = null;
    let returnSpaceName = '';
    
    // Option 1: Get from player.previousPosition
    if (player.previousPosition) {
      const prevSpace = window.GameStateManager.findSpaceById(player.previousPosition);
      if (prevSpace && !prevSpace.name.includes('PM-DECISION-CHECK')) {
        returnSpaceId = player.previousPosition;
        returnSpaceName = prevSpace.name;
        console.log('SpaceInfoMoves: Using previousPosition for return:', returnSpaceName);
      }
    }
    
    // Option 2: Try stored originalSpaceId
    if (!returnSpaceId) {
      if (player.originalSpaceId) {
        const origSpace = window.GameStateManager.findSpaceById(player.originalSpaceId);
        if (origSpace) {
          returnSpaceId = player.originalSpaceId;
          returnSpaceName = origSpace.name;
          console.log('SpaceInfoMoves: Using originalSpaceId for return:', returnSpaceName);
        }
      } else if (player.properties && player.properties.originalSpaceId) {
        const origSpace = window.GameStateManager.findSpaceById(player.properties.originalSpaceId);
        if (origSpace) {
          returnSpaceId = player.properties.originalSpaceId;
          returnSpaceName = origSpace.name;
          console.log('SpaceInfoMoves: Using properties.originalSpaceId for return:', returnSpaceName);
        }
      }
    }
    
    // Option 3: If all else fails, find ARCH-SCOPE-CHECK space as default for testing
    if (!returnSpaceId) {
      const archScopeCheckSpace = window.GameStateManager.spaces.find(s => 
        s.name.includes('ARCH-SCOPE-CHECK') && s.visitType && s.visitType.toLowerCase() === 'subsequent'
      );
      
      if (archScopeCheckSpace) {
        returnSpaceId = archScopeCheckSpace.id;
        returnSpaceName = archScopeCheckSpace.name;
        console.log('SpaceInfoMoves: Using ARCH-SCOPE-CHECK as fallback return space');
      }
    }
    
    // If we couldn't find a return space, don't show the button
    if (!returnSpaceId) {
      console.log('SpaceInfoMoves: No return space found, return button disabled');
      return null;
    }
    
    // Store the return space ID for future reference
    player.originalSpaceId = returnSpaceId;
    if (!player.properties) {
      player.properties = {};
    }
    player.properties.originalSpaceId = returnSpaceId;
    
    // Force state save
    if (window.GameStateManager.saveState) {
      window.GameStateManager.saveState();
    }
    
    // Render the return button
    return (
      <div className="space-available-moves">
        <div className="space-section-label">Return to Main Path:</div>
        <button 
          className="move-button primary-move-btn return-to-space-btn"
          onClick={() => {
            console.log('SpaceInfoMoves: RETURN TO MAIN PATH button clicked, returning to:', returnSpaceName);
            
            // Clear originalSpaceId as player is now returning to original path
            player.originalSpaceId = null;
            if (player.properties) {
              player.properties.originalSpaceId = null;
            }
            
            // Before navigating, save the game state
            if (window.GameStateManager.saveState) {
              window.GameStateManager.saveState();
            }
            
            // Navigate back to the return space
            onMoveSelect(returnSpaceId);
          }}
        >
          RETURN TO {returnSpaceName}
        </button>
      </div>
    );
  }
};

console.log('SpaceInfoMoves.js code execution finished');
console.log('SpaceInfoMoves.js updated to show return button ONLY for subsequent visits [2025-05-10]');
