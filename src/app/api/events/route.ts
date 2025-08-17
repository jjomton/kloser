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
    const event_type = searchParams.get('event_type');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // 쿼리 빌드
    let query = supabase
      .from('events')
      .select(`
        *,
        campaign:campaigns(name),
        participant:participants(name, email),
        referral_link:referral_links(code)
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
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Events fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Events API error:', error);
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
      event_type,
      metadata,
      user_agent,
      ip_address,
      utm_params
    } = body;

    // 필수 필드 검증
    if (!campaign_id || !event_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: campaign_id, event_type' 
      }, { status: 400 });
    }

    // 이벤트 타입 유효성 검증
    const validEventTypes = ['click', 'conversion', 'signup', 'purchase', 'download'];
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json({ 
        error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}` 
      }, { status: 400 });
    }

    // 캠페인 존재 확인
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, org_id, status')
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

    // 이벤트 생성
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        org_id: campaign.org_id,
        campaign_id,
        participant_id: body.participant_id,
        referral_link_id,
        event_type,
        metadata: metadata || {},
        user_agent,
        ip_address,
        utm_params: utm_params || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Event creation error:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ event }, { status: 201 });

  } catch (error) {
    console.error('Event creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
