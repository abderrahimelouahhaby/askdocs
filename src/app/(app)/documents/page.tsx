import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Documents' };

export default function DocumentsPage() {
  return <h1 className="text-2xl font-semibold">Your documents</h1>;
}
