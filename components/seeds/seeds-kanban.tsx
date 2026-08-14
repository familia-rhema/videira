'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import * as Select from '@/components/ui/select';
import {
  groupSeedsByHealth,
  KanbanColumnHeader,
  KANBAN_COLUMNS,
  SeedKanbanCard,
  getRegadorName,
} from '@/components/seeds/seed-kanban-card';
import { HEALTH_LABELS } from '@/lib/health';
import type { HealthState, SeedWithHealth, User } from '@/lib/types/seed';

type SeedsKanbanProps = {
  seeds: SeedWithHealth[];
  users: User[];
};

const HEALTH_OPTIONS: Array<{ value: HealthState | 'all'; label: string }> = [
  { value: 'all', label: 'Todas as saúdes' },
  { value: 'critico', label: HEALTH_LABELS.critico },
  { value: 'em_risco', label: HEALTH_LABELS.em_risco },
  { value: 'atencao', label: HEALTH_LABELS.atencao },
  { value: 'saudavel', label: HEALTH_LABELS.saudavel },
  { value: 'integrado', label: HEALTH_LABELS.integrado },
];

export function SeedsKanban({ seeds, users }: SeedsKanbanProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const health = (searchParams.get('health') ?? 'all') as HealthState | 'all';
  const regadorId = searchParams.get('regador') ?? 'all';

  function updateFilter(key: 'health' | 'regador', value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'all') {
      params.delete(key === 'health' ? 'health' : 'regador');
    } else {
      params.set(key === 'health' ? 'health' : 'regador', value);
    }

    const query = params.toString();
    router.push(query ? `/sementes?${query}` : '/sementes');
  }

  const grouped = groupSeedsByHealth(seeds);
  const [expanded, setExpanded] = useState<Partial<Record<HealthState, boolean>>>({});

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-title-h5 text-text-strong-950'>Sementes</h1>
          <p className='mt-1 text-paragraph-sm text-text-sub-600'>
            Kanban por saúde — arraste o foco da equipe pelas colunas.
          </p>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row'>
          <Select.Root
            value={health}
            onValueChange={(value) => updateFilter('health', value)}
          >
            <Select.Trigger className='w-full sm:w-[180px]'>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {HEALTH_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Select.Root
            value={regadorId}
            onValueChange={(value) => updateFilter('regador', value)}
          >
            <Select.Trigger className='w-full sm:w-[180px]'>
              <Select.Value placeholder='Regador' />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='all'>Todos os regadores</Select.Item>
              {users.map((user) => (
                <Select.Item key={user.id} value={user.id}>
                  {user.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <div className='flex gap-4 overflow-x-auto pb-2'>
        {KANBAN_COLUMNS.map(
          ({ health: columnHealth, label, headerClass, dotClass, collapsedByDefault }) => {
            const columnSeeds = grouped[columnHealth];
            const isCollapsed = collapsedByDefault && !expanded[columnHealth];

            if (isCollapsed) {
              return (
                <section key={columnHealth} className='shrink-0'>
                  <button
                    type='button'
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [columnHealth]: true }))
                    }
                    className='w-full'
                    aria-expanded={false}
                  >
                    <KanbanColumnHeader
                      label={label}
                      count={columnSeeds.length}
                      headerClass={headerClass}
                      dotClass={dotClass}
                      icon={RiArrowRightSLine}
                    />
                  </button>
                </section>
              );
            }

            return (
              <section
                key={columnHealth}
                className='flex w-[280px] shrink-0 flex-col gap-3'
              >
                {collapsedByDefault ? (
                  <button
                    type='button'
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [columnHealth]: false }))
                    }
                    aria-expanded
                  >
                    <KanbanColumnHeader
                      label={label}
                      count={columnSeeds.length}
                      headerClass={headerClass}
                      dotClass={dotClass}
                      icon={RiArrowDownSLine}
                    />
                  </button>
                ) : (
                  <KanbanColumnHeader
                    label={label}
                    count={columnSeeds.length}
                    headerClass={headerClass}
                    dotClass={dotClass}
                  />
                )}

                <div className='flex min-h-[120px] flex-col gap-2 rounded-10 bg-bg-weak-50 p-2'>
                  {columnSeeds.length === 0 ? (
                    <p className='px-2 py-6 text-center text-paragraph-xs text-text-soft-400'>
                      Nenhuma semente
                    </p>
                  ) : (
                    columnSeeds.map((seed) => (
                      <SeedKanbanCard
                        key={seed.id}
                        seed={seed}
                        regadorName={getRegadorName(users, seed.regadorId)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          },
        )}
      </div>
    </div>
  );
}
