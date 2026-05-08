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

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
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
  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`[auth] default admin user created for ${adminEmail}`);
}

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : true,
    credentials: true,
  }),
);
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
    if (!user) {
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

  enum CriterionType {
    BENEFIT
    COST
  }

  type Query {
    projects: [Project!]!
    project(id: ID!): Project
    criteria: [Criterion!]!
    criterion(id: ID!): Criterion
    evaluations(projectId: ID): [Evaluation!]!
    vikorRanking: [VIKORResult!]!
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
    
    calculateVIKOR: [VIKORResult!]!
  }
`;

const resolvers = {
  Query: {
    projects: () => [],
    project: () => null,
    criteria: () => [],
    criterion: () => null,
    evaluations: () => [],
    vikorRanking: () => [],
  },
  Mutation: {
    createProject: () => null,
    updateProject: () => null,
    deleteProject: () => false,
    createCriterion: () => null,
    updateCriterion: () => null,
    deleteCriterion: () => false,
    createEvaluation: () => null,
    updateEvaluation: () => null,
    deleteEvaluation: () => false,
    calculateVIKOR: () => [],
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
});

async function startServer() {
  await ensureDefaultAdminUser();
  await server.start();
  app.use('/graphql', expressMiddleware(server));
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
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
