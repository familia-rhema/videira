import type { SeedGender } from '@/lib/types/seed';

export type GroupFilter =
  | { type: 'neighborhood'; neighborhoods: string[] }
  | { type: 'gender'; genders: SeedGender[] }
  | { type: 'manual'; seedIds: string[] };

export type GroupFilterType = GroupFilter['type'];

export const GROUP_FILTER_LABELS: Record<GroupFilterType, string> = {
  neighborhood: 'Bairro',
  gender: 'Sexo',
  manual: 'Seleção manual',
};

/** "Equipe" / grupo de visibilidade: voluntários enxergam a união das sementes de todos os grupos em que estão. */
export type VisibilityGroup = {
  id: string;
  name: string;
  memberIds: string[];
  filter: GroupFilter;
  createdById: string;
};

export type GroupStore = {
  groups: VisibilityGroup[];
};
