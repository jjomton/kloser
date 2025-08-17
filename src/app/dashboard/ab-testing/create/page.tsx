import { Metadata } from 'next';
import { ABTestCreator } from '@/components/ab-testing/ab-test-creator';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'A/B 테스트 생성 - Kloser',
  description: '새로운 A/B 테스트를 생성하여 캠페인 성과를 최적화하세요.',
};

export default function CreateABTestPage() {
  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">A/B 테스트 생성</h1>
            <p className="text-gray-600 mt-2">
              캠페인 변형을 테스트하여 최적의 성과를 찾아보세요.
            </p>
          </div>
          
          <ABTestCreator />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
