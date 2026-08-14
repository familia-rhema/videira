'use server';

import { revalidatePath } from 'next/cache';
import { createUser, findUserByCpf, findUserByEmail, updateUserRole } from '@/lib/store/users';
import { getSessionUser } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import type { UserRole } from '@/lib/types/seed';

export type UserActionState = {
  error?: string;
  success?: string;
};

const VALID_ROLES: UserRole[] = ['admin', 'lider', 'voluntario'];

export async function updateUserRoleAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const userId = String(formData.get('userId') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim() as UserRole;

  if (!userId || !VALID_ROLES.includes(role)) {
    return { error: 'Selecione um papel válido.' };
  }

  const currentUser = await getSessionUser();
  if (currentUser.role !== 'admin') {
    return { error: 'Só administradores podem alterar papéis.' };
  }

  try {
    await updateUserRole(userId, role);
    revalidatePath('/equipe');
    return { success: 'Papel atualizado.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Não foi possível atualizar o papel.',
    };
  }
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export async function createUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const currentUser = await getSessionUser();
  if (currentUser.role !== 'admin') {
    return { error: 'Só administradores podem criar contas.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim() as UserRole;

  if (!name || !VALID_ROLES.includes(role)) {
    return { error: 'Preencha o nome e selecione um papel válido.' };
  }

  if (role === 'voluntario') {
    const cpf = onlyDigits(String(formData.get('cpf') ?? ''));
    const dataNascimento = String(formData.get('dataNascimento') ?? '').trim();

    if (cpf.length !== 11 || !dataNascimento) {
      return { error: 'Informe um CPF válido (11 dígitos) e a data de nascimento.' };
    }

    if (await findUserByCpf(cpf)) {
      return { error: 'Já existe uma conta com esse CPF.' };
    }

    await createUser({ name, email: '', role, cpf, dataNascimento });
  } else {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || password.length < 6) {
      return { error: 'Informe um email e uma senha com pelo menos 6 caracteres.' };
    }

    if (await findUserByEmail(email)) {
      return { error: 'Já existe uma conta com esse email.' };
    }

    await createUser({ name, email, role, passwordHash: hashPassword(password) });
  }

  revalidatePath('/equipe');
  return { success: 'Conta criada.' };
}
