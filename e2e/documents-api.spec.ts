import { expect, test, type Browser, type Page } from '@playwright/test';
import { signUp, uniqueEmail } from './helpers';

async function newSignedInPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ baseURL: 'http://localhost:3000' });
  const page = await context.newPage();
  await signUp(page, uniqueEmail());
  return page;
}

function upload(name: string, content: string, mimeType = 'text/plain') {
  return { multipart: { file: { name, mimeType, buffer: Buffer.from(content) } } };
}

test('the documents API refuses requests without a session', async ({ request }) => {
  expect((await request.get('/api/documents')).status()).toBe(401);
  expect((await request.post('/api/documents')).status()).toBe(401);
  expect((await request.delete('/api/documents/some-id')).status()).toBe(401);
});

test('the upload rejects files that are not what they claim to be', async ({ browser }) => {
  const page = await newSignedInPage(browser);

  const fakePdf = await page.request.post(
    '/api/documents',
    upload('fake.pdf', 'I am only text', 'application/pdf'),
  );
  expect(fakePdf.status()).toBe(400);

  const program = await page.request.post(
    '/api/documents',
    upload('setup.exe', 'MZ fake program', 'application/octet-stream'),
  );
  expect(program.status()).toBe(415);

  const empty = await page.request.post('/api/documents', upload('empty.txt', ''));
  expect(empty.status()).toBe(400);

  await page.context().close();
});

test('another user cannot list or delete my document', async ({ browser }) => {
  const alice = await newSignedInPage(browser);
  const bob = await newSignedInPage(browser);

  const created = await alice.request.post(
    '/api/documents',
    upload('leave.txt', 'Employees receive 22 days of annual leave per year.'),
  );
  expect(created.status()).toBe(201);
  const { document } = await created.json();
  expect(document.filename).toBe('leave.txt');

  const bobList = await bob.request.get('/api/documents');
  expect((await bobList.json()).documents).toHaveLength(0);

  const bobDelete = await bob.request.delete(`/api/documents/${document.id}`);
  expect(bobDelete.status()).toBe(404);

  const aliceList = await alice.request.get('/api/documents');
  expect((await aliceList.json()).documents).toHaveLength(1);

  const aliceDelete = await alice.request.delete(`/api/documents/${document.id}`);
  expect(aliceDelete.status()).toBe(204);

  await alice.context().close();
  await bob.context().close();
});
