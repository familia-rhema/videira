'use client';

import { Fragment, useActionState, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RiAwardLine } from '@remixicon/react';
import * as Badge from '@/components/ui/badge';
import * as Button from '@/components/ui/button';
import * as Checkbox from '@/components/ui/checkbox';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Table from '@/components/ui/table';
import {
  addReposicaoAction,
  concludeTurmaAction,
  enrollStudentAction,
  setAttendanceAction,
  setCertificateArtAction,
  type TurmaActionState,
} from '@/lib/actions/turmas';
import { todayIsoDate } from '@/lib/marcos';
import {
  countAbsences,
  getStudentStatus,
  STUDENT_STATUS_LABELS,
  type StudentStatus,
  type Turma,
} from '@/lib/types/turma';
import type { Seed } from '@/lib/types/seed';
import { cn } from '@/utils/cn';

const initialState: TurmaActionState = {};

const STATUS_COLORS: Record<StudentStatus, 'blue' | 'green' | 'red' | 'purple'> = {
  cursando: 'blue',
  aprovado: 'green',
  reprovado: 'red',
  concluido: 'purple',
};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button.Root
      type='submit'
      variant='primary'
      mode='stroke'
      size='small'
      disabled={pending}
    >
      {pending ? pendingLabel : label}
    </Button.Root>
  );
}

