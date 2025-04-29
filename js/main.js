// Main.js file is beginning to be used
console.log('Main.js file is beginning to be used');

/**
 * Main module for game initialization
 * 
 * This file serves as the entry point for the game.
 * It uses InitializationManager to handle staged initialization.
 */

// Self-executing function that runs as soon as the script is loaded
(function() {
  console.log('Main: Starting game initialization process');
  
  // Wait for DOM content to be loaded
  const runInitialization = () => {
    console.log('Main: DOM ready, initializing game');
    
    // Check if InitializationManager is available
    if (window.InitializationManager) {
      // Start the initialization process
      window.InitializationManager.startInitialization()
        .then(result => {
          if (result.success) {
            console.log('Main: Game initialization completed successfully');
          } else {
            console.error('Main: Game initialization failed:', result.error);
          }
        })
        .catch(error => {
          console.error('Main: Unhandled error during initialization:', error);
        });
    } else {
      console.error('Main: InitializationManager not found, cannot initialize game');
      
      // Show error message
      const rootElement = document.getElementById('game-root');
      if (rootElement) {
        rootElement.innerHTML = `
          <div class="error-screen">
            <h2>Game Initialization Failed</h2>
            <p>Required initialization component not found.</p>
            <p>Please ensure all game scripts are properly loaded.</p>
            <button onclick="location.reload()">Reload Page</button>
          </div>
        `;
      }
    }
  };
  
  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInitialization);
  } else {
    runInitialization();
  }
  
  console.log('Main: Initialization check completed');
})();

console.log('Main.js code execution finished');