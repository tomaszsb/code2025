// Debug script to test PM-DECISION-CHECK without clearing localStorage
console.log('DEBUG: PM-DECISION-CHECK test script loaded');
console.log('DEBUG: This script will analyze the current game state without clearing data');

// Function to analyze current PM-DECISION-CHECK state
function analyzePMDecisionCheck() {
  console.log('=== PM-DECISION-CHECK Analysis (No Clear) ===');
  
  if (!window.GameStateManager) {
    console.log('GameStateManager not available yet');
    return;
  }
  
  console.log('GameStateManager initialized:', window.GameStateManager.isProperlyInitialized);
  console.log('Current spaces count:', window.GameStateManager.spaces.length);
  
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
    console.log('Movement count:', space.nextSpaces.length);
  });
  
  // Check current player state if exists
  if (window.GameStateManager.players && window.GameStateManager.players.length > 0) {
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    if (currentPlayer) {
      console.log('\n--- Current Player ---');
      console.log('Player:', currentPlayer.name);
      console.log('Position:', currentPlayer.position);
      console.log('Visited Spaces:', Array.from(currentPlayer.visitedSpaces || []));
      console.log('Has visited PM-DECISION-CHECK:', 
        window.GameStateManager.hasPlayerVisitedSpace(currentPlayer, 'PM-DECISION-CHECK'));
    }
  }
}

// Run analysis after a delay to ensure everything is loaded
setTimeout(analyzePMDecisionCheck, 2000);

console.log('DEBUG: Analysis will run in 2 seconds...');
