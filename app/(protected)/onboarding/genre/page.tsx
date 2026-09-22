'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { StepIndicator } from '@/app/components/ui/StepIndicator';
import { SelectionCard } from '@/app/components/ui/SelectionCard';
import { Error } from '@/app/components/ui/Error';
import type { OnboardingSession } from '@/lib/types';

const GENRE_OPTIONS = [
  { id: 'fashion', title: 'ファッション・服装', description: 'コーデ・洋服・アクセサリーについて', icon: '👗' },
  { id: 'beauty', title: '美容', description: 'メイク・スキンケア・ヘアケアについて', icon: '💄' },
  { id: 'travel', title: '旅行・お出かけ', description: '旅行・ホテル・おすすめスポットについて', icon: '✈️' },
  { id: 'food', title: 'グルメ・食べ物', description: 'レシピ・グルメ・飲食店について', icon: '🍽️' },
  { id: 'lifestyle', title: 'ライフスタイル', description: '日常・趣味・ライフハック', icon: '🏡' },
  { id: 'health', title: '健康・フィットネス', description: '筋トレ・ヨガ・栄養について', icon: '💪' },
  { id: 'business', title: 'ビジネス・副業', description: 'スキル・キャリア・起業について', icon: '💼' },
  { id: 'other', title: 'その他', description: '上記以外のジャンル', icon: '✨' },
];

export default function GenrePage() {
  const router = useRouter();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
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
          setSelectedGenre(data[0].genre);
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
    if (!selectedGenre || !session) {
      setError('ジャンルを選択してください');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('onboarding_sessions')
        .update({
          genre: selectedGenre,
          current_step: 3,
        })
        .eq('id', session.id);

      if (updateError) throw updateError;
      router.push('/onboarding/audience');
    } catch {
      setError('保存に失敗しました。もう一度試してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    if (!session) return;
    try {
      await supabase
        .from('onboarding_sessions')
        .update({ current_step: 1 })
        .eq('id', session.id);
      router.push('/onboarding');
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

  return (
    <div>
      <StepIndicator current={2} total={4} />

      <div className="space-y-4 mb-12">
        {GENRE_OPTIONS.map((option) => (
          <SelectionCard
            key={option.id}
            id={option.id}
            title={option.title}
            description={option.description}
            icon={option.icon}
            selected={selectedGenre === option.id}
            onChange={() => setSelectedGenre(option.id)}
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
          onClick={handleBack}
          style={{ borderColor: 'var(--color-bg-warm-gray)' }}
          className="flex-1 border rounded-lg py-3 px-4 font-semibold text-base hover:bg-gray-50 transition"
        >
          戻る
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedGenre || loading}
          style={{
            backgroundColor: selectedGenre && !loading ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
          }}
          className="flex-1 text-white rounded-lg py-3 px-4 font-semibold text-base hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? '保存中...' : '次へ'}
        </button>
      </div>
    </div>
  );
}
