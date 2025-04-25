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
    
    // Configuration
    this.checkInterval = 500; // Time in ms to check for DOM updates
    
    // State tracking
    this.initialized = false;
    this.fixesApplied = false;
    this.fixScheduled = false;
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      spaceExplorerToggled: this.handleSpaceExplorerToggled.bind(this),
      gameStateChanged: this.handleGameStateChanged.bind(this)
    };
    
    // Register event listeners - with slight delay to avoid initialization order issues
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
    
    // Register for gameStateChanged events
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    console.log('SpaceExplorerLoggerManager: Event listeners registered');
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDOMListeners() {
    // Add event listener for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('SpaceExplorerLoggerManager: DOM content loaded event fired');
        this.applyAllFixes();
      });
    } else {
      // DOM already loaded, apply fixes directly
      console.log('SpaceExplorerLoggerManager: DOM already loaded, applying fixes immediately');
      this.applyAllFixes();
    }
  }
  
  /**
   * Handle spaceExplorerToggled events from GameStateManager
   * @param {Object} event - The event object
   */
  handleSpaceExplorerToggled(event) {
    if (!event || !event.data) {
      console.warn('SpaceExplorerLoggerManager: Received invalid spaceExplorerToggled event');
      return;
    }
    
    const { visible, spaceName } = event.data;
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
    console.log('SpaceExplorerLoggerManager: Handling gameStateChanged event', event.data);
    
    // Handle relevant game state changes
    if (event.data && event.data.changeType === 'newGame') {
      // Reset any logger-specific state for new games
      this.fixesApplied = false;
      
      // Apply fixes if explorer is visible in new game
      const explorer = document.querySelector('.space-explorer-container');
      if (explorer && window.getComputedStyle(explorer).display !== 'none') {
        this.scheduleFixApplication();
      }
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
  applyAllFixes() {
    // Check if the component is mounted in the DOM before applying fixes
    if (!document.querySelector('.game-container')) {
      console.log('SpaceExplorerLoggerManager: Game container not found, delaying fixes');
      return;
    }
    
    // Add classes to elements instead of directly setting styles
    this.addClassesToElements();
    
    if (!this.fixesApplied) {
      console.log('SpaceExplorerLoggerManager: Applied all fixes by adding classes');
      this.fixesApplied = true;
    }
  }
  
  /**
   * Add CSS classes to elements for styling
   */
  addClassesToElements() {
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
          if (!elements || elements.length === 0) return 0;
          
          let count = 0;
          elements.forEach(element => {
            if (!element) return;
            
            try {
              if (!element.classList.contains(className)) {
                element.classList.add(className);
                count++;
              }
              
              // Apply additional processing if provided
              if (processingFn && typeof processingFn === 'function') {
                processingFn(element);
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
      elementsProcessed += addClassSafely('.explorer-dice-table', 'dice-table-fixed', table => {
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
      elementsProcessed += addClassSafely('.dice-outcome span', '', span => {
        // Skip if already processed
        if (span.dataset && span.dataset.processed) return;
        
        // Mark as processed to avoid duplicate processing
        if (span.dataset) span.dataset.processed = 'true';
        
        // Add class based on content
        const text = span.textContent ? span.textContent.toLowerCase() : '';
        if (text.includes('move to')) {
          span.classList.add('outcome-move');
        } else if (text.includes('card')) {
          span.classList.add('outcome-card');
        } else if (text.includes('time') || text.includes('fee')) {
          span.classList.add('outcome-resource');
        }
      });
      
      // Process other elements with safer approach
      elementsProcessed += addClassSafely('.board-space', 'space-vertical-fixed');
      elementsProcessed += addClassSafely('.board-row', 'row-align-start');
      elementsProcessed += addClassSafely('.space-type-setup', 'setup-space-fixed');
      elementsProcessed += addClassSafely('.player-tokens', 'player-tokens-fixed');
      
      // Only log if elements were actually processed
      if (elementsProcessed > 0) {
        console.log(`SpaceExplorerLoggerManager: Applied CSS classes to ${elementsProcessed} elements`);
      }
    } catch (error) {
      console.error('SpaceExplorerLoggerManager: Error adding classes to elements:', error.message);
    }
  }
  
  /**
   * Log when the explorer is toggled
   * @param {boolean} isVisible - Whether the explorer is visible
   * @param {string} spaceName - Name of the space being explored
   */
  logToggle(isVisible, spaceName) {
    if (isVisible) {
      console.log('SpaceExplorerLoggerManager: Explorer shown for space:', spaceName);
      console.log('SpaceExplorerLoggerManager: Game board width reduced to make room for Explorer');
      
      // Apply fixes after explorer is shown - only schedule if not already scheduled
      if (!this.fixScheduled) {
        this.scheduleFixApplication();
      }
    } else {
      console.log('SpaceExplorerLoggerManager: Explorer hidden');
      console.log('SpaceExplorerLoggerManager: Game board expanded to full width');
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
    }
    
    console.log('SpaceExplorerLoggerManager: Cleanup completed');
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
  // Create manager instance when the page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize through the compatibility layer
      window.SpaceExplorerLogger.init();
    });
  } else {
    // DOM already loaded, initialize immediately
    window.SpaceExplorerLogger.init();
  }
})();

console.log('space-explorer-logger.js code execution finished');
