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
 * - Memoized processing of dice data for improved performance
 * - Enhanced error boundary implementation with detailed logging
 * - Comprehensive logging system for debugging
 * - Responsive layout that adjusts to content
 */
class SpaceExplorer extends React.Component {
  constructor(props) {
    super(props);
    // Initialize state with error information and processed data cache
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
    
    this.logDebug('Component instance created');
  }

  // Component lifecycle method - called when props change
  componentDidUpdate(prevProps) {
    const { space, diceRollData, visitType } = this.props;
    
    // Only reprocess dice data if relevant props have changed
    if (
      space !== prevProps.space || 
      diceRollData !== prevProps.diceRollData ||
      visitType !== prevProps.visitType ||
      !this.state.diceDataProcessed
    ) {
      this.logDebug('Relevant props changed, reprocessing dice data');
      
      if (space && diceRollData) {
        try {
          // Process dice data and update state
          const processedData = this.processDiceData(space, diceRollData);
          this.setState({ 
            processedDiceData: processedData,
            diceDataProcessed: true
          });
        } catch (error) {
          this.logError('Error processing dice data on update:', error.message);
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
        this.logWarn('Multiple renders occurring rapidly, interval:', renderInterval.toFixed(2), 'ms');
      }
    }
    this.lastRenderTime = currentTime;
  }

  // Enhanced error boundary implementation
  componentDidCatch(error, info) {
    this.logError('Error caught in SpaceExplorer:', error.message, info);
    
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

  // Structured logging methods with timestamp for better debugging
  logDebug(message, ...args) {
    const timestamp = new Date().toISOString().substring(11, 23);
    console.log(`[${timestamp}] SpaceExplorer [DEBUG]: ${message}`, ...args);
  }
  
  logInfo(message, ...args) {
    const timestamp = new Date().toISOString().substring(11, 23);
    console.log(`[${timestamp}] SpaceExplorer [INFO]: ${message}`, ...args);
  }
  
  logWarn(message, ...args) {
    const timestamp = new Date().toISOString().substring(11, 23);
    console.warn(`[${timestamp}] SpaceExplorer [WARN]: ${message}`, ...args);
  }
  
  logError(message, ...args) {
    const timestamp = new Date().toISOString().substring(11, 23);
    console.error(`[${timestamp}] SpaceExplorer [ERROR]: ${message}`, ...args);
  }

  // Helper function to check if a value exists and is not 'n/a'
  hasValidValue(value) {
    return value && value !== 'n/a' && value.trim() !== '';
  }

  // Helper to clarify card draw text
  clarifyCardText(text) {
    if (!text) return '';
    
    // Handle "Draw X" pattern to clarify card type
    if (text.match(/^Draw\s+\d+$/i)) {
      const match = text.match(/^Draw\s+(\d+)$/i);
      if (match && match[1]) {
        const count = match[1];
        return `Draw ${count} Work Cards`;
      }
    }
    
    return text;
  }
  
  // Process dice data for the current space - optimized with better error handling
  processDiceData(space, diceRollData) {
    if (!space || !diceRollData) {
      this.logInfo('No space or dice roll data provided for processing');
      return null;
    }
    
    try {
      // Get current visit type with appropriate fallback
      const visitType = space.visitType && space.visitType.toLowerCase();
      
      if (!visitType) {
        this.logWarn('Visit type not defined for space:', space.name);
        return null;
      }
      
      this.logDebug('Processing dice data for space:', space.name, 'visit type:', visitType);
      
      // Only show outcomes that match both space name AND visit type (strict matching)
      const spaceDiceData = diceRollData.filter(data => 
        data['Space Name'] === space.name && 
        data['Visit Type'].toLowerCase() === visitType
      );
      
      if (spaceDiceData.length === 0) {
        this.logInfo('No dice data found for', space.name, 'with visit type', visitType);
        return null;
      }
      
      this.logInfo('Found', spaceDiceData.length, 'dice data entries for space:', space.name);
      
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
      
      this.logDebug('Processed roll outcomes successfully');
      return rollOutcomes;
    } catch (error) {
      this.logError('Error processing dice data:', error.message, error.stack);
      return null;
    }
  }

  // Create outcome element for dice roll result - safer than using HTML strings
  createOutcomeElement(type, value, key) {
    // Determine appropriate CSS class based on outcome type
    let className = 'outcome-other';
    
    if (type.includes('Move')) {
      className = 'outcome-move';
    } else if (type.includes('Card')) {
      className = 'outcome-card';
    } else if (type.includes('Time') || type.includes('Fee')) {
      className = 'outcome-resource';
    }
                      
    return (
      <div key={key} className={className}>
        {type}: {value}
      </div>
    );
  }

  // Render dice roll table with outcomes - using memoized data
  renderDiceTable() {
    const { processedDiceData } = this.state;
    
    if (!processedDiceData) {
      this.logDebug('No processed dice data available for rendering');
      return null;
    }
    
    this.logDebug('Rendering dice table with processed data');
    
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
  }

  // Render the header section with title and close button
  renderHeader() {
    const { onClose } = this.props;
    
    return (
      <div className="explorer-header">
        <h3 className="explorer-title">Space Explorer</h3>
        {onClose && (
          <button 
            className="explorer-close-btn" 
            onClick={onClose}
            aria-label="Close space explorer"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  // Render space metadata (name and visit type)
  renderSpaceMetadata() {
    const { space, visitType } = this.props;
    
    if (!space) return null;
    
    return (
      <>
        <div className="explorer-space-name">{space.name}</div>
        <div className="explorer-visit-type">
          {visitType === 'first' ? 'First Visit' : 'Subsequent Visit'}
        </div>
      </>
    );
  }

  // Render dice roll indicator if applicable
  renderDiceRollIndicator() {
    const { processedDiceData } = this.state;
    
    // If no processed dice data, don't show indicator
    if (!processedDiceData) return null;
    
    return (
      <div className="explorer-dice-indicator">
        <span className="dice-icon"></span>
        <span className="dice-text">This space requires a dice roll</span>
      </div>
    );
  }

  // Render space description, action, and outcome sections
  renderSpaceDetails() {
    const { space } = this.props;
    
    if (!space) return null;
    
    return (
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
  }

  // Render card sections using a data-driven approach
  renderCardSection() {
    const { space } = this.props;
    
    if (!space) return null;
    
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
    
    if (cardsToRender.length === 0) return null;
    
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
    const { space } = this.props;
    
    if (!space) return null;
    
    // Define resources to display
    const resources = [
      { key: 'Time', label: 'Time' },
      { key: 'Fee', label: 'Fee' }
    ];
    
    // Filter to only resources that have values
    const resourcesToRender = resources.filter(resource => 
      this.hasValidValue(space[resource.key])
    );
    
    if (resourcesToRender.length === 0) return null;
    
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
  
  render() {
    const { space } = this.props;
    const { hasError, errorMessage } = this.state;
    
    // Show error state if something went wrong
    if (hasError) {
      this.logError('Rendering error screen due to caught error');
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
      this.logInfo('Rendering empty state - no space selected');
      return (
        <div className="space-explorer empty">
          <div className="explorer-placeholder">
            <p>Click on any space on the board to explore details</p>
          </div>
        </div>
      );
    }

    // Log space being rendered
    this.logInfo('Rendering space:', space.name, 'type:', space.type || 'unknown');
    
    try {
      return (
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
    } catch (error) {
      this.logError('Error in render method:', error.message, error.stack);
      
      // Update state and show the error UI
      this.setState({
        hasError: true,
        errorMessage: error.message || 'Unknown error occurred'
      });
      
      // Return a simple error UI for now (next render will show the full error UI)
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
