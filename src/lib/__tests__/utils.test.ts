import { describe, it, expect } from 'vitest';
import { 
  generateShortCode, 
  formatCurrency, 
  formatDate, 
  timeAgo,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  abbreviateNumber
} from '../utils';

describe('Utils Functions', () => {
  describe('generateShortCode', () => {
    it('should generate a code with default length of 6', () => {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('should generate a code with custom length', () => {
      const code = generateShortCode(8);
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in Korean won', () => {
      expect(formatCurrency(1000)).toBe('₩1,000');
      expect(formatCurrency(1000000)).toBe('₩1,000,000');
      expect(formatCurrency(1234.56)).toBe('₩1,235');
    });

    it('should format currency with custom currency', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$1,000');
    });
  });

  describe('formatDate', () => {
    it('should format date in Korean locale', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('1월');
    });
  });

  describe('timeAgo', () => {
    it('should return "방금 전" for very recent dates', () => {
      const now = new Date();
      expect(timeAgo(now)).toBe('방금 전');
    });

    it('should return minutes ago for recent dates', () => {
      const date = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      expect(timeAgo(date)).toBe('30분 전');
    });

    it('should return hours ago for older dates', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      expect(timeAgo(date)).toBe('2시간 전');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.kr')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct Korean phone numbers', () => {
      expect(isValidPhone('010-1234-5678')).toBe(true);
      expect(isValidPhone('01012345678')).toBe(true);
      expect(isValidPhone('02-1234-5678')).toBe(true);
      expect(isValidPhone('031-123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123-456-789')).toBe(false);
      expect(isValidPhone('010-123-456')).toBe(false);
      expect(isValidPhone('invalid')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://www.example.co.kr/path?param=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('abbreviateNumber', () => {
    it('should abbreviate large numbers', () => {
      expect(abbreviateNumber(1000)).toBe('1.0K');
      expect(abbreviateNumber(1500)).toBe('1.5K');
      expect(abbreviateNumber(1000000)).toBe('1.0M');
      expect(abbreviateNumber(2500000)).toBe('2.5M');
    });

    it('should return original number for small numbers', () => {
      expect(abbreviateNumber(999)).toBe('999');
      expect(abbreviateNumber(100)).toBe('100');
      expect(abbreviateNumber(0)).toBe('0');
    });
  });
});
