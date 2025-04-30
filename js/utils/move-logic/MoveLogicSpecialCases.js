// MoveLogicSpecialCases.js - Special case handlers for specific spaces
console.log('MoveLogicSpecialCases.js file is being processed');

import { MoveLogicBase } from './MoveLogicBase.js';

/**
 * MoveLogicSpecialCases - Handlers for spaces with special logic
 * 
 * This module extends MoveLogicBase to add special case handlers for 
 * specific spaces that have unique movement rules.
 */
class MoveLogicSpecialCases extends MoveLogicBase {
  constructor() {
    super();
    console.log('MoveLogicSpecialCases: Constructor initialized');
    
    // Special case spaces that require custom logic
    this.specialCaseSpaces = [
      'ARCH-INITIATION',
      'PM-DECISION-CHECK',
      'REG-FDNY-FEE-REVIEW'
    ];
    
    // Spaces requiring dice roll for movement
    this.diceRollSpaces = [
      'ARCH-INITIATION'
    ];
    
    console.log('MoveLogicSpecialCases: Initialized successfully');
  }
  
  /**
   * Override hasSpecialCaseLogic to use our class property
   * @param {string} spaceName - The name of the space to check
   * @returns {boolean} - True if space has special case logic
   */
  hasSpecialCaseLogic(spaceName) {
    return this.specialCaseSpaces.includes(spaceName);
  }
  
