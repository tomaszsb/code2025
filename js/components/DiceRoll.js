// DiceRoll.js - Component for dice rolling mechanic
console.log('DiceRoll.js file is being processed');

window.DiceRoll = class DiceRoll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rolling: false,
      result: null,
      diceHistory: [],
      availableMoves: [],
      diceOutcomes: []
    };
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
    this.setState({ rolling: true, result: null });
    
    // Generate random number between 1 and 6
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      console.log('DiceRoll: Dice roll result:', result);
      
      // Add result to history
      const diceHistory = [...this.state.diceHistory, result];
      
      // Process result to determine outcomes
      console.log('DiceRoll: Processing roll outcome');
      const outcomes = this.processRollOutcome(result);
      
      this.setState({ 
        rolling: false, 
        result,
        diceHistory,
        availableMoves: outcomes.moves || []
      });
      
      // Call the callback with the results
      if (this.props.onRollComplete) {
        console.log('DiceRoll: Notifying parent component of roll completion');
        this.props.onRollComplete(result, outcomes);
      }
      
      console.log('DiceRoll: Rolling dice completed');
    }, 1000); // Animation time
  }

  // Process the dice roll result to determine game outcomes
  processRollOutcome = (rollResult) => {
    const { diceOutcomes } = this.state;
    const { space, visitType } = this.props;
    
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
      
      if (outcomeValue && outcomeValue.trim() !== '') {
        outcomes[dieRollType] = outcomeValue;
      }
    }
    
    console.log('DiceRoll: Processed outcomes:', outcomes);
    
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
      console.log('DiceRoll: Found available moves:', availableMoves.map(m => m.name));
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

  // Render dice with dots based on the result
  renderDiceFace = (result) => {
    if (!result) {
      return <div className="dice-face">?</div>;
    }
    
    // Create an array of dots based on the result
    const dots = [];
    
    for (let i = 1; i <= 7; i++) {
      dots.push(<div key={i} className={`dice-dot dot-${i}`}></div>);
    }
    
    return (
      <div className={`dice-face dots-${result}`}>
        {dots}
      </div>
    );
  }

  render() {
    console.log('DiceRoll: Rendering component');
    const { rolling, result, diceHistory, availableMoves, diceOutcomes } = this.state;
    const { visible } = this.props;
    
    if (!visible) {
      console.log('DiceRoll: Component not visible, skipping render');
      return null;
    }
    
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
        <h3>Roll the Dice</h3>
        
        <div className="dice-area">
          {/* Show dice result or animation */}
          <div className={`dice ${rolling ? 'rolling' : ''}`}>
            {this.renderDiceFace(result)}
          </div>
        </div>
        
        {/* Roll dice button */}
        {!result && !rolling && (
          <button 
            onClick={this.rollDice}
            disabled={rolling}
            className="roll-dice-btn"
          >
            Roll Dice
          </button>
        )}
        
        {/* Show message to use roll button when no result yet */}
        {!result && !rolling && (
          <div className="dice-instruction">
            <p>Click the Roll Dice button to determine your move.</p>
          </div>
        )}
        
        {/* Show dice roll outcomes */}
        {result && Object.keys(displayOutcomes).length > 0 && (
          <div className="dice-outcomes">
            <h4>Dice Roll Results</h4>
            <ul>
              {Object.entries(displayOutcomes).map(([type, value]) => (
                <li key={type} className="dice-outcome-item">
                  <span className="outcome-type">{type}:</span> 
                  <span className="outcome-value">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Show dice history */}
        {diceHistory.length > 0 && (
          <div className="dice-history">
            <h4>Previous Rolls</h4>
            <ul>
              {diceHistory.map((roll, index) => (
                <li key={index}>Roll {index + 1}: {roll}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Show available moves based on roll */}
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
        
        {/* Show message if no moves available after roll */}
        {result && availableMoves.length === 0 && (
          <div className="no-moves-message">
            <p>This roll determines game effects but doesn't change your movement.</p>
            <p>You can still select an available move from the board.</p>
          </div>
        )}
      </div>
    );
    console.log('DiceRoll: Render completed');
  }
}

console.log('DiceRoll.js execution complete');