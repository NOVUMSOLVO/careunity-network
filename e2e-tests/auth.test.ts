/**
 * End-to-End Tests for Authentication Flow
 * 
 * Tests the authentication flow including:
 * - Login
 * - Registration
 * - Password reset
 * - Session management
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  fullName: 'Test User',
  username: 'testuser',
};

// Helper function to fill login form
async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
}

// Helper function to fill registration form
async function fillRegistrationForm(page: Page, user: typeof TEST_USER) {
  await page.fill('input[name="fullName"]', user.fullName);
  await page.fill('input[name="username"]', user.username);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);
}

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth');
  });

  test('should display login form', async ({ page }) => {
    // Check that login form elements are visible
    await expect(page.locator('h1:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a:has-text("Forgot password?")')).toBeVisible();
    await expect(page.locator('a:has-text("Create an account")')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill form with invalid credentials
    await fillLoginForm(page, 'invalid@example.com', 'wrongpassword');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill form with valid credentials
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check that we're redirected to the dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // Check that user info is displayed in the header
    await expect(page.locator(`text=${TEST_USER.fullName}`)).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click on the registration link
    await page.click('a:has-text("Create an account")');
    
    // Check that we're on the registration page
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1:has-text("Create Account")')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    // Navigate to registration page
    await page.click('a:has-text("Create an account")');
    
    // Generate a unique username and email
    const timestamp = Date.now();
    const newUser = {
      ...TEST_USER,
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
    };
    
    // Fill the registration form
    await fillRegistrationForm(page, newUser);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for success message or redirect
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should show validation errors on registration form', async ({ page }) => {
    // Navigate to registration page
    await page.click('a:has-text("Create an account")');
    
    // Fill form with invalid data
    await page.fill('input[name="fullName"]', 'T');  // Too short
    await page.fill('input[name="username"]', 'te');  // Too short
    await page.fill('input[name="email"]', 'invalid-email');  // Invalid email
    await page.fill('input[name="password"]', '123');  // Too short
    await page.fill('input[name="confirmPassword"]', '456');  // Doesn't match
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=Full name must be at least 2 characters')).toBeVisible();
    await expect(page.locator('text=Username must be at least 3 characters')).toBeVisible();
    await expect(page.locator('text=Invalid email address')).toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Click on the forgot password link
    await page.click('a:has-text("Forgot password?")');
    
    // Check that we're on the forgot password page
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.locator('h1:has-text("Reset Password")')).toBeVisible();
  });

  test('should send password reset email', async ({ page }) => {
    // Navigate to forgot password page
    await page.click('a:has-text("Forgot password?")');
    
    // Fill the email field
    await page.fill('input[name="email"]', TEST_USER.email);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Check for success message
    await expect(page.locator('text=Password reset email sent')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // Click on the user menu
    await page.click('button[aria-label="User menu"]');
    
    // Click on the logout button
    await page.click('button:has-text("Logout")');
    
    // Check that we're redirected to the login page
    await expect(page).toHaveURL(/.*auth/, { timeout: 5000 });
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // Refresh the page
    await page.reload();
    
    // Check that we're still on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator(`text=${TEST_USER.fullName}`)).toBeVisible();
  });

  test('should redirect to requested page after login', async ({ page }) => {
    // Try to access a protected page
    await page.goto('/service-users');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*auth/);
    
    // Login
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Should be redirected to the originally requested page
    await expect(page).toHaveURL(/.*service-users/, { timeout: 10000 });
  });
});

test.describe('Authentication API', () => {
  test('should return 401 for protected endpoints without auth', async ({ request }) => {
    const response = await request.get('/api/v2/users/me');
    expect(response.status()).toBe(401);
  });

  test('should return user data for authenticated requests', async ({ page, request }) => {
    // Login through UI to get the auth cookie
    await page.goto('/auth');
    await fillLoginForm(page, TEST_USER.email, TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load (ensures we're logged in)
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // Make an authenticated API request
    const response = await request.get('/api/v2/users/me');
    expect(response.status()).toBe(200);
    
    const userData = await response.json();
    expect(userData.email).toBe(TEST_USER.email);
  });
});
