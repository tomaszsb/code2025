// MoveLogicBackwardCompatibility.js - Compatibility layer for old code
console.log('MoveLogicBackwardCompatibility.js file is being processed');

import { MoveLogicManager } from './MoveLogicManager.js';

/**
 * MoveLogicBackwardCompatibility - Backward compatibility layer for legacy code
 * 
 * This module maintains the window.MoveLogic global object that was used in legacy code
 * and forwards the calls to the new MoveLogicManager implementation.
 */
class MoveLogicBackwardCompatibility {
  /**
   * Create a backward compatibility layer
   * @param {MoveLogicManager} manager - The MoveLogicManager instance
   */
  constructor(manager) {
    console.log('MoveLogicBackwardCompatibility: Initializing compatibility layer');
    this.manager = manager;
    
    // Create legacy compatibility object that forwards to the manager
    window.MoveLogic = {
      getAvailableMoves: (gameState, player) => 
        this.manager.getAvailableMoves(gameState, player),
      hasSpecialCaseLogic: (spaceName) => 
        this.manager.hasSpecialCaseLogic(spaceName),
      handleSpecialCaseSpace: (gameState, player, currentSpace) => 
        this.manager.handleSpecialCaseSpace(gameState, player, currentSpace),
      getSpaceDependentMoves: (gameState, player, currentSpace) => 
        this.manager.getSpaceDependentMoves(gameState, player, currentSpace),
      handleArchInitiation: (gameState, player, currentSpace) => 
        this.manager.handleArchInitiation(gameState, player, currentSpace),
      handlePmDecisionCheck: (gameState, player, currentSpace) => 
        this.manager.handlePmDecisionCheck(gameState, player, currentSpace),
      handleFdnyFeeReview: (gameState, player, currentSpace) => 
        this.manager.handleFdnyFeeReview(gameState, player, currentSpace),
      getMoveDetails: (space) => 
        this.manager.getMoveDetails(space)
    };
    
    console.log('MoveLogicBackwardCompatibility: Compatibility layer initialized');
  }
}

export { MoveLogicBackwardCompatibility };
