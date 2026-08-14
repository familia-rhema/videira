import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { compareSeedsByHealth, withHealth } from '@/lib/health';
import { getMarcoConfig, type MarcoType } from '@/lib/marcos';
import type {
  AcaoKind,
  CreateSeedInput,
  HealthState,
  Seed,
  SeedEvent,
  SeedStore,
  SeedWithHealth,
} from '@/lib/types/seed';
import { ACAO_LABELS } from '@/lib/types/seed';
import { getUserById } from '@/lib/store/users';
import { normalizePhone } from '@/lib/phone';
import { fireMilestone, fireSeedAdded } from '@/lib/store/automations';

const DATA_PATH = path.join(process.cwd(), 'data', 'seeds.json');

type RegisterMarcoInput = {
  seedId: string;
  marco: MarcoType;
  date: string;
  actorId: string;
  jaBatizadoExterno?: boolean;
};

function toAdvanceTimestamp(date: string) {
  return `${date}T12:00:00.000Z`;
}

function formatMarcoDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

async function readStore(): Promise<SeedStore> {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const store = JSON.parse(raw) as SeedStore;

  return {
    ...store,
    seeds: store.seeds.map(normalizeSeed),
  };
}

function normalizeSeed(seed: Seed): Seed {
  return {
    ...seed,
    abordagemData: seed.abordagemData ?? null,
    abordagemLocal: seed.abordagemLocal ?? null,
    abordagemTipo: seed.abordagemTipo ?? null,
    aceitouJesus: seed.aceitouJesus ?? null,
    direcionadoCelula: seed.direcionadoCelula ?? null,
    celulaEncaminhada: seed.celulaEncaminhada ?? null,
  };
}

async function writeStore(store: SeedStore): Promise<void> {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf-8');
}

export async function listSeeds(options?: {
  health?: HealthState | 'all';
  regadorId?: string;
  /** 'ativas' (padrão) exclui desistentes; 'desistentes' só elas; 'todas' tudo. */
  situacao?: 'ativas' | 'desistentes' | 'todas';
}): Promise<SeedWithHealth[]> {
  const store = await readStore();
  let seeds = store.seeds.map((seed) => withHealth(seed));

  const situacao = options?.situacao ?? 'ativas';
  if (situacao === 'ativas') {
    seeds = seeds.filter((seed) => !seed.desistiuEm);
  } else if (situacao === 'desistentes') {
    seeds = seeds.filter((seed) => Boolean(seed.desistiuEm));
  }

  if (options?.regadorId) {
    seeds = seeds.filter((seed) => seed.regadorId === options.regadorId);
  }

  if (options?.health && options.health !== 'all') {
    seeds = seeds.filter((seed) => seed.health === options.health);
  }

  return seeds.sort(compareSeedsByHealth);
}

export async function getSeedById(id: string): Promise<SeedWithHealth | null> {
  const store = await readStore();
  const seed = store.seeds.find((item) => item.id === id);

  if (!seed) {
    return null;
  }

  return withHealth(seed);
}

export async function getSeedEvents(seedId: string): Promise<SeedEvent[]> {
  const store = await readStore();
  return store.events
    .filter((event) => event.seedId === seedId)
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
}

export async function createSeed(input: CreateSeedInput): Promise<Seed> {
  const store = await readStore();
  const now = new Date().toISOString();
  const abordador = await getUserById(input.abordadorId);

  const seed: Seed = {
    id: randomUUID(),
    name: input.name.trim(),
    phone: normalizePhone(input.phone),
    neighborhood: input.neighborhood?.trim() || null,
    gender: input.gender ?? null,
    abordadorId: input.abordadorId,
    regadorId: input.abordadorId,
    confissaoFeEm: null,
    rhemaConcluidoEm: null,
    batizadoEm: null,
    jaBatizadoExterno: false,
    entrouCelulaEm: null,
    cellId: null,
    integradoEm: null,
    desistiuEm: null,
    desistenciaMotivo: null,
    abordagemData: input.abordagemData?.trim() || null,
    abordagemLocal: input.abordagemLocal?.trim() || null,
    abordagemTipo: input.abordagemTipo ?? null,
    aceitouJesus: input.aceitouJesus ?? null,
    direcionadoCelula:
      input.direcionadoCelula === undefined ? null : input.direcionadoCelula,
    celulaEncaminhada: input.celulaEncaminhada?.trim() || null,
    createdAt: now,
    lastAdvanceAt: now,
  };

  const event: SeedEvent = {
    id: randomUUID(),
    seedId: seed.id,
    type: 'cadastro',
    description: `Semente cadastrada por ${abordador?.name ?? 'consolidador'}`,
    actorId: input.abordadorId,
    occurredAt: now,
  };

  store.seeds.push(seed);
  store.events.push(event);
  await writeStore(store);

  await fireSeedAdded(seed.id);

  return seed;
}

