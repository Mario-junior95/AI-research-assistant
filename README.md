# AI Research Assistant

A Next.js research assistant with streaming chat, web search (Tavily), and RAG over uploaded PDFs (Supabase + OpenAI).

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add your [OpenAI API key](https://platform.openai.com/api-keys) to `.env.local` (required).

4. Optional — **web search**: sign up at [Tavily](https://tavily.com) and set `TAVILY_API_KEY`.

5. Optional — **document RAG**:
   - Create a [Supabase](https://supabase.com) project
   - **Database → Extensions** → enable **vector**
   - Run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) in the SQL editor
   - If uploads work but chat cannot find document text, also run [`supabase/migrations/002_fix_vector_search.sql`](supabase/migrations/002_fix_vector_search.sql)
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
   - Test retrieval: `curl "http://localhost:3001/api/documents/retrieve-test?q=keyword+from+your+pdf"`

6. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Streaming chat powered by the [Vercel AI SDK](https://ai-sdk.dev)
- `webSearch` tool — live web results with citations (requires Tavily)
- **Automatic document search** — each chat message retrieves relevant PDF excerpts before the model answers (requires Supabase)
- `retrieveDocuments` tool — optional extra search with different keywords
- PDF upload, chunking, and embedding with OpenAI `text-embedding-3-small`

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint
