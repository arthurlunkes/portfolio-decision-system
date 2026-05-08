import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from './core/config/database.config.js';
import { FuzzyMappingService } from './modules/fuzzy/services/fuzzy-mapping.service.js';
import { CriterionType } from './modules/criteria/entities/criterion.entity.js';
import { VIKORCalculationService } from './modules/vikor/services/vikor-calculation.service.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
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

function sanitizeUser(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'portfolio-backend',
      audience: 'portfolio-frontend',
    }) as JwtPayload;
  } catch {
    return null;
  }
}

async function ensureDefaultAdminUser() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    console.warn('[auth] ADMIN_PASSWORD missing or too short; default admin user will not be created.');
    return;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@local').trim().toLowerCase();
  const adminName = (process.env.ADMIN_NAME || 'Administrador').trim();

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingUser) return;

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: { name: adminName, email: adminEmail, passwordHash, role: 'ADMIN', active: true },
  });

  console.log(`[auth] default admin user created for ${adminEmail}`);
}

// --- Express setup ---

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : true, credentials: true }));
app.use(express.json({ limit: '100kb' }));

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again later.' },
});

app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
  const parsedPayload = loginSchema.safeParse(req.body);
  if (!parsedPayload.success) {
    return res.status(400).json({ message: 'Invalid request payload' });
  }

  const { email, password } = parsedPayload.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const safeUser = sanitizeUser(user);
    const token = jwt.sign({ sub: safeUser.id, email: safeUser.email, role: safeUser.role }, JWT_SECRET, {
      expiresIn: '12h',
      issuer: 'portfolio-backend',
      audience: 'portfolio-frontend',
    });

    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error('[auth] login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
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
    VIEWER
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
  if (!ctx.currentUser) throw new Error('Unauthorized');
  return ctx.currentUser;
}

function requireAdmin(ctx: Context): DbUser {
  const user = requireAuth(ctx);
  if (user.role !== 'ADMIN') throw new Error('Forbidden: admin only');
  return user;
}

// --- VIKOR computation ---

