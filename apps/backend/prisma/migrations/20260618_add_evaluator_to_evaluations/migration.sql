-- Migration: add evaluatorId to evaluations + update unique constraint
-- This enables multi-evaluator support for the 2-Tuple VIKOR model

-- Step 1: drop the old single-evaluator unique constraint
ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_projectId_criterionId_key";

-- Step 2: add evaluatorId column (nullable first so existing rows don't fail)
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "evaluatorId" TEXT;

-- Step 3: backfill existing rows with the admin user id (first user by creation date)
UPDATE "evaluations"
SET "evaluatorId" = (SELECT id FROM "users" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "evaluatorId" IS NULL;

-- Step 4: make it NOT NULL now that all rows have a value
ALTER TABLE "evaluations" ALTER COLUMN "evaluatorId" SET NOT NULL;

-- Step 5: add the foreign key
ALTER TABLE "evaluations"
  ADD CONSTRAINT "evaluations_evaluatorId_fkey"
  FOREIGN KEY ("evaluatorId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Step 6: add the new composite unique constraint
ALTER TABLE "evaluations"
  ADD CONSTRAINT "evaluations_projectId_criterionId_evaluatorId_key"
  UNIQUE ("projectId", "criterionId", "evaluatorId");
