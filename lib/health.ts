import { differenceInCalendarDays } from 'date-fns';
import type {
  HealthSettings,
  HealthState,
  Seed,
  SeedWithHealth,
} from '@/lib/types/seed';

// Limiares da reunião: atenção 30d, em risco 45d, crítico 90d sem contato.
export const DEFAULT_HEALTH_SETTINGS: HealthSettings = {
  carenciaDias: 30,
  limiarAmareloDias: 45,
  limiarVermelhoDias: 90,
};

/** Integrado = engajado no voluntariado (marcação manual), não os 3 marcos. */
export function isSeedIntegrated(seed: Seed): boolean {
  return Boolean(seed.integradoEm);
}

export function getDaysSinceLastAdvance(seed: Seed, now = new Date()): number {
  return Math.max(
    0,
    differenceInCalendarDays(now, new Date(seed.lastAdvanceAt)),
  );
}

export function getHealthState(
  seed: Seed,
  settings: HealthSettings = DEFAULT_HEALTH_SETTINGS,
  now = new Date(),
): { health: HealthState; diasParada: number; isIntegrated: boolean } {
  const integrated = isSeedIntegrated(seed);

  if (integrated) {
    return { health: 'integrado', diasParada: 0, isIntegrated: true };
  }

  const diasParada = getDaysSinceLastAdvance(seed, now);

  if (diasParada <= settings.carenciaDias) {
    return { health: 'saudavel', diasParada, isIntegrated: false };
  }

  if (diasParada <= settings.limiarAmareloDias) {
    return { health: 'atencao', diasParada, isIntegrated: false };
  }

  if (diasParada <= settings.limiarVermelhoDias) {
    return { health: 'em_risco', diasParada, isIntegrated: false };
  }

  return { health: 'critico', diasParada, isIntegrated: false };
}

export function withHealth(
  seed: Seed,
  settings: HealthSettings = DEFAULT_HEALTH_SETTINGS,
): SeedWithHealth {
  const { health, diasParada, isIntegrated } = getHealthState(seed, settings);

  return {
    ...seed,
    health,
    diasParada,
    isIntegrated,
  };
}

export function compareSeedsByHealth(a: SeedWithHealth, b: SeedWithHealth) {
  if (a.isIntegrated !== b.isIntegrated) {
    return a.isIntegrated ? 1 : -1;
  }

  return (
    new Date(a.lastAdvanceAt).getTime() - new Date(b.lastAdvanceAt).getTime()
  );
}

export const HEALTH_LABELS: Record<HealthState, string> = {
  integrado: 'Integrado',
  saudavel: 'Saudável',
  atencao: 'Atenção',
  em_risco: 'Em risco',
  critico: 'Crítico',
};
