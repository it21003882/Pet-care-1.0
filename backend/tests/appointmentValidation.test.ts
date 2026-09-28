/// <reference types="jest" />

/**
 * tests/appointmentValidation.test.ts
 * Tests for appointment validation logic (time and date formats)
 */

export {};

describe('Appointment Time Validation Pattern', () => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5]\d(\s*(AM|PM|am|pm))?$/i;

  it('should accept standard 12-hour AM/PM formats from booking UI', () => {
    expect(timeRegex.test('09:00 AM')).toBe(true);
    expect(timeRegex.test('10:00 AM')).toBe(true);
    expect(timeRegex.test('11:30 AM')).toBe(true);
    expect(timeRegex.test('02:00 PM')).toBe(true);
    expect(timeRegex.test('03:30 PM')).toBe(true);
    expect(timeRegex.test('04:30 PM')).toBe(true);
    expect(timeRegex.test('9:00 AM')).toBe(true);
    expect(timeRegex.test('2:00 PM')).toBe(true);
  });

  it('should accept 24-hour military formats', () => {
    expect(timeRegex.test('09:00')).toBe(true);
    expect(timeRegex.test('14:00')).toBe(true);
    expect(timeRegex.test('23:59')).toBe(true);
    expect(timeRegex.test('00:00')).toBe(true);
  });

  it('should reject invalid time values', () => {
    expect(timeRegex.test('25:00')).toBe(false);
    expect(timeRegex.test('12:65')).toBe(false);
    expect(timeRegex.test('random string')).toBe(false);
    expect(timeRegex.test('')).toBe(false);
  });
});

describe('Booking Date Restriction Logic', () => {
  const isPastDate = (val: string): boolean => {
    const parts = val.split('T')[0].split('-');
    if (parts.length !== 3) return false;
    const bookingDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  it('should reject previous/past dates', () => {
    expect(isPastDate('2020-01-01')).toBe(true);
    expect(isPastDate('2023-12-31')).toBe(true);
    expect(isPastDate('2025-05-10')).toBe(true);
  });

  it('should accept today and future dates', () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(isPastDate(todayStr)).toBe(false);

    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const futureStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
    expect(isPastDate(futureStr)).toBe(false);
  });
});

describe('Phone Number Validation & Requirements (Strict 10 Digits)', () => {
  const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
    const trimmed = phone.trim();
    if (!trimmed) {
      return { isValid: false, error: 'Phone number is required' };
    }
    if (!/^\d{10}$/.test(trimmed)) {
      return { isValid: false, error: 'Phone number must be exactly 10 numbers' };
    }
    return { isValid: true };
  };

  it('should reject numbers that are not exactly 10 digits', () => {
    expect(validatePhone('12345').isValid).toBe(false);
    expect(validatePhone('12345').error).toBe('Phone number must be exactly 10 numbers');
    expect(validatePhone('071234567').isValid).toBe(false);
    expect(validatePhone('07123456789').isValid).toBe(false);
    expect(validatePhone('077010199a').isValid).toBe(false);
    expect(validatePhone('+94770101999').isValid).toBe(false);
  });

  it('should accept valid 10-digit phone numbers', () => {
    expect(validatePhone('0770101999').isValid).toBe(true);
    expect(validatePhone('0712345678').isValid).toBe(true);
    expect(validatePhone('0112345678').isValid).toBe(true);
  });
});
