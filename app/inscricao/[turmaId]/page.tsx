import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SporosLogo } from '@/components/sporos-logo';
import { PublicEnrollForm } from '@/components/turmas/public-enroll-form';
import { getTurmaById } from '@/lib/store/turmas';

type InscricaoPageProps = {
  params: Promise<{ turmaId: string }>;
};

// Página pública — substitui o Google Forms de inscrição do Visão Rhema.
export default async function InscricaoPage({ params }: InscricaoPageProps) {
  const { turmaId } = await params;
  const turma = await getTurmaById(turmaId);

  if (!turma) {
    notFound();
  }

  const firstLesson = turma.lessons.find((lesson) => !lesson.isReposicao);

  return (
    <main className='flex min-h-dvh items-center justify-center bg-bg-weak-50 p-4'>
      <div className='w-full max-w-md rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-6 sm:p-8'>
        <div className='mb-6 flex flex-col items-center gap-4 text-center'>
          <SporosLogo />
          <div>
            <h1 className='text-title-h6 text-text-strong-950'>
              Inscrição — Visão Rhema
            </h1>
            <p className='mt-1 text-paragraph-sm text-text-sub-600'>
              {turma.name}
              {firstLesson
                ? ` · 1ª aula em ${format(parseISO(firstLesson.date), "d 'de' MMMM", { locale: ptBR })}`
                : ''}
            </p>
          </div>
        </div>

        <PublicEnrollForm turmaId={turma.id} />
      </div>
    </main>
  );
}
