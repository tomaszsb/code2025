// SpaceExplorer.js file is beginning to be used
console.log('SpaceExplorer.js file is beginning to be used');

/**
 * SpaceExplorer component for displaying details of spaces when exploring the board
 * 
 * This component shows detailed information about board spaces including:
 * - Space name and visit type (first/subsequent)
 * - Description, action, and outcome information
 * - Card information
 * - Dice roll outcomes
 * - Resources required/provided
 * 
 * Features:
 * - Fully integrates with SpaceExplorerManager using the manager pattern
 * - Uses GameStateManager event system for state changes
 * - Focuses on rendering based on props passed from parent
 * - Memoized processing of dice data for improved performance
 * - Enhanced error boundary implementation with detailed logging
 * - Responsive layout with standardized CSS classes
 * - Proper resource cleanup on unmount
 */
class SpaceExplorer extends React.Component {
  constructor(props) {
    console.log('SpaceExplorer: Constructor initialized');
    
    super(props);
    // Initialize state with error information and UI-specific state
    this.state = {
      hasError: false,
      errorMessage: '',
      // Cache for processed dice data to avoid reprocessing on every render
      processedDiceData: null,
      // Flag to track if data has been processed
      diceDataProcessed: false
    };
    
    // Track performance metrics for debugging
    this.renderCount = 0;
    this.lastRenderTime = 0;
    this.isProcessingData = false; // Flag to prevent concurrent processing
    
    // Bind methods to ensure proper this context
    this.handleGameStateChange = this.handleGameStateChange.bind(this);
    this.handleCloseExplorer = this.handleCloseExplorer.bind(this);
    this.processDiceDataFromProps = this.processDiceDataFromProps.bind(this);
    
    console.log('SpaceExplorer: Constructor completed');
  }
  
  // Component lifecycle method - called when component mounts
  componentDidMount() {
    console.log('SpaceExplorer: componentDidMount method is being used');
    
    // Process dice data only if space prop is available to prevent unnecessary state updates
    if (this.props.space) {
      this.processDiceDataFromProps();
    }
    
    // Register event listeners with GameStateManager
    if (window.GameStateManager) {
      window.GameStateManager.addEventListener('gameStateChanged', this.handleGameStateChange);
      window.GameStateManager.addEventListener('componentFinished', this.handleComponentFinished.bind(this));
    } else {
      console.warn('SpaceExplorer: GameStateManager not available, cannot register events');
    }
    
    console.log('SpaceExplorer: componentDidMount method completed');
  }
  
  // Handler for gameStateChanged events
  handleGameStateChange(event) {
    console.log('SpaceExplorer: handleGameStateChange method is being used');
    
    // Only process events that might affect explorer content
    if (event.data && ['playerMoved', 'cardDrawn', 'cardPlayed', 'newGame'].includes(event.data.changeType)) {
      // Prevent processing if already processing to avoid render loops
      if (this.isProcessingData) {
        console.log('SpaceExplorer: Already processing data, skipping gameStateChange handling');
        return;
      }
      
      // Use setTimeout to prevent rapid successive updates
      setTimeout(() => {
        if (!this.isProcessingData) {
          this.processDiceDataFromProps();
        }
      }, 50); // Small delay to debounce rapid events
    }
    
    console.log('SpaceExplorer: handleGameStateChange method completed');
  }
  
  // NEW: Handler for componentFinished events - implements the "done" signal pattern
  handleComponentFinished(event) {
    console.log('SpaceExplorer: Received componentFinished signal from', event.data.component);
    
    // Only react to SpaceInfo finishing specific actions
    if (event.data.component === 'SpaceInfo' && 
        ['spaceChanged', 'playerMoved'].includes(event.data.action)) {
      
      console.log('SpaceExplorer: SpaceInfo finished updating, now safe to update explorer');
      
      // Now it's safe to update without causing loops
      if (!this.isProcessingData) {
        setTimeout(() => {
          this.processDiceDataFromProps();
        }, 50); // Small delay to ensure everything is settled
      }
    }
  }
  
