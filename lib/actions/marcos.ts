'use server';

import { revalidatePath } from 'next/cache';
import { registerMarco } from '@/lib/store/seeds';
import type { MarcoType } from '@/lib/marcos';
import { getSessionUser } from '@/lib/auth/session';

export type RegisterMarcoState = {
  error?: string;
  success?: string;
};

export async function registerMarcoAction(
  _prevState: RegisterMarcoState,
  formData: FormData,
): Promise<RegisterMarcoState> {
  const seedId = String(formData.get('seedId') ?? '').trim();
  const marco = String(formData.get('marco') ?? '').trim() as MarcoType;
  const date = String(formData.get('date') ?? '').trim();
  const jaBatizadoExterno = formData.get('jaBatizadoExterno') === 'on';

  if (!seedId || !marco || !date) {
    return { error: 'Preencha todos os campos obrigatórios.' };
  }

  if (!['confissao', 'rhema', 'batismo', 'celula'].includes(marco)) {
    return { error: 'Marco inválido.' };
  }

  try {
    const actor = await getSessionUser();
    await registerMarco({
      seedId,
      marco,
      date,
      jaBatizadoExterno: marco === 'batismo' ? jaBatizadoExterno : undefined,
      actorId: actor.id,
    });

    revalidatePath(`/sementes/${seedId}`);
    revalidatePath('/sementes');
    revalidatePath('/');

    return { success: 'Marco registrado com sucesso.' };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o marco.',
    };
  }
}
