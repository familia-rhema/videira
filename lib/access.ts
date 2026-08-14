import { notFound } from 'next/navigation';
import { listGroupsForMember } from '@/lib/store/groups';
import { isAdmin, isAdminOrLider } from '@/lib/roles';
import type { GroupFilter, VisibilityGroup } from '@/lib/types/group';
import type { Seed, User } from '@/lib/types/seed';

export { isAdmin, isAdminOrLider };

/** Chama notFound() (404) quando o usuário não pode acessar áreas de gestão. */
export function requireAdminOrLider(user: User): void {
  if (!isAdminOrLider(user)) {
    notFound();
  }
}

export function requireAdmin(user: User): void {
  if (!isAdmin(user)) {
    notFound();
  }
}

function seedMatchesFilter(seed: Pick<Seed, 'id' | 'neighborhood' | 'gender'>, filter: GroupFilter): boolean {
  switch (filter.type) {
    case 'neighborhood':
      return seed.neighborhood != null && filter.neighborhoods.includes(seed.neighborhood);
    case 'gender':
      return seed.gender != null && filter.genders.includes(seed.gender);
    case 'manual':
      return filter.seedIds.includes(seed.id);
    default:
      return false;
  }
}

function seedMatchesAnyGroup(
  seed: Pick<Seed, 'id' | 'neighborhood' | 'gender'>,
  groups: VisibilityGroup[],
): boolean {
  return groups.some((group) => seedMatchesFilter(seed, group.filter));
}

/**
 * admin/lider: enxergam todas as sementes.
 * voluntario: enxergam a união das sementes que passam pelo filtro de qualquer
 * grupo em que estão como membro.
 */
export async function listVisibleSeeds<T extends Pick<Seed, 'id' | 'neighborhood' | 'gender'>>(
  user: User,
  seeds: T[],
): Promise<T[]> {
  if (isAdminOrLider(user)) {
    return seeds;
  }

  const groups = await listGroupsForMember(user.id);
  if (groups.length === 0) {
    return [];
  }

  return seeds.filter((seed) => seedMatchesAnyGroup(seed, groups));
}

export async function canAccessSeed(
  user: User,
  seed: Pick<Seed, 'id' | 'neighborhood' | 'gender'> | null,
): Promise<boolean> {
  if (!seed) {
    return false;
  }

  if (isAdminOrLider(user)) {
    return true;
  }

  const groups = await listGroupsForMember(user.id);
  return seedMatchesAnyGroup(seed, groups);
}

/** Chama notFound() (404) se o voluntário tentar acessar uma semente fora do escopo dele. */
export async function requireSeedAccess(
  user: User,
  seed: Pick<Seed, 'id' | 'neighborhood' | 'gender'> | null,
): Promise<void> {
  const allowed = await canAccessSeed(user, seed);
  if (!allowed) {
    notFound();
  }
}
