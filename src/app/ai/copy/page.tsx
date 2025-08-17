"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Copy, 
  Download,
  MessageSquare,
  Smartphone,
  Mail,
  Instagram
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AICopyPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopies, setGeneratedCopies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    business: '',
    offer: '',
    audience: '',
    channel: 'SMS',
    tone: '친근함',
    language: 'ko',
    length: '중간'
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCopy = async () => {
    if (!formData.business || !formData.offer) {
      toast({
        title: "입력 오류",
        description: "업종과 혜택 정보를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockCopies = [
        {
          id: 1,
          content: `안녕하세요! ${formData.business}에서 특별한 혜택을 준비했어요! 🎉\n\n${formData.offer}\n\n친구와 함께하면 더 좋은 혜택도 받을 수 있어요! 👥\n\n지금 바로 확인해보세요! 👇\n\n#${formData.business} #추천혜택 #친구초대`,
          hashtags: [`#${formData.business}`, '#추천혜택', '#친구초대', '#특가', '#한정특가']
        },
        {
          id: 2,
          content: `친구야! ${formData.business}에서 정말 좋은 혜택을 발견했어! 💡\n\n${formData.offer}\n\n나도 이미 이용해봤는데 정말 만족스러워! 😊\n\n너도 꼭 체험해봐! 내 추천으로 더 좋은 혜택 받을 수 있어! 🎁\n\n#${formData.business} #추천 #혜택`,
          hashtags: [`#${formData.business}`, '#추천', '#혜택', '#체험', '#만족']
        },
        {
          id: 3,
          content: `📢 ${formData.business} 특별 이벤트!\n\n${formData.offer}\n\n친구와 함께하면 양쪽 다 혜택! 🎯\n\n기회를 놓치지 마세요! ⏰\n\n지금 바로 참여하세요! 👇\n\n#${formData.business} #이벤트 #친구초대 #혜택`,
          hashtags: [`#${formData.business}`, '#이벤트', '#친구초대', '#혜택', '#특가']
        }
      ];
      
      setGeneratedCopies(mockCopies);
      
      toast({
        title: "생성 완료!",
        description: "AI가 최적화된 추천 메시지를 생성했습니다.",
      });
    } catch (error) {
      toast({
        title: "생성 실패",
        description: "메시지 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료!",
      description: "메시지가 클립보드에 복사되었습니다.",
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS': return <Smartphone className="w-4 h-4" />;
      case 'Email': return <Mail className="w-4 h-4" />;
      case 'Instagram Stories': return <Instagram className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI 카피 생성</h1>
          </div>
          <p className="text-gray-600 mt-1">업종과 채널에 최적화된 추천 메시지를 AI가 생성해드립니다</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>메시지 설정</CardTitle>
              <CardDescription>
                업종과 혜택 정보를 입력하면 AI가 최적화된 메시지를 생성합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업종/비즈니스
                </label>
                <Input
                  placeholder="예: 온라인 쇼핑몰, 피트니스 센터, 교육 서비스"
                  value={formData.business}
                  onChange={(e) => handleInputChange('business', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  혜택/제안
                </label>
                <Input
                  placeholder="예: 첫 구매 시 20% 할인, 친구 추천 시 양쪽 10,000원 크레딧"
                  value={formData.offer}
                  onChange={(e) => handleInputChange('offer', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  타겟 고객
                </label>
                <Input
                  placeholder="예: 20-30대 여성, 운동을 좋아하는 사람들"
                  value={formData.audience}
                  onChange={(e) => handleInputChange('audience', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공유 채널
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.channel}
                    onChange={(e) => handleInputChange('channel', e.target.value)}
                  >
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Instagram Stories">Instagram Stories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    톤앤매너
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                  >
                    <option value="친근함">친근함</option>
                    <option value="전문적">전문적</option>
                    <option value="신뢰 중심">신뢰 중심</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    언어
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    길이
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                  >
                    <option value="짧게">짧게</option>
                    <option value="중간">중간</option>
                    <option value="길게">길게</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={generateCopy} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="spinner mr-2"></div>
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 카피 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 생성된 결과 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>생성된 메시지</CardTitle>
                <CardDescription>
                  AI가 생성한 최적화된 추천 메시지들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedCopies.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">위 설정을 입력하고 AI 카피를 생성해보세요</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedCopies.map((copy) => (
                      <div key={copy.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getChannelIcon(formData.channel)}
                            <span className="text-sm font-medium text-gray-700">
                              변형 {copy.id}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(copy.content)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              복사
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              저장
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-sm whitespace-pre-line">{copy.content}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {copy.hashtags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 팁 */}
            <Card>
              <CardHeader>
                <CardTitle>💡 사용 팁</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    업종과 혜택을 구체적으로 입력하면 더 정확한 메시지가 생성됩니다
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    채널별로 최적화된 길이와 톤으로 메시지가 조정됩니다
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    생성된 메시지는 자동으로 부정 방지 필터를 거칩니다
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
