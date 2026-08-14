'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { RiSearchLine } from '@remixicon/react';
import * as Button from '@/components/ui/button';
import * as Checkbox from '@/components/ui/checkbox';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Radio from '@/components/ui/radio';
import {
  createGroupAction,
  updateGroupAction,
  type GroupActionState,
} from '@/lib/actions/groups';
import { filterNeighborhoods } from '@/lib/neighborhoods';
import {
  GROUP_FILTER_LABELS,
  type GroupFilterType,
  type VisibilityGroup,
} from '@/lib/types/group';
import { SEED_GENDER_LABELS, type SeedGender, type User } from '@/lib/types/seed';

const initialState: GroupActionState = {};

export type SeedOption = {
  id: string;
  name: string;
  neighborhood: string | null;
};

type GroupFormProps = {
  mode: 'create' | 'edit';
  group?: VisibilityGroup;
  volunteers: User[];
  seeds: SeedOption[];
  onSuccess: () => void;
};

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();

  return (
    <Button.Root
      type='submit'
      variant='primary'
      mode='filled'
      disabled={pending}
      className='w-full sm:w-auto'
    >
      {pending
        ? 'Salvando...'
        : mode === 'create'
          ? 'Criar grupo'
          : 'Salvar alterações'}
    </Button.Root>
  );
}

export function GroupForm({
  mode,
  group,
  volunteers,
  seeds,
  onSuccess,
}: GroupFormProps) {
  const action = mode === 'create' ? createGroupAction : updateGroupAction;
  const [state, formAction] = useActionState(action, initialState);
  const [filterType, setFilterType] = useState<GroupFilterType>(
    group?.filter.type ?? 'neighborhood',
  );
  const [neighborhoodQuery, setNeighborhoodQuery] = useState('');
  const [seedQuery, setSeedQuery] = useState('');

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const selectedNeighborhoods =
    group?.filter.type === 'neighborhood' ? group.filter.neighborhoods : [];
  const selectedGenders =
    group?.filter.type === 'gender' ? group.filter.genders : [];
  const selectedSeedIds =
    group?.filter.type === 'manual' ? group.filter.seedIds : [];

  const neighborhoodOptions = filterNeighborhoods(neighborhoodQuery);
  const seedOptions = seeds.filter((seed) =>
    seed.name.toLowerCase().includes(seedQuery.trim().toLowerCase()),
  );

  return (
    <form action={formAction} className='space-y-4'>
      {mode === 'edit' && group ? (
        <input type='hidden' name='id' value={group.id} />
      ) : null}

      {state.error ? (
        <div className='rounded-10 bg-error-lighter px-3 py-2 text-paragraph-sm text-error-base'>
          {state.error}
        </div>
      ) : null}

      <div className='space-y-1'>
        <Label.Root htmlFor='group-name'>
          Nome do grupo <Label.Asterisk />
        </Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id='group-name'
              name='name'
              placeholder='Ex: Zona Norte'
              defaultValue={group?.name}
              required
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className='space-y-1.5'>
        <Label.Root>Membros (voluntários)</Label.Root>
        {volunteers.length === 0 ? (
          <Hint.Root>Nenhum voluntário cadastrado ainda.</Hint.Root>
        ) : (
          <div className='max-h-40 space-y-2 overflow-y-auto rounded-10 border border-stroke-soft-200 p-3'>
            {volunteers.map((user) => (
              <label
                key={user.id}
                className='flex items-center gap-2.5 text-paragraph-sm text-text-strong-950'
              >
                <Checkbox.Root
                  name='memberIds'
                  value={user.id}
                  defaultChecked={group?.memberIds.includes(user.id)}
                />
                {user.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className='space-y-1.5'>
        <Label.Root>Tipo de filtro</Label.Root>
        <Radio.Group
          name='filterType'
          value={filterType}
          onValueChange={(value) => setFilterType(value as GroupFilterType)}
          className='flex flex-col gap-2'
        >
          {(Object.keys(GROUP_FILTER_LABELS) as GroupFilterType[]).map(
            (type) => (
              <label
                key={type}
                className='flex items-center gap-2.5 text-paragraph-sm text-text-strong-950'
              >
                <Radio.Item value={type} />
                {GROUP_FILTER_LABELS[type]}
              </label>
            ),
          )}
        </Radio.Group>
      </div>

      {filterType === 'neighborhood' ? (
        <div className='space-y-1.5'>
          <Label.Root>Bairros</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input
                placeholder='Buscar bairro…'
                value={neighborhoodQuery}
                onChange={(event) => setNeighborhoodQuery(event.target.value)}
              />
            </Input.Wrapper>
          </Input.Root>
          <div className='max-h-40 space-y-2 overflow-y-auto rounded-10 border border-stroke-soft-200 p-3'>
            {neighborhoodOptions.map((neighborhood) => (
              <label
                key={neighborhood}
                className='flex items-center gap-2.5 text-paragraph-sm text-text-strong-950'
              >
                <Checkbox.Root
                  name='neighborhoods'
                  value={neighborhood}
                  defaultChecked={selectedNeighborhoods.includes(neighborhood)}
                />
                {neighborhood}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {filterType === 'gender' ? (
        <div className='space-y-1.5'>
          <Label.Root>Sexo</Label.Root>
          <div className='flex flex-col gap-2 rounded-10 border border-stroke-soft-200 p-3'>
            {(Object.entries(SEED_GENDER_LABELS) as Array<[SeedGender, string]>).map(
              ([value, label]) => (
                <label
                  key={value}
                  className='flex items-center gap-2.5 text-paragraph-sm text-text-strong-950'
                >
                  <Checkbox.Root
                    name='genders'
                    value={value}
                    defaultChecked={selectedGenders.includes(value)}
                  />
                  {label}
                </label>
              ),
            )}
          </div>
        </div>
      ) : null}

      {filterType === 'manual' ? (
        <div className='space-y-1.5'>
          <Label.Root>Sementes selecionadas</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiSearchLine} />
              <Input.Input
                placeholder='Buscar semente…'
                value={seedQuery}
                onChange={(event) => setSeedQuery(event.target.value)}
              />
            </Input.Wrapper>
          </Input.Root>
          <div className='max-h-40 space-y-2 overflow-y-auto rounded-10 border border-stroke-soft-200 p-3'>
            {seedOptions.length === 0 ? (
              <p className='text-paragraph-sm text-text-sub-600'>
                Nenhuma semente encontrada.
              </p>
            ) : (
              seedOptions.map((seed) => (
                <label
                  key={seed.id}
                  className='flex items-center gap-2.5 text-paragraph-sm text-text-strong-950'
                >
                  <Checkbox.Root
                    name='seedIds'
                    value={seed.id}
                    defaultChecked={selectedSeedIds.includes(seed.id)}
                  />
                  {seed.name}
                  {seed.neighborhood ? (
                    <span className='text-paragraph-xs text-text-soft-400'>
                      {seed.neighborhood}
                    </span>
                  ) : null}
                </label>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className='flex justify-end pt-1'>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
