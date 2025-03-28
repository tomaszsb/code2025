// SpaceInfo component
console.log('SpaceInfo.js file is being processed');

window.SpaceInfo = class SpaceInfo extends React.Component {
  render() {
    const { space, visitType } = this.props;
    
    if (!space) {
      return <div className="space-info empty">No space selected</div>;
    }
    
    // Determine which description to show based on visitType
    const descriptionToShow = (visitType && space.visit) 
      ? (space.visit[visitType]?.description || space.description)
      : space.description;
    
    // Create a list of fields to display
    const fieldMappings = [
      { key: 'action', label: 'Action' },
      { key: 'outcome', label: 'Outcome' },
      { key: 'W Card', label: 'W Card' },
      { key: 'B Card', label: 'B Card' },
      { key: 'I Card', label: 'I Card' },
      { key: 'L card', label: 'L Card' },
      { key: 'E Card', label: 'E Card' },
      { key: 'Time', label: 'Time' },
      { key: 'Fee', label: 'Fee' }
    ];
    
    return (
      <div className="space-info">
        <h3>{space.name}</h3>
        <div className="space-type">{space.type}</div>
        
        {/* Main description */}
        <div className="space-section">
          <div className="space-section-label">Description:</div>
          <div className="space-description">{descriptionToShow}</div>
        </div>
        
        {/* Additional fields */}
        {fieldMappings.map(field => {
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
      </div>
    );
  }
}

console.log('SpaceInfo.js execution complete');