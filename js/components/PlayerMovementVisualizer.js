// PlayerMovementVisualizer.js - Enhanced player movement visualization system
console.log('PlayerMovementVisualizer.js file is beginning to be used');

/**
 * Advanced player movement visualization manager
 * Handles trails, smooth transitions, turn handoffs, and position history
 */
window.PlayerMovementVisualizer = {
  // Configuration
  config: {
    trailDuration: 3000,
    breadcrumbLifetime: 5000,
    maxBreadcrumbs: 10,
    animationSpeed: 800,
    longDistanceThreshold: 5
  },
  
  // Active trails and effects tracking
  activeTrails: new Map(),
  positionHistory: new Map(),
  activeBreadcrumbs: new Map(),
  
  // Initialize the visualization system
  init: function() {
    console.log('PlayerMovementVisualizer: Initializing movement visualization system');
    
    // Create overlay containers
    this.createVisualizationContainers();
    
    // Listen for movement events
    this.registerEventListeners();
    
    console.log('PlayerMovementVisualizer: System initialized');
  },
  
  // Create overlay containers for visual effects
  createVisualizationContainers: function() {
    const gameBoard = document.querySelector('.game-container');
    if (!gameBoard) {
      console.log('PlayerMovementVisualizer: Game container not found, will retry when needed');
      return false;
    }
    
    // Create trail container
    if (!gameBoard.querySelector('.movement-trail-container')) {
      const trailContainer = document.createElement('div');
      trailContainer.className = 'movement-trail-container';
      gameBoard.appendChild(trailContainer);
    }
    
    // Create breadcrumb container
    if (!gameBoard.querySelector('.position-history-container')) {
      const breadcrumbContainer = document.createElement('div');
      breadcrumbContainer.className = 'position-history-container';
      gameBoard.appendChild(breadcrumbContainer);
    }
    
    // Create path prediction container
    if (!gameBoard.querySelector('.path-prediction-container')) {
      const predictionContainer = document.createElement('div');
      predictionContainer.className = 'path-prediction-container';
      gameBoard.appendChild(predictionContainer);
    }
    
    console.log('PlayerMovementVisualizer: Visualization containers created successfully');
    return true;
  },
  
  // Register event listeners for movement tracking
  registerEventListeners: function() {
    if (window.GameStateManager) {
      window.GameStateManager.addEventListener('playerMoved', (event) => {
        this.handlePlayerMovement(event.data);
      });
      
      window.GameStateManager.addEventListener('turnChanged', (event) => {
        this.handleTurnTransition(event.data);
      });
    }
  },
  
  // Handle player movement with enhanced visualization
  handlePlayerMovement: function(moveData) {
    console.log('PlayerMovementVisualizer: Handling player movement', moveData);
    
    if (!moveData || !moveData.player) return;
    
    const { player, fromSpace, toSpace } = moveData;
    
    // Create movement trail
    this.createMovementTrail(player, fromSpace, toSpace);
    
    // Add position breadcrumb
    this.addPositionBreadcrumb(player, fromSpace);
    
    // Animate player token
    this.animatePlayerToken(player, fromSpace, toSpace);
    
    // Update position history
    this.updatePositionHistory(player, toSpace);
  },
  
  // Create animated movement trail
  createMovementTrail: function(player, fromSpace, toSpace) {
    // Ensure containers exist first
    if (!this.createVisualizationContainers()) {
      // Retry after React rendering completes
      setTimeout(() => {
        this.createMovementTrail(player, fromSpace, toSpace);
      }, 500);
      return;
    }
    
    const fromElement = document.querySelector(`[data-space-id="${fromSpace}"]`);
    const toElement = document.querySelector(`[data-space-id="${toSpace}"]`);
    
    if (!fromElement || !toElement) {
      console.log('PlayerMovementVisualizer: Space elements not ready, will retry trail creation');
      // Retry after a short delay to allow React rendering
      setTimeout(() => {
        const retryFromElement = document.querySelector(`[data-space-id="${fromSpace}"]`);
        const retryToElement = document.querySelector(`[data-space-id="${toSpace}"]`);
        
        if (retryFromElement && retryToElement) {
          this.createMovementTrail(player, fromSpace, toSpace);
        } else {
          console.log('PlayerMovementVisualizer: Space elements still not available after retry');
        }
      }, 250);
      return;
    }
    
    const trailContainer = document.querySelector('.movement-trail-container');
    if (!trailContainer) return;
    
    // Calculate trail path
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const containerRect = trailContainer.getBoundingClientRect();
    
    // Create trail element
    const trail = document.createElement('div');
    trail.className = 'movement-trail active';
    trail.style.color = player.color || '#2196f3';
    
    // Position and size the trail
    const startX = fromRect.left - containerRect.left + fromRect.width / 2;
    const startY = fromRect.top - containerRect.top + fromRect.height / 2;
    const endX = toRect.left - containerRect.left + toRect.width / 2;
    const endY = toRect.top - containerRect.top + toRect.height / 2;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    trail.style.left = startX + 'px';
    trail.style.top = startY + 'px';
    trail.style.width = distance + 'px';
    trail.style.transform = `rotate(${angle}deg)`;
    trail.style.transformOrigin = '0 50%';
    
    trailContainer.appendChild(trail);
    
    // Add trail particles
    this.createTrailParticles(trail, player.color, distance);
    
    // Remove trail after animation
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail);
      }
    }, this.config.trailDuration);
    
    // Store active trail
    const trailId = `${player.id}-${Date.now()}`;
    this.activeTrails.set(trailId, {
      element: trail,
      player: player,
      from: fromSpace,
      to: toSpace
    });
  },
  
  // Create particle effects along the trail
  createTrailParticles: function(trailElement, playerColor, distance) {
    const particleCount = Math.min(Math.floor(distance / 50), 8);
    
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = Math.random() > 0.7 ? 'trail-particle spark' : 'trail-particle';
        particle.style.color = playerColor;
        particle.style.left = (i / particleCount) * 100 + '%';
        particle.style.top = '50%';
        particle.style.transform = 'translateY(-50%)';
        
        trailElement.appendChild(particle);
        
        // Clean up particle
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 3000);
      }, i * 100);
    }
  },
  
  // Add position breadcrumb for history tracking
  addPositionBreadcrumb: function(player, spaceId) {
    const spaceElement = document.querySelector(`[data-space-id="${spaceId}"]`);
    const breadcrumbContainer = document.querySelector('.position-history-container');
    
    if (!spaceElement || !breadcrumbContainer) return;
    
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'position-breadcrumb recent';
    breadcrumb.style.color = player.color || '#2196f3';
    
    // Position breadcrumb
    const rect = spaceElement.getBoundingClientRect();
    const containerRect = breadcrumbContainer.getBoundingClientRect();
    
    breadcrumb.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
    breadcrumb.style.top = (rect.top - containerRect.top + rect.height / 2) + 'px';
    breadcrumb.style.transform = 'translate(-50%, -50%)';
    
    breadcrumbContainer.appendChild(breadcrumb);
    
    // Store breadcrumb for player
    if (!this.activeBreadcrumbs.has(player.id)) {
      this.activeBreadcrumbs.set(player.id, []);
    }
    
    const playerBreadcrumbs = this.activeBreadcrumbs.get(player.id);
    playerBreadcrumbs.push({
      element: breadcrumb,
      spaceId: spaceId,
      timestamp: Date.now()
    });
    
    // Limit breadcrumbs per player
    if (playerBreadcrumbs.length > this.config.maxBreadcrumbs) {
      const oldBreadcrumb = playerBreadcrumbs.shift();
      if (oldBreadcrumb.element.parentNode) {
        oldBreadcrumb.element.parentNode.removeChild(oldBreadcrumb.element);
      }
    }
    
    // Auto-remove breadcrumb
    setTimeout(() => {
      if (breadcrumb.parentNode) {
        breadcrumb.parentNode.removeChild(breadcrumb);
      }
      
      // Remove from tracking
      const index = playerBreadcrumbs.findIndex(b => b.element === breadcrumb);
      if (index >= 0) {
        playerBreadcrumbs.splice(index, 1);
      }
    }, this.config.breadcrumbLifetime);
  },
  
  // Animate player token with enhanced effects
  animatePlayerToken: function(player, fromSpace, toSpace) {
    const fromElement = document.querySelector(`[data-space-id="${fromSpace}"]`);
    const toElement = document.querySelector(`[data-space-id="${toSpace}"]`);
    
    if (!fromElement || !toElement) return;
    
    // Find player token in the destination space
    const playerTokens = toElement.querySelectorAll('.player-token');
    let playerToken = null;
    
    playerTokens.forEach(token => {
      if (token.style.backgroundColor === player.color) {
        playerToken = token;
      }
    });
    
    if (!playerToken) return;
    
    // Calculate distance for appropriate animation
    const distance = this.calculateSpaceDistance(fromSpace, toSpace);
    
    // Add movement class based on distance
    playerToken.classList.add('moving');
    
    if (distance === 1) {
      playerToken.classList.add('move-distance-1');
    } else if (distance <= 3) {
      playerToken.classList.add('move-distance-2-3');
    } else {
      playerToken.classList.add('move-distance-4-plus');
    }
    
    // Add arriving animation
    setTimeout(() => {
      playerToken.classList.remove('moving');
      playerToken.classList.add('arriving');
      
      // Clean up classes
      setTimeout(() => {
        playerToken.classList.remove('arriving', 'move-distance-1', 'move-distance-2-3', 'move-distance-4-plus');
      }, 1000);
    }, this.config.animationSpeed);
    
    // Create departure ghost effect at origin
    this.createDepartureGhost(player, fromElement);
  },
  
  // Create ghost effect at departure location
  createDepartureGhost: function(player, fromElement) {
    const ghost = document.createElement('div');
    ghost.className = 'player-token departure-ghost';
    ghost.style.backgroundColor = player.color || '#2196f3';
    ghost.style.width = '15px';
    ghost.style.height = '15px';
    ghost.style.borderRadius = '50%';
    ghost.style.position = 'absolute';
    ghost.style.bottom = '10px';
    ghost.style.left = '10px';
    ghost.style.zIndex = '1';
    
    fromElement.appendChild(ghost);
    
    // Remove ghost after animation
    setTimeout(() => {
      if (ghost.parentNode) {
        ghost.parentNode.removeChild(ghost);
      }
    }, 2000);
  },
  
  // Handle turn transition with visual feedback
  handleTurnTransition: function(turnData) {
    console.log('PlayerMovementVisualizer: Handling turn transition', turnData);
    
    if (!turnData) return;
    
    // Create turn handoff overlay
    this.createTurnHandoffIndicator(turnData.previousPlayer, turnData.currentPlayer);
    
    // Update breadcrumb states
    this.updateBreadcrumbStates(turnData.currentPlayer);
  },
  
  // Create visual turn handoff indicator
  createTurnHandoffIndicator: function(fromPlayer, toPlayer) {
    if (!fromPlayer || !toPlayer) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'turn-transition-overlay active';
    
    // Create handoff indicator
    const indicator = document.createElement('div');
    indicator.className = 'turn-handoff-indicator';
    
    indicator.innerHTML = `
      <div class="handoff-from-player">
        <span>${fromPlayer.name}</span>
        <div class="handoff-player-token" style="background-color: ${fromPlayer.color}"></div>
      </div>
      <div class="handoff-arrow">↓</div>
      <div class="handoff-to-player">
        <div class="handoff-player-token" style="background-color: ${toPlayer.color}"></div>
        <span>${toPlayer.name}</span>
      </div>
      <div style="margin-top: 15px; font-size: 14px; color: #666;">Your Turn!</div>
    `;
    
    overlay.appendChild(indicator);
    document.body.appendChild(overlay);
    
    // Remove after animation
    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 500);
    }, 1500);
  },
  
  // Update breadcrumb visual states for current player
  updateBreadcrumbStates: function(currentPlayer) {
    if (!currentPlayer) return;
    
    // Reset all breadcrumbs to normal state
    document.querySelectorAll('.position-breadcrumb').forEach(breadcrumb => {
      breadcrumb.classList.remove('current');
    });
    
    // Highlight current player's breadcrumbs
    const playerBreadcrumbs = this.activeBreadcrumbs.get(currentPlayer.id);
    if (playerBreadcrumbs && playerBreadcrumbs.length > 0) {
      const latestBreadcrumb = playerBreadcrumbs[playerBreadcrumbs.length - 1];
      if (latestBreadcrumb.element) {
        latestBreadcrumb.element.classList.add('current');
      }
    }
  },
  
  // Calculate distance between spaces
  calculateSpaceDistance: function(fromSpace, toSpace) {
    // This is a simplified calculation - in a real implementation,
    // you might want to use the actual game board layout
    if (!fromSpace || !toSpace) return 1;
    
    // Extract numeric parts from space IDs for distance calculation
    const fromNum = parseInt(fromSpace.replace(/\D/g, '')) || 0;
    const toNum = parseInt(toSpace.replace(/\D/g, '')) || 0;
    
    return Math.abs(toNum - fromNum);
  },
  
  // Update position history for a player
  updatePositionHistory: function(player, spaceId) {
    if (!this.positionHistory.has(player.id)) {
      this.positionHistory.set(player.id, []);
    }
    
    const history = this.positionHistory.get(player.id);
    history.push({
      spaceId: spaceId,
      timestamp: Date.now()
    });
    
    // Keep only recent history
    const maxHistory = 20;
    if (history.length > maxHistory) {
      history.splice(0, history.length - maxHistory);
    }
  },
  
  // Show predicted movement path
  showMovementPrediction: function(player, fromSpace, possibleDestinations) {
    console.log('PlayerMovementVisualizer: Showing movement prediction', possibleDestinations);
    
    const predictionContainer = document.querySelector('.path-prediction-container');
    if (!predictionContainer) return;
    
    // Clear existing predictions
    this.clearMovementPrediction();
    
    possibleDestinations.forEach(destination => {
      this.createPredictedPath(fromSpace, destination.id, player.color);
      this.createPredictedDestination(destination.id, player.color);
    });
  },
  
  // Create predicted path visualization
  createPredictedPath: function(fromSpace, toSpace, playerColor) {
    const fromElement = document.querySelector(`[data-space-id="${fromSpace}"]`);
    const toElement = document.querySelector(`[data-space-id="${toSpace}"]`);
    const predictionContainer = document.querySelector('.path-prediction-container');
    
    if (!fromElement || !toElement || !predictionContainer) return;
    
    // Create path similar to trail but with prediction styling
    const path = document.createElement('div');
    path.className = 'predicted-path';
    path.style.color = playerColor || '#ffc107';
    
    // Position and size the path
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const containerRect = predictionContainer.getBoundingClientRect();
    
    const startX = fromRect.left - containerRect.left + fromRect.width / 2;
    const startY = fromRect.top - containerRect.top + fromRect.height / 2;
    const endX = toRect.left - containerRect.left + toRect.width / 2;
    const endY = toRect.top - containerRect.top + toRect.height / 2;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    path.style.left = startX + 'px';
    path.style.top = startY + 'px';
    path.style.width = distance + 'px';
    path.style.transform = `rotate(${angle}deg)`;
    path.style.transformOrigin = '0 50%';
    
    predictionContainer.appendChild(path);
  },
  
  // Create predicted destination indicator
  createPredictedDestination: function(spaceId, playerColor) {
    const spaceElement = document.querySelector(`[data-space-id="${spaceId}"]`);
    const predictionContainer = document.querySelector('.path-prediction-container');
    
    if (!spaceElement || !predictionContainer) return;
    
    const destination = document.createElement('div');
    destination.className = 'predicted-destination';
    destination.style.borderColor = playerColor || '#ffc107';
    
    // Position destination indicator
    const rect = spaceElement.getBoundingClientRect();
    const containerRect = predictionContainer.getBoundingClientRect();
    
    destination.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
    destination.style.top = (rect.top - containerRect.top + rect.height / 2) + 'px';
    
    predictionContainer.appendChild(destination);
  },
  
  // Clear movement prediction visualization
  clearMovementPrediction: function() {
    const predictionContainer = document.querySelector('.path-prediction-container');
    if (predictionContainer) {
      predictionContainer.innerHTML = '';
    }
  },
  
  // Clear all visual effects for cleanup
  clearAllEffects: function() {
    console.log('PlayerMovementVisualizer: Clearing all visual effects');
    
    this.clearMovementPrediction();
    
    // Clear trails
    const trailContainer = document.querySelector('.movement-trail-container');
    if (trailContainer) {
      trailContainer.innerHTML = '';
    }
    
    // Clear breadcrumbs
    const breadcrumbContainer = document.querySelector('.position-history-container');
    if (breadcrumbContainer) {
      breadcrumbContainer.innerHTML = '';
    }
    
    // Clear tracking data
    this.activeTrails.clear();
    this.positionHistory.clear();
    this.activeBreadcrumbs.clear();
  }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  // Delay initialization to ensure game board is ready
  setTimeout(() => {
    window.PlayerMovementVisualizer.init();
  }, 1000);
});

console.log('PlayerMovementVisualizer.js code execution finished');