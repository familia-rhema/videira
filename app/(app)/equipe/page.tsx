import * as Divider from '@/components/ui/divider';
import { UsersSection } from '@/components/equipe/users-section';
import { GroupsSection } from '@/components/equipe/groups-section';
import { getSessionUser } from '@/lib/auth/session';
import { isAdmin, requireAdminOrLider } from '@/lib/access';
import { listUsers } from '@/lib/store/users';
import { listGroups } from '@/lib/store/groups';
import { listSeeds } from '@/lib/store/seeds';

export default async function EquipePage() {
  const currentUser = await getSessionUser();
  requireAdminOrLider(currentUser);

  const [users, groups, seeds] = await Promise.all([
    listUsers(),
    listGroups(),
    listSeeds({ situacao: 'todas' }),
  ]);

  const volunteers = users.filter((user) => user.role === 'voluntario');
  const usersById = new Map(users.map((user) => [user.id, user]));
  const seedOptions = seeds.map((seed) => ({
    id: seed.id,
    name: seed.name,
    neighborhood: seed.neighborhood,
  }));

  return (
    <div className='space-y-8 p-4 sm:p-8'>
      <div className='space-y-1'>
        <h1 className='text-title-h5 text-text-strong-950'>Equipe</h1>
        <p className='text-paragraph-sm text-text-sub-600'>
          Papéis de acesso e grupos de visibilidade dos voluntários.
        </p>
      </div>

      <UsersSection users={users} canEditRoles={isAdmin(currentUser)} />

      <Divider.Root variant='line-spacing' />

      <GroupsSection
        groups={groups}
        volunteers={volunteers}
        seeds={seedOptions}
        usersById={usersById}
      />
    </div>
  );
}
