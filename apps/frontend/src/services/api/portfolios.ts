import { gql } from './client'

export interface Portfolio {
  id: string
  name: string
  description: string
  createdAt: string
}

const FIELDS = 'id name description createdAt'

export async function getPortfolios(): Promise<Portfolio[]> {
  const data = await gql<{ portfolios: Portfolio[] }>(`query { portfolios { ${FIELDS} } }`)
  return data.portfolios
}

export async function createPortfolio(input: { name: string; description?: string }): Promise<Portfolio> {
  const data = await gql<{ createPortfolio: Portfolio }>(
    `mutation($input: CreatePortfolioInput!) { createPortfolio(input: $input) { ${FIELDS} } }`,
    { input },
  )
  return data.createPortfolio
}

export async function updatePortfolio(
  id: string,
  input: { name: string; description?: string },
): Promise<Portfolio> {
  const data = await gql<{ updatePortfolio: Portfolio }>(
    `mutation($id: ID!, $input: CreatePortfolioInput!) { updatePortfolio(id: $id, input: $input) { ${FIELDS} } }`,
    { id, input },
  )
  return data.updatePortfolio
}

export async function deletePortfolio(id: string): Promise<boolean> {
  const data = await gql<{ deletePortfolio: boolean }>(
    `mutation($id: ID!) { deletePortfolio(id: $id) }`,
    { id },
  )
  return data.deletePortfolio
}
