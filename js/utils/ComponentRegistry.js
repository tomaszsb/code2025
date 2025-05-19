// ComponentRegistry.js file is beginning to be used
console.log('ComponentRegistry.js file is beginning to be used');

/**
 * ComponentRegistry - Central registry for component interfaces
 * 
 * This utility provides a centralized system for components to register their
 * public interfaces and for other components to access those interfaces without
 * creating tight coupling. This follows the registry pattern for improved modularity.
 * 
 * Key features:
 * - Central registration of component interfaces
 * - Safe access to component interfaces
 * - Versioning support to handle updates
 * - Dependency checking
 * - Debug logging
 */
window.ComponentRegistry = (function() {
  // Private registry storage
  const _components = {};
  const _versions = {};
  const _dependencies = {};
  
  // Debug mode
  let _debugMode = false;
  
  /**
   * Log messages if debug mode is enabled
   * @param {string} message - Message to log
   * @param {*} [data] - Optional data to log
   */
  function _log(message, data) {
    if (_debugMode) {
      if (data) {
        console.log(`ComponentRegistry: ${message}`, data);
      } else {
        console.log(`ComponentRegistry: ${message}`);
      }
    }
  }
  
  /**
   * Check if all dependencies for a component are registered
   * @param {string} componentName - Component to check
   * @returns {boolean} True if all dependencies are registered
   */
  function _checkDependencies(componentName) {
    if (!_dependencies[componentName]) {
      return true; // No dependencies declared
    }
    
    const missingDependencies = _dependencies[componentName].filter(
      depName => !_components[depName]
    );
    
    if (missingDependencies.length > 0) {
      console.warn(`ComponentRegistry: ${componentName} is missing dependencies:`, 
        missingDependencies);
      return false;
    }
    
    return true;
  }
  
  // Public API
  return {
    /**
     * Register a component interface
     * @param {string} name - Component name
     * @param {object} interface - Public interface object
     * @param {string} [version] - Optional version string
     * @returns {boolean} True if registration was successful
     */
    register: function(name, interface, version = '1.0') {
      if (!name || typeof name !== 'string') {
        console.error('ComponentRegistry: Invalid component name');
        return false;
      }
      
      if (!interface || typeof interface !== 'object') {
        console.error(`ComponentRegistry: Invalid interface for ${name}`);
        return false;
      }
      
      // Store the interface
      _components[name] = interface;
      _versions[name] = version;
      
      _log(`Registered component ${name} v${version}`);
      
      return true;
    },
    
    /**
     * Get a component interface
     * @param {string} name - Component name to retrieve
     * @returns {object|null} Component interface or null if not found
     */
    get: function(name) {
      if (!_components[name]) {
        console.warn(`ComponentRegistry: Component ${name} not registered`);
        return null;
      }
      
      _log(`Retrieved component ${name}`);
      return _components[name];
    },
    
    /**
     * Declare dependencies for a component
     * @param {string} componentName - Component name
     * @param {string[]} dependencyNames - Array of dependency component names
     */
    declareDependencies: function(componentName, dependencyNames) {
      if (!Array.isArray(dependencyNames)) {
        console.error(`ComponentRegistry: Invalid dependencies for ${componentName}`);
        return false;
      }
      
      _dependencies[componentName] = dependencyNames;
      _log(`Declared dependencies for ${componentName}:`, dependencyNames);
      
      return _checkDependencies(componentName);
    },
    
    /**
     * Check if a component is registered
     * @param {string} name - Component name to check
     * @returns {boolean} True if the component is registered
     */
    has: function(name) {
      return !!_components[name];
    },
    
    /**
     * Get the version of a registered component
     * @param {string} name - Component name
     * @returns {string|null} Version string or null if not registered
     */
    getVersion: function(name) {
      return _versions[name] || null;
    },
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode should be enabled
     */
    setDebugMode: function(enabled) {
      _debugMode = !!enabled;
      _log(`Debug mode ${_debugMode ? 'enabled' : 'disabled'}`);
    },
    
    /**
     * List all registered components
     * @returns {object} Object with component names as keys and versions as values
     */
    listComponents: function() {
      return { ..._versions };
    },
    
    /**
     * Clear the registry (primarily for testing)
     */
    _clear: function() {
      Object.keys(_components).forEach(key => {
        delete _components[key];
        delete _versions[key];
        delete _dependencies[key];
      });
      _log('Registry cleared');
    }
  };
})();

// Initialize debug mode from URL parameter
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const debugRegistry = urlParams.get('debugRegistry') === 'true';
  if (debugRegistry) {
    window.ComponentRegistry.setDebugMode(true);
  }
})();

console.log('ComponentRegistry.js code execution finished');