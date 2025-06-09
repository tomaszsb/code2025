// DiceRoll.js - Component for dice rolling mechanic
console.log('DiceRoll.js file is beginning to be used');

window.DiceRoll = class DiceRoll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rolling: false,
      result: null,
      diceHistory: [],
      availableMoves: [],
      diceOutcomes: [],
      rollPhase: 'ready', // ready, rolling, results
      animationStep: 0,   // For multi-step animations
      animationClass: null // CSS class for animations
    };
    
    // Create a ref to the dice element for animations
    this.diceRef = React.createRef();
  }

  componentDidMount() {
    console.log('DiceRoll: Component is being mounted and initialized');
    // Load dice roll data for current space
    this.loadDiceOutcomes();
    console.log('DiceRoll: Component mount completed');
  }

  componentDidUpdate(prevProps) {
    // If the space or visit type has changed, reload the dice outcomes
    if (prevProps.space?.name !== this.props.space?.name || 
        prevProps.visitType !== this.props.visitType) {
      console.log('DiceRoll: Props changed, reloading dice outcomes');
      this.loadDiceOutcomes();
    }
  }

  // Load dice roll outcomes for the current space
  loadDiceOutcomes = () => {
    console.log('DiceRoll: Loading dice outcomes starting');
    const { space, visitType } = this.props;
    
    if (!space) {
      console.log('DiceRoll: No space available, skipping outcome loading');
      return;
    }
    
    console.log('DiceRoll: Searching for outcomes for space:', space.space_name, 'visit type:', visitType);
    
    // Get all dice roll data from DiceRollLogic
    const diceRollData = window.DiceRollLogic.diceRollData;
    
    if (!diceRollData || diceRollData.length === 0) {
      console.log('DiceRoll: No dice roll data available');
      this.setState({ diceOutcomes: [] });
      return;
    }
    
    // Find exact matches for space name and visit type - no fallbacks
    const outcomes = diceRollData.filter(data => 
      data['space_name'] === space.space_name && 
      data['visit_type'].toLowerCase() === visitType.toLowerCase()
    );
    
    // If no outcomes found, set empty array and log it
    if (outcomes.length === 0) {
      console.log('DiceRoll: No outcomes found for', space.space_name, visitType, '- showing no dice roll');
      this.setState({ diceOutcomes: [] });
      return;
    }
    
    console.log('DiceRoll: Found', outcomes.length, 'matching dice outcomes');
    
    // Store outcomes in state to use when dice is rolled
    this.setState({ diceOutcomes: outcomes });
    console.log('DiceRoll: Loading dice outcomes completed');
  }

  rollDice = () => {
    console.log('DiceRoll: Rolling dice starting');
    // Start rolling animation
    this.setState({ 
      rolling: true, 
      result: null,
      rollPhase: 'rolling',
      animationStep: 0
    });
    
    // Create a more engaging dice roll animation with multiple steps
    const rollAnimation = () => {
      // Update animation step
      this.setState(prevState => {
        const newStep = prevState.animationStep + 1;
        return {
          animationStep: newStep,
          // Use CSS classes for animations instead of direct style manipulation
          animationClass: `dice-transform-${newStep % 5}`
        };
      });
    };
    
    // Start animation interval
    const animationInterval = setInterval(rollAnimation, 200);
    
    // Generate random number between 1 and 6 after animation
    setTimeout(() => {
      clearInterval(animationInterval);
      
      const result = Math.floor(Math.random() * 6) + 1;
      console.log('DiceRoll: Dice roll result:', result);
      
      // Add result to history
      const diceHistory = [...this.state.diceHistory, result];
      
      // Process result to determine outcomes
      console.log('DiceRoll: Processing roll outcome');
      const outcomes = this.processRollOutcome(result);
      
      // Update state with result
      this.setState({ 
        rolling: false, 
        result,
        diceHistory,
        availableMoves: outcomes.moves || [],
        rollPhase: 'results'
      });
      
      // Call the callback with the results
      if (this.props.onRollComplete) {
        console.log('DiceRoll: Notifying parent component of roll completion');
        this.props.onRollComplete(result, outcomes);
      }
      
      console.log('DiceRoll: Rolling dice completed');
    }, 1200); // Longer animation time for better visual effect
  }

  // Process the dice roll result to determine game outcomes
  processRollOutcome = (rollResult) => {
    const { space, visitType, onShowOutcomes } = this.props;
    const { diceOutcomes } = this.state;
    
    console.log('DiceRoll: Processing roll', rollResult, 'for space', space.space_name, 'visit type', visitType);
    console.log('DiceRoll: Available outcomes:', diceOutcomes);
    
    if (!space) {
      console.log('DiceRoll: No space available');
      return { moves: [] };
    }
    
    if (!diceOutcomes || diceOutcomes.length === 0) {
      console.log('DiceRoll: No outcomes available');
      return { moves: [] };
    }
    
    // Process the outcomes manually for more control
    const outcomes = {};
    
    // Process each dice outcome data row
    for (const outcomeData of diceOutcomes) {
      const dieRollType = outcomeData['die_roll'];
      const outcomeValue = outcomeData[rollResult.toString()];
      
      console.log('DiceRoll: Processing outcome type', dieRollType, 'value:', outcomeValue);
      
      if (outcomeValue && outcomeValue.trim() !== '' && outcomeValue !== 'n/a') {
        // Special case for W Cards Discard outcome
        if (dieRollType === 'W Cards Discard' || dieRollType === 'discard W Cards') {
          outcomes.discardWCards = outcomeValue;
          console.log('DiceRoll: Detected W cards discard requirement:', outcomeValue);
        }
        // Transform card type outcomes to format expected by DiceManager
        else if (dieRollType.includes(' Cards') || dieRollType.includes(' cards')) {
          // Extract card type (W, B, I, L, E) from outcome type
          let cardType = '';
          if (dieRollType.includes('W Cards')) cardType = 'W';
          else if (dieRollType.includes('B Cards')) cardType = 'B';
          else if (dieRollType.includes('I Cards')) cardType = 'I';
          else if (dieRollType.includes('L Cards')) cardType = 'L';
          else if (dieRollType.includes('E Cards') || dieRollType.includes('E cards')) cardType = 'E';
          
          if (cardType) {
            // Convert "Draw 2" to just "2" for DiceManager
            const drawMatch = outcomeValue.match(/Draw\s+(\d+)/i);
            if (drawMatch) {
              outcomes[`${cardType}CardOutcome`] = drawMatch[1];
              console.log(`DiceRoll: Converted ${dieRollType} "${outcomeValue}" to ${cardType}CardOutcome = ${drawMatch[1]}`);
            } else {
              outcomes[`${cardType}CardOutcome`] = outcomeValue;
            }
          } else {
            outcomes[dieRollType] = outcomeValue;
          }
        } else {
          outcomes[dieRollType] = outcomeValue;
        }
      }
    }
    
    console.log('DiceRoll: Processed outcomes:', outcomes);
    
    // Pass the outcomes to the SpaceInfo component if callback exists
    if (onShowOutcomes && typeof onShowOutcomes === 'function') {
      onShowOutcomes(rollResult, outcomes);
    }
    
    // Find available moves based on the Next Step outcome if it exists
    let availableMoves = [];
    if (outcomes['Next Step']) {
      const nextStepValue = outcomes['Next Step'];
      
      console.log('DiceRoll: Finding spaces for Next Step:', nextStepValue);
      
      // Use DiceRollLogic to find the available spaces
      availableMoves = window.DiceRollLogic.findSpacesFromOutcome(window.GameState, nextStepValue);
      console.log('DiceRoll: Found available moves:', availableMoves.map(m => m.name).join(', '));
    }
    
    // Add moves to the outcomes object
    outcomes.moves = availableMoves;
    
    console.log('DiceRoll: processRollOutcome completed');
    return outcomes;
  }

  // Render enhanced 3D dice with dots based on the result
  renderDiceFace = (result) => {
    if (!result && !this.state.rolling) {
      return (
        <div className="dice-face dice-face-3d">
          <div className="dice-face-front">?</div>
          <div className="dice-face-back"></div>
          <div className="dice-face-right"></div>
          <div className="dice-face-left"></div>
          <div className="dice-face-top"></div>
          <div className="dice-face-bottom"></div>
        </div>
      );
    }
    
    // Create dot layouts for each face of the dice
    const generateDots = (count) => {
      const dots = [];
      
      for (let i = 1; i <= 9; i++) {
        // Only show dots that should be visible for this number
        const visible = (
          (count === 1 && i === 5) ||  // Center dot for 1
          (count === 2 && (i === 1 || i === 9)) ||  // Diagonal corners for 2
          (count === 3 && (i === 1 || i === 5 || i === 9)) ||  // Diagonal plus center for 3
          (count === 4 && (i === 1 || i === 3 || i === 7 || i === 9)) ||  // Four corners for 4
          (count === 5 && (i === 1 || i === 3 || i === 5 || i === 7 || i === 9)) ||  // Four corners and center for 5
          (count === 6 && (i === 1 || i === 3 || i === 4 || i === 6 || i === 7 || i === 9))  // Six dots for 6
        );
        
        dots.push(
          <div 
            key={i} 
            className={`dice-dot dice-dot-${i} ${visible ? 'visible' : ''}`}
          ></div>
        );
      }
      
      return dots;
    };
    
    // During rolling animation or after result
    const displayResult = this.state.rolling ? 
      (Math.floor(Math.random() * 6) + 1) : result;
    
    return (
      <div 
        className={`dice-face dice-face-3d ${this.state.rolling ? 'rolling' : ''} ${this.state.animationClass || ''}`}
        ref={this.diceRef}
      >
        <div className={`dice-face-front dice-value-${displayResult}`}>
          {generateDots(displayResult)}
        </div>
        <div className="dice-face-back">
          {generateDots(7 - displayResult)} {/* Opposite side */}
        </div>
        <div className="dice-face-right">
          {generateDots(3)} {/* Right side */}
        </div>
        <div className="dice-face-left">
          {generateDots(4)} {/* Left side */}
        </div>
        <div className="dice-face-top">
          {generateDots(2)} {/* Top side */}
        </div>
        <div className="dice-face-bottom">
          {generateDots(5)} {/* Bottom side */}
        </div>
      </div>
    );
  }

  // Process and format outcomes for display

  // Categorize and format outcomes for display
  categorizeOutcomes = (displayOutcomes) => {
    const categories = {
      movement: { title: 'Movement', outcomes: {} },
      cards: { title: 'Cards', outcomes: {} },
      resources: { title: 'Resources', outcomes: {} },
      other: { title: 'Other Effects', outcomes: {} }
    };
    
    // Sort outcomes by category
    Object.entries(displayOutcomes).forEach(([type, value]) => {
      if (type === 'Next Step') {
        categories.movement.outcomes[type] = value;
      } else if (type.includes('Cards')) {
        categories.cards.outcomes[type] = value;
      } else if (type.includes('Time') || type.includes('Fee')) {
        categories.resources.outcomes[type] = value;
      } else {
        categories.other.outcomes[type] = value;
      }
    });
    
    return categories;
  }

  // Render organized outcome sections
  renderOutcomes = (categories) => {
    return Object.values(categories).map(category => {
      const outcomes = Object.entries(category.outcomes);
      if (outcomes.length === 0) return null;
      
      return (
        <div key={category.title} className="outcome-category">
          <h5 className="outcome-category-title">{category.title}</h5>
          <ul className="outcome-list">
            {outcomes.map(([type, value]) => (
              <li key={type} className="outcome-item">
                <span className="outcome-type">{type.replace('Cards', '').trim()}:</span> 
                <span className="outcome-value">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }).filter(Boolean); // Remove null categories
  }

  // Render outcomes on the space card
  renderOutcomesOnCard = (displayOutcomes, result) => {
    const categories = this.categorizeOutcomes(displayOutcomes);
    
    return (
      <div className="dice-space-outcomes">
        <div className="dice-result-summary">
          <div className="dice-result-badge">
            <span className="dice-result-number">{result}</span>
          </div>
          <div className="dice-result-text">
            <h4>Roll Outcome</h4>
          </div>
        </div>
        
        <div className="dice-outcome-categories">
          {this.renderOutcomes(categories)}
        </div>
      </div>
    );
  }

  render() {
    console.log('DiceRoll: Rendering component');
    const { 
      rolling, result, diceHistory, availableMoves, 
      diceOutcomes, rollPhase, showOutcomesOnCard 
    } = this.state;
    const { visible, space } = this.props;
    
    if (!visible) {
      console.log('DiceRoll: Component not visible, skipping render');
      return null;
    }
    
    // Check if the current space supports dice rolling
    const hasDiceRoll = diceOutcomes && diceOutcomes.length > 0;
    
    // If we have a result, process the outcomes to display
    let displayOutcomes = {};
    if (result) {
      // Find outcomes in diceOutcomes for this result
      displayOutcomes = diceOutcomes.reduce((outcomes, outcomeData) => {
        const dieRollType = outcomeData['die_roll'];
        const outcomeValue = outcomeData[result.toString()];
        
        if (outcomeValue && outcomeValue.trim() !== '' && outcomeValue !== 'n/a') {
          outcomes[dieRollType] = outcomeValue;
        }
        
        return outcomes;
      }, {});
    }
    
    console.log('DiceRoll: Preparing to render dice UI');
    const renderedComponent = (
      <div className="dice-roll-container">
        <div className="dice-roll-header">
          <h3>Dice Roll - {space.space_name}</h3>
        </div>
        
        <div className={`dice-roll-content ${rollPhase}`}>
          {/* Integrated dice display inside the space card */}
          <div className="space-card-with-dice">
            {/* Only show dice area if we're rolling or have a result */}
            {(rolling || result) && (
              <div className="dice-area">
                {/* Enhanced 3D dice */}
                <div className={`dice dice-3d ${rolling ? 'rolling' : ''}`}>
                  {this.renderDiceFace(result)}
                </div>
                
                {/* Result number display */}
                {result && !rolling && (
                  <div className="dice-result-display">
                    <span>{result}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Roll dice button - only show if space supports dice rolling */}
            {!result && !rolling && hasDiceRoll && (
              <div className="dice-controls">
                <button 
                  onClick={this.rollDice}
                  disabled={rolling}
                  className="roll-dice-btn"
                >
                  Roll Dice
                </button>
                
                {/* Instructions */}
                <div className="dice-instruction">
                  <p>Click the Roll Dice button to determine your outcomes.</p>
                </div>
              </div>
            )}
            
            {/* Gray out Roll button if no dice outcomes available */}
            {!result && !rolling && !hasDiceRoll && (
              <button 
                disabled={true}
                className="roll-dice-btn disabled"
                title="This space doesn't require a dice roll"
              >
                No Dice Roll Required
              </button>
            )}
            
            {/* Outcomes - integrated inside space card */}
            {result && Object.keys(displayOutcomes).length > 0 && (
              <div className="dice-outcomes-section">
                {this.renderOutcomesOnCard(displayOutcomes, result)}
              </div>
            )}
          </div>
        </div>
        
        {/* Available moves from dice roll - shown at bottom */}
        {result && availableMoves.length > 0 && (
          <div className="dice-moves">
            <h4>Available Moves</h4>
            <ul>
              {availableMoves.map(move => (
                <li 
                  key={move.id}
                  onClick={() => this.props.onMoveSelect(move)}
                  className="dice-move-option"
                >
                  {move.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Message for no moves available */}
        {result && availableMoves.length === 0 && (
          <div className="no-moves-message">
            <p>This roll determines game effects but doesn't change your movement.</p>
            <p>You can still select an available move from the board.</p>
          </div>
        )}
        
        {/* Dice history */}
        {diceHistory.length > 1 && (
          <div className="dice-history">
            <h4>Previous Rolls</h4>
            <ul>
              {diceHistory.slice(0, -1).map((roll, index) => (
                <li key={index}>Roll {index + 1}: {roll}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
    console.log('DiceRoll: Render completed');
    return renderedComponent;
  }
}

console.log('DiceRoll.js code execution finished');