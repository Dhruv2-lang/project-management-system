import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { app, resetDb } from './helpers';

beforeAll(resetDb);

describe('SECURITY', () => {
  it('auth rate limiting returns 429 after too many attempts', async () => {
    const limited = createApp({ authRateLimitMax: 3 });
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(limited).post('/api/auth/login').send({ email: 'x@example.com', password: 'WrongPass1' });
      statuses.push(res.status);
      if (res.status === 429) expect(res.body).toMatchObject({ success: false });
    }
    expect(statuses).toEqual([401, 401, 401, 429, 429]);
  });

  it('CORS: allows the configured origin and localhost in dev, blocks others', async () => {
    const allowed = await request(app).options('/api/projects').set('Origin', 'https://app.example.com')
      .set('Access-Control-Request-Method', 'GET').set('Access-Control-Request-Headers', 'authorization');
    expect(allowed.headers['access-control-allow-origin']).toBe('https://app.example.com');

    const localhost = await request(app).get('/api/health').set('Origin', 'http://localhost:8081');
    expect(localhost.headers['access-control-allow-origin']).toBe('http://localhost:8081');

    const evil = await request(app).get('/api/health').set('Origin', 'https://evil.example.org');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('sets Helmet security headers and hides X-Powered-By', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('returns consistent JSON for unknown routes and never leaks internals', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
    expect(JSON.stringify(res.body)).not.toMatch(/stack|node_modules|prisma/i);
  });

  it('rejects oversized request bodies', async () => {
    const res = await request(app).post('/api/auth/register').send({ fullName: 'x'.repeat(200_000), email: 'a@b.co', password: 'Passw0rdOK' });
    expect(res.status).toBe(413);
  });
});
