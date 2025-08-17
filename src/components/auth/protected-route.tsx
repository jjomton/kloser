'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrg?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireOrg = false,
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, loading, organization, loadingOrg, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // 인증이 필요한데 로그인하지 않은 경우
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // 조직이 필요한데 조직이 없는 경우
      if (requireOrg && !loadingOrg && !organization) {
        router.push('/onboarding');
        return;
      }
    }
  }, [loading, loadingOrg, isAuthenticated, organization, requireAuth, requireOrg, redirectTo, router]);

  // 로딩 중일 때
  if (loading || (requireOrg && loadingOrg)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증이 필요한데 로그인하지 않은 경우
  if (requireAuth && !isAuthenticated) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  // 조직이 필요한데 조직이 없는 경우
  if (requireOrg && !organization) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return <>{children}</>;
}
