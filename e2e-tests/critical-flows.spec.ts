import { test, expect } from '@playwright/test';

/**
 * End-to-end tests for critical user flows in the CareUnity application
 */

// Test user credentials
const TEST_USER = {
  email: 'test-user@careunity.example',
  password: 'TestPassword123!',
};

// Test admin credentials
const TEST_ADMIN = {
  email: 'test-admin@careunity.example',
  password: 'AdminPassword123!',
};

// Test family member credentials
const TEST_FAMILY = {
  email: 'test-family@careunity.example',
  password: 'FamilyPassword123!',
};

/**
 * User Registration and Authentication Flow
 */
test.describe('User Registration and Authentication', () => {
  test('should allow a new user to register', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill out registration form with unique email
    const uniqueEmail = `test-user-${Date.now()}@careunity.example`;
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify successful registration
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.user-welcome')).toContainText('Test User');
  });
  
  test('should allow a user to log in', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill out login form
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.user-profile')).toBeVisible();
  });
  
  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill out login form with invalid credentials
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', 'WrongPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });
});

/**
 * Care Allocation Workflow
 */
test.describe('Care Allocation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('should allow admin to create a new care allocation', async ({ page }) => {
    // Navigate to care allocation page
    await page.goto('/care-allocation');
    
    // Click on create new allocation button
    await page.click('button:has-text("New Allocation")');
    
    // Fill out allocation form
    await page.fill('input[name="title"]', 'Test Allocation');
    await page.selectOption('select[name="serviceUser"]', { label: 'John Doe' });
    await page.selectOption('select[name="caregiver"]', { label: 'Jane Smith' });
    await page.fill('input[name="startDate"]', '2023-12-01');
    await page.fill('input[name="endDate"]', '2023-12-31');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify allocation was created
    await expect(page.locator('.allocation-list')).toContainText('Test Allocation');
  });
  
  test('should allow admin to edit an existing allocation', async ({ page }) => {
    // Navigate to care allocation page
    await page.goto('/care-allocation');
    
    // Find and click on the first allocation
    await page.click('.allocation-item:first-child .edit-button');
    
    // Update allocation details
    await page.fill('input[name="title"]', 'Updated Allocation');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify allocation was updated
    await expect(page.locator('.allocation-list')).toContainText('Updated Allocation');
  });
});

/**
 * Family Portal Interactions
 */
test.describe('Family Portal Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as family member
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_FAMILY.email);
    await page.fill('input[name="password"]', TEST_FAMILY.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/family-portal');
  });
  
  test('should allow family member to view care plan', async ({ page }) => {
    // Navigate to care plan page
    await page.click('a:has-text("Care Plan")');
    
    // Verify care plan is visible
    await expect(page.locator('.care-plan-details')).toBeVisible();
  });
  
  test('should allow family member to send a message', async ({ page }) => {
    // Navigate to messages page
    await page.click('a:has-text("Messages")');
    
    // Click on new message button
    await page.click('button:has-text("New Message")');
    
    // Fill out message form
    await page.fill('textarea[name="message"]', 'This is a test message from the family portal');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify message was sent
    await expect(page.locator('.message-sent-confirmation')).toBeVisible();
  });
});

/**
 * Administrative Dashboard Operations
 */
test.describe('Administrative Dashboard Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('should display key metrics on admin dashboard', async ({ page }) => {
    // Verify dashboard components are visible
    await expect(page.locator('.metrics-panel')).toBeVisible();
    await expect(page.locator('.active-caregivers')).toBeVisible();
    await expect(page.locator('.pending-allocations')).toBeVisible();
  });
  
  test('should allow admin to manage users', async ({ page }) => {
    // Navigate to user management page
    await page.click('a:has-text("User Management")');
    
    // Verify user list is visible
    await expect(page.locator('.user-list')).toBeVisible();
    
    // Click on add user button
    await page.click('button:has-text("Add User")');
    
    // Fill out user form
    const uniqueEmail = `new-user-${Date.now()}@careunity.example`;
    await page.fill('input[name="name"]', 'New Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.selectOption('select[name="role"]', { label: 'Caregiver' });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify user was added
    await expect(page.locator('.user-list')).toContainText('New Test User');
  });
});
