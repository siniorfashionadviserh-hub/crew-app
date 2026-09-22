'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Auto-redirect to onboarding if not completed
    const checkOnboardingStatus = async () => {
      // This can be enhanced later to check if onboarding is complete
    };
    checkOnboardingStatus();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleStartOnboarding = () => {
    router.push('/onboarding');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-warm-gray)' }} className="min-h-screen">
      {/* Header */}
      <header
        style={{
          backgroundColor: 'var(--color-base-white)',
          borderColor: 'var(--color-bg-warm-gray)',
        }}
        className="border-b"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center">
          <div>
            <h1 style={{ color: 'var(--color-accent-primary)' }} className="text-4xl font-semibold">
              CREW
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-base mt-1">
              SNS Director
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              backgroundColor: loggingOut ? 'var(--color-text-secondary)' : 'var(--color-accent-primary)',
            }}
            className="text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 disabled:opacity-60 transition text-base"
          >
            {loggingOut ? 'ログアウト中...' : 'ログアウト'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Card */}
        <div
          style={{
            backgroundColor: 'var(--color-base-white)',
            borderColor: 'var(--color-bg-warm-gray)',
          }}
          className="rounded-2xl border px-8 py-12 mb-12 shadow-sm"
        >
          <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-2">
            ようこそ、{user?.email} さん
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-lg mb-8">
            CREWであなたのSNS戦略を作成しましょう。
          </p>

          <div className="pt-8 border-t" style={{ borderColor: 'var(--color-bg-warm-gray)' }}>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-base">
              Phase 1「基盤機能」実装完了。認証・ユーザーコンテキスト・ナビゲーションシステムが動作中です。
            </p>
          </div>
        </div>

        {/* Start Onboarding */}
        <div
          style={{
            backgroundColor: 'var(--color-base-white)',
            borderColor: 'var(--color-bg-warm-gray)',
          }}
          className="rounded-2xl border px-8 py-12 shadow-sm mb-12"
        >
          <h3 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-4">
            🚀 SNS設計を作成する
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-base mb-8">
            まずはあなたのSNS目的や発信ジャンルを教えてください。AIが最適な戦略を提案します。
          </p>
          <button
            onClick={handleStartOnboarding}
            style={{ backgroundColor: 'var(--color-accent-primary)' }}
            className="text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition text-base"
          >
            オンボーディングを開始
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div
          style={{
            backgroundColor: 'var(--color-base-white)',
            borderColor: 'var(--color-bg-warm-gray)',
          }}
          className="rounded-2xl border px-8 py-12 shadow-sm"
        >
          <h3 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-semibold mb-4">
            📋 Phase 2実装中
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-base">
            Onboarding・Account Strategy・Brand Kit・撮影ガイドの実装が進行中です。
          </p>
        </div>
      </main>
    </div>
  );
}