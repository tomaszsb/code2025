# Development Guide

## Getting Started

This guide provides comprehensive instructions for developers working on the Project Management Game. It covers development environment setup, coding standards, testing procedures, and contribution guidelines.

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Code Standards](#code-standards)
4. [Performance Optimization](#performance-optimization)
5. [Testing Procedures](#testing-procedures)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Project Status and Roadmap](#project-status-and-roadmap)
8. [Development Phases](#development-phases)
9. [Pull Request Process](#pull-request-process)
10. [Documentation Guidelines](#documentation-guidelines)

## Development Environment Setup

### Prerequisites

1. **Web Server**: A local web server is required to run the game. You can use:
   - Node.js with a simple HTTP server (`http-server`)
   - Python's built-in server (`python -m http.server`)
   - Any other local development server

### Setup Steps

1. Clone the repository
2. Navigate to the project directory
3. Start a local web server in the root directory
4. Open a browser and navigate to the local server address (typically http://localhost:8000)

## Project Structure

The project follows a structured organization:

```
code2025/
├── css/                   # CSS stylesheets
│   ├── main.css           # Core styling
│   ├── board.css          # Board-related styling
│   ├── components/        # Component-specific CSS files
│   └── animations/        # Animation-specific CSS files
├── js/
│   ├── components/        # React components
│   │   └── managers/      # Manager components
│   ├── data/              # Data handling
│   │   └── game-state.js  # Core game state
│   └── utils/             # Utility functions
├── data/                  # CSV and other data files
├── docs/                  # Documentation
└── index.html             # Main entry point
```

## Code Standards

### General Principles

1. **No Separate Patches**: All fixes should modify the original code directly. Don't create separate patch files or workarounds.
2. **Closed System**: The game should remain a closed system. Don't introduce external dependencies.
3. **Logging**: Every file should include console.log statements that indicate:
   - When the file begins to be used (`console.log('FileName.js file is beginning to be used')`)
   - When code execution is finished (`console.log('FileName.js code execution finished')`)
4. **CSS Organization**: No inline CSS. All styling should be in dedicated CSS files.

### Manager Pattern

When implementing new features, follow the manager pattern:

1. Create a dedicated manager class for the feature
2. Follow single responsibility principle
3. Use event-based communication instead of direct state manipulation
4. Include proper cleanup methods
5. Use standardized error handling and logging

Example manager structure:
```javascript
class FeatureManager {
    constructor(gameState, container) {
        console.log('FeatureManager.js is beginning to be used');
        this.gameState = gameState;
        this.container = container;
        this.initialize();
    }
    
    initialize() {
        // Setup event listeners
        this.gameState.addEventListener('stateChanged', this.handleStateChange.bind(this));
    }
    
    handleStateChange(event) {
        // Handle state changes
    }
    
    cleanup() {
        // Remove event listeners
        this.gameState.removeEventListener('stateChanged', this.handleStateChange.bind(this));
    }
}
console.log('FeatureManager.js code execution finished');
```

### CSS Guidelines

1. Use external CSS files for all styling
2. Organize CSS by component
3. Use CSS variables for consistency:
   ```css
   :root {
     --primary-color: #4285f4;
     --secondary-color: #34a853;
     --spacing-sm: 8px;
     --spacing-md: 16px;
     --spacing-lg: 24px;
   }
   ```
4. Follow standardized naming conventions:
   - Use kebab-case for class names (e.g., `.player-card`)
   - Use descriptive names that indicate purpose
   - Prefix component-specific classes with component name (e.g., `.dice-container`)
   
#### CSS Example - StaticPlayerStatus

The StaticPlayerStatus component demonstrates good CSS practices:

1. Dedicated CSS file: `static-player-status.css`
2. No inline styles in the JavaScript component
3. Dynamic styling through class application:
   ```javascript
   // Instead of inline styles like this:
   // style={{ border: `2px solid ${playerColor}` }}
   
   // Use class-based approach:
   const borderClass = getColorClass('static-player-status-border', playerColor);
   <div className={`static-player-status ${borderClass}`}>
   ```
4. Consistent naming with component prefixes:
   ```css
   .static-player-status-color-indicator {}
   .static-player-status-name {}
   .static-player-status-section-title {}
   ```

### Event System

Use the GameStateManager event system for all communication:

1. Register event listeners in initialize/constructor:
   ```javascript
   this.gameState.addEventListener('playerMoved', this.handlePlayerMoved.bind(this));
   ```

2. Clean up event listeners in cleanup method:
   ```javascript
   this.gameState.removeEventListener('playerMoved', this.handlePlayerMoved.bind(this));
   ```

3. Use standardized event types (see GameStateManager for available events)

## Performance Optimization

### Best Practices

1. **Memoization**: Use memoization for expensive calculations:
   ```javascript
   memoizedCalculation = (input) => {
     if (this.cache[input]) return this.cache[input];
     const result = this.performExpensiveCalculation(input);
     this.cache[input] = result;
     return result;
   }
   ```

2. **Component Lifecycle**: Implement shouldComponentUpdate or PureComponent:
   ```javascript
   shouldComponentUpdate(nextProps, nextState) {
     // Only update if relevant props/state changed
     return nextProps.relevantProp !== this.props.relevantProp;
   }
   ```

3. **DOM Manipulation**: Minimize direct DOM manipulation:
   - Avoid using document.querySelector inside render methods
   - Use refs for necessary DOM access
   - Batch DOM updates when possible

4. **Cleanup**: Always implement proper cleanup:
   ```javascript
   componentWillUnmount() {
     // Remove event listeners
     // Clear timeouts/intervals
     // Release resources
   }
   ```

## Testing Procedures

### Manual Testing

1. **Space Movement Testing**:
   - Test movement between all connected spaces
   - Verify correct display of available moves
   - Test dice roll outcomes for all result types
   - Verify first vs. subsequent visit behavior

2. **Card System Testing**:
   - Test card drawing from all card types
   - Verify card display, filtering, and interaction
   - Test card play and discard functionality
   - Verify special card mechanisms (e.g., Work cards)

3. **State Management Testing**:
   - Test game save/load functionality
   - Verify player turn progression
   - Test game end conditions
   - Verify memory management (continue/new game)

### Debugging Tips

- Use the browser console to view log messages and understand the game flow
- The GameStateManager maintains the core game state, so examine its state when troubleshooting
- Check `GameState.players` for player-specific issues
- Use the `debugGameState()` utility function to output the current game state
- Check the SpaceInfo component for issues related to displaying game information
- Review the BoardRenderer for problems with visual representation

## Common Issues and Solutions

### Visual Rendering Problems

**Problem**: Spaces not appearing correctly on the board.  
**Solution**: Check the BoardDisplay component and ensure proper CSS imports. Verify that the CSS classes are correctly applied.

**Problem**: Player tokens not showing up or moving incorrectly.  
**Solution**: Examine the BoardSpaceRenderer component and check player movement animations in CSS.

### State Management Issues

**Problem**: Game state not persisting between sessions.  
**Solution**: Verify localStorage functionality and check GameStateManager's saveState method.

**Problem**: Player turn not advancing correctly.  
**Solution**: Examine TurnManager.js for turn advancement logic and ensure event listeners are properly attached.

### Card System Issues

**Problem**: Cards not drawing or displaying correctly.  
**Solution**: Check CardManager.js and verify that card data is loading correctly from CSV files.

**Problem**: Card filtering not working.  
**Solution**: Examine CardDisplay.js for filter functionality.

## Project Status and Roadmap

### Current Status

The Project Management Game has made significant progress with numerous features implemented and optimized. Below are the key strengths and recent achievements.

#### Key Strengths
1. **Project Structure**: Well-organized folder structure with proper separation of concerns.
2. **Component Organization**: Components are separated into individual files with good encapsulation.
3. **Data-Driven Approach**: CSV files are used as the source of truth for game data.
4. **Advanced Movement System**: Complex movement between spaces is implemented with support for first and subsequent visits.
5. **State Management**: The GameStateManager provides optimized state management with efficient caching and persistence.
6. **Dice Roll System**: A fully functional dice roll system is implemented with 3D visuals and outcome categorization.
7. **Card System**: Card data structure, drawing logic, and UI implementation are complete.
8. **Manager Architecture**: Core components follow the manager pattern for better organization.

#### Recent Achievements

1. **SpaceExplorer Performance Optimization**:
   - Implemented memoized data processing to avoid redundant calculations
   - Added performance tracking with render count and timing metrics
   - Enhanced error handling with stack trace and component stack logging
   - Improved null checking throughout the component to prevent rendering errors

2. **GameStateManager Implementation**:
   - Converted global GameState object to class-based GameStateManager 
   - Implemented high-performance caching for space lookups using Map data structures
   - Optimized visited spaces tracking with Set data structure for O(1) lookups
   - Created a robust event system for state changes with standardized event types

3. **Game Memory Management Enhancement**:
   - Added saved game detection with user-friendly options
   - Implemented continue/new game options for players
   - Enhanced state persistence with consolidated localStorage usage

4. **Enhanced Dice Roll System**:
   - Extracted all dice-related CSS to a dedicated file
   - Properly scoped CSS selectors to prevent styling conflicts
   - Implemented strict data adherence for dice outcomes

5. **Visual Improvements**:
   - Added player movement animations with arrival and departure effects
   - Enhanced active player highlighting with pulsing effects and "YOUR TURN" indicator
   - Improved visual cues for available moves

6. **Event System Integration**:
   - Successfully refactored multiple managers to use the GameStateManager event system
   - Created custom event types for player movement, turn transitions, and active player changes
   - Implemented comprehensive cleanup methods for proper event listener management

#### Areas for Improvement

1. **Complex Initialization Logic**: Streamlining is needed in main.js initialization sequence.
2. **Debug Elements**: Need a debug mode toggle for console.log statements.
3. **Move Logic Complexity**: MoveLogic.js could benefit from more consistent patterns.
4. **Event System Standardization**: SpaceExplorer component still needs to be refactored to use the event system (SpaceExplorerManager has been completed).
5. **CSS Consistency**: Continue reviewing for variable reference issues.

### Upcoming Priorities

#### Immediate Priorities (Next 2-4 Weeks)

1. **Event System Integration**:
   - ✓ COMPLETED: Refactor SpaceExplorerManager to use the GameStateManager event system

2. **End Game Experience**:
   - Implement proper game completion UI
   - Add player statistics and performance metrics
   - Create a replay option
   - Add ability to review game history
   - Design and implement win/loss conditions

3. **Testing with Manager Pattern**:
   - Test refactored GameBoard with manager components
   - Validate interaction between managers
   - Verify all game functionality works with new architecture
   - Ensure no performance regressions with the refactored components

4. **Visual Enhancements**:
   - Implement transitions between game states
   - Create consistent visual styling for different card types

#### Medium-Term Goals (1-3 Months)

1. **Educational Content Integration**:
   - Add tooltips explaining project management concepts
   - Integrate learning objectives with gameplay mechanics
   - Create a glossary of project management terms
   - Implement difficulty levels for different learning experiences
   - Add reflection prompts after key game decisions

2. **Testing Infrastructure**:
   - Create a comprehensive test suite for core game mechanics
   - Implement automated tests for component rendering
   - Add integration tests for critical user flows
   - Create a test plan for dice roll outcomes for balance
   - Implement test coverage reporting

3. **Multiplayer Enhancements**:
   - Improve turn-based mechanics
   - Add player interaction opportunities
   - Implement catch-up mechanics for trailing players
   - Balance resource distribution
   - Add team play mode

#### Long-Term Vision (3-6 Months)

1. **Advanced Game Mechanics**:
   - Implement risk management mechanics
   - Add project stakeholder dynamics
   - Create complex resource management challenges
   - Develop scenario-based gameplay options
   - Add industry-specific project types

2. **User Experience Refinements**:
   - Conduct usability testing and implement findings
   - Refine the visual design system
   - Implement accessibility improvements
   - Add progressive disclosure of complex mechanics
   - Create an onboarding tutorial

3. **Content Expansion**:
   - Add additional card types and effects
   - Create more diverse space types and outcomes
   - Develop advanced project management scenarios
   - Add industry-specific challenges and solutions
   - Implement a card creation system for instructors

4. **Integration Capabilities**:
   - Add API for integration with learning management systems
   - Create data export for analytics
   - Implement progress tracking
   - Add customization options for educational settings
   - Create an instructor dashboard

### Implementation Approach

When implementing these features, follow these guidelines:

1. **Manager Pattern**: Apply the manager component pattern for new features
2. **Incremental Development**: Build one feature at a time and test thoroughly before moving to the next
3. **Component Refactoring**: Continue breaking large components into smaller, focused ones
4. **Documentation**: Update documentation as features are developed
5. **Testing**: Write tests for each new feature before implementation
6. **Code Quality**: Maintain consistent coding patterns and avoid inline CSS
7. **Event System**: Use the GameStateManager event system instead of direct state manipulation
8. **Resource Cleanup**: Always add cleanup methods to properly remove event listeners

### Success Metrics

The success of this roadmap will be measured by:

1. **Completion Rate**: Percentage of planned features successfully implemented
2. **Code Quality**: Reduction in bugs and technical debt
3. **User Satisfaction**: Feedback from playtesting sessions
4. **Performance**: Improvements in loading time and interaction responsiveness
5. **Learning Outcomes**: Effectiveness in teaching project management concepts

## Development Phases

### Phase 1: Core Movement System (Completed)
**Goal**: Create a reliable, playable board game with basic movement mechanics.

- **Completed Tasks**:
  - ✓ Create simplified board with connected spaces following the "snake" diagram
  - ✓ Implement player token movement between spaces
  - ✓ Add basic turn system that works with multiple players
  - ✓ Create simple player setup screen
  - ✓ Implement game state persistence (save/load)
  - ✓ Add basic end game condition
  
- **Status**: COMPLETE
  - Board display and snake layout are fully implemented
  - Player movement is functional with support for first and subsequent visits
  - Turn system is working for multiple players
  - Player setup interface is complete
  - Game state persistence works with localStorage
  - End game detection and scoring is implemented

### Phase 2: Card System (Completed)
**Goal**: Implement the resource cards that drive the game's economy.

- **Completed Tasks**:
  - ✓ Create card data structure and storage
  - ✓ Connect card drawing to specific board spaces
  - ✓ Implement basic card actions (draw, discard)
  
- **Status**: COMPLETE
  - Card CSV data is prepared and available
  - Basic card logic is implemented in GameState
  - Card drawing is connected to spaces in the game
  - Game tracks which cards to draw based on visit type and space
  - Card UI is implemented with filtering and interaction

### Phase 3: Dice and Outcomes (Completed)
**Goal**: Implement the dice rolling mechanism and connect it to game outcomes.

- **Completed Tasks**:
  - ✓ Create dice rolling mechanic
  - ✓ Connect dice outcomes to space-specific results
  - ✓ Implement branching path logic based on dice results
  - ✓ Implement negotiation mechanic to retry outcomes
  - ✓ Enhance negotiation mechanic with improved logging and code clarity
  
- **Status**: COMPLETE
  - Dice rolling component is fully implemented with 3D visuals
  - Space-to-dice outcome connections are working
  - Result-based movement options are implemented
  - DiceRollLogic utility manages outcome processing
  - Dice roll history is maintained
  - Negotiation mechanics are fully integrated

### Phase 4: Project Management Elements (In Progress)
**Goal**: Enhance the educational value by implementing project management concepts.

- **Completed Tasks**:
  - ✓ Define board spaces to represent project phases
  
- **Upcoming Tasks**:
  - Add tooltips explaining project management concepts
  - Create a glossary of project management terms
  - Integrate learning objectives with gameplay
  
- **Status**: IN PROGRESS
  - Board spaces represent project phases with appropriate categories
  - Basic time tracking is implemented
  - Educational content is defined in space descriptions
  - Game instructions panel is implemented
  - Further refinement of PM concepts is needed

### Phase 5: Polishing and Testing (In Progress)
**Goal**: Refine the user experience and gather feedback.

- **Upcoming Tasks**:
  - Implement proper game completion UI
  - Add player statistics and performance metrics
  - Create a replay option
  - Conduct usability testing
  
- **Status**: IN PROGRESS
  - Basic styling is in place
  - Game flow is functional
  - Visual enhancements like player token animations have been implemented
  - More user testing needed

### Success Criteria
- ✓ Players can play through a complete game from start to finish
- ✓ The board movement system works reliably
- ✓ Multiple players can take turns effectively
- ✓ Game state persists when refreshing the page
- ✓ End game condition is properly detected
- ✓ Active player is clearly highlighted with visual cues
- ✓ Players can view and manage their cards
- ⬜ The game provides meaningful educational content about project management (in progress)

## Pull Request Process

1. Focus on a single issue or enhancement per PR
2. Include clear descriptions of what you changed and why
3. Ensure your code follows the logging and organization standards mentioned above
4. Test your changes thoroughly before submission

## Documentation Guidelines

When adding or modifying features, update the relevant documentation:

1. Update TECHNICAL_REFERENCE.md with technical details
2. Update PLAYER_GUIDE.md for player-facing changes
3. Add implementation details to component-specific documentation
4. Update the CHANGELOG.md with a summary of changes

Documentation should include:
- Purpose of the component/feature
- Interface details
- Integration points
- Important implementation notes
- Examples of usage

---

*Last Updated: April 22, 2025*