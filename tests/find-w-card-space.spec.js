const { test, expect } = require('@playwright/test');

test('Find space with both dice W cards and manual w_card field', async ({ page }) => {
  await page.goto('http://localhost:8001/');
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(3000);
  
  // Get all spaces that have both w_card field AND dice W Cards
  const spacesWithBothWCards = await page.evaluate(() => {
    const spaces = window.GameStateManager?.spaces || [];
    const diceData = window.diceRollData || [];
    
    const results = [];
    
    for (const space of spaces) {
      // Check if space has manual w_card field with content
      const hasManualWCard = space.w_card && space.w_card.trim() !== '';
      
      // Check if space has dice W Cards data
      const hasDiceWCards = diceData.some(d => 
        d.space_name === space.space_name && 
        d.die_roll === 'W Cards'
      );
      
      if (hasManualWCard && hasDiceWCards) {
        results.push({
          space_name: space.space_name,
          visit_type: space.visit_type,
          w_card: space.w_card,
          diceWCardData: diceData.filter(d => 
            d.space_name === space.space_name && 
            d.die_roll === 'W Cards'
          )
        });
      }
    }
    
    return results;
  });
  
  console.log('Spaces with BOTH manual w_card AND dice W Cards:');
  console.log(JSON.stringify(spacesWithBothWCards, null, 2));
  
  if (spacesWithBothWCards.length === 0) {
    console.log('No spaces found with both manual w_card and dice W Cards');
    
    // Check spaces with manual w_card only
    const manualWCardSpaces = await page.evaluate(() => {
      const spaces = window.GameStateManager?.spaces || [];
      return spaces.filter(s => s.w_card && s.w_card.trim() !== '')
        .map(s => ({ space_name: s.space_name, w_card: s.w_card, visit_type: s.visit_type }));
    });
    
    console.log('\nSpaces with manual w_card field:');
    console.log(JSON.stringify(manualWCardSpaces.slice(0, 5), null, 2));
  }
});