export async function registerMarco(input: RegisterMarcoInput): Promise<Seed> {
  const store = await readStore();
  const seedIndex = store.seeds.findIndex((item) => item.id === input.seedId);

  if (seedIndex === -1) {
    throw new Error('Semente não encontrada.');
  }

  const seed = store.seeds[seedIndex];
  const config = getMarcoConfig(input.marco);

  if (seed[config.field]) {
    throw new Error(`O marco "${config.label}" já foi registrado e não pode ser alterado.`);
  }

  const updatedSeed: Seed = {
    ...seed,
    [config.field]: input.date,
    lastAdvanceAt: toAdvanceTimestamp(input.date),
  };

  if (input.marco === 'batismo' && input.jaBatizadoExterno) {
    updatedSeed.jaBatizadoExterno = true;
  }

  const description =
    input.marco === 'batismo' && input.jaBatizadoExterno
      ? `${config.eventDescription} (já batizado em outra igreja) — ${formatMarcoDate(input.date)}`
      : `${config.eventDescription} — ${formatMarcoDate(input.date)}`;

  const event: SeedEvent = {
    id: randomUUID(),
    seedId: seed.id,
    type: config.eventType,
    description,
    actorId: input.actorId,
    occurredAt: toAdvanceTimestamp(input.date),
    metadata:
      input.marco === 'batismo'
        ? { jaBatizadoExterno: Boolean(input.jaBatizadoExterno) }
        : undefined,
  };

  store.seeds[seedIndex] = updatedSeed;
  store.events.push(event);

  await writeStore(store);

  await fireMilestone(seed.id, input.marco);

  return updatedSeed;
}

export async function registerAcao(input: {
  seedId: string;
  kind: AcaoKind;
  note?: string;
  date: string;
  actorId: string;
}): Promise<void> {
  const store = await readStore();
  const seed = store.seeds.find((item) => item.id === input.seedId);

  if (!seed) {
    throw new Error('Semente não encontrada.');
  }

  const actor = await getUserById(input.actorId);
  const label = ACAO_LABELS[input.kind];
  const noteSuffix = input.note?.trim() ? ` — ${input.note.trim()}` : '';

  seed.lastAdvanceAt = toAdvanceTimestamp(input.date);
  store.events.push({
    id: randomUUID(),
    seedId: seed.id,
    type: 'contato',
    description: `${label} por ${actor?.name ?? 'consolidador'}${noteSuffix}`,
    metadata: { kind: input.kind },
    actorId: input.actorId,
    occurredAt: toAdvanceTimestamp(input.date),
  });

  await writeStore(store);
}

export async function setSeedSituacao(input: {
  seedId: string;
  situacao: 'integrada' | 'desistente' | 'reativada';
  motivo?: string;
  actorId: string;
}): Promise<void> {
  const store = await readStore();
  const seed = store.seeds.find((item) => item.id === input.seedId);

  if (!seed) {
    throw new Error('Semente não encontrada.');
  }

  const actor = await getUserById(input.actorId);
  const now = new Date().toISOString();
  const actorName = actor?.name ?? 'consolidador';

  const changes: Record<
    typeof input.situacao,
    { apply: () => void; type: SeedEvent['type']; description: string }
  > = {
    integrada: {
      apply: () => {
        seed.integradoEm = now.slice(0, 10);
        seed.lastAdvanceAt = now;
      },
      type: 'integrada',
      description: `Semente integrada ao voluntariado por ${actorName}`,
    },
    desistente: {
      apply: () => {
        seed.desistiuEm = now.slice(0, 10);
        seed.desistenciaMotivo = input.motivo?.trim() || null;
      },
      type: 'desistencia',
      description: `Desistência registrada por ${actorName}${input.motivo?.trim() ? ` — ${input.motivo.trim()}` : ''}`,
    },
    reativada: {
      apply: () => {
        seed.desistiuEm = null;
        seed.desistenciaMotivo = null;
        seed.lastAdvanceAt = now;
      },
      type: 'reativada',
      description: `Semente reativada por ${actorName}`,
    },
  };

  const change = changes[input.situacao];
  change.apply();
  store.events.push({
    id: randomUUID(),
    seedId: seed.id,
    type: change.type,
    description: change.description,
    actorId: input.actorId,
    occurredAt: now,
  });

  await writeStore(store);
}

/** Inscrição em trilha move o Kanban (decisão: inscrição já avança). */
export async function touchSeedAdvance(input: {
  seedId: string;
  type: SeedEvent['type'];
  description: string;
  actorId: string | null;
}): Promise<void> {
  const store = await readStore();
  const seed = store.seeds.find((item) => item.id === input.seedId);

  if (!seed) {
    throw new Error('Semente não encontrada.');
  }

  const now = new Date().toISOString();
  seed.lastAdvanceAt = now;
  store.events.push({
    id: randomUUID(),
    seedId: seed.id,
    type: input.type,
    description: input.description,
    actorId: input.actorId,
    occurredAt: now,
  });

  await writeStore(store);
}

export async function findSeedByPhone(phone: string): Promise<Seed | null> {
  const store = await readStore();
  const normalized = normalizePhone(phone);
  return store.seeds.find((seed) => seed.phone === normalized) ?? null;
}

export async function getRawStore(): Promise<SeedStore> {
  return readStore();
}
