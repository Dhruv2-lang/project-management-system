import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app, auth, prisma, registerUser, resetDb } from './helpers';

beforeAll(resetDb);

describe('AUTH', () => {
  const email = 'alice@example.com';
  let token: string;

  it('registers a user and never returns the password or hash', async () => {
    const res = await request(app).post('/api/auth/register').send({ fullName: 'Alice', email: 'Alice@Example.com ', password: 'Passw0rdOK' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({ fullName: 'Alice', email });
    expect(res.body.data.token).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|Passw0rdOK/);
    token = res.body.data.token;
  });

  it('stores a bcrypt hash, not the plaintext password', async () => {
    const row = await prisma.user.findUnique({ where: { email } });
    expect(row!.passwordHash).not.toBe('Passw0rdOK');
    expect(row!.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it('rejects duplicate email (case-insensitive) with 409', async () => {
    const res = await request(app).post('/api/auth/register').send({ fullName: 'Alice 2', email: 'ALICE@example.com', password: 'Passw0rdOK' });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it.each([
    [{ email, password: 'Passw0rdOK' }, 'fullName'],
    [{ fullName: 'X', email: 'not-an-email', password: 'Passw0rdOK' }, 'email'],
    [{ fullName: 'X', email: 'x@example.com', password: 'short1' }, 'password'],
    [{ fullName: 'X', email: 'x@example.com', password: 'allletters' }, 'password'],
    [{ fullName: 'X', email: 'x@example.com' }, 'password'],
  ])('rejects invalid registration %#', async (body, field) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(422);
    expect(res.body.errors.map((e: any) => e.field)).toContain(field);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'Passw0rdOK' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe(email);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });

  it('rejects wrong password and unknown email with the same generic 401', async () => {
    const wrong = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass1' });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'WrongPass1' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it('GET /me works with a valid token', async () => {
    const res = await request(app).get('/api/auth/me').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });

  it('GET /me without a token -> 401', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });

  it('GET /me with an invalid token -> 401', async () => {
    expect((await request(app).get('/api/auth/me').set(auth('garbage.token.value'))).status).toBe(401);
  });

  it('rejects a token signed with the wrong secret, an expired token, and alg=none', async () => {
    const { user } = await registerUser('Bob', 'bob@example.com');
    const forged = jwt.sign({ sub: user.id }, 'some-other-secret-some-other-secret');
    const expired = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: -10 });
    const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: user.id })).toString('base64url')}.`;
    for (const t of [forged, expired, none]) {
      expect((await request(app).get('/api/auth/me').set(auth(t))).status).toBe(401);
    }
  });

  it('a valid token for a deleted user stops working', async () => {
    const { token: t, user } = await registerUser('Temp', 'temp@example.com');
    await prisma.user.delete({ where: { id: user.id } });
    expect((await request(app).get('/api/auth/me').set(auth(t))).status).toBe(401);
  });

  it('logout returns 200 and states that the client must discard the token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/client/i);
  });

  it('protected resources reject unauthenticated access', async () => {
    for (const path of ['/api/projects', '/api/tasks', '/api/dashboard']) {
      expect((await request(app).get(path)).status).toBe(401);
    }
  });
});
