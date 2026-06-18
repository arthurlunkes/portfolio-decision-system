import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../../core/config/database.config.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again later." },
});

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post("/login", loginRateLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request payload" });
  }

  const { email, password } = parsed.data;

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
    const jwtSecret = process.env.JWT_SECRET || "dev-secret";
    const token = jwt.sign(
      { sub: safeUser.id, email: safeUser.email, role: safeUser.role },
      jwtSecret,
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

export default router;
