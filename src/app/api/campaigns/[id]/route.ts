import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentUserPrimaryOrg } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 캠페인 조회 (조직 ID로 필터링)
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        participants(
          id,
          name,
          email,
          phone,
          status,
          created_at
        ),
        referral_links(
          id,
          code,
          participant_id,
          clicks,
          conversions,
          created_at
        )
      `)
      .eq('id', params.id)
      .eq('org_id', org.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
      console.error('Campaign fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
    }

    return NextResponse.json({ campaign });

  } catch (error) {
    console.error('Campaign API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      status,
      settings
    } = body;

    // 업데이트할 필드만 추출
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (landing_url !== undefined) {
      try {
        new URL(landing_url);
        updateData.landing_url = landing_url;
      } catch {
        return NextResponse.json({ error: 'Invalid landing URL' }, { status: 400 });
      }
    }
    if (reward_type !== undefined) updateData.reward_type = reward_type;
    if (reward_value !== undefined) updateData.reward_value = reward_value;
    if (reward_currency !== undefined) updateData.reward_currency = reward_currency;
    if (max_participants !== undefined) updateData.max_participants = max_participants;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (status !== undefined) updateData.status = status;
    if (settings !== undefined) updateData.settings = settings;

    // 캠페인 업데이트
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', params.id)
      .eq('org_id', org.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
      console.error('Campaign update error:', error);
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }

    return NextResponse.json({ campaign });

  } catch (error) {
    console.error('Campaign update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 캠페인 삭제 (조직 ID로 필터링)
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', params.id)
      .eq('org_id', org.id);

    if (error) {
      console.error('Campaign deletion error:', error);
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Campaign deleted successfully' });

  } catch (error) {
    console.error('Campaign deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
