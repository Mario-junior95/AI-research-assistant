import { getSupabase } from "@/lib/db/supabase-server";
import { hasSupabase } from "@/lib/env";
import { ingestPdf } from "@/lib/rag/ingest";

export const maxDuration = 120;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function GET() {
  if (!hasSupabase()) {
    return Response.json(
      { error: "Supabase is not configured.", documents: [] },
      { status: 503 },
    );
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("documents")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ documents: data ?? [] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list documents",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!hasSupabase()) {
    return Response.json(
      { error: "Supabase is not configured. Run the SQL migration first." },
      { status: 503 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "Only PDF files are supported." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "File exceeds 10 MB limit." },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await ingestPdf(buffer, file.name);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to ingest document",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!hasSupabase()) {
    return Response.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Document id is required." }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete document",
      },
      { status: 500 },
    );
  }
}
