import { Suspense } from 'react';
import Link from 'next/link';
import { RiAddLine } from '@remixicon/react';
import * as Button from '@/components/ui/button';
import { SeedsKanban } from '@/components/seeds/seeds-kanban';
import { SeedsTable } from '@/components/seeds/seeds-table';
import { SeedsFiltersView } from '@/components/seeds/seeds-filters-view';
import { SeedsDesistentesView } from '@/components/seeds/seeds-desistentes-view';
import { SeedsViewToggle, type SeedsView } from '@/components/seeds/seeds-view-toggle';
import { listSeeds } from '@/lib/store/seeds';
import { listUsers } from '@/lib/store/users';
import { getSessionUser } from '@/lib/auth/session';
import { listVisibleSeeds } from '@/lib/access';
import type { HealthState } from '@/lib/types/seed';

type SementesPageProps = {
  searchParams: Promise<{
    health?: HealthState | 'all';
    regador?: string;
    view?: string;
  }>;
};

const VIEWS: SeedsView[] = ['lista', 'kanban', 'filtros', 'desistentes'];

export default async function SementesPage({ searchParams }: SementesPageProps) {
  const resolvedSearchParams = await searchParams;
  const health = resolvedSearchParams.health ?? 'all';
  const regadorId = resolvedSearchParams.regador;
  const view: SeedsView = VIEWS.includes(resolvedSearchParams.view as SeedsView)
    ? (resolvedSearchParams.view as SeedsView)
    : 'lista';

  const [currentUser, allSeeds, users] = await Promise.all([
    getSessionUser(),
    listSeeds({
      health: view === 'filtros' || health === 'all' ? undefined : health,
      regadorId: regadorId && regadorId !== 'all' ? regadorId : undefined,
      situacao: view === 'desistentes' ? 'desistentes' : 'ativas',
    }),
    listUsers(),
  ]);

  const seeds = await listVisibleSeeds(currentUser, allSeeds);

  return (
    <div className='flex h-full flex-col p-4 sm:p-8'>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Suspense fallback={null}>
          <SeedsViewToggle />
        </Suspense>

        <Button.Root variant='primary' mode='filled' asChild>
          <Link href='/sementes/nova'>
            <Button.Icon as={RiAddLine} />
            Nova semente
          </Link>
        </Button.Root>
      </div>

      <Suspense fallback={<div className='text-paragraph-sm'>Carregando...</div>}>
        {view === 'kanban' ? (
          <SeedsKanban seeds={seeds} users={users} />
        ) : view === 'filtros' ? (
          <SeedsFiltersView seeds={seeds} users={users} />
        ) : view === 'desistentes' ? (
          <SeedsDesistentesView seeds={seeds} users={users} />
        ) : (
          <SeedsTable seeds={seeds} users={users} />
        )}
      </Suspense>
    </div>
  );
}
