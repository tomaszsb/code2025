// space-explorer-logger.js file is beginning to be used
console.log('space-explorer-logger.js file is beginning to be used');

// Create and inject CSS fixes for consistent space positioning
(function() {
  // Create a style element for our fixes
  const styleEl = document.createElement('style');
  styleEl.id = 'space-explorer-vertical-fixes';
  
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
    
    /* Make Space Explorer match the height of the 6 board rows */
    .space-explorer-container {
      height: 360px !important; /* 6 rows × 60px height per row */
      min-height: 360px !important;
      max-height: 360px !important;
      overflow-y: auto !important;
    }
    
    /* Ensure the space explorer content stays within bounds */
    .space-explorer {
      height: 100% !important;
      overflow-y: auto !important;
    }
  `;
  
  // Add the style element to the document head
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(styleEl);
      console.log('Space Explorer vertical alignment fixes applied');
    });
  } else {
    document.head.appendChild(styleEl);
    console.log('Space Explorer vertical alignment fixes applied');
  }
})();

// Add event listener to log when Space Explorer functionality is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Space Explorer component initialized with corrected layout');
  
  // Set the Space Explorer height to match the 6 board rows (60px × 6 = 360px)
  setTimeout(function() {
    const spaceExplorerContainer = document.querySelector('.space-explorer-container');
    if (spaceExplorerContainer) {
      spaceExplorerContainer.style.height = '360px';
      spaceExplorerContainer.style.minHeight = '360px';
      spaceExplorerContainer.style.maxHeight = '360px';
      console.log('Space Explorer height set to match exactly 6 board rows (360px)');
    }
  }, 200);
  
  // Handle the OWNER-SCOPE-INITIATION space decorations
  setTimeout(function() {
    // Find all spaces
    const spaces = document.querySelectorAll('.board-space');
    console.log('Found', spaces.length, 'spaces to align');
    
    // Check spaces for the special SETUP (OWNER-SCOPE-INITIATION) space
    const setupSpaces = document.querySelectorAll('.space-type-setup');
    console.log('Found', setupSpaces.length, 'SETUP spaces');
    
    // Check specifically for the first space by name
    spaces.forEach(function(space) {
      const nameElement = space.querySelector('.space-name');
      if (nameElement && nameElement.textContent.includes('OWNER-SCOPE-INITIATION')) {
        console.log('Found OWNER-SCOPE-INITIATION space, applying special fixes');
        
        // Fix vertical alignment by force
        space.style.position = 'relative';
        space.style.transform = 'translateY(0)';
        space.style.verticalAlign = 'top';
        space.style.alignSelf = 'flex-start';
        
        // Fix any parent row alignment
        const parentRow = space.closest('.board-row');
        if (parentRow) {
          parentRow.style.alignItems = 'flex-start';
        }
      }
    });
    
    // Apply alignment to all spaces with any colored borders
    document.querySelectorAll('.board-space[style*="border"]').forEach(function(space) {
      space.style.verticalAlign = 'top';
      space.style.alignSelf = 'flex-start';
    });
    
    console.log('Applied vertical alignment fixes to all spaces');
  }, 250); // Slightly longer timeout to ensure DOM is fully rendered
});

// Create a proper Space Explorer Logger module with vertical alignment fixes
window.SpaceExplorerLogger = {
  // Track if fixes have been applied
  fixesApplied: false,
  heightFixApplied: false,
  
  // Set the space explorer height to match exactly 6 board rows
  setExplorerHeight: function() {
    if (this.heightFixApplied) return;
    
    const spaceExplorerContainer = document.querySelector('.space-explorer-container');
    if (!spaceExplorerContainer) return;
    
    // Set height to match exactly 6 rows (60px per row)
    spaceExplorerContainer.style.height = '360px';
    spaceExplorerContainer.style.minHeight = '360px';
    spaceExplorerContainer.style.maxHeight = '360px';
    
    // Ensure proper scrolling for content
    const spaceExplorer = spaceExplorerContainer.querySelector('.space-explorer');
    if (spaceExplorer) {
      spaceExplorer.style.height = '100%';
      spaceExplorer.style.overflowY = 'auto';
    }
    
    this.heightFixApplied = true;
    console.log('Space Explorer height fixed to match 6 board rows exactly (360px)');
  },
  
  // Apply vertical alignment fixes
  applyVerticalFixes: function() {
    if (this.fixesApplied) return;
    
    // Find all spaces
    const spaces = document.querySelectorAll('.board-space');
    if (spaces.length === 0) return;
    
    // Apply fixes to all spaces
    spaces.forEach(function(space) {
      space.style.verticalAlign = 'top';
      space.style.alignSelf = 'flex-start';
      space.style.transform = 'translateY(0)';
    });
    
    // Fix parent rows
    document.querySelectorAll('.board-row').forEach(function(row) {
      row.style.alignItems = 'flex-start';
    });
    
    // Fix OWNER-SCOPE-INITIATION space specifically
    const ownerScopeSpaces = Array.from(spaces).filter(function(space) {
      const nameElement = space.querySelector('.space-name');
      return nameElement && nameElement.textContent.includes('OWNER-SCOPE-INITIATION');
    });
    
    if (ownerScopeSpaces.length > 0) {
      ownerScopeSpaces.forEach(function(space) {
        // Force vertical alignment
        space.style.position = 'relative';
        space.style.top = '0';
        space.style.transform = 'translateY(0)';
        space.style.verticalAlign = 'top';
        space.style.alignSelf = 'flex-start';
        
        // Fix any badges or special elements
        const badges = space.querySelectorAll('.badge, .dice-roll-indicator');
        badges.forEach(function(badge) {
          badge.style.position = 'absolute';
          badge.style.top = '0';
          badge.style.transform = 'translateY(0)';
        });
      });
    }
    
    this.fixesApplied = true;
    console.log('Vertical alignment fixes applied to all spaces');
  },
  
  // Log when the explorer is toggled
  logToggle: function(isVisible, spaceName) {
    if (isVisible) {
      console.log('Space Explorer shown for space:', spaceName);
      console.log('Game board width reduced to make room for Space Explorer');
    } else {
      console.log('Space Explorer hidden');
      console.log('Game board expanded to full width');
    }
    
    // Reapply vertical fixes and height fix after toggle
    setTimeout(() => {
      this.applyVerticalFixes();
      this.setExplorerHeight();
    }, 200);
  }
};

// Maintain backward compatibility
window.logSpaceExplorerToggle = function(isVisible, spaceName) {
  // Forward calls to the new module
  window.SpaceExplorerLogger.logToggle(isVisible, spaceName);
};

// Fix board spacing issues at runtime
(function() {
  // Run on page load and periodically to ensure fixes are applied
  const applyFixes = function() {
    // Fix Space Explorer height to match 6 board rows
    const spaceExplorerContainer = document.querySelector('.space-explorer-container');
    if (spaceExplorerContainer) {
      spaceExplorerContainer.style.height = '360px';
      spaceExplorerContainer.style.minHeight = '360px';
      spaceExplorerContainer.style.maxHeight = '360px';
      
      // Ensure proper scrolling for content
      const spaceExplorer = spaceExplorerContainer.querySelector('.space-explorer');
      if (spaceExplorer) {
        spaceExplorer.style.height = '100%';
        spaceExplorer.style.overflowY = 'auto';
      }
    }

    // Fix any red badges in OWNER-SCOPE-INITIATION that might be causing vertical offset
    const badges = document.querySelectorAll('.space-type-setup .badge, .space-type-setup .dice-roll-indicator');
    badges.forEach(function(badge) {
      badge.style.position = 'absolute';
      badge.style.top = '0';
      badge.style.right = '0';
      badge.style.transform = 'translateY(0)';
    });
    
    // Fix the actual OWNER-SCOPE-INITIATION space
    const setupSpaces = document.querySelectorAll('.space-type-setup');
    if (setupSpaces.length > 0) {
      setupSpaces.forEach(function(space) {
        space.style.transform = 'translateY(0)';
      });
    }
    
    // Fix spaces with colored dots
    const spacesWithDots = document.querySelectorAll('.board-space .player-tokens');
    if (spacesWithDots.length > 0) {
      spacesWithDots.forEach(function(dotContainer) {
        dotContainer.style.position = 'absolute';
        dotContainer.style.bottom = '5px';
        dotContainer.style.left = '5px';
      });
    }
  };
  
  // Apply fixes when DOM is loaded
  if (document.readyState !== 'loading') {
    setTimeout(applyFixes, 300);
    // Apply fixes again after a longer delay to catch any late rendering
    setTimeout(applyFixes, 1000);
    // And again after another delay to ensure space explorer height is fixed
    setTimeout(() => {
      if (window.SpaceExplorerLogger) {
        window.SpaceExplorerLogger.setExplorerHeight();
      }
    }, 1500);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(applyFixes, 300);
      // Apply fixes again after a longer delay
      setTimeout(applyFixes, 1000);
      // And again after another delay to ensure space explorer height is fixed
      setTimeout(() => {
        if (window.SpaceExplorerLogger) {
          window.SpaceExplorerLogger.setExplorerHeight();
        }
      }, 1500);
    });
  }
  
  // Periodically check and apply fixes for a short time after load
  let checkCount = 0;
  const intervalId = setInterval(function() {
    applyFixes();
    checkCount++;
    if (checkCount >= 5) {
      clearInterval(intervalId);
    }
  }, 1000);
})();

console.log('Space Explorer vertical alignment fixes ready');
console.log('Space Explorer height will be fixed to match exactly 6 board rows (360px)');
console.log('space-explorer-logger.js code execution finished');