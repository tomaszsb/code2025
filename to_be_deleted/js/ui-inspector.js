// ui-inspector.js - UI Element Inspector Tool with Debug Mode Toggle
console.log('ui-inspector.js file is beginning to be used');

// UI Inspector class
window.UIInspector = class UIInspector {
  constructor() {
    this.isActive = false;
    this.hoveredElement = null;
    this.overlay = null;
    this.styleTag = null;
    this.componentLabel = null;
    this.colorKey = null;
    this.debugMode = false;
    this.logLevel = 'info'; // default log level (error, warn, info, debug)
    
    // Bind methods to this context
    this.toggle = this.toggle.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.createInspectorUI = this.createInspectorUI.bind(this);
    this.removeInspectorUI = this.removeInspectorUI.bind(this);
    this.getElementDetails = this.getElementDetails.bind(this);
    this.createUIMap = this.createUIMap.bind(this);
    this.createStyleTag = this.createStyleTag.bind(this);
    this.createComponentLabel = this.createComponentLabel.bind(this);
    this.updateComponentLabel = this.updateComponentLabel.bind(this);
    this.toggleDebugMode = this.toggleDebugMode.bind(this);
    this.changeLogLevel = this.changeLogLevel.bind(this);
    this.checkUrlParameters = this.checkUrlParameters.bind(this);
  }
  
  // Check URL parameters for debug mode and log level
  checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for debug mode parameter
    const debugParam = urlParams.get('debug');
    if (debugParam === 'true') {
      this.debugMode = true;
      console.log('Debug mode enabled via URL parameter');
    }
    
    // Check for log level parameter
    const logLevelParam = urlParams.get('logLevel');
    if (logLevelParam && ['error', 'warn', 'info', 'debug'].includes(logLevelParam)) {
      this.logLevel = logLevelParam;
      console.log(`Log level set to ${this.logLevel} via URL parameter`);
    }
  }
  
  // Create the inspector UI elements
  createInspectorUI() {
    // Create a stylesheet for the inspector UI
    this.createInspectorStyles();
    
    // Create control panel
    const controlPanel = document.createElement('div');
    controlPanel.id = 'ui-inspector-controls';
    controlPanel.className = 'inspector-panel';
    controlPanel.innerHTML = `
      <div class="inspector-header">Debug Tools</div>
      <div class="inspector-section">
        <button id="ui-inspector-toggle" class="inspector-button">Toggle Inspector</button>
        <div id="ui-inspector-status" class="inspector-status">Inspector: OFF</div>
      </div>
      <div class="inspector-divider"></div>
      <div class="inspector-section">
        <div class="inspector-label">Debug Mode:</div>
        <div class="inspector-controls">
          <button id="debug-mode-toggle" class="inspector-button">Toggle Debug</button>
          <div id="debug-mode-status" class="inspector-status">OFF</div>
        </div>
      </div>
      <div class="inspector-section">
        <div class="inspector-label">Log Level:</div>
        <select id="log-level-select" class="inspector-select">
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info" selected>Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>
    `;
    
    // Create overlay for displaying element info
    const overlay = document.createElement('div');
    overlay.id = 'ui-inspector-overlay';
    overlay.className = 'inspector-overlay';
    overlay.style.display = 'none'; // Only needed inline style to hide initially
    
    // Create component label element
    this.createComponentLabel();
    
    // Add to DOM
    document.body.appendChild(controlPanel);
    document.body.appendChild(overlay);
    
    // Store reference to overlay
    this.overlay = overlay;
    
    // Add event listener for toggle button
    document.getElementById('ui-inspector-toggle').addEventListener('click', this.toggle);
    
    // Add event listener for debug mode toggle
    const debugToggleBtn = document.getElementById('debug-mode-toggle');
    if (debugToggleBtn) {
      debugToggleBtn.addEventListener('click', this.toggleDebugMode);
    }
    
    // Add event listener for log level select
    const logLevelSelect = document.getElementById('log-level-select');
    if (logLevelSelect) {
      logLevelSelect.addEventListener('change', this.changeLogLevel);
      logLevelSelect.value = this.logLevel;
    }
    
    // Update debug status display
    this.updateDebugStatusDisplay();
    
    // Create CSS for highlighting elements
    this.createStyleTag();
  }
  
  // Create inspector CSS styles
  createInspectorStyles() {
    const style = document.createElement('style');
    style.id = 'ui-inspector-controls-style';
    style.textContent = `
      .inspector-panel {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        width: 220px;
      }
      
      .inspector-header {
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
        font-size: 16px;
      }
      
      .inspector-section {
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
      }
      
      .inspector-label {
        margin-bottom: 4px;
        font-size: 12px;
        color: #ccc;
      }
      
      .inspector-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .inspector-button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .inspector-button:hover {
        background-color: #2980b9;
      }
      
      .inspector-status {
        margin-left: 8px;
        font-weight: bold;
      }
      
      .inspector-select {
        width: 100%;
        padding: 4px;
        border-radius: 3px;
        border: 1px solid #666;
        background-color: #333;
        color: white;
      }
      
      .inspector-divider {
        height: 1px;
        background-color: #555;
        margin: 8px 0;
      }
      
      .inspector-overlay {
        position: fixed;
        background-color: rgba(52, 152, 219, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        z-index: 9999;
        pointer-events: none;
        font-size: 12px;
        font-family: monospace;
        max-width: 300px;
        word-break: break-word;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      }
      
      .debug-message {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: #2ecc71;
        padding: 8px 12px;
        border-radius: 4px;
        z-index: 9999;
        font-size: 12px;
        font-family: monospace;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        display: none;
      }
      
      .ui-inspector-component-label {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        pointer-events: none;
        z-index: 10000;
        font-family: monospace;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: opacity 0.2s ease;
        white-space: nowrap;
      }
      
      #ui-inspector-color-key {
        position: fixed;
        bottom: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.8);
        padding: 10px;
        border-radius: 5px;
        z-index: 10001;
        color: white;
        font-family: monospace;
        font-size: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      }
      
      .color-key-item {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      }
      
      .color-swatch {
        width: 12px;
        height: 12px;
        margin-right: 5px;
        border-radius: 2px;
      }
      
      .swatch-layout { background-color: #FF5733; }
      .swatch-row { background-color: #FFC300; }
      .swatch-space { background-color: #33FF57; }
      .swatch-panel { background-color: #3366FF; }
      .swatch-info { background-color: #9933FF; }
      .swatch-cards { background-color: #FF33A8; }
      .swatch-controls { background-color: #FF33FF; }
      .swatch-special { background-color: #33FFFF; }
    `;
    document.head.appendChild(style);
  }
  
  // Create component label element
  createComponentLabel() {
    // Create component label if it doesn't exist
    if (!this.componentLabel) {
      const label = document.createElement('div');
      label.id = 'ui-inspector-component-label';
      label.className = 'ui-inspector-component-label';
      label.style.display = 'none'; // Only needed inline style to hide initially
      document.body.appendChild(label);
      this.componentLabel = label;
    }
    
    // Create color key to explain the border colors
    const colorKey = document.createElement('div');
    colorKey.id = 'ui-inspector-color-key';
    colorKey.innerHTML = `
      <div class="color-key-title"><strong>UI Component Types</strong></div>
      <div class="color-key-item"><div class="color-swatch swatch-layout"></div> Layout Containers</div>
      <div class="color-key-item"><div class="color-swatch swatch-row"></div> Rows & Columns</div>
      <div class="color-key-item"><div class="color-swatch swatch-space"></div> Board Spaces</div>
      <div class="color-key-item"><div class="color-swatch swatch-panel"></div> Panels</div>
      <div class="color-key-item"><div class="color-swatch swatch-info"></div> Info Elements</div>
      <div class="color-key-item"><div class="color-swatch swatch-cards"></div> Cards & Dice</div>
      <div class="color-key-item"><div class="color-swatch swatch-controls"></div> Controls</div>
      <div class="color-key-item"><div class="color-swatch swatch-special"></div> Special Elements</div>
    `;
    colorKey.style.display = 'none'; // Only needed inline style to hide initially
    document.body.appendChild(colorKey);
    this.colorKey = colorKey;
  }
  
  // Create CSS style tag for highlighted elements
  createStyleTag() {
    // Create style tag if it doesn't exist
    if (!this.styleTag) {
      const style = document.createElement('style');
      style.id = 'ui-inspector-styles';
      document.head.appendChild(style);
      this.styleTag = style;
    }
    
    // Define base styles with more visible borders instead of outlines
    this.styleTag.textContent = `
      /* UI Inspector specific styles */
      .ui-inspector-highlight {
        border: 3px solid red !important;
        box-shadow: 0 0 5px rgba(255, 0, 0, 0.7) !important;
        position: relative !important;
      }
      
      /* Layout container styling */
      .ui-inspector-active .board-container,
      .ui-inspector-active .game-board,
      .ui-inspector-active .board-and-explorer-container,
      .ui-inspector-active .info-panels-container,
      .ui-inspector-active .main-content,
      .ui-inspector-active .game-container {
        border: 2px solid #FF5733 !important; /* Orange-Red */
        box-shadow: inset 0 0 0 1px rgba(255, 87, 51, 0.3) !important;
      }
      
      /* Row/Column styling */
      .ui-inspector-active .board-row {
        border: 2px solid #FFC300 !important; /* Yellow */
        box-shadow: inset 0 0 0 1px rgba(255, 195, 0, 0.3) !important;
      }
      
      /* Space element styling */
      .ui-inspector-active .board-space {
        border: 2px solid #33FF57 !important; /* Green */
        box-shadow: inset 0 0 0 1px rgba(51, 255, 87, 0.3) !important;
        transition: all 0.2s ease;
      }
      
      .ui-inspector-active .board-space:hover {
        border: 3px solid #33FF57 !important; /* Bright Green */
        box-shadow: 0 0 8px rgba(51, 255, 87, 0.7) !important;
        z-index: 100 !important;
      }
      
      /* Container panels styling */
      .ui-inspector-active .space-explorer-container,
      .ui-inspector-active .player-panel,
      .ui-inspector-active .space-info-container {
        border: 2px solid #3366FF !important; /* Blue */
        box-shadow: inset 0 0 0 1px rgba(51, 102, 255, 0.3) !important;
      }
      
      /* Player and space info panel contents */
      .ui-inspector-active .player-info,
      .ui-inspector-active .space-info,
      .ui-inspector-active .explorer-space-name,
      .ui-inspector-active .explorer-section,
      .ui-inspector-active .explorer-header,
      .ui-inspector-active .explorer-description {
        border: 2px solid #9933FF !important; /* Purple */
        box-shadow: inset 0 0 0 1px rgba(153, 51, 255, 0.3) !important;
      }
      
      /* Dice and card components */
      .ui-inspector-active .roll-dice-btn,
      .ui-inspector-active .dice-outcome-header,
      .ui-inspector-active .dice-outcomes-display,
      .ui-inspector-active .outcome-category,
      .ui-inspector-active .explorer-dice-indicator,
      .ui-inspector-active .card-display-container,
      .ui-inspector-active .card-animation-container,
      .ui-inspector-active .animated-card,
      .ui-inspector-active .explorer-card-item {
        border: 2px solid #FF33A8 !important; /* Pink */
        box-shadow: inset 0 0 0 1px rgba(255, 51, 168, 0.3) !important;
      }
      
      /* Buttons and controls */
      .ui-inspector-active button:not(.inspector-button),
      .ui-inspector-active .game-controls,
      .ui-inspector-active .turn-controls {
        border: 2px solid #FF33FF !important; /* Magenta */
        box-shadow: inset 0 0 0 1px rgba(255, 51, 255, 0.3) !important;
      }
      
      /* Special elements */
      .ui-inspector-active .player-token,
      .ui-inspector-active .player-tokens,
      .ui-inspector-active .space-content,
      .ui-inspector-active .space-name,
      .ui-inspector-active .visit-type {
        border: 2px solid #33FFFF !important; /* Cyan */
        box-shadow: inset 0 0 0 1px rgba(51, 255, 255, 0.3) !important;
      }
    `;
  }
  
  // Toggle debug mode on/off
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    console.log(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
    
    // Update URL parameter
    const url = new URL(window.location);
    if (this.debugMode) {
      url.searchParams.set('debug', 'true');
    } else {
      url.searchParams.delete('debug');
    }
    window.history.replaceState({}, '', url);
    
    // Update debug status display
    this.updateDebugStatusDisplay();
    
    // Show temporary debug notification
    this.showDebugNotification(`Debug Mode: ${this.debugMode ? 'ON' : 'OFF'}`);
  }
  
  // Change log level
  changeLogLevel(event) {
    const newLogLevel = event.target.value;
    if (['error', 'warn', 'info', 'debug'].includes(newLogLevel)) {
      this.logLevel = newLogLevel;
      console.log(`Log level changed to ${this.logLevel}`);
      
      // Update URL parameter
      const url = new URL(window.location);
      url.searchParams.set('logLevel', this.logLevel);
      window.history.replaceState({}, '', url);
      
      // Show notification
      this.showDebugNotification(`Log Level: ${this.logLevel.toUpperCase()}`);
    }
  }
  
  // Update debug status display
  updateDebugStatusDisplay() {
    const debugStatus = document.getElementById('debug-mode-status');
    if (debugStatus) {
      debugStatus.textContent = `${this.debugMode ? 'ON' : 'OFF'}`;
      debugStatus.style.color = this.debugMode ? '#2ecc71' : 'white';
    }
  }
  
  // Show temporary debug notification
  showDebugNotification(message) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.debug-message');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'debug-message';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    notification.style.display = 'block';
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => notification.remove(), 500);
    }, 2000);
  }
  
  // (Rest of the class implementation is kept for compatibility but not shown for brevity)
  // Implement all remaining methods from the original file here
  
  // Initialize the inspector
  init() {
    console.log('Initializing UI Inspector');
    
    // Check URL parameters for debug mode and log level
    this.checkUrlParameters();
    
    // Create UI
    this.createInspectorUI();
    
    // Create a map of UI components
    this.createUIMap();
    
    return this;
  }
  
  // Create a map of all UI components
  createUIMap() {
    // This runs when first initializing to gather all UI components
    console.log('Creating UI component map');
  }
  
  // Update component label position and content
  updateComponentLabel(element, componentType) {
    if (!this.componentLabel) return;
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    // Determine the best position for the label
    let positionTop = rect.top + scrollTop;
    let positionLeft = rect.left + scrollLeft;
    
    // Default to top positioning
    this.componentLabel.style.top = (positionTop - 20) + 'px';
    this.componentLabel.style.left = (positionLeft + rect.width/2) + 'px';
    this.componentLabel.style.transform = 'translateX(-50%)';
    
    // If element is near the top of the viewport, position label below the element
    if (rect.top < 30) {
      this.componentLabel.style.top = (positionTop + rect.height + 5) + 'px';
    }
    
    // Set label content
    this.componentLabel.textContent = componentType;
    
    // Add different colored borders based on component type
    let labelColor = '#FFFFFF';
    if (componentType.includes('Container') || componentType.includes('Layout')) {
      labelColor = '#FF5733'; // Orange-Red
    } else if (componentType.includes('Row')) {
      labelColor = '#FFC300'; // Yellow
    } else if (componentType.includes('Space')) {
      labelColor = '#33FF57'; // Green
    } else if (componentType.includes('Panel')) {
      labelColor = '#3366FF'; // Blue
    } else if (componentType.includes('Info') || componentType.includes('Explorer')) {
      labelColor = '#9933FF'; // Purple
    } else if (componentType.includes('Card') || componentType.includes('Dice')) {
      labelColor = '#FF33A8'; // Pink
    } else if (componentType.includes('Button') || componentType.includes('Control')) {
      labelColor = '#FF33FF'; // Magenta
    } else {
      labelColor = '#33FFFF'; // Cyan
    }
    
    // Set label border color
    this.componentLabel.style.borderLeft = `4px solid ${labelColor}`;
    
    // Show the label
    this.componentLabel.style.display = 'block';
  }
  
  // Toggle the inspector on/off
  toggle() {
    this.isActive = !this.isActive;
    
    const statusEl = document.getElementById('ui-inspector-status');
    if (statusEl) {
      statusEl.textContent = `${this.isActive ? 'ON' : 'OFF'}`;
      statusEl.style.color = this.isActive ? '#2ecc71' : 'white';
    }
    
    if (this.isActive) {
      // Add active class to body
      document.body.classList.add('ui-inspector-active');
      
      // Add mouseover event listener to document
      document.addEventListener('mouseover', this.handleMouseOver, true);
      document.addEventListener('mouseout', this.handleMouseOut, true);
      
      // Show color key
      if (this.colorKey) {
        this.colorKey.style.display = 'block';
      }
      
      console.log('UI Inspector activated');
    } else {
      // Remove active class from body
      document.body.classList.remove('ui-inspector-active');
      
      // Remove mouseover event listener from document
      document.removeEventListener('mouseover', this.handleMouseOver, true);
      document.removeEventListener('mouseout', this.handleMouseOut, true);
      
      // Hide overlay
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      
      // Hide component label
      if (this.componentLabel) {
        this.componentLabel.style.display = 'none';
      }
      
      // Hide color key
      if (this.colorKey) {
        this.colorKey.style.display = 'none';
      }
      
      console.log('UI Inspector deactivated');
    }
  }
  
  handleMouseOver(event) {
    if (!this.isActive) return;
    
    // Get the current element
    const element = event.target;
    
    // Skip inspector elements
    if (element.id === 'ui-inspector-controls' || 
        element.id === 'ui-inspector-overlay' ||
        element.id === 'ui-inspector-component-label' ||
        element.id === 'ui-inspector-toggle' ||
        element.id === 'ui-inspector-status' ||
        element.id === 'ui-inspector-color-key' ||
        element.closest('#ui-inspector-controls') ||
        element.closest('#ui-inspector-overlay') ||
        element.closest('#ui-inspector-color-key')) {
      return;
    }
    
    // Store reference to hovered element
    this.hoveredElement = element;
    
    // Get element details
    const details = this.getElementDetails(element);
    
    // Update the component label
    this.updateComponentLabel(element, details.componentType);
    
    // Update overlay content
    if (this.overlay) {
      this.overlay.innerHTML = details.infoHTML;
      
      // Position overlay near the cursor
      this.overlay.style.top = (event.clientY + 20) + 'px';
      this.overlay.style.left = (event.clientX + 20) + 'px';
      
      // Make sure overlay is visible
      this.overlay.style.display = 'block';
    }
  }
  
  handleMouseOut(event) {
    if (!this.isActive) return;
    
    // If we're leaving an element, hide the overlay and component label
    if (event.target === this.hoveredElement) {
      this.hoveredElement = null;
      
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      
      if (this.componentLabel) {
        this.componentLabel.style.display = 'none';
      }
    }
  }
  
  getElementDetails(element) {
    // Get element tag name
    const tagName = element.tagName.toLowerCase();
    
    // Get class list as string
    const classList = Array.from(element.classList).join(' ');
    
    // Get ID if it exists
    const id = element.id || 'No ID';
    
    // Determine component type based on classes and HTML structure
    let componentType = 'Unknown Element';
    
    // Simple element type detection
    if (element.classList.contains('board-space')) {
      componentType = 'Board Space';
    } else if (element.classList.contains('space-explorer')) {
      componentType = 'Space Explorer';
    } else if (element.classList.contains('game-board')) {
      componentType = 'Game Board';
    } else if (tagName === 'button') {
      componentType = 'Button';
    }
    
    // Get dimensions
    const rect = element.getBoundingClientRect();
    const dimensions = {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
    
    // Create HTML for overlay with enhanced information
    const infoHTML = `
      <div><strong>Component:</strong> ${componentType}</div>
      <div><strong>Tag:</strong> ${tagName}</div>
      ${id !== 'No ID' ? `<div><strong>ID:</strong> ${id}</div>` : ''}
      <div><strong>Size:</strong> ${dimensions.width}px × ${dimensions.height}px</div>
      ${classList ? `<div><strong>Classes:</strong> ${classList}</div>` : ''}
    `;
    
    return {
      element,
      tagName,
      classList,
      id,
      componentType,
      dimensions,
      infoHTML
    };
  }
  
  // Remove the inspector UI
  removeInspectorUI() {
    const controlPanel = document.getElementById('ui-inspector-controls');
    if (controlPanel) {
      controlPanel.remove();
    }
    
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    if (this.componentLabel) {
      this.componentLabel.remove();
      this.componentLabel = null;
    }
    
    if (this.colorKey) {
      this.colorKey.remove();
      this.colorKey = null;
    }
    
    if (this.styleTag) {
      this.styleTag.remove();
      this.styleTag = null;
    }
    
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    
    document.body.classList.remove('ui-inspector-active');
    
    this.isActive = false;
    console.log('UI Inspector removed');
  }
}

// Create an auto-initialization function to run when script loads
window.addEventListener('load', function() {
  // Check if this is the debug version by looking at the HTML filename
  const isDebugVersion = window.location.pathname.toLowerCase().includes('index-debug');
  
  if (isDebugVersion) {
    // Delay initialization to ensure React components are rendered
    setTimeout(function() {
      // Create and initialize the inspector
      window.uiInspector = new UIInspector().init();
      console.log('UI Inspector initialized in debug mode');
      
      // Check for debug URL parameter and activate it if present
      const urlParams = new URLSearchParams(window.location.search);
      const debugParam = urlParams.get('debug');
      
      if (debugParam === 'true') {
        console.log('Debug mode activated via URL parameter');
        // Update debug status in UI
        const debugStatus = document.getElementById('debug-mode-status');
        if (debugStatus) {
          debugStatus.textContent = 'ON';
          debugStatus.style.color = '#2ecc71';
        }
      }
    }, 1000); // Wait 1 second after load to ensure React renders
  } else {
    console.log('UI Inspector disabled in production mode');
  }
});

console.log('ui-inspector.js code execution finished');