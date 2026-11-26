import { describe, expect, it } from 'vitest';
import { chunkText } from './chunker';

function makeSentences(count: number) {
  return Array.from({ length: count }, (_, index) => `Sentence number ${index} says hello.`);
}

describe('chunkText', () => {
  it('returns no chunks for empty or blank text', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   \n\n  ')).toEqual([]);
  });

  it('returns one chunk for a short text', () => {
    expect(chunkText('  A short note.  ')).toEqual([{ position: 0, content: 'A short note.' }]);
  });

  it('never makes a chunk longer than the size', () => {
    const text = makeSentences(200).join(' ');
    const chunks = chunkText(text, { size: 300, overlap: 50 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.content.length <= 300)).toBe(true);
  });

  it('numbers the chunks from zero', () => {
    const text = makeSentences(100).join(' ');
    const chunks = chunkText(text, { size: 300, overlap: 50 });

    expect(chunks.map((chunk) => chunk.position)).toEqual(chunks.map((_, index) => index));
  });

  it('makes neighbouring chunks overlap', () => {
    const text = makeSentences(200).join(' ');
    const chunks = chunkText(text, { size: 300, overlap: 80 });

    for (let index = 1; index < chunks.length; index++) {
      const endOfPrevious = chunks[index - 1].content.slice(-20);
      expect(chunks[index].content).toContain(endOfPrevious);
    }
  });

  it('keeps every sentence whole in at least one chunk', () => {
    const sentences = makeSentences(200);
    const chunks = chunkText(sentences.join(' '), { size: 300, overlap: 50 });

    for (const sentence of sentences) {
      expect(chunks.some((chunk) => chunk.content.includes(sentence))).toBe(true);
    }
  });

  it('prefers to cut at a paragraph break', () => {
    const first = 'word '.repeat(140).trim();
    const second = 'other '.repeat(140).trim();
    const chunks = chunkText(first + '\n\n' + second, { size: 1000, overlap: 100 });

    expect(chunks[0].content).toBe(first);
  });

  it('prefers to cut at the end of a sentence', () => {
    const text = makeSentences(100).join(' ');
    const chunks = chunkText(text, { size: 300, overlap: 50 });

    expect(chunks.every((chunk) => chunk.content.endsWith('.'))).toBe(true);
  });

  it('handles windows line endings', () => {
    const text = makeSentences(60).join('\r\n\r\n');
    const chunks = chunkText(text, { size: 400, overlap: 50 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.some((chunk) => chunk.content.includes('\r'))).toBe(false);
  });

  it('never cuts an emoji in half', () => {
    const text = 'a' + '😀'.repeat(1500);
    const chunks = chunkText(text, { size: 1000, overlap: 100 });

    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks.every((chunk) => chunk.content.isWellFormed())).toBe(true);
  });

  it('rejects options that cannot make progress', () => {
    expect(() => chunkText('text', { size: 0 })).toThrow();
    expect(() => chunkText('text', { size: 100, overlap: 60 })).toThrow();
  });
});
