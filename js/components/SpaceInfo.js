// SpaceInfo.js file is beginning to be used
console.log('SpaceInfo.js file is beginning to be used');

/**
 * SpaceInfo component - Displays information about a space on the board
 * 
 * This component has been refactored to follow the manager pattern:
 * - Uses SpaceInfoManager for state management and business logic
 * - Communicates through GameStateManager event system
 * - Properly handles cleanup to prevent memory leaks
 * - Uses CSS classes instead of inline styles
 * 
 * The component has been broken down into several smaller files:
 * - SpaceInfoDice.js - Dice-related functionality
 * - SpaceInfoCards.js - Card-related functionality
 * - SpaceInfoMoves.js - Move-related functionality
 * - SpaceInfoUtils.js - Utility functions
 */

// Main SpaceInfo Component - using browser-friendly approach
window.SpaceInfo = class SpaceInfo extends React.Component {
  constructor(props) {
    super(props);
    
    console.log('SpaceInfo: Constructor initialized');
    
    // Minimal state - only tracking render-specific items
    // All game state is managed by SpaceInfoManager
    this.state = {
      renderKey: 0 // Used to force re-renders when needed
    };
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      resetButtons: this.handleResetButtons.bind(this),
      turnChanged: this.handleTurnChanged.bind(this),
      spaceChanged: this.handleSpaceChanged.bind(this)
    };
    
    console.log('SpaceInfo: Constructor completed');
  }
  
  componentDidMount() {
    console.log('SpaceInfo: Component mounted');
    
    // Add event listener for reset buttons event (legacy compatibility)
    window.addEventListener('resetSpaceInfoButtons', this.eventHandlers.resetButtons);
    
    // Register for GameStateManager events
    if (window.GameStateManager) {
      window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.addEventListener('spaceChanged', this.eventHandlers.spaceChanged);
    }
    
    // Check manager availability
    if (!window.SpaceInfoManager) {
      console.error('SpaceInfo: SpaceInfoManager not available');
    }
  }
  
  componentDidUpdate(prevProps) {
    // Log space changes
    if (prevProps.space?.id !== this.props.space?.id) {
      console.log('SpaceInfo: Space changed from', prevProps.space?.name, 'to', this.props.space?.name);
    }
  }
  
  componentWillUnmount() {
    console.log('SpaceInfo: Component unmounting, cleaning up listeners');
    
    // Remove window event listener
    window.removeEventListener('resetSpaceInfoButtons', this.eventHandlers.resetButtons);
    
    // Remove GameStateManager event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('spaceChanged', this.eventHandlers.spaceChanged);
    }
  }
  
  // Handle the reset buttons event
  handleResetButtons() {
    console.log('SpaceInfo: Received resetSpaceInfoButtons event, forcing refresh');
    // Force a re-render
    this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
  }
  
  // Handle turn change events
  handleTurnChanged() {
    console.log('SpaceInfo: Handling turn changed event');
    // Force a re-render
    this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
  }
  
  // Handle space change events
  handleSpaceChanged() {
    console.log('SpaceInfo: Handling space changed event');
    // Force a re-render
    this.setState(prevState => ({ renderKey: prevState.renderKey + 1 }));
  }
  
  // Get CSS class for space phase using SpaceInfoUtils
  getPhaseClass(type) {
    return window.SpaceInfoUtils.getPhaseClass(type);
  }
  
  render() {
    // Force re-render when state.renderKey changes
    const { renderKey } = this.state;
    const { 
      space, 
      visitType, 
      diceOutcomes, 
      diceRoll, 
      availableMoves, 
      onMoveSelect, 
      onRollDice, 
      hasRolledDice, 
      hasDiceRollSpace,
      isRollingDice
    } = this.props;
    
    console.log('SpaceInfo render - diceRoll:', diceRoll, 'diceOutcomes:', diceOutcomes);
    console.log('SpaceInfo render - availableMoves:', availableMoves?.length || 0, 'onMoveSelect:', !!onMoveSelect);
    
    // Expose current props globally for MovementEngine synchronization
    window.currentSpaceInfoProps = { diceRoll, diceOutcomes, hasRolledDice, availableMoves };
    
    if (!space) {
      return <div className="space-info empty">No space selected</div>;
    }
    
    // Determine which description to show based on visitType
    const descriptionToShow = (visitType && space.visit) 
      ? (space.visit[visitType]?.description || space.description)
      : space.description;
    
    // Create a list of fields to display
    const fieldMappings = [
      { key: 'action', label: 'Action', priority: 'high' },
      { key: 'outcome', label: 'Outcome', priority: 'high' },
      { key: 'W Card', label: 'Work Type Card', priority: 'normal', isCard: true },
      { key: 'B Card', label: 'Bank Card', priority: 'normal', isCard: true },
      { key: 'I Card', label: 'Investor Card', priority: 'normal', isCard: true },
      { key: 'L card', label: 'Life Card', priority: 'normal', isCard: true },
      { key: 'E Card', label: 'Expeditor Card', priority: 'normal', isCard: true },
      { key: 'Fee', label: 'Fee', priority: 'normal', isResource: true }
      // Time is handled separately now in the top right corner
    ];
    
    // Separate high-priority and normal-priority fields
    const highPriorityFields = fieldMappings.filter(field => field.priority === 'high');
    const normalPriorityFields = fieldMappings.filter(field => field.priority === 'normal');
    
    // Get CSS class for space type/phase
    const phaseClass = this.getPhaseClass(space.type);
    
    return (
      <div className={`space-info ${phaseClass}`} key={renderKey}>
        {/* Time display in top right corner */}
        {space['Time'] && space['Time'] !== 'n/a' && (
          <div className="space-time-display">
            <span className="time-label">Time:</span>
            <span className="time-value">{space['Time']}</span>
          </div>
        )}
        
        <h3>{space.name}</h3>
        <div className="space-type">{space.type}</div>
        
        {/* Add Roll Dice button inside the space info card */}
        {onRollDice && (
          <div className="space-roll-dice-container">
            {/* Show rolling animation or dice result if currently rolling */}
            {this.props.isRollingDice && (
              <div className="dice-rolling-animation">
                <div className="dice-3d rolling">
                  <div className="dice-face-3d rolling">
                    <div className="dice-face-front">🎲</div>
                    <div className="dice-face-back">🎲</div>
                    <div className="dice-face-right">🎲</div>
                    <div className="dice-face-left">🎲</div>
                    <div className="dice-face-top">🎲</div>
                    <div className="dice-face-bottom">🎲</div>
                  </div>
                </div>
                <span className="rolling-text">Rolling...</span>
              </div>
            )}
            
            {/* Show dice result if rolled */}
            {hasRolledDice && diceRoll && !this.props.isRollingDice && (
              <div className="dice-result-display">
                <div className="dice-result-number">{diceRoll}</div>
                <span className="dice-result-text">Rolled: {diceRoll}</span>
              </div>
            )}
            
            {/* Show roll button */}
            {!this.props.isRollingDice && (
              <button 
                onClick={onRollDice}
                className={`roll-dice-btn ${hasRolledDice ? 'used' : ''}`}
                disabled={hasRolledDice || this.props.isRollingDice}
                title={hasRolledDice ? 'Already rolled dice this turn' : 'Roll dice for this space'}
              >
                {hasRolledDice ? 'Dice Rolled' : 'Roll Dice'}
              </button>
            )}
          </div>
        )}
        
        {/* Main description */}
        <div className="space-section">
          <div className="space-section-label">Description:</div>
          <div className="space-description">{descriptionToShow}</div>
        </div>
        
        {/* Path information section - from SpaceInfoMoves */}
        {this.renderOriginalSpaceInfo()}
        
        {/* High priority fields (Action and Outcome) */}
        {highPriorityFields.map(field => {
          // Only show fields that have content
          if (space[field.key] && space[field.key].trim() !== '') {
            return (
              <div key={field.key} className="space-section">
                <div className="space-section-label">{field.label}:</div>
                <div className="space-info-value">{space[field.key]}</div>
              </div>
            );
          }
          return null;
        })}
        
        {/* Logic space UI - from SpaceInfoMoves */}
        {this.renderLogicSpaceUI()}
        
        {/* Available moves section - from SpaceInfoMoves */}
        {this.renderAvailableMoves()}
        
        {/* REMOVED: OWNER-FUND-INITIATION and RETURN TO YOUR SPACE buttons - Phase 3 cleanup */}
        
        {/* Display dice outcomes if available - from SpaceInfoDice */}
        {this.renderDiceOutcomes()}
        
        {/* Group cards together with consistent styling */}
        <div className="space-cards-section">
          {normalPriorityFields.filter(field => field.isCard).map(field => {
            // Only show fields that have content
            if (space[field.key] && space[field.key].trim() !== '') {
              // Check if this card should be shown based on conditions
              if (!window.SpaceInfoUtils.shouldShowCardForCondition(space[field.key], this.props)) {
                console.log('SpaceInfo: Not showing card section due to condition not met:', field.label, space[field.key]);
                return null;
              }
              
              // Check if this is a conditional card effect
              const isConditionalCard = space[field.key].includes('if you roll');
              
              return (
                <div key={field.key} className="space-section card-section">
                  <div className="space-section-label">{field.label}:</div>
                  <div className="space-info-value card-value">
                    {/* Display conditional effect with additional info */}
                    {isConditionalCard ? (
                      <div className="conditional-card-effect">
                        <div className="effect-text">{space[field.key]}</div>
                        {hasRolledDice && diceRoll && (
                          <div className="dice-result-message">
                            You rolled a {diceRoll}. {(() => {
                              // Parse the dice roll requirement from the card text
                              const conditionalRollPattern = /if\s+you\s+roll\s+(?:a|an)?\s*(\d+)/i;
                              const match = space[field.key].match(conditionalRollPattern);
                              
                              if (match && match[1]) {
                                const requiredRoll = parseInt(match[1], 10);
                                const conditionMet = diceRoll === requiredRoll;
                                
                                return conditionMet ? (
                                  <span className="condition-met">✓ Condition met!</span>
                                ) : (
                                  <span className="condition-not-met">✗ Condition not met.</span>
                                );
                              }
                              
                              // Default fallback if no pattern found
                              return <span className="condition-met">✓ Condition met!</span>;
                            })()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>{space[field.key]}</div>
                    )}
                    
                    {/* Always show draw button for card fields that have "Draw X" format */}
                    {space[field.key].includes("Draw") && 
                      this.renderDrawCardsButton(field.label, space[field.key])}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
        
        {/* Group resources together with consistent styling */}
        <div className="space-resources-section">
          {normalPriorityFields.filter(field => field.isResource).map(field => {
            // Only show fields that have content
            if (space[field.key] && space[field.key].trim() !== '') {
              return (
                <div key={field.key} className="space-section resource-section">
                  <div className="space-section-label">{field.label}:</div>
                  <div className="space-info-value resource-value">{space[field.key]}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }
};

// Apply mixins
Object.assign(window.SpaceInfo.prototype, window.SpaceInfoDice);
Object.assign(window.SpaceInfo.prototype, window.SpaceInfoCards);
Object.assign(window.SpaceInfo.prototype, window.SpaceInfoMoves);

console.log('SpaceInfo.js code execution finished');
