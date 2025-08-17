import { Metadata } from 'next';
import { CopyGenerator } from '@/components/ai/copy-generator';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'AI 카피 생성기 - Kloser',
  description: 'AI가 최적화된 추천 메시지를 생성합니다.',
};

export default function CopyGeneratorPage() {
  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI 카피 생성기</h1>
            <p className="text-gray-600 mt-2">
              비즈니스 정보를 입력하면 AI가 최적화된 추천 메시지를 생성합니다.
            </p>
          </div>
          
          <CopyGenerator />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
