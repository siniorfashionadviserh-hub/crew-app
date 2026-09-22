'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Error } from '@/app/components/ui/Error';
import type { OnboardingSession } from '@/lib/types';

const COLOR_PALETTES: Record<string, { primary: string; secondary: string; background: string }> = {
  warm: { primary: '#D77D5F', secondary: '#E8B4A8', background: '#F5D5CA' },
  cool: { primary: '#4A90E2', secondary: '#7FB3D5', background: '#B3D9F2' },
  natural: { primary: '#8B7355', secondary: '#D2B48C', background: '#F5DEB3' },
  modern: { primary: '#2C3E50', secondary: '#34495E', background: '#95A5A6' },
};

const PALETTE_OPTIONS = [
  { id: 'warm', name: '暖色系', colors: ['#D77D5F', '#E8B4A8', '#F5D5CA'] },
  { id: 'cool', name: '寒色系', colors: ['#4A90E2', '#7FB3D5', '#B3D9F2'] },
  { id: 'natural', name: 'ナチュラル', colors: ['#8B7355', '#D2B48C', '#F5DEB3'] },
  { id: 'modern', name: 'モダン', colors: ['#2C3E50', '#34495E', '#95A5A6'] },
];

const FONTS = [
  { id: 'sans', name: 'Modern（Sans Serif）', font: 'system-ui' },
  { id: 'serif', name: 'Classic（Serif）', font: 'georgia' },
  { id: 'mono', name: 'Minimal（Monospace）', font: 'monospace' },
];

const PHOTO_STYLES = [
  { id: 'bright', name: '明るくナチュラル', description: '自然光が活きた柔らかい雰囲気' },
  { id: 'elegant', name: '上品', description: '洗練された高級感のある雰囲気' },
  { id: 'casual', name: 'カジュアル', description: '日常のままの親しみやすい雰囲気' },
  { id: 'minimal', name: 'シンプル', description: '余白を大切にした最小限の構成' },
];

const TONE_OPTIONS = [
  { id: 'friendly', name: '親しみやすい', description: 'カジュアルで親友のような話し方' },
  { id: 'elegant', name: '上品でやさしい', description: '丁寧で思いやりのある話し方' },
  { id: 'professional', name: '専門的で信頼感', description: 'ノウハウや知見を感じさせる話し方' },
  { id: 'energetic', name: '元気でカジュアル', description: 'ポジティブで活発な話し方' },
];

const CTA_OPTIONS = [
  { id: 'standard', text: 'この内容で始める' },
  { id: 'action', text: '今すぐ始める' },
  { id: 'explore', text: 'さっそく見てみる' },
  { id: 'custom', text: 'カスタム' },
];

