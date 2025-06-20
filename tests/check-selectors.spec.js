const { test, expect } = require('@playwright/test');

test('Check available selectors', async ({ page }) => {
  await page.goto('http://localhost:8001/');
  
  // Wait a bit for any dynamic loading
  await page.waitForTimeout(3000);
  
  // Check page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for various game-related selectors
  const selectors = [
    '.game-board',
    '.board-container',
    '.info-panels-container',
    '.player-panel',
    '.space-info',
    '#app',
    '.App'
  ];
  
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    console.log(`${selector}: ${count} elements found`);
  }
  
  // Get body classes
  const bodyClasses = await page.locator('body').getAttribute('class');
  console.log('Body classes:', bodyClasses);
  
  // Get any error messages
  const errors = await page.locator('.error, .error-message').allTextContents();
  if (errors.length > 0) {
    console.log('Errors found:', errors);
  }
  
  // Check console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(2000);
  
  if (consoleErrors.length > 0) {
    console.log('Console errors:', consoleErrors);
  }
  
  // Take a screenshot for manual inspection
  await page.screenshot({ path: '../test-results/page-state.png', fullPage: true });
  console.log('Screenshot saved to test-results/page-state.png');
});