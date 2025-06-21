const { test, expect } = require('@playwright/test');

test('Check panel visibility and content', async ({ page }) => {
  // Navigate to the game
  await page.goto('http://localhost:8000');
  
  // Wait for game to load
  await page.waitForTimeout(3000);
  
  // Check if panels exist in DOM
  console.log('=== PANEL EXISTENCE CHECK ===');
  
  const leftPanel = await page.locator('.player-panel').first();
  const middlePanel = await page.locator('.middle-panel');  
  const rightPanel = await page.locator('.player-panel').last();
  const spaceExplorer = await page.locator('.space-explorer-container');
  
  console.log('Left panel exists:', await leftPanel.count() > 0);
  console.log('Middle panel exists:', await middlePanel.count() > 0);
  console.log('Right panel exists:', await rightPanel.count() > 0);
  console.log('Space explorer exists:', await spaceExplorer.count() > 0);
  
  // Check visibility
  console.log('=== PANEL VISIBILITY CHECK ===');
  
  if (await leftPanel.count() > 0) {
    console.log('Left panel visible:', await leftPanel.isVisible());
    console.log('Left panel content:', await leftPanel.textContent());
  }
  
  if (await middlePanel.count() > 0) {
    console.log('Middle panel visible:', await middlePanel.isVisible());
    console.log('Middle panel content:', await middlePanel.textContent());
  }
  
  if (await rightPanel.count() > 0) {
    console.log('Right panel visible:', await rightPanel.isVisible());
    console.log('Right panel content:', await rightPanel.textContent());
  }
  
  if (await spaceExplorer.count() > 0) {
    console.log('Space explorer visible:', await spaceExplorer.isVisible());
    console.log('Space explorer content:', await spaceExplorer.textContent());
  }
  
  // Check SpaceInfo component specifically
  console.log('=== SPACE INFO CHECK ===');
  
  const spaceInfo = await page.locator('.space-info');
  console.log('SpaceInfo exists:', await spaceInfo.count() > 0);
  
  if (await spaceInfo.count() > 0) {
    console.log('SpaceInfo visible:', await spaceInfo.isVisible());
    console.log('SpaceInfo content:', await spaceInfo.textContent());
  }
  
  // Check for empty state
  const emptyState = await page.locator('.space-info.empty');
  console.log('Empty SpaceInfo exists:', await emptyState.count() > 0);
  
  // Check for space selection
  console.log('=== SPACE SELECTION CHECK ===');
  
  const gameBoard = await page.locator('.game-board-wrapper');
  console.log('GameBoard exists:', await gameBoard.count() > 0);
  
  // Check browser console logs
  console.log('=== CONSOLE LOGS ===');
  
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('SpaceInfo') || msg.text().includes('SpaceExplorer') || msg.text().includes('selectedSpace')) {
      logs.push(msg.text());
    }
  });
  
  await page.waitForTimeout(2000);
  
  console.log('Relevant console logs:');
  logs.forEach(log => console.log(log));
  
  // Try clicking on a space to trigger panel updates
  console.log('=== CLICKING SPACE ===');
  
  const firstSpace = await page.locator('.board-space').first();
  if (await firstSpace.count() > 0) {
    await firstSpace.click();
    await page.waitForTimeout(1000);
    
    console.log('After click - Middle panel content:', await middlePanel.textContent());
    console.log('After click - SpaceInfo exists:', await spaceInfo.count() > 0);
  }
  
  // Check GameState
  const gameState = await page.evaluate(() => {
    return {
      hasGameState: !!window.GameState,
      hasGameStateManager: !!window.GameStateManager,
      hasSpaces: !!(window.GameState && window.GameState.spaces),
      spacesCount: window.GameState ? window.GameState.spaces?.length || 0 : 0,
      currentPlayer: window.GameState ? window.GameState.getCurrentPlayer()?.name : 'none',
      selectedSpace: window.currentGameBoard ? window.currentGameBoard.state?.selectedSpace : 'none'
    };
  });
  
  console.log('=== GAME STATE ===');
  console.log('Game state info:', gameState);
  
  // Take screenshot for visual debugging
  await page.screenshot({ path: 'tests/panel-visibility-debug.png', fullPage: true });
  
  console.log('Screenshot saved to tests/panel-visibility-debug.png');
});