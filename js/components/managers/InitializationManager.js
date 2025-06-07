// InitializationManager.js file is beginning to be used
console.log('InitializationManager.js file is beginning to be used');

/**
 * InitializationManager - Manages the staged initialization process for the game
 * 
 * This component handles loading data, initializing components, and managing
 * the game startup sequence following the manager pattern.
 * 
 * Key features:
 * - Staged initialization process
 * - Robust error handling
 * - Debug mode toggle for console logs
 * - Logging level system
 * - Event-based architecture
 */
class InitializationManager {
  /**
   * Initialize the Initialization Manager
   */
  constructor() {
    console.log('InitializationManager: Constructor initialized');
    
    // Configuration
    this.config = {
      dataFiles: {
        spaces: 'data/Spaces.csv',
        diceRoll: 'data/DiceRoll Info.csv',
        cards: 'data/cards.csv'
      },
      criticalCardTypes: ['W'], // Work cards are critical for game progression
      maxRetries: 2, // Maximum retries for loading card data
      initializationStages: [
        'validateRequirements',
        'loadCoreData',
        'loadCardData',
        'initializeGameState',
        'renderGame'
      ]
    };
    
    // State tracking
    this.initialized = false;
    this.currentStage = null;
    this.stageResults = {};
    this.loadedData = {
      spaces: null,
      diceRoll: null,
      cards: {}
    };
    
    // Debug and logging configuration
    this.debugMode = this._getDebugModeFromUrl() || false;
    this.logLevel = this._getLogLevelFromUrl() || 'info'; // error, warn, info, debug
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      stageCompleted: new Event('initStageCompleted'),
      initializationCompleted: new Event('initializationCompleted'),
      initializationFailed: new Event('initializationFailed')
    };
    
    // Register event listeners
    this.registerEventListeners();
    
