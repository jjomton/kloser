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
      .from('conversions')
      .select(`
        *,
        campaign:campaigns(name, reward_type, reward_value),
        participant:participants(name, email),
        referral_link:referral_links(code),
        reward:rewards(id, status, amount)
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

    const { data: conversions, error, count } = await query;

    if (error) {
      console.error('Conversions fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch conversions' }, { status: 500 });
    }

    return NextResponse.json({
      conversions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Conversions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // 요청 본문 파싱
    const body = await request.json();
    const {
      campaign_id,
      participant_id,
      referral_link_id,
      conversion_type,
      conversion_value,
      conversion_currency,
      metadata,
      customer_email,
      customer_name,
      order_id
    } = body;

    // 필수 필드 검증
    if (!campaign_id || !conversion_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: campaign_id, conversion_type' 
      }, { status: 400 });
    }

    // 전환 타입 유효성 검증
    const validConversionTypes = ['signup', 'purchase', 'download', 'trial', 'subscription'];
    if (!validConversionTypes.includes(conversion_type)) {
      return NextResponse.json({ 
        error: `Invalid conversion_type. Must be one of: ${validConversionTypes.join(', ')}` 
      }, { status: 400 });
    }

    // 캠페인 존재 확인
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, org_id, status, reward_type, reward_value')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'active') {
      return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 });
    }

    // 참여자 존재 확인 (제공된 경우)
    if (participant_id) {
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('id, campaign_id')
        .eq('id', participant_id)
        .eq('campaign_id', campaign_id)
        .single();

      if (participantError || !participant) {
        return NextResponse.json({ error: 'Participant not found or not associated with campaign' }, { status: 404 });
      }
    }

    // 리퍼럴 링크 존재 확인 (제공된 경우)
    if (referral_link_id) {
      const { data: referralLink, error: linkError } = await supabase
        .from('referral_links')
        .select('id, campaign_id, participant_id')
        .eq('id', referral_link_id)
        .eq('campaign_id', campaign_id)
        .single();

      if (linkError || !referralLink) {
        return NextResponse.json({ error: 'Referral link not found or not associated with campaign' }, { status: 404 });
      }

      // participant_id가 제공되지 않은 경우 리퍼럴 링크에서 가져오기
      if (!participant_id) {
        body.participant_id = referralLink.participant_id;
      }
    }

    // 중복 전환 확인 (같은 고객의 같은 전환 타입)
    if (customer_email && conversion_type) {
      const { data: existingConversion } = await supabase
        .from('conversions')
        .select('id')
        .eq('campaign_id', campaign_id)
        .eq('customer_email', customer_email)
        .eq('conversion_type', conversion_type)
        .single();

      if (existingConversion) {
        return NextResponse.json({ error: 'Conversion already exists for this customer and type' }, { status: 409 });
      }
    }

    // 전환 생성
    const { data: conversion, error } = await supabase
      .from('conversions')
      .insert({
        org_id: campaign.org_id,
        campaign_id,
        participant_id: body.participant_id,
        referral_link_id,
        conversion_type,
        conversion_value: conversion_value || 0,
        conversion_currency: conversion_currency || 'USD',
        metadata: metadata || {},
        customer_email,
        customer_name,
        order_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Conversion creation error:', error);
      return NextResponse.json({ error: 'Failed to create conversion' }, { status: 500 });
    }

    return NextResponse.json({ conversion }, { status: 201 });

  } catch (error) {
    console.error('Conversion creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
