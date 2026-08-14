import Link from 'next/link';
import { RiAddLine, RiWhatsappLine } from '@remixicon/react';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import { ConsolidationHealthWidget } from '@/components/dashboard/consolidation-health-widget';
import { SeedHealthBadge } from '@/components/seeds/seed-health-badge';
import { SeedMarcoBadges } from '@/components/seeds/seed-marco-badges';
import { computeHealth } from '@/lib/dashboard';
import { formatPhoneDisplay, toWhatsAppUrl } from '@/lib/phone';
import type { SeedWithHealth, User } from '@/lib/types/seed';

type VolunteerHomeProps = {
  currentUser: User;
  seeds: SeedWithHealth[];
  hasGroups: boolean;
};

const ATTENTION_HEALTH = new Set(['atencao', 'em_risco', 'critico']);

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function VolunteerHome({ currentUser, seeds, hasGroups }: VolunteerHomeProps) {
  const health = computeHealth(seeds);
  const proximosPassos = seeds
    .filter((seed) => ATTENTION_HEALTH.has(seed.health))
    .slice(0, 5);

  return (
    <div className='flex h-full flex-col gap-6 p-4 sm:p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-paragraph-sm text-text-sub-600'>
            Olá, {firstName(currentUser.name)}
          </p>
          <h1 className='text-title-h5 text-text-strong-950'>
            Minhas sementes
          </h1>
          <p className='mt-1 text-paragraph-sm text-text-sub-600'>
            Acompanhamento das sementes dos seus grupos.
          </p>
        </div>

        <Button.Root variant='primary' mode='filled' asChild>
          <Link href='/sementes/nova'>
            <Button.Icon as={RiAddLine} />
            Nova semente
          </Link>
        </Button.Root>
      </div>

      {!hasGroups ? (
        <div className='rounded-20 border border-dashed border-stroke-soft-200 px-6 py-12 text-center'>
          <p className='text-paragraph-sm text-text-sub-600'>
            Você ainda não está em nenhuma equipe. Peça a um líder para te
            adicionar em um grupo na página Equipe.
          </p>
        </div>
      ) : (
        <>
          <ConsolidationHealthWidget health={health} />

          {proximosPassos.length > 0 ? (
            <div className='space-y-3'>
              <h2 className='text-label-sm text-text-strong-950'>
                Próximos passos
              </h2>
              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                {proximosPassos.map((seed) => (
                  <Link
                    key={seed.id}
                    href={`/sementes/${seed.id}`}
                    className='rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-4 transition duration-200 ease-out hover:border-stroke-sub-300 hover:shadow-regular-sm'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <p className='text-label-sm text-text-strong-950'>
                        {seed.name}
                      </p>
                      <SeedHealthBadge
                        health={seed.health}
                        diasParada={seed.diasParada}
                      />
                    </div>
                    {seed.neighborhood ? (
                      <p className='mt-1 text-paragraph-xs text-text-soft-400'>
                        {seed.neighborhood}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className='space-y-3'>
            <h2 className='text-label-sm text-text-strong-950'>
              Todas as suas sementes
            </h2>

            {seeds.length === 0 ? (
              <div className='rounded-20 border border-dashed border-stroke-soft-200 px-6 py-12 text-center'>
                <p className='text-paragraph-sm text-text-sub-600'>
                  Nenhuma semente no seu escopo ainda.
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {seeds.map((seed) => (
                  <div
                    key={seed.id}
                    className='flex items-center justify-between gap-4 rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-4 transition duration-200 ease-out hover:border-stroke-sub-300 hover:shadow-regular-sm'
                  >
                    <Link
                      href={`/sementes/${seed.id}`}
                      className='min-w-0 flex-1 space-y-1'
                    >
                      <div className='flex items-center gap-2'>
                        <p className='truncate text-label-sm text-text-strong-950'>
                          {seed.name}
                        </p>
                        <SeedHealthBadge
                          health={seed.health}
                          diasParada={seed.diasParada}
                        />
                      </div>
                      <SeedMarcoBadges seed={seed} />
                    </Link>

                    <div className='flex shrink-0 items-center gap-2'>
                      <span className='hidden font-mono text-paragraph-sm text-text-sub-600 sm:inline'>
                        {formatPhoneDisplay(seed.phone)}
                      </span>
                      <CompactButton.Root
                        variant='stroke'
                        size='medium'
                        asChild
                      >
                        <a
                          href={toWhatsAppUrl(seed.phone)}
                          target='_blank'
                          rel='noopener noreferrer'
                          aria-label={`WhatsApp de ${seed.name}`}
                        >
                          <CompactButton.Icon as={RiWhatsappLine} />
                        </a>
                      </CompactButton.Root>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
