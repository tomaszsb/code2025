// tests/visual-verification.spec.js
const { test, expect } = require('@playwright/test');

test('Visual verification - dice outcomes in Space Explorer', async ({ page }) => {
  await page.goto('http://localhost:8000/?debug=true&logLevel=debug');
  await page.click('button:has-text("Start Game")');
  await expect(page.locator('.game-container')).toBeVisible();
  
  // Wait for initialization to complete
  await page.waitForTimeout(1000);
  
  // Check if dice outcomes are visible in Space Explorer
  const spaceExplorerVisible = await page.locator('.space-explorer').isVisible();
  console.log('Space Explorer visible:', spaceExplorerVisible);
  
  // Take screenshot to verify dice outcomes display
  await page.screenshot({ 
    path: 'playwright-reports/visual-verification-final.png',
    fullPage: true 
  });
  
  // Check for dice outcomes data in the page
  const diceOutcomesCheck = await page.evaluate(() => {
    return {
      gameBoard: !!window.currentGameBoard,
      diceOutcomes: window.currentGameBoard?.state?.diceOutcomes,
      diceOutcomesCount: window.currentGameBoard?.state?.diceOutcomes ? 
        Object.keys(window.currentGameBoard.state.diceOutcomes).length : 0
    };
  });
  
  console.log('Dice outcomes check:', diceOutcomesCheck);
});