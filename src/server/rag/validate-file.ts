import { AppError } from '../lib/errors';

export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_FILE_SIZE_BYTES + 100 * 1024;
export const MAX_PDF_PAGES = 50;

export type FileKind = 'pdf' | 'text';

const EXTENSION_KINDS = new Map<string, FileKind>([
  ['pdf', 'pdf'],
  ['txt', 'text'],
  ['md', 'text'],
]);

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];

type FileInput = { name: string; size: number; bytes: Uint8Array };

export function validateFile(file: FileInput): FileKind {
  if (file.size === 0) {
    throw new AppError(400, 'The file is empty');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AppError(413, 'The file is too large. The maximum is 4 MB');
  }

  const dotIndex = file.name.lastIndexOf('.');
  const extension = dotIndex === -1 ? '' : file.name.slice(dotIndex + 1).toLowerCase();
  const kind = EXTENSION_KINDS.get(extension);

  if (!kind) {
    throw new AppError(415, 'Only PDF, TXT and MD files are allowed');
  }
  if (kind === 'pdf' && !startsWithPdfSignature(file.bytes)) {
    throw new AppError(400, 'The file is not a valid PDF');
  }
  if (kind === 'text' && !isPlainText(file.bytes)) {
    throw new AppError(400, 'The file is not a valid text file');
  }

  return kind;
}

function startsWithPdfSignature(bytes: Uint8Array) {
  return PDF_SIGNATURE.every((value, index) => bytes[index] === value);
}

function isPlainText(bytes: Uint8Array) {
  if (bytes.includes(0)) {
    return false;
  }

  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeFilename(name: string) {
  const baseName = name.split('/').pop() ?? '';
  const printable = Array.from(baseName)
    .filter((char) => char.charCodeAt(0) >= 32)
    .join('')
    .trim();

  return (printable || 'document').slice(0, 200);
}
