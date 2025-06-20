const { test, expect } = require('@playwright/test');

test('Full debug test - start game and test button logic', async ({ page }) => {
  console.log('=== STARTING FULL DEBUG TEST ===');
  
  // Navigate to the game
  await page.goto('http://localhost:8001/');
  
  // Capture console messages
  const debugMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔍') || text.includes('🎴') || text.includes('shouldShowCardButton') || 
        text.includes('SpaceInfo:') || text.includes('DiceManager:')) {
      debugMessages.push(text);
      console.log('🔍 BROWSER:', text);
    }
  });
  
  // Wait for initial page load
  await page.waitForTimeout(2000);
  
  // Start the game
  console.log('Starting game...');
  await page.click('button:has-text("Start Game")');
  
  // Wait for game board to load
  await page.waitForSelector('.board-container', { timeout: 10000 });
  console.log('✅ Game board loaded');
  
  // Wait for initial setup to complete
  await page.waitForTimeout(3000);
  
  // Find current player info
  const currentPlayer = await page.evaluate(() => {
    const player = window.GameStateManager?.getCurrentPlayer?.();
    return {
      id: player?.id,
      name: player?.name,
      position: player?.position
    };
  });
  console.log('Current player:', currentPlayer);
  
  // Check if we're on a space that supports dice rolling
  let foundDiceSpace = false;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (!foundDiceSpace && attempts < maxAttempts) {
    attempts++;
    console.log(`\n=== ATTEMPT ${attempts} - LOOKING FOR DICE SPACE ===`);
    
    // Check if Roll Dice button is available
    const rollDiceVisible = await page.locator('button:has-text("Roll Dice")').isVisible();
    console.log(`Roll Dice button visible: ${rollDiceVisible}`);
    
    if (rollDiceVisible) {
      foundDiceSpace = true;
      break;
    }
    
    // Try to navigate to a known dice space
    const diceSpaces = ['OWNER-SCOPE-INITIATION', 'ARCH-INITIATION', 'CON-INITIATION'];
    
    for (const spaceName of diceSpaces) {
      console.log(`Looking for move to ${spaceName}...`);
      
      // Look for move buttons containing this space name
      const moveButton = page.locator(`button:has-text("${spaceName}")`).first();
      const moveButtonVisible = await moveButton.isVisible();
      
      if (moveButtonVisible) {
        console.log(`Found move button to ${spaceName}, clicking...`);
        await moveButton.click();
        await page.waitForTimeout(2000);
        
        // Check if we now have a Roll Dice button
        const rollDiceAfterMove = await page.locator('button:has-text("Roll Dice")').isVisible();
        if (rollDiceAfterMove) {
          console.log(`✅ Found dice space at ${spaceName}`);
          foundDiceSpace = true;
          break;
        }
      }
    }
    
    if (!foundDiceSpace) {
      // Try clicking "End Turn" to advance the game state
      const endTurnButton = page.locator('button:has-text("End Turn")');
      if (await endTurnButton.isVisible()) {
        console.log('Clicking End Turn to advance game state...');
        await endTurnButton.click();
        await page.waitForTimeout(2000);
      }
    }
  }
  
  if (!foundDiceSpace) {
    console.log('❌ Could not find a space with dice rolling capability');
    // Take screenshot for debugging
    await page.screenshot({ path: '../test-results/no-dice-space.png' });
    return;
  }
  
  // Now we're on a dice space - let's test the button logic
  console.log('\n=== TESTING BUTTON LOGIC ===');
  
  // Check current space info
  const spaceInfo = await page.locator('.space-info h3').textContent();
  console.log(`Current space: ${spaceInfo}`);
  
  // Count card buttons before dice roll
  const cardButtonsBefore = await page.locator('button:has-text("Draw")').count();
  console.log(`Card buttons before dice roll: ${cardButtonsBefore}`);
  
  // List all card buttons
  const buttonTexts = await page.locator('button:has-text("Draw")').allTextContents();
  console.log('Card button texts before dice:', buttonTexts);
  
  // Roll the dice
  console.log('🎲 Rolling dice...');
  await page.click('button:has-text("Roll Dice")');
  
  // Wait for dice roll animation and processing
  await page.waitForTimeout(4000);
  
  console.log('🎲 Dice roll completed');
  
  // Check card buttons after dice roll
  const cardButtonsAfter = await page.locator('button:has-text("Draw")').count();
  console.log(`Card buttons after dice roll: ${cardButtonsAfter}`);
  
  // List all card buttons after
  const buttonTextsAfter = await page.locator('button:has-text("Draw")').allTextContents();
  console.log('Card button texts after dice:', buttonTextsAfter);
  
  // Check for disabled/used buttons
  const disabledButtons = await page.locator('button[disabled]:has-text("Draw")').count();
  const usedButtons = await page.locator('button:has-text("Cards Drawn")').count();
  console.log(`Disabled buttons: ${disabledButtons}, Used buttons: ${usedButtons}`);
  
  // Get dice state from browser
  const diceState = await page.evaluate(() => {
    const gameBoard = window.currentGameBoard;
    const gameState = window.GameStateManager;
    return {
      hasRolledDice: gameBoard?.state?.hasRolledDice,
      lastDiceRoll: gameBoard?.state?.lastDiceRoll,
      diceOutcomesExists: !!gameBoard?.state?.diceOutcomes,
      diceOutcomesKeys: gameBoard?.state?.diceOutcomes ? Object.keys(gameBoard.state.diceOutcomes) : [],
      diceOutcomes: gameBoard?.state?.diceOutcomes,
      gameStateHasRolledDice: gameState?.hasRolledDice
    };
  });
  
  console.log('\n=== DICE STATE AFTER ROLL ===');
  console.log('hasRolledDice (GameBoard):', diceState.hasRolledDice);
  console.log('hasRolledDice (GameState):', diceState.gameStateHasRolledDice);
  console.log('lastDiceRoll:', diceState.lastDiceRoll);
  console.log('diceOutcomes exists:', diceState.diceOutcomesExists);
  console.log('diceOutcomes keys:', diceState.diceOutcomesKeys);
  console.log('diceOutcomes full:', JSON.stringify(diceState.diceOutcomes, null, 2));
  
  // Take final screenshot
  await page.screenshot({ path: '../test-results/after-dice-roll.png' });
  
  // Print all debug messages
  console.log('\n=== ALL DEBUG MESSAGES ===');
  debugMessages.forEach((msg, index) => {
    console.log(`${index + 1}: ${msg}`);
  });
  
  console.log('\n=== TEST COMPLETED ===');
});