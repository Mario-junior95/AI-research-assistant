const TARGET_CHUNK_SIZE = 800;
const OVERLAP_SIZE = 100;

export function chunkText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const piece = paragraph.trim();
    if (!piece) continue;

    if ((current + "\n\n" + piece).length <= TARGET_CHUNK_SIZE) {
      current = current ? `${current}\n\n${piece}` : piece;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (piece.length <= TARGET_CHUNK_SIZE) {
      current = piece;
      continue;
    }

    let start = 0;
    while (start < piece.length) {
      const end = Math.min(start + TARGET_CHUNK_SIZE, piece.length);
      chunks.push(piece.slice(start, end));
      if (end >= piece.length) break;
      start = Math.max(end - OVERLAP_SIZE, start + 1);
    }
  }

  if (current) chunks.push(current);

  return chunks.filter(Boolean);
}
