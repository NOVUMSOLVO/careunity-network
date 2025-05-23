/**
 * User Roles Definition
 * 
 * This file defines the user roles for the CareUnity application based on
 * the Hierarchical Role-Based Access Control (RBAC) system.
 */

// User role enum values
export const userRoleValues = [
  // Administrative roles
  'system_admin',
  'regional_manager',
  'area_manager',
  'service_manager',
  'branch_manager',
  'care_coordinator',
  'supervisor',
  
  // Care staff roles
  'senior_care_worker',
  'care_worker',
  'caregiver',
  
  // Office roles
  'office_admin',
  'finance',
  'payroll',
  
  // Client roles
  'service_user',
  'family'
] as const;

// User role type
export type UserRole = typeof userRoleValues[number];

// Role hierarchy levels (lower number = higher access)
export const roleHierarchyLevels: Record<UserRole, number> = {
  // Administrative roles
  system_admin: 1,
  regional_manager: 2,
  area_manager: 2,
  service_manager: 3,
  branch_manager: 3,
  care_coordinator: 4,
  supervisor: 4,
  
  // Care staff roles
  senior_care_worker: 5,
  care_worker: 6,
  caregiver: 6,
  
  // Office roles
  office_admin: 7,
  finance: 8,
  payroll: 8,
  
  // Client roles
  service_user: 9,
  family: 9
};

// Role display names
export const roleDisplayNames: Record<UserRole, string> = {
  system_admin: 'System Administrator',
  regional_manager: 'Regional Manager',
  area_manager: 'Area Manager',
  service_manager: 'Service Manager',
  branch_manager: 'Branch Manager',
  care_coordinator: 'Care Coordinator',
  supervisor: 'Supervisor',
  senior_care_worker: 'Senior Care Worker',
  care_worker: 'Care Worker',
  caregiver: 'Caregiver',
  office_admin: 'Office Administrator',
  finance: 'Finance Staff',
  payroll: 'Payroll Staff',
  service_user: 'Service User',
  family: 'Family Member'
};

// Role categories
export enum RoleCategory {
  ADMINISTRATIVE = 'Administrative',
  CARE_STAFF = 'Care Staff',
  OFFICE = 'Office',
  CLIENT = 'Client'
}

// Map roles to categories
export const roleCategoryMap: Record<UserRole, RoleCategory> = {
  // Administrative roles
  system_admin: RoleCategory.ADMINISTRATIVE,
  regional_manager: RoleCategory.ADMINISTRATIVE,
  area_manager: RoleCategory.ADMINISTRATIVE,
  service_manager: RoleCategory.ADMINISTRATIVE,
  branch_manager: RoleCategory.ADMINISTRATIVE,
  care_coordinator: RoleCategory.ADMINISTRATIVE,
  supervisor: RoleCategory.ADMINISTRATIVE,
  
  // Care staff roles
  senior_care_worker: RoleCategory.CARE_STAFF,
  care_worker: RoleCategory.CARE_STAFF,
  caregiver: RoleCategory.CARE_STAFF,
  
  // Office roles
  office_admin: RoleCategory.OFFICE,
  finance: RoleCategory.OFFICE,
  payroll: RoleCategory.OFFICE,
  
  // Client roles
  service_user: RoleCategory.CLIENT,
  family: RoleCategory.CLIENT
};

// Legacy role mapping (for backward compatibility)
export const legacyRoleMapping: Record<string, UserRole> = {
  'admin': 'system_admin',
  'manager': 'service_manager',
  'caregiver': 'care_worker',
  'serviceuser': 'service_user',
  'family': 'family'
};

/**
 * Check if a user has permission based on role hierarchy
 * 
 * @param userRole The role of the user
 * @param requiredRole The minimum role required for access
 * @returns True if the user has permission, false otherwise
 */
export function hasRolePermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchyLevels[userRole] <= roleHierarchyLevels[requiredRole];
}

/**
 * Get all roles at or above a certain hierarchy level
 * 
 * @param level The hierarchy level
 * @returns Array of roles at or above the specified level
 */
export function getRolesAtOrAboveLevel(level: number): UserRole[] {
  return Object.entries(roleHierarchyLevels)
    .filter(([_, roleLevel]) => roleLevel <= level)
    .map(([role]) => role as UserRole);
}

/**
 * Get all roles in a specific category
 * 
 * @param category The role category
 * @returns Array of roles in the specified category
 */
export function getRolesByCategory(category: RoleCategory): UserRole[] {
  return Object.entries(roleCategoryMap)
    .filter(([_, roleCategory]) => roleCategory === category)
    .map(([role]) => role as UserRole);
}
