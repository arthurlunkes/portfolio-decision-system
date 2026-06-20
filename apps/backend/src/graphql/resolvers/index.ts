import { criterionResolvers } from "./criterion.resolver.js";
import { criterionImportanceResolvers } from "./criterion-importance.resolver.js";
import { decissorPortfolioResolvers } from "./decissor-portfolio.resolver.js";
import { evaluationResolvers } from "./evaluation.resolver.js";
import { permissionResolvers } from "./permission.resolver.js";
import { portfolioResolvers } from "./portfolio.resolver.js";
import { projectResolvers } from "./project.resolver.js";
import { resultResolvers } from "./result.resolver.js";
import { roleResolvers } from "./role.resolver.js";
import { userResolvers } from "./user.resolver.js";

export const resolvers = {
  Query: {
    ...portfolioResolvers.Query,
    ...projectResolvers.Query,
    ...criterionResolvers.Query,
    ...evaluationResolvers.Query,
    ...resultResolvers.Query,
    ...userResolvers.Query,
    ...roleResolvers.Query,
    ...permissionResolvers.Query,
    ...decissorPortfolioResolvers.Query,
    ...criterionImportanceResolvers.Query,
  },
  Mutation: {
    ...portfolioResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...criterionResolvers.Mutation,
    ...evaluationResolvers.Mutation,
    ...resultResolvers.Mutation,
    ...userResolvers.Mutation,
    ...roleResolvers.Mutation,
    ...decissorPortfolioResolvers.Mutation,
    ...criterionImportanceResolvers.Mutation,
  },
  Evaluation: evaluationResolvers.Evaluation,
};
