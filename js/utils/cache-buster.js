// cache-buster.js - DISABLED for testing
console.log('Cache-buster.js: Cache detection system DISABLED for testing');

// Initialize version tracking for cache-buster
window.LOADED_VERSIONS = window.LOADED_VERSIONS || {};

// Minimal non-intrusive version that just tracks versions but doesn't force refreshes
class CacheBuster {
    constructor() {
        console.log('CacheBuster: Initialized in DISABLED mode for testing');
        
        // Clear any existing refresh counters to prevent stale refresh screens
        this.clearRefreshCounter();
    }
    
    // Clear refresh counter to remove any existing refresh screens
    clearRefreshCounter() {
        localStorage.removeItem('cache_refresh_count');
        localStorage.removeItem('cache_refresh_reason');
        localStorage.removeItem('cache_refresh_timestamp');
        console.log('CacheBuster: Cleared refresh counters - no more refresh screens');
    }
    
    // Stub methods for compatibility
    startMonitoring() {
        console.log('CacheBuster: Monitoring disabled for testing');
    }
    
    checkVersions() {
        // Do nothing - no version checking during testing
    }
    
    forceRefresh() {
        console.log('CacheBuster: forceRefresh called but disabled for testing');
    }
    
    showManualRefreshMessage() {
        console.log('CacheBuster: Manual refresh message disabled for testing');
    }
}

// Initialize cache buster in disabled mode
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cacheBuster = new CacheBuster();
    });
} else {
    window.cacheBuster = new CacheBuster();
}

console.log('Cache-buster.js: System loaded in DISABLED mode - no refresh interference');
