const { test, expect } = require('@playwright/test');

test('Debug button logic - dice roll and card button prevention', async ({ page }) => {
  // Navigate to the game
  await page.goto('http://localhost:8001/');
  
  // Wait for game to load
  await page.waitForSelector('.game-board', { timeout: 10000 });
  
  console.log('=== STARTING BUTTON LOGIC DEBUG TEST ===');
  
  // Listen to console logs to capture our debug output
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍') || text.includes('🎴') || text.includes('shouldShowCardButton')) {
      consoleMessages.push(text);
      console.log('BROWSER:', text);
    }
  });
  
  // Find a space with dice roll + card drawing (OWNER-SCOPE-INITIATION)
  console.log('Looking for OWNER-SCOPE-INITIATION space...');
  
  // Try to click on the space directly from the board
  const ownerScopeSpace = page.locator('text=OWNER-SCOPE-INITIATION').first();
  if (await ownerScopeSpace.isVisible()) {
    console.log('Found OWNER-SCOPE-INITIATION space, clicking...');
    await ownerScopeSpace.click();
    await page.waitForTimeout(1000);
  } else {
    console.log('OWNER-SCOPE-INITIATION not visible, trying to navigate there...');
    
    // Alternative: Try to move player to that space by clicking available moves
    const moveButtons = page.locator('button:has-text("OWNER-SCOPE-INITIATION")');
    if (await moveButtons.count() > 0) {
      console.log('Found move button to OWNER-SCOPE-INITIATION');
      await moveButtons.first().click();
      await page.waitForTimeout(1000);
    }
  }
  
  // Check if we're on a space with card buttons
  console.log('Checking for card buttons before dice roll...');
  const cardButtons = page.locator('button:has-text("Draw")');
  const cardButtonCount = await cardButtons.count();
  console.log(`Found ${cardButtonCount} card buttons before dice roll`);
  
  // Log current space info
  const spaceTitle = await page.locator('.space-info h3').textContent().catch(() => 'Unknown');
  console.log(`Current space: ${spaceTitle}`);
  
  // Look for Roll Dice button
  const rollDiceButton = page.locator('button:has-text("Roll Dice")');
  
  if (await rollDiceButton.isVisible()) {
    console.log('Found Roll Dice button, clicking...');
    
    // Click Roll Dice and capture debug output
    await rollDiceButton.click();
    
    // Wait for dice roll to complete
    await page.waitForTimeout(3000);
    
    console.log('=== DICE ROLL COMPLETED ===');
    
    // Check card buttons after dice roll
    const cardButtonsAfter = page.locator('button:has-text("Draw")');
    const cardButtonCountAfter = await cardButtonsAfter.count();
    console.log(`Found ${cardButtonCountAfter} card buttons AFTER dice roll`);
    
    // Check if any buttons are disabled/used
    const disabledButtons = page.locator('button:has-text("Draw")[disabled]');
    const disabledCount = await disabledButtons.count();
    console.log(`Found ${disabledCount} disabled card buttons`);
    
    // Check for "Cards Drawn" text
    const drawnButtons = page.locator('button:has-text("Cards Drawn")');
    const drawnCount = await drawnButtons.count();
    console.log(`Found ${drawnCount} "Cards Drawn" buttons`);
    
    // Log dice outcomes from the page
    const diceResult = await page.evaluate(() => {
      const gameBoard = window.currentGameBoard;
      return {
        hasRolledDice: gameBoard?.state?.hasRolledDice,
        lastDiceRoll: gameBoard?.state?.lastDiceRoll,
        diceOutcomes: gameBoard?.state?.diceOutcomes,
        diceOutcomesKeys: gameBoard?.state?.diceOutcomes ? Object.keys(gameBoard.state.diceOutcomes) : []
      };
    });
    
    console.log('=== DICE STATE FROM BROWSER ===');
    console.log('hasRolledDice:', diceResult.hasRolledDice);
    console.log('lastDiceRoll:', diceResult.lastDiceRoll);
    console.log('diceOutcomes keys:', diceResult.diceOutcomesKeys);
    console.log('diceOutcomes:', JSON.stringify(diceResult.diceOutcomes, null, 2));
    
  } else {
    console.log('No Roll Dice button found - checking if we need to move to a different space');
    
    // Try to find a space that requires dice rolling
    const spaces = ['OWNER-SCOPE-INITIATION', 'ARCH-INITIATION', 'CON-INITIATION'];
    
    for (const spaceName of spaces) {
      console.log(`Trying to navigate to ${spaceName}...`);
      const spaceButton = page.locator(`button:has-text("${spaceName}")`);
      if (await spaceButton.count() > 0) {
        await spaceButton.first().click();
        await page.waitForTimeout(1000);
        
        const rollDiceCheck = page.locator('button:has-text("Roll Dice")');
        if (await rollDiceCheck.isVisible()) {
          console.log(`Found Roll Dice button at ${spaceName}`);
          break;
        }
      }
    }
  }
  
  // Print all captured console messages for analysis
  console.log('\n=== ALL DEBUG MESSAGES ===');
  consoleMessages.forEach((msg, index) => {
    console.log(`${index + 1}: ${msg}`);
  });
  
  // Keep page open for manual inspection
  await page.waitForTimeout(5000);
});