'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiAddLine,
  RiBookOpenLine,
  RiCollageLine,
  RiDropLine,
  RiFlashlightLine,
  RiGroupLine,
  RiHome2Line,
  RiSearchLine,
  RiSeedlingLine,
  RiSidebarUnfoldLine,
} from '@remixicon/react';
import * as CompactButton from '@/components/ui/compact-button';
import * as Divider from '@/components/ui/divider';
import { SporosLogo } from '@/components/sporos-logo';
import { UserSwitcher } from '@/components/user-switcher';
import { isAdminOrLider } from '@/lib/roles';
import type { User } from '@/lib/types/seed';
import { cn } from '@/utils/cn';

type NavItem = {
  href: string;
  label: string;
  icon: typeof RiHome2Line;
};

const ADMIN_LIDER_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: RiHome2Line },
  { href: '/sementes', label: 'Sementes', icon: RiSeedlingLine },
  { href: '/celulas', label: 'Células', icon: RiCollageLine },
  { href: '/visao-rhema', label: 'Visão Rhema', icon: RiBookOpenLine },
  { href: '/batismo', label: 'Batismo', icon: RiDropLine },
  { href: '/automacoes', label: 'Automações', icon: RiFlashlightLine },
  { href: '/equipe', label: 'Equipe', icon: RiGroupLine },
];

const VOLUNTARIO_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: RiHome2Line },
  { href: '/sementes', label: 'Minhas sementes', icon: RiSeedlingLine },
];

type AppSidebarProps = {
  currentUser: User;
  users: User[];
};

export function AppSidebar({ currentUser, users }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = isAdminOrLider(currentUser)
    ? ADMIN_LIDER_NAV_ITEMS
    : VOLUNTARIO_NAV_ITEMS;

  return (
    <aside className='flex h-full w-[272px] shrink-0 flex-col gap-4 bg-bg-weak-50 px-3.5 pb-3.5 pt-5'>
      <div className='flex flex-col gap-5'>
        <div className='flex items-start justify-between pl-1.5'>
          <Link href='/' aria-label='Sporos — início'>
            <SporosLogo />
          </Link>
          <CompactButton.Root variant='white' size='large'>
            <CompactButton.Icon as={RiSidebarUnfoldLine} />
          </CompactButton.Root>
        </div>

        <label className='flex items-center gap-2 rounded-10 bg-bg-white-0 p-2 shadow-regular-xs'>
          <RiSearchLine className='size-5 shrink-0 text-text-soft-400' />
          <input
            type='search'
            placeholder='Pesquisar...'
            className='min-w-0 flex-1 bg-transparent text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400'
          />
        </label>
      </div>

      <nav className='flex flex-1 flex-col gap-1'>
        <Link
          href='/sementes/nova'
          className='flex items-center gap-2 rounded-lg p-1.5 transition duration-200 ease-out hover:bg-bg-white-0'
        >
          <span className='flex size-5 items-center justify-center rounded-full bg-primary-alpha-10'>
            <RiAddLine className='size-[18px] text-primary-base' />
          </span>
          <span className='text-label-sm text-primary-base'>Nova semente</span>
        </Link>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition duration-200 ease-out',
                isActive
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-regular-xs'
                  : 'text-text-sub-600 hover:bg-bg-white-0 hover:text-text-strong-950',
              )}
            >
              <Icon className='size-5 shrink-0' />
              <span className='text-label-sm'>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className='flex flex-col gap-3'>
        <Divider.Root variant='line-spacing' />
        <UserSwitcher currentUser={currentUser} users={users} />
      </div>
    </aside>
  );
}
