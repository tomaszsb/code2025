// SpaceInfoMoves.js file is beginning to be used
console.log('SpaceInfoMoves.js file is beginning to be used');

/**
 * SpaceInfoMoves - Move-related functionality for the SpaceInfo component
 * 
 * This module contains methods for rendering available moves
 * Used as a mixin for the SpaceInfo component
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
   * Renders the RETURN TO YOUR SPACE button for PM-DECISION-CHECK subsequent visits
   * This method is now disabled as original space moves are directly added to
   * the availableMoves array in MoveLogicPmDecisionCheck.js
   * @returns {null} Always returns null as this feature is now handled differently
   */
  renderReturnToYourSpaceButton: function() {
    // Original space moves are now directly included in the availableMoves array
    // This button is no longer needed as it has been replaced with a more intuitive approach
    // that shows the original space moves directly in the Available Moves section
    console.log('SpaceInfoMoves: RETURN TO YOUR SPACE button is disabled - original space moves are in availableMoves');
    return null;
  }
};

console.log('SpaceInfoMoves.js code execution finished');
console.log('SpaceInfoMoves.js updated to disable RETURN TO YOUR SPACE button [2025-05-06]');
