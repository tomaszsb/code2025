// Main entry point
console.log('main.js script loaded');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Application starting...');
    
    // Load space data from CSV before initializing the game
    try {
      console.log('Loading CSV data from Spaces.csv...');
      const response = await fetch('data/Spaces.csv');
      const csvText = await response.text();
      
      // Debug the CSV content
      console.log('CSV Text (first 100 chars):', csvText.substring(0, 100));
      
      // Explicitly check if parseCSV is defined
      if (typeof parseCSV !== 'function') {
        console.error('parseCSV function is not defined! Check if csv-parser.js is loaded correctly.');
        throw new Error('parseCSV function is not available');
      }
      
      const spacesData = parseCSV(csvText);
      console.log('Loaded spaces data:', spacesData ? spacesData.length : 'undefined', 'rows');
      
      // Initialize game state with loaded data
      if (typeof GameState === 'undefined') {
        console.error('GameState is not defined! Check if game-state.js is loaded correctly.');
        throw new Error('GameState is not available');
      }
      
      GameState.initialize(spacesData);
      console.log('GameState initialized with spaces data');
      
      // Check if GameBoard component is defined
      if (typeof GameBoard === 'undefined') {
        console.error('GameBoard component is not defined! Check component loading order.');
        document.getElementById('game-root').innerHTML = `
          <div style="max-width:600px; margin:50px auto; padding:20px; background-color:white; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="text-align:center; color:red;">Component Loading Error</h2>
            <p>GameBoard component is not defined. Check the console for more details.</p>
          </div>
        `;
        throw new Error('GameBoard component is not available');
      }
      
      // Render only to game-root, not to direct-game-test
      console.log('Rendering GameBoard to game-root...');
      ReactDOM.render(
        <GameBoard />,
        document.getElementById('game-root')
      );
      console.log('GameBoard rendered successfully!')
    } catch (error) {
      console.error('Failed to load CSV data or initialize game:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to initialize game:', error);
    // Show detailed error message
    const rootElement = document.getElementById('game-root');
    rootElement.innerHTML = `
      <div class="error-screen">
        <h2>Game Initialization Failed</h2>
        <p class="error-message">${error.message}</p>
        <p>Error stack:</p>
        <pre style="background-color:#f8f8f8; padding:10px; overflow:auto; max-height:200px; text-align:left;">${error.stack}</pre>
        <p>Game state:</p>
        <pre style="background-color:#f8f8f8; padding:10px; overflow:auto; max-height:200px; text-align:left;">${JSON.stringify({gameStarted: GameState.gameStarted, playerCount: GameState.players.length, spacesCount: GameState.spaces.length}, null, 2)}</pre>
        <div style="margin-top:20px;">
          <button onclick="location.reload()">Reload</button>
          <button onclick="GameState.startNewGame(); GameState.saveState(); location.reload();">Reset & Reload</button>
        </div>
      </div>
    `;
  }
});