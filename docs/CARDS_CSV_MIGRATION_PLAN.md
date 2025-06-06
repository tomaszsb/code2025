# Cards CSV Migration Plan: From Multiple Files to Unified Structure

## Overview
This document outlines the comprehensive migration plan to transition from 5 separate card CSV files to a single unified `cards.csv` file with enhanced metadata structure. This migration will improve data retrieval, enable advanced card mechanics, and simplify maintenance.

## Current State Analysis

### Files to be Replaced
- `data/B-cards-improved.csv` (9 bank loan cards)
- `data/E-cards.csv` (74 expeditor cards) 
- `data/I-cards-improved.csv` (9 investment cards)
- `data/L-cards.csv` (49 life event cards)
- `data/W-cards-improved.csv` (9 work type cards)

### Key Components Affected
- `js/components/managers/InitializationManager.js:280-350` - Card loading logic
- `js/components/SpaceInfoCards.js:37-60` - Card type mapping
- `js/utils/csv-parser.js` - CSV parsing utilities
- `js/data/GameStateManager.js` - Card state management
- `js/components/CardManager.js` - Card operations

### New Unified Structure
- **Total Cards**: 150 (124 existing + 26 future expansion slots)
- **Columns**: 48 metadata fields including target, scope, phase restrictions, conditional logic
- **File**: `data/cards.csv` (already created)

## Migration Phases

---

## Phase 1: Enhanced CSV Parser (Day 1)
**Estimated Time**: 2-3 hours  
**Risk Level**: Low  
**Dependencies**: None

### Objectives
- Add card-specific parsing capabilities to csv-parser.js
- Implement card filtering and querying functions
- Maintain backward compatibility

### Tasks

#### 1.1 Update csv-parser.js
**File**: `js/utils/csv-parser.js`

**Add new functions:**
```javascript
// Add after existing parseCSV function
window.parseCardsCSV = function(csvText) {
  // Parse unified cards.csv with validation
  // Return structured card objects with metadata
}

window.filterCardsByType = function(cards, cardType) {
  // Filter cards by type (B, E, I, L, W)
  // Return array of matching cards
}

window.getCardById = function(cards, cardId) {
  // Get specific card by ID
  // Return single card object or null
}

window.queryCards = function(cards, filters) {
  // Advanced filtering by multiple criteria
  // filters: { type, phase, target, scope, etc. }
  // Return filtered array
}
```

#### 1.2 Add Card Data Validation
```javascript
window.validateCardData = function(card) {
  // Validate required fields
  // Check data types and ranges
  // Return { valid: boolean, errors: string[] }
}
```

#### 1.3 Testing
- Create test HTML file to verify parsing
- Test with sample card data
- Validate all 48 columns parse correctly
- Ensure backward compatibility with existing parseCSV

**Deliverables:**
- ✅ Enhanced csv-parser.js with card functions
- ✅ Test file demonstrating card parsing
- ✅ Documentation of new API methods

---

## Phase 2: Update InitializationManager (Day 2)
**Estimated Time**: 3-4 hours  
**Risk Level**: Medium  
**Dependencies**: Phase 1 complete

### Objectives
- Replace 5 separate card file loads with single unified load
- Update data structures to use new card format
- Maintain existing game functionality during transition

### Tasks

#### 2.1 Backup Current Implementation
```bash
# Create backup of current working version
cp js/components/managers/InitializationManager.js js/components/managers/InitializationManager.js.backup
```

#### 2.2 Update Configuration Object
**File**: `js/components/managers/InitializationManager.js:26-34`

**Replace:**
```javascript
dataFiles: {
  spaces: 'data/Spaces.csv',
  diceRoll: 'data/DiceRoll Info.csv',
  wCards: 'data/W-cards-improved.csv',
  bCards: 'data/B-cards-improved.csv',
  iCards: 'data/I-cards-improved.csv',
  lCards: 'data/L-cards.csv',
  eCards: 'data/E-cards.csv'
}
```

**With:**
```javascript
dataFiles: {
  spaces: 'data/Spaces.csv',
  diceRoll: 'data/DiceRoll Info.csv',
  cards: 'data/cards.csv'
}
```

