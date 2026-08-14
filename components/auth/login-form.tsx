'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as TabMenuHorizontal from '@/components/ui/tab-menu-horizontal';
import {
  loginWithCpfAction,
  loginWithPasswordAction,
  type AuthState,
} from '@/lib/actions/auth';

const initialState: AuthState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button.Root type='submit' variant='primary' mode='filled' disabled={pending} className='w-full'>
      {pending ? 'Entrando...' : label}
    </Button.Root>
  );
}

function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className='rounded-10 bg-error-lighter px-3 py-2 text-paragraph-sm text-error-base'>
      {error}
    </div>
  );
}

function PasswordLoginForm() {
  const [state, formAction] = useActionState(loginWithPasswordAction, initialState);

  return (
    <form action={formAction} className='space-y-4'>
      <ErrorBanner error={state.error} />

      <div className='space-y-1'>
        <Label.Root htmlFor='login-email'>Email</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input id='login-email' name='email' type='email' required autoFocus />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className='space-y-1'>
        <Label.Root htmlFor='login-password'>Senha</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input id='login-password' name='password' type='password' required />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <SubmitButton label='Entrar' />
    </form>
  );
}

function CpfLoginForm() {
  const [state, formAction] = useActionState(loginWithCpfAction, initialState);

  return (
    <form action={formAction} className='space-y-4'>
      <ErrorBanner error={state.error} />

      <div className='space-y-1'>
        <Label.Root htmlFor='login-cpf'>CPF</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id='login-cpf'
              name='cpf'
              type='text'
              inputMode='numeric'
              placeholder='000.000.000-00'
              required
              autoFocus
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className='space-y-1'>
        <Label.Root htmlFor='login-birthdate'>Data de nascimento</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input id='login-birthdate' name='dataNascimento' type='date' required />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <SubmitButton label='Entrar' />
    </form>
  );
}

export function LoginForm() {
  const [tab, setTab] = useState<'senha' | 'cpf'>('senha');

  return (
    <div className='space-y-6'>
      <TabMenuHorizontal.Root value={tab} onValueChange={(value) => setTab(value as 'senha' | 'cpf')}>
        <TabMenuHorizontal.List>
          <TabMenuHorizontal.Trigger value='senha'>Admin / Líder</TabMenuHorizontal.Trigger>
          <TabMenuHorizontal.Trigger value='cpf'>Voluntário</TabMenuHorizontal.Trigger>
        </TabMenuHorizontal.List>
      </TabMenuHorizontal.Root>

      {tab === 'senha' ? <PasswordLoginForm /> : <CpfLoginForm />}
    </div>
  );
}
