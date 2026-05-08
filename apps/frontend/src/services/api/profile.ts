import { gql } from "./client";
import type { User, UserRole } from "./users";

export async function getMe(): Promise<User> {
  const data = await gql<{ me: User }>(
    `query { me { id name email role active createdAt } }`,
  );
  return data.me;
}

export async function updateProfile(
  id: string,
  input: { name: string; email: string; role: UserRole; active: boolean },
): Promise<User> {
  const data = await gql<{ updateUser: User }>(
    `mutation($id: ID!, $input: UpdateUserInput!) { updateUser(id: $id, input: $input) { id name email role active createdAt } }`,
    { id, input },
  );
  return data.updateUser;
}

export async function updateProfilePassword(
  userId: string,
  newPassword: string,
): Promise<boolean> {
  const data = await gql<{ changePassword: boolean }>(
    `mutation($userId: ID!, $newPassword: String!) { changePassword(userId: $userId, newPassword: $newPassword) }`,
    { userId, newPassword },
  );
  return data.changePassword;
}
