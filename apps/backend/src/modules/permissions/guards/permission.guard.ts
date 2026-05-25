import { PermissionService } from "../services/permission.service.js";
import {
  Action,
  PermissionContext,
  Resource,
  UserRole,
} from "../types/index.js";

/**
 * GraphQL Context with permission information
 */
export interface GraphQLContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  permissions?: Array<{ resource: Resource; action: Action }>;
}

/**
 * Guard for GraphQL resolvers
 * Usage: @RequirePermission(Resource.PROJECTS, Action.CREATE)
 */
export function createPermissionGuard(resource: Resource, action: Action) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const context: GraphQLContext = args[2]; // GraphQL resolver context

      if (!context.user) {
        throw new Error("Unauthorized: No user information");
      }

      const permissionContext: PermissionContext = {
        userId: context.user.id,
        userRole: context.user.role as UserRole,
        email: context.user.email,
      };

      const result = PermissionService.checkPermission(
        permissionContext,
        resource,
        action,
      );

      if (!result.granted) {
        throw new Error(`Forbidden: ${result.reason}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Helper function to verify permission in resolver logic
 */
export function verifyPermission(
  context: GraphQLContext,
  resource: Resource,
  action: Action,
): PermissionContext {
  if (!context.user) {
    throw new Error("Unauthorized: No user information");
  }

  const permissionContext: PermissionContext = {
    userId: context.user.id,
    userRole: context.user.role as UserRole,
    email: context.user.email,
  };

  const result = PermissionService.checkPermission(
    permissionContext,
    resource,
    action,
  );

  if (!result.granted) {
    throw new Error(`Forbidden: ${result.reason}`);
  }

  return permissionContext;
}

/**
 * Middleware to verify user is authenticated
 */
export function requireAuth(context: GraphQLContext): PermissionContext {
  if (!context.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return {
    userId: context.user.id,
    userRole: context.user.role as UserRole,
    email: context.user.email,
  };
}

/**
 * Middleware to verify user is admin
 */
export function requireAdmin(context: GraphQLContext): PermissionContext {
  const permContext = requireAuth(context);

  if (!PermissionService.isAdmin(permContext)) {
    throw new Error("Forbidden: Admin access required");
  }

  return permContext;
}

/**
 * Middleware to verify user has specific role(s)
 */
export function requireRole(allowedRoles: UserRole[]) {
  return function (context: GraphQLContext): PermissionContext {
    const permContext = requireAuth(context);

    if (!allowedRoles.includes(permContext.userRole)) {
      throw new Error(
        `Forbidden: Only ${allowedRoles.join(", ")} can access this resource`,
      );
    }

    return permContext;
  };
}
