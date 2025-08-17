import { Metadata } from 'next';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Shield,
  ArrowRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI 도구 - Kloser',
  description: 'AI 기반 지인추천 캠페인 최적화 도구들',
};

const aiTools = [
  {
    name: 'AI 카피 생성기',
    description: '비즈니스 정보를 입력하면 AI가 최적화된 추천 메시지를 생성합니다.',
    href: '/dashboard/ai/copy-generator',
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'AI 보상 제안',
    description: '캠페인 데이터를 분석하여 최적의 보상 전략을 제안합니다.',
    href: '/dashboard/ai/reward-suggester',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    name: 'AI 성과 분석',
    description: '캠페인 성과를 분석하고 개선 방안을 제시합니다.',
    href: '/dashboard/ai/performance-analyzer',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    name: 'AI 콘텐츠 모더레이션',
    description: '부적절한 콘텐츠를 자동으로 감지하고 필터링합니다.',
    href: '/dashboard/ai/content-moderation',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

export default function AIToolsPage() {
  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              AI 도구
            </h1>
            <p className="text-gray-600 mt-2">
              AI 기반 지인추천 캠페인 최적화 도구들을 활용하여 성과를 극대화하세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiTools.map((tool) => (
              <Card key={tool.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                      <tool.icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={tool.href}>
                    <Button className="w-full">
                      사용하기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI 도구 활용 팁
                </h3>
                <p className="text-gray-600 mb-4">
                  더 정확한 결과를 위해 구체적이고 상세한 정보를 입력해주세요.
                  AI는 입력된 데이터를 기반으로 최적화된 제안을 제공합니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">카피 생성</div>
                    <div className="text-gray-600">비즈니스 특성과 타겟 고객을 명확히 입력</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">보상 제안</div>
                    <div className="text-gray-600">현재 성과 데이터와 예산을 상세히 제공</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">성과 분석</div>
                    <div className="text-gray-600">충분한 데이터 포인트를 확보하여 분석</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
