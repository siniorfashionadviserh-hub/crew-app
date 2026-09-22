import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { StrategyGenerationRequest, StrategyResult, OnboardingSession } from '@/lib/types';

const CLAUDE_MODEL = process.env.CLAUDE_API_MODEL || 'claude-3-5-sonnet-20241022';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: StrategyGenerationRequest = await request.json();

    // Get onboarding session for additional context
    const { data: sessionData, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1);

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    const session = sessionData?.[0];
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Call Claude API to generate strategy
    const prompt = buildStrategyPrompt(body, session);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message }, { status: response.status });
    }

    const result = await response.json();
    const content = result.content[0].text;

    // Parse Claude response
    let strategy: StrategyResult;
    try {
      strategy = JSON.parse(content);
    } catch {
      // If parsing fails, return raw response wrapped
      strategy = {
        concept: content,
        targetAudience: '',
        contentPillars: [],
        recommendedPosts: [],
        postingFrequency: '',
        visualDirection: '',
        monetizationCandidates: [],
        kpi: {},
      };
    }

    // Save strategy to database
    const { data: strategyData, error: saveError } = await supabase
      .from('account_strategies')
      .insert([
        {
          account_id: session.account_id,
          concept: strategy.concept,
          target_audience: { ageGroup: body.targetAgeGroup, gender: body.targetGender },
          persona: { ageGroup: body.creatorAgeGroup },
          content_pillars: strategy.contentPillars,
          posting_frequency: strategy.postingFrequency,
          tone_and_manner: {},
          visual_direction: strategy.visualDirection,
          kpi: strategy.kpi,
          monetization_candidates: strategy.monetizationCandidates,
          reference_accounts: [],
          purpose: body.purpose,
          genre: body.genre,
          ai_generated: true,
        },
      ])
      .select();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({
      strategy: strategyData[0],
      display: strategy,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildStrategyPrompt(
  request: StrategyGenerationRequest,
  session: OnboardingSession,
): string {
  return `
あなたは経験豊富なSNS戦略コンサルタントです。

以下の情報をもとに、ユーザーのSNS設計を提案してください。

【ユーザー情報】
- SNS運用目的: ${getPurposeLabel(session.purpose || '')}
- 発信ジャンル: ${getGenreLabel(session.genre || '')}
- 届けたい相手: ${request.targetAgeGroup}代、${request.targetGender}性、「${request.targetPainPoint}」という課題を持つ人
- 発信者の年代: ${request.creatorAgeGroup}代
- 顔出し: ${request.canShowFace ? 'できる' : 'できない'}
- 音声使用: ${request.canUseVoice ? 'できる' : 'できない'}
- 推奨投稿頻度: 週${request.postingFrequency}回

【応答フォーマット】
JSON形式で、以下の構造で返してください：

{
  "concept": "SNS全体のコンセプト（1-2文で、ユーザーの価値観や世界観を表す）",
  "targetAudience": "ターゲット層の詳細説明",
  "contentPillars": ["柱1", "柱2", "柱3"],
  "recommendedPosts": [
    "投稿アイデア1",
    "投稿アイデア2",
    "投稿アイデア3",
    "投稿アイデア4"
  ],
  "postingFrequency": "週${request.postingFrequency}回がおすすめです。理由：...",
  "visualDirection": "写真・動画の雰囲気についての指針",
  "monetizationCandidates": ["収益化方法1", "収益化方法2"],
  "kpi": {
    "初月の目標": "具体的な数値",
    "3ヶ月の目標": "具体的な数値"
  }
}

【重要】
- ユーザーが実行可能で、実際に収益化できるアドバイスをしてください
- 年齢や制約を理由に「難しい」と伝えないでください
- 代わりに「こういう工夫をすればできる」という提案をしてください
- JSON以外の文字列を含めないでください
  `;
}

function getPurposeLabel(purpose: string): string {
  const labels: Record<string, string> = {
    awareness: '認知を広げる',
    followers: 'フォロワーを増やす',
    traffic: 'ブログへアクセスを送る',
    sales: '商品を売る',
    affiliate: 'アフィリエイト',
    influencer: 'インフルエンサーになる',
  };
  return labels[purpose] || '';
}

function getGenreLabel(genre: string): string {
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
  return labels[genre] || '';
}
