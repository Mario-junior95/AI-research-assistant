-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists vector;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb default '{}'::jsonb
);

-- Skip IVFFlat here; use 002_fix_vector_search.sql after first data load,
-- or run 002 immediately for reliable search on small datasets.

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
