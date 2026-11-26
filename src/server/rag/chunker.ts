export type TextChunk = { position: number; content: string };

export type ChunkOptions = { size?: number; overlap?: number };

const PARAGRAPH_BREAK = '\n\n';
const SENTENCE_ENDINGS = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];

export function chunkText(
  text: string,
  { size = 1000, overlap = 200 }: ChunkOptions = {},
): TextChunk[] {
  if (size <= 0 || overlap < 0 || overlap >= size / 2) {
    throw new Error('size must be above 0 and overlap must be smaller than half of size');
  }

  const normalized = text.replaceAll('\r\n', '\n');
  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = findEnd(normalized, start, size);
    const content = normalized.slice(start, end).trim();

    if (content) {
      chunks.push({ position: chunks.length, content });
    }
    if (end >= normalized.length) {
      break;
    }

    start = Math.max(avoidSplittingPair(normalized, end - overlap), start + 1);
  }

  return chunks;
}

function findEnd(text: string, start: number, size: number) {
  const hardEnd = start + size;

  if (hardEnd >= text.length) {
    return text.length;
  }

  const piece = text.slice(start, hardEnd);
  const minimumCut = Math.floor(size / 2);

  const paragraph = piece.lastIndexOf(PARAGRAPH_BREAK);
  if (paragraph >= minimumCut) {
    return start + paragraph;
  }

  const sentence = Math.max(...SENTENCE_ENDINGS.map((ending) => piece.lastIndexOf(ending)));
  if (sentence >= minimumCut) {
    return start + sentence + 1;
  }

  const space = piece.lastIndexOf(' ');
  if (space >= minimumCut) {
    return start + space;
  }

  return avoidSplittingPair(text, hardEnd);
}

function avoidSplittingPair(text: string, index: number) {
  const code = text.charCodeAt(index - 1);
  return code >= 0xd800 && code <= 0xdbff ? index - 1 : index;
}
