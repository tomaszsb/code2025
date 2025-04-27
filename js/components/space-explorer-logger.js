// space-explorer-logger.js file is beginning to be used
console.log('space-explorer-logger.js file is beginning to be used');

/**
 * SpaceExplorerLoggerManager - Manager class for handling Space Explorer layout and logging
 * Integrates with GameStateManager event system
 * Handles element visibility, class management, and logging of explorer state
 * 
 * Key features:
 * - Properly integrates with GameStateManager event system
 * - Dynamically adds CSS classes to elements for styling
 * - Provides logging for space explorer actions
 * - Works with close/open functionality via the SpaceExplorerManager
 * - Uses CSS from space-explorer.css rather than injecting inline styles
 * - Follows the manager pattern with proper cleanup
 */
class SpaceExplorerLoggerManager {
  /**
   * Initialize the Space Explorer Logger Manager
   * @param {Object} gameState - Reference to the game state
   */
  constructor(gameState) {
    console.log('SpaceExplorerLoggerManager: Initializing');
    
    // Store references
    this.gameState = gameState;
    console.log('SpaceExplorerLoggerManager: Storing game state reference');
    
    // Configuration
    this.checkInterval = 500; // Time in ms to check for DOM updates
    console.log(`SpaceExplorerLoggerManager: Setting check interval to ${this.checkInterval}ms`);
    
    // State tracking
    this.initialized = false;
    this.fixesApplied = false;
    this.fixScheduled = false;
    this.processingCount = 0;
    console.log('SpaceExplorerLoggerManager: Initializing state tracking variables');
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      spaceExplorerToggled: this.handleSpaceExplorerToggled.bind(this),
      gameStateChanged: this.handleGameStateChanged.bind(this),
      playerMoved: this.handlePlayerMovedEvent.bind(this),
      turnChanged: this.handleTurnChangedEvent.bind(this)
    };
    console.log('SpaceExplorerLoggerManager: Bound event handlers for cleanup');
    
    // Register event listeners - with slight delay to avoid initialization order issues
    console.log('SpaceExplorerLoggerManager: Setting up delayed event registration');
    setTimeout(() => {
      this.registerEventListeners();
    }, 0);
    
    // Set up DOM listeners
    this.setupDOMListeners();
    
