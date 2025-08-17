import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NextRequest } from 'next/server';
import ReferralPage from '@/app/r/[code]/page';
import { createServerSupabaseClient } from '@/lib/supabase';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/utils', () => ({
  getDeviceInfo: vi.fn(() => ({
    userAgent: 'test-user-agent',
    language: 'ko-KR',
    platform: 'test-platform',
  })),
  setCookie: vi.fn(),
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      eq: vi.fn(),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
};

describe('/r/[code] Referral Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createServerSupabaseClient as any).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Valid Referral Link', () => {
    const mockReferralLink = {
      id: 'test-link-id',
      code: 'TEST123',
      campaign_id: 'test-campaign-id',
      participant_id: 'test-participant-id',
      clicks_count: 5,
      conversions_count: 2,
      utm: { utm_source: 'test', utm_medium: 'email' },
      campaigns: {
        id: 'test-campaign-id',
        org_id: 'test-org-id',
        name: 'Test Campaign',
        status: 'active',
        landing_url: 'https://example.com/landing',
      },
    };

    beforeEach(() => {
      // Mock successful referral link fetch
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockReferralLink,
        error: null,
      });

      // Mock successful event insert
      mockSupabase.from().insert.mockResolvedValue({
        data: { id: 'test-event-id' },
        error: null,
      });

      // Mock successful clicks count update
      mockSupabase.from().update().eq.mockResolvedValue({
        data: { clicks_count: 6 },
        error: null,
      });
    });

    it('should render redirect page with loading spinner', async () => {
      const { container } = render(
        <ReferralPage params={{ code: 'TEST123' }} />
      );

      await waitFor(() => {
        expect(screen.getByText('리다이렉트 중...')).toBeInTheDocument();
        expect(screen.getByText('잠시만 기다려주세요.')).toBeInTheDocument();
      });

      // Check for loading spinner
      const spinner = container.querySelector('[style*="animation: spin"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should include redirect script with correct code', async () => {
      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        const scriptContent = document.querySelector('script');
        expect(scriptContent).toBeInTheDocument();
        expect(scriptContent?.textContent).toContain('ref_code=TEST123');
        expect(scriptContent?.textContent).toContain('https://example.com/landing');
      });
    });

    it('should set correct meta tags', async () => {
      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        expect(document.title).toBe('리다이렉트 중...');
        const robotsMeta = document.querySelector('meta[name="robots"]');
        expect(robotsMeta).toHaveAttribute('content', 'noindex, nofollow');
      });
    });

    it('should record click event with correct data', async () => {
      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('events');
        expect(mockSupabase.from().insert).toHaveBeenCalledWith({
          org_id: 'test-org-id',
          campaign_id: 'test-campaign-id',
          participant_id: 'test-participant-id',
          link_id: 'test-link-id',
          type: 'click',
          ip: '127.0.0.1',
          user_agent: 'Server-side recording',
          referrer: 'referral_link',
          meta: {
            code: 'TEST123',
            utm: { utm_source: 'test', utm_medium: 'email' },
          },
        });
      });
    });

    it('should update clicks count', async () => {
      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('referral_links');
        expect(mockSupabase.from().update).toHaveBeenCalledWith({
          clicks_count: 6,
        });
        expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', 'test-link-id');
      });
    });
  });

  describe('Invalid Referral Link', () => {
    it('should redirect to 404 for non-existent code', async () => {
      const { redirect } = await import('next/navigation');
      
      // Mock referral link not found
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      render(<ReferralPage params={{ code: 'INVALID123' }} />);

      await waitFor(() => {
        expect(redirect).toHaveBeenCalledWith('/404');
      });
    });

    it('should redirect to 404 for database error', async () => {
      const { redirect } = await import('next/navigation');
      
      // Mock database error
      mockSupabase.from().select().eq().single.mockRejectedValue(
        new Error('Database connection failed')
      );

      render(<ReferralPage params={{ code: 'ERROR123' }} />);

      await waitFor(() => {
        expect(redirect).toHaveBeenCalledWith('/error');
      });
    });
  });

  describe('Inactive Campaign', () => {
    it('should redirect to campaign-inactive for inactive campaign', async () => {
      const { redirect } = await import('next/navigation');
      
      const inactiveReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        campaigns: {
          id: 'test-campaign-id',
          status: 'paused',
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: inactiveReferralLink,
        error: null,
      });

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        expect(redirect).toHaveBeenCalledWith('/campaign-inactive');
      });
    });

    it('should redirect to campaign-inactive for ended campaign', async () => {
      const { redirect } = await import('next/navigation');
      
      const endedReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        campaigns: {
          id: 'test-campaign-id',
          status: 'ended',
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: endedReferralLink,
        error: null,
      });

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        expect(redirect).toHaveBeenCalledWith('/campaign-inactive');
      });
    });
  });

  describe('Event Recording Errors', () => {
    it('should continue redirect even if event recording fails', async () => {
      const mockReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        clicks_count: 5,
        campaigns: {
          id: 'test-campaign-id',
          org_id: 'test-org-id',
          status: 'active',
          landing_url: 'https://example.com/landing',
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockReferralLink,
        error: null,
      });

      // Mock event recording failure
      mockSupabase.from().insert.mockRejectedValue(
        new Error('Event recording failed')
      );

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      // Should still render the redirect page
      await waitFor(() => {
        expect(screen.getByText('리다이렉트 중...')).toBeInTheDocument();
      });
    });

    it('should continue redirect even if clicks count update fails', async () => {
      const mockReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        clicks_count: 5,
        campaigns: {
          id: 'test-campaign-id',
          org_id: 'test-org-id',
          status: 'active',
          landing_url: 'https://example.com/landing',
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockReferralLink,
        error: null,
      });

      // Mock successful event insert
      mockSupabase.from().insert.mockResolvedValue({
        data: { id: 'test-event-id' },
        error: null,
      });

      // Mock clicks count update failure
      mockSupabase.from().update().eq.mockRejectedValue(
        new Error('Update failed')
      );

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      // Should still render the redirect page
      await waitFor(() => {
        expect(screen.getByText('리다이렉트 중...')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle referral link without participant_id', async () => {
      const mockReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        campaign_id: 'test-campaign-id',
        participant_id: null, // No participant
        clicks_count: 5,
        campaigns: {
          id: 'test-campaign-id',
          org_id: 'test-org-id',
          status: 'active',
          landing_url: 'https://example.com/landing',
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockReferralLink,
        error: null,
      });

      mockSupabase.from().insert.mockResolvedValue({
        data: { id: 'test-event-id' },
        error: null,
      });

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        expect(mockSupabase.from().insert).toHaveBeenCalledWith(
          expect.objectContaining({
            participant_id: null,
          })
        );
      });
    });

    it('should handle referral link without landing_url', async () => {
      const mockReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        campaigns: {
          id: 'test-campaign-id',
          org_id: 'test-org-id',
          status: 'active',
          landing_url: null, // No landing URL
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockReferralLink,
        error: null,
      });

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        const scriptContent = document.querySelector('script');
        expect(scriptContent?.textContent).toContain("window.location.href = '/'");
      });
    });

    it('should handle empty UTM parameters', async () => {
      const mockReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        utm: {}, // Empty UTM
        campaigns: {
          id: 'test-campaign-id',
          org_id: 'test-org-id',
          status: 'active',
          landing_url: 'https://example.com/landing',
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockReferralLink,
        error: null,
      });

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        expect(mockSupabase.from().insert).toHaveBeenCalledWith(
          expect.objectContaining({
            meta: {
              code: 'TEST123',
              utm: {},
            },
          })
        );
      });
    });
  });

  describe('Security', () => {
    it('should not expose sensitive data in HTML', async () => {
      const mockReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        campaigns: {
          id: 'test-campaign-id',
          org_id: 'test-org-id',
          status: 'active',
          landing_url: 'https://example.com/landing',
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockReferralLink,
        error: null,
      });

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        const htmlContent = document.documentElement.innerHTML;
        // Should not expose internal IDs
        expect(htmlContent).not.toContain('test-org-id');
        expect(htmlContent).not.toContain('test-campaign-id');
        expect(htmlContent).not.toContain('test-link-id');
        // Should only expose the code
        expect(htmlContent).toContain('TEST123');
      });
    });

    it('should set appropriate security headers', async () => {
      const mockReferralLink = {
        id: 'test-link-id',
        code: 'TEST123',
        campaigns: {
          id: 'test-campaign-id',
          org_id: 'test-org-id',
          status: 'active',
          landing_url: 'https://example.com/landing',
        },
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockReferralLink,
        error: null,
      });

      render(<ReferralPage params={{ code: 'TEST123' }} />);

      await waitFor(() => {
        const robotsMeta = document.querySelector('meta[name="robots"]');
        expect(robotsMeta).toHaveAttribute('content', 'noindex, nofollow');
      });
    });
  });
});