#### 2.3 Rewrite loadCardData() Method
**File**: `js/components/managers/InitializationManager.js:280-350`

**New implementation:**
```javascript
async loadCardData() {
  this.log('info', 'InitializationManager: Loading unified card data');
  
  try {
    // Single fetch for all cards
    const response = await fetch(this.config.dataFiles.cards);
    
    if (!response.ok) {
      throw new Error(`Failed to load cards: ${response.status}`);
    }
    
    // Parse unified card data
    const csvText = await response.text();
    const allCards = window.parseCardsCSV(csvText);
    
    // Organize cards by type for backward compatibility
    const cardsByType = {
      W: window.filterCardsByType(allCards, 'W'),
      B: window.filterCardsByType(allCards, 'B'),
      I: window.filterCardsByType(allCards, 'I'),
      L: window.filterCardsByType(allCards, 'L'),
      E: window.filterCardsByType(allCards, 'E')
    };
    
    // Store both formats
    this.loadedData.cards = cardsByType;        // Backward compatibility
    this.loadedData.allCards = allCards;        // New unified format
    this.loadedData.cardIndex = this.buildCardIndex(allCards); // Fast lookup
    
    // Validation
    const totalLoaded = Object.values(cardsByType).reduce((sum, cards) => sum + cards.length, 0);
    this.log('info', `InitializationManager: Loaded ${totalLoaded} cards from unified file`);
    
    // Store results
    this.stageResults.loadCardData = {
      success: true,
      totalCards: totalLoaded,
      cardsByType: Object.fromEntries(
        Object.entries(cardsByType).map(([type, cards]) => [type, cards.length])
      )
    };
    
  } catch (error) {
    this.stageResults.loadCardData = { success: false, error: error.message };
    throw error;
  }
}
```

#### 2.4 Add Card Index Builder
```javascript
buildCardIndex(cards) {
  const index = {
    byId: {},
    byType: {},
    byPhase: {},
    byTarget: {}
  };
  
  cards.forEach(card => {
    index.byId[card.card_id] = card;
    // Build other indexes...
  });
  
  return index;
}
```

#### 2.5 Testing
- Test game initialization with new card loading
- Verify all card types are accessible
- Ensure game mechanics still work
- Test error handling for missing/corrupt card file

**Deliverables:**
- ✅ Updated InitializationManager with unified card loading
- ✅ Backward compatibility maintained
- ✅ Enhanced card indexing for performance
- ✅ Comprehensive error handling

**COMPLETED**: Phase 2 finished successfully. All 398 cards load from unified CSV with proper type distribution (W: 176, B: 60, I: 39, L: 49, E: 74). Backward compatibility preserved.

---

## Phase 3: Update Card Components (Day 3)
**Estimated Time**: 4-5 hours  
**Risk Level**: Medium  
**Dependencies**: Phase 2 complete

### Objectives
- Enhance card access patterns to use new metadata
- Update UI components for card display and interaction
- Implement new card mechanic foundations

### Tasks

#### 3.1 Update SpaceInfoCards.js
**File**: `js/components/SpaceInfoCards.js`

**Enhance card type mapping:**
```javascript
// Replace lines 37-60 with enhanced mapping
const cardTypeMapping = {
  'Work Type Card': { type: 'W', category: 'work' },
  'Bank Card': { type: 'B', category: 'financing' },
  'Investor Card': { type: 'I', category: 'financing' },
  'Life Event': { type: 'L', category: 'events' },
  'Expeditor': { type: 'E', category: 'efficiency' }
};
```

**Add card filtering methods:**
```javascript
getAvailableCards: function(cardType, phase = null, restrictions = {}) {
  const allCards = this.getGameData()?.allCards || [];
  
  let filters = { card_type: cardType };
  if (phase) filters.phase_restriction = phase;
  
  return window.queryCards(allCards, filters);
},

canPlayCard: function(card, gameState) {
  // Check if card can be played given current game state
  // Consider phase restrictions, target availability, costs, etc.
  return this.validateCardPlayability(card, gameState);
}
```

#### 3.2 Enhance CardManager.js
**File**: `js/components/CardManager.js`

