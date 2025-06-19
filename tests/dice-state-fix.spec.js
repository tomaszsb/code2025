// tests/dice-state-fix.spec.js  
const { test, expect } = require('@playwright/test');

test('Fix DiceManager state setting', async ({ page }) => {
  await page.goto('http://localhost:8000/?debug=true&logLevel=debug');
  await page.click('button:has-text("Start Game")');
  await expect(page.locator('.game-container')).toBeVisible();
  
  // Test manually calling loadInitialPotentialOutcomes to debug state setting
  const beforeState = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    return {
      diceOutcomes: gameBoard?.state?.diceOutcomes,
      diceManagerExists: !!gameBoard?.diceManager
    };
  });
  
  console.log('Before manual call:', beforeState);
  
  // Manually trigger loadInitialPotentialOutcomes 
  const manualResult = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    if (!gameBoard || !gameBoard.diceManager) {
      return { error: 'DiceManager not available' };
    }
    
    // Call the method manually
    try {
      gameBoard.diceManager.loadInitialPotentialOutcomes();
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  });
  
  console.log('Manual call result:', manualResult);
  
  // Wait a moment for state to update
  await page.waitForTimeout(200);
  
  // Check state after manual call
  const afterState = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    return {
      diceOutcomes: gameBoard?.state?.diceOutcomes,
      diceOutcomesKeys: gameBoard?.state?.diceOutcomes ? 
        Object.keys(gameBoard.state.diceOutcomes) : null
    };
  });
  
  console.log('After manual call:', afterState);
  
  // Check if SpaceInfo now shows potential outcomes
  const potentialOutcomes = page.locator('.potential-outcomes, .dice-outcomes-display');
  const hasOutcomes = await potentialOutcomes.count() > 0;
  console.log('SpaceInfo shows potential outcomes after manual call:', hasOutcomes);
  
  if (hasOutcomes) {
    const outcomesText = await potentialOutcomes.textContent();
    console.log('Outcomes content:', outcomesText.slice(0, 200));
  }
  
  await page.screenshot({ path: 'playwright-reports/dice-state-fix.png' });
});

test('Debug setState calls in DiceManager', async ({ page }) => {
  await page.goto('http://localhost:8000/?debug=true&logLevel=debug');
  await page.click('button:has-text("Start Game")');
  await expect(page.locator('.game-container')).toBeVisible();
  
  // Override setState to log calls
  const setStateDebug = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    if (!gameBoard) return { error: 'GameBoard not found' };
    
    // Store original setState
    const originalSetState = gameBoard.setState.bind(gameBoard);
    
    // Override with logging version
    gameBoard.setState = function(newState, callback) {
      console.log('DiceManager setState called with:', newState);
      return originalSetState(newState, callback);
    };
    
    // Test calling loadInitialPotentialOutcomes with logging
    if (gameBoard.diceManager) {
      gameBoard.diceManager.loadInitialPotentialOutcomes();
      return { success: true };
    } else {
      return { error: 'DiceManager not found' };
    }
  });
  
  console.log('setState debug result:', setStateDebug);
  
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'playwright-reports/setstate-debug.png' });
});