export default function BrandKitPage() {
  const router = useRouter();
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [colorPalette, setColorPalette] = useState('');
  const [fontChoice, setFontChoice] = useState('');
  const [photoStyle, setPhotoStyle] = useState('');
  const [tone, setTone] = useState('');
  const [cta, setCta] = useState('standard');
  const [customCta, setCustomCta] = useState('');
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

  const handleNext = async () => {
    if (!colorPalette || !fontChoice || !photoStyle || !tone || !session) {
      setError('すべてを選択してください');
      return;
    }

    setLoading(true);
    try {
      const palette = COLOR_PALETTES[colorPalette];
      const fontObj = FONTS.find((f) => f.id === fontChoice);
      const ctaText = cta === 'custom' ? customCta : CTA_OPTIONS.find((c) => c.id === cta)?.text || 'この内容で始める';

      // Save brand kit
      const { error: brandKitError } = await supabase
        .from('brand_kits')
        .insert([
          {
            account_id: session.account_id,
            color_primary: palette.primary,
            color_secondary: palette.secondary,
            color_background: palette.background,
            font_primary: fontObj?.font || 'system-ui',
            font_secondary: fontObj?.font || 'system-ui',
            logo_storage_path: '',
            photo_style: photoStyle,
            copy_tone: tone,
            default_cta: ctaText,
          },
        ]);

      if (brandKitError) throw brandKitError;

      router.push('/onboarding/complete');
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
      <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-12">
        Brand Kit
      </h1>

      {/* Color Palette */}
      <div className="mb-12">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-6">
          カラーパレット
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {PALETTE_OPTIONS.map((palette) => (
            <button
              key={palette.id}
              onClick={() => setColorPalette(palette.id)}
              style={{
                backgroundColor: colorPalette === palette.id ? 'rgba(215, 125, 95, 0.05)' : 'var(--color-base-white)',
                borderColor: colorPalette === palette.id ? 'var(--color-accent-primary)' : 'var(--color-bg-warm-gray)',
              }}
              className="rounded-2xl border px-6 py-6 text-left transition-all"
            >
              <p style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-3">
                {palette.name}
              </p>
              <div className="flex gap-2">
                {palette.colors.map((color) => (
                  <div
                    key={color}
                    style={{ backgroundColor: color }}
                    className="w-8 h-8 rounded-lg"
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div className="mb-12">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-6">
          フォント
        </h2>
        <div className="space-y-3">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => setFontChoice(font.id)}
              style={{
                backgroundColor: fontChoice === font.id ? 'rgba(215, 125, 95, 0.05)' : 'var(--color-base-white)',
                borderColor: fontChoice === font.id ? 'var(--color-accent-primary)' : 'var(--color-bg-warm-gray)',
                fontFamily: font.font,
              }}
              className="w-full rounded-2xl border px-6 py-4 text-left transition-all"
            >
              <p style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
                {font.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Style */}
      <div className="mb-12">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-6">
          写真・動画の雰囲気
        </h2>
        <div className="space-y-4">
          {PHOTO_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setPhotoStyle(style.id)}
              style={{
                backgroundColor: photoStyle === style.id ? 'rgba(215, 125, 95, 0.05)' : 'var(--color-base-white)',
                borderColor: photoStyle === style.id ? 'var(--color-accent-primary)' : 'var(--color-bg-warm-gray)',
              }}
              className="w-full rounded-2xl border px-6 py-6 text-left transition-all"
            >
              <p style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
                {style.name}
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-base mt-1">
                {style.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div className="mb-12">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-6">
          文章の雰囲気
        </h2>
        <div className="space-y-4">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setTone(option.id)}
              style={{
                backgroundColor: tone === option.id ? 'rgba(215, 125, 95, 0.05)' : 'var(--color-base-white)',
                borderColor: tone === option.id ? 'var(--color-accent-primary)' : 'var(--color-bg-warm-gray)',
              }}
              className="w-full rounded-2xl border px-6 py-6 text-left transition-all"
            >
              <p style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
                {option.name}
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-base mt-1">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Default CTA */}
      <div className="mb-12">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-semibold mb-6">
          デフォルトCTA
        </h2>
        <div className="space-y-3">
          {CTA_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setCta(option.id)}
              style={{
                backgroundColor: cta === option.id ? 'rgba(215, 125, 95, 0.05)' : 'var(--color-base-white)',
                borderColor: cta === option.id ? 'var(--color-accent-primary)' : 'var(--color-bg-warm-gray)',
              }}
              className="w-full rounded-2xl border px-6 py-4 text-left transition-all"
            >
              <p style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
                {option.text}
              </p>
            </button>
          ))}
        </div>

        {cta === 'custom' && (
          <div className="mt-6">
            <input
              type="text"
              value={customCta}
              onChange={(e) => setCustomCta(e.target.value)}
              placeholder="カスタムCTAを入力"
              style={{
                borderColor: 'var(--color-bg-warm-gray)',
                color: 'var(--color-text-primary)',
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-base"
            />
          </div>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: '#FFEBEE', borderColor: '#EF5350', color: '#C62828' }} className="rounded-lg border px-4 py-3 mb-6 text-base">
          {error}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!colorPalette || !fontChoice || !photoStyle || !tone || loading || (cta === 'custom' && !customCta)}
        style={{
          backgroundColor:
            colorPalette && fontChoice && photoStyle && tone && !loading && !(cta === 'custom' && !customCta)
              ? 'var(--color-accent-primary)'
              : 'var(--color-text-secondary)',
        }}
        className="w-full text-white rounded-lg py-3 px-4 font-semibold text-base hover:opacity-90 disabled:opacity-60 transition"
      >
        {loading ? '保存中...' : '完了'}
      </button>
    </div>
  );
}
