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

    // 조직 상세 정보 조회
    const { data: organization, error } = await supabase
      .from('organizations')
      .select(`
        *,
        org_users(
          id,
          user_id,
          role,
          status,
          created_at
        )
      `)
      .eq('id', org.id)
      .single();

    if (error) {
      console.error('Organization fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
    }

    return NextResponse.json({ organization });

  } catch (error) {
    console.error('Organization API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
      plan,
      region,
      settings
    } = body;

    // 업데이트할 필드만 추출
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (plan !== undefined) {
      if (!['starter', 'pro'].includes(plan)) {
        return NextResponse.json({ error: 'Invalid plan. Must be "starter" or "pro"' }, { status: 400 });
      }
      updateData.plan = plan;
    }
    if (region !== undefined) updateData.region = region;
    if (settings !== undefined) updateData.settings = settings;

    // 조직 업데이트
    const { data: organization, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', org.id)
      .select()
      .single();

    if (error) {
      console.error('Organization update error:', error);
      return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
    }

    return NextResponse.json({ organization });

  } catch (error) {
    console.error('Organization update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
