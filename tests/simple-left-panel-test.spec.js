const { test, expect } = require('@playwright/test');

test.describe('Left Panel Update - Simple Test', () => {
  test('verify left panel updates after player movement', async ({ page }) => {
    // Set up console logging to capture key events
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔄 GameBoard: Player moved event received') ||
          text.includes('StaticPlayerStatus [INFO]: componentDidUpdate called') ||
          text.includes('StaticPlayerStatus [INFO]: Props changed, updating player status') ||
          text.includes('GameBoard: setState completed - left panel should now update') ||
          text.includes('StaticPlayerStatus [INFO]: Direct playerMoved event received')) {
        logs.push(`[${new Date().toISOString().substr(11, 12)}] ${text}`);
      }
    });

    console.log('🚀 Starting left panel update test...');
    
    // Navigate to the game
    await page.goto('http://localhost:8000');
    console.log('✅ Page loaded');
    
    // Complete player setup
    await page.click('button:has-text("Start Game")');
    console.log('✅ Game started');
    
    // Wait for game board to load
    await page.waitForSelector('.game-container', { timeout: 15000 });
    await page.waitForSelector('.static-player-status', { timeout: 10000 });
    console.log('✅ Game board and left panel loaded');
    
    // Get initial left panel content
    const initialLeftPanelText = await page.locator('.static-player-status').textContent();
    console.log('📄 Initial left panel content length:', initialLeftPanelText.length);
    
    // Get initial player position
    const initialPosition = await page.evaluate(() => {
      const player = window.GameState?.getCurrentPlayer();
      return player?.position;
    });
    console.log('📍 Initial player position:', initialPosition);
    
    // Wait a moment for available moves to appear
    await page.waitForTimeout(2000);
    
    // Try to find and click an available move
    const availableMoves = page.locator('.space.available-move');
    const moveCount = await availableMoves.count();
    console.log('🎯 Available moves found:', moveCount);
    
    if (moveCount > 0) {
      // Click the first available move
      await availableMoves.first().click();
      console.log('✅ Selected a move');
      
      // Wait for selection to register
      await page.waitForTimeout(1000);
      
      // Click End Turn to execute the move
      const endTurnButton = page.locator('button:has-text("End Turn")');
      const isEndTurnEnabled = await endTurnButton.isEnabled();
      console.log('🔘 End Turn button enabled:', isEndTurnEnabled);
      
      if (isEndTurnEnabled) {
        await endTurnButton.click();
        console.log('✅ End Turn clicked - movement should occur');
        
        // Wait for movement and updates to complete
        await page.waitForTimeout(4000);
        
        // Check new player position
        const newPosition = await page.evaluate(() => {
          const player = window.GameState?.getCurrentPlayer();
          return player?.position;
        });
        console.log('📍 New player position:', newPosition);
        
        // Get updated left panel content
        const updatedLeftPanelText = await page.locator('.static-player-status').textContent();
        console.log('📄 Updated left panel content length:', updatedLeftPanelText.length);
        
        // Analysis
        console.log('\n=== ANALYSIS ===');
        console.log('Position changed:', initialPosition !== newPosition);
        console.log('Left panel content changed:', initialLeftPanelText !== updatedLeftPanelText);
        
        if (updatedLeftPanelText.includes(newPosition)) {
          console.log('✅ Left panel shows new position');
        } else {
          console.log('❌ Left panel does NOT show new position');
        }
        
        // Show relevant console logs
        console.log('\n=== EVENT LOGS ===');
        if (logs.length > 0) {
          logs.forEach(log => console.log(log));
        } else {
          console.log('❌ No relevant event logs captured');
        }
        
        // Conclusions
        if (logs.some(log => log.includes('GameBoard: Player moved event received'))) {
          console.log('✅ GameBoard receives playerMoved events');
        } else {
          console.log('❌ GameBoard NOT receiving playerMoved events');
        }
        
        if (logs.some(log => log.includes('StaticPlayerStatus [INFO]: componentDidUpdate'))) {
          console.log('✅ StaticPlayerStatus componentDidUpdate called');
        } else {
          console.log('❌ StaticPlayerStatus componentDidUpdate NOT called');
        }
        
        if (logs.some(log => log.includes('Direct playerMoved event received'))) {
          console.log('✅ Backup event listener working');
        } else {
          console.log('ℹ️  Backup event listener not triggered');
        }
        
      } else {
        console.log('❌ End Turn button not enabled - cannot test movement');
      }
    } else {
      console.log('❌ No available moves found - game state issue');
      
      // Debug game state
      const gameState = await page.evaluate(() => ({
        gameStarted: window.GameState?.gameStarted,
        currentPlayerIndex: window.GameState?.currentPlayerIndex,
        playersCount: window.GameState?.players?.length,
        spacesCount: window.GameState?.spaces?.length
      }));
      console.log('🔍 Game state debug:', gameState);
    }
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'test-results/left-panel-test.png' });
    console.log('📸 Screenshot saved');
  });
});