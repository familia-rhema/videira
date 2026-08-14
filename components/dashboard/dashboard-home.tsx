'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import * as SegmentedControl from '@/components/ui/segmented-control';
import { AdvancesAreaChart } from '@/components/dashboard/advances-area-chart';
import { ConsolidationHealthWidget } from '@/components/dashboard/consolidation-health-widget';
import { DashboardMetricCard } from '@/components/dashboard/dashboard-metric-card';
import { OverviewWidget } from '@/components/dashboard/overview-widget';
import type { DashboardMetrics, DashboardPeriod } from '@/lib/dashboard';

type DashboardHomeProps = {
  metrics: DashboardMetrics;
};

function DashboardPeriodControls({
  period,
}: {
  period: DashboardPeriod;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setPeriod(nextPeriod: DashboardPeriod) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPeriod === 'month') {
      params.delete('period');
    } else {
      params.set('period', nextPeriod);
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : '/');
  }

  return (
    <SegmentedControl.Root
      value={period}
      onValueChange={(value) => setPeriod(value as DashboardPeriod)}
    >
      <SegmentedControl.List className='w-full sm:w-auto sm:min-w-[420px]'>
        <SegmentedControl.Trigger value='week'>Semana</SegmentedControl.Trigger>
        <SegmentedControl.Trigger value='month'>30 dias</SegmentedControl.Trigger>
        <SegmentedControl.Trigger value='quarter'>
          Trimestre
        </SegmentedControl.Trigger>
        <SegmentedControl.Trigger value='year'>Ano</SegmentedControl.Trigger>
      </SegmentedControl.List>
    </SegmentedControl.Root>
  );
}

export function DashboardHome({ metrics }: DashboardHomeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleOverviewPeriodChange(nextPeriod: DashboardPeriod) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPeriod === 'month') {
      params.delete('period');
    } else {
      params.set('period', nextPeriod);
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : '/');
  }

  return (
    <div className='flex h-full flex-col gap-6 p-4 sm:p-8'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='text-paragraph-sm text-text-sub-600'>Dashboard</p>
          <h1 className='text-title-h5 text-text-strong-950'>
            Crescimento no Reino
          </h1>
          <p className='mt-1 text-paragraph-sm text-text-sub-600'>
            {metrics.periodLabel}
          </p>
        </div>

        <Suspense fallback={null}>
          <DashboardPeriodControls period={metrics.period} />
        </Suspense>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <DashboardMetricCard
          label='Avanços no período'
          metric={metrics.advances}
        />
        <DashboardMetricCard label='Batismos' metric={metrics.baptisms} />
        <DashboardMetricCard
          label='Formados no Visão Rhema'
          metric={metrics.rhemaGraduates}
        />
      </div>

      <div className='flex flex-col gap-4 xl:flex-row xl:items-start'>
        <ConsolidationHealthWidget health={metrics.health} />
        <OverviewWidget
          className='min-w-0 flex-1'
          overview={metrics.overview}
          period={metrics.period}
          onPeriodChange={handleOverviewPeriodChange}
        />
      </div>

      <AdvancesAreaChart
        chart={metrics.advancesChart}
        periodLabel={metrics.periodLabel}
      />
    </div>
  );
}
