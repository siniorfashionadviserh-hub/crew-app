'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CompletePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div
        style={{
          backgroundColor: 'var(--color-base-white)',
          borderColor: 'var(--color-bg-warm-gray)',
        }}
        className="rounded-2xl border px-12 py-16 text-center max-w-md"
      >
        <div style={{ color: 'var(--color-accent-primary)' }} className="text-5xl mb-6">
          ✓
        </div>
        <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-4">
          準備完了です
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }} className="text-lg mb-8">
          SNS設計とBrand Kitが完成しました。
          <br />
          ダッシュボードに進みます...
        </p>
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary"></div>
      </div>
    </div>
  );
}
