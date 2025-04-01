// WorkCardDialogs.js - Components for Work (W) card dialogs
console.log('WorkCardDialogs.js file is beginning to be used');

// Work card dialog component for discard and replacement workflows
window.WorkCardDialog = class WorkCardDialog extends React.Component {
  render() {
    const { 
      cards, 
      isReplacingWCards, 
      requiredWDiscards, 
      requiredWReplacements,
      selectedForReplacement,
      discardedCount,
      onDialogDiscard,
      onSelectForReplacement,
      onConfirmReplacement
    } = this.props;
    
    // Filter W cards
    const wCards = cards.filter(card => card.type === 'W');
    
    // Calculate progress percentage for progress bar
    const progressPercentage = isReplacingWCards
      ? (selectedForReplacement.length / requiredWReplacements) * 100
      : (discardedCount / requiredWDiscards) * 100;
    
    // Determine how many more cards need to be selected/discarded
    const remainingCount = isReplacingWCards
      ? requiredWReplacements - selectedForReplacement.length
      : requiredWDiscards - discardedCount;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '90%',
          width: '600px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <h3 style={{
            margin: 0,
            color: '#d32f2f',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px'
          }}>
            {isReplacingWCards ? 'Replace W Cards' : 'Discard W Cards Required'}
          </h3>
          
          <div style={{
            fontSize: '1.1em',
            marginBottom: '10px'
          }}>
            {isReplacingWCards ? 
              `Select ${requiredWReplacements} Work Type (W) cards to replace with new ones:` :
              `You need to discard ${requiredWDiscards} Work Type (W) cards from your hand.`
            }
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '10px 0'
          }}>
            <span>Progress:</span>
            <div style={{
              flex: 1,
              height: '12px',
              backgroundColor: '#eee',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#4285f4',
                width: `${progressPercentage}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <span>
              {isReplacingWCards ? 
                `${selectedForReplacement.length}/${requiredWReplacements}` :
                `${discardedCount}/${requiredWDiscards}`
              }
            </span>
          </div>
          
          {/* List of available W cards to discard or replace */}
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Your W Cards:</h4>
            
            {wCards.length > 0 ? (
              wCards.map((card, index) => {
                // Find actual index in full cards array
                const actualIndex = cards.findIndex(c => c.id === card.id);
                const isSelected = selectedForReplacement.includes(actualIndex);
                
                return (
                  <div key={card.id || index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: isSelected ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: '4px',
                    border: isSelected ? '2px solid #2196f3' : '1px solid #4285f4'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{card['Work Type'] || 'Work Type Card'}</div>
                      <div style={{ fontSize: '0.9em' }}>{card['Job Description'] || ''}</div>
                      {card['Estimated Job Costs'] && (
                        <div style={{ color: '#666' }}>Est. Cost: ${card['Estimated Job Costs']}</div>
                      )}
                    </div>
                    {isReplacingWCards ? (
                      <button 
                        onClick={() => onSelectForReplacement(actualIndex)} 
                        style={{
                          backgroundColor: isSelected ? '#2196f3' : '#f5f5f5',
                          color: isSelected ? 'white' : '#333',
                          border: isSelected ? 'none' : '1px solid #2196f3',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => onDialogDiscard(actualIndex)} 
                        style={{
                          backgroundColor: '#d32f2f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          cursor: 'pointer'
                        }}
                      >
                        Discard
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#d32f2f' }}>
                <strong>Warning:</strong> You don't have any W cards to {isReplacingWCards ? 'replace' : 'discard'}.
              </div>
            )}
          </div>
          
          {/* Status information */}
          <div style={{
            color: wCards.length < remainingCount ? '#d32f2f' : '#333',
            marginTop: '10px'
          }}>
            {wCards.length >= remainingCount
              ? `You have ${wCards.length} W cards available.`
              : `WARNING: You only have ${wCards.length} W cards, but need ${isReplacingWCards ? 'to replace' : 'to discard'} ${remainingCount} more.`
            }
          </div>
          
          {/* Instructions */}
          <div style={{
            fontSize: '0.9em',
            color: '#555',
            fontStyle: 'italic',
            marginTop: '5px'
          }}>
            {isReplacingWCards
              ? `Select ${remainingCount} more W card${remainingCount !== 1 ? 's' : ''} to replace.`
              : `Please select and discard ${remainingCount} more W card${remainingCount !== 1 ? 's' : ''}.`
            }
          </div>
          
          {/* Confirm button for replacements */}
          {isReplacingWCards && selectedForReplacement.length > 0 && (
            <button 
              onClick={onConfirmReplacement}
              disabled={selectedForReplacement.length < requiredWReplacements}
              style={{
                backgroundColor: selectedForReplacement.length >= requiredWReplacements ? '#4caf50' : '#ddd',
                color: selectedForReplacement.length >= requiredWReplacements ? 'white' : '#999',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 15px',
                marginTop: '10px',
                cursor: selectedForReplacement.length >= requiredWReplacements ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              Confirm Replacement
            </button>
          )}
        </div>
      </div>
    );
  }
};

console.log('WorkCardDialogs.js code execution finished');
