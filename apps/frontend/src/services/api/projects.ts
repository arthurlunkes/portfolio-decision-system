import { gql } from './client'

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
}

const FIELDS = 'id name description createdAt'

export async function getProjects(): Promise<Project[]> {
  const data = await gql<{ projects: Project[] }>(`query { projects { ${FIELDS} } }`)
  return data.projects
}

export async function createProject(input: { name: string; description: string }): Promise<Project> {
  const data = await gql<{ createProject: Project }>(
    `mutation($input: CreateProjectInput!) { createProject(input: $input) { ${FIELDS} } }`,
    { input },
  )
  return data.createProject
}

export async function updateProject(
  id: string,
  input: { name: string; description: string },
): Promise<Project> {
  const data = await gql<{ updateProject: Project }>(
    `mutation($id: ID!, $input: CreateProjectInput!) { updateProject(id: $id, input: $input) { ${FIELDS} } }`,
    { id, input },
  )
  return data.updateProject
}

export async function deleteProject(id: string): Promise<boolean> {
  const data = await gql<{ deleteProject: boolean }>(
    `mutation($id: ID!) { deleteProject(id: $id) }`,
    { id },
  )
  return data.deleteProject
}
