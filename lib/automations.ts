import { getMarcoConfig } from '@/lib/marcos';
import type { WorkflowTrigger } from '@/lib/types/automation';

export function triggerLabel(trigger: WorkflowTrigger): string {
  if (trigger.type === 'seed_added') {
    return 'Semente cadastrada';
  }
  if (trigger.marco === 'any') {
    return 'Qualquer marco registrado';
  }
  return `Marco: ${getMarcoConfig(trigger.marco).label}`;
}

export function delayLabel(delayDays: number): string {
  if (delayDays <= 0) return 'Imediato';
  if (delayDays === 1) return 'Após 1 dia';
  return `Após ${delayDays} dias`;
}
