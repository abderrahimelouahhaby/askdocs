import { prisma } from '../server/lib/db';

export async function createTestUser() {
  const id = crypto.randomUUID();
  await prisma.user.create({ data: { id, name: 'Test User', email: `${id}@example.com` } });
  return id;
}

export async function deleteTestUsers(ids: string[]) {
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}
