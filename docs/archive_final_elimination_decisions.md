# FINAL DUPLICATE FUNCTION DECISIONS - USER APPROVED

## 🎯 CLEAR SEPARATION CONFIRMED
- **MovementEngine:** "What can I do?" (ALL game rules and logic)
- **UI Components:** "How do I show it?" (display only)

---

## 📋 DUPLICATE FUNCTION ELIMINATION DECISIONS

### ✅ **FUNCTIONS TO KEEP:**

**1. Space Finding Logic**
- **KEEP:** Simple CSV lookup with proper normalization
- **ELIMINATE:** Complex fallback strategies
- **USER GUIDANCE:** "Closed system - just look it up in the CSV, no fallbacks"

**2. Visit Detection Logic**  
- **KEEP:** Version that handles starting space properly
- **USER GUIDANCE:** Starting space logic is important for game flow

**3. Movement Interface**
- **KEEP:** MovementEngine.getAvailableMovements() 
- **ENHANCE:** Move ALL logic from SpaceInfoMoves into MovementEngine
- **USER GUIDANCE:** "These are movement logic questions, not UI questions"

### ❌ **FUNCTIONS TO ELIMINATE:**

**1. SpaceInfoMoves.getAvailableMoves() - ELIMINATE COMPLETELY**
- All PM-DECISION-CHECK logic → Move to MovementEngine
- All path detection (main vs side quest) → Move to MovementEngine  
- All CHEAT-BYPASS restrictions → Move to MovementEngine
- All original space tracking → Move to MovementEngine
- All loop prevention → Move to MovementEngine

**2. Complex Space Finding with Fallbacks - ELIMINATE**
- No more "try exact, try normalized, try case-insensitive, try uppercase"
- Replace with simple CSV lookup

---

## 🔄 MIGRATION PLAN

### **Phase 1: Move Business Logic from UI to Engine**
```javascript
// FROM SpaceInfoMoves.js (ELIMINATE):
- PM-DECISION-CHECK return logic
- originalSpaceId tracking  
- Path type detection
- CHEAT-BYPASS checking
- Move labeling and filtering

// TO MovementEngine.js (ENHANCE):
- Add all above logic to getAvailableMovements()
- Return complete move objects with all needed info
```

### **Phase 2: Simplify Space Finding**
```javascript
// ELIMINATE complex fallbacks
// KEEP simple CSV lookup with normalization
```

### **Phase 3: Clean UI Components**
```javascript
// SpaceInfoMoves.js becomes pure display:
- renderAvailableMoves() - just show what MovementEngine provides
- renderLogicSpaceUI() - display only
- Remove all business logic
```

---

## 🎯 END RESULT

**MovementEngine.getAvailableMovements()** becomes the single source of truth for:
- ✅ What moves are available
- ✅ PM-DECISION-CHECK return options  
- ✅ Path-aware movement logic
- ✅ CHEAT-BYPASS restrictions
- ✅ All game rules and special cases

**SpaceInfoMoves** becomes pure UI:
- ✅ Display moves as buttons
- ✅ Handle button styling
- ✅ Show move descriptions
- ✅ No business logic at all

**Result:** Zero duplicate functions, clear separation of concerns, all game logic in one place.
