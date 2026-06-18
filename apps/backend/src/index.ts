import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import prisma from "./core/config/database.config.js";
import { buildContext } from "./graphql/context.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { typeDefs } from "./graphql/schema.js";
import authRoutes from "./http/routes/auth.routes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use("/api/auth", authRoutes);

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
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) return;
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: { name: adminName, email: adminEmail, passwordHash, role: "ADMIN", active: true },
  });
  console.log(`[auth] default admin user created for ${adminEmail}`);
}

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({ schema });

async function startServer() {
  await ensureDefaultAdminUser();
  await server.start();
  app.use("/graphql", expressMiddleware(server, { context: buildContext }));
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
