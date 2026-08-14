'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createSeed as createSeedInStore,
  registerAcao,
  setSeedSituacao,
} from '@/lib/store/seeds';
import { isValidPhone, normalizePhone } from '@/lib/phone';
import { getSessionUser } from '@/lib/auth/session';
import { isValidCelulaValue } from '@/lib/celulas';
import type {
  AbordagemTipo,
  AceitouJesus,
  AcaoKind,
  CreateSeedInput,
  SeedGender,
} from '@/lib/types/seed';
import {
  ABORDAGEM_TIPO_LABELS,
  ACEITOU_JESUS_LABELS,
  SEED_GENDER_LABELS,
} from '@/lib/types/seed';

const VALID_GENDERS = Object.keys(SEED_GENDER_LABELS) as SeedGender[];
const VALID_ABORDAGEM_TIPOS = Object.keys(
  ABORDAGEM_TIPO_LABELS,
) as AbordagemTipo[];
const VALID_ACEITOU_JESUS = Object.keys(
  ACEITOU_JESUS_LABELS,
) as AceitouJesus[];

export type CreateSeedState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CreateSeedInput, string>>;
};

function parseBooleanField(value: string) {
  if (value === 'sim') {
    return true;
  }

  if (value === 'nao') {
    return false;
  }

  return undefined;
}

export async function createSeedAction(
  _prevState: CreateSeedState,
  formData: FormData,
): Promise<CreateSeedState> {
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const neighborhood = String(formData.get('neighborhood') ?? '').trim();
  const abordadorId = String(formData.get('abordadorId') ?? '').trim();
  const abordagemData = String(formData.get('abordagemData') ?? '').trim();
  const abordagemLocal = String(formData.get('abordagemLocal') ?? '').trim();
  const abordagemTipoRaw = String(formData.get('abordagemTipo') ?? '').trim();
  const aceitouJesusRaw = String(formData.get('aceitouJesus') ?? '').trim();
  const direcionadoCelulaRaw = String(
    formData.get('direcionadoCelula') ?? '',
  ).trim();
  const celulaEncaminhada = String(
    formData.get('celulaEncaminhada') ?? '',
  ).trim();
  const genderRaw = String(formData.get('gender') ?? '').trim();
  const gender = VALID_GENDERS.includes(genderRaw as SeedGender)
    ? (genderRaw as SeedGender)
    : undefined;
  const abordagemTipo = VALID_ABORDAGEM_TIPOS.includes(
    abordagemTipoRaw as AbordagemTipo,
  )
    ? (abordagemTipoRaw as AbordagemTipo)
    : undefined;
  const aceitouJesus = VALID_ACEITOU_JESUS.includes(
    aceitouJesusRaw as AceitouJesus,
  )
    ? (aceitouJesusRaw as AceitouJesus)
    : undefined;
  const direcionadoCelula = parseBooleanField(direcionadoCelulaRaw);

  const fieldErrors: CreateSeedState['fieldErrors'] = {};

  if (!name) {
    fieldErrors.name = 'Informe o nome da semente.';
  }

  if (!phone) {
    fieldErrors.phone = 'Informe o telefone / WhatsApp.';
  } else if (!isValidPhone(phone)) {
    fieldErrors.phone = 'Telefone inválido. Use DDD + número.';
  }

  if (!abordadorId) {
    fieldErrors.abordadorId = 'Selecione quem fez a abordagem.';
  }

  if (!abordagemData) {
    fieldErrors.abordagemData = 'Informe a data da abordagem.';
  }

  if (!abordagemLocal) {
    fieldErrors.abordagemLocal = 'Informe o local da abordagem.';
  }

  if (!abordagemTipo) {
    fieldErrors.abordagemTipo = 'Selecione o tipo de abordagem.';
  }

  if (!aceitouJesus) {
    fieldErrors.aceitouJesus =
      'Informe se a pessoa aceitou Jesus ou se reconciliou.';
  }

  if (direcionadoCelula === undefined) {
    fieldErrors.direcionadoCelula =
      'Informe se a pessoa foi encaminhada para uma célula.';
  } else if (direcionadoCelula && !celulaEncaminhada) {
    fieldErrors.celulaEncaminhada = 'Selecione a célula de encaminhamento.';
  } else if (
    direcionadoCelula &&
    celulaEncaminhada &&
    !isValidCelulaValue(celulaEncaminhada)
  ) {
    fieldErrors.celulaEncaminhada = 'Selecione uma célula válida.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    const seed = await createSeedInStore({
      name,
      phone: normalizePhone(phone),
      neighborhood: neighborhood || undefined,
      gender,
      abordadorId,
      abordagemData,
      abordagemLocal,
      abordagemTipo,
      aceitouJesus,
      direcionadoCelula,
      celulaEncaminhada: direcionadoCelula ? celulaEncaminhada : undefined,
    });

    revalidatePath('/sementes');
    redirect(`/sementes/${seed.id}`);
  } catch {
    return { error: 'Não foi possível cadastrar a semente. Tente novamente.' };
  }
}

export type SimpleActionState = {
  error?: string;
  success?: string;
};

const ACAO_KINDS: AcaoKind[] = [
  'visita',
  'mensagem',
  'ligacao',
  'convite_celula',
  'outro',
];

export async function registerAcaoAction(
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const seedId = String(formData.get('seedId') ?? '').trim();
  const kind = String(formData.get('kind') ?? '').trim() as AcaoKind;
  const note = String(formData.get('note') ?? '').trim();
  const date = String(formData.get('date') ?? '').trim();

  if (!seedId || !date || !ACAO_KINDS.includes(kind)) {
    return { error: 'Preencha o tipo e a data da ação.' };
  }

  try {
    const currentUser = await getSessionUser();
    await registerAcao({
      seedId,
      kind,
      note: note || undefined,
      date,
      actorId: currentUser.id,
    });

    revalidatePath(`/sementes/${seedId}`);
    revalidatePath('/sementes');

    return { success: 'Ação registrada.' };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Não foi possível registrar a ação.',
    };
  }
}

export async function setSituacaoAction(
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const seedId = String(formData.get('seedId') ?? '').trim();
  const situacao = String(formData.get('situacao') ?? '').trim() as
    | 'integrada'
    | 'desistente'
    | 'reativada';
  const motivo = String(formData.get('motivo') ?? '').trim();

  if (!seedId || !['integrada', 'desistente', 'reativada'].includes(situacao)) {
    return { error: 'Situação inválida.' };
  }

  try {
    const currentUser = await getSessionUser();
    await setSeedSituacao({
      seedId,
      situacao,
      motivo: motivo || undefined,
      actorId: currentUser.id,
    });

    revalidatePath(`/sementes/${seedId}`);
    revalidatePath('/sementes');
    revalidatePath('/');

    return { success: 'Situação atualizada.' };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a situação.',
    };
  }
}
