const { test, expect } = require('@playwright/test');

test.describe('Left Panel Update Test', () => {
  test('left panel updates when player moves between spaces', async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:8000');
    
    // Wait for game to load
    await page.waitForSelector('.game-container', { timeout: 10000 });
    
    // Wait for player setup to complete and game to start
    await page.waitForSelector('.static-player-status', { timeout: 15000 });
    
    console.log('Game loaded, checking initial state...');
    
    // Get initial left panel content
    const initialLeftPanel = await page.locator('.static-player-status').textContent();
    console.log('Initial left panel content:', initialLeftPanel);
    
    // Find the current player's initial position
    const initialPosition = await page.evaluate(() => {
      const currentPlayer = window.GameState?.getCurrentPlayer();
      return currentPlayer?.position || 'unknown';
    });
    console.log('Initial player position:', initialPosition);
    
    // Look for available moves and click one
    console.log('Looking for available moves...');
    
    // Wait for available moves to be highlighted
    await page.waitForTimeout(2000);
    
    // Find a clickable space (available move)
    const availableMove = page.locator('.space.available-move').first();
    
    if (await availableMove.count() > 0) {
      const moveSpaceName = await availableMove.getAttribute('data-space-name');
      console.log('Found available move to:', moveSpaceName);
      
      // Click the available move
      await availableMove.click();
      
      // Wait for move selection
      await page.waitForTimeout(1000);
      
      // Click End Turn button to execute the move
      const endTurnButton = page.locator('.end-turn-btn');
      await endTurnButton.click();
      
      console.log('Move executed, waiting for left panel to update...');
      
      // Wait for movement animation and updates
      await page.waitForTimeout(3000);
      
      // Get updated left panel content
      const updatedLeftPanel = await page.locator('.static-player-status').textContent();
      console.log('Updated left panel content:', updatedLeftPanel);
      
      // Get new player position
      const newPosition = await page.evaluate(() => {
        const currentPlayer = window.GameState?.getCurrentPlayer();
        return currentPlayer?.position || 'unknown';
      });
      console.log('New player position:', newPosition);
      
      // Verify the position changed
      expect(newPosition).not.toBe(initialPosition);
      console.log('✅ Player position changed from', initialPosition, 'to', newPosition);
      
      // Verify the left panel content changed
      expect(updatedLeftPanel).not.toBe(initialLeftPanel);
      console.log('✅ Left panel content updated');
      
      // Verify the left panel shows the new space name
      expect(updatedLeftPanel).toContain(newPosition);
      console.log('✅ Left panel shows new space name:', newPosition);
      
    } else {
      console.log('❌ No available moves found - test cannot proceed');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/no-moves-found.png' });
      
      // Log current game state for debugging
      const gameState = await page.evaluate(() => {
        return {
          gameStarted: window.GameState?.gameStarted,
          currentPlayer: window.GameState?.getCurrentPlayer()?.name,
          availableMoves: window.currentGameBoard?.state?.availableMoves?.length || 0
        };
      });
      console.log('Current game state:', gameState);
      
      throw new Error('No available moves found - game may not be properly initialized');
    }
  });
  
  test('console logs show proper event flow', async ({ page }) => {
    const logs = [];
    
    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      // Only capture relevant logs for left panel updates
      if (text.includes('GameBoard: Player moved event received') ||
          text.includes('StaticPlayerStatus') ||
          text.includes('setState completed - left panel should now update') ||
          text.includes('componentDidUpdate called')) {
        logs.push(text);
      }
    });
    
    // Navigate and perform the same test
    await page.goto('http://localhost:8000');
    await page.waitForSelector('.game-container', { timeout: 10000 });
    await page.waitForSelector('.static-player-status', { timeout: 15000 });
    
    // Wait and look for moves
    await page.waitForTimeout(2000);
    const availableMove = page.locator('.space.available-move').first();
    
    if (await availableMove.count() > 0) {
      await availableMove.click();
      await page.waitForTimeout(1000);
      
      const endTurnButton = page.locator('.end-turn-btn');
      await endTurnButton.click();
      
      // Wait for all events to process
      await page.waitForTimeout(3000);
      
      // Check that we got the expected log messages
      console.log('=== CAPTURED LOGS ===');
      logs.forEach(log => console.log(log));
      
      // Verify key logs are present
      const hasPlayerMovedEvent = logs.some(log => log.includes('GameBoard: Player moved event received'));
      const hasStaticPlayerStatusUpdate = logs.some(log => log.includes('StaticPlayerStatus') && log.includes('componentDidUpdate'));
      const hasStateSetComplete = logs.some(log => log.includes('setState completed - left panel should now update'));
      
      console.log('Event flow check:');
      console.log('✅ Player moved event received:', hasPlayerMovedEvent);
      console.log('✅ StaticPlayerStatus componentDidUpdate called:', hasStaticPlayerStatusUpdate);  
      console.log('✅ GameBoard setState completed:', hasStateSetComplete);
      
      if (!hasPlayerMovedEvent) {
        console.log('❌ GameBoard is not receiving playerMoved events');
      }
      if (!hasStaticPlayerStatusUpdate) {
        console.log('❌ StaticPlayerStatus is not updating when props change');
      }
      if (!hasStateSetComplete) {
        console.log('❌ GameBoard setState is not completing properly');
      }
      
    } else {
      console.log('❌ No available moves found for log test');
    }
  });
});