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
    const { space, visitType, diceData } = this.props;
    
    if (!space || !diceData) {
      console.log('DiceRoll: No space or dice data available, skipping outcome loading');
      return;
    }
    
    console.log('DiceRoll: Searching for outcomes for space:', space.name, 'visit type:', visitType);
    
    // Find dice outcomes that match this space and visit type
    const outcomes = diceData.filter(data => 
      data['Space Name'] === space.name && 
      data['Visit Type'].toLowerCase() === visitType.toLowerCase()
    );
    
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
  const { diceOutcomes } = this.state;
  const { space, visitType, onShowOutcomes } = this.props;
  
  console.log('DiceRoll: Processing roll', rollResult, 'for space', space.name, 'visit type', visitType);
  console.log('DiceRoll: Available outcomes:', diceOutcomes);
  
  if (!diceOutcomes || diceOutcomes.length === 0) {
  console.log('DiceRoll: No outcomes available');
  return { moves: [] };
  }
  
  const outcomes = {};
  
  // Process each dice outcome data row
  for (const outcomeData of diceOutcomes) {
  const dieRollType = outcomeData['Die Roll'];
  const outcomeValue = outcomeData[rollResult.toString()];
  
  console.log('DiceRoll: Processing outcome type', dieRollType, 'value:', outcomeValue);
  
  if (outcomeValue && outcomeValue.trim() !== '' && outcomeValue !== 'n/a') {
    // Special case for W Cards Discard outcome
    if (dieRollType === 'W Cards Discard' || dieRollType === 'discard W Cards') {
      outcomes.discardWCards = outcomeValue;
      console.log('DiceRoll: Detected W cards discard requirement:', outcomeValue);
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
    
    // If there's a "Next Step" outcome, convert it to available moves
    if (outcomes['Next Step']) {
      const nextStepValue = outcomes['Next Step'];
      
      // Extract the space name from the Next Step value
      // (it might have explanatory text after a dash or space)
      let nextSpaceName = nextStepValue;
      
      if (nextSpaceName.includes(' - ')) {
        nextSpaceName = nextSpaceName.split(' - ')[0].trim();
      }
      
      console.log('DiceRoll: Finding spaces for', nextSpaceName);
      
      // Find the specified space
      const availableMoves = this.findAvailableSpace(nextSpaceName);
      console.log('DiceRoll: Found available moves:', availableMoves.map(m => m.name).join(', '));
      outcomes.moves = availableMoves;
    } else {
      outcomes.moves = [];
    }
    
    console.log('DiceRoll: processRollOutcome completed');
    return outcomes;
  }
  
  // Find a space for movement based on dice outcome
  findAvailableSpace = (spaceName) => {
    console.log('DiceRoll: Finding available spaces for', spaceName);
    // Special case handling for multiple potential destinations in one outcome
    if (spaceName.includes(' or ')) {
      const spaceOptions = spaceName.split(' or ').map(name => name.trim());
      
      // Process each option
      const availableMoves = [];
      
      for (const option of spaceOptions) {
        console.log('DiceRoll: Processing option', option);
        const spaces = this.findSpacesWithName(option);
        availableMoves.push(...spaces);
      }
      
      console.log('DiceRoll: findAvailableSpace completed with multiple options');
      return availableMoves;
    }
    
    // Regular single destination
    console.log('DiceRoll: findAvailableSpace completed for single destination');
    return this.findSpacesWithName(spaceName);
  }
  
  // Find spaces with a matching name
  findSpacesWithName = (name) => {
    console.log('DiceRoll: Finding spaces matching name:', name);
    const { visitType } = this.props;
    const currentPlayer = window.GameState.getCurrentPlayer();
    
    // Clean the name to remove explanatory text
    const cleanedName = window.GameState.extractSpaceName(name);
    console.log('DiceRoll: Cleaned space name:', cleanedName);
    
    // Find all spaces that match this name
    const matchingSpaces = window.GameState.spaces.filter(space => {
      const spaceName = window.GameState.extractSpaceName(space.name);
      return spaceName === cleanedName;
    });
    
    console.log('DiceRoll: Found', matchingSpaces.length, 'matching spaces');
    
    // If no matches found, return empty array
    if (matchingSpaces.length === 0) {
      console.log('DiceRoll: No matching spaces found, returning empty array');
      return [];
    }
    
    // Determine if player has visited this space before
    const hasVisitedSpace = window.GameState.hasPlayerVisitedSpace(currentPlayer, cleanedName);
    const targetVisitType = hasVisitedSpace ? 'subsequent' : 'first';
    console.log('DiceRoll: Target visit type for', cleanedName, 'is', targetVisitType);
    
    // Find the space with the right visit type, or use first one as fallback
    const destinationSpace = matchingSpaces.find(space => 
      space.visitType.toLowerCase() === targetVisitType.toLowerCase()
    ) || matchingSpaces[0];
    
    console.log('DiceRoll: Selected destination space:', destinationSpace.id);
    console.log('DiceRoll: findSpacesWithName completed');
    return [destinationSpace];
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
        const dieRollType = outcomeData['Die Roll'];
        const outcomeValue = outcomeData[result.toString()];
        
        if (outcomeValue && outcomeValue.trim() !== '' && outcomeValue !== 'n/a') {
          outcomes[dieRollType] = outcomeValue;
        }
        
        return outcomes;
      }, {});
    }
    
    console.log('DiceRoll: Preparing to render dice UI');
    return (
      <div className="dice-roll-container">
        <div className="dice-roll-header">
          <h3>Dice Roll - {space.name}</h3>
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
  }
}

console.log('DiceRoll.js code execution finished');