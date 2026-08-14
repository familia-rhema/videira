import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RiAddLine } from '@remixicon/react';
import * as Button from '@/components/ui/button';
import { daysUntilFirstLesson, listTurmas } from '@/lib/store/turmas';
import { getSessionUser } from '@/lib/auth/session';
import { requireAdminOrLider } from '@/lib/access';

export default async function VisaoRhemaPage() {
  const currentUser = await getSessionUser();
  requireAdminOrLider(currentUser);

  const turmas = await listTurmas();

  return (
    <div className='p-4 sm:p-8'>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-title-h5 text-text-strong-950'>Visão Rhema</h1>
          <p className='mt-1 text-paragraph-sm text-text-sub-600'>
            Turmas, chamada e certificados do curso.
          </p>
        </div>

        <Button.Root variant='primary' mode='filled' asChild>
          <Link href='/visao-rhema/nova'>
            <Button.Icon as={RiAddLine} />
            Nova turma
          </Link>
        </Button.Root>
      </div>

      {turmas.length === 0 ? (
        <div className='rounded-20 border border-dashed border-stroke-soft-200 px-6 py-12 text-center'>
          <p className='text-paragraph-sm text-text-sub-600'>
            Nenhuma turma criada ainda.
          </p>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {turmas.map((turma) => {
            const firstLesson = turma.lessons.find((lesson) => !lesson.isReposicao);
            const countdown = daysUntilFirstLesson(turma);

            return (
              <Link
                key={turma.id}
                href={`/visao-rhema/${turma.id}`}
                className='rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5 transition duration-200 ease-out hover:border-stroke-sub-300 hover:shadow-regular-sm'
              >
                <h2 className='text-label-md text-text-strong-950'>{turma.name}</h2>
                <p className='mt-1 text-paragraph-sm text-text-sub-600'>
                  {turma.students.length}{' '}
                  {turma.students.length === 1 ? 'aluno' : 'alunos'}
                </p>
                {firstLesson ? (
                  <p className='mt-3 text-paragraph-xs text-text-soft-400'>
                    1ª aula:{' '}
                    {format(parseISO(firstLesson.date), "d 'de' MMMM", {
                      locale: ptBR,
                    })}
                    {countdown > 0
                      ? ` — faltam ${countdown} ${countdown === 1 ? 'dia' : 'dias'}`
                      : ''}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
