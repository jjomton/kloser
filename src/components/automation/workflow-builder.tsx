'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Plus, Zap, Target, Mail, Gift } from 'lucide-react';

export function WorkflowBuilder() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: '',
    actionType: '',
    isActive: true,
  });

  const { toast } = useToast();
  const { organization } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organization) {
      toast({
        title: '오류',
        description: '조직 정보를 찾을 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name || !formData.triggerType || !formData.actionType) {
      toast({
        title: '오류',
        description: '필수 필드를 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating workflow:', formData);
      
      toast({
        title: '성공',
        description: '워크플로우가 생성되었습니다.',
      });

      setFormData({
        name: '',
        description: '',
        triggerType: '',
        actionType: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Workflow creation error:', error);
      toast({
        title: '오류',
        description: '워크플로우 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            자동화 워크플로우 생성
          </CardTitle>
          <CardDescription>
            조건부 이벤트 트리거와 자동화 규칙을 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workflowName">워크플로우 이름 *</Label>
                <Input
                  id="workflowName"
                  placeholder="예: 전환 시 자동 보상 지급"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>활성화 상태</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <span className="text-sm text-gray-600">
                    {formData.isActive ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflowDescription">설명</Label>
              <Textarea
                id="workflowDescription"
                placeholder="워크플로우의 목적과 동작을 설명하세요."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>트리거 유형 *</Label>
                <Select 
                  value={formData.triggerType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, triggerType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="트리거 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversion">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        전환 발생
                      </div>
                    </SelectItem>
                    <SelectItem value="referral_click">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        추천 링크 클릭
                      </div>
                    </SelectItem>
                    <SelectItem value="campaign_launch">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        캠페인 시작
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>액션 유형 *</Label>
                <Select 
                  value={formData.actionType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, actionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="액션 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        이메일 발송
                      </div>
                    </SelectItem>
                    <SelectItem value="award_reward">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        보상 지급
                      </div>
                    </SelectItem>
                    <SelectItem value="update_campaign">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        캠페인 업데이트
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  워크플로우 생성 중...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  워크플로우 생성
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
