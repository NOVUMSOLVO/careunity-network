import { test, expect } from '@playwright/test';
import { loginAsUser } from './utils/auth-helpers';

/**
 * Dashboard end-to-end tests
 */
test.describe('Dashboard', () => {
  // Before each test, log in as a test user
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'coordinator');
  });
  
  test('should display dashboard with key metrics', async ({ page }) => {
    // Verify dashboard title
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Verify key metrics are displayed
    await expect(page.getByText('Today\'s Visits')).toBeVisible();
    await expect(page.getByText('Staff on Shift')).toBeVisible();
    await expect(page.getByText('Visit Coverage')).toBeVisible();
    
    // Verify dashboard contains charts
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();
  });
  
  test('should allow filtering dashboard by date', async ({ page }) => {
    // Click on date filter
    await page.getByRole('button', { name: 'Filter by date' }).click();
    
    // Select a different date
    await page.getByRole('button', { name: 'Yesterday' }).click();
    
    // Verify loading state
    await expect(page.getByText('Loading...')).toBeVisible();
    
    // Verify data is updated
    await expect(page.getByText('Loading...')).not.toBeVisible();
    
    // Verify dashboard shows updated data
    await expect(page.getByText('Yesterday\'s Overview')).toBeVisible();
  });
  
  test('should navigate to different dashboard tabs', async ({ page }) => {
    // Click on the "Staff" tab
    await page.getByRole('tab', { name: 'Staff' }).click();
    
    // Verify staff information is displayed
    await expect(page.getByText('Staff Overview')).toBeVisible();
    await expect(page.getByText('Staff Availability')).toBeVisible();
    
    // Click on the "Service Users" tab
    await page.getByRole('tab', { name: 'Service Users' }).click();
    
    // Verify service user information is displayed
    await expect(page.getByText('Service User Overview')).toBeVisible();
  });
  
  test('should display real-time updates', async ({ page }) => {
    // Get initial visit count
    const initialCount = await page.locator('[data-testid="completed-visits-count"]').textContent();
    
    // Trigger a visit completion (in a real test, this would be done via API)
    await page.evaluate(() => {
      // Simulate WebSocket message for visit completion
      const event = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'visit_update',
          payload: {
            id: '123',
            status: 'completed',
            timestamp: new Date().toISOString()
          }
        })
      });
      window.dispatchEvent(event);
    });
    
    // Verify count is updated
    await expect(page.locator('[data-testid="completed-visits-count"]')).not.toHaveText(initialCount);
  });
});
