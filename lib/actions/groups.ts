'use server';

import { revalidatePath } from 'next/cache';
import {
  createGroup,
  deleteGroup,
  updateGroup,
} from '@/lib/store/groups';
import { getSessionUser } from '@/lib/auth/session';
import { isAdminOrLider } from '@/lib/access';
import type { GroupFilter } from '@/lib/types/group';
import type { SeedGender } from '@/lib/types/seed';

export type GroupActionState = {
  error?: string;
  success?: string;
};

const VALID_GENDERS: SeedGender[] = ['masculino', 'feminino', 'outro'];

function parseFilter(formData: FormData): GroupFilter | { error: string } {
  const filterType = String(formData.get('filterType') ?? '').trim();

  if (filterType === 'neighborhood') {
    const neighborhoods = formData.getAll('neighborhoods').map(String).filter(Boolean);
    if (neighborhoods.length === 0) {
      return { error: 'Selecione ao menos um bairro.' };
    }
    return { type: 'neighborhood', neighborhoods };
  }

  if (filterType === 'gender') {
    const genders = formData
      .getAll('genders')
      .map(String)
      .filter((value): value is SeedGender => VALID_GENDERS.includes(value as SeedGender));
    if (genders.length === 0) {
      return { error: 'Selecione ao menos um sexo.' };
    }
    return { type: 'gender', genders };
  }

  if (filterType === 'manual') {
    const seedIds = formData.getAll('seedIds').map(String).filter(Boolean);
    if (seedIds.length === 0) {
      return { error: 'Selecione ao menos uma semente.' };
    }
    return { type: 'manual', seedIds };
  }

  return { error: 'Selecione o tipo de filtro do grupo.' };
}

export async function createGroupAction(
  _prevState: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  const currentUser = await getSessionUser();
  if (!isAdminOrLider(currentUser)) {
    return { error: 'Você não tem permissão para gerenciar grupos.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  const memberIds = formData.getAll('memberIds').map(String).filter(Boolean);

  if (!name) {
    return { error: 'Informe o nome do grupo.' };
  }

  const filter = parseFilter(formData);
  if ('error' in filter) {
    return { error: filter.error };
  }

  try {
    await createGroup({
      name,
      memberIds,
      filter,
      createdById: currentUser.id,
    });

    revalidatePath('/equipe');
    return { success: 'Grupo criado.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Não foi possível criar o grupo.',
    };
  }
}

export async function updateGroupAction(
  _prevState: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  const currentUser = await getSessionUser();
  if (!isAdminOrLider(currentUser)) {
    return { error: 'Você não tem permissão para gerenciar grupos.' };
  }

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const memberIds = formData.getAll('memberIds').map(String).filter(Boolean);

  if (!id || !name) {
    return { error: 'Dados inválidos para atualizar o grupo.' };
  }

  const filter = parseFilter(formData);
  if ('error' in filter) {
    return { error: filter.error };
  }

  try {
    await updateGroup({ id, name, memberIds, filter });
    revalidatePath('/equipe');
    return { success: 'Grupo atualizado.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Não foi possível atualizar o grupo.',
    };
  }
}

export async function deleteGroupAction(
  _prevState: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  const currentUser = await getSessionUser();
  if (!isAdminOrLider(currentUser)) {
    return { error: 'Você não tem permissão para gerenciar grupos.' };
  }

  const id = String(formData.get('id') ?? '').trim();
  if (!id) {
    return { error: 'Grupo inválido.' };
  }

  try {
    await deleteGroup(id);
    revalidatePath('/equipe');
    return { success: 'Grupo removido.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Não foi possível remover o grupo.',
    };
  }
}
