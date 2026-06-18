export const typeDefs = `
  type Portfolio {
    id: ID!
    name: String!
    description: String!
    createdAt: String!
    projects: [Project!]!
    criteria: [Criterion!]!
  }

  type Project {
    id: ID!
    portfolioId: ID!
    name: String!
    description: String!
    createdAt: String!
    evaluations: [Evaluation!]!
  }

  type Criterion {
    id: ID!
    portfolioId: ID!
    name: String!
    description: String!
    weight: Float!
    type: CriterionType!
    evaluations: [Evaluation!]!
  }

  type Evaluation {
    id: ID!
    project: Project!
    criterion: Criterion!
    evaluatorId: ID!
    linguisticTerm: String!
    fuzzyValue: Float!
    label: String!
    alpha: Float!
  }

  type VIKORResult {
    project: Project!
    sValue: Float!
    rValue: Float!
    qValue: Float!
    rank: Int!
    isAcceptable: Boolean!
    c1Satisfied: Boolean!
    c2Satisfied: Boolean!
  }

  type RankingPosition {
    id: ID!
    project: Project!
    sValue: Float!
    rValue: Float!
    qValue: Float!
    rank: Int!
    c1Satisfied: Boolean!
    c2Satisfied: Boolean!
  }

  type Ranking {
    id: ID!
    portfolioId: ID!
    executedAt: String!
    v: Float!
    positions: [RankingPosition!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    active: Boolean!
    createdAt: String!
  }

  enum CriterionType {
    BENEFIT
    COST
  }

  enum UserRole {
    ADMIN
    DECISOR
    ANALYST
    VIEWER
  }

  enum Resource {
    PROJECTS
    CRITERIA
    EVALUATIONS
    RESULTS
    USERS
    PERMISSIONS
  }

  enum Action {
    CREATE
    READ
    UPDATE
    DELETE
    EXPORT
    VIEW_RESULTS
    MANAGE_USERS
    MANAGE_PERMISSIONS
  }

  type Permission {
    resource: Resource!
    action: Action!
    description: String!
  }

  type RolePermissions {
    role: UserRole!
    permissions: [Permission!]!
    description: String!
  }

  type PermissionCheckResponse {
    granted: Boolean!
    resource: Resource!
    action: Action!
    reason: String
  }

  type UsersByRoleStats {
    ADMIN: Int!
    DECISOR: Int!
    ANALYST: Int!
    VIEWER: Int!
  }

  type PermissionStats {
    totalUsers: Int!
    usersByRole: UsersByRoleStats!
    totalPermissions: Int!
    adminUsers: [String!]!
  }

  type RolePermission {
    resource: Resource!
    action: Action!
  }

  type CustomRole {
    id: ID!
    name: String!
    label: String!
    description: String!
    permissions: [RolePermission!]!
    isSystem: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AvailablePermissions {
    resources: [Resource!]!
    actions: [Action!]!
  }

  type Query {
    portfolios: [Portfolio!]!
    portfolio(id: ID!): Portfolio
    projects(portfolioId: ID): [Project!]!
    project(id: ID!): Project
    criteria(portfolioId: ID): [Criterion!]!
    criterion(id: ID!): Criterion
    evaluations(projectId: ID): [Evaluation!]!
    vikorRanking(portfolioId: ID!): [VIKORResult!]!
    rankingHistory(portfolioId: ID!): [Ranking!]!
    users: [User!]!
    user(id: ID!): User
    me: User
    rolePermissions(role: UserRole!): RolePermissions!
    allRolePermissions: [RolePermissions!]!
    userPermissions: [Permission!]!
    checkPermission(resource: Resource!, action: Action!): PermissionCheckResponse!
    permissionStats: PermissionStats!
    allRoles: [CustomRole!]!
    role(id: ID!): CustomRole
    availablePermissions: AvailablePermissions!
  }

  input CreatePortfolioInput {
    name: String!
    description: String
  }

  input CreateProjectInput {
    portfolioId: ID!
    name: String!
    description: String!
  }

  input CreateCriterionInput {
    portfolioId: ID!
    name: String!
    description: String!
    weight: Float!
    type: CriterionType!
  }

  input CreateEvaluationInput {
    projectId: ID!
    criterionId: ID!
    linguisticTerm: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: UserRole!
    active: Boolean!
  }

  input UpdateUserInput {
    name: String!
    email: String!
    role: UserRole!
    active: Boolean!
  }

  input RolePermissionInput {
    resource: Resource!
    action: Action!
  }

  input CreateRoleInput {
    name: String!
    label: String!
    description: String!
    permissions: [RolePermissionInput!]!
  }

  input UpdateRoleInput {
    label: String
    description: String
    permissions: [RolePermissionInput!]
  }

  type Mutation {
    createPortfolio(input: CreatePortfolioInput!): Portfolio!
    updatePortfolio(id: ID!, input: CreatePortfolioInput!): Portfolio!
    deletePortfolio(id: ID!): Boolean!

    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: CreateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    createCriterion(input: CreateCriterionInput!): Criterion!
    updateCriterion(id: ID!, input: CreateCriterionInput!): Criterion!
    deleteCriterion(id: ID!): Boolean!

    createEvaluation(input: CreateEvaluationInput!): Evaluation!
    updateEvaluation(id: ID!, input: CreateEvaluationInput!): Evaluation!
    deleteEvaluation(id: ID!): Boolean!

    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    changePassword(userId: ID!, newPassword: String!): Boolean!

    createRole(input: CreateRoleInput!): CustomRole!
    updateRole(id: ID!, input: UpdateRoleInput!): CustomRole!
    deleteRole(id: ID!): Boolean!
    cloneRole(id: ID!, newName: String!): CustomRole!

    calculateVIKOR(portfolioId: ID!): [VIKORResult!]!
  }
`;
