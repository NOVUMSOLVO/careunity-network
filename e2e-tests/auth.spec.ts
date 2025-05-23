import { test, expect } from '@playwright/test';

/**
 * Authentication end-to-end tests
 */
test.describe('Authentication', () => {
  test('should allow a user to log in', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
    
    // Verify login form is displayed
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    
    // Fill in login form
    await page.getByLabel('Email').fill('test@careunity.com');
    await page.getByLabel('Password').fill('password123');
    
    // Submit the form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify successful login - should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify user is logged in
    await expect(page.getByText('Welcome')).toBeVisible();
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
    
    // Fill in login form with invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    // Submit the form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify error message is displayed
    await expect(page.getByText('Invalid email or password')).toBeVisible();
    
    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*login/);
  });
  
  test('should allow a user to log out', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@careunity.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Click on user menu
    await page.getByRole('button', { name: 'User menu' }).click();
    
    // Click logout
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });
});
