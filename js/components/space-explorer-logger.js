// space-explorer-logger.js file is beginning to be used
console.log('space-explorer-logger.js file is beginning to be used');

/**
 * SpaceExplorerLogger - Module for handling Space Explorer layout and logging
 * Handles element visibility, class management, and logging of explorer state
 * 
 * Key features:
 * - Dynamically adds CSS classes to elements for styling
 * - Provides logging for space explorer actions
 * - Works with close/open functionality via the handleCloseExplorer method in GameBoard.js
 * - Uses CSS from space-explorer.css rather than injecting inline styles
 */
window.SpaceExplorerLogger = {
  // Configuration
  checkIntervals: [500], // Reduced to a single check to avoid excessive DOM manipulations
  
  // State tracking
  initialized: false,
  fixesApplied: false,
  
  /**
   * Initialize the Space Explorer Logger
   * Sets up event listeners
   */
  init: function() {
    if (this.initialized) {
      console.log('SpaceExplorerLogger: Already initialized');
      return;
    }
    
    console.log('SpaceExplorerLogger: Initializing');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply fixes on a schedule
    this.scheduleFixApplication();
    
    this.initialized = true;
    console.log('SpaceExplorerLogger: Initialization complete');
  },
  
  /**
   * Set up event listeners for DOM changes
   */
  setupEventListeners: function() {
    // Add event listener for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('SpaceExplorerLogger: DOM content loaded event fired');
        this.applyAllFixes();
      });
    } else {
      // DOM already loaded, apply fixes directly
      console.log('SpaceExplorerLogger: DOM already loaded, applying fixes immediately');
      this.applyAllFixes();
    }
  },
  
  /**
   * Schedule application of fixes with a safeguard against excessive calls
   */
  scheduleFixApplication: function() {
    console.log('SpaceExplorerLogger: Scheduling fix applications');
    
    if (this.fixScheduled) {
      console.log('SpaceExplorerLogger: Fix already scheduled, skipping');
      return;
    }
    
    this.fixScheduled = true;
    
    // Apply fixes once after a delay
    setTimeout(() => {
      console.log('SpaceExplorerLogger: Applying scheduled fixes');
      this.applyAllFixes();
      this.fixScheduled = false;
    }, this.checkIntervals[0]);
  },
  
  /**
   * Apply all fixes at once by adding appropriate classes
   */
  applyAllFixes: function() {
    // Check if the component is mounted in the DOM before applying fixes
    if (!document.querySelector('.game-container')) {
      console.log('SpaceExplorerLogger: Game container not found, delaying fixes');
      return;
    }
    
    // Add classes to elements instead of directly setting styles
    this.addClassesToElements();
    
    if (!this.fixesApplied) {
      console.log('SpaceExplorerLogger: Applied all fixes by adding classes');
      this.fixesApplied = true;
    }
  },
  
  /**
   * Add CSS classes to elements for styling
   */
  addClassesToElements: function() {
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
              console.error(`SpaceExplorerLogger: Error processing element ${selector}:`, innerError.message);
            }
          });
          
          return count;
        } catch (outerError) {
          console.error(`SpaceExplorerLogger: Error with selector ${selector}:`, outerError.message);
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
        console.log(`SpaceExplorerLogger: Applied CSS classes to ${elementsProcessed} elements`);
      }
    } catch (error) {
      console.error('SpaceExplorerLogger: Error adding classes to elements:', error.message);
    }
  },
  
  /**
   * Log when the explorer is toggled
   */
  logToggle: function(isVisible, spaceName) {
    if (isVisible) {
      console.log('SpaceExplorerLogger: Explorer shown for space:', spaceName);
      console.log('SpaceExplorerLogger: Game board width reduced to make room for Explorer');
      
      // Apply fixes after explorer is shown - only schedule if not already scheduled
      if (!this.fixScheduled) {
        this.scheduleFixApplication();
      }
    } else {
      console.log('SpaceExplorerLogger: Explorer hidden');
      console.log('SpaceExplorerLogger: Game board expanded to full width');
    }
  }
};

// Maintain backward compatibility with the old function name
window.logSpaceExplorerToggle = function(isVisible, spaceName) {
  // Forward calls to the new module
  window.SpaceExplorerLogger.logToggle(isVisible, spaceName);
};

// Initialize SpaceExplorerLogger
(function() {
  // Initialize on load or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.SpaceExplorerLogger.init();
    });
  } else {
    window.SpaceExplorerLogger.init();
  }
})();

console.log('space-explorer-logger.js code execution finished');
