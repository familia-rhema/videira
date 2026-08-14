'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from '@remixicon/react';
import * as Avatar from '@/components/ui/avatar';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Modal from '@/components/ui/modal';
import { GroupForm, type SeedOption } from '@/components/equipe/group-form';
import { deleteGroupAction } from '@/lib/actions/groups';
import { SEED_GENDER_LABELS } from '@/lib/types/seed';
import type { GroupFilter, VisibilityGroup } from '@/lib/types/group';
import type { User } from '@/lib/types/seed';

type GroupsSectionProps = {
  groups: VisibilityGroup[];
  volunteers: User[];
  seeds: SeedOption[];
  usersById: Map<string, User>;
};

type ModalState = { mode: 'create' } | { mode: 'edit'; group: VisibilityGroup };

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

function describeFilter(filter: GroupFilter): string {
  switch (filter.type) {
    case 'neighborhood':
      return `Bairro: ${filter.neighborhoods.join(', ')}`;
    case 'gender':
      return `Sexo: ${filter.genders.map((gender) => SEED_GENDER_LABELS[gender]).join(', ')}`;
    case 'manual':
      return `Seleção manual: ${filter.seedIds.length} ${filter.seedIds.length === 1 ? 'semente' : 'sementes'}`;
    default:
      return '';
  }
}

export function GroupsSection({
  groups,
  volunteers,
  seeds,
  usersById,
}: GroupsSectionProps) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (isPending) return;
    if (!window.confirm('Remover este grupo? Os voluntários deixarão de ver as sementes filtradas por ele.')) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('id', id);
      await deleteGroupAction({}, formData);
      router.refresh();
    });
  }

  function handleSuccess() {
    setModalState(null);
    router.refresh();
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-label-sm text-text-strong-950'>Grupos</h2>
          <p className='mt-1 text-paragraph-sm text-text-sub-600'>
            Voluntários enxergam a união das sementes de todos os grupos em
            que estão.
          </p>
        </div>
        <Button.Root
          variant='neutral'
          mode='stroke'
          size='small'
          onClick={() => setModalState({ mode: 'create' })}
        >
          <Button.Icon as={RiAddLine} />
          Novo grupo
        </Button.Root>
      </div>

      {groups.length === 0 ? (
        <div className='rounded-20 border border-dashed border-stroke-soft-200 px-6 py-12 text-center'>
          <p className='text-paragraph-sm text-text-sub-600'>
            Nenhum grupo criado ainda.
          </p>
        </div>
      ) : (
        <div className='grid gap-3 sm:grid-cols-2'>
          {groups.map((group) => {
            const members = group.memberIds
              .map((id) => usersById.get(id))
              .filter((user): user is User => Boolean(user));

            return (
              <div
                key={group.id}
                className='space-y-3 rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-4'
              >
                <div className='flex items-start justify-between gap-2'>
                  <p className='text-label-sm text-text-strong-950'>
                    {group.name}
                  </p>
                  <div className='flex shrink-0 gap-1'>
                    <CompactButton.Root
                      variant='stroke'
                      size='medium'
                      aria-label={`Editar ${group.name}`}
                      onClick={() => setModalState({ mode: 'edit', group })}
                    >
                      <CompactButton.Icon as={RiPencilLine} />
                    </CompactButton.Root>
                    <CompactButton.Root
                      variant='stroke'
                      size='medium'
                      aria-label={`Remover ${group.name}`}
                      onClick={() => handleDelete(group.id)}
                    >
                      <CompactButton.Icon as={RiDeleteBinLine} />
                    </CompactButton.Root>
                  </div>
                </div>

                <p className='text-paragraph-sm text-text-sub-600'>
                  {describeFilter(group.filter)}
                </p>

                {members.length === 0 ? (
                  <p className='text-paragraph-xs text-text-soft-400'>
                    Nenhum membro ainda.
                  </p>
                ) : (
                  <div className='flex flex-wrap items-center gap-2'>
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className='flex items-center gap-1.5 rounded-full bg-bg-weak-50 py-1 pl-1 pr-2.5'
                      >
                        <Avatar.Root size='20' color='gray'>
                          {getInitials(member.name)}
                        </Avatar.Root>
                        <span className='text-label-xs text-text-sub-600'>
                          {member.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal.Root
        open={Boolean(modalState)}
        onOpenChange={(open) => !open && setModalState(null)}
      >
        <Modal.Content className='max-w-lg'>
          <Modal.Header
            title={modalState?.mode === 'edit' ? 'Editar grupo' : 'Novo grupo'}
            description='Defina quem enxerga quais sementes.'
          />
          <Modal.Body className='max-h-[70vh] overflow-y-auto'>
            {modalState ? (
              <GroupForm
                key={modalState.mode === 'edit' ? modalState.group.id : 'new'}
                mode={modalState.mode}
                group={modalState.mode === 'edit' ? modalState.group : undefined}
                volunteers={volunteers}
                seeds={seeds}
                onSuccess={handleSuccess}
              />
            ) : null}
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
