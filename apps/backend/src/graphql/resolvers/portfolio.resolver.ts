import prisma from "../../core/config/database.config.js";
import { requireAuth, type Context } from "../context.js";

const PORTFOLIO_INCLUDE = {
  projects: { include: { evaluations: true } },
  criteria: { include: { evaluations: true } },
} as const;

export const portfolioResolvers = {
  Query: {
    portfolios: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return prisma.portfolio.findMany({
        include: PORTFOLIO_INCLUDE,
        orderBy: { createdAt: "asc" },
      });
    },
    portfolio: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.portfolio.findUnique({ where: { id }, include: PORTFOLIO_INCLUDE });
    },
  },
  Mutation: {
    createPortfolio: (
      _: unknown,
      { input }: { input: { name: string; description?: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.portfolio.create({
        data: { name: input.name, description: input.description ?? "" },
        include: PORTFOLIO_INCLUDE,
      });
    },
    updatePortfolio: (
      _: unknown,
      { id, input }: { id: string; input: { name: string; description?: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.portfolio.update({
        where: { id },
        data: { name: input.name, description: input.description ?? "" },
        include: PORTFOLIO_INCLUDE,
      });
    },
    deletePortfolio: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      await prisma.portfolio.delete({ where: { id } });
      return true;
    },
  },
};
