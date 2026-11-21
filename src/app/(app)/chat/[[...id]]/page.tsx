import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Chat' };

export default function ChatPage() {
  return <h1 className="text-2xl font-semibold">Chat</h1>;
}
