'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import { createUserAction, type UserActionState } from '@/lib/actions/users';
import { ROLE_LABELS } from '@/lib/roles';
import type { UserRole } from '@/lib/types/seed';

const initialState: UserActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button.Root type='submit' variant='primary' mode='filled' disabled={pending}>
      {pending ? 'Criando...' : 'Criar conta'}
    </Button.Root>
  );
}

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUserAction, initialState);
  const [role, setRole] = useState<UserRole>('lider');

  return (
    <form action={formAction} className='space-y-4'>
      {state.error ? (
        <div className='rounded-10 bg-error-lighter px-3 py-2 text-paragraph-sm text-error-base'>
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className='rounded-10 bg-success-lighter px-3 py-2 text-paragraph-sm text-success-dark'>
          {state.success}
        </div>
      ) : null}

      <input type='hidden' name='role' value={role} />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='space-y-1'>
          <Label.Root htmlFor='create-user-name'>Nome completo</Label.Root>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input id='create-user-name' name='name' type='text' required />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div className='space-y-1'>
          <Label.Root htmlFor='create-user-role'>Papel</Label.Root>
          <Select.Root value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <Select.Trigger id='create-user-role'>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value='admin'>{ROLE_LABELS.admin}</Select.Item>
              <Select.Item value='lider'>{ROLE_LABELS.lider}</Select.Item>
              <Select.Item value='voluntario'>{ROLE_LABELS.voluntario}</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {role === 'voluntario' ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-1'>
            <Label.Root htmlFor='create-user-cpf'>CPF</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='create-user-cpf'
                  name='cpf'
                  type='text'
                  inputMode='numeric'
                  placeholder='000.000.000-00'
                  required
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className='space-y-1'>
            <Label.Root htmlFor='create-user-birthdate'>Data de nascimento</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='create-user-birthdate'
                  name='dataNascimento'
                  type='date'
                  required
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-1'>
            <Label.Root htmlFor='create-user-email'>Email</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input id='create-user-email' name='email' type='email' required />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className='space-y-1'>
            <Label.Root htmlFor='create-user-password'>Senha</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='create-user-password'
                  name='password'
                  type='password'
                  minLength={6}
                  required
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
