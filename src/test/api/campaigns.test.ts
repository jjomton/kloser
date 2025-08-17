import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
      single: vi.fn()
    }))
  })),
  getCurrentUserPrimaryOrg: vi.fn()
}));

// Mock the API routes
vi.mock('@/app/api/campaigns/route', async () => {
  const actual = await vi.importActual('@/app/api/campaigns/route');
  return {
    ...actual,
    GET: vi.fn(),
    POST: vi.fn()
  };
});

describe('Campaigns API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/campaigns', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { GET } = await import('@/app/api/campaigns/route');
      const { createServerSupabaseClient } = await import('@/lib/supabase');
      
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
        }
      };
      
      vi.mocked(createServerSupabaseClient).mockReturnValue(mockSupabase as any);
      
      const request = new NextRequest('http://localhost:3000/api/campaigns');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when no organization is found', async () => {
      const { GET } = await import('@/app/api/campaigns/route');
      const { createServerSupabaseClient, getCurrentUserPrimaryOrg } = await import('@/lib/supabase');
      
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'user-123' } }, 
            error: null 
          })
        }
      };
      
      vi.mocked(createServerSupabaseClient).mockReturnValue(mockSupabase as any);
      vi.mocked(getCurrentUserPrimaryOrg).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/campaigns');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('No organization found');
    });
  });

  describe('POST /api/campaigns', () => {
    it('should return 400 when required fields are missing', async () => {
      const { POST } = await import('@/app/api/campaigns/route');
      const { createServerSupabaseClient, getCurrentUserPrimaryOrg } = await import('@/lib/supabase');
      
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'user-123' } }, 
            error: null 
          })
        }
      };
      
      vi.mocked(createServerSupabaseClient).mockReturnValue(mockSupabase as any);
      vi.mocked(getCurrentUserPrimaryOrg).mockResolvedValue({ id: 'org-123' } as any);
      
      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Campaign' }) // missing required fields
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 when landing URL is invalid', async () => {
      const { POST } = await import('@/app/api/campaigns/route');
      const { createServerSupabaseClient, getCurrentUserPrimaryOrg } = await import('@/lib/supabase');
      
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'user-123' } }, 
            error: null 
          })
        }
      };
      
      vi.mocked(createServerSupabaseClient).mockReturnValue(mockSupabase as any);
      vi.mocked(getCurrentUserPrimaryOrg).mockResolvedValue({ id: 'org-123' } as any);
      
      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Campaign',
          landing_url: 'invalid-url',
          reward_type: 'cash',
          reward_value: 10
        })
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid landing URL');
    });
  });
});
