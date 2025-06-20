const { test, expect } = require('@playwright/test');

test('Simple debug test', async ({ page }) => {
  // Start with a simple test to see if server is running
  try {
    await page.goto('http://localhost:8000/', { timeout: 5000 });
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server not responding:', error.message);
    
    // Try alternative ports
    const ports = [8080, 3000, 8001];
    for (const port of ports) {
      try {
        await page.goto(`http://localhost:${port}/`, { timeout: 2000 });
        console.log(`✅ Found server on port ${port}`);
        break;
      } catch (e) {
        console.log(`❌ Port ${port} not responding`);
      }
    }
    return;
  }
  
  // Check if game loads
  try {
    await page.waitForSelector('.game-board', { timeout: 5000 });
    console.log('✅ Game board loaded');
  } catch (error) {
    console.log('❌ Game board not found:', error.message);
    
    // Check what's actually on the page
    const title = await page.title();
    const bodyText = await page.locator('body').textContent();
    console.log('Page title:', title);
    console.log('Body text (first 200 chars):', bodyText.substring(0, 200));
    return;
  }
  
  console.log('🎯 Ready for debugging tests');
});