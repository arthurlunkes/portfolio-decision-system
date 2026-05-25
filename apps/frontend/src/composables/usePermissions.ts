import { computed, ref } from "vue";

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

export enum UserRole {
  ADMIN = "ADMIN",
  DECISOR = "DECISOR",
  VIEWER = "VIEWER",
  ANALYST = "ANALYST",
}

/**
 * Store permissions per role (mirror of backend)
 */
const ROLE_PERMISSIONS: Record<
  UserRole,
  { resource: Resource; action: Action }[]
> = {
  [UserRole.ADMIN]: [
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
  [UserRole.DECISOR]: [
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
  [UserRole.ANALYST]: [
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
  [UserRole.VIEWER]: [
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
 * Composable for managing permissions in Vue components
 *
 * @example
 * const { can, canCreate, canEdit, isAdmin, permissions } = usePermissions()
 *
 * if (can(Resource.PROJECTS, Action.DELETE)) {
 *   // Show delete button
 * }
 */
export function usePermissions() {
  const userRole = ref<UserRole | null>(null);
  const userId = ref<string | null>(null);
  const email = ref<string | null>(null);

  /**
   * Initialize permissions with user data
   */
  const initializePermissions = (
    role: UserRole,
    id: string,
    userEmail: string,
  ) => {
    userRole.value = role;
    userId.value = id;
    email.value = userEmail;
  };

  /**
   * Clear permissions (logout)
   */
  const clearPermissions = () => {
    userRole.value = null;
    userId.value = null;
    email.value = null;
  };

  /**
   * Check if user has permission for resource and action
   */
  const can = (resource: Resource, action: Action): boolean => {
    if (!userRole.value) return false;

    const rolePerms = ROLE_PERMISSIONS[userRole.value];
    return rolePerms.some(
      (perm) => perm.resource === resource && perm.action === action,
    );
  };

  /**
   * Check if user can create a resource
   */
  const canCreate = (resource: Resource): boolean => {
    return can(resource, Action.CREATE);
  };

  /**
   * Check if user can read a resource
   */
  const canRead = (resource: Resource): boolean => {
    return can(resource, Action.READ);
  };

  /**
   * Check if user can update a resource
   */
  const canUpdate = (resource: Resource): boolean => {
    return can(resource, Action.UPDATE);
  };

  /**
   * Check if user can delete a resource
   */
  const canDelete = (resource: Resource): boolean => {
    return can(resource, Action.DELETE);
  };

  /**
   * Check if user can export
   */
  const canExport = (resource: Resource): boolean => {
    return can(resource, Action.EXPORT);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = computed(() => userRole.value === UserRole.ADMIN);

  /**
   * Check if user is decision maker (ADMIN or DECISOR)
   */
  const isDecisionMaker = computed(() =>
    [UserRole.ADMIN, UserRole.DECISOR].includes(userRole.value!),
  );

  /**
   * Get all permissions for current user
   */
  const permissions = computed(() => {
    if (!userRole.value) return [];
    return ROLE_PERMISSIONS[userRole.value];
  });

  /**
   * Check if user can access a view/page
   */
  const canAccessPage = (
    requiredResource: Resource,
    requiredAction: Action,
  ): boolean => {
    return can(requiredResource, requiredAction);
  };

  return {
    // State
    userRole,
    userId,
    email,
    permissions,
    isAdmin,
    isDecisionMaker,

    // Methods
    initializePermissions,
    clearPermissions,
    can,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    canAccessPage,

    // Enums
    Resource,
    Action,
    UserRole,
  };
}
