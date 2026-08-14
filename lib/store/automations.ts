import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { MarcoType } from '@/lib/marcos';
import type { SeedStore } from '@/lib/types/seed';
import type {
  AutomationStore,
  Task,
  Workflow,
  WorkflowTrigger,
} from '@/lib/types/automation';
import {
  enrollSeed,
  matchesMilestone,
  matchesSeedAdded,
  tickRuns,
  type EngineDeps,
} from '@/lib/store/automation-engine';

const DATA_PATH = path.join(process.cwd(), 'data', 'automations.json');
const SEEDS_PATH = path.join(process.cwd(), 'data', 'seeds.json');

// ponytail: shared JSON file, last-write-wins read-modify-write. Fine for the
// single-process demo; move to a real DB before concurrent writers matter.
async function readStore(): Promise<AutomationStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as AutomationStore;
  } catch {
    return { workflows: [], runs: [], tasks: [] };
  }
}

async function writeStore(store: AutomationStore): Promise<void> {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf-8');
}

// Read-only peek at the seeds file for the assignee (regador). Reading directly
// (instead of importing the seeds store) keeps automations free of a circular
// import with lib/store/seeds.ts.
async function getRegadorId(seedId: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(SEEDS_PATH, 'utf-8');
    const seeds = (JSON.parse(raw) as SeedStore).seeds;
    return seeds.find((seed) => seed.id === seedId)?.regadorId ?? null;
  } catch {
    return null;
  }
}

function deps(): EngineDeps {
  return { now: new Date(), makeId: () => randomUUID() };
}

async function fillAssignees(created: Task[]): Promise<void> {
  for (const task of created) {
    task.assigneeId = await getRegadorId(task.seedId);
  }
}

// --- trigger hooks (called from lib/store/seeds.ts) ---

export async function fireSeedAdded(seedId: string): Promise<void> {
  const store = await readStore();
  const d = deps();
  for (const workflow of store.workflows.filter(matchesSeedAdded)) {
    enrollSeed(store, workflow, seedId, d);
  }
  const created = tickRuns(store, d);
  await fillAssignees(created);
  await writeStore(store);
}

export async function fireMilestone(
  seedId: string,
  marco: MarcoType,
): Promise<void> {
  const store = await readStore();
  const d = deps();
  for (const workflow of store.workflows.filter((w) =>
    matchesMilestone(w, marco),
  )) {
    enrollSeed(store, workflow, seedId, d);
  }
  const created = tickRuns(store, d);
  await fillAssignees(created);
  await writeStore(store);
}

// Lazy scheduler tick. Called when the Tarefas page loads so due follow-ups
// materialize without a cron. ponytail: swap to a cron route if volume grows.
export async function advanceWorkflows(): Promise<void> {
  const store = await readStore();
  const created = tickRuns(store, deps());
  if (created.length === 0) return;
  await fillAssignees(created);
  await writeStore(store);
}

// --- workflows (builder) ---

export async function listWorkflows(): Promise<Workflow[]> {
  return (await readStore()).workflows;
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  return (await readStore()).workflows.find((w) => w.id === id) ?? null;
}

export type SaveWorkflowInput = {
  id?: string;
  name: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  blocks: Workflow['blocks'];
};

export async function saveWorkflow(input: SaveWorkflowInput): Promise<Workflow> {
  const store = await readStore();

  if (input.id) {
    const index = store.workflows.findIndex((w) => w.id === input.id);
    if (index === -1) throw new Error('Automação não encontrada.');
    const updated: Workflow = { ...store.workflows[index], ...input, id: input.id };
    store.workflows[index] = updated;
    await writeStore(store);
    return updated;
  }

  const workflow: Workflow = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.workflows.push(workflow);
  await writeStore(store);
  return workflow;
}

export async function deleteWorkflow(id: string): Promise<void> {
  const store = await readStore();
  store.workflows = store.workflows.filter((w) => w.id !== id);
  await writeStore(store);
}

// --- tasks ---

export async function listTasks(options?: {
  status?: Task['status'] | 'all';
}): Promise<Task[]> {
  await advanceWorkflows();
  const tasks = (await readStore()).tasks;
  const filtered =
    options?.status && options.status !== 'all'
      ? tasks.filter((task) => task.status === options.status)
      : tasks;
  return filtered.sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
  );
}

// replied=true records the reply on the run, which gates any onlyIfNoReply
// follow-up step from firing.
export async function completeTask(
  taskId: string,
  options?: { replied?: boolean },
): Promise<void> {
  const store = await readStore();
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error('Tarefa não encontrada.');

  task.status = 'done';
  task.completedAt = new Date().toISOString();

  if (options?.replied && task.workflowRunId) {
    const run = store.runs.find((r) => r.id === task.workflowRunId);
    if (run) run.repliedAt = new Date().toISOString();
  }

  await writeStore(store);
}
