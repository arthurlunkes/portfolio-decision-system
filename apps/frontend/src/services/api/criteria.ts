import { gql } from './client'

export interface Criterion {
  id: string
  portfolioId: string
  name: string
  description: string
  weight: number
  type: 'BENEFIT' | 'COST'
}

const FIELDS = 'id portfolioId name description weight type'

export async function getCriteria(portfolioId?: string): Promise<Criterion[]> {
  const data = await gql<{ criteria: Criterion[] }>(
    `query($portfolioId: ID) { criteria(portfolioId: $portfolioId) { ${FIELDS} } }`,
    { portfolioId },
  )
  return data.criteria
}

export async function createCriterion(input: {
  portfolioId: string
  name: string
  description: string
  weight: number
  type: 'BENEFIT' | 'COST'
}): Promise<Criterion> {
  const data = await gql<{ createCriterion: Criterion }>(
    `mutation($input: CreateCriterionInput!) { createCriterion(input: $input) { ${FIELDS} } }`,
    { input },
  )
  return data.createCriterion
}

export async function updateCriterion(
  id: string,
  input: { portfolioId: string; name: string; description: string; weight: number; type: 'BENEFIT' | 'COST' },
): Promise<Criterion> {
  const data = await gql<{ updateCriterion: Criterion }>(
    `mutation($id: ID!, $input: CreateCriterionInput!) { updateCriterion(id: $id, input: $input) { ${FIELDS} } }`,
    { id, input },
  )
  return data.updateCriterion
}

export async function deleteCriterion(id: string): Promise<boolean> {
  const data = await gql<{ deleteCriterion: boolean }>(
    `mutation($id: ID!) { deleteCriterion(id: $id) }`,
    { id },
  )
  return data.deleteCriterion
}
