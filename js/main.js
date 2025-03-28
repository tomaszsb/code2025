// Main entry point with reliable initialization
console.log('Main.js file is being processed');

// Main initialization function
function initializeGame() {
  console.log('Initializing game...');
  
  // Load CSV file
  fetch('data/Spaces.csv')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load game data: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(csvText => {
      const spacesData = parseCSV(csvText);
      
      if (!spacesData || spacesData.length === 0) {
        throw new Error('No valid spaces found in CSV file');
      }
      
      // Initialize game state
      GameState.initialize(spacesData);
      
      // Render the App component
      ReactDOM.render(
        React.createElement(window.App),
        document.getElementById('game-root')
      );
      
      console.log('Game initialization completed successfully');
    })
    .catch(error => {
      console.error('Error during game initialization:', error);
      
      // Show error message
      showErrorScreen(error);
    });
}

// Show error screen to user
function showErrorScreen(error) {
  const rootElement = document.getElementById('game-root');
  rootElement.innerHTML = `
    <div class="error-screen">
      <h2>Game Initialization Failed</h2>
      <p>${error.message}</p>
      <p>Please ensure the CSV data files are correctly placed in the data folder.</p>
      <button onclick="location.reload()">Reload Page</button>
    </div>
  `;
}

// Self-executing function that runs as soon as the script is loaded
(function() {
  console.log('Starting game initialization check...');
  
  // Check if all required components are loaded
  if (
    typeof window.App === 'function' &&
    typeof window.GameBoard === 'function' &&
    typeof window.PlayerSetup === 'function' &&
    typeof window.BoardDisplay === 'function' &&
    typeof window.SpaceInfo === 'function' &&
    typeof window.PlayerInfo === 'function' &&
    typeof window.GameState === 'object' &&
    typeof window.parseCSV === 'function'
  ) {
    // All components loaded, proceed with initialization
    console.log('All required components loaded, proceeding with game initialization');
    initializeGame();
  } else {
    console.error('Required components not loaded. Game initialization aborted.');
    // Show error to user
    const rootElement = document.getElementById('game-root');
    rootElement.innerHTML = `
      <div class="error-screen">
        <h2>Game Components Failed to Load</h2>
        <p>Please make sure all game scripts are properly loaded.</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
  
  console.log('Main.js execution complete');
})();