import prisma from "../../core/config/database.config.js";
import { FuzzyMappingService } from "../../modules/fuzzy/services/fuzzy-mapping.service.js";
import { TupleConversionService } from "../../modules/tuple2/services/tuple-conversion.service.js";
import { requireAuth, type Context } from "../context.js";

const fuzzyService = new FuzzyMappingService();
const tupleService = new TupleConversionService();

const EVALUATION_INCLUDE = {
  project: { include: { evaluations: true } },
  criterion: { include: { evaluations: true } },
} as const;

export const evaluationResolvers = {
  Query: {
    evaluations: (
      _: unknown,
      { projectId, evaluatorId }: { projectId?: string; evaluatorId?: string },
      ctx: Context,
    ) => {
      const user = requireAuth(ctx);
      const where: Record<string, unknown> = {
        evaluatorId: evaluatorId ?? user.id,
      };
      if (projectId) where.projectId = projectId;
      return prisma.evaluation.findMany({ where, include: EVALUATION_INCLUDE });
    },
  },
  Mutation: {
    createEvaluation: (
      _: unknown,
      { input }: { input: { projectId: string; criterionId: string; linguisticTerm: string } },
      ctx: Context,
    ) => {
      const user = requireAuth(ctx);
      const fuzzyValue = fuzzyService.mapLinguisticToFuzzy(input.linguisticTerm);
      const tuple = tupleService.convertFuzzyTo2Tuple(fuzzyValue);
      return prisma.evaluation.upsert({
        where: {
          projectId_criterionId_evaluatorId: {
            projectId: input.projectId,
            criterionId: input.criterionId,
            evaluatorId: user.id,
          },
        },
        update: {
          linguisticTerm: input.linguisticTerm,
          fuzzyValue,
          label: tuple.label,
          alpha: tuple.alpha,
        },
        create: {
          projectId: input.projectId,
          criterionId: input.criterionId,
          evaluatorId: user.id,
          linguisticTerm: input.linguisticTerm,
          fuzzyValue,
          label: tuple.label,
          alpha: tuple.alpha,
        },
        include: EVALUATION_INCLUDE,
      });
    },
    updateEvaluation: (
      _: unknown,
      { id, input }: { id: string; input: { projectId: string; criterionId: string; linguisticTerm: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const fuzzyValue = fuzzyService.mapLinguisticToFuzzy(input.linguisticTerm);
      const tuple = tupleService.convertFuzzyTo2Tuple(fuzzyValue);
      return prisma.evaluation.update({
        where: { id },
        data: {
          linguisticTerm: input.linguisticTerm,
          fuzzyValue,
          label: tuple.label,
          alpha: tuple.alpha,
        },
        include: EVALUATION_INCLUDE,
      });
    },
    deleteEvaluation: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      await prisma.evaluation.delete({ where: { id } });
      return true;
    },
  },
  Evaluation: {
    project: (parent: { projectId: string }) =>
      prisma.project.findUnique({
        where: { id: parent.projectId },
        include: { evaluations: true },
      }),
    criterion: (parent: { criterionId: string }) =>
      prisma.criterion.findUnique({
        where: { id: parent.criterionId },
        include: { evaluations: true },
      }),
  },
};
