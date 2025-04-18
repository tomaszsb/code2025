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
 * - Close button functionality (uses the onClose prop from GameBoard.handleCloseExplorer)
 * - Error boundary implementation for robust error handling
 * - Structured logging for improved debugging
 * - Responsive layout that adjusts to content
 */
class SpaceExplorer extends React.Component {
  constructor(props) {
    super(props);
    // Initialize any error state
    this.state = {
      hasError: false,
      errorMessage: ''
    };
    this.logDebug('Component instance created');
  }

  // Error boundary implementation
  componentDidCatch(error, info) {
    this.logError('Error caught in SpaceExplorer:', error.message, info);
    this.setState({
      hasError: true,
      errorMessage: error.message
    });
  }

  // Structured logging methods for better debugging
  logDebug(message, ...args) {
    console.log(`SpaceExplorer [DEBUG]: ${message}`, ...args);
  }
  
  logInfo(message, ...args) {
    console.log(`SpaceExplorer [INFO]: ${message}`, ...args);
  }
  
  logWarn(message, ...args) {
    console.warn(`SpaceExplorer [WARN]: ${message}`, ...args);
  }
  
  logError(message, ...args) {
    console.error(`SpaceExplorer [ERROR]: ${message}`, ...args);
  }

  // Helper function to check if a value exists and is not 'n/a'
  hasValidValue(value) {
    return value && value !== 'n/a';
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
  
  // Process dice data for the current space
  processDiceData(space, diceRollData) {
    if (!space || !diceRollData) return null;
    
    try {
      // Filter dice roll data for the current space
      const spaceDiceData = diceRollData.filter(data => 
        data['Space Name'] === space.name
      );
      
      if (spaceDiceData.length === 0) return null;
      
      this.logInfo('Found dice data for space:', space.name);
      this.logDebug('Dice data count:', spaceDiceData.length);
      
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
      
      this.logDebug('Processed roll outcomes:', rollOutcomes);
      return rollOutcomes;
    } catch (error) {
      this.logError('Error processing dice data:', error);
      return null;
    }
  }

  // Create outcome element for dice roll result - safer than using HTML strings
  createOutcomeElement(type, value, key) {
    const className = type.includes('Move') ? 'outcome-move' : 
                      type.includes('Card') ? 'outcome-card' :
                      type.includes('Time') || type.includes('Fee') ? 'outcome-resource' : 
                      'outcome-other';
                      
    return (
      <div key={key} className={className}>
        {type}: {value}
      </div>
    );
  }

  // Render dice roll table with outcomes
  renderDiceTable() {
    const { space, diceRollData } = this.props;
    
    const rollOutcomes = this.processDiceData(space, diceRollData);
    if (!rollOutcomes) return null;
    
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
                const outcomes = rollOutcomes[roll];
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
                  <tr key={roll}>
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
          <button className="explorer-close-btn" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    );
  }

  // Render space metadata (name and visit type)
  renderSpaceMetadata() {
    const { space, visitType } = this.props;
    
    return (
      <>
        <div className="explorer-space-name">{space.name}</div>
        <div className="explorer-visit-type">{visitType === 'first' ? 'First Visit' : 'Subsequent Visit'}</div>
      </>
    );
  }

  // Render dice roll indicator if applicable
  renderDiceRollIndicator() {
    const { space, diceRollData } = this.props;
    
    if (!diceRollData || !diceRollData.some(data => data['Space Name'] === space.name)) {
      return null;
    }
    
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
    
    return (
      <>
        <div className="explorer-section">
          <h4>Description:</h4>
          <div className="explorer-description">{space.description}</div>
        </div>
        
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
    
    // Show error state if something went wrong
    if (this.state.hasError) {
      return (
        <div className="space-explorer error">
          <h3>Something went wrong</h3>
          <p>Error: {this.state.errorMessage}</p>
          <p>Please try again or select a different space.</p>
        </div>
      );
    }
    
    // Show placeholder if no space is selected
    if (!space) {
      return (
        <div className="space-explorer empty">
          <div className="explorer-placeholder">
            <p>Click on any space on the board to explore details</p>
          </div>
        </div>
      );
    }

    // Log space being rendered
    this.logInfo('Rendering space:', space.name, 'type:', space.type);
    
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
      this.logError('Error in render method:', error);
      
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
