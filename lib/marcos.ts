import type { Seed, SeedEventType } from '@/lib/types/seed';
import {
  RiBookOpenFill,
  RiCrossFill,
  RiDropFill,
  RiGroupFill,
} from '@remixicon/react';

export type MarcoType = 'confissao' | 'rhema' | 'batismo' | 'celula';

export type MarcoConfig = {
  type: MarcoType;
  label: string;
  field: keyof Pick<
    Seed,
    'confissaoFeEm' | 'rhemaConcluidoEm' | 'batizadoEm' | 'entrouCelulaEm'
  >;
  eventType: SeedEventType;
  eventDescription: string;
  icon: typeof RiBookOpenFill;
  badgeColor: 'yellow' | 'sky' | 'purple' | 'teal';
  chartColor: 'yellow' | 'orange' | 'blue' | 'sky';
};

export const MARCOS: MarcoConfig[] = [
  {
    type: 'confissao',
    label: 'Confissão',
    field: 'confissaoFeEm',
    eventType: 'marco_confissao',
    eventDescription: 'Marco Confissão de fé registrado',
    icon: RiCrossFill,
    badgeColor: 'yellow',
    chartColor: 'yellow',
  },
  {
    type: 'rhema',
    label: 'Visão Rhema',
    field: 'rhemaConcluidoEm',
    eventType: 'marco_rhema',
    eventDescription: 'Marco Visão Rhema registrado',
    icon: RiBookOpenFill,
    badgeColor: 'sky',
    chartColor: 'orange',
  },
  {
    type: 'batismo',
    label: 'Batismo',
    field: 'batizadoEm',
    eventType: 'marco_batismo',
    eventDescription: 'Marco Batismo registrado',
    icon: RiDropFill,
    badgeColor: 'purple',
    chartColor: 'blue',
  },
  {
    type: 'celula',
    label: 'Célula',
    field: 'entrouCelulaEm',
    eventType: 'marco_celula',
    eventDescription: 'Marco Célula registrado',
    icon: RiGroupFill,
    badgeColor: 'teal',
    chartColor: 'sky',
  },
];

export function getMarcoConfig(type: MarcoType) {
  return MARCOS.find((marco) => marco.type === type)!;
}

/** Tokens AlignUI para gráfico e legenda (Figma Visão Geral) */
export const MARCO_CHART_CLASS: Record<MarcoType, string> = {
  confissao: 'bg-away-base',
  rhema: 'bg-warning-base',
  batismo: 'bg-information-base',
  celula: 'bg-verified-base',
};

/** Ordem da legenda no header do widget */
export const MARCO_LEGEND_ORDER: MarcoType[] = [
  'batismo',
  'rhema',
  'confissao',
  'celula',
];

/** Ordem de empilhamento no gráfico (de baixo para cima) */
export const MARCO_STACK_ORDER: MarcoType[] = [
  'confissao',
  'rhema',
  'batismo',
  'celula',
];

/** Tokens CSS para Recharts / gráficos de área */
export const MARCO_CHART_COLOR: Record<MarcoType, string> = {
  confissao: 'var(--away-base)',
  rhema: 'var(--warning-base)',
  batismo: 'var(--information-base)',
  celula: 'var(--verified-base)',
};

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
