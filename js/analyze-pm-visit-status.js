// PM-DECISION-CHECK Visit Analysis Script
console.log('=== PM-DECISION-CHECK Visit Analysis ===');

function analyzeVisitStatus() {
  if (!window.GameStateManager) {
    console.log('GameStateManager not available yet');
    setTimeout(analyzeVisitStatus, 1000);
    return;
  }

  const currentPlayer = window.GameStateManager.getCurrentPlayer();
  if (!currentPlayer) {
    console.log('No current player found');
    return;
  }

  console.log('Current Player Analysis:');
  console.log('Player Name:', currentPlayer.name);
  console.log('Current Position:', currentPlayer.position);
  
  if (currentPlayer.visitedSpaces) {
    const visitedArray = Array.from(currentPlayer.visitedSpaces);
    console.log('Visited Spaces Array:', visitedArray);
    console.log('Total Visited Spaces:', visitedArray.length);
    
    const hasPMDecisionCheck = visitedArray.includes('PM-DECISION-CHECK');
    console.log('Has visited PM-DECISION-CHECK before:', hasPMDecisionCheck);
    
    // Check what the hasPlayerVisitedSpace method returns
    const methodResult = window.GameStateManager.hasPlayerVisitedSpace(currentPlayer, 'PM-DECISION-CHECK');
    console.log('hasPlayerVisitedSpace method result:', methodResult);
  }
  
  // Find PM-DECISION-CHECK spaces and their visit types
  const pmSpaces = window.GameStateManager.spaces.filter(space => 
    space.name.includes('PM-DECISION-CHECK')
  );
  
  console.log('\nPM-DECISION-CHECK Spaces in Game:');
  pmSpaces.forEach((space, index) => {
    console.log(`Space ${index + 1}:`);
    console.log('  ID:', space.id);
    console.log('  Name:', space.name);
    console.log('  Visit Type:', space.visitType);
    console.log('  Next Spaces:', space.nextSpaces);
    console.log('  Next Spaces Count:', space.nextSpaces.length);
  });
  
  // Test the updateSpaceVisitTypes method
  console.log('\nTesting updateSpaceVisitTypes...');
  const updateResult = window.GameStateManager.updateSpaceVisitTypes();
  console.log('updateSpaceVisitTypes returned:', updateResult);
  
  // Check spaces again after update
  const pmSpacesAfterUpdate = window.GameStateManager.spaces.filter(space => 
    space.name.includes('PM-DECISION-CHECK')
  );
  
  console.log('\nPM-DECISION-CHECK Spaces after updateSpaceVisitTypes:');
  pmSpacesAfterUpdate.forEach((space, index) => {
    console.log(`Space ${index + 1}:`);
    console.log('  Visit Type:', space.visitType);
    console.log('  Next Spaces Count:', space.nextSpaces.length);
  });
}

// Start analysis
analyzeVisitStatus();
