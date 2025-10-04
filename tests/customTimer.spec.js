// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Custom Timer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/custom_timer/timer.html');
    await page.waitForLoadState('networkidle');
  });

  test('should display initial custom timer state', async ({ page }) => {
    // Check initial time display (00:00:00)
    await expect(page.locator('#hours')).toHaveText('00');
    await expect(page.locator('#minutes')).toHaveText('00');
    await expect(page.locator('#seconds')).toHaveText('00');

    // Check input fields are visible
    await expect(page.locator('#hoursInput')).toBeVisible();
    await expect(page.locator('#minutesInput')).toBeVisible();
    await expect(page.locator('#secondsInput')).toBeVisible();

    // Check make timer button is visible
    await expect(page.locator('button:has-text("Make Timer")')).toBeVisible();
  });

  test('should create and start custom timer', async ({ page }) => {
    // Set timer to 5 seconds
    await page.fill('#hoursInput', '0');
    await page.fill('#minutesInput', '0');
    await page.fill('#secondsInput', '5');
    
    // Create timer
    await page.click('button:has-text("Make Timer")');
    
    // Check timer display is updated
    await expect(page.locator('#hours')).toHaveText('00');
    await expect(page.locator('#minutes')).toHaveText('00');
    await expect(page.locator('#seconds')).toHaveText('05');
    
    // Start timer
    await page.click('#timer-control');
    
    // Check button text changes to Pause
    await expect(page.locator('#timer-control')).toContainText('Pause');
    
    // Wait and check time decreases
    await page.waitForTimeout(2000);
    const seconds = await page.locator('#seconds').textContent();
    expect(parseInt(seconds)).toBeLessThan(5);
  });

  test('should validate timer input', async ({ page }) => {
    // Try to create timer with all zeros
    await page.fill('#hoursInput', '0');
    await page.fill('#minutesInput', '0');
    await page.fill('#secondsInput', '0');
    
    await page.click('button:has-text("Make Timer")');
    
    // Should show validation modal
    const modal = page.locator('.modal:has-text("Invalid Time")');
    await expect(modal).toBeVisible();
  });

  test('should complete timer with celebration', async ({ page }) => {
    // Set very short timer (1 second)
    await page.fill('#secondsInput', '1');
    await page.click('button:has-text("Make Timer")');
    
    // Start timer
    await page.click('#timer-control');
    
    // Wait for completion
    await page.waitForTimeout(2000);
    
    // Check confetti animation is active
    const confetti = page.locator('#confetti .confetti');
    await expect(confetti.first()).toBeVisible();
    
    // Check stop alarm button is visible
    await expect(page.locator('#stop-alarm')).toBeVisible();
    
    // Check timer digits have pulse animation
    const timer = page.locator('.timer.pulse');
    await expect(timer.first()).toBeVisible();
  });

  test('should stop alarm and celebration', async ({ page }) => {
    // Set very short timer and complete it
    await page.fill('#secondsInput', '1');
    await page.click('button:has-text("Make Timer")');
    await page.click('#timer-control');
    
    // Wait for completion
    await page.waitForTimeout(2000);
    
    // Stop alarm
    await page.click('#stop-alarm');
    
    // Check stop alarm button is hidden
    await expect(page.locator('#stop-alarm')).toBeHidden();
    
    // Check confetti is cleared
    const confetti = page.locator('#confetti .confetti');
    await expect(confetti).toHaveCount(0);
    
    // Check pulse animation is removed
    const pulseTimer = page.locator('.timer.pulse');
    await expect(pulseTimer).toHaveCount(0);
  });

  test('should reset custom timer', async ({ page }) => {
    // Create and start timer
    await page.fill('#secondsInput', '10');
    await page.click('button:has-text("Make Timer")');
    await page.click('#timer-control');
    
    // Wait a bit
    await page.waitForTimeout(1000);
    
    // Reset timer
    await page.click('#reset');
    
    // Check timer is reset to 00:00:00
    await expect(page.locator('#hours')).toHaveText('00');
    await expect(page.locator('#minutes')).toHaveText('00');
    await expect(page.locator('#seconds')).toHaveText('00');
    
    // Check button text is Play
    await expect(page.locator('#timer-control')).toContainText('Play');
  });

  test('should respond to keyboard shortcuts', async ({ page }) => {
    // Create timer first
    await page.fill('#secondsInput', '10');
    await page.click('button:has-text("Make Timer")');
    
    // Test Space key to start/stop
    await page.keyboard.press('Space');
    await expect(page.locator('#timer-control')).toContainText('Pause');
    
    await page.keyboard.press('Space');
    await expect(page.locator('#timer-control')).toContainText('Play');
    
    // Test R key to reset
    await page.keyboard.press('KeyR');
    await expect(page.locator('#seconds')).toHaveText('00');
  });

  test('should save and load timer presets', async ({ page }) => {
    // Create a timer
    await page.fill('#hoursInput', '1');
    await page.fill('#minutesInput', '30');
    await page.fill('#secondsInput', '0');
    await page.click('button:has-text("Make Timer")');
    
    // Check if presets dropdown appears
    const presetsDropdown = page.locator('.dropdown:has-text("Quick Presets")');
    if (await presetsDropdown.isVisible()) {
      // Click dropdown to see presets
      await presetsDropdown.click();
      
      // Should show the preset we just created
      const preset = page.locator('.dropdown-item:has-text("1h 30m 0s")');
      await expect(preset).toBeVisible();
    }
  });

  test('should handle different timer durations', async ({ page }) => {
    // Test hours, minutes, seconds combination
    await page.fill('#hoursInput', '2');
    await page.fill('#minutesInput', '30');
    await page.fill('#secondsInput', '45');
    await page.click('button:has-text("Make Timer")');
    
    // Check display
    await expect(page.locator('#hours')).toHaveText('02');
    await expect(page.locator('#minutes')).toHaveText('30');
    await expect(page.locator('#seconds')).toHaveText('45');
    
    // Start and check countdown
    await page.click('#timer-control');
    await page.waitForTimeout(1500);
    
    // Should be counting down
    const seconds = await page.locator('#seconds').textContent();
    expect(parseInt(seconds)).toBeLessThan(45);
  });

  test('should show focus message when running', async ({ page }) => {
    // Create and start timer
    await page.fill('#secondsInput', '10');
    await page.click('button:has-text("Make Timer")');
    await page.click('#timer-control');
    
    // Check focus message is visible
    const focusMessage = page.locator('#focus');
    await expect(focusMessage).not.toHaveClass(/hidden/);
    
    // Pause timer
    await page.click('#timer-control');
    
    // Check focus message is hidden
    await expect(focusMessage).toHaveClass(/hidden/);
  });

  test('should clear input fields after creating timer', async ({ page }) => {
    // Fill inputs
    await page.fill('#hoursInput', '1');
    await page.fill('#minutesInput', '2');
    await page.fill('#secondsInput', '3');
    
    // Create timer
    await page.click('button:has-text("Make Timer")');
    
    // Check inputs are cleared
    await expect(page.locator('#hoursInput')).toHaveValue('');
    await expect(page.locator('#minutesInput')).toHaveValue('');
    await expect(page.locator('#secondsInput')).toHaveValue('');
  });
});
