'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  addReposicao,
  concludeTurma,
  createTurma,
  enrollStudent,
  setAttendance,
  setCertificateArt,
} from '@/lib/store/turmas';
import {
  createSeed,
  findSeedByPhone,
} from '@/lib/store/seeds';
import { isValidPhone } from '@/lib/phone';
import { getSessionUser } from '@/lib/auth/session';
import { RHEMA_TOTAL_AULAS } from '@/lib/types/turma';

export type TurmaActionState = {
  error?: string;
  success?: string;
};

export async function createTurmaAction(
  _prevState: TurmaActionState,
  formData: FormData,
): Promise<TurmaActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const lessonDates = Array.from({ length: RHEMA_TOTAL_AULAS }, (_, index) =>
    String(formData.get(`lesson-${index}`) ?? '').trim(),
  );

  if (!name) {
    return { error: 'Informe o nome da turma.' };
  }

  if (lessonDates.some((date) => !date)) {
    return { error: 'Defina a data das 5 aulas.' };
  }

  const currentUser = await getSessionUser();
  const turma = await createTurma({
    name,
    lessonDates,
    actorId: currentUser.id,
  });

  revalidatePath('/visao-rhema');
  redirect(`/visao-rhema/${turma.id}`);
}

export async function enrollStudentAction(
  _prevState: TurmaActionState,
  formData: FormData,
): Promise<TurmaActionState> {
  const turmaId = String(formData.get('turmaId') ?? '').trim();
  const seedId = String(formData.get('seedId') ?? '').trim();

  if (!turmaId || !seedId) {
    return { error: 'Selecione a semente.' };
  }

  try {
    const currentUser = await getSessionUser();
    await enrollStudent({ turmaId, seedId, actorId: currentUser.id });
    revalidatePath(`/visao-rhema/${turmaId}`);
    revalidatePath('/sementes');
    return { success: 'Aluno inscrito.' };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Não foi possível inscrever.',
    };
  }
}

export async function setAttendanceAction(
  turmaId: string,
  seedId: string,
  lessonIndex: number,
  present: boolean,
): Promise<void> {
  await setAttendance({ turmaId, seedId, lessonIndex, present });
  revalidatePath(`/visao-rhema/${turmaId}`);
}

export async function addReposicaoAction(
  _prevState: TurmaActionState,
  formData: FormData,
): Promise<TurmaActionState> {
  const turmaId = String(formData.get('turmaId') ?? '').trim();
  const date = String(formData.get('date') ?? '').trim();

  if (!turmaId || !date) {
    return { error: 'Informe a data da reposição.' };
  }

  try {
    await addReposicao({ turmaId, date });
    revalidatePath(`/visao-rhema/${turmaId}`);
    return { success: 'Aula de reposição adicionada.' };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar a reposição.',
    };
  }
}

export async function setCertificateArtAction(
  _prevState: TurmaActionState,
  formData: FormData,
): Promise<TurmaActionState> {
  const turmaId = String(formData.get('turmaId') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();

  try {
    await setCertificateArt({ turmaId, url: url || null });
    revalidatePath(`/visao-rhema/${turmaId}`);
    return { success: 'Arte do certificado atualizada.' };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Não foi possível salvar.',
    };
  }
}

export async function concludeTurmaAction(
  _prevState: TurmaActionState,
  formData: FormData,
): Promise<TurmaActionState> {
  const turmaId = String(formData.get('turmaId') ?? '').trim();

  try {
    const currentUser = await getSessionUser();
    const { concluded } = await concludeTurma({
      turmaId,
      actorId: currentUser.id,
    });
    revalidatePath(`/visao-rhema/${turmaId}`);
    revalidatePath('/sementes');
    return {
      success:
        concluded === 0
          ? 'Nenhum aluno aprovado para concluir.'
          : `Marco Visão Rhema registrado para ${concluded} ${concluded === 1 ? 'aluno' : 'alunos'}.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Não foi possível concluir.',
    };
  }
}

// Formulário público de inscrição (substitui o Google Forms).
export type PublicEnrollState = {
  error?: string;
  success?: string;
};

export async function publicEnrollAction(
  _prevState: PublicEnrollState,
  formData: FormData,
): Promise<PublicEnrollState> {
  const turmaId = String(formData.get('turmaId') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const neighborhood = String(formData.get('neighborhood') ?? '').trim();

  if (!turmaId || !name) {
    return { error: 'Informe seu nome.' };
  }

  if (!phone || !isValidPhone(phone)) {
    return { error: 'Informe um telefone válido (DDD + número).' };
  }

  try {
    // Deduplicação por telefone: reaproveita a semente existente.
    const currentUser = await getSessionUser();
    const existing = await findSeedByPhone(phone);
    const seed =
      existing ??
      (await createSeed({
        name,
        phone,
        neighborhood: neighborhood || undefined,
        abordadorId: currentUser.id,
      }));

    await enrollStudent({
      turmaId,
      seedId: seed.id,
      actorId: null,
      welcomeTask: true,
    });

    return {
      success:
        'Inscrição confirmada! Em breve você receberá uma mensagem de boas-vindas no WhatsApp.',
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir a inscrição.',
    };
  }
}
