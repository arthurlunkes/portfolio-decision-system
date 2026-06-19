import type { CustomRole } from "@prisma/client";
import { randomUUID } from "node:crypto";
import prisma from "../../core/config/database.config.js";
import {
  Action as PermissionAction,
  Resource as PermissionResource,
  UserRole as PermissionUserRole,
  ROLE_PERMISSIONS,
} from "../../modules/permissions/index.js";
import { requireAdmin, requireAuth, type Context } from "../context.js";

type RolePermissionEntry = {
  resource: PermissionResource;
  action: PermissionAction;
};

const SYSTEM_ROLE_ORDER: PermissionUserRole[] = [
  PermissionUserRole.ADMIN,
  PermissionUserRole.DECISOR,
  PermissionUserRole.ANALYST,
  PermissionUserRole.VIEWER,
];

const ROLE_LABELS: Record<PermissionUserRole, string> = {
  [PermissionUserRole.ADMIN]: "Administrador",
  [PermissionUserRole.DECISOR]: "Decisor",
  [PermissionUserRole.ANALYST]: "Analista",
  [PermissionUserRole.VIEWER]: "Visualizador",
};

function getSystemRoles() {
  const epoch = new Date(0).toISOString();
  return SYSTEM_ROLE_ORDER.map((role) => {
    const definition = ROLE_PERMISSIONS[role];
    return {
      id: role,
      name: role,
      label: ROLE_LABELS[role],
      description: definition.description,
      permissions: definition.permissions.map((p) => ({
        resource: p.resource,
        action: p.action,
      })),
      isSystem: true,
      createdAt: epoch,
      updatedAt: epoch,
    };
  });
}

function parsePermissions(raw: unknown): RolePermissionEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw as RolePermissionEntry[];
}

function toShape(role: CustomRole) {
  return {
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: parsePermissions(role.permissions),
    isSystem: role.isSystem,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}

async function nameExistsInDb(name: string): Promise<boolean> {
  const row = await prisma.customRole.findUnique({ where: { name } });
  return row !== null;
}

export const roleResolvers = {
  Query: {
    allRoles: async (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      const customRoles = await prisma.customRole.findMany({
        orderBy: { createdAt: "asc" },
      });
      return [...getSystemRoles(), ...customRoles.map(toShape)];
    },
    role: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      const systemRole = getSystemRoles().find((r) => r.id === id);
      if (systemRole) return systemRole;
      const role = await prisma.customRole.findUnique({ where: { id } });
      return role ? toShape(role) : null;
    },
    availablePermissions: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return {
        resources: Object.values(PermissionResource),
        actions: Object.values(PermissionAction),
      };
    },
  },
  Mutation: {
    createRole: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          label: string;
          description: string;
          permissions: RolePermissionEntry[];
        };
      },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const name = input.name.trim().toUpperCase();
      if (!name) throw new Error("Nome do papel e obrigatorio");

      const systemNames: string[] = getSystemRoles().map((r) => r.name);
      if (systemNames.includes(name))
        throw new Error("Ja existe um papel com esse nome");
      if (await nameExistsInDb(name))
        throw new Error("Ja existe um papel com esse nome");

      const role = await prisma.customRole.create({
        data: {
          id: `custom-${randomUUID()}`,
          name,
          label: input.label.trim() || name,
          description: input.description.trim(),
          permissions: (input.permissions ?? []) as any,
        },
      });
      return toShape(role);
    },
    updateRole: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          label?: string;
          description?: string;
          permissions?: RolePermissionEntry[];
        };
      },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      if (getSystemRoles().some((r) => r.id === id))
        throw new Error("Papeis de sistema nao podem ser alterados");

      const existing = await prisma.customRole.findUnique({ where: { id } });
      if (!existing) throw new Error("Papel nao encontrado");

      const role = await prisma.customRole.update({
        where: { id },
        data: {
          ...(input.label !== undefined && { label: input.label.trim() }),
          ...(input.description !== undefined && {
            description: input.description.trim(),
          }),
          ...(input.permissions !== undefined && {
            permissions: input.permissions as any,
          }),
        },
      });
      return toShape(role);
    },
    deleteRole: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAdmin(ctx);
      if (getSystemRoles().some((r) => r.id === id))
        throw new Error("Papeis de sistema nao podem ser removidos");

      const existing = await prisma.customRole.findUnique({ where: { id } });
      if (!existing) throw new Error("Papel nao encontrado");

      await prisma.customRole.delete({ where: { id } });
      return true;
    },
    cloneRole: async (
      _: unknown,
      { id, newName }: { id: string; newName: string },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const systemRoles = getSystemRoles();
      const systemRole = systemRoles.find((r) => r.id === id);

      let sourcePermissions: RolePermissionEntry[];
      let sourceLabel: string;
      let sourceDescription: string;

      if (systemRole) {
        sourcePermissions = systemRole.permissions;
        sourceLabel = systemRole.label;
        sourceDescription = systemRole.description;
      } else {
        const custom = await prisma.customRole.findUnique({ where: { id } });
        if (!custom) throw new Error("Papel nao encontrado");
        sourcePermissions = parsePermissions(custom.permissions);
        sourceLabel = custom.label;
        sourceDescription = custom.description;
      }

      const name = newName.trim().toUpperCase();
      if (!name) throw new Error("Nome do novo papel e obrigatorio");

      const systemNames: string[] = systemRoles.map((r) => r.name);
      if (systemNames.includes(name))
        throw new Error("Ja existe um papel com esse nome");
      if (await nameExistsInDb(name))
        throw new Error("Ja existe um papel com esse nome");

      const cloned = await prisma.customRole.create({
        data: {
          id: `custom-${randomUUID()}`,
          name,
          label: `${sourceLabel} (Copia)`,
          description: sourceDescription,
          permissions: sourcePermissions as any,
        },
      });
      return toShape(cloned);
    },
  },
};
