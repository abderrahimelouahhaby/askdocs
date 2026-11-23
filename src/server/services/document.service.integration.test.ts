import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { catchError } from '../../test/errors';
import { createTestUser, deleteTestUsers } from '../../test/users';
import { prisma } from '../lib/db';
import {
  deleteDocument,
  listDocuments,
  MAX_DOCUMENTS_PER_USER,
  uploadDocument,
} from './document.service';

function textFile(name: string) {
  return new File(['Notes about annual leave. Employees get 22 days per year.'], name, {
    type: 'text/plain',
  });
}

describe('document service', () => {
  const userIds: string[] = [];
  let alice: string;
  let bob: string;

  beforeAll(async () => {
    alice = await createTestUser();
    bob = await createTestUser();
    userIds.push(alice, bob);
  });

  afterAll(async () => {
    await deleteTestUsers(userIds);
    await prisma.$disconnect();
  });

  it('saves an uploaded text file for its owner', async () => {
    const document = await uploadDocument(alice, textFile('leave.txt'));

    expect(document.filename).toBe('leave.txt');
    expect(document.status).toBe('PROCESSING');
    expect(await prisma.document.count({ where: { id: document.id, userId: alice } })).toBe(1);
  });

  it('lists only the documents of the current user', async () => {
    await uploadDocument(alice, textFile('alice.txt'));

    expect(await listDocuments(bob)).toHaveLength(0);
  });

  it('does not let another user delete a document', async () => {
    const document = await uploadDocument(alice, textFile('secret.txt'));

    const error = await catchError(() => deleteDocument(bob, document.id));

    expect(error.status).toBe(404);
    expect(await prisma.document.count({ where: { id: document.id } })).toBe(1);
  });

  it('lets the owner delete a document', async () => {
    const document = await uploadDocument(alice, textFile('temporary.txt'));

    await deleteDocument(alice, document.id);

    expect(await prisma.document.count({ where: { id: document.id } })).toBe(0);
  });

  it('refuses uploads above the document limit', async () => {
    const carol = await createTestUser();
    userIds.push(carol);

    for (let index = 0; index < MAX_DOCUMENTS_PER_USER; index += 1) {
      await uploadDocument(carol, textFile(`note-${index}.txt`));
    }
    const error = await catchError(() => uploadDocument(carol, textFile('one-too-many.txt')));

    expect(error.status).toBe(409);
  });
});
