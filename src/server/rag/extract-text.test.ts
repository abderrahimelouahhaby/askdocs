import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { catchError } from '../../test/errors';
import { extractText } from './extract-text';

const encode = (text: string) => new TextEncoder().encode(text);

describe('extractText', () => {
  it('reads the text of a real pdf', async () => {
    const url = new URL('../../../fixtures/sample.pdf', import.meta.url);
    const bytes = new Uint8Array(await readFile(url));

    expect(await extractText('pdf', bytes)).toContain('AskDocs');
  });

  it('reads a text file', async () => {
    const text = await extractText('text', encode('Employees receive 22 days of leave.'));
    expect(text).toContain('22 days');
  });

  it('rejects a file without readable text', async () => {
    const error = await catchError(() => extractText('text', encode('     ')));
    expect(error.status).toBe(422);
  });

  it('rejects a damaged pdf', async () => {
    const error = await catchError(() =>
      extractText('pdf', encode('%PDF-1.4 this is not a real pdf')),
    );
    expect(error.status).toBe(400);
  });
});
