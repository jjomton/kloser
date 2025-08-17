'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateRewardSuggestion } from '@/lib/ai';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

export function RewardSuggester() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [formData, setFormData] = useState({
    dataSummary: '',
    budget: '',
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

    if (!formData.dataSummary || !formData.budget) {
      toast({
        title: '오류',
        description: '데이터 요약과 예산을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const budget = parseFloat(formData.budget);
    if (isNaN(budget) || budget <= 0) {
      toast({
        title: '오류',
        description: '유효한 예산을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateRewardSuggestion({
        orgId: organization.id,
        dataSummary: formData.dataSummary,
        budget: budget,
      });

      if (result.success) {
        setSuggestion(result.suggestion);
        toast({
          title: '성공',
          description: 'AI가 보상 전략을 제안했습니다.',
        });
      } else {
        toast({
          title: '오류',
          description: result.error || '보상 제안 생성 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reward suggestion error:', error);
      toast({
        title: '오류',
        description: '보상 제안 생성 중 오류가 발생했습니다.',
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
            <TrendingUp className="w-5 h-5 text-green-600" />
            AI 보상 제안
          </CardTitle>
          <CardDescription>
            캠페인 데이터를 분석하여 최적의 보상 전략을 제안합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataSummary">캠페인 데이터 요약 *</Label>
              <Textarea
                id="dataSummary"
                placeholder="예: 현재 전환율 2.5%, 평균 주문 금액 $50, 주요 참여자 연령대 25-35세, 인기 채널은 SMS와 이메일"
                value={formData.dataSummary}
                onChange={(e) => setFormData(prev => ({ ...prev, dataSummary: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">총 예산 (USD) *</Label>
              <Input
                id="budget"
                type="number"
                placeholder="예: 1000"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 보상 전략 제안
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              AI 제안 전략
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                {suggestion}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
