# CSS Variable Naming and Fixes

## Overview

This document outlines the CSS variable naming conventions used in the project and details recent fixes made to ensure consistent variable references across the codebase.

## CSS Variable Naming Conventions

In the Project Management Game, we follow these conventions for CSS variables:

1. All CSS variables are defined in the `:root` selector in main.css
2. Variable names use kebab-case (hyphen-separated words)
3. Related variables are grouped with consistent prefixes
4. Multi-word variables always use hyphens between words

Example variable structure:
```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;
  
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
  --shadow-md: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
}
```

## Recent Fixes

### CSS Variable Reference Error in main.css

**Issue:** 
In the main.css file, there was a typo in the padding property for the `.player-panel` and `.game-board-wrapper` classes. The reference was using `--spacingsm` (without a hyphen) instead of the correct `--spacing-sm` (with a hyphen).

**Original Code:**
```css
.player-panel,
.game-board-wrapper {
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1);
  padding: var(--spacingsm);  /* Incorrect variable name */
  display: flex;
  flex-direction: column;
}
```

**Fixed Code:**
```css
.player-panel,
.game-board-wrapper {
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-sm);  /* Corrected variable name */
  display: flex;
  flex-direction: column;
}
```

**Impact:**
- The padding was not being applied correctly to the player panels and game board wrapper
- This caused inconsistent spacing in the UI
- The fix ensures proper padding is applied (0.5rem as defined in the `:root` selector)
- The overall UI now has consistent spacing and improved visual appearance

## Best Practices for CSS Variables

1. **Consistent Naming:**
   - Always use hyphens for multi-word variables (e.g., `--spacing-sm`, not `--spacingsm`)
   - Follow the established patterns in the existing codebase

2. **Variable References:**
   - Always check that variable references match exactly with the defined variables
   - Be cautious of typos, especially with similar variable names

3. **Documentation:**
   - When adding new CSS variables, document them in a comment
   - Group related variables together for better organization

4. **Validation:**
   - Check for CSS warnings in the browser developer tools
   - Verify that styles are applied as expected

## Lessons Learned

This fix reinforces the importance of consistent CSS variable naming across the project. Even small typos like missing hyphens can lead to styling inconsistencies that affect the overall user experience.

When working with CSS variables:

1. Double-check variable references against their definitions
2. Be aware of similar variable names that might cause confusion
3. Use browser developer tools to verify variable resolution
4. Document any variable patterns for team reference

---

*Last Updated: April 19, 2025*