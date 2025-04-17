// SpaceExplorer.js file is beginning to be used
console.log('SpaceExplorer.js file is beginning to be used');

// SpaceExplorer component for displaying details of spaces when exploring the board
class SpaceExplorer extends React.Component {
  renderDiceTable() {
    const { space, diceRollData } = this.props;
    
    if (!space || !diceRollData) return null;
    
    // Filter dice roll data for the current space
    const spaceDiceData = diceRollData.filter(data => 
      data['Space Name'] === space.name
    );
    
    if (spaceDiceData.length === 0) return null;
    
    // Log data for debugging
    console.log('Space Explorer: Found dice data for space:', space.name);
    console.log('Space Explorer: Dice data:', spaceDiceData);
    
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
                // Find the dice data for this roll
                const rollData = spaceDiceData.find(data => {
                  // Try different ways to match the dice value
                  const diceValue = data['Dice Value'] || data['Roll'] || data['Value'];
                  return diceValue && parseInt(diceValue) === roll;
                });
                
                // If no data for this roll, show N/A
                if (!rollData) {
                  return (
                    <tr key={roll}>
                      <td className="dice-roll">{roll}</td>
                      <td className="dice-outcome">N/A</td>
                    </tr>
                  );
                }
                
                // Get the outcome text - examine all fields to find relevant outcomes
                let outcomeText = '';
                const outcomeFields = [];
                
                // Log each entry's keys for debugging
                console.log(`Dice roll ${roll} data fields:`, Object.keys(rollData));
                
                // Check for move/next step outcomes (highest priority)
                if (rollData['Next Step'] && rollData['Next Step'] !== 'n/a') {
                  outcomeFields.push(`<span class="outcome-move">Move to: ${rollData['Next Step']}</span>`);
                }
                
                // Check for explicit Outcome field
                if (rollData['Outcome'] && rollData['Outcome'] !== 'n/a') {
                  outcomeFields.push(`<span class="outcome-general">${rollData['Outcome']}</span>`);
                }
                
                // Check for card outcomes
                ['W', 'B', 'I', 'L', 'E'].forEach(cardType => {
                  // Try different possible field names for card outcomes
                  const cardOutcome = 
                    rollData[`${cardType} Card`] || 
                    rollData[`${cardType} Cards`] || 
                    rollData[`${cardType}Card`] || 
                    rollData[`${cardType}Cards`] || 
                    rollData[`${cardType}CardOutcome`];
                  
                  if (cardOutcome && cardOutcome !== 'n/a' && cardOutcome !== '0') {
                    const cardName = {
                      'W': 'Work Card',
                      'B': 'Bank Card',
                      'I': 'Investor Card',
                      'L': 'Life Card',
                      'E': 'Expeditor Card'
                    }[cardType];
                    
                    outcomeFields.push(`<span class="outcome-card">${cardName}: ${cardOutcome}</span>`);
                  }
                });
                
                // Check for resource outcomes
                if (rollData['Fee'] && rollData['Fee'] !== 'n/a') {
                  outcomeFields.push(`<span class="outcome-resource">Fee: ${rollData['Fee']}</span>`);
                }
                
                if (rollData['Time'] && rollData['Time'] !== 'n/a') {
                  outcomeFields.push(`<span class="outcome-resource">Time: ${rollData['Time']}</span>`);
                }
                
                // Check for any other fields that might contain outcomes
                Object.entries(rollData).forEach(([key, value]) => {
                  // Skip fields we've already processed or that are metadata
                  const skipFields = ['Space Name', 'Dice Value', 'Roll', 'Value', 'Next Step', 'Outcome', 'Fee', 'Time'];
                  if (skipFields.includes(key) || key.includes('Card') || value === 'n/a' || value === '0') {
                    return;
                  }
                  
                  // Include any other field that looks like an outcome
                  if (value && typeof value === 'string' && value.trim() !== '') {
                    outcomeFields.push(`<span class="outcome-other">${key}: ${value}</span>`);
                  }
                });
                
                // Join all outcome fields with line breaks
                outcomeText = outcomeFields.join('<br>');
                
                // If no outcomes found, show a default message
                if (!outcomeText) {
                  outcomeText = 'No specific outcome';
                }
                
                return (
                  <tr key={roll}>
                    <td className="dice-roll">{roll}</td>
                    <td className="dice-outcome" dangerouslySetInnerHTML={{ __html: outcomeText }}></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  render() {
    const { space, visitType, onClose } = this.props;
    
    if (!space) {
      return (
        <div className="space-explorer empty">
          <div className="explorer-placeholder">
            <p>Click on any space on the board to explore details</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-explorer" data-type={space.type ? space.type.toUpperCase() : ''}>
        <div className="explorer-header">
          <h3 className="explorer-title">Space Explorer</h3>
          {onClose && (
            <button className="explorer-close-btn" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        <div className="explorer-space-name">{space.name}</div>
        <div className="explorer-visit-type">{visitType === 'first' ? 'First Visit' : 'Subsequent Visit'}</div>
        
        {/* Dice roll indicator */}
        {this.props.diceRollData && this.props.diceRollData.some(data => data['Space Name'] === space.name) && (
          <div className="explorer-dice-indicator">
            <span className="dice-icon"></span>
            <span className="dice-text">This space requires a dice roll</span>
          </div>
        )}
        
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
        
        {/* Card sections */}
        <div className="explorer-cards-section">
          {space['W Card'] && space['W Card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type work-card">W</span>
              <span className="card-text">{space['W Card']}</span>
            </div>
          )}
          
          {space['B Card'] && space['B Card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type business-card">B</span>
              <span className="card-text">{space['B Card']}</span>
            </div>
          )}
          
          {space['I Card'] && space['I Card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type innovation-card">I</span>
              <span className="card-text">{space['I Card']}</span>
            </div>
          )}
          
          {space['L card'] && space['L card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type leadership-card">L</span>
              <span className="card-text">{space['L card']}</span>
            </div>
          )}
          
          {space['E Card'] && space['E Card'] !== 'n/a' && (
            <div className="explorer-card-item">
              <span className="card-type environment-card">E</span>
              <span className="card-text">{space['E Card']}</span>
            </div>
          )}
        </div>
        
        {/* Resource sections */}
        <div className="explorer-resources-section">
          {space['Time'] && space['Time'] !== 'n/a' && (
            <div className="explorer-resource-item">
              <span className="resource-label">Time:</span>
              <span className="resource-value">{space['Time']}</span>
            </div>
          )}
          
          {space['Fee'] && space['Fee'] !== 'n/a' && (
            <div className="explorer-resource-item">
              <span className="resource-label">Fee:</span>
              <span className="resource-value">{space['Fee']}</span>
            </div>
          )}
        </div>
        
        {/* Dice roll data */}
        {this.renderDiceTable()}
      </div>
    );
  }
}

// Export SpaceExplorer component for use in other files
window.SpaceExplorer = SpaceExplorer;

console.log('SpaceExplorer.js code execution finished');
