import {
  addDays,
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MARCOS, type MarcoType } from '@/lib/marcos';
import { withHealth } from '@/lib/health';
import { getRawStore } from '@/lib/store/seeds';
import type { HealthState, Seed, SeedEvent, SeedEventType } from '@/lib/types/seed';

export type DashboardPeriod = 'week' | 'month' | 'quarter' | 'year';

export type PeriodRange = {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
};

export type TrendMetric = {
  value: number;
  changePercent: number | null;
  sparkline: number[];
};

export type MarcoTotals = Record<MarcoType, TrendMetric>;

export type ChartBucket = {
  label: string;
  key: string;
  counts: Record<MarcoType, number>;
};

export type AdvancesChartPoint = {
  label: string;
  key: string;
} & Record<MarcoType, number>;

export type AdvancesChart = {
  data: AdvancesChartPoint[];
  totalChangePercent: number | null;
};

export type ConsolidationHealth = {
  score: number;
  label: string;
  description: string;
  filledSegments: number;
  totalSegments: number;
  distribution: Record<HealthState, number>;
};

export type DashboardMetrics = {
  period: DashboardPeriod;
  periodLabel: string;
  advances: TrendMetric;
  baptisms: TrendMetric;
  rhemaGraduates: TrendMetric;
  health: ConsolidationHealth;
  overview: {
    marcoTotals: MarcoTotals;
    chartBuckets: ChartBucket[];
    maxChartTotal: number;
    yAxisSteps: number[];
  };
  advancesChart: AdvancesChart;
};

const MARCO_EVENT_TYPES = new Set<SeedEventType>([
  'marco_confissao',
  'marco_rhema',
  'marco_batismo',
  'marco_celula',
]);

const HEALTH_SCORES: Record<HealthState, number> = {
  integrado: 100,
  saudavel: 100,
  atencao: 70,
  em_risco: 40,
  critico: 10,
};

const HEALTH_LABELS: { min: number; label: string; description: string }[] = [
  { min: 85, label: 'Excelente', description: 'A consolidação está muito saudável.' },
  { min: 70, label: 'Boa', description: 'A maioria das sementes está avançando bem.' },
  { min: 50, label: 'Atenção', description: 'Parte da base precisa de acompanhamento.' },
  { min: 0, label: 'Crítica', description: 'Muitas sementes estão paradas há tempo.' },
];

const MONTH_DAYS = 30;

export function getPeriodRange(
  period: DashboardPeriod,
  now = new Date(),
): PeriodRange {
  const end = endOfDay(now);

  if (period === 'week') {
    const start = startOfDay(subDays(end, 6));
    const previousEnd = endOfDay(subDays(start, 1));
    const previousStart = startOfDay(subDays(previousEnd, 6));
    return { start, end, previousStart, previousEnd };
  }

  if (period === 'month') {
    const start = startOfDay(subDays(end, MONTH_DAYS - 1));
    const previousEnd = endOfDay(subDays(start, 1));
    const previousStart = startOfDay(subDays(previousEnd, MONTH_DAYS - 1));
    return { start, end, previousStart, previousEnd };
  }

  if (period === 'quarter') {
    const start = startOfDay(subMonths(end, 2));
    start.setDate(1);
    const previousEnd = endOfDay(subDays(start, 1));
    const previousStart = startOfDay(subMonths(start, 3));
    return { start, end, previousStart, previousEnd };
  }

  const start = startOfDay(subYears(end, 1));
  const previousEnd = endOfDay(subDays(start, 1));
  const previousStart = startOfDay(subYears(start, 1));
  return { start, end, previousStart, previousEnd };
}

export function getPeriodLabel(period: DashboardPeriod): string {
  const labels: Record<DashboardPeriod, string> = {
    week: 'Esta semana',
    month: 'Últimos 30 dias',
    quarter: 'Este trimestre',
    year: 'Último ano',
  };
  return labels[period];
}

function isDateInRange(date: Date, range: Pick<PeriodRange, 'start' | 'end'>) {
  return isWithinInterval(date, { start: range.start, end: range.end });
}

