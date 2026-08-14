import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RiCheckLine } from '@remixicon/react';
import type { SeedEvent } from '@/lib/types/seed';
import { cn } from '@/utils/cn';

type SeedTimelineProps = {
  events: SeedEvent[];
};

function formatEventDate(date: string) {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function SeedTimeline({ events }: SeedTimelineProps) {
  if (events.length === 0) {
    return (
      <p className='text-paragraph-sm text-text-sub-600'>
        Nenhum evento registrado ainda.
      </p>
    );
  }

  const chronologicalEvents = [...events].sort(
    (a, b) =>
      new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  return (
    <div className='relative'>
      {chronologicalEvents.length > 1 ? (
        <div
          aria-hidden
          className='absolute bottom-3 left-3 top-3 w-px -translate-x-1/2 bg-stroke-soft-200'
        />
      ) : null}

      <ol className='space-y-0'>
        {chronologicalEvents.map((event, index) => {
          const isLatest = index === chronologicalEvents.length - 1;

          return (
            <li key={event.id} className='relative flex gap-4 pb-6 last:pb-0'>
              <div className='relative z-10 flex w-6 shrink-0 justify-center'>
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full',
                    isLatest
                      ? 'bg-primary-base text-static-white shadow-regular-xs'
                      : 'bg-success-base text-static-white',
                  )}
                >
                  <RiCheckLine className='size-3.5' strokeWidth={2.5} />
                </span>
              </div>

              <div className='min-w-0 flex-1 pt-0.5'>
                <p
                  className={cn(
                    'text-label-sm',
                    isLatest
                      ? 'text-text-strong-950'
                      : 'text-text-sub-600',
                  )}
                >
                  {event.description}
                </p>
                <p className='mt-1 text-paragraph-xs text-text-soft-400'>
                  {formatEventDate(event.occurredAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
