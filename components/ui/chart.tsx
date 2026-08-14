'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/utils/cn';

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  chartHeight = 280,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  chartHeight?: number;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children'];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          'flex aspect-auto w-full justify-center text-text-sub-600',
          "[&_.recharts-cartesian-axis-tick_text]:fill-text-soft-400 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-stroke-soft-200 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-stroke-soft-200",
          className,
        )}
        style={
          Object.fromEntries(
            Object.entries(config).map(([key, item]) => [
              `--color-${key}`,
              item.color,
            ]),
          ) as React.CSSProperties
        }
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer width='100%' height={chartHeight}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip(
  props: React.ComponentProps<typeof RechartsPrimitive.Tooltip>,
) {
  return <RechartsPrimitive.Tooltip {...props} />;
}

export function ChartLegend(
  props: React.ComponentProps<typeof RechartsPrimitive.Legend>,
) {
  return <RechartsPrimitive.Legend {...props} />;
}

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number;
    color?: string;
    name?: string;
  }>;
  label?: string;
  indicator?: 'line' | 'dot';
  valueFormatter?: (value: number, key: string) => React.ReactNode;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = 'line',
  valueFormatter,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className='grid min-w-[8rem] gap-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1.5 shadow-regular-md'>
      {label ? (
        <div className='border-b border-stroke-soft-200 pb-1.5 text-label-xs font-medium text-text-strong-950'>
          {label}
        </div>
      ) : null}
      <div className='grid gap-1.5'>
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? '');
          const itemConfig = config[key];
          const color = item.color ?? itemConfig?.color;
          const value = Number(item.value ?? 0);
          const formattedValue = valueFormatter
            ? valueFormatter(value, key)
            : value.toLocaleString('pt-BR');

          return (
            <div
              key={key}
              className='flex w-full flex-wrap items-stretch gap-2'
            >
              {indicator === 'line' ? (
                <div
                  className='my-0.5 w-1 shrink-0 rounded-[2px]'
                  style={{ backgroundColor: color }}
                />
              ) : (
                <span
                  className='my-0.5 size-2 shrink-0 rounded-full'
                  style={{ backgroundColor: color }}
                />
              )}
              <div className='flex flex-1 items-center justify-between gap-4 leading-none'>
                <span className='text-paragraph-xs text-text-sub-600'>
                  {itemConfig?.label ?? key}
                </span>
                <span className='text-label-xs font-medium tabular-nums text-text-strong-950'>
                  {formattedValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartTooltipLine({
  valueFormatter,
  ...props
}: Omit<
  React.ComponentProps<typeof RechartsPrimitive.Tooltip>,
  'content' | 'cursor'
> & {
  valueFormatter?: ChartTooltipContentProps['valueFormatter'];
}) {
  return (
    <ChartTooltip
      cursor={false}
      content={
        <ChartTooltipContent indicator='line' valueFormatter={valueFormatter} />
      }
      {...props}
    />
  );
}

export function ChartLegendContent({
  payload,
}: {
  payload?: Array<{
    value?: string;
    dataKey?: string | number;
    color?: string;
  }>;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className='flex flex-wrap items-center justify-center gap-4 pt-3'>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value ?? '');
        const itemConfig = config[key];

        return (
          <div
            key={key}
            className='flex items-center gap-1.5 text-label-xs text-text-sub-600'
          >
            <span
              className='size-2.5 shrink-0 rounded-full'
              style={{
                backgroundColor: item.color ?? itemConfig?.color,
              }}
            />
            {itemConfig?.label ?? item.value}
          </div>
        );
      })}
    </div>
  );
}
