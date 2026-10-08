import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app, auth, prisma, registerUser, resetDb } from './helpers';

let alice: string;
let bob: string;
let aliceId: string;
const ids: Record<string, string> = {};
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

beforeAll(async () => {
  await resetDb();
  const a = await registerUser('Alice', 'alice@example.com');
  const b = await registerUser('Bob', 'bob@example.com');
  alice = a.token;
  aliceId = a.user.id;
  bob = b.token;
});

describe('PROJECTS', () => {
  it('creates projects (defaults + explicit values)', async () => {
    const web = await request(app).post('/api/projects').set(auth(alice))
      .send({ name: 'Website Redesign', description: 'New marketing site', status: 'IN_PROGRESS', startDate: '2026-01-01', endDate: '2026-06-30' });
    expect(web.status).toBe(201);
    expect(web.body.data).toMatchObject({ name: 'Website Redesign', status: 'IN_PROGRESS', taskCount: 0 });
    ids.web = web.body.data.id;

    const mobile = await request(app).post('/api/projects').set(auth(alice)).send({ name: 'Mobile App' });
    expect(mobile.status).toBe(201);
    expect(mobile.body.data.status).toBe('NOT_STARTED'); // default
    ids.mobile = mobile.body.data.id;

    const done = await request(app).post('/api/projects').set(auth(alice)).send({ name: 'Old Audit', status: 'COMPLETED' });
    ids.done = done.body.data.id;
  });

  it('ignores a client-supplied userId (owner always comes from the JWT)', async () => {
    const bobUser = await prisma.user.findUnique({ where: { email: 'bob@example.com' } });
    const res = await request(app).post('/api/projects').set(auth(alice)).send({ name: 'Sneaky', userId: bobUser!.id });
    expect(res.status).toBe(201);
    const row = await prisma.project.findUnique({ where: { id: res.body.data.id } });
    expect(row!.userId).toBe(aliceId);
    await request(app).delete(`/api/projects/${res.body.data.id}`).set(auth(alice));
  });

  it.each([
    [{ description: 'no name' }],
    [{ name: '   ' }],
    [{ name: 'X', status: 'DONE' }],
    [{ name: 'X', startDate: 'tomorrow' }],
    [{ name: 'X', startDate: '2026-02-31' }],
    [{ name: 'X', startDate: '2026-05-01', endDate: '2026-04-01' }],
  ])('rejects invalid project %#', async (body) => {
    const res = await request(app).post('/api/projects').set(auth(alice)).send(body);
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('lists only my projects', async () => {
    const res = await request(app).get('/api/projects').set(auth(alice));
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect((await request(app).get('/api/projects').set(auth(bob))).body.data).toEqual([]);
  });

  it('gets a single project', async () => {
    const res = await request(app).get(`/api/projects/${ids.web}`).set(auth(alice));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(ids.web);
  });

  it('searches and filters projects (and combines them)', async () => {
    const q = (qs: string) => request(app).get(`/api/projects?${qs}`).set(auth(alice));
    expect((await q('search=website')).body.data.map((p: any) => p.name)).toEqual(['Website Redesign']);
    expect((await q('search=MARKETING')).body.count).toBe(1); // matches description, case-insensitive
    expect((await q('status=IN_PROGRESS')).body.count).toBe(1);
    expect((await q('status=COMPLETED')).body.data[0].name).toBe('Old Audit');
    expect((await q('search=website&status=COMPLETED')).body.count).toBe(0);
    expect((await q('status=BOGUS')).status).toBe(422);
  });

  it('SQL-injection-style input is treated as plain text', async () => {
    const res = await request(app).get('/api/projects').query({ search: "'; DROP TABLE \"Project\"; --" }).set(auth(alice));
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(await prisma.project.count()).toBeGreaterThan(0); // table still exists with data
    expect((await request(app).get("/api/projects/1' OR '1'='1").set(auth(alice))).status).toBe(400);
  });

  it('updates a project (partial update)', async () => {
    const res = await request(app).put(`/api/projects/${ids.mobile}`).set(auth(alice)).send({ status: 'IN_PROGRESS', description: 'Expo app' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Mobile App', status: 'IN_PROGRESS', description: 'Expo app' });
  });

  it('validates date order against stored values on update, and rejects empty updates', async () => {
    const bad = await request(app).put(`/api/projects/${ids.web}`).set(auth(alice)).send({ endDate: '2025-12-31' }); // stored start = 2026-01-01
    expect(bad.status).toBe(422);
    expect((await request(app).put(`/api/projects/${ids.web}`).set(auth(alice)).send({})).status).toBe(422);
  });

  it("OWNERSHIP: Bob cannot read, update or delete Alice's project", async () => {
    expect((await request(app).get(`/api/projects/${ids.web}`).set(auth(bob))).status).toBe(404);
    expect((await request(app).put(`/api/projects/${ids.web}`).set(auth(bob)).send({ name: 'Hacked' })).status).toBe(404);
    expect((await request(app).delete(`/api/projects/${ids.web}`).set(auth(bob))).status).toBe(404);
    const row = await prisma.project.findUnique({ where: { id: ids.web } });
    expect(row!.name).toBe('Website Redesign'); // untouched
  });

  it('returns 404 for unknown ids and 400 for malformed ids', async () => {
    expect((await request(app).get(`/api/projects/${UNKNOWN_ID}`).set(auth(alice))).status).toBe(404);
    expect((await request(app).get('/api/projects/not-a-uuid').set(auth(alice))).status).toBe(400);
  });
});

describe('TASKS', () => {
  it('creates tasks (defaults + explicit values)', async () => {
    const r = await request(app).post('/api/tasks').set(auth(alice))
      .send({ projectId: ids.web, name: 'Write report', description: 'Quarterly', priority: 'HIGH', status: 'PENDING', dueDate: '2026-11-01' });
    expect(r.status).toBe(201);
    expect(r.body.data).toMatchObject({ name: 'Write report', priority: 'HIGH', status: 'PENDING', project: { id: ids.web, name: 'Website Redesign' } });
    ids.report = r.body.data.id;

    const d = await request(app).post('/api/tasks').set(auth(alice)).send({ projectId: ids.web, name: 'Design homepage' });
    expect(d.body.data).toMatchObject({ priority: 'MEDIUM', status: 'PENDING' }); // defaults
    ids.design = d.body.data.id;

    const m = await request(app).post('/api/tasks').set(auth(alice))
      .send({ projectId: ids.mobile, name: 'Setup Expo', priority: 'LOW', status: 'IN_PROGRESS' });
    ids.expo = m.body.data.id;

    const c = await request(app).post('/api/tasks').set(auth(alice))
      .send({ projectId: ids.mobile, name: 'Report bug', priority: 'HIGH', status: 'COMPLETED' });
    ids.bug = c.body.data.id;
  });

  it.each([
    [{ name: 'no project' }],
    [{ projectId: 'abc', name: 'bad project id' }],
    [{ projectId: 'PID', name: '' }],
    [{ projectId: 'PID', name: 'x', priority: 'URGENT' }],
    [{ projectId: 'PID', name: 'x', status: 'DONE' }],
    [{ projectId: 'PID', name: 'x', dueDate: 'not-a-date' }],
  ])('rejects invalid task %#', async (body) => {
    const payload = JSON.parse(JSON.stringify(body).replace('PID', ids.web));
    const res = await request(app).post('/api/tasks').set(auth(alice)).send(payload);
    expect(res.status).toBe(422);
  });

  it("OWNERSHIP: cannot create a task inside another user's project", async () => {
    const res = await request(app).post('/api/tasks').set(auth(bob)).send({ projectId: ids.web, name: 'Intruder' });
    expect(res.status).toBe(404);
    expect(await prisma.task.count({ where: { name: 'Intruder' } })).toBe(0);
  });

  it('cannot create a task in a non-existent project', async () => {
    const res = await request(app).post('/api/tasks').set(auth(alice)).send({ projectId: UNKNOWN_ID, name: 'Orphan' });
    expect(res.status).toBe(404);
  });

  it('lists, gets, searches and filters tasks', async () => {
    const q = (qs: string) => request(app).get(`/api/tasks?${qs}`).set(auth(alice));
    expect((await q('')).body.count).toBe(4);
    expect((await q('search=report')).body.data.map((t: any) => t.name).sort()).toEqual(['Report bug', 'Write report']);
    expect((await q('status=COMPLETED')).body.data.map((t: any) => t.name)).toEqual(['Report bug']);
    expect((await q('priority=HIGH')).body.count).toBe(2);
    expect((await q(`projectId=${ids.mobile}`)).body.count).toBe(2);
    expect((await q('search=report&priority=HIGH&status=PENDING')).body.data.map((t: any) => t.name)).toEqual(['Write report']);
    expect((await q(`projectId=${ids.web}&status=COMPLETED`)).body.count).toBe(0);
    expect((await q('priority=NOPE')).status).toBe(422);
    expect((await q('projectId=xyz')).status).toBe(422);
    const one = await request(app).get(`/api/tasks/${ids.report}`).set(auth(alice));
    expect(one.status).toBe(200);
    expect(one.body.data.name).toBe('Write report');
  });

  it('updates a task and marks it completed', async () => {
    const upd = await request(app).put(`/api/tasks/${ids.design}`).set(auth(alice)).send({ name: 'Design landing page', priority: 'HIGH', dueDate: '2026-12-01' });
    expect(upd.status).toBe(200);
    expect(upd.body.data).toMatchObject({ name: 'Design landing page', priority: 'HIGH' });
    const done = await request(app).put(`/api/tasks/${ids.design}`).set(auth(alice)).send({ status: 'COMPLETED' });
    expect(done.body.data.status).toBe('COMPLETED');
    const clear = await request(app).put(`/api/tasks/${ids.design}`).set(auth(alice)).send({ dueDate: null });
    expect(clear.body.data.dueDate).toBeNull();
  });

  it('moves a task to another of my projects, but not to someone else\'s', async () => {
    const bobProject = await request(app).post('/api/projects').set(auth(bob)).send({ name: 'Bob Project' });
    ids.bobProject = bobProject.body.data.id;
    const bad = await request(app).put(`/api/tasks/${ids.expo}`).set(auth(alice)).send({ projectId: ids.bobProject });
    expect(bad.status).toBe(404);
    const good = await request(app).put(`/api/tasks/${ids.expo}`).set(auth(alice)).send({ projectId: ids.web });
    expect(good.status).toBe(200);
    expect(good.body.data.project.id).toBe(ids.web);
    await request(app).put(`/api/tasks/${ids.expo}`).set(auth(alice)).send({ projectId: ids.mobile });
  });

  it("OWNERSHIP: Bob cannot read, update or delete Alice's task, and sees none in his list", async () => {
    expect((await request(app).get(`/api/tasks/${ids.report}`).set(auth(bob))).status).toBe(404);
    expect((await request(app).put(`/api/tasks/${ids.report}`).set(auth(bob)).send({ status: 'COMPLETED' })).status).toBe(404);
    expect((await request(app).delete(`/api/tasks/${ids.report}`).set(auth(bob))).status).toBe(404);
    expect((await request(app).get('/api/tasks').set(auth(bob))).body.count).toBe(0);
    expect((await request(app).get(`/api/tasks?projectId=${ids.web}`).set(auth(bob))).body.count).toBe(0);
    expect((await prisma.task.findUnique({ where: { id: ids.report } }))!.status).toBe('PENDING');
  });

  it('database composite FK blocks a task whose owner differs from its project owner', async () => {
    const bobUser = await prisma.user.findUnique({ where: { email: 'bob@example.com' } });
    await expect(prisma.task.create({ data: { userId: bobUser!.id, projectId: ids.web, name: 'bypass' } })).rejects.toThrow();
  });

  it('deletes a task', async () => {
    const del = await request(app).delete(`/api/tasks/${ids.bug}`).set(auth(alice));
    expect(del.status).toBe(200);
    expect((await request(app).get(`/api/tasks/${ids.bug}`).set(auth(alice))).status).toBe(404);
  });
});

describe('DASHBOARD', () => {
  it("returns exactly my metrics, unaffected by other users' data", async () => {
    // Alice now: projects = web(IN_PROGRESS), mobile(IN_PROGRESS), done(COMPLETED)
    // tasks = report(PENDING), design(COMPLETED), expo(IN_PROGRESS)   [bug was deleted]
    const a = await request(app).get('/api/dashboard').set(auth(alice));
    expect(a.status).toBe(200);
    expect(a.body.data).toEqual({
      totalProjects: 3,
      totalTasks: 3,
      completedTasks: 1,
      pendingTasks: 1,
      inProgressTasks: 1,
      projectsInProgress: 2,
    });

    // Bob has 1 project (NOT_STARTED) and no tasks.
    const b = await request(app).get('/api/dashboard').set(auth(bob));
    expect(b.body.data).toEqual({ totalProjects: 1, totalTasks: 0, completedTasks: 0, pendingTasks: 0, inProgressTasks: 0, projectsInProgress: 0 });
  });

  it('new user gets all zeros', async () => {
    const { token } = await registerUser('Carol', 'carol@example.com');
    const res = await request(app).get('/api/dashboard').set(auth(token));
    expect(Object.values(res.body.data).every((v) => v === 0)).toBe(true);
  });
});

describe('PROJECT DELETE', () => {
  it('deleting a project cascades to its tasks', async () => {
    const before = await prisma.task.count({ where: { projectId: ids.web } });
    expect(before).toBeGreaterThan(0);
    const del = await request(app).delete(`/api/projects/${ids.web}`).set(auth(alice));
    expect(del.status).toBe(200);
    expect(await prisma.task.count({ where: { projectId: ids.web } })).toBe(0);
    expect((await request(app).get(`/api/projects/${ids.web}`).set(auth(alice))).status).toBe(404);
    expect((await request(app).get(`/api/tasks/${ids.report}`).set(auth(alice))).status).toBe(404);
  });
});
