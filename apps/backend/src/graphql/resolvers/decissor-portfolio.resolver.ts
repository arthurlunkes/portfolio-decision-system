import { randomUUID } from "crypto";
import prisma from "../../core/config/database.config.js";
import {
  DecissorWeightService,
  DEFAULT_WEIGHT_LINGUISTIC,
  DEFAULT_WEIGHT_NUMERIC,
} from "../../modules/decissor/services/decissor-weight.service.js";
import { requireAdmin, requireAuth, type Context } from "../context.js";

const weightService = new DecissorWeightService();

async function recalcNormalizedWeights(portfolioId: string) {
  const all = await prisma.decissorPortfolio.findMany({ where: { portfolioId } });
  const lambdaMap = weightService.buildLambdaMap(all);
  await Promise.all(
    all.map((dp) =>
      prisma.decissorPortfolio.update({
        where: { id: dp.id },
        data: { weightNormalized: lambdaMap.get(dp.evaluatorId) ?? 1 },
      }),
    ),
  );
}

export const decissorPortfolioResolvers = {
  Query: {
    decissorPortfolios: async (
      _: unknown,
      { portfolioId }: { portfolioId: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.decissorPortfolio.findMany({
        where: { portfolioId },
        include: { evaluator: true },
        orderBy: { createdAt: "asc" },
      });
    },
  },

  Mutation: {
    upsertDecissorPortfolio: async (
      _: unknown,
      {
        portfolioId,
        evaluatorId,
        weightLinguistic,
      }: { portfolioId: string; evaluatorId: string; weightLinguistic: string },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const weightNumeric = weightService.getNumericValue(weightLinguistic);

      const existing = await prisma.decissorPortfolio.findUnique({
        where: { portfolioId_evaluatorId: { portfolioId, evaluatorId } },
      });

      let record;
      if (existing) {
        record = await prisma.decissorPortfolio.update({
          where: { id: existing.id },
          data: { weightLinguistic, weightNumeric, updatedAt: new Date() },
          include: { evaluator: true },
        });
      } else {
        record = await prisma.decissorPortfolio.create({
          data: {
            id: randomUUID(),
            portfolioId,
            evaluatorId,
            weightLinguistic,
            weightNumeric,
            weightNormalized: 1.0,
          },
          include: { evaluator: true },
        });
      }

      // Recalc all normalised weights for this portfolio
      await recalcNormalizedWeights(portfolioId);

      return prisma.decissorPortfolio.findUnique({
        where: { id: record.id },
        include: { evaluator: true },
      });
    },

    deleteDecissorPortfolio: async (
      _: unknown,
      { portfolioId, evaluatorId }: { portfolioId: string; evaluatorId: string },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const record = await prisma.decissorPortfolio.findUnique({
        where: { portfolioId_evaluatorId: { portfolioId, evaluatorId } },
      });
      if (!record) return false;
      await prisma.decissorPortfolio.delete({ where: { id: record.id } });
      await recalcNormalizedWeights(portfolioId);
      return true;
    },
  },
};
