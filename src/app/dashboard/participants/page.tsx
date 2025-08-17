'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  Users,
  UserPlus,
  Activity
} from 'lucide-react';

export default function ParticipantsPage() {
  const [loading, setLoading] = useState(true);

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
            <h1 className="text-3xl font-bold text-gray-900">참여자 관리</h1>
            <p className="text-gray-600 mt-2">캠페인 참여자들을 관리하고 분석하세요</p>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            참여자 초대
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 참여자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,341</div>
              <p className="text-xs text-muted-foreground">
                1,856명 활성
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 전환율</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.2%</div>
              <p className="text-xs text-muted-foreground">
                전체 참여자 기준
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩12,847,000</div>
              <p className="text-xs text-muted-foreground">
                참여자 기여 매출
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 보상</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩2,156,000</div>
              <p className="text-xs text-muted-foreground">
                지급된 보상 총액
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="참여자 검색..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">모든 상태</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="pending">대기중</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">모든 캠페인</option>
                  <option value="summer">여름 시즌 할인</option>
                  <option value="first">첫 구매 이벤트</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 참여자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>참여자 목록</CardTitle>
            <CardDescription>
              5명의 참여자가 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: '김철수', email: 'kim@example.com', campaign: '여름 시즌 할인', status: '활성', conversions: 12, revenue: '₩1,200,000' },
                { name: '이영희', email: 'lee@example.com', campaign: '첫 구매 이벤트', status: '활성', conversions: 8, revenue: '₩800,000' },
                { name: '박민수', email: 'park@example.com', campaign: '친구 추천 이벤트', status: '비활성', conversions: 3, revenue: '₩300,000' },
              ].map((participant, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {participant.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{participant.name}</h3>
                      <p className="text-sm text-gray-500">{participant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">{participant.campaign}</div>
                      <div className="text-xs text-gray-500">{participant.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{participant.conversions} 전환</div>
                      <div className="text-xs text-gray-500">{participant.revenue}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
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
