import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import prisma from "./core/config/database.config.js";
import { CriterionType } from "./modules/criteria/entities/criterion.entity.js";
import { FuzzyMappingService } from "./modules/fuzzy/services/fuzzy-mapping.service.js";
import {
  hasPermission,
  Action as PermissionAction,
  Resource as PermissionResource,
  UserRole as PermissionUserRole,
  ROLE_PERMISSIONS,
} from "./modules/permissions/index.js";
import { VIKORCalculationService } from "./modules/vikor/services/vikor-calculation.service.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// --- Validation ---

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

const passwordSchema = z.string().min(8).max(128);

// --- Helpers ---

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: "portfolio-backend",
      audience: "portfolio-frontend",
    }) as JwtPayload;
  } catch {
    return null;
  }
}

async function ensureDefaultAdminUser() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    console.warn(
      "[auth] ADMIN_PASSWORD missing or too short; default admin user will not be created.",
    );
    return;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@local")
    .trim()
    .toLowerCase();
  const adminName = (process.env.ADMIN_NAME || "Administrador").trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (existingUser) return;

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  console.log(`[auth] default admin user created for ${adminEmail}`);
}

// --- Express setup ---

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again later." },
});

app.post("/api/auth/login", loginRateLimiter, async (req, res) => {
  const parsedPayload = loginSchema.safeParse(req.body);
  if (!parsedPayload.success) {
    return res.status(400).json({ message: "Invalid request payload" });
  }

  const { email, password } = parsedPayload.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const safeUser = sanitizeUser(user);
    const token = jwt.sign(
      { sub: safeUser.id, email: safeUser.email, role: safeUser.role },
      JWT_SECRET,
      {
        expiresIn: "12h",
        issuer: "portfolio-backend",
        audience: "portfolio-frontend",
      },
    );

    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error("[auth] login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// --- GraphQL schema ---

const typeDefs = `
  type Project {
    id: ID!
    name: String!
    description: String!
    createdAt: String!
    evaluations: [Evaluation!]!
  }

  type Criterion {
    id: ID!
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
    projects: [Project!]!
    project(id: ID!): Project
    criteria: [Criterion!]!
    criterion(id: ID!): Criterion
    evaluations(projectId: ID): [Evaluation!]!
    vikorRanking: [VIKORResult!]!
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

  input CreateProjectInput {
    name: String!
    description: String!
  }

  input CreateCriterionInput {
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

    calculateVIKOR: [VIKORResult!]!
  }
`;

// --- Services ---

const fuzzyService = new FuzzyMappingService();
const vikorService = new VIKORCalculationService();

// --- Auth context ---

interface DbUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface Context {
  currentUser: DbUser | null;
}

function requireAuth(ctx: Context): DbUser {
  if (!ctx.currentUser) throw new Error("Unauthorized");
  return ctx.currentUser;
}

function requireAdmin(ctx: Context): DbUser {
  const user = requireAuth(ctx);
  if (user.role !== "ADMIN") throw new Error("Forbidden: admin only");
  return user;
}

interface RolePermissionEntry {
  resource: PermissionResource;
  action: PermissionAction;
}

interface CustomRoleRecord {
  id: string;
  name: string;
  label: string;
  description: string;
  permissions: RolePermissionEntry[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

const SYSTEM_ROLE_ORDER: PermissionUserRole[] = [
  PermissionUserRole.ADMIN,
  PermissionUserRole.DECISOR,
  PermissionUserRole.ANALYST,
  PermissionUserRole.VIEWER,
];

const ROLE_LABELS: Record<PermissionUserRole, string> = {
  [PermissionUserRole.ADMIN]: "Administrador",
  [PermissionUserRole.DECISOR]: "Decisor",
  [PermissionUserRole.ANALYST]: "Analista",
  [PermissionUserRole.VIEWER]: "Visualizador",
};

const customRoles = new Map<string, CustomRoleRecord>();

function toPermissionUserRole(role: string): PermissionUserRole {
  if (role in ROLE_PERMISSIONS) {
    return role as PermissionUserRole;
  }
  throw new Error(`Unsupported user role: ${role}`);
}

function getSystemRoles(): CustomRoleRecord[] {
  const epoch = new Date(0).toISOString();
  return SYSTEM_ROLE_ORDER.map((role) => {
    const definition = ROLE_PERMISSIONS[role];
    return {
      id: role,
      name: role,
      label: ROLE_LABELS[role],
      description: definition.description,
      permissions: definition.permissions.map((permission) => ({
        resource: permission.resource,
        action: permission.action,
      })),
      isSystem: true,
      createdAt: epoch,
      updatedAt: epoch,
    };
  });
}

function getAllRolesList(): CustomRoleRecord[] {
  return [...getSystemRoles(), ...customRoles.values()];
}

function getRoleById(roleId: string): CustomRoleRecord | undefined {
  return getAllRolesList().find((role) => role.id === roleId);
}

function roleNameExists(name: string): boolean {
  const normalized = name.trim().toUpperCase();
  return getAllRolesList().some(
    (role) => role.name.toUpperCase() === normalized,
  );
}

async function buildPermissionStats() {
  const users = await prisma.user.findMany({
    select: { name: true, role: true },
  });

  const usersByRole = {
    ADMIN: 0,
    DECISOR: 0,
    ANALYST: 0,
    VIEWER: 0,
  };

  users.forEach((user) => {
    if (user.role in usersByRole) {
      usersByRole[user.role as keyof typeof usersByRole] += 1;
    }
  });

  return {
    totalUsers: users.length,
    usersByRole,
    totalPermissions: SYSTEM_ROLE_ORDER.reduce(
      (total, role) => total + ROLE_PERMISSIONS[role].permissions.length,
      0,
    ),
    adminUsers: users
      .filter((user) => user.role === "ADMIN")
      .map((user) => user.name),
  };
}

// --- VIKOR computation ---

async function computeVIKOR() {
  const projects = await prisma.project.findMany({
    include: { evaluations: true },
    orderBy: { createdAt: "asc" },
  });
  const criteria = await prisma.criterion.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (projects.length === 0 || criteria.length === 0) return [];

  const matrix = projects.map((project) =>
    criteria.map((criterion) => {
      const ev = project.evaluations.find(
        (e) => e.criterionId === criterion.id,
      );
      return ev ? ev.fuzzyValue : 0;
    }),
  );

  const weights = criteria.map((c) => c.weight);
  const types = criteria.map((c) => c.type as CriterionType);

  const rawResults = vikorService.calculateVIKOR(matrix, weights, types);

  return rawResults.map((result) => {
    const idx = parseInt(result.projectId.split("-")[1], 10);
    return {
      project: projects[idx],
      sValue: result.sValue,
      rValue: result.rValue,
      qValue: result.qValue,
      rank: result.rank,
      isAcceptable: result.isAcceptable,
    };
  });
}

// --- Resolvers ---

const resolvers = {
  Query: {
    projects: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return prisma.project.findMany({
        include: { evaluations: true },
        orderBy: { createdAt: "asc" },
      });
    },
    project: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.project.findUnique({
        where: { id },
        include: { evaluations: true },
      });
    },
    criteria: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return prisma.criterion.findMany({
        include: { evaluations: true },
        orderBy: { createdAt: "asc" },
      });
    },
    criterion: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.criterion.findUnique({
        where: { id },
        include: { evaluations: true },
      });
    },
    evaluations: (
      _: unknown,
      { projectId }: { projectId?: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const where = projectId ? { projectId } : {};
      return prisma.evaluation.findMany({
        where,
        include: {
          project: { include: { evaluations: true } },
          criterion: { include: { evaluations: true } },
        },
      });
    },
    vikorRanking: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return computeVIKOR();
    },
    users: (_: unknown, __: unknown, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    },
    user: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.user.findUnique({ where: { id } });
    },
    me: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return prisma.user.findUnique({ where: { id: ctx.currentUser!.id } });
    },
    rolePermissions: (
      _: unknown,
      { role }: { role: PermissionUserRole },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const definition = ROLE_PERMISSIONS[role];
      return {
        role,
        description: definition.description,
        permissions: definition.permissions,
      };
    },
    allRolePermissions: (_: unknown, __: unknown, ctx: Context) => {
      requireAdmin(ctx);
      return SYSTEM_ROLE_ORDER.map((role) => ({
        role,
        description: ROLE_PERMISSIONS[role].description,
        permissions: ROLE_PERMISSIONS[role].permissions,
      }));
    },
    userPermissions: (_: unknown, __: unknown, ctx: Context) => {
      const user = requireAuth(ctx);
      const role = toPermissionUserRole(user.role);
      return ROLE_PERMISSIONS[role].permissions;
    },
    checkPermission: (
      _: unknown,
      {
        resource,
        action,
      }: { resource: PermissionResource; action: PermissionAction },
      ctx: Context,
    ) => {
      const user = requireAuth(ctx);
      const role = toPermissionUserRole(user.role);
      const granted = hasPermission(role, resource, action);
      return {
        granted,
        resource,
        action,
        reason: granted
          ? undefined
          : `User role ${role} does not have ${action} on ${resource}`,
      };
    },
    permissionStats: async (_: unknown, __: unknown, ctx: Context) => {
      requireAdmin(ctx);
      return buildPermissionStats();
    },
    allRoles: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return getAllRolesList();
    },
    role: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return getRoleById(id) ?? null;
    },
    availablePermissions: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return {
        resources: Object.values(PermissionResource),
        actions: Object.values(PermissionAction),
      };
    },
  },

  Mutation: {
    createProject: (
      _: unknown,
      { input }: { input: { name: string; description: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.project.create({
        data: input,
        include: { evaluations: true },
      });
    },
    updateProject: (
      _: unknown,
      {
        id,
        input,
      }: { id: string; input: { name: string; description: string } },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.project.update({
        where: { id },
        data: input,
        include: { evaluations: true },
      });
    },
    deleteProject: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      await prisma.project.delete({ where: { id } });
      return true;
    },

    createCriterion: (
      _: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          description: string;
          weight: number;
          type: string;
        };
      },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.criterion.create({
        data: {
          name: input.name,
          description: input.description,
          weight: input.weight,
          type: input.type as any,
        },
        include: { evaluations: true },
      });
    },
    updateCriterion: (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name: string;
          description: string;
          weight: number;
          type: string;
        };
      },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      return prisma.criterion.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          weight: input.weight,
          type: input.type as any,
        },
        include: { evaluations: true },
      });
    },
    deleteCriterion: async (
      _: unknown,
      { id }: { id: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      await prisma.criterion.delete({ where: { id } });
      return true;
    },

    createEvaluation: (
      _: unknown,
      {
        input,
      }: {
        input: {
          projectId: string;
          criterionId: string;
          linguisticTerm: string;
        };
      },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const fuzzyValue = fuzzyService.mapLinguisticToFuzzy(
        input.linguisticTerm,
      );
      return prisma.evaluation.upsert({
        where: {
          projectId_criterionId: {
            projectId: input.projectId,
            criterionId: input.criterionId,
          },
        },
        update: {
          linguisticTerm: input.linguisticTerm,
          fuzzyValue,
          label: input.linguisticTerm,
          alpha: fuzzyValue,
        },
        create: {
          projectId: input.projectId,
          criterionId: input.criterionId,
          linguisticTerm: input.linguisticTerm,
          fuzzyValue,
          label: input.linguisticTerm,
          alpha: fuzzyValue,
        },
        include: {
          project: { include: { evaluations: true } },
          criterion: { include: { evaluations: true } },
        },
      });
    },
    updateEvaluation: (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          projectId: string;
          criterionId: string;
          linguisticTerm: string;
        };
      },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const fuzzyValue = fuzzyService.mapLinguisticToFuzzy(
        input.linguisticTerm,
      );
      return prisma.evaluation.update({
        where: { id },
        data: {
          linguisticTerm: input.linguisticTerm,
          fuzzyValue,
          label: input.linguisticTerm,
          alpha: fuzzyValue,
        },
        include: {
          project: { include: { evaluations: true } },
          criterion: { include: { evaluations: true } },
        },
      });
    },
    deleteEvaluation: async (
      _: unknown,
      { id }: { id: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      await prisma.evaluation.delete({ where: { id } });
      return true;
    },

    createUser: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          email: string;
          password: string;
          role: string;
          active: boolean;
        };
      },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const validated = passwordSchema.safeParse(input.password);
      if (!validated.success)
        throw new Error("A senha deve ter pelo menos 8 caracteres");
      const email = input.email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error("E-mail ja cadastrado");
      const passwordHash = await bcrypt.hash(input.password, 12);
      return prisma.user.create({
        data: {
          name: input.name.trim(),
          email,
          passwordHash,
          role: input.role as any,
          active: input.active,
        },
      });
    },
    updateUser: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: { name: string; email: string; role: string; active: boolean };
      },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const email = input.email.trim().toLowerCase();
      const conflict = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (conflict) throw new Error("E-mail ja em uso por outro usuario");
      return prisma.user.update({
        where: { id },
        data: {
          name: input.name.trim(),
          email,
          role: input.role as any,
          active: input.active,
        },
      });
    },
    deleteUser: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      const current = requireAdmin(ctx);
      if (current.id === id)
        throw new Error("Voce nao pode excluir sua propria conta");
      await prisma.user.delete({ where: { id } });
      return true;
    },
    changePassword: async (
      _: unknown,
      { userId, newPassword }: { userId: string; newPassword: string },
      ctx: Context,
    ) => {
      const current = requireAuth(ctx);
      if (current.role !== "ADMIN" && current.id !== userId)
        throw new Error("Forbidden");
      const validated = passwordSchema.safeParse(newPassword);
      if (!validated.success)
        throw new Error("A senha deve ter pelo menos 8 caracteres");
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      return true;
    },

    createRole: (
      _: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          label: string;
          description: string;
          permissions: RolePermissionEntry[];
        };
      },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const name = input.name.trim().toUpperCase();
      if (!name) throw new Error("Nome do papel e obrigatorio");
      if (roleNameExists(name))
        throw new Error("Ja existe um papel com esse nome");

      const now = new Date().toISOString();
      const created: CustomRoleRecord = {
        id: `custom-${randomUUID()}`,
        name,
        label: input.label.trim() || name,
        description: input.description.trim(),
        permissions: input.permissions ?? [],
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      };

      customRoles.set(created.id, created);
      return created;
    },
    updateRole: (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          label?: string;
          description?: string;
          permissions?: RolePermissionEntry[];
        };
      },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const existing = getRoleById(id);
      if (!existing) throw new Error("Papel nao encontrado");
      if (existing.isSystem)
        throw new Error("Papeis de sistema nao podem ser alterados");

      const updated: CustomRoleRecord = {
        ...existing,
        label: input.label?.trim() || existing.label,
        description: input.description?.trim() ?? existing.description,
        permissions: input.permissions ?? existing.permissions,
        updatedAt: new Date().toISOString(),
      };

      customRoles.set(updated.id, updated);
      return updated;
    },
    deleteRole: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAdmin(ctx);
      const existing = getRoleById(id);
      if (!existing) throw new Error("Papel nao encontrado");
      if (existing.isSystem)
        throw new Error("Papeis de sistema nao podem ser removidos");
      customRoles.delete(id);
      return true;
    },
    cloneRole: (
      _: unknown,
      { id, newName }: { id: string; newName: string },
      ctx: Context,
    ) => {
      requireAdmin(ctx);
      const source = getRoleById(id);
      if (!source) throw new Error("Papel nao encontrado");

      const name = newName.trim().toUpperCase();
      if (!name) throw new Error("Nome do novo papel e obrigatorio");
      if (roleNameExists(name))
        throw new Error("Ja existe um papel com esse nome");

      const now = new Date().toISOString();
      const cloned: CustomRoleRecord = {
        id: `custom-${randomUUID()}`,
        name,
        label: `${source.label} (Copia)`,
        description: source.description,
        permissions: source.permissions.map((permission) => ({
          ...permission,
        })),
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      };

      customRoles.set(cloned.id, cloned);
      return cloned;
    },

    calculateVIKOR: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return computeVIKOR();
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

// --- Apollo Server ---

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({ schema });

async function startServer() {
  await ensureDefaultAdminUser();
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        let currentUser = null;

        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.slice(7);
          const payload = verifyToken(token);
          if (payload) {
            currentUser = await prisma.user.findUnique({
              where: { id: payload.sub },
            });
          }
        }

        return { currentUser };
      },
    }),
  );

  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
