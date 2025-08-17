'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateOptimizationSuggestion } from '@/lib/ai';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Sparkles, BarChart3, TrendingUp } from 'lucide-react';

export function PerformanceAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    clicks: '',
    conversions: '',
    revenue: '',
    conversionRate: '',
    topChannels: '',
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

    // 필수 필드 검증
    const requiredFields = ['clicks', 'conversions', 'revenue'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: '오류',
          description: `${field === 'clicks' ? '클릭 수' : field === 'conversions' ? '전환 수' : '매출'}를 입력해주세요.`,
          variant: 'destructive',
        });
        return;
      }
    }

    // 숫자 검증
    const clicks = parseInt(formData.clicks);
    const conversions = parseInt(formData.conversions);
    const revenue = parseFloat(formData.revenue);
    const conversionRate = formData.conversionRate ? parseFloat(formData.conversionRate) : conversions / clicks;

    if (isNaN(clicks) || isNaN(conversions) || isNaN(revenue) || clicks <= 0) {
      toast({
        title: '오류',
        description: '유효한 숫자를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateOptimizationSuggestion({
        orgId: organization.id,
        campaignData: {
          clicks,
          conversions,
          revenue,
          conversionRate,
          topChannels: formData.topChannels ? formData.topChannels.split(',').map(ch => ch.trim()) : [],
        },
      });

      if (result.success) {
        setSuggestions(result.suggestions);
        toast({
          title: '성공',
          description: 'AI가 성과 개선 방안을 제안했습니다.',
        });
      } else {
        toast({
          title: '오류',
          description: result.error || '성과 분석 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Performance analysis error:', error);
      toast({
        title: '오류',
        description: '성과 분석 중 오류가 발생했습니다.',
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
            <BarChart3 className="w-5 h-5 text-purple-600" />
            AI 성과 분석
          </CardTitle>
          <CardDescription>
            캠페인 성과 데이터를 입력하면 AI가 개선 방안을 제시합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clicks">총 클릭 수 *</Label>
                <Input
                  id="clicks"
                  type="number"
                  placeholder="예: 1000"
                  value={formData.clicks}
                  onChange={(e) => setFormData(prev => ({ ...prev, clicks: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversions">총 전환 수 *</Label>
                <Input
                  id="conversions"
                  type="number"
                  placeholder="예: 25"
                  value={formData.conversions}
                  onChange={(e) => setFormData(prev => ({ ...prev, conversions: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue">총 매출 (USD) *</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  placeholder="예: 2500"
                  value={formData.revenue}
                  onChange={(e) => setFormData(prev => ({ ...prev, revenue: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversionRate">전환율 (%)</Label>
                <Input
                  id="conversionRate"
                  type="number"
                  step="0.01"
                  placeholder="자동 계산됨"
                  value={formData.conversionRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, conversionRate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topChannels">주요 채널 (쉼표로 구분)</Label>
              <Input
                id="topChannels"
                placeholder="예: SMS, 이메일, 인스타그램"
                value={formData.topChannels}
                onChange={(e) => setFormData(prev => ({ ...prev, topChannels: e.target.value }))}
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
                  AI 성과 분석
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              AI 개선 제안 ({suggestions.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
