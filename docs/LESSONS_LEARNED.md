# Development Best Practices

## Overview

This document consolidates lessons learned, best practices, and optimization recommendations for the Project Management Game. It serves as a guide for maintaining and extending the codebase in a consistent, efficient, and maintainable way.

## Code Organization Principles

### Component Structure

1. **Single Responsibility Principle**
   - Each component should have one clear responsibility
   - Break large components (over 300-400 lines) into smaller focused ones
   - Example: The CardDisplay component was refactored from 700+ lines into six focused components
   - Example: The GameBoard component was refactored to use manager classes for different responsibilities

2. **Manager Pattern**
   - Use manager classes for related functionality
   - Each manager should have a clear, single purpose
   - Managers should reference the parent component for state updates
   - Example: TurnManager, SpaceSelectionManager, and SpaceExplorerManager classes

3. **Component Hierarchy**
   - Parent components should coordinate child components
   - Child components should be focused on specific UI or functionality
   - Pass only the required props to child components
   - Example: GameBoard manages managers while BoardRenderer handles only the visual representation

4. **File Structure**
   - Keep related functionality in the same folder
   - Separate utility functions into their own files
   - Group components by feature when possible
   - Ensure imports are organized from most general to most specific

### State Management

1. **Centralized State**
   - Use the GameState object for game-wide state
   - Component state should only be used for UI-specific state
   - Avoid redundant state in components
   - Example: Player position is stored in GameState, not in player components

2. **State Updates**
   - Use appropriate methods on GameState for updates
   - Avoid direct mutation of state objects
   - Use spreads or Object.assign for creating new objects
   - Example: Using movePlayer() method instead of directly updating player.position

3. **Event System**
   - Use custom events for cross-component communication
   - Keep event names descriptive and specific
   - Add event listeners in componentDidMount and remove in componentWillUnmount
   - Example: resetSpaceInfoButtons event in NegotiationManager

## Performance Optimization

### Rendering Optimization

1. **Minimize Re-renders**
   - Use shouldComponentUpdate when appropriate
   - Memoize expensive calculations
   - Use pure components for presentational components
   - Avoid creating new functions in render methods
   - Example: Extracting card type color handling to a separate method

2. **DOM Manipulation**
   - Avoid direct DOM manipulation when possible
   - Use React refs when DOM access is necessary
   - Batch DOM updates
   - Example: Using CSS classes for animations instead of direct style manipulation

3. **Style Application**
   - Use CSS classes instead of inline styles
   - Group related styles in CSS files
   - Use CSS variables for shared values
   - Avoid direct DOM style manipulation; use class toggling instead
   - Move inline styles to external CSS files for better maintainability
   - Example: Refactoring BoardSpaceRenderer.js to use external CSS instead of injecting styles through JavaScript

### Data Management

1. **CSV Processing**
   - Process CSV data once at initialization
   - Cache processed results
   - Handle missing or invalid data gracefully
   - Example: Parsing space data in GameState.initialize()

2. **localStorage Usage**
   - Minimize localStorage writes
   - Batch related updates
   - Use efficient serialization
   - Example: saveState() method that handles all persistence at once

3. **Memory Management**
   - Avoid creating large objects/arrays in render methods
   - Clean up event listeners and timers
   - Use appropriate data structures for lookups
   - Example: Using Maps for finding spaces by ID instead of array.find()

## Lessons from Previous Implementations

### Approaches to Avoid

1. **Complex Initialization Sequences**
   - The previous implementation had a complex startup sequence with many dependencies
   - Keep initialization focused and simple
   - Use async/await for cleaner asynchronous code
   - Handle initialization failures gracefully
   - Example: The current main.js uses async/await instead of nested callbacks

2. **Circular Dependencies**
   - Previous manager classes depended on each other, creating circular references
   - Design components with clear hierarchies
   - Use events or callbacks for upward communication
   - Example: Using custom events to communicate between components

3. **Premature Error Handling**
   - Previous code added extensive error handling before core functionality worked
   - Focus on getting core functionality working first
   - Add targeted error handling where needed
   - Use error boundaries for component-level failures
   - Example: The current approach with componentDidCatch in key components

4. **Simultaneous Changes**
   - Previous implementation tried to modify multiple components at once
   - Work on one feature or component at a time
   - Test thoroughly after each change
   - Example: The card system refactoring was done as a focused effort

5. **Style Injection Through JavaScript**
   - Previous implementations injected styles directly through JavaScript
   - This approach creates maintenance issues and adds complexity
   - Keep styles in external CSS files
   - Use class names for styling instead of programmatic style manipulation
   - Example: BoardSpaceRenderer.js refactoring to eliminate style element injection

