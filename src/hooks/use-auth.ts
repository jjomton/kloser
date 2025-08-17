'use client';

import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getCurrentUserPrimaryOrg } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  organization: any | null;
  loadingOrg: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    organization: null,
    loadingOrg: true,
  });

  useEffect(() => {
    // 초기 세션 가져오기
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          loading: false,
        }));

        // 사용자의 조직 정보 가져오기
        await loadUserOrganization(session.user);
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          loadingOrg: false,
        }));
      }
    };

    getInitialSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
        }));

        if (session?.user) {
          await loadUserOrganization(session.user);
        } else {
          setAuthState(prev => ({
            ...prev,
            organization: null,
            loadingOrg: false,
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserOrganization = async (user: User) => {
    try {
      setAuthState(prev => ({ ...prev, loadingOrg: true }));
      
      const org = await getCurrentUserPrimaryOrg(user.id);
      
      setAuthState(prev => ({
        ...prev,
        organization: org,
        loadingOrg: false,
      }));
    } catch (error) {
      console.error('Error loading user organization:', error);
      setAuthState(prev => ({
        ...prev,
        loadingOrg: false,
      }));
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshOrganization = async () => {
    if (authState.user) {
      await loadUserOrganization(authState.user);
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    organization: authState.organization,
    loadingOrg: authState.loadingOrg,
    signOut,
    refreshOrganization,
    isAuthenticated: !!authState.user,
  };
}
