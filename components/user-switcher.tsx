'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RiArrowUpSLine, RiCheckLine } from '@remixicon/react';
import * as Avatar from '@/components/ui/avatar';
import * as Badge from '@/components/ui/badge';
import * as CompactButton from '@/components/ui/compact-button';
import * as Dropdown from '@/components/ui/dropdown';
import { switchUserAction } from '@/lib/actions/session';
import { ROLE_BADGE_COLORS, ROLE_LABELS } from '@/lib/roles';
import type { User } from '@/lib/types/seed';
import { cn } from '@/utils/cn';

type UserSwitcherProps = {
  currentUser: User;
  users: User[];
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

function UserRow({ user }: { user: User }) {
  return (
    <div className='flex min-w-0 flex-1 items-center gap-3'>
      <Avatar.Root size='40' color='gray'>
        {getInitials(user.name)}
      </Avatar.Root>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-1'>
          <p className='truncate text-label-sm text-text-strong-950'>
            {user.name}
          </p>
          <Badge.Root
            size='small'
            variant='light'
            color={ROLE_BADGE_COLORS[user.role]}
            className='shrink-0 rounded-[5px] uppercase'
          >
            {ROLE_LABELS[user.role]}
          </Badge.Root>
        </div>
        <p className='truncate text-label-xs text-text-soft-400'>
          {user.email}
        </p>
      </div>
    </div>
  );
}

export function UserSwitcher({ currentUser, users }: UserSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch(userId: string) {
    if (userId === currentUser.id || isPending) return;

    startTransition(async () => {
      await switchUserAction(userId);
      router.refresh();
    });
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          type='button'
          className={cn(
            'flex w-full items-center gap-3 rounded-10 p-1.5 text-left transition duration-200 ease-out',
            'hover:bg-bg-white-0',
            isPending && 'opacity-60',
          )}
        >
          <UserRow user={currentUser} />
          <CompactButton.Root variant='stroke' size='medium' asChild>
            <span>
              <CompactButton.Icon as={RiArrowUpSLine} />
            </span>
          </CompactButton.Root>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content align='start' side='top' className='w-[272px]'>
        <Dropdown.Label>Trocar de usuário</Dropdown.Label>
        <Dropdown.Group>
          {users.map((user) => (
            <Dropdown.Item
              key={user.id}
              onSelect={() => handleSwitch(user.id)}
              className='items-center'
            >
              <UserRow user={user} />
              {user.id === currentUser.id ? (
                <Dropdown.ItemIcon as={RiCheckLine} className='text-primary-base' />
              ) : null}
            </Dropdown.Item>
          ))}
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
