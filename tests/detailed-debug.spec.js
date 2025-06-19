// tests/detailed-debug.spec.js
const { test, expect } = require('@playwright/test');

test('Detailed debug of DiceManager loadInitialPotentialOutcomes', async ({ page }) => {
  // Capture console logs
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('DiceManager') || msg.text().includes('setState')) {
      logs.push(msg.text());
    }
  });
  
  await page.goto('http://localhost:8000/?debug=true&logLevel=debug');
  await page.click('button:has-text("Start Game")');
  await expect(page.locator('.game-container')).toBeVisible();
  
  const debugInfo = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    if (!gameBoard) return { error: 'No GameBoard' };
    
    // Step 1: Check current state
    const initialState = {
      diceOutcomes: gameBoard.state.diceOutcomes,
      hasDiceRollSpace: gameBoard.diceManager ? gameBoard.diceManager.hasDiceRollSpace() : 'N/A'
    };
    
    console.log('DiceManager Debug: Initial state:', initialState);
    
    // Step 2: Check if DiceRollLogic is available
    const diceRollLogicCheck = {
      available: !!window.DiceRollLogic,
      hasOutcomeParser: !!window.DiceRollLogic?.outcomeParser,
      canGetOutcomes: typeof window.DiceRollLogic?.outcomeParser?.getAllOutcomesForSpace === 'function'
    };
    
    console.log('DiceManager Debug: DiceRollLogic check:', diceRollLogicCheck);
    
    // Step 3: Try calling getAllOutcomesForSpace directly
    let directOutcomes = null;
    if (diceRollLogicCheck.canGetOutcomes) {
      try {
        directOutcomes = window.DiceRollLogic.outcomeParser.getAllOutcomesForSpace('OWNER-SCOPE-INITIATION', 'First');
        console.log('DiceManager Debug: Direct outcomes call successful:', Object.keys(directOutcomes));
      } catch (error) {
        console.log('DiceManager Debug: Direct outcomes call failed:', error.message);
      }
    }
    
    // Step 4: Override setState to track calls
    const setStateCalls = [];
    const originalSetState = gameBoard.setState.bind(gameBoard);
    gameBoard.setState = function(newState, callback) {
      setStateCalls.push(newState);
      console.log('DiceManager Debug: setState called with:', JSON.stringify(newState, null, 2));
      return originalSetState(newState, callback);
    };
    
    // Step 5: Call loadInitialPotentialOutcomes
    if (gameBoard.diceManager) {
      try {
        console.log('DiceManager Debug: Calling loadInitialPotentialOutcomes...');
        gameBoard.diceManager.loadInitialPotentialOutcomes();
        console.log('DiceManager Debug: loadInitialPotentialOutcomes completed');
      } catch (error) {
        console.log('DiceManager Debug: loadInitialPotentialOutcomes failed:', error.message);
      }
    }
    
    // Step 6: Check final state
    const finalState = {
      diceOutcomes: gameBoard.state.diceOutcomes,
      setStateCallCount: setStateCalls.length,
      lastSetStateCall: setStateCalls[setStateCalls.length - 1]
    };
    
    console.log('DiceManager Debug: Final state:', finalState);
    
    return {
      initialState,
      diceRollLogicCheck,
      directOutcomesAvailable: !!directOutcomes,
      directOutcomesKeys: directOutcomes ? Object.keys(directOutcomes) : null,
      finalState,
      setStateCalls
    };
  });
  
  console.log('Detailed debug results:', JSON.stringify(debugInfo, null, 2));
  console.log('Captured console logs:', logs.slice(-10)); // Last 10 logs
  
  await page.screenshot({ path: 'playwright-reports/detailed-debug.png' });
});