function StateBanner({ state }: { state: TurmaActionState }) {
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

export function TurmaChamada({
  turma,
  seeds,
}: {
  turma: Turma;
  seeds: Seed[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enrollState, enrollFormAction] = useActionState(
    enrollStudentAction,
    initialState,
  );
  const [reposicaoState, reposicaoFormAction] = useActionState(
    addReposicaoAction,
    initialState,
  );
  const [artState, artFormAction] = useActionState(
    setCertificateArtAction,
    initialState,
  );
  const [concludeState, concludeFormAction] = useActionState(
    concludeTurmaAction,
    initialState,
  );
  const [selectedSeedId, setSelectedSeedId] = useState('');

  useEffect(() => {
    if (
      enrollState.success ||
      reposicaoState.success ||
      artState.success ||
      concludeState.success
    ) {
      router.refresh();
    }
  }, [
    enrollState.success,
    reposicaoState.success,
    artState.success,
    concludeState.success,
    router,
  ]);

  const today = todayIsoDate();
  const seedById = new Map(seeds.map((seed) => [seed.id, seed]));
  const enrolledIds = new Set(turma.students.map((student) => student.seedId));
  const availableSeeds = seeds.filter((seed) => !enrolledIds.has(seed.id));
  const hasReposicao = turma.lessons.some((lesson) => lesson.isReposicao);

  function toggleAttendance(seedId: string, lessonIndex: number, present: boolean) {
    startTransition(() => {
      void setAttendanceAction(turma.id, seedId, lessonIndex, present);
    });
  }

  return (
    <div className='space-y-6'>
      <StateBanner state={enrollState} />
      <StateBanner state={reposicaoState} />
      <StateBanner state={artState} />
      <StateBanner state={concludeState} />

      {/* Inscrição manual */}
      <div className='rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5'>
        <h2 className='text-label-md text-text-strong-950'>Inscrever aluno</h2>
        <form action={enrollFormAction} className='mt-3 flex flex-col gap-2 sm:flex-row'>
          <input type='hidden' name='turmaId' value={turma.id} />
          <input type='hidden' name='seedId' value={selectedSeedId} />
          <Select.Root value={selectedSeedId} onValueChange={setSelectedSeedId}>
            <Select.Trigger className='w-full sm:w-[280px]'>
              <Select.Value placeholder='Selecione a semente' />
            </Select.Trigger>
            <Select.Content>
              {availableSeeds.map((seed) => (
                <Select.Item key={seed.id} value={seed.id}>
                  {seed.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <SubmitButton label='Inscrever' pendingLabel='Inscrevendo...' />
        </form>
        <p className='mt-2 text-paragraph-xs text-text-soft-400'>
          A inscrição já move a semente no Kanban.
        </p>
      </div>

      {/* Chamada */}
      <div className='rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-label-md text-text-strong-950'>Lista de chamada</h2>
            <p className='mt-1 text-paragraph-xs text-text-sub-600'>
              Mais de 2 faltas reprova. Alunos ausentes ficam destacados.
            </p>
          </div>

          <form action={concludeFormAction}>
            <input type='hidden' name='turmaId' value={turma.id} />
            <SubmitButton
              label='Concluir turma (registrar marcos)'
              pendingLabel='Concluindo...'
            />
          </form>
        </div>

        {turma.students.length === 0 ? (
          <p className='mt-4 text-paragraph-sm text-text-sub-600'>
            Nenhum aluno inscrito ainda.
          </p>
        ) : (
          <div className='mt-4 overflow-x-auto'>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Aluno</Table.Head>
                  {turma.lessons.map((lesson, index) => (
                    <Table.Head key={index} className='text-center'>
                      <span className='block'>
                        {lesson.isReposicao ? 'Reposição' : `Aula ${index + 1}`}
                      </span>
                      <span className='block text-paragraph-xs text-text-soft-400'>
                        {format(parseISO(lesson.date), 'dd/MM', { locale: ptBR })}
                      </span>
                    </Table.Head>
                  ))}
                  <Table.Head>Faltas</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {turma.students.map((student, rowIndex) => {
                  const seed = seedById.get(student.seedId);
                  const status = getStudentStatus(turma, student, today);
                  const absences = countAbsences(turma, student, today);

                  return (
                    <Fragment key={student.seedId}>
                      {rowIndex > 0 ? <Table.RowDivider /> : null}
                      <Table.Row
                        className={cn(absences > 0 && status === 'cursando' && 'bg-warning-lighter/40')}
                      >
                        <Table.Cell>
                          <Link
                            href={`/sementes/${student.seedId}`}
                            className='text-label-sm text-text-strong-950 hover:underline'
                          >
                            {seed?.name ?? '—'}
                          </Link>
                        </Table.Cell>
                        {turma.lessons.map((lesson, lessonIndex) => (
                          <Table.Cell key={lessonIndex} className='text-center'>
                            <Checkbox.Root
                              checked={Boolean(student.attendance[lessonIndex])}
                              disabled={isPending}
                              onCheckedChange={(checked) =>
                                toggleAttendance(
                                  student.seedId,
                                  lessonIndex,
                                  checked === true,
                                )
                              }
                              aria-label={`Presença de ${seed?.name ?? 'aluno'} na aula ${lessonIndex + 1}`}
                            />
                          </Table.Cell>
                        ))}
                        <Table.Cell>
                          <span
                            className={cn(
                              'text-paragraph-sm',
                              absences > 2
                                ? 'text-error-base'
                                : absences > 0
                                  ? 'text-warning-dark'
                                  : 'text-text-sub-600',
                            )}
                          >
                            {absences}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge.Root
                            size='small'
                            variant='light'
                            color={STATUS_COLORS[status]}
                          >
                            {STUDENT_STATUS_LABELS[status]}
                          </Badge.Root>
                        </Table.Cell>
                        <Table.Cell>
                          {status === 'concluido' ? (
                            <Button.Root
                              variant='neutral'
                              mode='stroke'
                              size='xsmall'
                              asChild
                            >
                              <Link
                                href={`/certificado/${turma.id}/${student.seedId}`}
                                target='_blank'
                              >
                                <Button.Icon as={RiAwardLine} />
                                Certificado
                              </Link>
                            </Button.Root>
                          ) : null}
                        </Table.Cell>
                      </Table.Row>
                    </Fragment>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </div>
        )}
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Reposição */}
        <div className='rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5'>
          <h2 className='text-label-md text-text-strong-950'>Aula de reposição</h2>
          <p className='mt-1 text-paragraph-xs text-text-sub-600'>
            Inserida manualmente — a data e o horário são decisão do líder.
          </p>
          {hasReposicao ? (
            <p className='mt-3 text-paragraph-sm text-text-sub-600'>
              Reposição já agendada.
            </p>
          ) : (
            <form action={reposicaoFormAction} className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-end'>
              <input type='hidden' name='turmaId' value={turma.id} />
              <div className='flex-1 space-y-1'>
                <Label.Root htmlFor='reposicao-date'>Data</Label.Root>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Input id='reposicao-date' name='date' type='date' required />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <SubmitButton label='Adicionar' pendingLabel='Adicionando...' />
            </form>
          )}
        </div>

        {/* Arte do certificado */}
        <div className='rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5'>
          <h2 className='text-label-md text-text-strong-950'>Arte do certificado</h2>
          <p className='mt-1 text-paragraph-xs text-text-sub-600'>
            URL de uma imagem de fundo (opcional). Sem arte, o certificado usa o
            padrão da plataforma.
          </p>
          <form action={artFormAction} className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-end'>
            <input type='hidden' name='turmaId' value={turma.id} />
            <div className='flex-1 space-y-1'>
              <Label.Root htmlFor='cert-art'>URL da arte</Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id='cert-art'
                    name='url'
                    type='url'
                    placeholder='https://...'
                    defaultValue={turma.certificateArtUrl ?? ''}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <SubmitButton label='Salvar' pendingLabel='Salvando...' />
          </form>
        </div>
      </div>
    </div>
  );
}
