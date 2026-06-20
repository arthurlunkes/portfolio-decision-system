import prisma from "../../core/config/database.config.js";
import { requireAuth, type Context } from "../context.js";

const CRITERION_INCLUDE = { evaluations: true } as const;

export const criterionResolvers = {
  Query: {
    criteria: (
      _: unknown,
      { portfolioId }: { portfolioId?: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const where = portfolioId ? { portfolioId } : {};
      return prisma.criterion.findMany({ where, include: CRITERION_INCLUDE, orderBy: { createdAt: "asc" } });
    },
    criterion: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.criterion.findUnique({ where: { id }, include: CRITERION_INCLUDE });
    },
  },
  Mutation: {
    createCriterion: (
      _: unknown,
      { input }: { input: { portfolioId: string; name: string; description?: string; group?: string; type: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.criterion.create({
        data: {
          portfolioId: input.portfolioId,
          name: input.name,
          description: input.description ?? "",
          group: input.group ?? "",
          weight: 0, // calculado automaticamente via avaliações de importância
          type: input.type as any,
        },
        include: CRITERION_INCLUDE,
      });
    },
    updateCriterion: (
      _: unknown,
      { id, input }: { id: string; input: { portfolioId: string; name: string; description?: string; group?: string; type: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.criterion.update({
        where: { id },
        data: {
          portfolioId: input.portfolioId,
          name: input.name,
          description: input.description ?? "",
          group: input.group ?? "",
          type: input.type as any,
          // weight não é alterado aqui: calculado pelo motor VIKOR
        },
        include: CRITERION_INCLUDE,
      });
    },
    deleteCriterion: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      await prisma.criterion.delete({ where: { id } });
      return true;
    },
  },
};
