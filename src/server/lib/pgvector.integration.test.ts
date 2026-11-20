import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './db';

const DIMENSION = 768;

function toVectorLiteral(values: number[]) {
  return `[${values.join(',')}]`;
}

function unitVector(index: number) {
  const values = new Array<number>(DIMENSION).fill(0);
  values[index] = 1;
  return values;
}

describe('pgvector', () => {
  let userId: string;
  let documentId: string;

  beforeAll(async () => {
    userId = crypto.randomUUID();
    await prisma.user.create({
      data: { id: userId, name: 'Vector Test', email: `${userId}@example.com` },
    });
    const document = await prisma.document.create({
      data: { userId, filename: 'test.txt', sizeBytes: 10 },
    });
    documentId = document.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('returns the closest chunk first', async () => {
    const chunks = [
      { content: 'about leave', vector: unitVector(0) },
      { content: 'about the office', vector: unitVector(1) },
    ];

    for (const [position, chunk] of chunks.entries()) {
      const created = await prisma.chunk.create({
        data: { documentId, userId, position, content: chunk.content },
      });
      await prisma.$executeRaw`UPDATE "Chunk" SET embedding = ${toVectorLiteral(chunk.vector)}::vector WHERE id = ${created.id}`;
    }

    const question = toVectorLiteral(unitVector(0));
    const rows = await prisma.$queryRaw<{ content: string; distance: number }[]>`
      SELECT content, embedding <=> ${question}::vector AS distance
      FROM "Chunk"
      WHERE "documentId" = ${documentId}
      ORDER BY embedding <=> ${question}::vector
      LIMIT 2`;

    expect(rows[0].content).toBe('about leave');
    expect(rows[0].distance).toBeCloseTo(0);
    expect(rows[1].distance).toBeCloseTo(1);
  });
});
