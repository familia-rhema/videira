import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/store/users';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { SporosLogo } from '@/components/sporos-logo';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(SESSION_COOKIE)?.value;
  if (cookieId && (await getUserById(cookieId))) redirect('/');

  return (
    <div className='flex min-h-screen items-center justify-center bg-bg-weak-50 p-4'>
      <div className='w-full max-w-sm space-y-8 rounded-20 bg-bg-white-0 p-8 shadow-regular-md'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <SporosLogo className='h-8 w-auto' />
          <p className='text-paragraph-sm text-text-sub-600'>Entre para acessar o Sporos.</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
