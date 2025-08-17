import { Metadata } from 'next';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Zap,
  BarChart3,
  Globe
} from 'lucide-react';

export const metadata: Metadata = {
  title: '성능 모니터링',
  description: '애플리케이션 성능 및 사용자 행동 분석',
};

export default function PerformancePage() {
  // 모의 데이터 (실제로는 API에서 가져옴)
  const performanceData = {
    pageLoadTime: 1200,
    firstContentfulPaint: 800,
    largestContentfulPaint: 1500,
    cumulativeLayoutShift: 0.05,
    firstInputDelay: 50,
  };

  const webVitals = [
    {
      name: 'LCP (Largest Contentful Paint)',
      value: performanceData.largestContentfulPaint,
      target: 2500,
      status: performanceData.largestContentfulPaint <= 2500 ? 'good' : 'poor',
      description: '페이지의 주요 콘텐츠가 로드되는 시간',
    },
    {
      name: 'FID (First Input Delay)',
      value: performanceData.firstInputDelay,
      target: 100,
      status: performanceData.firstInputDelay <= 100 ? 'good' : 'poor',
      description: '사용자 상호작용에 대한 응답 시간',
    },
    {
      name: 'CLS (Cumulative Layout Shift)',
      value: performanceData.cumulativeLayoutShift,
      target: 0.1,
      status: performanceData.cumulativeLayoutShift <= 0.1 ? 'good' : 'poor',
      description: '페이지 레이아웃의 안정성',
    },
  ];

  const userMetrics = {
    activeUsers: 1247,
    sessions: 3421,
    bounceRate: 23.5,
    avgSessionDuration: 245,
    pageViews: 8923,
  };

  const errorMetrics = {
    totalErrors: 23,
    errorRate: 0.8,
    topErrors: [
      { error: 'Network timeout', count: 8, percentage: 34.8 },
      { error: 'JavaScript error', count: 6, percentage: 26.1 },
      { error: 'API 500 error', count: 5, percentage: 21.7 },
      { error: 'Resource not found', count: 4, percentage: 17.4 },
    ],
  };

  const getStatusColor = (status: string) => {
    return status === 'good' ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (status: string) => {
    return status === 'good' ? '양호' : '개선 필요';
  };

  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">성능 모니터링</h1>
            <p className="text-muted-foreground">
              애플리케이션 성능 및 사용자 행동을 실시간으로 모니터링하세요
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="web-vitals">Core Web Vitals</TabsTrigger>
              <TabsTrigger value="user-metrics">사용자 지표</TabsTrigger>
              <TabsTrigger value="errors">에러 분석</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">평균 페이지 로드 시간</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(performanceData.pageLoadTime / 1000).toFixed(2)}s</div>
                    <p className="text-xs text-muted-foreground">
                      목표: 2초 이하
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userMetrics.activeUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      지난 24시간
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">에러율</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{errorMetrics.errorRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      목표: 1% 이하
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">평균 세션 시간</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(userMetrics.avgSessionDuration / 60)}분</div>
                    <p className="text-xs text-muted-foreground">
                      {userMetrics.avgSessionDuration % 60}초
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Core Web Vitals 요약</CardTitle>
                    <CardDescription>
                      Google의 핵심 웹 성능 지표
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {webVitals.map((metric) => (
                      <div key={metric.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <Badge variant={metric.status === 'good' ? 'default' : 'destructive'}>
                            {getStatusText(metric.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(metric.value / metric.target) * 100} 
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">
                            {metric.value}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>사용자 행동 분석</CardTitle>
                    <CardDescription>
                      세션 및 페이지뷰 통계
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">총 세션</p>
                        <p className="text-2xl font-bold">{userMetrics.sessions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">페이지뷰</p>
                        <p className="text-2xl font-bold">{userMetrics.pageViews.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">이탈률</p>
                        <p className="text-2xl font-bold">{userMetrics.bounceRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">페이지/세션</p>
                        <p className="text-2xl font-bold">
                          {(userMetrics.pageViews / userMetrics.sessions).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="web-vitals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Core Web Vitals 상세 분석</CardTitle>
                  <CardDescription>
                    각 지표별 상세 성능 데이터
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {webVitals.map((metric) => (
                      <div key={metric.name} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{metric.name}</h3>
                          <Badge variant={metric.status === 'good' ? 'default' : 'destructive'}>
                            {getStatusText(metric.status)}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>현재 값: {metric.value}</span>
                            <span>목표: {metric.target}</span>
                          </div>
                          <Progress 
                            value={Math.min((metric.value / metric.target) * 100, 100)} 
                            className="h-2"
                          />
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="user-metrics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>사용자 활동</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>활성 사용자</span>
                        <span className="font-semibold">{userMetrics.activeUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>총 세션</span>
                        <span className="font-semibold">{userMetrics.sessions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>평균 세션 시간</span>
                        <span className="font-semibold">
                          {Math.round(userMetrics.avgSessionDuration / 60)}분 {userMetrics.avgSessionDuration % 60}초
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>페이지 성능</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>총 페이지뷰</span>
                        <span className="font-semibold">{userMetrics.pageViews.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>페이지/세션</span>
                        <span className="font-semibold">
                          {(userMetrics.pageViews / userMetrics.sessions).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>이탈률</span>
                        <span className="font-semibold">{userMetrics.bounceRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="errors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>에러 분석</CardTitle>
                  <CardDescription>
                    애플리케이션 에러 및 성능 문제
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">총 에러 수</span>
                      <span className="text-2xl font-bold text-red-600">{errorMetrics.totalErrors}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">주요 에러 유형</h4>
                      {errorMetrics.topErrors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{error.error}</p>
                            <p className="text-sm text-muted-foreground">
                              {error.count}회 발생 ({error.percentage}%)
                            </p>
                          </div>
                          <Badge variant="destructive">{error.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
