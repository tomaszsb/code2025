// space-explorer-logger.js file is beginning to be used
console.log('space-explorer-logger.js file is beginning to be used');

/**
 * SpaceExplorerLogger - Module for handling Space Explorer layout and logging
 * Handles vertical alignment issues, height adjustments, and logging of explorer state
 */
window.SpaceExplorerLogger = {
  // Configuration
  explorerId: 'space-explorer-vertical-fixes',
  explorerHeight: 'auto', // Changed from fixed 360px to auto to accommodate content
  minExplorerHeight: 360, // Minimum height (6 rows × 60px height per row)
  checkIntervals: [300, 600, 1000, 1500, 2000], // Decreasing frequency checks
  
  // State tracking
  initialized: false,
  cssInjected: false,
  fixesApplied: false,
  heightFixApplied: false,
  
  /**
   * Initialize the Space Explorer Logger
   * Sets up CSS styles and registers event listeners
   */
  init: function() {
    if (this.initialized) {
      console.log('SpaceExplorerLogger: Already initialized');
      return;
    }
    
    console.log('SpaceExplorerLogger: Initializing');
    
    // Inject CSS fixes
    this.injectCSS();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply fixes on a schedule
    this.scheduleFixApplication();
    
    this.initialized = true;
    console.log('SpaceExplorerLogger: Initialization complete');
  },
  
  /**
   * Inject CSS styles for space explorer layout fixes
   */
  injectCSS: function() {
    if (this.cssInjected) {
      return;
    }
    
    try {
      // Create a style element for our fixes
      const styleEl = document.createElement('style');
      styleEl.id = this.explorerId;
      
      // Add CSS that specifically targets the height difference issue
      styleEl.textContent = `
        /* Fix for vertical alignment of all spaces */
        .board-row {
          align-items: flex-start !important;
        }
        
        /* Force OWNER-SCOPE-INITIATION to align with other spaces */
        .space-type-setup {
          vertical-align: top !important;
          transform: translateY(0) !important;
        }
        
        /* Fix for any special top elements in spaces */
        .space-type-setup::before,
        .space-type-setup::after {
          position: absolute !important;
          top: 0 !important;
          height: 0 !important;
          margin-top: 0 !important;
          transform: translateY(0) !important;
        }
        
        /* Reset vertical alignment for all spaces */
        .board-space {
          vertical-align: top !important;
          align-self: flex-start !important;
          transform: translateY(0) !important;
        }
        
        /* Fix for any player tokens positioning */
        .player-tokens {
          position: absolute !important;
          bottom: 5px !important;
          left: 5px !important;
          transform: translateY(0) !important;
        }
        
        /* Fix for the red badge/tag in OWNER-SCOPE-INITIATION */
        .space-type-setup .dice-roll-indicator,
        .space-type-setup .badge {
          position: absolute !important;
          top: 0 !important;
          right: 0 !important;
          transform: translateY(0) !important;
          margin-top: 0 !important;
        }
        
        /* Make Space Explorer expand to fit content before scrolling */
        .space-explorer-container {
          height: auto !important;
          min-height: ${this.minExplorerHeight}px !important;
          max-height: none !important;
          overflow-y: visible !important;
        }
        
        /* Ensure the space explorer content displays fully */
        .space-explorer {
          height: auto !important;
          overflow-y: visible !important;
        }
        
        /* Fix table display in space explorer */
        .explorer-dice-table-container {
          width: 100% !important;
          overflow-x: hidden !important;
          margin-bottom: 16px !important;
        }
        
        .explorer-dice-table {
          width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
        }
        
        .explorer-dice-table thead {
          background-color: #4285f4 !important;
          color: white !important;
        }
        
        .explorer-dice-table th {
          text-align: left !important;
          padding: 8px 12px !important;
          font-weight: bold !important;
        }
        
        .explorer-dice-table tbody tr:nth-child(odd) {
          background-color: rgba(242, 242, 242, 0.6) !important;
        }
        
        .explorer-dice-table th:first-child,
        .explorer-dice-table td:first-child {
          width: 60px !important;
          text-align: center !important;
          font-weight: bold !important;
        }
        
        .explorer-dice-table th:last-child,
        .explorer-dice-table td:last-child {
          width: calc(100% - 60px) !important;
        }
        
        .explorer-dice-table td {
          padding: 8px 12px !important;
          vertical-align: top !important;
        }
        
        /* Fix for outcome display in dice table */
        .dice-outcome span {
          display: block !important;
          margin-bottom: 6px !important;
        }
        
        .dice-outcome span:last-child {
          margin-bottom: 0 !important;
        }
        
        /* Style for different outcome types */
        .outcome-move {
          color: #4285f4 !important;
          font-weight: bold !important;
        }
        
        .outcome-card {
          color: #34a853 !important;
        }
        
        .outcome-resource {
          color: #ea4335 !important;
        }
        
        /* Card display styles */
        .explorer-card-item {
          display: flex !important;
          align-items: center !important;
          margin-bottom: 8px !important;
          padding: 6px 10px !important;
          background-color: rgba(242, 242, 242, 0.5) !important;
          border-radius: 4px !important;
        }
        
        .card-type {
          display: inline-block !important;
          width: 24px !important;
          height: 24px !important;
          line-height: 24px !important;
          text-align: center !important;
          border-radius: 50% !important;
          color: white !important;
          font-weight: bold !important;
          margin-right: 8px !important;
        }
        
        .work-card {
          background-color: #4285f4 !important;
        }
        
        .business-card {
          background-color: #ea4335 !important;
        }
        
        .innovation-card {
          background-color: #fbbc05 !important;
        }
        
        .leadership-card {
          background-color: #34a853 !important;
        }
        
        .environment-card {
          background-color: #8e44ad !important;
        }
        
        /* Ensure all sections in space explorer have proper spacing */
        .explorer-section, 
        .explorer-dice-section,
        .explorer-cards-section,
        .explorer-resources-section {
          margin-bottom: 16px !important;
        }
        
        /* Improve heading styles */
        .explorer-title {
          margin: 0 0 8px 0 !important;
          color: #4285f4 !important;
        }
        
        .explorer-space-name {
          font-size: 18px !important;
          font-weight: bold !important;
          margin-bottom: 4px !important;
        }
        
        .explorer-visit-type {
          font-style: italic !important;
          color: #666 !important;
          margin-bottom: 12px !important;
        }
        
        /* Improve dice indicator */
        .explorer-dice-indicator {
          background-color: rgba(234, 67, 53, 0.1) !important;
          border-left: 3px solid #ea4335 !important;
          padding: 8px 12px !important;
          margin-bottom: 16px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .dice-icon {
          display: inline-block !important;
          width: 16px !important;
          height: 16px !important;
          background-color: #ea4335 !important;
          border-radius: 3px !important;
          margin-right: 8px !important;
        }
        
        /* Resource items */
        .explorer-resource-item {
          display: flex !important;
          justify-content: space-between !important;
          padding: 6px 10px !important;
          background-color: rgba(242, 242, 242, 0.5) !important;
          margin-bottom: 8px !important;
          border-radius: 4px !important;
        }
        
        .resource-label {
          font-weight: bold !important;
        }
      `;
      
      // Add the style element to the document head
      if (document.head) {
        document.head.appendChild(styleEl);
        console.log('SpaceExplorerLogger: CSS fixes injected');
        this.cssInjected = true;
      } else {
        console.log('SpaceExplorerLogger: Cannot inject CSS fixes, document.head not available');
      }
    } catch (error) {
      console.error('SpaceExplorerLogger: Error injecting CSS:', error.message);
    }
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
   * Apply all fixes at once
   */
  applyAllFixes: function() {
    this.setExplorerHeight();
    this.applyVerticalFixes();
    this.fixSpecialSpaces();
    this.fixDiceTables();
  },
  
  /**
   * Set the space explorer to auto height to accommodate all content
   */
  setExplorerHeight: function() {
    try {
      const spaceExplorerContainer = document.querySelector('.space-explorer-container');
      if (!spaceExplorerContainer) {
        console.log('SpaceExplorerLogger: Explorer container not found for height fix');
        return;
      }
      
      // Set height to auto to accommodate all content
      spaceExplorerContainer.style.height = 'auto';
      spaceExplorerContainer.style.minHeight = `${this.minExplorerHeight}px`;
      spaceExplorerContainer.style.maxHeight = 'none';
      spaceExplorerContainer.style.overflowY = 'visible';
      
      // Ensure proper display for content
      const spaceExplorer = spaceExplorerContainer.querySelector('.space-explorer');
      if (spaceExplorer) {
        spaceExplorer.style.height = 'auto';
        spaceExplorer.style.overflowY = 'visible';
      }
      
      if (!this.heightFixApplied) {
        console.log('SpaceExplorerLogger: Height set to auto to accommodate all content');
        this.heightFixApplied = true;
      }
    } catch (error) {
      console.error('SpaceExplorerLogger: Error setting explorer height:', error.message);
    }
  },
  
  /**
   * Fix dice table display in the space explorer
   */
  fixDiceTables: function() {
    try {
      const diceTables = document.querySelectorAll('.explorer-dice-table');
      if (diceTables.length === 0) {
        return;
      }
      
      diceTables.forEach(table => {
        // Set proper width for the table
        table.style.width = '100%';
        table.style.tableLayout = 'fixed';
        table.style.borderCollapse = 'collapse';
        
        // Style the header
        const thead = table.querySelector('thead');
        if (thead) {
          thead.style.backgroundColor = '#4285f4';
          thead.style.color = 'white';
          
          const ths = thead.querySelectorAll('th');
          ths.forEach(th => {
            th.style.textAlign = 'left';
            th.style.padding = '8px 12px';
            th.style.fontWeight = 'bold';
          });
        }
        
        // Style table rows
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
          if (index % 2 === 0) {
            row.style.backgroundColor = 'rgba(242, 242, 242, 0.6)';
          }
        });
        
        // Fix column widths
        const firstCells = table.querySelectorAll('th:first-child, td:first-child');
        const lastCells = table.querySelectorAll('th:last-child, td:last-child');
        
        firstCells.forEach(cell => {
          cell.style.width = '60px';
          cell.style.textAlign = 'center';
          cell.style.fontWeight = 'bold';
        });
        
        lastCells.forEach(cell => {
          cell.style.width = 'calc(100% - 60px)';
        });
        
        // Style all cells
        const allCells = table.querySelectorAll('td');
        allCells.forEach(cell => {
          cell.style.padding = '8px 12px';
          cell.style.verticalAlign = 'top';
        });
        
        // Fix outcome cell spacing
        const outcomeCells = table.querySelectorAll('.dice-outcome');
        outcomeCells.forEach(cell => {
          const spans = cell.querySelectorAll('span');
          spans.forEach(span => {
            span.style.display = 'block';
            span.style.marginBottom = '6px';
            
            // Apply outcome-specific styles
            if (span.classList.contains('outcome-move')) {
              span.style.color = '#4285f4';
              span.style.fontWeight = 'bold';
            } else if (span.classList.contains('outcome-card')) {
              span.style.color = '#34a853';
            } else if (span.classList.contains('outcome-resource')) {
              span.style.color = '#ea4335';
            }
          });
          
          // No margin on last span
          const lastSpan = cell.querySelector('span:last-child');
          if (lastSpan) {
            lastSpan.style.marginBottom = '0';
          }
        });
      });
      
      console.log(`SpaceExplorerLogger: Fixed layout for ${diceTables.length} dice tables`);
    } catch (error) {
      console.error('SpaceExplorerLogger: Error fixing dice tables:', error.message);
    }
  },
  
  /**
   * Apply vertical alignment fixes to all spaces
   */
  applyVerticalFixes: function() {
    try {
      // Find all spaces
      const spaces = document.querySelectorAll('.board-space');
      if (spaces.length === 0) {
        console.log('SpaceExplorerLogger: No spaces found for vertical fixes');
        return;
      }
      
      // Apply fixes to all spaces
      spaces.forEach(space => {
        space.style.verticalAlign = 'top';
        space.style.alignSelf = 'flex-start';
        space.style.transform = 'translateY(0)';
      });
      
      // Fix parent rows
      document.querySelectorAll('.board-row').forEach(row => {
        row.style.alignItems = 'flex-start';
      });
      
      if (!this.fixesApplied) {
        console.log(`SpaceExplorerLogger: Vertical fixes applied to ${spaces.length} spaces`);
        this.fixesApplied = true;
      }
    } catch (error) {
      console.error('SpaceExplorerLogger: Error applying vertical fixes:', error.message);
    }
  },
  
  /**
   * Fix special spaces like OWNER-SCOPE-INITIATION
   */
  fixSpecialSpaces: function() {
    try {
      // Fix special spaces with class .space-type-setup
      const setupSpaces = document.querySelectorAll('.space-type-setup');
      if (setupSpaces.length > 0) {
        setupSpaces.forEach(space => {
          space.style.position = 'relative';
          space.style.transform = 'translateY(0)';
          space.style.verticalAlign = 'top';
          space.style.alignSelf = 'flex-start';
        });
        console.log(`SpaceExplorerLogger: Fixed ${setupSpaces.length} setup spaces`);
      }
      
      // Fix OWNER-SCOPE-INITIATION space specifically by name
      const spaces = document.querySelectorAll('.board-space');
      const ownerScopeSpaces = Array.from(spaces).filter(space => {
        const nameElement = space.querySelector('.space-name');
        return nameElement && nameElement.textContent.includes('OWNER-SCOPE-INITIATION');
      });
      
      if (ownerScopeSpaces.length > 0) {
        ownerScopeSpaces.forEach(space => {
          // Force vertical alignment
          space.style.position = 'relative';
          space.style.top = '0';
          space.style.transform = 'translateY(0)';
          space.style.verticalAlign = 'top';
          space.style.alignSelf = 'flex-start';
          
          // Fix any badges or special elements
          const badges = space.querySelectorAll('.badge, .dice-roll-indicator');
          badges.forEach(badge => {
            badge.style.position = 'absolute';
            badge.style.top = '0';
            badge.style.transform = 'translateY(0)';
          });
        });
        console.log('SpaceExplorerLogger: Fixed OWNER-SCOPE-INITIATION spaces');
      }
      
      // Fix spaces with player tokens
      const spacesWithDots = document.querySelectorAll('.board-space .player-tokens');
      if (spacesWithDots.length > 0) {
        spacesWithDots.forEach(dotContainer => {
          dotContainer.style.position = 'absolute';
          dotContainer.style.bottom = '5px';
          dotContainer.style.left = '5px';
        });
        console.log(`SpaceExplorerLogger: Fixed ${spacesWithDots.length} spaces with player tokens`);
      }
    } catch (error) {
      console.error('SpaceExplorerLogger: Error fixing special spaces:', error.message);
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
        this.fixDiceTables(); // Explicitly fix dice tables when explorer is shown
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