    this.initialized = true;
    console.log('SpaceExplorerLoggerManager: Successfully initialized');
  }
  
  /**
   * Register event listeners with GameStateManager
   */
  registerEventListeners() {
    console.log('SpaceExplorerLoggerManager: Registering event listeners with GameStateManager');
    
    if (!window.GameStateManager) {
      console.error('SpaceExplorerLoggerManager: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register for spaceExplorerToggled events
    window.GameStateManager.addEventListener('spaceExplorerToggled', this.eventHandlers.spaceExplorerToggled);
    console.log('SpaceExplorerLoggerManager: Registered spaceExplorerToggled event');
    
    // Register for gameStateChanged events
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    console.log('SpaceExplorerLoggerManager: Registered gameStateChanged event');
    
    // Register for player movement events
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    console.log('SpaceExplorerLoggerManager: Registered playerMoved event');
    
    // Register for turn changed events
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    console.log('SpaceExplorerLoggerManager: Registered turnChanged event');
    
    console.log('SpaceExplorerLoggerManager: All event listeners registered successfully');
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDOMListeners() {
    console.log('SpaceExplorerLoggerManager: Setting up DOM event listeners');
    
    // Add event listener for DOMContentLoaded
    if (document.readyState === 'loading') {
      console.log('SpaceExplorerLoggerManager: DOM still loading, adding DOMContentLoaded listener');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('SpaceExplorerLoggerManager: DOM content loaded event fired');
        this.applyAllFixes();
      });
    } else {
      // DOM already loaded, apply fixes directly
      console.log('SpaceExplorerLoggerManager: DOM already loaded, applying fixes immediately');
      this.applyAllFixes();
    }
    
    // Add resize event listener for layout adjustments
    console.log('SpaceExplorerLoggerManager: Adding window resize event listener');
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
    console.log(`SpaceExplorerLoggerManager: Explorer visibility changed - visible: ${visible}, space: ${spaceName}`);
    
    this.logToggle(visible, spaceName);
    
    // Schedule class fixes when explorer becomes visible
    if (visible && !this.fixScheduled) {
      console.log('SpaceExplorerLoggerManager: Explorer became visible, scheduling fix application');
      this.scheduleFixApplication();
    }
  }
  
  /**
   * Handle gameStateChanged events from GameStateManager
   * @param {Object} event - The event object
   */
  handleGameStateChanged(event) {
    console.log('SpaceExplorerLoggerManager: Handling gameStateChanged event', event.data);
    
    // Handle relevant game state changes
    if (event.data && event.data.changeType === 'newGame') {
      console.log('SpaceExplorerLoggerManager: New game detected, resetting logger state');
      
      // Reset any logger-specific state for new games
      this.fixesApplied = false;
      this.processingCount = 0;
      
      // Apply fixes if explorer is visible in new game
      const explorer = document.querySelector('.space-explorer-container');
      if (explorer && window.getComputedStyle(explorer).display !== 'none') {
        console.log('SpaceExplorerLoggerManager: Explorer is visible in new game, scheduling fix application');
        this.scheduleFixApplication();
      }
    }
  }
  
  /**
   * Schedule application of fixes with a safeguard against excessive calls
   */
  /**
   * Handle player moved events
   * @param {Object} event - The event object
   */
  handlePlayerMovedEvent(event) {
    console.log('SpaceExplorerLoggerManager: Handling playerMoved event');
    
    if (event.data && event.data.toSpaceId) {
      console.log(`SpaceExplorerLoggerManager: Player moved to space ID: ${event.data.toSpaceId}`);
      // Check if explorer is visible and schedule fixes if needed
      const explorer = document.querySelector('.space-explorer-container');
      if (explorer && window.getComputedStyle(explorer).display !== 'none') {
        console.log('SpaceExplorerLoggerManager: Explorer is visible after player movement, scheduling fixes');
        this.scheduleFixApplication();
      }
    }
  }
  
  /**
   * Handle turn changed events
   * @param {Object} event - The event object
   */
  handleTurnChangedEvent(event) {
    console.log('SpaceExplorerLoggerManager: Handling turnChanged event');
    
    // At turn change, verify UI state
    const explorer = document.querySelector('.space-explorer-container');
    if (explorer && window.getComputedStyle(explorer).display !== 'none') {
      console.log('SpaceExplorerLoggerManager: Explorer is visible after turn change, scheduling fixes');
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
      console.log('SpaceExplorerLoggerManager: Explorer is visible during resize, scheduling fixes');
      this.scheduleFixApplication();
    }
  }
  
  /**
   * Schedule application of fixes with a safeguard against excessive calls
   */
  scheduleFixApplication() {
    console.log('SpaceExplorerLoggerManager: Scheduling fix applications');
    
    if (this.fixScheduled) {
      console.log('SpaceExplorerLoggerManager: Fix already scheduled, skipping');
      return;
    }
    
    this.fixScheduled = true;
    console.log(`SpaceExplorerLoggerManager: Fix scheduled to run in ${this.checkInterval}ms`);
    
    // Apply fixes once after a delay
    setTimeout(() => {
      console.log('SpaceExplorerLoggerManager: Applying scheduled fixes');
      this.applyAllFixes();
      this.fixScheduled = false;
    }, this.checkInterval);
  }
  
  /**
   * Apply all fixes at once by adding appropriate classes
   */
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
    
    console.log('SpaceExplorerLoggerManager: Game container found, proceeding with fixes');
    
    // Reset processing count for this run
    this.processingCount = 0;
    
    // Add classes to elements instead of directly setting styles
    const elementsProcessed = this.addClassesToElements();
    
    if (elementsProcessed > 0) {
      console.log(`SpaceExplorerLoggerManager: Processed ${elementsProcessed} elements in this fix run`);
    } else {
      console.log('SpaceExplorerLoggerManager: No elements needed processing in this fix run');
    }
    
    if (!this.fixesApplied) {
      console.log('SpaceExplorerLoggerManager: Applied all fixes by adding classes');
      this.fixesApplied = true;
    }
    
    return true;
  }
  
  /**
   * Add CSS classes to elements for styling
   */
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
        console.log('SpaceExplorerLoggerManager: Adding explorer-auto-height class to container');
        explorerContainer.classList.add('explorer-auto-height');
        elementsProcessed++;
      }
      
      // Safely add class to elements - with null checks and try/catch per selector
      const addClassSafely = (selector, className, processingFn) => {
        console.log(`SpaceExplorerLoggerManager: Processing selector '${selector}' for class '${className}'`);
        
        try {
          const elements = document.querySelectorAll(selector);
          if (!elements || elements.length === 0) {
            console.log(`SpaceExplorerLoggerManager: No elements found for selector '${selector}'`);
            return 0;
          }
          
          console.log(`SpaceExplorerLoggerManager: Found ${elements.length} elements for selector '${selector}'`);
          
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
          
          if (count > 0) {
            console.log(`SpaceExplorerLoggerManager: Added class '${className}' to ${count} elements`);
          }
          
          return count;
        } catch (outerError) {
          console.error(`SpaceExplorerLoggerManager: Error with selector ${selector}:`, outerError.message);
          return 0;
        }
      };
      
      // Add classes to dice tables with safer approach
      console.log('SpaceExplorerLoggerManager: Processing dice tables');
      elementsProcessed += addClassSafely('.explorer-dice-table', 'dice-table-fixed', (table, tableIndex) => {
        console.log(`SpaceExplorerLoggerManager: Processing dice table ${tableIndex + 1}`);
        // Add alternating row classes to tbody rows
        const rows = table.querySelectorAll('tbody tr');
        if (rows && rows.length > 0) {
          console.log(`SpaceExplorerLoggerManager: Processing ${rows.length} rows in dice table ${tableIndex + 1}`);
          let rowsModified = 0;
          
          rows.forEach((row, index) => {
            if (index % 2 === 0 && !row.classList.contains('row-alternate')) {
              row.classList.add('row-alternate');
              rowsModified++;
            }
          });
          
          if (rowsModified > 0) {
            console.log(`SpaceExplorerLoggerManager: Added row-alternate class to ${rowsModified} rows`);
          }
        }
      });
      
      // Process outcome spans with safer approach
      console.log('SpaceExplorerLoggerManager: Processing outcome spans');
      elementsProcessed += addClassSafely('.dice-outcome span', '', span => {
        // Skip if already processed
        if (span.dataset && span.dataset.processed) {
          console.log('SpaceExplorerLoggerManager: Skipping already processed span');
          return;
        }
        
        // Mark as processed to avoid duplicate processing
        if (span.dataset) span.dataset.processed = 'true';
        
        // Add class based on content
        const text = span.textContent ? span.textContent.toLowerCase() : '';
        if (text.includes('move to')) {
          console.log('SpaceExplorerLoggerManager: Adding outcome-move class to span');
          span.classList.add('outcome-move');
        } else if (text.includes('card')) {
          console.log('SpaceExplorerLoggerManager: Adding outcome-card class to span');
          span.classList.add('outcome-card');
        } else if (text.includes('time') || text.includes('fee')) {
          console.log('SpaceExplorerLoggerManager: Adding outcome-resource class to span');
          span.classList.add('outcome-resource');
        }
      });
      
      // Process other elements with safer approach
      console.log('SpaceExplorerLoggerManager: Processing board spaces and related elements');
      elementsProcessed += addClassSafely('.board-space', 'space-vertical-fixed');
      elementsProcessed += addClassSafely('.board-row', 'row-align-start');
      elementsProcessed += addClassSafely('.space-type-setup', 'setup-space-fixed');
      elementsProcessed += addClassSafely('.player-tokens', 'player-tokens-fixed');
      
      // Track total processing count
      this.processingCount += elementsProcessed;
      
      // Only log if elements were actually processed
      if (elementsProcessed > 0) {
        console.log(`SpaceExplorerLoggerManager: Applied CSS classes to ${elementsProcessed} elements (total processed: ${this.processingCount})`);
      }
      
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
  /**
   * Log when the explorer is toggled
   * @param {boolean} isVisible - Whether the explorer is visible
   * @param {string} spaceName - Name of the space being explored
   */
  logToggle(isVisible, spaceName) {
    if (isVisible) {
      console.log(`SpaceExplorerLoggerManager: Explorer shown for space: "${spaceName}"`);
      console.log('SpaceExplorerLoggerManager: Game board width reduced to make room for Explorer');
      
      // Apply fixes after explorer is shown - only schedule if not already scheduled
      if (!this.fixScheduled) {
        console.log('SpaceExplorerLoggerManager: Scheduling fix application after toggle');
        this.scheduleFixApplication();
      }
    } else {
      console.log('SpaceExplorerLoggerManager: Explorer hidden');
      console.log('SpaceExplorerLoggerManager: Game board expanded to full width');
      console.log('SpaceExplorerLoggerManager: Total elements processed during session:', this.processingCount);
    }
  }
  
  /**
   * Clean up resources when the component is unmounted
   */
  /**
   * Clean up resources when the component is unmounted
   */
  cleanup() {
    console.log('SpaceExplorerLoggerManager: Cleaning up resources');
    
    // Remove all event listeners from GameStateManager
    if (window.GameStateManager) {
      console.log('SpaceExplorerLoggerManager: Removing event listeners from GameStateManager');
      
      window.GameStateManager.removeEventListener('spaceExplorerToggled', this.eventHandlers.spaceExplorerToggled);
      console.log('SpaceExplorerLoggerManager: Removed spaceExplorerToggled event listener');
      
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
      console.log('SpaceExplorerLoggerManager: Removed gameStateChanged event listener');
      
      window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
      console.log('SpaceExplorerLoggerManager: Removed playerMoved event listener');
      
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      console.log('SpaceExplorerLoggerManager: Removed turnChanged event listener');
    }
    
    // Remove window resize listener
    window.removeEventListener('resize', this.handleWindowResize);
    console.log('SpaceExplorerLoggerManager: Removed window resize event listener');
    
    // Final logging information
    console.log(`SpaceExplorerLoggerManager: Total elements processed during lifecycle: ${this.processingCount}`);
    console.log('SpaceExplorerLoggerManager: Cleanup completed successfully');
  }
}

