import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// 클라이언트 사이드 Supabase 클라이언트
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 서버 사이드용 Supabase 클라이언트 (서비스 롤 키 사용)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

// 현재 사용자의 조직 정보 가져오기
export const getCurrentUserOrgs = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: orgUsers, error } = await supabase
    .from('org_users')
    .select(`
      *,
      organizations (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');
    
  if (error) {
    console.error('Error fetching user organizations:', error);
    return null;
  }
  
  return orgUsers;
};

// 현재 사용자의 주요 조직 가져오기 (첫 번째 활성 조직)
export const getCurrentUserPrimaryOrg = async () => {
  const orgs = await getCurrentUserOrgs();
  return orgs?.[0]?.organizations || null;
};

// 조직 권한 확인
export const checkOrgPermission = async (orgId: string, requiredRole?: 'owner' | 'admin' | 'analyst') => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data: orgUser, error } = await supabase
    .from('org_users')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();
    
  if (error || !orgUser) return false;
  
  if (!requiredRole) return true;
  
  const roleHierarchy = {
    'owner': 3,
    'admin': 2,
    'analyst': 1
  };
  
  return roleHierarchy[orgUser.role] >= roleHierarchy[requiredRole];
};
