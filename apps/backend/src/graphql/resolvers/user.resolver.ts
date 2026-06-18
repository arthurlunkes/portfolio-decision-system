import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../../core/config/database.config.js";
import { requireAdmin, requireAuth, type Context } from "../context.js";

const passwordSchema = z.string().min(8).max(128);

export const userResolvers = {
  Query: {
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
  },
  Mutation: {
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
  },
};
