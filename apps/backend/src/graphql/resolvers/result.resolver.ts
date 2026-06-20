import { randomUUID } from "crypto";
import prisma from "../../core/config/database.config.js";
import { CriterionWeightService } from "../../modules/criteria/services/criterion-weight.service.js";
import type { CriterionType } from "../../modules/criteria/entities/criterion.entity.js";
import { DecissorWeightService } from "../../modules/decissor/services/decissor-weight.service.js";
import { TupleAggregationService } from "../../modules/tuple2/services/aggregation.service.js";
import { TupleConversionService } from "../../modules/tuple2/services/tuple-conversion.service.js";
import { VIKORCalculationService } from "../../modules/vikor/services/vikor-calculation.service.js";
import { requireAuth, type Context } from "../context.js";

const vikorService = new VIKORCalculationService();
const aggregationService = new TupleAggregationService();
const tupleService = new TupleConversionService();
const decissorWeightService = new DecissorWeightService();
const criterionWeightService = new CriterionWeightService();

async function computeVIKOR(portfolioId: string) {
  const [projects, criteria, decissorLinks, importances] = await Promise.all([
    prisma.project.findMany({
      where: { portfolioId },
      include: { evaluations: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.criterion.findMany({
      where: { portfolioId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.decissorPortfolio.findMany({ where: { portfolioId } }),
    prisma.criterionImportance.findMany({ where: { portfolioId } }),
  ]);

  if (projects.length === 0 || criteria.length === 0) return [];

  // Build λk map for decisor weighting (from DecissorPortfolio; falls back to 1/n)
  const lambdaMap = decissorWeightService.buildLambdaMap(
    decissorLinks.length > 0 ? decissorLinks : [],
  );

  // --- PESOS DOS CRITÉRIOS (ωj) calculados via avaliações de importância ---
  const criterionWeights = criterionWeightService.compute(
    criteria.map((c) => c.id),
    importances,
    lambdaMap.size > 0 ? lambdaMap : undefined,
  );
  const omegaMap = new Map(criterionWeights.map((cw) => [cw.criterionId, cw.omega]));

  // Persiste os pesos calculados de volta no campo weight de cada critério (auditoria)
  await Promise.all(
    criterionWeights.map((cw) =>
      prisma.criterion.update({
        where: { id: cw.criterionId },
        data: { weight: cw.omegaPct },
      }),
    ),
  );

  // --- MATRIZ DE DECISÃO: agrega avaliações de desempenho por decisor ---
  const matrix = projects.map((project) =>
    criteria.map((criterion) => {
      const evsForPair = project.evaluations.filter(
        (e) => e.criterionId === criterion.id,
      );
      if (evsForPair.length === 0) return 0;
      if (evsForPair.length === 1) return evsForPair[0].fuzzyValue;

      const fuzzyValues = evsForPair.map((e) => e.fuzzyValue);
      const decissorWeights =
        lambdaMap.size > 0
          ? evsForPair.map((e) => lambdaMap.get(e.evaluatorId) ?? (1 / evsForPair.length))
          : undefined;

      const aggregated = aggregationService.aggregateScalars(fuzzyValues, decissorWeights);
      return tupleService.convert2TupleToFuzzy(aggregated);
    }),
  );

  // ωj em [0,1] para o motor VIKOR (soma = 1,0)
  const weights = criteria.map((c) => omegaMap.get(c.id) ?? 0);
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
