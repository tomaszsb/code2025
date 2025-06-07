// App.js file is beginning to be used
console.log('App.js file is beginning to be used');

window.App = class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            gameStarted: false,
            isInitialized: false
        };
    }

    componentDidMount() {
        // Listen for game state changes to trigger re-renders
        if (window.GameStateManager) {
            window.GameStateManager.addEventListener('gameStateChanged', this.handleGameStateChange);
        }
        
        // Check initial state
        this.checkGameState();
    }

    componentWillUnmount() {
        // Clean up event listener
        if (window.GameStateManager) {
            window.GameStateManager.removeEventListener('gameStateChanged', this.handleGameStateChange);
        }
    }

    handleGameStateChange = (event) => {
        console.log('App: Game state changed', event.data);
        this.checkGameState();
    }

    checkGameState = () => {
        if (window.GameStateManager) {
            this.setState({
                gameStarted: window.GameStateManager.gameStarted,
                isInitialized: window.GameStateManager.isProperlyInitialized
            });
        }
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught in App component:', error);
        this.setState({ 
            error: error.message 
        });
    }
    
    render() {
        const { error, loading, gameStarted, isInitialized } = this.state;
        
        if (loading) {
            return (
                <div className="loading-screen">
                    <h2>Loading Game...</h2>
                    <p>Please wait while the game initializes</p>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="error-screen">
                    <h2>Error Loading Game</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Reload Page</button>
                </div>
            );
        }
        
        // Check if the game should start or show setup using GameStateManager
        console.log('App render: gameStarted=', gameStarted, 'isInitialized=', isInitialized);
        
        if (window.GameStateManager && isInitialized && gameStarted) {
            return <GameBoard />;
        } else {
            // Show PlayerSetup which will handle saved games
            // It will check if there's a saved game and offer to continue or start new
            return <PlayerSetup onSetupComplete={this.checkGameState} />;
        }
    }
}

console.log('App.js code execution finished');