// MoveLogicManager.js - Manager for handling different types of moves in the game
console.log('MoveLogicManager.js file is beginning to be used');

/**
 * MoveLogicManager - Manager class for game move operations
 * 
 * This component manages player movement options, special space logic, and 
 * game flow related to player movement throughout the board.
 * 
 * Key features:
 * - Uses GameStateManager events for communication
 * - Handles standard and special case space movement logic
 * - Manages dice roll requirements for certain spaces
 * - Provides consistent space navigation for game flow
 * - Follows the manager pattern with proper initialization and cleanup
 */
class MoveLogicManager {
  /**
   * Initialize the Move Logic Manager
   */
  constructor() {
    console.log('MoveLogicManager: Constructor initialized');
    
    // Configuration
    this.specialCaseSpaces = [
      'ARCH-INITIATION',
      'PM-DECISION-CHECK',
      'REG-FDNY-FEE-REVIEW'
    ];
    
    this.diceRollSpaces = [
      'ARCH-INITIATION'
    ];
    
    // Special patterns in next space navigation
    this.specialPatterns = [
      'Outcome from rolled dice',
      'Option from first visit'
    ];
    
    // State tracking
    this.initialized = false;
    this.moveCache = new Map(); // Cache for frequently accessed moves
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      gameStateChanged: this.handleGameStateChangedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this),
      spaceChanged: this.handleSpaceChangedEvent.bind(this),
      diceRolled: this.handleDiceRolledEvent.bind(this)
    };
    
    // Register event listeners with GameStateManager
    this.registerEventListeners();
    
    this.initialized = true;
    console.log('MoveLogicManager: Constructor completed');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners() {
    console.log('MoveLogicManager: Registering event listeners');
    
    if (!window.GameStateManager) {
      console.error('MoveLogicManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register for game state events
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
    window.GameStateManager.addEventListener('diceRolled', this.eventHandlers.diceRolled);
    
    console.log('MoveLogicManager: Event listeners registered successfully');
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The gameStateChanged event object
   */
  handleGameStateChangedEvent(event) {
    console.log('MoveLogicManager: Handling gameStateChanged event');
    
    if (!event || !event.data) {
      return;
    }
    
    // Handle relevant game state changes
    if (event.data.changeType === 'newGame') {
      // Clear move cache for a new game
      this.moveCache.clear();
      console.log('MoveLogicManager: Cleared move cache for new game');
    }
  }
  
  /**
   * Handle turnChanged events from GameStateManager
   * @param {Object} event - The turnChanged event object
   */
  handleTurnChangedEvent(event) {
    console.log('MoveLogicManager: Handling turnChanged event');
    
    // We may need to update available moves when turn changes
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      // Clear specifically the cached moves for this player
      this.clearCachedMovesForPlayer(currentPlayer.id);
    }
  }
  
  /**
   * Handle spaceChanged events from GameStateManager
   * @param {Object} event - The spaceChanged event object
   */
  handleSpaceChangedEvent(event) {
    console.log('MoveLogicManager: Handling spaceChanged event');
    
    // Space has changed, we need to update available moves
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer && event.data && event.data.playerId) {
      // Clear cached moves for the player who moved
      this.clearCachedMovesForPlayer(event.data.playerId);
    }
  }
  
  /**
   * Handle diceRolled events from GameStateManager
   * @param {Object} event - The diceRolled event object
   */
  handleDiceRolledEvent(event) {
    console.log('MoveLogicManager: Handling diceRolled event');
    
    if (!event || !event.data) {
      return;
    }
    
    // Dice has been rolled, we may need to update available moves based on dice roll
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      // Clear cached moves to force recalculation with dice roll result
      this.clearCachedMovesForPlayer(currentPlayer.id);
    }
  }
  
  /**
   * Clear cached moves for a specific player
   * @param {string} playerId - The player ID
   */
  clearCachedMovesForPlayer(playerId) {
    if (!playerId) return;
    
    // Use player position as part of the cache key
    const player = window.GameStateManager.getPlayerById(playerId);
    if (player) {
      const cacheKey = `${playerId}-${player.position}`;
      if (this.moveCache.has(cacheKey)) {
        this.moveCache.delete(cacheKey);
        console.log(`MoveLogicManager: Cleared move cache for player ${playerId} at position ${player.position}`);
      }
    }
  }
  
  /**
   * Get all available moves for a player
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player object
   * @returns {Array|Object} Array of available moves or object with dice roll requirements
   */
  getAvailableMoves(gameState, player) {
    if (!gameState || !player) {
      console.error('MoveLogicManager: Invalid gameState or player');
      return [];
    }
    
    console.log(`MoveLogicManager: Getting available moves for player ${player.id}`);
    
    // Check for cached moves to improve performance
    const cacheKey = `${player.id}-${player.position}`;
    if (this.moveCache.has(cacheKey)) {
      const cachedMoves = this.moveCache.get(cacheKey);
      console.log(`MoveLogicManager: Using cached moves for ${cacheKey}`);
      return cachedMoves;
    }
    
    // Find the current space
    const currentSpace = gameState.spaces.find(s => s.id === player.position);
    if (!currentSpace) {
      console.error(`MoveLogicManager: Space not found for position ${player.position}`);
      return [];
    }
    
    console.log(`MoveLogicManager: Getting moves for space: ${currentSpace.name}`);
    
    // Determine if this is a first or subsequent visit
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    console.log(`MoveLogicManager: Visit type for ${currentSpace.name} is ${visitType}`);
    
    // Check for special case spaces first
    let moves;
    
    // Special case for dice roll spaces on subsequent visits
    if (this.isDiceRollRequiredSpace(currentSpace.name, visitType)) {
      moves = { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
      console.log(`MoveLogicManager: Dice roll required for ${currentSpace.name} on ${visitType} visit`);
    }
    // Check for special case logic spaces
    else if (this.hasSpecialCaseLogic(currentSpace.name)) {
      console.log(`MoveLogicManager: Using special case logic for ${currentSpace.name}`);
      moves = this.handleSpecialCaseSpace(gameState, player, currentSpace);
    }
    // Standard move logic
    else {
      console.log(`MoveLogicManager: Using standard move logic for ${currentSpace.name}`);
      moves = this.getSpaceDependentMoves(gameState, player, currentSpace);
    }
    
    // Cache the result for future use
    this.moveCache.set(cacheKey, moves);
    
    // Check if result indicates that dice roll is needed
    if (moves && typeof moves === 'object' && moves.requiresDiceRoll) {
      console.log('MoveLogicManager: Space requires dice roll for movement');
      return moves;
    }
    
    // Standard case - array of available moves
    console.log(`MoveLogicManager: Space-dependent moves count: ${moves ? moves.length : 0}`);
    return moves || [];
  }
  
  /**
   * Check if a space requires dice roll based on space name and visit type
   * @param {string} spaceName - The name of the space
   * @param {string} visitType - 'first' or 'subsequent'
   * @returns {boolean} True if dice roll is required
   */
  isDiceRollRequiredSpace(spaceName, visitType) {
    // Check if this is a dice roll space
    const isDiceRollSpace = this.diceRollSpaces.includes(spaceName);
    
    // For some spaces, dice roll is only required on subsequent visits
    if (isDiceRollSpace && spaceName === 'ARCH-INITIATION') {
      return visitType === 'subsequent';
    }
    
    return false;
  }
  
  /**
   * Check if a space has special case logic
   * @param {string} spaceName - The name of the space
   * @returns {boolean} True if the space has special case logic
   */
  hasSpecialCaseLogic(spaceName) {
    return this.specialCaseSpaces.includes(spaceName);
  }
  
  /**
   * Handle special case spaces with custom logic
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player object
   * @param {Object} currentSpace - The current space object
   * @returns {Array|Object} Available moves or dice roll requirement object
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
        console.warn(`MoveLogicManager: No special case handler for ${currentSpace.name}`);
        return [];
    }
  }
  
  /**
   * Get standard moves based on space data from CSV
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player object
   * @param {Object} currentSpace - The current space object
   * @returns {Array|Object} Available moves or dice roll requirement object
   */
  getSpaceDependentMoves(gameState, player, currentSpace) {
    // Get visit type for the current space
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log(`MoveLogicManager: Visit type for ${currentSpace.name} is ${visitType}`);
    
    // Find all spaces with the same name
    const spacesWithSameName = gameState.spaces.filter(s => s.name === currentSpace.name);
    
    // Find the one with the matching visit type
    const spaceForVisitType = spacesWithSameName.find(s => 
      s.visitType.toLowerCase() === visitType.toLowerCase()
    );
    
    // Use the right space or fall back to current one
    const spaceToUse = spaceForVisitType || currentSpace;
    
    console.log(`MoveLogicManager: Using space with ID ${spaceToUse.id} for moves`);
    
    const availableMoves = [];
    let hasSpecialPattern = false;
    let isDiceRollSpace = false;
    
    // Process each next space
    for (const nextSpaceName of spaceToUse.nextSpaces) {
      // Skip empty space names
      if (!nextSpaceName || nextSpaceName.trim() === '') continue;
      
      // Check if this is a negotiate option
      if (nextSpaceName.toLowerCase().includes('negotiate')) {
        console.log(`MoveLogicManager: Found negotiate option: ${nextSpaceName}`);
        // We don't add negotiate options to available moves, as they're handled by a separate UI element
        continue;
      }
      
      // Check if this is a special pattern
      if (this.specialPatterns.some(pattern => nextSpaceName.includes(pattern))) {
        hasSpecialPattern = true;
        console.log(`MoveLogicManager: Found special pattern in next space: ${nextSpaceName}`);
        
        // Check if this is a dice roll space
        if (nextSpaceName.includes('Outcome from rolled dice')) {
          isDiceRollSpace = true;
          console.log('MoveLogicManager: This is a dice roll space');
        }
        
        continue; // Skip this entry
      }
      
      // Get base name without explanatory text
      const cleanedSpaceName = gameState.extractSpaceName(nextSpaceName);
      
      console.log(`MoveLogicManager: Processing next space: ${cleanedSpaceName}`);
      
      // Find spaces with matching name
      const matchingSpaces = gameState.spaces.filter(s => 
        gameState.extractSpaceName(s.name) === cleanedSpaceName
      );
      
      if (matchingSpaces.length > 0) {
        // Determine if the player has visited this space before
        const hasVisitedNextSpace = gameState.hasPlayerVisitedSpace(player, cleanedSpaceName);
        const nextVisitType = hasVisitedNextSpace ? 'subsequent' : 'first';
        
        // Find the right version of the space
        const nextSpace = matchingSpaces.find(s => 
          s.visitType.toLowerCase() === nextVisitType.toLowerCase()
        ) || matchingSpaces[0];
        
        // Add to available moves if not already in the list
        if (!availableMoves.some(move => move.id === nextSpace.id)) {
          availableMoves.push(nextSpace);
          console.log(`MoveLogicManager: Added move: ${nextSpace.name} (${nextSpace.id})`);
        }
      } else {
        console.log(`MoveLogicManager: No matching space found for: ${cleanedSpaceName}`);
      }
    }
    
    // Handle special case for dice roll spaces
    if (isDiceRollSpace) {
      console.log('MoveLogicManager: This space requires a dice roll to determine next moves');
      // Mark this space as requiring a dice roll
      return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
    }
    
    // Handle special case where we had special patterns but no valid moves
    if (hasSpecialPattern && availableMoves.length === 0 && !isDiceRollSpace) {
      console.log('MoveLogicManager: Special case detected with no valid moves - applying fallback logic');
      // For now, just return an empty array
    }
    
    return availableMoves;
  }
  
  /**
   * Handle ARCH-INITIATION special case
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player object
   * @param {Object} currentSpace - The current space object
   * @returns {Array|Object} Available moves or dice roll requirement object
   */
  handleArchInitiation(gameState, player, currentSpace) {
    const hasVisited = gameState.hasPlayerVisitedSpace(player, currentSpace.name);
    const visitType = hasVisited ? 'subsequent' : 'first';
    
    console.log(`MoveLogicManager: ARCH-INITIATION visit type is: ${visitType}`);
    console.log(`MoveLogicManager: Player visited spaces: ${JSON.stringify(player.visitedSpaces)}`);
    console.log(`MoveLogicManager: Current position: ${player.position}`);
    
    // For subsequent visits, force dice roll
    if (visitType === 'subsequent') {
      console.log('MoveLogicManager: ARCH-INITIATION on subsequent visit - forcing dice roll');
      return { requiresDiceRoll: true, spaceName: currentSpace.name, visitType: visitType };
    }
    
    // Read the next spaces directly from the CSV data
    const rawNextSpaces = this.getRawNextSpacesFromSpace(currentSpace);
    
    console.log(`MoveLogicManager: Raw next spaces from CSV: ${rawNextSpaces.join(', ')}`);
    
    // Check if any of the next spaces contain special patterns
    const hasSpecialPattern = rawNextSpaces.some(space => 
      this.specialPatterns.some(pattern => space.includes(pattern))
    );
    
    if (hasSpecialPattern) {
      console.log('MoveLogicManager: Special pattern detected in next spaces');
      
      // For first visit with special patterns, we still need to provide the ARCH-FEE-REVIEW move
      if (visitType.toLowerCase() === 'first') {
        console.log('MoveLogicManager: First visit with special pattern - looking for ARCH-FEE-REVIEW');
        
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
          
          console.log(`MoveLogicManager: Found ARCH-FEE-REVIEW space for special pattern: ${nextSpace.id}`);
          return [nextSpace];
        }
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
      console.log(`MoveLogicManager: Processing raw space name: ${rawSpaceName} -> cleaned: ${cleanedSpaceName}`);
      
      // Find spaces that match this name
      const matchingSpaces = gameState.spaces.filter(s => {
        const extractedName = gameState.extractSpaceName(s.name);
        const isMatch = extractedName === cleanedSpaceName || 
                       s.name.includes(cleanedSpaceName) || 
                       cleanedSpaceName.includes(extractedName);
        return isMatch;
      });
      
      console.log(`MoveLogicManager: Found ${matchingSpaces.length} matching spaces for ${cleanedSpaceName}`);
      
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
        console.log(`MoveLogicManager: Added move from CSV data: ${nextSpace.name} (${nextSpace.id})`);
      }
    }
    
    // If we found available moves, return them
    if (availableMoves.length > 0) {
      console.log(`MoveLogicManager: Returning ${availableMoves.length} moves for ARCH-INITIATION`);
      return availableMoves;
    }
    
    // Special fallback for ARCH-INITIATION first visit when no moves found
    if (visitType.toLowerCase() === 'first' && availableMoves.length === 0) {
      console.log('MoveLogicManager: No moves found for ARCH-INITIATION first visit, using fallback');
      
      // Look for ARCH-FEE-REVIEW as a fallback
      const archFeeReviewSpaces = gameState.spaces.filter(s => 
        s.name === 'ARCH-FEE-REVIEW'
      );
      
      if (archFeeReviewSpaces.length > 0) {
        const nextSpace = archFeeReviewSpaces.find(s => 
          s.visitType.toLowerCase() === 'first'
        ) || archFeeReviewSpaces[0];
        
        console.log(`MoveLogicManager: Using fallback ARCH-FEE-REVIEW: ${nextSpace.id}`);
        return [nextSpace];
      }
    }
    
    // If no moves found and fallbacks fail, return empty array
    console.log('MoveLogicManager: No moves found for ARCH-INITIATION');
    return [];
  }
  
  /**
   * Handle PM-DECISION-CHECK special case
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player object
   * @param {Object} currentSpace - The current space object
   * @returns {Array} Available moves
   */
  handlePmDecisionCheck(gameState, player, currentSpace) {
    console.log('MoveLogicManager: Special case for PM-DECISION-CHECK');
    console.log(`MoveLogicManager: Player position: ${player.position}`);
    console.log(`MoveLogicManager: Visit type: ${currentSpace.visitType}`);
    
    // Read the next spaces directly from the CSV data stored in the space object
    const rawNextSpaces = this.getRawNextSpacesFromSpace(currentSpace);
    
    console.log(`MoveLogicManager: Raw next spaces from CSV: ${rawNextSpaces.join(', ')}`);
    
    const availableMoves = [];
    
    // Process each raw next space from the CSV
    for (const rawSpaceName of rawNextSpaces) {
      // Extract the base space name (before any explanatory text)
      const cleanedSpaceName = gameState.extractSpaceName(rawSpaceName);
      console.log(`MoveLogicManager: Processing raw space name: ${rawSpaceName} -> cleaned: ${cleanedSpaceName}`);
      
      // Find spaces that match this name
      const matchingSpaces = gameState.spaces.filter(s => {
        const extractedName = gameState.extractSpaceName(s.name);
        const isMatch = extractedName === cleanedSpaceName || 
                       s.name.includes(cleanedSpaceName) || 
                       cleanedSpaceName.includes(extractedName);
        
        if (isMatch) {
          console.log(`MoveLogicManager: Found matching space: ${s.name} (${s.id})`);
        }
        
        return isMatch;
      });
      
      console.log(`MoveLogicManager: Found ${matchingSpaces.length} matching spaces for ${cleanedSpaceName}`);
      
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
          console.log(`MoveLogicManager: Added PM-DECISION-CHECK move: ${nextSpace.name} (${nextSpace.id})`);
        }
      } else {
        console.log(`MoveLogicManager: Could not find space for: ${cleanedSpaceName}`);
      }
    }
    
    console.log(`MoveLogicManager: PM-DECISION-CHECK moves count: ${availableMoves.length}`);
    return availableMoves;
  }
  
  /**
   * Handle FDNY-FEE-REVIEW special case
   * @param {Object} gameState - The current game state
   * @param {Object} player - The player object
   * @param {Object} currentSpace - The current space object
   * @returns {Array} Available moves
   */
  handleFdnyFeeReview(gameState, player, currentSpace) {
    // This is a complex case with multiple conditions from the CSV
    // For simplicity, we'll use the standard space logic for now
    console.log('MoveLogicManager: Using standard logic for REG-FDNY-FEE-REVIEW');
    return this.getSpaceDependentMoves(gameState, player, currentSpace);
  }
  
  /**
   * Extract raw next spaces from a space object
   * @param {Object} space - The space object
   * @returns {Array} Array of raw next space names
   */
  getRawNextSpacesFromSpace(space) {
    if (!space) return [];
    
    // Extract rawSpace properties from the space object
    return [
      space.rawSpace1, 
      space.rawSpace2, 
      space.rawSpace3, 
      space.rawSpace4, 
      space.rawSpace5
    ].filter(spaceName => spaceName && spaceName.trim() !== '' && spaceName !== 'n/a');
  }
  
  /**
   * Get move details for display
   * @param {Object} space - The space object
   * @returns {string} A formatted string with move details
   */
  getMoveDetails(space) {
    if (!space) return '';
    
    const details = [];
    
    // Add fee information if available
    if (space.Fee && space.Fee.trim() !== '') {
      details.push(`Fee: ${space.Fee}`);
    }
    
    // Add time information if available
    if (space.Time && space.Time.trim() !== '') {
      details.push(`Time: ${space.Time}`);
    }
    
    return details.join(', ');
  }
  
  /**
   * Clean up resources when the manager is no longer needed
   */
  cleanup() {
    console.log('MoveLogicManager: Cleaning up resources');
    
    // Remove all event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
      window.GameStateManager.removeEventListener('diceRolled', this.eventHandlers.diceRolled);
    }
    
    // Clear cache
    this.moveCache.clear();
    
    console.log('MoveLogicManager: Cleanup completed');
  }
}

// Create a BackwardCompatibilityLayer to maintain existing functionality
class MoveLogicBackwardCompatibility {
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

// Initialize manager and compatibility layer
(function() {
  console.log('MoveLogicManager: Initializing manager...');
  
  // Create manager instance
  const moveLogicManager = new MoveLogicManager();
  
  // Create compatibility layer
  const compatibilityLayer = new MoveLogicBackwardCompatibility(moveLogicManager);
  
  // Store manager reference on window for direct access if needed
  window.MoveLogicManager = moveLogicManager;
  
  console.log('MoveLogicManager: Manager initialized and compatibility layer set up');
})();

console.log('MoveLogicManager.js code execution finished');