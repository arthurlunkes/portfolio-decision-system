CREATE TABLE "criterion_importances" (
    "id"             TEXT NOT NULL,
    "criterionId"    TEXT NOT NULL,
    "evaluatorId"    TEXT NOT NULL,
    "portfolioId"    TEXT NOT NULL,
    "linguisticTerm" TEXT NOT NULL,
    "numericValue"   DOUBLE PRECISION NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "criterion_importances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "criterion_importances_criterionId_evaluatorId_key"
    ON "criterion_importances"("criterionId", "evaluatorId");

ALTER TABLE "criterion_importances"
    ADD CONSTRAINT "criterion_importances_criterionId_fkey"
    FOREIGN KEY ("criterionId")
    REFERENCES "criteria"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "criterion_importances"
    ADD CONSTRAINT "criterion_importances_evaluatorId_fkey"
    FOREIGN KEY ("evaluatorId")
    REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "criterion_importances"
    ADD CONSTRAINT "criterion_importances_portfolioId_fkey"
    FOREIGN KEY ("portfolioId")
    REFERENCES "portfolios"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
