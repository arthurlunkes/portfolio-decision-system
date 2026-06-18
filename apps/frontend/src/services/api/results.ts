import { gql } from './client'

export interface VIKORResult {
  project: { id: string; name: string }
  sValue: number
  rValue: number
  qValue: number
  rank: number
  isAcceptable: boolean
  c1Satisfied: boolean
  c2Satisfied: boolean
}

export interface RankingPosition {
  id: string
  project: { id: string; name: string }
  sValue: number
  rValue: number
  qValue: number
  rank: number
  c1Satisfied: boolean
  c2Satisfied: boolean
}

export interface RankingRecord {
  id: string
  portfolioId: string
  executedAt: string
  v: number
  positions: RankingPosition[]
}

const VIKOR_FIELDS = 'project { id name } sValue rValue qValue rank isAcceptable c1Satisfied c2Satisfied'
const POSITION_FIELDS = 'id project { id name } sValue rValue qValue rank c1Satisfied c2Satisfied'

export async function getVikorRanking(portfolioId: string): Promise<VIKORResult[]> {
  const data = await gql<{ vikorRanking: VIKORResult[] }>(
    `query($portfolioId: ID!) { vikorRanking(portfolioId: $portfolioId) { ${VIKOR_FIELDS} } }`,
    { portfolioId },
  )
  return data.vikorRanking
}

export async function calculateVIKOR(portfolioId: string): Promise<VIKORResult[]> {
  const data = await gql<{ calculateVIKOR: VIKORResult[] }>(
    `mutation($portfolioId: ID!) { calculateVIKOR(portfolioId: $portfolioId) { ${VIKOR_FIELDS} } }`,
    { portfolioId },
  )
  return data.calculateVIKOR
}

export async function getRankingHistory(portfolioId: string): Promise<RankingRecord[]> {
  const data = await gql<{ rankingHistory: RankingRecord[] }>(
    `query($portfolioId: ID!) { rankingHistory(portfolioId: $portfolioId) { id portfolioId executedAt v positions { ${POSITION_FIELDS} } } }`,
    { portfolioId },
  )
  return data.rankingHistory
}
