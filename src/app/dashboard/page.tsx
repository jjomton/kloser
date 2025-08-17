'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Eye,
  MousePointer
} from 'lucide-react';

// 임시 데이터 (나중에 Supabase에서 가져올 예정)
const mockData = {
  kpis: {
    totalClicks: 12847,
    totalParticipants: 2341,
    conversionRate: 18.2,
    totalRevenue: 12847000,
    clicksGrowth: 12,
    participantsGrowth: 8,
    conversionGrowth: 2.1,
    revenueGrowth: 15
  },
  topReferrers: [
    { name: "김철수", conversions: 45, revenue: 2340000, avatar: "김" },
    { name: "이영희", conversions: 38, revenue: 1890000, avatar: "이" },
    { name: "박민수", conversions: 32, revenue: 1560000, avatar: "박" },
    { name: "정수진", conversions: 28, revenue: 1320000, avatar: "정" },
    { name: "최동욱", conversions: 25, revenue: 1180000, avatar: "최" },
  ],
  recentActivity: [
    { 
      action: "새 전환 발생", 
      campaign: "여름 시즌 할인", 
      time: "5분 전",
      value: 89000,
      type: "conversion"
    },
    { 
      action: "캠페인 생성", 
      campaign: "가을 신상품 출시", 
      time: "1시간 전",
      value: null,
      type: "campaign"
    },
    { 
      action: "보상 지급 완료", 
      campaign: "첫 구매 이벤트", 
      time: "2시간 전",
      value: 15000,
      type: "reward"
    },
    { 
      action: "새 참여자 등록", 
      campaign: "친구 추천 이벤트", 
      time: "3시간 전",
      value: null,
      type: "participant"
    },
  ],
  chartData: [
    { date: '2024-01-01', clicks: 120, conversions: 18, revenue: 890000 },
    { date: '2024-01-02', clicks: 145, conversions: 22, revenue: 1100000 },
    { date: '2024-01-03', clicks: 98, conversions: 15, revenue: 750000 },
    { date: '2024-01-04', clicks: 167, conversions: 28, revenue: 1400000 },
    { date: '2024-01-05', clicks: 134, conversions: 21, revenue: 1050000 },
    { date: '2024-01-06', clicks: 189, conversions: 32, revenue: 1600000 },
    { date: '2024-01-07', clicks: 156, conversions: 25, revenue: 1250000 },
  ]
};

export default function DashboardPage() {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
    ) : (
      <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversion':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'campaign':
        return <Plus className="w-4 h-4 text-blue-600" />;
      case 'reward':
        return <DollarSign className="w-4 h-4 text-yellow-600" />;
      case 'participant':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} requireOrg={true}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* 페이지 헤더 */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-2">지인추천 캠페인 성과를 한눈에 확인하세요</p>
          </div>

        {/* KPI 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 클릭수</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.kpis.totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {getGrowthIcon(data.kpis.clicksGrowth)}
                {data.kpis.clicksGrowth > 0 ? '+' : ''}{data.kpis.clicksGrowth}% 지난주 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">참여자 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.kpis.totalParticipants.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {getGrowthIcon(data.kpis.participantsGrowth)}
                {data.kpis.participantsGrowth > 0 ? '+' : ''}{data.kpis.participantsGrowth}% 지난주 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전환율</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.kpis.conversionRate}%</div>
              <p className="text-xs text-muted-foreground flex items-center">
                {getGrowthIcon(data.kpis.conversionGrowth)}
                {data.kpis.conversionGrowth > 0 ? '+' : ''}{data.kpis.conversionGrowth}% 지난주 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.kpis.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {getGrowthIcon(data.kpis.revenueGrowth)}
                {data.kpis.revenueGrowth > 0 ? '+' : ''}{data.kpis.revenueGrowth}% 지난주 대비
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 차트 및 상세 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 주요 차트 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>캠페인 성과 추이</CardTitle>
                <CardDescription>
                  최근 7일간의 클릭 및 전환 추이
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">차트가 여기에 표시됩니다</p>
                    <p className="text-sm text-gray-400">Recharts 라이브러리 사용</p>
                    <div className="mt-4 space-y-2">
                      {data.chartData.slice(-3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.date}</span>
                          <span>{item.clicks} 클릭 / {item.conversions} 전환</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 상위 추천인 */}
          <Card>
            <CardHeader>
              <CardTitle>상위 추천인</CardTitle>
              <CardDescription>
                가장 많은 전환을 이끌어낸 추천인들
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topReferrers.map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {referrer.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{referrer.name}</p>
                        <p className="text-sm text-gray-500">{referrer.conversions} 전환</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(referrer.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>
              최근 캠페인 활동 내역
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.campaign}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.value && (
                      <p className="font-medium text-green-600">
                        {formatCurrency(activity.value)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
