import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateShortCode, parseUtmParams } from '@/lib/utils';

describe('Referral Link Basic Tests', () => {
  describe('generateShortCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
      expect(typeof code).toBe('string');
    });

    it('should generate alphanumeric codes', () => {
      const code = generateShortCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('parseUtmParams', () => {
    it('should parse UTM parameters from URL', () => {
      const url = 'https://example.com?utm_source=email&utm_medium=newsletter&utm_campaign=summer2024';
      const utmParams = parseUtmParams(url);
      
      expect(utmParams).toEqual({
        utm_source: 'email',
        utm_medium: 'newsletter',
        utm_campaign: 'summer2024',
      });
    });

    it('should handle URL without UTM parameters', () => {
      const url = 'https://example.com?other=param';
      const utmParams = parseUtmParams(url);
      
      expect(utmParams).toEqual({});
    });

    it('should handle URL with no parameters', () => {
      const url = 'https://example.com';
      const utmParams = parseUtmParams(url);
      
      expect(utmParams).toEqual({});
    });
  });

  describe('Referral Link Validation', () => {
    it('should validate correct code format', () => {
      const validCodes = ['ABC123', 'XYZ789', 'TEST01', 'REF456'];
      
      validCodes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{6}$/);
      });
    });

    it('should reject invalid code formats', () => {
      const invalidCodes = [
        'abc123', // lowercase
        'ABC12',  // too short
        'ABC1234', // too long
        'ABC-123', // contains special characters
        'ABC 123', // contains spaces
      ];
      
      invalidCodes.forEach(code => {
        expect(code).not.toMatch(/^[A-Z0-9]{6}$/);
      });
    });
  });

  describe('Referral Link Analytics', () => {
    it('should calculate click-through rate', () => {
      const calculateCTR = (clicks: number, impressions: number) => {
        if (impressions === 0) return 0;
        return (clicks / impressions) * 100;
      };

      expect(calculateCTR(10, 100)).toBe(10);
      expect(calculateCTR(0, 100)).toBe(0);
      expect(calculateCTR(100, 100)).toBe(100);
      expect(calculateCTR(5, 0)).toBe(0);
    });

    it('should calculate conversion rate', () => {
      const calculateConversionRate = (conversions: number, clicks: number) => {
        if (clicks === 0) return 0;
        return (conversions / clicks) * 100;
      };

      expect(calculateConversionRate(5, 100)).toBe(5);
      expect(calculateConversionRate(0, 100)).toBe(0);
      expect(calculateConversionRate(100, 100)).toBe(100);
      expect(calculateConversionRate(5, 0)).toBe(0);
    });
  });

  describe('Fraud Detection', () => {
    it('should detect suspicious click patterns', () => {
      const detectSuspiciousClicks = (clicks: number, timeWindow: number) => {
        const clicksPerHour = clicks / timeWindow;
        return clicksPerHour > 50; // More than 50 clicks per hour is suspicious
      };

      expect(detectSuspiciousClicks(60, 1)).toBe(true);  // 60 clicks in 1 hour
      expect(detectSuspiciousClicks(30, 1)).toBe(false); // 30 clicks in 1 hour
      expect(detectSuspiciousClicks(100, 2)).toBe(false); // 50 clicks per hour average
    });

    it('should detect same IP multiple clicks', () => {
      const detectSameIPClicks = (clicks: any[]) => {
        const ipCounts = clicks.reduce((acc, click) => {
          acc[click.ip] = (acc[click.ip] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.values(ipCounts).some(count => count > 10);
      };

      const normalClicks = [
        { ip: '192.168.1.1' },
        { ip: '192.168.1.2' },
        { ip: '192.168.1.3' },
      ];

      const suspiciousClicks = [
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
        { ip: '192.168.1.1' },
      ];

      expect(detectSameIPClicks(normalClicks)).toBe(false);
      expect(detectSameIPClicks(suspiciousClicks)).toBe(true);
    });
  });
});
