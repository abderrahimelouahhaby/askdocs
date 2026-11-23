import { prisma } from '../lib/db';

const publicFields = {
  id: true,
  filename: true,
  sizeBytes: true,
  status: true,
  createdAt: true,
} as const;

export const documentRepository = {
  countByUser(userId: string) {
    return prisma.document.count({ where: { userId } });
  },

  create(data: { userId: string; filename: string; sizeBytes: number }) {
    return prisma.document.create({ data, select: publicFields });
  },

  listByUser(userId: string) {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: publicFields,
    });
  },

  async deleteOwned(id: string, userId: string) {
    const result = await prisma.document.deleteMany({ where: { id, userId } });
    return result.count > 0;
  },
};