6. **Direct Method Access**
   - Previous implementation accessed methods directly from other components
   - This creates tight coupling between components
   - Use manager classes or events for communication
   - Example: Converting direct GameBoard method access to manager-based access

### What Worked Well

1. **Manager Component Pattern**
   - The manager component pattern significantly improved code organization
   - Clear separation of concerns made the code more maintainable
   - Easier to add new features without modifying existing code
   - Example: TurnManager, SpaceSelectionManager, and SpaceExplorerManager

2. **CSV-Driven Approach**
   - Using CSV files for game content worked well
   - Kept data separate from code
   - Made content updates easier
   - Example: Spaces, cards, and dice roll data in CSV files

3. **Snake Board Layout**
   - The visual snake layout was effective
   - Created a clear game progression
   - Easy to understand for players
   - Example: BoardDisplay's row-based layout

4. **Component Refactoring**
   - Breaking large components into smaller ones improved maintenance
   - Clear separation of concerns improved code quality
   - Made debugging easier
   - Example: Card system refactoring, GameBoard refactoring, and BoardSpaceRenderer refactoring

5. **Logging**
   - Console logs at the beginning and end of each file helped with debugging
   - Made it easier to track execution flow
   - Simplified troubleshooting
   - Example: All component files now include proper logging with standardized format
   - Recently standardized game-state.js logging to match other components

6. **CSS Extraction**
   - Moving inline styles and JavaScript style injection to external CSS files
   - Improved performance by reducing DOM manipulation
   - Enhanced maintainability by centralizing styling
   - Examples: BoardSpaceRenderer.js and DiceRoll.js refactoring to use external CSS
   - Properly scoping CSS selectors to prevent styling conflicts between components
   - Naming animations carefully to avoid conflicts between components

## Implementation Guidelines

### Adding New Features

1. **Apply the Manager Pattern**
   - Create a manager class for each major responsibility
   - Keep managers focused on a single responsibility
   - Update all references to use managers consistently
   - Example: GameBoard component refactoring with TurnManager, SpaceSelectionManager, and SpaceExplorerManager

2. **Start Simple**
   - Begin with minimal viable implementation
   - Get the basic functionality working first
   - Add refinements incrementally
   - Example: The dice roll system started simple before 3D visuals were added

3. **Feature Integration**
   - Plan how the feature will integrate with existing code
   - Identify integration points before implementation
   - Use existing patterns when possible
   - Example: Card animations integrated with the existing card system

4. **Testing Strategy**
   - Plan test cases before implementation
   - Test edge cases and failure modes
   - Verify across different browsers
   - Example: Testing dice roll outcomes with different space types

### Modifying Existing Code

1. **Understand Before Changing**
   - Trace execution flow through the component
   - Understand all dependencies
   - Review related components
   - Example: Reviewing all manager references before modifying any manager class

2. **Make Targeted Changes**
   - Focus changes on specific functionality
   - Avoid changing multiple systems at once
   - Keep PR scope narrow
   - Example: Modifying only the card filtering without changing other card functionality

3. **Preserve Interfaces**
   - Maintain existing method signatures when possible
   - Deprecate old methods rather than removing immediately
   - Add new functionality without breaking existing code
   - Example: Adding new card types without breaking existing card processing

4. **Update All References**
   - When moving functionality, update all references to that functionality
   - Check both direct method calls and event listeners
   - Use search tools to find all references
   - Example: Updating all isVisitingFirstTime() references when moving to SpaceSelectionManager

### Debugging Tips

1. **Isolate Problems**
   - Narrow down the source of issues
   - Use console logging at key points
   - Check browser developer tools
   - Example: Using console.log in the capturePlayerStatus method

2. **Common Issues**
   - Incorrect space filtering for visit types
   - Card animation timing issues
   - Event listener cleanup missing
   - Props not passed correctly
   - Method references not updated after refactoring
   - Example: Checking for missing props in componentDidMount or methods being called from the wrong manager

3. **Diagnostic Techniques**
   - Use React DevTools to inspect component hierarchy
   - Check localStorage content for state issues
   - Review console for warnings/errors
   - Review component lifecycle order
   - Example: Checking localStorage when state persistence issues occur

## Coding Standards

### JavaScript Patterns

1. **ES6+ Features**
   - Use arrow functions for maintaining 'this' context
   - Use destructuring for cleaner props access
   - Use spread operator for immutable updates
   - Example: Using destructuring in render methods

2. **React Patterns**
   - Use controlled components for form elements
   - Lift state up when needed by multiple components
   - Use composition over inheritance
   - Example: GameBoard composition with multiple child components

3. **Error Handling**
   - Use try/catch blocks for error-prone operations
   - Implement error boundaries for component failures
   - Log detailed error information
   - Example: SpaceExplorer's componentDidCatch implementation

