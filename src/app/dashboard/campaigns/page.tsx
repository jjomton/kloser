'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  Target,
  Users,
  TrendingUp,
  Calendar,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 임시 캠페인 데이터
const mockCampaigns = [
  {
    id: '1',
    name: '여름 시즌 할인',
    status: 'active',
    type: 'discount',
    participants: 234,
    clicks: 1247,
    conversions: 89,
    conversionRate: 7.1,
    revenue: 890000,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    reward: '10% 할인',
    description: '여름 시즌 상품 10% 할인 이벤트'
  },
  {
    id: '2',
    name: '첫 구매 이벤트',
    status: 'active',
    type: 'first_purchase',
    participants: 156,
    clicks: 892,
    conversions: 67,
    conversionRate: 7.5,
    revenue: 670000,
    startDate: '2024-05-15',
    endDate: '2024-07-15',
    reward: '₩15,000 할인',
    description: '첫 구매 고객 대상 특별 할인'
  },
  {
    id: '3',
    name: '친구 추천 이벤트',
    status: 'paused',
    type: 'referral',
    participants: 89,
    clicks: 445,
    conversions: 23,
    conversionRate: 5.2,
    revenue: 230000,
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    reward: '₩10,000 + ₩5,000',
    description: '친구 추천 시 양쪽 모두 혜택'
  },
  {
    id: '4',
    name: '가을 신상품 출시',
    status: 'draft',
    type: 'new_product',
    participants: 0,
    clicks: 0,
    conversions: 0,
    conversionRate: 0,
    revenue: 0,
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    reward: '20% 할인',
    description: '가을 신상품 사전 예약 할인'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  ended: 'bg-red-100 text-red-800'
};

const statusLabels = {
  active: '진행중',
  paused: '일시정지',
  draft: '임시저장',
  ended: '종료'
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleCopyLink = (campaignId: string) => {
    const link = `${window.location.origin}/r/${campaignId}`;
    navigator.clipboard.writeText(link);
    // TODO: 토스트 알림 추가
  };

  const handleEditCampaign = (campaignId: string) => {
    // TODO: 캠페인 편집 페이지로 이동
    console.log('Edit campaign:', campaignId);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    // TODO: 삭제 확인 다이얼로그
    setCampaigns(campaigns.filter(c => c.id !== campaignId));
  };

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
            <h1 className="text-3xl font-bold text-gray-900">캠페인 관리</h1>
            <p className="text-gray-600 mt-2">추천 캠페인을 생성하고 관리하세요</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 캠페인
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 캠페인</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground">
                {campaigns.filter(c => c.status === 'active').length}개 진행중
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 참여자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                활성 캠페인 기준
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 전환</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                평균 전환율 {(
                  campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length
                ).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(campaigns.reduce((sum, c) => sum + c.revenue, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                추천 캠페인 기반
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="캠페인 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">모든 상태</option>
                  <option value="active">진행중</option>
                  <option value="paused">일시정지</option>
                  <option value="draft">임시저장</option>
                  <option value="ended">종료</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 캠페인 목록 */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                        {statusLabels[campaign.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">보상:</span>
                        <span className="ml-1 font-medium">{campaign.reward}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">기간:</span>
                        <span className="ml-1 font-medium">
                          {formatDate(campaign.startDate)} ~ {formatDate(campaign.endDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">참여자:</span>
                        <span className="ml-1 font-medium">{campaign.participants.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">전환율:</span>
                        <span className="ml-1 font-medium">{campaign.conversionRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleCopyLink(campaign.id)}>
                      <LinkIcon className="w-4 h-4 mr-1" />
                      링크 복사
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>캠페인 작업</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditCampaign(campaign.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          미리보기
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          복제
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">캠페인이 없습니다</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? '검색 조건에 맞는 캠페인이 없습니다.' 
                    : '첫 번째 캠페인을 생성해보세요.'}
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  새 캠페인 생성
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
