// GameBoard.js file is beginning to be used
console.log('GameBoard.js file is beginning to be used');

// GameBoard component - Main controller component
window.GameBoard = class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    
    // Create refs to components
    this.diceRollRef = React.createRef();
    this.cardDisplayRef = React.createRef();
    
    // Initialize Managers
    this.cardManager = new window.CardManager(this);
    this.diceManager = new window.DiceManager(this);
    this.negotiationManager = new window.NegotiationManager(this);
    
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
    // Update available moves
    this.updateAvailableMoves();
    
    // Load instructions data from the START space
    this.loadInstructionsData();
    
    // Set the selected space to the current player's position
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      // Get the current space
      const currentSpace = this.state.spaces.find(s => s.id === currentPlayer.position);
      
      // Create a deep copy of the player's status for the static view
      const playerSnapshot = {
        ...currentPlayer,
        resources: { ...currentPlayer.resources },
        cards: [...(currentPlayer.cards || [])],
        // Ensure color is consistent
        color: currentPlayer.color
      };
      
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
    // Clear any pending animation timeouts
    this.setState({
      cardDrawAnimation: false,
      newCardData: null,
      showDiceRoll: false
    });
  }
  
  // Load instructions data from the START space
  loadInstructionsData = () => {
    const { spaces } = this.state;
    
    // Find the START - Quick play guide spaces (first and subsequent)
    const firstVisitInstructionsSpace = spaces.find(space => {
      return space.name && space.name.includes('START - Quick play guide') && 
             space.id && space.id.toLowerCase().includes('first');
    });
    
    const subsequentVisitInstructionsSpace = spaces.find(space => {
      return space.name && space.name.includes('START - Quick play guide') && 
             space.id && space.id.toLowerCase().includes('subsequent');
    });
    
    // Log what we found for debugging
    console.log('First visit instruction space:', firstVisitInstructionsSpace);
    console.log('Subsequent visit instruction space:', subsequentVisitInstructionsSpace);
    
    if (firstVisitInstructionsSpace || subsequentVisitInstructionsSpace) {
      // Function to convert space object to instruction data with only essential fields
      const processInstructionSpace = (space) => {
        if (!space) return null;
        
        // Start with a clean object that only includes essential fields
        const instructionData = {
          description: space.description || '',
          action: space.action || '',
          outcome: space.outcome || ''
        };
        
        // Only include non-empty card fields
        const cardFields = ['W Card', 'B Card', 'I Card', 'L card', 'E Card'];
        cardFields.forEach(field => {
          if (space[field] && space[field].trim() !== '') {
            instructionData[field] = space[field];
          }
        });
        
        return instructionData;
      };
      
      this.setState({
        instructionsData: {
          first: processInstructionSpace(firstVisitInstructionsSpace),
          subsequent: processInstructionSpace(subsequentVisitInstructionsSpace)
        }
      });
    }
  }
  
  // Toggle instructions panel
  toggleInstructions = () => {
    this.setState(prevState => ({
      showInstructions: !prevState.showInstructions
    }));
  }
  
  updateAvailableMoves = () => {
    const result = GameState.getAvailableMoves();
    
    // Check if the result indicates that a dice roll is needed
    if (result && typeof result === 'object' && result.requiresDiceRoll) {
      console.log('GameBoard: Dice roll required for this space');
      
      // Store the space info and show dice roll component
      this.setState({ 
        showDiceRoll: true, 
        diceRollSpace: result.spaceName,
        diceRollVisitType: result.visitType,
        availableMoves: [],
        hasRolledDice: false     // Reset dice roll status
      });
    } else {
      // Normal case - array of available moves
      this.setState({ 
        availableMoves: result, 
        showDiceRoll: false,
        diceRollSpace: null,
        diceRollVisitType: null
      });
      console.log('Available moves updated:', result.length, 'moves available');
    }
  }
  
  handleSpaceClick = (spaceId) => {
    // Check if this space is a valid move
    const { availableMoves, spaces } = this.state;
    const isValidMove = availableMoves.some(space => space.id === spaceId);
    const currentPlayer = this.getCurrentPlayer();
    
    // Find the space that was clicked
    const clickedSpace = spaces.find(space => space.id === spaceId);
    
    // Always update exploredSpace to the clicked space
    // This ensures we show the correct space info in the always-visible explorer
    const exploredSpaceData = clickedSpace;
    
    // Log space explorer update (if function exists)
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(true, clickedSpace ? clickedSpace.name : 'unknown');
    }
    
    if (isValidMove) {
      // Don't move the player yet, just store the selected move
      // Allow player to change their mind by selecting different spaces before ending turn
      this.setState({
        // No longer change selectedSpace - keep it as the current player's position
        selectedMove: spaceId,   // Store the destination space
        hasSelectedMove: true,   // Mark that player has selected their move
        exploredSpace: exploredSpaceData // Set the explored space for the space explorer panel
      }, () => {
        // After state update, log the selected move for debugging
        console.log('Selected move updated:', this.state.selectedMove);
        console.log('Current state:', {
          selectedSpace: this.state.selectedSpace,
          selectedMove: this.state.selectedMove,
          hasSelectedMove: this.state.hasSelectedMove
        });
      });
      
      console.log('Move selected:', spaceId, '- Will be executed on End Turn');
    } else {
      // For non-move spaces, we update the space explorer panel but don't change the middle column
      this.setState({
        exploredSpace: exploredSpaceData // Set the explored space for the space explorer panel
      });
      
      console.log('Space clicked for exploration:', spaceId);
    }
    
    console.log('Space clicked:', spaceId, 'Is valid move:', isValidMove);
  }
  
  handleEndTurn = () => {
    const { selectedMove } = this.state;
    const currentPlayer = GameState.getCurrentPlayer();
    
    // If a move was selected, execute it now when ending the turn
    if (selectedMove && currentPlayer) {
      console.log('Executing selected move:', selectedMove);
      GameState.movePlayer(currentPlayer.id, selectedMove);
    }
    
    // Move to next player's turn
    GameState.nextPlayerTurn();
    
    // Get the new current player
    const newCurrentPlayer = GameState.getCurrentPlayer();
    const newPlayerPosition = newCurrentPlayer ? newCurrentPlayer.position : null;
    
    // Get the space the player landed on
    const newSpace = this.state.spaces.find(s => s.id === newPlayerPosition);
    
    // Create a deep copy of the player's status for the static view
    const playerSnapshot = newCurrentPlayer ? {
      ...newCurrentPlayer,
      resources: { ...newCurrentPlayer.resources },
      cards: [...(newCurrentPlayer.cards || [])],
      // Force the color to be the current player's color for consistent UI
      color: newCurrentPlayer.color
    } : null;
    
    // Create a deep copy of the space info for the static view
    const spaceSnapshot = newSpace ? { ...newSpace } : null;
    
    // Update state
    this.setState({
      players: [...GameState.players],
      currentPlayerIndex: GameState.currentPlayerIndex,
      selectedSpace: newPlayerPosition, // Always set to new player's position
      selectedMove: null,               // Clear the selected move
      hasSelectedMove: false,           // Reset flag for the next player's turn
      showDiceRoll: false,              // Hide dice roll component
      diceRollSpace: null,              // Clear dice roll space info
      hasRolledDice: false,             // Reset dice roll status
      diceOutcomes: null,               // Reset dice outcomes
      lastDiceRoll: null,               // Reset last dice roll
      currentPlayerOnLanding: playerSnapshot, // Store snapshot of player status
      currentSpaceOnLanding: spaceSnapshot,   // Store snapshot of space
      exploredSpace: newSpace          // Set explored space to new player's space
    });
    
    // Update available moves for new player
    this.updateAvailableMoves();
    
    console.log('Turn ended, next player:', GameState.currentPlayerIndex, 'on space:', newPlayerPosition);
    console.log('Middle column updated to show new player position:', newPlayerPosition);
  }

  // Negotiate functionality moved to NegotiationManager
  
  // Toggle card display visibility
  toggleCardDisplay = () => {
    this.setState(prevState => ({
      showCardDisplay: !prevState.showCardDisplay
    }));
  }
  
  // Handler for close button in space explorer
  handleCloseExplorer = () => {
    // Actually close the space explorer
    this.setState({
      showSpaceExplorer: false
    });
    console.log('Space explorer closed');
    
    // Log using SpaceExplorerLogger if available
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(false, '');
    }
  }
  
  // Handler to open the space explorer
  handleOpenExplorer = () => {
    this.setState({
      showSpaceExplorer: true
    });
    console.log('Space explorer opened');
    
    // Log using SpaceExplorerLogger if available
    const currentPlayer = this.getCurrentPlayer();
    const currentSpace = currentPlayer ? this.state.spaces.find(s => s.id === currentPlayer.position) : null;
    const spaceName = currentSpace ? currentSpace.name : '';
    
    if (window.logSpaceExplorerToggle && typeof window.logSpaceExplorerToggle === 'function') {
      window.logSpaceExplorerToggle(true, spaceName);
    }
  }
  
  getSelectedSpace = () => {
    const { selectedSpace, spaces } = this.state;
    const space = spaces.find(space => space.id === selectedSpace);
    console.log('GameBoard: Getting selected space for info display:', space?.name || 'None');
    return space;
  }
  
  getCurrentPlayer = () => {
    const { players, currentPlayerIndex } = this.state;
    return players[currentPlayerIndex];
  }
  
  isVisitingFirstTime = () => {
    const currentPlayer = this.getCurrentPlayer();
    const selectedSpace = this.getSelectedSpace();
    
    if (!currentPlayer || !selectedSpace) return true;
    
    // Use GameState's function to check if player has visited this space before
    const hasVisited = GameState.hasPlayerVisitedSpace(currentPlayer, selectedSpace.name);
    return !hasVisited;
  }
  
  // Handle card played by player
  handleCardPlayed = (card) => {
    console.log('GameBoard: Card played:', card);
    const currentPlayer = this.getCurrentPlayer();
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
    const currentPlayer = this.getCurrentPlayer();
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

console.log('GameBoard.js code execution finished - Added CardManager and DiceManager integration');
