// BoardStyleManager.js - Handles dynamic styling for the board
console.log('BoardStyleManager.js file is beginning to be used');

window.BoardStyleManager = {
  // Flag to track if styling has been applied
  stylingApplied: false,
  
  // Apply compact styling to make spaces smaller and reduce white space
  applyCompactBoardStyling: function() {
    // Check if styles have already been applied to prevent duplicates
    if (window.BoardStyleManager.stylingApplied) {
      console.log('BoardStyleManager: Compact styling already applied, skipping');
      return;
    }
    
    // Set flag to indicate styling has been applied
    window.BoardStyleManager.stylingApplied = true;
    // Create dynamic style element if it doesn't exist
    let styleEl = document.getElementById('compact-board-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'compact-board-style';
      document.head.appendChild(styleEl);
    }
    
    // Define compact styles for board elements
    styleEl.innerHTML = `
      .board-space {
        width: 80px !important; /* Reduced from 120px */
        height: 70px !important; /* Reduced from 100px */
        padding: 5px !important; /* Reduced padding */
        position: relative !important; /* Ensure position for connectors */
      }
      
      .game-board {
        gap: 6px !important; /* Reduced from 15px */
      }
      
      .board-row {
        gap: 6px !important; /* Reduced from 15px */
        justify-content: space-between !important; /* Distribute spaces across the width */
        width: 100% !important;
        position: relative !important; /* Ensure position for connectors */
      }
      
      /* Adjust positioning of elements inside spaces */
      .player-tokens {
        bottom: 3px !important;
        left: 3px !important;
      }
      
      .player-token {
        width: 14px !important;
        height: 14px !important;
      }
      
      /* Adjust the board container to take up more vertical space */
      .board-container {
        width: 98% !important;
        padding: 5px !important;
        margin: 0 auto !important;
        min-height: 500px !important;  /* Increased from 400px to 500px */
        height: auto !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important; /* Align to top */
      }
      
      .full-width-container {
        max-width: none !important;
        width: 98% !important;
      }
      
      /* Fix parent containers to reduce white space */
      .game-content, .main-content {
        margin: 0 !important;
        padding: 0 !important;
        min-height: unset !important;
        overflow: visible !important;
      }
      
      /* Adjust overall game container */
      .game-container {
        padding: 0 !important;
        height: auto !important;
        min-height: unset !important;
      }
      
      /* Adjust info panels to reduce vertical space */
      .info-panels-container {
        height: auto !important;
        min-height: unset !important;
        margin: 5px 0 !important;
      }
      
      /* Style the custom board layout */
      .game-board.custom-layout {
        display: flex !important;
        flex-direction: row !important;
        justify-content: flex-start !important; /* Changed from space-between to flex-start */
        gap: 0 !important; /* Changed from 20px to 0 to use explicit spacers */
        height: 100% !important;
      }
      
      /* Custom board layout spacers */
      .board-spacer {
        width: 80px !important; /* Exact width of a board space */
        height: 1px !important; /* Make height minimal */
        margin: 0 !important; /* No extra margin */
        padding: 0 !important; /* No padding */
        visibility: hidden !important; /* Make it invisible but keep the space */
        flex-shrink: 0 !important; /* Prevent shrinking */
      }
      
      .board-column-spacer {
        width: 80px !important; /* Exact width of one space */
        height: 100% !important;
        flex-shrink: 0 !important;
      }
      
      .main-board-area {
        display: flex !important;
        flex-direction: column !important;
        gap: 10px !important;
        flex: 5 !important;
      }
      
      .decision-column {
        display: flex !important;
        flex-direction: column !important;
        gap: 10px !important;
        flex: 1 !important;
        min-width: 120px !important;
        max-width: 150px !important;
      }
      
      .board-row {
        gap: 0 !important; /* Removed gap between spaces */
        justify-content: flex-start !important;
        flex-wrap: wrap !important;
      }
      
      /* Additional fixes for top and bottom white space */
      .game-header {
        padding: 5px 0 !important;
        margin: 0 !important;
      }
      
      /* Reduce space below the board */
      .current-space-container, .space-info-container {
        padding: 5px !important;
        margin: 5px 0 !important;
      }
      
      /* Adjust height of footer elements */
      .game-controls {
        padding: 5px 0 !important;
        margin: 5px 0 !important;
      }
      
      /* Remove margin from body */
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Make text smaller to fit in smaller spaces */
      .space-name {
        font-size: 10px !important;
        margin-bottom: 3px !important;
      }
      
      .visit-type {
        font-size: 8px !important;
      }
      
      /* Enhanced message for Space Explorer hint */
      .enhanced-info-message {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      .enhanced-info-message span:first-child {
        font-weight: bold !important;
        font-size: 12px !important;
        margin-bottom: 4px !important;
      }
      
      .explorer-hint {
        font-size: 9px !important;
        font-style: italic !important;
        color: rgba(255, 255, 255, 0.9) !important;
      }
      
      /* Style the static player status */
      .static-player-status {
        margin-bottom: 10px !important;
        max-height: 300px !important;
        overflow-y: auto !important;
      }
      
      /* Add flex layout to the info panels container */
      .info-panels-container {
        display: flex !important;
        flex-direction: row !important;
        gap: 10px !important;
        align-items: stretch !important; /* Make all columns stretch to the same height */
      }
      
      /* Split the space info and static player status */
      .current-space-container, 
      .player-static-status-container,
      .player-panel {
        display: flex !important;
        flex-direction: column !important;
        overflow-y: auto !important;
        background-color: white !important;
        border-radius: 8px !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Set column widths */
      .current-space-container {
        flex: 2 !important;
      }
      
      .player-static-status-container {
        width: 250px !important;
        min-width: 220px !important;
        max-width: 250px !important;
        flex: 1 !important;
      }
      
      .player-panel {
        width: 280px !important;
        min-width: 250px !important;
      }
      
      /* Remove unnecessary margins and padding */
      .main-content, .game-content, .board-container {
        margin: 5px !important;
      }
      
      /* Style for player control buttons in player panel */
      .player-control-buttons {
        display: flex !important;
        justify-content: space-between !important;
        margin-top: auto !important; /* Push to bottom */
        padding: 10px !important;
        border-top: 1px solid #eee !important;
        background-color: #f8f8f8 !important;
        border-radius: 0 0 8px 8px !important;
      }
      
      /* Make the player panel have a flexible layout */
      .player-panel {
        display: flex !important;
        flex-direction: column !important;
        min-height: 400px !important;
      }
      
      /* Style the buttons in the player panel */
      .player-control-buttons button {
        padding: 8px 15px !important;
        border-radius: 5px !important;
        border: none !important;
        cursor: pointer !important;
        font-weight: bold !important;
        transition: all 0.2s ease !important;
      }
      
      .player-control-buttons .end-turn-btn {
        background-color: #4CAF50 !important;
        color: white !important;
      }
      
      .player-control-buttons .negotiate-btn {
        background-color: #FFC107 !important;
        color: #333 !important;
      }
      
      .player-control-buttons button:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
      
      /* Style for the time display in the top right corner */
      .space-time-display {
        position: absolute !important;
        top: 5px !important;
        right: 5px !important;
        background-color: rgba(0, 0, 0, 0.7) !important;
        color: white !important;
        padding: 4px 8px !important;
        border-radius: 4px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        z-index: 10 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      
      .time-label {
        font-size: 9px !important;
        opacity: 0.8 !important;
      }
      
      .time-value {
        font-size: 12px !important;
      }
      
      /* Style the player turn indicator in the header */
      .player-turn-indicator {
        padding: 5px 15px !important;
        border-radius: 5px !important;
        color: white !important;
        font-weight: bold !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
      }
      
      /* Space explorer hint styling */
      .space-enhanced-info {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-color: rgba(0, 0, 0, 0.7) !important;
        border-radius: 8px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        padding: 5px !important;
        z-index: 15 !important;
        color: white !important;
        font-size: 11px !important;
        overflow: hidden !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
        pointer-events: none !important;
      }
      
      .space-enhanced-info.visible {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      
      .board-space:hover .space-enhanced-info {
        opacity: 1 !important;
      }
      
      .board-space.selected .space-enhanced-info {
        opacity: 1 !important;
      }
      
      /* Explorer hint text styling */
      .explorer-hint {
        color: rgba(255, 255, 255, 0.9) !important;
        font-weight: bold !important;
        background-color: rgba(0, 0, 0, 0.3) !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        margin-top: 2px !important;
      }
    `;
    
    console.log('BoardStyleManager: Applied compact styling to reduce white space');
  }
};

console.log('BoardStyleManager.js code execution finished');