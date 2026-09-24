import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { StrategyGenerationRequest, StrategyResult, OnboardingSession } from '@/lib/types';

const CLAUDE_MODEL = process.env.CLAUDE_API_MODEL || 'claude-sonnet-5';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;


// JSON Schema for Structured Outputs (Phase 2.1 Strategy)
const STRATEGY_JSON_SCHEMA = {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "editorialSummary": {
      "type": "string"
    },
    "brandPositioning": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "account_concept": {
          "type": "string"
        },
        "positioning": {
          "type": "string"
        },
        "target_problem": {
          "type": "string"
        },
        "value_proposition": {
          "type": "string"
        },
        "differentiation": {
          "type": "string"
        },
        "creator_strength": {
          "type": "string"
        }
      },
      "required": [
        "account_concept",
        "positioning",
        "target_problem",
        "value_proposition",
        "differentiation",
        "creator_strength"
      ]
    },
    "personaDetails": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "persona_name": {
          "type": "string"
        },
        "age": {
          "type": "string"
        },
        "lifestyle": {
          "type": "string"
        },
        "situation": {
          "type": "string"
        },
        "frustrations": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "desires": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "information_needs": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "social_media_behavior": {
          "type": "string"
        },
        "follow_reason": {
          "type": "string"
        }
      },
      "required": [
        "persona_name",
        "age",
        "lifestyle",
        "situation",
        "frustrations",
        "desires",
        "information_needs",
        "social_media_behavior",
        "follow_reason"
      ]
    },
    "accountNaming": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "account_name_candidates": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "account_name_rationales": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "display_name_candidates": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "username_candidates": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "account_name_candidates",
        "account_name_rationales",
        "display_name_candidates",
        "username_candidates"
      ]
    },
    "profileStrategy": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "profile_bio_candidates": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "profile_image_direction": {
          "type": "string"
        },
        "cta": {
          "type": "string"
        }
      },
      "required": [
        "profile_bio_candidates",
        "profile_image_direction",
        "cta"
      ]
    },
    "contentPillarsDetailed": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          },
          "purpose": {
            "type": "string"
          },
          "audience_need": {
            "type": "string"
          },
          "content_examples": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "recommended_format": {
            "type": "string",
            "enum": [
              "reel",
              "carousel",
              "single"
            ]
          },
          "content_ratio": {
            "type": "number"
          },
          "primary_kpi": {
            "type": "string"
          }
        },
        "required": [
          "name",
          "purpose",
          "audience_need",
          "content_examples",
          "recommended_format",
          "content_ratio",
          "primary_kpi"
        ]
      }
    },
    "visualIdentity": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "visual_keywords": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "color_direction": {
          "type": "string"
        },
        "photo_direction": {
          "type": "string"
        },
        "reel_direction": {
          "type": "string"
        },
        "carousel_direction": {
          "type": "string"
        },
        "typography_direction": {
          "type": "string"
        }
      },
      "required": [
        "visual_keywords",
        "color_direction",
        "photo_direction",
        "reel_direction",
        "carousel_direction",
        "typography_direction"
      ]
    }
  },
  "required": [
    "editorialSummary",
    "brandPositioning",
    "personaDetails",
    "accountNaming",
    "profileStrategy",
    "contentPillarsDetailed",
    "visualIdentity"
  ]
};


