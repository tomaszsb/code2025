// Main entry point with reliable initialization
console.log('Main.js file is being processed');

// Main initialization function
async function initializeGame() {
  console.log('Initializing game...');
  
  try {
    // Load all necessary CSV files concurrently for better performance
    const [spacesResponse, diceRollResponse, wCardsResponse, bCardsResponse, iCardsResponse, lCardsResponse, eCardsResponse] = await Promise.all([
      fetch('data/Spaces.csv'),
      fetch('data/DiceRoll Info.csv'),
      fetch('data/W-cards.csv'),
      fetch('data/B-cards.csv'),
      fetch('data/I-cards.csv'),
      fetch('data/L-cards.csv'),
      fetch('data/E-cards.csv')
    ]);
    
    // Check responses for required files
    if (!spacesResponse.ok) {
      throw new Error(`Failed to load spaces data: ${spacesResponse.status} ${spacesResponse.statusText}`);
    }
    
    if (!diceRollResponse.ok) {
      throw new Error(`Failed to load dice roll data: ${diceRollResponse.status} ${diceRollResponse.statusText}`);
    }
    
    // Process required CSV files
    const spacesCsvText = await spacesResponse.text();
    const diceRollCsvText = await diceRollResponse.text();
    
    const spacesData = parseCSV(spacesCsvText, 'spaces');
    const diceRollData = parseCSV(diceRollCsvText, 'generic');
    
    if (!spacesData || spacesData.length === 0) {
      throw new Error('No valid spaces found in CSV file');
    }
    
    if (!diceRollData || diceRollData.length === 0) {
      throw new Error('No valid dice roll data found in CSV file');
    }
    
    console.log('Loaded', spacesData.length, 'spaces and', diceRollData.length, 'dice roll outcomes');
    
    // Initialize game state
    GameState.initialize(spacesData);
    
    // Initialize dice roll logic if available
    if (window.DiceRollLogic) {
      window.DiceRollLogic.initialize(diceRollData);
      window.diceRollData = diceRollData; // Store on window for component access
      console.log('Dice roll logic initialized');
    } else {
      console.warn('DiceRollLogic not found. Dice roll functionality will not be available.');
    }
    
    // Process card CSV files with improved error handling and retries
    const cardResponses = {
      W: wCardsResponse,
      B: bCardsResponse,
      I: iCardsResponse,
      L: lCardsResponse,
      E: eCardsResponse
    };
    
    // Track card loading results
    const cardLoadingResults = {
      success: [],
      failed: []
    };
    
    // Define critical card types that are essential for gameplay
    const criticalCardTypes = ['W']; // Work cards are critical for game progression
    
    // Load each card type data with retry capability
    for (const [cardType, response] of Object.entries(cardResponses)) {
      let cardData = [];
      let loaded = false;
      let retryCount = 0;
      const maxRetries = 2; // Maximum number of retry attempts
      
      // Try to load the card type, with retries if needed
      while (!loaded && retryCount <= maxRetries) {
        if (retryCount > 0) {
          console.log(`Retrying ${cardType} cards load (attempt ${retryCount} of ${maxRetries})...`);
        }
        
        if (response.ok) {
          try {
            // Clone the response for retry attempts
            const clonedResponse = retryCount === 0 ? response : 
              await fetch(`data/${cardType}-cards.csv`);
              
            if (clonedResponse.ok) {
              const cardCsvText = await clonedResponse.text();
              cardData = parseCSV(cardCsvText, 'cards');
              
              if (cardData && cardData.length > 0) {
                // Initialize card data in game state
                window.GameState.loadCardData(cardType, cardData);
                console.log(`Loaded ${cardData.length} ${cardType} cards`);
                cardLoadingResults.success.push(cardType);
                loaded = true;
              } else {
                console.warn(`No valid data found in ${cardType}-cards.csv`);
                retryCount++;
              }
            } else {
              console.warn(`Retry failed for ${cardType}-cards.csv: ${clonedResponse.status}`);
              retryCount++;
            }
          } catch (cardError) {
            console.warn(`Error parsing ${cardType}-cards.csv:`, cardError);
            retryCount++;
          }
        } else {
          console.warn(`Failed to load ${cardType}-cards.csv: ${response.status} ${response.statusText}`);
          retryCount++;
        }
      }
      
      // If still not loaded after retries, record the failure
      if (!loaded) {
        cardLoadingResults.failed.push(cardType);
        console.error(`Failed to load ${cardType} cards after ${maxRetries} retries`);
      }
    }
    
    // Store card data on window for component access
    window.cardCollections = {
      W: window.GameState.cardCollections.W,
      B: window.GameState.cardCollections.B,
      I: window.GameState.cardCollections.I,
      L: window.GameState.cardCollections.L,
      E: window.GameState.cardCollections.E
    };
    
    // Check for critical card types and notify the user about any missing card types
    const missingCriticalCards = criticalCardTypes.filter(type => cardLoadingResults.failed.includes(type));
    
    if (missingCriticalCards.length > 0) {
      // Critical cards are missing - show error message
      throw new Error(`Cannot start game: Critical card types (${missingCriticalCards.join(', ')}) failed to load. The game requires these card types to function properly.`);
    } else if (cardLoadingResults.failed.length > 0) {
      // Non-critical cards are missing - show warning but allow game to continue
      console.warn(`Game starting with missing card types: ${cardLoadingResults.failed.join(', ')}`);
      
      // Display warning message to the user
      const warningElement = document.createElement('div');
      warningElement.className = 'card-warning';
      warningElement.innerHTML = `
        <div class="warning-message">
          <h3>Warning: Some Card Types Not Loaded</h3>
          <p>The following card types could not be loaded: ${cardLoadingResults.failed.join(', ')}</p>
          <p>The game will continue, but some features may be limited.</p>
          <button id="dismiss-warning">Continue Playing</button>
        </div>
      `;
      
      // Add styles for the warning message
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .card-warning {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          border-radius: 5px;
          padding: 15px;
          z-index: 1000;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          max-width: 80%;
        }
        .warning-message h3 {
          color: #856404;
          margin-top: 0;
        }
        .warning-message p {
          color: #856404;
        }
        #dismiss-warning {
          background-color: #856404;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 3px;
          cursor: pointer;
        }
        #dismiss-warning:hover {
          background-color: #654e03;
        }
      `;
      
      // Add elements after the DOM is ready
      const addWarningElements = () => {
        document.head.appendChild(styleElement);
        document.body.appendChild(warningElement);
        
        // Add click handler to dismiss the warning
        document.getElementById('dismiss-warning').addEventListener('click', () => {
          document.body.removeChild(warningElement);
        });
      };
      
      // If DOM is already loaded, add elements immediately
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(addWarningElements, 1000); // Slight delay to ensure App is rendered
      } else {
        // Otherwise wait for DOMContentLoaded event
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(addWarningElements, 1000);
        });
      }
    }
    
    // Render the App component
    ReactDOM.render(
      React.createElement(window.App),
      document.getElementById('game-root')
    );
    
    console.log('Game initialization completed successfully');
  } catch (error) {
    console.error('Error during game initialization:', error);
    
    // Show error message
    showErrorScreen(error);
  }
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
    typeof window.CardDisplay === 'function' &&
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