async function computeVIKOR() {
  const projects = await prisma.project.findMany({
    include: { evaluations: true },
    orderBy: { createdAt: 'asc' },
  });
  const criteria = await prisma.criterion.findMany({ orderBy: { createdAt: 'asc' } });

  if (projects.length === 0 || criteria.length === 0) return [];

  const matrix = projects.map((project) =>
    criteria.map((criterion) => {
      const ev = project.evaluations.find((e) => e.criterionId === criterion.id);
      return ev ? ev.fuzzyValue : 0;
    }),
  );

  const weights = criteria.map((c) => c.weight);
  const types = criteria.map((c) => c.type as CriterionType);

  const rawResults = vikorService.calculateVIKOR(matrix, weights, types);

  return rawResults.map((result) => {
    const idx = parseInt(result.projectId.split('-')[1], 10);
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
      return prisma.project.findMany({ include: { evaluations: true }, orderBy: { createdAt: 'asc' } });
    },
    project: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.project.findUnique({ where: { id }, include: { evaluations: true } });
    },
    criteria: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return prisma.criterion.findMany({ include: { evaluations: true }, orderBy: { createdAt: 'asc' } });
    },
    criterion: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.criterion.findUnique({ where: { id }, include: { evaluations: true } });
    },
    evaluations: (_: unknown, { projectId }: { projectId?: string }, ctx: Context) => {
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
      return prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    },
    user: (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAdmin(ctx);
      return prisma.user.findUnique({ where: { id } });
    },
    me: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return prisma.user.findUnique({ where: { id: ctx.currentUser!.id } });
    },
  },

  Mutation: {
    createProject: (_: unknown, { input }: { input: { name: string; description: string } }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.project.create({ data: input, include: { evaluations: true } });
    },
    updateProject: (_: unknown, { id, input }: { id: string; input: { name: string; description: string } }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.project.update({ where: { id }, data: input, include: { evaluations: true } });
    },
    deleteProject: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      await prisma.project.delete({ where: { id } });
      return true;
    },

    createCriterion: (_: unknown, { input }: { input: { name: string; description: string; weight: number; type: string } }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.criterion.create({
        data: { name: input.name, description: input.description, weight: input.weight, type: input.type as any },
        include: { evaluations: true },
      });
    },
    updateCriterion: (_: unknown, { id, input }: { id: string; input: { name: string; description: string; weight: number; type: string } }, ctx: Context) => {
      requireAuth(ctx);
      return prisma.criterion.update({
        where: { id },
        data: { name: input.name, description: input.description, weight: input.weight, type: input.type as any },
        include: { evaluations: true },
      });
    },
    deleteCriterion: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      await prisma.criterion.delete({ where: { id } });
      return true;
    },

    createEvaluation: (_: unknown, { input }: { input: { projectId: string; criterionId: string; linguisticTerm: string } }, ctx: Context) => {
      requireAuth(ctx);
      const fuzzyValue = fuzzyService.mapLinguisticToFuzzy(input.linguisticTerm);
      return prisma.evaluation.upsert({
        where: { projectId_criterionId: { projectId: input.projectId, criterionId: input.criterionId } },
        update: { linguisticTerm: input.linguisticTerm, fuzzyValue, label: input.linguisticTerm, alpha: fuzzyValue },
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
    updateEvaluation: (_: unknown, { id, input }: { id: string; input: { projectId: string; criterionId: string; linguisticTerm: string } }, ctx: Context) => {
      requireAuth(ctx);
      const fuzzyValue = fuzzyService.mapLinguisticToFuzzy(input.linguisticTerm);
      return prisma.evaluation.update({
        where: { id },
        data: { linguisticTerm: input.linguisticTerm, fuzzyValue, label: input.linguisticTerm, alpha: fuzzyValue },
        include: {
          project: { include: { evaluations: true } },
          criterion: { include: { evaluations: true } },
        },
      });
    },
    deleteEvaluation: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      await prisma.evaluation.delete({ where: { id } });
      return true;
    },

    createUser: async (_: unknown, { input }: { input: { name: string; email: string; password: string; role: string; active: boolean } }, ctx: Context) => {
      requireAdmin(ctx);
      const validated = passwordSchema.safeParse(input.password);
      if (!validated.success) throw new Error('A senha deve ter pelo menos 8 caracteres');
      const email = input.email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error('E-mail ja cadastrado');
      const passwordHash = await bcrypt.hash(input.password, 12);
      return prisma.user.create({
        data: { name: input.name.trim(), email, passwordHash, role: input.role as any, active: input.active },
      });
    },
    updateUser: async (_: unknown, { id, input }: { id: string; input: { name: string; email: string; role: string; active: boolean } }, ctx: Context) => {
      requireAdmin(ctx);
      const email = input.email.trim().toLowerCase();
      const conflict = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (conflict) throw new Error('E-mail ja em uso por outro usuario');
      return prisma.user.update({
        where: { id },
        data: { name: input.name.trim(), email, role: input.role as any, active: input.active },
      });
    },
    deleteUser: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      const current = requireAdmin(ctx);
      if (current.id === id) throw new Error('Voce nao pode excluir sua propria conta');
      await prisma.user.delete({ where: { id } });
      return true;
    },
    changePassword: async (_: unknown, { userId, newPassword }: { userId: string; newPassword: string }, ctx: Context) => {
      const current = requireAuth(ctx);
      if (current.role !== 'ADMIN' && current.id !== userId) throw new Error('Forbidden');
      const validated = passwordSchema.safeParse(newPassword);
      if (!validated.success) throw new Error('A senha deve ter pelo menos 8 caracteres');
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
      return true;
    },

    calculateVIKOR: (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return computeVIKOR();
    },
  },

  Evaluation: {
    project: (parent: { projectId: string }) =>
      prisma.project.findUnique({ where: { id: parent.projectId }, include: { evaluations: true } }),
    criterion: (parent: { criterionId: string }) =>
      prisma.criterion.findUnique({ where: { id: parent.criterionId }, include: { evaluations: true } }),
  },
};

// --- Apollo Server ---

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({ schema });

async function startServer() {
  await ensureDefaultAdminUser();
  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        let currentUser = null;

        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          const payload = verifyToken(token);
          if (payload) {
            currentUser = await prisma.user.findUnique({ where: { id: payload.sub } });
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
  console.error('Error starting server:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
