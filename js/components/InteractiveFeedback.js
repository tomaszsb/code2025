// InteractiveFeedback.js - Interactive feedback system for UI elements
console.log('InteractiveFeedback.js file is beginning to be used');

// Interactive feedback manager for enhanced UI interactions
window.InteractiveFeedback = {
  // Track active toasts and loading states
  activeToasts: new Set(),
  loadingStates: new Map(),
  
  // Initialize the feedback system
  init: function() {
    console.log('InteractiveFeedback: Initializing feedback system');
    
    // Create toast container if it doesn't exist
    this.createToastContainer();
    
    // Add global event listeners for enhanced button feedback
    this.initializeButtonFeedback();
    
    console.log('InteractiveFeedback: System initialized');
  },
  
  // Create toast notification container
  createToastContainer: function() {
    if (!document.querySelector('.toast-container')) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  },
  
  // Initialize enhanced button feedback
  initializeButtonFeedback: function() {
    // Add click feedback to all buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('button:not(.toast-close), .btn')) {
        this.addClickFeedback(event.target);
      }
    });
    
    // Add hover sound effect preparation (for future audio features)
    document.addEventListener('mouseenter', (event) => {
      if (event.target.matches('button:not(.toast-close), .btn')) {
        this.prepareHoverFeedback(event.target);
      }
    }, true);
  },
  
  // Add visual click feedback to buttons
  addClickFeedback: function(button) {
    // Create ripple effect
    const ripple = document.createElement('span');
    ripple.classList.add('button-ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    
    // Position ripple at click point
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    
    // Add ripple styles
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  },
  
  // Prepare hover feedback (for future enhancements)
  prepareHoverFeedback: function(button) {
    // Add hover class for enhanced styling
    button.classList.add('btn-interactive');
  },
  
  // Show toast notification
  showToast: function(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Create toast content
    const icon = this.getToastIcon(type);
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="InteractiveFeedback.removeToast('${toast.id}')">&times;</button>
    `;
    
    // Generate unique ID
    toast.id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Add to container (create if missing)
    let container = document.querySelector('.toast-container');
    if (!container) {
      this.createToastContainer();
      container = document.querySelector('.toast-container');
    }
    
    if (container) {
      container.appendChild(toast);
    } else {
      console.error('InteractiveFeedback: Could not create toast container');
      return;
    }
    this.activeToasts.add(toast.id);
    
    // Show with animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
    
    console.log(`InteractiveFeedback: Showed ${type} toast: ${message}`);
    return toast.id;
  },
  
  // Get appropriate icon for toast type
  getToastIcon: function(type) {
    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },
  
  // Remove toast notification
  removeToast: function(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.activeToasts.delete(toastId);
      }, 300);
    }
  },
  
  // Show loading state on element
  showLoading: function(element, text = 'Loading...') {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) {
      console.warn('InteractiveFeedback: Element not found for loading state');
      return null;
    }
    
    const loadingId = 'loading-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // For buttons, add loading class
    if (element.tagName === 'BUTTON' || element.classList.contains('btn')) {
      element.classList.add('loading');
      element.disabled = true;
      element.setAttribute('data-original-text', element.textContent);
      element.textContent = text;
      
      // Store button state for proper cleanup
      this.loadingStates.set(loadingId, { element, type: 'button' });
    } else {
      // For other elements, add overlay
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <span style="margin-left: 8px;">${text}</span>
      `;
      
      element.style.position = 'relative';
      element.appendChild(overlay);
      
      this.loadingStates.set(loadingId, { element, overlay, type: 'overlay' });
    }
    
    console.log(`InteractiveFeedback: Started loading state on element: ${text}`);
    return loadingId;
  },
  
  // Hide loading state
  hideLoading: function(elementOrId) {
    let element;
    let loadingId;
    
    if (typeof elementOrId === 'string') {
      // It's a loading ID
      loadingId = elementOrId;
      const loadingState = this.loadingStates.get(loadingId);
      if (loadingState) {
        element = loadingState.element;
      } else {
        // If we can't find the loading state, try to find the button directly
        console.warn('InteractiveFeedback: Loading state not found for ID:', loadingId);
        element = document.querySelector('.end-turn-btn.loading');
      }
    } else {
      // It's an element
      element = elementOrId;
    }
    
    if (!element) {
      console.warn('InteractiveFeedback: Element not found for hiding loading state');
      return;
    }
    
    // For buttons, remove loading class
    if (element.tagName === 'BUTTON' || element.classList.contains('btn')) {
      element.classList.remove('loading');
      element.disabled = false;
      const originalText = element.getAttribute('data-original-text');
      if (originalText) {
        element.textContent = originalText;
        element.removeAttribute('data-original-text');
      }
    } else {
      // For other elements, remove overlay
      const overlay = element.querySelector('.loading-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
    
    if (loadingId) {
      this.loadingStates.delete(loadingId);
    }
    
    console.log('InteractiveFeedback: Removed loading state');
  },
  
  // Show progress indicator
  showProgress: function(element, progress, text = '') {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    let progressContainer = element.querySelector('.progress-indicator');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.className = 'progress-indicator';
      progressContainer.innerHTML = '<div class="progress-bar"></div>';
      element.appendChild(progressContainer);
    }
    
    const progressBar = progressContainer.querySelector('.progress-bar');
    progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    
    if (text) {
      let textElement = progressContainer.querySelector('.progress-text');
      if (!textElement) {
        textElement = document.createElement('div');
        textElement.className = 'progress-text';
        textElement.style.fontSize = '12px';
        textElement.style.textAlign = 'center';
        textElement.style.marginTop = '4px';
        progressContainer.appendChild(textElement);
      }
      textElement.textContent = text;
    }
    
    console.log(`InteractiveFeedback: Updated progress to ${progress}%`);
  },
  
  // Hide progress indicator
  hideProgress: function(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    const progressContainer = element.querySelector('.progress-indicator');
    if (progressContainer) {
      progressContainer.remove();
    }
  },
  
  // Add pulse animation to element
  addPulse: function(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (element) {
      element.classList.add('pulse');
      console.log('InteractiveFeedback: Added pulse animation');
    }
  },
  
  // Remove pulse animation
  removePulse: function(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (element) {
      element.classList.remove('pulse');
      console.log('InteractiveFeedback: Removed pulse animation');
    }
  },
  
  // Convenience methods for common toast types
  success: function(message, duration = 4000) {
    return this.showToast(message, 'success', duration);
  },
  
  warning: function(message, duration = 6000) {
    return this.showToast(message, 'warning', duration);
  },
  
  error: function(message, duration = 8000) {
    return this.showToast(message, 'error', duration);
  },
  
  info: function(message, duration = 4000) {
    return this.showToast(message, 'info', duration);
  },
  
  // Clear all active toasts
  clearAllToasts: function() {
    const toasts = Array.from(this.activeToasts);
    toasts.forEach(toastId => {
      this.removeToast(toastId);
    });
    console.log('InteractiveFeedback: Cleared all toasts');
  },
  
  // Disable all interactions (for modal states)
  disableInteractions: function() {
    document.body.style.pointerEvents = 'none';
    console.log('InteractiveFeedback: Disabled all interactions');
  },
  
  // Re-enable all interactions
  enableInteractions: function() {
    document.body.style.pointerEvents = '';
    console.log('InteractiveFeedback: Enabled all interactions');
  }
};

// Add CSS for ripple effect
const rippleStyles = `
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.btn-interactive {
  transition: all 0.2s ease;
}
`;

// Inject ripple styles
const styleSheet = document.createElement('style');
styleSheet.textContent = rippleStyles;
document.head.appendChild(styleSheet);

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  window.InteractiveFeedback.init();
});

console.log('InteractiveFeedback.js code execution finished');