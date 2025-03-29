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
    
    const spacesData = parseCSV(spacesCsvText);
    const diceRollData = parseCSV(diceRollCsvText);
    
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
    
    // Process card CSV files and handle any that fail to load
    const cardResponses = {
      W: wCardsResponse,
      B: bCardsResponse,
      I: iCardsResponse,
      L: lCardsResponse,
      E: eCardsResponse
    };
    
    // Load each card type data
    for (const [cardType, response] of Object.entries(cardResponses)) {
      if (response.ok) {
        try {
          const cardCsvText = await response.text();
          const cardData = parseCSV(cardCsvText);
          
          if (cardData && cardData.length > 0) {
            // Initialize card data in game state
            window.GameState.loadCardData(cardType, cardData);
            console.log(`Loaded ${cardData.length} ${cardType} cards`);
          } else {
            console.warn(`No valid data found in ${cardType}-cards.csv`);
          }
        } catch (cardError) {
          console.warn(`Error parsing ${cardType}-cards.csv:`, cardError);
        }
      } else {
        console.warn(`Failed to load ${cardType}-cards.csv: ${response.status} ${response.statusText}`);
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