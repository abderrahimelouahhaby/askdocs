# AskDocs architecture

AskDocs lets a user upload documents and ask questions about them. The AI answers only from those documents and shows where each answer came from.

## User stories

1. As a visitor, I can create an account with my email and a password.
2. I can log in and log out.
3. I can upload a PDF or a text file.
4. I can see my documents and whether they are ready.
5. I can delete a document.
6. I can ask a question and watch the answer appear as it is written.
7. Every answer shows the passages it was based on.
8. I can reopen a past conversation.
9. I can delete a conversation.
10. I can switch between light and dark mode.
11. When I reach my daily limit, I get a clear message.

## Flow

Upload: file -> checks -> extract text -> split into chunks -> embeddings -> save in PostgreSQL
Ask: question -> embedding -> closest chunks of this user -> prompt -> streamed answer -> save with sources

## Layers

Route handler -> service -> repository. The AI sits behind an AiClient interface, with a real Gemini client and a fake client for tests.

## Rules

- Every query that reads user data filters by user id.
- Environment variables are read in one place: src/server/lib/env.ts.
- Only the extracted text is stored, never the original file.
