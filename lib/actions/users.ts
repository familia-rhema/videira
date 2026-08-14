'use server';

import { revalidatePath } from 'next/cache';
import { updateUserRole } from '@/lib/store/users';
import { getSessionUser } from '@/lib/auth/session';
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
