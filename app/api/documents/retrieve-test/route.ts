import { hasSupabase } from "@/lib/env";
import { retrieveDocuments } from "@/lib/rag/retrieve";
import { getSupabase } from "@/lib/db/supabase-server";

/**
 * Dev helper: GET /api/documents/retrieve-test?q=your+question
 * Verifies pgvector retrieval without going through chat.
 */
export async function GET(req: Request) {
  if (!hasSupabase()) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  if (!query) {
    return Response.json(
      { error: "Add ?q=your search query" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabase();
    const { count, error: countError } = await supabase
      .from("document_chunks")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return Response.json({ error: countError.message }, { status: 500 });
    }

    const chunks = await retrieveDocuments(query);

    return Response.json({
      chunkCountInDb: count ?? 0,
      query,
      retrieved: chunks.length,
      chunks: chunks.map((c) => ({
        documentName: c.documentName,
        similarity: c.similarity,
        preview: c.content.slice(0, 200),
      })),
      hint:
        chunks.length === 0 && (count ?? 0) > 0
          ? "Run supabase/migrations/002_fix_vector_search.sql in the SQL Editor."
          : undefined,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Retrieve test failed",
      },
      { status: 500 },
    );
  }
}
