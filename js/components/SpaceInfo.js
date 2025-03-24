// SpaceInfo component
class SpaceInfo extends React.Component {
  render() {
    const { space, visitType } = this.props;
    
    if (!space) {
      return <div className="space-info empty">No space selected</div>;
    }
    
    return (
      <div className="space-info">
        <h3>{space.name}</h3>
        <div className="space-type">{space.type}</div>
        <div className="space-description">{space.description}</div>
        
        {/* Show different info for first vs subsequent visits */}
        {visitType && space.visit && (
          <div className="visit-info">
            <h4>{visitType === 'first' ? 'First Visit' : 'Return Visit'}</h4>
            <p>{space.visit[visitType]?.description || 'No special actions'}</p>
          </div>
        )}
      </div>
    );
  }
}