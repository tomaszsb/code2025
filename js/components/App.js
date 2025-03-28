// Main App Component (Simplified)
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
        
        // Render either GameBoard or PlayerSetup based on game state
        if (GameState.gameStarted) {
            return <GameBoard />;
        } else {
            return <PlayerSetup onSetupComplete={() => this.forceUpdate()} />;
        }
    }
}