  // Process dice data from props
  processDiceDataFromProps() {
    console.log('SpaceExplorer: processDiceDataFromProps method is being used');
    
    // BUGFIX: Prevent unnecessary state updates to avoid render loops
    if (this.isProcessingData) {
      console.log('SpaceExplorer: Already processing, skipping to prevent loops');
      return;
    }
    
    this.isProcessingData = true;
    
    const { space, diceRollData, visitType } = this.props;
    
    try {
      if (space && diceRollData) {
        // Process dice data and update state
        const processedData = this.processDiceData(space, diceRollData, visitType);
        
        // Only update state if data has actually changed
        const dataHasChanged = JSON.stringify(processedData) !== JSON.stringify(this.state.processedDiceData);
        
        if (dataHasChanged || !this.state.diceDataProcessed) {
          console.log('SpaceExplorer: Updating state with new processed data');
          this.setState({ 
            processedDiceData: processedData,
            diceDataProcessed: true
          });
        } else {
          console.log('SpaceExplorer: Data unchanged, skipping state update');
        }
      } else {
        // Only clear processed data if we actually have data to clear
        // This prevents unnecessary setState calls when space is already null/undefined
        if (this.state.processedDiceData !== null || !this.state.diceDataProcessed) {
          console.log('SpaceExplorer: Clearing processed data');
          this.setState({ 
            processedDiceData: null,
            diceDataProcessed: true
          });
        } else {
          console.log('SpaceExplorer: Already in cleared state, skipping setState');
        }
      }
    } catch (error) {
      console.error('SpaceExplorer: Error processing dice data:', error.message);
      
      // Only update state if necessary
      if (this.state.processedDiceData !== null || !this.state.diceDataProcessed) {
        this.setState({ 
          processedDiceData: null,
          diceDataProcessed: true
        });
      }
    } finally {
      // Always reset processing flag
      setTimeout(() => {
        this.isProcessingData = false;
      }, 100);
    }
    
    console.log('SpaceExplorer: processDiceDataFromProps method completed');
  }
  
  // Prevent unnecessary re-renders when props haven't meaningfully changed
  shouldComponentUpdate(nextProps, nextState) {
    // Check if space prop has actually changed (not just undefined vs null)
    const spaceChanged = (this.props.space?.space_name) !== (nextProps.space?.space_name);
    const visitTypeChanged = this.props.visitType !== nextProps.visitType;
    const diceRollDataChanged = this.props.diceRollData !== nextProps.diceRollData;
    const stateChanged = this.state.processedDiceData !== nextState.processedDiceData || 
                        this.state.diceDataProcessed !== nextState.diceDataProcessed ||
                        this.state.hasError !== nextState.hasError;
    
    const shouldUpdate = spaceChanged || visitTypeChanged || diceRollDataChanged || stateChanged;
    
    if (!shouldUpdate) {
      console.log('SpaceExplorer: Preventing unnecessary re-render - no meaningful changes');
    }
    
    return shouldUpdate;
  }

  // Component lifecycle method - called when props or state change
  componentDidUpdate(prevProps, prevState) {
    console.log('SpaceExplorer: componentDidUpdate method is being used');
    
    // NEW: Using coordinated "done" signal pattern instead of automatic processing
    // SpaceExplorer now waits for componentFinished signals before updating
    
    // Performance tracking for debugging
    this.renderCount++;
    const currentTime = performance.now();
    if (this.lastRenderTime > 0) {
      const renderInterval = currentTime - this.lastRenderTime;
      if (renderInterval < 100) {
        console.warn('SpaceExplorer: Multiple renders occurring rapidly, interval:', renderInterval.toFixed(2), 'ms');
        console.warn('SpaceExplorer: Props changed - space:', this.props.space?.space_name, 'vs', prevProps.space?.space_name);
        console.warn('SpaceExplorer: State processedData changed:', this.state.processedDiceData !== prevState.processedDiceData);
      }
    }
    this.lastRenderTime = currentTime;
    
    console.log('SpaceExplorer: componentDidUpdate method completed');
  }
  
  // Clean up resources when component unmounts
  componentWillUnmount() {
    console.log('SpaceExplorer: componentWillUnmount method is being used');
    
    // Remove GameStateManager event listeners
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('gameStateChanged', this.handleGameStateChange);
      window.GameStateManager.removeEventListener('componentFinished', this.handleComponentFinished);
    }
    
