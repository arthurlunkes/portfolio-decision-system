import { Action, Resource } from "@/services/api/permissions";
import type { UserRole } from "@/services/api/users";

interface Permission {
  resource: Resource;
  action: Action;
}

/**
 * Mirror of backend ROLE_PERMISSIONS
 * Keep in sync with apps/backend/src/modules/permissions/policies/rbac.policies.ts
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Projects
    { resource: Resource.PROJECTS, action: Action.CREATE },
    { resource: Resource.PROJECTS, action: Action.READ },
    { resource: Resource.PROJECTS, action: Action.UPDATE },
    { resource: Resource.PROJECTS, action: Action.DELETE },
    { resource: Resource.PROJECTS, action: Action.EXPORT },

    // Criteria
    { resource: Resource.CRITERIA, action: Action.CREATE },
    { resource: Resource.CRITERIA, action: Action.READ },
    { resource: Resource.CRITERIA, action: Action.UPDATE },
    { resource: Resource.CRITERIA, action: Action.DELETE },

    // Evaluations
    { resource: Resource.EVALUATIONS, action: Action.CREATE },
    { resource: Resource.EVALUATIONS, action: Action.READ },
    { resource: Resource.EVALUATIONS, action: Action.UPDATE },
    { resource: Resource.EVALUATIONS, action: Action.DELETE },

    // Results
    { resource: Resource.RESULTS, action: Action.VIEW_RESULTS },
    { resource: Resource.RESULTS, action: Action.EXPORT },

    // Users
    { resource: Resource.USERS, action: Action.READ },
    { resource: Resource.USERS, action: Action.CREATE },
    { resource: Resource.USERS, action: Action.UPDATE },
    { resource: Resource.USERS, action: Action.DELETE },
    { resource: Resource.USERS, action: Action.MANAGE_USERS },

    // Permissions
    { resource: Resource.PERMISSIONS, action: Action.MANAGE_PERMISSIONS },
  ],

  DECISOR: [
    // Projects
    { resource: Resource.PROJECTS, action: Action.CREATE },
    { resource: Resource.PROJECTS, action: Action.READ },
    { resource: Resource.PROJECTS, action: Action.UPDATE },
    { resource: Resource.PROJECTS, action: Action.EXPORT },

    // Criteria
    { resource: Resource.CRITERIA, action: Action.CREATE },
    { resource: Resource.CRITERIA, action: Action.READ },
    { resource: Resource.CRITERIA, action: Action.UPDATE },

    // Evaluations
    { resource: Resource.EVALUATIONS, action: Action.CREATE },
    { resource: Resource.EVALUATIONS, action: Action.READ },
    { resource: Resource.EVALUATIONS, action: Action.UPDATE },

    // Results
    { resource: Resource.RESULTS, action: Action.VIEW_RESULTS },
    { resource: Resource.RESULTS, action: Action.EXPORT },
  ],

  ANALYST: [
    // Projects
    { resource: Resource.PROJECTS, action: Action.READ },

    // Criteria
    { resource: Resource.CRITERIA, action: Action.READ },

    // Evaluations
    { resource: Resource.EVALUATIONS, action: Action.CREATE },
    { resource: Resource.EVALUATIONS, action: Action.READ },
    { resource: Resource.EVALUATIONS, action: Action.UPDATE },

    // Results
    { resource: Resource.RESULTS, action: Action.VIEW_RESULTS },
    { resource: Resource.RESULTS, action: Action.EXPORT },
  ],

  VIEWER: [
    // Projects
    { resource: Resource.PROJECTS, action: Action.READ },

    // Criteria
    { resource: Resource.CRITERIA, action: Action.READ },

    // Evaluations
    { resource: Resource.EVALUATIONS, action: Action.READ },

    // Results
    { resource: Resource.RESULTS, action: Action.VIEW_RESULTS },
    { resource: Resource.RESULTS, action: Action.EXPORT },
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Action,
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.some((p) => p.resource === resource && p.action === action);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Get all actions a role can perform on a resource
 */
export function getActionsForResourceRole(
  role: UserRole,
  resource: Resource,
): Action[] {
  return ROLE_PERMISSIONS[role]
    .filter((p) => p.resource === resource)
    .map((p) => p.action);
}
