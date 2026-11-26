import 'dotenv/config';
import { google } from '@ai-sdk/google';
import { embed, embedMany } from 'ai';
import { prisma } from '../src/server/lib/db';

const model = google.textEmbedding('gemini-embedding-001');
const options = { google: { outputDimensionality: 768 } };

const sentences = [
  'I love pizza',
  'Pasta is my favourite food',
  'The server crashed at midnight',
  'Annual leave is 22 working days',
  'Employees get 22 vacation days per year',
  'The office closes at 18:00',
];

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function toVectorLiteral(values: number[]) {
  return `[${values.join(',')}]`;
}

async function main() {
  const { embeddings } = await embedMany({ model, values: sentences, providerOptions: options });

  console.log('Embeddings:', embeddings.length);
  console.log('Numbers in one embedding:', embeddings[0].length);
  console.log('First 5 numbers:', embeddings[0].slice(0, 5));

  const pairs = [];
  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      pairs.push({ a: sentences[i], b: sentences[j], similarity: similarity.toFixed(3) });
    }
  }
  console.table(pairs);

  try {
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS scratch`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS scratch.embeddings`;
    await prisma.$executeRaw`CREATE TABLE scratch.embeddings (content text, embedding vector(768))`;

    for (let i = 0; i < sentences.length; i++) {
      await prisma.$executeRaw`INSERT INTO scratch.embeddings (content, embedding) VALUES (${sentences[i]}, ${toVectorLiteral(embeddings[i])}::vector)`;
    }

    const questions = ['How many vacation days do I get?', 'What is the capital of Peru?'];

    for (const question of questions) {
      const { embedding } = await embed({ model, value: question, providerOptions: options });
      const literal = toVectorLiteral(embedding);

      const rows = await prisma.$queryRaw<{ content: string; distance: number }[]>`
        SELECT content, embedding <=> ${literal}::vector AS distance
        FROM scratch.embeddings
        ORDER BY distance
        LIMIT 3`;

      console.log('\nQuestion:', question);
      console.table(
        rows.map((row) => ({
          content: row.content,
          distance: row.distance.toFixed(3),
          similarity: (1 - row.distance).toFixed(3),
        })),
      );

      const best = sentences.indexOf(rows[0].content);
      console.log(
        'Similarity computed in JavaScript:',
        cosineSimilarity(embedding, embeddings[best]).toFixed(3),
      );
      console.log('1 minus the distance from pgvector:', (1 - rows[0].distance).toFixed(3));
    }
  } finally {
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS scratch CASCADE`;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
