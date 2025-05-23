/**
 * End-to-End Tests for Offline Synchronization
 * 
 * Tests the offline synchronization functionality including:
 * - Working offline
 * - Synchronizing data when back online
 * - Handling conflicts
 */

import { test, expect, Page } from '@playwright/test';
import { BrowserContext } from '@playwright/test';

// Test data
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
};

const TEST_SERVICE_USER = {
  fullName: 'Test Service User',
  uniqueId: `SU-${Date.now()}`,
};

const TEST_NOTE = {
  content: 'This is a test note created while offline',
  category: 'observation',
};

// Helper function to login
async function login(page: Page) {
  await page.goto('/auth');
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
}

// Helper function to navigate to service user details
async function navigateToServiceUser(page: Page, serviceUserName: string) {
  // Navigate to service users page
  await page.click('a:has-text("Service Users")');
  await expect(page).toHaveURL(/.*service-users/);
  
  // Search for the service user
  await page.fill('input[placeholder="Search service users..."]', serviceUserName);
  await page.press('input[placeholder="Search service users..."]', 'Enter');
  
  // Wait for search results
  await expect(page.locator(`text=${serviceUserName}`)).toBeVisible({ timeout: 5000 });
  
  // Click on the service user
  await page.click(`text=${serviceUserName}`);
  
  // Check that we're on the service user details page
  await expect(page.locator(`h1:has-text("${serviceUserName}")`)).toBeVisible();
}

// Helper function to navigate to notes tab
async function navigateToNotes(page: Page, serviceUserName: string) {
  await navigateToServiceUser(page, serviceUserName);
  
  // Click on the notes tab
  await page.click('button:has-text("Notes")');
  
  // Check that the notes section is displayed
  await expect(page.locator('h2:has-text("Notes")')).toBeVisible();
}

// Helper function to go offline
async function goOffline(context: BrowserContext) {
  await context.setOffline(true);
}

// Helper function to go online
async function goOnline(context: BrowserContext) {
  await context.setOffline(false);
}

