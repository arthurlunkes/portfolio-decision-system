import { Action, Resource, RoleDefinition, UserRole } from "../types/index.js";

/**
 * Role-based access control policies
 * Define what each role can do
 */
export const ROLE_PERMISSIONS: Record<UserRole, RoleDefinition> = {
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    description: "Administrator - Full access to all resources",
    permissions: [
      // Projects
      {
        resource: Resource.PROJECTS,
        action: Action.CREATE,
        description: "Create new projects",
      },
      {
        resource: Resource.PROJECTS,
        action: Action.READ,
        description: "View all projects",
      },
      {
        resource: Resource.PROJECTS,
        action: Action.UPDATE,
        description: "Edit all projects",
      },
      {
        resource: Resource.PROJECTS,
        action: Action.DELETE,
        description: "Delete projects",
      },
      {
        resource: Resource.PROJECTS,
        action: Action.EXPORT,
        description: "Export projects",
      },

      // Criteria
      {
        resource: Resource.CRITERIA,
        action: Action.CREATE,
        description: "Create new criteria",
      },
      {
        resource: Resource.CRITERIA,
        action: Action.READ,
        description: "View all criteria",
      },
      {
        resource: Resource.CRITERIA,
        action: Action.UPDATE,
        description: "Edit all criteria",
      },
      {
        resource: Resource.CRITERIA,
        action: Action.DELETE,
        description: "Delete criteria",
      },

      // Evaluations
      {
        resource: Resource.EVALUATIONS,
        action: Action.CREATE,
        description: "Create evaluations",
      },
      {
        resource: Resource.EVALUATIONS,
        action: Action.READ,
        description: "View evaluations",
      },
      {
        resource: Resource.EVALUATIONS,
        action: Action.UPDATE,
        description: "Edit evaluations",
      },
      {
        resource: Resource.EVALUATIONS,
        action: Action.DELETE,
        description: "Delete evaluations",
      },

      // Results
      {
        resource: Resource.RESULTS,
        action: Action.VIEW_RESULTS,
        description: "View VIKOR results",
      },
      {
        resource: Resource.RESULTS,
        action: Action.EXPORT,
        description: "Export results",
      },

      // User management
      {
        resource: Resource.USERS,
        action: Action.READ,
        description: "View all users",
      },
      {
        resource: Resource.USERS,
        action: Action.CREATE,
        description: "Create users",
      },
      {
        resource: Resource.USERS,
        action: Action.UPDATE,
        description: "Edit users",
      },
      {
        resource: Resource.USERS,
        action: Action.DELETE,
        description: "Delete users",
      },
      {
        resource: Resource.USERS,
        action: Action.MANAGE_USERS,
        description: "Manage user roles",
      },

      // Permissions
      {
        resource: Resource.PERMISSIONS,
        action: Action.MANAGE_PERMISSIONS,
        description: "Manage permissions",
      },
    ],
  },

  [UserRole.DECISOR]: {
    role: UserRole.DECISOR,
    description:
      "Decision Maker - Can create and manage projects, criteria, and evaluations",
    permissions: [
      // Projects
      {
        resource: Resource.PROJECTS,
        action: Action.CREATE,
        description: "Create new projects",
      },
      {
        resource: Resource.PROJECTS,
        action: Action.READ,
        description: "View projects",
      },
      {
        resource: Resource.PROJECTS,
        action: Action.UPDATE,
        description: "Edit own projects",
      },
      {
        resource: Resource.PROJECTS,
        action: Action.EXPORT,
        description: "Export projects",
      },

      // Criteria
      {
        resource: Resource.CRITERIA,
        action: Action.CREATE,
        description: "Create new criteria",
      },
      {
        resource: Resource.CRITERIA,
        action: Action.READ,
        description: "View criteria",
      },
      {
        resource: Resource.CRITERIA,
        action: Action.UPDATE,
        description: "Edit criteria",
      },

      // Evaluations
      {
        resource: Resource.EVALUATIONS,
        action: Action.CREATE,
        description: "Create evaluations",
      },
      {
        resource: Resource.EVALUATIONS,
        action: Action.READ,
        description: "View evaluations",
      },
      {
        resource: Resource.EVALUATIONS,
        action: Action.UPDATE,
        description: "Edit evaluations",
      },

      // Results
      {
        resource: Resource.RESULTS,
        action: Action.VIEW_RESULTS,
        description: "View VIKOR results",
      },
      {
        resource: Resource.RESULTS,
        action: Action.EXPORT,
        description: "Export results",
      },
    ],
  },

  [UserRole.ANALYST]: {
    role: UserRole.ANALYST,
    description:
      "Analyst - Can view projects and create evaluations, but cannot modify projects or criteria",
    permissions: [
      // Projects
      {
        resource: Resource.PROJECTS,
        action: Action.READ,
        description: "View projects",
      },

      // Criteria
      {
        resource: Resource.CRITERIA,
        action: Action.READ,
        description: "View criteria",
      },

      // Evaluations
      {
        resource: Resource.EVALUATIONS,
        action: Action.CREATE,
        description: "Create evaluations",
      },
      {
        resource: Resource.EVALUATIONS,
        action: Action.READ,
        description: "View evaluations",
      },
      {
        resource: Resource.EVALUATIONS,
        action: Action.UPDATE,
        description: "Edit evaluations",
      },

      // Results
      {
        resource: Resource.RESULTS,
        action: Action.VIEW_RESULTS,
        description: "View VIKOR results",
      },
      {
        resource: Resource.RESULTS,
        action: Action.EXPORT,
        description: "Export results",
      },
    ],
  },

  [UserRole.VIEWER]: {
    role: UserRole.VIEWER,
    description: "Viewer - Read-only access to projects and results",
    permissions: [
      // Projects
      {
        resource: Resource.PROJECTS,
        action: Action.READ,
        description: "View projects",
      },

      // Criteria
      {
        resource: Resource.CRITERIA,
        action: Action.READ,
        description: "View criteria",
      },

      // Evaluations
      {
        resource: Resource.EVALUATIONS,
        action: Action.READ,
        description: "View evaluations",
      },

      // Results
      {
        resource: Resource.RESULTS,
        action: Action.VIEW_RESULTS,
        description: "View VIKOR results",
      },
      {
        resource: Resource.RESULTS,
        action: Action.EXPORT,
        description: "Export results",
      },
    ],
  },
};

/**
 * Get all permissions for a given role
 */
export function getPermissionsForRole(
  role: UserRole,
): Map<string, Set<Action>> {
  const rolePerms = ROLE_PERMISSIONS[role];
  const permissionsMap = new Map<string, Set<Action>>();

  rolePerms.permissions.forEach((perm) => {
    const key = perm.resource;
    if (!permissionsMap.has(key)) {
      permissionsMap.set(key, new Set());
    }
    permissionsMap.get(key)!.add(perm.action);
  });

  return permissionsMap;
}

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Action,
): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];
  return rolePerms.permissions.some(
    (perm) => perm.resource === resource && perm.action === action,
  );
}

/**
 * Get all permissions for a role (flat array)
 */
export function getAllPermissionsForRole(
  role: UserRole,
): Array<{ resource: Resource; action: Action }> {
  const rolePerms = ROLE_PERMISSIONS[role];
  return rolePerms.permissions.map((perm) => ({
    resource: perm.resource,
    action: perm.action,
  }));
}
