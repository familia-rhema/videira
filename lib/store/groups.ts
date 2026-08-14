import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { GroupFilter, GroupStore, VisibilityGroup } from '@/lib/types/group';

const DATA_PATH = path.join(process.cwd(), 'data', 'groups.json');

async function readStore(): Promise<GroupStore> {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as GroupStore;
}

async function writeStore(store: GroupStore): Promise<void> {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf-8');
}

export async function listGroups(): Promise<VisibilityGroup[]> {
  const store = await readStore();
  return store.groups;
}

export async function getGroupById(id: string): Promise<VisibilityGroup | undefined> {
  const groups = await listGroups();
  return groups.find((group) => group.id === id);
}

export async function listGroupsForMember(userId: string): Promise<VisibilityGroup[]> {
  const groups = await listGroups();
  return groups.filter((group) => group.memberIds.includes(userId));
}

export type CreateGroupInput = {
  name: string;
  memberIds: string[];
  filter: GroupFilter;
  createdById: string;
};

export async function createGroup(input: CreateGroupInput): Promise<VisibilityGroup> {
  const store = await readStore();

  const group: VisibilityGroup = {
    id: randomUUID(),
    name: input.name.trim(),
    memberIds: input.memberIds,
    filter: input.filter,
    createdById: input.createdById,
  };

  store.groups.push(group);
  await writeStore(store);

  return group;
}

export type UpdateGroupInput = {
  id: string;
  name: string;
  memberIds: string[];
  filter: GroupFilter;
};

export async function updateGroup(input: UpdateGroupInput): Promise<VisibilityGroup> {
  const store = await readStore();
  const index = store.groups.findIndex((group) => group.id === input.id);

  if (index === -1) {
    throw new Error('Grupo não encontrado.');
  }

  store.groups[index] = {
    ...store.groups[index],
    name: input.name.trim(),
    memberIds: input.memberIds,
    filter: input.filter,
  };
  await writeStore(store);

  return store.groups[index];
}

export async function deleteGroup(id: string): Promise<void> {
  const store = await readStore();
  store.groups = store.groups.filter((group) => group.id !== id);
  await writeStore(store);
}