// ------------ BACKWARD COMPATIBILITY SECTION ------------

/**
 * Legacy compatibility object - forwards to the new manager instance
 * This allows existing code to continue working without modifications
 */
window.SpaceExplorerLogger = {
  // The manager instance will be created and stored here
  _manager: null,
  
  // Forward to manager's methods
  init: function() {
    // Create manager instance if it doesn't exist
    if (!this._manager) {
      this._manager = new SpaceExplorerLoggerManager(window.GameStateManager);
    }
  },
  
  // Forward log calls to the manager
  logToggle: function(isVisible, spaceName) {
    // Create manager instance if it doesn't exist
    if (!this._manager) {
      this._manager = new SpaceExplorerLoggerManager(window.GameStateManager);
    }
    
    this._manager.logToggle(isVisible, spaceName);
  },
  
  // Forward other methods to maintain compatibility
  scheduleFixApplication: function() {
    if (this._manager) {
      this._manager.scheduleFixApplication();
    }
  },
  
  applyAllFixes: function() {
    if (this._manager) {
      this._manager.applyAllFixes();
    }
  }
};

// Legacy function for backward compatibility
window.logSpaceExplorerToggle = function(isVisible, spaceName) {
  // Forward calls to the compatibility object
  window.SpaceExplorerLogger.logToggle(isVisible, spaceName);
};

// Initialize SpaceExplorerLogger
(function() {
  console.log('SpaceExplorerLoggerManager: Initializing self-executing function');
  
  // Create manager instance when the page loads
  if (document.readyState === 'loading') {
    console.log('SpaceExplorerLoggerManager: DOM still loading, adding DOMContentLoaded listener for initialization');
    document.addEventListener('DOMContentLoaded', function() {
      console.log('SpaceExplorerLoggerManager: DOM content loaded, initializing through compatibility layer');
      // Initialize through the compatibility layer
      window.SpaceExplorerLogger.init();
    });
  } else {
    // DOM already loaded, initialize immediately
    console.log('SpaceExplorerLoggerManager: DOM already loaded, initializing immediately');
    window.SpaceExplorerLogger.init();
  }
  
  console.log('SpaceExplorerLoggerManager: Self-executing function completed');
})();

console.log('space-explorer-logger.js code execution finished');
