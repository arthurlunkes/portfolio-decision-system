import { gql } from "./client";
import type { Action, Resource } from "./permissions";

export interface RolePermission {
  resource: Resource;
  action: Action;
}

export interface CustomRole {
  id: string;
  name: string;
  label: string;
  description: string;
  permissions: RolePermission[];
  isSystem: boolean; // true = não pode deletar
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  label: string;
  description: string;
  permissions: RolePermission[];
}

export interface UpdateRoleInput {
  label?: string;
  description?: string;
  permissions?: RolePermission[];
}

/**
 * Get all roles (including custom ones)
 */
export async function getAllRoles(): Promise<CustomRole[]> {
  const data = await gql<{ allRoles: CustomRole[] }>(
    `query { 
      allRoles { 
        id name label description 
        permissions { resource action } 
        isSystem createdAt updatedAt 
      } 
    }`,
  );
  return data.allRoles;
}

/**
 * Get a specific role with all details
 */
export async function getRole(roleId: string): Promise<CustomRole> {
  const data = await gql<{ role: CustomRole }>(
    `query($id: ID!) { 
      role(id: $id) { 
        id name label description 
        permissions { resource action } 
        isSystem createdAt updatedAt 
      } 
    }`,
    { id: roleId },
  );
  return data.role;
}

/**
 * Create a new role
 */
export async function createRole(input: CreateRoleInput): Promise<CustomRole> {
  const data = await gql<{ createRole: CustomRole }>(
    `mutation($input: CreateRoleInput!) { 
      createRole(input: $input) { 
        id name label description 
        permissions { resource action } 
        isSystem createdAt updatedAt 
      } 
    }`,
    { input },
  );
  return data.createRole;
}

/**
 * Update a role
 */
export async function updateRole(
  roleId: string,
  input: UpdateRoleInput,
): Promise<CustomRole> {
  const data = await gql<{ updateRole: CustomRole }>(
    `mutation($id: ID!, $input: UpdateRoleInput!) { 
      updateRole(id: $id, input: $input) { 
        id name label description 
        permissions { resource action } 
        isSystem createdAt updatedAt 
      } 
    }`,
    { id: roleId, input },
  );
  return data.updateRole;
}

/**
 * Delete a role (only custom roles)
 */
export async function deleteRole(roleId: string): Promise<boolean> {
  const data = await gql<{ deleteRole: boolean }>(
    `mutation($id: ID!) { 
      deleteRole(id: $id) 
    }`,
    { id: roleId },
  );
  return data.deleteRole;
}

/**
 * Clone a role
 */
export async function cloneRole(
  roleId: string,
  newName: string,
): Promise<CustomRole> {
  const data = await gql<{ cloneRole: CustomRole }>(
    `mutation($id: ID!, $newName: String!) { 
      cloneRole(id: $id, newName: $newName) { 
        id name label description 
        permissions { resource action } 
        isSystem createdAt updatedAt 
      } 
    }`,
    { id: roleId, newName },
  );
  return data.cloneRole;
}

/**
 * Get available resources and actions
 */
export interface AvailablePermissions {
  resources: Resource[];
  actions: Action[];
  actionLabels: Record<Action, string>;
  resourceLabels: Record<Resource, string>;
}

const DEFAULT_ACTION_LABELS: Record<Action, string> = {
  CREATE: "Criar",
  READ: "Ler",
  UPDATE: "Atualizar",
  DELETE: "Deletar",
  EXPORT: "Exportar",
  VIEW_RESULTS: "Ver Resultados",
  MANAGE_USERS: "Gerenciar Usuários",
  MANAGE_PERMISSIONS: "Gerenciar Permissões",
};

const DEFAULT_RESOURCE_LABELS: Record<Resource, string> = {
  PROJECTS: "Projetos",
  CRITERIA: "Critérios",
  EVALUATIONS: "Avaliações",
  RESULTS: "Resultados",
  USERS: "Usuários",
  PERMISSIONS: "Permissões",
};

export async function getAvailablePermissions(): Promise<AvailablePermissions> {
  const data = await gql<{
    availablePermissions: { resources: Resource[]; actions: Action[] };
  }>(
    `query { 
      availablePermissions { 
        resources 
        actions 
      } 
    }`,
  );

  return {
    ...data.availablePermissions,
    actionLabels: DEFAULT_ACTION_LABELS,
    resourceLabels: DEFAULT_RESOURCE_LABELS,
  };
}