export async function POST(request: NextRequest) {
  try {
    // Debug: Check session and token status
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debugInfo: Record<string, any> = {
      hasAuthHeader: !!authHeader,
      hasCookie: !!cookieHeader,
      sessionExists: false,
      userExists: false,
      failureStage: 'initial',
    };

    console.log('🔍 Strategy API Auth Debug:', {
      hasAuthHeader: debugInfo.hasAuthHeader,
      hasCookie: debugInfo.hasCookie,
      timestamp: new Date().toISOString(),
    });

    // Extract access token from Authorization header
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      debugInfo.failureStage = 'No Authorization header with Bearer token';
      console.error('❌ Auth failed:', debugInfo);
      return NextResponse.json({
        error: 'Unauthorized',
        debug: debugInfo,
      }, { status: 401 });
    }

    // Verify token using Supabase admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    debugInfo.sessionExists = !!token;

    if (authError || !user) {
      debugInfo.failureStage = authError ? `Token verification failed: ${authError.message}` : 'auth.getUser(token) returned null';
      console.error('❌ Auth failed:', debugInfo);
      return NextResponse.json({
        error: 'Unauthorized',
        debug: debugInfo,
      }, { status: 401 });
    }

    debugInfo.userExists = true;

    // Create authenticated Supabase client with the user's token
    // This ensures RLS policies are evaluated with the authenticated user's context
    const supabaseAuth = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const body: StrategyGenerationRequest = await request.json();

    debugInfo.failureStage = 'onboarding_sessions_query';

    // ✅ 2. Get onboarding session for additional context (use authenticated user context for RLS)
    const { data: sessionData, error: sessionError } = await supabaseAuth
      .from('onboarding_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1);

    if (sessionError) {
      debugInfo.failureStage = 'SELECT onboarding_sessions';
      console.error('❌ Session query failed:', { debugInfo, sessionError });
      return NextResponse.json({
        error: sessionError.message,
        debug: { ...debugInfo, supabaseError: sessionError },
      }, { status: 500 });
    }

    const session = sessionData?.[0];
    if (!session) {
      debugInfo.failureStage = 'Session not found after query';
      return NextResponse.json({
        error: 'Session not found',
        debug: debugInfo,
      }, { status: 404 });
    }

    debugInfo.failureStage = 'claude_api_request';
    debugInfo.modelUsed = CLAUDE_MODEL;

    // ✅ 4. Call Claude API to generate strategy
    const prompt = buildStrategyPrompt(body, session);

    console.log('🔍 Calling Claude API with model:', CLAUDE_MODEL);

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 6000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        output_config: {
          format: {
            type: "json_schema",
            schema: STRATEGY_JSON_SCHEMA
          }
        }
      }),
    });

    debugInfo.failureStage = 'claude_api_response';

    if (!claudeResponse.ok) {
      const claudeError = await claudeResponse.json();
      console.error('❌ Claude API error:', {
        status: claudeResponse.status,
        error: claudeError,
      });
      return NextResponse.json({
        error: 'Claude API request failed',
        debug: {
          ...debugInfo,
          claudeApiStatus: claudeResponse.status,
          claudeApiError: claudeError,
        },
      }, { status: claudeResponse.status });
    }

    debugInfo.failureStage = 'claude_response_parse';

    const claudeResult = await claudeResponse.json();

    // Debug: Log response structure
    console.log('🔍 Claude response structure:', {
      status: claudeResponse.status,
      model: claudeResult.model,
      stop_reason: claudeResult.stop_reason,
      contentBlockCount: claudeResult.content?.length || 0,
      contentTypes: (claudeResult.content as Array<{ type: string }>)?.map((block: { type: string }) => block.type) || [],
    });

    // ✅ Check if response was truncated by max_tokens limit
    if (claudeResult.stop_reason === 'max_tokens') {
      console.error('❌ Claude response truncated by max_tokens limit:', {
        model: claudeResult.model,
        stop_reason: claudeResult.stop_reason,
        output_tokens: claudeResult.usage?.output_tokens,
      });
      debugInfo.failureStage = 'strategy_generation_truncated';
      return NextResponse.json({
        error: 'Strategy generation truncated',
        debug: {
          ...debugInfo,
          claudeApiStatus: claudeResponse.status,
          claudeModel: claudeResult.model,
          claudeStopReason: claudeResult.stop_reason,
          outputTokens: claudeResult.usage?.output_tokens,
          failureReason: 'Response exceeded max_tokens limit - output was incomplete',
        },
      }, { status: 400 });
    }

    // ✅ Safely extract text content from response blocks
    if (!claudeResult.content || !Array.isArray(claudeResult.content)) {
      console.error('❌ Claude response missing content array:', claudeResult);
      return NextResponse.json({
        error: 'Claude API response missing content',
        debug: {
          ...debugInfo,
          claudeApiStatus: claudeResponse.status,
          claudeModel: claudeResult.model,
          claudeStopReason: claudeResult.stop_reason,
          contentBlockCount: claudeResult.content?.length || 0,
          contentTypes: (claudeResult.content as Array<{ type: string }>)?.map((block: { type: string }) => block.type) || [],
          textBlockExists: false,
        },
      }, { status: 400 });
    }

    // Extract all text blocks (Sonnet 5 may include thinking blocks)
    interface ContentBlock {
      type: string;
      text?: string;
    }
    const contentBlocks = claudeResult.content as ContentBlock[];
    const textBlocks = contentBlocks
      .filter((block: ContentBlock) => block.type === 'text')
      .map((block: ContentBlock) => block.text || '');

    if (textBlocks.length === 0) {
      console.error('❌ No text blocks found in Claude response:', {
        contentTypes: contentBlocks.map((block: ContentBlock) => block.type),
      });
      return NextResponse.json({
        error: 'Claude API response missing text content',
        debug: {
          ...debugInfo,
          claudeApiStatus: claudeResponse.status,
          claudeModel: claudeResult.model,
          claudeStopReason: claudeResult.stop_reason,
          contentBlockCount: contentBlocks.length,
          contentTypes: contentBlocks.map((block: ContentBlock) => block.type),
          textBlockExists: false,
        },
      }, { status: 400 });
    }

    // Combine multiple text blocks if needed
    let content = textBlocks.join('\n');

    // Add response info to debug
    debugInfo.claudeApiStatus = claudeResponse.status;
    debugInfo.claudeModel = claudeResult.model;
    debugInfo.claudeStopReason = claudeResult.stop_reason;
    debugInfo.contentBlockCount = contentBlocks.length;
    debugInfo.contentTypes = contentBlocks.map((block: ContentBlock) => block.type);
    debugInfo.textBlockCount = textBlocks.length;

    debugInfo.failureStage = 'json_parse';

    // ✅ 6. Remove Markdown code fence if present
    // Handle both: ```json ... ``` and ``` ... ```
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    content = content.trim();

    console.log('📝 Content after fence removal (first 200 chars):', content.substring(0, 200));

    // ✅ Parse Claude response
    let strategy: StrategyResult;
    let parseErrorMsg = '';
    try {
      strategy = JSON.parse(content);
      console.log('✅ Strategy JSON parsed successfully');
      console.log('📋 Claude Response Keys:', Object.keys(strategy));
      console.log('🔍 brandPositioning exists:', !!strategy.brandPositioning);
      if (strategy.brandPositioning) {
        console.log('   - brandPositioning keys:', Object.keys(strategy.brandPositioning));
        console.log('   - account_concept:', strategy.brandPositioning.account_concept?.substring(0, 50));
      }
    } catch (e: unknown) {
      const parseErr = e instanceof Error ? e : new Error(String(e));
      parseErrorMsg = parseErr.message;
      console.error('❌ JSON parse failed:', parseErr.message);
      console.error('Content preview (first 500 chars):', content.substring(0, 500));
      return NextResponse.json({
        error: 'Failed to parse Claude API response as JSON',
        debug: {
          ...debugInfo,
          parseError: parseErr.message,
          contentLength: content.length,
          contentPreview: content.substring(0, 200),
        },
      }, { status: 400 });
    }

    debugInfo.failureStage = 'json_validation';

    // ✅ 7. Validate strategy schema (Phase 2.1: Core Strategy fields only)
    const validationErrors: Record<string, boolean> = {
      editorialSummary: !strategy.editorialSummary,
      brandPositioning: !strategy.brandPositioning,
      personaDetails: !strategy.personaDetails,
      accountNaming: !strategy.accountNaming,
      profileStrategy: !strategy.profileStrategy,
      contentPillarsDetailed: !strategy.contentPillarsDetailed || !Array.isArray(strategy.contentPillarsDetailed),
      visualIdentity: !strategy.visualIdentity,
    };

    const hasErrors = Object.values(validationErrors).some(err => err);

    if (hasErrors) {
      console.error('❌ Strategy validation failed:', validationErrors);
      return NextResponse.json({
        error: 'Strategy validation failed',
        debug: {
          ...debugInfo,
          parseError: parseErrorMsg,
          missingFields: validationErrors,
          
        },
      }, { status: 400 });
    }

    // ✅ Normalize content_pillars_detailed ratios to sum to 100%
    debugInfo.failureStage = 'content_ratio_normalization';
    if (Array.isArray(strategy.contentPillarsDetailed) && strategy.contentPillarsDetailed.length > 0) {
      const totalRatio = strategy.contentPillarsDetailed.reduce((sum: number, pillar: any) => sum + (pillar.content_ratio || 0), 0);
      if (totalRatio > 0 && totalRatio !== 100) {
        console.log(`📊 Normalizing content ratios from ${totalRatio}% to 100%`);
        strategy.contentPillarsDetailed = strategy.contentPillarsDetailed.map((pillar: any) => ({
          ...pillar,
          content_ratio: Math.round((pillar.content_ratio || 0) / totalRatio * 100 * 10) / 10,
        }));
        // Adjust final pillar to ensure sum is exactly 100%
        const newTotal = strategy.contentPillarsDetailed.reduce((sum: number, p: any) => sum + (p.content_ratio || 0), 0);
        if (newTotal !== 100 && strategy.contentPillarsDetailed.length > 0) {
          strategy.contentPillarsDetailed[strategy.contentPillarsDetailed.length - 1].content_ratio =
            100 - (newTotal - (strategy.contentPillarsDetailed[strategy.contentPillarsDetailed.length - 1].content_ratio || 0));
        }
      }
    }

    debugInfo.failureStage = 'db_mapping_validation';

    // ✅ 8. Validate DB mapping before UPSERT (Single Source of Truth: Phase 2.1 Schema)
    // Null check for required Phase 2.1 fields before mapping
    if (!strategy.brandPositioning || !strategy.contentPillarsDetailed || !strategy.visualIdentity) {
      return NextResponse.json({
        error: 'DB_MAPPING_ERROR: missing required Phase 2.1 fields',
        debug: {
          ...debugInfo,
          failureStage: 'db_mapping_validation',
          hasbrandPositioning: !!strategy.brandPositioning,
          hascontentPillarsDetailed: !!strategy.contentPillarsDetailed,
          hasvisualIdentity: !!strategy.visualIdentity,
        },
      }, { status: 400 });
    }

    // Extract Phase 1 fields from Phase 2.1 schema for backward compatibility
    const dbMappingValidation = {
      concept: strategy.brandPositioning.account_concept, // Required: NOT NULL in DB
      content_pillars: strategy.contentPillarsDetailed.map(p => p.name),
      posting_frequency: strategy.contentPillarsDetailed
        .reduce((acc, p) => acc + (p.content_ratio || 0) + '% ' + p.name + ' | ', '')
        .slice(0, -3), // Remove trailing ' | '
      visual_direction: strategy.visualIdentity.color_direction + ' + ' + strategy.visualIdentity.photo_direction,
      monetization_candidates: [], // Not in Phase 2.1 schema
    };

    console.log('🗺️ DB Mapping Validation Result:');
    console.log('   concept:', dbMappingValidation.concept?.substring(0, 50) || 'NULL');
    console.log('   content_pillars:', dbMappingValidation.content_pillars);
    console.log('   posting_frequency:', dbMappingValidation.posting_frequency);

    if (!dbMappingValidation.concept) {
      console.error('❌ concept is NULL after mapping');
      return NextResponse.json({
        error: 'DB_MAPPING_ERROR: concept is missing',
        debug: {
          ...debugInfo,
          failureStage: 'db_mapping_validation',
          mappingValidation: dbMappingValidation,
          brandPositioningValue: strategy.brandPositioning,
        },
      }, { status: 400 });
    }

    debugInfo.failureStage = 'account_strategies_upsert';

    // ✅ 9. Save strategy to database with UPSERT (insert or update)
    // If strategy exists for this account, update it; otherwise insert new one
    // The account_id UNIQUE constraint is preserved - this is safe upsert
    // Includes Phase 2.1 extended fields (brand positioning, persona, naming, etc.)
    const upsertPayload = {
      account_id: session.account_id,
      // Phase 2.1 fields (Core Strategy - Structured Output)
      editorial_summary: strategy.editorialSummary,
      brand_positioning: strategy.brandPositioning,
      persona_details: strategy.personaDetails,
      account_naming: strategy.accountNaming,
      profile_strategy: strategy.profileStrategy,
      content_pillars_detailed: strategy.contentPillarsDetailed,
      visual_identity: strategy.visualIdentity,
      // Phase 1 compatibility fields (DB mapping from Phase 2.1 schema)
      concept: dbMappingValidation.concept,
      content_pillars: dbMappingValidation.content_pillars,
      target_audience: { ageGroup: body.targetAgeGroup, gender: body.targetGender },
      persona: { ageGroup: body.creatorAgeGroup },
      posting_frequency: dbMappingValidation.posting_frequency,
      tone_and_manner: {},
      visual_direction: dbMappingValidation.visual_direction,
      kpi: {},
      monetization_candidates: dbMappingValidation.monetization_candidates,
      reference_accounts: [],
      purpose: body.purpose,
      genre: body.genre,
      ai_generated: true,
      seed_ideas: strategy.seedIdeas || null,
    };

    console.log('💾 UPSERT Payload - Critical Fields:');
    console.log('   concept:', upsertPayload.concept?.substring(0, 50) || 'NULL');
    console.log('   content_pillars:', upsertPayload.content_pillars);
    console.log('   content_pillars_detailed (count):', upsertPayload.content_pillars_detailed?.length);

    const { data: strategyData, error: saveError } = await supabaseAuth
      .from('account_strategies')
      .upsert([upsertPayload], { onConflict: 'account_id' })
      .select();

    if (saveError) {
      console.error('❌ Database save error:', saveError);
      console.error('   concept in payload:', upsertPayload.concept);
      return NextResponse.json({
        error: 'Failed to save strategy',
        debug: {
          ...debugInfo,
          supabaseError: {
            message: saveError.message,
            code: saveError.code,
            details: saveError.details,
            hint: saveError.hint,
          },
        },
      }, { status: 500 });
    }

    debugInfo.failureStage = 'success';

    // ✅ 9. Return API response
    return NextResponse.json({
      strategy: strategyData[0],
      display: strategy,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('❌ Catch-all error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      debug: {
        failureStage: 'catch_block',
        message: error.message,
      },
    }, { status: 500 });
  }
}

