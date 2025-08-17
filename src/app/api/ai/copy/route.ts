import { NextRequest, NextResponse } from 'next/server';
import { generateReferralCopy } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orgId, 
      business, 
      offer, 
      audience, 
      channel, 
      tone, 
      language, 
      length 
    } = body;

    // 필수 필드 검증
    if (!orgId || !business || !offer) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // AI 카피 생성
    const result = await generateReferralCopy({
      orgId,
      business,
      offer,
      audience: audience || '일반 고객',
      channel: channel || 'SMS',
      tone: tone || '친근함',
      language: language || 'ko',
      length: length || '중간'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '카피 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      variants: result.variants
    });

  } catch (error) {
    console.error('AI 카피 생성 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
