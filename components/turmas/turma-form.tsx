'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Button from '@/components/ui/button';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import { createTurmaAction, type TurmaActionState } from '@/lib/actions/turmas';
import { getNationalHoliday } from '@/lib/holidays';
import { RHEMA_TOTAL_AULAS } from '@/lib/types/turma';

const initialState: TurmaActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button.Root type='submit' variant='primary' mode='filled' disabled={pending}>
      {pending ? 'Criando...' : 'Criar turma'}
    </Button.Root>
  );
}

export function TurmaForm() {
  const [state, formAction] = useActionState(createTurmaAction, initialState);
  const [dates, setDates] = useState<string[]>(Array(RHEMA_TOTAL_AULAS).fill(''));

  // 1ª aula definida → sugere as demais semanalmente; o líder ajusta as que
  // caem em feriado (o alerta aparece embaixo de cada data).
  function setFirstDate(value: string) {
    if (!value) {
      setDates(Array(RHEMA_TOTAL_AULAS).fill(''));
      return;
    }

    const first = parseISO(value);
    setDates(
      Array.from({ length: RHEMA_TOTAL_AULAS }, (_, index) =>
        format(addDays(first, index * 7), 'yyyy-MM-dd'),
      ),
    );
  }

  function setDate(index: number, value: string) {
    setDates((prev) => prev.map((date, i) => (i === index ? value : date)));
  }

  return (
    <form action={formAction} className='max-w-xl space-y-5'>
      {state.error ? (
        <div className='rounded-10 bg-error-lighter px-3 py-2 text-paragraph-sm text-error-base'>
          {state.error}
        </div>
      ) : null}

      <div className='space-y-1'>
        <Label.Root htmlFor='turma-name'>Nome da turma</Label.Root>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              id='turma-name'
              name='name'
              type='text'
              placeholder='Ex: Turma Agosto 2026'
              required
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className='space-y-3'>
        <div>
          <p className='text-label-sm text-text-strong-950'>Datas das 5 aulas</p>
          <p className='mt-1 text-paragraph-xs text-text-sub-600'>
            Defina a 1ª aula e as demais são sugeridas semanalmente. Feriados
            nacionais são sinalizados para você decidir se mantém ou move.
          </p>
        </div>

        {dates.map((date, index) => {
          const holiday = date ? getNationalHoliday(date) : null;

          return (
            <div key={index} className='space-y-1'>
              <Label.Root htmlFor={`lesson-${index}`}>
                Aula {index + 1}
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id={`lesson-${index}`}
                    name={`lesson-${index}`}
                    type='date'
                    value={date}
                    onChange={(event) =>
                      index === 0
                        ? setFirstDate(event.target.value)
                        : setDate(index, event.target.value)
                    }
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
              {holiday ? (
                <p className='text-paragraph-xs text-warning-dark'>
                  ⚠ {format(parseISO(date), "d 'de' MMMM", { locale: ptBR })} é
                  feriado nacional ({holiday}). Mantenha a data ou escolha
                  outra.
                </p>
              ) : null}
            </div>
          );
        })}

        <Hint.Root>
          A aula de reposição é adicionada depois, manualmente, na página da
          turma.
        </Hint.Root>
      </div>

      <SubmitButton />
    </form>
  );
}
