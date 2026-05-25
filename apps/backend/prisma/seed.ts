import { CriterionType, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const linguisticValues: Record<string, number> = {
  "very-low": (0 + 0 + 0.2) / 3,
  low: (0 + 0.2 + 0.4) / 3,
  "medium-low": (0.2 + 0.4 + 0.6) / 3,
  medium: (0.4 + 0.5 + 0.6) / 3,
  "medium-high": (0.4 + 0.6 + 0.8) / 3,
  high: (0.6 + 0.8 + 1.0) / 3,
  "very-high": (0.8 + 1.0 + 1.0) / 3,
};

async function upsertUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  await prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      role: data.role,
      active: true,
      passwordHash,
    },
    create: {
      name: data.name,
      email: data.email,
      role: data.role,
      active: true,
      passwordHash,
    },
  });
}

async function getOrCreateProject(name: string, description: string) {
  const existing = await prisma.project.findFirst({ where: { name } });
  if (existing) return existing;

  return prisma.project.create({ data: { name, description } });
}

async function getOrCreateCriterion(data: {
  name: string;
  description: string;
  weight: number;
  type: CriterionType;
}) {
  const existing = await prisma.criterion.findFirst({
    where: { name: data.name },
  });
  if (existing) {
    return prisma.criterion.update({
      where: { id: existing.id },
      data: {
        description: data.description,
        weight: data.weight,
        type: data.type,
      },
    });
  }

  return prisma.criterion.create({ data });
}

async function main() {
  const seedPassword = process.env.SEED_DEFAULT_PASSWORD || "Decisor@123";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@tcc.local")
    .trim()
    .toLowerCase();
  const adminName = (process.env.ADMIN_NAME || "Administrador").trim();
  const adminPassword = process.env.ADMIN_PASSWORD || seedPassword;

  await upsertUser({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: UserRole.ADMIN,
  });

  await upsertUser({
    name: "Decisor Demo",
    email: "decisor@tcc.local",
    password: seedPassword,
    role: UserRole.DECISOR,
  });

  await upsertUser({
    name: "Analista Demo",
    email: "analyst@tcc.local",
    password: seedPassword,
    role: UserRole.ANALYST,
  });

  await upsertUser({
    name: "Visualizador Demo",
    email: "viewer@tcc.local",
    password: seedPassword,
    role: UserRole.VIEWER,
  });

  const projects = await Promise.all([
    getOrCreateProject(
      "Portal do Cidadão",
      "Modernização de serviços digitais para atendimento público.",
    ),
    getOrCreateProject(
      "Data Lake Corporativo",
      "Plataforma integrada para governança e análise de dados.",
    ),
    getOrCreateProject(
      "Aplicativo Mobile de Campo",
      "Digitalização de operações externas com coleta offline.",
    ),
  ]);

  const criteria = await Promise.all([
    getOrCreateCriterion({
      name: "Retorno Estratégico",
      description: "Contribuição para objetivos estratégicos.",
      weight: 0.35,
      type: CriterionType.BENEFIT,
    }),
    getOrCreateCriterion({
      name: "Viabilidade Técnica",
      description: "Facilidade técnica de implementação.",
      weight: 0.25,
      type: CriterionType.BENEFIT,
    }),
    getOrCreateCriterion({
      name: "Urgência",
      description: "Necessidade de execução no curto prazo.",
      weight: 0.2,
      type: CriterionType.BENEFIT,
    }),
    getOrCreateCriterion({
      name: "Custo Total",
      description: "Custo estimado para entrega e sustentação.",
      weight: 0.2,
      type: CriterionType.COST,
    }),
  ]);

  const matrix: Record<string, Record<string, string>> = {
    "Portal do Cidadão": {
      "Retorno Estratégico": "very-high",
      "Viabilidade Técnica": "medium-high",
      Urgência: "high",
      "Custo Total": "medium",
    },
    "Data Lake Corporativo": {
      "Retorno Estratégico": "high",
      "Viabilidade Técnica": "medium",
      Urgência: "medium-low",
      "Custo Total": "high",
    },
    "Aplicativo Mobile de Campo": {
      "Retorno Estratégico": "medium-high",
      "Viabilidade Técnica": "high",
      Urgência: "medium-high",
      "Custo Total": "medium-low",
    },
  };

  for (const project of projects) {
    const projectTerms = matrix[project.name];
    for (const criterion of criteria) {
      const term = projectTerms[criterion.name] ?? "medium";
      const fuzzyValue = linguisticValues[term] ?? linguisticValues.medium;

      await prisma.evaluation.upsert({
        where: {
          projectId_criterionId: {
            projectId: project.id,
            criterionId: criterion.id,
          },
        },
        update: {
          linguisticTerm: term,
          fuzzyValue,
          label: term,
          alpha: fuzzyValue,
        },
        create: {
          projectId: project.id,
          criterionId: criterion.id,
          linguisticTerm: term,
          fuzzyValue,
          label: term,
          alpha: fuzzyValue,
        },
      });
    }
  }

  console.log("[seed] base de dados populada com sucesso.");
}

main()
  .catch((error) => {
    console.error("[seed] erro ao popular dados:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
