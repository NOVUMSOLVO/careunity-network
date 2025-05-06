/**
 * Community Resources Directory Feature Tests
 * 
 * This file contains tests specific to the Community Resources Directory
 * feature of the CareUnity application.
 */

import { test, expect } from '@playwright/test';

// Resource Directory List View Tests
export async function testResourceDirectoryListView() {
  test.describe('Community Resources Directory - List View', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to community resources directory
      await page.goto('/auth');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.goto('/community-resources-directory');
    });

    test('should load and display resource cards', async ({ page }) => {
      await expect(page.locator('.card')).toHaveCount.atLeast(1);
      await expect(page.locator('h3:has-text("Community Resources")')).toBeVisible();
    });

    test('should filter resources by search term', async ({ page }) => {
      const initialCount = await page.locator('.card').count();
      await page.fill('input[placeholder*="Search"]', 'food');
      
      // Wait for search filtering to complete
      await page.waitForTimeout(500);
      
      const filteredCount = await page.locator('.card').count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      
      // Check that at least one result contains the search term
      const resultText = await page.locator('.card').first().textContent();
      expect(resultText?.toLowerCase()).toContain('food');
    });

    test('should filter resources by category', async ({ page }) => {
      // Open category dropdown
      await page.click('button[aria-haspopup="listbox"]');
      
      // Select a specific category
      await page.click('div[role="option"]:has-text("Housing")');
      
      // Wait for filtering to complete
      await page.waitForTimeout(500);
      
      // Verify at least one result has the housing category
      const categoryBadges = await page.locator('.badge:has-text("Housing")');
      await expect(categoryBadges).toHaveCount.atLeast(1);
    });

    test('should clear filters when clear button is clicked', async ({ page }) => {
      // Apply a filter first
      await page.fill('input[placeholder*="Search"]', 'unique term');
      
      // Wait for no results message
      await expect(page.locator('text="No resources found"')).toBeVisible();
      
      // Click clear filters
      await page.click('button:has-text("Clear Filters")');
      
      // Expect original resources to reappear
      await expect(page.locator('.card')).toHaveCount.atLeast(1);
    });

    test('should navigate to resource detail view', async ({ page }) => {
      // Click on the first resource's view details button
      await page.click('.card button:has-text("View Details")');
      
      // Verify detail view appears
      await expect(page.locator('button:has-text("Back to All Resources")')).toBeVisible();
      await expect(page.locator('div[role="tablist"]')).toBeVisible();
    });
  });
}

// Resource Directory Map View Tests
export async function testResourceDirectoryMapView() {
  test.describe('Community Resources Directory - Map View', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to community resources directory
      await page.goto('/auth');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.goto('/community-resources-directory');
      
      // Switch to map view
      await page.click('button:has-text("Map")');
    });

    test('should display map view with resource cards', async ({ page }) => {
      await expect(page.locator('text="Interactive Map"')).toBeVisible();
      await expect(page.locator('text="Resources in this Area"')).toBeVisible();
      await expect(page.locator('.card')).toHaveCount.atLeast(1);
    });

    test('should navigate to resource detail view from map', async ({ page }) => {
      // Click on the first resource's view details button in map view
      await page.click('.card button:has-text("View Details")');
      
      // Verify detail view appears
      await expect(page.locator('button:has-text("Back to All Resources")')).toBeVisible();
      await expect(page.locator('div[role="tablist"]')).toBeVisible();
    });
  });
}

// Resource Detail View Tests
export async function testResourceDetailView() {
  test.describe('Community Resources Directory - Detail View', () => {
    test.beforeEach(async ({ page }) => {
      // Login, navigate to resources, and open a resource detail
      await page.goto('/auth');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.goto('/community-resources-directory');
      await page.click('.card button:has-text("View Details")');
    });

    test('should display resource details with tabs', async ({ page }) => {
      // Check for key detail view elements
      await expect(page.locator('div[role="tablist"]')).toBeVisible();
      await expect(page.locator('button:has-text("Details")')).toBeVisible();
      await expect(page.locator('button:has-text("Reviews")')).toBeVisible();
      await expect(page.locator('button:has-text("Referral Info")')).toBeVisible();
    });

    test('should navigate between tabs', async ({ page }) => {
      // Start on details tab (default)
      await expect(page.locator('h3:has-text("About")')).toBeVisible();
      
      // Switch to reviews tab
      await page.click('button[role="tab"]:has-text("Reviews")');
      await expect(page.locator('h3:has-text("Reviews & Feedback")')).toBeVisible();
      
      // Switch to referrals tab
      await page.click('button[role="tab"]:has-text("Referral Info")');
      await expect(page.locator('text="Referral Process"').or(page.locator('text="No Referral Required"'))).toBeVisible();
    });

    test('should open and close accordion sections', async ({ page }) => {
      // Find an accordion and click to open
      const accordion = page.locator('button[data-state="closed"]:has-text("Eligibility Criteria")');
      await accordion.click();
      
      // Verify content is visible
      await expect(page.locator('div[data-state="open"] >> text="Age:"')).toBeVisible();
      
      // Click again to close
      await page.locator('button[data-state="open"]:has-text("Eligibility Criteria")').click();
      
      // Verify content is hidden
      await expect(page.locator('div[data-state="closed"]')).toBeVisible();
    });

    test('should return to listing when back button clicked', async ({ page }) => {
      // Click back button
      await page.click('button:has-text("Back to All Resources")');
      
      // Verify return to listing view
      await expect(page.locator('h1:has-text("Community Resources")')).toBeVisible();
      await expect(page.locator('.card')).toHaveCount.atLeast(1);
    });

    test('should open referral form dialog', async ({ page }) => {
      // Go to referrals tab
      await page.click('button[role="tab"]:has-text("Referral Info")');
      
      // Click referral button
      await page.click('button:has-text("Start Referral Process")');
      
      // Verify dialog opens
      await expect(page.locator('h2:has-text("Make a Referral")')).toBeVisible();
      await expect(page.locator('button:has-text("Submit Referral")')).toBeVisible();
    });
  });
}

