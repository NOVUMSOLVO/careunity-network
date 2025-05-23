import { test, expect } from '@playwright/test';
import { loginAsUser } from './utils/auth-helpers';

/**
 * Offline functionality end-to-end tests
 */
test.describe('Offline Functionality', () => {
  // Before each test, log in as a test user
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'caregiver');
  });
  
  test('should show offline indicator when connection is lost', async ({ page }) => {
    // Simulate going offline
    await page.evaluate(() => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false
      });
      
      // Dispatch offline event
      window.dispatchEvent(new Event('offline'));
    });
    
    // Verify offline indicator is shown
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.getByText('You are offline')).toBeVisible();
  });
  
  test('should allow creating visits while offline', async ({ page }) => {
    // Navigate to visits page
    await page.goto('/visits');
    
    // Simulate going offline
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    // Verify offline indicator is shown
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Create a new visit
    await page.getByRole('button', { name: 'New Visit' }).click();
    await page.getByLabel('Service User').selectOption('John Doe');
    await page.getByLabel('Date').fill('2023-06-01');
    await page.getByLabel('Time').fill('14:00');
    await page.getByLabel('Duration').fill('60');
    await page.getByLabel('Notes').fill('Test visit created while offline');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify success message
    await expect(page.getByText('Visit saved locally')).toBeVisible();
    
    // Verify visit appears in the list with offline indicator
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Pending sync')).toBeVisible();
  });
  
  test('should sync data when coming back online', async ({ page }) => {
    // Navigate to visits page
    await page.goto('/visits');
    
    // Simulate going offline
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
    });
    
    // Create a new visit while offline
    await page.getByRole('button', { name: 'New Visit' }).click();
    await page.getByLabel('Service User').selectOption('Jane Smith');
    await page.getByLabel('Date').fill('2023-06-02');
    await page.getByLabel('Time').fill('15:00');
    await page.getByLabel('Duration').fill('45');
    await page.getByLabel('Notes').fill('Test visit for sync');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify visit is saved locally
    await expect(page.getByText('Visit saved locally')).toBeVisible();
    
    // Simulate coming back online
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
    });
    
    // Verify sync is in progress
    await expect(page.getByText('Syncing data...')).toBeVisible();
    
    // Verify sync is complete
    await expect(page.getByText('All data synced')).toBeVisible();
    
    // Verify visit no longer shows "Pending sync"
    await expect(page.getByText('Pending sync')).not.toBeVisible();
  });
});
