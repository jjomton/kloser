'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateReferralCopy } from '@/lib/ai';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Copy, Sparkles, MessageSquare } from 'lucide-react';

interface CopyVariant {
  id: number;
  content: string;
  hashtags: string[];
}

export function CopyGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<CopyVariant[]>([]);
  const [formData, setFormData] = useState({
    business: '',
    offer: '',
    audience: '',
    channel: 'SMS' as 'SMS' | 'WhatsApp' | 'Email' | 'Instagram Stories',
    tone: '친근함' as '친근함' | '전문적' | '신뢰 중심',
    language: 'ko' as 'ko' | 'en',
    length: '중간' as '짧게' | '중간' | '길게',
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

    if (!formData.business || !formData.offer) {
      toast({
        title: '오류',
        description: '비즈니스 정보와 제안 내용을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateReferralCopy({
        orgId: organization.id,
        ...formData,
      });

      if (result.success) {
        setVariants(result.variants);
        toast({
          title: '성공',
          description: 'AI가 추천 메시지를 생성했습니다.',
        });
      } else {
        toast({
          title: '오류',
          description: result.error || '카피 생성 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Copy generation error:', error);
      toast({
        title: '오류',
        description: '카피 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '복사됨',
        description: '클립보드에 복사되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '복사 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI 카피 생성기
          </CardTitle>
          <CardDescription>
            비즈니스 정보를 입력하면 AI가 최적화된 추천 메시지를 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business">비즈니스/서비스명 *</Label>
                <Input
                  id="business"
                  placeholder="예: 온라인 영어 교육 플랫폼"
                  value={formData.business}
                  onChange={(e) => setFormData(prev => ({ ...prev, business: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer">제안/혜택 *</Label>
                <Input
                  id="offer"
                  placeholder="예: 첫 달 50% 할인 + 무료 체험"
                  value={formData.offer}
                  onChange={(e) => setFormData(prev => ({ ...prev, offer: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">타겟 고객</Label>
              <Textarea
                id="audience"
                placeholder="예: 20-30대 직장인, 영어 학습에 관심이 있는 분들"
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channel">채널</Label>
                <Select value={formData.channel} onValueChange={(value: any) => setFormData(prev => ({ ...prev, channel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Email">이메일</SelectItem>
                    <SelectItem value="Instagram Stories">인스타그램 스토리</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">톤앤매너</Label>
                <Select value={formData.tone} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="친근함">친근함</SelectItem>
                    <SelectItem value="전문적">전문적</SelectItem>
                    <SelectItem value="신뢰 중심">신뢰 중심</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">언어</Label>
                <Select value={formData.language} onValueChange={(value: any) => setFormData(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">영어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">길이</Label>
                <Select value={formData.length} onValueChange={(value: any) => setFormData(prev => ({ ...prev, length: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="짧게">짧게</SelectItem>
                    <SelectItem value="중간">중간</SelectItem>
                    <SelectItem value="길게">길게</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 카피 생성
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {variants.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            생성된 카피 ({variants.length}개)
          </h3>
          
          <div className="grid gap-4">
            {variants.map((variant, index) => (
              <Card key={variant.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-gray-500">
                      변형 {index + 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(variant.content)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      복사
                    </Button>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {variant.content}
                    </p>
                  </div>
                  
                  {variant.hashtags.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-1">
                        {variant.hashtags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
