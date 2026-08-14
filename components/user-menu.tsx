'use client';

import { RiLogoutBoxRLine } from '@remixicon/react';
import * as Avatar from '@/components/ui/avatar';
import * as Badge from '@/components/ui/badge';
import * as CompactButton from '@/components/ui/compact-button';
import { logoutAction } from '@/lib/actions/auth';
import { ROLE_BADGE_COLORS, ROLE_LABELS } from '@/lib/roles';
import type { User } from '@/lib/types/seed';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

export function UserMenu({ currentUser }: { currentUser: User }) {
  return (
    <div className='flex w-full items-center gap-3 rounded-10 p-1.5'>
      <Avatar.Root size='40' color='gray'>
        {getInitials(currentUser.name)}
      </Avatar.Root>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-1'>
          <p className='truncate text-label-sm text-text-strong-950'>
            {currentUser.name}
          </p>
          <Badge.Root
            size='small'
            variant='light'
            color={ROLE_BADGE_COLORS[currentUser.role]}
            className='shrink-0 rounded-[5px] uppercase'
          >
            {ROLE_LABELS[currentUser.role]}
          </Badge.Root>
        </div>
        <p className='truncate text-label-xs text-text-soft-400'>
          {currentUser.email || currentUser.cpf}
        </p>
      </div>
      <form action={logoutAction}>
        <CompactButton.Root type='submit' variant='stroke' size='medium'>
          <CompactButton.Icon as={RiLogoutBoxRLine} />
        </CompactButton.Root>
      </form>
    </div>
  );
}
