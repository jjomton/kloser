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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 쿼리 빌드
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        participants(count),
        referral_links(count)
      `)
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });

    // 상태 필터 적용
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1);

    const { data: campaigns, error, count } = await query;

    if (error) {
      console.error('Campaigns fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Campaigns API error:', error);
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
      name,
      description,
      landing_url,
      reward_type,
      reward_value,
      reward_currency,
      max_participants,
      start_date,
      end_date,
      settings
    } = body;

    // 필수 필드 검증
    if (!name || !landing_url || !reward_type || !reward_value) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, landing_url, reward_type, reward_value' 
      }, { status: 400 });
    }

    // URL 유효성 검증
    try {
      new URL(landing_url);
    } catch {
      return NextResponse.json({ error: 'Invalid landing URL' }, { status: 400 });
    }

    // 캠페인 생성
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        org_id: org.id,
        name,
        description,
        landing_url,
        reward_type,
        reward_value,
        reward_currency: reward_currency || 'USD',
        max_participants,
        start_date,
        end_date,
        status: 'active',
        settings: settings || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Campaign creation error:', error);
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }

    return NextResponse.json({ campaign }, { status: 201 });

  } catch (error) {
    console.error('Campaign creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
