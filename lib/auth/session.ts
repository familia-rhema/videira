import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserById, listUsers } from '@/lib/store/users';
import type { User } from '@/lib/types/seed';

export const SESSION_COOKIE = 'sporos-user-id';

export async function getSessionUserId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(SESSION_COOKIE)?.value;
  if (cookieId && (await getUserById(cookieId))) return cookieId;
  return undefined;
}

/** Só chame em rotas protegidas pelo middleware — redireciona para /login se não houver sessão válida. */
export async function getSessionUser(): Promise<User> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(SESSION_COOKIE)?.value;

  const user = cookieId ? await getUserById(cookieId) : undefined;
  if (!user) redirect('/login');

  return user;
}

/**
 * Para páginas públicas (ex.: /inscricao): atribui a um admin quando não há
 * visitante logado, em vez de exigir login. Não concede acesso, só autoria.
 */
export async function getPublicActor(): Promise<User> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionUser = cookieId ? await getUserById(cookieId) : undefined;
  if (sessionUser) return sessionUser;

  const users = await listUsers();
  const admin = users.find((user) => user.role === 'admin') ?? users[0];
  if (!admin) throw new Error('Nenhum usuário cadastrado.');
  return admin;
}
