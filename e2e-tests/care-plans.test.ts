/**
 * End-to-End Tests for Care Plan Management
 * 
 * Tests the care plan management functionality including:
 * - Viewing care plans
 * - Creating care plans
 * - Editing care plans
 * - Managing goals and tasks
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

const TEST_CARE_PLAN = {
  title: 'Test Care Plan',
  summary: 'This is a test care plan created by automated tests',
  startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
  status: 'active',
};

const TEST_GOAL = {
  title: 'Test Goal',
  description: 'This is a test goal created by automated tests',
  startDate: new Date().toISOString().split('T')[0], // Today's date
  targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  progressPercentage: 0,
};

const TEST_TASK = {
  title: 'Test Task',
  description: 'This is a test task created by automated tests',
  category: 'personal_care',
  timeOfDay: 'morning',
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

// Helper function to navigate to a specific service user
async function navigateToServiceUser(page: Page, serviceUserName: string) {
  await navigateToServiceUsers(page);
  
  // Search for the service user
  await page.fill('input[placeholder="Search service users..."]', serviceUserName);
  await page.press('input[placeholder="Search service users..."]', 'Enter');
  
  // Wait for search results
  await expect(page.locator(`text=${serviceUserName}`)).toBeVisible({ timeout: 5000 });
  
  // Click on the service user
  await page.click(`text=${serviceUserName}`);
  
  // Check that we're on the service user details page
  await expect(page.locator(`h1:has-text("${serviceUserName}")`)).toBeVisible();
}

// Helper function to navigate to care plans tab
async function navigateToCarePlans(page: Page, serviceUserName: string) {
  await navigateToServiceUser(page, serviceUserName);
  
  // Click on the care plans tab
  await page.click('button:has-text("Care Plans")');
  
  // Check that the care plans section is displayed
  await expect(page.locator('h2:has-text("Care Plans")')).toBeVisible();
}

// Helper function to fill care plan form
async function fillCarePlanForm(page: Page, carePlan: typeof TEST_CARE_PLAN) {
  await page.fill('input[name="title"]', carePlan.title);
  await page.fill('textarea[name="summary"]', carePlan.summary);
  await page.fill('input[name="startDate"]', carePlan.startDate);
  await page.fill('input[name="reviewDate"]', carePlan.reviewDate);
  await page.selectOption('select[name="status"]', carePlan.status);
}

// Helper function to fill goal form
async function fillGoalForm(page: Page, goal: typeof TEST_GOAL) {
  await page.fill('input[name="title"]', goal.title);
  await page.fill('textarea[name="description"]', goal.description);
  await page.fill('input[name="startDate"]', goal.startDate);
  await page.fill('input[name="targetDate"]', goal.targetDate);
  await page.fill('input[name="progressPercentage"]', goal.progressPercentage.toString());
}

// Helper function to fill task form
async function fillTaskForm(page: Page, task: typeof TEST_TASK) {
  await page.fill('input[name="title"]', task.title);
  await page.fill('textarea[name="description"]', task.description);
  await page.selectOption('select[name="category"]', task.category);
  await page.selectOption('select[name="timeOfDay"]', task.timeOfDay);
}

test.describe('Care Plan Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should create a new care plan', async ({ page }) => {
    await navigateToCarePlans(page, TEST_SERVICE_USER.fullName);
    
    // Click on the add care plan button
    await page.click('button:has-text("Add Care Plan")');
    
    // Check that the form is displayed
    await expect(page.locator('h2:has-text("Add Care Plan")')).toBeVisible();
    
    // Fill the form
    await fillCarePlanForm(page, TEST_CARE_PLAN);
    
    // Submit the form
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Care plan created successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the new care plan is in the list
    await expect(page.locator(`text=${TEST_CARE_PLAN.title}`)).toBeVisible();
  });

  test('should view care plan details', async ({ page }) => {
    await navigateToCarePlans(page, TEST_SERVICE_USER.fullName);
    
    // Click on the care plan
    await page.click(`text=${TEST_CARE_PLAN.title}`);
    
    // Check that we're on the care plan details page
    await expect(page.locator(`h1:has-text("${TEST_CARE_PLAN.title}")`)).toBeVisible();
    
    // Check that care plan details are displayed
    await expect(page.locator(`text=${TEST_CARE_PLAN.summary}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_CARE_PLAN.startDate}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_CARE_PLAN.reviewDate}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_CARE_PLAN.status}`)).toBeVisible();
  });

  test('should edit care plan details', async ({ page }) => {
    await navigateToCarePlans(page, TEST_SERVICE_USER.fullName);
    
    // Click on the care plan
    await page.click(`text=${TEST_CARE_PLAN.title}`);
    
    // Click on the edit button
    await page.click('button:has-text("Edit")');
    
    // Update the care plan details
    const updatedSummary = 'This is an updated summary for the test care plan';
    await page.fill('textarea[name="summary"]', updatedSummary);
    
    // Save the changes
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Care plan updated successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the updated details are displayed
    await expect(page.locator(`text=${updatedSummary}`)).toBeVisible();
  });

  test('should add a goal to a care plan', async ({ page }) => {
    await navigateToCarePlans(page, TEST_SERVICE_USER.fullName);
    
    // Click on the care plan
    await page.click(`text=${TEST_CARE_PLAN.title}`);
    
    // Click on the goals tab
    await page.click('button:has-text("Goals")');
    
    // Click on the add goal button
    await page.click('button:has-text("Add Goal")');
    
    // Check that the form is displayed
    await expect(page.locator('h2:has-text("Add Goal")')).toBeVisible();
    
    // Fill the form
    await fillGoalForm(page, TEST_GOAL);
    
    // Submit the form
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Goal created successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the new goal is in the list
    await expect(page.locator(`text=${TEST_GOAL.title}`)).toBeVisible();
  });

  test('should update goal progress', async ({ page }) => {
    await navigateToCarePlans(page, TEST_SERVICE_USER.fullName);
    
    // Click on the care plan
    await page.click(`text=${TEST_CARE_PLAN.title}`);
    
    // Click on the goals tab
    await page.click('button:has-text("Goals")');
    
    // Click on the goal
    await page.click(`text=${TEST_GOAL.title}`);
    
    // Click on the update progress button
    await page.click('button:has-text("Update Progress")');
    
    // Update the progress
    await page.fill('input[name="progressPercentage"]', '50');
    
    // Save the changes
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Progress updated successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the updated progress is displayed
    await expect(page.locator('text=50%')).toBeVisible();
  });

  test('should add a task to a care plan', async ({ page }) => {
    await navigateToCarePlans(page, TEST_SERVICE_USER.fullName);
    
    // Click on the care plan
    await page.click(`text=${TEST_CARE_PLAN.title}`);
    
    // Click on the tasks tab
    await page.click('button:has-text("Tasks")');
    
    // Click on the add task button
    await page.click('button:has-text("Add Task")');
    
    // Check that the form is displayed
    await expect(page.locator('h2:has-text("Add Task")')).toBeVisible();
    
    // Fill the form
    await fillTaskForm(page, TEST_TASK);
    
    // Submit the form
    await page.click('button:has-text("Save")');
    
    // Check for success message
    await expect(page.locator('text=Task created successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the new task is in the list
    await expect(page.locator(`text=${TEST_TASK.title}`)).toBeVisible();
  });

  test('should mark a task as completed', async ({ page }) => {
    await navigateToCarePlans(page, TEST_SERVICE_USER.fullName);
    
    // Click on the care plan
    await page.click(`text=${TEST_CARE_PLAN.title}`);
    
    // Click on the tasks tab
    await page.click('button:has-text("Tasks")');
    
    // Find the task and click the checkbox
    await page.click(`text=${TEST_TASK.title} >> xpath=../.. >> input[type="checkbox"]`);
    
    // Check for success message
    await expect(page.locator('text=Task updated successfully')).toBeVisible({ timeout: 5000 });
    
    // Check that the task is marked as completed
    await expect(page.locator(`text=${TEST_TASK.title} >> xpath=../.. >> input[type="checkbox"]:checked`)).toBeVisible();
  });

  test('should archive a care plan', async ({ page }) => {
    await navigateToCarePlans(page, TEST_SERVICE_USER.fullName);
    
    // Click on the care plan
    await page.click(`text=${TEST_CARE_PLAN.title}`);
    
    // Click on the archive button
    await page.click('button:has-text("Archive")');
    
    // Confirm the archive action
    await page.click('button:has-text("Confirm")');
    
    // Check for success message
    await expect(page.locator('text=Care plan archived successfully')).toBeVisible({ timeout: 5000 });
    
    // Go back to care plans list
    await page.click('button:has-text("Back to Care Plans")');
    
    // Check that the archived care plan is not in the active list
    await expect(page.locator(`text=${TEST_CARE_PLAN.title}`)).not.toBeVisible();
    
    // Show archived care plans
    await page.click('button:has-text("Show Archived")');
    
    // Check that the care plan is in the archived list
    await expect(page.locator(`text=${TEST_CARE_PLAN.title}`)).toBeVisible();
  });
});
