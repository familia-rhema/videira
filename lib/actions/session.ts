'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getUserById } from '@/lib/store/users';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function switchUserAction(userId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) return;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
}
