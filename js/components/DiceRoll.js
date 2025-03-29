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
    // Load dice roll data for current space
    this.loadDiceOutcomes();
  }

  componentDidUpdate(prevProps) {
    // If the space or visit type has changed, reload the dice outcomes
    if (prevProps.space?.name !== this.props.space?.name || 
        prevProps.visitType !== this.props.visitType) {
      this.loadDiceOutcomes();
    }
  }

  // Load dice roll outcomes for the current space
  loadDiceOutcomes = () => {
    const { space, visitType, diceData } = this.props;
    
    if (!space || !diceData) {
      return;
    }
    
    // Find dice outcomes that match this space and visit type
    const outcomes = diceData.filter(data => 
      data['Space Name'] === space.name && 
      data['Visit Type'].toLowerCase() === visitType.toLowerCase()
    );
    
    // Store outcomes in state to use when dice is rolled
    this.setState({ diceOutcomes: outcomes });
  }

  rollDice = () => {
    // Start rolling animation
    this.setState({ rolling: true, result: null });
    
    // Generate random number between 1 and 6
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      
      // Add result to history
      const diceHistory = [...this.state.diceHistory, result];
      
      // Process result to determine outcomes
      const outcomes = this.processRollOutcome(result);
      
      this.setState({ 
        rolling: false, 
        result,
        diceHistory,
        availableMoves: outcomes.moves || []
      });
      
      // Call the callback with the results
      if (this.props.onRollComplete) {
        this.props.onRollComplete(result, outcomes);
      }
      
    }, 1000); // Animation time
  }

  // Process the dice roll result to determine game outcomes
  processRollOutcome = (rollResult) => {
    const { diceOutcomes } = this.state;
    
    if (!diceOutcomes || diceOutcomes.length === 0) {
      return { moves: [] };
    }
    
    const outcomes = {};
    
    // Process each dice outcome data row
    for (const outcomeData of diceOutcomes) {
      const dieRollType = outcomeData['Die Roll'];
      const outcomeValue = outcomeData[rollResult.toString()];
      
      if (outcomeValue && outcomeValue.trim() !== '') {
        outcomes[dieRollType] = outcomeValue;
      }
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
      
      // Find the specified space
      const availableMoves = this.findAvailableSpace(nextSpaceName);
      outcomes.moves = availableMoves;
    } else {
      outcomes.moves = [];
    }
    
    return outcomes;
  }
  
  // Find a space for movement based on dice outcome
  findAvailableSpace = (spaceName) => {
    // Special case handling for multiple potential destinations in one outcome
    if (spaceName.includes(' or ')) {
      const spaceOptions = spaceName.split(' or ').map(name => name.trim());
      
      // Process each option
      const availableMoves = [];
      
      for (const option of spaceOptions) {
        const spaces = this.findSpacesWithName(option);
        availableMoves.push(...spaces);
      }
      
      return availableMoves;
    }
    
    // Regular single destination
    return this.findSpacesWithName(spaceName);
  }
  
  // Find spaces with a matching name
  findSpacesWithName = (name) => {
    const { visitType } = this.props;
    const currentPlayer = window.GameState.getCurrentPlayer();
    
    // Clean the name to remove explanatory text
    const cleanedName = window.GameState.extractSpaceName(name);
    
    // Find all spaces that match this name
    const matchingSpaces = window.GameState.spaces.filter(space => {
      const spaceName = window.GameState.extractSpaceName(space.name);
      return spaceName === cleanedName;
    });
    
    // If no matches found, return empty array
    if (matchingSpaces.length === 0) {
      return [];
    }
    
    // Determine if player has visited this space before
    const hasVisitedSpace = window.GameState.hasPlayerVisitedSpace(currentPlayer, cleanedName);
    const targetVisitType = hasVisitedSpace ? 'subsequent' : 'first';
    
    // Find the space with the right visit type, or use first one as fallback
    const destinationSpace = matchingSpaces.find(space => 
      space.visitType.toLowerCase() === targetVisitType.toLowerCase()
    ) || matchingSpaces[0];
    
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
    const { rolling, result, diceHistory, availableMoves } = this.state;
    const { visible } = this.props;
    
    if (!visible) {
      return null;
    }
    
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
            <p>No moves available from this roll.</p>
            <p>You may need to end your turn.</p>
          </div>
        )}
      </div>
    );
  }
}

console.log('DiceRoll.js execution complete');
