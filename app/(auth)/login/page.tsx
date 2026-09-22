'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Error } from '@/app/components/ui/Error';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        setMessage('確認リンクをメールに送信しました。メールをご確認ください。');
        setEmail('');
      }
    } catch {
      setError('エラーが発生しました。もう一度試してください。');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 style={{ color: 'var(--color-accent-primary)' }} className="text-4xl font-semibold mb-2">
          CREW
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }} className="text-lg">
          SNS Director
        </p>
      </div>

      {/* Form Card */}
      <div
        style={{
          backgroundColor: 'var(--color-base-white)',
          borderColor: 'var(--color-bg-warm-gray)',
        }}
        className="rounded-2xl border px-8 py-12 shadow-sm"
      >
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-2">
          ログイン
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }} className="text-base mb-8">
          メールアドレスで続ける
        </p>

        {/* Success Message */}
        {message && (
          <div
            style={{
              backgroundColor: '#F1F8E9',
              borderColor: '#9CCC65',
              color: '#33691E',
            }}
            className="rounded-lg border px-4 py-4 mb-8 text-base"
          >
            ✓ {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              style={{ color: 'var(--color-text-primary)' }}
              className="block text-base font-medium mb-3"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                borderColor: 'var(--color-bg-warm-gray)',
                color: 'var(--color-text-primary)',
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition text-base"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-bg-warm-gray)';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? 'var(--color-text-secondary)' : 'var(--color-accent-primary)',
            }}
            className="w-full text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-60 transition text-base mt-8"
          >
            {loading ? '送信中...' : 'ログインリンクを送信'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-8 text-center border-t" style={{ borderColor: 'var(--color-bg-warm-gray)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-base">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/signup"
              style={{ color: 'var(--color-accent-primary)' }}
              className="font-semibold hover:opacity-75 transition"
            >
              サインアップ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}