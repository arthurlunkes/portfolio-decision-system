import { gql } from './client'

export interface Evaluation {
  id: string
  project: { id: string; name: string }
  criterion: { id: string; name: string }
  linguisticTerm: string
  fuzzyValue: number
}

const FIELDS = 'id linguisticTerm fuzzyValue project { id name } criterion { id name }'

export async function getEvaluations(projectId?: string): Promise<Evaluation[]> {
  const data = await gql<{ evaluations: Evaluation[] }>(
    `query($projectId: ID) { evaluations(projectId: $projectId) { ${FIELDS} } }`,
    { projectId },
  )
  return data.evaluations
}

export async function createEvaluation(input: {
  projectId: string
  criterionId: string
  linguisticTerm: string
}): Promise<Evaluation> {
  const data = await gql<{ createEvaluation: Evaluation }>(
    `mutation($input: CreateEvaluationInput!) { createEvaluation(input: $input) { ${FIELDS} } }`,
    { input },
  )
  return data.createEvaluation
}
