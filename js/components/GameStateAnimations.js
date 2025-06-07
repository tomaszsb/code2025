// GameStateAnimations.js - Game state transition animation system
console.log('GameStateAnimations.js file is beginning to be used');

/**
 * Game State Animation Manager
 * Handles phase transitions, turn indicators, state changes, and victory animations
 */
window.GameStateAnimations = {
  // Animation configuration
  config: {
    phaseTransitionDuration: 2000,
    turnIndicatorDuration: 1500,
    stateChangeDuration: 800,
    victoryAnimationDuration: 5000
  },
  
  // Active animations tracking
  activeAnimations: new Map(),
  phaseHistory: [],
  
  // Initialize the animation system
  init: function() {
    console.log('GameStateAnimations: Initializing game state animation system');
    
    // Create animation overlays
    this.createAnimationOverlays();
    
    // Register event listeners
    this.registerEventListeners();
    
    console.log('GameStateAnimations: System initialized');
  },
  
  // Create overlay containers for animations
  createAnimationOverlays: function() {
    // Phase transition overlay
    if (!document.querySelector('.phase-transition-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'phase-transition-overlay';
      document.body.appendChild(overlay);
    }
    
    // Turn indicator overlay
    if (!document.querySelector('.turn-indicator-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'turn-indicator-overlay';
      document.body.appendChild(overlay);
    }
    
    // Victory animation overlay
    if (!document.querySelector('.victory-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'victory-overlay';
      document.body.appendChild(overlay);
    }
  },
  
  // Register event listeners for game state changes
  registerEventListeners: function() {
    if (window.GameStateManager) {
      window.GameStateManager.addEventListener('gameStateChanged', (event) => {
        this.handleGameStateChange(event.data);
      });
      
      window.GameStateManager.addEventListener('turnChanged', (event) => {
        this.handleTurnChange(event.data);
      });
      
      window.GameStateManager.addEventListener('phaseChanged', (event) => {
        this.handlePhaseTransition(event.data);
      });
      
      window.GameStateManager.addEventListener('gameOver', (event) => {
        this.handleGameOver(event.data);
      });
    }
  },
  
  // Handle game state changes with appropriate animations
  handleGameStateChange: function(stateData) {
    console.log('GameStateAnimations: Handling game state change', stateData);
    
    if (!stateData) return;
    
    switch (stateData.changeType) {
      case 'newGame':
        this.animateGameStart();
        break;
      case 'playerNegotiated':
        this.animateNegotiation(stateData);
        break;
      case 'cardDrawn':
        this.animateCardDrawEffect(stateData);
        break;
      case 'cardPlayed':
        this.animateCardPlayEffect(stateData);
        break;
      case 'diceRolled':
        this.animateDiceRollEffect(stateData);
        break;
      case 'spaceEffectTriggered':
        this.animateSpaceEffect(stateData);
        break;
      default:
        this.animateGenericStateChange(stateData);
    }
  },
  
  // Handle turn changes with enhanced visual feedback
  handleTurnChange: function(turnData) {
    console.log('GameStateAnimations: Handling turn change', turnData);
    
    if (!turnData) return;
    
    // Create enhanced turn indicator
    this.createEnhancedTurnIndicator(turnData.previousPlayer, turnData.currentPlayer);
    
    // Update turn highlighting
    this.updateTurnHighlighting(turnData.currentPlayer);
    
    // Show turn statistics if available
    if (turnData.turnStats) {
      this.showTurnStatistics(turnData.turnStats);
    }
  },
  
  // Handle phase transitions with cinematic effects
  handlePhaseTransition: function(phaseData) {
    console.log('GameStateAnimations: Handling phase transition', phaseData);
    
    if (!phaseData) return;
    
    // Record phase history
    this.phaseHistory.push({
      from: phaseData.previousPhase,
      to: phaseData.newPhase,
      timestamp: Date.now()
    });
    
    // Create phase transition animation
    this.animatePhaseTransition(phaseData.previousPhase, phaseData.newPhase);
    
    // Update phase indicators throughout UI
    this.updatePhaseIndicators(phaseData.newPhase);
  },
  
  // Handle game over with victory celebration
  handleGameOver: function(gameData) {
    console.log('GameStateAnimations: Handling game over', gameData);
    
    if (!gameData) return;
    
    // Create victory animation
    this.animateVictory(gameData.winner, gameData.finalStats);
    
    // Show final game statistics
    this.showFinalStatistics(gameData.finalStats);
  },
  
  // Animate game start
  animateGameStart: function() {
    console.log('GameStateAnimations: Animating game start');
    
    const overlay = document.querySelector('.phase-transition-overlay');
    if (!overlay) return;
    
    overlay.innerHTML = `
      <div class="game-start-animation">
        <div class="start-title">Project Management Game</div>
        <div class="start-subtitle">Beginning New Project</div>
        <div class="start-progress">
          <div class="progress-bar start-progress-bar"></div>
        </div>
      </div>
    `;
    
    overlay.classList.add('active');
    
    // Progress bar animation
    const progressBar = overlay.querySelector('.start-progress-bar');
    if (progressBar) {
      setTimeout(() => {
        progressBar.style.width = '100%';
      }, 100);
    }
    
    // Hide after animation
    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.innerHTML = '';
      }, 500);
    }, 2500);
  },
  
  // Create enhanced turn indicator
  createEnhancedTurnIndicator: function(previousPlayer, currentPlayer) {
    const overlay = document.querySelector('.turn-indicator-overlay');
    if (!overlay || !currentPlayer) return;
    
    overlay.innerHTML = `
      <div class="enhanced-turn-indicator">
        <div class="turn-badge">
          <div class="turn-player-avatar" style="background-color: ${currentPlayer.color}">
            ${currentPlayer.name.charAt(0).toUpperCase()}
          </div>
          <div class="turn-player-name">${currentPlayer.name}</div>
          <div class="turn-subtitle">Your Turn</div>
        </div>
        <div class="turn-resources">
          <div class="resource-item">
            <span class="resource-icon">💰</span>
            <span class="resource-value">$${(currentPlayer.resources?.money || 0).toLocaleString()}</span>
          </div>
          <div class="resource-item">
            <span class="resource-icon">⏱️</span>
            <span class="resource-value">${currentPlayer.resources?.time || 0} weeks</span>
          </div>
        </div>
        <div class="turn-tips">
          <div class="tip-text">Make your move to advance the project!</div>
        </div>
      </div>
    `;
    
    overlay.classList.add('active');
    
    // Auto-hide after duration
    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.innerHTML = '';
      }, 500);
    }, this.config.turnIndicatorDuration);
  },
  
  // Animate phase transitions
  animatePhaseTransition: function(fromPhase, toPhase) {
    const overlay = document.querySelector('.phase-transition-overlay');
    if (!overlay) return;
    
    const phaseNames = {
      'setup': 'Project Setup',
      'funding': 'Securing Funding',
      'design': 'Design Phase',
      'regulatory': 'Regulatory Approval',
      'construction': 'Construction Phase',
      'completion': 'Project Completion'
    };
    
    overlay.innerHTML = `
      <div class="phase-transition-animation">
        <div class="phase-transition-header">
          <div class="phase-progress-track">
            <div class="phase-progress-bar" data-from="${fromPhase}" data-to="${toPhase}"></div>
          </div>
        </div>
        <div class="phase-transition-content">
          <div class="phase-from">
            <div class="phase-label">Completing</div>
            <div class="phase-name">${phaseNames[fromPhase] || fromPhase}</div>
          </div>
          <div class="phase-arrow">→</div>
          <div class="phase-to">
            <div class="phase-label">Entering</div>
            <div class="phase-name">${phaseNames[toPhase] || toPhase}</div>
          </div>
        </div>
        <div class="phase-celebration">
          <div class="celebration-particles"></div>
        </div>
      </div>
    `;
    
    overlay.classList.add('active');
    
    // Add celebration particles
    this.createCelebrationParticles(overlay.querySelector('.celebration-particles'));
    
    // Hide after animation
    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.innerHTML = '';
      }, 500);
    }, this.config.phaseTransitionDuration);
  },
  
  // Animate victory sequence
  animateVictory: function(winner, finalStats) {
    const overlay = document.querySelector('.victory-overlay');
    if (!overlay || !winner) return;
    
    overlay.innerHTML = `
      <div class="victory-animation">
        <div class="victory-fireworks"></div>
        <div class="victory-content">
          <div class="victory-title">🎉 Project Complete! 🎉</div>
          <div class="victory-winner">
            <div class="winner-avatar" style="background-color: ${winner.color}">
              ${winner.name.charAt(0).toUpperCase()}
            </div>
            <div class="winner-name">${winner.name}</div>
            <div class="winner-subtitle">Project Manager</div>
          </div>
          <div class="victory-stats">
            ${finalStats ? this.generateVictoryStats(finalStats) : ''}
          </div>
          <div class="victory-actions">
            <button class="victory-btn" onclick="GameStateAnimations.hideVictoryAnimation()">
              Continue
            </button>
          </div>
        </div>
      </div>
    `;
    
    overlay.classList.add('active');
    
    // Create fireworks effect
    this.createFireworksEffect(overlay.querySelector('.victory-fireworks'));
  },
  
  // Generate victory statistics HTML
  generateVictoryStats: function(stats) {
    return `
      <div class="stat-item">
        <span class="stat-label">Total Duration:</span>
        <span class="stat-value">${stats.totalWeeks || 0} weeks</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Final Budget:</span>
        <span class="stat-value">$${(stats.finalMoney || 0).toLocaleString()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Cards Played:</span>
        <span class="stat-value">${stats.cardsPlayed || 0}</span>
      </div>
    `;
  },
  
  // Animate negotiation events
  animateNegotiation: function(negotiationData) {
    if (!negotiationData || !negotiationData.player) return;
    
    const notification = document.createElement('div');
    notification.className = 'negotiation-notification';
    notification.innerHTML = `
      <div class="negotiation-content">
        <div class="negotiation-icon">🤝</div>
        <div class="negotiation-text">
          <strong>${negotiationData.player.name}</strong> chose to negotiate and stay
        </div>
        <div class="negotiation-penalty">
          ${negotiationData.timePenalty ? `Time penalty: ${negotiationData.timePenalty} weeks` : ''}
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  },
  
  // Create celebration particles
  createCelebrationParticles: function(container) {
    if (!container) return;
    
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      
      container.appendChild(particle);
    }
  },
  
  // Create fireworks effect
  createFireworksEffect: function(container) {
    if (!container) return;
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6bcf7f'];
    
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = Math.random() * 100 + '%';
        firework.style.top = Math.random() * 60 + 20 + '%';
        
        // Create sparks
        for (let j = 0; j < 8; j++) {
          const spark = document.createElement('div');
          spark.className = 'firework-spark';
          spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          spark.style.transform = `rotate(${j * 45}deg)`;
          firework.appendChild(spark);
        }
        
        container.appendChild(firework);
        
        // Remove after animation
        setTimeout(() => {
          if (firework.parentNode) {
            firework.parentNode.removeChild(firework);
          }
        }, 2000);
      }, i * 300);
    }
  },
  
  // Update turn highlighting throughout UI
  updateTurnHighlighting: function(currentPlayer) {
    if (!currentPlayer) return;
    
    // Remove existing highlights
    document.querySelectorAll('.current-turn-highlight').forEach(el => {
      el.classList.remove('current-turn-highlight');
    });
    
    // Add highlight to current player elements
    document.querySelectorAll('.player-info, .static-player-status').forEach(el => {
      if (el.dataset.playerId === currentPlayer.id) {
        el.classList.add('current-turn-highlight');
      }
    });
  },
  
  // Update phase indicators
  updatePhaseIndicators: function(newPhase) {
    // Update any phase indicator elements in the UI
    document.querySelectorAll('.phase-indicator').forEach(indicator => {
      indicator.textContent = newPhase;
      indicator.className = `phase-indicator phase-${newPhase}`;
    });
  },
  
  // Animate generic state changes
  animateGenericStateChange: function(stateData) {
    // Show subtle state change indicator
    const indicator = document.createElement('div');
    indicator.className = 'state-change-indicator';
    indicator.textContent = stateData.message || 'Game state updated';
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      indicator.classList.remove('show');
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }, 2000);
  },
  
  // Hide victory animation (called by button)
  hideVictoryAnimation: function() {
    const overlay = document.querySelector('.victory-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.innerHTML = '';
      }, 500);
    }
  },
  
  // Clear all active animations
  clearAllAnimations: function() {
    console.log('GameStateAnimations: Clearing all animations');
    
    // Clear overlays
    document.querySelectorAll('.phase-transition-overlay, .turn-indicator-overlay, .victory-overlay').forEach(overlay => {
      overlay.classList.remove('active');
      overlay.innerHTML = '';
    });
    
    // Clear notifications
    document.querySelectorAll('.negotiation-notification, .state-change-indicator').forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
    
    // Clear tracking
    this.activeAnimations.clear();
  }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  window.GameStateAnimations.init();
});

console.log('GameStateAnimations.js code execution finished');