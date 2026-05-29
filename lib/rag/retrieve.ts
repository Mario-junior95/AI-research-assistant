import { embed } from "ai";
import { getEmbeddingModel } from "@/lib/ai/provider";
import { getSupabase } from "@/lib/db/supabase-server";

export type RetrievedChunk = {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  similarity: number;
};

type MatchRow = {
  id: string;
  document_id: string;
  document_name: string;
  content: string;
  similarity: number;
};

async function matchChunks(
  embedding: number[],
  matchThreshold: number,
  matchCount: number,
): Promise<MatchRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    throw new Error(`Retrieval failed: ${error.message}`);
  }

  return (data ?? []) as MatchRow[];
}

function mapRows(rows: MatchRow[]): RetrievedChunk[] {
  return rows.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    documentName: row.document_name,
    content: row.content,
    similarity: row.similarity,
  }));
}

export async function retrieveDocuments(
  query: string,
  matchCount = 8,
): Promise<RetrievedChunk[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: query,
  });

  // match_threshold 0 = return nearest neighbors (requires migration 002 SQL).
  const rows = await matchChunks(embedding, 0, matchCount);
  return mapRows(rows);
}
