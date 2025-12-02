import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const validEmails = new Set(['admin@local', 'admin']);
  const isValid = validEmails.has(String(email)) && String(password) === 'admin';
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const user = { id: '1', name: 'Administrador', email: 'admin@local', role: 'ADMIN' };
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
  return res.json({ token, user });
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
  await server.start();
  app.use('/graphql', expressMiddleware(server));
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});