  /**
   * Override handleSpecialCaseSpace to dispatch to the appropriate handler
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  handleSpecialCaseSpace(gameState, player, currentSpace) {
    // Implementation for each special case
    switch (currentSpace.name) {
      case 'ARCH-INITIATION':
        return this.handleArchInitiation(gameState, player, currentSpace);
      case 'PM-DECISION-CHECK':
        return this.handlePmDecisionCheck(gameState, player, currentSpace);
      case 'REG-FDNY-FEE-REVIEW':
        return this.handleFdnyFeeReview(gameState, player, currentSpace);
      default:
        console.log('MoveLogicSpecialCases: No handler for space:', currentSpace.name);
        return super.getSpaceDependentMoves(gameState, player, currentSpace);
    }
  }
  
  /**
   * Handle ARCH-INITIATION space
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  handleArchInitiation(gameState, player, currentSpace) {
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log('MoveLogicSpecialCases: ARCH-INITIATION visit type is:', visitType);
    console.log('MoveLogicSpecialCases: Player visited spaces:', player.visitedSpaces);
    console.log('MoveLogicSpecialCases: Current position:', player.position);
    
    // Read the next spaces directly from the CSV data stored in the space object
    const rawNextSpaces = [
      currentSpace.rawSpace1, 
      currentSpace.rawSpace2, 
      currentSpace.rawSpace3, 
      currentSpace.rawSpace4, 
      currentSpace.rawSpace5
    ].filter(space => space && space.trim() !== '' && space !== 'n/a');
    
    console.log('MoveLogicSpecialCases: Raw next spaces from CSV:', rawNextSpaces);
    
    // Check if any of the next spaces contain special patterns
    const hasSpecialPattern = rawNextSpaces.some(space => 
      this.specialPatterns.some(pattern => space.includes(pattern))
    );
    
    if (hasSpecialPattern) {
      console.log('MoveLogicSpecialCases: Special pattern detected in next spaces');
      
      // For first visit with special patterns, we still need to provide the ARCH-FEE-REVIEW move
      if (visitType.toLowerCase() === 'first') {
        console.log('MoveLogicSpecialCases: First visit with special pattern - looking for ARCH-FEE-REVIEW');
        
        // Look for ARCH-FEE-REVIEW space directly
        const archFeeReviewSpaces = gameState.spaces.filter(s => 
          s.name === 'ARCH-FEE-REVIEW'
        );
        
        if (archFeeReviewSpaces.length > 0) {
          // Get the right visit type
          const hasVisitedFeeReview = gameState.hasPlayerVisitedSpace(player, 'ARCH-FEE-REVIEW');
          const feeReviewVisitType = hasVisitedFeeReview ? 'subsequent' : 'first';
          
          // Find the right version 
          const nextSpace = archFeeReviewSpaces.find(s => 
            s.visitType.toLowerCase() === feeReviewVisitType.toLowerCase()
          ) || archFeeReviewSpaces[0];
          
          console.log('MoveLogicSpecialCases: Found ARCH-FEE-REVIEW space for special pattern:', nextSpace.id);
          return [nextSpace];
        }
      }
      
      // For subsequent visits with special patterns, we'll need dice roll logic in the future
      if (visitType.toLowerCase() === 'subsequent') {
        console.log('MoveLogicSpecialCases: Subsequent visit with special pattern - dice roll needed');
        // For now, no moves available for this case
        return [];
      }
    }
    
    // For normal (non-special) next spaces, process them directly
    const availableMoves = [];
    
    for (const rawSpaceName of rawNextSpaces) {
      // Skip special patterns
      if (this.specialPatterns.some(pattern => rawSpaceName.includes(pattern))) {
        continue;
      }
      
      // Extract the base space name
      const cleanedSpaceName = gameState.extractSpaceName(rawSpaceName);
      console.log('MoveLogicSpecialCases: Processing raw space name:', rawSpaceName, '-> cleaned:', cleanedSpaceName);
      
      // Find spaces that match this name
      const matchingSpaces = gameState.spaces.filter(s => {
        const extractedName = gameState.extractSpaceName(s.name);
        const isMatch = extractedName === cleanedSpaceName || 
                       s.name.includes(cleanedSpaceName) || 
                       cleanedSpaceName.includes(extractedName);
        return isMatch;
      });
      
      console.log('MoveLogicSpecialCases: Found', matchingSpaces.length, 'matching spaces for', cleanedSpaceName);
      
      if (matchingSpaces.length > 0) {
        // Determine visit type
        const hasVisitedNextSpace = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const nextVisitType = hasVisitedNextSpace ? 'subsequent' : 'first';
        
        // Find the right version
        const nextSpace = matchingSpaces.find(s => 
          s.visitType.toLowerCase() === nextVisitType.toLowerCase()
        ) || matchingSpaces[0];
        
        // Add to available moves
        availableMoves.push(nextSpace);
        console.log('MoveLogicSpecialCases: Added move from CSV data:', nextSpace.name, nextSpace.id);
      }
    }
    
    // If we found available moves, return them
    if (availableMoves.length > 0) {
      console.log('MoveLogicSpecialCases: Returning', availableMoves.length, 'moves for ARCH-INITIATION');
      return availableMoves;
    }
    
    // Special fallback for ARCH-INITIATION first visit when no moves found
    if (visitType.toLowerCase() === 'first' && availableMoves.length === 0) {
      console.log('MoveLogicSpecialCases: No moves found for ARCH-INITIATION first visit, using fallback');
      
      // Look for ARCH-FEE-REVIEW as a fallback
      const archFeeReviewSpaces = gameState.spaces.filter(s => 
        s.name === 'ARCH-FEE-REVIEW'
      );
      
      if (archFeeReviewSpaces.length > 0) {
        const nextSpace = archFeeReviewSpaces.find(s => 
          s.visitType.toLowerCase() === 'first'
        ) || archFeeReviewSpaces[0];
        
        console.log('MoveLogicSpecialCases: Using fallback ARCH-FEE-REVIEW:', nextSpace.id);
        return [nextSpace];
      }
    }
    
    // If no moves found and fallbacks fail, return empty array
    console.log('MoveLogicSpecialCases: No moves found for ARCH-INITIATION');
    return [];
  }
  
  /**
   * Handle PM-DECISION-CHECK space
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  handlePmDecisionCheck(gameState, player, currentSpace) {
    console.log('MoveLogicSpecialCases: Special case for PM-DECISION-CHECK');
    console.log('MoveLogicSpecialCases: Player position:', player.position);
    console.log('MoveLogicSpecialCases: Visit type:', currentSpace.visitType);
    
    // Read the next spaces directly from the CSV data stored in the space object
    const rawNextSpaces = [
      currentSpace.rawSpace1, 
      currentSpace.rawSpace2, 
      currentSpace.rawSpace3, 
      currentSpace.rawSpace4, 
      currentSpace.rawSpace5
    ].filter(space => space && space.trim() !== '' && space !== 'n/a');
    
    console.log('MoveLogicSpecialCases: Raw next spaces from CSV:', rawNextSpaces);
    
    const availableMoves = [];
    
    // Process each raw next space from the CSV
    for (const rawSpaceName of rawNextSpaces) {
      // Extract the base space name (before any explanatory text)
      const cleanedSpaceName = gameState.extractSpaceName(rawSpaceName);
      console.log('MoveLogicSpecialCases: Processing raw space name:', rawSpaceName, '-> cleaned:', cleanedSpaceName);
      
      // Find spaces that match this name
      const matchingSpaces = gameState.spaces.filter(s => {
        const extractedName = gameState.extractSpaceName(s.name);
        const isMatch = extractedName === cleanedSpaceName || 
                       s.name.includes(cleanedSpaceName) || 
                       cleanedSpaceName.includes(extractedName);
        
        if (isMatch) {
          console.log('MoveLogicSpecialCases: Found matching space:', s.name, s.id);
        }
        
        return isMatch;
      });
      
      console.log('MoveLogicSpecialCases: Found', matchingSpaces.length, 'matching spaces for', cleanedSpaceName);
      
      if (matchingSpaces.length > 0) {
        // Determine if player has visited this space before
        const hasVisitedNextSpace = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const nextVisitType = hasVisitedNextSpace ? 'subsequent' : 'first';
        
        // Find the right version of the space based on visit type
        const nextSpace = matchingSpaces.find(s => 
          s.visitType.toLowerCase() === nextVisitType.toLowerCase()
        ) || matchingSpaces[0];
        
        // Add to available moves if not already in the list
        if (!availableMoves.some(move => move.id === nextSpace.id)) {
          availableMoves.push(nextSpace);
          console.log('MoveLogicSpecialCases: Added PM-DECISION-CHECK move:', nextSpace.name, nextSpace.id);
        }
      } else {
        console.log('MoveLogicSpecialCases: Could not find space for:', cleanedSpaceName);
      }
    }
    
    console.log('MoveLogicSpecialCases: PM-DECISION-CHECK moves count:', availableMoves.length);
    return availableMoves;
  }
  
  /**
   * Handle REG-FDNY-FEE-REVIEW space
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player to get moves for
   * @param {Object} currentSpace - The current space of the player
   * @returns {Array} - Array of available moves
   */
  handleFdnyFeeReview(gameState, player, currentSpace) {
    // This is a complex case with multiple conditions from the CSV
    // For simplicity, we'll use the standard space logic for now
    console.log('MoveLogicSpecialCases: Using standard logic for REG-FDNY-FEE-REVIEW');
    return super.getSpaceDependentMoves(gameState, player, currentSpace);
  }
}

export { MoveLogicSpecialCases };
