'use client';

import { useRouter } from 'next/navigation';
import { RiWhatsappLine } from '@remixicon/react';
import * as CompactButton from '@/components/ui/compact-button';
import { SeedMarcoBadges } from '@/components/seeds/seed-marco-badges';
import { HEALTH_LABELS } from '@/lib/health';
import { formatPhoneDisplay, toWhatsAppUrl } from '@/lib/phone';
import type { HealthState, SeedWithHealth, User } from '@/lib/types/seed';
import { cn } from '@/utils/cn';

type SeedKanbanCardProps = {
  seed: SeedWithHealth;
  regadorName: string;
};

export function SeedKanbanCard({ seed, regadorName }: SeedKanbanCardProps) {
  const router = useRouter();

  function openProfile() {
    router.push(`/sementes/${seed.id}`);
  }

  function openWhatsApp(event: React.MouseEvent) {
    event.stopPropagation();
    window.open(toWhatsAppUrl(seed.phone), '_blank', 'noopener,noreferrer');
  }

  return (
    <article
      role='link'
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProfile();
        }
      }}
      className='cursor-pointer rounded-10 border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-regular-xs transition duration-200 ease-out hover:border-stroke-sub-300 hover:shadow-regular-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2'
    >
      <div className='flex items-start justify-between gap-2'>
        <p className='min-w-0 text-label-sm text-text-strong-950'>{seed.name}</p>
        <CompactButton.Root
          variant='stroke'
          size='medium'
          onClick={openWhatsApp}
          aria-label={`WhatsApp de ${seed.name}`}
        >
          <CompactButton.Icon as={RiWhatsappLine} />
        </CompactButton.Root>
      </div>

      {seed.neighborhood ? (
        <p className='mt-1 text-paragraph-xs text-text-soft-400'>
          {seed.neighborhood}
        </p>
      ) : null}

      {seed.health !== 'integrado' ? (
        <p className='mt-2 text-paragraph-xs text-text-sub-600'>
          {seed.diasParada} {seed.diasParada === 1 ? 'dia' : 'dias'} parada
        </p>
      ) : null}

      <div className='mt-3'>
        <SeedMarcoBadges seed={seed} />
      </div>

      <div className='mt-3 flex items-center justify-between gap-2 border-t border-stroke-soft-200 pt-3'>
        <span className='truncate text-paragraph-xs text-text-soft-400'>
          {regadorName}
        </span>
        <span className='shrink-0 font-mono text-paragraph-xs text-text-sub-600'>
          {formatPhoneDisplay(seed.phone)}
        </span>
      </div>
    </article>
  );
}

export const KANBAN_COLUMNS: Array<{
  health: HealthState;
  label: string;
  headerClass: string;
  dotClass: string;
  /** Integrado (voluntariado) raramente muda — fica recolhido por padrão. */
  collapsedByDefault?: boolean;
}> = [
  {
    health: 'critico',
    label: HEALTH_LABELS.critico,
    headerClass: 'border-error-light bg-error-lighter text-error-dark',
    dotClass: 'bg-error-base',
  },
  {
    health: 'em_risco',
    label: HEALTH_LABELS.em_risco,
    headerClass: 'border-warning-light bg-warning-lighter text-warning-dark',
    dotClass: 'bg-warning-base',
  },
  {
    health: 'atencao',
    label: HEALTH_LABELS.atencao,
    headerClass: 'border-away-light bg-away-lighter text-away-dark',
    dotClass: 'bg-away-base',
  },
  {
    health: 'saudavel',
    label: HEALTH_LABELS.saudavel,
    headerClass: 'border-success-light bg-success-lighter text-success-dark',
    dotClass: 'bg-success-base',
  },
  {
    health: 'integrado',
    label: HEALTH_LABELS.integrado,
    headerClass: 'border-stable-light bg-stable-lighter text-stable-dark',
    dotClass: 'bg-stable-base',
    collapsedByDefault: true,
  },
];

export function KanbanColumnHeader({
  label,
  count,
  headerClass,
  dotClass,
  icon: Icon,
}: {
  label: string;
  count: number;
  headerClass: string;
  dotClass: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-10 border px-3 py-2',
        headerClass,
      )}
    >
      <span className={cn('size-2 shrink-0 rounded-full', dotClass)} />
      <span className='text-label-sm'>{label}</span>
      <span className='ml-auto rounded-full bg-bg-white-0/80 px-2 py-0.5 text-label-xs'>
        {count}
      </span>
      {Icon ? <Icon className='size-4 shrink-0' /> : null}
    </div>
  );
}

export function getRegadorName(users: User[], id: string) {
  return users.find((user) => user.id === id)?.name ?? '—';
}

export function groupSeedsByHealth(seeds: SeedWithHealth[]) {
  const groups = Object.fromEntries(
    KANBAN_COLUMNS.map(({ health }) => [health, [] as SeedWithHealth[]]),
  ) as Record<HealthState, SeedWithHealth[]>;

  for (const seed of seeds) {
    if (groups[seed.health]) {
      groups[seed.health].push(seed);
    }
  }

  for (const health of KANBAN_COLUMNS.map((column) => column.health)) {
    groups[health].sort((a, b) => b.diasParada - a.diasParada);
  }

  return groups;
}