    this.initialized = true;
    console.log('InitializationManager: Constructor completed');
  }
  
  /**
   * Register event listeners
   */
  registerEventListeners() {
    this.log('info', 'InitializationManager: Registering event listeners');
    
    // Create custom events for initialization stages
    window.addEventListener('initStageCompleted', (event) => {
      if (event.detail && event.detail.stage) {
        this.log('info', `InitializationManager: Stage completed: ${event.detail.stage}`);
      }
    });
    
    this.log('info', 'InitializationManager: Event listeners registered successfully');
  }
  
  /**
   * Start the initialization process
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  async startInitialization() {
    this.log('info', 'InitializationManager: Starting initialization process');
    
    try {
      // Run through each initialization stage
      for (const stage of this.config.initializationStages) {
        this.currentStage = stage;
        this.log('info', `InitializationManager: Starting stage: ${stage}`);
        
        // Execute the stage method
        await this[stage]();
        
        // Dispatch stage completed event
        this._dispatchStageEvent(stage, true);
      }
      
      this.log('info', 'InitializationManager: Initialization completed successfully');
      
      // Dispatch completion event
      window.dispatchEvent(
        new CustomEvent('initializationCompleted', {
          detail: { success: true, stageResults: this.stageResults }
        })
      );
      
      return { success: true, stageResults: this.stageResults };
    } catch (error) {
      this.log('error', `InitializationManager: Initialization failed during stage ${this.currentStage}:`, error);
      
      // Dispatch failure event
      window.dispatchEvent(
        new CustomEvent('initializationFailed', {
          detail: { 
            stage: this.currentStage, 
            error: error.message, 
            stageResults: this.stageResults 
          }
        })
      );
      
      // Show error screen to user
      this.showErrorScreen(error, this.currentStage);
      
      return { 
        success: false, 
        stage: this.currentStage, 
        error: error.message,
        stageResults: this.stageResults 
      };
    }
  }
  
  /**
   * Stage 1: Validate requirements
   * Ensures all required components are loaded
   */
  async validateRequirements() {
    this.log('info', 'InitializationManager: Validating requirements');
    
    const requiredComponents = [
      { name: 'App', type: 'function', source: window.App },
      { name: 'GameBoard', type: 'function', source: window.GameBoard },
      { name: 'PlayerSetup', type: 'function', source: window.PlayerSetup },
      { name: 'BoardDisplay', type: 'function', source: window.BoardDisplay },
      { name: 'SpaceInfo', type: 'function', source: window.SpaceInfo },
      { name: 'PlayerInfo', type: 'function', source: window.PlayerInfo },
      { name: 'CardDisplay', type: 'function', source: window.CardDisplay },
      { name: 'GameState', type: 'object', source: window.GameState },
      { name: 'parseCSV', type: 'function', source: window.parseCSV }
    ];
    
    const missingComponents = [];
    
    // Check each required component
    for (const component of requiredComponents) {
      if (!component.source || typeof component.source !== component.type) {
        missingComponents.push(component.name);
        this.log('error', `InitializationManager: Missing component: ${component.name} (type: ${typeof component.source}, expected: ${component.type})`);
      } else {
        this.log('info', `InitializationManager: Component validated: ${component.name}`);
      }
    }
    
    // Store result
    this.stageResults.validateRequirements = {
      success: missingComponents.length === 0,
      missingComponents
    };
    
    // Throw error if any components are missing
    if (missingComponents.length > 0) {
      throw new Error(`Required components not loaded: ${missingComponents.join(', ')}`);
    }
    
    this.log('info', 'InitializationManager: All required components validated');
  }
  
  /**
   * Stage 2: Load core data
   * Loads spaces and dice roll data
   */
  async loadCoreData() {
    this.log('info', 'InitializationManager: Loading core data');
    
    try {
      // Phase 2: Load both legacy and structured dice roll files
      const fetchPromises = [
        fetch(this.config.dataFiles.spaces),
        fetch(this.config.dataFiles.diceRoll)
        // Structured dice roll format temporarily disabled - file not available
      ];
      
      const [spacesResponse, diceRollResponse] = await Promise.all(fetchPromises);
      
      // Check response for spaces data
      if (!spacesResponse.ok) {
        throw new Error(`Failed to load spaces data: ${spacesResponse.status} ${spacesResponse.statusText}`);
      }
      
      // Check response for dice roll data
      if (!diceRollResponse.ok) {
        throw new Error(`Failed to load dice roll data: ${diceRollResponse.status} ${diceRollResponse.statusText}`);
      }
      
      // Process spaces data
      const spacesCsvText = await spacesResponse.text();
      const spacesData = window.parseCSV(spacesCsvText, 'spaces');
      
      if (!spacesData || spacesData.length === 0) {
        throw new Error('No valid spaces found in CSV file');
      }
      
      // Process dice roll data
      const diceRollCsvText = await diceRollResponse.text();
      const diceRollData = window.parseCSV(diceRollCsvText, 'generic');
      
      if (!diceRollData || diceRollData.length === 0) {
        throw new Error('No valid dice roll data found in CSV file');
      }
      
      // Store data
      this.loadedData.spaces = spacesData;
      this.loadedData.diceRoll = diceRollData;
      
      this.log('info', `InitializationManager: Loaded ${spacesData.length} spaces and ${diceRollData.length} dice roll outcomes`);
      
      // Store result
      this.stageResults.loadCoreData = {
        success: true,
        spacesCount: spacesData.length,
        diceRollCount: diceRollData.length
      };
    } catch (error) {
      // Store result
      this.stageResults.loadCoreData = {
        success: false,
        error: error.message
      };
      
      // Re-throw to halt initialization
      throw error;
    }
  }
  
  /**
   * Stage 3: Load card data
   * Loads card data with retry capability
   */
  async loadCardData() {
    this.log('info', 'InitializationManager: Loading unified card data');
    
    try {
      // Single fetch for all cards
      const response = await fetch(this.config.dataFiles.cards);
      
      if (!response.ok) {
        throw new Error(`Failed to load cards: ${response.status}`);
      }
      
      // Parse unified card data
      const csvText = await response.text();
      const allCards = window.parseCardsCSV(csvText);
      
      // Organize cards by type for backward compatibility
      const cardsByType = {
        W: window.filterCardsByType(allCards, 'W'),
        B: window.filterCardsByType(allCards, 'B'),
        I: window.filterCardsByType(allCards, 'I'),
        L: window.filterCardsByType(allCards, 'L'),
        E: window.filterCardsByType(allCards, 'E')
      };
      
      // Store both formats
      this.loadedData.cards = cardsByType;        // Backward compatibility
      this.loadedData.allCards = allCards;        // New unified format
      this.loadedData.cardIndex = this.buildCardIndex(allCards); // Basic lookup (legacy)
      this.loadedData.cardIndexes = window.buildCardIndexes(allCards); // Advanced Phase 5 indexes
      
      // Validation
      const totalLoaded = Object.values(cardsByType).reduce((sum, cards) => sum + cards.length, 0);
      this.log('info', `InitializationManager: Loaded ${totalLoaded} cards from unified file`);
      
      // Provide card indexes to GameStateManager for Phase 5 features
      if (window.GameStateManager && this.loadedData.cardIndexes) {
        window.GameStateManager.setCardIndexes(this.loadedData.cardIndexes);
        this.log('info', 'InitializationManager: Advanced card indexes provided to GameStateManager');
      }

      // Store results
      this.stageResults.loadCardData = {
        success: true,
        totalCards: totalLoaded,
        cardsByType: Object.fromEntries(
          Object.entries(cardsByType).map(([type, cards]) => [type, cards.length])
        ),
        advancedIndexes: this.loadedData.cardIndexes ? {
          comboCards: this.loadedData.cardIndexes.metadata.comboCards,
          chainCards: this.loadedData.cardIndexes.metadata.chainCards,
          totalIndexes: Object.keys(this.loadedData.cardIndexes).length - 1 // -1 for metadata
        } : null
      };
      
    } catch (error) {
      this.stageResults.loadCardData = { success: false, error: error.message };
      throw error;
    }
  }
  
  /**
   * Build card index for fast lookups
   * Creates multiple indexes for efficient card querying
   */
  buildCardIndex(cards) {
    const index = {
      byId: {},
      byType: {},
      byPhase: {},
      byTarget: {}
    };
    
    cards.forEach(card => {
      index.byId[card.card_id] = card;
      
      if (!index.byType[card.card_type]) {
        index.byType[card.card_type] = [];
      }
      index.byType[card.card_type].push(card);
      
      if (card.phase_restriction) {
        if (!index.byPhase[card.phase_restriction]) {
          index.byPhase[card.phase_restriction] = [];
        }
        index.byPhase[card.phase_restriction].push(card);
      }
      
      if (card.target) {
        if (!index.byTarget[card.target]) {
          index.byTarget[card.target] = [];
        }
        index.byTarget[card.target].push(card);
      }
    });
    
    return index;
  }
  
  /**
   * Stage 4: Initialize game state
   * Initializes the game state with loaded data
   */
  async initializeGameState() {
    this.log('info', 'InitializationManager: Initializing game state');
    
    try {
      // Initialize game state with spaces data
      console.log('DEBUG: About to call GameState.initialize with:', typeof this.loadedData.spaces);
      console.log('DEBUG: Spaces data length:', this.loadedData.spaces ? this.loadedData.spaces.length : 'null/undefined');
      console.log('DEBUG: First space:', this.loadedData.spaces && this.loadedData.spaces[0] ? this.loadedData.spaces[0]['Space Name'] : 'no data');
      
      window.GameState.initialize(this.loadedData.spaces);
      
      // Load dice roll data into GameState for MovementEngine
      window.GameState.loadDiceRollData(this.loadedData.diceRoll);
      
      // CRITICAL FIX: Ensure MovementEngine is properly initialized after all data is loaded
      if (!window.movementEngine) {
        console.log('InitializationManager: Creating MovementEngine instance');
        window.movementEngine = new window.MovementEngine(window.GameState);
      }
      
      // Initialize MovementEngine with complete data
      const movementEngineInitResult = window.movementEngine.initialize();
      if (!movementEngineInitResult) {
        throw new Error('MovementEngine initialization failed - cannot start game');
      }
      
      this.log('info', 'InitializationManager: MovementEngine successfully initialized with complete data');
      this.log('info', `InitializationManager: MovementEngine ready status: ${window.movementEngine.isReady()}`);
      
      // Initialize dice roll logic if available
      if (window.DiceRollLogic) {
        // Phase 2: Initialize with both legacy and structured data
        window.DiceRollLogic.initialize(this.loadedData.diceRoll, this.loadedData.structuredDiceRoll);
        window.diceRollData = this.loadedData.diceRoll; // For component access
        this.log('info', 'InitializationManager: Dice roll logic initialized with Phase 2 support');
      } else {
        this.log('warn', 'InitializationManager: DiceRollLogic not found. Dice roll functionality will not be available.');
      }
      
      // Load card data into game state
      for (const [cardType, cardData] of Object.entries(this.loadedData.cards)) {
        window.GameState.loadCardData(cardType, cardData);
      }
      
      // Store card collections on window for component access
      window.cardCollections = {
        W: window.GameState.cardCollections.W || [],
        B: window.GameState.cardCollections.B || [],
        I: window.GameState.cardCollections.I || [],
        L: window.GameState.cardCollections.L || [],
        E: window.GameState.cardCollections.E || []
      };
      
      // Store result with MovementEngine status
      this.stageResults.initializeGameState = {
        success: true,
        movementEngineReady: window.movementEngine ? window.movementEngine.isReady() : false
      };
      
      this.log('info', 'InitializationManager: Game state initialized successfully');
    } catch (error) {
      // Store result
      this.stageResults.initializeGameState = {
        success: false,
        error: error.message
      };
      
      // Re-throw to halt initialization
      throw error;
    }
  }
  
  /**
   * Stage 5: Render game
   * Renders the initial game UI
   */
  async renderGame() {
    this.log('info', 'InitializationManager: Rendering game');
    
    try {
      // Check for root element
      const rootElement = document.getElementById('game-root');
      if (!rootElement) {
        throw new Error('Game root element not found in DOM');
      }
      
      // Render the App component
      ReactDOM.render(
        React.createElement(window.App),
        rootElement
      );
      
      // Initialize animation systems
      if (window.CardAnimationManager && typeof window.CardAnimationManager.init === 'function') {
        window.CardAnimationManager.init();
        this.log('info', 'InitializationManager: Card animation system initialized');
      }
      
      if (window.GameStateAnimationManager && typeof window.GameStateAnimationManager.init === 'function') {
        window.GameStateAnimationManager.init();
        this.log('info', 'InitializationManager: Game state animation system initialized');
      }
      
      if (window.PlayerMovementVisualizer && typeof window.PlayerMovementVisualizer.init === 'function') {
        window.PlayerMovementVisualizer.init();
        this.log('info', 'InitializationManager: Player movement visualizer initialized');
      }
      
      // Store result
      this.stageResults.renderGame = {
        success: true
      };
      
      this.log('info', 'InitializationManager: Game rendered successfully');
    } catch (error) {
      // Store result
      this.stageResults.renderGame = {
        success: false,
        error: error.message
      };
      
      // Re-throw to halt initialization
      throw error;
    }
  }
  
  /**
   * Show error screen to user
   * @param {Error} error - The error that occurred
   * @param {string} stage - The initialization stage where the error occurred
   */
  showErrorScreen(error, stage) {
    this.log('error', `InitializationManager: Showing error screen for stage ${stage}:`, error);
    
    const rootElement = document.getElementById('game-root');
    if (!rootElement) {
      console.error('Cannot show error screen: Root element not found');
      return;
    }
    
    const errorMessage = error.message || 'Unknown error occurred';
    const stageMessage = stage ? `during ${stage}` : '';
    
    // Create styled error screen
    rootElement.innerHTML = `
      <div class="error-screen">
        <h2>Game Initialization Failed</h2>
        <p>An error occurred ${stageMessage}: ${errorMessage}</p>
        <p>Please check the console for more details.</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
  
  /**
   * Show warning for non-critical card types that failed to load
   * @param {string[]} failedCardTypes - Array of card types that failed to load
   */
  showNonCriticalCardWarning(failedCardTypes) {
    this.log('warn', 'InitializationManager: Showing non-critical card warning for:', failedCardTypes);
    
    // Create warning element
    const warningElement = document.createElement('div');
    warningElement.className = 'card-warning';
    warningElement.innerHTML = `
      <div class="warning-message">
        <h3>Warning: Some Card Types Not Loaded</h3>
        <p>The following card types could not be loaded: ${failedCardTypes.join(', ')}</p>
        <p>The game will continue, but some features may be limited.</p>
        <button id="dismiss-warning">Continue Playing</button>
      </div>
    `;
    
    // Add warning to DOM after it's ready
    const addWarningElement = () => {
      document.body.appendChild(warningElement);
      
      // Add click handler to dismiss
      document.getElementById('dismiss-warning').addEventListener('click', () => {
        document.body.removeChild(warningElement);
      });
    };
    
    // Add warning when DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(addWarningElement, 1000); // Delay to ensure App is rendered
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addWarningElement, 1000);
      });
    }
  }
  
  /**
   * Get debug mode setting from URL parameter
   * @returns {boolean} True if debug mode is enabled
   */
  _getDebugModeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debug') === 'true';
  }
  
  /**
   * Get log level from URL parameter
   * @returns {string} Log level (error, warn, info, debug)
   */
  _getLogLevelFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('logLevel');
    const validLevels = ['error', 'warn', 'info', 'debug'];
    
    return validLevels.includes(level) ? level : 'info';
  }
  
  /**
   * Log a message with appropriate level
   * @param {string} level - Log level (error, warn, info, debug)
   * @param {string} message - Message to log
   * @param {*} [data] - Optional data to log
   */
  log(level, message, data) {
    const logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    // Only log if level is appropriate
    if (logLevels[level] <= logLevels[this.logLevel]) {
      if (data) {
        console[level](message, data);
      } else {
        console[level](message);
      }
    }
  }
  
  /**
   * Dispatch stage event
   * @param {string} stage - Stage name
   * @param {boolean} success - Whether the stage was successful
   */
  _dispatchStageEvent(stage, success) {
    window.dispatchEvent(
      new CustomEvent('initStageCompleted', {
        detail: { 
          stage,
          success,
          result: this.stageResults[stage]
        }
      })
    );
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    this.log('info', 'InitializationManager: Cleaning up resources');
    
    // Nothing specific to clean up currently
    
    this.log('info', 'InitializationManager: Cleanup completed');
  }
}

// Create instance and export
window.InitializationManager = new InitializationManager();

// Export static constants
window.INITIALIZATION_STAGES = {
  VALIDATE_REQUIREMENTS: 'validateRequirements',
  LOAD_CORE_DATA: 'loadCoreData',
  LOAD_CARD_DATA: 'loadCardData',
  INITIALIZE_GAME_STATE: 'initializeGameState',
  RENDER_GAME: 'renderGame'
};

console.log('InitializationManager.js code execution finished');