import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, properties, timestamp, sessionId } = body;

    // 기본 검증
    if (!event || !timestamp || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 환경 변수가 설정되지 않은 경우 임시로 성공 응답
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('Analytics event (development):', { event, properties, timestamp, sessionId });
      return NextResponse.json({ success: true });
    }

    const supabase = createServerSupabaseClient();

    // 분석 이벤트를 데이터베이스에 저장
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event,
        properties: properties || {},
        timestamp: new Date(timestamp).toISOString(),
        session_id: sessionId,
        user_agent: request.headers.get('user-agent') || '',
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        referer: request.headers.get('referer') || '',
      });

    if (error) {
      console.error('Failed to save analytics event:', error);
      return NextResponse.json(
        { error: 'Failed to save event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const event = searchParams.get('event');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // 환경 변수가 설정되지 않은 경우 임시로 빈 데이터 반환
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ events: [] });
    }

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (event) {
      query = query.eq('event', event);
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch analytics events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ events: data });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
