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
 * - Integrated with GameStateManager event system
 * - Memoized processing of dice data for improved performance
 * - Enhanced error boundary implementation with detailed logging
 * - Comprehensive logging system for debugging
 * - Responsive layout that adjusts to content
 * - Proper cleanup method for event listeners
 */
class SpaceExplorer extends React.Component {
  constructor(props) {
    console.log('SpaceExplorer: constructor method is being used');
    
    super(props);
    // Initialize state with error information and processed data cache
    this.state = {
      hasError: false,
      errorMessage: '',
      // Cache for processed dice data to avoid reprocessing on every render
      processedDiceData: null,
      // Flag to track if data has been processed
      diceDataProcessed: false,
      // Space information now stored in state instead of props
      space: null,
      visitType: 'first',
      diceRollData: []
    };
    
    // Track performance metrics for debugging
    this.renderCount = 0;
    this.lastRenderTime = 0;
    
    // Store event handlers for proper cleanup
    this.eventHandlers = {
      spaceExplorerToggled: this.handleSpaceExplorerToggled.bind(this),
      playerMoved: this.handlePlayerMoved.bind(this),
      turnChanged: this.handleTurnChanged.bind(this),
      gameStateChanged: this.handleGameStateChanged.bind(this)
    };
    
    console.log('SpaceExplorer: constructor method completed');
  }
  
  // Component lifecycle method - called when component mounts
  componentDidMount() {
    console.log('SpaceExplorer: componentDidMount method is being used');
    
    // Register event listeners
    this.registerEventListeners();
    
    // If props contain initial space, process it
    if (this.props.space) {
      this.setState({ 
        space: this.props.space,
        visitType: this.props.visitType || 'first'
      });
    }
    
    // If props contain initial dice roll data, store it
    if (this.props.diceRollData) {
      this.setState({ diceRollData: this.props.diceRollData });
    } else {
      // Try to get dice roll data from window
      if (window.diceRollData) {
        this.setState({ diceRollData: window.diceRollData });
      }
    }
    
    console.log('SpaceExplorer: componentDidMount method completed');
  }
  
  // Register event listeners
  registerEventListeners() {
    console.log('SpaceExplorer: registerEventListeners method is being used');
    
    if (!window.GameStateManager) {
      console.error('SpaceExplorer: GameStateManager not available, cannot register events');
      return;
    }
    
    // Register event listeners with GameStateManager
    window.GameStateManager.addEventListener('spaceExplorerToggled', this.eventHandlers.spaceExplorerToggled);
    window.GameStateManager.addEventListener('playerMoved', this.eventHandlers.playerMoved);
    window.GameStateManager.addEventListener('turnChanged', this.eventHandlers.turnChanged);
    window.GameStateManager.addEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    
    console.log('SpaceExplorer: Event listeners registered with GameStateManager');
    console.log('SpaceExplorer: registerEventListeners method completed');
  }
  
  // Handle spaceExplorerToggled events from GameStateManager
  handleSpaceExplorerToggled(event) {
    console.log('SpaceExplorer: handleSpaceExplorerToggled method is being used');
    
    if (!event || !event.data) {
      console.warn('SpaceExplorer: Received invalid spaceExplorerToggled event');
      return;
    }
    
    const { visible, spaceName } = event.data;
    
    // If a space name is provided, find the space and update state
    if (spaceName) {
      // Get space by name
      const space = window.GameStateManager.findSpaceByName(spaceName);
      if (space) {
        // Get current player to determine visit type
        const currentPlayer = window.GameStateManager.getCurrentPlayer();
        const visitType = currentPlayer && 
                         window.GameStateManager.hasPlayerVisitedSpace(currentPlayer, space.name) ? 
                         'subsequent' : 'first';
        
        this.setState({ 
          space: space,
          visitType: visitType,
          // Reset dice data processed flag to trigger reprocessing
          diceDataProcessed: false
        });
      }
    }
    
    console.log('SpaceExplorer: handleSpaceExplorerToggled method completed');
  }
  
