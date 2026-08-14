'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import { publicEnrollAction, type PublicEnrollState } from '@/lib/actions/turmas';

const initialState: PublicEnrollState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button.Root
      type='submit'
      variant='primary'
      mode='filled'
      disabled={pending}
      className='w-full'
    >
      {pending ? 'Enviando...' : 'Confirmar inscrição'}
    </Button.Root>
  );
}

export function PublicEnrollForm({ turmaId }: { turmaId: string }) {
  const [state, formAction] = useActionState(publicEnrollAction, initialState);

  if (state.success) {
    return (
      <div className='rounded-20 bg-success-lighter px-6 py-8 text-center'>
        <p className='text-label-md text-success-dark'>{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className='space-y-4'>
      <input type='hidden' name='turmaId' value={turmaId} />

      {state.error ? (
        <div className='rounded-10 bg-error-lighter px-3 py-2 text-paragraph-sm text-error-base'>
          {state.error}
        </div>
      ) : null}

      <div className='space-y-1'>
        <Label.Root htmlFor='enroll-name'>Nome completo</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input id='enroll-name' name='name' type='text' required />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className='space-y-1'>
        <Label.Root htmlFor='enroll-phone'>WhatsApp (DDD + número)</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id='enroll-phone'
              name='phone'
              type='tel'
              placeholder='11 91234-5678'
              required
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className='space-y-1'>
        <Label.Root htmlFor='enroll-neighborhood'>Bairro (opcional)</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input id='enroll-neighborhood' name='neighborhood' type='text' />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <SubmitButton />
    </form>
  );
}
