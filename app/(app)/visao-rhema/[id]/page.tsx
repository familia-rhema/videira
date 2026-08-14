import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RiArrowLeftLine, RiLinkM } from '@remixicon/react';
import * as Button from '@/components/ui/button';
import { TurmaChamada } from '@/components/turmas/turma-chamada';
import { daysUntilFirstLesson, getTurmaById } from '@/lib/store/turmas';
import { getRawStore } from '@/lib/store/seeds';
import { getSessionUser } from '@/lib/auth/session';
import { requireAdminOrLider } from '@/lib/access';

type TurmaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TurmaPage({ params }: TurmaPageProps) {
  const currentUser = await getSessionUser();
  requireAdminOrLider(currentUser);

  const { id } = await params;
  const turma = await getTurmaById(id);

  if (!turma) {
    notFound();
  }

  const { seeds } = await getRawStore();
  const countdown = daysUntilFirstLesson(turma);
  const holidayLessons = turma.lessons.filter((lesson) => lesson.holidayName);

  return (
    <div className='p-4 sm:p-8'>
      <div className='mb-6'>
        <Button.Root variant='neutral' mode='ghost' asChild>
          <Link href='/visao-rhema'>
            <Button.Icon as={RiArrowLeftLine} />
            Voltar para turmas
          </Link>
        </Button.Root>
      </div>

      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-title-h5 text-text-strong-950'>{turma.name}</h1>
          <p className='mt-1 text-paragraph-sm text-text-sub-600'>
            {turma.lessons.filter((lesson) => !lesson.isReposicao).length} aulas
            {countdown > 0
              ? ` — faltam ${countdown} ${countdown === 1 ? 'dia' : 'dias'} para a 1ª aula`
              : ''}
          </p>
        </div>

        <Button.Root variant='neutral' mode='stroke' asChild>
          <Link href={`/inscricao/${turma.id}`} target='_blank'>
            <Button.Icon as={RiLinkM} />
            Link de inscrição
          </Link>
        </Button.Root>
      </div>

      {holidayLessons.length > 0 ? (
        <div className='mb-6 rounded-10 border border-warning-light bg-warning-lighter px-4 py-3'>
          <p className='text-label-sm text-warning-dark'>
            Atenção: aula em feriado nacional —{' '}
            {holidayLessons
              .map(
                (lesson) =>
                  `${format(parseISO(lesson.date), 'dd/MM', { locale: ptBR })} (${lesson.holidayName})`,
              )
              .join(', ')}
            .
          </p>
        </div>
      ) : null}

      <TurmaChamada turma={turma} seeds={seeds} />
    </div>
  );
}
