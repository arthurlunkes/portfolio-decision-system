/**
 * Resource types in the system
 */
export enum Resource {
  PROJECTS = "PROJECTS",
  CRITERIA = "CRITERIA",
  EVALUATIONS = "EVALUATIONS",
  RESULTS = "RESULTS",
  USERS = "USERS",
  PERMISSIONS = "PERMISSIONS",
}

/**
 * Possible actions on resources
 */
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

/**
 * User roles
 */
export enum UserRole {
  ADMIN = "ADMIN",
  DECISOR = "DECISOR",
  VIEWER = "VIEWER",
  ANALYST = "ANALYST",
}

/**
 * Permission definition: what can be done with which resource
 */
export interface Permission {
  resource: Resource;
  action: Action;
  description: string;
}

/**
 * Role definition: permissions assigned to a role
 */
export interface RoleDefinition {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

/**
 * Context for permission checking
 */
export interface PermissionContext {
  userId: string;
  userRole: UserRole;
  email: string;
}

/**
 * Result of permission check
 */
export interface PermissionCheckResult {
  granted: boolean;
  resource: Resource;
  action: Action;
  reason?: string;
}
