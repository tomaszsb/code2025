// tests/dice-roll-debug.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Dice Roll Information Debug', () => {
  test('should display dice outcomes in Space Explorer and main panel', async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:8000/?debug=true&logLevel=debug');
    
    // Start a new game
    await page.click('button:has-text("Start Game")');
    
    // Wait for game to load
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('h1:has-text("Project Management Game")')).toBeVisible();
    
    // Take initial screenshot
    await page.screenshot({ path: 'playwright-reports/01-game-started.png' });
    
    // Verify player is at OWNER-SCOPE-INITIATION
    await expect(page.locator('.space-info h3:has-text("OWNER-SCOPE-INITIATION")')).toBeVisible();
    
    // Check Space Explorer panel for dice outcomes
    const spaceExplorer = page.locator('.space-explorer-container');
    await expect(spaceExplorer).toBeVisible();
    
    // Look for dice outcomes table in Space Explorer
    const diceOutcomesTable = spaceExplorer.locator('.dice-outcomes-table, table');
    console.log('Checking for dice outcomes table...');
    
    if (await diceOutcomesTable.count() > 0) {
      console.log('✅ Dice outcomes table found in Space Explorer');
      await page.screenshot({ path: 'playwright-reports/02-dice-table-found.png' });
    } else {
      console.log('❌ Dice outcomes table NOT found in Space Explorer');
      await page.screenshot({ path: 'playwright-reports/02-dice-table-missing.png' });
      
      // Debug: Check what's actually in the Space Explorer
      const explorerContent = await spaceExplorer.textContent();
      console.log('Space Explorer content:', explorerContent.slice(0, 500));
    }
    
    // Check main space panel for potential dice outcomes
    const spaceInfo = page.locator('.space-info');
    const potentialOutcomes = spaceInfo.locator('.potential-outcomes, .dice-outcomes-display');
    
    if (await potentialOutcomes.count() > 0) {
      console.log('✅ Potential outcomes found in main space panel');
      const outcomesText = await potentialOutcomes.textContent();
      console.log('Outcomes text:', outcomesText);
    } else {
      console.log('❌ Potential outcomes NOT found in main space panel');
    }
    
    // Check if Roll Dice button is present and enabled
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    await expect(rollDiceButton).toBeVisible();
    console.log('✅ Roll Dice button is visible');
    
    // Test actual dice rolling
    console.log('Testing dice roll functionality...');
    await rollDiceButton.click();
    
    // Wait for dice animation (1.2 seconds as per code)
    await page.waitForTimeout(1500);
    
    // Check if dice result is displayed
    const diceResult = page.locator('.dice-result-display, .dice-outcomes-display');
    await page.screenshot({ path: 'playwright-reports/03-after-dice-roll.png' });
    
    if (await diceResult.count() > 0) {
      console.log('✅ Dice result displayed after rolling');
      const resultText = await diceResult.textContent();
      console.log('Dice result:', resultText);
    } else {
      console.log('❌ Dice result NOT displayed after rolling');
      
      // Check if button state changed
      const buttonText = await rollDiceButton.textContent();
      console.log('Button text after roll:', buttonText);
    }
    
    // Debug: Check browser console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text());
      }
    });
    
    // Debug: Evaluate JavaScript state
    const gameState = await page.evaluate(() => {
      const gameBoard = window.currentGameBoard;
      return {
        gameBoardExists: !!gameBoard,
        diceManagerExists: !!gameBoard?.diceManager,
        diceOutcomes: gameBoard?.state?.diceOutcomes,
        diceRollDataLength: gameBoard?.state?.diceRollData?.length || 0,
        hasDiceRollSpace: gameBoard?.diceManager ? 
          gameBoard.diceManager.hasDiceRollSpace() : 'N/A'
      };
    });
    
    console.log('Game state debug:', gameState);
    
    // Final comprehensive screenshot
    await page.screenshot({ path: 'playwright-reports/04-final-state.png', fullPage: true });
  });
  
  test('should verify DiceManager integration', async ({ page }) => {
    await page.goto('http://localhost:8000/?debug=true&logLevel=debug');
    await page.click('button:has-text("Start Game")');
    await expect(page.locator('.game-container')).toBeVisible();
    
    // Test DiceManager state directly
    const diceManagerState = await page.evaluate(() => {
      const gameBoard = window.currentGameBoard;
      if (!gameBoard || !gameBoard.diceManager) {
        return { error: 'DiceManager not available' };
      }
      
      // Test the specific methods we fixed
      const currentPlayer = window.GameStateManager.getCurrentPlayer();
      const hasDiceRoll = gameBoard.diceManager.hasDiceRollSpace();
      
      // Check if DiceRollLogic is working
      const diceRollLogicWorks = window.DiceRollLogic && 
        window.DiceRollLogic.outcomeParser &&
        typeof window.DiceRollLogic.outcomeParser.getAllOutcomesForSpace === 'function';
      
      return {
        currentPlayerPosition: currentPlayer?.position,
        hasDiceRollSpace: hasDiceRoll,
        diceRollLogicAvailable: diceRollLogicWorks,
        gameState: {
          diceOutcomes: gameBoard.state.diceOutcomes,
          diceRollDataLength: gameBoard.state.diceRollData?.length
        }
      };
    });
    
    console.log('DiceManager integration test:', diceManagerState);
    
    // Verify our fixes are working
    expect(diceManagerState.hasDiceRollSpace).toBe(true);
    expect(diceManagerState.diceRollLogicAvailable).toBe(true);
    expect(diceManagerState.gameState.diceRollDataLength).toBeGreaterThan(0);
  });
});