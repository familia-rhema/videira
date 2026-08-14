'use client';

import {
  KanbanColumnHeader,
  SeedKanbanCard,
  getRegadorName,
} from '@/components/seeds/seed-kanban-card';
import type { SeedWithHealth, User } from '@/lib/types/seed';

type SeedsFiltersViewProps = {
  seeds: SeedWithHealth[];
  users: User[];
};

// Colunas de passos não concluídos — a mesma semente pode aparecer em várias.
const FILTER_COLUMNS: Array<{
  key: string;
  label: string;
  matches: (seed: SeedWithHealth) => boolean;
}> = [
  {
    key: 'sem-confissao',
    label: 'Não confessou ainda',
    matches: (seed) => !seed.confissaoFeEm,
  },
  {
    key: 'sem-rhema',
    label: 'Sem Visão Rhema',
    matches: (seed) => !seed.rhemaConcluidoEm,
  },
  {
    key: 'sem-batismo',
    label: 'Sem batismo',
    matches: (seed) => !seed.batizadoEm && !seed.jaBatizadoExterno,
  },
  {
    key: 'sem-celula',
    label: 'Sem célula',
    matches: (seed) => !seed.entrouCelulaEm,
  },
];

export function SeedsFiltersView({ seeds, users }: SeedsFiltersViewProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-title-h5 text-text-strong-950'>Passos não concluídos</h1>
        <p className='mt-1 text-paragraph-sm text-text-sub-600'>
          Cada coluna é um filtro — a mesma semente pode aparecer em mais de
          uma.
        </p>
      </div>

      <div className='flex gap-4 overflow-x-auto pb-2'>
        {FILTER_COLUMNS.map(({ key, label, matches }) => {
          const columnSeeds = seeds.filter(matches);

          return (
            <section key={key} className='flex w-[280px] shrink-0 flex-col gap-3'>
              <KanbanColumnHeader
                label={label}
                count={columnSeeds.length}
                headerClass='border-stroke-soft-200 bg-bg-white-0 text-text-strong-950'
                dotClass='bg-primary-base'
              />

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
        })}
      </div>
    </div>
  );
}
