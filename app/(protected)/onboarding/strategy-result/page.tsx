'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AccountStrategy } from '@/lib/types';

type Section = 'brand' | 'persona' | 'profile' | 'content' | 'visual' | 'seeds';

export default function StrategyResultPage() {
  const router = useRouter();
  const [strategy, setStrategy] = useState<AccountStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('brand');

  useEffect(() => {
    (async () => {
      try {
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          router.push('/login');
          return;
        }

        // Get account for current user
        const { data: accounts, error: accountError } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', sessionData.session.user.id)
          .single();

        if (accountError || !accounts) {
          router.push('/onboarding/confirm');
          return;
        }

        // Get latest strategy for this account
        const { data: strategyData, error: strategyError } = await supabase
          .from('account_strategies')
          .select('*')
          .eq('account_id', accounts.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (strategyError || !strategyData) {
          router.push('/onboarding/strategy');
          return;
        }

        setStrategy(strategyData as AccountStrategy);
      } catch (err) {
        console.error('Failed to load strategy:', err);
        router.push('/onboarding/strategy');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">戦略が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ========== 編集サマリー ========== */}
        {strategy.editorial_summary && (
          <section className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              SNS 戦略設計
            </h1>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {strategy.editorial_summary}
              </p>
            </div>
          </section>
        )}

        {/* ========== タブナビゲーション ========== */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'brand' as Section, label: 'ブランド' },
            { id: 'persona' as Section, label: 'ペルソナ' },
            { id: 'profile' as Section, label: 'プロフィール' },
            { id: 'content' as Section, label: 'コンテンツ' },
            { id: 'visual' as Section, label: 'ビジュアル' },
            { id: 'seeds' as Section, label: '30日プラン' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeSection === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========== ブランド・ポジショニング ========== */}
        {activeSection === 'brand' && strategy.brand_positioning && (
          <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              ブランド・ポジショニング
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  アカウントコンセプト
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.brand_positioning.account_concept}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  ポジショニング
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.brand_positioning.positioning}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  ターゲットの課題
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.brand_positioning.target_problem}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  価値提供
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.brand_positioning.value_proposition}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800 md:col-span-2">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  差別化要素
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.brand_positioning.differentiation}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800 md:col-span-2">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  クリエイターの強み
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.brand_positioning.creator_strength}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========== ペルソナ ========== */}
        {activeSection === 'persona' && strategy.persona_details && (
          <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              ターゲットペルソナ
            </h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-8 border border-purple-200 dark:border-purple-800">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {strategy.persona_details.persona_name}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">年齢</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {strategy.persona_details.age}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">ライフスタイル</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {strategy.persona_details.lifestyle}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">状況</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {strategy.persona_details.situation}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">悩み・課題</h4>
                <ul className="space-y-2">
                  {strategy.persona_details.frustrations.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-500 mr-3 font-bold">×</span>
                      <span className="text-slate-700 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">欲求・目標</h4>
                <ul className="space-y-2">
                  {strategy.persona_details.desires.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-500 mr-3 font-bold">✓</span>
                      <span className="text-slate-700 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">情報ニーズ</h4>
                <ul className="space-y-2">
                  {strategy.persona_details.information_needs.map((item, i) => (
                    <li key={i} className="text-slate-700 dark:text-slate-300">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  SNS利用の特性
                </h4>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  {strategy.persona_details.social_media_behavior}
                </p>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  アカウント登録理由
                </h4>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.persona_details.follow_reason}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========== プロフィール戦略 ========== */}
        {activeSection === 'profile' && strategy.profile_strategy && (
          <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              プロフィール戦略
            </h2>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                プロフィール自己紹介 候補
              </h3>
              <div className="space-y-4">
                {strategy.profile_strategy.profile_bio_candidates.map((bio, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded p-4 border-l-4 border-blue-500"
                  >
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">案{i + 1}</p>
                    <p className="text-slate-700 dark:text-slate-300">{bio}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  プロフィール画像の方向性
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.profile_strategy.profile_image_direction}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  CTA（行動喚起）
                </h3>
                <p className="text-slate-700 dark:text-slate-300">{strategy.profile_strategy.cta}</p>
              </div>
            </div>
          </section>
        )}

            {/* ========== アカウント命名 ========== */}
            {strategy.account_naming && (
              <div className="space-y-6 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-4">
                  アカウント名・ユーザー名
                </h3>

                {/* Account Names */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4">アカウント名 候補</h4>
                  <div className="space-y-3">
                    {strategy.account_naming?.account_name_candidates?.map((name, i) => (
                      <div key={i} className="bg-white dark:bg-slate-800 rounded p-4 border-l-4 border-blue-500">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
                          {i === 0 && <span className="bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100 text-xs font-bold px-2 py-1 rounded">CREWおすすめ</span>}
                        </div>
                        {strategy.account_naming?.account_name_rationales?.[i] && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">{strategy.account_naming?.account_name_rationales[i]}</p>
                        )}
                        {i === 0 && (
                          <button className="mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
                            これにする
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Names */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">表示名 候補</h4>
                  <div className="space-y-2">
                    {strategy.account_naming?.display_name_candidates?.map((name, i) => (
                      <p key={i} className="text-slate-700 dark:text-slate-300 text-sm">• {name}</p>
                    ))}
                  </div>
                </div>

                {/* Usernames */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">ユーザー名 候補</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">※ 利用可能性を保証しない候補です。実際に利用する際は各プラットフォームで確認してください。</p>
                  <div className="space-y-2">
                    {strategy.account_naming?.username_candidates?.map((username, i) => (
                      <p key={i} className="text-slate-700 dark:text-slate-300 text-sm font-mono">@{username}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

        {/* ========== コンテンツ柱 ========== */}
        {activeSection === 'content' && strategy.content_pillars_detailed && (
          <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              コンテンツ柱（詳細）
            </h2>
            <div className="space-y-6">
              {strategy.content_pillars_detailed.map((pillar, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {pillar.name}
                    </h3>
                    <span className="bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 text-xs font-semibold px-3 py-1 rounded-full">
                      {Math.round((pillar.content_ratio || 0) * 100)}%
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        目的
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">{pillar.purpose}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        ユーザーニーズ
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">{pillar.audience_need}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">
                      コンテンツ例
                    </p>
                    <ul className="space-y-1">
                      {pillar.content_examples.map((example, j) => (
                        <li key={j} className="text-sm text-slate-700 dark:text-slate-300">
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded p-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        推奨フォーマット
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white font-semibold">
                        {pillar.recommended_format}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded p-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        主要KPI
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white font-semibold">
                        {pillar.primary_kpi}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========== ビジュアル・アイデンティティ ========== */}
        {activeSection === 'visual' && strategy.visual_identity && (
          <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              ビジュアル・アイデンティティ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* キーワード */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  ビジュアルキーワード
                </h3>
                <div className="flex flex-wrap gap-2">
                  {strategy.visual_identity.visual_keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* カラー */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  カラー方向性
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.visual_identity.color_direction}
                </p>
              </div>

              {/* 写真 */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  写真の方向性
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.visual_identity.photo_direction}
                </p>
              </div>

              {/* リール */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  リール動画の方向性
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.visual_identity.reel_direction}
                </p>
              </div>

              {/* カルーセル */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  カルーセル投稿の方向性
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.visual_identity.carousel_direction}
                </p>
              </div>

              {/* タイポグラフィ */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  タイポグラフィ
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {strategy.visual_identity.typography_direction}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========== 30日シードアイデア ========== */}
        {activeSection === 'seeds' && strategy.seed_ideas && (
          <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              30日 シードコンテンツプラン
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              最初の4週間（30日）で投稿する12のコンテンツアイデア
            </p>

            {[1, 2, 3, 4].map((week) => {
              const startIdx = (week - 1) * 3;
              const endIdx = Math.min(week * 3, strategy.seed_ideas!.length);
              const weekIdeas = strategy.seed_ideas!.slice(startIdx, endIdx);
              
              return (
                <div key={week} className="border-l-4 border-orange-500 pl-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                    WEEK {week}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {weekIdeas.map((idea, localIdx) => {
                      const globalIdx = startIdx + localIdx;
                      const dayOfWeek = idea.day_of_week || ['月', '水', '金'][localIdx % 3];
                      
                      return (
                        <div
                          key={globalIdx}
                          className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">
                                投稿予定：{dayOfWeek}曜日
                              </p>
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                {idea.title}
                              </h4>
                            </div>
                            <span className="bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
                              {idea.recommended_format}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                目的
                              </p>
                              <p className="text-slate-700 dark:text-slate-300">
                                {idea.objective}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                コンテンツ柱
                              </p>
                              <p className="text-slate-700 dark:text-slate-300">
                                {idea.content_pillar}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                ユーザーニーズ
                              </p>
                              <p className="text-slate-700 dark:text-slate-300">
                                {idea.audience_need}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ========== アクション ========== */}
        <div className="flex gap-4 py-8 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            ダッシュボードへ
          </button>
          <button
            onClick={() => router.push('/onboarding/strategy')}
            className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            戦略を再編集
          </button>
        </div>
      </div>
    </div>
  );
}
