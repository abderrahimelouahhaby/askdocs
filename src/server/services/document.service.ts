import { AppError } from '../lib/errors';
import { extractText } from '../rag/extract-text';
import { sanitizeFilename, validateFile } from '../rag/validate-file';
import { documentRepository } from '../repositories/document.repository';

export const MAX_DOCUMENTS_PER_USER = 10;

export async function uploadDocument(userId: string, file: File) {
  const count = await documentRepository.countByUser(userId);

  if (count >= MAX_DOCUMENTS_PER_USER) {
    throw new AppError(
      409,
      `You can keep up to ${MAX_DOCUMENTS_PER_USER} documents. Delete one first`,
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = validateFile({ name: file.name, size: file.size, bytes });

  // Only a check for now. Later the text goes to the processing pipeline.
  await extractText(kind, bytes);

  return documentRepository.create({
    userId,
    filename: sanitizeFilename(file.name),
    sizeBytes: file.size,
  });
}

export function listDocuments(userId: string) {
  return documentRepository.listByUser(userId);
}

export async function deleteDocument(userId: string, documentId: string) {
  const deleted = await documentRepository.deleteOwned(documentId, userId);

  if (!deleted) {
    throw new AppError(404, 'Document not found');
  }
}
