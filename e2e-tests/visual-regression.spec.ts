import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for the CareUnity application
 * These tests capture screenshots of key pages and compare them to baseline images
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

/**
 * Login helper function
 */
async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

/**
 * Public Pages Visual Tests
 */
test.describe('Public Pages Visual Tests', () => {
  test('landing page should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05, // Allow 5% difference
    });
  });
  
  test('login page should match snapshot', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the login form
    await expect(page.locator('.login-form')).toHaveScreenshot('login-form.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
  
  test('registration page should match snapshot', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the registration form
    await expect(page.locator('.registration-form')).toHaveScreenshot('registration-form.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});

/**
 * User Dashboard Visual Tests
 */
test.describe('User Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });
  
  test('user dashboard should match snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the dashboard
    await expect(page).toHaveScreenshot('user-dashboard.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
  
  test('profile page should match snapshot', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the profile page
    await expect(page).toHaveScreenshot('user-profile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
  
  test('calendar view should match snapshot', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the calendar
    await expect(page.locator('.calendar-container')).toHaveScreenshot('calendar-view.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});

/**
 * Admin Dashboard Visual Tests
 */
test.describe('Admin Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
  });
  
  test('admin dashboard should match snapshot', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the admin dashboard
    await expect(page).toHaveScreenshot('admin-dashboard.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
  
  test('user management page should match snapshot', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the user management page
    await expect(page).toHaveScreenshot('user-management.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
  
  test('care allocation page should match snapshot', async ({ page }) => {
    await page.goto('/admin/care-allocation');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the care allocation page
    await expect(page).toHaveScreenshot('care-allocation.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
  
  test('reports page should match snapshot', async ({ page }) => {
    await page.goto('/admin/reports');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the reports page
    await expect(page).toHaveScreenshot('reports-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});

/**
 * Mobile Responsive Visual Tests
 */
test.describe('Mobile Responsive Visual Tests', () => {
  // Use iPhone 12 viewport
  test.use({ viewport: { width: 390, height: 844 } });
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });
  
  test('mobile dashboard should match snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the mobile dashboard
    await expect(page).toHaveScreenshot('mobile-dashboard.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
  
  test('mobile navigation menu should match snapshot', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Open mobile navigation menu
    await page.click('.mobile-menu-button');
    
    // Take screenshot of the mobile navigation menu
    await expect(page.locator('.mobile-navigation')).toHaveScreenshot('mobile-navigation.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
