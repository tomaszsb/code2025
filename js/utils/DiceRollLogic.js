// DiceRollLogic.js - Utility for handling dice roll outcomes
console.log('DiceRollLogic.js file is being processed');

window.DiceRollLogic = {
  // Load dice roll data from CSV
  diceRollData: [],
  
  // Initialize with data from CSV
  initialize(diceRollData) {
    if (!diceRollData || diceRollData.length === 0) {
      console.error('DiceRollLogic: No dice roll data provided!');
      return;
    }
    
    this.diceRollData = diceRollData;
    console.log('DiceRollLogic: Initialized with', diceRollData.length, 'dice roll outcomes');
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
    
    console.log('DiceRollLogic: Processed outcomes:', result);
    
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