**Add new card operation methods:**
```javascript
// Add to CardManager class
processCardEffects(card, player, immediate = true) {
  console.log('CardManager: Processing enhanced card effects', card);
  
  // Handle new metadata fields
  this.processTarget(card, player);
  this.processScope(card, player);
  this.processDuration(card, player);
  this.processConditionalLogic(card, player);
  
  // Legacy effect processing for backward compatibility
  if (card.effect || card.description) {
    this.processLegacyEffects(card, player);
  }
}

processTarget(card, player) {
  switch(card.target) {
    case 'Self':
      return [player];
    case 'Choose Player':
      return this.promptPlayerSelection(player);
    case 'All Players':
      return window.GameState.players;
    case 'Opponent':
      return window.GameState.players.filter(p => p.id !== player.id);
    default:
      return [player];
  }
}

processScope(card, player) {
  // Handle Single, Multiple, Global scopes
}

processConditionalLogic(card, player) {
  // Evaluate conditional_logic field
  // Handle dice triggers, game state checks, etc.
}
```

#### 3.3 Update CardDisplay.js
**File**: `js/components/CardDisplay.js`

**Enhance card rendering:**
```javascript
// Add rich card display with new metadata
renderCardMetadata(card) {
  return React.createElement('div', { className: 'card-metadata' },
    card.target && React.createElement('span', { className: 'card-target' }, `Target: ${card.target}`),
    card.scope && React.createElement('span', { className: 'card-scope' }, `Scope: ${card.scope}`),
    card.phase_restriction && React.createElement('span', { className: 'card-phase' }, `Phase: ${card.phase_restriction}`)
  );
}
```

#### 3.4 Testing
- Test card display with new metadata
- Verify card filtering and querying works
- Test card effect processing with new fields
- Ensure UI components handle missing/null metadata gracefully

**Deliverables:**
- ✅ Enhanced SpaceInfoCards with new card access patterns
- ✅ Updated CardManager with rich effect processing
- ✅ Improved card display components
- ✅ Backward compatibility maintained

**COMPLETED**: Phase 3 finished successfully. Card components enhanced with metadata rendering, advanced filtering, target/scope/duration processing, and rich card interaction features.

---

## Phase 4: Game State Integration (Day 4)
**Estimated Time**: 3-4 hours  
**Risk Level**: Medium  
**Dependencies**: Phase 3 complete

### Objectives
- Update GameStateManager to handle new card structure
- Implement enhanced card mechanics (target, scope, duration)
- Add support for new card attributes in game logic

### Tasks

#### 4.1 Update GameStateManager.js
**File**: `js/data/GameStateManager.js`

**Enhance card-related methods:**
```javascript
// Add to GameStateManager
drawCard(playerId, cardType, filters = {}) {
  const player = this.getPlayer(playerId);
  if (!player) return null;
  
  // Use new card querying system
  const availableCards = window.queryCards(
    this.gameData.allCards, 
    { card_type: cardType, ...filters }
  );
  
  if (availableCards.length === 0) return null;
  
  // Random selection or weighted selection based on distribution_level
  const selectedCard = this.selectCard(availableCards);
  
  // Add to player's hand
  player.cards = player.cards || [];
  player.cards.push(selectedCard);
  
  // Trigger events
  this.dispatchEvent('cardDrawn', {
    playerId,
    card: selectedCard,
    cardType
  });
  
  return selectedCard;
}

playCard(playerId, cardId) {
  const player = this.getPlayer(playerId);
  const card = window.getCardById(this.gameData.allCards, cardId);
  
  if (!player || !card) return false;
  
  // Validate card can be played
  if (!this.canPlayCard(card, player)) return false;
  
  // Process card effects using new metadata
  this.processCardEffects(card, player);
  
  // Remove from hand
  const cardIndex = player.cards.findIndex(c => c.card_id === cardId);
  if (cardIndex >= 0) {
    player.cards.splice(cardIndex, 1);
  }
  
  // Handle duration effects
  if (card.duration && card.duration !== 'Immediate') {
    this.addPersistentEffect(card, player);
  }
  
  this.dispatchEvent('cardPlayed', { playerId, card });
  return true;
}

addPersistentEffect(card, player) {
  player.persistentEffects = player.persistentEffects || [];
  player.persistentEffects.push({
    cardId: card.card_id,
    card: card,
    turnsRemaining: card.duration_count || 1,
    appliedTurn: this.currentTurn
  });
}
```

