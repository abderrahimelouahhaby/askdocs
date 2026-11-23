import { describe, expect, it } from 'vitest';
import { catchError } from '../../test/errors';
import { MAX_FILE_SIZE_BYTES, sanitizeFilename, validateFile } from './validate-file';

function makeFile(name: string, content: string | Uint8Array) {
  const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
  return { name, size: bytes.byteLength, bytes };
}

describe('validateFile', () => {
  it('accepts a pdf, a txt and a md file', () => {
    expect(validateFile(makeFile('report.pdf', '%PDF-1.7 content'))).toBe('pdf');
    expect(validateFile(makeFile('notes.txt', 'plain text'))).toBe('text');
    expect(validateFile(makeFile('README.MD', '# Title'))).toBe('text');
  });

  it('rejects an empty file', async () => {
    const error = await catchError(() => validateFile(makeFile('empty.txt', '')));
    expect(error.status).toBe(400);
  });

  it('rejects a file that is too large', async () => {
    const file = { name: 'big.txt', size: MAX_FILE_SIZE_BYTES + 1, bytes: new Uint8Array(1) };
    const error = await catchError(() => validateFile(file));
    expect(error.status).toBe(413);
  });

  it('rejects an extension that is not allowed', async () => {
    const error = await catchError(() => validateFile(makeFile('setup.exe', 'MZ')));
    expect(error.status).toBe(415);
  });

  it('rejects a name with no extension', async () => {
    const error = await catchError(() => validateFile(makeFile('pdf', '%PDF-1.7 content')));
    expect(error.status).toBe(415);
  });

  it('rejects a pdf that does not start with the pdf signature', async () => {
    const error = await catchError(() => validateFile(makeFile('fake.pdf', 'I am only text')));
    expect(error.status).toBe(400);
  });

  it('rejects a binary file renamed to txt', async () => {
    const binary = new Uint8Array([0x4d, 0x5a, 0x00, 0x01, 0x02]);
    const error = await catchError(() => validateFile(makeFile('data.txt', binary)));
    expect(error.status).toBe(400);
  });
});

describe('sanitizeFilename', () => {
  it('keeps only the file name and never a path', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
  });

  it('removes control characters', () => {
    expect(sanitizeFilename('my' + String.fromCharCode(7) + 'file.txt')).toBe('myfile.txt');
  });

  it('falls back to a default name', () => {
    expect(sanitizeFilename('')).toBe('document');
    expect(sanitizeFilename('/')).toBe('document');
  });

  it('cuts very long names', () => {
    expect(sanitizeFilename('a'.repeat(300) + '.txt').length).toBeLessThanOrEqual(200);
  });
});
