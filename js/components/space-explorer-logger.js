// space-explorer-logger.js file is beginning to be used
console.log('space-explorer-logger.js file is beginning to be used');

/**
 * SpaceExplorerLoggerManager - Manager class for handling Space Explorer layout and logging
 * 
 * This component manages layout adjustments and logging for the Space Explorer panel
 * and integrates fully with the GameStateManager event system.
 * 
 * Key features:
 * - Follows the manager pattern with proper initialization and cleanup
 * - Uses GameStateManager events for communication instead of direct state manipulation
 * - Adds appropriate CSS classes instead of inline styles
 * - Provides detailed logging for space explorer actions and state changes
 * - Efficiently processes DOM updates with throttling to prevent performance issues
 * - Handles window resize events for responsive layouts
 */
class SpaceExplorerLoggerManager {
  /**
   * Initialize the Space Explorer Logger Manager
   * @param {Object} gameState - Reference to the game state
   */
  constructor(gameState) {
    console.log('SpaceExplorerLoggerManager: Constructor initialized');
    
    // Store references
    this.gameState = gameState;
    
    // Configuration
    this.checkInterval = 500; // Time in ms to check for DOM updates
    
    // State tracking
    this.initialized = false;
    this.fixesApplied = false;
    this.fixScheduled = false;
    this.processingCount = 0;
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      spaceExplorerToggled: this.handleSpaceExplorerToggled.bind(this),
      gameStateChanged: this.handleGameStateChanged.bind(this),
      playerMoved: this.handlePlayerMoved.bind(this),
      turnChanged: this.handleTurnChanged.bind(this)
    };
    
    // Register event listeners after a slight delay to avoid initialization order issues
    setTimeout(() => {
      this.registerEventListeners();
    }, 0);
    
    // Set up DOM listeners
    this.setupDOMListeners();
    
    this.initialized = true;
    console.log('SpaceExplorerLoggerManager: Constructor completed');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners() {
    console.log('SpaceExplorerLoggerManager: Registering event listeners');
    
    if (!window.GameStateManager) {
      console.error('SpaceExplorerLoggerManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register for standard events
    window.GameStateManager.addEventListener('spaceExplorerToggled', this.eventHandlers.spaceExplorerToggled);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    
    // Add custom event type if it doesn't exist yet
    if (!window.GameStateManager.eventHandlers['spaceExplorerToggled']) {
      window.GameStateManager.eventHandlers['spaceExplorerToggled'] = [];
    }
    
    console.log('SpaceExplorerLoggerManager: Event listeners registered successfully');
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDOMListeners() {
    console.log('SpaceExplorerLoggerManager: Setting up DOM event listeners');
    
    // Add event listener for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('SpaceExplorerLoggerManager: DOM content loaded event fired');
        this.applyAllFixes();
      });
    } else {
      // DOM already loaded, apply fixes directly
      this.applyAllFixes();
    }
    
    // Add resize event listener for layout adjustments
    window.addEventListener('resize', this.handleWindowResize.bind(this));
    
    console.log('SpaceExplorerLoggerManager: DOM listeners setup complete');
  }
  
