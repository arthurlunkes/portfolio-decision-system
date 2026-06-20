import { gql } from './client'

export interface DecissorPortfolio {
  id: string
  portfolioId: string
  evaluatorId: string
  evaluator: { id: string; name: string; email: string }
  weightLinguistic: string
  weightNumeric: number
  weightNormalized: number
  createdAt: string
  updatedAt: string
}

// Escala de expertise: EN(0)…IM(4, default)…EM(6)
export const EXPERTISE_TERMS = [
  { label: 'EN – Extremamente Não importante', value: 'EN', numeric: 0 },
  { label: 'IN – Indiferente',                value: 'IN', numeric: 1 },
  { label: 'PI – Pouco Importante',           value: 'PI', numeric: 2 },
  { label: 'OI – Mais ou menos importante',   value: 'OI', numeric: 3 },
  { label: 'IM – Importante (padrão)',         value: 'IM', numeric: 4 },
  { label: 'MI – Muito Importante',            value: 'MI', numeric: 5 },
  { label: 'EM – Extremamente importante',     value: 'EM', numeric: 6 },
]

const FIELDS = `
  id portfolioId evaluatorId
  evaluator { id name email }
  weightLinguistic weightNumeric weightNormalized
  createdAt updatedAt
`

export async function getDecissorPortfolios(portfolioId: string): Promise<DecissorPortfolio[]> {
  const data = await gql<{ decissorPortfolios: DecissorPortfolio[] }>(
    `query($portfolioId: ID!) { decissorPortfolios(portfolioId: $portfolioId) { ${FIELDS} } }`,
    { portfolioId },
  )
  return data.decissorPortfolios
}

export async function upsertDecissorPortfolio(
  portfolioId: string,
  evaluatorId: string,
  weightLinguistic: string,
): Promise<DecissorPortfolio> {
  const data = await gql<{ upsertDecissorPortfolio: DecissorPortfolio }>(
    `mutation($portfolioId: ID!, $evaluatorId: ID!, $weightLinguistic: String!) {
       upsertDecissorPortfolio(portfolioId: $portfolioId, evaluatorId: $evaluatorId, weightLinguistic: $weightLinguistic) { ${FIELDS} }
     }`,
    { portfolioId, evaluatorId, weightLinguistic },
  )
  return data.upsertDecissorPortfolio
}

export async function deleteDecissorPortfolio(
  portfolioId: string,
  evaluatorId: string,
): Promise<boolean> {
  const data = await gql<{ deleteDecissorPortfolio: boolean }>(
    `mutation($portfolioId: ID!, $evaluatorId: ID!) {
       deleteDecissorPortfolio(portfolioId: $portfolioId, evaluatorId: $evaluatorId)
     }`,
    { portfolioId, evaluatorId },
  )
  return data.deleteDecissorPortfolio
}
