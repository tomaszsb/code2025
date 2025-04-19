// GameBoard.js file is beginning to be used
console.log('GameBoard.js file is beginning to be used');

// GameBoard component - Main controller component
window.GameBoard = class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    
    // Create refs to components
    this.diceRollRef = React.createRef();
    this.cardDisplayRef = React.createRef();
    
    // Initialize Managers - new managers added
    this.cardManager = new window.CardManager(this);
    this.diceManager = new window.DiceManager(this);
    this.negotiationManager = new window.NegotiationManager(this);
    this.turnManager = new window.TurnManager(this);
    this.spaceSelectionManager = new window.SpaceSelectionManager(this);
    this.spaceExplorerManager = new window.SpaceExplorerManager(this);
    
    this.state = {
      players: GameState.players || [],
      currentPlayerIndex: GameState.currentPlayerIndex || 0,
      spaces: GameState.spaces || [],
      selectedSpace: null,
      selectedMove: null,      // Store selected destination without moving player
      availableMoves: [],
      showInstructions: false,
      instructionsData: null,
      hasSelectedMove: false,  // Track if player has selected a move this turn
      showDiceRoll: false,     // Flag to show/hide dice roll component
      diceRollSpace: null,     // Space data for dice rolling
      diceRollVisitType: null, // Visit type for dice rolling
      diceRollData: window.diceRollData || [], // Dice roll outcome data from CSV
      showCardDisplay: false,   // Flag to show/hide card display component
      cardDrawAnimation: false, // Flag for card draw animation
      newCardData: null,       // Data for newly drawn card
      hasRolledDice: false,     // Track if player has rolled dice this turn
      diceOutcomes: null,      // Store dice roll outcomes for display in space info
      lastDiceRoll: null,       // Store last dice roll result
      currentPlayerOnLanding: null, // Store snapshot of player status upon landing
      currentSpaceOnLanding: null,   // Store snapshot of space upon landing
      exploredSpace: null,      // Store currently explored space for details panel
      showSpaceExplorer: true   // Flag to show/hide space explorer panel
    };
    console.log("GameBoard: Space explorer is now always visible");
  }
       
  componentDidMount() {
    // Update available moves using SpaceSelectionManager
    this.spaceSelectionManager.updateAvailableMoves();
    
    // Load instructions data using SpaceSelectionManager
    this.spaceSelectionManager.loadInstructionsData();
    
    // Set the selected space to the current player's position
    const currentPlayer = this.turnManager.getCurrentPlayer();
    if (currentPlayer) {
      // Get the current space
      const currentSpace = this.state.spaces.find(s => s.id === currentPlayer.position);
      
      // Create a deep copy of the player's status for the static view
      const playerSnapshot = this.turnManager.createPlayerSnapshot(currentPlayer);
      
      // Create a deep copy of the space info for the static view
      const spaceSnapshot = currentSpace ? { ...currentSpace } : null;
      
      this.setState({
        selectedSpace: currentPlayer.position,
        currentPlayerOnLanding: playerSnapshot,
        currentSpaceOnLanding: spaceSnapshot,
        exploredSpace: currentSpace  // Initialize explored space to current player's position
      });
      console.log("GameBoard: Set middle column to current player's space:", currentPlayer.position);
      console.log("GameBoard: Captured initial player and space status", playerSnapshot, spaceSnapshot);
    }
    
    console.log("GameBoard mounted successfully");
    console.log("Space Explorer positioning fixed - now appears on the right side of the game board");
    console.log("Game board correctly resizes when Space Explorer is visible");
  }
  
  // Clean up any animations when unmounting
  componentWillUnmount() {
    console.log('GameBoard: Cleaning up resources on unmount');
    
    // Clear any pending animation timeouts
    this.setState({
      cardDrawAnimation: false,
      newCardData: null,
      showDiceRoll: false
    });
    
    // Clean up manager resources
    if (this.spaceSelectionManager && typeof this.spaceSelectionManager.cleanup === 'function') {
      this.spaceSelectionManager.cleanup();
    }
    
    // Clean up TurnManager resources
    if (this.turnManager && typeof this.turnManager.cleanup === 'function') {
      this.turnManager.cleanup();
    }
    
    // Clean up CardManager resources
    if (this.cardManager && typeof this.cardManager.cleanup === 'function') {
      this.cardManager.cleanup();
    }
    
    // Clean up DiceManager resources
    if (this.diceManager && typeof this.diceManager.cleanup === 'function') {
      this.diceManager.cleanup();
    }
    
    console.log('GameBoard: Resource cleanup completed');
  }
  
  // Toggle card display visibility
  toggleCardDisplay = () => {
    this.setState(prevState => ({
      showCardDisplay: !prevState.showCardDisplay
    }));
  }
  
  // Handle card played by player
  handleCardPlayed = (card) => {
    console.log('GameBoard: Card played:', card);
    const currentPlayer = this.turnManager.getCurrentPlayer();
    if (!currentPlayer) return;
    
    // Use CardManager to process the played card
    this.cardManager.handleCardPlayed(card, currentPlayer);
  }
  
  // Handle card discarded by player
  handleCardDiscarded = (card) => {
    console.log('GameBoard: Card discarded:', card);
    // Use CardManager to process the discarded card
    this.cardManager.handleCardDiscarded(card);
  }
  
  // Handle drawing cards manually
  handleDrawCards = (cardType, amount) => {
    console.log('GameBoard: Drawing cards manually -', amount, cardType, 'cards');
    const currentPlayer = this.turnManager.getCurrentPlayer();
    if (!currentPlayer) {
      console.log('GameBoard: No current player found');
      return;
    }
    
    // Use CardManager to handle drawing cards
    return this.cardManager.handleDrawCards(cardType, amount, currentPlayer, this.cardDisplayRef);
  }
  
  // Handle card animation
  handleCardAnimation = (cardType, cardData) => {
    console.log('GameBoard: Animating card draw:', cardType);
    
    // Trigger card draw animation
    this.setState({
      cardDrawAnimation: true,
      newCardData: {
        type: cardType,
        data: cardData
      }
    });
    
    // Hide animation after delay
    setTimeout(() => {
      this.setState({
        cardDrawAnimation: false,
        newCardData: null
      });
    }, 2000);
  }
  
  render() {
    // Use the BoardRenderer component to handle the rendering
    return (
      <window.BoardRenderer
        gameBoard={this}
        gameEnded={GameState.gameEnded}
        players={this.state.players}
        spaces={this.state.spaces}
        currentPlayerIndex={this.state.currentPlayerIndex}
        selectedSpace={this.state.selectedSpace}
        selectedMove={this.state.selectedMove}
        availableMoves={this.state.availableMoves}
        showDiceRoll={this.state.showDiceRoll}
        diceRollSpace={this.state.diceRollSpace}
        diceRollVisitType={this.state.diceRollVisitType}
        diceRollData={this.state.diceRollData}
        showCardDisplay={this.state.showCardDisplay}
        cardDrawAnimation={this.state.cardDrawAnimation}
        newCardData={this.state.newCardData}
        hasRolledDice={this.state.hasRolledDice}
        exploredSpace={this.state.exploredSpace}
        showInstructions={this.state.showInstructions}
        instructionsData={this.state.instructionsData}
        currentPlayerOnLanding={this.state.currentPlayerOnLanding}
        currentSpaceOnLanding={this.state.currentSpaceOnLanding}
        showSpaceExplorer={this.state.showSpaceExplorer}
      />
    );
  }
}

console.log('GameBoard.js code execution finished - Added all manager components');
