import { Metadata } from 'next';
import { AuthForm } from '@/components/auth/auth-form';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: '로그인 - Kloser',
  description: 'Kloser에 로그인하여 AI 결합 지인추천 캠페인을 시작하세요.',
};

export default function AuthPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Kloser에 오신 것을 환영합니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI 결합 지인추천 캠페인 SaaS로 비즈니스를 성장시키세요
            </p>
          </div>
          
          <AuthForm 
            redirectTo="/dashboard"
            showLinks={true}
            view="sign_in"
          />
          
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              계속 진행하면{' '}
              <a href="/terms" className="text-primary hover:underline">
                이용약관
              </a>
              과{' '}
              <a href="/privacy" className="text-primary hover:underline">
                개인정보처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
