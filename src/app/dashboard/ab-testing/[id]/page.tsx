import { Metadata } from 'next';
import { ABTestResults } from '@/components/ab-testing/ab-test-results';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: 'A/B 테스트 결과 - Kloser',
  description: 'A/B 테스트 결과를 분석하고 최적의 변형을 찾아보세요.',
};

// 샘플 데이터
const mockTestData = {
  testId: 'test-001',
  testName: '보상 금액 테스트',
  status: 'running' as const,
  startDate: '2024-01-15',
  variants: [
    {
      id: '1',
      name: '변형 A (기본)',
      impressions: 5000,
      conversions: 125,
      revenue: 6250,
      conversionRate: 2.5,
      revenuePerUser: 50,
      isWinner: false,
      isSignificant: false,
      confidenceInterval: { lower: 2.1, upper: 2.9 },
    },
    {
      id: '2',
      name: '변형 B (높은 보상)',
      impressions: 5000,
      conversions: 150,
      revenue: 7500,
      conversionRate: 3.0,
      revenuePerUser: 50,
      isWinner: true,
      isSignificant: true,
      confidenceInterval: { lower: 2.6, upper: 3.4 },
    },
    {
      id: '3',
      name: '변형 C (매우 높은 보상)',
      impressions: 5000,
      conversions: 110,
      revenue: 5500,
      conversionRate: 2.2,
      revenuePerUser: 50,
      isWinner: false,
      isSignificant: false,
      confidenceInterval: { lower: 1.8, upper: 2.6 },
    },
  ],
  primaryMetric: 'conversion_rate',
  confidenceLevel: 95,
};

interface ABTestResultPageProps {
  params: {
    id: string;
  };
}

export default function ABTestResultPage({ params }: ABTestResultPageProps) {
  // 실제 구현에서는 params.id를 사용하여 데이터베이스에서 테스트 데이터를 가져옴
  // 현재는 샘플 데이터 사용
  const testData = {
    ...mockTestData,
    testId: params.id,
  };

  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <ABTestResults {...testData} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
