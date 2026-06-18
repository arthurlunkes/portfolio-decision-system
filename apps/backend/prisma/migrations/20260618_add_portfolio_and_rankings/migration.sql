-- Migration: add Portfolio entity, FK on projects/criteria, Ranking + RankingPosition

-- 1. Create portfolios table
CREATE TABLE "portfolios" (
  "id"          TEXT        NOT NULL,
  "name"        TEXT        NOT NULL,
  "description" TEXT        NOT NULL DEFAULT '',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- 2. Seed a default portfolio so existing projects/criteria can be migrated
INSERT INTO "portfolios" ("id", "name", "description", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Portfólio Padrão', 'Portfólio criado automaticamente durante a migração', CURRENT_TIMESTAMP);

-- 3. Add portfolioId to projects (nullable first, then backfill, then NOT NULL)
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "portfolioId" TEXT;
UPDATE "projects" SET "portfolioId" = '00000000-0000-0000-0000-000000000001' WHERE "portfolioId" IS NULL;
ALTER TABLE "projects" ALTER COLUMN "portfolioId" SET NOT NULL;
ALTER TABLE "projects"
  ADD CONSTRAINT "projects_portfolioId_fkey"
  FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE;

-- 4. Add portfolioId to criteria
ALTER TABLE "criteria" ADD COLUMN IF NOT EXISTS "portfolioId" TEXT;
UPDATE "criteria" SET "portfolioId" = '00000000-0000-0000-0000-000000000001' WHERE "portfolioId" IS NULL;
ALTER TABLE "criteria" ALTER COLUMN "portfolioId" SET NOT NULL;
ALTER TABLE "criteria"
  ADD CONSTRAINT "criteria_portfolioId_fkey"
  FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE;

-- 5. Create rankings table
CREATE TABLE "rankings" (
  "id"          TEXT         NOT NULL,
  "portfolioId" TEXT         NOT NULL,
  "executedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "v"           DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  CONSTRAINT "rankings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "rankings_portfolioId_fkey"
    FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE
);

-- 6. Create ranking_positions table
CREATE TABLE "ranking_positions" (
  "id"          TEXT             NOT NULL,
  "rankingId"   TEXT             NOT NULL,
  "projectId"   TEXT             NOT NULL,
  "sValue"      DOUBLE PRECISION NOT NULL,
  "rValue"      DOUBLE PRECISION NOT NULL,
  "qValue"      DOUBLE PRECISION NOT NULL,
  "rank"        INTEGER          NOT NULL,
  "c1Satisfied" BOOLEAN          NOT NULL,
  "c2Satisfied" BOOLEAN          NOT NULL,
  CONSTRAINT "ranking_positions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ranking_positions_rankingId_fkey"
    FOREIGN KEY ("rankingId") REFERENCES "rankings"("id") ON DELETE CASCADE,
  CONSTRAINT "ranking_positions_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
);
