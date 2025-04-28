# Card Limit Feature Documentation

## Overview

The card limit feature is a game mechanic that restricts players from accumulating excessive numbers of cards. This feature was implemented to improve game balance, make strategic card management more important, and provide a more challenging and engaging experience.

## Key Features

### 1. Card Type Limits

- Each player can hold a maximum of **6 cards per type** (Work, Bank, Investor, Life, Expeditor)
- Visual indicators show the current count for each card type out of the maximum allowed
- When a limit is exceeded, cards of that type are highlighted with a warning visual effect

### 2. Card Count Display

- A new card count section displays the current count of each card type
- Format: `Card Type: Current Count/Maximum Limit`
- Count displays turn red when the limit is exceeded
- Each card type is color-coded with its corresponding card color

### 3. Card Limit Dialog

When a player exceeds the limit for any card type:

- A dialog appears informing the player they've exceeded the limit
- All excess cards (those beyond the 6-card limit) are displayed in the dialog
- Players can choose to discard individual cards by clicking on them
- A "Discard All Excess Cards" button allows quick resolution
- The game won't proceed until the player resolves the excess cards issue

### 4. Implementation Details

The card limit feature is fully integrated with:

- Card drawing mechanics: Checks limits when new cards are drawn
- Card filtering system: Counts respect the current filter selection
- Game state persistence: Limit enforcement persists between sessions
- Visual styling: Uses consistent CSS classes instead of inline styles

## Usage and Strategy

Players should actively manage their card collection to avoid hitting limits:

1. Regularly play high-value cards to make room for new ones
2. Strategically discard lower-value cards when approaching the limit
3. Pay attention to the card count indicators to anticipate when limits will be reached
4. Plan moves to spaces that provide the most needed card types

## Technical Implementation

The implementation follows the project's development guidelines:

- No inline CSS (all styling through class-based approach)
- Proper logging for debugging
- Event-based communication with GameStateManager
- Clean fallback mechanisms for edge cases
- Performance optimizations to avoid unnecessary re-renders

## Troubleshooting

If players encounter issues with the card limit feature:

1. Check browser console for errors related to CardDisplay.js
2. Verify that card-components.css is being loaded correctly
3. Inspect the DOM to ensure CSS classes are being applied properly
4. Test card drawing and discarding functions to ensure limits are being enforced
5. Verify that GameState.players[].cards arrays are being updated correctly

---

*Last Updated: April 27, 2025*