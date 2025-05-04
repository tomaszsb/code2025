# MoveLogic Integration Guide

This guide explains how to implement the new modular approach for the movement logic in your game project.

## Overview of the Changes

The original `MoveLogicBase.js` file has been broken down into several smaller, more focused modules:

1. **MoveLogicBase.js** - Core functionality and base class
2. **MoveLogicSpaceTypes.js** - Space type detection system
3. **MoveLogicVisitTypes.js** - Visit type resolution
4. **MoveLogicCardEffects.js** - Card effect processing
5. **MoveLogicSpaceHandlers.js** - Handlers for different space types
6. **MoveLogicSpecialCases.js** - Special case handlers (requires integration)

Each module extends the previous one, creating a chain of inheritance that adds functionality at each step.

## Key Improvements

1. **Systematic Space Type Detection**: Instead of hardcoded special cases, spaces are now identified by their properties and characteristics.

2. **Space Type Registry**: Each space type has a registered handler function, making it easy to add new types or modify existing ones without changing the core logic.

3. **Separation of Concerns**: Each module focuses on a specific aspect of the system, making the code more maintainable and easier to understand.

4. **Backward Compatibility**: The implementation maintains compatibility with the existing codebase, ensuring that it will work with the current UI and other components.

5. **Improved Logging**: Every step of processing includes detailed logging, making it easier to debug issues.

## Implementation Steps

1. The following files have been created:
   - `MoveLogicBase.js` - New core file
   - `MoveLogicSpaceTypes.js` - Space type detection
   - `MoveLogicVisitTypes.js` - Visit type resolution
   - `MoveLogicCardEffects.js` - Card effect processing
   - `MoveLogicSpaceHandlers.js` - Space type handlers

2. Modify your existing `MoveLogicSpecialCases.js` file to integrate with the new system (see the `MoveLogicSpecialCases_Integration.js` for guidance).

3. Ensure your HTML includes the scripts in the correct order:

```html
<!-- Load in this specific order -->
<script src="js/utils/move-logic/MoveLogicBase.js"></script>
<script src="js/utils/move-logic/MoveLogicSpaceTypes.js"></script>
<script src="js/utils/move-logic/MoveLogicVisitTypes.js"></script>
<script src="js/utils/move-logic/MoveLogicCardEffects.js"></script>
<script src="js/utils/move-logic/MoveLogicSpaceHandlers.js"></script>
<script src="js/utils/move-logic/MoveLogicSpecialCases.js"></script>
<script src="js/utils/move-logic/MoveLogicUIUpdates.js"></script>
<script src="js/utils/move-logic/MoveLogicManager.js"></script>
<script src="js/utils/move-logic/MoveLogicBackwardCompatibility.js"></script>
```

4. Update `MoveLogicManager.js` to instantiate `MoveLogicSpecialCases` instead of `MoveLogicUIUpdates`. For example:

```javascript
// In the MoveLogicManager constructor
function MoveLogicManager() {
  // Call the parent constructor
  window.MoveLogicSpecialCases.call(this);
  
  // Rest of the constructor implementation...
}

// Update inheritance
MoveLogicManager.prototype = Object.create(window.MoveLogicSpecialCases.prototype);
MoveLogicManager.prototype.constructor = MoveLogicManager;
```

## How the Space Type System Works

The space type system identifies spaces based on their properties:

1. **StandardSpace**: All spaces have this type by default.
2. **DiceRollSpace**: Spaces with "Outcome from rolled dice" in their nextSpaces.
3. **VisitTypeSpace**: Spaces with different behavior for first vs. subsequent visits.
4. **CardEffectSpace**: Spaces with card effects (WCard, BCard, etc.).
5. **CostSpace**: Spaces with Fee or Time properties.
6. **DecisionTreeSpace**: Spaces with complex decision logic (based on predefined list).
7. **NegotiationSpace**: Spaces with negotiate options.

Each space can have multiple types, and the appropriate handlers will be applied based on these types.

## Adding New Space Types

To add a new space type:

1. Add a new type to the `spaceTypes` object in `MoveLogicSpaceTypes.js`.
2. Add detection logic for the new type in the `getSpaceTypes` method.
3. Create a handler function for the new type in `MoveLogicSpaceHandlers.js`.
4. Register the handler in the constructor of `MoveLogicSpaceHandlers.js`.

For example, if you wanted to add a new space type for "Quiz" spaces:

```javascript
// 1. Add to spaceTypes in MoveLogicSpaceTypes.js
this.spaceTypes = {
  // ... existing types
  QUIZ: 'QuizSpace'
};

// 2. Add detection logic in getSpaceTypes method
if (space.hasQuiz || (space.nextSpaces && space.nextSpaces.some(s => s && s.includes('Quiz')))) {
  spaceTypes.push(this.spaceTypes.QUIZ);
  console.log(`MoveLogicSpaceTypes: Detected ${this.spaceTypes.QUIZ} for ${space.name}`);
}

// 3. Create handler in MoveLogicSpaceHandlers.js
MoveLogicSpaceHandlers.prototype.handleQuizSpace = function(gameState, player, space) {
  console.log(`MoveLogicSpaceHandlers: Handling quiz space ${space.name}`);
  // Quiz-specific logic here
  return null;
};

// 4. Register handler in MoveLogicSpaceHandlers constructor
this.spaceTypeHandlers[this.spaceTypes.QUIZ] = this.handleQuizSpace.bind(this);
```

## Testing the Implementation

After implementing these changes, test the system with different space types:

1. Test a dice roll space to ensure it prompts for dice roll when needed.
2. Test a space with card effects to verify they're applied correctly.
3. Test spaces with visit-dependent behavior to ensure they're handled correctly.
4. Test special case spaces to verify backward compatibility.

## Troubleshooting

If you encounter issues:

1. Check the browser console for error messages and logs.
2. Verify that all scripts are loaded in the correct order.
3. Ensure that `MoveLogicSpecialCases.js` has been properly integrated with the new system.
4. Check for any JavaScript errors that might prevent the scripts from running.

Common issues:

- **Error: "MoveLogicSpaceTypes not found"**: Make sure scripts are loaded in the correct order.
- **No spaces detected with expected types**: Double-check the space type detection logic.
- **Special case spaces not handled correctly**: Verify the integration of `MoveLogicSpecialCases.js`.

## Future Enhancements

The modular design makes it easy to add new features in the future:

1. Add support for new space types without modifying existing code.
2. Enhance dice roll handling with more sophisticated outcome selection.
3. Improve card effect processing with additional effect types.
4. Create a more flexible system for decision tree spaces.

## Conclusion

This modular approach to the movement logic creates a more robust and maintainable system. By detecting space types based on properties rather than hardcoded names, it can handle a wider variety of spaces with less code duplication and greater flexibility.

The space type system is a powerful way to organize the complexity of different space behaviors, making it easier to understand, maintain, and extend the codebase in the future.
