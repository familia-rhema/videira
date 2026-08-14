import Link from 'next/link';
import { RiArrowLeftLine } from '@remixicon/react';
import * as Button from '@/components/ui/button';
import { TurmaForm } from '@/components/turmas/turma-form';
import { getSessionUser } from '@/lib/auth/session';
import { requireAdminOrLider } from '@/lib/access';

export default async function NovaTurmaPage() {
  const currentUser = await getSessionUser();
  requireAdminOrLider(currentUser);

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

      <h1 className='text-title-h5 text-text-strong-950'>Nova turma</h1>
      <p className='mb-6 mt-1 text-paragraph-sm text-text-sub-600'>
        Ao criar a turma, os lembretes com contagem regressiva até a 1ª aula
        entram no quadro de tarefas.
      </p>

      <TurmaForm />
    </div>
  );
}