function countChangePercent(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? null : 100;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function countMarcoEventsInRange(
  events: SeedEvent[],
  eventType: SeedEventType,
  range: Pick<PeriodRange, 'start' | 'end'>,
) {
  return events.filter(
    (event) =>
      event.type === eventType &&
      isDateInRange(new Date(event.occurredAt), range),
  ).length;
}

function countAdvancesInRange(
  events: SeedEvent[],
  range: Pick<PeriodRange, 'start' | 'end'>,
) {
  const seedIds = new Set<string>();

  for (const event of events) {
    if (!MARCO_EVENT_TYPES.has(event.type)) {
      continue;
    }

    if (isDateInRange(new Date(event.occurredAt), range)) {
      seedIds.add(event.seedId);
    }
  }

  return seedIds.size;
}

function buildSparkline(
  events: SeedEvent[],
  range: PeriodRange,
  filter?: (event: SeedEvent) => boolean,
  buckets = 7,
) {
  const values = Array.from({ length: buckets }, () => 0);
  const totalMs = range.end.getTime() - range.start.getTime();
  const step = totalMs / buckets;

  for (const event of events) {
    if (filter && !filter(event)) {
      continue;
    }

    const occurredAt = new Date(event.occurredAt);
    if (!isDateInRange(occurredAt, range)) {
      continue;
    }

    const index = Math.min(
      buckets - 1,
      Math.max(0, Math.floor((occurredAt.getTime() - range.start.getTime()) / step)),
    );
    values[index] += 1;
  }

  return values;
}

function buildTrendMetric(
  current: number,
  previous: number,
  sparkline: number[],
): TrendMetric {
  return {
    value: current,
    changePercent: countChangePercent(current, previous),
    sparkline,
  };
}

function getHealthDescription(score: number) {
  return (
    HEALTH_LABELS.find((item) => score >= item.min) ??
    HEALTH_LABELS[HEALTH_LABELS.length - 1]
  );
}

export function computeHealth(seeds: Seed[]): ConsolidationHealth {
  const active = seeds.map((seed) => withHealth(seed)).filter((seed) => !seed.isIntegrated);
  const distribution: Record<HealthState, number> = {
    integrado: 0,
    saudavel: 0,
    atencao: 0,
    em_risco: 0,
    critico: 0,
  };

  for (const seed of seeds.map((item) => withHealth(item))) {
    distribution[seed.health] += 1;
  }

  if (active.length === 0) {
    const { label, description } = getHealthDescription(100);
    return {
      score: 100,
      label,
      description,
      filledSegments: 36,
      totalSegments: 36,
      distribution,
    };
  }

  const weighted = active.reduce(
    (sum, seed) => sum + HEALTH_SCORES[seed.health],
    0,
  );
  const score = Math.round(weighted / active.length);
  const totalSegments = 36;
  const filledSegments = Math.round((score / 100) * totalSegments);
  const { label, description } = getHealthDescription(score);

  return {
    score,
    label,
    description,
    filledSegments,
    totalSegments,
    distribution,
  };
}

function countBucketMarcos(
  events: SeedEvent[],
  range: Pick<PeriodRange, 'start' | 'end'>,
) {
  return Object.fromEntries(
    MARCOS.map((marco) => [
      marco.type,
      countMarcoEventsInRange(events, marco.eventType, range),
    ]),
  ) as Record<MarcoType, number>;
}

function buildChartBuckets(
  period: DashboardPeriod,
  range: PeriodRange,
  events: SeedEvent[],
): ChartBucket[] {
  if (period === 'week') {
    return Array.from({ length: 7 }, (_, index) => {
      const day = startOfDay(addDays(range.start, index));
      const bucketRange = { start: day, end: endOfDay(day) };

      return {
        key: day.toISOString(),
        label: format(day, 'EEEEE', { locale: ptBR }).toUpperCase(),
        counts: countBucketMarcos(events, bucketRange),
      };
    });
  }

  if (period === 'month') {
    const days =
      differenceInCalendarDays(range.end, range.start) + 1;

    return Array.from({ length: days }, (_, index) => {
      const day = startOfDay(addDays(range.start, index));
      const bucketRange = { start: day, end: endOfDay(day) };

      return {
        key: day.toISOString(),
        label: format(day, 'd/M', { locale: ptBR }),
        counts: countBucketMarcos(events, bucketRange),
      };
    });
  }

  const months = eachMonthOfInterval({ start: range.start, end: range.end });

  return months.map((monthStart) => {
    const bucketRange = {
      start: startOfMonth(monthStart),
      end: endOfMonth(monthStart),
    };

    return {
      key: monthStart.toISOString(),
      label: format(monthStart, 'LLL', { locale: ptBR }).charAt(0).toUpperCase(),
      counts: countBucketMarcos(events, bucketRange),
    };
  });
}

function buildYAxisSteps(maxValue: number) {
  if (maxValue <= 0) {
    return [4, 3, 2, 0];
  }

  const step = Math.max(1, Math.ceil(maxValue / 3));
  const top = step * 3;

  return [top, step * 2, step, 0];
}

export async function getDashboardMetrics(
  period: DashboardPeriod = 'month',
): Promise<DashboardMetrics> {
  const store = await getRawStore();
  const range = getPeriodRange(period);
  const previousRange: Pick<PeriodRange, 'start' | 'end'> = {
    start: range.previousStart,
    end: range.previousEnd,
  };

  const advancesCurrent = countAdvancesInRange(store.events, range);
  const advancesPrevious = countAdvancesInRange(store.events, previousRange);

  const baptismsCurrent = countMarcoEventsInRange(
    store.events,
    'marco_batismo',
    range,
  );
  const baptismsPrevious = countMarcoEventsInRange(
    store.events,
    'marco_batismo',
    previousRange,
  );

  const rhemaCurrent = countMarcoEventsInRange(
    store.events,
    'marco_rhema',
    range,
  );
  const rhemaPrevious = countMarcoEventsInRange(
    store.events,
    'marco_rhema',
    previousRange,
  );

  const marcoTotals = Object.fromEntries(
    MARCOS.map((marco) => {
      const current = countMarcoEventsInRange(
        store.events,
        marco.eventType,
        range,
      );
      const previous = countMarcoEventsInRange(
        store.events,
        marco.eventType,
        previousRange,
      );
      const sparkline = buildSparkline(
        store.events,
        range,
        (event) => event.type === marco.eventType,
      );

      return [marco.type, buildTrendMetric(current, previous, sparkline)];
    }),
  ) as MarcoTotals;

  const chartBuckets = buildChartBuckets(period, range, store.events);
  const maxChartTotal = Math.max(
    1,
    ...chartBuckets.map((bucket) =>
      Object.values(bucket.counts).reduce((sum, count) => sum + count, 0),
    ),
  );

  const totalMarcosCurrent = MARCOS.reduce(
    (sum, marco) =>
      sum + countMarcoEventsInRange(store.events, marco.eventType, range),
    0,
  );
  const totalMarcosPrevious = MARCOS.reduce(
    (sum, marco) =>
      sum +
      countMarcoEventsInRange(store.events, marco.eventType, previousRange),
    0,
  );

  return {
    period,
    periodLabel: getPeriodLabel(period),
    advances: buildTrendMetric(
      advancesCurrent,
      advancesPrevious,
      buildSparkline(store.events, range, (event) =>
        MARCO_EVENT_TYPES.has(event.type),
      ),
    ),
    baptisms: buildTrendMetric(
      baptismsCurrent,
      baptismsPrevious,
      buildSparkline(
        store.events,
        range,
        (event) => event.type === 'marco_batismo',
      ),
    ),
    rhemaGraduates: buildTrendMetric(
      rhemaCurrent,
      rhemaPrevious,
      buildSparkline(
        store.events,
        range,
        (event) => event.type === 'marco_rhema',
      ),
    ),
    health: computeHealth(store.seeds),
    overview: {
      marcoTotals,
      chartBuckets,
      maxChartTotal,
      yAxisSteps: buildYAxisSteps(maxChartTotal),
    },
    advancesChart: {
      data: chartBuckets.map((bucket) => ({
        label: bucket.label,
        key: bucket.key,
        ...bucket.counts,
      })),
      totalChangePercent: countChangePercent(
        totalMarcosCurrent,
        totalMarcosPrevious,
      ),
    },
  };
}
