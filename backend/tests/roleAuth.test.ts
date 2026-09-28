/**
 * tests/roleAuth.test.ts
 * Tests for Role-based Access Control and Normalization
 */

import { normalizeRole } from '../src/middleware/roleMiddleware';

describe('Role Authorization & Normalization Logic', () => {
  it('should normalize customer and owner roles to "customer"', () => {
    expect(normalizeRole('owner')).toBe('customer');
    expect(normalizeRole('CUSTOMER')).toBe('customer');
    expect(normalizeRole('Owner')).toBe('customer');
    expect(normalizeRole('customer')).toBe('customer');
  });

  it('should normalize veterinarian, service_center, and admin roles', () => {
    expect(normalizeRole('VETERINARIAN')).toBe('veterinarian');
    expect(normalizeRole('veterinarian')).toBe('veterinarian');
    expect(normalizeRole('SERVICE_CENTER')).toBe('service_center');
    expect(normalizeRole('service_center')).toBe('service_center');
    expect(normalizeRole('ADMIN')).toBe('admin');
    expect(normalizeRole('admin')).toBe('admin');
  });
});
