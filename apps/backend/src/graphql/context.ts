import type { Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../core/config/database.config.js";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface Context {
  currentUser: DbUser | null;
}

export function requireAuth(ctx: Context): DbUser {
  if (!ctx.currentUser) throw new Error("Unauthorized");
  return ctx.currentUser;
}

export function requireAdmin(ctx: Context): DbUser {
  const user = requireAuth(ctx);
  if (user.role !== "ADMIN") throw new Error("Forbidden: admin only");
  return user;
}

function verifyToken(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET || "dev-secret";
  try {
    return jwt.verify(token, secret, {
      issuer: "portfolio-backend",
      audience: "portfolio-frontend",
    }) as JwtPayload;
  } catch {
    return null;
  }
}

export async function buildContext({
  req,
}: {
  req: Request;
}): Promise<Context> {
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
}
