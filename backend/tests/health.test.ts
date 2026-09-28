/**
 * tests/health.test.ts
 * Basic Health Check & API Route Tests
 */

import request from 'supertest';
import app from '../src/app';

describe('PetCare Backend API Health', () => {
  it('GET /api/health should return 200 OK and status information', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('PetCare API is active');
  });

  it('GET /api/unknown-route should return 404 Not Found', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