// Resource Referral Form Tests
export async function testResourceReferralForm() {
  test.describe('Community Resources Directory - Referral Form', () => {
    test.beforeEach(async ({ page }) => {
      // Login, navigate to resources, open a resource, go to referrals tab, and open form
      await page.goto('/auth');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.goto('/community-resources-directory');
      await page.click('.card button:has-text("View Details")');
      await page.click('button[role="tab"]:has-text("Referral Info")');
      await page.click('button:has-text("Start Referral Process")');
    });

    test('should display validation errors for empty required fields', async ({ page }) => {
      // Submit without filling required fields
      await page.click('button:has-text("Submit Referral")');
      
      // Check for validation error
      await expect(page.locator('text="Please select a service user"')).toBeVisible();
    });

    test('should allow selecting service user from dropdown', async ({ page }) => {
      // Click the dropdown
      await page.click('button[role="combobox"]');
      
      // Wait for dropdown options to load
      await expect(page.locator('div[role="option"]')).toBeVisible();
      
      // Select first option
      await page.click('div[role="option"]');
      
      // Verify selection was made (dropdown should close and selection should be visible)
      await expect(page.locator('button[role="combobox"] div')).not.toHaveText('Select a service user');
    });

    test('should open date picker for follow-up date', async ({ page }) => {
      // Click date picker button
      await page.click('button:has-text("No follow-up scheduled")');
      
      // Verify calendar opens
      await expect(page.locator('div[role="dialog"] >> div[role="grid"]')).toBeVisible();
      
      // Select a date (e.g., 15th of current month)
      await page.click('div[role="dialog"] button:has-text("15"):not([disabled])');
      
      // Verify date was selected (dialog should close with date visible)
      await expect(page.locator('button:has-text("No follow-up scheduled")')).not.toBeVisible();
    });

    test('should submit form with valid data', async ({ page }) => {
      // Select service user
      await page.click('button[role="combobox"]');
      await page.click('div[role="option"]');
      
      // Add notes
      await page.fill('textarea', 'Test referral notes');
      
      // Submit form
      await page.click('button:has-text("Submit Referral")');
      
      // Verify success message appears
      await expect(page.locator('div[role="alert"]:has-text("Referral submitted")')).toBeVisible();
    });
  });
}

// Resource Reviews Tests
export async function testResourceReviews() {
  test.describe('Community Resources Directory - Reviews', () => {
    test.beforeEach(async ({ page }) => {
      // Login, navigate to resources, open a resource, and go to reviews tab
      await page.goto('/auth');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.goto('/community-resources-directory');
      await page.click('.card button:has-text("View Details")');
      await page.click('button[role="tab"]:has-text("Reviews")');
    });

    test('should display existing reviews', async ({ page }) => {
      // Verify reviews are visible
      await expect(page.locator('h3:has-text("Reviews & Feedback")')).toBeVisible();
      
      // Check for review content or empty state
      await expect(
        page.locator('.avatar').or(page.locator('text="No reviews yet"'))
      ).toBeVisible();
    });

    test('should open review form when write button clicked', async ({ page }) => {
      // Click write review button
      await page.click('button:has-text("Write a Review")');
      
      // Verify form appears
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('button:has-text("Submit Review")')).toBeVisible();
    });

    test('should set star rating when stars clicked', async ({ page }) => {
      // Open review form
      await page.click('button:has-text("Write a Review")');
      
      // Click on 4th star
      await page.locator('svg.star').nth(3).click();
      
      // Verify 4 stars are filled (have the filled class)
      await expect(page.locator('svg.star.fill-yellow-400')).toHaveCount(4);
    });

    test('should show validation errors for invalid review submission', async ({ page }) => {
      // Open review form
      await page.click('button:has-text("Write a Review")');
      
      // Try to submit without required fields
      await page.click('button:has-text("Submit Review")');
      
      // Verify validation errors
      await expect(page.locator('text="Please select a rating"')).toBeVisible();
      await expect(page.locator('text="Please provide a comment"')).toBeVisible();
    });

    test('should submit valid review form', async ({ page }) => {
      // Open review form
      await page.click('button:has-text("Write a Review")');
      
      // Set star rating
      await page.locator('svg.star').nth(4).click();
      
      // Add comment
      await page.fill('textarea', 'This is a test review with detailed feedback about the resource.');
      
      // Submit form
      await page.click('button:has-text("Submit Review")');
      
      // Verify success message
      await expect(page.locator('div[role="alert"]:has-text("Review submitted")')).toBeVisible();
    });

    test('should mark review as helpful', async ({ page }) => {
      // If there are reviews
      if (await page.locator('.avatar').count() > 0) {
        // Get the initial helpful count
        const helpfulButton = page.locator('button:has-text("Helpful")').first();
        const initialText = await helpfulButton.textContent();
        
        // Click helpful button
        await helpfulButton.click();
        
        // Verify alert appears
        await expect(page.locator('div[role="alert"]:has-text("Marked as helpful")')).toBeVisible();
      }
    });
  });
}

// Execute all tests
export default async function runAllCommunityResourcesTests() {
  await testResourceDirectoryListView();
  await testResourceDirectoryMapView();
  await testResourceDetailView();
  await testResourceReferralForm();
  await testResourceReviews();
}