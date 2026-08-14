import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { differenceInCalendarDays } from 'date-fns';
import { getNationalHoliday } from '@/lib/holidays';
import { todayIsoDate } from '@/lib/marcos';
import { registerMarco, touchSeedAdvance } from '@/lib/store/seeds';
import { getStudentStatus, type Turma, type TurmaStore } from '@/lib/types/turma';
import type { AutomationStore, Task } from '@/lib/types/automation';

const DATA_PATH = path.join(process.cwd(), 'data', 'turmas.json');
const AUTOMATIONS_PATH = path.join(process.cwd(), 'data', 'automations.json');

// ponytail: mesmo padrão dos outros stores — JSON local, single-process.
async function readStore(): Promise<TurmaStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as TurmaStore;
  } catch {
    return { turmas: [] };
  }
}

async function writeStore(store: TurmaStore): Promise<void> {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf-8');
}

// Fase 1: lembretes viram tarefas manuais no quadro de tarefas existente.
async function pushTasks(tasks: Task[]): Promise<void> {
  let store: AutomationStore;
  try {
    const raw = await fs.readFile(AUTOMATIONS_PATH, 'utf-8');
    store = JSON.parse(raw) as AutomationStore;
  } catch {
    store = { workflows: [], runs: [], tasks: [] };
  }

  store.tasks.push(...tasks);
  await fs.writeFile(
    AUTOMATIONS_PATH,
    `${JSON.stringify(store, null, 2)}\n`,
    'utf-8',
  );
}

