'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Plus, Trash2, Target, Users, BarChart3 } from 'lucide-react';

interface TestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  copy: string;
  rewardValue?: number;
  rewardType?: string;
}

export function ABTestCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<TestVariant[]>([
    {
      id: '1',
      name: '변형 A (기본)',
      description: '기본 캠페인 설정',
      trafficPercentage: 50,
      copy: '',
      rewardValue: 0,
      rewardType: 'cash',
    },
    {
      id: '2',
      name: '변형 B',
      description: '테스트할 새로운 설정',
      trafficPercentage: 50,
      copy: '',
      rewardValue: 0,
      rewardType: 'cash',
    },
  ]);

  const [formData, setFormData] = useState({
    testName: '',
    description: '',
    primaryMetric: 'conversion_rate',
    confidenceLevel: 95,
    testDuration: 14,
    minSampleSize: 100,
  });

  const { toast } = useToast();
  const { organization } = useAuth();

  const addVariant = () => {
    const newId = (variants.length + 1).toString();
    const newVariant: TestVariant = {
      id: newId,
      name: `변형 ${String.fromCharCode(65 + variants.length)}`,
      description: '',
      trafficPercentage: 0,
      copy: '',
      rewardValue: 0,
      rewardType: 'cash',
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 2) {
      toast({
        title: '오류',
        description: '최소 2개의 변형이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }
    setVariants(variants.filter(v => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof TestVariant, value: any) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const updateTrafficDistribution = () => {
    const totalPercentage = variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (totalPercentage !== 100) {
      const equalPercentage = Math.floor(100 / variants.length);
      const remainder = 100 % variants.length;
      
      setVariants(variants.map((v, index) => ({
        ...v,
        trafficPercentage: equalPercentage + (index < remainder ? 1 : 0)
      })));
    }
  };

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

    if (!formData.testName) {
      toast({
        title: '오류',
        description: '테스트 이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const totalPercentage = variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    if (totalPercentage !== 100) {
      toast({
        title: '오류',
        description: '트래픽 분배가 100%가 되어야 합니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: API 호출로 A/B 테스트 생성
      console.log('Creating A/B test:', { formData, variants });
      
      toast({
        title: '성공',
        description: 'A/B 테스트가 생성되었습니다.',
      });
    } catch (error) {
      console.error('A/B test creation error:', error);
      toast({
        title: '오류',
        description: 'A/B 테스트 생성 중 오류가 발생했습니다.',
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
            <Target className="w-5 h-5 text-blue-600" />
            A/B 테스트 생성
          </CardTitle>
          <CardDescription>
            캠페인 변형을 테스트하여 최적의 성과를 찾아보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">기본 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testName">테스트 이름 *</Label>
                  <Input
                    id="testName"
                    placeholder="예: 보상 금액 테스트"
                    value={formData.testName}
                    onChange={(e) => setFormData(prev => ({ ...prev, testName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryMetric">주요 지표</Label>
                  <Select 
                    value={formData.primaryMetric} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, primaryMetric: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion_rate">전환율</SelectItem>
                      <SelectItem value="revenue_per_user">사용자당 매출</SelectItem>
                      <SelectItem value="click_through_rate">클릭률</SelectItem>
                      <SelectItem value="engagement_rate">참여율</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">테스트 설명</Label>
                <Textarea
                  id="description"
                  placeholder="테스트 목적과 예상 결과를 설명해주세요."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* 테스트 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">테스트 설정</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="confidenceLevel">신뢰 수준 (%)</Label>
                  <Select 
                    value={formData.confidenceLevel.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, confidenceLevel: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                      <SelectItem value="99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testDuration">테스트 기간 (일)</Label>
                  <Input
                    id="testDuration"
                    type="number"
                    min="1"
                    max="90"
                    value={formData.testDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, testDuration: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minSampleSize">최소 샘플 크기</Label>
                  <Input
                    id="minSampleSize"
                    type="number"
                    min="10"
                    value={formData.minSampleSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, minSampleSize: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {/* 변형 설정 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">변형 설정</h3>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="w-4 h-4 mr-2" />
                  변형 추가
                </Button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <Card key={variant.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{variant.name}</h4>
                        {variants.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(variant.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>변형 이름</Label>
                          <Input
                            value={variant.name}
                            onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>트래픽 분배 (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={variant.trafficPercentage}
                            onChange={(e) => updateVariant(variant.id, 'trafficPercentage', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>설명</Label>
                        <Input
                          value={variant.description}
                          onChange={(e) => updateVariant(variant.id, 'description', e.target.value)}
                          placeholder="이 변형의 특징을 설명해주세요."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>추천 메시지</Label>
                        <Textarea
                          value={variant.copy}
                          onChange={(e) => updateVariant(variant.id, 'copy', e.target.value)}
                          placeholder="이 변형에서 사용할 추천 메시지를 입력해주세요."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>보상 금액</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.rewardValue}
                            onChange={(e) => updateVariant(variant.id, 'rewardValue', parseFloat(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>보상 유형</Label>
                          <Select 
                            value={variant.rewardType} 
                            onValueChange={(value) => updateVariant(variant.id, 'rewardType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">현금</SelectItem>
                              <SelectItem value="credit">크레딧</SelectItem>
                              <SelectItem value="discount">할인</SelectItem>
                              <SelectItem value="free_trial">무료 체험</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">총 트래픽 분배:</span>
                  <span className={`font-medium ${variants.reduce((sum, v) => sum + v.trafficPercentage, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    {variants.reduce((sum, v) => sum + v.trafficPercentage, 0)}%
                  </span>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={updateTrafficDistribution}>
                  균등 분배
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  테스트 생성 중...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  A/B 테스트 생성
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
