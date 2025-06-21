const { test, expect } = require('@playwright/test');

test.describe('Left Panel Update via Movement Choice', () => {
  test('verify left panel updates when using movement choices', async ({ page }) => {
    // Set up console logging
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔄 GameBoard: Player moved event received') ||
          text.includes('StaticPlayerStatus [INFO]: componentDidUpdate called') ||
          text.includes('StaticPlayerStatus [INFO]: Props changed, updating player status') ||
          text.includes('GameBoard: setState completed - left panel should now update') ||
          text.includes('StaticPlayerStatus [INFO]: Direct playerMoved event received') ||
          text.includes('TurnManager: handleEndTurn called') ||
          text.includes('MovementEngine: executeMove called')) {
        logs.push(`[${new Date().toISOString().substr(11, 12)}] ${text}`);
      }
    });

    console.log('🚀 Starting movement choice test...');
    
    // Navigate and start game
    await page.goto('http://localhost:8000');
    await page.click('button:has-text("Start Game")');
    await page.waitForSelector('.game-container', { timeout: 15000 });
    await page.waitForSelector('.static-player-status', { timeout: 10000 });
    
    console.log('✅ Game loaded');
    
    // Get initial state
    const initialLeftPanel = await page.locator('.static-player-status').textContent();
    const initialPosition = await page.evaluate(() => {
      return window.GameState?.getCurrentPlayer()?.position;
    });
    
    console.log('📍 Initial position:', initialPosition);
    console.log('📄 Initial left panel length:', initialLeftPanel.length);
    
    // Look for movement choices in the right panel
    await page.waitForTimeout(2000);
    
    // Try to find movement choices
    const movementChoices = page.locator('text=/\\d+\\.[A-Z-]+-[A-Z-]+-[A-Z-]+/');
    const choiceCount = await movementChoices.count();
    console.log('🎯 Movement choices found:', choiceCount);
    
    if (choiceCount > 0) {
      const firstChoice = movementChoices.first();
      const choiceText = await firstChoice.textContent();
      console.log('📝 First movement choice:', choiceText);
      
      // Click the movement choice
      await firstChoice.click();
      console.log('✅ Clicked movement choice');
      
      await page.waitForTimeout(1000);
      
      // Look for End Turn button and click it
      const endTurnButton = page.locator('button:has-text("End Turn")');
      const isEnabled = await endTurnButton.isEnabled();
      console.log('🔘 End Turn enabled:', isEnabled);
      
      if (isEnabled) {
        await endTurnButton.click();
        console.log('✅ End Turn clicked');
        
        // Wait for movement processing
        await page.waitForTimeout(4000);
        
        // Check results
        const newPosition = await page.evaluate(() => {
          return window.GameState?.getCurrentPlayer()?.position;
        });
        const newLeftPanel = await page.locator('.static-player-status').textContent();
        
        console.log('📍 New position:', newPosition);
        console.log('📄 New left panel length:', newLeftPanel.length);
        
        // Analysis
        console.log('\n=== RESULTS ===');
        const positionChanged = initialPosition !== newPosition;
        const panelChanged = initialLeftPanel !== newLeftPanel;
        const panelShowsNewPosition = newLeftPanel.includes(newPosition || '');
        
        console.log('✅ Position changed:', positionChanged);
        console.log('✅ Left panel content changed:', panelChanged);
        console.log('✅ Left panel shows new position:', panelShowsNewPosition);
        
        // Show event logs
        console.log('\n=== EVENT FLOW ===');
        if (logs.length > 0) {
          logs.forEach(log => console.log(log));
          
          // Check for specific events
          const hasGameBoardEvent = logs.some(log => log.includes('GameBoard: Player moved event received'));
          const hasStaticPlayerUpdate = logs.some(log => log.includes('StaticPlayerStatus [INFO]: componentDidUpdate'));
          const hasPropsChanged = logs.some(log => log.includes('StaticPlayerStatus [INFO]: Props changed'));
          const hasDirectEvent = logs.some(log => log.includes('StaticPlayerStatus [INFO]: Direct playerMoved event received'));
          
          console.log('\n=== EVENT ANALYSIS ===');
          console.log('GameBoard received playerMoved:', hasGameBoardEvent ? '✅' : '❌');
          console.log('StaticPlayerStatus componentDidUpdate:', hasStaticPlayerUpdate ? '✅' : '❌');
          console.log('StaticPlayerStatus props changed:', hasPropsChanged ? '✅' : '❌');
          console.log('StaticPlayerStatus direct event:', hasDirectEvent ? '✅' : '❌');
          
          if (!hasGameBoardEvent) {
            console.log('🔍 ISSUE: GameBoard not receiving playerMoved events');
          }
          if (!hasStaticPlayerUpdate) {
            console.log('🔍 ISSUE: StaticPlayerStatus not updating');
          }
          if (hasDirectEvent) {
            console.log('✅ BACKUP: Direct event listener working');
          }
          
        } else {
          console.log('❌ No relevant events captured');
        }
        
        // Final verdict
        if (positionChanged && panelChanged && panelShowsNewPosition) {
          console.log('\n🎉 SUCCESS: Left panel updates correctly!');
        } else if (positionChanged && !panelChanged) {
          console.log('\n⚠️  ISSUE: Player moved but left panel did not update');
        } else if (!positionChanged) {
          console.log('\n❌ ISSUE: Player did not move at all');
        }
        
      } else {
        console.log('❌ End Turn button not enabled');
      }
    } else {
      console.log('❌ No movement choices found');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/movement-test-final.png' });
    console.log('📸 Final screenshot saved');
  });
});