// Main entry point
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // First, load the space data
    const response = await fetch('data/spaces.csv');
    const csvText = await response.text();
    
    // Parse CSV data
    const spacesData = parseCSV(csvText);
    
    // Initialize game state
    GameState.initialize(spacesData);
    
    // Render the game board component
    ReactDOM.render(
      React.createElement(GameBoard),
      document.getElementById('game-root')
    );
  } catch (error) {
    console.error('Failed to initialize game:', error);
    // Show error message
    const rootElement = document.getElementById('game-root');
    rootElement.innerHTML = `
      <div class="error-screen">
        <h2>Game Initialization Failed</h2>
        <p class="error-message">${error.message}</p>
        <button onclick="location.reload()">Reload</button>
      </div>
    `;
  }
});