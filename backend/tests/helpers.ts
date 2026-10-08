import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

export const app = createApp();
export { prisma };

export async function resetDb() {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

export async function registerUser(name: string, email: string, password = 'Passw0rdOK') {
  const res = await request(app).post('/api/auth/register').send({ fullName: name, email, password });
  return { token: res.body.data.token as string, user: res.body.data.user, res };
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
