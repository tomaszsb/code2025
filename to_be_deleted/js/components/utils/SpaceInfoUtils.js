// This file has been moved to /js/components/SpaceInfoUtils.js
// This is a placeholder to prevent 404 errors
// The application should be updated to use the file from its new location

console.log('WARNING: Using deprecated SpaceInfoUtils.js path. This file has been moved to /js/components/SpaceInfoUtils.js');

// Import the actual implementation from the new location
if (typeof window.SpaceInfoUtils === 'undefined') {
  console.error('ERROR: SpaceInfoUtils not found at the correct location. Application will likely fail.');
  
  // Minimal implementation to prevent crashes
  window.SpaceInfoUtils = {
    getPhaseClass: function() { 
      return 'space-phase-default'; 
    }
  };
}