test.describe('Offline Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should show offline indicator when offline', async ({ page, context }) => {
    // Go offline
    await goOffline(context);
    
    // Check that the offline indicator is displayed
    await expect(page.locator('.offline-indicator')).toBeVisible();
    
    // Go back online
    await goOnline(context);
    
    // Check that the offline indicator is hidden
    await expect(page.locator('.offline-indicator')).not.toBeVisible();
  });

  test('should load cached data when offline', async ({ page, context }) => {
    // First, navigate to the service user while online to cache the data
    await navigateToServiceUser(page, TEST_SERVICE_USER.fullName);
    
    // Go back to dashboard
    await page.click('a:has-text("Dashboard")');
    
    // Go offline
    await goOffline(context);
    
    // Navigate to the service user again
    await navigateToServiceUser(page, TEST_SERVICE_USER.fullName);
    
    // Check that the service user details are still displayed
    await expect(page.locator(`h1:has-text("${TEST_SERVICE_USER.fullName}")`)).toBeVisible();
    
    // Go back online
    await goOnline(context);
  });

  test('should create note while offline and sync when online', async ({ page, context }) => {
    // Navigate to notes tab
    await navigateToNotes(page, TEST_SERVICE_USER.fullName);
    
    // Go offline
    await goOffline(context);
    
    // Check that the offline indicator is displayed
    await expect(page.locator('.offline-indicator')).toBeVisible();
    
    // Click on the add note button
    await page.click('button:has-text("Add Note")');
    
    // Check that the form is displayed
    await expect(page.locator('h2:has-text("Add Note")')).toBeVisible();
    
    // Fill the form
    await page.fill('textarea[name="content"]', TEST_NOTE.content);
    await page.selectOption('select[name="category"]', TEST_NOTE.category);
    
    // Submit the form
    await page.click('button:has-text("Save")');
    
    // Check for offline save message
    await expect(page.locator('text=Note saved offline. Will sync when online.')).toBeVisible({ timeout: 5000 });
    
    // Check that the new note is in the list with an offline indicator
    await expect(page.locator(`text=${TEST_NOTE.content}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_NOTE.content} >> xpath=../.. >> .offline-badge`)).toBeVisible();
    
    // Go back online
    await goOnline(context);
    
    // Check for sync message
    await expect(page.locator('text=Syncing offline data...')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Sync completed successfully')).toBeVisible({ timeout: 10000 });
    
    // Check that the note is still in the list but without the offline indicator
    await expect(page.locator(`text=${TEST_NOTE.content}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_NOTE.content} >> xpath=../.. >> .offline-badge`)).not.toBeVisible();
  });

  test('should queue multiple operations while offline', async ({ page, context }) => {
    // Navigate to notes tab
    await navigateToNotes(page, TEST_SERVICE_USER.fullName);
    
    // Go offline
    await goOffline(context);
    
    // Create first note
    await page.click('button:has-text("Add Note")');
    await page.fill('textarea[name="content"]', 'First offline note');
    await page.selectOption('select[name="category"]', 'observation');
    await page.click('button:has-text("Save")');
    
    // Check for offline save message
    await expect(page.locator('text=Note saved offline. Will sync when online.')).toBeVisible({ timeout: 5000 });
    
    // Create second note
    await page.click('button:has-text("Add Note")');
    await page.fill('textarea[name="content"]', 'Second offline note');
    await page.selectOption('select[name="category"]', 'medication');
    await page.click('button:has-text("Save")');
    
    // Check for offline save message
    await expect(page.locator('text=Note saved offline. Will sync when online.')).toBeVisible({ timeout: 5000 });
    
    // Check that both notes are in the list with offline indicators
    await expect(page.locator('text=First offline note')).toBeVisible();
    await expect(page.locator('text=First offline note >> xpath=../.. >> .offline-badge')).toBeVisible();
    await expect(page.locator('text=Second offline note')).toBeVisible();
    await expect(page.locator('text=Second offline note >> xpath=../.. >> .offline-badge')).toBeVisible();
    
    // Check the sync queue status
    await page.click('.offline-indicator');
    await expect(page.locator('text=Pending operations: 2')).toBeVisible();
    
    // Go back online
    await goOnline(context);
    
    // Check for sync message
    await expect(page.locator('text=Syncing offline data...')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Sync completed successfully')).toBeVisible({ timeout: 10000 });
    
    // Check that both notes are still in the list but without offline indicators
    await expect(page.locator('text=First offline note')).toBeVisible();
    await expect(page.locator('text=First offline note >> xpath=../.. >> .offline-badge')).not.toBeVisible();
    await expect(page.locator('text=Second offline note')).toBeVisible();
    await expect(page.locator('text=Second offline note >> xpath=../.. >> .offline-badge')).not.toBeVisible();
  });

  test('should handle conflicts during sync', async ({ page, context, browser }) => {
    // Create a second browser context to simulate another user
    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    
    // Login with the second user
    await login(secondPage);
    
    // Navigate to the same service user's notes
    await navigateToNotes(page, TEST_SERVICE_USER.fullName);
    await navigateToNotes(secondPage, TEST_SERVICE_USER.fullName);
    
    // Go offline with the first user
    await goOffline(context);
    
    // First user creates a note offline
    await page.click('button:has-text("Add Note")');
    await page.fill('textarea[name="content"]', 'Conflict test note');
    await page.selectOption('select[name="category"]', 'observation');
    await page.click('button:has-text("Save")');
    
    // Second user creates a note with the same content online
    await secondPage.click('button:has-text("Add Note")');
    await secondPage.fill('textarea[name="content"]', 'Conflict test note');
    await secondPage.selectOption('select[name="category"]', 'medication'); // Different category
    await secondPage.click('button:has-text("Save")');
    
    // Check that the second user's note is saved
    await expect(secondPage.locator('text=Note created successfully')).toBeVisible({ timeout: 5000 });
    
    // Go back online with the first user
    await goOnline(context);
    
    // Check for conflict message
    await expect(page.locator('text=Sync conflict detected')).toBeVisible({ timeout: 10000 });
    
    // Resolve the conflict by keeping both
    await page.click('button:has-text("Keep Both")');
    
    // Check that both notes are in the list
    await expect(page.locator('text=Conflict test note')).toHaveCount(2);
    
    // Clean up
    await secondPage.close();
    await secondContext.close();
  });

  test('should retry failed sync operations', async ({ page, context }) => {
    // Navigate to notes tab
    await navigateToNotes(page, TEST_SERVICE_USER.fullName);
    
    // Go offline
    await goOffline(context);
    
    // Create a note
    await page.click('button:has-text("Add Note")');
    await page.fill('textarea[name="content"]', 'Retry test note');
    await page.selectOption('select[name="category"]', 'observation');
    await page.click('button:has-text("Save")');
    
    // Check for offline save message
    await expect(page.locator('text=Note saved offline. Will sync when online.')).toBeVisible({ timeout: 5000 });
    
    // Go back online but with a temporary network error (simulate by going online then immediately offline)
    await goOnline(context);
    await goOffline(context);
    
    // Check for sync error message
    await expect(page.locator('text=Sync failed. Will retry automatically.')).toBeVisible({ timeout: 10000 });
    
    // Go back online for real
    await goOnline(context);
    
    // Check for retry message
    await expect(page.locator('text=Retrying failed sync operations...')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Sync completed successfully')).toBeVisible({ timeout: 10000 });
    
    // Check that the note is synced
    await expect(page.locator('text=Retry test note')).toBeVisible();
    await expect(page.locator('text=Retry test note >> xpath=../.. >> .offline-badge')).not.toBeVisible();
  });

  test('should sync data in the background', async ({ page, context }) => {
    // Navigate to notes tab
    await navigateToNotes(page, TEST_SERVICE_USER.fullName);
    
    // Go offline
    await goOffline(context);
    
    // Create a note
    await page.click('button:has-text("Add Note")');
    await page.fill('textarea[name="content"]', 'Background sync test note');
    await page.selectOption('select[name="category"]', 'observation');
    await page.click('button:has-text("Save")');
    
    // Navigate away to the dashboard
    await page.click('a:has-text("Dashboard")');
    
    // Go back online
    await goOnline(context);
    
    // Check for background sync message
    await expect(page.locator('text=Background sync in progress')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Background sync completed')).toBeVisible({ timeout: 10000 });
    
    // Navigate back to the notes
    await navigateToNotes(page, TEST_SERVICE_USER.fullName);
    
    // Check that the note is synced
    await expect(page.locator('text=Background sync test note')).toBeVisible();
    await expect(page.locator('text=Background sync test note >> xpath=../.. >> .offline-badge')).not.toBeVisible();
  });
});
