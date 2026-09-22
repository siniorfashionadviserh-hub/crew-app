'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { Loading } from '@/app/components/ui/Loading';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-warm-gray)' }} className="min-h-screen">
      <header style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 style={{ color: 'var(--color-accent-primary)' }} className="text-3xl font-semibold">
            CREW
          </h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-12">{children}</main>
    </div>
  );
}
