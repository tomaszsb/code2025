// App.js file is beginning to be used
console.log('App.js file is beginning to be used');

window.App = class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught in App component:', error);
        this.setState({ 
            error: error.message 
        });
    }
    
    render() {
        const { error, loading } = this.state;
        
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
        
        // Check if the game should start or show setup
        // Add null check for GameState and proper initialization check
        if (GameState && GameState.isProperlyInitialized && GameState.gameStarted) {
            return <GameBoard />;
        } else {
            // Show PlayerSetup which will handle saved games
            // It will check if there's a saved game and offer to continue or start new
            return <PlayerSetup onSetupComplete={() => this.forceUpdate()} />;
        }
    }
}

console.log('App.js code execution finished');