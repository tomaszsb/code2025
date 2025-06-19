// tests/event-timing-debug.spec.js
const { test, expect } = require('@playwright/test');

test('Debug spacesLoaded event timing', async ({ page }) => {
  const eventLogs = [];
  
  // Capture console logs related to events
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('spacesLoaded') || text.includes('DiceManager') || text.includes('GameBoard:')) {
      eventLogs.push(text);
    }
  });
  
  await page.goto('http://localhost:8000/?debug=true&logLevel=debug');
  
  // Check initial state before starting game
  const beforeGameStart = await page.evaluate(() => {
    return {
      gameStateManagerExists: !!window.GameStateManager,
      spacesLoaded: !!window.GameStateManager?.spaces?.length,
      diceManagerExists: !!window.currentGameBoard?.diceManager
    };
  });
  console.log('Before game start:', beforeGameStart);
  
  await page.click('button:has-text("Start Game")');
  await expect(page.locator('.game-container')).toBeVisible();
  
  // Wait a moment for all initialization to complete
  await page.waitForTimeout(1000);
  
  // Check state after game start
  const afterGameStart = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    return {
      gameBoardExists: !!gameBoard,
      diceManagerExists: !!gameBoard?.diceManager,
      spacesCount: window.GameStateManager?.spaces?.length || 0,
      gameStateDiceData: gameBoard?.state?.diceRollData?.length || 0,
      diceOutcomes: gameBoard?.state?.diceOutcomes,
      currentPlayer: window.GameStateManager?.getCurrentPlayer()?.position
    };
  });
  console.log('After game start:', afterGameStart);
  
  // Test manually triggering spacesLoaded event
  const manualEventResult = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    if (!gameBoard?.diceManager) return { error: 'DiceManager not found' };
    
    console.log('Manually triggering spacesLoaded event...');
    
    // Call the handleSpacesLoaded method directly
    if (typeof gameBoard.diceManager.handleSpacesLoaded === 'function') {
      gameBoard.diceManager.handleSpacesLoaded();
      return { manualEventTriggered: true };
    } else {
      return { error: 'handleSpacesLoaded method not found' };
    }
  });
  console.log('Manual event result:', manualEventResult);
  
  // Wait for the setTimeout in handleSpacesLoaded
  await page.waitForTimeout(200);
  
  // Check final state
  const finalState = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    return {
      diceOutcomes: gameBoard?.state?.diceOutcomes,
      diceOutcomesKeys: gameBoard?.state?.diceOutcomes ? Object.keys(gameBoard.state.diceOutcomes) : null
    };
  });
  console.log('Final state after manual event:', finalState);
  
  // Print captured event logs
  console.log('\nCaptured event logs:');
  eventLogs.forEach((log, i) => console.log(`${i}: ${log}`));
  
  await page.screenshot({ path: 'playwright-reports/event-timing-debug.png' });
});