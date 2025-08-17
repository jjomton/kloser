import { Metadata } from 'next';
import { RewardSuggester } from '@/components/ai/reward-suggester';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'AI 보상 제안 - Kloser',
  description: 'AI가 캠페인 데이터를 분석하여 최적의 보상 전략을 제안합니다.',
};

export default function RewardSuggesterPage() {
  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI 보상 제안</h1>
            <p className="text-gray-600 mt-2">
              캠페인 데이터를 분석하여 최적의 보상 전략을 제안합니다.
            </p>
          </div>
          
          <RewardSuggester />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
