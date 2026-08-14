import { getSessionUser } from '@/lib/auth/session';
import { requireAdminOrLider } from '@/lib/access';

export default async function CelulasPage() {
  const currentUser = await getSessionUser();
  requireAdminOrLider(currentUser);

  return (
    <div className='p-8'>
      <h1 className='text-title-h5 text-text-strong-950'>Células</h1>
      <p className='mt-2 text-paragraph-sm text-text-sub-600'>
        Gestão de células em breve.
      </p>
    </div>
  );
}
