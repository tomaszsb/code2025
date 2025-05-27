// PM-DECISION-CHECK Test Script
console.log('PM-DECISION-CHECK Test: Starting analysis');

// Function to test PM-DECISION-CHECK space configuration
function testPMDecisionCheck() {
  console.log('=== PM-DECISION-CHECK Space Analysis ===');
  
  // Wait for GameStateManager to be available
  if (!window.GameStateManager) {
    console.log('GameStateManager not available yet, retrying in 1 second...');
    setTimeout(testPMDecisionCheck, 1000);
    return;
  }
  
  // Find PM-DECISION-CHECK spaces
  const pmSpaces = window.GameStateManager.spaces.filter(space => 
    space.name.includes('PM-DECISION-CHECK')
  );
  
  console.log(`Found ${pmSpaces.length} PM-DECISION-CHECK spaces:`);
  
  pmSpaces.forEach((space, index) => {
    console.log(`\n--- PM-DECISION-CHECK Space ${index + 1} ---`);
    console.log('ID:', space.id);
    console.log('Name:', space.name);
    console.log('Visit Type:', space.visitType);
    console.log('Next Spaces:', space.nextSpaces);
    console.log('Raw Space Columns:');
    console.log('  Space 1:', space.rawSpace1);
    console.log('  Space 2:', space.rawSpace2);
    console.log('  Space 3:', space.rawSpace3);
    console.log('  Space 4:', space.rawSpace4);
    console.log('  Space 5:', space.rawSpace5);
    console.log('Expected moves based on visitType:');
    if (space.visitType === 'First' || space.visitType === 'first') {
      console.log('  Should show: 3 moves (first visit)');
    } else if (space.visitType === 'Subsequent' || space.visitType === 'subsequent') {
      console.log('  Should show: 5 moves (subsequent visit)');
    } else {
      console.log('  Unknown visitType:', space.visitType);
    }
  });
  
  // Check if there's a current player and their visit history
  if (window.GameStateManager.players && window.GameStateManager.players.length > 0) {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      console.log('\n--- Current Player Visit History ---');
      console.log('Player:', currentPlayer.name);
      console.log('Position:', currentPlayer.position);
      console.log('Visited Spaces:', Array.from(currentPlayer.visitedSpaces || []));
      console.log('Has visited PM-DECISION-CHECK:', 
        window.GameStateManager.hasPlayerVisitedSpace(currentPlayer, 'PM-DECISION-CHECK'));
    }
  }
  
  console.log('\n=== Analysis Complete ===');
}

// Start the test
testPMDecisionCheck();
