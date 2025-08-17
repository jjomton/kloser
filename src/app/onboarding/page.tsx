'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    plan: 'starter',
    region: 'KR',
    timezone: 'Asia/Seoul',
    currency: 'KRW',
  });
  
  const { user, refreshOrganization } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: '오류',
        description: '사용자 정보를 찾을 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.organizationName.trim()) {
      toast({
        title: '오류',
        description: '조직명을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 조직 생성
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.organizationName,
          plan: formData.plan,
          region: formData.region,
          settings: {
            timezone: formData.timezone,
            currency: formData.currency,
          }
        })
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      // 사용자를 조직에 추가
      const { error: userError } = await supabase
        .from('org_users')
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: 'owner',
          status: 'active'
        });

      if (userError) {
        throw userError;
      }

      // 조직 정보 새로고침
      await refreshOrganization();

      toast({
        title: '성공',
        description: '조직이 성공적으로 생성되었습니다.',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: '오류',
        description: '조직 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={true} requireOrg={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              조직 설정
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kloser를 시작하기 위해 조직 정보를 설정해주세요
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>조직 정보</CardTitle>
              <CardDescription>
                조직의 기본 정보를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">조직명 *</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="예: 우리 회사"
                    value={formData.organizationName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      organizationName: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">플랜</Label>
                  <Select
                    value={formData.plan}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      plan: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter (무료)</SelectItem>
                      <SelectItem value="pro">Pro (유료)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">지역</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      region: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KR">한국</SelectItem>
                      <SelectItem value="US">미국</SelectItem>
                      <SelectItem value="CA">캐나다</SelectItem>
                      <SelectItem value="JP">일본</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      timezone: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">Asia/Seoul (한국)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (미국 동부)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (미국 서부)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (일본)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">통화</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      currency: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KRW">KRW (원)</SelectItem>
                      <SelectItem value="USD">USD (달러)</SelectItem>
                      <SelectItem value="CAD">CAD (캐나다 달러)</SelectItem>
                      <SelectItem value="JPY">JPY (엔)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      설정 중...
                    </>
                  ) : (
                    '조직 생성하기'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
