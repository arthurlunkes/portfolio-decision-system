import prisma from "../../core/config/database.config.js";
import { requireAuth, type Context } from "../context.js";

const PROJECT_INCLUDE = { evaluations: true } as const;

export const projectResolvers = {
  Query: {
    projects: (
      _: unknown,
      { portfolioId }: { portfolioId?: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const where = portfolioId ? { portfolioId } : {};
      return prisma.project.findMany({ where, include: PROJECT_INCLUDE, orderBy: { createdAt: "asc" } });
    },
    project: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE });
    },
  },
  Mutation: {
    createProject: (
      _: unknown,
      { input }: { input: { portfolioId: string; name: string; description?: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.project.create({ data: { ...input, description: input.description ?? "" }, include: PROJECT_INCLUDE });
    },
    updateProject: (
      _: unknown,
      { id, input }: { id: string; input: { portfolioId: string; name: string; description?: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.project.update({ where: { id }, data: { ...input, description: input.description ?? "" }, include: PROJECT_INCLUDE });
    },
    deleteProject: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      await prisma.project.delete({ where: { id } });
      return true;
    },
  },
};
