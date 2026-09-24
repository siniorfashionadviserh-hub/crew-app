import Anthropic from '@anthropic-ai/sdk';

// Claude クライアント初期化
const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// 修正5: モデル名と料金を環境変数から管理
const MODEL = process.env.CLAUDE_API_MODEL || 'claude-sonnet-5';

interface ClaudeApiResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

// 料金計算（修正5: 動的管理）
function calculateCost(inputTokens: number, outputTokens: number): number {
  try {
    const pricingConfig = JSON.parse(process.env.AI_PRICING_CONFIG || '{}');
    const modelPricing = pricingConfig[MODEL];

    if (!modelPricing) {
      console.warn(`No pricing config found for model ${MODEL}`);
      return 0;
    }

    const inputCost = (inputTokens * modelPricing.input) / 1000000;
    const outputCost = (outputTokens * modelPricing.output) / 1000000;
    return inputCost + outputCost;
  } catch (error) {
    console.error('Failed to parse AI_PRICING_CONFIG:', error);
    return 0;
  }
}

// Account Strategy 生成
export async function generateAccountStrategy(prompt: string): Promise<ClaudeApiResponse> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const cost = calculateCost(inputTokens, outputTokens);

    return {
      content,
      inputTokens,
      outputTokens,
      cost,
    };
  } catch (error) {
    throw new Error(`Claude API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 企画 3 案生成
export async function generateIdeas(prompt: string): Promise<ClaudeApiResponse> {
  return generateAccountStrategy(prompt); // 同じロジック
}

// Shooting Guide 生成
export async function generateShootingGuide(prompt: string): Promise<ClaudeApiResponse> {
  return generateAccountStrategy(prompt); // 同じロジック
}