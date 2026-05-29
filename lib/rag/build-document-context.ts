import { hasSupabase } from "@/lib/env";
import { getSupabase } from "@/lib/db/supabase-server";
import type { RetrievedChunk } from "@/lib/rag/retrieve";
import { retrieveDocuments } from "@/lib/rag/retrieve";

async function hasStoredChunks(): Promise<boolean> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from("document_chunks")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Failed to check documents: ${error.message}`);
  }

  return (count ?? 0) > 0;
}

function formatChunks(chunks: RetrievedChunk[]): string {
  const sections = chunks.map((chunk, index) => {
    const score = chunk.similarity.toFixed(2);
    return `### Excerpt ${index + 1} — ${chunk.documentName} (relevance: ${score})\n${chunk.content}`;
  });

  return `## Retrieved from uploaded documents

The passages below were **automatically** matched to the user's latest question. Use them when answering anything about their PDFs or uploaded files. Cite the document name. If the answer is not in these excerpts, say so—do not invent document content.

${sections.join("\n\n")}`;
}

/**
 * Runs vector search before the model turn when the user has uploaded documents.
 * Returns text to append to the system prompt, or null if RAG is unavailable/empty.
 */
export async function buildDocumentContextForQuery(
  query: string,
): Promise<string | null> {
  if (!hasSupabase() || !query.trim()) {
    return null;
  }

  const hasChunks = await hasStoredChunks();
  if (!hasChunks) {
    return null;
  }

  const chunks = await retrieveDocuments(query);

  if (chunks.length === 0) {
    return `## Uploaded documents

The user has uploaded PDFs, but **no relevant passages** were found for this question. Do not guess what their documents contain. If they seem to expect an answer from their files, say you could not find matching content and suggest rephrasing or checking the PDF has selectable text.`;
  }

  return formatChunks(chunks);
}
