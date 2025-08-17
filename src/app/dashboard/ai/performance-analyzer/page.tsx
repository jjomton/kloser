import { Metadata } from 'next';
import { PerformanceAnalyzer } from '@/components/ai/performance-analyzer';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'AI 성과 분석 - Kloser',
  description: 'AI가 캠페인 성과를 분석하고 개선 방안을 제시합니다.',
};

export default function PerformanceAnalyzerPage() {
  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI 성과 분석</h1>
            <p className="text-gray-600 mt-2">
              캠페인 성과 데이터를 입력하면 AI가 개선 방안을 제시합니다.
            </p>
          </div>
          
          <PerformanceAnalyzer />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
