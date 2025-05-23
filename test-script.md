# CareUnity Network Application Test Script

This document provides a step-by-step guide for testing all routes and interactive elements in the CareUnity Network application.

## Prerequisites
- Application running on localhost:5175
- Test user credentials available
- Test service user data available

## 1. Authentication Testing

### 1.1 Landing Page
1. Navigate to http://localhost:5175/
2. Verify the landing page loads with CareUnity branding
3. Verify "Login" and "Register" buttons are visible
4. Verify page is responsive on different screen sizes

### 1.2 Login Functionality
1. Click the "Login" button
2. Verify login form appears with username/email and password fields
3. Test form validation:
   - Submit empty form and verify error messages
   - Submit invalid email format and verify error message
   - Submit valid email but no password and verify error message
4. Enter valid credentials and submit
5. Verify successful login and redirection to dashboard

### 1.3 Registration Functionality
1. Navigate back to landing page
2. Click the "Register" button
3. Verify registration form appears with required fields
4. Test form validation:
   - Submit empty form and verify error messages
   - Submit mismatched passwords and verify error message
   - Submit invalid email format and verify error message
5. Enter valid registration information and submit
6. Verify successful registration and redirection to dashboard or confirmation page

### 1.4 Authentication Persistence
1. After successful login, refresh the page
2. Verify user remains logged in
3. Navigate to different pages and back
4. Verify authentication state is maintained

## 2. Navigation Testing

### 2.1 Sidebar Navigation
1. Verify sidebar is visible on desktop view
2. Click each navigation item and verify correct page loads:
   - Dashboard
   - Service Users
   - Calendar
   - Care Plans
   - Care Allocation
   - CQC Compliance
   - Reports
   - Incident Reporting
   - Staff Management
   - Messages
   - Settings
   - Advanced features (Family Portal, Route Optimizer, etc.)
3. Verify active navigation item is highlighted

### 2.2 Mobile Navigation
1. Resize browser to mobile width or use device emulation
2. Verify hamburger menu icon appears
3. Click hamburger menu and verify sidebar opens
4. Test each navigation item in mobile view
5. Verify sidebar closes after selection
6. Verify bottom navigation bar appears on mobile with key actions

### 2.3 Breadcrumb Navigation
1. Navigate to a nested page (e.g., Service User > Details)
2. Verify breadcrumb shows correct path
3. Click on breadcrumb items and verify navigation works

## 3. Dashboard Testing

### 3.1 Dashboard Overview
1. Navigate to Dashboard
2. Verify all dashboard components load:
   - Metric cards
   - Charts and graphs
   - Recent activity
   - Alerts section
3. Verify data is displayed correctly in all components

### 3.2 Dashboard Tabs
1. Verify all tabs are present:
   - Allocation
   - Alerts
   - AI Insights
   - Medication
2. Click each tab and verify content changes
3. Verify interactive elements within each tab:
   - Buttons
   - Filters
   - Sorting options
   - Action items

### 3.3 Dashboard Actions
1. Test "Refresh" buttons on dashboard components
2. Test any filter or date range selectors
3. Test action buttons (e.g., "View Details", "Respond")
4. Verify charts are interactive if applicable

## 4. Service User Management Testing

### 4.1 Service User Listing
1. Navigate to Service Users page
2. Verify list of service users loads
3. Test pagination if available
4. Test sorting by different columns
5. Test filtering options

### 4.2 Service User Details
1. Click on a service user from the list
2. Verify details page loads with correct information:
   - Personal details
   - Care plan summary
   - Medical information
   - Contact details
   - Activity history
3. Test tabs within service user details if available

### 4.3 Service User Creation
1. Click "Add Service User" or equivalent button
2. Verify form loads with all required fields
3. Test form validation
4. Submit valid information
5. Verify new service user appears in the list

### 4.4 Service User Editing
1. Navigate to an existing service user's details
2. Click "Edit" or equivalent button
3. Modify information and save
4. Verify changes are reflected in the details view

## 5. Care Plan Testing

### 5.1 Care Plan Listing
1. Navigate to Care Plans page
2. Verify list of care plans loads
3. Test filtering and sorting options

### 5.2 Care Plan Details
1. Click on a care plan from the list
2. Verify details page loads with correct information:
   - Plan overview
   - Goals and objectives
   - Tasks and activities
   - Progress indicators
   - Review dates

### 5.3 Care Plan Creation
1. Click "Create Care Plan" or equivalent button
2. Verify form loads with all required sections
3. Test form validation
4. Submit valid information
5. Verify new care plan appears in the list

### 5.4 Task Management
1. Within a care plan, test adding a new task
2. Test marking tasks as complete
3. Test editing existing tasks
4. Verify progress indicators update correctly

## 6. Calendar and Scheduling Testing

### 6.1 Calendar View
1. Navigate to Calendar page
2. Verify calendar loads with correct date range
3. Verify appointments/events are displayed
4. Test navigation between days/weeks/months

### 6.2 Appointment Creation
1. Click on a time slot or "Add Appointment" button
2. Verify appointment form appears
3. Test form validation
4. Create appointment with valid information
5. Verify appointment appears on calendar

### 6.3 Appointment Management
1. Click on an existing appointment
2. Verify details popup or page appears
3. Test editing the appointment
4. Test deleting the appointment
5. Verify changes reflect on calendar

## 7. Advanced Features Testing

### 7.1 Family Portal
1. Navigate to Family Portal
2. Verify portal loads with service user information
3. Test interactive elements specific to family portal

### 7.2 Route Optimizer
1. Navigate to Route Optimizer
2. Verify map and route planning interface loads
3. Test creating a new route
4. Test optimizing an existing route
5. Verify route visualization on map

### 7.3 Community Resources
1. Navigate to Community Resources
2. Verify resource directory loads
3. Test search and filtering functionality
4. Click on a resource to view details
5. Test referral process if available

## 8. API Testing

### 8.1 Health Check
1. Test API health check endpoint
2. Verify successful response

### 8.2 User API
1. Test GET /api/user endpoint
2. Verify correct user information is returned

### 8.3 Service User API
1. Test GET /api/service-users endpoint
2. Verify list of service users is returned

## 9. Error Handling Testing

### 9.1 404 Page
1. Navigate to a non-existent route
2. Verify 404 page displays correctly
3. Verify navigation options on 404 page work

### 9.2 Network Error Handling
1. Simulate offline state (disable network in dev tools)
2. Perform actions that require network
3. Verify appropriate error messages are shown
4. Verify offline indicator appears if implemented

## Conclusion
This test script covers the main functionality of the CareUnity Network application. Follow these steps systematically to ensure all routes and interactive elements are responding correctly.
