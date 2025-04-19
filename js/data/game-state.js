// game-state.js - Compatibility layer for GameStateManager
console.log('game-state.js file is beginning to be used');

// This file exists for backward compatibility
// It forwards all GameState references to the new GameStateManager
// The actual implementation is now in GameStateManager.js

// Ensure GameState is an alias to GameStateManager
window.GameState = window.GameStateManager;

console.log('game-state.js code execution finished');