'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { Loading } from '@/app/components/ui/Loading';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return null;
  }

  return (
    <div
      style={{ backgroundColor: 'var(--color-bg-warm-gray)' }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      {children}
    </div>
  );
}