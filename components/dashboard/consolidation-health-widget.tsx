import Link from 'next/link';
import { RiMore2Line, RiSeedlingLine, RiSpeedUpLine } from '@remixicon/react';
import * as CompactButton from '@/components/ui/compact-button';
import * as Divider from '@/components/ui/divider';
import type { ConsolidationHealth } from '@/lib/dashboard';
import { cn } from '@/utils/cn';

type ConsolidationHealthWidgetProps = {
  health: ConsolidationHealth;
  className?: string;
};

const SEGMENT_COLORS = [
  'bg-success-base',
  'bg-success-base',
  'bg-away-base',
  'bg-warning-base',
  'bg-error-base',
] as const;

function getSegmentColor(score: number, index: number, total: number) {
  const filledRatio = score / 100;
  const filledIndex = Math.round(filledRatio * total);

  if (index >= filledIndex) {
    return 'bg-bg-soft-200';
  }

  const position = index / total;
  if (position < 0.55) return SEGMENT_COLORS[0];
  if (position < 0.7) return SEGMENT_COLORS[1];
  if (position < 0.82) return SEGMENT_COLORS[2];
  if (position < 0.92) return SEGMENT_COLORS[3];
  return SEGMENT_COLORS[4];
}

export function ConsolidationHealthWidget({
  health,
  className,
}: ConsolidationHealthWidgetProps) {
  const segments = Array.from({ length: health.totalSegments }, (_, index) =>
    getSegmentColor(health.score, index, health.totalSegments),
  );

  return (
    <div
      className={cn(
        'flex w-fit max-w-full shrink-0 flex-col gap-4 self-start rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-regular-xs',
        className,
      )}
    >
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2 py-1'>
          <RiSpeedUpLine className='size-6 shrink-0 text-text-sub-600' />
          <p className='whitespace-nowrap text-label-md text-text-strong-950'>
            Saúde da consolidação
          </p>
        </div>
        <CompactButton.Root variant='stroke' size='medium' asChild>
          <Link href='/sementes' aria-label='Ver detalhes da consolidação'>
            <CompactButton.Icon as={RiMore2Line} />
          </Link>
        </CompactButton.Root>
      </div>

      <Divider.Root variant='line' />

      <div className='flex items-start gap-4'>
        <div className='min-w-0 flex-1'>
          <p className='text-paragraph-lg text-text-sub-600'>
            A saúde da consolidação está em{' '}
            <span className='font-medium text-text-strong-950'>
              {health.score}%
            </span>
          </p>
          <p className='mt-1 text-paragraph-xs text-text-sub-600'>
            {health.label} — {health.description}
          </p>
        </div>
        <div className='flex size-11 shrink-0 items-center justify-center rounded-full bg-warning-lighter'>
          <RiSeedlingLine className='size-6 text-warning-base' />
        </div>
      </div>

      <div className='flex h-8 w-72 max-w-full items-stretch gap-1'>
        {segments.map((color, index) => (
          <div key={index} className={cn('min-w-0 flex-1 rounded-sm', color)} />
        ))}
      </div>
    </div>
  );
}
