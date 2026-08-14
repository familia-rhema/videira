'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  RiFilter3Line,
  RiLayoutGridLine,
  RiTableLine,
  RiUserUnfollowLine,
} from '@remixicon/react';
import * as SegmentedControl from '@/components/ui/segmented-control';
import { cn } from '@/utils/cn';

export type SeedsView = 'lista' | 'kanban' | 'filtros' | 'desistentes';

const VIEWS: Array<{ value: SeedsView; label: string; icon: typeof RiTableLine }> = [
  { value: 'lista', label: 'Lista', icon: RiTableLine },
  { value: 'kanban', label: 'Kanban', icon: RiLayoutGridLine },
  { value: 'filtros', label: 'Filtros', icon: RiFilter3Line },
  { value: 'desistentes', label: 'Desistentes', icon: RiUserUnfollowLine },
];

function parseSeedsView(value: string | undefined): SeedsView {
  return VIEWS.some((view) => view.value === value)
    ? (value as SeedsView)
    : 'lista';
}

type SeedsViewToggleProps = {
  className?: string;
};

export function SeedsViewToggle({ className }: SeedsViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = parseSeedsView(searchParams.get('view') ?? undefined);

  function setView(nextView: SeedsView) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === 'lista') {
      params.delete('view');
    } else {
      params.set('view', nextView);
    }

    const query = params.toString();
    router.push(query ? `/sementes?${query}` : '/sementes');
  }

  return (
    <SegmentedControl.Root
      value={view}
      onValueChange={(value) => setView(value as SeedsView)}
      className={cn('w-full sm:w-auto', className)}
    >
      <SegmentedControl.List className='w-full sm:w-[440px]'>
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <SegmentedControl.Trigger key={value} value={value}>
            <Icon className='size-4' />
            {label}
          </SegmentedControl.Trigger>
        ))}
      </SegmentedControl.List>
    </SegmentedControl.Root>
  );
}
