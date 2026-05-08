import { gql } from './client'

export interface VIKORResult {
  project: { id: string; name: string }
  sValue: number
  rValue: number
  qValue: number
  rank: number
  isAcceptable: boolean
}

const FIELDS = 'project { id name } sValue rValue qValue rank isAcceptable'

export async function getVikorRanking(): Promise<VIKORResult[]> {
  const data = await gql<{ vikorRanking: VIKORResult[] }>(
    `query { vikorRanking { ${FIELDS} } }`,
  )
  return data.vikorRanking
}
