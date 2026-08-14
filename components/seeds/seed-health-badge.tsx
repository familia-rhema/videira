import * as StatusBadge from '@/components/ui/status-badge';
import { HEALTH_LABELS } from '@/lib/health';
import type { HealthState } from '@/lib/types/seed';
import { cn } from '@/utils/cn';

const HEALTH_STATUS: Record<
  HealthState,
  React.ComponentProps<typeof StatusBadge.Root>['status']
> = {
  integrado: 'completed',
  saudavel: 'completed',
  atencao: 'pending',
  em_risco: 'pending',
  critico: 'failed',
};

const HEALTH_VARIANT: Record<
  HealthState,
  React.ComponentProps<typeof StatusBadge.Root>['variant']
> = {
  integrado: 'light',
  saudavel: 'light',
  atencao: 'light',
  em_risco: 'light',
  critico: 'light',
};

const HEALTH_DOT_CLASS: Record<HealthState, string> = {
  integrado: 'text-stable-base',
  saudavel: 'text-success-base',
  atencao: 'text-away-base',
  em_risco: 'text-warning-base',
  critico: 'text-error-base',
};

type SeedHealthBadgeProps = {
  health: HealthState;
  diasParada: number;
  className?: string;
};

export function SeedHealthBadge({
  health,
  diasParada,
  className,
}: SeedHealthBadgeProps) {
  const label =
    health === 'integrado'
      ? HEALTH_LABELS.integrado
      : `${HEALTH_LABELS[health]} · ${diasParada}d`;

  return (
    <StatusBadge.Root
      variant={HEALTH_VARIANT[health]}
      status={HEALTH_STATUS[health]}
      className={cn(className)}
    >
      <StatusBadge.Dot className={HEALTH_DOT_CLASS[health]} />
      {label}
    </StatusBadge.Root>
  );
}
