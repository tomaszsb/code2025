const { test, expect } = require('@playwright/test');

test('Debug End Turn button and card drawing', async ({ page }) => {
  // Listen for console logs
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('End Turn') || msg.text().includes('hasSelectedMove') || 
        msg.text().includes('draw') || msg.text().includes('card') || 
        msg.text().includes('dice')) {
      logs.push(msg.text());
    }
  });

  // Navigate to the game
  await page.goto('http://localhost:8000');
  
  // Wait for the game to load
  await page.waitForFunction(() => window.GameStateManager?.isProperlyInitialized);
  
  // Start a game
  await page.click('button:has-text("Start Game")');
  
  // Wait for game board to load
  await page.waitForFunction(() => document.querySelector('.game-board'));
  
  // Take screenshot of game state
  await page.screenshot({ path: 'game-with-buttons.png' });
  
  // Check if End Turn button exists and its state
  const endTurnButton = page.locator('.end-turn-btn');
  const isVisible = await endTurnButton.isVisible();
  const isDisabled = await endTurnButton.isDisabled();
  
  console.log('End Turn button - Visible:', isVisible, 'Disabled:', isDisabled);
  
  // Check game state values
  const gameState = await page.evaluate(() => {
    return {
      hasCurrentPlayer: !!window.GameStateManager?.getCurrentPlayer(),
      hasSelectedMove: !!window.gameBoard?.state?.hasSelectedMove,
      hasDiceRollSpace: !!window.gameBoard?.state?.hasDiceRollSpace,
      hasRolledDice: !!window.gameBoard?.state?.hasRolledDice,
      lastDiceRoll: window.gameBoard?.state?.lastDiceRoll,
      diceOutcomes: !!window.gameBoard?.state?.diceOutcomes
    };
  });
  
  console.log('Game State:', gameState);
  
  // Try to roll dice if available
  const rollDiceButton = page.locator('.roll-dice-btn');
  if (await rollDiceButton.isVisible() && !await rollDiceButton.isDisabled()) {
    console.log('Rolling dice...');
    await rollDiceButton.click();
    await page.waitForTimeout(2000); // Wait for dice animation
    
    // Check state after rolling
    const afterDiceState = await page.evaluate(() => {
      return {
        hasRolledDice: !!window.gameBoard?.state?.hasRolledDice,
        lastDiceRoll: window.gameBoard?.state?.lastDiceRoll,
        diceOutcomes: window.gameBoard?.state?.diceOutcomes
      };
    });
    
    console.log('After dice roll:', afterDiceState);
    
    // Check if End Turn button is now enabled
    const isDisabledAfterDice = await endTurnButton.isDisabled();
    console.log('End Turn button disabled after dice:', isDisabledAfterDice);
  }
  
  // Look for card drawing buttons
  const cardButtons = await page.locator('button:has-text("Draw")').count();
  console.log('Card drawing buttons found:', cardButtons);
  
  // Print all collected logs
  console.log('\n=== END TURN & CARD DEBUG LOGS ===');
  logs.forEach(log => console.log(log));
  console.log('=== END LOGS ===\n');
});