4. **Manager Pattern**
   - Each manager should have a clear responsibility
   - Managers should access parent component through a reference
   - Managers should update state through the parent component
   - Example: TurnManager.js, SpaceSelectionManager.js, SpaceExplorerManager.js

### CSS Guidelines

1. **Class Naming**
   - Use descriptive, component-related class names
   - Follow a consistent naming convention
   - Avoid overly generic names
   - Example: 'card-type-indicator' instead of just 'indicator'

2. **Style Organization**
   - Group related styles together
   - Use CSS files for component-specific styles
   - Avoid inline styles
   - Keep all styling for a component in a dedicated CSS file
   - Use parent selectors to properly scope styles (e.g., '.dice-roll-container .dice-face')
   - Example: board-space-renderer.css and dice-animations.css for component-specific styling

3. **Animation Naming**
   - Use component-specific prefixes for animation names to avoid conflicts
   - Rename animations when extracting CSS from JavaScript to avoid collisions
   - Example: 'dice-roll-animation' instead of generic 'roll-animation'

4. **Visual Consistency**
   - Maintain consistent spacing
   - Use a unified color palette
   - Keep animations consistent across components
   - Example: Consistent card styling across different card types

5. **CSS Conflicts Management**
   - Resolve selector conflicts by increasing specificity instead of using !important
   - Add component class prefixes to prevent style bleeding between components
   - Test CSS changes thoroughly to ensure they don't affect other components
   - Example: Using '.board-space .dice-icon' and '.dice-roll-container .dice-icon' to style similar elements differently

### Documentation

1. **Code Comments**
   - Comment complex logic
   - Explain "why" not just "what"
   - Document method parameters and return values
   - Example: Comments explaining negotiation permission checking logic

2. **Documentation Files**
   - Keep documentation up to date with code changes
   - Focus on high-level concepts and architecture
   - Include examples for complex functionality
   - Document refactoring efforts and their benefits
   - Example: board-space-renderer-improvements.md and gameboard-refactoring.md documents

3. **Logging Standards**
   - Include meaningful log messages
   - Use appropriate log levels
   - Add beginning and end logs for each file
   - Include the source component in log messages
   - Example: Console logs in StaticPlayerStatus.js and manager components

## Manager Component Pattern

### Benefits of Manager Pattern

1. **Improved Separation of Concerns**
   - Each manager handles a specific aspect of the game
   - Main component remains focused on coordination
   - Example: TurnManager handling only turn-related operations

2. **Enhanced Maintainability**
   - Smaller, focused files are easier to understand and modify
   - Changes to one aspect don't affect others
   - Example: Modifying negotiation logic without touching turn management

3. **Better Testability**
   - Managers can be tested in isolation
   - Easier to mock dependencies
   - Example: Testing SpaceSelectionManager without a full GameBoard

4. **Simplified Debugging**
   - Errors are isolated to specific managers
   - Log messages clearly indicate the source
   - Example: "TurnManager: Turn ended" vs generic "Turn ended" message

### Implementing Manager Pattern

1. **Create Manager Classes**
   - One class per responsibility area
   - Constructor accepts parent component reference
   - Methods perform specific operations
   - Example: TurnManager for turn operations, SpaceSelectionManager for space operations

2. **Initialize Managers**
   - Create manager instances in constructor
   - Store as component properties
   - Example: `this.turnManager = new TurnManager(this);`

3. **State Updates**
   - Managers use this.gameBoard.setState() for updates
   - Avoid direct state manipulation
   - Example: TurnManager.handleEndTurn() updating game state

4. **Method Delegation**
   - Route method calls to appropriate managers
   - Update all references to use managers
   - Example: BoardRenderer using turnManager.getCurrentPlayer() instead of direct access

5. **Cross-Manager Communication**
   - Managers can access other managers through gameBoard reference
   - Use events for complex interactions
   - Example: NegotiationManager using turnManager for player access

### Common Pitfalls

1. **Missed References**
   - Not updating all method references when moving to managers
   - Check all files that might use the method
   - Example: Missing updates in BoardRenderer or SpaceInfo

2. **Circular Dependencies**
   - Managers depending on each other directly creates tight coupling
   - Use gameBoard as intermediary for cross-manager access
   - Example: NegotiationManager accessing TurnManager through gameBoard

3. **Inconsistent State Updates**
   - Some state updates happening directly, others through managers
   - Ensure all state updates go through the appropriate manager
   - Example: Updating player position through TurnManager, not directly

4. **Incomplete Documentation**
   - Not documenting manager responsibilities and relationships
   - Document manager purpose and methods
   - Example: Creating gameboard-refactoring.md to document the approach

---

*Last Updated: April 18, 2025 (Updated with GameBoard manager pattern lessons)*
