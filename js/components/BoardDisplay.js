// BoardDisplay component - Main component for displaying the game board
console.log('BoardDisplay.js file is beginning to be used');

window.BoardDisplay = class BoardDisplay extends React.Component {
  constructor(props) {
    super(props);
    
    // Set up state to track the current player
    this.state = {
      currentPlayerIndex: window.GameState.currentPlayerIndex
    };
    
    // Timer references for proper cleanup
    this.mountTimer = null;
    this.resizeTimer = null;
    this.gameStateTimer = null;
    
    console.log('BoardDisplay: Panel initialized');
  }
  
  componentDidMount() {
    // Add an event listener to detect changes in the game state
    window.addEventListener('gameStateUpdated', this.handleGameStateUpdate);
    
    // Apply compact styling to board spaces
    window.BoardStyleManager.applyCompactBoardStyling();
    
    // Also update styling when window is resized
    window.addEventListener('resize', this.handleWindowResize);
    
    // Force space sizes to be 120px x 120px
    this.mountTimer = setTimeout(() => {
      const spaces = document.querySelectorAll('.board-space:not(.column-3-space)');
      const column3Spaces = document.querySelectorAll('.column-3-space');
      
      // Set fixed dimensions on all spaces
      spaces.forEach(space => {
        space.style.width = '120px';
        space.style.height = '60px';
        space.style.minWidth = '120px';
        space.style.minHeight = '60px';
        space.style.maxWidth = '120px';
        space.style.maxHeight = '60px';
        space.style.flexShrink = '0';
        space.style.flexGrow = '0';
        space.style.flex = '0 0 120px';
      });
      
      // Set fixed dimensions on column 3 spaces
      column3Spaces.forEach(space => {
        space.style.width = '50px';
        space.style.height = '60px';
        space.style.minWidth = '50px';
        space.style.minHeight = '60px';
        space.style.maxWidth = '50px';
        space.style.maxHeight = '60px';
        space.style.flexShrink = '0';
        space.style.flexGrow = '0';
        space.style.flex = '0 0 50px';
      });
      
      console.log('BoardDisplay: Enforced 120px × 60px space sizes on initial mount');
      this.mountTimer = null;
    }, 500); // Longer timeout for initial mount
    
    console.log('BoardDisplay: Panel mounted');
  }
  
  componentWillUnmount() {
    // Clean up event listeners when component unmounts
    window.removeEventListener('gameStateUpdated', this.handleGameStateUpdate);
    window.removeEventListener('resize', this.handleWindowResize);
    
    // Clear all pending timers to prevent memory leaks
    if (this.mountTimer) {
      clearTimeout(this.mountTimer);
      this.mountTimer = null;
    }
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
    if (this.gameStateTimer) {
      clearTimeout(this.gameStateTimer);
      this.gameStateTimer = null;
    }
    
    console.log('BoardDisplay: Panel unmounted');
  }
  
  // Handle window resize event
  handleWindowResize = () => {
    window.BoardStyleManager.applyCompactBoardStyling();
    // Arrow system has been disabled
    // No longer re-creating connectors after window resize
    
    // Force space sizes to be maintained on resize
    // Clear any existing resize timer to prevent multiple timers
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => {
      // Get all board spaces
      const spaces = document.querySelectorAll('.board-space:not(.column-3-space)');
      const column3Spaces = document.querySelectorAll('.column-3-space');
      
      // Set fixed dimensions on all spaces
      spaces.forEach(space => {
        space.style.width = '120px';
        space.style.height = '60px';
        space.style.minWidth = '120px';
        space.style.minHeight = '60px';
        space.style.maxWidth = '120px';
        space.style.maxHeight = '60px';
        space.style.flexShrink = '0';
        space.style.flexGrow = '0';
        space.style.flex = '0 0 120px';
      });
      
      // Set fixed dimensions on column 3 spaces
      column3Spaces.forEach(space => {
        space.style.width = '50px';
        space.style.height = '60px';
        space.style.minWidth = '50px';
        space.style.minHeight = '60px';
        space.style.maxWidth = '50px';
        space.style.maxHeight = '60px';
        space.style.flexShrink = '0';
        space.style.flexGrow = '0';
        space.style.flex = '0 0 50px';
      });
      
      console.log('BoardDisplay: Enforced 120px × 60px space sizes on window resize');
      this.resizeTimer = null;
    }, 100);
  }
  
  // Handle updates to the game state (like player turns changing)
  handleGameStateUpdate = () => {
    // Check if the current player has changed
    if (this.state.currentPlayerIndex !== window.GameState.currentPlayerIndex) {
      this.setState({
        currentPlayerIndex: window.GameState.currentPlayerIndex
      });
      console.log('BoardDisplay: Current player changed, refreshing board');
      
      // Arrow system has been disabled
      // No longer re-creating connectors after player changes
      
      // But we do need to ensure space sizes remain consistent
      // Clear any existing game state timer to prevent multiple timers
      if (this.gameStateTimer) {
        clearTimeout(this.gameStateTimer);
      }
      this.gameStateTimer = setTimeout(() => {
        const spaces = document.querySelectorAll('.board-space:not(.column-3-space)');
        const column3Spaces = document.querySelectorAll('.column-3-space');
        
        // Set fixed dimensions on all spaces
        spaces.forEach(space => {
          space.style.width = '120px';
          space.style.height = '60px';
          space.style.minWidth = '120px';
          space.style.minHeight = '60px';
          space.style.maxWidth = '120px';
          space.style.maxHeight = '60px';
          space.style.flexShrink = '0';
          space.style.flexGrow = '0';
          space.style.flex = '0 0 120px';
        });
        
        // Set fixed dimensions on column 3 spaces
        column3Spaces.forEach(space => {
          space.style.width = '50px';
          space.style.height = '60px';
          space.style.minWidth = '50px';
          space.style.minHeight = '60px';
          space.style.maxWidth = '50px';
          space.style.maxHeight = '60px';
          space.style.flexShrink = '0';
          space.style.flexGrow = '0';
          space.style.flex = '0 0 50px';
        });
        
        console.log('BoardDisplay: Enforced 120px × 60px space sizes after game state update');
        this.gameStateTimer = null;
      }, 100);
    }
  }
  
  // Get current player from GameState
  getCurrentPlayer = () => {
    return window.GameState.getCurrentPlayer();
  }
  
  // Main render method
  render() {
    // Check if BoardSpaceRenderer exists before using it
    if (window.BoardSpaceRenderer && typeof window.BoardSpaceRenderer.renderBoard === 'function') {
      console.log('BoardDisplay: Using BoardSpaceRenderer to render the board');
      // Debug the props we're passing to the board renderer
      if (this.props.selectedMove) {
        console.log('BoardDisplay: Rendering with selectedMove=', this.props.selectedMove);
      }
      
      // Ensure we pass a complete props object to the renderer
      const completeProps = {
        ...this.props,
        selectedSpace: this.props.selectedSpace || null,
        selectedMove: this.props.selectedMove || null,
        availableMoves: this.props.availableMoves || []
      };
      
      return window.BoardSpaceRenderer.renderBoard(completeProps);
    } else {
      console.error('BoardDisplay: BoardSpaceRenderer is not available yet, showing placeholder');
      // Return a placeholder while waiting for BoardSpaceRenderer to be defined
      return (
        <div className="game-board-loading">
          <p>Loading game board...</p>
        </div>
      );
    }
  }
};

console.log('BoardDisplay.js code execution finished');