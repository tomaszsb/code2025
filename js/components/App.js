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
        if (window.GameStateManager && window.GameStateManager.isProperlyInitialized) {
            this.setState({
                gameStarted: window.GameStateManager.gameStarted,
                isInitialized: window.GameStateManager.isProperlyInitialized
            });
        }
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught in App component:', error);
        console.error('Component stack:', errorInfo.componentStack);
        
        // Enhanced error handling with more user-friendly messages
        let userMessage = error.message;
        
        // Check for common error types and provide better messages
        if (error.message.includes('CSV') || error.message.includes('Failed to load')) {
            userMessage = 'Failed to load game data. Please refresh the page to try again.';
        } else if (error.message.includes('Network')) {
            userMessage = 'Network error occurred. Please check your connection and refresh the page.';
        } else if (error.message.includes('spaces') || error.message.includes('cards')) {
            userMessage = 'Game data is corrupted or missing. Please refresh the page.';
        }
        
        this.setState({ 
            error: userMessage
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