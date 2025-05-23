import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

// Test data
const testVisit = {
  serviceUser: 'John Doe',
  visitType: 'Personal Care',
  date: format(new Date(), 'yyyy-MM-dd'), // Today's date
  startTime: '09:00',
  endTime: '10:00',
  notes: 'Test visit created by Playwright'
};

test.describe('Visits Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page
    await page.goto('/login');
    
    // Login with test credentials
    await page.fill('input[name="email"]', 'test@careunity.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('/');
    
    // Navigate to visits page
    await page.click('a[href="/visits"]');
    await page.waitForURL('/visits');
  });
  
  test('should display visits page', async ({ page }) => {
    // Check that we're on the visits page
    await expect(page).toHaveURL('/visits');
    await expect(page.locator('h1')).toContainText('Visits');
    
    // Check for the "New Visit" button
    await expect(page.locator('button', { hasText: 'New Visit' })).toBeVisible();
  });
  
  test('should create a new visit', async ({ page }) => {
    // Click the "New Visit" button
    await page.click('button:has-text("New Visit")');
    await page.waitForURL('/visits/new');
    
    // Fill out the form
    await page.selectOption('select[name="serviceUserId"]', { label: testVisit.serviceUser });
    await page.fill('input[name="visitType"]', testVisit.visitType);
    await page.fill('input[name="date"]', testVisit.date);
    await page.fill('input[name="startTime"]', testVisit.startTime);
    await page.fill('input[name="endTime"]', testVisit.endTime);
    await page.fill('textarea[name="notes"]', testVisit.notes);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation back to visits list
    await page.waitForURL('/visits');
    
    // Check that the new visit appears in the list
    await expect(page.locator(`text=${testVisit.visitType}`)).toBeVisible();
    await expect(page.locator(`text=${testVisit.serviceUser}`)).toBeVisible();
  });
  
  test('should view visit details', async ({ page }) => {
    // Find and click on a visit
    const visitCard = page.locator('.mobile-card', { hasText: testVisit.visitType }).first();
    await visitCard.click();
    
    // Check that we're on the visit details page
    await expect(page.url()).toContain('/visits/');
    
    // Check that the visit details are displayed
    await expect(page.locator('h2')).toContainText(testVisit.visitType);
    await expect(page.locator('text=Service User')).toBeVisible();
    await expect(page.locator(`text=${testVisit.serviceUser}`)).toBeVisible();
    
    // Check for action buttons
    if (await page.locator('text=scheduled').isVisible()) {
      await expect(page.locator('button:has-text("Complete Visit")')).toBeVisible();
      await expect(page.locator('button:has-text("Edit Visit")')).toBeVisible();
      await expect(page.locator('button:has-text("Cancel Visit")')).toBeVisible();
    }
  });
  
  test('should complete a visit', async ({ page }) => {
    // Find and click on a scheduled visit
    const scheduledVisit = page.locator('.mobile-card', { hasText: 'scheduled' }).first();
    await scheduledVisit.click();
    
    // Check that we're on the visit details page
    await expect(page.url()).toContain('/visits/');
    
    // Click the "Complete Visit" button
    await page.click('button:has-text("Complete Visit")');
    
    // Fill out the completion form
    await page.fill('textarea[name="notes"]', 'Visit completed successfully');
    await page.fill('textarea[name="feedback"]', 'Service user was happy with the care provided');
    
    // Set rating to 5 stars
    await page.click('button:has-text("★"):nth-of-type(5)');
    
    // Submit the form
    await page.click('button:has-text("Complete Visit")');
    
    // Check that the visit status has changed to completed
    await expect(page.locator('text=completed')).toBeVisible();
    await expect(page.locator('text=Service user was happy with the care provided')).toBeVisible();
  });
  
  test('should cancel a visit', async ({ page }) => {
    // Find and click on a scheduled visit
    const scheduledVisit = page.locator('.mobile-card', { hasText: 'scheduled' }).first();
    
    // If no scheduled visits, create one
    if (await scheduledVisit.count() === 0) {
      // Create a new visit first
      await page.click('button:has-text("New Visit")');
      await page.waitForURL('/visits/new');
      
      // Fill out the form
      await page.selectOption('select[name="serviceUserId"]', { label: testVisit.serviceUser });
      await page.fill('input[name="visitType"]', testVisit.visitType);
      await page.fill('input[name="date"]', testVisit.date);
      await page.fill('input[name="startTime"]', testVisit.startTime);
      await page.fill('input[name="endTime"]', testVisit.endTime);
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for navigation back to visits list
      await page.waitForURL('/visits');
      
      // Find and click on the newly created visit
      await page.locator('.mobile-card', { hasText: testVisit.visitType }).first().click();
    } else {
      await scheduledVisit.click();
    }
    
    // Check that we're on the visit details page
    await expect(page.url()).toContain('/visits/');
    
    // Click the "Cancel Visit" button
    await page.click('button:has-text("Cancel Visit")');
    
    // Fill out the cancellation form
    await page.fill('textarea[name="reason"]', 'Service user unavailable');
    
    // Submit the form
    await page.click('button:has-text("Cancel Visit")');
    
    // Check that the visit status has changed to cancelled
    await expect(page.locator('text=cancelled')).toBeVisible();
    await expect(page.locator('text=Service user unavailable')).toBeVisible();
  });
  
  test('should filter visits by date', async ({ page }) => {
    // Go to the visits page
    await page.goto('/visits');
    
    // Open the filters
    await page.click('button[aria-label="Filter"]');
    
    // Set the date filter to today
    await page.fill('input[name="date"]', testVisit.date);
    
    // Apply the filter
    await page.click('button:has-text("Apply")');
    
    // Check that the filtered visits are displayed
    await expect(page.locator(`text=${format(new Date(testVisit.date), 'EEEE, MMMM d')}`)).toBeVisible();
  });
  
  test('should use swipe actions on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to the visits page
    await page.goto('/visits');
    
    // Find a scheduled visit
    const scheduledVisit = page.locator('.mobile-card', { hasText: 'scheduled' }).first();
    
    // If there's a scheduled visit, test swipe actions
    if (await scheduledVisit.count() > 0) {
      // Get the bounding box of the visit card
      const box = await scheduledVisit.boundingBox();
      
      if (box) {
        // Simulate swipe left to reveal delete action
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
        
        // Check that the cancel button is visible
        await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
        
        // Tap outside to dismiss
        await page.mouse.click(10, 10);
        
        // Simulate swipe right to reveal edit action
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
        
        // Check that the edit button is visible
        await expect(page.locator('button:has-text("Edit")')).toBeVisible();
      }
    }
  });
});
