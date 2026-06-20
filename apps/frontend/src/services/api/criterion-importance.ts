import { gql } from './client'

export interface CriterionImportance {
  id: string
  criterion: { id: string; name: string; description: string; type: string }
  evaluator: { id: string; name: string }
  portfolioId: string
  linguisticTerm: string
  numericValue: number
  createdAt: string
  updatedAt: string
}

export interface CriterionComputedWeight {
  criterionId: string
  criterionName: string
  delta: number
  omega: number
  omegaPct: number
}

// Escala de importância (mesma do grau de expertise do decisor)
export const IMPORTANCE_TERMS = [
  { value: 'EN', label: 'EN – Extremamente insignificante', numeric: 0 },
  { value: 'IN', label: 'IN – Insignificante',              numeric: 1 },
  { value: 'PI', label: 'PI – Pouco importante',            numeric: 2 },
  { value: 'OI', label: 'OI – Moderadamente importante',    numeric: 3 },
  { value: 'IM', label: 'IM – Importante',                  numeric: 4 },
  { value: 'MI', label: 'MI – Muito importante',            numeric: 5 },
  { value: 'EM', label: 'EM – Extremamente importante',     numeric: 6 },
]

const FIELDS = `
  id portfolioId linguisticTerm numericValue createdAt updatedAt
  criterion { id name description type }
  evaluator { id name }
`

export async function getCriterionImportances(
  portfolioId: string,
  evaluatorId?: string,
): Promise<CriterionImportance[]> {
  const data = await gql<{ criterionImportances: CriterionImportance[] }>(
    `query($portfolioId: ID!, $evaluatorId: ID) {
       criterionImportances(portfolioId: $portfolioId, evaluatorId: $evaluatorId) { ${FIELDS} }
     }`,
    { portfolioId, evaluatorId },
  )
  return data.criterionImportances
}

export async function upsertCriterionImportance(
  criterionId: string,
  portfolioId: string,
  linguisticTerm: string,
): Promise<CriterionImportance> {
  const data = await gql<{ upsertCriterionImportance: CriterionImportance }>(
    `mutation($criterionId: ID!, $portfolioId: ID!, $linguisticTerm: String!) {
       upsertCriterionImportance(criterionId: $criterionId, portfolioId: $portfolioId, linguisticTerm: $linguisticTerm) { ${FIELDS} }
     }`,
    { criterionId, portfolioId, linguisticTerm },
  )
  return data.upsertCriterionImportance
}

export async function getComputedCriterionWeights(
  portfolioId: string,
): Promise<CriterionComputedWeight[]> {
  const data = await gql<{ computedCriterionWeights: CriterionComputedWeight[] }>(
    `query($portfolioId: ID!) {
       computedCriterionWeights(portfolioId: $portfolioId) {
         criterionId criterionName delta omega omegaPct
       }
     }`,
    { portfolioId },
  )
  return data.computedCriterionWeights
}
