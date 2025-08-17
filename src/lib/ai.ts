import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

// AI 프롬프트 템플릿
const PROMPTS = {
  COPY_GENERATION: `You are a referral copywriter.
Business: {business}
Offer: {offer}
Audience: {audience}
Channel: {channel}
Tone: {tone}
Language: {language}
Length: {length}
Constraints: avoid spam words, include CTA and {friend_name} token.
Return 3 variants with short hashtag suggestions if channel supports.`,

  REWARD_SUGGESTION: `You are a growth analyst.
Data summary: {data_summary}
Goal: maximize conversions within budget {budget}.
Propose 2-3 incentive mixes (cash vs credit vs free trial) with expected relative uplift and reasoning, concise and actionable.`,

  MODERATION: `Please review this content for inappropriate or spam-like content. Return only "APPROVED" or "REJECTED" with a brief reason.`
};

// AI 감사 로그 기록
async function logAIAudit(
  orgId: string,
  kind: 'copy' | 'reward_suggest' | 'moderation' | 'optimization',
  inputSummary: string,
  outputSummary: string,
  model: string,
  promptId: string,
  tokensUsed?: number,
  cost?: number
) {
  try {
    await supabase.from('ai_audit').insert({
      org_id: orgId,
      kind,
      input_summary: inputSummary,
      output_summary: outputSummary,
      model,
      prompt_id: promptId,
      tokens_used: tokensUsed,
      cost,
    });
  } catch (error) {
    console.error('Failed to log AI audit:', error);
  }
}

// 추천 카피 생성
export async function generateReferralCopy(params: {
  orgId: string;
  business: string;
  offer: string;
  audience: string;
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'Instagram Stories';
  tone: '친근함' | '전문적' | '신뢰 중심';
  language: 'ko' | 'en';
  length: '짧게' | '중간' | '길게';
}) {
  try {
    const prompt = PROMPTS.COPY_GENERATION
      .replace('{business}', params.business)
      .replace('{offer}', params.offer)
      .replace('{audience}', params.audience)
      .replace('{channel}', params.channel)
      .replace('{tone}', params.tone)
      .replace('{language}', params.language)
      .replace('{length}', params.length);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional referral copywriter. Generate engaging, conversion-focused copy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // 감사 로그 기록
    await logAIAudit(
      params.orgId,
      'copy',
      `Business: ${params.business}, Channel: ${params.channel}`,
      response.substring(0, 200) + '...',
      'gpt-4',
      'copy_generation',
      completion.usage?.total_tokens,
      completion.usage?.total_tokens ? completion.usage.total_tokens * 0.00003 : undefined
    );

    // 응답 파싱 (3개 변형안 추출)
    const variants = response.split('\n\n').filter(v => v.trim()).slice(0, 3);
    
    return {
      success: true,
      variants: variants.map((variant, index) => ({
        id: index + 1,
        content: variant.trim(),
        hashtags: extractHashtags(variant)
      }))
    };
  } catch (error) {
    console.error('Error generating referral copy:', error);
    return {
      success: false,
      error: '카피 생성 중 오류가 발생했습니다.'
    };
  }
}

// 보상 제안 생성
export async function generateRewardSuggestion(params: {
  orgId: string;
  dataSummary: string;
  budget: number;
}) {
  try {
    const prompt = PROMPTS.REWARD_SUGGESTION
      .replace('{data_summary}', params.dataSummary)
      .replace('{budget}', params.budget.toString());

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a growth analyst specializing in referral programs and incentive optimization.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.5,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // 감사 로그 기록
    await logAIAudit(
      params.orgId,
      'reward_suggest',
      `Budget: ${params.budget}, Data: ${params.dataSummary.substring(0, 100)}...`,
      response.substring(0, 200) + '...',
      'gpt-4',
      'reward_suggestion',
      completion.usage?.total_tokens,
      completion.usage?.total_tokens ? completion.usage.total_tokens * 0.00003 : undefined
    );

    return {
      success: true,
      suggestion: response
    };
  } catch (error) {
    console.error('Error generating reward suggestion:', error);
    return {
      success: false,
      error: '보상 제안 생성 중 오류가 발생했습니다.'
    };
  }
}

// 콘텐츠 모더레이션
export async function moderateContent(content: string): Promise<{
  approved: boolean;
  reason?: string;
}> {
  try {
    const completion = await openai.moderations.create({
      input: content,
    });

    const result = completion.results[0];
    const isFlagged = result.flagged;

    if (isFlagged) {
      const categories = result.categories;
      const flaggedCategories = Object.entries(categories)
        .filter(([_, flagged]) => flagged)
        .map(([category, _]) => category);

      return {
        approved: false,
        reason: `부적절한 콘텐츠 감지: ${flaggedCategories.join(', ')}`
      };
    }

    return {
      approved: true
    };
  } catch (error) {
    console.error('Error moderating content:', error);
    // 모더레이션 실패 시 기본적으로 승인
    return {
      approved: true,
      reason: '모더레이션 서비스 오류로 기본 승인'
    };
  }
}

// 해시태그 추출 헬퍼 함수
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w가-힣]+/g;
  return text.match(hashtagRegex) || [];
}

// 성과 최적화 제안
export async function generateOptimizationSuggestion(params: {
  orgId: string;
  campaignData: {
    clicks: number;
    conversions: number;
    revenue: number;
    topChannels: string[];
    conversionRate: number;
  };
}) {
  try {
    const prompt = `You are a growth optimization expert.
Campaign Performance:
- Clicks: ${params.campaignData.clicks}
- Conversions: ${params.campaignData.conversions}
- Revenue: $${params.campaignData.revenue}
- Conversion Rate: ${(params.campaignData.conversionRate * 100).toFixed(2)}%
- Top Channels: ${params.campaignData.topChannels.join(', ')}

Provide 3 specific, actionable recommendations to improve conversion rate and revenue. Focus on practical steps.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a growth optimization expert with deep knowledge of referral marketing.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // 감사 로그 기록
    await logAIAudit(
      params.orgId,
      'optimization',
      `Performance data for optimization`,
      response.substring(0, 200) + '...',
      'gpt-4',
      'optimization_suggestion',
      completion.usage?.total_tokens,
      completion.usage?.total_tokens ? completion.usage.total_tokens * 0.00003 : undefined
    );

    return {
      success: true,
      suggestions: response.split('\n').filter(s => s.trim())
    };
  } catch (error) {
    console.error('Error generating optimization suggestion:', error);
    return {
      success: false,
      error: '최적화 제안 생성 중 오류가 발생했습니다.'
    };
  }
}