#### 4.2 Add New Game Mechanics Support
```javascript
// Enhanced target processing
processCardTarget(card, sourcePlayer) {
  const targets = this.getCardTargets(card, sourcePlayer);
  
  targets.forEach(targetPlayer => {
    this.applyCardEffect(card, sourcePlayer, targetPlayer);
  });
}

// Conditional logic evaluation
evaluateCardCondition(card, player) {
  if (!card.conditional_logic) return true;
  
  // Parse and evaluate conditions like:
  // "High-profile client", "Same worktype", "3+ permits this turn"
  return this.parseCondition(card.conditional_logic, player);
}

// Duration effect processing
processPersistentEffects() {
  this.players.forEach(player => {
    if (!player.persistentEffects) return;
    
    player.persistentEffects = player.persistentEffects.filter(effect => {
      effect.turnsRemaining--;
      
      if (effect.turnsRemaining <= 0) {
        this.removeCardEffect(effect.card, player);
        return false; // Remove from array
      }
      
      return true; // Keep in array
    });
  });
}
```

#### 4.3 Testing
- Test card drawing with new filtering system
- Verify card playing with enhanced effects
- Test persistent effects and duration handling
- Ensure backward compatibility with existing save games

**Deliverables:**
- ✅ Enhanced GameStateManager with rich card mechanics
- ✅ Support for new card attributes (target, scope, duration)
- ✅ Persistent effect system
- ✅ Conditional logic evaluation framework

**COMPLETED**: Phase 4 finished successfully. GameStateManager enhanced with advanced card mechanics including enhanced drawCard/playCard methods, persistent effects system, target/scope processing, conditional logic evaluation, and comprehensive card validation.

---

## Phase 5: Advanced Features Implementation (Day 5)
**Estimated Time**: 4-6 hours  
**Risk Level**: Low  
**Dependencies**: Phase 4 complete

### Objectives
- Implement advanced card mechanics (combos, chains, counters)
- Add card interaction features
- Optimize performance with large card dataset

### Tasks

#### 5.1 Card Combo System
```javascript
// Add to CardManager.js
detectCardCombos(playedCards) {
  const combos = [];
  
  playedCards.forEach(card => {
    if (card.combo_requirement) {
      const requiredCards = this.parseComboRequirement(card.combo_requirement);
      if (this.hasRequiredCards(playedCards, requiredCards)) {
        combos.push({
          triggerCard: card,
          comboCards: requiredCards,
          bonusEffect: card.combo_effect
        });
      }
    }
  });
  
  return combos;
}

processCardCombos(combos, player) {
  combos.forEach(combo => {
    console.log('CardManager: Processing combo', combo);
    // Apply bonus effects
    this.applyComboBonus(combo, player);
  });
}
```

#### 5.2 Card Chain Reactions
```javascript
// Chain effect system
processChainEffects(triggeredCard, player) {
  const chainCards = window.queryCards(this.gameData.allCards, {
    chain_trigger: triggeredCard.card_type
  });
  
  chainCards.forEach(chainCard => {
    if (this.playerHasCard(player, chainCard.card_id)) {
      this.triggerChainCard(chainCard, player);
    }
  });
}
```

#### 5.3 Performance Optimization
```javascript
// Add to InitializationManager.js
buildAdvancedIndexes(cards) {
  return {
    byId: this.buildIdIndex(cards),
    byType: this.buildTypeIndex(cards),
    byPhase: this.buildPhaseIndex(cards),
    byTarget: this.buildTargetIndex(cards),
    byCombo: this.buildComboIndex(cards),
    byChain: this.buildChainIndex(cards)
  };
}

// Fast lookup methods
getCardsByPhase(phase) {
  return this.loadedData.cardIndex.byPhase[phase] || [];
}

getComboCards() {
  return this.loadedData.cardIndex.byCombo || [];
}
```

