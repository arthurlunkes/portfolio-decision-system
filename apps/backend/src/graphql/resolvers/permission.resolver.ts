import prisma from "../../core/config/database.config.js";
import {
  hasPermission,
  Action as PermissionAction,
  Resource as PermissionResource,
  UserRole as PermissionUserRole,
  ROLE_PERMISSIONS,
} from "../../modules/permissions/index.js";
import { requireAdmin, requireAuth, type Context } from "../context.js";

const SYSTEM_ROLE_ORDER: PermissionUserRole[] = [
  PermissionUserRole.ADMIN,
  PermissionUserRole.DECISOR,
  PermissionUserRole.ANALYST,
  PermissionUserRole.VIEWER,
];

function toPermissionUserRole(role: string): PermissionUserRole {
  if (role in ROLE_PERMISSIONS) {
    return role as PermissionUserRole;
  }
  throw new Error(`Unsupported user role: ${role}`);
}

async function buildPermissionStats() {
  const users = await prisma.user.findMany({
    select: { name: true, role: true },
  });
  const usersByRole = { ADMIN: 0, DECISOR: 0, ANALYST: 0, VIEWER: 0 };
  users.forEach((user) => {
    if (user.role in usersByRole) {
      usersByRole[user.role as keyof typeof usersByRole] += 1;
    }
  });
  return {
    totalUsers: users.length,
    usersByRole,
    totalPermissions: SYSTEM_ROLE_ORDER.reduce(
      (total, role) => total + ROLE_PERMISSIONS[role].permissions.length,
      0,
    ),
    adminUsers: users.filter((u) => u.role === "ADMIN").map((u) => u.name),
  };
}

export const permissionResolvers = {
  Query: {
    rolePermissions: (
      _: unknown,
      { role }: { role: PermissionUserRole },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const definition = ROLE_PERMISSIONS[role];
      return {
        role,
        description: definition.description,
        permissions: definition.permissions,
      };
    },
    allRolePermissions: (_: unknown, __: unknown, ctx: Context) => {
      requireAdmin(ctx);
      return SYSTEM_ROLE_ORDER.map((role) => ({
        role,
        description: ROLE_PERMISSIONS[role].description,
        permissions: ROLE_PERMISSIONS[role].permissions,
      }));
    },
    userPermissions: (_: unknown, __: unknown, ctx: Context) => {
      const user = requireAuth(ctx);
      const role = toPermissionUserRole(user.role);
      return ROLE_PERMISSIONS[role].permissions;
    },
    checkPermission: (
      _: unknown,
      {
        resource,
        action,
      }: { resource: PermissionResource; action: PermissionAction },
      ctx: Context,
    ) => {
      const user = requireAuth(ctx);
      const role = toPermissionUserRole(user.role);
      const granted = hasPermission(role, resource, action);
      return {
        granted,
        resource,
        action,
        reason: granted
          ? undefined
          : `User role ${role} does not have ${action} on ${resource}`,
      };
    },
    permissionStats: async (_: unknown, __: unknown, ctx: Context) => {
      requireAdmin(ctx);
      return buildPermissionStats();
    },
  },
};
