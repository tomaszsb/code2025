const { test, expect } = require('@playwright/test');

test('Debug dice outcomes in SpaceExplorer vs player panel', async ({ page }) => {
  // Listen for console logs
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('SpaceExplorer') || msg.text().includes('DEBUG')) {
      logs.push(msg.text());
    }
  });

  // Navigate to the game
  await page.goto('http://localhost:8000');
  
  // Wait for the game to load
  await page.waitForFunction(() => window.GameStateManager?.isProperlyInitialized);
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'initial-game.png' });
  
  // Start a game
  await page.click('button:has-text("Start Game")');
  
  // Wait for game board to load
  await page.waitForFunction(() => document.querySelector('.game-board'));
  
  // Take screenshot after game starts
  await page.screenshot({ path: 'game-started.png' });
  
  // Click on a space to trigger SpaceExplorer
  const spaces = await page.locator('.board-space').all();
  if (spaces.length > 0) {
    await spaces[0].click();
    
    // Wait a bit for the explorer to process
    await page.waitForTimeout(1000);
    
    // Take screenshot showing space explorer
    await page.screenshot({ path: 'space-explorer-open.png' });
  }
  
  // Print all collected logs
  console.log('\n=== DICE DEBUG LOGS ===');
  logs.forEach(log => console.log(log));
  console.log('=== END LOGS ===\n');
  
  // Check if SpaceExplorer is visible
  const spaceExplorer = page.locator('.space-explorer');
  await expect(spaceExplorer).toBeVisible();
  
  // Check if player panel shows dice outcomes
  const playerPanel = page.locator('.player-info');
  await expect(playerPanel).toBeVisible();
});