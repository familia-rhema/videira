import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RiArrowLeftLine, RiWhatsappLine } from '@remixicon/react';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import { SeedMarcoBadges } from '@/components/seeds/seed-marco-badges';
import { SeedHealthBadge } from '@/components/seeds/seed-health-badge';
import { SeedMarcosPanel } from '@/components/seeds/seed-marcos-panel';
import { SeedAcoesPanel } from '@/components/seeds/seed-acoes-panel';
import { SeedTimeline } from '@/components/seeds/seed-timeline';
import { formatPhoneDisplay, toWhatsAppUrl } from '@/lib/phone';
import { getCelulaLabel } from '@/lib/celulas';
import { getSeedById, getSeedEvents } from '@/lib/store/seeds';
import {
  ABORDAGEM_TIPO_LABELS,
  ACEITOU_JESUS_LABELS,
  SEED_GENDER_LABELS,
} from '@/lib/types/seed';
import { getUserById } from '@/lib/store/users';
import { getSessionUser } from '@/lib/auth/session';
import { requireSeedAccess } from '@/lib/access';

type SeedProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SeedProfilePage({ params }: SeedProfilePageProps) {
  const { id } = await params;
  const [currentUser, seed] = await Promise.all([
    getSessionUser(),
    getSeedById(id),
  ]);

  if (!seed) {
    notFound();
  }

  await requireSeedAccess(currentUser, seed);

  const events = await getSeedEvents(id);
  const [abordador, regador] = await Promise.all([
    getUserById(seed.abordadorId),
    getUserById(seed.regadorId),
  ]);

  return (
    <div className='p-4 sm:p-8'>
      <div className='mb-6'>
        <Button.Root variant='neutral' mode='ghost' asChild>
          <Link href='/sementes'>
            <Button.Icon as={RiArrowLeftLine} />
            Voltar para sementes
          </Link>
        </Button.Root>
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <section className='space-y-6'>
          <div className='rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div className='space-y-2'>
                <h1 className='text-title-h5 text-text-strong-950'>
                  {seed.name}
                </h1>
                <SeedHealthBadge
                  health={seed.health}
                  diasParada={seed.diasParada}
                />
              </div>

              <div className='flex items-center gap-2'>
                <span className='font-mono text-paragraph-sm text-text-sub-600'>
                  {formatPhoneDisplay(seed.phone)}
                </span>
                <CompactButton.Root variant='stroke' size='medium' asChild>
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

            <dl className='mt-6 grid gap-4 sm:grid-cols-2'>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>
                  BAIRRO
                </dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {seed.neighborhood ?? '—'}
                </dd>
              </div>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>SEXO</dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {seed.gender ? SEED_GENDER_LABELS[seed.gender] : '—'}
                </dd>
              </div>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>
                  ABORDADOR
                </dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {abordador?.name ?? '—'}
                </dd>
              </div>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>
                  REGADOR
                </dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {regador?.name ?? '—'}
                </dd>
              </div>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>
                  DATA DA ABORDAGEM
                </dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {seed.abordagemData
                    ? seed.abordagemData.split('-').reverse().join('/')
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>
                  LOCAL DA ABORDAGEM
                </dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {seed.abordagemLocal ?? '—'}
                </dd>
              </div>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>
                  TIPO DE ABORDAGEM
                </dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {seed.abordagemTipo
                    ? ABORDAGEM_TIPO_LABELS[seed.abordagemTipo]
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>
                  ACEITOU JESUS / RECONCILIOU
                </dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {seed.aceitouJesus
                    ? ACEITOU_JESUS_LABELS[seed.aceitouJesus]
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className='text-subheading-xs text-text-soft-400'>
                  CÉLULA ENCAMINHADA
                </dt>
                <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                  {seed.direcionadoCelula
                    ? getCelulaLabel(seed.celulaEncaminhada) ?? '—'
                    : seed.direcionadoCelula === false
                      ? 'Não direcionado'
                      : '—'}
                </dd>
              </div>
              <div className='sm:col-span-2'>
                <dt className='text-subheading-xs text-text-soft-400'>
                  MARCOS
                </dt>
                <dd className='mt-2'>
                  <SeedMarcoBadges seed={seed} />
                </dd>
              </div>
            </dl>
          </div>

          <div className='rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-5'>
            <h2 className='text-title-h6 text-text-strong-950'>
              Linha do tempo
            </h2>
            <p className='mt-1 text-paragraph-sm text-text-sub-600'>
              Histórico completo de eventos desta semente.
            </p>
            <div className='mt-5'>
              <SeedTimeline events={events} />
            </div>
          </div>
        </section>

        <div className='space-y-6'>
          <SeedAcoesPanel seed={seed} />
          <SeedMarcosPanel seed={seed} />
        </div>
      </div>
    </div>
  );
}