#### 5.4 Testing
- Test card combo detection and processing
- Verify chain reaction system
- Performance test with full 150-card dataset
- Integration testing with complete game flow

**Deliverables:**
- ✅ Card combo system
- ✅ Chain reaction mechanics
- ✅ Performance-optimized card indexing
- ✅ Comprehensive integration testing

---

## Phase 6: Testing & Cleanup (Day 6)
**Estimated Time**: 2-3 hours  
**Risk Level**: Low  
**Dependencies**: All previous phases complete

### Objectives
- Comprehensive testing of all new functionality
- Remove old CSV files and unused code
- Update documentation and create migration notes

### Tasks

#### 6.1 Comprehensive Testing
- **Unit Tests**: Test each new function individually
- **Integration Tests**: Test complete card flow from draw to play
- **Performance Tests**: Verify game loads and runs smoothly
- **Edge Case Tests**: Empty hands, invalid cards, corrupted data
- **Backward Compatibility**: Ensure existing save games still work

#### 6.2 Code Cleanup
```bash
# Remove old card CSV files
rm data/B-cards-improved.csv
rm data/E-cards.csv
rm data/I-cards-improved.csv
rm data/L-cards.csv
rm data/W-cards-improved.csv

# Remove backup files if tests pass
rm js/components/managers/InitializationManager.js.backup
```

#### 6.3 Update Documentation
- Update README.md with new card system
- Create API documentation for new card functions
- Document new card metadata fields
- Update DEVELOPMENT_GUIDE.md

#### 6.4 Performance Validation
- Measure load times before/after migration
- Profile memory usage with new card system
- Verify game responsiveness is maintained

**Deliverables:**
- ✅ Complete test suite passing
- ✅ Old files removed
- ✅ Updated documentation
- ✅ Performance benchmarks

---

## Risk Mitigation

### High-Risk Areas
1. **Data Loss**: Backup all original files before starting
2. **Breaking Changes**: Maintain backward compatibility throughout
3. **Performance**: Monitor load times and memory usage
4. **Game Logic**: Extensive testing of card interactions

### Rollback Plan
- Keep backup copies of all modified files
- Version control commits after each phase
- Ability to restore old CSV loading if needed

### Testing Strategy
- Test after each phase before proceeding
- Maintain working game state throughout migration
- Use feature flags to enable/disable new functionality

## Success Criteria

### Functional Requirements
- ✅ All 150 cards load from unified CSV
- ✅ Card drawing/playing works identically to before
- ✅ New card metadata is accessible and usable
- ✅ Game performance is maintained or improved
- ✅ No existing game functionality is broken

### Technical Requirements
- ✅ Clean, maintainable code structure
- ✅ Comprehensive error handling
- ✅ Performance optimizations in place
- ✅ Documentation updated and complete

### Future-Proofing
- ✅ Easy to add new card types and mechanics
- ✅ Scalable to 200+ cards without performance issues
- ✅ Flexible metadata system for game expansion
- ✅ Clean API for card interactions

## Timeline Summary

| Phase | Duration | Risk | Key Deliverable |
|-------|----------|------|-----------------|
| 1 | 2-3 hours | Low | Enhanced CSV parser |
| 2 | 3-4 hours | Medium | Updated initialization |
| 3 | 4-5 hours | Medium | Enhanced card components |
| 4 | 3-4 hours | Medium | Game state integration |
| 5 | 4-6 hours | Low | Advanced features |
| 6 | 2-3 hours | Low | Testing & cleanup |
| **Total** | **18-25 hours** | | **Complete migration** |

## Post-Migration Benefits

1. **Simplified Maintenance**: Single file vs 5 separate files
2. **Enhanced Gameplay**: Rich card interactions and mechanics
3. **Better Performance**: Optimized loading and indexing
4. **Future Expansion**: Easy to add new card types and effects
5. **Data Consistency**: Unified schema prevents data issues
6. **Developer Experience**: Better debugging and development tools

---

*This plan should be followed sequentially, with each phase fully tested before proceeding to the next. Regular commits and backups are essential for safe migration.*