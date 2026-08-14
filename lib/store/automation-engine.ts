// Pure workflow engine: no IO, no Next imports. All time/ids injected via deps,
// so the logic is testable and carries its own self-check (see bottom of file).
// Run it with: npx tsx lib/store/automation-engine.ts
import type { MarcoType } from '@/lib/marcos';
import type {
  AutomationStore,
  Task,
  Workflow,
  WorkflowRun,
} from '@/lib/types/automation';

export type EngineDeps = {
  now: Date;
  makeId: () => string;
};

const DAY_MS = 86_400_000;

function addDays(date: Date, days: number): string {
  return new Date(date.getTime() + days * DAY_MS).toISOString();
}

export function matchesSeedAdded(workflow: Workflow): boolean {
  return workflow.enabled && workflow.trigger.type === 'seed_added';
}

export function matchesMilestone(workflow: Workflow, marco: MarcoType): boolean {
  return (
    workflow.enabled &&
    workflow.trigger.type === 'milestone_reached' &&
    (workflow.trigger.marco === 'any' || workflow.trigger.marco === marco)
  );
}

// Enrolls a seed into a workflow (one run per seed+workflow). Caller is
// responsible for having already filtered workflows by trigger match.
export function enrollSeed(
  store: AutomationStore,
  workflow: Workflow,
  seedId: string,
  deps: EngineDeps,
): void {
  if (!workflow.enabled || workflow.blocks.length === 0) return;
  const exists = store.runs.some(
    (run) => run.workflowId === workflow.id && run.seedId === seedId,
  );
  if (exists) return;

  store.runs.push({
    id: deps.makeId(),
    workflowId: workflow.id,
    seedId,
    status: 'active',
    cursor: 0,
    nextDueAt: deps.now.toISOString(),
    lastTaskAt: null,
    repliedAt: null,
    startedAt: deps.now.toISOString(),
  });
}

function repliedSinceLastTask(run: WorkflowRun): boolean {
  if (!run.repliedAt || !run.lastTaskAt) return false;
  return new Date(run.repliedAt).getTime() > new Date(run.lastTaskAt).getTime();
}

// Walks every active run's blocks from its cursor while the next block is due.
// Delay blocks push nextDueAt into the future; message blocks create a task.
// Returns the tasks created (also pushed into store.tasks); assigneeId is left
// null for the caller to fill.
export function tickRuns(store: AutomationStore, deps: EngineDeps): Task[] {
  const created: Task[] = [];
  const nowMs = deps.now.getTime();
  const nowIso = deps.now.toISOString();

  for (const run of store.runs) {
    if (run.status !== 'active') continue;
    const workflow = store.workflows.find((w) => w.id === run.workflowId);
    if (!workflow) {
      run.status = 'stopped';
      continue;
    }

    while (
      run.status === 'active' &&
      run.nextDueAt &&
      new Date(run.nextDueAt).getTime() <= nowMs
    ) {
      const block = workflow.blocks[run.cursor];
      if (!block) {
        run.status = 'completed';
        run.nextDueAt = null;
        break;
      }

      if (block.type === 'delay') {
        run.nextDueAt = addDays(deps.now, block.days);
        run.cursor += 1;
        continue; // re-check: 0-day delays fall through, real delays exit the loop
      }

      if (block.onlyIfNoReply && repliedSinceLastTask(run)) {
        run.status = 'completed';
        run.nextDueAt = null;
        break;
      }

      store.tasks.push({
        id: deps.makeId(),
        seedId: run.seedId,
        workflowRunId: run.id,
        message: block.text,
        status: 'pending',
        dueAt: nowIso,
        createdAt: nowIso,
        completedAt: null,
        assigneeId: null,
      });
      created.push(store.tasks[store.tasks.length - 1]);
      run.lastTaskAt = nowIso;
      run.cursor += 1; // nextDueAt stays "now" so the loop continues to the next block
    }
  }

  return created;
}

// --- self-check: npx tsx lib/store/automation-engine.ts ---
function runSelfCheck() {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`self-check failed: ${msg}`);
  };

  let counter = 0;
  const makeId = () => `id-${++counter}`;
  const t0 = new Date('2026-06-29T12:00:00.000Z');
  const t1 = new Date('2026-06-30T12:00:00.000Z'); // +1 dia

  const baseStore = (): AutomationStore => ({
    workflows: [
      {
        id: 'wf-1',
        name: 'Boas-vindas',
        enabled: true,
        createdAt: t0.toISOString(),
        trigger: { type: 'seed_added' },
        blocks: [
          { id: 'm1', type: 'message', text: 'Oi!', onlyIfNoReply: false },
          { id: 'd1', type: 'delay', days: 1 },
          { id: 'm2', type: 'message', text: 'Fala mano!', onlyIfNoReply: true },
        ],
      },
    ],
    runs: [],
    tasks: [],
  });

  // 1) enroll + tick at t0 -> step 1 fires, run still active waiting for step 2
  const a = baseStore();
  enrollSeed(a, a.workflows[0], 'seed-x', { now: t0, makeId });
  let created = tickRuns(a, { now: t0, makeId });
  assert(created.length === 1, '1 task no t0');
  assert(a.tasks[0].message === 'Oi!', 'primeira mensagem');
  assert(a.runs[0].status === 'active', 'run ativa após passo 1');

  // 2) tick at t1 with no reply -> step 2 fires, run completes
  created = tickRuns(a, { now: t1, makeId });
  assert(created.length === 1, '2ª task no t1');
  assert(a.tasks[1].message === 'Fala mano!', 'mensagem de follow-up');
  assert(a.runs[0].status === 'completed', 'run concluída após passo 2');

  // 3) reply before t1 -> step 2 is gated, no follow-up, run completes
  const b = baseStore();
  enrollSeed(b, b.workflows[0], 'seed-y', { now: t0, makeId });
  tickRuns(b, { now: t0, makeId });
  b.runs[0].repliedAt = new Date('2026-06-29T18:00:00.000Z').toISOString();
  created = tickRuns(b, { now: t1, makeId });
  assert(created.length === 0, 'sem follow-up quando respondeu');
  assert(b.runs[0].status === 'completed', 'run encerrada por resposta');

  // 4) no double-enroll
  const c = baseStore();
  enrollSeed(c, c.workflows[0], 'seed-z', { now: t0, makeId });
  enrollSeed(c, c.workflows[0], 'seed-z', { now: t0, makeId });
  assert(c.runs.length === 1, 'sem enroll duplicado');

  console.log('automation-engine self-check OK');
}

// tsx/node entrypoint guard
if (process.argv[1] && process.argv[1].includes('automation-engine')) {
  runSelfCheck();
}