export async function listTurmas(): Promise<Turma[]> {
  const store = await readStore();
  return store.turmas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTurmaById(id: string): Promise<Turma | null> {
  const store = await readStore();
  return store.turmas.find((turma) => turma.id === id) ?? null;
}

/** Contagem regressiva de lembretes até a 1ª aula (dias antes). */
const REMINDER_OFFSETS = [7, 3, 1];

export async function createTurma(input: {
  name: string;
  /** Datas ISO das 5 aulas, já decididas pelo líder (feriados resolvidos). */
  lessonDates: string[];
  actorId: string;
}): Promise<Turma> {
  const store = await readStore();
  const now = new Date().toISOString();

  const turma: Turma = {
    id: randomUUID(),
    name: input.name.trim(),
    lessons: input.lessonDates.map((date) => ({
      date,
      isReposicao: false,
      holidayName: getNationalHoliday(date),
    })),
    students: [],
    certificateArtUrl: null,
    createdAt: now,
  };

  store.turmas.push(turma);
  await writeStore(store);

  // Fluxo de lembretes: tarefas com contagem regressiva até a 1ª aula.
  const firstLesson = input.lessonDates[0];
  const today = todayIsoDate();
  const reminders: Task[] = REMINDER_OFFSETS.flatMap((offset) => {
    const due = new Date(`${firstLesson}T09:00:00.000Z`);
    due.setUTCDate(due.getUTCDate() - offset);
    if (due.toISOString().slice(0, 10) < today) return [];

    return [
      {
        id: randomUUID(),
        seedId: '',
        workflowRunId: null,
        message: `Turma "${turma.name}": enviar lembrete — ${
          offset === 1 ? 'falta 1 dia' : `faltam ${offset} dias`
        } para a 1ª aula.`,
        status: 'pending' as const,
        dueAt: due.toISOString(),
        createdAt: now,
        completedAt: null,
        assigneeId: input.actorId,
      },
    ];
  });

  if (reminders.length > 0) {
    await pushTasks(reminders);
  }

  return turma;
}

export async function enrollStudent(input: {
  turmaId: string;
  seedId: string;
  actorId: string | null;
  /** Gera tarefa de boas-vindas (inscrição pelo formulário público). */
  welcomeTask?: boolean;
}): Promise<void> {
  const store = await readStore();
  const turma = store.turmas.find((item) => item.id === input.turmaId);

  if (!turma) {
    throw new Error('Turma não encontrada.');
  }

  if (turma.students.some((student) => student.seedId === input.seedId)) {
    throw new Error('Esta semente já está inscrita na turma.');
  }

  const now = new Date().toISOString();
  turma.students.push({
    seedId: input.seedId,
    enrolledAt: now,
    attendance: {},
    concludedAt: null,
  });

  await writeStore(store);

  // Decisão: inscrição já avança o Kanban.
  await touchSeedAdvance({
    seedId: input.seedId,
    type: 'inscricao_rhema',
    description: `Inscrição na turma "${turma.name}" do Visão Rhema`,
    actorId: input.actorId,
  });

  if (input.welcomeTask) {
    await pushTasks([
      {
        id: randomUUID(),
        seedId: input.seedId,
        workflowRunId: null,
        message: `Enviar mensagem de boas-vindas — inscrição na turma "${turma.name}".`,
        status: 'pending',
        dueAt: now,
        createdAt: now,
        completedAt: null,
        assigneeId: null,
      },
    ]);
  }
}

export async function setAttendance(input: {
  turmaId: string;
  seedId: string;
  lessonIndex: number;
  present: boolean;
}): Promise<void> {
  const store = await readStore();
  const turma = store.turmas.find((item) => item.id === input.turmaId);
  const student = turma?.students.find((item) => item.seedId === input.seedId);

  if (!turma || !student) {
    throw new Error('Turma ou aluno não encontrado.');
  }

  if (input.present) {
    student.attendance[input.lessonIndex] = true;
  } else {
    delete student.attendance[input.lessonIndex];
  }

  await writeStore(store);
}

export async function addReposicao(input: {
  turmaId: string;
  date: string;
}): Promise<void> {
  const store = await readStore();
  const turma = store.turmas.find((item) => item.id === input.turmaId);

  if (!turma) {
    throw new Error('Turma não encontrada.');
  }

  if (turma.lessons.some((lesson) => lesson.isReposicao)) {
    throw new Error('A turma já tem uma aula de reposição.');
  }

  turma.lessons.push({
    date: input.date,
    isReposicao: true,
    holidayName: getNationalHoliday(input.date),
  });

  await writeStore(store);
}

export async function setCertificateArt(input: {
  turmaId: string;
  url: string | null;
}): Promise<void> {
  const store = await readStore();
  const turma = store.turmas.find((item) => item.id === input.turmaId);

  if (!turma) {
    throw new Error('Turma não encontrada.');
  }

  turma.certificateArtUrl = input.url;
  await writeStore(store);
}

/** Registra o marco Visão Rhema para todos os aprovados da turma. */
export async function concludeTurma(input: {
  turmaId: string;
  actorId: string;
}): Promise<{ concluded: number }> {
  const store = await readStore();
  const turma = store.turmas.find((item) => item.id === input.turmaId);

  if (!turma) {
    throw new Error('Turma não encontrada.');
  }

  const today = todayIsoDate();
  const approved = turma.students.filter(
    (student) => getStudentStatus(turma, student, today) === 'aprovado',
  );

  for (const student of approved) {
    student.concludedAt = new Date().toISOString();
  }

  await writeStore(store);

  let concluded = 0;
  for (const student of approved) {
    try {
      await registerMarco({
        seedId: student.seedId,
        marco: 'rhema',
        date: today,
        actorId: input.actorId,
      });
      concluded += 1;
    } catch {
      // Marco já registrado antes — segue para o próximo aluno.
    }
  }

  return { concluded };
}

/** Dias até a 1ª aula (para exibir a contagem regressiva na UI). */
export function daysUntilFirstLesson(turma: Turma, now = new Date()): number {
  const first = turma.lessons.filter((lesson) => !lesson.isReposicao)[0];
  if (!first) return 0;
  return differenceInCalendarDays(new Date(`${first.date}T12:00:00`), now);
}
