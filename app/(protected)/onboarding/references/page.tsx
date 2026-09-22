'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Error } from '@/app/components/ui/Error';
import type { OnboardingSession, ReferenceAccount } from '@/lib/types';

export default function ReferencesPage() {
  const router = useRouter();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [accounts, setAccounts] = useState<ReferenceAccount[]>([{ name: '', url: '' }]);
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
          .eq('status', 'completed')
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

  const handleAddAccount = () => {
    setAccounts([...accounts, { name: '', url: '' }]);
  };

  const handleRemoveAccount = (index: number) => {
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  const handleUpdateAccount = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: value };
    setAccounts(updated);
  };

  const handleNext = async () => {
    // Filter out empty accounts
    const filledAccounts = accounts.filter((acc) => acc.name.trim());

    if (filledAccounts.length === 0) {
      // Skip if no accounts entered - it's optional
      router.push('/onboarding/brandkit');
      return;
    }

    setLoading(true);
    try {
      // Update account_strategies with reference_accounts
      if (session?.account_id) {
        const { error: updateError } = await supabase
          .from('account_strategies')
          .update({
            reference_accounts: filledAccounts.map((acc) => `${acc.name}${acc.url ? ` (${acc.url})` : ''}`),
          })
          .eq('account_id', session.account_id);

        if (updateError) throw updateError;
      }

      router.push('/onboarding/brandkit');
    } catch {
      setError('保存に失敗しました');
    } finally {
      setLoading(false);
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
      <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-4">
        参考にしたいアカウント
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }} className="text-lg mb-12">
        あなたが参考にしたいInstagramアカウントを教えてください。（任意）
      </p>

      <div className="space-y-6 mb-12">
        {accounts.map((account, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--color-base-white)',
              borderColor: 'var(--color-bg-warm-gray)',
            }}
            className="rounded-2xl border px-6 py-6"
          >
            <div className="space-y-4">
              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-base font-semibold mb-2">
                  アカウント名 / @ID
                </label>
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => handleUpdateAccount(index, 'name', e.target.value)}
                  placeholder="例: @user_name"
                  style={{
                    borderColor: 'var(--color-bg-warm-gray)',
                    color: 'var(--color-text-primary)',
                  }}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-base"
                />
              </div>

              <div>
                <label style={{ color: 'var(--color-text-primary)' }} className="block text-base font-semibold mb-2">
                  URL（任意）
                </label>
                <input
                  type="url"
                  value={account.url || ''}
                  onChange={(e) => handleUpdateAccount(index, 'url', e.target.value)}
                  placeholder="https://instagram.com/user_name"
                  style={{
                    borderColor: 'var(--color-bg-warm-gray)',
                    color: 'var(--color-text-primary)',
                  }}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-base"
                />
              </div>

              {accounts.length > 1 && (
                <button
                  onClick={() => handleRemoveAccount(index)}
                  style={{ color: 'var(--color-accent-primary)' }}
                  className="text-base font-semibold hover:opacity-75 transition"
                >
                  削除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddAccount}
        style={{ borderColor: 'var(--color-bg-warm-gray)', color: 'var(--color-accent-primary)' }}
        className="w-full border rounded-lg py-3 px-4 font-semibold text-base hover:bg-gray-50 transition mb-8"
      >
        + アカウントを追加
      </button>

      {error && (
        <div style={{ backgroundColor: '#FFEBEE', borderColor: '#EF5350', color: '#C62828' }} className="rounded-lg border px-4 py-3 mb-6 text-base">
          {error}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={loading}
        style={{
          backgroundColor: !loading ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
        }}
        className="w-full text-white rounded-lg py-3 px-4 font-semibold text-base hover:opacity-90 disabled:opacity-60 transition"
      >
        {loading ? '保存中...' : 'スキップ / 次へ'}
      </button>
    </div>
  );
}
