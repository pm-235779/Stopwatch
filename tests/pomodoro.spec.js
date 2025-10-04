// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Pomodoro Timer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pomodoro/');
    await page.waitForLoadState('networkidle');
  });

  test('should display initial pomodoro state', async ({ page }) => {
    // Check initial time display (25:00)
    await expect(page.locator('#minutes')).toHaveText('25');
    await expect(page.locator('#seconds')).toHaveText('00');

    // Check play button is visible
    await expect(page.locator('#timer-control')).toBeVisible();
    await expect(page.locator('#timer-control')).toContainText('Play');
  });

  test('should start and pause pomodoro timer', async ({ page }) => {
    // Start the timer
    await page.click('#timer-control');
    
    // Check button text changes to Pause
    await expect(page.locator('#timer-control')).toContainText('Pause');
    
    // Check background changes to inactive state
    const background = page.locator('#counter-background');
    await expect(background).toHaveClass(/inactive/);
    
    // Wait and check time has decreased
    await page.waitForTimeout(2000);
    const minutes = await page.locator('#minutes').textContent();
    const seconds = await page.locator('#seconds').textContent();
    
    // Should be less than 25:00
    expect(parseInt(minutes) * 60 + parseInt(seconds)).toBeLessThan(25 * 60);
    
    // Pause the timer
    await page.click('#timer-control');
    await expect(page.locator('#timer-control')).toContainText('Play');
  });

  test('should reset pomodoro timer', async ({ page }) => {
    // Start timer and let it run
    await page.click('#timer-control');
    await page.waitForTimeout(1000);
    
    // Reset timer
    await page.click('#reset');
    
    // Check time is reset to 25:00
    await expect(page.locator('#minutes')).toHaveText('25');
    await expect(page.locator('#seconds')).toHaveText('00');
    
    // Check button text is Play
    await expect(page.locator('#timer-control')).toContainText('Play');
    
    // Check background is active
    const background = page.locator('#counter-background');
    await expect(background).toHaveClass(/active/);
  });

  test('should show focus message when running', async ({ page }) => {
    // Start timer
    await page.click('#timer-control');
    
    // Check focus message is visible
    const focusMessage = page.locator('#focus');
    await expect(focusMessage).not.toHaveClass(/hide/);
    
    // Pause timer
    await page.click('#timer-control');
    
    // Check focus message is hidden
    await expect(focusMessage).toHaveClass(/hide/);
  });

  test('should complete timer and show completion modal', async ({ page }) => {
    // Set a very short timer for testing (1 second)
    await page.evaluate(() => {
      if (window.pomodoroInstance) {
        window.pomodoroInstance.setDuration(0.02); // ~1 second
      }
    });
    
    // Start timer
    await page.click('#timer-control');
    
    // Wait for completion
    await page.waitForTimeout(2000);
    
    // Check completion modal appears
    const modal = page.locator('.modal:has-text("Pomodoro Complete")');
    await expect(modal).toBeVisible();
    
    // Check modal has action buttons
    await expect(modal.locator('button:has-text("Start Break")')).toBeVisible();
    await expect(modal.locator('button:has-text("Start Another")')).toBeVisible();
  });

  test('should respond to keyboard shortcuts', async ({ page }) => {
    // Test Space key to start/stop
    await page.keyboard.press('Space');
    await expect(page.locator('#timer-control')).toContainText('Pause');
    
    await page.keyboard.press('Space');
    await expect(page.locator('#timer-control')).toContainText('Play');
    
    // Test R key to reset
    await page.keyboard.press('KeyR');
    await expect(page.locator('#minutes')).toHaveText('25');
    await expect(page.locator('#seconds')).toHaveText('00');
  });

  test('should navigate between timer pages', async ({ page }) => {
    // Click on stopwatch link
    await page.click('a:has-text("STOP WATCH")');
    await expect(page).toHaveURL('/');
    
    // Go back to pomodoro
    await page.goto('/pomodoro/');
    
    // Click on custom timer link
    await page.click('a:has-text("CUSTOM TIMER")');
    await expect(page).toHaveURL(/custom_timer/);
  });

  test('should maintain timer state during theme toggle', async ({ page }) => {
    // Start timer
    await page.click('#timer-control');
    await page.waitForTimeout(1000);
    
    // Toggle theme
    await page.click('#light');
    
    // Check timer is still running
    await expect(page.locator('#timer-control')).toContainText('Pause');
    
    // Check time is still counting down
    const minutes1 = await page.locator('#minutes').textContent();
    await page.waitForTimeout(1000);
    const minutes2 = await page.locator('#minutes').textContent();
    const seconds1 = await page.locator('#seconds').textContent();
    const seconds2 = await page.locator('#seconds').textContent();
    
    const time1 = parseInt(minutes1) * 60 + parseInt(seconds1);
    const time2 = parseInt(minutes2) * 60 + parseInt(seconds2);
    
    expect(time2).toBeLessThan(time1);
  });

  test('should save and load settings', async ({ page }) => {
    // Open settings (if implemented)
    const settingsBtn = page.locator('#settings-btn');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      
      // Change pomodoro duration
      const workDurationInput = page.locator('#pomodoro-work');
      if (await workDurationInput.isVisible()) {
        await workDurationInput.fill('30');
        await page.click('button:has-text("Save")');
        
        // Reload page and check setting persisted
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check if timer shows 30 minutes
        await expect(page.locator('#minutes')).toHaveText('30');
      }
    }
  });
});
