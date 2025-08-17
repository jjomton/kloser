import { Metadata } from 'next';
import { AuthForm } from '@/components/auth/auth-form';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: '비밀번호 재설정 - Kloser',
  description: 'Kloser 계정의 비밀번호를 재설정하세요.',
};

export default function ResetPasswordPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              비밀번호 재설정
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다
            </p>
          </div>
          
          <AuthForm 
            redirectTo="/auth"
            showLinks={true}
            view="forgotten_password"
          />
          
          <div className="mt-8 text-center">
            <a 
              href="/auth" 
              className="text-primary hover:underline text-sm"
            >
              로그인 페이지로 돌아가기
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
