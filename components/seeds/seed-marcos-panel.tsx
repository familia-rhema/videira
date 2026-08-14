'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Button from '@/components/ui/button';
import * as Checkbox from '@/components/ui/checkbox';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import { SeedMarcoBadges } from '@/components/seeds/seed-marco-badges';
import {
  registerMarcoAction,
  type RegisterMarcoState,
} from '@/lib/actions/marcos';
import { MARCOS, todayIsoDate } from '@/lib/marcos';
import type { SeedWithHealth } from '@/lib/types/seed';

type SeedMarcosPanelProps = {
  seed: SeedWithHealth;
};

const initialState: RegisterMarcoState = {};

function RegisterMarcoButton() {
  const { pending } = useFormStatus();

  return (
    <Button.Root
      type='submit'
      variant='primary'
      mode='filled'
      size='small'
      disabled={pending}
      className='w-full'
    >
      {pending ? 'Salvando...' : 'Registrar marco'}
    </Button.Root>
  );
}

function formatRegisteredDate(date: string) {
  return format(parseISO(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function SeedMarcosPanel({ seed }: SeedMarcosPanelProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(registerMarcoAction, initialState);
  const [activeMarco, setActiveMarco] = useState<string | null>(null);
  const [prevSuccess, setPrevSuccess] = useState<string | undefined>();

  // Fecha o formulário quando a action retorna sucesso (guarda de render).
  if (state.success && state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    setActiveMarco(null);
  }

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <aside className='space-y-4 rounded-20 border border-stroke-soft-200 bg-bg-weak-50 p-5'>
      <div>
        <h2 className='text-label-sm text-text-strong-950'>Marcos</h2>
        <p className='mt-1 text-paragraph-sm text-text-sub-600'>
          Registre quando a semente concluir cada etapa. Marcos não podem ser
          desfeitos.
        </p>
        <div className='mt-3'>
          <SeedMarcoBadges seed={seed} />
        </div>
      </div>

      {state.error ? (
        <div className='rounded-10 bg-error-lighter px-3 py-2 text-paragraph-sm text-error-base'>
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className='rounded-10 bg-success-lighter px-3 py-2 text-paragraph-sm text-success-base'>
          {state.success}
        </div>
      ) : null}

      <div className='space-y-3'>
        {MARCOS.map((marco) => {
          const registeredDate = seed[marco.field];
          const isOpen = activeMarco === marco.type;

          if (registeredDate) {
            return (
              <div
                key={marco.type}
                className='rounded-10 border border-stroke-soft-200 bg-bg-white-0 p-3'
              >
                <div className='flex items-center gap-2'>
                  <marco.icon className='size-4 text-text-sub-600' />
                  <p className='text-label-sm text-text-strong-950'>
                    {marco.label}
                  </p>
                </div>
                <p className='mt-2 text-paragraph-xs text-text-sub-600'>
                  Registrado em {formatRegisteredDate(registeredDate)}
                </p>
                {marco.type === 'batismo' && seed.jaBatizadoExterno ? (
                  <p className='mt-1 text-paragraph-xs text-text-soft-400'>
                    Já batizado em outra igreja
                  </p>
                ) : null}
              </div>
            );
          }

          return (
            <div
              key={marco.type}
              className='rounded-10 border border-stroke-soft-200 bg-bg-white-0 p-3'
            >
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <marco.icon className='size-4 text-text-sub-600' />
                  <p className='text-label-sm text-text-strong-950'>
                    {marco.label}
                  </p>
                </div>
                {!isOpen ? (
                  <Button.Root
                    variant='neutral'
                    mode='stroke'
                    size='xsmall'
                    onClick={() => setActiveMarco(marco.type)}
                  >
                    Registrar
                  </Button.Root>
                ) : null}
              </div>

              {isOpen ? (
                <form action={formAction} className='mt-3 space-y-3'>
                  <input type='hidden' name='seedId' value={seed.id} />
                  <input type='hidden' name='marco' value={marco.type} />

                  <div className='space-y-1'>
                    <Label.Root htmlFor={`date-${marco.type}`}>
                      Data do marco
                    </Label.Root>
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.Input
                          id={`date-${marco.type}`}
                          name='date'
                          type='date'
                          defaultValue={todayIsoDate()}
                          max={todayIsoDate()}
                          required
                        />
                      </Input.Wrapper>
                    </Input.Root>
                    <Hint.Root>Padrão: hoje. Pode ser uma data anterior.</Hint.Root>
                  </div>

                  {marco.type === 'batismo' ? (
                    <label className='flex items-start gap-2'>
                      <Checkbox.Root
                        id={`externo-${marco.type}`}
                        name='jaBatizadoExterno'
                      />
                      <span className='text-paragraph-sm text-text-sub-600'>
                        Já batizado em outra igreja
                      </span>
                    </label>
                  ) : null}

                  <div className='flex gap-2'>
                    <Button.Root
                      type='button'
                      variant='neutral'
                      mode='ghost'
                      size='small'
                      className='flex-1'
                      onClick={() => setActiveMarco(null)}
                    >
                      Cancelar
                    </Button.Root>
                    <div className='flex-1'>
                      <RegisterMarcoButton />
                    </div>
                  </div>
                </form>
              ) : (
                <p className='mt-2 text-paragraph-xs text-text-soft-400'>
                  Pendente
                </p>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
