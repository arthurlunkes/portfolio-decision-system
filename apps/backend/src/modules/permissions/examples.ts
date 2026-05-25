// Backend Permissions Module Usage Guide

import type { GraphQLContext } from "../modules/permissions/guards/permission.guard.js";
import {
  Action,
  PermissionService,
  Resource,
  UserRole,
  verifyPermission,
} from "../modules/permissions/index.js";

/**
 * EXEMPLO 1: Verificar permissão em um resolver GraphQL
 */
export const projectsResolver = {
  Query: {
    projects: async (_: any, __: any, context: GraphQLContext) => {
      // Verificar se o usuário pode ler projetos
      verifyPermission(context, Resource.PROJECTS, Action.READ);

      // Lógica para retornar projetos
      return await prisma.project.findMany();
    },

    project: async (_: any, args: { id: string }, context: GraphQLContext) => {
      // Verificar se o usuário pode ler projetos
      verifyPermission(context, Resource.PROJECTS, Action.READ);

      return await prisma.project.findUnique({ where: { id: args.id } });
    },
  },

  Mutation: {
    createProject: async (
      _: any,
      args: { name: string; description: string },
      context: GraphQLContext,
    ) => {
      // Verificar se o usuário pode criar projetos
      verifyPermission(context, Resource.PROJECTS, Action.CREATE);

      return await prisma.project.create({
        data: {
          name: args.name,
          description: args.description,
        },
      });
    },

    updateProject: async (
      _: any,
      args: { id: string; name: string; description: string },
      context: GraphQLContext,
    ) => {
      // Verificar se o usuário pode atualizar projetos
      verifyPermission(context, Resource.PROJECTS, Action.UPDATE);

      return await prisma.project.update({
        where: { id: args.id },
        data: {
          name: args.name,
          description: args.description,
        },
      });
    },

    deleteProject: async (
      _: any,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      // Verificar se o usuário pode deletar projetos
      verifyPermission(context, Resource.PROJECTS, Action.DELETE);

      return await prisma.project.delete({ where: { id: args.id } });
    },
  },
};

/**
 * EXEMPLO 2: Usar o serviço de permissões diretamente
 */
export async function handleUserManagement(context: GraphQLContext) {
  // Verificar se é admin
  if (
    !PermissionService.isAdmin({
      userId: context.user?.id!,
      userRole: context.user?.role as UserRole,
      email: context.user?.email!,
    })
  ) {
    throw new Error("Forbidden: Admin access required");
  }

  // Fazer algo de administração
}

/**
 * EXEMPLO 3: Verificar múltiplas permissões
 */
export async function complexOperation(context: GraphQLContext) {
  const permContext = {
    userId: context.user?.id!,
    userRole: context.user?.role as UserRole,
    email: context.user?.email!,
  };

  // Verificar múltiplas permissões simultaneamente
  const result = PermissionService.checkPermissions(permContext, [
    { resource: Resource.PROJECTS, action: Action.READ },
    { resource: Resource.EVALUATIONS, action: Action.CREATE },
  ]);

  if (!result.granted) {
    throw new Error(`Forbidden: ${result.reason}`);
  }
}

/**
 * EXEMPLO 4: Obter todas as permissões de um usuário
 */
export async function getUserPermissions(role: UserRole) {
  const permissions = PermissionService.getUserPermissions(role);
  return permissions;
}

/**
 * EXEMPLO 5: Helpers para verificações comuns
 */
export async function commonChecks(context: GraphQLContext) {
  const permContext = {
    userId: context.user?.id!,
    userRole: context.user?.role as UserRole,
    email: context.user?.email!,
  };

  // Verificar se pode ler projetos
  const canReadProjects = PermissionService.canRead(
    permContext,
    Resource.PROJECTS,
  );

  // Verificar se pode criar critérios
  const canCreateCriteria = PermissionService.canCreate(
    permContext,
    Resource.CRITERIA,
  );

  // Verificar se pode atualizar avaliações
  const canUpdateEvaluations = PermissionService.canUpdate(
    permContext,
    Resource.EVALUATIONS,
  );

  // Verificar se pode deletar projetos
  const canDeleteProjects = PermissionService.canDelete(
    permContext,
    Resource.PROJECTS,
  );

  // Verificar se é decisor ou superior
  const isDecisionMaker = PermissionService.isDecisomakingRole(permContext);

  return {
    canReadProjects,
    canCreateCriteria,
    canUpdateEvaluations,
    canDeleteProjects,
    isDecisionMaker,
  };
}

/**
 * EXEMPLO 6: Middleware para proteger todos os resolvers de um tipo
 */
export const usersResolver = {
  Query: {
    users: async (_: any, __: any, context: GraphQLContext) => {
      // Apenas admins podem ver todos os usuários
      if (context.user?.role !== UserRole.ADMIN) {
        throw new Error(
          "Forbidden: Only administrators can access this resource",
        );
      }

      return await prisma.user.findMany();
    },

    user: async (_: any, args: { id: string }, context: GraphQLContext) => {
      const permContext = {
        userId: context.user?.id!,
        userRole: context.user?.role as UserRole,
        email: context.user?.email!,
      };

      // Admin pode ver qualquer usuário, outros podem ver apenas a si mesmos
      if (
        !PermissionService.isAdmin(permContext) &&
        args.id !== context.user?.id
      ) {
        throw new Error("Forbidden: You can only view your own profile");
      }

      return await prisma.user.findUnique({ where: { id: args.id } });
    },
  },

  Mutation: {
    updateUser: async (
      _: any,
      args: { id: string; name: string; email: string },
      context: GraphQLContext,
    ) => {
      // Admin pode editar qualquer usuário, outros podem editar apenas a si mesmos
      if (
        context.user?.role !== UserRole.ADMIN &&
        args.id !== context.user?.id
      ) {
        throw new Error("Forbidden: You can only update your own profile");
      }

      return await prisma.user.update({
        where: { id: args.id },
        data: { name: args.name, email: args.email },
      });
    },

    changeUserRole: async (
      _: any,
      args: { userId: string; newRole: UserRole },
      context: GraphQLContext,
    ) => {
      // Apenas admins podem mudar roles
      verifyPermission(context, Resource.USERS, Action.MANAGE_USERS);

      return await prisma.user.update({
        where: { id: args.userId },
        data: { role: args.newRole },
      });
    },
  },
};
