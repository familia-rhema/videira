import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getTurmaById } from '@/lib/store/turmas';
import { getSeedById } from '@/lib/store/seeds';

type CertificadoPageProps = {
  params: Promise<{ turmaId: string; seedId: string }>;
};

// Certificado imprimível (Ctrl/Cmd+P). Arte customizável via URL na turma.
export default async function CertificadoPage({ params }: CertificadoPageProps) {
  const { turmaId, seedId } = await params;
  const turma = await getTurmaById(turmaId);
  const seed = await getSeedById(seedId);
  const student = turma?.students.find((item) => item.seedId === seedId);

  if (!turma || !seed || !student?.concludedAt) {
    notFound();
  }

  const concludedAt = format(
    parseISO(student.concludedAt),
    "d 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );

  return (
    <main className='flex min-h-dvh items-center justify-center bg-bg-weak-50 p-4 print:bg-bg-white-0 print:p-0'>
      <div
        className='relative flex aspect-[297/210] w-full max-w-[1000px] flex-col items-center justify-center overflow-hidden rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-12 text-center print:max-w-none print:rounded-none print:border-0'
        style={
          turma.certificateArtUrl
            ? {
                backgroundImage: `url(${turma.certificateArtUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <p className='text-subheading-sm uppercase tracking-widest text-text-soft-400'>
          Certificado de conclusão
        </p>
        <h1 className='mt-6 text-title-h3 text-text-strong-950'>Visão Rhema</h1>
        <p className='mt-8 text-paragraph-lg text-text-sub-600'>
          Certificamos que
        </p>
        <p className='mt-2 text-title-h4 text-text-strong-950'>{seed.name}</p>
        <p className='mt-2 text-paragraph-lg text-text-sub-600'>
          concluiu o curso Visão Rhema — {turma.name}
        </p>
        <p className='mt-8 text-paragraph-sm text-text-soft-400'>{concludedAt}</p>
      </div>
    </main>
  );
}
