'use client';

import { Fragment, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as Avatar from '@/components/ui/avatar';
import * as Badge from '@/components/ui/badge';
import * as Select from '@/components/ui/select';
import * as Table from '@/components/ui/table';
import { updateUserRoleAction } from '@/lib/actions/users';
import { ROLE_BADGE_COLORS, ROLE_LABELS, ROLE_OPTIONS } from '@/lib/roles';
import type { User, UserRole } from '@/lib/types/seed';

type UsersSectionProps = {
  users: User[];
  canEditRoles: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

function RoleCell({ user }: { user: User }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(role: UserRole) {
    if (role === user.role || isPending) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set('userId', user.id);
      formData.set('role', role);
      await updateUserRoleAction({}, formData);
      router.refresh();
    });
  }

  return (
    <Select.Root
      size='small'
      value={user.role}
      onValueChange={(value) => handleChange(value as UserRole)}
    >
      <Select.Trigger className='w-[150px]'>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {ROLE_OPTIONS.map((role) => (
          <Select.Item key={role} value={role}>
            {ROLE_LABELS[role]}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

export function UsersSection({ users, canEditRoles }: UsersSectionProps) {
  return (
    <div className='space-y-3'>
      <div>
        <h2 className='text-label-sm text-text-strong-950'>Usuários</h2>
        <p className='mt-1 text-paragraph-sm text-text-sub-600'>
          {canEditRoles
            ? 'Defina o papel de cada pessoa no sistema.'
            : 'Somente administradores podem alterar papéis.'}
        </p>
      </div>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Pessoa</Table.Head>
            <Table.Head>Papel</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((user, index) => (
            <Fragment key={user.id}>
              {index > 0 ? <Table.RowDivider /> : null}
              <Table.Row>
                <Table.Cell>
                  <div className='flex items-center gap-3'>
                    <Avatar.Root size='32' color='gray'>
                      {getInitials(user.name)}
                    </Avatar.Root>
                    <div className='min-w-0'>
                      <p className='truncate text-label-sm text-text-strong-950'>
                        {user.name}
                      </p>
                      <p className='truncate text-paragraph-xs text-text-soft-400'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {canEditRoles ? (
                    <RoleCell user={user} />
                  ) : (
                    <Badge.Root
                      size='medium'
                      variant='light'
                      color={ROLE_BADGE_COLORS[user.role]}
                      className='uppercase'
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge.Root>
                  )}
                </Table.Cell>
              </Table.Row>
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
