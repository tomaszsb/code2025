const { test, expect } = require('@playwright/test');

test('Test button fix - dice outcomes should not create manual buttons', async ({ page }) => {
  console.log('=== TESTING BUTTON FIX ===');
  
  await page.goto('http://localhost:8001/');
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(3000);
  
  // Navigate to OWNER-SCOPE-INITIATION if not there
  const moveToOwnerScope = page.locator('button:has-text("OWNER-SCOPE-INITIATION")');
  if (await moveToOwnerScope.isVisible()) {
    await moveToOwnerScope.click();
    await page.waitForTimeout(2000);
  }
  
  console.log('Before dice roll:');
  const buttonsBefore = await page.locator('button:has-text("Draw")').allTextContents();
  console.log('Buttons before dice:', buttonsBefore);
  
  // Should only see E card button (from space CSV), no W card button
  const workButtonBeforeDice = await page.locator('button:has-text("Work Type")').isVisible();
  console.log('Work Type button before dice:', workButtonBeforeDice);
  
  // Roll dice
  const rollDiceButton = page.locator('button:has-text("Roll Dice")');
  if (await rollDiceButton.isVisible()) {
    console.log('Rolling dice...');
    await rollDiceButton.click();
    await page.waitForTimeout(4000);
    
    console.log('After dice roll:');
    const buttonsAfter = await page.locator('button:has-text("Draw")').allTextContents();
    console.log('Buttons after dice:', buttonsAfter);
    
    // Check if Work Type button appeared (BUG = should NOT appear)
    const workButtonAfterDice = await page.locator('button:has-text("Work Type")').isVisible();
    console.log('Work Type button after dice (should be false):', workButtonAfterDice);
    
    // Get dice outcomes display text to verify dice worked
    const diceOutcomeText = await page.locator('.dice-outcomes-display').textContent();
    console.log('Dice outcome display:', diceOutcomeText);
    
    // Final result
    if (workButtonAfterDice) {
      console.log('❌ BUG STILL EXISTS: Work Type button appeared after dice roll');
    } else {
      console.log('✅ FIX SUCCESSFUL: No Work Type button after dice roll');
    }
    
    // Take screenshot for comparison
    await page.screenshot({ path: '../test-results/after-fix.png' });
    console.log('Screenshot saved to test-results/after-fix.png');
  }
});