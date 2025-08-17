'use client';

import { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  redirectTo?: string;
  showLinks?: boolean;
  view?: 'sign_in' | 'sign_up' | 'magic_link' | 'forgotten_password';
}

export function AuthForm({ redirectTo, showLinks = true, view = 'sign_in' }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthStateChange = async (event: string, session: any) => {
    if (event === 'SIGNED_IN' && session) {
      // 사용자가 로그인했을 때
      toast({
        title: '로그인 성공',
        description: '대시보드로 이동합니다.',
      });
      
      // 사용자의 조직 확인 및 생성
      await handleUserOrganization(session.user);
      
      // 리다이렉트
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/dashboard');
      }
    } else if (event === 'SIGNED_OUT') {
      // 사용자가 로그아웃했을 때
      toast({
        title: '로그아웃',
        description: '성공적으로 로그아웃되었습니다.',
      });
      router.push('/');
    }
  };

  const handleUserOrganization = async (user: any) => {
    try {
      // 사용자의 조직 확인
      const { data: orgUsers, error } = await supabase
        .from('org_users')
        .select('org_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching user organizations:', error);
        return;
      }

      // 조직이 없으면 기본 조직 생성
      if (!orgUsers || orgUsers.length === 0) {
        await createDefaultOrganization(user);
      }
    } catch (error) {
      console.error('Error handling user organization:', error);
    }
  };

  const createDefaultOrganization = async (user: any) => {
    try {
      // 새 조직 생성
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: `${user.email?.split('@')[0]}의 조직`,
          plan: 'starter',
          region: 'KR',
          settings: {
            timezone: 'Asia/Seoul',
            currency: 'KRW'
          }
        })
        .select()
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        return;
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
        console.error('Error adding user to organization:', userError);
      }
    } catch (error) {
      console.error('Error creating default organization:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Kloser</CardTitle>
          <CardDescription className="text-center">
            AI 결합 지인추천 캠페인 SaaS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
              className: {
                anchor: 'text-primary hover:text-primary/80',
                button: 'bg-primary text-primary-foreground hover:bg-primary/90',
                input: 'border border-input bg-background text-foreground',
                label: 'text-foreground',
                loader: 'border-primary',
                message: 'text-destructive',
              },
            }}
            providers={['google', 'github']}
            redirectTo={redirectTo || `${window.location.origin}/dashboard`}
            showLinks={showLinks}
            onAuthStateChange={handleAuthStateChange}
            localization={{
              variables: {
                sign_in: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '로그인',
                  loading_button_label: '로그인 중...',
                  social_provider_text: '{{provider}}로 로그인',
                  link_text: '이미 계정이 있으신가요? 로그인',
                },
                sign_up: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '회원가입',
                  loading_button_label: '회원가입 중...',
                  social_provider_text: '{{provider}}로 회원가입',
                  link_text: '계정이 없으신가요? 회원가입',
                },
                forgotten_password: {
                  email_label: '이메일',
                  button_label: '비밀번호 재설정 이메일 보내기',
                  loading_button_label: '이메일 전송 중...',
                  link_text: '비밀번호를 잊으셨나요?',
                },
                magic_link: {
                  email_input_label: '이메일',
                  email_input_placeholder: 'your@email.com',
                  button_label: '매직 링크 보내기',
                  loading_button_label: '링크 전송 중...',
                  link_text: '매직 링크로 로그인',
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
