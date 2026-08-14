'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import {
  registerAcaoAction,
  setSituacaoAction,
  type SimpleActionState,
} from '@/lib/actions/seeds';
import { todayIsoDate } from '@/lib/marcos';
import { ACAO_LABELS, type AcaoKind, type SeedWithHealth } from '@/lib/types/seed';

const initialState: SimpleActionState = {};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
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
      {pending ? pendingLabel : label}
    </Button.Root>
  );
}

function StateBanner({ state }: { state: SimpleActionState }) {
  if (state.error) {
    return (
      <div className='rounded-10 bg-error-lighter px-3 py-2 text-paragraph-sm text-error-base'>
        {state.error}
      </div>
    );
  }

  if (state.success) {
    return (
      <div className='rounded-10 bg-success-lighter px-3 py-2 text-paragraph-sm text-success-base'>
        {state.success}
      </div>
    );
  }

  return null;
}

export function SeedAcoesPanel({ seed }: { seed: SeedWithHealth }) {
  const router = useRouter();
  const [acaoState, acaoFormAction] = useActionState(registerAcaoAction, initialState);
  const [situacaoState, situacaoFormAction] = useActionState(
    setSituacaoAction,
    initialState,
  );
  const [acaoOpen, setAcaoOpen] = useState(false);
  const [desistenciaOpen, setDesistenciaOpen] = useState(false);
  const [kind, setKind] = useState<AcaoKind>('mensagem');
  const [prevSuccess, setPrevSuccess] = useState<string | undefined>();

  // Fecha os formulários quando a action retorna sucesso (guarda de render).
  const successKey = acaoState.success ?? situacaoState.success;
  if (successKey && successKey !== prevSuccess) {
    setPrevSuccess(successKey);
    setAcaoOpen(false);
    setDesistenciaOpen(false);
  }

  useEffect(() => {
    if (acaoState.success || situacaoState.success) {
      router.refresh();
    }
  }, [acaoState.success, situacaoState.success, router]);

  const isDesistente = Boolean(seed.desistiuEm);

  return (
    <div className='space-y-4 rounded-20 border border-stroke-soft-200 bg-bg-weak-50 p-5'>
      <div>
        <h2 className='text-label-sm text-text-strong-950'>Ações do consolidador</h2>
        <p className='mt-1 text-paragraph-sm text-text-sub-600'>
          Registre visitas, mensagens e convites — o histórico mostra o que já
          foi feito por esta semente.
        </p>
      </div>

      <StateBanner state={acaoState} />
      <StateBanner state={situacaoState} />

      {!acaoOpen ? (
        <Button.Root
          variant='primary'
          mode='stroke'
          size='small'
          className='w-full'
          onClick={() => setAcaoOpen(true)}
        >
          Registrar ação
        </Button.Root>
      ) : (
        <form action={acaoFormAction} className='space-y-3 rounded-10 border border-stroke-soft-200 bg-bg-white-0 p-3'>
          <input type='hidden' name='seedId' value={seed.id} />
          <input type='hidden' name='kind' value={kind} />

          <div className='space-y-1'>
            <Label.Root>Tipo de ação</Label.Root>
            <Select.Root value={kind} onValueChange={(value) => setKind(value as AcaoKind)}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {Object.entries(ACAO_LABELS).map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div className='space-y-1'>
            <Label.Root htmlFor='acao-date'>Data</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='acao-date'
                  name='date'
                  type='date'
                  defaultValue={todayIsoDate()}
                  max={todayIsoDate()}
                  required
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className='space-y-1'>
            <Label.Root htmlFor='acao-note'>Observação (opcional)</Label.Root>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  id='acao-note'
                  name='note'
                  type='text'
                  placeholder='Ex: convidada para a célula de terça'
                />
              </Input.Wrapper>
            </Input.Root>
            <Hint.Root>A ação reinicia a contagem de dias sem contato.</Hint.Root>
          </div>

          <div className='flex gap-2'>
            <Button.Root
              type='button'
              variant='neutral'
              mode='ghost'
              size='small'
              className='flex-1'
              onClick={() => setAcaoOpen(false)}
            >
              Cancelar
            </Button.Root>
            <div className='flex-1'>
              <SubmitButton label='Salvar ação' pendingLabel='Salvando...' />
            </div>
          </div>
        </form>
      )}

      <div className='space-y-2 border-t border-stroke-soft-200 pt-4'>
        <h3 className='text-label-sm text-text-strong-950'>Situação</h3>

        {isDesistente ? (
          <div className='space-y-2'>
            <p className='text-paragraph-sm text-text-sub-600'>
              Desistente
              {seed.desistenciaMotivo ? ` — ${seed.desistenciaMotivo}` : ''}
            </p>
            <form action={situacaoFormAction}>
              <input type='hidden' name='seedId' value={seed.id} />
              <input type='hidden' name='situacao' value='reativada' />
              <SubmitButton label='Reativar semente' pendingLabel='Reativando...' />
            </form>
          </div>
        ) : (
          <div className='space-y-2'>
            {!seed.integradoEm ? (
              <form action={situacaoFormAction}>
                <input type='hidden' name='seedId' value={seed.id} />
                <input type='hidden' name='situacao' value='integrada' />
                <SubmitButton
                  label='Marcar como integrada (voluntariado)'
                  pendingLabel='Salvando...'
                />
              </form>
            ) : (
              <p className='text-paragraph-sm text-text-sub-600'>
                Integrada ao voluntariado.
              </p>
            )}

            {!desistenciaOpen ? (
              <Button.Root
                variant='error'
                mode='stroke'
                size='small'
                className='w-full'
                onClick={() => setDesistenciaOpen(true)}
              >
                Registrar desistência
              </Button.Root>
            ) : (
              <form action={situacaoFormAction} className='space-y-3 rounded-10 border border-stroke-soft-200 bg-bg-white-0 p-3'>
                <input type='hidden' name='seedId' value={seed.id} />
                <input type='hidden' name='situacao' value='desistente' />
                <div className='space-y-1'>
                  <Label.Root htmlFor='desistencia-motivo'>
                    Motivo (opcional)
                  </Label.Root>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Input
                        id='desistencia-motivo'
                        name='motivo'
                        type='text'
                        placeholder='Ex: mudou de cidade'
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>
                <div className='flex gap-2'>
                  <Button.Root
                    type='button'
                    variant='neutral'
                    mode='ghost'
                    size='small'
                    className='flex-1'
                    onClick={() => setDesistenciaOpen(false)}
                  >
                    Cancelar
                  </Button.Root>
                  <div className='flex-1'>
                    <SubmitButton label='Confirmar' pendingLabel='Salvando...' />
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
