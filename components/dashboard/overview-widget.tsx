'use client';

import {
  RiBookOpenFill,
  RiCrossFill,
  RiDropFill,
  RiFileChartLine,
  RiGroupFill,
} from '@remixicon/react';
import { Bar, BarChart, XAxis } from 'recharts';
import * as Badge from '@/components/ui/badge';
import * as Divider from '@/components/ui/divider';
import * as Select from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltipLine,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  getMarcoConfig,
  MARCO_CHART_CLASS,
  MARCO_CHART_COLOR,
  MARCO_LEGEND_ORDER,
  MARCO_STACK_ORDER,
} from '@/lib/marcos';
import type { DashboardMetrics } from '@/lib/dashboard';
import type { MarcoType } from '@/lib/marcos';
import { cn } from '@/utils/cn';

type OverviewWidgetProps = {
  overview: DashboardMetrics['overview'];
  period: DashboardMetrics['period'];
  onPeriodChange: (period: DashboardMetrics['period']) => void;
  className?: string;
};

const MARCO_ICONS = {
  confissao: RiCrossFill,
  rhema: RiBookOpenFill,
  batismo: RiDropFill,
  celula: RiGroupFill,
} as const;

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Últimos 30 dias' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'year', label: 'Último ano' },
] as const;

const overviewChartConfig = Object.fromEntries(
  MARCO_STACK_ORDER.map((type) => [
    type,
    {
      label: getMarcoConfig(type).label,
      color: MARCO_CHART_COLOR[type],
    },
  ]),
) satisfies ChartConfig;

function formatTrend(changePercent: number | null) {
  if (changePercent === null) {
    return null;
  }

  const prefix = changePercent >= 0 ? '+' : '';
  return `${prefix}${changePercent}%`;
}

function formatMarcoValue(value: number) {
  return `${value} ${value === 1 ? 'marco' : 'marcos'}`;
}

function MarcoStat({
  marcoType,
  metric,
  showDivider,
}: {
  marcoType: MarcoType;
  metric: DashboardMetrics['overview']['marcoTotals'][MarcoType];
  showDivider: boolean;
}) {
  const marco = getMarcoConfig(marcoType);
  const trend = formatTrend(metric.changePercent);
  const Icon = MARCO_ICONS[marcoType];

  return (
    <>
      {showDivider ? (
        <div className='hidden w-px self-stretch bg-stroke-soft-200 lg:block' />
      ) : null}
      <div className='flex min-w-0 flex-1 items-start gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs'>
          <Icon className='size-5 text-text-sub-600' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-subheading-2xs text-text-soft-400'>{marco.label}</p>
          <div className='mt-1 flex items-center gap-1'>
            <p className='text-label-md text-text-strong-950'>{metric.value}</p>
            {trend ? (
              <Badge.Root
                size='small'
                variant='light'
                color={(metric.changePercent ?? 0) >= 0 ? 'green' : 'red'}
              >
                {trend}
              </Badge.Root>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

const OVERVIEW_CHART_BAR_HEIGHT = 162;
const OVERVIEW_CHART_HEIGHT = 200;

function ChartGrid({ yAxisSteps }: { yAxisSteps: number[] }) {
  const linePositions = ['top-0', 'top-1/3', 'top-2/3', 'bottom-0'] as const;

  return (
    <div
      className='pointer-events-none absolute inset-x-0 top-0 z-0 rounded-sm bg-bg-weak-50'
      style={{ height: OVERVIEW_CHART_BAR_HEIGHT }}
    >
      {yAxisSteps.map((step, index) => (
        <div
          key={step}
          className={cn(
            'absolute left-0 right-0 h-px bg-stroke-soft-200',
            linePositions[index],
          )}
        />
      ))}
    </div>
  );
}

export function OverviewWidget({
  overview,
  period,
  onPeriodChange,
  className,
}: OverviewWidgetProps) {
  const barChartData = overview.chartBuckets.map((bucket) => ({
    label: bucket.label,
    ...bucket.counts,
  }));

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs',
        className,
      )}
    >
      <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
        <div className='flex min-w-0 items-center gap-2 py-1'>
          <RiFileChartLine className='size-6 shrink-0 text-text-sub-600' />
          <p className='text-label-md text-text-strong-950'>Visão geral</p>
        </div>

        <div className='flex flex-wrap items-center gap-4'>
          {MARCO_LEGEND_ORDER.map((marcoType) => {
            const marco = getMarcoConfig(marcoType);

            return (
              <div key={marcoType} className='flex items-center gap-1'>
                <span
                  className={cn(
                    'size-4 rounded-full',
                    MARCO_CHART_CLASS[marcoType],
                  )}
                />
                <span className='text-label-xs text-text-sub-600'>
                  {marco.label}
                </span>
              </div>
            );
          })}

          <Select.Root
            variant='compact'
            size='small'
            value={period}
            onValueChange={(value) =>
              onPeriodChange(value as DashboardMetrics['period'])
            }
          >
            <Select.Trigger className='min-w-[140px]'>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {PERIOD_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <Divider.Root variant='line' />

      <div className='flex flex-col gap-4 lg:flex-row lg:items-start'>
        {MARCO_LEGEND_ORDER.map((marcoType, index) => (
          <MarcoStat
            key={marcoType}
            marcoType={marcoType}
            metric={overview.marcoTotals[marcoType]}
            showDivider={index > 0}
          />
        ))}
      </div>

      <Divider.Root variant='line' />

      <div className='flex gap-6'>
        <div
          className='flex w-6 shrink-0 flex-col justify-between text-paragraph-xs text-text-sub-600'
          style={{ height: OVERVIEW_CHART_BAR_HEIGHT }}
        >
          {overview.yAxisSteps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>

        <div className='relative min-w-0 flex-1'>
          <ChartGrid yAxisSteps={overview.yAxisSteps} />

          <ChartContainer
            config={overviewChartConfig}
            chartHeight={OVERVIEW_CHART_HEIGHT}
            className='relative z-10 min-h-0'
          >
            <BarChart
              accessibilityLayer
              data={barChartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <ChartTooltipLine valueFormatter={formatMarcoValue} />
              {MARCO_STACK_ORDER.map((marcoType) => (
                <Bar
                  key={marcoType}
                  dataKey={marcoType}
                  stackId='marcos'
                  fill={`var(--color-${marcoType})`}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
