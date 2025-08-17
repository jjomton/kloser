import { Metadata } from 'next';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'A/B 테스트 - Kloser',
  description: '캠페인 변형을 테스트하여 최적의 성과를 찾아보세요.',
};

// 샘플 데이터
const mockTests = [
  {
    id: 'test-001',
    name: '보상 금액 테스트',
    status: 'running' as const,
    startDate: '2024-01-15',
    variants: 3,
    totalImpressions: 15420,
    totalConversions: 385,
    improvement: 12.5,
  },
  {
    id: 'test-002',
    name: '메시지 톤 테스트',
    status: 'completed' as const,
    startDate: '2024-01-01',
    endDate: '2024-01-14',
    variants: 2,
    totalImpressions: 8900,
    totalConversions: 267,
    improvement: 8.3,
  },
  {
    id: 'test-003',
    name: '채널별 성과 테스트',
    status: 'paused' as const,
    startDate: '2024-01-10',
    variants: 4,
    totalImpressions: 6700,
    totalConversions: 134,
    improvement: -2.1,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'running': return '진행 중';
    case 'completed': return '완료';
    case 'paused': return '일시정지';
    default: return '알 수 없음';
  }
};

export default function ABTestingPage() {
  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-8 h-8 text-blue-600" />
                A/B 테스트
              </h1>
              <p className="text-gray-600 mt-2">
                캠페인 변형을 테스트하여 최적의 성과를 찾아보세요.
              </p>
            </div>
            <Link href="/dashboard/ab-testing/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 테스트 생성
              </Button>
            </Link>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">활성 테스트</span>
                </div>
                <div className="text-2xl font-bold mt-2">3</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">총 노출 수</span>
                </div>
                <div className="text-2xl font-bold mt-2">31,020</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">총 전환 수</span>
                </div>
                <div className="text-2xl font-bold mt-2">786</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">평균 개선율</span>
                </div>
                <div className="text-2xl font-bold mt-2">+6.2%</div>
              </CardContent>
            </Card>
          </div>

          {/* 테스트 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>테스트 목록</CardTitle>
              <CardDescription>
                현재 진행 중이거나 완료된 A/B 테스트들을 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">{test.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>테스트 ID: {test.id}</span>
                          <span>변형 수: {test.variants}개</span>
                          <span>시작일: {new Date(test.startDate).toLocaleDateString()}</span>
                          {test.endDate && (
                            <span>종료일: {new Date(test.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">노출/전환</div>
                        <div className="font-semibold">
                          {test.totalImpressions.toLocaleString()} / {test.totalConversions.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600">개선율</div>
                        <div className={`font-semibold ${test.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {test.improvement >= 0 ? '+' : ''}{test.improvement.toFixed(1)}%
                        </div>
                      </div>

                      <Badge className={getStatusColor(test.status)}>
                        {getStatusLabel(test.status)}
                      </Badge>

                      <Link href={`/dashboard/ab-testing/${test.id}`}>
                        <Button variant="outline" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 빠른 시작 가이드 */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  A/B 테스트 시작하기
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  캠페인 성과를 극대화하기 위해 다양한 변형을 테스트해보세요. 
                  통계적 유의성을 기반으로 최적의 설정을 찾을 수 있습니다.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-medium text-gray-900 mb-2">1. 테스트 설계</div>
                    <div className="text-gray-600">가설을 세우고 테스트할 변형을 정의하세요</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-medium text-gray-900 mb-2">2. 데이터 수집</div>
                    <div className="text-gray-600">충분한 샘플 크기로 신뢰할 수 있는 결과를 확보하세요</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-medium text-gray-900 mb-2">3. 결과 분석</div>
                    <div className="text-gray-600">통계적 유의성을 확인하고 승자를 선정하세요</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/dashboard/ab-testing/create">
                    <Button size="lg">
                      <Plus className="w-4 h-4 mr-2" />
                      첫 번째 테스트 시작하기
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