  /**
   * Handle spaceExplorerToggled events from GameStateManager
   * @param {Object} event - The event object
   */
  handleSpaceExplorerToggled(event) {
    console.log('SpaceExplorerLoggerManager: Handling spaceExplorerToggled event');
    
    if (!event || !event.data) {
      console.warn('SpaceExplorerLoggerManager: Received invalid spaceExplorerToggled event');
      return;
    }
    
    const { visible, spaceName } = event.data;
    
    // Log the toggle event
    this.logToggle(visible, spaceName);
    
    // Schedule class fixes when explorer becomes visible
    if (visible && !this.fixScheduled) {
      this.scheduleFixApplication();
    }
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The event object
   */
  handleGameStateChanged(event) {
    console.log('SpaceExplorerLoggerManager: Handling gameStateChanged event');
    
    // Handle relevant game state changes
    if (event.data && event.data.changeType === 'newGame') {
      // Reset any logger-specific state for new games
      this.fixesApplied = false;
      this.processingCount = 0;
      
      // Apply fixes if explorer is visible in new game
      const explorer = document.querySelector('.space-explorer-container');
      if (explorer && window.getComputedStyle(explorer).display !== 'none') {
        this.scheduleFixApplication();
      }
    }
  }
  
  /**
   * Handle player movement events
   * @param {Object} event - The event object
   */
  handlePlayerMoved(event) {
    console.log('SpaceExplorerLoggerManager: Handling playerMoved event');
    
    if (event.data && event.data.toSpaceId) {
      // Check if explorer is visible and schedule fixes if needed
      const explorer = document.querySelector('.space-explorer-container');
      if (explorer && window.getComputedStyle(explorer).display !== 'none') {
        this.scheduleFixApplication();
      }
    }
  }
  
  /**
   * Handle turn changed events
   * @param {Object} event - The event object
   */
  handleTurnChanged(event) {
    console.log('SpaceExplorerLoggerManager: Handling turnChanged event');
    
    // At turn change, verify UI state
    const explorer = document.querySelector('.space-explorer-container');
    if (explorer && window.getComputedStyle(explorer).display !== 'none') {
      this.scheduleFixApplication();
    }
  }
  
  /**
   * Handle window resize events
   */
  handleWindowResize() {
    console.log('SpaceExplorerLoggerManager: Handling window resize event');
    
    // Check if explorer is visible and schedule fixes
    const explorer = document.querySelector('.space-explorer-container');
    if (explorer && window.getComputedStyle(explorer).display !== 'none') {
      this.scheduleFixApplication();
    }
  }
  
  /**
   * Schedule application of fixes with throttling to prevent excessive calls
   */
  scheduleFixApplication() {
    console.log('SpaceExplorerLoggerManager: Scheduling fix applications');
    
    if (this.fixScheduled) {
      return;
    }
    
    this.fixScheduled = true;
    
    // Apply fixes once after a delay
    setTimeout(() => {
      this.applyAllFixes();
      this.fixScheduled = false;
    }, this.checkInterval);
  }
  
  /**
   * Apply all fixes at once by adding appropriate classes
   * @returns {boolean} Whether fixes were successfully applied
   */
  applyAllFixes() {
    console.log('SpaceExplorerLoggerManager: Beginning to apply all fixes');
    
    // Check if the component is mounted in the DOM before applying fixes
    if (!document.querySelector('.game-container')) {
      console.log('SpaceExplorerLoggerManager: Game container not found, delaying fixes');
      return false;
    }
    
    // Reset processing count for this run
    this.processingCount = 0;
    
    // Add classes to elements instead of directly setting styles
    const elementsProcessed = this.addClassesToElements();
    
    if (elementsProcessed > 0) {
      console.log(`SpaceExplorerLoggerManager: Processed ${elementsProcessed} elements in this fix run`);
    }
    
    if (!this.fixesApplied) {
      this.fixesApplied = true;
    }
    
    return true;
  }
  
  /**
   * Add CSS classes to elements for styling
   * @returns {number} The number of elements processed
   */
  addClassesToElements() {
    console.log('SpaceExplorerLoggerManager: Adding CSS classes to elements');
    
    try {
      // Keep track of processed elements to avoid redundant operations
      let elementsProcessed = 0;
      
      // Find the explorer container and add class if needed
      const explorerContainer = document.querySelector('.space-explorer-container');
      if (explorerContainer && !explorerContainer.classList.contains('explorer-auto-height')) {
        explorerContainer.classList.add('explorer-auto-height');
        elementsProcessed++;
      }
      
      // Safely add class to elements - with null checks and try/catch per selector
      const addClassSafely = (selector, className, processingFn) => {
        try {
          const elements = document.querySelectorAll(selector);
          if (!elements || elements.length === 0) {
            return 0;
          }
          
          let count = 0;
          elements.forEach((element, index) => {
            if (!element) return;
            
            try {
              if (!element.classList.contains(className)) {
                element.classList.add(className);
                count++;
              }
              
              // Apply additional processing if provided
              if (processingFn && typeof processingFn === 'function') {
                processingFn(element, index);
              }
            } catch (innerError) {
              console.error(`SpaceExplorerLoggerManager: Error processing element ${selector}:`, innerError.message);
            }
          });
          
          return count;
        } catch (outerError) {
          console.error(`SpaceExplorerLoggerManager: Error with selector ${selector}:`, outerError.message);
          return 0;
        }
      };
      
      // Add classes to dice tables with safer approach
      elementsProcessed += addClassSafely('.explorer-dice-table', 'dice-table-fixed', (table, tableIndex) => {
        // Add alternating row classes to tbody rows
        const rows = table.querySelectorAll('tbody tr');
        if (rows && rows.length > 0) {
          rows.forEach((row, index) => {
            if (index % 2 === 0 && !row.classList.contains('row-alternate')) {
              row.classList.add('row-alternate');
            }
          });
        }
      });
      
      // Process outcome spans with safer approach
      elementsProcessed += addClassSafely('.dice-outcome div', '', div => {
        // Skip if already processed
        if (div.dataset && div.dataset.processed) {
          return;
        }
        
        // Mark as processed to avoid duplicate processing
        if (div.dataset) div.dataset.processed = 'true';
        
        // Add class based on content
        const text = div.textContent ? div.textContent.toLowerCase() : '';
        if (text.includes('move to')) {
          div.classList.add('outcome-move');
        } else if (text.includes('card')) {
          div.classList.add('outcome-card');
        } else if (text.includes('time') || text.includes('fee')) {
          div.classList.add('outcome-resource');
        }
      });
      
      // Process other elements with safer approach
      elementsProcessed += addClassSafely('.board-space', 'space-vertical-fixed');
      elementsProcessed += addClassSafely('.board-row', 'row-align-start');
      elementsProcessed += addClassSafely('.space-type-setup', 'setup-space-fixed');
      elementsProcessed += addClassSafely('.player-tokens', 'player-tokens-fixed');
      
      // Track total processing count
      this.processingCount += elementsProcessed;
      
      return elementsProcessed;
    } catch (error) {
      console.error('SpaceExplorerLoggerManager: Error adding classes to elements:', error.message);
      return 0;
    }
  }
  
  /**
   * Log when the explorer is toggled
   * @param {boolean} isVisible - Whether the explorer is visible
   * @param {string} spaceName - Name of the space being explored
   */
  logToggle(isVisible, spaceName) {
    if (isVisible) {
      console.log(`SpaceExplorerLoggerManager: Explorer shown for space: "${spaceName}"`);
      
      // Apply fixes after explorer is shown - only schedule if not already scheduled
      if (!this.fixScheduled) {
        this.scheduleFixApplication();
      }
    } else {
      console.log('SpaceExplorerLoggerManager: Explorer hidden');
      console.log(`SpaceExplorerLoggerManager: Total elements processed during session: ${this.processingCount}`);
    }
  }
  
  /**
   * Clean up resources when the component is unmounted
   */
  cleanup() {
    console.log('SpaceExplorerLoggerManager: Cleaning up resources');
    
    // Remove all event listeners from GameStateManager
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('spaceExplorerToggled', this.eventHandlers.spaceExplorerToggled);
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
      window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
    }
    
    // Remove window resize listener
    window.removeEventListener('resize', this.handleWindowResize);
    
    console.log(`SpaceExplorerLoggerManager: Total elements processed during lifecycle: ${this.processingCount}`);
  }
}

