import { extractText as extractPdfText, getDocumentProxy } from 'unpdf';
import { AppError } from '../lib/errors';
import { MAX_PDF_PAGES, type FileKind } from './validate-file';

const MIN_TEXT_LENGTH = 20;

async function readPdf(bytes: Uint8Array) {
  let pdf: Awaited<ReturnType<typeof getDocumentProxy>>;

  try {
    pdf = await getDocumentProxy(bytes.slice());
  } catch {
    throw new AppError(400, 'The PDF could not be read. It may be damaged or password protected');
  }

  if (pdf.numPages > MAX_PDF_PAGES) {
    throw new AppError(400, `The PDF has too many pages. The maximum is ${MAX_PDF_PAGES}`);
  }

  const { text } = await extractPdfText(pdf, { mergePages: true });
  return text;
}

export async function extractText(kind: FileKind, bytes: Uint8Array): Promise<string> {
  const text = kind === 'pdf' ? await readPdf(bytes) : new TextDecoder('utf-8').decode(bytes);

  if (text.trim().length < MIN_TEXT_LENGTH) {
    throw new AppError(422, 'No readable text was found. Scanned PDFs are not supported yet');
  }

  return text;
}
