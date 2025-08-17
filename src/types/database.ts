// Supabase 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          plan: 'starter' | 'pro';
          region: string;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: 'starter' | 'pro';
          region?: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan?: 'starter' | 'pro';
          region?: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      org_users: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'analyst';
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'analyst';
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'analyst';
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          status: 'draft' | 'active' | 'paused' | 'ended';
          start_at: string | null;
          end_at: string | null;
          goal: Record<string, any>;
          reward_policy: Record<string, any>;
          landing_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'ended';
          start_at?: string | null;
          end_at?: string | null;
          goal?: Record<string, any>;
          reward_policy: Record<string, any>;
          landing_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'ended';
          start_at?: string | null;
          end_at?: string | null;
          goal?: Record<string, any>;
          reward_policy?: Record<string, any>;
          landing_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          org_id: string;
          email: string | null;
          phone: string | null;
          name: string | null;
          locale: string;
          meta: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email?: string | null;
          phone?: string | null;
          name?: string | null;
          locale?: string;
          meta?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string | null;
          phone?: string | null;
          name?: string | null;
          locale?: string;
          meta?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      referral_links: {
        Row: {
          id: string;
          campaign_id: string;
          participant_id: string | null;
          code: string;
          utm: Record<string, any>;
          clicks_count: number;
          conversions_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          participant_id?: string | null;
          code: string;
          utm?: Record<string, any>;
          clicks_count?: number;
          conversions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          participant_id?: string | null;
          code?: string;
          utm?: Record<string, any>;
          clicks_count?: number;
          conversions_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          org_id: string;
          campaign_id: string;
          participant_id: string | null;
          link_id: string | null;
          type: 'click' | 'join' | 'purchase' | 'signup';
          value: number | null;
          ip: string | null;
          user_agent: string | null;
          referrer: string | null;
          meta: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          campaign_id: string;
          participant_id?: string | null;
          link_id?: string | null;
          type: 'click' | 'join' | 'purchase' | 'signup';
          value?: number | null;
          ip?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          meta?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          campaign_id?: string;
          participant_id?: string | null;
          link_id?: string | null;
          type?: 'click' | 'join' | 'purchase' | 'signup';
          value?: number | null;
          ip?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          meta?: Record<string, any>;
          created_at?: string;
        };
      };
      conversions: {
        Row: {
          id: string;
          org_id: string;
          campaign_id: string;
          referrer_participant_id: string | null;
          referee_participant_id: string | null;
          value: number | null;
          first_purchase: boolean;
          meta: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          campaign_id: string;
          referrer_participant_id?: string | null;
          referee_participant_id?: string | null;
          value?: number | null;
          first_purchase?: boolean;
          meta?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          campaign_id?: string;
          referrer_participant_id?: string | null;
          referee_participant_id?: string | null;
          value?: number | null;
          first_purchase?: boolean;
          meta?: Record<string, any>;
          created_at?: string;
        };
      };
      rewards: {
        Row: {
          id: string;
          org_id: string;
          participant_id: string | null;
          campaign_id: string | null;
          conversion_id: string | null;
          type: 'cash' | 'credit' | 'gift' | 'discount';
          amount: number;
          currency: string;
          status: 'pending' | 'approved' | 'paid' | 'void' | 'cancelled';
          reason: Record<string, any>;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          participant_id?: string | null;
          campaign_id?: string | null;
          conversion_id?: string | null;
          type: 'cash' | 'credit' | 'gift' | 'discount';
          amount: number;
          currency?: string;
          status?: 'pending' | 'approved' | 'paid' | 'void' | 'cancelled';
          reason?: Record<string, any>;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          participant_id?: string | null;
          campaign_id?: string | null;
          conversion_id?: string | null;
          type?: 'cash' | 'credit' | 'gift' | 'discount';
          amount?: number;
          currency?: string;
          status?: 'pending' | 'approved' | 'paid' | 'void' | 'cancelled';
          reason?: Record<string, any>;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fraud_signals: {
        Row: {
          id: string;
          org_id: string;
          event_id: string;
          score: number;
          reasons: any[];
          status: 'open' | 'ignored' | 'blocked' | 'resolved';
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          event_id: string;
          score: number;
          reasons?: any[];
          status?: 'open' | 'ignored' | 'blocked' | 'resolved';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          event_id?: string;
          score?: number;
          reasons?: any[];
          status?: 'open' | 'ignored' | 'blocked' | 'resolved';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_audit: {
        Row: {
          id: string;
          org_id: string;
          kind: 'copy' | 'reward_suggest' | 'moderation' | 'optimization';
          input_summary: string | null;
          output_summary: string | null;
          model: string | null;
          prompt_id: string | null;
          tokens_used: number | null;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          kind: 'copy' | 'reward_suggest' | 'moderation' | 'optimization';
          input_summary?: string | null;
          output_summary?: string | null;
          model?: string | null;
          prompt_id?: string | null;
          tokens_used?: number | null;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          kind?: 'copy' | 'reward_suggest' | 'moderation' | 'optimization';
          input_summary?: string | null;
          output_summary?: string | null;
          model?: string | null;
          prompt_id?: string | null;
          tokens_used?: number | null;
          cost?: number | null;
          created_at?: string;
        };
      };
    };
  };
}

// 타입 별칭
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrgUser = Database['public']['Tables']['org_users']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type Participant = Database['public']['Tables']['participants']['Row'];
export type ReferralLink = Database['public']['Tables']['referral_links']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Conversion = Database['public']['Tables']['conversions']['Row'];
export type Reward = Database['public']['Tables']['rewards']['Row'];
export type FraudSignal = Database['public']['Tables']['fraud_signals']['Row'];
export type AIAudit = Database['public']['Tables']['ai_audit']['Row'];
