import { NextResponse } from 'next/server';
import { handleRoute, requireApiSession } from '@/server/lib/api';
import { AppError } from '@/server/lib/errors';
import { MAX_REQUEST_BYTES } from '@/server/rag/validate-file';
import { listDocuments, uploadDocument } from '@/server/services/document.service';

export function GET() {
  return handleRoute(async () => {
    const session = await requireApiSession();
    const documents = await listDocuments(session.user.id);

    return NextResponse.json({ documents });
  });
}

export function POST(request: Request) {
  return handleRoute(async () => {
    const session = await requireApiSession();

    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      throw new AppError(413, 'The file is too large. The maximum is 4 MB');
    }

    const formData = await request.formData().catch(() => null);
    const file = formData?.get('file');
    if (!(file instanceof File)) {
      throw new AppError(400, 'Send one file in the field called file');
    }

    const document = await uploadDocument(session.user.id, file);

    return NextResponse.json({ document }, { status: 201 });
  });
}
