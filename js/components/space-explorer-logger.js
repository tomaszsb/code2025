// space-explorer-logger.js file is beginning to be used
console.log('space-explorer-logger.js file is beginning to be used');

/**
 * SpaceExplorerLogger - Module for handling Space Explorer layout and logging
 * Handles element visibility, class management, and logging of explorer state
 */
window.SpaceExplorerLogger = {
  // Configuration
  checkIntervals: [300, 600, 1000, 1500, 2000], // Decreasing frequency checks
  
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
   * Schedule application of fixes at decreasing frequency
   */
  scheduleFixApplication: function() {
    console.log('SpaceExplorerLogger: Scheduling fix applications');
    
    // Apply fixes at predefined intervals
    this.checkIntervals.forEach(interval => {
      setTimeout(() => {
        console.log(`SpaceExplorerLogger: Applying scheduled fixes after ${interval}ms`);
        this.applyAllFixes();
      }, interval);
    });
  },
  
  /**
   * Apply all fixes at once by adding appropriate classes
   */
  applyAllFixes: function() {
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
      // Find the explorer container and add class if needed
      const explorerContainer = document.querySelector('.space-explorer-container');
      if (explorerContainer && !explorerContainer.classList.contains('explorer-auto-height')) {
        explorerContainer.classList.add('explorer-auto-height');
      }
      
      // Add classes to dice tables
      const diceTables = document.querySelectorAll('.explorer-dice-table');
      diceTables.forEach(table => {
        if (!table.classList.contains('dice-table-fixed')) {
          table.classList.add('dice-table-fixed');
          
          // Add alternating row classes to tbody rows
          const rows = table.querySelectorAll('tbody tr');
          rows.forEach((row, index) => {
            if (index % 2 === 0 && !row.classList.contains('row-alternate')) {
              row.classList.add('row-alternate');
            }
          });
        }
      });
      
      // Add classes to outcome spans for proper styling
      const outcomeSpans = document.querySelectorAll('.dice-outcome span');
      outcomeSpans.forEach(span => {
        // Skip if already processed
        if (span.dataset.processed) return;
        
        // Mark as processed to avoid duplicate processing
        span.dataset.processed = 'true';
        
        // Add class based on content
        const text = span.textContent.toLowerCase();
        if (text.includes('move to')) {
          span.classList.add('outcome-move');
        } else if (text.includes('card')) {
          span.classList.add('outcome-card');
        } else if (text.includes('time') || text.includes('fee')) {
          span.classList.add('outcome-resource');
        }
      });
      
      // Add class to fix board spaces
      document.querySelectorAll('.board-space').forEach(space => {
        if (!space.classList.contains('space-vertical-fixed')) {
          space.classList.add('space-vertical-fixed');
        }
      });
      
      // Add class to board rows
      document.querySelectorAll('.board-row').forEach(row => {
        if (!row.classList.contains('row-align-start')) {
          row.classList.add('row-align-start');
        }
      });
      
      // Add classes to setup spaces
      document.querySelectorAll('.space-type-setup').forEach(space => {
        if (!space.classList.contains('setup-space-fixed')) {
          space.classList.add('setup-space-fixed');
        }
      });
      
      // Add classes to player tokens
      document.querySelectorAll('.player-tokens').forEach(tokens => {
        if (!tokens.classList.contains('player-tokens-fixed')) {
          tokens.classList.add('player-tokens-fixed');
        }
      });
      
      console.log('SpaceExplorerLogger: Applied CSS classes to all elements');
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
      
      // Apply fixes after explorer is shown
      setTimeout(() => {
        this.applyAllFixes();
      }, 200);
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
