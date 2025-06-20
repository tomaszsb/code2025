const { test, expect } = require('@playwright/test');

test('Check space data for OWNER-SCOPE-INITIATION', async ({ page }) => {
  await page.goto('http://localhost:8001/');
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(3000);
  
  // Get space data from browser
  const spaceData = await page.evaluate(() => {
    const spaces = window.GameStateManager?.spaces || [];
    const ownerSpace = spaces.find(s => s.space_name === 'OWNER-SCOPE-INITIATION');
    
    if (ownerSpace) {
      return {
        space_name: ownerSpace.space_name,
        w_card: ownerSpace.w_card,
        e_card: ownerSpace.e_card,
        b_card: ownerSpace.b_card,
        i_card: ownerSpace.i_card,
        l_card: ownerSpace.l_card,
        visit_type: ownerSpace.visit_type,
        allKeys: Object.keys(ownerSpace)
      };
    }
    
    return null;
  });
  
  console.log('OWNER-SCOPE-INITIATION space data:', JSON.stringify(spaceData, null, 2));
  
  // Also check dice roll data
  const diceData = await page.evaluate(() => {
    const diceRollData = window.diceRollData || [];
    const ownerDiceData = diceRollData.filter(d => d.space_name === 'OWNER-SCOPE-INITIATION');
    return ownerDiceData;
  });
  
  console.log('OWNER-SCOPE-INITIATION dice data:', JSON.stringify(diceData, null, 2));
});