import { randomUUID } from "crypto";
import prisma from "../../core/config/database.config.js";
import type { CriterionType } from "../../modules/criteria/entities/criterion.entity.js";
import { TupleAggregationService } from "../../modules/tuple2/services/aggregation.service.js";
import { TupleConversionService } from "../../modules/tuple2/services/tuple-conversion.service.js";
import { VIKORCalculationService } from "../../modules/vikor/services/vikor-calculation.service.js";
import { requireAuth, type Context } from "../context.js";

const vikorService = new VIKORCalculationService();
const aggregationService = new TupleAggregationService();
const tupleService = new TupleConversionService();

async function computeVIKOR(portfolioId: string) {
  const projects = await prisma.project.findMany({
    where: { portfolioId },
    include: { evaluations: true },
    orderBy: { createdAt: "asc" },
  });
  const criteria = await prisma.criterion.findMany({
    where: { portfolioId },
    orderBy: { createdAt: "asc" },
  });

  if (projects.length === 0 || criteria.length === 0) return [];

  const weightSum = criteria.reduce((s, c) => s + c.weight, 0);
  if (Math.abs(weightSum - 100) > 0.01) {
    throw new Error(
      `A soma dos pesos dos critérios deve ser 100%. Soma atual: ${weightSum.toFixed(2)}%`,
    );
  }

  const matrix = projects.map((project) =>
    criteria.map((criterion) => {
      const evsForPair = project.evaluations.filter(
        (e) => e.criterionId === criterion.id,
      );
      if (evsForPair.length === 0) return 0;
      if (evsForPair.length === 1) return evsForPair[0].fuzzyValue;

      const aggregated = aggregationService.aggregateScalars(
        evsForPair.map((e) => e.fuzzyValue),
      );
      return tupleService.convert2TupleToFuzzy(aggregated);
    }),
  );

  const weights = criteria.map((c) => c.weight / 100);
  const types = criteria.map((c) => c.type as CriterionType);
  const rawResults = vikorService.calculateVIKOR(matrix, weights, types);

  return rawResults.map((result) => {
    const originalIdx = parseInt(result.projectId.split("-")[1], 10);
    return {
      project: projects[originalIdx],
      sValue: result.sValue,
      rValue: result.rValue,
      qValue: result.qValue,
      rank: result.rank,
      c1Satisfied: result.c1Satisfied,
      c2Satisfied: result.c2Satisfied,
      isAcceptable: result.c1Satisfied && result.c2Satisfied,
    };
  });
}

async function persistRanking(portfolioId: string, vikorResults: Awaited<ReturnType<typeof computeVIKOR>>) {
  if (vikorResults.length === 0) return;

  const rankingId = randomUUID();
  await prisma.ranking.create({
    data: {
      id: rankingId,
      portfolioId,
      positions: {
        create: vikorResults.map((r) => ({
          id: randomUUID(),
          projectId: r.project.id,
          sValue: r.sValue,
          rValue: r.rValue,
          qValue: r.qValue,
          rank: r.rank,
          c1Satisfied: r.c1Satisfied,
          c2Satisfied: r.c2Satisfied,
        })),
      },
    },
  });
}

export const resultResolvers = {
  Query: {
    vikorRanking: (_: unknown, { portfolioId }: { portfolioId: string }, ctx: Context) => {
      requireAuth(ctx);
      return computeVIKOR(portfolioId);
    },
    rankingHistory: async (
      _: unknown,
      { portfolioId }: { portfolioId: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.ranking.findMany({
        where: { portfolioId },
        include: {
          positions: {
            include: { project: { include: { evaluations: true } } },
            orderBy: { rank: "asc" },
          },
        },
        orderBy: { executedAt: "desc" },
      });
    },
  },
  Mutation: {
    calculateVIKOR: async (
      _: unknown,
      { portfolioId }: { portfolioId: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const results = await computeVIKOR(portfolioId);
      await persistRanking(portfolioId, results);
      return results;
    },
  },
};
