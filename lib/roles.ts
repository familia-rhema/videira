import type { User, UserRole } from '@/lib/types/seed';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  lider: 'Líder',
  voluntario: 'Voluntário',
};

export const ROLE_BADGE_COLORS: Record<UserRole, 'green' | 'blue' | 'gray'> = {
  admin: 'green',
  lider: 'blue',
  voluntario: 'gray',
};

export const ROLE_OPTIONS: UserRole[] = ['admin', 'lider', 'voluntario'];

/**
 * Checagens de papel puras (sem I/O) — seguras para uso em componentes
 * cliente. Ficam separadas de `lib/access.ts`, que depende de `lib/store`
 * (Node `fs`) e não pode ser importado no bundle do cliente.
 */
export function isAdminOrLider(user: Pick<User, 'role'>): boolean {
  return user.role === 'admin' || user.role === 'lider';
}

export function isAdmin(user: Pick<User, 'role'>): boolean {
  return user.role === 'admin';
}
