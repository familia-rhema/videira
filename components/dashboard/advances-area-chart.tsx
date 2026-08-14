'use client';

import { RiArrowDownLine, RiArrowUpLine, RiLineChartLine } from '@remixicon/react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import * as Divider from '@/components/ui/divider';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipLine,
  type ChartConfig,
} from '@/components/ui/chart';
import type { AdvancesChart } from '@/lib/dashboard';
import {
  getMarcoConfig,
  MARCO_CHART_COLOR,
  MARCO_LEGEND_ORDER,
  MARCO_STACK_ORDER,
  type MarcoType,
} from '@/lib/marcos';
import { cn } from '@/utils/cn';

type AdvancesAreaChartProps = {
  chart: AdvancesChart;
  periodLabel: string;
  className?: string;
};

const chartConfig = Object.fromEntries(
  MARCO_STACK_ORDER.map((type) => [
    type,
    {
      label: getMarcoConfig(type).label,
      color: MARCO_CHART_COLOR[type],
    },
  ]),
) satisfies ChartConfig;

function formatMarcoValue(value: number) {
  return `${value} ${value === 1 ? 'marco' : 'marcos'}`;
}

export function AdvancesAreaChart({
  chart,
  periodLabel,
  className,
}: AdvancesAreaChartProps) {
  const trend = chart.totalChangePercent;
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs sm:p-5',
        className,
      )}
    >
      <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-center gap-2'>
          <RiLineChartLine className='size-6 shrink-0 text-text-sub-600' />
          <div>
            <p className='text-label-md text-text-strong-950'>
              Novos passos avançados
            </p>
            <p className='text-paragraph-xs text-text-sub-600'>
              Marcos registrados por intervalo — {periodLabel.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <Divider.Root variant='line' />

      <ChartContainer config={chartConfig} className='min-h-[280px] w-full'>
        <AreaChart
          data={chart.data}
          margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis
            dataKey='label'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
          />
          <ChartTooltipLine valueFormatter={formatMarcoValue} />
          {MARCO_STACK_ORDER.map((marcoType: MarcoType) => (
            <Area
              key={marcoType}
              dataKey={marcoType}
              type='natural'
              stackId='marcos'
              fill={`var(--color-${marcoType})`}
              fillOpacity={0.35}
              stroke={`var(--color-${marcoType})`}
              strokeWidth={2}
            />
          ))}
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>

      <Divider.Root variant='line' />

      <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-2 text-label-sm text-text-strong-950'>
          {trend !== null ? (
            <>
              {isPositive ? (
                <RiArrowUpLine className='size-4 text-success-base' />
              ) : (
                <RiArrowDownLine className='size-4 text-error-base' />
              )}
              <span>
                {isPositive ? 'Crescimento' : 'Queda'} de{' '}
                {Math.abs(trend)}% em relação ao período anterior
              </span>
            </>
          ) : (
            <span>Sem marcos no período anterior para comparar</span>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          {MARCO_LEGEND_ORDER.map((marcoType) => (
            <div key={marcoType} className='flex items-center gap-1'>
              <span
                className='size-2.5 rounded-full'
                style={{ backgroundColor: MARCO_CHART_COLOR[marcoType] }}
              />
              <span className='text-paragraph-xs text-text-sub-600'>
                {getMarcoConfig(marcoType).label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