  // Handle playerMoved events from GameStateManager
  handlePlayerMoved(event) {
    console.log('SpaceExplorer: handlePlayerMoved method is being used');
    
    if (!event || !event.data) {
      console.warn('SpaceExplorer: Received invalid playerMoved event');
      return;
    }
    
    const { toSpaceId } = event.data;
    
    // Find the space by ID
    if (toSpaceId) {
      const space = window.GameStateManager.findSpaceById(toSpaceId);
      
      if (space) {
        // Get current player
        const currentPlayer = window.GameStateManager.getCurrentPlayer();
        
        // Determine visit type
        const visitType = currentPlayer && 
                         window.GameStateManager.hasPlayerVisitedSpace(currentPlayer, space.name) ? 
                         'subsequent' : 'first';
        
        // Update state
        this.setState({ 
          space: space,
          visitType: visitType,
          // Reset dice data processed flag to trigger reprocessing
          diceDataProcessed: false
        });
      }
    }
    
    console.log('SpaceExplorer: handlePlayerMoved method completed');
  }
// Handle turnChanged events from GameStateManager
  handleTurnChanged(event) {
    console.log('SpaceExplorer: handleTurnChanged method is being used');
    
    // Get current player
    const currentPlayer = window.GameStateManager.getCurrentPlayer();
    
    if (currentPlayer && currentPlayer.position) {
      // Find current space
      const space = window.GameStateManager.findSpaceById(currentPlayer.position);
      
      if (space) {
        // Determine visit type
        const visitType = window.GameStateManager.hasPlayerVisitedSpace(currentPlayer, space.name) ? 
                         'subsequent' : 'first';
        
        // Update state
        this.setState({ 
          space: space,
          visitType: visitType,
          // Reset dice data processed flag to trigger reprocessing
          diceDataProcessed: false
        });
      }
    }
    
    console.log('SpaceExplorer: handleTurnChanged method completed');
  }
  
  // Handle gameStateChanged events from GameStateManager
  handleGameStateChanged(event) {
    console.log('SpaceExplorer: handleGameStateChanged method is being used');
    
    if (!event || !event.data) {
      console.warn('SpaceExplorer: Received invalid gameStateChanged event');
      return;
    }
    
    // Handle new game events
    if (event.data.changeType === 'newGame') {
      // Reset state for new game
      this.setState({
        space: null,
        visitType: 'first',
        processedDiceData: null,
        diceDataProcessed: false
      });
    }
    
    console.log('SpaceExplorer: handleGameStateChanged method completed');
  }

  // Component lifecycle method - called when props or state change
  componentDidUpdate(prevProps, prevState) {
    console.log('SpaceExplorer: componentDidUpdate method is being used');
    
    const { space, visitType, diceRollData, diceDataProcessed } = this.state;
    
    // Check if we received diceRollData via props
    if (this.props.diceRollData && this.props.diceRollData !== prevProps.diceRollData) {
      this.setState({ 
        diceRollData: this.props.diceRollData,
        diceDataProcessed: false // Force reprocessing with new data
      });
    }
    
    // Check if we received space via props
    if (this.props.space && this.props.space !== prevProps.space) {
      this.setState({ 
        space: this.props.space,
        visitType: this.props.visitType || 'first',
        diceDataProcessed: false // Force reprocessing with new space
      });
    }
    
    // Only reprocess dice data if relevant state has changed
    if (
      space !== prevState.space || 
      diceRollData !== prevState.diceRollData ||
      visitType !== prevState.visitType ||
      !diceDataProcessed
    ) {
      console.log('SpaceExplorer: Relevant state changed, reprocessing dice data');
      
      if (space && diceRollData) {
        try {
          // Process dice data and update state
          const processedData = this.processDiceData(space, diceRollData);
          this.setState({ 
            processedDiceData: processedData,
            diceDataProcessed: true
          });
        } catch (error) {
          console.error('SpaceExplorer: Error processing dice data on update:', error.message);
          this.setState({ 
            processedDiceData: null,
            diceDataProcessed: true
          });
        }
      } else {
        // Clear processed data if space or diceRollData is not available
        this.setState({ 
          processedDiceData: null,
          diceDataProcessed: true
        });
      }
    }
    
    // Performance tracking for debugging
    this.renderCount++;
    const currentTime = performance.now();
    if (this.lastRenderTime > 0) {
      const renderInterval = currentTime - this.lastRenderTime;
      if (renderInterval < 100) {
        console.warn('SpaceExplorer: Multiple renders occurring rapidly, interval:', renderInterval.toFixed(2), 'ms');
      }
    }
    this.lastRenderTime = currentTime;
    
    console.log('SpaceExplorer: componentDidUpdate method completed');
  }
  
