const { test, expect } = require('@playwright/test');

test('Check current space state matching screenshot', async ({ page }) => {
  await page.goto('http://localhost:8001/');
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(3000);
  
  // Navigate to OWNER-SCOPE-INITIATION if not already there
  const moveToOwnerScope = page.locator('button:has-text("OWNER-SCOPE-INITIATION")');
  if (await moveToOwnerScope.isVisible()) {
    await moveToOwnerScope.click();
    await page.waitForTimeout(2000);
  }
  
  // Get current space data as shown in UI
  const currentSpaceData = await page.evaluate(() => {
    // Check what space is currently selected
    const gameBoard = window.currentGameBoard;
    const selectedSpace = gameBoard?.state?.selectedSpace;
    
    // Get the space object being displayed
    const spaces = window.GameStateManager?.spaces || [];
    const currentSpace = spaces.find(s => s.space_name === 'OWNER-SCOPE-INITIATION' && s.visit_type === 'First');
    
    return {
      selectedSpace: selectedSpace,
      currentSpace: currentSpace,
      hasRolledDice: gameBoard?.state?.hasRolledDice,
      diceOutcomes: gameBoard?.state?.diceOutcomes
    };
  });
  
  console.log('Current space state:', JSON.stringify(currentSpaceData, null, 2));
  
  // Check what buttons are actually visible
  const visibleButtons = await page.locator('button:has-text("Draw")').allTextContents();
  console.log('Visible Draw buttons:', visibleButtons);
  
  // Check for Work Type button specifically
  const workTypeButton = page.locator('button:has-text("Work Type")');
  const workTypeVisible = await workTypeButton.isVisible();
  console.log('Work Type button visible:', workTypeVisible);
  
  if (workTypeVisible) {
    const workTypeText = await workTypeButton.textContent();
    console.log('Work Type button text:', workTypeText);
  }
  
  // Try rolling dice to reproduce the screenshot scenario
  const rollDiceButton = page.locator('button:has-text("Roll Dice")');
  if (await rollDiceButton.isVisible()) {
    console.log('Rolling dice to test the scenario...');
    await rollDiceButton.click();
    await page.waitForTimeout(4000);
    
    // Check buttons after dice roll
    const buttonsAfterDice = await page.locator('button:has-text("Draw")').allTextContents();
    console.log('Buttons after dice roll:', buttonsAfterDice);
    
    const workTypeAfterDice = await page.locator('button:has-text("Work Type")').isVisible();
    console.log('Work Type button still visible after dice:', workTypeAfterDice);
    
    // Get final dice state
    const finalState = await page.evaluate(() => {
      const gb = window.currentGameBoard;
      return {
        hasRolledDice: gb?.state?.hasRolledDice,
        diceRoll: gb?.state?.lastDiceRoll,
        diceOutcomes: gb?.state?.diceOutcomes
      };
    });
    
    console.log('Final state after dice:', JSON.stringify(finalState, null, 2));
  }
});