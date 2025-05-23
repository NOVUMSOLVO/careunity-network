/**
 * End-to-End Tests for Service User Management
 * 
 * Tests the service user management functionality including:
 * - Viewing service users
 * - Creating service users
 * - Editing service users
 * - Searching and filtering
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
};

const TEST_SERVICE_USER = {
  fullName: 'Test Service User',
  uniqueId: `SU-${Date.now()}`,
  dateOfBirth: '1980-01-01',
  address: '123 Test Street, Test City, TS1 1TS',
  phoneNumber: '+44123456789',
  emergencyContact: 'Emergency Contact, +44987654321',
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

// Helper function to navigate to service users page
async function navigateToServiceUsers(page: Page) {
  await page.click('a:has-text("Service Users")');
  await expect(page).toHaveURL(/.*service-users/);
}

// Helper function to fill service user form
async function fillServiceUserForm(page: Page, serviceUser: typeof TEST_SERVICE_USER) {
  await page.fill('input[name="fullName"]', serviceUser.fullName);
  await page.fill('input[name="uniqueId"]', serviceUser.uniqueId);
  await page.fill('input[name="dateOfBirth"]', serviceUser.dateOfBirth);
  await page.fill('input[name="address"]', serviceUser.address);
  await page.fill('input[name="phoneNumber"]', serviceUser.phoneNumber);
  await page.fill('input[name="emergencyContact"]', serviceUser.emergencyContact);
}

test.describe('Service User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should display service users list', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Check that the service users list is displayed
    await expect(page.locator('h1:has-text("Service Users")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('button:has-text("Add Service User")')).toBeVisible();
  });

  test('should create a new service user', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Click on the add service user button
    await page.click('button:has-text("Add Service User")');
    
    // Check that the form is displayed
    await expect(page.locator('h2:has-text("Add Service User")')).toBeVisible();
    
    // Fill the form
    await fillServiceUserForm(page, TEST_SERVICE_USER);
    
    // Submit the form
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Service user created successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the new service user is in the list
    await expect(page.locator(`text=${TEST_SERVICE_USER.fullName}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_SERVICE_USER.uniqueId}`)).toBeVisible();
  });

  test('should view service user details', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Search for the test service user
    await page.fill('input[placeholder="Search service users..."]', TEST_SERVICE_USER.uniqueId);
    await page.press('input[placeholder="Search service users..."]', 'Enter');
    
    // Wait for search results
    await expect(page.locator(`text=${TEST_SERVICE_USER.uniqueId}`)).toBeVisible({ timeout: 5000 });
    
    // Click on the service user
    await page.click(`text=${TEST_SERVICE_USER.fullName}`);
    
    // Check that we're on the service user details page
    await expect(page.locator(`h1:has-text("${TEST_SERVICE_USER.fullName}")`)).toBeVisible();
    
    // Check that service user details are displayed
    await expect(page.locator(`text=${TEST_SERVICE_USER.dateOfBirth}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_SERVICE_USER.address}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_SERVICE_USER.phoneNumber}`)).toBeVisible();
  });

  test('should edit service user details', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Search for the test service user
    await page.fill('input[placeholder="Search service users..."]', TEST_SERVICE_USER.uniqueId);
    await page.press('input[placeholder="Search service users..."]', 'Enter');
    
    // Wait for search results
    await expect(page.locator(`text=${TEST_SERVICE_USER.uniqueId}`)).toBeVisible({ timeout: 5000 });
    
    // Click on the service user
    await page.click(`text=${TEST_SERVICE_USER.fullName}`);
    
    // Click on the edit button
    await page.click('button:has-text("Edit")');
    
    // Update the service user details
    const updatedAddress = '456 Updated Street, Updated City, UC1 1UC';
    await page.fill('input[name="address"]', updatedAddress);
    
    // Save the changes
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Service user updated successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the updated details are displayed
    await expect(page.locator(`text=${updatedAddress}`)).toBeVisible();
  });

  test('should search for service users', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Search for the test service user
    await page.fill('input[placeholder="Search service users..."]', TEST_SERVICE_USER.uniqueId);
    await page.press('input[placeholder="Search service users..."]', 'Enter');
    
    // Wait for search results
    await expect(page.locator(`text=${TEST_SERVICE_USER.uniqueId}`)).toBeVisible({ timeout: 5000 });
    
    // Check that only matching results are displayed
    await expect(page.locator(`text=${TEST_SERVICE_USER.fullName}`)).toBeVisible();
    
    // Clear the search
    await page.fill('input[placeholder="Search service users..."]', '');
    await page.press('input[placeholder="Search service users..."]', 'Enter');
    
    // Check that more results are displayed
    await expect(page.locator('table tbody tr')).toHaveCount.at(least(2));
  });

  test('should filter service users', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Open the filter dropdown
    await page.click('button:has-text("Filter")');
    
    // Select a filter option (e.g., Active)
    await page.click('text=Active');
    
    // Check that the filter is applied
    await expect(page.locator('text=Filtered by: Active')).toBeVisible();
    
    // Clear the filter
    await page.click('button:has-text("Clear Filters")');
    
    // Check that the filter is removed
    await expect(page.locator('text=Filtered by: Active')).not.toBeVisible();
  });

  test('should paginate through service users', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Check that pagination controls are visible
    await expect(page.locator('nav[aria-label="Pagination"]')).toBeVisible();
    
    // Get the current page number
    const currentPage = await page.locator('button[aria-current="page"]').textContent();
    
    // Click on the next page button
    await page.click('button[aria-label="Next page"]');
    
    // Check that we're on the next page
    await expect(page.locator(`button[aria-current="page"]:not(:has-text("${currentPage}"))`)).toBeVisible();
    
    // Click on the previous page button
    await page.click('button[aria-label="Previous page"]');
    
    // Check that we're back on the first page
    await expect(page.locator(`button[aria-current="page"]:has-text("${currentPage}")`)).toBeVisible();
  });

  test('should show validation errors on service user form', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Click on the add service user button
    await page.click('button:has-text("Add Service User")');
    
    // Submit the form without filling it
    await page.click('button:has-text("Save")');
    
    // Check for validation errors
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Unique ID is required')).toBeVisible();
    await expect(page.locator('text=Date of birth is required')).toBeVisible();
    await expect(page.locator('text=Address is required')).toBeVisible();
  });

  test('should show service user care plans', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Search for the test service user
    await page.fill('input[placeholder="Search service users..."]', TEST_SERVICE_USER.uniqueId);
    await page.press('input[placeholder="Search service users..."]', 'Enter');
    
    // Wait for search results
    await expect(page.locator(`text=${TEST_SERVICE_USER.uniqueId}`)).toBeVisible({ timeout: 5000 });
    
    // Click on the service user
    await page.click(`text=${TEST_SERVICE_USER.fullName}`);
    
    // Click on the care plans tab
    await page.click('button:has-text("Care Plans")');
    
    // Check that the care plans section is displayed
    await expect(page.locator('h2:has-text("Care Plans")')).toBeVisible();
    
    // Check for the add care plan button
    await expect(page.locator('button:has-text("Add Care Plan")')).toBeVisible();
  });

  test('should show service user appointments', async ({ page }) => {
    await navigateToServiceUsers(page);
    
    // Search for the test service user
    await page.fill('input[placeholder="Search service users..."]', TEST_SERVICE_USER.uniqueId);
    await page.press('input[placeholder="Search service users..."]', 'Enter');
    
    // Wait for search results
    await expect(page.locator(`text=${TEST_SERVICE_USER.uniqueId}`)).toBeVisible({ timeout: 5000 });
    
    // Click on the service user
    await page.click(`text=${TEST_SERVICE_USER.fullName}`);
    
    // Click on the appointments tab
    await page.click('button:has-text("Appointments")');
    
    // Check that the appointments section is displayed
    await expect(page.locator('h2:has-text("Appointments")')).toBeVisible();
    
    // Check for the add appointment button
    await expect(page.locator('button:has-text("Add Appointment")')).toBeVisible();
  });
});
