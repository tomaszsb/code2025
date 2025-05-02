// MoveLogic.js - Legacy compatibility layer for MoveLogicManager
console.log('MoveLogic.js file is beginning to be used');

/**
 * This file provides backward compatibility for code that still uses the
 * window.MoveLogic global object. All calls are forwarded to the new
 * MoveLogicManager implementation.
 * 
 * Note: This file should not be used directly in new code.
 * Use MoveLogicManager instead.
 */

// The actual implementation is set up by MoveLogicBackwardCompatibility.js
// This file just provides a placeholder until that's loaded

// Initial implementation with warning
window.MoveLogic = window.MoveLogic || {
  getAvailableMoves: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  hasSpecialCaseLogic: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return false;
  },
  handleSpecialCaseSpace: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  getSpaceDependentMoves: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  handleArchInitiation: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  handlePmDecisionCheck: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  handleFdnyFeeReview: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return [];
  },
  getMoveDetails: function() {
    console.warn('MoveLogic: MoveLogicManager not yet initialized, using fallback implementation');
    return '';
  }
};

console.log('MoveLogic.js code execution finished');
