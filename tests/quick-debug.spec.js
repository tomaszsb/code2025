const { test, expect } = require('@playwright/test');

test('Quick debug test', async ({ page }) => {
  console.log('=== QUICK DEBUG TEST ===');
  
  await page.goto('http://localhost:8001/');
  
  // Capture debug messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍') || text.includes('🎴') || text.includes('shouldShowCardButton')) {
      console.log('🔍 BROWSER:', text);
    }
  });
  
  // Start game
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(5000);
  
  // Check what selectors exist after game starts
  const selectors = ['.board-container', '.game-board', '.info-panels-container', '.space-info'];
  
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    console.log(`${selector}: ${count} elements`);
  }
  
  // Just proceed if we have any game content
  const hasGameContent = await page.locator('.space-info, .player-panel, .info-panels-container').count() > 0;
  console.log(`Has game content: ${hasGameContent}`);
  
  if (hasGameContent) {
    console.log('✅ Game loaded, testing dice roll...');
    
    // Count buttons before dice
    const beforeButtons = await page.locator('button:has-text("Draw")').count();
    console.log(`Buttons before dice: ${beforeButtons}`);
    
    // Roll dice if button exists
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    if (await rollDiceButton.isVisible()) {
      console.log('🎲 Rolling dice...');
      await rollDiceButton.click();
      await page.waitForTimeout(4000);
      
      // Count buttons after dice
      const afterButtons = await page.locator('button:has-text("Draw")').count();
      console.log(`Buttons after dice: ${afterButtons}`);
      
      // Get dice state
      const state = await page.evaluate(() => {
        const gb = window.currentGameBoard;
        return {
          hasRolledDice: gb?.state?.hasRolledDice,
          diceRoll: gb?.state?.lastDiceRoll,
          diceOutcomes: gb?.state?.diceOutcomes
        };
      });
      
      console.log('=== FINAL STATE ===');
      console.log('hasRolledDice:', state.hasRolledDice);
      console.log('diceRoll:', state.diceRoll);
      console.log('diceOutcomes:', JSON.stringify(state.diceOutcomes, null, 2));
    }
  }
});