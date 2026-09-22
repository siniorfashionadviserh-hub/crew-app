'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Error } from '@/app/components/ui/Error';
import type { OnboardingSession, StrategyResult, AccountStrategy } from '@/lib/types';

export default function StrategyPage() {
  const router = useRouter();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [strategy, setStrategy] = useState<{ strategy: AccountStrategy; display: StrategyResult } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateStrategy = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Get current session
        const { data: sessionData, error: sessionError } = await supabase
          .from('onboarding_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .limit(1);

        if (sessionError) {
          setError('セッションの読み込みに失敗しました');
          return;
        }
        const currentSession = sessionData?.[0];
        if (!currentSession) {
          setError('セッションが見つかりません');
          return;
        }

        setSession(currentSession);

        // Call strategy generation API
        const response = await fetch('/api/strategy/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purpose: currentSession.purpose,
            genre: currentSession.genre,
            targetAgeGroup: currentSession.target_age_group,
            targetGender: currentSession.target_gender,
            targetPainPoint: currentSession.target_pain_point,
            creatorAgeGroup: currentSession.creator_age_group,
            canShowFace: currentSession.can_show_face,
            canUseVoice: currentSession.can_use_voice,
            postingFrequency: currentSession.posting_frequency,
          }),
        });

        if (!response.ok) {
          setError('Strategy generation failed');
          return;
        }

        const result = await response.json();
        setStrategy(result);
      } catch {
        setError('SNS設計の生成に失敗しました。もう一度試してください。');
      } finally {
        setLoading(false);
      }
    };

    generateStrategy();
  }, [router]);

  const handleApprove = async () => {
    if (!session) return;
    try {
      await supabase
        .from('onboarding_sessions')
        .update({ status: 'completed', current_step: 5 })
        .eq('id', session.id);

      router.push('/onboarding/references');
    } catch {
      setError('確認に失敗しました');
    }
  };

  const handleBack = async () => {
    if (!session) return;
    router.push('/onboarding/confirm');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        <p style={{ color: 'var(--color-text-secondary)' }} className="mt-4 text-base">
          あなたのSNS設計を作成中...
        </p>
      </div>
    );
  }

  if (error || !strategy) {
    return <Error message={error || 'Strategy not found'} />;
  }

  const s = strategy.display;

  return (
    <div>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="rounded-2xl border px-8 py-12 mb-12">
        <h1 style={{ color: 'var(--color-accent-primary)' }} className="text-3xl font-semibold mb-4">
          あなたのSNS設計
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }} className="text-lg">
          AIが分析したあなたにぴったりのSNS戦略です
        </p>
      </div>

      {/* Concept */}
      <div style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="rounded-2xl border px-8 py-8 mb-8">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-4">
          📌 あなたのSNSコンセプト
        </h2>
        <p style={{ color: 'var(--color-text-primary)' }} className="text-lg leading-relaxed">
          「{s.concept}」
        </p>
      </div>

      {/* Target Audience */}
      <div style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="rounded-2xl border px-8 py-8 mb-8">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-4">
          01 | こんな方に届けます
        </h2>
        <p style={{ color: 'var(--color-text-primary)' }} className="text-lg">
          {s.targetAudience}
        </p>
      </div>

      {/* Content Pillars */}
      <div style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="rounded-2xl border px-8 py-8 mb-8">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-6">
          02 | 3つの発信テーマ
        </h2>
        <div className="space-y-4">
          {s.contentPillars.map((pillar, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--color-bg-warm-gray)',
                borderLeftColor: 'var(--color-accent-primary)',
              }}
              className="rounded-lg px-4 py-3 border-l-4"
            >
              <p style={{ color: 'var(--color-text-primary)' }} className="text-base font-medium">
                {pillar}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Posts */}
      <div style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="rounded-2xl border px-8 py-8 mb-8">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-6">
          03 | こんな投稿がおすすめ
        </h2>
        <ul className="space-y-3">
          {s.recommendedPosts.map((post, i) => (
            <li key={i} style={{ color: 'var(--color-text-primary)' }} className="text-base flex items-start">
              <span className="mr-3">•</span>
              <span>{post}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Posting Frequency */}
      <div style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="rounded-2xl border px-8 py-8 mb-8">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-4">
          04 | 投稿頻度
        </h2>
        <p style={{ color: 'var(--color-text-primary)' }} className="text-lg">
          {s.postingFrequency}
        </p>
      </div>

      {/* Visual Direction */}
      <div style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="rounded-2xl border px-8 py-8 mb-8">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-4">
          05 | 写真・動画の雰囲気
        </h2>
        <p style={{ color: 'var(--color-text-primary)' }} className="text-lg">
          {s.visualDirection}
        </p>
      </div>

      {/* Monetization */}
      <div style={{ backgroundColor: 'var(--color-base-white)', borderColor: 'var(--color-bg-warm-gray)' }} className="rounded-2xl border px-8 py-8 mb-12">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-6">
          06 | 将来の収益化
        </h2>
        <ul className="space-y-3">
          {s.monetizationCandidates.map((option, i) => (
            <li key={i} style={{ color: 'var(--color-text-primary)' }} className="text-base flex items-start">
              <span className="mr-3">•</span>
              <span>{option}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleBack}
          style={{ borderColor: 'var(--color-bg-warm-gray)' }}
          className="flex-1 border rounded-lg py-3 px-4 font-semibold text-base hover:bg-gray-50 transition"
        >
          戻る
        </button>
        <button
          onClick={handleApprove}
          style={{ backgroundColor: 'var(--color-accent-primary)' }}
          className="flex-1 text-white rounded-lg py-3 px-4 font-semibold text-base hover:opacity-90 transition"
        >
          この内容で進める
        </button>
      </div>
    </div>
  );
}
