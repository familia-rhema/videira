import type { MarcoType } from '@/lib/marcos';

export type WorkflowTrigger =
  | { type: 'seed_added' }
  | { type: 'milestone_reached'; marco: MarcoType | 'any' };

export type DelayBlock = {
  id: string;
  type: 'delay';
  days: number;
};

export type MessageBlock = {
  id: string;
  type: 'message';
  text: string;
  onlyIfNoReply: boolean; // se a semente respondeu desde a última tarefa, encerra a sequência
};

export type WorkflowBlock = DelayBlock | MessageBlock;

export type Workflow = {
  id: string;
  name: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  blocks: WorkflowBlock[];
  createdAt: string;
};

export type WorkflowRunStatus = 'active' | 'completed' | 'stopped';

export type WorkflowRun = {
  id: string;
  workflowId: string;
  seedId: string;
  status: WorkflowRunStatus;
  cursor: number; // índice do próximo bloco a processar
  nextDueAt: string | null;
  lastTaskAt: string | null;
  repliedAt: string | null;
  startedAt: string;
};

export type TaskStatus = 'pending' | 'done';

export type Task = {
  id: string;
  seedId: string;
  workflowRunId: string | null;
  message: string;
  status: TaskStatus;
  dueAt: string;
  createdAt: string;
  completedAt: string | null;
  assigneeId: string | null;
};

export type AutomationStore = {
  workflows: Workflow[];
  runs: WorkflowRun[];
  tasks: Task[];
};
