// Main entry point (No JSX version)
console.log('main-no-jsx.js script loaded');

// Check if all required components are loaded
function checkDependencies() {
  console.log('Checking dependencies...');
  
  // Check global objects
  const dependencies = {
    React: typeof React !== 'undefined',
    ReactDOM: typeof ReactDOM !== 'undefined',
    parseCSV: typeof parseCSV === 'function',
    GameState: typeof GameState !== 'undefined',
    GameBoard: typeof GameBoard !== 'undefined',
    PlayerSetup: typeof PlayerSetup !== 'undefined',
    BoardDisplay: typeof BoardDisplay !== 'undefined',
    PlayerInfo: typeof PlayerInfo !== 'undefined',
    SpaceInfo: typeof SpaceInfo !== 'undefined'
  };
  
  console.log('Dependencies status:', dependencies);
  
  // Check if any dependencies are missing
  const missingDeps = Object.entries(dependencies)
    .filter(([_, loaded]) => !loaded)
    .map(([name]) => name);
  
  if (missingDeps.length > 0) {
    console.error('Missing dependencies:', missingDeps.join(', '));
    return false;
  }
  
  return true;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Application starting (non-JSX version)...');
    
    // First, check that all dependencies are loaded
    if (!checkDependencies()) {
      document.getElementById('game-root').innerHTML = `
        <div style="max-width:600px; margin:50px auto; padding:20px; background-color:white; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="text-align:center; color:red;">Loading Error</h2>
          <p>Some required components failed to load. Check the console for details.</p>
          <button onclick="window.location.reload()">Reload Page</button>
        </div>
      `;
      return;
    }
    
    // Load space data from CSV before initializing the game
    try {
      console.log('Loading CSV data from Spaces.csv...');
      const response = await fetch('data/Spaces.csv');
      const csvText = await response.text();
      
      // Explicitly log CSV content for debugging
      console.log('CSV loaded successfully, size:', csvText.length, 'bytes');
      console.log('CSV Text (first 100 chars):', csvText.substring(0, 100));
      
      // Make sure parseCSV is available
      if (typeof parseCSV !== 'function') {
        throw new Error('parseCSV function is not available');
      }
      
      const spacesData = parseCSV(csvText);
      console.log('Parsed spaces data:', spacesData ? spacesData.length : '0', 'rows');
      
      if (!spacesData || spacesData.length === 0) {
        throw new Error('No spaces data parsed from CSV');
      }
      
      // Initialize game state with loaded data
      if (typeof GameState === 'undefined') {
        throw new Error('GameState is not available');
      }
      
      GameState.initialize(spacesData);
      console.log('GameState initialized with spaces data');
      
      // Render using createElement instead of JSX
      console.log('Rendering GameBoard to game-root using createElement...');
      ReactDOM.render(
        React.createElement(GameBoard, null),
        document.getElementById('game-root')
      );
      console.log('GameBoard rendered successfully!');

    } catch (error) {
      console.error('Failed to load CSV data or initialize game:', error);
      document.getElementById('game-root').innerHTML = `
        <div style="max-width:600px; margin:50px auto; padding:20px; background-color:white; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="text-align:center; color:red;">Game Initialization Error</h2>
          <p>${error.message}</p>
          <pre style="background-color:#f8f8f8; padding:10px; overflow:auto; max-height:200px;">${error.stack}</pre>
          <button onclick="window.location.reload()">Reload Page</button>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
    document.getElementById('game-root').innerHTML = `
      <div style="max-width:600px; margin:50px auto; padding:20px; background-color:white; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="text-align:center; color:red;">Application Error</h2>
        <p>${error.message}</p>
        <pre style="background-color:#f8f8f8; padding:10px; overflow:auto; max-height:200px;">${error.stack}</pre>
        <button onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
  }
});