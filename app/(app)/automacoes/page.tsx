import { listSeeds } from '@/lib/store/seeds';
import { listTasks, listWorkflows } from '@/lib/store/automations';
import { listUsers } from '@/lib/store/users';
import { getSessionUser } from '@/lib/auth/session';
import { requireAdminOrLider } from '@/lib/access';
import { AutomacoesView } from '@/components/automations/automacoes-view';

export default async function AutomacoesPage() {
  const currentUser = await getSessionUser();
  requireAdminOrLider(currentUser);

  // listTasks runs the lazy scheduler tick before reading.
  const [tasks, workflows, seeds, users] = await Promise.all([
    listTasks({ status: 'pending' }),
    listWorkflows(),
    listSeeds(),
    listUsers(),
  ]);

  const seedDirectory = seeds.map((seed) => ({
    id: seed.id,
    name: seed.name,
    phone: seed.phone,
  }));

  return (
    <div className='flex h-full flex-col p-4 sm:p-8'>
      <div className='mb-6 space-y-1'>
        <h1 className='text-title-h5 text-text-strong-950'>Automações</h1>
        <p className='text-paragraph-sm text-text-sub-600'>
          Gatilhos e sequências de mensagens para consolidar cada semente.
        </p>
      </div>

      <AutomacoesView
        tasks={tasks}
        workflows={workflows}
        seeds={seedDirectory}
        users={users}
      />
    </div>
  );
}
