'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { StepIndicator } from '@/app/components/ui/StepIndicator';
import { Error } from '@/app/components/ui/Error';
import type { OnboardingSession } from '@/lib/types';

export default function ConfirmPage() {
  const router = useRouter();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('onboarding_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;
        if (data && data.length > 0) {
          setSession(data[0]);
        }
      } catch {
        setError('セッションの読み込みに失敗しました');
      } finally {
        setIsInitializing(false);
      }
    };

    loadSession();
  }, [router]);

  const handleConfirm = async () => {
    if (!session) return;

    setLoading(true);
    try {
      // Create Account first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ユーザーが見つかりません');
        return;
      }

      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert([
          {
            user_id: user.id,
            account_name: `My SNS Account`,
            platform: 'instagram',
          },
        ])
        .select();

      if (accountError) throw accountError;

      const accountId = accountData[0].id;

      // Update session with account_id and move to strategy generation
      const { error: updateError } = await supabase
        .from('onboarding_sessions')
        .update({
          account_id: accountId,
        })
        .eq('id', session.id);

      if (updateError) throw updateError;

      // Redirect to strategy generation
      router.push('/onboarding/strategy');
    } catch {
      setError('確認に失敗しました。もう一度試してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    if (!session) return;
    try {
      await supabase
        .from('onboarding_sessions')
        .update({ current_step: 3 })
        .eq('id', session.id);
      router.push('/onboarding/audience');
    } catch {
      setError('戻る操作に失敗しました');
    }
  };

  if (isInitializing) {
    return <div className="text-center py-12">読み込み中...</div>;
  }

  if (error && error.includes('セッション')) {
    return <Error message={error} />;
  }

  if (!session) {
    return <Error message="セッションが見つかりません" />;
  }

  return (
    <div>
      <StepIndicator current={4} total={4} />

      <div
        style={{
          backgroundColor: 'var(--color-base-white)',
          borderColor: 'var(--color-bg-warm-gray)',
        }}
        className="rounded-2xl border px-8 py-8 mb-12"
      >
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-8">
          入力内容の確認
        </h2>

        <div className="space-y-6">
          {/* Purpose */}
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-base font-medium mb-1">
              目的
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-lg">
              {getPurposeLabel(session.purpose)}
            </p>
          </div>

          {/* Genre */}
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-base font-medium mb-1">
              ジャンル
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-lg">
              {getGenreLabel(session.genre)}
            </p>
          </div>

          {/* Target Audience */}
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-base font-medium mb-1">
              届けたい相手
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-lg">
              {session.target_age_group} 代・{getGenderLabel(session.target_gender)}
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-base mt-2">
              {session.target_pain_point}
            </p>
          </div>

          {/* Creator Info */}
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-base font-medium mb-1">
              あなたについて
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-lg">
              {session.creator_age_group} 代
            </p>
            <div className="mt-2 space-y-1">
              {session.can_show_face && (
                <p style={{ color: 'var(--color-text-primary)' }} className="text-base">
                  ✓ 顔出しできます
                </p>
              )}
              {session.can_use_voice && (
                <p style={{ color: 'var(--color-text-primary)' }} className="text-base">
                  ✓ 音声を使用できます
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FFEBEE', borderColor: '#EF5350', color: '#C62828' }} className="rounded-lg border px-4 py-3 mb-6 text-base">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleBack}
          style={{ borderColor: 'var(--color-bg-warm-gray)' }}
          className="flex-1 border rounded-lg py-3 px-4 font-semibold text-base hover:bg-gray-50 transition"
        >
          戻る
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          style={{
            backgroundColor: !loading ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
          }}
          className="flex-1 text-white rounded-lg py-3 px-4 font-semibold text-base hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? '生成中...' : 'SNS設計を生成する'}
        </button>
      </div>
    </div>
  );
}

function getPurposeLabel(purpose: string | null): string {
  const labels: Record<string, string> = {
    awareness: '認知を広げる',
    followers: 'フォロワーを増やす',
    traffic: 'ブログへアクセスを送る',
    sales: '商品を売る',
    affiliate: 'アフィリエイト',
    influencer: 'インフルエンサーになる',
  };
  return labels[purpose || ''] || '';
}

function getGenreLabel(genre: string | null): string {
  const labels: Record<string, string> = {
    fashion: 'ファッション・服装',
    beauty: '美容',
    travel: '旅行・お出かけ',
    food: 'グルメ・食べ物',
    lifestyle: 'ライフスタイル',
    health: '健康・フィットネス',
    business: 'ビジネス・副業',
    other: 'その他',
  };
  return labels[genre || ''] || '';
}

function getGenderLabel(gender: string | null): string {
  const labels: Record<string, string> = {
    male: '男性',
    female: '女性',
    mixed: '性別問わず',
  };
  return labels[gender || ''] || '';
}
