// GameBoard.js file is beginning to be used
console.log('GameBoard.js file is beginning to be used');

// GameBoard component - Main controller component
window.GameBoard = class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    
    // Create refs to components
    this.diceRollRef = React.createRef();
    this.cardDisplayRef = React.createRef();
    
    // Initialize Managers - Phase 4: Negotiation functionality moved to TurnManager
    this.cardManager = new window.CardManager(this);
    this.diceManager = new window.DiceManager(this);
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
      diceRollData: GameState.diceRollData || window.diceRollData || [], // Dice roll outcome data from CSV
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
    // Store global reference to this GameBoard instance
    window.currentGameBoard = this;
    console.log('GameBoard: Global reference established');
    
    // Add event listener for when spaces are loaded
    if (window.GameStateManager) {
      window.GameStateManager.addEventListener('spacesLoaded', this.handleSpacesLoaded.bind(this));
      console.log('GameBoard: Added spacesLoaded event listener');
    }
    
    // Update available moves using SpaceSelectionManager
    this.spaceSelectionManager.updateAvailableMoves();
    
    // Load instructions data using SpaceSelectionManager
    this.spaceSelectionManager.loadInstructionsData();
    
    // Set the selected space to the current player's position
    const currentPlayer = this.turnManager.getCurrentPlayer();
    if (currentPlayer && currentPlayer.position) {
      // Get the current space
      const currentSpace = this.state.spaces.find(s => s.space_name === currentPlayer.position);
      
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
      
      // Update available moves for the current space after setting selectedSpace
      setTimeout(() => {
        this.spaceSelectionManager.updateAvailableMoves();
      }, 100);
    } else {
      console.log("GameBoard: No current player available during mount");
    }
    
    // Connect to movement system
    if (window.GameStateManager && window.GameStateManager.connectGameBoard) {
      console.log("GameBoard: Connecting to new movement system...");
      // Log the movement system components to help with debugging
      console.log("GameBoard: Movement system components detected:", {
        movementCore: !!window.GameStateManager.movementCore,
        movementLogic: !!window.GameStateManager.movementLogic,
        movementUIAdapter: !!window.GameStateManager.movementUIAdapter,
        connectGameBoard: !!window.GameStateManager.connectGameBoard
      });
      window.GameStateManager.connectGameBoard(this);
      console.log("GameBoard: Successfully connected to movement system");
    } else {
      console.log("GameBoard: New movement system not detected, using legacy movement");
      // Log available properties on GameStateManager to help with debugging
      console.log("GameBoard: Available properties on GameStateManager:", 
        Object.keys(window.GameStateManager).filter(prop => 
          typeof window.GameStateManager[prop] !== 'function'
        )
      );
    }
    
    console.log("GameBoard mounted successfully");
    console.log("Space Explorer positioning fixed - now appears on the right side of the game board");
    console.log("Game board correctly resizes when Space Explorer is visible");
  }
  
  // Handle spaces loaded event
  handleSpacesLoaded(event) {
    console.log('GameBoard: Spaces loaded, updating state', event.data);
    this.setState({
      spaces: event.data.spaces
    });
  }
  
  // Clean up any animations when unmounting
  componentWillUnmount() {
    console.log('GameBoard: Cleaning up resources on unmount');
    
    // Remove event listener
    if (window.GameStateManager) {
      window.GameStateManager.removeEventListener('spacesLoaded', this.handleSpacesLoaded.bind(this));
      console.log('GameBoard: Removed spacesLoaded event listener');
    }
    
    // Clear global reference
    if (window.currentGameBoard === this) {
      window.currentGameBoard = null;
      console.log('GameBoard: Global reference cleared');
    }
    
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
    
    // Clean up TurnManager resources (includes negotiation functionality)
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
    // Create reference to BoardRenderer for JSX compatibility
    const BoardRenderer = window.BoardRenderer;
    
    // Use the BoardRenderer component to handle the rendering
    return (
      <BoardRenderer
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
        isRollingDice={this.state.isRollingDice}
      />
    );
  }
}

console.log('GameBoard.js code execution finished - Added all manager components');
