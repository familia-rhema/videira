import { cookies } from 'next/headers';
import { getUserById, listUsers } from '@/lib/store/users';
import type { User } from '@/lib/types/seed';

/** Sessão mock estilo Notion: sem login real, apenas troca de cookie. */
export const SESSION_COOKIE = 'sporos-user-id';

async function getDefaultUser(): Promise<User> {
  const users = await listUsers();
  return users.find((user) => user.role === 'admin') ?? users[0];
}

export async function getSessionUserId(): Promise<string> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(SESSION_COOKIE)?.value;

  if (cookieId && (await getUserById(cookieId))) {
    return cookieId;
  }

  const fallback = await getDefaultUser();
  return fallback.id;
}

export async function getSessionUser(): Promise<User> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(SESSION_COOKIE)?.value;

  if (cookieId) {
    const user = await getUserById(cookieId);
    if (user) return user;
  }

  return getDefaultUser();
}
