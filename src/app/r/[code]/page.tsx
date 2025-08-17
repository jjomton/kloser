import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getDeviceInfo, setCookie } from '@/lib/utils';

interface ReferralPageProps {
  params: {
    code: string;
  };
}

export default async function ReferralPage({ params }: ReferralPageProps) {
  const { code } = params;
  
  try {
    const supabase = createServerSupabaseClient();
    
    // 추천 링크 조회
    const { data: referralLink, error } = await supabase
      .from('referral_links')
      .select(`
        *,
        campaigns (*)
      `)
      .eq('code', code)
      .single();

    if (error || !referralLink) {
      console.error('추천 링크를 찾을 수 없습니다:', code);
      redirect('/404');
    }

    // 캠페인이 활성 상태인지 확인
    if (referralLink.campaigns.status !== 'active') {
      console.error('캠페인이 비활성 상태입니다:', referralLink.campaigns.id);
      redirect('/campaign-inactive');
    }

    // 클릭 이벤트 기록 (서버 사이드에서)
    await recordClickEvent(referralLink);

    // 클라이언트 사이드에서 쿠키 설정을 위한 스크립트
    const setCookieScript = `
      <script>
        // 추천 코드 쿠키 설정 (30일간 유지)
        document.cookie = 'ref_code=${code}; max-age=${30 * 24 * 60 * 60}; path=/; SameSite=Lax';
        
        // 디바이스 정보 수집
        const deviceInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenWidth: screen.width,
          screenHeight: screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        
        // 디바이스 정보를 로컬 스토리지에 저장
        localStorage.setItem('device_info', JSON.stringify(deviceInfo));
        
        // 랜딩 페이지로 리다이렉트
        window.location.href = '${referralLink.campaigns.landing_url || '/'}';
      </script>
    `;

    return (
      <html>
        <head>
          <title>리다이렉트 중...</title>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'system-ui, sans-serif',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <h2 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>
                리다이렉트 중...
              </h2>
              <p style={{ margin: 0, color: '#6b7280' }}>
                잠시만 기다려주세요.
              </p>
            </div>
          </div>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          
          <div dangerouslySetInnerHTML={{ __html: setCookieScript }} />
        </body>
      </html>
    );

  } catch (error) {
    console.error('추천 링크 처리 오류:', error);
    redirect('/error');
  }
}

// 클릭 이벤트 기록 함수
async function recordClickEvent(referralLink: any) {
  try {
    const supabase = createServerSupabaseClient();
    
    // 클릭 이벤트 기록
    await supabase.from('events').insert({
      org_id: referralLink.campaigns.org_id,
      campaign_id: referralLink.campaigns.id,
      participant_id: referralLink.participant_id,
      link_id: referralLink.id,
      type: 'click',
      ip: '127.0.0.1', // 실제로는 클라이언트 IP를 가져와야 함
      user_agent: 'Server-side recording',
      referrer: 'referral_link',
      meta: {
        code: referralLink.code,
        utm: referralLink.utm
      }
    });

    // 클릭 수 업데이트
    await supabase
      .from('referral_links')
      .update({ 
        clicks_count: referralLink.clicks_count + 1 
      })
      .eq('id', referralLink.id);

  } catch (error) {
    console.error('클릭 이벤트 기록 실패:', error);
    // 클릭 기록 실패는 전체 플로우를 중단하지 않음
  }
}
