'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface TestVariant {
  id: string;
  name: string;
  impressions: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  revenuePerUser: number;
  isWinner?: boolean;
  isSignificant?: boolean;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

interface ABTestResultsProps {
  testId: string;
  testName: string;
  status: 'running' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  variants: TestVariant[];
  primaryMetric: string;
  confidenceLevel: number;
}

export function ABTestResults({ 
  testId, 
  testName, 
  status, 
  startDate, 
  endDate, 
  variants, 
  primaryMetric,
  confidenceLevel 
}: ABTestResultsProps) {
  const [selectedMetric, setSelectedMetric] = useState(primaryMetric);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricValue = (variant: TestVariant, metric: string) => {
    switch (metric) {
      case 'conversion_rate': return variant.conversionRate;
      case 'revenue_per_user': return variant.revenuePerUser;
      case 'click_through_rate': return (variant.conversions / variant.impressions) * 100;
      case 'engagement_rate': return (variant.conversions / variant.impressions) * 100;
      default: return variant.conversionRate;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'conversion_rate': return '전환율';
      case 'revenue_per_user': return '사용자당 매출';
      case 'click_through_rate': return '클릭률';
      case 'engagement_rate': return '참여율';
      default: return '전환율';
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'conversion_rate': return '%';
      case 'revenue_per_user': return '$';
      case 'click_through_rate': return '%';
      case 'engagement_rate': return '%';
      default: return '%';
    }
  };

  const calculateImprovement = (baseline: number, variant: number) => {
    if (baseline === 0) return 0;
    return ((variant - baseline) / baseline) * 100;
  };

  const baseline = variants[0];
  const bestVariant = variants.reduce((best, current) => 
    getMetricValue(current, selectedMetric) > getMetricValue(best, selectedMetric) ? current : best
  );

  return (
    <div className="space-y-6">
      {/* 테스트 개요 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                {testName}
              </CardTitle>
              <CardDescription>
                테스트 ID: {testId} | 시작일: {new Date(startDate).toLocaleDateString()}
                {endDate && ` | 종료일: ${new Date(endDate).toLocaleDateString()}`}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(status)}>
              {status === 'running' && '진행 중'}
              {status === 'completed' && '완료'}
              {status === 'paused' && '일시정지'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 주요 지표 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">분석 지표</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'conversion_rate', label: '전환율' },
              { value: 'revenue_per_user', label: '사용자당 매출' },
              { value: 'click_through_rate', label: '클릭률' },
              { value: 'engagement_rate', label: '참여율' },
            ].map((metric) => (
              <Button
                key={metric.value}
                variant={selectedMetric === metric.value ? 'default' : 'outline'}
                onClick={() => setSelectedMetric(metric.value)}
                className="justify-start"
              >
                {metric.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 변형별 성과 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {variants.map((variant, index) => {
          const metricValue = getMetricValue(variant, selectedMetric);
          const improvement = index === 0 ? 0 : calculateImprovement(
            getMetricValue(baseline, selectedMetric),
            metricValue
          );
          const isBest = variant.id === bestVariant.id;
          const isSignificant = variant.isSignificant;

          return (
            <Card key={variant.id} className={`relative ${isBest ? 'ring-2 ring-green-500' : ''}`}>
              {isBest && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    최고 성과
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{variant.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {isSignificant && (
                      <Badge variant="secondary" className="text-xs">
                        통계적 유의성
                      </Badge>
                    )}
                    {improvement !== 0 && (
                      <div className={`flex items-center text-sm ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {improvement > 0 ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(improvement).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* 주요 지표 */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {getMetricUnit(selectedMetric)}{metricValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getMetricLabel(selectedMetric)}
                  </div>
                </div>

                {/* 상세 지표 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">노출 수</span>
                    </div>
                    <div className="font-semibold">{variant.impressions.toLocaleString()}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">전환 수</span>
                    </div>
                    <div className="font-semibold">{variant.conversions.toLocaleString()}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">전환율</span>
                    </div>
                    <div className="font-semibold">{variant.conversionRate.toFixed(2)}%</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">매출</span>
                    </div>
                    <div className="font-semibold">${variant.revenue.toLocaleString()}</div>
                  </div>
                </div>

                {/* 신뢰 구간 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">신뢰 구간 ({confidenceLevel}%)</div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={variant.confidenceInterval.lower} 
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500">
                      {variant.confidenceInterval.lower.toFixed(2)}% - {variant.confidenceInterval.upper.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* 권장사항 */}
                {isBest && isSignificant && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">승자로 선정 권장</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      통계적으로 유의한 성과 향상을 보여 이 변형을 채택하는 것을 권장합니다.
                    </p>
                  </div>
                )}

                {isBest && !isSignificant && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">추가 테스트 필요</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      더 나은 성과를 보이지만 통계적 유의성이 부족합니다. 테스트를 계속 진행하거나 샘플 크기를 늘려보세요.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 테스트 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>테스트 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {variants.reduce((sum, v) => sum + v.impressions, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">총 노출 수</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {variants.reduce((sum, v) => sum + v.conversions, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">총 전환 수</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${variants.reduce((sum, v) => sum + v.revenue, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">총 매출</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
