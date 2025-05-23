import { Page } from '@playwright/test';

/**
 * User roles for testing
 */
export type UserRole = 'admin' | 'coordinator' | 'caregiver' | 'serviceUser' | 'family';

/**
 * Test user credentials
 */
const TEST_USERS = {
  admin: {
    email: 'admin@careunity.com',
    password: 'password123'
  },
  coordinator: {
    email: 'coordinator@careunity.com',
    password: 'password123'
  },
  caregiver: {
    email: 'caregiver@careunity.com',
    password: 'password123'
  },
  serviceUser: {
    email: 'serviceuser@careunity.com',
    password: 'password123'
  },
  family: {
    email: 'family@careunity.com',
    password: 'password123'
  }
};

/**
 * Login as a specific user role
 * @param page Playwright page
 * @param role User role to login as
 */
export async function loginAsUser(page: Page, role: UserRole): Promise<void> {
  const user = TEST_USERS[role];
  
  // Navigate to login page
  await page.goto('/login');
  
  // Fill login form
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  
  // Submit form
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Wait for navigation to complete
  await page.waitForURL(/.*dashboard/);
}

/**
 * Logout the current user
 * @param page Playwright page
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu
  await page.getByRole('button', { name: 'User menu' }).click();
  
  // Click logout
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  
  // Wait for navigation to login page
  await page.waitForURL(/.*login/);
}

/**
 * Create a test session with authentication token
 * This is faster than UI login for tests that don't need to test the login flow
 * @param page Playwright page
 * @param role User role
 */
export async function createAuthenticatedSession(page: Page, role: UserRole): Promise<void> {
  // Get auth token (in a real app, this would be done via API)
  const token = 'mock-jwt-token-for-testing';
  
  // Set localStorage with auth token
  await page.evaluate((token) => {
    localStorage.setItem('auth_token', token);
  }, token);
  
  // Navigate to a page to apply the token
  await page.goto('/dashboard');
}
