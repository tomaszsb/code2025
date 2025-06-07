// TooltipSystem.js - Context-sensitive tooltip system for enhanced user experience
console.log('TooltipSystem.js file is beginning to be used');

// Advanced tooltip system with context-aware help
window.TooltipSystem = {
  // Track active tooltips and configurations
  activeTooltips: new Map(),
  tooltipConfig: new Map(),
  defaultConfig: {
    delay: 800,
    hideDelay: 200,
    position: 'auto',
    maxWidth: 300,
    theme: 'dark',
    animation: 'fade',
    interactive: false,
    hideOnClick: true
  },
  
  // Initialize the tooltip system
  init: function() {
    console.log('TooltipSystem: Initializing tooltip system');
    
    // Create tooltip container
    this.createTooltipContainer();
    
    // Add global event listeners
    this.initializeEventListeners();
    
    // Load game-specific tooltip configurations
    this.loadGameTooltips();
    
    console.log('TooltipSystem: System initialized');
  },
  
  // Create tooltip container element
  createTooltipContainer: function() {
    if (!document.querySelector('.tooltip-container')) {
      const container = document.createElement('div');
      container.className = 'tooltip-container';
      document.body.appendChild(container);
    }
  },
  
  // Initialize event listeners for automatic tooltip handling
  initializeEventListeners: function() {
    // Mouse events for tooltip showing/hiding
    document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
    document.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
    
    // Click events for hiding tooltips
    document.addEventListener('click', this.handleClick.bind(this), true);
    
    // Keyboard events for accessibility
    document.addEventListener('keydown', this.handleKeydown.bind(this), true);
    document.addEventListener('focusin', this.handleFocusIn.bind(this), true);
    document.addEventListener('focusout', this.handleFocusOut.bind(this), true);
    
    // Window resize for tooltip repositioning
    window.addEventListener('resize', this.handleResize.bind(this));
    
    console.log('TooltipSystem: Event listeners initialized');
  },
  
  // Load game-specific tooltip configurations
  loadGameTooltips: function() {
    // Card type tooltips
    this.register('.card-type-w', {
      title: 'Work Type Card',
      content: 'Represents scope and commitments in your project. Use to define project requirements and track progress.',
      delay: 500
    });
    
    this.register('.card-type-b', {
      title: 'Bank Card',
      content: 'Provides funding for your project. Play to add money to your resources.',
      delay: 500
    });
    
    this.register('.card-type-i', {
      title: 'Investor Card',
      content: 'External investment opportunities. Can provide large amounts of funding with potential conditions.',
      delay: 500
    });
    
    this.register('.card-type-l', {
      title: 'Life Card',
      content: 'Represents work-life balance factors. Can affect time and project efficiency.',
      delay: 500
    });
    
    this.register('.card-type-e', {
      title: 'Expeditor Card',
      content: 'Accelerates project progress. Can speed up processes and bypass certain requirements.',
      delay: 500
    });
    
    // Space type tooltips
    this.register('.space-type-setup', {
      title: 'Setup Phase',
      content: 'Initial project setup and planning activities. Foundation for your project success.',
      delay: 600
    });
    
    this.register('.space-type-funding', {
      title: 'Funding Phase',
      content: 'Secure financial resources for your project. Critical for project viability.',
      delay: 600
    });
    
    this.register('.space-type-design', {
      title: 'Design Phase',
      content: 'Architectural and engineering design work. Defines project specifications.',
      delay: 600
    });
    
    this.register('.space-type-regulatory', {
      title: 'Regulatory Phase',
      content: 'Government approvals and regulatory compliance. Required for legal project execution.',
      delay: 600
    });
    
    this.register('.space-type-construction', {
      title: 'Construction Phase',
      content: 'Physical project implementation. The final execution of your plans.',
      delay: 600
    });
    
    // Combo indicator tooltips
    this.register('.combo-indicator.finance', {
      title: 'Finance Combo Available',
      content: 'Bank + Investor synergy detected! Play these cards together for enhanced financial benefits (+$75,000).',
      delay: 300,
      theme: 'success'
    });
    
    this.register('.combo-indicator.work-life', {
      title: 'Work-Life Balance Combo',
      content: 'Work + Life synergy available! Achieve balanced approach bonus (+$25,000 and +2 time).',
      delay: 300,
      theme: 'success'
    });
    
    this.register('.combo-indicator.spectrum', {
      title: 'Project Mastery Combo',
      content: 'All card types present! Ultimate project mastery bonus (+$200,000 and +5 time).',
      delay: 300,
      theme: 'success'
    });
    
    // Game action tooltips
    this.register('.end-turn-btn', {
      title: 'End Turn',
      content: 'Complete your current turn and pass control to the next player. Make sure you\'ve made your move!',
      delay: 1000
    });
    
    this.register('.roll-dice-btn', {
      title: 'Roll Dice',
      content: 'Roll dice to determine movement options or resolve space effects. Some spaces require dice rolls.',
      delay: 800
    });
    
    // Available move tooltips
    this.register('.available-move', {
      title: 'Available Move',
      content: 'Click to select this space as your movement destination. Green highlighting indicates valid moves.',
      delay: 400,
      theme: 'info'
    });
    
    // Selected move tooltips
    this.register('.selected-move', {
      title: 'Selected Destination',
      content: 'This is your chosen destination. Click "End Turn" to move here, or select a different space to change your choice.',
      delay: 300,
      theme: 'warning'
    });
    
    // Progress indicators
    this.register('.progress-indicator', {
      title: 'Progress Indicator',
      content: 'Shows your advancement through the current phase. Fill the bar to advance to the next stage.',
      delay: 700
    });
    
    console.log('TooltipSystem: Game tooltips loaded');
  },
  
  // Register tooltip for specific selector
  register: function(selector, config) {
    const mergedConfig = { ...this.defaultConfig, ...config };
    this.tooltipConfig.set(selector, mergedConfig);
  },
  
  // Handle mouse enter events
  handleMouseEnter: function(event) {
    const element = event.target;
    const config = this.findTooltipConfig(element);
    
    if (config) {
      this.scheduleTooltipShow(element, config);
    }
  },
  
  // Handle mouse leave events
  handleMouseLeave: function(event) {
    const element = event.target;
    this.scheduleTooltipHide(element);
  },
  
  // Handle mouse move for dynamic positioning
  handleMouseMove: function(event) {
    const activeTooltip = this.getActiveTooltipForElement(event.target);
    if (activeTooltip && activeTooltip.config.position === 'follow') {
      this.updateTooltipPosition(activeTooltip.tooltip, event.clientX, event.clientY);
    }
  },
  
  // Handle click events
  handleClick: function(event) {
    // Hide tooltips when clicking outside or on elements with hideOnClick
    if (event.target.closest('.tooltip')) return; // Don't hide if clicking on tooltip itself
    
    const element = event.target;
    const config = this.findTooltipConfig(element);
    
    if (config && config.hideOnClick) {
      this.hideTooltip(element);
    }
  },
  
  // Handle keyboard events for accessibility
  handleKeydown: function(event) {
    if (event.key === 'Escape') {
      this.hideAllTooltips();
    }
  },
  
  // Handle focus events for accessibility
  handleFocusIn: function(event) {
    const element = event.target;
    const config = this.findTooltipConfig(element);
    
    if (config) {
      this.showTooltip(element, config);
    }
  },
  
  // Handle focus out events
  handleFocusOut: function(event) {
    const element = event.target;
    this.hideTooltip(element);
  },
  
  // Handle window resize
  handleResize: function() {
    // Reposition all active tooltips
    this.activeTooltips.forEach(tooltipData => {
      this.positionTooltip(tooltipData.tooltip, tooltipData.element, tooltipData.config);
    });
  },
  
  // Find tooltip configuration for element
  findTooltipConfig: function(element) {
    for (let [selector, config] of this.tooltipConfig) {
      if (element.matches(selector) || element.closest(selector)) {
        return config;
      }
    }
    
    // Check for data attributes
    if (element.hasAttribute('data-tooltip')) {
      return {
        ...this.defaultConfig,
        content: element.getAttribute('data-tooltip'),
        title: element.getAttribute('data-tooltip-title') || null
      };
    }
    
    // Check for title attribute (native tooltip)
    if (element.hasAttribute('title')) {
      const title = element.getAttribute('title');
      element.removeAttribute('title'); // Prevent native tooltip
      element.setAttribute('data-original-title', title);
      
      return {
        ...this.defaultConfig,
        content: title
      };
    }
    
    return null;
  },
  
  // Schedule tooltip show with delay
  scheduleTooltipShow: function(element, config) {
    // Clear any existing hide timer
    this.clearTooltipTimer(element);
    
    // Set show timer
    const timer = setTimeout(() => {
      this.showTooltip(element, config);
    }, config.delay || this.defaultConfig.delay);
    
    this.setTooltipTimer(element, timer);
  },
  
  // Schedule tooltip hide with delay
  scheduleTooltipHide: function(element) {
    const tooltipData = this.activeTooltips.get(element);
    if (!tooltipData) return;
    
    // Clear any existing timer
    this.clearTooltipTimer(element);
    
    // Set hide timer
    const timer = setTimeout(() => {
      this.hideTooltip(element);
    }, tooltipData.config.hideDelay || this.defaultConfig.hideDelay);
    
    this.setTooltipTimer(element, timer);
  },
  
  // Show tooltip for element
  showTooltip: function(element, config) {
    // Don't show if already visible
    if (this.activeTooltips.has(element)) return;
    
    // Create tooltip element
    const tooltip = this.createTooltipElement(config);
    
    // Add to container
    const container = document.querySelector('.tooltip-container');
    container.appendChild(tooltip);
    
    // Position tooltip
    this.positionTooltip(tooltip, element, config);
    
    // Show with animation
    setTimeout(() => {
      tooltip.classList.add('show');
    }, 10);
    
    // Store reference
    this.activeTooltips.set(element, {
      tooltip,
      config,
      element
    });
    
    console.log('TooltipSystem: Showed tooltip for element');
  },
  
  // Hide tooltip for element
  hideTooltip: function(element) {
    const tooltipData = this.activeTooltips.get(element);
    if (!tooltipData) return;
    
    // Clear timer
    this.clearTooltipTimer(element);
    
    // Hide with animation
    tooltipData.tooltip.classList.remove('show');
    
    // Remove after animation
    setTimeout(() => {
      if (tooltipData.tooltip.parentNode) {
        tooltipData.tooltip.parentNode.removeChild(tooltipData.tooltip);
      }
    }, 300);
    
    // Remove reference
    this.activeTooltips.delete(element);
    
    console.log('TooltipSystem: Hidden tooltip for element');
  },
  
  // Create tooltip DOM element
  createTooltipElement: function(config) {
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${config.theme || this.defaultConfig.theme}`;
    
    if (config.maxWidth) {
      tooltip.style.maxWidth = config.maxWidth + 'px';
    }
    
    let html = '';
    
    if (config.title) {
      html += `<div class="tooltip-title">${config.title}</div>`;
    }
    
    if (config.content) {
      html += `<div class="tooltip-content">${config.content}</div>`;
    }
    
    tooltip.innerHTML = html;
    
    return tooltip;
  },
  
  // Position tooltip relative to element
  positionTooltip: function(tooltip, element, config) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let position = config.position || this.defaultConfig.position;
    
    // Auto-determine position if needed
    if (position === 'auto') {
      position = this.determineOptimalPosition(rect, tooltipRect, viewportWidth, viewportHeight);
    }
    
    let top, left;
    
    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        tooltip.classList.add('tooltip-top');
        break;
        
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        tooltip.classList.add('tooltip-bottom');
        break;
        
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - 8;
        tooltip.classList.add('tooltip-left');
        break;
        
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + 8;
        tooltip.classList.add('tooltip-right');
        break;
        
      default: // bottom
        top = rect.bottom + 8;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        tooltip.classList.add('tooltip-bottom');
    }
    
    // Constrain to viewport
    top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8));
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8));
    
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  },
  
  // Determine optimal tooltip position
  determineOptimalPosition: function(rect, tooltipRect, viewportWidth, viewportHeight) {
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;
    
    // Prefer top or bottom positions
    if (spaceTop >= tooltipRect.height + 16) {
      return 'top';
    } else if (spaceBottom >= tooltipRect.height + 16) {
      return 'bottom';
    } else if (spaceRight >= tooltipRect.width + 16) {
      return 'right';
    } else if (spaceLeft >= tooltipRect.width + 16) {
      return 'left';
    }
    
    // Default to bottom if no good position
    return 'bottom';
  },
  
  // Update tooltip position for follow cursor mode
  updateTooltipPosition: function(tooltip, x, y) {
    tooltip.style.left = (x + 10) + 'px';
    tooltip.style.top = (y - 10) + 'px';
  },
  
  // Get active tooltip for element
  getActiveTooltipForElement: function(element) {
    return this.activeTooltips.get(element);
  },
  
  // Timer management
  setTooltipTimer: function(element, timer) {
    element._tooltipTimer = timer;
  },
  
  clearTooltipTimer: function(element) {
    if (element._tooltipTimer) {
      clearTimeout(element._tooltipTimer);
      delete element._tooltipTimer;
    }
  },
  
  // Hide all active tooltips
  hideAllTooltips: function() {
    const elements = Array.from(this.activeTooltips.keys());
    elements.forEach(element => {
      this.hideTooltip(element);
    });
    console.log('TooltipSystem: Hidden all tooltips');
  },
  
  // Show tooltip programmatically
  show: function(selector, content, options = {}) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) return;
    
    const config = {
      ...this.defaultConfig,
      ...options,
      content
    };
    
    this.showTooltip(element, config);
  },
  
  // Hide tooltip programmatically
  hide: function(selector) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) return;
    
    this.hideTooltip(element);
  },
  
  // Update tooltip content
  update: function(selector, content) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) return;
    
    const tooltipData = this.activeTooltips.get(element);
    if (tooltipData) {
      const contentEl = tooltipData.tooltip.querySelector('.tooltip-content');
      if (contentEl) {
        contentEl.innerHTML = content;
      }
    }
  },
  
  // Enable/disable tooltip system
  enable: function() {
    document.body.classList.remove('tooltips-disabled');
    console.log('TooltipSystem: Enabled');
  },
  
  disable: function() {
    this.hideAllTooltips();
    document.body.classList.add('tooltips-disabled');
    console.log('TooltipSystem: Disabled');
  }
};

// Add tooltip CSS styles
const tooltipStyles = `
.tooltip-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
  pointer-events: none;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(4px);
  max-width: 300px;
  word-wrap: break-word;
  z-index: 10001;
}

.tooltip.show {
  opacity: 1;
  transform: translateY(0);
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #ffd700;
}

.tooltip-content {
  color: #e0e0e0;
}

/* Tooltip themes */
.tooltip-dark {
  background: rgba(0, 0, 0, 0.9);
  color: white;
}

.tooltip-light {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.tooltip-light .tooltip-title {
  color: #007bff;
}

.tooltip-success {
  background: rgba(40, 167, 69, 0.9);
  color: white;
}

.tooltip-warning {
  background: rgba(255, 193, 7, 0.9);
  color: #212529;
}

.tooltip-error {
  background: rgba(220, 53, 69, 0.9);
  color: white;
}

.tooltip-info {
  background: rgba(23, 162, 184, 0.9);
  color: white;
}

/* Tooltip arrows */
.tooltip-top::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.tooltip-bottom::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.9);
}

.tooltip-left::before {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: rgba(0, 0, 0, 0.9);
}

.tooltip-right::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.9);
}

/* Disabled state */
.tooltips-disabled .tooltip {
  display: none !important;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .tooltip {
    transition: none;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .tooltip {
    max-width: 250px;
    font-size: 12px;
    padding: 6px 10px;
  }
}
`;

// Inject tooltip styles
const styleSheet = document.createElement('style');
styleSheet.textContent = tooltipStyles;
document.head.appendChild(styleSheet);

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  window.TooltipSystem.init();
});

console.log('TooltipSystem.js code execution finished');