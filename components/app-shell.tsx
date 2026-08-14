import { RiMore2Line } from '@remixicon/react';
import * as CompactButton from '@/components/ui/compact-button';
import { AppSidebar } from '@/components/app-sidebar';
import { getSessionUser } from '@/lib/auth/session';

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const currentUser = await getSessionUser();

  return (
    <div className='flex h-screen overflow-hidden bg-bg-weak-50 p-1.5'>
      <AppSidebar currentUser={currentUser} />
      <div className='relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] bg-bg-white-0'>
        <div className='absolute right-4 top-4 z-10'>
          <CompactButton.Root variant='white' size='large'>
            <CompactButton.Icon as={RiMore2Line} />
          </CompactButton.Root>
        </div>
        <div className='flex min-h-0 flex-1 flex-col overflow-auto'>{children}</div>
      </div>
    </div>
  );
}
