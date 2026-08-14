import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { User, UserRole } from '@/lib/types/seed';

const DATA_PATH = path.join(process.cwd(), 'data', 'users.json');

type UserStore = {
  users: User[];
};

async function readStore(): Promise<UserStore> {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as UserStore;
}

async function writeStore(store: UserStore): Promise<void> {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf-8');
}

export async function listUsers(): Promise<User[]> {
  const store = await readStore();
  return store.users;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await listUsers();
  return users.find((user) => user.id === id);
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await listUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export async function findUserByCpf(cpf: string): Promise<User | undefined> {
  const users = await listUsers();
  return users.find((user) => user.cpf === cpf);
}

export async function createUser(input: Omit<User, 'id'>): Promise<User> {
  const store = await readStore();
  const user: User = { ...input, id: randomUUID() };
  store.users.push(user);
  await writeStore(store);
  return user;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  const store = await readStore();
  const index = store.users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error('Usuário não encontrado.');
  }

  store.users[index] = { ...store.users[index], role };
  await writeStore(store);

  return store.users[index];
}
