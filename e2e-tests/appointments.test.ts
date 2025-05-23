/**
 * End-to-End Tests for Appointment Management
 * 
 * Tests the appointment management functionality including:
 * - Viewing appointments
 * - Creating appointments
 * - Editing appointments
 * - Completing appointments
 * - Rescheduling appointments
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
};

// Helper function to get tomorrow's date in YYYY-MM-DD format
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Helper function to get a time 2 hours from now in HH:MM format
const getFutureTime = (hoursFromNow = 2) => {
  const future = new Date();
  future.setHours(future.getHours() + hoursFromNow);
  return `${future.getHours().toString().padStart(2, '0')}:${future.getMinutes().toString().padStart(2, '0')}`;
};

const TEST_APPOINTMENT = {
  date: getTomorrowDate(),
  startTime: getFutureTime(),
  endTime: getFutureTime(3), // 1 hour appointment
  type: 'home_visit',
  notes: 'This is a test appointment created by automated tests',
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

// Helper function to navigate to appointments page
async function navigateToAppointments(page: Page) {
  await page.click('a:has-text("Appointments")');
  await expect(page).toHaveURL(/.*appointments/);
}

// Helper function to navigate to service user appointments
async function navigateToServiceUserAppointments(page: Page, serviceUserName: string) {
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
  
  // Click on the appointments tab
  await page.click('button:has-text("Appointments")');
  
  // Check that the appointments section is displayed
  await expect(page.locator('h2:has-text("Appointments")')).toBeVisible();
}

// Helper function to fill appointment form
async function fillAppointmentForm(page: Page, appointment: typeof TEST_APPOINTMENT) {
  await page.fill('input[name="date"]', appointment.date);
  await page.fill('input[name="startTime"]', appointment.startTime);
  await page.fill('input[name="endTime"]', appointment.endTime);
  await page.selectOption('select[name="type"]', appointment.type);
  await page.fill('textarea[name="notes"]', appointment.notes);
}

test.describe('Appointment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should display appointments calendar', async ({ page }) => {
    await navigateToAppointments(page);
    
    // Check that the calendar is displayed
    await expect(page.locator('.calendar-container')).toBeVisible();
    
    // Check that the calendar controls are displayed
    await expect(page.locator('button:has-text("Today")')).toBeVisible();
    await expect(page.locator('button:has-text("Day")')).toBeVisible();
    await expect(page.locator('button:has-text("Week")')).toBeVisible();
    await expect(page.locator('button:has-text("Month")')).toBeVisible();
  });

  test('should create a new appointment', async ({ page }) => {
    await navigateToServiceUserAppointments(page, TEST_SERVICE_USER.fullName);
    
    // Click on the add appointment button
    await page.click('button:has-text("Add Appointment")');
    
    // Check that the form is displayed
    await expect(page.locator('h2:has-text("Add Appointment")')).toBeVisible();
    
    // Fill the form
    await fillAppointmentForm(page, TEST_APPOINTMENT);
    
    // Submit the form
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Appointment created successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the new appointment is in the list
    await expect(page.locator(`text=${TEST_APPOINTMENT.date}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_APPOINTMENT.startTime}`)).toBeVisible();
  });

  test('should view appointment details', async ({ page }) => {
    await navigateToServiceUserAppointments(page, TEST_SERVICE_USER.fullName);
    
    // Click on the appointment
    await page.click(`text=${TEST_APPOINTMENT.date} >> xpath=../.. >> text=${TEST_APPOINTMENT.startTime}`);
    
    // Check that the appointment details are displayed
    await expect(page.locator(`text=${TEST_APPOINTMENT.date}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_APPOINTMENT.startTime}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_APPOINTMENT.endTime}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_APPOINTMENT.type}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_APPOINTMENT.notes}`)).toBeVisible();
  });

  test('should edit appointment details', async ({ page }) => {
    await navigateToServiceUserAppointments(page, TEST_SERVICE_USER.fullName);
    
    // Click on the appointment
    await page.click(`text=${TEST_APPOINTMENT.date} >> xpath=../.. >> text=${TEST_APPOINTMENT.startTime}`);
    
    // Click on the edit button
    await page.click('button:has-text("Edit")');
    
    // Update the appointment details
    const updatedNotes = 'These are updated notes for the test appointment';
    await page.fill('textarea[name="notes"]', updatedNotes);
    
    // Save the changes
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Appointment updated successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the updated details are displayed
    await expect(page.locator(`text=${updatedNotes}`)).toBeVisible();
  });

  test('should reschedule an appointment', async ({ page }) => {
    await navigateToServiceUserAppointments(page, TEST_SERVICE_USER.fullName);
    
    // Click on the appointment
    await page.click(`text=${TEST_APPOINTMENT.date} >> xpath=../.. >> text=${TEST_APPOINTMENT.startTime}`);
    
    // Click on the reschedule button
    await page.click('button:has-text("Reschedule")');
    
    // Update the appointment date and time
    const newDate = getTomorrowDate(); // Use tomorrow's date
    const newStartTime = getFutureTime(4); // 4 hours from now
    const newEndTime = getFutureTime(5); // 5 hours from now
    
    await page.fill('input[name="date"]', newDate);
    await page.fill('input[name="startTime"]', newStartTime);
    await page.fill('input[name="endTime"]', newEndTime);
    
    // Save the changes
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Appointment rescheduled successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the updated details are displayed
    await expect(page.locator(`text=${newDate}`)).toBeVisible();
    await expect(page.locator(`text=${newStartTime}`)).toBeVisible();
  });

  test('should start an appointment', async ({ page }) => {
    await navigateToAppointments(page);
    
    // Click on the appointment in the calendar
    await page.click(`text=${TEST_SERVICE_USER.fullName}`);
    
    // Click on the start button
    await page.click('button:has-text("Start Appointment")');
    
    // Check that the appointment is started
    await expect(page.locator('text=Appointment started')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Complete Appointment")')).toBeVisible();
  });

  test('should complete an appointment', async ({ page }) => {
    await navigateToAppointments(page);
    
    // Click on the appointment in the calendar
    await page.click(`text=${TEST_SERVICE_USER.fullName}`);
    
    // If the appointment is not started, start it
    if (await page.locator('button:has-text("Start Appointment")').isVisible()) {
      await page.click('button:has-text("Start Appointment")');
      await expect(page.locator('text=Appointment started')).toBeVisible({ timeout: 5000 });
    }
    
    // Click on the complete button
    await page.click('button:has-text("Complete Appointment")');
    
    // Add completion notes
    await page.fill('textarea[name="completionNotes"]', 'Appointment completed successfully');
    
    // Submit the form
    await page.click('button:has-text("Complete")');
    
    // Check for success message
    await expect(page.locator('text=Appointment completed successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the appointment is marked as completed
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('should cancel an appointment', async ({ page }) => {
    // Create a new appointment to cancel
    await navigateToServiceUserAppointments(page, TEST_SERVICE_USER.fullName);
    
    // Click on the add appointment button
    await page.click('button:has-text("Add Appointment")');
    
    // Fill the form with a new appointment
    const cancelAppointment = {
      ...TEST_APPOINTMENT,
      date: getTomorrowDate(),
      startTime: getFutureTime(6),
      endTime: getFutureTime(7),
    };
    
    await fillAppointmentForm(page, cancelAppointment);
    
    // Submit the form
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Appointment created successfully')).toBeVisible({ timeout: 5000 });
    
    // Click on the new appointment
    await page.click(`text=${cancelAppointment.date} >> xpath=../.. >> text=${cancelAppointment.startTime}`);
    
    // Click on the cancel button
    await page.click('button:has-text("Cancel Appointment")');
    
    // Add cancellation reason
    await page.fill('textarea[name="cancellationReason"]', 'Appointment cancelled for testing');
    
    // Confirm cancellation
    await page.click('button:has-text("Confirm Cancellation")');
    
    // Check for success message
    await expect(page.locator('text=Appointment cancelled successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the appointment is marked as cancelled
    await expect(page.locator('text=Cancelled')).toBeVisible();
  });

  test('should filter appointments by type', async ({ page }) => {
    await navigateToAppointments(page);
    
    // Open the filter dropdown
    await page.click('button:has-text("Filter")');
    
    // Select the home visit filter
    await page.click('text=Home Visit');
    
    // Check that the filter is applied
    await expect(page.locator('text=Filtered by: Home Visit')).toBeVisible();
    
    // Check that only home visit appointments are displayed
    await expect(page.locator(`text=${TEST_SERVICE_USER.fullName}`)).toBeVisible();
    
    // Clear the filter
    await page.click('button:has-text("Clear Filters")');
    
    // Check that the filter is removed
    await expect(page.locator('text=Filtered by: Home Visit')).not.toBeVisible();
  });

  test('should search for appointments', async ({ page }) => {
    await navigateToAppointments(page);
    
    // Search for the test service user
    await page.fill('input[placeholder="Search appointments..."]', TEST_SERVICE_USER.fullName);
    await page.press('input[placeholder="Search appointments..."]', 'Enter');
    
    // Check that the search results include the test appointment
    await expect(page.locator(`text=${TEST_SERVICE_USER.fullName}`)).toBeVisible();
    
    // Clear the search
    await page.fill('input[placeholder="Search appointments..."]', '');
    await page.press('input[placeholder="Search appointments..."]', 'Enter');
  });
});
