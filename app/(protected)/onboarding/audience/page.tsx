'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { StepIndicator } from '@/app/components/ui/StepIndicator';
import { Error } from '@/app/components/ui/Error';
import type { OnboardingSession } from '@/lib/types';

const AGE_OPTIONS = ['20s', '30s', '40s', '50s', '60s', '70s+', 'mixed'];
const GENDER_OPTIONS = [
  { id: 'female', label: '女性' },
  { id: 'male', label: '男性' },
  { id: 'mixed', label: '性別問わず' },
];

export default function AudiencePage() {
  const router = useRouter();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [targetAge, setTargetAge] = useState('');
  const [targetGender, setTargetGender] = useState('');
  const [targetPainPoint, setTargetPainPoint] = useState('');
  const [creatorAge, setCreatorAge] = useState('');
  const [canShowFace, setCanShowFace] = useState(false);
  const [canUseVoice, setCanUseVoice] = useState(false);
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
          const s = data[0];
          setSession(s);
          setTargetAge(s.target_age_group || '');
          setTargetGender(s.target_gender || '');
          setTargetPainPoint(s.target_pain_point || '');
          setCreatorAge(s.creator_age_group || '');
          setCanShowFace(s.can_show_face || false);
          setCanUseVoice(s.can_use_voice || false);
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
    if (!targetAge || !targetGender || !targetPainPoint || !creatorAge) {
      setError('すべての項目を入力してください');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('onboarding_sessions')
        .update({
          target_age_group: targetAge,
          target_gender: targetGender,
          target_pain_point: targetPainPoint,
          creator_age_group: creatorAge,
          can_show_face: canShowFace,
          can_use_voice: canUseVoice,
          current_step: 4,
        })
        .eq('id', session!.id);

      if (updateError) throw updateError;
      router.push('/onboarding/confirm');
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
        .update({ current_step: 2 })
        .eq('id', session.id);
      router.push('/onboarding/genre');
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
      <StepIndicator current={3} total={4} />

      <div
        style={{
          backgroundColor: 'var(--color-base-white)',
          borderColor: 'var(--color-bg-warm-gray)',
        }}
        className="rounded-2xl border px-8 py-8 mb-12"
      >
        <div className="space-y-8">
          {/* Target Age */}
          <div>
            <label style={{ color: 'var(--color-text-primary)' }} className="block text-base font-semibold mb-4">
              届けたい相手の年代
            </label>
            <select
              value={targetAge}
              onChange={(e) => setTargetAge(e.target.value)}
              style={{
                borderColor: 'var(--color-bg-warm-gray)',
                color: 'var(--color-text-primary)',
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-base"
            >
              <option value="">選択してください</option>
              {AGE_OPTIONS.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          {/* Target Gender */}
          <div>
            <label style={{ color: 'var(--color-text-primary)' }} className="block text-base font-semibold mb-4">
              性別
            </label>
            <div className="space-y-2">
              {GENDER_OPTIONS.map((option) => (
                <label key={option.id} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={option.id}
                    checked={targetGender === option.id}
                    onChange={(e) => setTargetGender(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span style={{ color: 'var(--color-text-primary)' }} className="ml-3 text-base">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Pain Point */}
          <div>
            <label style={{ color: 'var(--color-text-primary)' }} className="block text-base font-semibold mb-2">
              相手が抱える悩み・課題
            </label>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-base mb-4">
              例：「年齢に合わせた服選びに悩んでいる」
            </p>
            <textarea
              value={targetPainPoint}
              onChange={(e) => setTargetPainPoint(e.target.value)}
              placeholder="相手の悩みを入力してください"
              style={{
                borderColor: 'var(--color-bg-warm-gray)',
                color: 'var(--color-text-primary)',
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-base"
              rows={3}
            />
          </div>

          {/* Creator Age */}
          <div>
            <label style={{ color: 'var(--color-text-primary)' }} className="block text-base font-semibold mb-4">
              あなたの年代
            </label>
            <select
              value={creatorAge}
              onChange={(e) => setCreatorAge(e.target.value)}
              style={{
                borderColor: 'var(--color-bg-warm-gray)',
                color: 'var(--color-text-primary)',
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-base"
            >
              <option value="">選択してください</option>
              {AGE_OPTIONS.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          {/* Can Show Face */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="face"
              checked={canShowFace}
              onChange={(e) => setCanShowFace(e.target.checked)}
              className="w-4 h-4 mt-1"
            />
            <div className="ml-3">
              <label htmlFor="face" style={{ color: 'var(--color-text-primary)' }} className="block text-base font-semibold cursor-pointer">
                顔出しできます
              </label>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-base mt-1">
                投稿に顔が映った動画・画像を使用できます
              </p>
            </div>
          </div>

          {/* Can Use Voice */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="voice"
              checked={canUseVoice}
              onChange={(e) => setCanUseVoice(e.target.checked)}
              className="w-4 h-4 mt-1"
            />
            <div className="ml-3">
              <label htmlFor="voice" style={{ color: 'var(--color-text-primary)' }} className="block text-base font-semibold cursor-pointer">
                音声を使用できます
              </label>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-base mt-1">
                解説や説明のための音声を入れられます
              </p>
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
          onClick={handleNext}
          disabled={!targetAge || !targetGender || !targetPainPoint || !creatorAge || loading}
          style={{
            backgroundColor:
              targetAge && targetGender && targetPainPoint && creatorAge && !loading
                ? 'var(--color-accent-primary)'
                : 'var(--color-text-secondary)',
          }}
          className="flex-1 text-white rounded-lg py-3 px-4 font-semibold text-base hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? '保存中...' : '次へ'}
        </button>
      </div>
    </div>
  );
}
