import { Suspense } from 'react';
import { DashboardHome } from '@/components/dashboard/dashboard-home';
import { VolunteerHome } from '@/components/dashboard/volunteer-home';
import {
  getDashboardMetrics,
  type DashboardPeriod,
} from '@/lib/dashboard';
import { getSessionUser } from '@/lib/auth/session';
import { isAdminOrLider, listVisibleSeeds } from '@/lib/access';
import { listGroupsForMember } from '@/lib/store/groups';
import { listSeeds } from '@/lib/store/seeds';

type DashboardPageProps = {
  searchParams: Promise<{
    period?: DashboardPeriod;
  }>;
};

const VALID_PERIODS: DashboardPeriod[] = ['week', 'month', 'quarter', 'year'];

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const currentUser = await getSessionUser();

  if (!isAdminOrLider(currentUser)) {
    const [allSeeds, groups] = await Promise.all([
      listSeeds(),
      listGroupsForMember(currentUser.id),
    ]);
    const seeds = await listVisibleSeeds(currentUser, allSeeds);

    return (
      <VolunteerHome
        currentUser={currentUser}
        seeds={seeds}
        hasGroups={groups.length > 0}
      />
    );
  }

  const resolvedSearchParams = await searchParams;
  const period = VALID_PERIODS.includes(resolvedSearchParams.period as DashboardPeriod)
    ? (resolvedSearchParams.period as DashboardPeriod)
    : 'month';

  const metrics = await getDashboardMetrics(period);

  return (
    <Suspense fallback={<div className='p-8 text-paragraph-sm'>Carregando...</div>}>
      <DashboardHome metrics={metrics} />
    </Suspense>
  );
}
