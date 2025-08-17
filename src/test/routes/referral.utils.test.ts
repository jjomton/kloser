import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateShortCode, parseUtmParams, getDeviceInfo } from '@/lib/utils';

describe('Referral Link Utilities', () => {
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

    it('should generate code with custom length', () => {
      const code = generateShortCode(8);
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
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

    it('should handle malformed URLs', () => {
      const url = 'not-a-valid-url';
      const utmParams = parseUtmParams(url);
      
      expect(utmParams).toEqual({});
    });

    it('should handle partial UTM parameters', () => {
      const url = 'https://example.com?utm_source=email&other=param';
      const utmParams = parseUtmParams(url);
      
      expect(utmParams).toEqual({
        utm_source: 'email',
      });
    });
  });

  describe('getDeviceInfo', () => {
    beforeEach(() => {
      // Mock browser environment
      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          language: 'ko-KR',
          platform: 'Win32',
        },
        writable: true,
      });

      Object.defineProperty(window, 'screen', {
        value: {
          width: 1920,
          height: 1080,
        },
        writable: true,
      });

      Object.defineProperty(window, 'Intl', {
        value: {
          DateTimeFormat: () => ({
            resolvedOptions: () => ({
              timeZone: 'Asia/Seoul',
            }),
          }),
        },
        writable: true,
      });
    });

    it('should return device information', () => {
      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo).toEqual({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        language: 'ko-KR',
        platform: 'Win32',
        screenWidth: 1920,
        screenHeight: 1080,
        timezone: 'Asia/Seoul',
      });
    });

    it('should handle missing navigator properties', () => {
      // Mock missing navigator properties
      Object.defineProperty(window, 'navigator', {
        value: {},
        writable: true,
      });

      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo.userAgent).toBe('');
      expect(deviceInfo.language).toBe('');
      expect(deviceInfo.platform).toBe('');
    });

    it('should handle missing screen properties', () => {
      // Mock missing screen properties
      Object.defineProperty(window, 'screen', {
        value: {},
        writable: true,
      });

      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo.screenWidth).toBe(0);
      expect(deviceInfo.screenHeight).toBe(0);
    });

    it('should handle missing timezone', () => {
      // Mock missing timezone
      Object.defineProperty(window, 'Intl', {
        value: {
          DateTimeFormat: () => ({
            resolvedOptions: () => ({}),
          }),
        },
        writable: true,
      });

      const deviceInfo = getDeviceInfo();
      
      expect(deviceInfo.timezone).toBe('');
    });
  });
});

describe('Referral Link Validation', () => {
  describe('Code Format Validation', () => {
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

  describe('URL Validation', () => {
    it('should validate correct landing URLs', () => {
      const validUrls = [
        'https://example.com',
        'https://example.com/landing',
        'https://example.com/landing?param=value',
        'http://localhost:3000',
        'https://app.example.com',
      ];
      
      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
      ];
      
      invalidUrls.forEach(url => {
        expect(() => new URL(url)).toThrow();
      });
    });
  });
});

describe('Referral Link Analytics', () => {
  describe('Click Tracking', () => {
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

describe('Referral Link Performance', () => {
  describe('Code Generation Performance', () => {
    it('should generate codes quickly', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        generateShortCode();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should generate 1000 codes in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent code generation', () => {
      const codes = new Set();
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              codes.add(generateShortCode());
              resolve();
            }, Math.random() * 10);
          })
        );
      }
      
      return Promise.all(promises).then(() => {
        expect(codes.size).toBe(100);
      });
    });
  });

  describe('URL Parsing Performance', () => {
    it('should parse URLs quickly', () => {
      const testUrls = [
        'https://example.com?utm_source=email&utm_medium=newsletter',
        'https://example.com?utm_campaign=summer2024&utm_content=banner',
        'https://example.com?utm_source=social&utm_medium=facebook',
      ];
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        testUrls.forEach(url => parseUtmParams(url));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should parse 3000 URLs in less than 50ms
      expect(duration).toBeLessThan(50);
    });
  });
});
