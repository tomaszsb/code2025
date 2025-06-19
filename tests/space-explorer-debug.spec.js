// tests/space-explorer-debug.spec.js
const { test, expect } = require('@playwright/test');

test('Debug SpaceExplorer dice data processing', async ({ page }) => {
  await page.goto('http://localhost:8000/?debug=true&logLevel=debug');
  await page.click('button:has-text("Start Game")');
  await expect(page.locator('.game-container')).toBeVisible();
  
  // Debug the SpaceExplorer's dice data processing
  const spaceExplorerDebug = await page.evaluate(() => {
    // Find SpaceExplorer React component
    const spaceExplorerContainer = document.querySelector('.space-explorer-container');
    if (!spaceExplorerContainer) return { error: 'SpaceExplorer container not found' };
    
    // Check what data the SpaceExplorer is receiving
    const gameBoard = window.currentGameBoard;
    if (!gameBoard) return { error: 'GameBoard not found' };
    
    const diceRollData = gameBoard.state.diceRollData;
    const ownerScopeData = diceRollData ? diceRollData.filter(data => 
      data['space_name'] === 'OWNER-SCOPE-INITIATION'
    ) : [];
    
    // Test the processDiceData logic manually
    const testSpace = { space_name: 'OWNER-SCOPE-INITIATION' };
    const visitType = 'first';
    
    // Simulate the processDiceData logic
    const spaceDiceData = diceRollData.filter(data => 
      data['space_name'] === testSpace.space_name && 
      data['visit_type'].toLowerCase() === visitType
    );
    
    const rollOutcomes = {};
    for (let roll = 1; roll <= 6; roll++) {
      rollOutcomes[roll] = {};
      spaceDiceData.forEach(data => {
        const outcomeType = data['die_roll'];
        const outcomeValue = data[roll.toString()];
        if (outcomeValue && outcomeValue !== 'n/a' && outcomeValue.trim() !== '') {
          rollOutcomes[roll][outcomeType] = outcomeValue;
        }
      });
    }
    
    return {
      diceRollDataTotal: diceRollData ? diceRollData.length : 0,
      ownerScopeDataCount: ownerScopeData.length,
      ownerScopeDataSample: ownerScopeData.slice(0, 2),
      spaceDiceDataCount: spaceDiceData.length,
      spaceDiceDataSample: spaceDiceData,
      processedOutcomes: rollOutcomes,
      hasProcessedData: Object.keys(rollOutcomes).some(roll => 
        Object.keys(rollOutcomes[roll]).length > 0
      )
    };
  });
  
  console.log('SpaceExplorer dice data debug:', JSON.stringify(spaceExplorerDebug, null, 2));
  
  // Check if the dice outcomes section should be rendered
  const shouldRenderDice = spaceExplorerDebug.hasProcessedData;
  console.log('Should render dice outcomes table:', shouldRenderDice);
  
  if (shouldRenderDice) {
    // The data is there but table isn't rendering - check CSS or React rendering
    const diceTable = page.locator('.dice-outcomes-section, .dice-outcomes-table, table');
    const tableExists = await diceTable.count() > 0;
    console.log('Dice outcomes table exists in DOM:', tableExists);
    
    if (!tableExists) {
      // Check if there's any dice-related content
      const diceContent = page.locator('*:has-text("dice"), *:has-text("roll"), *:has-text("outcome")');
      const diceContentCount = await diceContent.count();
      console.log('Elements with dice-related text:', diceContentCount);
      
      if (diceContentCount > 0) {
        const diceTexts = await diceContent.allTextContents();
        console.log('Dice-related texts found:', diceTexts.slice(0, 5));
      }
    }
  }
  
  await page.screenshot({ path: 'playwright-reports/space-explorer-debug.png' });
});