/**
 * BackwardCompatibilityManager - Manager for backward compatibility
 * 
 * Provides a compatibility layer for older code that might be using
 * the deprecated functions while maintaining the new manager pattern structure.
 */
class BackwardCompatibilityManager {
  constructor() {
    console.log('BackwardCompatibilityManager: Constructor initialized');
    this.manager = null;
    this.setupGlobalReferences();
    console.log('BackwardCompatibilityManager: Constructor completed');
  }
  
  /**
   * Setup global references to maintain backward compatibility
   */
  setupGlobalReferences() {
    // Create legacy compatibility object
    window.SpaceExplorerLogger = {
      init: () => this.initManager(),
      logToggle: (isVisible, spaceName) => this.logToggle(isVisible, spaceName),
      scheduleFixApplication: () => this.scheduleFixApplication(),
      applyAllFixes: () => this.applyAllFixes()
    };
    
    // Create legacy global function
    window.logSpaceExplorerToggle = (isVisible, spaceName) => {
      this.logToggle(isVisible, spaceName);
    };
  }
  
  /**
   * Initialize the manager
   */
  initManager() {
    if (!this.manager) {
      this.manager = new SpaceExplorerLoggerManager(window.GameStateManager);
    }
    return this.manager;
  }
  
  /**
   * Forward logToggle call to the manager
   */
  logToggle(isVisible, spaceName) {
    const manager = this.initManager();
    manager.logToggle(isVisible, spaceName);
  }
  
  /**
   * Forward scheduleFixApplication call to the manager
   */
  scheduleFixApplication() {
    if (this.manager) {
      this.manager.scheduleFixApplication();
    }
  }
  
  /**
   * Forward applyAllFixes call to the manager
   */
  applyAllFixes() {
    if (this.manager) {
      this.manager.applyAllFixes();
    }
  }
}

// Initialize everything when the file loads
(function() {
  console.log('Space-explorer-logger: Initializing');
  
  // Create compatibility manager
  const compatibilityManager = new BackwardCompatibilityManager();
  
  // Create manager instance when the page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      compatibilityManager.initManager();
    });
  } else {
    // DOM already loaded, initialize immediately
    compatibilityManager.initManager();
  }
  
  console.log('Space-explorer-logger: Initialization complete');
})();

console.log('space-explorer-logger.js code execution finished');
