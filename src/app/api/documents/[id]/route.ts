import { handleRoute, requireApiSession } from '@/server/lib/api';
import { parseOrThrow } from '@/server/lib/validation';
import { documentIdSchema } from '@/schemas/document';
import { deleteDocument } from '@/server/services/document.service';

export function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireApiSession();
    const id = parseOrThrow(documentIdSchema, (await params).id);

    await deleteDocument(session.user.id, id);

    return new Response(null, { status: 204 });
  });
}
