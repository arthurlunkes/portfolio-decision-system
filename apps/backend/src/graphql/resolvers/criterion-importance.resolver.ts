import { randomUUID } from "crypto";
import prisma from "../../core/config/database.config.js";
import { CriterionWeightService } from "../../modules/criteria/services/criterion-weight.service.js";
import { requireAuth, type Context } from "../context.js";

const weightService = new CriterionWeightService();

const INCLUDE = {
  criterion: true,
  evaluator: true,
} as const;

export const criterionImportanceResolvers = {
  Query: {
    criterionImportances: async (
      _: unknown,
      { portfolioId, evaluatorId }: { portfolioId: string; evaluatorId?: string },
      ctx: Context,
    ) => {
      const user = requireAuth(ctx);
      const where: Record<string, unknown> = { portfolioId };
      // Admin pode ver de qualquer decisor; outros veem só as próprias
      if (user.role === "ADMIN") {
        if (evaluatorId) where.evaluatorId = evaluatorId;
      } else {
        where.evaluatorId = evaluatorId ?? user.id;
      }
      return prisma.criterionImportance.findMany({ where, include: INCLUDE });
    },

    computedCriterionWeights: async (
      _: unknown,
      { portfolioId }: { portfolioId: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const [criteria, importances, decissorLinks] = await Promise.all([
        prisma.criterion.findMany({ where: { portfolioId }, orderBy: { createdAt: "asc" } }),
        prisma.criterionImportance.findMany({ where: { portfolioId } }),
        prisma.decissorPortfolio.findMany({ where: { portfolioId } }),
      ]);

      if (criteria.length === 0 || importances.length === 0) return [];

      const { DecissorWeightService } = await import(
        "../../modules/decissor/services/decissor-weight.service.js"
      );
      const dws = new DecissorWeightService();
      const lambdaMap = dws.buildLambdaMap(decissorLinks);

      try {
        const weights = weightService.compute(
          criteria.map((c) => c.id),
          importances,
          lambdaMap.size > 0 ? lambdaMap : undefined,
        );
        return weights.map((w) => {
          const criterion = criteria.find((c) => c.id === w.criterionId)!;
          return {
            criterionId: w.criterionId,
            criterionName: criterion.name,
            delta: w.delta,
            omega: w.omega,
            omegaPct: w.omegaPct,
          };
        });
      } catch {
        return [];
      }
    },
  },

  Mutation: {
    upsertCriterionImportance: async (
      _: unknown,
      {
        criterionId,
        portfolioId,
        linguisticTerm,
      }: { criterionId: string; portfolioId: string; linguisticTerm: string },
      ctx: Context,
    ) => {
      const user = requireAuth(ctx);
      const numericValue = weightService.termToNumeric(linguisticTerm);

      const existing = await prisma.criterionImportance.findUnique({
        where: { criterionId_evaluatorId: { criterionId, evaluatorId: user.id } },
      });

      if (existing) {
        return prisma.criterionImportance.update({
          where: { id: existing.id },
          data: { linguisticTerm, numericValue, updatedAt: new Date() },
          include: INCLUDE,
        });
      }

      return prisma.criterionImportance.create({
        data: {
          id: randomUUID(),
          criterionId,
          evaluatorId: user.id,
          portfolioId,
          linguisticTerm,
          numericValue,
        },
        include: INCLUDE,
      });
    },

    deleteCriterionImportance: async (
      _: unknown,
      { id }: { id: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      await prisma.criterionImportance.delete({ where: { id } });
      return true;
    },
  },
};
