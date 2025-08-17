'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Users,
  DollarSign,
  MousePointer
} from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">분석</h1>
            <p className="text-gray-600 mt-2">캠페인 성과를 자세히 분석하세요</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
              <option value="90d">최근 90일</option>
              <option value="1y">최근 1년</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 클릭수</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,847</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% 지난 기간 대비
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 전환</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,341</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% 지난 기간 대비
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전환율</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.2%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1% 지난 기간 대비
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩12,847,000</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% 지난 기간 대비
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 클릭 및 전환 추이 */}
          <Card>
            <CardHeader>
              <CardTitle>클릭 및 전환 추이</CardTitle>
              <CardDescription>
                일별 클릭수와 전환수 변화
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">차트가 여기에 표시됩니다</p>
                  <p className="text-sm text-gray-400">Recharts 라이브러리 사용</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>6월 15일</span>
                      <span>1,247 클릭 / 89 전환</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6월 16일</span>
                      <span>1,445 클릭 / 122 전환</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6월 17일</span>
                      <span>1,098 클릭 / 75 전환</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 캠페인별 성과 */}
          <Card>
            <CardHeader>
              <CardTitle>캠페인별 성과</CardTitle>
              <CardDescription>
                캠페인별 전환율 및 매출
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">파이 차트가 여기에 표시됩니다</p>
                  <p className="text-sm text-gray-400">Recharts 라이브러리 사용</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>여름 시즌 할인</span>
                      <span>7.1% / ₩8,900,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>첫 구매 이벤트</span>
                      <span>7.5% / ₩6,700,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>친구 추천 이벤트</span>
                      <span>5.2% / ₩2,300,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상세 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 참여자 분석 */}
          <Card>
            <CardHeader>
              <CardTitle>참여자 분석</CardTitle>
              <CardDescription>
                참여자 유형별 분포
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">신규 참여자</span>
                  <span className="font-medium">1,234 (52.7%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '52.7%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">기존 참여자</span>
                  <span className="font-medium">1,107 (47.3%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '47.3%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 채널별 성과 */}
          <Card>
            <CardHeader>
              <CardTitle>채널별 성과</CardTitle>
              <CardDescription>
                유입 채널별 전환율
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">SNS</span>
                  <span className="font-medium">22.1%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '22.1%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">이메일</span>
                  <span className="font-medium">18.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '18.7%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">웹사이트</span>
                  <span className="font-medium">15.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '15.3%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 시간대별 활동 */}
          <Card>
            <CardHeader>
              <CardTitle>시간대별 활동</CardTitle>
              <CardDescription>
                가장 활발한 시간대
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">오후 2-4시</span>
                  <span className="font-medium">34.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '34.2%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">오후 6-8시</span>
                  <span className="font-medium">28.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '28.7%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">오전 10-12시</span>
                  <span className="font-medium">21.1%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '21.1%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상위 성과자 */}
        <Card>
          <CardHeader>
            <CardTitle>상위 성과자</CardTitle>
            <CardDescription>
              가장 높은 전환율을 보인 참여자들
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: '김철수', campaign: '여름 시즌 할인', conversions: 45, rate: '26.7%', revenue: '₩2,340,000' },
                { name: '이영희', campaign: '첫 구매 이벤트', conversions: 38, rate: '21.1%', revenue: '₩1,890,000' },
                { name: '박민수', campaign: '친구 추천 이벤트', conversions: 32, rate: '18.9%', revenue: '₩1,560,000' },
                { name: '정수진', campaign: '여름 시즌 할인', conversions: 28, rate: '16.5%', revenue: '₩1,320,000' },
                { name: '최동욱', campaign: '첫 구매 이벤트', conversions: 25, rate: '15.2%', revenue: '₩1,180,000' },
              ].map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{performer.name}</p>
                      <p className="text-sm text-gray-500">{performer.campaign}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{performer.conversions} 전환 ({performer.rate})</p>
                    <p className="text-sm text-gray-500">{performer.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
