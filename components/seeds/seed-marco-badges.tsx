import * as Badge from '@/components/ui/badge';
import { MARCOS } from '@/lib/marcos';
import type { Seed } from '@/lib/types/seed';
import { cn } from '@/utils/cn';

type SeedMarcoBadgesProps = {
  seed: Pick<
    Seed,
    'confissaoFeEm' | 'rhemaConcluidoEm' | 'batizadoEm' | 'entrouCelulaEm'
  >;
  className?: string;
};

export function SeedMarcoBadges({ seed, className }: SeedMarcoBadgesProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {MARCOS.map(({ field, label, icon: Icon, badgeColor }) => {
        const done = Boolean(seed[field]);

        return (
          <Badge.Root
            key={field}
            size='small'
            variant={done ? 'light' : 'stroke'}
            color={done ? badgeColor : 'gray'}
            className='gap-1'
          >
            <Badge.Icon as={Icon} />
            {label}
          </Badge.Root>
        );
      })}
    </div>
  );
}

// Mantém compatibilidade temporária com imports antigos
export { SeedMarcoBadges as SeedAchievementBadges };
