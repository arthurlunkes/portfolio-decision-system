import { gql } from "./client";
import type { UserRole } from "./users";

export enum Resource {
  PROJECTS = "PROJECTS",
  CRITERIA = "CRITERIA",
  EVALUATIONS = "EVALUATIONS",
  RESULTS = "RESULTS",
  USERS = "USERS",
  PERMISSIONS = "PERMISSIONS",
}

export enum Action {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  EXPORT = "EXPORT",
  VIEW_RESULTS = "VIEW_RESULTS",
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_PERMISSIONS = "MANAGE_PERMISSIONS",
}

export interface Permission {
  resource: Resource;
  action: Action;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export interface PermissionCheckResponse {
  granted: boolean;
  resource: Resource;
  action: Action;
  reason?: string;
}

/**
 * Get all permissions for a specific role
 */
export async function getRolePermissions(
  role: UserRole,
): Promise<RolePermissions> {
  const data = await gql<{ rolePermissions: RolePermissions }>(
    `query($role: UserRole!) { rolePermissions(role: $role) { role permissions { resource action description } description } }`,
    { role },
  );
  return data.rolePermissions;
}

/**
 * Get all roles with their permissions (admin only)
 */
export async function getAllRolePermissions(): Promise<RolePermissions[]> {
  const data = await gql<{ allRolePermissions: RolePermissions[] }>(
    `query { allRolePermissions { role permissions { resource action description } description } }`,
  );
  return data.allRolePermissions;
}

/**
 * Get user permissions based on their role
 */
export async function getUserPermissions(): Promise<Permission[]> {
  const data = await gql<{ userPermissions: Permission[] }>(
    `query { userPermissions { resource action description } }`,
  );
  return data.userPermissions;
}

/**
 * Check if current user has permission (frontend validation)
 */
export async function checkPermission(
  resource: Resource,
  action: Action,
): Promise<PermissionCheckResponse> {
  const data = await gql<{ checkPermission: PermissionCheckResponse }>(
    `query($resource: Resource!, $action: Action!) { checkPermission(resource: $resource, action: $action) { granted resource action reason } }`,
    { resource, action },
  );
  return data.checkPermission;
}

/**
 * Get permission matrix for UI (resource x role matrix)
 */
export interface PermissionMatrix {
  resources: Resource[];
  roles: UserRole[];
  matrix: Record<Resource, Record<UserRole, Action[]>>;
}

export async function getPermissionMatrix(): Promise<PermissionMatrix> {
  const data = await gql<{ permissionMatrix: PermissionMatrix }>(
    `query { 
      permissionMatrix { 
        resources 
        roles 
        matrix 
      } 
    }`,
  );
  return data.permissionMatrix;
}

/**
 * Get stats about users and roles
 */
export interface PermissionStats {
  totalUsers: number;
  usersByRole: Record<UserRole, number>;
  totalPermissions: number;
  adminUsers: string[];
}

export async function getPermissionStats(): Promise<PermissionStats> {
  const data = await gql<{ permissionStats: PermissionStats }>(
    `query { 
      permissionStats { 
        totalUsers 
        usersByRole 
        totalPermissions 
        adminUsers 
      } 
    }`,
  );
  return data.permissionStats;
}
