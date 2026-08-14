'use client';

import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Table from '@/components/ui/table';
import { getRegadorName } from '@/components/seeds/seed-kanban-card';
import type { SeedWithHealth, User } from '@/lib/types/seed';

type SeedsDesistentesViewProps = {
  seeds: SeedWithHealth[];
  users: User[];
};

export function SeedsDesistentesView({ seeds, users }: SeedsDesistentesViewProps) {
  const router = useRouter();

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-title-h5 text-text-strong-950'>
          Backlog de desistentes
        </h1>
        <p className='mt-1 text-paragraph-sm text-text-sub-600'>
          Sementes que desistiram — abra o perfil para reativar.
        </p>
      </div>

      {seeds.length === 0 ? (
        <div className='rounded-20 border border-dashed border-stroke-soft-200 px-6 py-12 text-center'>
          <p className='text-paragraph-sm text-text-sub-600'>
            Nenhuma desistência registrada.
          </p>
        </div>
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Semente</Table.Head>
              <Table.Head>Desistiu em</Table.Head>
              <Table.Head>Motivo</Table.Head>
              <Table.Head>Regador</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {seeds.map((seed, index) => (
              <Fragment key={seed.id}>
                {index > 0 ? <Table.RowDivider /> : null}
                <Table.Row
                  className='cursor-pointer'
                  role='link'
                  tabIndex={0}
                  onClick={() => router.push(`/sementes/${seed.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/sementes/${seed.id}`);
                    }
                  }}
                >
                  <Table.Cell>
                    <span className='text-label-sm text-text-strong-950'>
                      {seed.name}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className='text-paragraph-sm text-text-sub-600'>
                      {seed.desistiuEm
                        ? format(parseISO(seed.desistiuEm), 'd MMM yyyy', {
                            locale: ptBR,
                          })
                        : '—'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className='text-paragraph-sm text-text-sub-600'>
                      {seed.desistenciaMotivo ?? '—'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className='text-paragraph-sm text-text-sub-600'>
                      {getRegadorName(users, seed.regadorId)}
                    </span>
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
