'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { findUserByCpf, findUserByEmail } from '@/lib/store/users';
import { verifyPassword } from '@/lib/auth/password';
import { SESSION_COOKIE } from '@/lib/auth/session';

export type AuthState = {
  error?: string;
};

const ONE_YEAR = 60 * 60 * 24 * 365;

async function startSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    path: '/',
    maxAge: ONE_YEAR,
    sameSite: 'lax',
    httpOnly: true,
  });
}

export async function loginWithPasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { error: 'Email ou senha incorretos.' };
  }

  await startSession(user.id);
  redirect('/');
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export async function loginWithCpfAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const cpf = onlyDigits(String(formData.get('cpf') ?? ''));
  const dataNascimento = String(formData.get('dataNascimento') ?? '').trim();

  const user = await findUserByCpf(cpf);
  if (!user || !user.dataNascimento || user.dataNascimento !== dataNascimento) {
    return { error: 'CPF ou data de nascimento incorretos.' };
  }

  await startSession(user.id);
  redirect('/');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/login');
}
