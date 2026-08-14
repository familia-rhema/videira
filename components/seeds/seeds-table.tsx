'use client';

import { Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RiWhatsappLine } from '@remixicon/react';
import * as CompactButton from '@/components/ui/compact-button';
import * as Select from '@/components/ui/select';
import * as Table from '@/components/ui/table';
import { SeedMarcoBadges } from '@/components/seeds/seed-marco-badges';
import { SeedHealthBadge } from '@/components/seeds/seed-health-badge';
import { HEALTH_LABELS } from '@/lib/health';
import { formatPhoneDisplay, toWhatsAppUrl } from '@/lib/phone';
import type { HealthState, SeedWithHealth, User } from '@/lib/types/seed';

type SeedsTableProps = {
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

function getUserName(users: User[], id: string) {
  return users.find((user) => user.id === id)?.name ?? '—';
}

export function SeedsTable({ seeds, users }: SeedsTableProps) {
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

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-title-h5 text-text-strong-950'>Sementes</h1>
          <p className='mt-1 text-paragraph-sm text-text-sub-600'>
            Ordenadas por saúde — quem precisa de atenção aparece primeiro.
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

      {seeds.length === 0 ? (
        <div className='rounded-20 border border-dashed border-stroke-soft-200 px-6 py-12 text-center'>
          <p className='text-paragraph-sm text-text-sub-600'>
            Nenhuma semente encontrada com esses filtros.
          </p>
        </div>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Semente</Table.Head>
              <Table.Head>Saúde</Table.Head>
              <Table.Head>Marcos</Table.Head>
              <Table.Head>Regador</Table.Head>
              <Table.Head>Contato</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {seeds.map((seed, index) => (
              <Fragment key={seed.id}>
                {index > 0 ? <Table.RowDivider /> : null}
                <Table.Row
                  className='cursor-pointer'
                  onClick={() => router.push(`/sementes/${seed.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/sementes/${seed.id}`);
                    }
                  }}
                  tabIndex={0}
                  role='link'
                >
                  <Table.Cell>
                    <div className='space-y-0.5'>
                      <span className='text-label-sm text-text-strong-950'>
                        {seed.name}
                      </span>
                      {seed.neighborhood ? (
                        <span className='block text-paragraph-xs text-text-soft-400'>
                          {seed.neighborhood}
                        </span>
                      ) : null}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <SeedHealthBadge
                      health={seed.health}
                      diasParada={seed.diasParada}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <SeedMarcoBadges seed={seed} />
                  </Table.Cell>
                  <Table.Cell>
                    <span className='text-paragraph-sm text-text-sub-600'>
                      {getUserName(users, seed.regadorId)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono text-paragraph-sm text-text-sub-600'>
                        {formatPhoneDisplay(seed.phone)}
                      </span>
                      <CompactButton.Root
                        variant='stroke'
                        size='medium'
                        aria-label={`WhatsApp de ${seed.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          window.open(
                            toWhatsAppUrl(seed.phone),
                            '_blank',
                            'noopener,noreferrer',
                          );
                        }}
                      >
                        <CompactButton.Icon as={RiWhatsappLine} />
                      </CompactButton.Root>
                    </div>
                  </Table.Cell>
                </Table.Row>
              </Fragment>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </div>
  );
}
