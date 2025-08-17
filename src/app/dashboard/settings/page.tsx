'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  User,
  Building,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Save,
  Edit,
  Trash2,
  Plus,
  Settings as SettingsIcon
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'profile', name: '프로필', icon: User },
    { id: 'organization', name: '조직', icon: Building },
    { id: 'security', name: '보안', icon: Shield },
    { id: 'notifications', name: '알림', icon: Bell },
    { id: 'billing', name: '결제', icon: CreditCard },
    { id: 'integrations', name: '연동', icon: Globe },
  ];

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-600 mt-2">계정 및 조직 설정을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>프로필 설정</CardTitle>
                  <CardDescription>
                    개인 정보를 업데이트하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        프로필 사진 변경
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름
                      </label>
                      <Input defaultValue="홍길동" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일
                      </label>
                      <Input defaultValue="hong@example.com" type="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        전화번호
                      </label>
                      <Input defaultValue="010-1234-5678" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        직책
                      </label>
                      <Input defaultValue="마케팅 매니저" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      자기소개
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      defaultValue="마케팅 전문가로서 디지털 마케팅과 고객 참여에 대한 경험이 있습니다."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'organization' && (
              <Card>
                <CardHeader>
                  <CardTitle>조직 설정</CardTitle>
                  <CardDescription>
                    조직 정보 및 멤버를 관리하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        조직명
                      </label>
                      <Input defaultValue="테스트 회사 A" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        업계
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>전자상거래</option>
                        <option>서비스업</option>
                        <option>제조업</option>
                        <option>기타</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        웹사이트
                      </label>
                      <Input defaultValue="https://example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        지역
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>대한민국</option>
                        <option>미국</option>
                        <option>일본</option>
                        <option>기타</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      조직 설명
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      defaultValue="고객 중심의 혁신적인 서비스를 제공하는 기업입니다."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>보안 설정</CardTitle>
                  <CardDescription>
                    계정 보안을 관리하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">비밀번호 변경</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          현재 비밀번호
                        </label>
                        <Input type="password" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호
                        </label>
                        <Input type="password" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호 확인
                        </label>
                        <Input type="password" />
                      </div>
                      <Button>
                        <Save className="w-4 h-4 mr-2" />
                        비밀번호 변경
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">2단계 인증</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">2단계 인증</p>
                        <p className="text-sm text-gray-500">계정 보안을 위해 2단계 인증을 활성화하세요</p>
                      </div>
                      <Button variant="outline">
                        설정
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">로그인 세션</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-sm text-gray-500">서울, 대한민국 • 현재 세션</p>
                        </div>
                        <span className="text-sm text-green-600">활성</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Safari - iPhone</p>
                          <p className="text-sm text-gray-500">부산, 대한민국 • 2시간 전</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>알림 설정</CardTitle>
                  <CardDescription>
                    알림 설정을 관리하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">이메일 알림</p>
                        <p className="text-sm text-gray-500">중요한 업데이트를 이메일로 받습니다</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">새 전환 알림</p>
                        <p className="text-sm text-gray-500">새로운 전환이 발생할 때 알림을 받습니다</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">주간 리포트</p>
                        <p className="text-sm text-gray-500">매주 성과 리포트를 이메일로 받습니다</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">마케팅 알림</p>
                        <p className="text-sm text-gray-500">새로운 기능과 업데이트 소식을 받습니다</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card>
                <CardHeader>
                  <CardTitle>결제 설정</CardTitle>
                  <CardDescription>
                    구독 및 결제 정보를 관리하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">현재 플랜</h3>
                        <p className="text-sm text-gray-500">Pro 플랜</p>
                      </div>
                      <span className="text-lg font-bold">₩99,000/월</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>다음 결제일</span>
                        <span>2024년 7월 15일</span>
                      </div>
                      <div className="flex justify-between">
                        <span>사용량</span>
                        <span>2,341 / 5,000 참여자</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      플랜 변경
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">결제 방법</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">•••• •••• •••• 1234</p>
                            <p className="text-sm text-gray-500">만료: 12/25</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        결제 방법 추가
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'integrations' && (
              <Card>
                <CardHeader>
                  <CardTitle>연동 설정</CardTitle>
                  <CardDescription>
                    외부 서비스와 연동하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Google Analytics</h3>
                          <p className="text-sm text-gray-500">웹사이트 분석</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        연동
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <SettingsIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Slack</h3>
                          <p className="text-sm text-gray-500">팀 알림</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        연동
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Mailchimp</h3>
                          <p className="text-sm text-gray-500">이메일 마케팅</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        연동
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Stripe</h3>
                          <p className="text-sm text-gray-500">결제 처리</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        연동
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
