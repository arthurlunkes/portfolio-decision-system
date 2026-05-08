import { gql } from './client'

export interface Criterion {
  id: string
  name: string
  description: string
  weight: number
  type: 'BENEFIT' | 'COST'
}

const FIELDS = 'id name description weight type'

export async function getCriteria(): Promise<Criterion[]> {
  const data = await gql<{ criteria: Criterion[] }>(`query { criteria { ${FIELDS} } }`)
  return data.criteria
}

export async function createCriterion(input: {
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
  input: { name: string; description: string; weight: number; type: 'BENEFIT' | 'COST' },
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