  // Clean up resources when component unmounts
  componentWillUnmount() {
    console.log('SpaceExplorer: componentWillUnmount method is being used');
    
    // Clean up event listeners
    this.cleanup();
    
    console.log('SpaceExplorer: componentWillUnmount method completed');
  }
  
  // Cleanup method to remove event listeners
  cleanup() {
    console.log('SpaceExplorer: cleanup method is being used');
    
    if (window.GameStateManager) {
      // Remove all event listeners
      window.GameStateManager.removeEventListener('spaceExplorerToggled', this.eventHandlers.spaceExplorerToggled);
      window.GameStateManager.removeEventListener('playerMoved', this.eventHandlers.playerMoved);
      window.GameStateManager.removeEventListener('turnChanged', this.eventHandlers.turnChanged);
      window.GameStateManager.removeEventListener('gameStateChanged', this.eventHandlers.gameStateChanged);
    }
    
    console.log('SpaceExplorer: cleanup method completed');
  }

  // Enhanced error boundary implementation
  componentDidCatch(error, info) {
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
      console.log('SpaceExplorer: clarifyCardText method completed - empty text');
      return '';
    }
    
    // Handle "Draw X" pattern to clarify card type
    if (text.match(/^Draw\s+\d+$/i)) {
      const match = text.match(/^Draw\s+(\d+)$/i);
      if (match && match[1]) {
        const count = match[1];
        console.log('SpaceExplorer: clarifyCardText method completed - Draw X pattern');
        return `Draw ${count} Work Cards`;
      }
    }
    
    console.log('SpaceExplorer: clarifyCardText method completed');
    return text;
  }
