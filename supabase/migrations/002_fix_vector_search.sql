-- Run this in Supabase SQL Editor if document search returns no results
-- but document_chunks has rows with content.

-- IVFFlat with lists=100 breaks on small tables (e.g. one PDF).
-- Drop it; exact search is fast enough until you have thousands of chunks.
drop index if exists document_chunks_embedding_idx;

-- Optional: HNSW works well on small and large datasets (pgvector 0.5+ on Supabase).
-- Uncomment if your project supports HNSW:
-- create index if not exists document_chunks_embedding_hnsw_idx
--   on document_chunks
--   using hnsw (embedding vector_cosine_ops);

-- Always return the nearest chunks (no similarity cutoff in SQL).
create or replace function match_document_chunks(
  query_embedding vector(1536),
  match_threshold float default 0,
  match_count int default 8
)
returns table (
  id uuid,
  document_id uuid,
  document_name text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    d.name as document_name,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where
    match_threshold <= 0
    or (1 - (dc.embedding <=> query_embedding)) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
