'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Error } from '@/app/components/ui/Error';
import type { OnboardingSession, StrategyResult, AccountStrategy } from '@/lib/types';

export default function StrategyPage() {
  const router = useRouter();
  const apiCallRef = useRef(false); // Prevent double API calls
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [strategy, setStrategy] = useState<{ strategy: AccountStrategy; display: StrategyResult } | null>(null);
  const [loading, setLoading] = useState(true); // Start as true (preparing state)
  const [error, setError] = useState('');
  const [debugError, setDebugError] = useState<any>(null);
  const [debugSteps, setDebugSteps] = useState<Record<string, boolean | string | number>>({
    build: '73d341a-auto-v1',
    sessionLoaded: false,
    accountIdAvailable: false,
    autoTriggerReached: false,
    apiCallStarted: false,
    apiCallCount: 0,
    requestStarted: false,
    apiStatus: 'pending',
    strategySaved: false,
    navigationStarted: false,
    failureAt: '',
  });

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase
          .from('onboarding_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .limit(1);

        if (sessionError) {
          console.error('Supabase SELECT onboarding_sessions error:', sessionError);
          setError('セッションの読み込みに失敗しました');
          return;
        }
        const currentSession = sessionData?.[0];
        if (!currentSession) {
          setError('セッションが見つかりません');
          return;
        }

        setSession(currentSession);
        setDebugSteps(prev => ({ ...prev, sessionLoaded: true, accountIdAvailable: !!currentSession?.account_id }));
      } catch (err: any) {
        console.error('Session load error:', err);
        setError('セッションの読み込みに失敗しました');
        setLoading(false);
      }
    };

    loadSession();
  }, [router]);

  // Auto-trigger strategy generation after session loads (prevent double calls with useRef)
  useEffect(() => {
    if (session && !error && !apiCallRef.current) {
      setDebugSteps(prev => ({ ...prev, autoTriggerReached: true }));
      apiCallRef.current = true;
      console.log('📝 Auto-starting strategy generation...');
      generateStrategy();
    }
  }, [session, error]);

  const generateStrategy = async () => {
      try {
        setError('');
        setDebugError(null);
        setLoading(true);
        setDebugSteps(prev => ({ ...prev, requestStarted: true }));
        console.log('🔍 Strategy generation started');

        // Mock mode for frontend testing
        if (process.env.NEXT_PUBLIC_STRATEGY_MOCK_MODE === 'true') {
          console.log('📋 MOCK MODE: Using mock response');
          setDebugSteps(prev => ({ ...prev, apiStatus: 'MOCK 200' }));

          // Simulated mock response
          const mockResult: { strategy: AccountStrategy; display: StrategyResult } = {
            strategy: {
              id: 'mock-id',
              account_id: session?.account_id || 'mock-account',
              concept: '[MOCK] アカウントコンセプト',
              target_audience: {},
              posting_frequency: '',
              tone_and_manner: {},
              kpi: {},
              monetization_candidates: [],
              reference_accounts: [],
              purpose: session?.purpose || 'awareness',
              genre: session?.genre || 'fashion',
              editorial_summary: '[MOCK] モック戦略のサマリー',
              brand_positioning: {
                account_concept: '[MOCK] アカウントコンセプト',
                positioning: '[MOCK] ポジショニング',
                target_problem: '[MOCK] ターゲットの問題',
                value_proposition: '[MOCK] 価値提案',
                differentiation: '[MOCK] 差別化',
                creator_strength: '[MOCK] クリエイターの強み',
              },
              persona_details: {
                persona_name: '[MOCK] ペルソナ',
                age: '50代',
                lifestyle: '[MOCK] ライフスタイル',
                situation: '[MOCK] 状況',
                frustrations: ['[MOCK] 悩み1'],
                desires: ['[MOCK] 欲求1'],
                information_needs: ['[MOCK] 必要情報1'],
                social_media_behavior: '[MOCK] SNS行動',
                follow_reason: '[MOCK] フォロー理由',
              },
              account_naming: {
                account_name_candidates: ['[MOCK] アカウント名1'],
                account_name_rationales: ['[MOCK] 理由1'],
                display_name_candidates: ['[MOCK] 表示名1'],
                username_candidates: ['@mock_account'],
              },
              profile_strategy: {
                profile_bio_candidates: ['[MOCK] プロフィール1'],
                profile_image_direction: '[MOCK] プロフィール画像方向',
                cta: '[MOCK] CTA',
              },
              content_pillars_detailed: [
                {
                  name: '[MOCK] Pillar 1',
                  purpose: '[MOCK] Purpose 1',
                  audience_need: '[MOCK] Need 1',
                  content_examples: ['[MOCK] Example 1'],
                  recommended_format: 'carousel',
                  content_ratio: 33,
                  primary_kpi: 'engagement'
                },
                {
                  name: '[MOCK] Pillar 2',
                  purpose: '[MOCK] Purpose 2',
                  audience_need: '[MOCK] Need 2',
                  content_examples: ['[MOCK] Example 2'],
                  recommended_format: 'reel',
                  content_ratio: 33,
                  primary_kpi: 'reach'
                },
                {
                  name: '[MOCK] Pillar 3',
                  purpose: '[MOCK] Purpose 3',
                  audience_need: '[MOCK] Need 3',
                  content_examples: ['[MOCK] Example 3'],
                  recommended_format: 'single',
                  content_ratio: 34,
                  primary_kpi: 'conversion'
                },
              ],
              visual_identity: {
                visual_keywords: ['[MOCK] keyword1'],
                color_direction: '[MOCK] color',
                photo_direction: '[MOCK] photo',
                reel_direction: '[MOCK] reel',
                carousel_direction: '[MOCK] carousel',
                typography_direction: '[MOCK] typography',
              },
              ai_generated: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            display: {
              concept: '[MOCK] Mock concept',
              targetAudience: '[MOCK] Target',
              contentPillars: ['[MOCK] Pillar 1', '[MOCK] Pillar 2'],
              recommendedPosts: [],
              postingFrequency: '3x/week',
              visualDirection: '[MOCK] Visual',
              monetizationCandidates: [],
              kpi: {},
            },
          };

          setDebugSteps(prev => ({ ...prev, strategySaved: true }));
          setStrategy(mockResult);
          setDebugSteps(prev => ({ ...prev, navigationStarted: true }));

          // Simulate navigation delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          router.push('/onboarding/strategy-result');
          return;
        }

        // Real API call
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Get access token for API authentication
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const accessToken = authSession?.access_token;

        if (!accessToken) {
          setDebugError({
            operation: 'getSession (access token)',
            message: 'Access token not found in session',
          });
          setError('セッション情報が不足しています。再度ログインしてください。');
          return;
        }

        if (!session) {
          setError('セッション情報が読み込まれていません。もう一度試してください。');
          return;
        }

        // Mark API call as started
        setDebugSteps(prev => ({ ...prev, apiCallStarted: true, apiCallCount: 1 }));

        // Call strategy generation API with Authorization header
        const response = await fetch('/api/strategy/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            purpose: session.purpose,
            genre: session.genre,
            targetAgeGroup: session.target_age_group,
            targetGender: session.target_gender,
            targetPainPoint: session.target_pain_point,
            creatorAgeGroup: session.creator_age_group,
            canShowFace: session.can_show_face,
            canUseVoice: session.can_use_voice,
            postingFrequency: session.posting_frequency,
          }),
        });

                if (!response.ok) {
          const errorData = await response.json();
          setDebugSteps(prev => ({ 
            ...prev, 
            apiStatus: `HTTP ${response.status}`, 
            failureAt: 'api_error_response'
          }));
          console.error('API /strategy/generate error:', {
            status: response.status,
            error: errorData,
          });
          setDebugError({
            operation: 'POST /api/strategy/generate',
            httpStatus: response.status,
            message: errorData.error || 'Strategy generation failed',
            allDebug: errorData.debug,
          });
          setError('SNS設計の生成に失敗しました。もう一度試してください。');
          return;
        }

                const result = await response.json();
        setDebugSteps(prev => ({ ...prev, apiStatus: 'OK 200' }));
        setStrategy(result);
        setDebugSteps(prev => ({ ...prev, strategySaved: true }));
        // Strategy 生成成功時、自動的に結果表示ページへリダイレクト
        setDebugSteps(prev => ({ ...prev, navigationStarted: true }));
        // Strategy 生成成功時、自動的に結果表示ページへリダイレクト
        router.push('/onboarding/strategy-result');
      } catch (err: any) {
        console.error('Strategy generation error:', err);
        setDebugError({
          operation: 'Strategy generation (catch block)',
          message: err?.message || 'Unknown error',
        });
        setError('SNS設計の生成に失敗しました。もう一度試してください。');
      } finally {
        setLoading(false);
      }
  };

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

  // Initial loading state (preparing)
  if (loading && !session) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        <p style={{ color: 'var(--color-text-secondary)' }} className="mt-4 text-base">
          準備中...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Error message={error || 'セッションが見つかりません'} />;
  }

  // API error occurred - show error with retry button
  if (error) {
    return (
      <div>
        <Error message={error} />

        {/* Debug Info - Single Display */}
        {debugSteps && (
          <div style={{backgroundColor: '#E3F2FD', border: '1px solid #2196F3', color: '#1565C0', marginTop: '1rem', marginBottom: '1rem', padding: '12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace'}}>
            <div>Request started: {debugSteps.requestStarted ? '✓ YES' : '✗ NO'}</div>
            <div>API status: {debugSteps.apiStatus}</div>
            <div>Strategy saved: {debugSteps.strategySaved ? '✓ YES' : '✗ NO'}</div>
            <div>Navigation started: {debugSteps.navigationStarted ? '✓ YES' : '✗ NO'}</div>
            {debugSteps.failureAt && <div>Failure at: {debugSteps.failureAt}</div>}
          </div>
        )}
        {debugError && (
          <div style={{ backgroundColor: '#FFF3E0', borderColor: '#FF9800', color: '#E65100', marginTop: '1rem' }} className="rounded-lg border px-4 py-3 text-sm overflow-auto max-h-96">
            <p className="font-semibold mb-3">🔍 エラー詳細：</p>

            {/* Basic Error Info */}
            {debugError.operation && <p><strong>処理:</strong> {debugError.operation}</p>}
            {debugError.httpStatus && <p><strong>HTTP Status:</strong> {debugError.httpStatus}</p>}
            {debugError.message && <p><strong>Message:</strong> {debugError.message}</p>}

            {/* Full Debug Info from API */}
            {debugError.allDebug && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTopWidth: '1px', borderTopColor: '#FF9800' }}>
                <p className="font-semibold mb-2">📊 詳細情報（API から）:</p>

                {/* Model Info */}
                {debugError.allDebug.modelUsed && (
                  <p><strong>Model used:</strong> {debugError.allDebug.modelUsed}</p>
                )}

                {/* Failure Stage */}
                {debugError.allDebug.failureStage && (
                  <p><strong>Failure at:</strong> <code>{debugError.allDebug.failureStage}</code></p>
                )}

                {/* Authentication Info */}
                {(debugError.allDebug.sessionExists !== undefined || debugError.allDebug.userExists !== undefined) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p className="font-semibold text-xs mb-1">🔐 認証:</p>
                    {debugError.allDebug.sessionExists !== undefined && (
                      <p className="ml-4">Session exists: {debugError.allDebug.sessionExists ? '✓' : '✗'}</p>
                    )}
                    {debugError.allDebug.userExists !== undefined && (
                      <p className="ml-4">User exists: {debugError.allDebug.userExists ? '✓' : '✗'}</p>
                    )}
                    {debugError.allDebug.hasAuthHeader !== undefined && (
                      <p className="ml-4">Auth header: {debugError.allDebug.hasAuthHeader ? '✓' : '✗'}</p>
                    )}
                  </div>
                )}

                {/* Supabase Error */}
                {debugError.allDebug.supabaseError && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p className="font-semibold text-xs mb-1">🗄️ DB エラー:</p>
                    {debugError.allDebug.supabaseError.message && (
                      <p className="ml-4"><strong>Message:</strong> {debugError.allDebug.supabaseError.message}</p>
                    )}
                    {debugError.allDebug.supabaseError.code && (
                      <p className="ml-4"><strong>Code:</strong> {debugError.allDebug.supabaseError.code}</p>
                    )}
                    {debugError.allDebug.supabaseError.details && (
                      <p className="ml-4"><strong>Details:</strong> {debugError.allDebug.supabaseError.details}</p>
                    )}
                    {debugError.allDebug.supabaseError.hint && (
                      <p className="ml-4"><strong>Hint:</strong> {debugError.allDebug.supabaseError.hint}</p>
                    )}
                  </div>
                )}

                {/* Claude API Response Info */}
                {debugError.allDebug.claudeApiStatus && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p className="font-semibold text-xs mb-1">🤖 Claude API レスポンス:</p>
                    <p className="ml-4"><strong>Status:</strong> {debugError.allDebug.claudeApiStatus}</p>
                    {debugError.allDebug.claudeModel && (
                      <p className="ml-4"><strong>Model:</strong> {debugError.allDebug.claudeModel}</p>
                    )}
                    {debugError.allDebug.claudeStopReason && (
                      <p className="ml-4"><strong>Stop Reason:</strong> {debugError.allDebug.claudeStopReason}</p>
                    )}
                    {debugError.allDebug.contentBlockCount !== undefined && (
                      <p className="ml-4"><strong>Content Blocks:</strong> {debugError.allDebug.contentBlockCount}</p>
                    )}
                    {debugError.allDebug.contentTypes && debugError.allDebug.contentTypes.length > 0 && (
                      <p className="ml-4"><strong>Block Types:</strong> {debugError.allDebug.contentTypes.join(', ')}</p>
                    )}
                    {debugError.allDebug.textBlockCount !== undefined && (
                      <p className="ml-4"><strong>Text Blocks:</strong> {debugError.allDebug.textBlockCount}</p>
                    )}
                    {debugError.allDebug.claudeApiError && (
                      <>
                        {debugError.allDebug.claudeApiError.error && (
                          <p className="ml-4"><strong>Error Type:</strong> {debugError.allDebug.claudeApiError.error.type}</p>
                        )}
                        {debugError.allDebug.claudeApiError.error?.message && (
                          <p className="ml-4"><strong>Message:</strong> {debugError.allDebug.claudeApiError.error.message}</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* JSON Parse/Validation Error */}
                {(debugError.allDebug.parseError || debugError.allDebug.missingFields || debugError.allDebug.contentLength) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p className="font-semibold text-xs mb-1">📋 JSON 解析:</p>
                    {debugError.allDebug.parseError && (
                      <p className="ml-4"><strong>Parse Error:</strong> {debugError.allDebug.parseError}</p>
                    )}
                    {debugError.allDebug.contentLength !== undefined && (
                      <p className="ml-4"><strong>Content Length:</strong> {debugError.allDebug.contentLength} bytes</p>
                    )}
                    {debugError.allDebug.contentPreview && (
                      <p className="ml-4 text-xs whitespace-pre-wrap break-words"><strong>Preview:</strong> {debugError.allDebug.contentPreview.substring(0, 150)}...</p>
                    )}
                    {debugError.allDebug.missingFields && (
                      <div className="ml-4">
                        <p><strong>Validation Failures:</strong></p>
                        {Object.entries(debugError.allDebug.missingFields).map(([field, missing]: [string, any]) => (
                          missing && <p key={field} className="ml-2">- {field}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Retry Button */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={() => {
              apiCallRef.current = false;
              setError('');
              setDebugError(null);
              generateStrategy();
            }}
            style={{
              backgroundColor: 'var(--color-accent-primary)',
            }}
            className="flex-1 text-white rounded-lg py-3 px-4 font-semibold text-base hover:opacity-90 transition"
          >
            もう一度試す
          </button>
        </div>
      </div>
    );
  }

  // Loading state (preparing or generating)
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        <p style={{ color: 'var(--color-text-secondary)' }} className="mt-4 text-base">
          あなたのSNS設計を作成中...
        </p>

        {/* Diagnostic Info - Temporary Debug Display */}
        <div style={{backgroundColor: '#F0F4F8', border: '1px solid #90CAF9', color: '#1565C0', marginTop: '2rem', marginLeft: 'auto', marginRight: 'auto', maxWidth: '400px', padding: '12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', textAlign: 'left'}}>
          <div><strong>Build:</strong> {debugSteps.build}</div>
          <div><strong>Session loaded:</strong> {debugSteps.sessionLoaded ? 'YES' : 'NO'}</div>
          <div><strong>Account ID available:</strong> {debugSteps.accountIdAvailable ? 'YES' : 'NO'}</div>
          <div><strong>Auto trigger reached:</strong> {debugSteps.autoTriggerReached ? 'YES' : 'NO'}</div>
          <div><strong>API call started:</strong> {debugSteps.apiCallStarted ? 'YES' : 'NO'}</div>
          <div><strong>API call count:</strong> {debugSteps.apiCallCount}/1</div>
        </div>
      </div>
    );
  }

  // API completed but no strategy found
  if (!strategy) {
    return <Error message="SNS設計の取得に失敗しました。もう一度お試しください。" />;
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