// Process dice data for the current space - optimized with better error handling
  processDiceData(space, diceRollData) {
    console.log('SpaceExplorer: processDiceData method is being used');
    
    if (!space || !diceRollData) {
      console.log('SpaceExplorer: No space or dice roll data provided for processing');
      console.log('SpaceExplorer: processDiceData method completed - no data');
      return null;
    }
    
    try {
      // Get current visit type with appropriate fallback
      const visitType = space.visitType && space.visitType.toLowerCase();
      
      if (!visitType) {
        console.warn('SpaceExplorer: Visit type not defined for space:', space.name);
        console.log('SpaceExplorer: processDiceData method completed - no visit type');
        return null;
      }
      
      console.log('SpaceExplorer: Processing dice data for space:', space.name, 'visit type:', visitType);
      
      // Only show outcomes that match both space name AND visit type (strict matching)
      const spaceDiceData = diceRollData.filter(data => 
        data['Space Name'] === space.name && 
        data['Visit Type'].toLowerCase() === visitType
      );
      
      if (spaceDiceData.length === 0) {
        console.log('SpaceExplorer: No dice data found for', space.name, 'with visit type', visitType);
        console.log('SpaceExplorer: processDiceData method completed - no matching dice data');
        return null;
      }
      
      console.log('SpaceExplorer: Found', spaceDiceData.length, 'dice data entries for space:', space.name);
      
      // Create a map of roll values to outcomes by outcome type
      const rollOutcomes = {};
      
      // For each die roll 1-6, gather all outcome types
      for (let roll = 1; roll <= 6; roll++) {
        rollOutcomes[roll] = {};
        
        // Process each dice data entry for this roll
        spaceDiceData.forEach(data => {
          const outcomeType = data['Die Roll'];
          const outcomeValue = data[roll.toString()];
          
          // Only add if value exists and is not 'n/a'
          if (this.hasValidValue(outcomeValue)) {
            rollOutcomes[roll][outcomeType] = outcomeValue;
          }
        });
      }
      
      console.log('SpaceExplorer: Processed roll outcomes successfully');
      console.log('SpaceExplorer: processDiceData method completed');
      return rollOutcomes;
    } catch (error) {
      console.error('SpaceExplorer: Error processing dice data:', error.message, error.stack);
      console.log('SpaceExplorer: processDiceData method completed - error occurred');
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
      console.log('SpaceExplorer: No processed dice data available for rendering');
      console.log('SpaceExplorer: renderDiceTable method completed - no data');
      return null;
    }
    
    console.log('SpaceExplorer: Rendering dice table with processed data');
    
    const diceTable = (
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
                    <tr key={roll}>
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
    
    console.log('SpaceExplorer: renderDiceTable method completed');
    return diceTable;
  }
// Render the header section with title and close button
  renderHeader() {
    console.log('SpaceExplorer: renderHeader method is being used');
    
    const header = (
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
    
    console.log('SpaceExplorer: renderHeader method completed');
    return header;
  }
  
  // Handle close explorer button click - uses event system
  handleCloseExplorer = () => {
    console.log('SpaceExplorer: handleCloseExplorer method is being used');
    
    // Call props.onClose if available (backward compatibility)
    if (this.props.onClose && typeof this.props.onClose === 'function') {
      this.props.onClose();
    }
    
    // Dispatch event using GameStateManager
    if (window.GameStateManager) {
      window.GameStateManager.dispatchEvent('spaceExplorerToggled', {
        visible: false,
        spaceName: ''
      });
    }
    
    console.log('SpaceExplorer: handleCloseExplorer method completed');
  }

  // Render space metadata (name and visit type)
  renderSpaceMetadata() {
    console.log('SpaceExplorer: renderSpaceMetadata method is being used');
    
    const { space, visitType } = this.state;
    
    if (!space) {
      console.log('SpaceExplorer: renderSpaceMetadata method completed - no space');
      return null;
    }
    
    const metadata = (
      <>
        <div className="explorer-space-name">{space.name}</div>
        <div className="explorer-visit-type">
          {visitType === 'first' ? 'First Visit' : 'Subsequent Visit'}
        </div>
      </>
    );
    
    console.log('SpaceExplorer: renderSpaceMetadata method completed');
    return metadata;
  }

  // Render dice roll indicator if applicable
  renderDiceRollIndicator() {
    console.log('SpaceExplorer: renderDiceRollIndicator method is being used');
    
    const { processedDiceData } = this.state;
    
    // If no processed dice data, don't show indicator
    if (!processedDiceData) {
      console.log('SpaceExplorer: renderDiceRollIndicator method completed - no indicator');
      return null;
    }
    
    const indicator = (
      <div className="explorer-dice-indicator">
        <span className="dice-icon"></span>
        <span className="dice-text">This space requires a dice roll</span>
      </div>
    );
    
    console.log('SpaceExplorer: renderDiceRollIndicator method completed');
    return indicator;
  }

  // Render space description, action, and outcome sections
  renderSpaceDetails() {
    console.log('SpaceExplorer: renderSpaceDetails method is being used');
    
    const { space } = this.state;
    
    if (!space) {
      console.log('SpaceExplorer: renderSpaceDetails method completed - no space');
      return null;
    }
    
    const details = (
      <>
        {space.description && (
          <div className="explorer-section">
            <h4>Description:</h4>
            <div className="explorer-description">{space.description}</div>
          </div>
        )}
        
        {space.action && (
          <div className="explorer-section">
            <h4>Action:</h4>
            <div className="explorer-action">{space.action}</div>
          </div>
        )}
        
        {space.outcome && (
          <div className="explorer-section">
            <h4>Outcome:</h4>
            <div className="explorer-outcome">{space.outcome}</div>
          </div>
        )}
      </>
    );
    
    console.log('SpaceExplorer: renderSpaceDetails method completed');
    return details;
  }

  // Render card sections using a data-driven approach
  renderCardSection() {
    console.log('SpaceExplorer: renderCardSection method is being used');
    
    const { space } = this.state;
    
    if (!space) {
      console.log('SpaceExplorer: renderCardSection method completed - no space');
      return null;
    }
    
    // Define card types and their styles
    const cardTypes = [
      { key: 'W Card', type: 'W', className: 'work-card' },
      { key: 'B Card', type: 'B', className: 'business-card' },
      { key: 'I Card', type: 'I', className: 'innovation-card' },
      { key: 'L card', type: 'L', className: 'leadership-card' },
      { key: 'E Card', type: 'E', className: 'environment-card' }
    ];
    
    // Filter to only cards that have values
    const cardsToRender = cardTypes.filter(card => 
      this.hasValidValue(space[card.key])
    );
    
    if (cardsToRender.length === 0) {
      console.log('SpaceExplorer: renderCardSection method completed - no cards');
      return null;
    }
    
    const cardSection = (
      <div className="explorer-cards-section">
        {cardsToRender.map(card => (
          <div key={card.key} className="explorer-card-item">
            <span className={`card-type ${card.className}`}>{card.type}</span>
            <span className="card-text">{this.clarifyCardText(space[card.key])}</span>
          </div>
        ))}
      </div>
    );
    
    console.log('SpaceExplorer: renderCardSection method completed');
    return cardSection;
  }

  // Render resource section (Time and Fee)
  renderResourceSection() {
    console.log('SpaceExplorer: renderResourceSection method is being used');
    
    const { space } = this.state;
    
    if (!space) {
      console.log('SpaceExplorer: renderResourceSection method completed - no space');
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
      console.log('SpaceExplorer: renderResourceSection method completed - no resources');
      return null;
    }
    
    const resourceSection = (
      <div className="explorer-resources-section">
        {resourcesToRender.map(resource => (
          <div key={resource.key} className="explorer-resource-item">
            <span className="resource-label">{resource.label}:</span>
            <span className="resource-value">{space[resource.key]}</span>
          </div>
        ))}
      </div>
    );
    
    console.log('SpaceExplorer: renderResourceSection method completed');
    return resourceSection;
  }
  
  render() {
    console.log('SpaceExplorer: render method is being used');
    
    const { space } = this.state;
    const { hasError, errorMessage } = this.state;
    
    // Show error state if something went wrong
    if (hasError) {
      console.error('SpaceExplorer: Rendering error screen due to caught error');
      
      const errorUi = (
        <div className="space-explorer error">
          <h3>Something went wrong</h3>
          <p>Error: {errorMessage}</p>
          <p>Please try again or select a different space.</p>
        </div>
      );
      
      console.log('SpaceExplorer: render method completed - error screen');
      return errorUi;
    }
    
    // Show placeholder if no space is selected
    if (!space) {
      console.log('SpaceExplorer: Rendering empty state - no space selected');
      
      const emptyState = (
        <div className="space-explorer empty">
          <div className="explorer-placeholder">
            <p>Click on any space on the board to explore details</p>
          </div>
        </div>
      );
      
      console.log('SpaceExplorer: render method completed - empty state');
      return emptyState;
    }

    // Log space being rendered
    console.log('SpaceExplorer: Rendering space:', space.name, 'type:', space.type || 'unknown');
    
    try {
      const explorer = (
        <div className="space-explorer" data-type={space.type ? space.type.toUpperCase() : ''}>
          {this.renderHeader()}
          {this.renderSpaceMetadata()}
          {this.renderDiceRollIndicator()}
          {this.renderSpaceDetails()}
          {this.renderCardSection()}
          {this.renderResourceSection()}
          {this.renderDiceTable()}
        </div>
      );
      
      console.log('SpaceExplorer: render method completed - normal render');
      return explorer;
    } catch (error) {
      console.error('SpaceExplorer: Error in render method:', error.message, error.stack);
      
      // Update state and show the error UI
      this.setState({
        hasError: true,
        errorMessage: error.message || 'Unknown error occurred'
      });
      
      // Return a simple error UI for now (next render will show the full error UI)
      const simpleErrorUi = (
        <div className="space-explorer error">
          <h3>Rendering Error</h3>
          <p>Please try again.</p>
        </div>
      );
      
      console.log('SpaceExplorer: render method completed - simple error UI');
      return simpleErrorUi;
    }
  }
}

// Export SpaceExplorer component for use in other files
window.SpaceExplorer = SpaceExplorer;

console.log('SpaceExplorer.js code execution finished');