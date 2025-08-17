import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUserPrimaryOrg } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자의 주요 조직 가져오기
    const org = await getCurrentUserPrimaryOrg(user.id);
    if (!org) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');
    const participant_id = searchParams.get('participant_id');
    const status = searchParams.get('status');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 쿼리 빌드
    let query = supabase
      .from('rewards')
      .select(`
        *,
        campaign:campaigns(name, reward_type),
        participant:participants(name, email),
        conversion:conversions(conversion_type, conversion_value)
      `)
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });

    // 필터 적용
    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }
    if (participant_id) {
      query = query.eq('participant_id', participant_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1);

    const { data: rewards, error, count } = await query;

    if (error) {
      console.error('Rewards fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
    }

    return NextResponse.json({
      rewards,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Rewards API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자의 주요 조직 가져오기
    const org = await getCurrentUserPrimaryOrg(user.id);
    if (!org) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // 요청 본문 파싱
    const body = await request.json();
    const {
      conversion_id,
      participant_id,
      campaign_id,
      amount,
      currency,
      reward_type,
      payout_method,
      payout_details,
      notes
    } = body;

    // 필수 필드 검증
    if (!conversion_id || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: conversion_id, amount' 
      }, { status: 400 });
    }

    // 금액 유효성 검증
    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // 전환 존재 확인
    const { data: conversion, error: conversionError } = await supabase
      .from('conversions')
      .select('id, org_id, campaign_id, participant_id, status')
      .eq('id', conversion_id)
      .eq('org_id', org.id)
      .single();

    if (conversionError || !conversion) {
      return NextResponse.json({ error: 'Conversion not found' }, { status: 404 });
    }

    if (conversion.status !== 'confirmed') {
      return NextResponse.json({ error: 'Conversion must be confirmed before creating reward' }, { status: 400 });
    }

    // 이미 보상이 존재하는지 확인
    const { data: existingReward } = await supabase
      .from('rewards')
      .select('id')
      .eq('conversion_id', conversion_id)
      .single();

    if (existingReward) {
      return NextResponse.json({ error: 'Reward already exists for this conversion' }, { status: 409 });
    }

    // 보상 생성
    const { data: reward, error } = await supabase
      .from('rewards')
      .insert({
        org_id: org.id,
        campaign_id: conversion.campaign_id,
        participant_id: conversion.participant_id,
        conversion_id,
        amount,
        currency: currency || 'USD',
        reward_type: reward_type || 'cash',
        payout_method: payout_method || 'manual',
        payout_details: payout_details || {},
        notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Reward creation error:', error);
      return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 });
    }

    return NextResponse.json({ reward }, { status: 201 });

  } catch (error) {
    console.error('Reward creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
