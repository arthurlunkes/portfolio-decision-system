import { gql } from "./client";

export type UserRole = "ADMIN" | "DECISOR" | "ANALYST" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

const FIELDS = "id name email role active createdAt";

export async function getUsers(): Promise<User[]> {
  const data = await gql<{ users: User[] }>(`query { users { ${FIELDS} } }`);
  return data.users;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}): Promise<User> {
  const data = await gql<{ createUser: User }>(
    `mutation($input: CreateUserInput!) { createUser(input: $input) { ${FIELDS} } }`,
    { input },
  );
  return data.createUser;
}

export async function updateUser(
  id: string,
  input: { name: string; email: string; role: UserRole; active: boolean },
): Promise<User> {
  const data = await gql<{ updateUser: User }>(
    `mutation($id: ID!, $input: UpdateUserInput!) { updateUser(id: $id, input: $input) { ${FIELDS} } }`,
    { id, input },
  );
  return data.updateUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const data = await gql<{ deleteUser: boolean }>(
    `mutation($id: ID!) { deleteUser(id: $id) }`,
    { id },
  );
  return data.deleteUser;
}

export async function changePassword(
  userId: string,
  newPassword: string,
): Promise<boolean> {
  const data = await gql<{ changePassword: boolean }>(
    `mutation($userId: ID!, $newPassword: String!) { changePassword(userId: $userId, newPassword: $newPassword) }`,
    { userId, newPassword },
  );
  return data.changePassword;
}
