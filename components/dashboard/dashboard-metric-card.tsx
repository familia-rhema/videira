import * as Badge from '@/components/ui/badge';
import type { TrendMetric } from '@/lib/dashboard';
import { cn } from '@/utils/cn';

type DashboardMetricCardProps = {
  label: string;
  metric: TrendMetric;
  className?: string;
};

function Sparkline({ values }: { values: number[] }) {
  const width = 280;
  const height = 44;
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - (value / max) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className='h-16 w-full'
      preserveAspectRatio='none'
      aria-hidden
    >
      <polyline
        points={points}
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        className='text-information-base'
      />
    </svg>
  );
}

export function DashboardMetricCard({
  label,
  metric,
  className,
}: DashboardMetricCardProps) {
  const isPositive = (metric.changePercent ?? 0) >= 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs',
        className,
      )}
    >
      <div className='flex flex-col gap-1'>
        <p className='text-paragraph-sm text-text-sub-600'>{label}</p>
        <div className='flex items-center gap-2'>
          <p className='text-title-h5 text-text-strong-950'>{metric.value}</p>
          {metric.changePercent !== null ? (
            <Badge.Root
              size='small'
              variant='light'
              color={isPositive ? 'green' : 'red'}
            >
              {isPositive ? '+' : ''}
              {metric.changePercent}%
            </Badge.Root>
          ) : null}
        </div>
      </div>

      <Sparkline values={metric.sparkline.length ? metric.sparkline : [0]} />
    </div>
  );
}
