'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import {
  completeTask,
  deleteWorkflow,
  getWorkflow,
  saveWorkflow,
  type SaveWorkflowInput,
} from '@/lib/store/automations';

export async function completeTaskAction(taskId: string, replied: boolean) {
  await completeTask(taskId, { replied });
  revalidatePath('/automacoes');
}

export async function saveWorkflowAction(input: SaveWorkflowInput) {
  if (!input.name.trim()) {
    return { error: 'Dê um nome ao fluxo.' };
  }
  const emptyMessage = input.blocks.some(
    (block) => block.type === 'message' && !block.text.trim(),
  );
  if (emptyMessage) {
    return { error: 'Toda mensagem precisa de um texto.' };
  }
  await saveWorkflow(input);
  revalidatePath('/automacoes');
  return { ok: true as const };
}

export async function createWorkflowAction(): Promise<string> {
  const workflow = await saveWorkflow({
    name: 'Novo fluxo',
    enabled: false,
    trigger: { type: 'seed_added' },
    blocks: [
      { id: randomUUID(), type: 'message', text: '', onlyIfNoReply: false },
    ],
  });
  revalidatePath('/automacoes');
  return workflow.id;
}

export async function deleteWorkflowAction(id: string) {
  await deleteWorkflow(id);
  revalidatePath('/automacoes');
}

export async function toggleWorkflowAction(id: string, enabled: boolean) {
  const workflow = await getWorkflow(id);
  if (!workflow) return;
  await saveWorkflow({
    id: workflow.id,
    name: workflow.name,
    enabled,
    trigger: workflow.trigger,
    blocks: workflow.blocks,
  });
  revalidatePath('/automacoes');
}
