import { tool } from "ai";
import { z } from "zod";
import { hasTavily, hasSupabase } from "@/lib/env";
import { retrieveDocuments } from "@/lib/rag/retrieve";
import { searchWeb } from "@/lib/search/tavily";

export function createResearchTools() {
  return {
    retrieveDocuments: tool({
      description:
        "Run an additional search in uploaded PDFs with new keywords. Use only when the excerpts already in the system message are not enough—not for the first answer about uploads.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "Search query using keywords and phrases likely to appear in the documents",
          ),
      }),
      execute: async ({ query }) => {
        if (!hasSupabase()) {
          return {
            error:
              "Document search is not configured. Set up Supabase to enable RAG.",
            chunks: [],
          };
        }
        const chunks = await retrieveDocuments(query);
        return { chunks };
      },
    }),

    webSearch: tool({
      description:
        "Search the public web for current information, news, and facts. Do NOT use for questions about the user's uploaded PDFs—use retrieveDocuments for those.",
      inputSchema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z
          .number()
          .min(1)
          .max(10)
          .optional()
          .describe("Maximum number of results (default 5)"),
      }),
      execute: async ({ query, maxResults }) => {
        if (!hasTavily()) {
          return {
            error:
              "Web search is not configured. Add TAVILY_API_KEY to enable it.",
            results: [],
          };
        }
        try {
          const results = await searchWeb(query, maxResults ?? 5);
          return { results };
        } catch (error) {
          return {
            error:
              error instanceof Error ? error.message : "Web search failed",
            results: [],
          };
        }
      },
    }),
  };
}
