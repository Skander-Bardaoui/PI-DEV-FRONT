// src/utils/print-pdf.utils.test.ts

import { describe, it, expect, vi } from 'vitest';
import { fmtAmt, fmtDate, fmtDateShort, r3 } from './print-pdf.utils';

describe('print-pdf.utils', () => {
  describe('fmtAmt', () => {
    it('should format number as TND currency', () => {
      const result = fmtAmt(1000);
      expect(result).toContain('TND');
      expect(result).toContain('1');
    });

    it('should format string number as TND currency', () => {
      const result = fmtAmt('2500.500');
      expect(result).toContain('TND');
      expect(result).toContain('2');
    });

    it('should handle zero', () => {
      const result = fmtAmt(0);
      expect(result).toContain('0');
      expect(result).toContain('TND');
    });

    it('should handle negative numbers', () => {
      const result = fmtAmt(-100);
      expect(result).toContain('TND');
    });

    it('should handle invalid string', () => {
      const result = fmtAmt('invalid');
      expect(result).toContain('0');
      expect(result).toContain('TND');
    });
  });

  describe('fmtDate', () => {
    it('should format date in long format', () => {
      const result = fmtDate('2024-01-15');
      expect(result).toBeTruthy();
      expect(result).not.toBe('—');
    });

    it('should return dash for empty string', () => {
      const result = fmtDate('');
      expect(result).toBe('—');
    });

    it('should handle ISO date format', () => {
      const result = fmtDate('2024-12-25T10:00:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('—');
    });
  });

  describe('fmtDateShort', () => {
    it('should format date in short format', () => {
      const result = fmtDateShort('2024-01-15');
      expect(result).toBeTruthy();
      expect(result).not.toBe('—');
    });

    it('should return dash for empty string', () => {
      const result = fmtDateShort('');
      expect(result).toBe('—');
    });

    it('should handle ISO date format', () => {
      const result = fmtDateShort('2024-12-25T10:00:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('—');
    });
  });

  describe('r3', () => {
    it('should round number to 3 decimals', () => {
      expect(r3(1.23456)).toBe(1.235);
    });

    it('should round string number to 3 decimals', () => {
      expect(r3('2.34567')).toBe(2.346);
    });

    it('should handle integers', () => {
      expect(r3(5)).toBe(5);
    });

    it('should handle zero', () => {
      expect(r3(0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(r3(-3.14159)).toBe(-3.142);
    });

    it('should handle invalid string as zero', () => {
      expect(r3('invalid')).toBe(0);
    });

    it('should round up correctly', () => {
      expect(r3(1.9999)).toBe(2);
    });

    it('should round down correctly', () => {
      expect(r3(1.1111)).toBe(1.111);
    });
  });
});
