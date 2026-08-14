import { SeedForm } from '@/components/seeds/seed-form';
import { listUsers } from '@/lib/store/users';
import { getSessionUser } from '@/lib/auth/session';

export default async function NovaSementePage() {
  const [currentUser, users] = await Promise.all([
    getSessionUser(),
    listUsers(),
  ]);

  return (
    <div className='p-4 sm:p-8'>
      <SeedForm users={users} currentUser={currentUser} />
    </div>
  );
}
