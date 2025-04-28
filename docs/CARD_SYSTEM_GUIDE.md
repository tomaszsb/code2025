# Card System Guide

## Overview

This guide documents the architecture, design patterns, and implementation details of the card system in the Project Management Game. The card system is a core gameplay mechanic that allows players to acquire resources, complete work projects, and navigate challenges during gameplay.

## Card Types

The game features five distinct card types, each with its own purpose and mechanics:

1. **Work Type (W)** - Represents construction and building projects players can undertake
2. **Bank (B)** - Provides loans and financial resources to fund projects
3. **Investor (I)** - Offers investment capital with different terms than bank loans
4. **Life (L)** - Represents life events and personal circumstances that affect gameplay
5. **Expeditor (E)** - Allows players to accelerate or modify gameplay effects

## Technical Implementation

### Data Structure

Cards are stored in CSV files with the following standard format:

```
Type,Field1,Field2,...
X,Value1,Value2,...
```

Where:
- `Type` is a single letter code (W, B, I, L, or E) indicating card type
- Remaining fields vary by card type but follow a consistent structure
- All monetary values are stored as numbers without currency symbols

### File Organization

- Card data is stored in `/data/[X]-cards-improved.csv` files (one per card type)
- Card components are in `/js/components/Card*.js` files
- Card styling is in `/css/card-components.css`

### Card Display

Cards use a component-based architecture with the following key components:

1. `CardDisplay.js` - The main container component for displaying card collections
2. `CardDetailView.js` - Handles detailed individual card views
3. `CardAnimations.js` - Manages animations for card draws and effects
4. `CardTypeUtils.js` - Provides utility functions for card type handling

### CSS Implementation

All card styling is maintained in a dedicated CSS file (`card-components.css`) following the project's no-inline-CSS requirement. The CSS uses class-based styling with the following naming conventions:

```css
.card { /* Base card styling */ }
.card-type-[x] { /* Type-specific styling */ }
.card-header-[x] { /* Type-specific header styling */ }
```

Type-specific classes use the lowercase card type letter (w, b, i, l, e) as identifiers.

## Card Processing Flow

1. **Card Loading** - Cards are loaded from CSV files during game initialization 
2. **Type Detection** - The card type is determined from the explicit Type field or fallback methods
3. **Card Drawing** - When a space triggers a card draw, the appropriate card type is selected
4. **Card Display** - The card is added to the player's hand with proper styling based on type
5. **Card Effects** - When played, cards trigger their appropriate gameplay effects

## Best Practices

1. **Type Consistency** - Always use uppercase type codes in data processing and lowercase in CSS classes
2. **Error Handling** - Implement defensive coding for card type detection and field access
3. **CSS Organization** - Use class-based styling instead of inline styles
4. **Logging** - Include logging at the beginning and end of each card-related file
5. **Field Formatting** - Format monetary values consistently (e.g., using `formatCurrency` utility)

## Card Display Troubleshooting

If cards are not displaying correctly:

1. Check that card type is properly detected in the `detectCardType` method
2. Verify CSS classes are being applied correctly in card components
3. Ensure the card data is properly formatted in the CSV files
4. Confirm the card CSS file is properly included in the Index.html

## Recent Improvements

The card system has recently been enhanced with the following improvements:

1. Standardized CSV format with explicit Type field
2. Enhanced type detection with multiple fallback mechanisms
3. Dedicated CSS file for all card styling
4. Improved field formatting for monetary values
5. Enhanced error handling and logging

These changes ensure that cards display correctly and card information is processed consistently throughout the game.
