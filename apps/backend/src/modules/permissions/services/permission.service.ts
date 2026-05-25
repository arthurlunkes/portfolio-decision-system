import {
  getAllPermissionsForRole,
  hasPermission,
} from "../policies/rbac.policies.js";
import {
  Action,
  PermissionCheckResult,
  PermissionContext,
  Resource,
  UserRole,
} from "../types/index.js";

/**
 * Service for checking and managing permissions
 */
export class PermissionService {
  /**
   * Check if a user has permission to perform an action on a resource
   */
  static checkPermission(
    context: PermissionContext,
    resource: Resource,
    action: Action,
  ): PermissionCheckResult {
    const granted = hasPermission(context.userRole, resource, action);

    return {
      granted,
      resource,
      action,
      reason: granted
        ? undefined
        : `User role ${context.userRole} does not have ${action} permission on ${resource}`,
    };
  }

  /**
   * Check multiple permissions at once (AND logic)
   */
  static checkPermissions(
    context: PermissionContext,
    permissions: Array<{ resource: Resource; action: Action }>,
  ): PermissionCheckResult {
    for (const perm of permissions) {
      if (!hasPermission(context.userRole, perm.resource, perm.action)) {
        return {
          granted: false,
          resource: perm.resource,
          action: perm.action,
          reason: `User role ${context.userRole} does not have required permissions`,
        };
      }
    }

    return {
      granted: true,
      resource: permissions[0].resource,
      action: permissions[0].action,
    };
  }

  /**
   * Get all permissions for a user
   */
  static getUserPermissions(
    role: UserRole,
  ): Array<{ resource: Resource; action: Action; description: string }> {
    const permissions = getAllPermissionsForRole(role);
    return permissions.map((p) => ({
      ...p,
      description: `${p.action} on ${p.resource}`,
    }));
  }

  /**
   * Check if user has access to view a resource (READ permission)
   */
  static canRead(context: PermissionContext, resource: Resource): boolean {
    return hasPermission(context.userRole, resource, Action.READ);
  }

  /**
   * Check if user has access to create a resource
   */
  static canCreate(context: PermissionContext, resource: Resource): boolean {
    return hasPermission(context.userRole, resource, Action.CREATE);
  }

  /**
   * Check if user has access to update a resource
   */
  static canUpdate(context: PermissionContext, resource: Resource): boolean {
    return hasPermission(context.userRole, resource, Action.UPDATE);
  }

  /**
   * Check if user has access to delete a resource
   */
  static canDelete(context: PermissionContext, resource: Resource): boolean {
    return hasPermission(context.userRole, resource, Action.DELETE);
  }

  /**
   * Check if user is admin
   */
  static isAdmin(context: PermissionContext): boolean {
    return context.userRole === UserRole.ADMIN;
  }

  /**
   * Check if user is decisor or higher
   */
  static isDecisomakingRole(context: PermissionContext): boolean {
    return [UserRole.ADMIN, UserRole.DECISOR].includes(context.userRole);
  }
}
