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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 쿼리 빌드
    let query = supabase
      .from('participants')
      .select(`
        *,
        campaign:campaigns(name, status),
        referral_links(count),
        conversions(count)
      `)
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });

    // 캠페인 필터 적용
    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    // 상태 필터 적용
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1);

    const { data: participants, error, count } = await query;

    if (error) {
      console.error('Participants fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    return NextResponse.json({
      participants,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Participants API error:', error);
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
      campaign_id,
      name,
      email,
      phone,
      metadata
    } = body;

    // 필수 필드 검증
    if (!campaign_id || !name) {
      return NextResponse.json({ 
        error: 'Missing required fields: campaign_id, name' 
      }, { status: 400 });
    }

    // 이메일 유효성 검증 (선택사항)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 전화번호 유효성 검증 (선택사항)
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    // 캠페인 존재 확인
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', campaign_id)
      .eq('org_id', org.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'active') {
      return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 });
    }

    // 참여자 생성
    const { data: participant, error } = await supabase
      .from('participants')
      .insert({
        org_id: org.id,
        campaign_id,
        name,
        email,
        phone,
        status: 'active',
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Participant creation error:', error);
      return NextResponse.json({ error: 'Failed to create participant' }, { status: 500 });
    }

    return NextResponse.json({ participant }, { status: 201 });

  } catch (error) {
    console.error('Participant creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
