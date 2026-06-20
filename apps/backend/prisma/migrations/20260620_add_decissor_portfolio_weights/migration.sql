-- CreateTable: vínculo avaliador-portfólio com peso linguístico de expertise (λk)
-- Escala de grau de importância: EN(0) IN(1) PI(2) OI(3) IM(4) MI(5) EM(6)
-- Default: IM = 4 → resulta em pesos iguais quando todos os decisores têm o mesmo grau
CREATE TABLE "decissor_portfolio" (
    "id"               TEXT NOT NULL,
    "portfolioId"      TEXT NOT NULL,
    "evaluatorId"      TEXT NOT NULL,
    "weightLinguistic" TEXT NOT NULL DEFAULT 'IM',
    "weightNumeric"    DOUBLE PRECISION NOT NULL DEFAULT 4,
    "weightNormalized" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decissor_portfolio_pkey" PRIMARY KEY ("id")
);

-- UniqueConstraint: um decisor aparece no máximo uma vez por portfólio
CREATE UNIQUE INDEX "decissor_portfolio_portfolioId_evaluatorId_key"
    ON "decissor_portfolio"("portfolioId", "evaluatorId");

-- ForeignKeys
ALTER TABLE "decissor_portfolio"
    ADD CONSTRAINT "decissor_portfolio_portfolioId_fkey"
    FOREIGN KEY ("portfolioId")
    REFERENCES "portfolios"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "decissor_portfolio"
    ADD CONSTRAINT "decissor_portfolio_evaluatorId_fkey"
    FOREIGN KEY ("evaluatorId")
    REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
