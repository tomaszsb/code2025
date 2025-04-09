// ui-inspector.js - UI Element Inspector Tool
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
  }
  
  // Create the inspector UI elements
  createInspectorUI() {
    // Create control panel
    const controlPanel = document.createElement('div');
    controlPanel.id = 'ui-inspector-controls';
    controlPanel.innerHTML = `
      <button id="ui-inspector-toggle">Toggle Inspector</button>
      <div id="ui-inspector-status">Inspector: OFF</div>
    `;
    
    // Style the control panel
    controlPanel.style.position = 'fixed';
    controlPanel.style.top = '10px';
    controlPanel.style.right = '10px';
    controlPanel.style.zIndex = '9999';
    controlPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    controlPanel.style.color = 'white';
    controlPanel.style.padding = '10px';
    controlPanel.style.borderRadius = '5px';
    controlPanel.style.fontFamily = 'Arial, sans-serif';
    controlPanel.style.fontSize = '14px';
    controlPanel.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    
    // Create overlay for displaying element info
    const overlay = document.createElement('div');
    overlay.id = 'ui-inspector-overlay';
    overlay.style.position = 'fixed';
    overlay.style.display = 'none';
    overlay.style.backgroundColor = 'rgba(52, 152, 219, 0.9)';
    overlay.style.color = 'white';
    overlay.style.padding = '8px 12px';
    overlay.style.borderRadius = '4px';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none';
    overlay.style.fontSize = '12px';
    overlay.style.fontFamily = 'monospace';
    overlay.style.maxWidth = '300px';
    overlay.style.wordBreak = 'break-word';
    overlay.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    
    // Create component label element
    this.createComponentLabel();
    
    // Add to DOM
    document.body.appendChild(controlPanel);
    document.body.appendChild(overlay);
    
    // Store reference to overlay
    this.overlay = overlay;
    
    // Add event listener for toggle button
    document.getElementById('ui-inspector-toggle').addEventListener('click', this.toggle);
    
    // Create CSS for highlighting elements
    this.createStyleTag();
  }
  
  // Create component label element
  createComponentLabel() {
    // Create component label if it doesn't exist
    if (!this.componentLabel) {
      const label = document.createElement('div');
      label.id = 'ui-inspector-component-label';
      label.className = 'ui-inspector-component-label';
      label.style.display = 'none';
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
    colorKey.style.display = 'none';
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
      /* Component label styling */
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
      
      /* Highlight for active element */
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
      .ui-inspector-active button,
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
      
      /* Add a key that shows the color coding */
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
  }
  
  // Update component label position and content
  updateComponentLabel(element, componentType) {
    if (!this.componentLabel) return;
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    // Determine the best position for the label (top, right, bottom, or left)
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
      statusEl.textContent = `Inspector: ${this.isActive ? 'ON' : 'OFF'}`;
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
  
  // Handle mouse over event
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
      
      // Position overlay near the element
      const rect = element.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Position overlay based on cursor position
      this.overlay.style.top = (event.clientY + 20) + 'px';
      this.overlay.style.left = (event.clientX + 20) + 'px';
      
      // Make sure overlay is visible
      this.overlay.style.display = 'block';
    }
  }
  
  // Handle mouse out event
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
  
  // Get element details
  getElementDetails(element) {
    // Get element tag name
    const tagName = element.tagName.toLowerCase();
    
    // Get class list as string
    const classList = Array.from(element.classList).join(' ');
    
    // Get ID if it exists
    const id = element.id || 'No ID';
    
    // Determine component type based on classes and HTML structure
    let componentType = 'Unknown Element';
    
    // Board spaces and related elements
    if (element.classList.contains('board-space')) {
      componentType = 'Board Space';
      
      // Check for space types
      if (element.classList.contains('space-type-setup')) {
        componentType = 'Setup Space';
      } else if (element.classList.contains('space-type-design')) {
        componentType = 'Design Space';
      } else if (element.classList.contains('space-type-funding')) {
        componentType = 'Funding Space';
      } else if (element.classList.contains('space-type-owner')) {
        componentType = 'Owner Space';
      } else if (element.classList.contains('space-type-regulatory')) {
        componentType = 'Regulatory Space';
      } else if (element.classList.contains('space-type-construction')) {
        componentType = 'Construction Space';
      } else if (element.classList.contains('space-type-end')) {
        componentType = 'End Space';
      }
    } 
    // Space elements
    else if (element.classList.contains('space-name')) {
      componentType = 'Space Name';
    } else if (element.classList.contains('visit-type')) {
      componentType = 'Visit Type';
    } else if (element.classList.contains('space-content')) {
      componentType = 'Space Content';
    } else if (element.classList.contains('player-tokens')) {
      componentType = 'Player Tokens Container';
    } else if (element.classList.contains('player-token')) {
      componentType = 'Player Token';
    } else if (element.classList.contains('move-indicator')) {
      componentType = 'Move Indicator';
    }
    // Explorer elements
    else if (element.classList.contains('space-explorer')) {
      componentType = 'Space Explorer';
    } else if (element.classList.contains('space-explorer-container')) {
      componentType = 'Space Explorer Container';
    } else if (element.classList.contains('explorer-header')) {
      componentType = 'Explorer Header';
    } else if (element.classList.contains('explorer-title')) {
      componentType = 'Explorer Title';
    } else if (element.classList.contains('explorer-space-name')) {
      componentType = 'Explorer Space Name';
    } else if (element.classList.contains('explorer-visit-type')) {
      componentType = 'Explorer Visit Type';
    } else if (element.classList.contains('explorer-section')) {
      componentType = 'Explorer Section';
    } else if (element.classList.contains('explorer-description')) {
      componentType = 'Explorer Description';
    } else if (element.classList.contains('explorer-action')) {
      componentType = 'Explorer Action';
    } else if (element.classList.contains('explorer-outcome')) {
      componentType = 'Explorer Outcome';
    }
    // Cards and dice
    else if (element.classList.contains('dice-roll-indicator')) {
      componentType = 'Dice Roll Indicator';
    } else if (element.classList.contains('dice-icon')) {
      componentType = 'Dice Icon';
    } else if (element.classList.contains('dice-outcomes-display')) {
      componentType = 'Dice Outcomes Display';
    } else if (element.classList.contains('dice-outcome-header')) {
      componentType = 'Dice Outcome Header';
    } else if (element.classList.contains('dice-result-badge')) {
      componentType = 'Dice Result Badge';
    } else if (element.classList.contains('outcome-category')) {
      componentType = 'Outcome Category';
    } else if (element.classList.contains('outcome-item')) {
      componentType = 'Outcome Item';
    } else if (element.classList.contains('card-display-container')) {
      componentType = 'Card Display Container';
    } else if (element.classList.contains('animated-card')) {
      componentType = 'Animated Card';
    } else if (element.classList.contains('card-animation-container')) {
      componentType = 'Card Animation Container';
    } else if (element.classList.contains('explorer-card-item')) {
      componentType = 'Explorer Card Item';
    }
    // Player panels
    else if (element.classList.contains('player-info')) {
      componentType = 'Player Info';
    } else if (element.classList.contains('space-info')) {
      componentType = 'Space Info';
    } else if (element.classList.contains('player-panel')) {
      componentType = 'Player Panel';
    } else if (element.classList.contains('space-info-container')) {
      componentType = 'Space Info Container';
    }
    // Board containers
    else if (element.classList.contains('game-board')) {
      componentType = 'Game Board';
    } else if (element.classList.contains('board-container')) {
      componentType = 'Board Container';
    } else if (element.classList.contains('board-row')) {
      componentType = 'Board Row';
    }
    // Layout containers
    else if (element.classList.contains('info-panels-container')) {
      componentType = 'Info Panels Container';
    } else if (element.classList.contains('board-and-explorer-container')) {
      componentType = 'Board and Explorer Container';
    } else if (element.classList.contains('main-content')) {
      componentType = 'Main Content';
    } else if (element.classList.contains('game-container')) {
      componentType = 'Game Container';
    } else if (element.classList.contains('game-header')) {
      componentType = 'Game Header';
    }
    // Controls
    else if (element.classList.contains('game-controls')) {
      componentType = 'Game Controls';
    } else if (element.classList.contains('turn-controls')) {
      componentType = 'Turn Controls';
    } else if (element.classList.contains('roll-dice-btn')) {
      componentType = 'Roll Dice Button';
    } else if (tagName === 'button') {
      componentType = 'Button';
      // Check for specific button types
      if (element.classList.contains('end-turn-btn')) {
        componentType = 'End Turn Button';
      } else if (element.classList.contains('instructions-btn')) {
        componentType = 'Instructions Button';
      } else if (element.classList.contains('toggle-cards-btn')) {
        componentType = 'Toggle Cards Button';
      }
    }
    
    // Get dimensions
    const rect = element.getBoundingClientRect();
    const dimensions = {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
    
    // Get element's path in the DOM for better context
    let domPath = '';
    let currentEl = element;
    let steps = 0;
    const maxSteps = 4; // Limit path depth
    
    while (currentEl && currentEl !== document.body && steps < maxSteps) {
      const elName = currentEl.tagName.toLowerCase();
      const elId = currentEl.id ? `#${currentEl.id}` : '';
      const elClass = currentEl.classList.length > 0 ? `.${currentEl.classList[0]}` : '';
      
      domPath = `${elName}${elId}${elClass} > ${domPath}`;
      currentEl = currentEl.parentElement;
      steps++;
    }
    
    domPath = domPath.slice(0, -3); // Remove trailing ' > '
    
    // Create HTML for overlay with enhanced information
    const infoHTML = `
      <div><strong>Component:</strong> ${componentType}</div>
      <div><strong>Tag:</strong> ${tagName}</div>
      ${id !== 'No ID' ? `<div><strong>ID:</strong> ${id}</div>` : ''}
      <div><strong>Size:</strong> ${dimensions.width}px × ${dimensions.height}px</div>
      <div><strong>Path:</strong> ${domPath}</div>
      ${classList ? `<div><strong>Classes:</strong> ${classList}</div>` : ''}
    `;
    
    return {
      element,
      tagName,
      classList,
      id,
      componentType,
      dimensions,
      infoHTML,
      domPath
    };
  }
  
  // Initialize the inspector
  init() {
    console.log('Initializing UI Inspector');
    this.createInspectorUI();
    
    // Create a map of UI components
    this.createUIMap();
    
    return this;
  }
  
  // Create a map of all UI components
  createUIMap() {
    // This runs when first initializing to gather all UI components
    console.log('Creating UI component map');
    
    // This method can be expanded to automatically create a structured map
    // of UI components by traversing the DOM
  }
  
  // Remove the inspector UI
  removeInspectorUI() {
    // Remove control panel
    const controlPanel = document.getElementById('ui-inspector-controls');
    if (controlPanel) {
      controlPanel.remove();
    }
    
    // Remove overlay
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    // Remove component label
    if (this.componentLabel) {
      this.componentLabel.remove();
      this.componentLabel = null;
    }
    
    // Remove color key
    if (this.colorKey) {
      this.colorKey.remove();
      this.colorKey = null;
    }
    
    // Remove style tag
    if (this.styleTag) {
      this.styleTag.remove();
      this.styleTag = null;
    }
    
    // Remove event listeners
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    
    // Remove active class from body
    document.body.classList.remove('ui-inspector-active');
    
    this.isActive = false;
    console.log('UI Inspector removed');
  }
}

// Create an auto-initialization function to run when script loads
window.addEventListener('load', function() {
  // Delay initialization to ensure React components are rendered
  setTimeout(function() {
    // Create and initialize the inspector
    window.uiInspector = new UIInspector().init();
    console.log('UI Inspector initialized after page load');
  }, 1000); // Wait 1 second after load to ensure React renders
});

console.log('ui-inspector.js code execution finished');
