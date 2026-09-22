'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { StepIndicator } from '@/app/components/ui/StepIndicator';
import { SelectionCard } from '@/app/components/ui/SelectionCard';
import { Error } from '@/app/components/ui/Error';
import type { OnboardingSession } from '@/lib/types';

const PURPOSE_OPTIONS = [
  { id: 'awareness', title: '認知を広げる', description: 'より多くの人に知ってもらいたい', icon: '📢' },
  { id: 'followers', title: 'フォロワーを増やす', description: 'ファンコミュニティを作りたい', icon: '👥' },
  { id: 'traffic', title: 'ブログへアクセスを送る', description: 'ブログやサイトへの流入を増やしたい', icon: '🔗' },
  { id: 'sales', title: '商品を売る', description: 'オンラインストアやサービスを販売したい', icon: '💳' },
  { id: 'affiliate', title: 'アフィリエイト', description: 'リンク経由での紹介料収入を得たい', icon: '💰' },
  { id: 'influencer', title: 'インフルエンサーになる', description: 'PR案件やコラボの依頼を受けたい', icon: '⭐' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Load existing session
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
          setSelectedPurpose(data[0].purpose);
        } else {
          // Create new session
          const { data: newSession, error: createError } = await supabase
            .from('onboarding_sessions')
            .insert([
              {
                user_id: user.id,
                current_step: 1,
                status: 'in_progress',
              },
            ])
            .select();

          if (createError) throw createError;
          setSession(newSession[0]);
        }
      } catch {
        setError('セッションの読み込みに失敗しました');
      } finally {
        setIsInitializing(false);
      }
    };

    loadSession();
  }, [router]);

  const handleNext = async () => {
    if (!selectedPurpose || !session) {
      setError('目的を選択してください');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('onboarding_sessions')
        .update({
          purpose: selectedPurpose,
          current_step: 2,
        })
        .eq('id', session.id);

      if (updateError) throw updateError;
      router.push('/onboarding/genre');
    } catch {
      setError('保存に失敗しました。もう一度試してください。');
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return <div className="text-center py-12">読み込み中...</div>;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div>
      <StepIndicator current={1} total={4} />

      <div className="space-y-4 mb-12">
        {PURPOSE_OPTIONS.map((option) => (
          <SelectionCard
            key={option.id}
            id={option.id}
            title={option.title}
            description={option.description}
            icon={option.icon}
            selected={selectedPurpose === option.id}
            onChange={() => setSelectedPurpose(option.id)}
          />
        ))}
      </div>

      {error && (
        <div style={{ backgroundColor: '#FFEBEE', borderColor: '#EF5350', color: '#C62828' }} className="rounded-lg border px-4 py-3 mb-6 text-base">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          style={{ borderColor: 'var(--color-bg-warm-gray)' }}
          className="flex-1 border rounded-lg py-3 px-4 font-semibold text-base hover:bg-gray-50 transition"
        >
          スキップ
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedPurpose || loading}
          style={{
            backgroundColor: selectedPurpose && !loading ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
          }}
          className="flex-1 text-white rounded-lg py-3 px-4 font-semibold text-base hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? '保存中...' : '次へ'}
        </button>
      </div>
    </div>
  );
}