function buildStrategyPrompt(
  request: StrategyGenerationRequest,
  session: OnboardingSession,
): string {
  return `
あなたはSNS戦略コンサルタントです。ユーザーのための実行可能なSNS設計を作成してください。

【ユーザー情報】
目的: ${getPurposeLabel(session.purpose || '')}
ジャンル: ${getGenreLabel(session.genre || '')}
ターゲット: ${request.targetAgeGroup}代、${request.targetGender}性、「${request.targetPainPoint}」を解決したい人
発信者年代: ${request.creatorAgeGroup}代
顔出し: ${request.canShowFace ? 'できる' : 'できない'}
音声: ${request.canUseVoice ? 'できる' : 'できない'}
投稿頻度: 週${request.postingFrequency}回

【応答指示】
JSON形式のみで返してください。各フィールドは簡潔に（1文〜短段落）。説明文は50-100字程度に制限してください。

{
  "editorialSummary": "戦略全体の要点（100字以内）",

  "concept": "SNSコンセプト（1-2文）",
  "targetAudience": "ターゲット説明（50字以内）",
  "postingFrequency": "週${request.postingFrequency}回推奨の理由（50字以内）",
  "visualDirection": "ビジュアル方針（50字以内）",
  "monetizationCandidates": ["方法1", "方法2"],
  "kpi": {"初月": "数値目標", "3ヶ月": "数値目標"},

  "brandPositioning": {
    "account_concept": "短いコンセプト",
    "positioning": "位置付け（30字以内）",
    "target_problem": "課題（30字以内）",
    "value_proposition": "提供価値（30字以内）",
    "differentiation": "差別化点（30字以内）",
    "creator_strength": "強み（30字以内）"
  },

  "personaDetails": {
    "persona_name": "具体的な名前",
    "age": "年代・人生段階",
    "lifestyle": "生活習慣（30字以内）",
    "situation": "現況（30字以内）",
    "frustrations": ["課題1", "課題2"],
    "desires": ["欲望1", "欲望2"],
    "information_needs": ["情報1", "情報2"],
    "social_media_behavior": "SNS利用法（30字以内）",
    "follow_reason": "フォロー理由（30字以内）"
  },

  "accountNaming": {
    "account_name_candidates": ["候補1", "候補2", "候補3"],
    "account_name_rationales": ["理由1", "理由2", "理由3"],
    "display_name_candidates": ["表示名1", "表示名2"],
    "username_candidates": ["username1", "username2"]
  },

  "profileStrategy": {
    "profile_bio_candidates": ["自己紹介1", "自己紹介2"],
    "profile_image_direction": "画像方針（30字以内）",
    "cta": "CTA（20字以内）"
  },

  "contentPillarsDetailed": [
    {
      "name": "ピラー名",
      "purpose": "目的（20字以内）",
      "audience_need": "ニーズ（20字以内）",
      "content_examples": ["例1", "例2"],
      "recommended_format": "reel/carousel/single",
      "content_ratio": 30,
      "primary_kpi": "KPI名"
    }
  ],

  "注記": "content_ratio の合計は必ず100になるよう設定してください",

  "visualIdentity": {
    "visual_keywords": ["キーワード1", "キーワード2"],
    "color_direction": "色方針（30字以内）",
    "photo_direction": "写真方針（30字以内）",
    "reel_direction": "Reel方針（30字以内）",
    "carousel_direction": "カルーセル方針（30字以内）",
    "typography_direction": "フォント方針（30字以内）"
  },



  "accountNamingRecommended": {
    "account_name": "おすすめ案（5案の中から1つ選択）",
    "reason": "理由（30字以内）"
  },

  "contentPillars": ["ピラー1", "ピラー2"],
  "recommendedPosts": ["投稿案1", "投稿案2"]
}

【必須】
- contentPillarsDetailed: 3個以上5個以下
- seedIdeas: 正確に12個（最初の30日間、Day 1からDay 12）
- JSONのみ返す。説明・Markdown不可
- 文字数制限を守る
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
