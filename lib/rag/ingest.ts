import { embedMany } from "ai";
import { extractText, getDocumentProxy } from "unpdf";
import { getEmbeddingModel } from "@/lib/ai/provider";
import { getSupabase } from "@/lib/db/supabase-server";
import { chunkText } from "@/lib/rag/chunking";

export type IngestResult = {
  documentId: string;
  name: string;
  chunkCount: number;
};

export async function ingestPdf(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<IngestResult> {
  const supabase = getSupabase();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  const chunks = chunkText(text);
  if (chunks.length === 0) {
    throw new Error("No text could be extracted from the PDF.");
  }

  const { data: document, error: docError } = await supabase
    .from("documents")
    .insert({ name: fileName })
    .select("id")
    .single();

  if (docError || !document) {
    throw new Error(`Failed to create document: ${docError?.message}`);
  }

  const { embeddings } = await embedMany({
    model: getEmbeddingModel(),
    values: chunks,
  });

  const rows = chunks.map((content, index) => ({
    document_id: document.id,
    content,
    embedding: embeddings[index],
    metadata: { index },
  }));

  const { error: chunkError } = await supabase
    .from("document_chunks")
    .insert(rows);

  if (chunkError) {
    await supabase.from("documents").delete().eq("id", document.id);
    throw new Error(`Failed to store chunks: ${chunkError.message}`);
  }

  return {
    documentId: document.id,
    name: fileName,
    chunkCount: chunks.length,
  };
}
