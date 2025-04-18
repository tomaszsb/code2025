# Development Best Practices

## Overview

This document consolidates lessons learned, best practices, and optimization recommendations for the Project Management Game. It serves as a guide for maintaining and extending the codebase in a consistent, efficient, and maintainable way.

## Code Organization Principles

### Component Structure

1. **Single Responsibility Principle**
   - Each component should have one clear responsibility
   - Break large components (over 300-400 lines) into smaller focused ones
   - Example: The CardDisplay component was refactored from 700+ lines into six focused components

2. **Component Hierarchy**
   - Parent components should coordinate child components
   - Child components should be focused on specific UI or functionality
   - Pass only the required props to child components
   - Example: GameBoard manages game state while BoardDisplay handles only the visual representation

3. **File Structure**
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

### What Worked Well

1. **CSV-Driven Approach**
   - Using CSV files for game content worked well
   - Kept data separate from code
   - Made content updates easier
   - Example: Spaces, cards, and dice roll data in CSV files

2. **Snake Board Layout**
   - The visual snake layout was effective
   - Created a clear game progression
   - Easy to understand for players
   - Example: BoardDisplay's row-based layout

3. **Component Refactoring**
   - Breaking large components into smaller ones improved maintenance
   - Clear separation of concerns improved code quality
   - Made debugging easier
   - Example: Card system refactoring and BoardSpaceRenderer refactoring

4. **Logging**
   - Console logs at the beginning and end of each file helped with debugging
   - Made it easier to track execution flow
   - Simplified troubleshooting
   - Example: All component files now include proper logging with standardized format
   - Recently standardized game-state.js logging to match other components

5. **CSS Extraction**
   - Moving inline styles and JavaScript style injection to external CSS files
   - Improved performance by reducing DOM manipulation
   - Enhanced maintainability by centralizing styling
   - Examples: BoardSpaceRenderer.js and DiceRoll.js refactoring to use external CSS
   - Properly scoping CSS selectors to prevent styling conflicts between components
   - Naming animations carefully to avoid conflicts between components

## Implementation Guidelines

### Adding New Features

1. **Start Simple**
   - Begin with minimal viable implementation
   - Get the basic functionality working first
   - Add refinements incrementally
   - Example: The dice roll system started simple before 3D visuals were added

2. **Feature Integration**
   - Plan how the feature will integrate with existing code
   - Identify integration points before implementation
   - Use existing patterns when possible
   - Example: Card animations integrated with the existing card system

3. **Testing Strategy**
   - Plan test cases before implementation
   - Test edge cases and failure modes
   - Verify across different browsers
   - Example: Testing dice roll outcomes with different space types

### Modifying Existing Code

1. **Understand Before Changing**
   - Trace execution flow through the component
   - Understand all dependencies
   - Review related components
   - Example: Reviewing card components before making changes to CardDisplay

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
   - Example: Checking for missing props in componentDidMount

3. **Diagnostic Techniques**
   - Use React DevTools to inspect component hierarchy
   - Check localStorage content for state issues
   - Review console for warnings/errors
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
   - Example: board-space-renderer-improvements.md document

3. **Logging Standards**
   - Include meaningful log messages
   - Use appropriate log levels
   - Add beginning and end logs for each file
   - Example: Console logs in StaticPlayerStatus.js

---

*Last Updated: April 18, 2025 (Updated with dice CSS extraction lessons)*