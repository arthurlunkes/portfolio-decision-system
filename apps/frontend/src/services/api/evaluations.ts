import { gql } from './client'

export interface Evaluation {
  id: string
  evaluatorId: string
  project: { id: string; name: string }
  criterion: { id: string; name: string }
  linguisticTerm: string
  fuzzyValue: number
}

const FIELDS = 'id evaluatorId linguisticTerm fuzzyValue project { id name } criterion { id name }'

export async function getEvaluations(params?: { projectId?: string; evaluatorId?: string }): Promise<Evaluation[]> {
  const data = await gql<{ evaluations: Evaluation[] }>(
    `query($projectId: ID, $evaluatorId: ID) { evaluations(projectId: $projectId, evaluatorId: $evaluatorId) { ${FIELDS} } }`,
    { projectId: params?.projectId, evaluatorId: params?.evaluatorId },
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

export async function deleteEvaluation(id: string): Promise<boolean> {
  const data = await gql<{ deleteEvaluation: boolean }>(
    `mutation($id: ID!) { deleteEvaluation(id: $id) }`,
    { id },
  )
  return data.deleteEvaluation
}
