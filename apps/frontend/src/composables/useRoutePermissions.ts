import type { Router } from "vue-router";
import { Action, Resource, usePermissions } from "./usePermissions.js";

/**
 * Route meta for permission checking
 */
export interface PermissionMeta {
  requiresAuth?: boolean;
  resource?: Resource;
  action?: Action;
  roles?: string[];
}

/**
 * Create permission guards for Vue Router
 * Usage: router.beforeEach(createPermissionGuards(permissionsComposable))
 *
 * @example
 * // In route definition
 * {
 *   path: '/projects',
 *   component: Projects,
 *   meta: {
 *     requiresAuth: true,
 *     resource: Resource.PROJECTS,
 *     action: Action.READ
 *   }
 * }
 */
export function createPermissionGuards(router: Router) {
  return router.beforeEach((to, _from, next) => {
    const { can, canAccessPage, isAdmin, userRole } = usePermissions();

    const meta = to.meta as PermissionMeta;

    // Check if authentication is required
    if (meta.requiresAuth && !userRole) {
      next({ name: "Login", query: { redirect: to.fullPath } });
      return;
    }

    // Check specific role requirements
    if (meta.roles && meta.roles.length > 0) {
      if (!userRole || !meta.roles.includes(userRole.value)) {
        next({ name: "Dashboard" });
        return;
      }
    }

    // Check resource and action permissions
    if (meta.resource && meta.action) {
      if (!can(meta.resource, meta.action)) {
        console.warn(
          `Access denied to ${to.path}. Missing ${meta.action} permission on ${meta.resource}`,
        );
        next({ name: "Dashboard" });
        return;
      }
    }

    // Check if route requires admin
    if (meta.requiresAuth && to.path.includes("/admin")) {
      if (!isAdmin.value) {
        next({ name: "Dashboard" });
        return;
      }
    }

    next();
  });
}

/**
 * Shorthand route guard helpers
 */
export function withPermission(resource: Resource, action: Action) {
  return {
    resource,
    action,
    requiresAuth: true,
  };
}

export function withRole(...roles: string[]) {
  return {
    roles,
    requiresAuth: true,
  };
}

export function withAuth() {
  return {
    requiresAuth: true,
  };
}
