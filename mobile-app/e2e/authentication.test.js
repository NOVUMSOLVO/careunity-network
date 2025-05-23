import { device, element, by, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen as initial screen', async () => {
    await expect(element(by.text('Sign In'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should show validation errors with empty fields', async () => {
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Email is required'))).toBeVisible();
    await expect(element(by.text('Password is required'))).toBeVisible();
  });

  it('should show validation error with invalid email', async () => {
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Please enter a valid email address'))).toBeVisible();
  });

  it('should navigate to forgot password screen', async () => {
    await element(by.id('forgot-password-link')).tap();
    await expect(element(by.text('Reset Password'))).toBeVisible();
    
    // Go back to login
    await element(by.id('back-to-login-button')).tap();
    await expect(element(by.text('Sign In'))).toBeVisible();
  });
  it('should show error message with incorrect credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();
    
    // Wait for the API request to complete
    await waitFor(element(by.text('Invalid email or password')))
      .toBeVisible()
      .withTimeout(5000);
  });
  
  it('should navigate to registration screen', async () => {
    await element(by.id('register-link')).tap();
    await expect(element(by.text('Create Account'))).toBeVisible();
    
    // Go back to login
    await element(by.id('back-to-login-button')).tap();
    await expect(element(by.text('Sign In'))).toBeVisible();
  });
  
  it('should change password successfully after login', async () => {
    // This test assumes we have a test user with known credentials
    // Login first
    await element(by.id('email-input')).typeText('test@careunity.com');
    await element(by.id('password-input')).typeText('Test@123');
    await element(by.id('login-button')).tap();
    
    // Wait for dashboard to appear after successful login
    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Navigate to profile tab
    await element(by.id('profile-tab')).tap();
    
    // Go to settings
    await element(by.id('settings-button')).tap();
    
    // Tap on Change Password
    await element(by.text('Change Password')).tap();
    
    // Fill out the form
    await element(by.id('current-password-input')).typeText('Test@123');
    await element(by.id('new-password-input')).typeText('NewTest@123');
    await element(by.id('confirm-password-input')).typeText('NewTest@123');
    
    // Submit
    await element(by.id('change-password-button')).tap();
    
    // Should see success message
    await waitFor(element(by.text('Password updated successfully')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Should return to settings after a moment
    await waitFor(element(by.text('Settings')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Logout to test new password
    await element(by.id('settings-screen')).scrollTo('bottom');
    await element(by.id('logout-button')).tap();
    await element(by.text('Logout')).tap();
    
    // Wait for login screen
    await waitFor(element(by.text('Sign In')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Login with new password
    await element(by.id('email-input')).typeText('test@careunity.com');
    await element(by.id('password-input')).typeText('NewTest@123');
    await element(by.id('login-button')).tap();
    
    // Should login successfully
    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Reset password back for future tests
    await element(by.id('profile-tab')).tap();
    await element(by.id('settings-button')).tap();
    await element(by.text('Change Password')).tap();
    
    await element(by.id('current-password-input')).typeText('NewTest@123');
    await element(by.id('new-password-input')).typeText('Test@123');
    await element(by.id('confirm-password-input')).typeText('Test@123');
    
    await element(by.id('change-password-button')).tap();
    
    await waitFor(element(by.text('Password updated successfully')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should login successfully with correct credentials', async () => {
    await element(by.id('email-input')).clearText();
    await element(by.id('email-input')).typeText('carer@careunity.com');
    await element(by.id('password-input')).clearText();
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('login-button')).tap();
    
    // Wait for dashboard to appear after successful login
    await waitFor(element(by.text('Dashboard')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Verify we're on the dashboard
    await expect(element(by.text('Today\'s Visits'))).toBeVisible();
  });
  
  it('should navigate to profile and logout', async () => {
    // Navigate to profile
    await element(by.id('tab-profile')).tap();
    await expect(element(by.text('Profile'))).toBeVisible();
    
    // Scroll to the bottom to find logout button
    await element(by.id('profile-scroll-view')).scrollTo('bottom');
    await element(by.id('logout-button')).tap();
    
    // Confirm logout
    await element(by.text('Logout')).tap();
    
    // Verify we're back at login screen
    await expect(element(by.text('Sign In'))).toBeVisible();
  });
});
