// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Stopwatch Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should display initial stopwatch state', async ({ page }) => {
    // Check initial time display
    await expect(page.locator('#hr')).toHaveText('00');
    await expect(page.locator('#min')).toHaveText('00');
    await expect(page.locator('#sec')).toHaveText('00');
    await expect(page.locator('#count')).toHaveText('00');

    // Check start button is visible and has correct text
    await expect(page.locator('#start')).toBeVisible();
    await expect(page.locator('#start')).toContainText('Start');
  });

  test('should start and pause stopwatch', async ({ page }) => {
    // Start the stopwatch
    await page.click('#start');
    
    // Check button text changes to Pause
    await expect(page.locator('#start')).toContainText('Pause');
    
    // Wait a bit and check time has progressed
    await page.waitForTimeout(1500);
    const seconds = await page.locator('#sec').textContent();
    expect(parseInt(seconds)).toBeGreaterThan(0);
    
    // Pause the stopwatch
    await page.click('#start');
    await expect(page.locator('#start')).toContainText('Start');
  });

  test('should reset stopwatch', async ({ page }) => {
    // Start stopwatch and let it run
    await page.click('#start');
    await page.waitForTimeout(1000);
    
    // Reset stopwatch
    await page.click('#reset');
    
    // Check time is reset
    await expect(page.locator('#hr')).toHaveText('00');
    await expect(page.locator('#min')).toHaveText('00');
    await expect(page.locator('#sec')).toHaveText('00');
    await expect(page.locator('#count')).toHaveText('00');
    
    // Check button text is Start
    await expect(page.locator('#start')).toContainText('Start');
  });

  test('should add and display laps', async ({ page }) => {
    // Start stopwatch
    await page.click('#start');
    await page.waitForTimeout(500);
    
    // Add a lap
    await page.click('#lap');
    
    // Check record container is visible
    await expect(page.locator('#record-container')).toBeVisible();
    
    // Check lap is recorded in table
    const lapRows = page.locator('#record-table-body tr');
    await expect(lapRows).toHaveCount(1);
  });

  test('should clear all laps', async ({ page }) => {
    // Start stopwatch and add laps
    await page.click('#start');
    await page.waitForTimeout(300);
    await page.click('#lap');
    await page.waitForTimeout(300);
    await page.click('#lap');
    
    // Clear laps with confirmation
    await page.click('#clearlap');
    
    // Handle modal confirmation if it appears
    const modal = page.locator('.modal');
    if (await modal.isVisible()) {
      await page.click('button:has-text("Clear All")');
    }
    
    // Check record container is hidden
    await expect(page.locator('#record-container')).toBeHidden();
  });

  test('should respond to keyboard shortcuts', async ({ page }) => {
    // Test Space key to start/stop
    await page.keyboard.press('Space');
    await expect(page.locator('#start')).toContainText('Pause');
    
    await page.keyboard.press('Space');
    await expect(page.locator('#start')).toContainText('Start');
    
    // Test R key to reset
    await page.keyboard.press('KeyR');
    await expect(page.locator('#hr')).toHaveText('00');
    
    // Test P key to start
    await page.keyboard.press('KeyP');
    await expect(page.locator('#start')).toContainText('Pause');
    
    // Test Enter key to add lap
    await page.keyboard.press('Enter');
    await expect(page.locator('#record-container')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    // Click theme toggle
    await page.click('#light');
    
    // Check if dark theme is applied (body background should change)
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // The exact color may vary, but it should not be white
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('should show keyboard help modal', async ({ page }) => {
    // Press ? key to show help
    await page.keyboard.press('Shift+Slash');
    
    // Check modal appears
    const modal = page.locator('.modal:has-text("Keyboard Shortcuts")');
    await expect(modal).toBeVisible();
    
    // Check modal contains shortcut information
    await expect(modal).toContainText('Space / P');
    await expect(modal).toContainText('Start/Stop timer');
  });

  test('should persist laps in localStorage', async ({ page }) => {
    // Start stopwatch and add a lap
    await page.click('#start');
    await page.waitForTimeout(500);
    await page.click('#lap');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check lap is still there
    await expect(page.locator('#record-container')).toBeVisible();
    const lapRows = page.locator('#record-table-body tr');
    await expect(lapRows).toHaveCount(1);
  });

  test('should export laps to CSV', async ({ page }) => {
    // Start stopwatch and add laps
    await page.click('#start');
    await page.waitForTimeout(300);
    await page.click('#lap');
    await page.waitForTimeout(300);
    await page.click('#lap');
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Trigger export (this would need to be implemented in the UI)
    await page.evaluate(() => {
      if (window.stopwatchInstance) {
        window.stopwatchInstance.exportLaps();
      }
    });
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/stopwatch-laps-.*\.csv/);
  });
});