    // Clear any timers or resources if used
    this.lastRenderTime = 0;
    this.renderCount = 0;
    
    console.log('SpaceExplorer: componentWillUnmount method completed');
  }

  // Enhanced error boundary implementation
  componentDidCatch(error, info) {
    console.log('SpaceExplorer: componentDidCatch method is being used');
    
    console.error('SpaceExplorer: Error caught in SpaceExplorer:', error.message, info);
    
    // Capture stack trace if available
    const errorDetails = error.stack || error.message || 'Unknown error';
    
    this.setState({
      hasError: true,
      errorMessage: `${error.message}\n\nComponent Stack: ${info.componentStack || 'Not available'}`
    });
    
    // Log detailed error information for debugging
    console.error('Full error details:', errorDetails);
    console.error('Component stack:', info.componentStack);
    
    // Dispatch event to notify about error if GameStateManager available
    if (window.GameStateManager) {
      window.GameStateManager.dispatchEvent('gameStateChanged', {
        changeType: 'error',
        component: 'SpaceExplorer',
        errorMessage: error.message
      });
    }
    
    console.log('SpaceExplorer: componentDidCatch method completed');
  }

  // Helper function to check if a value exists and is not 'n/a'
  hasValidValue(value) {
    console.log('SpaceExplorer: hasValidValue method is being used');
    const result = value && value !== 'n/a' && value.trim() !== '';
    console.log('SpaceExplorer: hasValidValue method completed');
    return result;
  }

  // Helper to clarify card draw text
  clarifyCardText(text) {
    console.log('SpaceExplorer: clarifyCardText method is being used');
    
    if (!text) {
      console.log('SpaceExplorer: clarifyCardText method completed with empty text');
      return '';
    }
    
    // Handle "Draw X" pattern to clarify card type
    const drawPattern = /^Draw\s+(\d+)$/i;
    if (text.match(drawPattern)) {
      const match = text.match(drawPattern);
      if (match && match[1]) {
        const count = match[1];
        console.log('SpaceExplorer: clarifyCardText method completed with draw count pattern');
        return `Draw ${count} Work Cards`;
      }
    }
    
    console.log('SpaceExplorer: clarifyCardText method completed');
    return text;
  }

  // Process dice data for the current space - optimized with better error handling
  processDiceData(space, diceRollData, visitTypeFromProps) {
    console.log('SpaceExplorer: processDiceData method is being used');
    
    if (!space || !diceRollData) {
      console.log('SpaceExplorer: processDiceData method completed with null (missing data)');
      return null;
    }
    
    try {
      // Get current visit type with appropriate fallback
      const visitType = visitTypeFromProps || 
                      (space.visitType && space.visitType.toLowerCase()) || 
                      'first';
      
      // Only show outcomes that match both space name AND visit type (strict matching)
      const spaceDiceData = diceRollData.filter(data => 
        data['space_name'] === space.space_name && 
        data['visit_type'].toLowerCase() === visitType
      );
      
      if (spaceDiceData.length === 0) {
        console.log('SpaceExplorer: processDiceData method completed with null (no matching dice data)');
        return null;
      }
      
      // Create a map of roll values to outcomes by outcome type
      const rollOutcomes = {};
      
      // For each die roll 1-6, gather all outcome types
      for (let roll = 1; roll <= 6; roll++) {
        rollOutcomes[roll] = {};
        
        // Process each dice data entry for this roll
        spaceDiceData.forEach(data => {
          const outcomeType = data['die_roll'];
          const outcomeValue = data[roll.toString()];
          
          // Only add if value exists and is not 'n/a'
          if (this.hasValidValue(outcomeValue)) {
            rollOutcomes[roll][outcomeType] = outcomeValue;
          }
        });
      }
      
      console.log('SpaceExplorer: processDiceData method completed successfully');
      return rollOutcomes;
    } catch (error) {
      console.error('SpaceExplorer: Error processing dice data:', error.message, error.stack);
      console.log('SpaceExplorer: processDiceData method completed with error');
      return null;
    }
  }

  // Create outcome element for dice roll result - safer than using HTML strings
  createOutcomeElement(type, value, key) {
    console.log('SpaceExplorer: createOutcomeElement method is being used');
    
    // Determine appropriate CSS class based on outcome type
    let className = 'outcome-other';
    
    if (type.includes('Move')) {
      className = 'outcome-move';
    } else if (type.includes('Card')) {
      className = 'outcome-card';
    } else if (type.includes('Time') || type.includes('Fee')) {
      className = 'outcome-resource';
    }
    
    console.log('SpaceExplorer: createOutcomeElement method completed');
    return (
      <div key={key} className={className}>
        {type}: {value}
      </div>
    );
  }

  // Render dice roll table with outcomes - using memoized data
  renderDiceTable() {
    console.log('SpaceExplorer: renderDiceTable method is being used');
    
    const { processedDiceData } = this.state;
    
    if (!processedDiceData) {
      console.log('SpaceExplorer: renderDiceTable method completed with null (no dice data)');
      return null;
    }
    
    console.log('SpaceExplorer: renderDiceTable method completed');
    return (
      <div className="explorer-dice-section">
        <h4>Dice Roll Outcomes:</h4>
        <div className="explorer-dice-table-container">
          <table className="explorer-dice-table">
            <thead>
              <tr>
                <th>Roll</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map(roll => {
                const outcomes = processedDiceData[roll];
                const hasOutcomes = outcomes && Object.keys(outcomes).length > 0;
                
                // If no outcomes found, show N/A
                if (!hasOutcomes) {
                  return (
                    <tr key={roll} className={roll % 2 === 0 ? 'row-alternate' : ''}>
                      <td className="dice-roll">{roll}</td>
                      <td className="dice-outcome">N/A</td>
                    </tr>
                  );
                }
                
                // Prepare outcomes in order of priority
                const orderedOutcomes = [];
                
                // First handle movement outcomes (highest priority)
                if (outcomes['Next Step']) {
                  orderedOutcomes.push(
                    this.createOutcomeElement('Move to', outcomes['Next Step'], 'move')
                  );
                }
                
                // Then handle card outcomes
                const cardTypes = ['W Cards', 'B Cards', 'I Cards', 'L Cards', 'E Cards', 'L card', 'E Card'];
                cardTypes.forEach(cardType => {
                  if (outcomes[cardType]) {
                    const typeName = cardType.replace('Cards', 'Card').trim();
                    orderedOutcomes.push(
                      this.createOutcomeElement(typeName, outcomes[cardType], typeName)
                    );
                  }
                });
                
                // Handle resource outcomes
                if (outcomes['Time outcomes']) {
                  orderedOutcomes.push(
                    this.createOutcomeElement('Time', outcomes['Time outcomes'], 'time')
                  );
                }
                
                if (outcomes['Fees Paid']) {
                  orderedOutcomes.push(
                    this.createOutcomeElement('Fee', outcomes['Fees Paid'], 'fee')
                  );
                }
                
                // Handle any other outcomes
                Object.entries(outcomes).forEach(([type, value]) => {
                  const skipTypes = ['Next Step', 'W Cards', 'B Cards', 'I Cards', 'L Cards', 'E Cards', 'Time outcomes', 'Fees Paid', 'L card', 'E Card'];
                  if (!skipTypes.includes(type)) {
                    orderedOutcomes.push(
                      this.createOutcomeElement(type, value, `other-${type}`)
                    );
                  }
                });
                
                return (
                  <tr key={roll} className={roll % 2 === 0 ? 'row-alternate' : ''}>
                    <td className="dice-roll">{roll}</td>
                    <td className="dice-outcome">{orderedOutcomes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render the header section with title and close button
  renderHeader() {
    console.log('SpaceExplorer: renderHeader method is being used');
    
    console.log('SpaceExplorer: renderHeader method completed');
    return (
      <div className="explorer-header">
        <h3 className="explorer-title">Space Explorer</h3>
        <button 
          className="explorer-close-btn" 
          onClick={this.handleCloseExplorer}
          aria-label="Close space explorer"
        >
          ×
        </button>
      </div>
    );
  }
  
  // Handle close explorer button click - delegate to SpaceExplorerManager through props
  handleCloseExplorer() {
    console.log('SpaceExplorer: handleCloseExplorer method is being used');
    
    // Call props.onClose if available
    if (this.props.onClose && typeof this.props.onClose === 'function') {
      this.props.onClose();
      
      // Dispatch event using GameStateManager
      if (window.GameStateManager) {
        window.GameStateManager.dispatchEvent('spaceExplorerToggled', {
          visible: false,
          spaceName: this.props.space ? this.props.space.space_name : ''
        });
      }
    }
    
    console.log('SpaceExplorer: handleCloseExplorer method completed');
  }

  // Render space metadata (name and visit type)
  renderSpaceMetadata() {
    console.log('SpaceExplorer: renderSpaceMetadata method is being used');
    
    const { space, visitType } = this.props;
    
    if (!space) {
      console.log('SpaceExplorer: renderSpaceMetadata method completed with null (no space)');
      return null;
    }
    
    console.log('SpaceExplorer: renderSpaceMetadata method completed');
    return (
      <>
        <div className="explorer-space-name">{space.space_name}</div>
        <div className="explorer-visit-type">
          {visitType === 'first' ? 'First Visit' : 'Subsequent Visit'}
        </div>
      </>
    );
  }

  // Render dice roll indicator if applicable
  renderDiceRollIndicator() {
    console.log('SpaceExplorer: renderDiceRollIndicator method is being used');
    
    const { processedDiceData } = this.state;
    
    // If no processed dice data, don't show indicator
    if (!processedDiceData) {
      console.log('SpaceExplorer: renderDiceRollIndicator method completed with null (no dice data)');
      return null;
    }
    
    console.log('SpaceExplorer: renderDiceRollIndicator method completed');
    return (
      <div className="explorer-dice-indicator">
        <span className="dice-icon"></span>
        <span className="dice-text">This space requires a dice roll</span>
      </div>
    );
  }

  // Render space description, action, and outcome sections
  renderSpaceDetails() {
    console.log('SpaceExplorer: renderSpaceDetails method is being used');
    
    const { space } = this.props;
    
    if (!space) {
      console.log('SpaceExplorer: renderSpaceDetails method completed with null (no space)');
      return null;
    }
    
    console.log('SpaceExplorer: renderSpaceDetails method completed');
    return (
      <>
        {space.Event && (
          <div className="explorer-section">
            <h4>Event:</h4>
            <div className="explorer-description">{space.Event}</div>
          </div>
        )}
        
        {space.Action && (
          <div className="explorer-section">
            <h4>Action:</h4>
            <div className="explorer-action">{space.Action}</div>
          </div>
        )}
        
        {space.Outcome && (
          <div className="explorer-section">
            <h4>Outcome:</h4>
            <div className="explorer-outcome">{space.Outcome}</div>
          </div>
        )}
      </>
    );
  }

  // Render card sections using a data-driven approach
  renderCardSection() {
    console.log('SpaceExplorer: renderCardSection method is being used');
    
    const { space } = this.props;
    
    if (!space) {
      console.log('SpaceExplorer: renderCardSection method completed with null (no space)');
      return null;
    }
    
    // Define card types and their styles - using correct CSV field names
    const cardTypes = [
      { key: 'w_card', type: 'W', className: 'work-card' },
      { key: 'b_card', type: 'B', className: 'business-card' },
      { key: 'i_card', type: 'I', className: 'innovation-card' },
      { key: 'l_card', type: 'L', className: 'leadership-card' },
      { key: 'e_card', type: 'E', className: 'environment-card' }
    ];
    
    // Filter to only cards that have values
    const cardsToRender = cardTypes.filter(card => 
      this.hasValidValue(space[card.key])
    );
    
    if (cardsToRender.length === 0) {
      console.log('SpaceExplorer: renderCardSection method completed with null (no cards)');
      return null;
    }
    
    console.log('SpaceExplorer: renderCardSection method completed');
    return (
      <div className="explorer-cards-section">
        {cardsToRender.map(card => (
          <div key={card.key} className="explorer-card-item">
            <span className={`card-type ${card.className}`}>{card.type}</span>
            <span className="card-text">{this.clarifyCardText(space[card.key])}</span>
          </div>
        ))}
      </div>
    );
  }

  // Render resource section (Time and Fee)
  renderResourceSection() {
    console.log('SpaceExplorer: renderResourceSection method is being used');
    
    const { space } = this.props;
    
    if (!space) {
      console.log('SpaceExplorer: renderResourceSection method completed with null (no space)');
      return null;
    }
    
    // Define resources to display
    const resources = [
      { key: 'Time', label: 'Time' },
      { key: 'Fee', label: 'Fee' }
    ];
    
    // Filter to only resources that have values
    const resourcesToRender = resources.filter(resource => 
      this.hasValidValue(space[resource.key])
    );
    
    if (resourcesToRender.length === 0) {
      console.log('SpaceExplorer: renderResourceSection method completed with null (no resources)');
      return null;
    }
    
    console.log('SpaceExplorer: renderResourceSection method completed');
    return (
      <div className="explorer-resources-section">
        {resourcesToRender.map(resource => (
          <div key={resource.key} className="explorer-resource-item">
            <span className="resource-label">{resource.label}:</span>
            <span className="resource-value">{space[resource.key]}</span>
          </div>
        ))}
      </div>
    );
  }

  // Render movement choices section (space_1, space_2, etc.)
  renderMovementChoices() {
    console.log('SpaceExplorer: renderMovementChoices method is being used');
    
    const { space } = this.props;
    
    if (!space) {
      console.log('SpaceExplorer: renderMovementChoices method completed with null (no space)');
      return null;
    }
    
    // Define movement choice fields
    const choiceFields = ['space_1', 'space_2', 'space_3', 'space_4', 'space_5'];
    
    // Filter to only choices that have values
    const choicesToRender = choiceFields.filter(field => 
      this.hasValidValue(space[field])
    );
    
    if (choicesToRender.length === 0) {
      console.log('SpaceExplorer: renderMovementChoices method completed with null (no choices)');
      return null;
    }
    
    console.log('SpaceExplorer: renderMovementChoices method completed');
    return (
      <div className="explorer-choices-section">
        <h4>Movement Choices:</h4>
        {choicesToRender.map((field, index) => (
          <div key={field} className="explorer-choice-item">
            <span className="choice-number">{index + 1}.</span>
            <span className="choice-text">{space[field]}</span>
          </div>
        ))}
      </div>
    );
  }
  
  render() {
    console.log('SpaceExplorer: render method is being used');
    
    const { space } = this.props;
    const { hasError, errorMessage } = this.state;
    
    // Show error state if something went wrong
    if (hasError) {
      console.log('SpaceExplorer: render method completed with error UI');
      return (
        <div className="space-explorer error">
          <h3>Something went wrong</h3>
          <p>Error: {errorMessage}</p>
          <p>Please try again or select a different space.</p>
        </div>
      );
    }
    
    // Show placeholder if no space is selected
    if (!space) {
      console.log('SpaceExplorer: render method completed with placeholder UI');
      return (
        <div className="space-explorer empty">
          <div className="explorer-placeholder">
            <p>Click on any space on the board to explore details</p>
          </div>
        </div>
      );
    }

    try {
      console.log('SpaceExplorer: render method completed with space UI');
      return (
        <div className="space-explorer" data-type={space.phase ? space.phase.toUpperCase() : ''}>
          {this.renderHeader()}
          {this.renderSpaceMetadata()}
          {this.renderDiceRollIndicator()}
          {this.renderSpaceDetails()}
          {this.renderCardSection()}
          {this.renderResourceSection()}
          {this.renderMovementChoices()}
          {this.renderDiceTable()}
        </div>
      );
    } catch (error) {
      console.error('SpaceExplorer: Error in render method:', error.message, error.stack);
      
      // Update state and show the error UI
      this.setState({
        hasError: true,
        errorMessage: error.message || 'Unknown error occurred'
      });
      
      // Return a simple error UI for now (next render will show the full error UI)
      console.log('SpaceExplorer: render method completed with fallback error UI');
      return (
        <div className="space-explorer error">
          <h3>Rendering Error</h3>
          <p>Please try again.</p>
        </div>
      );
    }
  }
}

// Export SpaceExplorer component for use in other files
window.SpaceExplorer = SpaceExplorer;

console.log('SpaceExplorer.js code execution finished');
