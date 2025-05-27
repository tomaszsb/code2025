// DiceRollLogic.js - Utility for handling dice roll outcomes
// Phase 2 Enhancement: Now uses DiceOutcomeParser
console.log('DiceRollLogic.js file is being processed');

window.DiceRollLogic = {
  // Load dice roll data from CSV
  diceRollData: [],
  
  // Phase 2: Add DiceOutcomeParser integration
  outcomeParser: null,
  
  // Initialize with data from CSV
  initialize(diceRollData, structuredDiceData = null) {
    if (!diceRollData || diceRollData.length === 0) {
      console.error('DiceRollLogic: No dice roll data provided!');
      return;
    }
    
    this.diceRollData = diceRollData;
    console.log('DiceRollLogic: Initialized with', diceRollData.length, 'dice roll outcomes');
    
    // Phase 2: Initialize DiceOutcomeParser with both formats
    if (window.DiceOutcomeParser) {
      this.outcomeParser = new window.DiceOutcomeParser();
      this.outcomeParser.loadDiceData(structuredDiceData, diceRollData);
      
      const stats = this.outcomeParser.getDataStats();
      console.log('DiceRollLogic: Phase 2 parser initialized with', stats);
    } else {
      console.warn('DiceRollLogic: DiceOutcomeParser not available, using legacy mode only');
    }
  },
  
  // Get outcomes for a specific space and visit type
  getOutcomes(space, visitType) {
    if (!space || !visitType || !this.diceRollData) {
      console.error('DiceRollLogic: Missing parameters for getOutcomes');
      return null;
    }
    
    console.log('DiceRollLogic: Getting outcomes for', space, 'Visit type:', visitType);
    
    // Find all outcomes for this space and visit type
    const outcomes = this.diceRollData.filter(data => 
      data['Space Name'] === space && 
      data['Visit Type'].toLowerCase() === visitType.toLowerCase()
    );
    
    if (outcomes.length === 0) {
      console.log('DiceRollLogic: No dice outcomes found for', space, visitType);
      return null;
    }
    
    return outcomes;
  },
  
  // Process a dice roll for a specific outcome type
  processRoll(space, visitType, dieRoll, outcomeType) {
    console.log('DiceRollLogic: Processing roll', dieRoll, 'for', space, visitType, outcomeType);
    
    // Get all outcomes for this space
    const allOutcomes = this.getOutcomes(space, visitType);
    if (!allOutcomes) return null;
    
    // Find the specific outcome for this die roll and outcome type
    const outcomeRow = allOutcomes.find(outcome => 
      outcome['Die Roll'] === outcomeType
    );
    
    if (!outcomeRow) {
      console.log('DiceRollLogic: No outcome found for', outcomeType);
      return null;
    }
    
    // Get the column for this die roll number
    const rollResult = outcomeRow[dieRoll.toString()];
    console.log('DiceRollLogic: Roll result for', dieRoll, 'is', rollResult);
    
    return rollResult;
  },
  
  // Process roll for next space movement
  getNextSpaceFromRoll(space, visitType, dieRoll) {
    const nextSpace = this.processRoll(space, visitType, dieRoll, 'Next Step');
    console.log('DiceRollLogic: Next space from roll', dieRoll, 'is', nextSpace);
    
    return nextSpace;
  },
  
  // Process roll for time outcome
  getTimeOutcomeFromRoll(space, visitType, dieRoll) {
    return this.processRoll(space, visitType, dieRoll, 'Time outcomes');
  },
  
  // Process roll for fee outcome
  getFeeOutcomeFromRoll(space, visitType, dieRoll) {
    return this.processRoll(space, visitType, dieRoll, 'Fees Paid');
  },
  
  // Process roll for card outcomes
  getCardOutcomeFromRoll(space, visitType, dieRoll, cardType) {
    return this.processRoll(space, visitType, dieRoll, cardType + ' Cards');
  },
  
  // Handle dice roll result
  handleDiceRoll(spaceName, visitType, dieRoll) {
    console.log('DiceRollLogic: Handling dice roll', dieRoll, 'for', spaceName, visitType);
    
    // Phase 2: Try structured parser first
    if (this.outcomeParser) {
      const structuredOutcomes = this.outcomeParser.parseOutcomes(spaceName, visitType, dieRoll);
      if (structuredOutcomes.length > 0) {
        console.log('DiceRollLogic: Using Phase 2 structured outcomes');
        return this._processStructuredOutcomes(structuredOutcomes);
      }
    }
    
    // Fallback to legacy processing
    console.log('DiceRollLogic: Using legacy outcome processing');
    return this._handleLegacyDiceRoll(spaceName, visitType, dieRoll);
  },
  
  // Phase 2: Process structured outcomes
  _processStructuredOutcomes(outcomes) {
    const result = {};
    
    for (const outcome of outcomes) {
      switch (outcome.type) {
        case 'cards':
          if (outcome.action === 'drawCards') {
            result.cardDraws = outcome.cards;
          } else if (outcome.action === 'removeCards') {
            result.cardRemovals = { [outcome.cardType]: outcome.amount };
          } else if (outcome.action === 'replaceCards') {
            result.cardReplacements = { [outcome.cardType]: outcome.amount };
          }
          break;
          
        case 'movement':
          if (outcome.action === 'moveToSpace') {
            result.nextSpace = outcome.destination;
          } else if (outcome.action === 'moveToChoice') {
            result.spaceChoices = outcome.destinations;
          }
          break;
          
        case 'time':
          result.timeOutcome = outcome.value + ' days';
          break;
          
        case 'fee':
          result.feeOutcome = outcome.value;
          break;
          
        case 'quality':
          result.qualityOutcome = outcome.value;
          break;
          
        case 'multiplier':
          result.multiplierOutcome = outcome.value;
          break;
          
        case 'raw':
          // Handle unstructured outcomes that need manual processing
          result.rawOutcome = outcome.text;
          break;
      }
    }
    
    console.log('DiceRollLogic: Processed structured outcomes:', result);
    return result;
  },
  
  // Legacy dice roll handling (preserved for backward compatibility)
  _handleLegacyDiceRoll(spaceName, visitType, dieRoll) {
    // Check all possible outcome types for this space and visit type
    const outcomes = this.getOutcomes(spaceName, visitType);
    if (!outcomes) return {};
    
    // Collect all different outcome types in these rows
    const outcomeTypes = new Set();
    outcomes.forEach(outcome => {
      outcomeTypes.add(outcome['Die Roll']);
    });
    
    console.log('DiceRollLogic: Outcome types available:', Array.from(outcomeTypes));
    
    // Process outcomes of each type
    const result = {};
    
    // Handle next space outcome
    if (outcomeTypes.has('Next Step')) {
      result.nextSpace = this.getNextSpaceFromRoll(spaceName, visitType, dieRoll);
    }
    
    // Handle time outcome
    if (outcomeTypes.has('Time outcomes')) {
      result.timeOutcome = this.getTimeOutcomeFromRoll(spaceName, visitType, dieRoll);
    }
    
    // Handle fee outcome
    if (outcomeTypes.has('Fees Paid')) {
      result.feeOutcome = this.getFeeOutcomeFromRoll(spaceName, visitType, dieRoll);
    }
    
    // Handle card outcomes for different card types
    const cardTypes = ['W', 'B', 'I', 'L', 'E'];
    cardTypes.forEach(cardType => {
      if (outcomeTypes.has(cardType + ' Cards')) {
        result[cardType + 'CardOutcome'] = this.getCardOutcomeFromRoll(
          spaceName, visitType, dieRoll, cardType
        );
      }
    });
    
    // Handle quality outcome
    if (outcomeTypes.has('Quality')) {
      result.qualityOutcome = this.processRoll(spaceName, visitType, dieRoll, 'Quality');
    }
    
    // Handle multiplier outcome
    if (outcomeTypes.has('Multiplier')) {
      result.multiplierOutcome = this.processRoll(spaceName, visitType, dieRoll, 'Multiplier');
    }
    
    console.log('DiceRollLogic: Processed legacy outcomes:', result);
    
    return result;
  },
  
  // Find spaces based on dice roll outcome
  findSpacesFromOutcome(gameState, nextSpaceName) {
    console.log('DiceRollLogic: Finding spaces for outcome', nextSpaceName);
    
    // Handle special case where multiple spaces are listed
    if (nextSpaceName.includes(' or ')) {
      const spaceOptions = nextSpaceName.split(' or ').map(name => name.trim());
      console.log('DiceRollLogic: Multiple space options:', spaceOptions);
      
      const availableMoves = [];
      
      // Process each option
      for (const option of spaceOptions) {
        // Extract the base name without explanatory text
        let spaceName = option;
        if (spaceName.includes(' - ')) {
          spaceName = spaceName.split(' - ')[0].trim();
        }
        
        const spaces = this.findSpacesWithName(gameState, spaceName);
        availableMoves.push(...spaces);
      }
      
      return availableMoves;
    }
    
    // Regular single destination
    let spaceName = nextSpaceName;
    if (spaceName.includes(' - ')) {
      spaceName = spaceName.split(' - ')[0].trim();
    }
    
    return this.findSpacesWithName(gameState, spaceName);
  },
  
  // Find spaces with a matching name
  findSpacesWithName(gameState, name) {
    console.log('DiceRollLogic: Looking for spaces with name:', name);
    
    const currentPlayer = gameState.getCurrentPlayer();
    const cleanedName = gameState.extractSpaceName(name);
    
    // Find all spaces that match this name
    const matchingSpaces = gameState.spaces.filter(space => {
      const extractedName = gameState.extractSpaceName(space.name);
      return extractedName === cleanedName;
    });
    
    console.log('DiceRollLogic: Found', matchingSpaces.length, 'spaces matching:', cleanedName);
    
    if (matchingSpaces.length === 0) return [];
    
    // Determine visit type
    const hasVisitedSpace = gameState.hasPlayerVisitedSpace(currentPlayer, cleanedName);
    const targetVisitType = hasVisitedSpace ? 'subsequent' : 'first';
    
    console.log('DiceRollLogic: For', cleanedName, 'visit type should be:', targetVisitType);
    
    // Find the space with the right visit type, or use first one as fallback
    const destinationSpace = matchingSpaces.find(space => 
      space.visitType.toLowerCase() === targetVisitType.toLowerCase()
    ) || matchingSpaces[0];
    
    console.log('DiceRollLogic: Selected destination space:', destinationSpace.id);
    
    return [destinationSpace];
  }
};

console.log('DiceRollLogic.js execution finished');
